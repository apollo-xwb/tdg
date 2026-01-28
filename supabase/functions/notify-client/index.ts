// Supabase Edge Function: notify-client
// Invoked when a jeweler changes order status and design.notifyClientOnStatusChange is true.
// Set RESEND_API_KEY in Supabase Dashboard → Edge Functions → notify-client → Secrets to send email via Resend.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface NotifyPayload {
  design_id: string;
  new_status: string;
  to: string;
  client_name: string;
  design_title?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as NotifyPayload;
    const { design_id, new_status, to, client_name, design_title } = body;
    if (!to?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing to' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('RESEND_FROM') || 'notifications@thediamondguy.co.za';

    const subject = `Your order ${design_id} – ${new_status}`;
    const html = `
      <p>Dear ${client_name || 'Valued Client'},</p>
      <p>Your order <strong>${design_id}</strong>${design_title ? ` (${design_title})` : ''} has been updated.</p>
      <p><strong>New status:</strong> ${new_status}</p>
      <p>You can track your order and view details in your Vault.</p>
      <p>Best regards,<br>The Diamond Guy</p>
    `;

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: from,
          to: [to.trim()],
          subject,
          html
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Resend error', res.status, data);
        return new Response(JSON.stringify({ error: 'Email send failed', details: data }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true, id: (data as { id?: string }).id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[notify-client] No RESEND_API_KEY; would send:', { to, subject });
    return new Response(JSON.stringify({ ok: true, skipped: 'no RESEND_API_KEY' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[notify-client]', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
