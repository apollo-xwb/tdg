import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { JewelleryConfig, Lead, CatalogProduct, EmailFlow, EmailFlowFollowUp, JewelerSettings, JewelerPackageTier, JewelerAvailabilitySlot, Appointment, AppointmentStatus, OpeningHoursEntry, VaultGuide, BlogPost, BlogBodyBlock, JewelerPricingRules } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Persistence: design/lead/catalog/email-flow mutations go through upsertDesign(s), upsertLead(s), upsertCatalogProduct, upsertEmailFlow and persist to Supabase.

// Auth – re-export User type and expose helpers
export type { User };

export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null };
  return supabase.auth.getSession();
}

export function onAuthStateChange(cb: (event: string, session: { user: User } | null) => void) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    cb(event, session ? { user: session.user } : null);
  });
  return () => subscription.unsubscribe();
}

export async function signInWithGoogle() {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + window.location.pathname } });
}

export async function signUpEmail(email: string, password: string) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
  return supabase.auth.signUp({ email, password });
}

export async function signInEmail(email: string, password: string) {
  if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Jeweler: allowed email (set in env). Portal only for this identity.
export function getJewelerEmail(): string {
  return (import.meta.env.VITE_JEWELER_EMAIL ?? '').trim();
}

// RLS: when the user is signed in, DB ops use their email as jeweler_id. Set from App on auth change.
let _effectiveJewelerId: string | null = null;
export function setEffectiveJewelerId(id: string | null) {
  _effectiveJewelerId = id;
}
function effectiveJewelerId(): string {
  return _effectiveJewelerId ?? getJewelerEmail() ?? '';
}

// Row types matching Supabase tables
export interface DesignRow {
  id: string;
  data: JewelleryConfig;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  data: Lead;
  updated_at: string;
}

const DESIGNS_TABLE = 'designs';
const LEADS_TABLE = 'leads';
const CATALOG_TABLE = 'catalog_products';
const EMAIL_FLOWS_TABLE = 'email_flows';
const JEWELER_SETTINGS_TABLE = 'jeweler_settings';
const JEWELER_AVAILABILITY_TABLE = 'jeweler_availability';
const APPOINTMENTS_TABLE = 'appointments';
const VAULT_GUIDES_TABLE = 'vault_guides';
const BLOG_POSTS_TABLE = 'blog_posts';

export interface CatalogRow {
  id: string;
  jeweler_id: string;
  data: CatalogProduct;
  updated_at: string;
}

/** When jewelerId is omitted, uses effective jeweler (session email or getJewelerEmail()) for RLS-scoped load. */
export async function fetchDesigns(jewelerId?: string): Promise<JewelleryConfig[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(DESIGNS_TABLE).select('id, data, updated_at').order('updated_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchDesigns error:', error.message);
    return [];
  }
  return (data ?? []).map((r: DesignRow) => r.data);
}

