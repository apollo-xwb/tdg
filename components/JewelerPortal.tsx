
import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { UserState, JewelleryConfig, OrderStatus, Lead, CatalogProduct, LeadStatus, EmailFlow, EmailFlowTriggerType, JewelerSettings, Appointment, JewelerAvailabilitySlot, OpeningHoursEntry, VaultGuide, BlogPost } from '../types';
import { getJewelerEmail, supabase, signOut, updatePassword, fetchCatalogProducts, upsertCatalogProduct, deleteCatalogProduct, fetchEmailFlows, upsertEmailFlow, deleteEmailFlow, upsertJewelerSettings, fetchAppointments, fetchJewelerAvailability, upsertJewelerAvailabilitySlot, deleteJewelerAvailabilitySlot, updateAppointment, fetchVaultGuidesAdmin, upsertVaultGuide, deleteVaultGuide, fetchBlogPostsAdmin, upsertBlogPost, deleteBlogPost, uploadJewelerAsset } from '../lib/supabase';
import { calculateQuotePrice } from '../lib/quotePrice';
import { notifyClientIfRequested } from '../lib/notifyClient';
import JewelerLogin from './JewelerLogin';
import { Search, Edit3, Trash2, Phone, FileText, Plus, Save, X, Shield, Share2, Video, CreditCard, LayoutGrid, List, Package, BarChart3, Mail, Copy, Settings, Sparkles, Calendar, Clock, BookOpen, FolderOpen, Upload, LogOut, Lock, Box, Home } from 'lucide-react';
import * as XLSX from 'xlsx';
import JewelerCAD from './JewelerCAD';
import { METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS, JEWELLERY_TYPES, OPENING_HOURS, DONTPAYRETAIL } from '../constants';
import { EMAIL_FLOW_TRIGGER_LABELS, DEFAULT_EMAIL_TEMPLATES, VARIABLE_HINT, createFlowFromTemplate } from '../lib/emailFlowTemplates';
import { DAY_NAMES } from '../lib/calendarSlots';
import CustomSelect from './CustomSelect';
import ProductModelViewer from './ProductModelViewer';

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
  /** Optional callback from Operations Hub to reveal the main site navbar again */
  onShowMainNav?: () => void;
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
              <CustomSelect
                options={(Object.entries(triggerLabels) as [EmailFlowTriggerType, string][]).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                value={form.triggerType || 'custom'}
                onChange={v => setForm({ ...form, triggerType: v as EmailFlowTriggerType })}
                theme="dark"
              />
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

const LogoUploadButton: React.FC<{ jewelerId: string; onUpload: (url: string) => void }> = ({ jewelerId, onUpload }) => (
  <label className="px-2 py-1 border border-white/10 text-[8px] uppercase cursor-pointer hover:bg-white/5 flex items-center gap-1 flex-shrink-0">
    <Upload size={10} /> Upload
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f || !jewelerId) return;
        const u = await uploadJewelerAsset(jewelerId, 'logos', f);
        if (u) onUpload(u);
        e.target.value = '';
      }}
    />
  </label>
);

type CadFile = { id: string; name: string; url: string; createdAt: string };

type BulkLeadRowStatus = 'pending' | 'ok' | 'error';

type BulkLeadRow = {
  index: number;
  raw: Record<string, any>;
  name?: string;
  email?: string;
  website?: string;
  company?: string;
  icebreaker?: string;
  status: BulkLeadRowStatus;
};

