import { supabase } from './supabase';
import type { JewelleryConfig, OrderStatus } from '../types';

export async function notifyClientIfRequested(
  design: JewelleryConfig,
  newStatus: OrderStatus
): Promise<void> {
  if (!design.notifyClientOnStatusChange || !design.email?.trim()) return;
  if (!supabase) return;
  const name = [design.firstName, design.lastName].filter(Boolean).join(' ') || 'Valued Client';
  try {
    await supabase.functions.invoke('notify-client', {
      body: {
        design_id: design.id,
        new_status: newStatus,
        to: design.email.trim(),
        client_name: name,
        design_title: `${design.type} • ${design.metal || ''} • ${design.id}`
      }
    });
  } catch (e) {
    console.warn('[notifyClient] Edge Function call failed:', e);
  }
}
