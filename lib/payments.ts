/**
 * Paystack payments integration.
 *
 * Env (see .env.example):
 * - VITE_PAYSTACK_PUBLISHABLE_KEY — Paystack public key (pk_test_... or pk_live_...)
 *
 * Webhook (Paystack Dashboard → Settings → Webhooks):
 * - URL: your backend or Supabase Edge Function, e.g. https://your-project.supabase.co/functions/v1/paystack-webhook
 * - On charge.success: read metadata.design_id (or reference), update design: status = 'Deposit Paid', isApproved = true.
 * - If design.notifyClientOnStatusChange, trigger client notification (see notify-client flow).
 */

export function getPaystackPublicKey(): string {
  return (import.meta.env.VITE_PAYSTACK_PUBLISHABLE_KEY ?? '').trim();
}

export function hasPaymentsConfigured(): boolean {
  return !!getPaystackPublicKey();
}