const CadLibraryPanel: React.FC<{ jewelerId: string; theme: 'dark' | 'light' }> = ({ jewelerId, theme }) => {
  const [files, setFiles] = useState<CadFile[]>(() => {
    try {
      const raw = localStorage.getItem('cad_library');
      return raw ? JSON.parse(raw) as CadFile[] : [];
    } catch {
      return [];
    }
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!jewelerId) return;
    setUploading(true);
    try {
      const url = await uploadJewelerAsset(jewelerId, 'models', file);
      if (!url) return;
      const id = `cad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const name = file.name.replace(/\.[^.]+$/, '');
      const createdAt = new Date().toISOString();
      const next = [{ id, name, url, createdAt }, ...files];
      setFiles(next);
      localStorage.setItem('cad_library', JSON.stringify(next));
    } finally {
      setUploading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <aside className="space-y-4">
      <div className="glass border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold">CAD Library</h3>
            <p className="text-[9px] opacity-68 mt-1">Upload ready-to-cast 3D designs to reuse across quotes.</p>
          </div>
          <span className="text-[9px] opacity-60 uppercase tracking-[0.2em]">{files.length} saved</span>
        </div>
        <label className={`w-full aspect-square rounded-3xl border-dashed border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDark ? 'border-white/20 hover:border-emerald-400/60 hover:bg-white/5' : 'border-slate-300 hover:border-emerald-500/70 hover:bg-emerald-50/40'}`}>
          <Upload size={26} className={isDark ? 'text-emerald-300' : 'text-emerald-600'} />
          <span className="text-[10px] uppercase tracking-[0.25em]">Upload 3D design</span>
          <span className="text-[9px] opacity-60 mt-1 text-center px-4">GLB (recommended) or OBJ. Stored in Supabase + this browser.</span>
          <input
            type="file"
            accept=".glb,.gltf,.obj"
            className="hidden"
            onChange={async e => {
              const f = e.target.files?.[0];
              if (f) await handleUpload(f);
              e.target.value = '';
            }}
            disabled={uploading}
          />
        </label>
        {uploading && <p className="text-[9px] opacity-70">Uploading… keep this tab open.</p>}
        <p className="text-[8px] opacity-55">
          Tip: keep working copies of your GLB files in <code className="font-mono">src/3d</code> for version control, then upload from here to sync them to the cloud.
        </p>
      </div>
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-[9px] uppercase tracking-widest opacity-70">Saved designs</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {files.map(f => (
              <div key={f.id} className="glass border border-white/10 rounded-xl overflow-hidden">
                <div className="aspect-video bg-black/40">
                  <ProductModelViewer src={f.url} alt={f.name} className="w-full h-full" showConfigurator />
                </div>
                <div className="px-3 py-2 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest truncate">{f.name}</p>
                  <p className="text-[9px] opacity-55 truncate">{f.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const JewelerPortal: React.FC<Props> = ({ userState, onUpdate, onLeadsUpdate, catalogProducts = [], onCatalogUpdate, emailFlows = [], onEmailFlowsUpdate, jewelerSettings = null, onJewelerSettingsRefresh, sessionUser = null, onShowMainNav }) => {
  const jewelerEmail = getJewelerEmail();
  const isJeweler = jewelerEmail && sessionUser?.email?.toLowerCase() === jewelerEmail.toLowerCase();
  const showLogin = !!jewelerEmail && !isJeweler;
  const [tab, setTab] = useState<'Board' | 'Orders' | 'Leads' | 'Catalog' | 'NewQuote' | 'CAD' | 'Analytics' | 'Email' | 'Calendar' | 'Settings' | 'Guides' | 'Blog'>('Board');
  const [navOpen, setNavOpen] = useState(false);
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
  const [logoNavbarDraft, setLogoNavbarDraft] = useState('');
  const [logoFooterDraft, setLogoFooterDraft] = useState('');
  const [logoQuotesDraft, setLogoQuotesDraft] = useState('');
  const [logoVaultDraft, setLogoVaultDraft] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [termsDraft, setTermsDraft] = useState('');
  const [savingTerms, setSavingTerms] = useState(false);
  const [addressDraft, setAddressDraft] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [aboutUsDraft, setAboutUsDraft] = useState('');
  const [savingAbout, setSavingAbout] = useState(false);
  const [vaultGuides, setVaultGuides] = useState<VaultGuide[]>([]);
  const [guideForm, setGuideForm] = useState<Partial<VaultGuide>>({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: 0, isActive: true });
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [addingGuide, setAddingGuide] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] });
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [addingBlog, setAddingBlog] = useState(false);

  // AI email icebreaker state
  const [icebreakerUrl, setIcebreakerUrl] = useState('');
  const [icebreakerContent, setIcebreakerContent] = useState('');
  const [icebreakerResult, setIcebreakerResult] = useState('');
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [icebreakerError, setIcebreakerError] = useState<string | null>(null);

  // Bulk lead file → AI icebreakers
  const [bulkLeadRows, setBulkLeadRows] = useState<BulkLeadRow[]>([]);
  const [bulkLeadHeaders, setBulkLeadHeaders] = useState<string[]>([]);
  const [bulkIcebreakerLoading, setBulkIcebreakerLoading] = useState(false);
  const [bulkIcebreakerError, setBulkIcebreakerError] = useState<string | null>(null);

  // Image-based design chat (jeweler-side)
  const [designChatImage, setDesignChatImage] = useState<string | null>(null);
  const [designChatQuestion, setDesignChatQuestion] = useState('');
  const [designChatAnswer, setDesignChatAnswer] = useState('');
  const [designChatSpec, setDesignChatSpec] = useState<any | null>(null);
  const [designChatLoading, setDesignChatLoading] = useState(false);
  const [designChatError, setDesignChatError] = useState<string | null>(null);

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

  const [pieceBaseByTypeDraft, setPieceBaseByTypeDraft] = useState<Record<string, string>>({});
  const [pricingMarginDraft, setPricingMarginDraft] = useState('');
  const PIECE_BASE_TYPES = ['Engagement Ring', 'Earrings', 'Necklace', 'Bracelet', 'Wedding Band', 'Pendant', 'Ring', 'Other'] as const;
  const [savingPricing, setSavingPricing] = useState(false);
  const [googleReviewUrlDraft, setGoogleReviewUrlDraft] = useState('');
  const [savingGoogleReview, setSavingGoogleReview] = useState(false);
  const [generatingPaystackId, setGeneratingPaystackId] = useState<string | null>(null);
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const bulkTableColumns: string[] = bulkLeadHeaders.length
    ? bulkLeadHeaders
    : Array.from(new Set(bulkLeadRows.flatMap(r => Object.keys(r.raw))));

  useEffect(() => {
    if (tab === 'Settings') {
      const from = jewelerSettings?.openingHours ?? OPENING_HOURS;
      const merged = OPENING_HOURS.map(d => from.find(f => f.day === d.day) ?? { ...d });
      setOpeningHoursDraft(merged);
      setLogoUrlDraft(jewelerSettings?.logoUrl ?? '');
      setLogoNavbarDraft(jewelerSettings?.logoNavbar ?? '');
      setLogoFooterDraft(jewelerSettings?.logoFooter ?? '');
      setLogoQuotesDraft(jewelerSettings?.logoQuotes ?? '');
      setLogoVaultDraft(jewelerSettings?.logoVault ?? '');
      setTermsDraft(jewelerSettings?.termsAndConditions ?? '');
      setAddressDraft(jewelerSettings?.address ?? '');
      setAboutUsDraft(jewelerSettings?.aboutUs ?? '');
      const pr = jewelerSettings?.pricingRules;
      setPieceBaseByTypeDraft(
        (['Engagement Ring', 'Earrings', 'Necklace', 'Bracelet', 'Wedding Band', 'Pendant', 'Ring', 'Other'] as const).reduce(
          (acc, t) => ({ ...acc, [t]: (pr?.pieceBaseByType?.[t] != null ? String(pr.pieceBaseByType[t]) : '') }),
          {} as Record<string, string>
        )
      );
      setPricingMarginDraft(pr?.defaultMarginPercent != null ? String(pr.defaultMarginPercent) : '');
      setGoogleReviewUrlDraft(jewelerSettings?.googleReviewUrl ?? '');
    }
  }, [tab, jewelerSettings?.openingHours, jewelerSettings?.logoUrl, jewelerSettings?.logoNavbar, jewelerSettings?.logoFooter, jewelerSettings?.logoQuotes, jewelerSettings?.logoVault, jewelerSettings?.termsAndConditions, jewelerSettings?.address, jewelerSettings?.aboutUs, jewelerSettings?.pricingRules, jewelerSettings?.googleReviewUrl]);

  useEffect(() => {
    if (tab === 'Guides' && jewelerEmail) fetchVaultGuidesAdmin(jewelerEmail).then(setVaultGuides);
  }, [tab, jewelerEmail]);

  const handleGenerateIcebreaker = async () => {
    setIcebreakerError(null);
    if (!icebreakerUrl.trim() && !icebreakerContent.trim()) {
      setIcebreakerError('Add a website URL or paste some text first.');
      return;
    }
    if (!process.env.API_KEY) {
      setIcebreakerError('Missing Gemini API key. Please configure API_KEY in your environment.');
      return;
    }
    setIcebreakerLoading(true);
    try {
      let content = icebreakerContent.trim();

      // Try to fetch website content if URL is provided and no manual content yet
      if (!content && icebreakerUrl.trim()) {
        try {
          const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(icebreakerUrl.trim())}`;
          const res = await fetch(proxied);
          const html = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          ['script', 'style', 'noscript', 'iframe', 'footer', 'header'].forEach(sel => {
            doc.querySelectorAll(sel).forEach(el => el.remove());
          });
          const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
          content = text.slice(0, 4000);
          setIcebreakerContent(content);
        } catch (e) {
          console.error('Failed to fetch website content', e);
        }
      }

      if (!content) {
        setIcebreakerError('Could not fetch any readable content from that URL.');
        return;
      }

      const prompt = `
You are helping me write personalized cold emails to independent jewelry store owners. 
I will give you the visible text content from their website.

Analyze the content and extract:
- Main focus / specialty (e.g., custom engagement rings, lab-grown diamonds, vintage pieces, ethnic designs, bridal only, etc.)
- Any unique details (e.g., specific styles, handcrafted, sustainable sourcing, location, family-owned details)
- Implied pain points (e.g., heavy emphasis on bespoke/custom work, lots of product variations, diamond education)
- 2–4 very specific, natural-sounding sentences or phrases I can use in a cold email to show I actually looked at their site 
  (keep them warm, helpful, and non-salesy – like something a fellow jeweler would notice)

Output ONLY this bullet list format – nothing else:

- Specialty: ...
- Unique details: ...
- Implied pain points: ...
- Personalization phrases:
  - Phrase one
  - Phrase two
  - etc.

Website content:
${content}
      `.trim();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const text = (response as any).text?.trim?.() || (response as any).candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';
      setIcebreakerResult(text || 'No response generated.');
    } catch (e) {
      console.error('Gemini error while generating icebreaker', e);
      setIcebreakerError('Something went wrong while generating the icebreaker. Please try again.');
    } finally {
      setIcebreakerLoading(false);
    }
  };

  const extractLeadFields = (raw: Record<string, any>): Omit<BulkLeadRow, 'index' | 'raw' | 'icebreaker'> => {
    const entries = Object.entries(raw);
    let name: string | undefined;
    let email: string | undefined;
    let website: string | undefined;
    let company: string | undefined;
    for (const [key, value] of entries) {
      const v = String(value ?? '').trim();
      const k = key.toLowerCase();
      if (!name && (k === 'name' || k.includes('full name') || (k.includes('contact') && k.includes('name')))) name = v;
      if (!email && k.includes('email')) email = v;
      if (!website && (k.includes('website') || k === 'url' || k.includes('domain'))) website = v;
      if (!company && (k.includes('company') || k.includes('store') || k.includes('business') || k.includes('shop'))) company = v;
    }
    return { name, email, website, company };
  };

  const handleBulkLeadFileSelected = async (file: File) => {
    setBulkIcebreakerError(null);
    try {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      let rows: Record<string, any>[] = [];
      if (ext === 'csv') {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length);
        if (!lines.length) throw new Error('Empty CSV file.');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        rows = lines.slice(1).map(line => {
          const cols = line.split(',');
          const obj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            const cell = (cols[idx] ?? '').trim().replace(/^"|"$/g, '');
            obj[h] = cell;
          });
          return obj;
        });
        setBulkLeadHeaders(headers);
      } else if (ext === 'json') {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('JSON must be an array of objects.');
        rows = parsed as Record<string, any>[];
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
        setBulkLeadHeaders(headers);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        rows = json;
        const headers = Array.from(new Set(json.flatMap(r => Object.keys(r))));
        setBulkLeadHeaders(headers);
      } else {
        throw new Error('Unsupported file type. Use CSV, JSON, or Excel.');
      }

      const withFields: BulkLeadRow[] = rows.map((raw, index) => {
        const fields = extractLeadFields(raw);
        return { index, raw, ...fields, icebreaker: '', status: 'pending' };
      });
      setBulkLeadRows(withFields);
    } catch (e: any) {
      console.error('Bulk lead file parse error', e);
      setBulkLeadRows([]);
      setBulkLeadHeaders([]);
      setBulkIcebreakerError(e?.message || 'Could not parse file. Use CSV, JSON, or Excel with simple column headers.');
    }
  };

  const handleGenerateBulkIcebreakers = async () => {
    setBulkIcebreakerError(null);
    if (!bulkLeadRows.length) {
      setBulkIcebreakerError('Upload a leads file first.');
      return;
    }
    if (!process.env.API_KEY) {
      setBulkIcebreakerError('Missing Gemini API key. Please configure API_KEY in your environment.');
      return;
    }
    setBulkIcebreakerLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      for (const row of bulkLeadRows) {
        // Skip rows that already have a successful icebreaker
        if (row.status === 'ok' && row.icebreaker && row.icebreaker.trim()) {
          continue;
        }
        try {
          const prompt = `
You are writing casual, warm cold-email openers for a SaaS tool aimed at independent jewellers.

You will get one business at a time as a JSON row from my CRM (name, store, website, location, notes, etc.).

For this business, generate ONE icebreaker opener using this structure and tone:

Hey {firstName},

Love that {businessName} has been {specific fact from description, e.g. family-owned for 75 years / specializing in lab-grown diamonds / doing custom CAD designs} — also a fan of how you {another specific detail, e.g. focus on ethical sourcing / offer in-house repairs / build client trust with GIA certs}.

I hope you’ll forgive me, but I creeped your site quite a bit, and it’s clear that {implied core value, e.g. making every piece meaningful / keeping things honest and personal / putting craftsmanship first} really matters to you guys (or at least that’s the vibe from your emphasis on {fourth detail, e.g. bespoke work / family legacy / conflict-free stones}).

Then add a 1-sentence teaser about the tool: something like "I built a simple AI tool to handle the repetitive stuff (inventory, custom orders, client notes) so you can focus on the jewellery and people — cheap to run and seems to fit independents like you."

Keep it 4–7 sentences max, friendly, slightly self-deprecating, no hard sell.

Business data (JSON):
${JSON.stringify(row.raw, null, 2)}

If the row contains separate fields for first name and company, use them. Otherwise, make a best guess from whatever is available (name, company, website, etc.).

Output ONLY the full opener text for this one business. No numbering, no labels, no extra commentary.
          `.trim();
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          });
          const text = (response as any).text?.trim?.() || (response as any).candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || '';
          const ice = text || '';
          // Update this row in place so the table populates in real time
          setBulkLeadRows(prev => {
            const next = [...prev];
            const idx = next.findIndex(r => r.index === row.index);
            if (idx !== -1) {
              next[idx] = { ...next[idx], icebreaker: ice, status: ice ? 'ok' as BulkLeadRowStatus : 'error' };
            }
            return next;
          });
        } catch (inner) {
          console.error('Bulk icebreaker error for row', row.index, inner);
          setBulkLeadRows(prev => {
            const next = [...prev];
            const idx = next.findIndex(r => r.index === row.index);
            if (idx !== -1) {
              next[idx] = { ...next[idx], icebreaker: '', status: 'error' };
            }
            return next;
          });
        }
      }
    } catch (e) {
      console.error('Gemini bulk icebreaker error', e);
      setBulkIcebreakerError('Something went wrong while generating bulk icebreakers. Please try again.');
    } finally {
      setBulkIcebreakerLoading(false);
    }
  };

  const handleDownloadBulkCsv = () => {
    if (!bulkLeadRows.length) return;
    const headers = bulkLeadHeaders.length
      ? bulkLeadHeaders
      : Array.from(new Set(bulkLeadRows.flatMap(r => Object.keys(r.raw))));
    const allHeaders = [...headers, 'Icebreaker'];
    const escapeCell = (v: any) => {
      const s = String(v ?? '');
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines: string[] = [];
    lines.push(allHeaders.map(h => escapeCell(h)).join(','));
    bulkLeadRows.forEach(row => {
      const base = headers.map(h => escapeCell(row.raw[h]));
      base.push(escapeCell(row.icebreaker ?? ''));
      lines.push(base.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-icebreakers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDesignImageChat = async () => {
    setDesignChatError(null);
    if (!designChatImage) {
      setDesignChatError('Upload or drop a reference image first.');
      return;
    }
    if (!designChatQuestion.trim()) {
      setDesignChatError('Ask a question or describe the requested changes.');
      return;
    }
    if (!process.env.API_KEY) {
      setDesignChatError('Missing Gemini API key. Please configure API_KEY in your environment.');
      return;
    }
    setDesignChatLoading(true);
    try {
      setDesignChatSpec(null);
      let mimeType: string | undefined;
      let data: string | undefined;

      if (designChatImage.startsWith('data:')) {
        const m = designChatImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (m) {
          mimeType = m[1];
          data = m[2];
        }
      }

      const baseInstruction = `
You are acting as an expert jeweler and CAD designer advising another jeweler.

They have uploaded a client reference ring image and are asking how to adapt it
for a custom piece (for example: "this ring but in rose gold with diamonds on the side").

Your goal is to help them build a clear spec for a quote in our system.

Based on the image and their question:
- Describe the current design (metal colour, stone shape, setting, band, side stones) in 2–3 short sentences.
- Explain clearly what changes would be required to match the request.
- Suggest a concrete spec summary they can paste into a quote.

VERY IMPORTANT – OUTPUT FORMAT:
- Return ONLY a single JSON object (no prose, no markdown).
- The JSON must have this exact shape:
{
  "description": "short natural language description of the current design",
  "adjustments": "short natural language explanation of how to change it per the request",
  "spec": {
    "metal": "Platinum | Yellow Gold | White Gold | Rose Gold | 18K Gold | 14K Gold | Sterling Silver | Other",
    "stoneType": "Natural | Lab | Moissanite | N/A",
    "stoneCategory": "Diamond | Sapphire | Emerald | Ruby | Moissanite | Aquamarine | Amethyst | None | Other",
    "shape": "Round | Princess | Oval | Cushion | Emerald | Pear | Marquise | Heart | Asscher | Radiant | N/A",
    "settingStyle": "Solitaire | Halo | Pave | Trilogy | Emerald Accents | Sapphire Accents",
    "carat": number | null,
    "caratMin": number | null,
    "caratMax": number | null,
    "notes": "any extra production notes or caveats"
  },
  "followUps": ["question one", "question two"]
}

- If you need more information from the jeweler (for example metal choice, carat range, budget, side stone preferences),
  include up to 3 short follow-up questions in the followUps array. If you don't need anything else, use [].
- If you are unsure of a field, use null for numbers and a best-effort guess from the allowed strings for enums.
- Do NOT include any keys other than description, adjustments, spec and followUps.
- Do NOT mention AI or models anywhere.
      `.trim();

      const parts: any[] = [
        { text: `${baseInstruction}\n\nJeweler question: ${designChatQuestion}` }
      ];
      if (mimeType && data) {
        parts.push({ inlineData: { data, mimeType } });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }],
        config: { responseMimeType: 'application/json' }
      });

      const raw = (response as any).text?.trim?.() || '';
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        console.warn('Failed to parse design chat JSON, falling back to raw text');
      }

      if (parsed && parsed.spec) {
        setDesignChatSpec(parsed);
        const prettyParts: string[] = [
          parsed.description,
          '',
          parsed.adjustments,
          '',
          'Spec:',
          JSON.stringify(parsed.spec, null, 2)
        ];
        if (Array.isArray(parsed.followUps) && parsed.followUps.length) {
          prettyParts.push('');
          prettyParts.push('Follow-up questions:');
          parsed.followUps.forEach((q: string) => {
            if (q) prettyParts.push(`- ${q}`);
          });
        }
        const pretty = prettyParts.filter(Boolean).join('\n');
        setDesignChatAnswer(pretty);
      } else {
        const fallbackText = raw || 'No response generated.';
        setDesignChatAnswer(fallbackText);
      }
    } catch (e) {
      console.error('Gemini error while generating design chat', e);
      setDesignChatError('Something went wrong while analysing the image. Please try again.');
    } finally {
      setDesignChatLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'Blog' && jewelerEmail) fetchBlogPostsAdmin(jewelerEmail).then(setBlogPosts);
  }, [tab, jewelerEmail]);

  const [newQuote, setNewQuote] = useState<Partial<JewelleryConfig>>({
    id: `TDG-M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    type: 'Engagement Ring', stoneType: 'Natural', metal: 'Platinum', shape: 'Round', carat: 1.0, qualityTier: 'Balance Size & Quality', settingStyle: 'Solitaire', stoneCategory: 'Diamond', status: 'Quoted', isApproved: false, date: new Date().toLocaleDateString(), budget: 0, engraving: ''
  });
  const effectiveMarginPercent = newQuote.marginPercent ?? jewelerSettings?.pricingRules?.defaultMarginPercent ?? defaultMarginPercent;
  const computedQuotePrice = calculateQuotePrice(newQuote, 1 + effectiveMarginPercent / 100, jewelerSettings?.pricingRules ?? undefined);

  const applyDesignChatSpecToQuote = () => {
    if (!designChatSpec || !designChatSpec.spec) return;
    const s = designChatSpec.spec;
    setNewQuote(prev => {
      const next: Partial<JewelleryConfig> = { ...prev };
      if (s.metal) next.metal = s.metal as any;
      if (s.stoneType) next.stoneType = s.stoneType as any;
      if (s.stoneCategory) next.stoneCategory = s.stoneCategory as any;
      if (s.shape) next.shape = s.shape as any;
      if (s.settingStyle) next.settingStyle = s.settingStyle as any;
      if (typeof s.carat === 'number' && s.carat > 0) {
        next.carat = s.carat;
      } else if ((typeof s.caratMin === 'number' && s.caratMin > 0) || (typeof s.caratMax === 'number' && s.caratMax > 0)) {
        const min = typeof s.caratMin === 'number' && s.caratMin > 0 ? s.caratMin : s.caratMax;
        const max = typeof s.caratMax === 'number' && s.caratMax > 0 ? s.caratMax : s.caratMin;
        if (min && max) next.carat = (min + max) / 2;
        else next.carat = (min || max) || next.carat;
      }
      if (s.notes) {
        const existing = next.designDescription || '';
        next.designDescription = existing ? `${existing}\n\nAI spec notes: ${s.notes}` : `AI spec notes: ${s.notes}`;
      }
      if (designChatSpec.description || designChatSpec.adjustments) {
        const summary = `${designChatSpec.description || ''}\n\n${designChatSpec.adjustments || ''}`.trim();
        if (summary) {
          const existing = next.designDescription || '';
          next.designDescription = existing ? `${existing}\n\nSummary: ${summary}` : `Summary: ${summary}`;
        }
      }
      return next;
    });
  };

  const handleUpdate = (id: string, updates: Partial<JewelleryConfig>) => {
    const next = userState.recentDesigns.map(d => d.id === id ? { ...d, ...updates } : d);
    onUpdate(next);
  };

  const handleMoveCard = (designId: string, newStatus: OrderStatus) => {
    const design = userState.recentDesigns.find(d => d.id === designId);
    const now = new Date().toISOString();
    const next = userState.recentDesigns.map(d =>
      d.id === designId
        ? { ...d, status: newStatus, statusUpdatedAt: now, milestoneDates: { ...(d.milestoneDates ?? {}), [newStatus]: now } }
        : d
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

  const isDarkTheme = userState.theme === 'dark';

  const TAB_ITEMS: { id: typeof tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'Board', label: 'Production Board', icon: <LayoutGrid size={28} strokeWidth={1.5} /> },
    { id: 'Orders', label: 'Orders', icon: <List size={28} strokeWidth={1.5} />, count: userState.recentDesigns.length },
    { id: 'Leads', label: 'Leads', icon: <FileText size={28} strokeWidth={1.5} />, count: userState.leads.length },
    { id: 'Catalog', label: 'Catalog', icon: <Package size={28} strokeWidth={1.5} />, count: catalogProducts.length },
    { id: 'NewQuote', label: 'Manual Quote', icon: <Plus size={28} strokeWidth={1.5} /> },
    { id: 'CAD', label: 'Ring CAD', icon: <Box size={28} strokeWidth={1.5} /> },
    { id: 'Analytics', label: 'Analytics', icon: <BarChart3 size={28} strokeWidth={1.5} /> },
    { id: 'Email', label: 'Email', icon: <Mail size={28} strokeWidth={1.5} />, count: emailFlows.length },
    { id: 'Calendar', label: 'Calendar', icon: <Calendar size={28} strokeWidth={1.5} />, count: appointments.filter(a => a.status === 'scheduled').length },
    { id: 'Settings', label: 'Settings', icon: <Settings size={28} strokeWidth={1.5} /> },
    { id: 'Guides', label: 'Guides', icon: <FolderOpen size={28} strokeWidth={1.5} />, count: vaultGuides.length },
    { id: 'Blog', label: 'Blog', icon: <BookOpen size={28} strokeWidth={1.5} />, count: blogPosts.length },
  ];

  const handleTabClick = (id: typeof tab) => {
    if (id === 'Catalog') { setTab('Catalog'); setEditingCatalogId(null); setCatalogForm(emptyCatalogForm); }
    else if (id === 'Email') { setTab('Email'); setEditingFlowId(null); setFlowForm({}); }
    else if (id === 'Guides') { setTab('Guides'); setEditingGuideId(null); setAddingGuide(false); setGuideForm({ title: '', description: '', downloadUrl: '', suggestedFilename: '', tags: [], sortOrder: vaultGuides.length, isActive: true }); }
    else if (id === 'Blog') { setTab('Blog'); setEditingBlogId(null); setAddingBlog(false); setBlogForm({ title: '', slug: '', metaDescription: '', category: 'Guide', excerpt: '', readTimeMinutes: 5, body: [] }); }
    else setTab(id);
    setNavOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-16 animate-fadeIn relative">
      {/* Slide-out Operations nav panel */}
      {navOpen && (
        <div className={`fixed inset-y-4 left-4 z-40 w-72 rounded-2xl border ${isDarkTheme ? 'bg-black/95 border-white/10 text-white' : 'bg-white shadow-xl border-slate-200 text-slate-900'} flex flex-col`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-60">Operations</p>
              <p className="text-[11px] font-semibold tracking-wide">Hub navigation</p>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>
          </div>
          <nav aria-label="Operations" className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {TAB_ITEMS.map(({ id, label, icon, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabClick(id)}
                className={[
                  'w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] font-medium transition-all',
                  isDarkTheme
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200',
                  tab === id
                    ? (isDarkTheme ? 'ring-2 ring-emerald-400/60' : 'ring-2 ring-emerald-500/70')
                    : ''
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={
                      tab === id
                        ? (isDarkTheme ? 'text-emerald-300' : 'text-emerald-600')
                        : (isDarkTheme ? 'text-white/80' : 'text-slate-700')
                    }
                  >
                    {icon}
                  </span>
                  <span className={tab === id ? '' : isDarkTheme ? 'opacity-80' : 'opacity-90'}>{label}</span>
                </span>
                {count != null && count > 0 && (
                  <span className="text-[9px] opacity-60">({count})</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      <header className="flex flex-col gap-8 border-b border-current/10 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Jeweller Command Centre</p>
            <h1 className="text-5xl font-thin tracking-tighter uppercase">Operations Hub</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onShowMainNav && (
              <button
                type="button"
                onClick={onShowMainNav}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                title="Show top navigation"
              >
                <Home size={14} /> Show site nav
              </button>
            )}
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-[9px] uppercase tracking-widest opacity-80 hover:opacity-100 hover:bg-white/5 transition-all"
            >
              <LayoutGrid size={14} /> Hub menu
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 text-[9px] uppercase tracking-widest opacity-70 hover:opacity-100 hover:bg-white/5 transition-all"
              title="Sign out"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {tab !== 'NewQuote' && tab !== 'Catalog' && tab !== 'CAD' && tab !== 'Analytics' && tab !== 'Email' && tab !== 'Settings' && tab !== 'Calendar' && tab !== 'Guides' && tab !== 'Blog' && (
        <div className="flex gap-4">
          <Search className="opacity-50 mt-3" size={18} />
          <input type="text" placeholder="Search by Ref, Client Name, or Email..." className="bg-transparent border-b border-current/20 w-full py-4 text-sm focus:outline-none placeholder:opacity-60" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}

      <div className="space-y-6">
        {tab === 'Board' && (
          <>
            {/* Dashboard summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-70">Total orders</span>
                <span className="text-2xl font-light">{userState.recentDesigns.length}</span>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-70">New leads</span>
                <span className="text-2xl font-light">{userState.leads.filter(l => l.status === 'New').length}</span>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-70">In production</span>
                <span className="text-2xl font-light">{userState.recentDesigns.filter(d => ['Sourcing Stone', 'In Production', 'Final Polish'].includes(d.status)).length}</span>
              </div>
              <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-70">Ready / Collected</span>
                <span className="text-2xl font-light">{userState.recentDesigns.filter(d => ['Ready', 'Collected'].includes(d.status)).length}</span>
              </div>
            </div>
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          {design.catalogProductId && <span className="inline-block text-[7px] bg-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded">Pre-config</span>}
                          {design.isApproved && <span className="inline-block text-[7px] bg-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">Approved</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
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
                           <CustomSelect
                             options={Object.keys(METAL_DATA).map(m => ({ value: m, label: m }))}
                             value={design.metal || ''}
                             onChange={v => handleUpdate(design.id, { metal: v as any })}
                             theme={isDarkTheme ? 'dark' : 'light'}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
                           <CustomSelect
                             options={Object.keys(SHAPE_DATA).map(s => ({ value: s, label: s }))}
                             value={design.shape || ''}
                             onChange={v => handleUpdate(design.id, { shape: v as any })}
                             theme={isDarkTheme ? 'dark' : 'light'}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Quality Tier</label>
                           <CustomSelect
                             options={Object.keys(QUALITY_TIERS).map(q => ({ value: q, label: q }))}
                             value={design.qualityTier || ''}
                             onChange={v => handleUpdate(design.id, { qualityTier: v as any })}
                             theme={isDarkTheme ? 'dark' : 'light'}
                           />
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
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Cost (ZAR) — optional</label>
                           <input type="number" value={design.costZAR ?? ''} onChange={e => handleUpdate(design.id, { costZAR: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })} placeholder="COGS" className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-68 font-bold block">Margin % — optional</label>
                           <input type="number" min={0} max={200} value={design.marginPercent ?? ''} onChange={e => handleUpdate(design.id, { marginPercent: e.target.value === '' ? undefined : parseInt(e.target.value, 10) ?? 0 })} placeholder="Override" className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50" />
                        </div>
                     </div>
                        <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-68 font-bold">Status & Links</p>
                        <CustomSelect
                          options={STATUS_FLOW.map(s => ({ value: s, label: s }))}
                          value={design.status}
                          onChange={v => {
                            const s = v as OrderStatus;
                            const now = new Date().toISOString();
                            handleUpdate(design.id, { status: s, statusUpdatedAt: now, milestoneDates: { ...(design.milestoneDates ?? {}), [s]: now } });
                            if (design.notifyClientOnStatusChange) notifyClientIfRequested(design, s);
                          }}
                          theme={isDarkTheme ? 'dark' : 'light'}
                        />
                        <div className="mt-4 space-y-2">
                          <p className="text-[8px] uppercase opacity-68 font-bold">Milestone dates (optional)</p>
                          {(['Deposit Paid', 'Sourcing Stone', 'In Production', 'Ready', 'Collected'] as const).map(s => (
                            <div key={s} className="flex items-center gap-2">
                              <span className="w-28 text-[9px] opacity-78 truncate">{s}</span>
                              <input type="date" value={(design.milestoneDates?.[s] ?? '').slice(0, 10)} onChange={e => { const raw = e.target.value; const next = { ...(design.milestoneDates ?? {}) }; if (raw) next[s] = `${raw}T12:00:00.000Z`; else delete next[s]; handleUpdate(design.id, { milestoneDates: next }); }} className="flex-1 max-w-[140px] bg-black/50 border border-white/10 p-1.5 text-[9px] focus:outline-none" />
                            </div>
                          ))}
                        </div>
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
                           <div className="flex flex-wrap items-center gap-2">
                             <input 
                                type="text" 
                                value={design.paymentLink || ''} 
                                onChange={e => handleUpdate(design.id, {paymentLink: e.target.value})}
                                placeholder="https://... or generate below"
                                className="flex-1 min-w-[200px] bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                             />
                             <button
                               type="button"
                               disabled={!design.email?.trim() || !(design.priceZAR && design.priceZAR > 0) || generatingPaystackId === design.id}
                               onClick={async () => {
                                 if (!supabase || !design.email?.trim() || !(design.priceZAR && design.priceZAR > 0)) return;
                                 setGeneratingPaystackId(design.id);
                                 try {
                                   const { data, error } = await supabase.functions.invoke('create-paystack-link', {
                                     body: {
                                       design_id: design.id,
                                       amount_zar: Math.round((design.priceZAR || 0) * 0.5),
                                       email: design.email.trim(),
                                       callback_url: `${window.location.origin}${window.location.pathname}`
                                     }
                                   });
                                   if (error) throw error;
                                   const url = (data as { url?: string })?.url;
                                   if (url) handleUpdate(design.id, { paymentLink: url });
                                   else alert('No link returned. Configure PAYSTACK_SECRET_KEY in Edge Function secrets.');
                                 } catch (e) {
                                   console.warn(e);
                                   alert('Failed to create Paystack link. Check Edge Function and secrets.');
                                 } finally {
                                   setGeneratingPaystackId(null);
                                 }
                               }}
                               className="px-3 py-2 border border-emerald-500/40 text-emerald-400 text-[9px] uppercase tracking-widest hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               {generatingPaystackId === design.id ? '…' : 'Paystack 50%'}
                             </button>
                           </div>
                           <p className="text-[7px] opacity-55">Required for approval. Use Paystack for real payments; webhook will set status to Deposit Paid.</p>
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
           <div className="mt-2 max-w-xs">
             <CustomSelect
               options={LEAD_STATUSES.map(s => ({ value: s, label: s }))}
               value={lead.status}
               onChange={v => handleLeadStatusChange(lead, v as LeadStatus)}
               theme={isDarkTheme ? 'dark' : 'light'}
               compact
             />
           </div>
            </div>
            <button onClick={() => handleInitiatePipeline(lead)} disabled={!!lead.linkedDesignId} className="px-8 py-3 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {lead.linkedDesignId ? 'Pipeline started' : 'Initiate Pipeline'}
            </button>
          </div>
        ))}

        {tab === 'CAD' && (
          <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-8 items-start">
            <JewelerCAD
              jewelerName={sessionUser?.user_metadata?.full_name ?? sessionUser?.email?.split('@')[0] ?? 'Jeweler'}
              theme={userState.theme}
            />
            <CadLibraryPanel jewelerId={jewelerEmail || sessionUser?.email || ''} theme={userState.theme} />
          </div>
        )}

        {tab === 'NewQuote' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="glass border border-white/10 rounded-sm p-8 space-y-8">
              <h3 className="text-[11px] uppercase tracking-widest font-bold">Quote from specs</h3>
              <p className="text-[10px] opacity-68">Set specs and default margin. Price is calculated from your formula and margin.</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                <label className="text-[8px] uppercase opacity-68 font-bold block">Margin % (uses Settings default when saved)</label>
                <input type="number" min={0} max={200} value={effectiveMarginPercent} onChange={e => { const v = parseInt(e.target.value) || 0; setDefaultMarginPercent(v); localStorage.setItem('jeweler_margin_pct', String(v)); }} className="w-24 bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Type</label>
                <CustomSelect
                  options={JEWELLERY_TYPES.map(t => ({ value: t, label: t }))}
                  value={newQuote.type || 'Engagement Ring'}
                  onChange={v => setNewQuote(q => ({ ...q, type: v as any }))}
                  theme={userState.theme}
                />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Metal</label>
                <CustomSelect
                  options={Object.keys(METAL_DATA).map(m => ({ value: m, label: m }))}
                  value={newQuote.metal || 'Platinum'}
                  onChange={v => setNewQuote(q => ({ ...q, metal: v as any }))}
                  theme={userState.theme}
                />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
                <CustomSelect
                  options={Object.keys(SHAPE_DATA).map(s => ({ value: s, label: s }))}
                  value={newQuote.shape || 'Round'}
                  onChange={v => setNewQuote(q => ({ ...q, shape: v as any }))}
                  theme={userState.theme}
                />
                <label className="text-[8px] uppercase opacity-68 font-bold block">Stone</label>
                <CustomSelect
                  options={[
                    { value: 'Diamond', label: 'Diamond' },
                    { value: 'Moissanite', label: 'Moissanite' },
                    { value: 'None', label: 'None' },
                    { value: 'Sapphire', label: 'Sapphire' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={newQuote.stoneCategory || 'Diamond'}
                  onChange={v => setNewQuote(q => ({ ...q, stoneCategory: v as any }))}
                  theme={userState.theme}
                />
                {(newQuote.stoneCategory === 'Diamond' || newQuote.stoneCategory === 'Moissanite') && (
                  <>
                    <label className="text-[8px] uppercase opacity-68 font-bold block">Stone type</label>
                    <CustomSelect
                      options={[
                        { value: 'Natural', label: 'Natural' },
                        { value: 'Lab', label: 'Lab' },
                      ]}
                      value={newQuote.stoneType || 'Natural'}
                      onChange={v => setNewQuote(q => ({ ...q, stoneType: v as any }))}
                      theme={userState.theme}
                    />
                  </>
                )}
                <label className="text-[8px] uppercase opacity-68 font-bold block">Quality tier</label>
                <CustomSelect
                  options={Object.keys(QUALITY_TIERS).map(q => ({ value: q, label: q }))}
                  value={newQuote.qualityTier || 'Balance Size & Quality'}
                  onChange={v => setNewQuote(q => ({ ...q, qualityTier: v as any }))}
                  theme={userState.theme}
                />
                {newQuote.type !== 'Loose Stone' && (
                  <>
                    <label className="text-[8px] uppercase opacity-68 font-bold block">Setting</label>
                    <CustomSelect
                      options={Object.keys(SETTING_DATA).map(s => ({ value: s, label: s }))}
                      value={newQuote.settingStyle || 'Solitaire'}
                      onChange={v => setNewQuote(q => ({ ...q, settingStyle: v as any }))}
                      theme={userState.theme}
                    />
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
                  <p className="text-[9px] uppercase opacity-68 font-bold">Calculated price (incl. {effectiveMarginPercent}% margin)</p>
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

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                <Sparkles size={14} /> AI Design Assistant (Image Chat)
              </h3>
              <p className="text-[10px] opacity-68">
                Drop a client&apos;s reference ring image and chat through changes (e.g. &quot;this in 18K rose gold with a hidden halo&quot;). Use the response as notes for your quote.
              </p>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-40 shrink-0 space-y-2">
                  <label className="text-[8px] uppercase opacity-68 font-bold block">Reference image</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${designChatImage ? 'border-white/25 bg-white/5' : 'border-white/12 hover:border-white/40 hover:bg-white/5'}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="design-chat-upload"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () => setDesignChatImage(String(r.result));
                        r.readAsDataURL(f);
                      }}
                    />
                    {designChatImage ? (
                      <img src={designChatImage} alt="Reference" className="max-h-32 mx-auto object-contain rounded-md" />
                    ) : (
                      <label htmlFor="design-chat-upload" className="cursor-pointer flex flex-col items-center gap-2 text-[9px] opacity-70">
                        <Upload size={18} className="opacity-60" />
                        <span className="uppercase tracking-widest">Drop or click to upload</span>
                        <span className="text-[8px] opacity-60">Screenshots, Pinterest, CAD renders all work.</span>
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-3 min-h-[140px] max-h-72 overflow-y-auto space-y-3">
                    {!designChatQuestion && !designChatAnswer && (
                      <div className="text-[10px] opacity-45">
                        Example: <span className="italic">&quot;Keep this exact layout, but 18K yellow gold with a slimmer band and a hidden halo.&quot;</span>
                      </div>
                    )}
                    {designChatQuestion && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-emerald-500/10 border border-emerald-400/40 rounded-2xl rounded-br-sm px-3 py-2 text-[10px]">
                          {designChatQuestion}
                        </div>
                      </div>
                    )}
                    {designChatAnswer && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] bg-white/5 border border-white/15 rounded-2xl rounded-bl-sm px-3 py-2 text-[10px] whitespace-pre-wrap leading-relaxed">
                          {designChatAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="sr-only">Describe requested change</label>
                        <input
                          type="text"
                          value={designChatQuestion}
                          onChange={e => setDesignChatQuestion(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (!designChatLoading) handleDesignImageChat();
                            }
                          }}
                          placeholder="Describe what the client wants changed…"
                          className="w-full bg-black/60 border border-white/15 rounded-full px-4 py-2 text-[11px] font-light focus:outline-none focus:border-emerald-400/60"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDesignImageChat}
                        disabled={designChatLoading}
                        className="h-9 px-4 rounded-full bg-white text-black text-[9px] uppercase tracking-widest font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {designChatLoading ? 'Analysing…' : 'Send'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[9px] text-red-400/80 min-h-[1em]">
                        {designChatError}
                      </div>
                      <button
                        type="button"
                        onClick={applyDesignChatSpecToQuote}
                        disabled={!designChatSpec}
                        className="px-3 py-1 rounded-full border border-emerald-400/60 text-emerald-300 text-[8px] uppercase tracking-widest hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Apply spec to quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Analytics' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass border border-white/10 rounded-sm p-6">
                <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Total leads</p>
                <p className="text-4xl font-thin">{userState.leads.length}</p>
              </div>
              <div className="glass border border-white/10 rounded-sm p-6">
                <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Leads by source</p>
                <div className="mt-2 space-y-1 text-[10px] uppercase">
                  {(['Chatbot', 'Partner Nudge', 'Ring Builder', 'Collection Enquiry', 'Explore', 'Manual'] as const).map(src => {
                    const n = userState.leads.filter(l => l.source === src).length;
                    return n > 0 ? <div key={src} className="flex justify-between"><span className="opacity-78">{src}</span><span>{n}</span></div> : null;
                  })}
                  {userState.leads.filter(l => !l.source).length > 0 && <div className="flex justify-between"><span className="opacity-78">—</span><span>{userState.leads.filter(l => !l.source).length}</span></div>}
                </div>
              </div>
              <div className="glass border border-white/10 rounded-sm p-6">
                <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Orders by status</p>
                <div className="mt-2 space-y-1 text-[10px] uppercase max-h-32 overflow-y-auto">
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
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-3">Conversion by source</p>
              <p className="text-[8px] opacity-55 mb-4">Leads → Quoted (pipeline started) → Won (Deposit Paid or later)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] uppercase">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 opacity-78 font-bold">Source</th>
                      <th className="text-right py-2 opacity-78 font-bold">Leads</th>
                      <th className="text-right py-2 opacity-78 font-bold">Quoted</th>
                      <th className="text-right py-2 opacity-78 font-bold">Won</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['Chatbot', 'Partner Nudge', 'Ring Builder', 'Collection Enquiry', 'Explore', 'Manual'] as const).map(src => {
                      const leads = userState.leads.filter(l => l.source === src);
                      const quoted = leads.filter(l => l.status === 'Quoted' || l.linkedDesignId);
                      const won = quoted.filter(l => {
                        const des = userState.recentDesigns.find(d => d.id === l.linkedDesignId);
                        return des && ['Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'].includes(des.status);
                      });
                      return (
                        <tr key={src} className="border-b border-white/5">
                          <td className="py-2 opacity-90">{src}</td>
                          <td className="text-right py-2">{leads.length}</td>
                          <td className="text-right py-2">{quoted.length}</td>
                          <td className="text-right py-2">{won.length}</td>
                        </tr>
                      );
                    })}
                    {userState.leads.filter(l => !l.source).length > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="py-2 opacity-90">—</td>
                        <td className="text-right py-2">{userState.leads.filter(l => !l.source).length}</td>
                        <td className="text-right py-2">{userState.leads.filter(l => !l.source && (l.status === 'Quoted' || l.linkedDesignId)).length}</td>
                        <td className="text-right py-2">{userState.leads.filter(l => !l.source && l.linkedDesignId && userState.recentDesigns.some(d => d.id === l.linkedDesignId && ['Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'].includes(d.status))).length}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-3">Popular specs</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase">
                <div><span className="opacity-55 block">Metal</span>{Object.entries(userState.recentDesigns.reduce<Record<string, number>>((a, d) => { const m = d.metal || '—'; a[m] = (a[m] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => <span key={k} className="block">{k} ({v})</span>)}</div>
                <div><span className="opacity-55 block">Shape</span>{Object.entries(userState.recentDesigns.reduce<Record<string, number>>((a, d) => { const s = d.shape || '—'; a[s] = (a[s] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => <span key={k} className="block">{k} ({v})</span>)}</div>
                <div><span className="opacity-55 block">Quality</span>{Object.entries(userState.recentDesigns.reduce<Record<string, number>>((a, d) => { const q = d.qualityTier || '—'; a[q] = (a[q] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => <span key={k} className="block truncate">{k} ({v})</span>)}</div>
                <div><span className="opacity-55 block">Carat (top)</span>{[...new Set(userState.recentDesigns.map(d => d.carat))].filter(Boolean).sort((a, b) => (b ?? 0) - (a ?? 0)).slice(0, 3).map(c => <span key={c} className="block">{c} ct</span>)}</div>
              </div>
            </div>
            <div className="glass border border-white/10 rounded-sm p-6">
              <p className="text-[9px] uppercase opacity-68 font-bold mb-2">Stock needed (Sourcing Stone)</p>
              <p className="text-[8px] opacity-55 mb-3">{hasNivodaAccess(jewelerSettings?.packageTier) && jewelerSettings?.nivodaSourcingEnabled ? 'Use Nivoda for live sourcing.' : 'Orders in Sourcing Stone — upgrade for Live Diamond Sourcing (Nivoda).'}</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userState.recentDesigns.filter(d => d.status === 'Sourcing Stone').length === 0 && <p className="text-[9px] opacity-60">None</p>}
                {userState.recentDesigns.filter(d => d.status === 'Sourcing Stone').map(d => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-white/5 text-[9px]">
                    <span className="font-mono opacity-90">{d.id}</span>
                    <span className="opacity-78">{d.shape ?? '—'} • {(d.carat ?? 0)} ct • {d.qualityTier ?? '—'} • {d.metal ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Email' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="glass border border-white/10 rounded-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <Sparkles size={14} /> AI Email Icebreakers
                  </h3>
                  <p className="text-[9px] uppercase opacity-68 mt-1">
                    Paste a jeweler&apos;s website or about text and get ready-made personalization bullets for cold emails.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Website URL (optional)</label>
                    <input
                      type="url"
                      value={icebreakerUrl}
                      onChange={e => setIcebreakerUrl(e.target.value)}
                      placeholder="https://example-jeweler.com"
                      className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Website content / About text</label>
                    <textarea
                      rows={7}
                      value={icebreakerContent}
                      onChange={e => setIcebreakerContent(e.target.value)}
                      placeholder="Paste visible text from their homepage or About page…"
                      className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none resize-y"
                    />
                    <p className="text-[8px] opacity-55 mt-1">
                      Tip: If URL scraping fails, just copy/paste a paragraph from their site here.
                    </p>
                  </div>
                  {icebreakerError && (
                    <p className="text-[9px] text-red-400/80">{icebreakerError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateIcebreaker}
                    disabled={icebreakerLoading}
                    className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {icebreakerLoading ? 'Generating…' : 'Generate icebreakers'}
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] uppercase opacity-68 font-bold block">Gemini personalization output</label>
                  <div className="bg-black/40 border border-white/10 rounded-sm p-3 min-h-[160px] text-[10px] whitespace-pre-wrap leading-relaxed">
                    {icebreakerResult
                      ? icebreakerResult
                      : <span className="opacity-40">Your bullet list will appear here. You can copy/paste it straight into your cold email opener.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <Sparkles size={14} /> Bulk Icebreakers from Leads File
                  </h3>
                  <p className="text-[9px] uppercase opacity-68 mt-1">
                    Upload a CSV / JSON / Excel list of leads and generate personalization bullets in the same order, exportable as CSV.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-[9px] uppercase tracking-widest cursor-pointer hover:bg-white/5">
                  Upload leads file
                  <input
                    type="file"
                    accept=".csv,.json,.xlsx,.xls"
                    className="hidden"
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (f) await handleBulkLeadFileSelected(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {bulkIcebreakerError && (
                <p className="text-[9px] text-red-400/80">{bulkIcebreakerError}</p>
              )}
              {bulkLeadRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[9px] uppercase opacity-68">
                      {bulkLeadRows.length} leads loaded. We&apos;ll preserve this exact order in the CSV export.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateBulkIcebreakers}
                      disabled={bulkIcebreakerLoading}
                      className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bulkIcebreakerLoading ? 'Generating…' : 'Generate for all leads'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadBulkCsv}
                      disabled={!bulkLeadRows.some(r => r.icebreaker && r.icebreaker.trim())}
                      className="px-4 py-2 border border-white/30 text-[9px] uppercase tracking-widest hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Download CSV
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto border border-white/10 rounded-sm">
                    <table className="w-full text-[10px]">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          {bulkTableColumns.map(col => (
                            <th key={col} className="px-3 py-2 text-left font-semibold">
                              {col}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-left font-semibold">Icebreaker</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkLeadRows.map(row => (
                          <tr key={row.index} className="border-t border-white/5 align-top">
                            <td className="px-3 py-2 whitespace-nowrap opacity-70">{row.index + 1}</td>
                            {bulkTableColumns.map(col => (
                              <td key={col} className="px-3 py-2 whitespace-nowrap">
                                {String(row.raw[col] ?? '').trim() || '—'}
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <div className="max-h-24 overflow-y-auto whitespace-pre-wrap opacity-80">
                                {row.icebreaker && row.icebreaker.trim()
                                  ? row.icebreaker
                                  : row.status === 'error'
                                    ? <span className="opacity-60 text-red-300">Error</span>
                                    : <span className="opacity-40">Pending</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

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
          </div>
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
                        <CustomSelect
                          options={[
                            { value: 'scheduled', label: 'Scheduled' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                            { value: 'no_show', label: 'No show' },
                          ]}
                          value={a.status}
                          onChange={async (v) => {
                            await updateAppointment(a.id, { status: v as Appointment['status'] });
                            const next = await fetchAppointments(jewelerEmail);
                            setAppointments(next);
                          }}
                          theme={isDarkTheme ? 'dark' : 'light'}
                          compact
                        />
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
                    <CustomSelect
                      options={DAY_NAMES.map((name, i) => ({ value: String(i), label: name }))}
                      value={String(availabilityForm.dayOfWeek ?? 1)}
                      onChange={(v) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: parseInt(v, 10) })}
                      theme={userState.theme}
                    />
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
              <p className="text-[9px] opacity-65">The Ring Guide and Wedding Template are always shown. Add your own guides below; upload a file (PDF, Word, etc.) or paste a URL. Clients see default + your custom guides on the Digital Vault.</p>
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
                      <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Download file or URL</label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input value={guideForm.downloadUrl ?? ''} onChange={e => setGuideForm(f => ({ ...f, downloadUrl: e.target.value }))} className="flex-1 min-w-[180px] bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none" placeholder="https://... or upload below" />
                        <label className="px-3 py-2 border border-white/20 text-[9px] uppercase tracking-wider cursor-pointer hover:bg-white/5 flex items-center gap-2 flex-shrink-0 disabled:opacity-50">
                          <Upload size={12} /> {uploadingGuide ? 'Uploading…' : 'Upload file'}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.ods,.odp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv"
                            className="hidden"
                            disabled={uploadingGuide}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const jid = jewelerEmail || sessionUser?.email || '';
                              if (!jid) return;
                              setUploadingGuide(true);
                              const url = await uploadJewelerAsset(jid, 'guides', file);
                              if (url) {
                                setGuideForm(f => ({ ...f, downloadUrl: url, suggestedFilename: f.suggestedFilename || file.name }));
                              }
                              setUploadingGuide(false);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-[8px] opacity-50 mt-1">PDF, Word, Excel, PowerPoint, text, CSV, etc.</p>
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
                {vaultGuides.length === 0 && !editingGuideId && !addingGuide && <p className="text-[9px] opacity-55">No custom guides yet. Add one above; the default Ring Guide and Wedding Template always appear together with yours.</p>}
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
                        <CustomSelect
                          options={['Buying', 'Diamonds', 'Metals', 'Care', 'Engagement', 'Guide', 'Stones'].map(c => ({ value: c, label: c }))}
                          value={blogForm.category ?? 'Guide'}
                          onChange={v => setBlogForm(f => ({ ...f, category: v }))}
                          theme={userState.theme}
                        />
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
              <p className="text-[9px] opacity-65">Default logo is used wherever a placement override is not set. Upload an image or paste a URL. You can set a different logo per placement below.</p>

              <div>
                <p className="text-[8px] uppercase opacity-68 font-bold mb-2">Current active logo (default)</p>
                <div className="flex items-center gap-4 flex-wrap">
                  {(jewelerSettings?.logoUrl && String(jewelerSettings.logoUrl).trim()) ? (
                    <img src={jewelerSettings.logoUrl.trim()} alt="Current logo" className="h-10 object-contain object-left max-w-[160px] bg-white/5 rounded border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-[9px] opacity-50">Using site default</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Default logo URL</label>
                  <input
                    type="url"
                    value={logoUrlDraft}
                    onChange={(e) => setLogoUrlDraft(e.target.value)}
                    placeholder="https://… or leave empty for default"
                    className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50"
                  />
                </div>
                <label className="px-4 py-2 border border-white/20 text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/5 flex items-center gap-2">
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const jid = jewelerEmail || sessionUser?.email || '';
                      if (!jid) return;
                      const url = await uploadJewelerAsset(jid, 'logos', file);
                      if (url) setLogoUrlDraft(url);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={savingLogo}
                  onClick={async () => {
                    const jid = jewelerEmail || sessionUser?.email || '';
                    if (!jid) return;
                    setSavingLogo(true);
                    await upsertJewelerSettings({
                      jewelerId: jid,
                      logoUrl: logoUrlDraft.trim() || null,
                      logoNavbar: logoNavbarDraft.trim() || null,
                      logoFooter: logoFooterDraft.trim() || null,
                      logoQuotes: logoQuotesDraft.trim() || null,
                      logoVault: logoVaultDraft.trim() || null,
                    });
                    await onJewelerSettingsRefresh?.();
                    setSavingLogo(false);
                  }}
                  className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> {savingLogo ? 'Saving…' : 'Save all logos'}
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-[8px] uppercase opacity-68 font-bold mb-3">Where the logo is used — set a different logo per location (optional)</p>
                <ul className="space-y-3 text-[9px] opacity-80">
                  <li className="flex flex-wrap items-center gap-2">
                    <span className="w-28 uppercase font-bold">Navbar</span>
                    <input type="url" value={logoNavbarDraft} onChange={e => setLogoNavbarDraft(e.target.value)} placeholder="Override or leave empty" className="flex-1 min-w-[140px] bg-black/50 border border-white/10 p-1.5 text-[10px] focus:outline-none placeholder:opacity-50" />
                    <LogoUploadButton jewelerId={jewelerEmail || sessionUser?.email || ''} onUpload={setLogoNavbarDraft} />
                  </li>
                  <li className="flex flex-wrap items-center gap-2">
                    <span className="w-28 uppercase font-bold">Footer</span>
                    <input type="url" value={logoFooterDraft} onChange={e => setLogoFooterDraft(e.target.value)} placeholder="Override or leave empty" className="flex-1 min-w-[140px] bg-black/50 border border-white/10 p-1.5 text-[10px] focus:outline-none placeholder:opacity-50" />
                    <LogoUploadButton jewelerId={jewelerEmail || sessionUser?.email || ''} onUpload={setLogoFooterDraft} />
                  </li>
                  <li className="flex flex-wrap items-center gap-2">
                    <span className="w-28 uppercase font-bold">Quote PDFs</span>
                    <input type="url" value={logoQuotesDraft} onChange={e => setLogoQuotesDraft(e.target.value)} placeholder="Override or leave empty" className="flex-1 min-w-[140px] bg-black/50 border border-white/10 p-1.5 text-[10px] focus:outline-none placeholder:opacity-50" />
                    <LogoUploadButton jewelerId={jewelerEmail || sessionUser?.email || ''} onUpload={setLogoQuotesDraft} />
                  </li>
                  <li className="flex flex-wrap items-center gap-2">
                    <span className="w-28 uppercase font-bold">Digital Vault</span>
                    <input type="url" value={logoVaultDraft} onChange={e => setLogoVaultDraft(e.target.value)} placeholder="Override or leave empty" className="flex-1 min-w-[140px] bg-black/50 border border-white/10 p-1.5 text-[10px] focus:outline-none placeholder:opacity-50" />
                    <LogoUploadButton jewelerId={jewelerEmail || sessionUser?.email || ''} onUpload={setLogoVaultDraft} />
                  </li>
                </ul>
                <p className="text-[8px] opacity-50 mt-2">If a placement is left empty, the default logo above is used there.</p>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Pricing & margin</h2>
              <p className="text-[9px] opacity-65">Piece base is the starting amount (ZAR) for that jewellery type before metal, setting style, and stone. Used in Manual Quote and the builder. Loose Stone uses stone-only pricing. Blank = platform default (e.g. 3,800 for rings).</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PIECE_BASE_TYPES.map(t => (
                  <div key={t}>
                    <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">{t} base (ZAR)</label>
                    <input type="number" min={0} value={pieceBaseByTypeDraft[t] ?? ''} onChange={e => setPieceBaseByTypeDraft(prev => ({ ...prev, [t]: e.target.value }))} placeholder="default" className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Default margin %</label>
                  <p className="text-[8px] opacity-55 mb-1">Markup on the calculated total (piece base + metal + setting + stone).</p>
                  <input type="number" min={0} max={200} value={pricingMarginDraft} onChange={e => setPricingMarginDraft(e.target.value)} placeholder="e.g. 25" className="w-24 bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50" />
                </div>
                <button type="button" disabled={savingPricing} onClick={async () => {
                  const jid = jewelerEmail || sessionUser?.email || '';
                  if (!jid) return;
                  setSavingPricing(true);
                  const pieceBaseByType: Record<string, number> = {};
                  PIECE_BASE_TYPES.forEach(t => {
                    const v = (pieceBaseByTypeDraft[t] ?? '').trim();
                    if (v) { const n = parseInt(v, 10); if (!isNaN(n) && n >= 0) pieceBaseByType[t] = n; }
                  });
                  const defaultMarginPercent = pricingMarginDraft.trim() ? parseInt(pricingMarginDraft, 10) : undefined;
                  const hasAny = Object.keys(pieceBaseByType).length > 0 || defaultMarginPercent != null;
                  const next = { ...(jewelerSettings?.pricingRules ?? {}), pieceBaseByType, ...(defaultMarginPercent != null && { defaultMarginPercent }) };
                  await upsertJewelerSettings({ jewelerId: jid, pricingRules: hasAny ? next : null });
                  await onJewelerSettingsRefresh?.();
                  setSavingPricing(false);
                }} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50">
                  <Save size={14} /> {savingPricing ? 'Saving…' : 'Save pricing'}
                </button>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Visit address</h2>
              <p className="text-[9px] opacity-65">Shown in the footer and on the Book a visit page (map and label). Use your full street address for the map.</p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Address</label>
                  <input
                    type="text"
                    value={addressDraft}
                    onChange={(e) => setAddressDraft(e.target.value)}
                    placeholder="e.g. Suite 303, The Foundry, 18 Cardiff St, De Waterkant, Cape Town, 8001"
                    className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50"
                  />
                </div>
                <button
                  type="button"
                  disabled={savingAddress}
                  onClick={async () => {
                    const jid = jewelerEmail || sessionUser?.email || '';
                    if (!jid) return;
                    setSavingAddress(true);
                    await upsertJewelerSettings({ jewelerId: jid, address: addressDraft.trim() || null });
                    await onJewelerSettingsRefresh?.();
                    setSavingAddress(false);
                  }}
                  className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> {savingAddress ? 'Saving…' : 'Save address'}
                </button>
              </div>
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

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Terms & conditions</h2>
              <p className="text-[9px] opacity-65">Shown on the public Terms page. When empty, the default terms are shown. Changes appear in real time once saved.</p>
              <textarea
                value={termsDraft}
                onChange={(e) => setTermsDraft(e.target.value)}
                placeholder="Paste or type your terms here. Leave blank to use the default."
                rows={12}
                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30 placeholder:opacity-50 resize-y min-h-[200px]"
              />
              <button
                type="button"
                disabled={savingTerms}
                onClick={async () => {
                  const jid = jewelerEmail || sessionUser?.email || '';
                  if (!jid) return;
                  setSavingTerms(true);
                  await upsertJewelerSettings({ jewelerId: jid, termsAndConditions: termsDraft.trim() || null });
                  await onJewelerSettingsRefresh?.();
                  setSavingTerms(false);
                }}
                className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {savingTerms ? 'Saving…' : 'Save terms'}
              </button>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Our Story / About us</h2>
              <p className="text-[9px] opacity-65">Shown on the Our Story page. When empty, the default story (founder, {DONTPAYRETAIL}, ethics, Google reviews) is shown. Changes appear as soon as you save.</p>
              <textarea
                value={aboutUsDraft}
                onChange={(e) => setAboutUsDraft(e.target.value)}
                placeholder="Paste or write your own about us text. Leave blank to use the default."
                rows={10}
                className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30 placeholder:opacity-50 resize-y min-h-[180px]"
              />
              <button
                type="button"
                disabled={savingAbout}
                onClick={async () => {
                  const jid = jewelerEmail || sessionUser?.email || '';
                  if (!jid) return;
                  setSavingAbout(true);
                  await upsertJewelerSettings({ jewelerId: jid, aboutUs: aboutUsDraft.trim() || null });
                  await onJewelerSettingsRefresh?.();
                  setSavingAbout(false);
                }}
                className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {savingAbout ? 'Saving…' : 'Save Our Story'}
              </button>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Google review link</h2>
              <p className="text-[9px] opacity-65">Optional. When set, clients can be prompted after collection/delivery to leave a review.</p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">URL</label>
                  <input type="url" value={googleReviewUrlDraft} onChange={e => setGoogleReviewUrlDraft(e.target.value)} placeholder="https://g.page/r/..." className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50" />
                </div>
                <button type="button" disabled={savingGoogleReview} onClick={async () => {
                  const jid = jewelerEmail || sessionUser?.email || '';
                  if (!jid) return;
                  setSavingGoogleReview(true);
                  await upsertJewelerSettings({ jewelerId: jid, googleReviewUrl: googleReviewUrlDraft.trim() || null });
                  await onJewelerSettingsRefresh?.();
                  setSavingGoogleReview(false);
                }} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50">
                  <Save size={14} /> {savingGoogleReview ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-sm p-8 space-y-6">
              <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4 flex items-center gap-2">
                <Lock size={14} /> Account & password
              </h2>
              <p className="text-[9px] opacity-65">Set or change your password after the default one was generated. You can change it anytime.</p>
              {passwordError && <div className="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm">Password updated.</div>}
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">New password</label>
                  <input
                    type="password"
                    value={passwordNew}
                    onChange={e => { setPasswordNew(e.target.value); setPasswordError(''); }}
                    placeholder="Min 10 chars, upper, lower, number, symbol"
                    className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50"
                    autoComplete="new-password"
                    disabled={passwordSuccess}
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase opacity-68 font-bold block mb-1">Confirm password</label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={e => { setPasswordConfirm(e.target.value); setPasswordError(''); }}
                    placeholder="Repeat password"
                    className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none placeholder:opacity-50"
                    autoComplete="new-password"
                    disabled={passwordSuccess}
                  />
                  {passwordConfirm && passwordNew !== passwordConfirm && <p className="text-[9px] text-red-400 mt-1">Passwords do not match</p>}
                </div>
                <button
                  type="button"
                  disabled={passwordLoading || passwordSuccess || !passwordNew || passwordNew !== passwordConfirm || passwordNew.length < 10}
                  onClick={async () => {
                    setPasswordError('');
                    if (passwordNew !== passwordConfirm || passwordNew.length < 10) return;
                    setPasswordLoading(true);
                    const { error: err } = await updatePassword(passwordNew);
                    setPasswordLoading(false);
                    if (err) setPasswordError(err.message || 'Failed to update password');
                    else {
                      setPasswordSuccess(true);
                      setPasswordNew('');
                      setPasswordConfirm('');
                    }
                  }}
                  className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock size={14} /> {passwordLoading ? 'Updating…' : passwordSuccess ? 'Updated' : 'Change password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Catalog' && (
          <CatalogTab
            jewelerId={getJewelerEmail() || ''}
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
                modelUrl: p.modelUrl,
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
  jewelerId: string;
  products: CatalogProduct[];
  form: Partial<CatalogProduct>;
  setForm: (f: Partial<CatalogProduct>) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSave: (p: Partial<CatalogProduct>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}> = ({ jewelerId, products, form, setForm, editingId, setEditingId, onSave, onDelete, onAddNew }) => {
  const isFormOpen = editingId !== null;
  const isNew = editingId === '__new__';
  const [modelUploading, setModelUploading] = React.useState(false);

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
              <label className="text-[8px] uppercase opacity-68 font-bold block">3D Model (OBJ / GLB)</label>
              <div className="flex gap-2 items-center">
                <input type="file" accept=".glb,.gltf,.obj" onChange={async e => { const f = e.target.files?.[0]; if (!f || !jewelerId) return; setModelUploading(true); try { const url = await uploadJewelerAsset(jewelerId, 'models', f); if (url) setForm(prev => ({ ...prev, modelUrl: url })); } finally { setModelUploading(false); e.target.value = ''; } }} className="text-[9px] file:mr-2 file:py-1 file:px-3 file:border file:border-white/20 file:bg-white/5 file:text-[9px] file:uppercase file:tracking-widest" disabled={modelUploading} />
                <input value={form.modelUrl || ''} onChange={e => setForm(prev => ({ ...prev, modelUrl: e.target.value || undefined }))} placeholder="Or paste URL" className="flex-1 bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" readOnly={modelUploading} />
                {modelUploading && <span className="text-[9px] opacity-60">Uploading…</span>}
              </div>
              <p className="text-[8px] opacity-50">Use the Upload button — local file paths (C:\...) don&apos;t work. Paste URL only for files already hosted online.</p>
              <label className="flex items-center gap-2 text-[8px] uppercase opacity-68 font-bold">
                <input type="checkbox" checked={form.isActive !== false} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active (shown in Collection)
              </label>
            </div>
            <div className="space-y-4">
              <label className="text-[8px] uppercase opacity-68 font-bold block">Price (ZAR)</label>
              <input type="number" value={form.priceZAR ?? ''} onChange={e => setForm({ ...form, priceZAR: parseInt(e.target.value) || 0 })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Type</label>
              <CustomSelect
                options={[{ value: '', label: '—' }, ...JEWELLERY_TYPES.map(t => ({ value: t, label: t }))]}
                value={form.type || ''}
                onChange={v => setForm({ ...form, type: v as any })}
                theme={userState.theme}
              />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Metal</label>
              <CustomSelect
                options={[{ value: '', label: '—' }, ...Object.keys(METAL_DATA).map(m => ({ value: m, label: m }))]}
                value={form.metal || ''}
                onChange={v => setForm({ ...form, metal: v as any })}
                theme={userState.theme}
              />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Shape</label>
              <CustomSelect
                options={[{ value: '', label: '—' }, ...Object.keys(SHAPE_DATA).map(s => ({ value: s, label: s }))]}
                value={form.shape || ''}
                onChange={v => setForm({ ...form, shape: v as any })}
                theme={userState.theme}
              />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Stone</label>
              <CustomSelect
                options={[{ value: '', label: '—' }, ...STONE_CATEGORIES.map(s => ({ value: s, label: s }))]}
                value={form.stoneCategory || ''}
                onChange={v => setForm({ ...form, stoneCategory: v as any })}
                theme={userState.theme}
              />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Setting</label>
              <CustomSelect
                options={[{ value: '', label: '—' }, ...Object.keys(SETTING_DATA).map(s => ({ value: s, label: s }))]}
                value={form.settingStyle || ''}
                onChange={v => setForm({ ...form, settingStyle: v as any })}
                theme={userState.theme}
              />
              <label className="text-[8px] uppercase opacity-68 font-bold block">Carat</label>
              <input type="number" step="0.01" value={form.carat ?? ''} onChange={e => setForm({ ...form, carat: parseFloat(e.target.value) || undefined })} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30" />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onSave(form)} disabled={modelUploading} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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

export default JewelerPortal;
