import type { Lead, JewelleryConfig, CatalogProduct, EmailFlow } from '../types';

/** Replace template variables in email flow body/subject */
function interpolate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
  }
  return out;
}

/** Trigger order_placed email flow: open mailto with templated content. Actual sending would use a backend. */
export function triggerOrderPlacedEmail(
  flow: EmailFlow | undefined,
  order: { design: JewelleryConfig; lead: Lead; product?: CatalogProduct }
): void {
  if (!flow || !flow.isActive || flow.triggerType !== 'order_placed') return;

  const { design, lead, product } = order;
  const clientName = lead.name || `${design.firstName || ''} ${design.lastName || ''}`.trim() || 'Valued Client';
  const productTitle = product?.title || design.type || 'Your piece';
  const vars: Record<string, string> = {
    client_name: clientName,
    design_id: design.id,
    design_title: productTitle,
    new_status: design.status,
    price_zar: String(design.priceZAR?.toLocaleString() ?? ''),
    product_title: productTitle,
    order_id: design.id,
  };

  const subject = interpolate(flow.subjectTemplate || 'Thank you for your order', vars);
  const body = interpolate(flow.bodyTemplate || '', vars);
  const to = lead.email;
  if (!to) return;

  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}
