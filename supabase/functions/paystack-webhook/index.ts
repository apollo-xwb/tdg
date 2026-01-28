// Supabase Edge Function: paystack-webhook
// Paystack sends charge.success here. Verify signature, update design status, optionally notify client.
// Set PAYSTACK_SECRET_KEY in Edge Function secrets. In Paystack Dashboard → Settings → Webhooks, set:
//   URL: https://<project>.supabase.co/functions/v1/paystack-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature'
};

// HMAC-SHA512 via Web Crypto for signature verification
async function hmacSha512(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const messageData = enc.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const signature = req.headers.get('x-paystack-signature') || '';
  const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
  if (!secret) {
    console.error('[paystack-webhook] PAYSTACK_SECRET_KEY not set');
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const raw = await req.text();
  const ok = await hmacSha512(secret, raw);
  if (ok !== signature) {
    console.warn('[paystack-webhook] Invalid signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let event: { event?: string; data?: { reference?: string; metadata?: { design_id?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (event.event !== 'charge.success') {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const reference = event.data?.reference || event.data?.metadata?.design_id;
  if (!reference) {
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  // Find design by id (we use design_id as reference)
  const { data: rows, error: fetchErr } = await supabase
    .from('designs')
    .select('id, jeweler_id, data')
    .eq('id', reference)
    .limit(1);

  if (fetchErr || !rows?.length) {
    console.warn('[paystack-webhook] Design not found:', reference, fetchErr?.message);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const row = rows[0] as { id: string; jeweler_id: string; data: Record<string, unknown> };
  const data = (row.data || {}) as Record<string, unknown>;
  const nextData = {
    ...data,
    status: 'Deposit Paid',
    isApproved: true,
    paystackReference: reference,
    statusUpdatedAt: new Date().toISOString()
  };

  const { error: updateErr } = await supabase
    .from('designs')
    .update({ data: nextData, updated_at: new Date().toISOString() })
    .eq('id', row.id);

  if (updateErr) {
    console.error('[paystack-webhook] Update failed', updateErr);
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const notify = data.notifyClientOnStatusChange && data.email;
  if (notify && typeof data.email === 'string') {
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Valued Client';
    try {
      await fetch(`${supabaseUrl}/functions/v1/notify-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceRole}` },
        body: JSON.stringify({
          design_id: row.id,
          new_status: 'Deposit Paid',
          to: String(data.email).trim(),
          client_name: name,
          design_title: `${data.type || 'Order'} • ${data.metal || ''} • ${row.id}`
        })
      });
    } catch (e) {
      console.warn('[paystack-webhook] notify-client failed', e);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
