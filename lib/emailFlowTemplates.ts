import type { EmailFlow, EmailFlowTriggerType } from '../types';

export const EMAIL_FLOW_TRIGGER_LABELS: Record<EmailFlowTriggerType, string> = {
  quote_approved: 'Quote approved',
  status_update: 'Status update',
  reminder: 'Reminder',
  promo: 'Promotion',
  custom: 'Custom'
};

export const VARIABLE_HINT = 'Variables: {{client_name}}, {{design_id}}, {{design_title}}, {{new_status}}, {{price_zar}}';

export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailFlow, 'id' | 'jewelerId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Quote approved',
    triggerType: 'quote_approved',
    subjectTemplate: 'Your proposal {{design_id}} has been approved – The Diamond Guy',
    bodyTemplate: `Dear {{client_name}},

Your proposal {{design_id}} has been officially approved.

We're ready to begin crafting your {{design_title}}. Next step: complete your 50% deposit using the link we sent.

If you have any questions, reply to this email or contact our concierge.

Best regards,
The Diamond Guy`,
    followUpDays: null,
    isActive: true,
    followUps: []
  },
  {
    name: 'Status update',
    triggerType: 'status_update',
    subjectTemplate: 'Order {{design_id}} – {{new_status}}',
    bodyTemplate: `Dear {{client_name}},

Your order {{design_id}} is now: {{new_status}}.

You can track progress anytime via the Track page on our site.

Best regards,
The Diamond Guy`,
    followUpDays: null,
    isActive: true,
    followUps: []
  },
  {
    name: 'Payment reminder (3 days)',
    triggerType: 'reminder',
    subjectTemplate: 'Gentle reminder: deposit for {{design_id}}',
    bodyTemplate: `Dear {{client_name}},

A quick reminder that your 50% deposit for {{design_id}} is awaited so we can start crafting.

Use the payment link from our previous email. If you need a new link or have questions, just reply.

Best regards,
The Diamond Guy`,
    followUpDays: 3,
    isActive: true,
    followUps: []
  },
  {
    name: 'Promotion',
    triggerType: 'promo',
    subjectTemplate: 'Exclusive offer from The Diamond Guy',
    bodyTemplate: `Dear {{client_name}},

As someone who's explored our bespoke pieces, we'd like to offer you [your promotion details].

Reply to this email or visit our site to learn more.

Best regards,
The Diamond Guy`,
    followUpDays: null,
    isActive: true,
    followUps: []
  }
];

export function createFlowFromTemplate(
  t: Omit<EmailFlow, 'id' | 'jewelerId' | 'createdAt' | 'updatedAt'>,
  jewelerId: string
): EmailFlow {
  const now = new Date().toISOString();
  return {
    ...t,
    id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    jewelerId,
    createdAt: now,
    updatedAt: now
  };
}
