// Supabase Edge Function: create-paystack-link
// Creates a Paystack payment link for a design (deposit or full). Call from portal with design_id, amount_zar, email.
// Set PAYSTACK_SECRET_KEY in Supabase Dashboard → Edge Functions → create-paystack-link → Secrets.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface Body {
  design_id: string;
  amount_zar: number;
  email: string;
  callback_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const { design_id, amount_zar, email, callback_url } = body;
    if (!design_id?.trim() || amount_zar == null || amount_zar < 1 || !email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing design_id, amount_zar, or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) {
      return new Response(
        JSON.stringify({ error: 'PAYSTACK_SECRET_KEY not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Paystack amount is in subunits (ZAR cents)
    const amountKobo = Math.round(amount_zar * 100);
    const ref = design_id.trim().replace(/\s+/g, '-');

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        amount: amountKobo,
        currency: 'ZAR',
        reference: ref,
        callback_url: callback_url || undefined,
        metadata: { design_id: design_id.trim() }
      })
    });

    const data = (await res.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
    if (!res.ok || !data.status) {
      return new Response(
        JSON.stringify({ error: data.message || 'Paystack init failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        url: data.data?.authorization_url,
        reference: data.data?.reference || ref
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[create-paystack-link]', e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
