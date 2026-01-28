
import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserState, JewelleryConfig, OrderStatus, Lead, CatalogProduct, LeadStatus, EmailFlow, EmailFlowTriggerType, JewelerSettings, Appointment, JewelerAvailabilitySlot, OpeningHoursEntry, VaultGuide, BlogPost } from '../types';
import { getJewelerEmail, fetchCatalogProducts, upsertCatalogProduct, deleteCatalogProduct, fetchEmailFlows, upsertEmailFlow, deleteEmailFlow, upsertJewelerSettings, fetchAppointments, fetchJewelerAvailability, upsertJewelerAvailabilitySlot, deleteJewelerAvailabilitySlot, updateAppointment, fetchVaultGuidesAdmin, upsertVaultGuide, deleteVaultGuide, fetchBlogPostsAdmin, upsertBlogPost, deleteBlogPost } from '../lib/supabase';
import { calculateQuotePrice } from '../lib/quotePrice';
import { notifyClientIfRequested } from '../lib/notifyClient';
import JewelerLogin from './JewelerLogin';
import { Search, Edit3, Trash2, Phone, FileText, Plus, Save, X, Shield, Share2, Video, CreditCard, LayoutGrid, List, Package, BarChart3, Mail, Copy, Settings, Sparkles, Calendar, Clock, BookOpen, FolderOpen } from 'lucide-react';
import { METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS, JEWELLERY_TYPES, OPENING_HOURS } from '../constants';
import { EMAIL_FLOW_TRIGGER_LABELS, DEFAULT_EMAIL_TEMPLATES, VARIABLE_HINT, createFlowFromTemplate } from '../lib/emailFlowTemplates';
import { DAY_NAMES } from '../lib/calendarSlots';

const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Closed'];

const STATUS_FLOW: OrderStatus[] = ['Quoted', 'Approved', 'Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Quoted': 'bg-neutral-500/20 border-neutral-500/30',
  'Approved': 'bg-blue-500/20 border-blue-500/30',
  'Deposit Paid': 'bg-amber-500/20 border-amber-500/30',
  'Sourcing Stone': 'bg-violet-500/20 border-violet-500/30',
  'In Production': 'bg-indigo-500/20 border-indigo-500/30',
  'Final Polish': 'bg-indigo-500/20 border-indigo-500/30',
  'Ready': 'bg-emerald-500/20 border-emerald-500/30',
  'Collected': 'bg-teal-500/20 border-teal-500/30'
};

interface Props {
  userState: UserState;
  onUpdate: (designs: JewelleryConfig[]) => void;
  onLeadsUpdate: (leads: Lead[]) => void;
  catalogProducts?: CatalogProduct[];
  onCatalogUpdate?: (products: CatalogProduct[]) => void;
  emailFlows?: EmailFlow[];
  onEmailFlowsUpdate?: (flows: EmailFlow[]) => void;
  jewelerSettings?: JewelerSettings | null;
  onJewelerSettingsRefresh?: () => void | Promise<void>;
  sessionUser?: User | null;
}

const emptyCatalogForm: Partial<CatalogProduct> = {
  title: '', description: '', imageUrls: [], priceZAR: 0, metal: undefined, type: undefined, shape: undefined, carat: undefined, stoneCategory: undefined, settingStyle: undefined, isActive: true
};