export async function upsertDesign(design: JewelleryConfig): Promise<void> {
  if (!supabase) return;
  const jewelerId = effectiveJewelerId();
  const { error } = await supabase
    .from(DESIGNS_TABLE)
    .upsert(
      { id: design.id, jeweler_id: jewelerId, data: design, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  if (error) console.warn('[Supabase] upsertDesign error:', error.message);
}

export async function upsertDesigns(designs: JewelleryConfig[]): Promise<void> {
  if (!supabase || !designs.length) return;
  const jewelerId = effectiveJewelerId();
  const rows = designs.map((d) => ({
    id: d.id,
    jeweler_id: jewelerId,
    data: d,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from(DESIGNS_TABLE).upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertDesigns error:', error.message);
}

/** When jewelerId is omitted, uses effective jeweler for RLS-scoped load. */
export async function fetchLeads(jewelerId?: string): Promise<Lead[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(LEADS_TABLE).select('id, data, updated_at').order('updated_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchLeads error:', error.message);
    return [];
  }
  return (data ?? []).map((r: LeadRow) => r.data);
}

export async function upsertLead(lead: Lead): Promise<void> {
  if (!supabase) return;
  const jewelerId = effectiveJewelerId();
  const { error } = await supabase.from(LEADS_TABLE).upsert(
    { id: lead.id, jeweler_id: jewelerId, data: lead, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );
  if (error) console.warn('[Supabase] upsertLead error:', error.message);
}

export async function upsertLeads(leads: Lead[]): Promise<void> {
  if (!supabase || !leads.length) return;
  const jewelerId = effectiveJewelerId();
  const rows = leads.map((l) => ({
    id: l.id,
    jeweler_id: jewelerId,
    data: l,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from(LEADS_TABLE).upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertLeads error:', error.message);
}

export function subscribeDesigns(onUpdate: (designs: JewelleryConfig[]) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('designs-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: DESIGNS_TABLE },
      async () => {
        const designs = await fetchDesigns();
        onUpdate(designs);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeLeads(onUpdate: (leads: Lead[]) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('leads-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: LEADS_TABLE },
      async () => {
        const leads = await fetchLeads();
        onUpdate(leads);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/** When jewelerId is omitted, uses effective jeweler for RLS-scoped load. */
export async function fetchCatalogProducts(jewelerId?: string): Promise<CatalogProduct[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(CATALOG_TABLE).select('id, jeweler_id, data, updated_at').order('updated_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchCatalogProducts error:', error.message);
    return [];
  }
  return (data ?? []).map((r: CatalogRow) => {
    const d = r.data as Record<string, unknown>;
    return { ...d, id: r.id, jewelerId: r.jeweler_id || (d.jewelerId as string), createdAt: r.updated_at, updatedAt: r.updated_at } as CatalogProduct;
  });
}

export async function upsertCatalogProduct(product: CatalogProduct): Promise<void> {
  if (!supabase) return;
  const updated_at = new Date().toISOString();
  const payload = { id: product.id, jeweler_id: product.jewelerId || effectiveJewelerId(), data: { ...product, updatedAt: updated_at }, updated_at };
  const { error } = await supabase.from(CATALOG_TABLE).upsert(payload, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertCatalogProduct error:', error.message);
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(CATALOG_TABLE).delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteCatalogProduct error:', error.message);
}

export function subscribeCatalogProducts(onUpdate: (products: CatalogProduct[]) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('catalog-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: CATALOG_TABLE },
      async () => {
        const products = await fetchCatalogProducts();
        onUpdate(products);
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// Email flows
export async function fetchEmailFlows(jewelerId?: string): Promise<EmailFlow[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(EMAIL_FLOWS_TABLE).select('*').order('updated_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchEmailFlows error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    name: (r.name as string) || '',
    triggerType: (r.trigger_type as EmailFlow['triggerType']) || 'custom',
    subjectTemplate: (r.subject_template as string) || '',
    bodyTemplate: (r.body_template as string) || '',
    followUpDays: r.follow_up_days as number | null | undefined,
    isActive: r.is_active !== false,
    followUps: (Array.isArray(r.follow_ups) ? r.follow_ups : []) as EmailFlowFollowUp[],
    createdAt: (r.created_at as string) || (r.updated_at as string),
    updatedAt: (r.updated_at as string) || ''
  }));
}

export async function upsertEmailFlow(flow: EmailFlow): Promise<void> {
  if (!supabase) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from(EMAIL_FLOWS_TABLE).upsert(
    {
      id: flow.id,
      jeweler_id: flow.jewelerId || effectiveJewelerId(),
      name: flow.name,
      trigger_type: flow.triggerType,
      subject_template: flow.subjectTemplate,
      body_template: flow.bodyTemplate,
      follow_up_days: flow.followUpDays ?? null,
      is_active: flow.isActive !== false,
      follow_ups: flow.followUps ?? [],
      updated_at: now
    },
    { onConflict: 'id' }
  );
  if (error) console.warn('[Supabase] upsertEmailFlow error:', error.message);
}

export async function deleteEmailFlow(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(EMAIL_FLOWS_TABLE).delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteEmailFlow error:', error.message);
}

export function subscribeEmailFlows(onUpdate: (flows: EmailFlow[]) => void) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('email-flows-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: EMAIL_FLOWS_TABLE }, async () => {
      const flows = await fetchEmailFlows();
      onUpdate(flows);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// Jeweler settings (plan tier, Live Diamond Sourcing / Nivoda toggle)
export async function fetchJewelerSettings(jewelerId?: string): Promise<JewelerSettings | null> {
  if (!supabase) return null;
  const tid = jewelerId ?? effectiveJewelerId();
  if (!tid) return null;
  const { data, error } = await supabase
    .from(JEWELER_SETTINGS_TABLE)
    .select('jeweler_id, package_tier, settings, updated_at')
    .eq('jeweler_id', tid)
    .maybeSingle();
  if (error) {
    console.warn('[Supabase] fetchJewelerSettings error:', error.message);
    return null;
  }
  if (!data) return null;
  const s = (data.settings as Record<string, unknown>) || {};
  const rawHours = s.openingHours;
  const openingHours = Array.isArray(rawHours)
    ? (rawHours as Record<string, unknown>[]).map((h) => ({
        day: (h.day as number) ?? 0,
        name: (h.name as string) ?? '',
        open: (h.open as number | null) ?? null,
        close: (h.close as number | null) ?? null,
      })) as OpeningHoursEntry[]
    : undefined;
  const logoUrl = s.logoUrl;
  const termsAndConditions = s.termsAndConditions;
  const address = s.address;
  const aboutUs = s.aboutUs;
  const logoNavbar = s.logoNavbar;
  const logoFooter = s.logoFooter;
  const logoQuotes = s.logoQuotes;
  const logoVault = s.logoVault;
  const pricingRules = s.pricingRules as JewelerPricingRules | undefined;
  const googleReviewUrl = s.googleReviewUrl;
  return {
    jewelerId: data.jeweler_id as string,
    packageTier: (data.package_tier as JewelerPackageTier) || 'starter',
    nivodaSourcingEnabled: s.nivodaSourcingEnabled === true,
    openingHours: openingHours?.length ? openingHours : undefined,
    logoUrl: typeof logoUrl === 'string' ? logoUrl : logoUrl === null ? null : undefined,
    logoNavbar: typeof logoNavbar === 'string' ? logoNavbar : logoNavbar === null ? null : undefined,
    logoFooter: typeof logoFooter === 'string' ? logoFooter : logoFooter === null ? null : undefined,
    logoQuotes: typeof logoQuotes === 'string' ? logoQuotes : logoQuotes === null ? null : undefined,
    logoVault: typeof logoVault === 'string' ? logoVault : logoVault === null ? null : undefined,
    termsAndConditions: typeof termsAndConditions === 'string' ? termsAndConditions : termsAndConditions === null ? null : undefined,
    address: typeof address === 'string' ? address : address === null ? null : undefined,
    aboutUs: typeof aboutUs === 'string' ? aboutUs : aboutUs === null ? null : undefined,
    pricingRules: pricingRules && typeof pricingRules === 'object' ? pricingRules : undefined,
    googleReviewUrl: typeof googleReviewUrl === 'string' ? googleReviewUrl : googleReviewUrl === null ? null : undefined,
    updatedAt: (data.updated_at as string) || '',
  };
}

export async function upsertJewelerSettings(settings: Partial<JewelerSettings> & { jewelerId: string }): Promise<void> {
  if (!supabase) return;
  const jewelerId = settings.jewelerId || effectiveJewelerId();
  if (!jewelerId) return;
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from(JEWELER_SETTINGS_TABLE).select('package_tier, settings').eq('jeweler_id', jewelerId).maybeSingle();
  const packageTier = settings.packageTier ?? (existing?.package_tier as JewelerPackageTier) ?? 'starter';
  const prevSettings = (existing?.settings as Record<string, unknown>) || {};
  const nextSettings = {
    ...prevSettings,
    ...(typeof settings.nivodaSourcingEnabled === 'boolean' ? { nivodaSourcingEnabled: settings.nivodaSourcingEnabled } : {}),
    ...(Array.isArray(settings.openingHours) && settings.openingHours.length
      ? { openingHours: settings.openingHours.map((h) => ({ day: h.day, name: h.name, open: h.open, close: h.close })) }
      : {}),
    ...(settings.logoUrl !== undefined ? { logoUrl: settings.logoUrl || null } : {}),
    ...(settings.logoNavbar !== undefined ? { logoNavbar: settings.logoNavbar || null } : {}),
    ...(settings.logoFooter !== undefined ? { logoFooter: settings.logoFooter || null } : {}),
    ...(settings.logoQuotes !== undefined ? { logoQuotes: settings.logoQuotes || null } : {}),
    ...(settings.logoVault !== undefined ? { logoVault: settings.logoVault || null } : {}),
    ...(settings.termsAndConditions !== undefined ? { termsAndConditions: settings.termsAndConditions || null } : {}),
    ...(settings.address !== undefined ? { address: settings.address || null } : {}),
    ...(settings.aboutUs !== undefined ? { aboutUs: settings.aboutUs || null } : {}),
    ...(settings.pricingRules !== undefined ? { pricingRules: settings.pricingRules || null } : {}),
    ...(settings.googleReviewUrl !== undefined ? { googleReviewUrl: settings.googleReviewUrl || null } : {}),
  };
  const { error } = await supabase.from(JEWELER_SETTINGS_TABLE).upsert(
    { jeweler_id: jewelerId, package_tier: packageTier, settings: nextSettings, updated_at: now },
    { onConflict: 'jeweler_id' }
  );
  if (error) console.warn('[Supabase] upsertJewelerSettings error:', error.message);
}

// Jeweler availability (recurring weekly slots)
export async function fetchJewelerAvailability(jewelerId?: string): Promise<JewelerAvailabilitySlot[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(JEWELER_AVAILABILITY_TABLE).select('*').order('day_of_week').order('start_time');
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchJewelerAvailability error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    dayOfWeek: (r.day_of_week as number) ?? 0,
    startTime: (r.start_time as string) || '09:00',
    endTime: (r.end_time as string) || '17:00',
    updatedAt: (r.updated_at as string) || '',
  }));
}

export async function upsertJewelerAvailabilitySlot(slot: JewelerAvailabilitySlot): Promise<void> {
  if (!supabase) return;
  const jewelerId = slot.jewelerId || effectiveJewelerId();
  const { error } = await supabase.from(JEWELER_AVAILABILITY_TABLE).upsert(
    {
      id: slot.id,
      jeweler_id: jewelerId,
      day_of_week: slot.dayOfWeek,
      start_time: slot.startTime,
      end_time: slot.endTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) console.warn('[Supabase] upsertJewelerAvailabilitySlot error:', error.message);
}

export async function deleteJewelerAvailabilitySlot(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(JEWELER_AVAILABILITY_TABLE).delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteJewelerAvailabilitySlot error:', error.message);
}

// Appointments
export async function fetchAppointments(jewelerId?: string, fromDate?: string, toDate?: string): Promise<Appointment[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(APPOINTMENTS_TABLE).select('*').order('start_at', { ascending: true });
  if (tid) q = q.eq('jeweler_id', tid);
  if (fromDate) q = q.gte('start_at', fromDate);
  if (toDate) q = q.lte('start_at', toDate);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchAppointments error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    startAt: r.start_at as string,
    endAt: r.end_at as string,
    clientName: (r.client_name as string) || '',
    clientEmail: (r.client_email as string) || '',
    summary: (r.summary as string) || '',
    status: (r.status as AppointmentStatus) || 'scheduled',
    designId: r.design_id as string | null | undefined,
    leadId: r.lead_id as string | null | undefined,
    createdAt: (r.created_at as string) || '',
  }));
}

export async function createAppointment(appointment: Omit<Appointment, 'createdAt'>): Promise<{ id: string } | null> {
  if (!supabase) return null;
  const row = {
    id: appointment.id,
    jeweler_id: appointment.jewelerId,
    start_at: appointment.startAt,
    end_at: appointment.endAt,
    client_name: appointment.clientName,
    client_email: appointment.clientEmail,
    summary: appointment.summary,
    status: appointment.status || 'scheduled',
    design_id: appointment.designId ?? null,
    lead_id: appointment.leadId ?? null,
  };
  const { error } = await supabase.from(APPOINTMENTS_TABLE).insert(row);
  if (error) {
    console.warn('[Supabase] createAppointment error:', error.message);
    return null;
  }
  return { id: appointment.id };
}

export async function updateAppointment(id: string, updates: Partial<Pick<Appointment, 'status' | 'startAt' | 'endAt' | 'summary'>>): Promise<void> {
  if (!supabase) return;
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.startAt !== undefined) payload.start_at = updates.startAt;
  if (updates.endAt !== undefined) payload.end_at = updates.endAt;
  if (updates.summary !== undefined) payload.summary = updates.summary;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from(APPOINTMENTS_TABLE).update(payload).eq('id', id);
  if (error) console.warn('[Supabase] updateAppointment error:', error.message);
}

// Vault guides (Digital Vault / Guides for clients)
export async function fetchVaultGuides(jewelerId?: string): Promise<VaultGuide[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(VAULT_GUIDES_TABLE).select('*').eq('is_active', true).order('sort_order').order('created_at');
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchVaultGuides error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    downloadUrl: (r.download_url as string) || '',
    suggestedFilename: r.suggested_filename as string | undefined,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    sortOrder: (r.sort_order as number) ?? 0,
    isActive: (r.is_active as boolean) ?? true,
    createdAt: (r.created_at as string) || '',
    updatedAt: (r.updated_at as string) || '',
  }));
}

/** Fetch all vault guides for a jeweler (including inactive) for admin UI */
export async function fetchVaultGuidesAdmin(jewelerId?: string): Promise<VaultGuide[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(VAULT_GUIDES_TABLE).select('*').order('sort_order').order('created_at');
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchVaultGuidesAdmin error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    downloadUrl: (r.download_url as string) || '',
    suggestedFilename: r.suggested_filename as string | undefined,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    sortOrder: (r.sort_order as number) ?? 0,
    isActive: (r.is_active as boolean) ?? true,
    createdAt: (r.created_at as string) || '',
    updatedAt: (r.updated_at as string) || '',
  }));
}

export async function upsertVaultGuide(guide: Partial<VaultGuide> & { jewelerId: string }): Promise<void> {
  if (!supabase) return;
  const jewelerId = guide.jewelerId || effectiveJewelerId();
  if (!jewelerId || !guide.id) return;
  const now = new Date().toISOString();
  const row = {
    id: guide.id,
    jeweler_id: jewelerId,
    title: guide.title ?? '',
    description: guide.description ?? '',
    download_url: guide.downloadUrl ?? '',
    suggested_filename: guide.suggestedFilename ?? null,
    tags: Array.isArray(guide.tags) ? guide.tags : [],
    sort_order: guide.sortOrder ?? 0,
    is_active: guide.isActive ?? true,
    updated_at: now,
  };
  const { error } = await supabase.from(VAULT_GUIDES_TABLE).upsert(row, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertVaultGuide error:', error.message);
}

export async function deleteVaultGuide(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(VAULT_GUIDES_TABLE).delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteVaultGuide error:', error.message);
}

// Blog posts (jeweler-written articles)
export async function fetchPublishedBlogPosts(jewelerId?: string): Promise<BlogPost[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? getJewelerEmail();
  let q = supabase.from(BLOG_POSTS_TABLE).select('*').not('published_at', 'is', null).order('published_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchPublishedBlogPosts error:', error.message);
    return [];
  }
  return (data ?? []).map(rowToBlogPost);
}

export async function fetchBlogPostsAdmin(jewelerId?: string): Promise<BlogPost[]> {
  if (!supabase) return [];
  const tid = jewelerId ?? effectiveJewelerId();
  let q = supabase.from(BLOG_POSTS_TABLE).select('*').order('updated_at', { ascending: false });
  if (tid) q = q.eq('jeweler_id', tid);
  const { data, error } = await q;
  if (error) {
    console.warn('[Supabase] fetchBlogPostsAdmin error:', error.message);
    return [];
  }
  return (data ?? []).map(rowToBlogPost);
}

function rowToBlogPost(r: Record<string, unknown>): BlogPost {
  const body = r.body;
  const bodyBlocks: BlogBodyBlock[] = Array.isArray(body)
    ? (body as Record<string, unknown>[]).map((b) => {
        const t = (b.type as string) || 'p';
        if (t === 'p' || t === 'h2' || t === 'h3') return { type: t as 'p' | 'h2' | 'h3', content: (b.content as string) || '' };
        if (t === 'ul' || t === 'ol') return { type: t as 'ul' | 'ol', items: Array.isArray(b.items) ? (b.items as string[]) : [] };
        if (t === 'cta') return { type: 'cta', to: (b.to as 'RingBuilder' | 'Chatbot' | 'Resources') || 'Resources', label: (b.label as string) || '' };
        return { type: 'p', content: (b.content as string) || '' };
      })
    : [];
  return {
    id: r.id as string,
    jewelerId: (r.jeweler_id as string) || '',
    slug: (r.slug as string) || '',
    title: (r.title as string) || '',
    metaDescription: (r.meta_description as string) || '',
    category: (r.category as string) || 'Guide',
    publishedAt: r.published_at ? (r.published_at as string) : null,
    readTimeMinutes: (r.read_time_minutes as number) ?? 5,
    excerpt: (r.excerpt as string) || '',
    body: bodyBlocks,
    createdAt: (r.created_at as string) || '',
    updatedAt: (r.updated_at as string) || '',
  };
}

export async function upsertBlogPost(post: Partial<BlogPost> & { jewelerId: string; id: string }): Promise<void> {
  if (!supabase) return;
  const jewelerId = post.jewelerId || effectiveJewelerId();
  if (!jewelerId || !post.id) return;
  const now = new Date().toISOString();
  const row = {
    id: post.id,
    jeweler_id: jewelerId,
    slug: (post.slug ?? '').trim().toLowerCase().replace(/\s+/g, '-'),
    title: post.title ?? '',
    meta_description: post.metaDescription ?? '',
    category: post.category ?? 'Guide',
    published_at: post.publishedAt || null,
    read_time_minutes: post.readTimeMinutes ?? 5,
    excerpt: post.excerpt ?? '',
    body: Array.isArray(post.body) ? post.body : [],
    updated_at: now,
  };
  const { error } = await supabase.from(BLOG_POSTS_TABLE).upsert(row, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertBlogPost error:', error.message);
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from(BLOG_POSTS_TABLE).delete().eq('id', id);
  if (error) console.warn('[Supabase] deleteBlogPost error:', error.message);
}

// Storage: jeweler uploads (logos, guide files). Bucket must exist and allow public read + authenticated upload.
const JEWELER_ASSETS_BUCKET = 'jeweler-assets';

/** Upload a file to jeweler-assets/{jewelerId}/{folder}/{uniqueName}. Returns public URL or null. */
export async function uploadJewelerAsset(jewelerId: string, folder: 'logos' | 'guides', file: File): Promise<string | null> {
  if (!supabase || !jewelerId) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${jewelerId}/${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(JEWELER_ASSETS_BUCKET).upload(path, file, { upsert: true });
  if (error) {
    console.warn('[Supabase] uploadJewelerAsset error:', error.message);
    return null;
  }
  const { data } = supabase.storage.from(JEWELER_ASSETS_BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