const EmailFlowsTab: React.FC<{
  flows: EmailFlow[];
  form: Partial<EmailFlow>;
  setForm: (f: Partial<EmailFlow>) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSave: (f: Partial<EmailFlow>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (flow: EmailFlow) => Promise<void>;
  onAddFromTemplate: (t: Omit<EmailFlow, 'id' | 'jewelerId' | 'createdAt' | 'updatedAt'>) => void;
  templates: Omit<EmailFlow, 'id' | 'jewelerId' | 'createdAt' | 'updatedAt'>[];
  triggerLabels: Record<EmailFlowTriggerType, string>;
  variableHint: string;
}> = ({ flows, form, setForm, editingId, setEditingId, onSave, onDelete, onDuplicate, onAddFromTemplate, templates, triggerLabels, variableHint }) => {
  const isFormOpen = editingId !== null;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <p className="text-[10px] uppercase opacity-68">Configure email flows for quote approved, status updates, reminders and promos. Use variables in subject/body.</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] uppercase opacity-60">Add from template:</span>
          {templates.map((t, i) => (
            <button key={i} type="button" onClick={() => onAddFromTemplate(t)} className="px-4 py-2 border border-white/20 text-[9px] uppercase tracking-widest hover:bg-white/5">
              {t.name}
            </button>
          ))}
        </div>
      </div>
      {isFormOpen && (
        <div className="glass border border-white/10 rounded-sm p-8 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-widest font-bold">Edit flow</h3>
            <button type="button" onClick={() => { setEditingId(null); setForm({}); }} className="p-2 opacity-60 hover:opacity-100"><X size={18}/></button>
          </div>
          <p className="text-[9px] opacity-60">{variableHint}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[8px] uppercase opacity-68 font-bold block">Name</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="e.g. Quote approved" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Trigger</label>
              <select value={form.triggerType || 'custom'} onChange={e => setForm({ ...form, triggerType: e.target.value as EmailFlowTriggerType })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                {(Object.entries(triggerLabels) as [EmailFlowTriggerType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Subject</label>
              <input value={form.subjectTemplate || ''} onChange={e => setForm({ ...form, subjectTemplate: e.target.value })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Subject line" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Follow-up (days)</label>
              <input type="number" min={0} value={form.followUpDays ?? ''} onChange={e => setForm({ ...form, followUpDays: e.target.value === '' ? undefined : parseInt(e.target.value) || 0 })} className="w-24 bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Optional" />
              <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                <input type="checkbox" checked={form.isActive !== false} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="space-y-4">
              <label className="text-[8px] uppercase opacity-68 font-bold block">Body</label>
              <textarea value={form.bodyTemplate || ''} onChange={e => setForm({ ...form, bodyTemplate: e.target.value })} rows={12} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none font-mono resize-y" placeholder="Email body..." />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => onSave(form)} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
              <Save size={14} /> Save
            </button>
            {form.id && (
              <button type="button" onClick={() => onDelete(form.id!)} className="px-6 py-2 border border-red-500/50 text-red-400 text-[10px] uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-4">
        {flows.length === 0 && !isFormOpen && <p className="text-center py-12 opacity-60 uppercase tracking-widest text-[10px]">No email flows yet. Add one from a template above.</p>}
        {flows.map(f => (
          <div key={f.id} className="glass border border-white/5 rounded-sm p-6 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h4 className="text-[11px] uppercase tracking-widest font-bold">{f.name} {!f.isActive && <span className="opacity-50">(inactive)</span>}</h4>
              <p className="text-[9px] opacity-68 mt-1">{triggerLabels[f.triggerType]} • {f.subjectTemplate?.slice(0, 60)}{(f.subjectTemplate?.length ?? 0) > 60 ? '…' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setEditingId(f.id); setForm({ ...f }); }} className="p-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center gap-1"><Edit3 size={12}/> Edit</button>
              <button type="button" onClick={() => onDuplicate(f)} className="p-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center gap-1"><Copy size={12}/> Duplicate</button>
              <button type="button" onClick={() => onDelete(f.id)} className="p-2 border border-red-500/20 text-red-400/80 text-[9px] uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const hasNivodaAccess = (tier: string | undefined) => tier === 'growth' || tier === 'pro';

const JewelerPortal: React.FC<Props> = ({ userState, onUpdate, onLeadsUpdate, catalogProducts = [], onCatalogUpdate, emailFlows = [], onEmailFlowsUpdate, jewelerSettings = null, onJewelerSettingsRefresh, sessionUser = null }) => {
  const jewelerEmail = getJewelerEmail();
  const isJeweler = jewelerEmail && sessionUser?.email?.toLowerCase() === jewelerEmail.toLowerCase();
  const showLogin = !!jewelerEmail && !isJeweler;
  const [tab, setTab] = useState<'Board' | 'Orders' | 'Leads' | 'Catalog' | 'NewQuote' | 'Analytics' | 'Email' | 'Calendar' | 'Settings' | 'Guides' | 'Blog'>('Board');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catalogForm, setCatalogForm] = useState<Partial<CatalogProduct>>(emptyCatalogForm);
  const [defaultMarginPercent, setDefaultMarginPercent] = useState(() => parseInt(localStorage.getItem('jeweler_margin_pct') || '25', 10));
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [flowForm, setFlowForm] = useState<Partial<EmailFlow>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<JewelerAvailabilitySlot[]>([]);
  const [availabilityForm, setAvailabilityForm] = useState<Partial<JewelerAvailabilitySlot>>({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
  const [openingHoursDraft, setOpeningHoursDraft] = useState<OpeningHoursEntry[]>(() => [...OPENING_HOURS]);
  const [savingHours, setSavingHours] = useState(false);
  const [logoUrlDraft, setLogoUrlDraft] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [vaultGuides, setVaultGuides] = useState<VaultGuide[]>([]);
  const [guideForm, setGuideForm] = useState<Partial<VaultGuide>>({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: 0, isActive: true });
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [addingGuide, setAddingGuide] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] });
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [addingBlog, setAddingBlog] = useState(false);

  useEffect(() => {
    if (!jewelerEmail) return;
    const from = new Date();
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 3);
    fetchAppointments(jewelerEmail, from.toISOString(), to.toISOString()).then(setAppointments);
    fetchJewelerAvailability(jewelerEmail).then(setAvailability);
  }, [jewelerEmail]);

  useEffect(() => {
    if (tab === 'Settings') {
      const from = jewelerSettings?.openingHours ?? OPENING_HOURS;
      const merged = OPENING_HOURS.map(d => from.find(f => f.day === d.day) ?? { ...d });
      setOpeningHoursDraft(merged);
      setLogoUrlDraft(jewelerSettings?.logoUrl ?? '');
    }
  }, [tab, jewelerSettings?.openingHours, jewelerSettings?.logoUrl]);

  useEffect(() => {
    if (tab === 'Guides' && jewelerEmail) fetchVaultGuidesAdmin(jewelerEmail).then(setVaultGuides);
  }, [tab, jewelerEmail]);

  useEffect(() => {
    if (tab === 'Blog' && jewelerEmail) fetchBlogPostsAdmin(jewelerEmail).then(setBlogPosts);
  }, [tab, jewelerEmail]);

  const [newQuote, setNewQuote] = useState<Partial<JewelleryConfig>>({
    id: `TDG-M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    type: 'Engagement Ring', stoneType: 'Natural', metal: 'Platinum', shape: 'Round', carat: 1.0, qualityTier: 'Balance Size & Quality', settingStyle: 'Solitaire', stoneCategory: 'Diamond', status: 'Quoted', isApproved: false, date: new Date().toLocaleDateString(), budget: 0, engraving: ''
  });
  const computedQuotePrice = calculateQuotePrice(newQuote, 1 + defaultMarginPercent / 100);

  const handleUpdate = (id: string, updates: Partial<JewelleryConfig>) => {
    const next = userState.recentDesigns.map(d => d.id === id ? { ...d, ...updates } : d);
    onUpdate(next);
  };

  const handleMoveCard = (designId: string, newStatus: OrderStatus) => {
    const design = userState.recentDesigns.find(d => d.id === designId);
    const next = userState.recentDesigns.map(d =>
      d.id === designId ? { ...d, status: newStatus } : d
    );
    onUpdate(next);
    if (design?.notifyClientOnStatusChange) notifyClientIfRequested(design, newStatus);
    setDragId(null);
  };

  const sendQuotationEmail = (design: JewelleryConfig) => {
    const subject = encodeURIComponent(`Bespoke Proposal ${design.id} - The Diamond Guy`);
    const body = encodeURIComponent(getQuotationEmailTemplate(design));
    window.location.href = `mailto:${design.email}?subject=${subject}&body=${body}`;
  };

  const sendPaymentLinkEmail = (design: JewelleryConfig) => {
    if (!design.paymentLink) {
      alert('Payment link is required');
      return;
    }
    const subject = encodeURIComponent(`Payment Link for ${design.id} - The Diamond Guy`);
    const body = encodeURIComponent(getPaymentLinkEmailTemplate(design));
    window.location.href = `mailto:${design.email}?subject=${subject}&body=${body}`;
  };

  const getQuotationEmailTemplate = (design: JewelleryConfig): string => {
    return `Dear ${design.firstName || 'Valued Client'},

We are delighted to present your bespoke proposal from The Diamond Guy.

PROPOSAL REFERENCE: ${design.id}

SPECIFICATIONS:
• Type: ${design.type}
• Metal: ${design.metal || 'N/A'}
• Stone: ${design.stoneCategory} ${design.shape || ''}
• Quality Tier: ${design.qualityTier}
• Carat: ${design.carat}
• Indicative Valuation: ZAR ${design.priceZAR.toLocaleString()}

${design.engraving ? `• Inscription: ${design.engraving}` : ''}

This proposal is valid for 7 days and subject to stone availability.

To view your full proposal and approve, please visit your Vault portal.

Best regards,
The Diamond Guy Team
Cape Town, South Africa

---
This is an automated quotation. For questions, please contact our concierge.`;
  };

  const getPaymentLinkEmailTemplate = (design: JewelleryConfig): string => {
    return `Dear ${design.firstName || 'Valued Client'},

Your proposal ${design.id} has been officially approved!

We are ready to begin crafting your bespoke piece. To proceed, please complete your 50% deposit payment using the link below:

PAYMENT LINK: ${design.paymentLink}

DEPOSIT AMOUNT: ZAR ${(design.priceZAR * 0.5).toLocaleString()}

Once your deposit is received, we will:
1. Source your specific stone
2. Begin the casting process
3. Provide regular updates on your piece's progress

Manufacturing timeline: 21-28 business days from deposit receipt.

${design.videoLink ? `\nVIDEO: ${design.videoLink}` : ''}
${design.certLink ? `\nCERTIFICATE: ${design.certLink}` : ''}

We look forward to creating your masterpiece.

Best regards,
The Diamond Guy Team
Cape Town, South Africa

---
For questions, please contact our concierge.`;
  };

  const filteredOrders = userState.recentDesigns.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const designsByStatus = filteredOrders.reduce<Record<OrderStatus, JewelleryConfig[]>>(
    (acc, d) => {
      const s = d.status || 'Quoted';
      if (!acc[s]) acc[s] = [];
      acc[s].push(d);
      return acc;
    },
    {} as Record<OrderStatus, JewelleryConfig[]>
  );
  STATUS_FLOW.forEach(s => { if (!designsByStatus[s]) designsByStatus[s] = []; });

  const filteredLeads = userState.leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinishQuote = () => {
    const final: JewelleryConfig = {
      ...newQuote,
      priceZAR: newQuote.priceZAR ?? computedQuotePrice,
      id: newQuote.id || `TDG-M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      type: (newQuote.type || 'Engagement Ring') as JewelleryConfig['type'],
      stoneType: (newQuote.stoneType || 'Natural') as JewelleryConfig['stoneType'],
      metal: (newQuote.metal || 'Platinum') as JewelleryConfig['metal'],
      settingStyle: (newQuote.settingStyle || 'Solitaire') as JewelleryConfig['settingStyle'],
      stoneCategory: (newQuote.stoneCategory || 'Diamond') as JewelleryConfig['stoneCategory'],
      shape: (newQuote.shape || 'Round') as JewelleryConfig['shape'],
      carat: newQuote.carat ?? 1,
      qualityTier: (newQuote.qualityTier || 'Balance Size & Quality') as JewelleryConfig['qualityTier'],
      budget: newQuote.budget ?? 0,
      engraving: newQuote.engraving ?? '',
      date: new Date().toLocaleDateString(),
      status: 'Quoted',
      isApproved: false
    } as JewelleryConfig;
    onUpdate([final, ...userState.recentDesigns]);
    setNewQuote({ ...newQuote, id: `TDG-M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, date: new Date().toLocaleDateString() });
    setTab('Orders');
    alert(`Manually issued quote ${final.id} is now live.`);
  };

  const handleInitiatePipeline = (lead: Lead) => {
    const designId = `TDG-M-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const [first, ...rest] = (lead.name || '').split(/\s+/);
    const newDesign: JewelleryConfig = {
      id: designId,
      type: 'Engagement Ring',
      stoneType: 'Natural',
      metal: 'Platinum',
      settingStyle: 'Solitaire',
      stoneCategory: 'Diamond',
      shape: 'Round',
      carat: 1,
      qualityTier: 'Balance Size & Quality',
      budget: 0,
      engraving: '',
      priceZAR: 0,
      date: new Date().toLocaleDateString(),
      status: 'Quoted',
      isApproved: false,
      firstName: first,
      lastName: rest.join(' ') || undefined,
      email: lead.email,
      phone: lead.phone
    } as JewelleryConfig;
    onUpdate([newDesign, ...userState.recentDesigns]);
    const updatedLead: Lead = { ...lead, status: 'Quoted', linkedDesignId: designId };
    onLeadsUpdate(userState.leads.map(l => l.id === lead.id ? updatedLead : l));
    setTab('Orders');
  };

  const handleLeadStatusChange = (lead: Lead, status: LeadStatus) => {
    onLeadsUpdate(userState.leads.map(l => l.id === lead.id ? { ...l, status } : l));
  };

  if (showLogin) {
    return <JewelerLogin jewelerEmail={jewelerEmail} onSuccess={() => {}} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-current/10 pb-12">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Jeweller Command Centre</p>
          <h1 className="text-5xl font-thin tracking-tighter uppercase">Operations Hub</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <TabBtn active={tab === 'Board'} label="Production Board" onClick={() => setTab('Board')} icon={<LayoutGrid size={14}/>} />
          <TabBtn active={tab === 'Orders'} label={`Orders (${userState.recentDesigns.length})`} onClick={() => setTab('Orders')} icon={<List size={14}/>} />
          <TabBtn active={tab === 'Leads'} label={`Leads (${userState.leads.length})`} onClick={() => setTab('Leads')} />
          <TabBtn active={tab === 'Catalog'} label={`Catalog (${catalogProducts.length})`} onClick={() => { setTab('Catalog'); setEditingCatalogId(null); setCatalogForm(emptyCatalogForm); }} icon={<Package size={14}/>} />
          <TabBtn active={tab === 'NewQuote'} label="Manual Quote" onClick={() => setTab('NewQuote')} icon={<Plus size={14}/>} />
          <TabBtn active={tab === 'Analytics'} label="Analytics" onClick={() => setTab('Analytics')} icon={<BarChart3 size={14}/>} />
          <TabBtn active={tab === 'Email'} label={`Email (${emailFlows.length})`} onClick={() => { setTab('Email'); setEditingFlowId(null); setFlowForm({}); }} icon={<Mail size={14}/>} />
          <TabBtn active={tab === 'Calendar'} label={`Calendar (${appointments.filter(a => a.status === 'scheduled').length})`} onClick={() => setTab('Calendar')} icon={<Calendar size={14}/>} />
          <TabBtn active={tab === 'Settings'} label="Settings" onClick={() => setTab('Settings')} icon={<Settings size={14}/>} />
          <TabBtn active={tab === 'Guides'} label={`Guides (${vaultGuides.length})`} onClick={() => { setTab('Guides'); setEditingGuideId(null); setAddingGuide(false); setGuideForm({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: vaultGuides.length, isActive: true }); }} icon={<FolderOpen size={14}/>} />
          <TabBtn active={tab === 'Blog'} label={`Blog (${blogPosts.length})`} onClick={() => { setTab('Blog'); setEditingBlogId(null); setAddingBlog(false); setBlogForm({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] }); }} icon={<BookOpen size={14}/>} />
        </div>
      </header>

      {tab !== 'NewQuote' && tab !== 'Catalog' && tab !== 'Analytics' && tab !== 'Email' && tab !== 'Settings' && tab !== 'Calendar' && tab !== 'Guides' && tab !== 'Blog' && (
        <div className="flex gap-4">
          <Search className="opacity-50 mt-3" size={18} />
          <input type="text" placeholder="Search by Ref, Client Name, or Email..." className="bg-transparent border-b border-current/20 w-full py-4 text-sm focus:outline-none placeholder:opacity-60" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}

      <div className="space-y-6">
        {tab === 'Board' && (
          <div className="overflow-x-auto pb-4 -mx-2">
            <div className="flex gap-4 min-w-max">
              {STATUS_FLOW.map(status => (
                <div
                  key={status}
                  className={`w-72 flex-shrink-0 rounded-sm border-2 border-dashed p-4 min-h-[360px] transition-colors ${STATUS_COLORS[status]} ${dragId ? 'border-current/40' : ''}`}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-current/30'); }}
                  onDragLeave={e => { e.currentTarget.classList.remove('ring-2', 'ring-current/30'); }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-2', 'ring-current/30');
                    const id = e.dataTransfer.getData('application/design-id');
                    if (id) handleMoveCard(id, status);
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold">{status}</span>
                    <span className="text-[9px] opacity-70">{designsByStatus[status]?.length ?? 0}</span>
                  </div>
                  <div className="space-y-2">
                    {(designsByStatus[status] ?? []).map(design => (
                      <div
                        key={design.id}
                        draggable
                        onDragStart={e => { e.dataTransfer.setData('application/design-id', design.id); e.dataTransfer.effectAllowed = 'move'; setDragId(design.id); }}
                        onDragEnd={() => setDragId(null)}
                        className="glass border border-white/10 rounded p-3 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors"
                        onClick={() => setEditingId(editingId === design.id ? null : design.id)}
                      >
                        <p className="text-[10px] uppercase font-bold truncate">{design.id}</p>
                        <p className="text-[9px] opacity-70 truncate">{design.firstName} {design.lastName}</p>
                        <p className="text-[8px] opacity-60 uppercase mt-1">{design.type} • ZAR {design.priceZAR?.toLocaleString()}</p>
                        {design.isApproved && <span className="inline-block mt-1 text-[7px] bg-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">Approved</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'Board' && editingId && (
          <div className="glass border border-white/10 rounded-sm p-6 animate-fadeIn">
            <p className="text-[10px] uppercase opacity-70 mb-4">Quick actions: open Orders tab to edit, send quote, or approve & send payment link.</p>
            <button onClick={() => setTab('Orders')} className="px-4 py-2 border border-current/20 text-[10px] uppercase tracking-widest hover:bg-white/5">Go to Orders</button>
          </div>
        )}
        {tab === 'Orders' && filteredOrders.length === 0 && <p className="text-center opacity-60 py-20 uppercase tracking-widest text-[10px]">No designs found.</p>}
        {tab === 'Orders' && filteredOrders.map(design => (
          <div key={design.id} className="glass border border-white/5 rounded-sm overflow-hidden">
             <div className="p-8 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setEditingId(editingId === design.id ? null : design.id)}>
                <div className="flex items-center gap-8">
                   <img src={design.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} className="w-12 h-12 object-cover rounded-sm border border-white/5" />
                   <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                        {design.id} {design.isDiscreet && <Shield className="text-emerald-500" size={14} />}
                      </h3>
                      <p className="text-[10px] opacity-68 uppercase tracking-widest">
                        {design.firstName} {design.lastName} • {design.type}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-10">
                   <span className="text-[10px] uppercase font-bold px-4 py-2 border border-white/5">{design.status}</span>
                   <Edit3 size={16} className="opacity-40" />
                </div>
             </div>
             {editingId === design.id && (
               <div className="p-8 border-t border-white/5 bg-white/[0.01] space-y-8 animate-fadeIn">
                  <div className="grid md:grid-cols-3 gap-12">
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-68 font-bold">Client Context</p>
                        <p className="text-xs">{design.email}</p>
                        <p className="text-[9px] uppercase opacity-68 leading-relaxed font-light">Specs: {design.metal} • {design.shape} • {design.qualityTier}</p>
                        {design.status === 'Approved' && !design.isApproved && (
                          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-sm">
                            <p className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-2">Client Approved - Awaiting Jeweler Approval</p>
                            {!design.paymentLink ? (
                              <p className="text-[8px] text-yellow-400 mb-2">⚠️ Payment link required before approval</p>
                            ) : null}
                            <button 
                              onClick={() => {
                                if (!design.paymentLink) {
                                  alert('Please add a payment link before approving.');
                                  return;
                                }
                                handleUpdate(design.id, {isApproved: true, status: 'Deposit Paid'});
                                if (design.notifyClientOnStatusChange) notifyClientIfRequested(design, 'Deposit Paid');
                                sendPaymentLinkEmail(design);
                              }} 
                              disabled={!design.paymentLink}
                              className={`w-full py-2 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-blue-600 ${
                                design.paymentLink ? 'bg-blue-500' : 'bg-gray-500 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              Approve & Send Payment Link
                            </button>
                          </div>
                        )}
                        {design.isApproved && design.status === 'Deposit Paid' && (
                          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-sm">
                            <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Officially Approved</p>
                            <p className="text-[8px] opacity-60 mt-1">Payment link sent to client</p>
                          </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-68 font-bold">Quotation Specs</p>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Metal</label>
                           <select value={design.metal || ''} onChange={e => handleUpdate(design.id, {metal: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(METAL_DATA).map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
                           <select value={design.shape || ''} onChange={e => handleUpdate(design.id, {shape: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(SHAPE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Quality Tier</label>
                           <select value={design.qualityTier || ''} onChange={e => handleUpdate(design.id, {qualityTier: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(QUALITY_TIERS).map(q => <option key={q} value={q}>{q}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Carat</label>
                           <input 
                              type="number" 
                              step="0.01"
                              value={design.carat || ''} 
                              onChange={e => handleUpdate(design.id, {carat: parseFloat(e.target.value) || 0})}
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Price (ZAR)</label>
                           <input 
                              type="number" 
                              value={design.priceZAR || ''} 
                              onChange={e => handleUpdate(design.id, {priceZAR: parseInt(e.target.value) || 0})}
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-68 font-bold">Status & Links</p>
                        <select value={design.status} onChange={e => { const s = e.target.value as OrderStatus; handleUpdate(design.id, { status: s }); if (design.notifyClientOnStatusChange) notifyClientIfRequested(design, s); }} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] uppercase tracking-widest">
                           {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="space-y-2 mt-4">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Video Link</label>
                           <input 
                              type="text" 
                              value={design.videoLink || ''} 
                              onChange={e => handleUpdate(design.id, {videoLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Certificate Link</label>
                           <input 
                              type="text" 
                              value={design.certLink || ''} 
                              onChange={e => handleUpdate(design.id, {certLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Payment Link *</label>
                           <input 
                              type="text" 
                              value={design.paymentLink || ''} 
                              onChange={e => handleUpdate(design.id, {paymentLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                           <p className="text-[7px] opacity-55">Required for approval</p>
                        </div>
                        <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold mt-4">
                          <input type="checkbox" checked={!!design.notifyClientOnStatusChange} onChange={e => handleUpdate(design.id, { notifyClientOnStatusChange: e.target.checked })} />
                          Notify client when status changes
                        </label>
                        <button onClick={() => sendQuotationEmail(design)} className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 mt-4">
                           Send Quotation Email
                        </button>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-68 font-bold">Actions</p>
                        <button className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5">Send Update Email</button>
                        {design.videoLink && (
                          <a href={design.videoLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2">
                            <Video size={12}/> View Video
                          </a>
                        )}
                        {design.certLink && (
                          <a href={design.certLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2">
                            <FileText size={12}/> View Certificate
                          </a>
                        )}
                        {design.paymentLink && (
                          <a href={design.paymentLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 flex items-center justify-center gap-2">
                            <CreditCard size={12}/> Payment Link
                          </a>
                        )}
                     </div>
                  </div>
               </div>
             )}
          </div>
        ))}
        {tab === 'Leads' && filteredLeads.map(lead => (
          <div key={lead.id} className={`glass p-10 border border-current/5 flex flex-col md:flex-row justify-between gap-12 items-center ${lead.nudgedByClient ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
            <div className="space-y-4 flex-1">
               <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[11px] uppercase tracking-widest font-bold">{lead.name} • {lead.date}</h4>
                  {lead.nudgedByClient && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Share2 size={10}/> NUDGE</span>}
                  {lead.source && <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full">{lead.source}</span>}
                  {lead.linkedDesignId && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">→ {lead.linkedDesignId}</span>}
               </div>
               <p className="text-xs opacity-78 max-w-lg leading-relaxed font-light">{lead.description}</p>
               <div className="flex gap-10 text-[9px] opacity-68 uppercase tracking-widest font-medium">
                  <span className="flex items-center gap-2"><Phone size={12}/> {lead.phone}</span>
                  <span className="flex items-center gap-2"><FileText size={12}/> {lead.email}</span>
               </div>
               <select value={lead.status} onChange={e => handleLeadStatusChange(lead, e.target.value as LeadStatus)} className="mt-2 bg-black/50 border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-widest focus:outline-none">
                 {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
            <button onClick={() => handleInitiatePipeline(lead)} disabled={!!lead.linkedDesignId} className="px-8 py-3 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {lead.linkedDesignId ? 'Pipeline started' : 'Initiate Pipeline'}
            </button>
          </div>
        ))}

        {tab === 'NewQuote' && (
          <div className="glass border border-white/10 rounded-sm p-8 space-y-8 animate-fadeIn max-w-4xl">
            <h3 className="text-[11px] uppercase tracking-widest font-bold">Quote from specs</h3>
            <p className="text-[10px] opacity-68">Set specs and default margin. Price is calculated from your formula and margin.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[8px] uppercase opacity-68 font-bold block">Default margin %</label>
                <input type="number" min={0} max={200} value={defaultMarginPercent} onChange={e => { const v = parseInt(e.target.value) || 0; setDefaultMarginPercent(v); localStorage.setItem('jeweler_margin_pct', String(v)); }} className="w-24 bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Type</label>
                <select value={newQuote.type || 'Engagement Ring'} onChange={e => setNewQuote(q => ({ ...q, type: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                  {JEWELLERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="text-[8px] uppercase opacity-68 font-bold block">Metal</label>
                <select value={newQuote.metal || 'Platinum'} onChange={e => setNewQuote(q => ({ ...q, metal: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                  {Object.keys(METAL_DATA).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
                <select value={newQuote.shape || 'Round'} onChange={e => setNewQuote(q => ({ ...q, shape: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                  {Object.keys(SHAPE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="text-[8px] uppercase opacity-68 font-bold block">Stone</label>
                <select value={newQuote.stoneCategory || 'Diamond'} onChange={e => setNewQuote(q => ({ ...q, stoneCategory: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                  <option value="Diamond">Diamond</option>
                  <option value="Moissanite">Moissanite</option>
                  <option value="None">None</option>
                  <option value="Sapphire">Sapphire</option>
                  <option value="Other">Other</option>
                </select>
                {(newQuote.stoneCategory === 'Diamond' || newQuote.stoneCategory === 'Moissanite') && (
                  <>
                    <label className="text-[8px] uppercase opacity-68 font-bold block">Stone type</label>
                    <select value={newQuote.stoneType || 'Natural'} onChange={e => setNewQuote(q => ({ ...q, stoneType: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                      <option value="Natural">Natural</option>
                      <option value="Lab">Lab</option>
                    </select>
                  </>
                )}
                <label className="text-[8px] uppercase opacity-68 font-bold block">Quality tier</label>
                <select value={newQuote.qualityTier || 'Balance Size & Quality'} onChange={e => setNewQuote(q => ({ ...q, qualityTier: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                  {Object.keys(QUALITY_TIERS).map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                {newQuote.type !== 'Loose Stone' && (
                  <>
                    <label className="text-[8px] uppercase opacity-68 font-bold block">Setting</label>
                    <select value={newQuote.settingStyle || 'Solitaire'} onChange={e => setNewQuote(q => ({ ...q, settingStyle: e.target.value as any }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                      {Object.keys(SETTING_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                )}
                <label className="text-[8px] uppercase opacity-68 font-bold block">Carat</label>
                <input type="number" step="0.01" value={newQuote.carat ?? 1} onChange={e => setNewQuote(q => ({ ...q, carat: parseFloat(e.target.value) || 1 }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" />
              </div>
              <div className="space-y-4">
                <label className="text-[8px] uppercase opacity-68 font-bold block">Client first name</label>
                <input value={newQuote.firstName || ''} onChange={e => setNewQuote(q => ({ ...q, firstName: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Optional" />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Client last name</label>
                <input value={newQuote.lastName || ''} onChange={e => setNewQuote(q => ({ ...q, lastName: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Optional" />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Client email</label>
                <input type="email" value={newQuote.email || ''} onChange={e => setNewQuote(q => ({ ...q, email: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Optional" />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Reference</label>
                <input value={newQuote.id || ''} onChange={e => setNewQuote(q => ({ ...q, id: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none font-mono" placeholder="e.g. TDG-M-XXXXX" />
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[9px] uppercase opacity-68 font-bold">Calculated price (incl. {defaultMarginPercent}% margin)</p>
                  <p className="text-2xl font-thin">ZAR {computedQuotePrice.toLocaleString()}</p>
                </div>
                <label className="text-[8px] uppercase opacity-68 font-bold block">Override price (ZAR)</label>
                <input type="number" value={newQuote.priceZAR || ''} onChange={e => setNewQuote(q => ({ ...q, priceZAR: parseInt(e.target.value) || undefined }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Leave empty to use calculated" />
                <button onClick={handleFinishQuote} className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 mt-4">
                  Create quote
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Analytics' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Total leads</p>
              <p className="text-4xl font-thin">{userState.leads.length}</p>
            </div>
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Leads by source</p>
              <div className="mt-2 space-y-1 text-[10px] uppercase">
                {(['Collection Enquiry', 'Chatbot', 'Ring Builder', 'Partner Nudge', 'Manual'] as const).map(src => {
                  const n = userState.leads.filter(l => l.source === src).length;
                  return n > 0 ? <div key={src} className="flex justify-between"><span className="opacity-78">{src}</span><span>{n}</span></div> : null;
                })}
                {userState.leads.filter(l => !l.source).length > 0 && <div className="flex justify-between"><span className="opacity-78">—</span><span>{userState.leads.filter(l => !l.source).length}</span></div>}
              </div>
            </div>
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Orders by status</p>
              <div className="mt-2 space-y-1 text-[10px] uppercase">
                {STATUS_FLOW.map(s => {
                  const n = userState.recentDesigns.filter(d => d.status === s).length;
                  return <div key={s} className="flex justify-between"><span className="opacity-78 truncate">{s}</span><span>{n}</span></div>;
                })}
              </div>
            </div>
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Revenue (pipeline)</p>
              <p className="text-4xl font-thin">ZAR {(userState.recentDesigns.filter(d => ['Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'].includes(d.status)).reduce((a, d) => a + (d.priceZAR ?? 0), 0)).toLocaleString()}</p>
              <p className="text-[8px] opacity-55 mt-1">Sum of orders past Quoted</p>
            </div>
          </div>
        )}

        {tab === 'Email' && (
          <EmailFlowsTab
            flows={emailFlows}
            form={flowForm}
            setForm={setFlowForm}
            editingId={editingFlowId}
            setEditingId={setEditingFlowId}
            onSave={async (f) => {
              const now = new Date().toISOString();
              const full: EmailFlow = {
                id: f.id || `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                jewelerId: jewelerEmail || 'default',
                name: f.name || 'Untitled',
                triggerType: (f.triggerType || 'custom') as EmailFlowTriggerType,
                subjectTemplate: f.subjectTemplate || '',
                bodyTemplate: f.bodyTemplate || '',
                followUpDays: f.followUpDays ?? null,
                isActive: f.isActive !== false,
                followUps: Array.isArray(f.followUps) ? f.followUps : [],
                createdAt: (f as EmailFlow).createdAt || now,
                updatedAt: now
              };
              await upsertEmailFlow(full);
              const next = await fetchEmailFlows(jewelerEmail || undefined);
              onEmailFlowsUpdate?.(next);
              setEditingFlowId(null);
              setFlowForm({});
            }}
            onDelete={async (id) => {
              if (!confirm('Delete this email flow?')) return;
              await deleteEmailFlow(id);
              const next = await fetchEmailFlows(jewelerEmail || undefined);
              onEmailFlowsUpdate?.(next);
              if (editingFlowId === id) { setEditingFlowId(null); setFlowForm({}); }
            }}
            onDuplicate={async (flow) => {
              const copy: EmailFlow = { ...flow, id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: `${flow.name} (copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
              await upsertEmailFlow(copy);
              const next = await fetchEmailFlows(jewelerEmail || undefined);
              onEmailFlowsUpdate?.(next);
            }}
            onAddFromTemplate={(t) => {
              const flow = createFlowFromTemplate(t, jewelerEmail || 'default');
              setFlowForm(flow);
              setEditingFlowId(flow.id);
            }}
            templates={DEFAULT_EMAIL_TEMPLATES}
            triggerLabels={EMAIL_FLOW_TRIGGER_LABELS}
            variableHint={VARIABLE_HINT}
          />
        )}

        {tab === 'Calendar' && (
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4 flex items-center gap-2">
                <Calendar size={16} /> Appointments
              </h2>
              <p className="text-[9px] uppercase opacity-68">Who&apos;s booked and what it&apos;s about. Update status or view meeting summary.</p>
              {appointments.length === 0 && <p className="text-[10px] opacity-60 py-8 uppercase tracking-widest">No appointments in the next 3 months.</p>}
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {appointments.map((a) => {
                  const start = new Date(a.startAt);
                  const end = new Date(a.endAt);
                  const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  const timeStr = `${start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
                  return (
                    <div key={a.id} className="glass border border-white/10 rounded-sm p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold">{a.clientName || 'No name'}</p>
                          <p className="text-[9px] opacity-70">{a.clientEmail}</p>
                          <p className="text-[9px] text-emerald-400/90 mt-2 flex items-center gap-1"><Clock size={10} /> {dateStr} · {timeStr}</p>
                          <p className="text-[9px] opacity-80 mt-2 border-l-2 border-white/20 pl-2 italic">&ldquo;{a.summary || '—'}&rdquo;</p>
                        </div>
                        <select
                          value={a.status}
                          onChange={async (e) => {
                            await updateAppointment(a.id, { status: e.target.value as Appointment['status'] });
                            const next = await fetchAppointments(jewelerEmail);
                            setAppointments(next);
                          }}
                          className="bg-black/50 border border-white/10 p-1.5 text-[9px] uppercase tracking-widest"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no_show">No show</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Your availability</h2>
              <p className="text-[9px] uppercase opacity-68">Set recurring weekly windows when clients can book. Times in local time.</p>
              <div className="glass border border-white/10 rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Day</label>
                    <select
                      value={availabilityForm.dayOfWeek ?? 1}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(e.target.value, 10) })}
                      className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest"
                    >
                      {DAY_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">From</label>
                    <input
                      type="time"
                      value={availabilityForm.startTime ?? '09:00'}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">To</label>
                    <input
                      type="time"
                      value={availabilityForm.endTime ?? '17:00'}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const id = `avail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    const slot: JewelerAvailabilitySlot = {
                      id,
                      jewelerId: jewelerEmail || '',
                      dayOfWeek: availabilityForm.dayOfWeek ?? 1,
                      startTime: availabilityForm.startTime ?? '09:00',
                      endTime: availabilityForm.endTime ?? '17:00',
                      updatedAt: new Date().toISOString(),
                    };
                    await upsertJewelerAvailabilitySlot(slot);
                    const next = await fetchJewelerAvailability(jewelerEmail);
                    setAvailability(next);
                  }}
                  className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-gray-200 flex items-center gap-2"
                >
                  <Plus size={12} /> Add slot
                </button>
              </div>
              <div className="space-y-2">
                {availability.length === 0 && <p className="text-[9px] opacity-55">No slots yet. Add when you&apos;re free for appointments.</p>}
                {availability.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-white/5 text-[10px] uppercase tracking-widest">
                    <span>{DAY_NAMES[s.dayOfWeek] ?? s.dayOfWeek} {s.startTime} – {s.endTime}</span>
                    <button type="button" onClick={async () => { await deleteJewelerAvailabilitySlot(s.id); const next = await fetchJewelerAvailability(jewelerEmail); setAvailability(next); }} className="text-red-400/80 hover:text-red-400 text-[9px]"><Trash2 size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Guides' && (
          <div className="space-y-8 max-w-3xl">
            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Digital Vault / Guides</h2>
              <p className="text-[9px] opacity-65">Items shown to clients on the Guides (Digital Vault) page. Add PDF or asset links; clients can download. When you add at least one, only these items are shown (otherwise the default Ring Guide and Wedding Template are shown).</p>
              {(editingGuideId !== null || addingGuide || vaultGuides.length === 0) && (
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Title</label>
                      <input value={guideForm.title ?? ''} onChange={e => setGuideForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="e.g. The Ultimate Ring Buying Dossier" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Description</label>
                      <textarea value={guideForm.description ?? ''} onChange={e => setGuideForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none resize-y" placeholder="Short description for the card" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Download URL</label>
                      <input value={guideForm.downloadUrl ?? ''} onChange={e => setGuideForm(f => ({ ...f, downloadUrl: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="https://... or /path/to/file.pdf" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Suggested filename (optional)</label>
                      <input value={guideForm.suggestedFilename ?? ''} onChange={e => setGuideForm(f => ({ ...f, suggestedFilename: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="e.g. Engagement_Ring_Guide.pdf" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Tags (comma-separated)</label>
                      <input value={Array.isArray(guideForm.tags) ? guideForm.tags.join(', ') : ''} onChange={e => setGuideForm(f => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="PDF, Guide, Planning" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                        <input type="number" min={0} value={guideForm.sortOrder ?? 0} onChange={e => setGuideForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} className="w-16 bg-black/50 border border-white/10 p-1 text-[10px]" />
                        Sort order
                      </label>
                      <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                        <input type="checkbox" checked={guideForm.isActive !== false} onChange={e => setGuideForm(f => ({ ...f, isActive: e.target.checked }))} />
                        Visible to clients
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const jid = jewelerEmail || sessionUser?.email || '';
                        if (!jid || !guideForm.title?.trim() || !guideForm.downloadUrl?.trim()) return;
                        const id = guideForm.id || `vg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                        await upsertVaultGuide({ ...guideForm, id, jewelerId: jid, tags: guideForm.tags ?? [], sortOrder: guideForm.sortOrder ?? 0, isActive: guideForm.isActive !== false });
                        const next = await fetchVaultGuidesAdmin(jewelerEmail);
                        setVaultGuides(next);
                        setEditingGuideId(null);
                        setAddingGuide(false);
                        setGuideForm({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: next.length, isActive: true });
                      }}
                      className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                    >
                      <Save size={14} /> {editingGuideId ? 'Update' : 'Add'} guide
                    </button>
                    {(editingGuideId || addingGuide) && (
                      <button type="button" onClick={() => { setEditingGuideId(null); setAddingGuide(false); setGuideForm({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: vaultGuides.length, isActive: true }); }} className="px-6 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5">Cancel</button>
                    )}
                  </div>
                </div>
              )}
              {vaultGuides.length > 0 && !editingGuideId && !addingGuide && (
                <button type="button" onClick={() => setAddingGuide(true)} className="mt-4 px-4 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5 flex items-center gap-2">
                  <Plus size={12} /> Add another guide
                </button>
              )}
              <div className="border-t border-white/10 pt-6 mt-6 space-y-3">
                {vaultGuides.length === 0 && !editingGuideId && !addingGuide && <p className="text-[9px] opacity-55">No custom guides yet. Add one above to replace the default Ring Guide and Wedding Template on the Guides page.</p>}
                {vaultGuides.map((g) => (
                  <div key={g.id} className="flex justify-between items-start gap-4 py-3 border-b border-white/5">
                    <div>
                      <p className="text-[10px] uppercase font-bold">{g.title}</p>
                      <p className="text-[9px] opacity-65 line-clamp-1">{g.description || g.downloadUrl}</p>
                      <p className="text-[8px] opacity-50 mt-1">{g.tags?.join(', ')} · {g.isActive ? 'Visible' : 'Hidden'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => { setEditingGuideId(g.id); setGuideForm({ ...g }); }} className="p-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5"><Edit3 size={12}/></button>
                      <button type="button" onClick={async () => { if (confirm('Remove this guide?')) { await deleteVaultGuide(g.id); setVaultGuides(await fetchVaultGuidesAdmin(jewelerEmail)); setEditingGuideId(null); } }} className="p-2 border border-red-500/20 text-red-400/80 text-[9px] hover:bg-red-500/10"><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Blog' && (
          <div className="space-y-8 max-w-3xl">
            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Blog posts</h2>
              <p className="text-[9px] opacity-65">Write and publish articles for your clients. Slug is used in the URL (/blog/your-slug). Publish to make visible on the blog.</p>
              {(editingBlogId !== null || addingBlog) && (
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Title</label>
                      <input value={blogForm.title ?? ''} onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Article title" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Slug (URL path)</label>
                      <input value={blogForm.slug ?? ''} onChange={e => setBlogForm(f => ({ ...f, slug: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none font-mono" placeholder="my-article-slug" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Meta description (SEO)</label>
                      <input value={blogForm.metaDescription ?? ''} onChange={e => setBlogForm(f => ({ ...f, metaDescription: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="Short description for search results" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Category</label>
                        <select value={blogForm.category ?? 'Guide'} onChange={e => setBlogForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                          {['Buying', 'Diamonds', 'Metals', 'Care', 'Engagement', 'Guide', 'Stones'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Read time (min)</label>
                        <input type="number" min={1} value={blogForm.readTimeMinutes ?? 5} onChange={e => setBlogForm(f => ({ ...f, readTimeMinutes: parseInt(e.target.value, 10) || 5 }))} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Excerpt</label>
                      <textarea value={blogForm.excerpt ?? ''} onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none resize-y" placeholder="Brief summary for the listing" />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Body (JSON array of blocks)</label>
                      <textarea value={JSON.stringify(Array.isArray(blogForm.body) ? blogForm.body : [], null, 2)} onChange={e => { try { const b = JSON.parse(e.target.value); if (Array.isArray(b)) setBlogForm(f => ({ ...f, body: b })); } catch { /* keep previous */ } }} rows={12} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none font-mono resize-y" placeholder='[{"type":"p","content":"..."},{"type":"h2","content":"Heading"}]' />
                      <p className="text-[8px] opacity-50 mt-1">Types: p, h2, h3, ul (items: []), ol (items: []), cta (to: &quot;RingBuilder&quot;|&quot;Chatbot&quot;|&quot;Resources&quot;, label: &quot;...&quot;)</p>
                    </div>
                    <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                      <input type="checkbox" checked={!!blogForm.publishedAt} onChange={e => setBlogForm(f => ({ ...f, publishedAt: e.target.checked ? new Date().toISOString() : null }))} />
                      Published (visible on blog)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const jid = jewelerEmail || sessionUser?.email || '';
                        if (!jid || !blogForm.title?.trim() || !blogForm.slug?.trim()) return;
                        const id = blogForm.id || `bp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                        await upsertBlogPost({ ...blogForm, id, jewelerId: jid, body: Array.isArray(blogForm.body) ? blogForm.body : [] });
                        setBlogPosts(await fetchBlogPostsAdmin(jewelerEmail));
                        setEditingBlogId(null);
                        setAddingBlog(false);
                        setBlogForm({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] });
                      }}
                      className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                    >
                      <Save size={14} /> {editingBlogId ? 'Update' : 'Publish'} post
                    </button>
                    <button type="button" onClick={() => { setEditingBlogId(null); setAddingBlog(false); setBlogForm({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] }); }} className="px-6 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5">Cancel</button>
                  </div>
                </div>
              )}
              {!editingBlogId && !addingBlog && (
                <button type="button" onClick={() => setAddingBlog(true)} className="mt-4 px-4 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Plus size={12} /> New post
                </button>
              )}
              <div className="border-t border-white/10 pt-6 mt-6 space-y-3">
                {blogPosts.map((p) => (
                  <div key={p.id} className="flex justify-between items-start gap-4 py-3 border-b border-white/5">
                    <div>
                      <p className="text-[10px] uppercase font-bold">{p.title}</p>
                      <p className="text-[9px] opacity-65">/blog/{p.slug} · {p.category} · {p.publishedAt ? 'Published' : 'Draft'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button type="button" onClick={() => { setEditingBlogId(p.id); setBlogForm({ ...p }); }} className="p-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5"><Edit3 size={12}/></button>
                      <button type="button" onClick={async () => { if (confirm('Delete this post?')) { await deleteBlogPost(p.id); setBlogPosts(await fetchBlogPostsAdmin(jewelerEmail)); setEditingBlogId(null); } }} className="p-2 border border-red-500/20 text-red-400/80 text-[9px] hover:bg-red-500/10"><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Settings' && (
          <div className="space-y-10 max-w-2xl">
            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Site logo</h2>
              <p className="text-[9px] opacity-65">Logo used site-wide: navbar, footer, quote PDFs, watermarks, and Guides. Use a direct image URL (e.g. from your site or Supabase Storage). Leave blank to keep the default.</p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrlDraft}
                    onChange={(e) => setLogoUrlDraft(e.target.value)}
                    placeholder="https://… or leave empty for default"
                    className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50"
                  />
                </div>
                <button
                  type="button"
                  disabled={savingLogo}
                  onClick={async () => {
                    const jid = jewelerEmail || sessionUser?.email || '';
                    if (!jid) return;
                    setSavingLogo(true);
                    await upsertJewelerSettings({ jewelerId: jid, logoUrl: logoUrlDraft.trim() || null });
                    await onJewelerSettingsRefresh?.();
                    setSavingLogo(false);
                  }}
                  className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> {savingLogo ? 'Saving…' : 'Save logo'}
                </button>
              </div>
              {logoUrlDraft.trim() && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[8px] uppercase opacity-50">Preview</span>
                  <img src={logoUrlDraft.trim()} alt="Logo preview" className="h-8 object-contain object-left max-w-[120px] bg-white/5 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-8">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Plan & features</h2>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-[9px] uppercase opacity-68 font-bold mb-1">Current plan</p>
                  <p className="text-lg font-bold uppercase tracking-widest">
                    {jewelerSettings?.packageTier ?? 'starter'}
                  </p>
                  <p className="text-[8px] opacity-55 mt-1">
                    {!hasNivodaAccess(jewelerSettings?.packageTier) && 'Upgrade to Growth or Pro to unlock Live Diamond Sourcing.'}
                    {hasNivodaAccess(jewelerSettings?.packageTier) && 'Your plan includes Live Diamond Sourcing (Nivoda).'}
                  </p>
                </div>
              </div>
              <div className="border-t border-current/10 pt-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="opacity-80" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Live Diamond Sourcing</p>
                      <p className="text-[9px] opacity-65">Use Nivoda for real-time stone availability when quoting. Available on Growth and Pro plans.</p>
                    </div>
                  </div>
                  {hasNivodaAccess(jewelerSettings?.packageTier) ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jewelerSettings?.nivodaSourcingEnabled ?? false}
                        onChange={async (e) => {
                          const next = e.target.checked;
                          const jid = jewelerEmail || sessionUser?.email || '';
                          if (!jid) return;
                          await upsertJewelerSettings({ jewelerId: jid, nivodaSourcingEnabled: next });
                          await onJewelerSettingsRefresh?.();
                        }}
                        className="w-4 h-4 rounded border-white/30 bg-black/50 text-emerald-500 focus:ring-emerald-500/50"
                      />
                      <span className="text-[10px] uppercase tracking-widest">On</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2 opacity-60" title="Upgrade to Growth or Pro to unlock">
                      <div className="w-4 h-4 rounded border border-white/30 bg-white/5 cursor-not-allowed" />
                      <span className="text-[10px] uppercase tracking-widest">Locked</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Operational hours</h2>
              <p className="text-[9px] opacity-65">Store hours shown in the footer and used for booking when you have no custom availability. Use 24h format (e.g. 9, 17). Leave both blank for closed.</p>
              <div className="space-y-3">
                {openingHoursDraft.map((row, i) => (
                  <div key={row.day} className="flex flex-wrap items-center gap-4">
                    <span className="w-24 text-[10px] uppercase tracking-widest font-bold">{row.name}</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={row.open ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Math.min(23, Math.max(0, parseInt(e.target.value, 10) ?? 0));
                        setOpeningHoursDraft(prev => prev.map((r, j) => j === i ? { ...r, open: v } : r));
                      }}
                      placeholder="Open"
                      className="w-16 bg-black/50 border border-white/10 p-2 text-[10px] text-center focus:outline-none placeholder:opacity-60"
                    />
                    <span className="text-[9px] opacity-50">–</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={row.close ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? null : Math.min(23, Math.max(0, parseInt(e.target.value, 10) ?? 0));
                        setOpeningHoursDraft(prev => prev.map((r, j) => j === i ? { ...r, close: v } : r));
                      }}
                      placeholder="Close"
                      className="w-16 bg-black/50 border border-white/10 p-2 text-[10px] text-center focus:outline-none placeholder:opacity-60"
                    />
                    <span className="text-[9px] opacity-50">{(row.open ?? row.close) == null ? 'Closed' : `${String(row.open ?? 0).padStart(2, '0')}:00 – ${String(row.close ?? 0).padStart(2, '0')}:00`}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={savingHours}
                onClick={async () => {
                  const jid = jewelerEmail || sessionUser?.email || '';
                  if (!jid) return;
                  setSavingHours(true);
                  await upsertJewelerSettings({ jewelerId: jid, openingHours: openingHoursDraft });
                  await onJewelerSettingsRefresh?.();
                  setSavingHours(false);
                }}
                className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {savingHours ? 'Saving…' : 'Save operational hours'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Catalog' && (
          <CatalogTab
            products={catalogProducts}
            form={catalogForm}
            setForm={setCatalogForm}
            editingId={editingCatalogId}
            setEditingId={setEditingCatalogId}
            onSave={async (p) => {
              const now = new Date().toISOString();
              const full: CatalogProduct = {
                id: p.id || `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                jewelerId: getJewelerEmail() || 'default',
                title: p.title || '',
                description: p.description || '',
                imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
                priceZAR: p.priceZAR ?? 0,
                metal: p.metal,
                type: p.type,
                shape: p.shape,
                carat: p.carat,
                stoneCategory: p.stoneCategory,
                settingStyle: p.settingStyle,
                isActive: p.isActive ?? true,
                createdAt: (p as CatalogProduct).createdAt || now,
                updatedAt: now
              };
              await upsertCatalogProduct(full);
              const list = await fetchCatalogProducts(getJewelerEmail() || undefined);
              onCatalogUpdate?.(list);
              setEditingCatalogId(null);
              setCatalogForm(emptyCatalogForm);
            }}
            onDelete={async (id) => {
              if (!confirm('Remove this product from the catalog?')) return;
              await deleteCatalogProduct(id);
              const list = await fetchCatalogProducts(getJewelerEmail() || undefined);
              onCatalogUpdate?.(list);
              if (editingCatalogId === id) { setEditingCatalogId(null); setCatalogForm(emptyCatalogForm); }
            }}
            onAddNew={() => { setEditingCatalogId('__new__'); setCatalogForm(emptyCatalogForm); }}
          />
        )}
      </div>
    </div>
  );
};

const STONE_CATEGORIES: string[] = ['Diamond', 'Sapphire', 'Emerald', 'Ruby', 'Moissanite', 'Aquamarine', 'Amethyst', 'None', 'Other'];

const CatalogTab: React.FC<{
  products: CatalogProduct[];
  form: Partial<CatalogProduct>;
  setForm: (f: Partial<CatalogProduct>) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSave: (p: Partial<CatalogProduct>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}> = ({ products, form, setForm, editingId, setEditingId, onSave, onDelete, onAddNew }) => {
  const isFormOpen = editingId !== null;
  const isNew = editingId === '__new__';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-[10px] uppercase opacity-68">Inventory products appear in the client Collection. Only active items are shown.</p>
        <button onClick={onAddNew} className="px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 flex items-center gap-2">
          <Plus size={14} /> Add product
        </button>
      </div>

      {isFormOpen && (
        <div className="glass border border-white/10 rounded-sm p-8 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] uppercase tracking-widest font-bold">{isNew ? 'New product' : 'Edit product'}</h3>
            <button onClick={() => { setEditingId(null); setForm(emptyCatalogForm); }} className="p-2 opacity-60 hover:opacity-100"><X size={18}/></button>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[8px] uppercase opacity-68 font-bold block">Title</label>
              <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" placeholder="e.g. Round Solitaire 1ct" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" placeholder="Short description" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Image URLs (one per line)</label>
              <textarea value={(form.imageUrls || []).join('\n')} onChange={e => setForm({ ...form, imageUrls: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} rows={2} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" placeholder="https://..." />
              <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                <input type="checkbox" checked={form.isActive !== false} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active (shown in Collection)
              </label>
            </div>
            <div className="space-y-4">
              <label className="text-[8px] uppercase opacity-68 font-bold block">Price (ZAR)</label>
              <input type="number" value={form.priceZAR ?? ''} onChange={e => setForm({ ...form, priceZAR: parseInt(e.target.value) || 0 })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Type</label>
              <select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                <option value="">—</option>
                {JEWELLERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Metal</label>
              <select value={form.metal || ''} onChange={e => setForm({ ...form, metal: e.target.value as any })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                <option value="">—</option>
                {Object.keys(METAL_DATA).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
              <select value={form.shape || ''} onChange={e => setForm({ ...form, shape: e.target.value as any })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                <option value="">—</option>
                {Object.keys(SHAPE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Stone</label>
              <select value={form.stoneCategory || ''} onChange={e => setForm({ ...form, stoneCategory: e.target.value as any })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                <option value="">—</option>
                {STONE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Setting</label>
              <select value={form.settingStyle || ''} onChange={e => setForm({ ...form, settingStyle: e.target.value as any })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                <option value="">—</option>
                {Object.keys(SETTING_DATA).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="text-[8px] uppercase opacity-68 font-bold block">Carat</label>
              <input type="number" step="0.01" value={form.carat ?? ''} onChange={e => setForm({ ...form, carat: parseFloat(e.target.value) || undefined })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onSave(form)} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
              <Save size={14} /> Save
            </button>
            {!isNew && form.id && (
              <button onClick={() => onDelete(form.id!)} className="px-6 py-2 border border-red-500/50 text-red-400 text-[10px] uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {products.length === 0 && !isFormOpen && <p className="text-center py-12 opacity-60 uppercase tracking-widest text-[10px]">No catalog products yet. Add one to show designs in the client Collection.</p>}
        {products.map(p => (
          <div key={p.id} className="glass border border-white/5 rounded-sm p-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=80'} alt="" className="w-14 h-14 object-cover rounded-sm border border-white/5" />
              <div>
                <h4 className="text-[11px] uppercase tracking-widest font-bold">{p.title || p.id}</h4>
                <p className="text-[9px] opacity-68 truncate max-w-md">{p.description || '—'}</p>
                <p className="text-[9px] opacity-60 mt-1">ZAR {p.priceZAR?.toLocaleString()} {p.type || ''} {p.metal || ''} {p.isActive ? '' : '• Hidden'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingId(p.id); setForm({ ...p }); }} className="p-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center gap-1"><Edit3 size={12}/> Edit</button>
              <button onClick={() => onDelete(p.id)} className="p-2 border border-red-500/20 text-red-400/80 text-[9px] uppercase tracking-widest hover:bg-red-500/10 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabBtn = ({ active, label, onClick, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-4 text-[10px] uppercase tracking-widest border transition-all flex items-center gap-2 ${active ? 'bg-white text-black border-white' : 'border-current/10 opacity-65'}`}>
    {icon} {label}
  </button>
);

export default JewelerPortal;
