// Internal dev-only pricing + value configuration.
// This is your private "pricing bible" baked into the app so you never lose the thinking.
// It mirrors the SaaS/pricing breakdown we discussed: features, tiers, ROI assumptions, etc.

export type DevPricingTierId = 'spark' | 'atelier' | 'maison';

export interface DevPricingTier {
  id: DevPricingTierId;
  name: string;
  tagline: string;
  recommendedFor: string;
  setupUsd: number;
  monthlyUsd: number;
  annualUsd: number;
}

export type DevPricingGroupId =
  | 'crm'
  | 'builder'
  | 'orders'
  | 'catalog'
  | 'ecommerce'
  | 'appointments'
  | 'marketing'
  | 'ai'
  | 'analytics'
  | 'integrations'
  | 'multiTenant'
  | 'support';

export interface DevPricingGroup {
  id: DevPricingGroupId;
  label: string;
  description: string;
}

export interface DevPricingFeature {
  key: string;
  group: DevPricingGroupId;
  label: string;
  short: string;
  long: string;
  /** Base incremental monthly value for this feature when sold à la carte (USD). */
  baseMonthlyUsd: number;
  /** Base incremental setup / implementation effort (USD). */
  baseSetupUsd: number;
  /** Which tiers include this feature out-of-the-box. */
  includedIn: DevPricingTierId[];
  /**
   * Heuristic weights (0–1) used by the ROI calculator.
   * These are not exact but encode our mental model:
   * - revenue: how much this helps top-line growth.
   * - margin: how much this protects/improves gross margin.
   * - time: how much time it saves the jeweller team.
   */
  weightRevenue: number;
  weightMargin: number;
  weightTime: number;
  /** Optional dependencies (keys of other features). */
  dependsOn?: string[];
}

// -------------------------
// Tier presets
// -------------------------

export const DEV_PRICING_TIERS: DevPricingTier[] = [
  {
    id: 'spark',
    name: 'Spark Studio',
    tagline: 'For solo/boutique jewellers getting off spreadsheets.',
    recommendedFor: '1 small location, 1–3 seats, mostly custom engagement/wedding work.',
    setupUsd: 1500,
    monthlyUsd: 249,
    annualUsd: 2450, // ~18% off
  },
  {
    id: 'atelier',
    name: 'Atelier Pro',
    tagline: 'Growth OS for independent ateliers with staff and volume.',
    recommendedFor: '1–3 locations, 3–10 seats, mix of custom + catalogue.',
    setupUsd: 3000,
    monthlyUsd: 499,
    annualUsd: 4900,
  },
  {
    id: 'maison',
    name: 'Maison Elite',
    tagline: 'For multi-location houses and serious custom brands.',
    recommendedFor: '3+ locations, multi-designer teams, strong repeat business.',
    setupUsd: 6000,
    monthlyUsd: 1450, // mid of 1250–1800 band
    annualUsd: 14300,
  },
];

// -------------------------
// Groups
// -------------------------

export const DEV_PRICING_GROUPS: DevPricingGroup[] = [
  {
    id: 'crm',
    label: 'CRM & Client Management',
    description:
      'Leads, pipeline, client vault, partner nudges, and everything that moves people from “maybe” to “paid”.',
  },
  {
    id: 'builder',
    label: 'Builder & CAD',
    description:
      'The multi-step ring/jewellery builder, AI design assistant, and manufacturing-accurate CAD generator.',
  },
  {
    id: 'orders',
    label: 'Orders & Production',
    description:
      'Quoting, approval, deposits, production statuses, Track Your Brilliance timelines, and repair/custom jobs.',
  },
  {
    id: 'catalog',
    label: 'Catalog & 3D Products',
    description:
      'Product catalogue, variants, 3D GLB models, Explore feed, and digital vault / guides.',
  },
  {
    id: 'ecommerce',
    label: 'E‑commerce & Checkout',
    description: 'Collection pages, product pages, Paystack checkout, thank-you, and post-purchase flows.',
  },
  {
    id: 'appointments',
    label: 'Appointments & In‑Store',
    description: 'Book a Visit, availability, opening hours, and jeweller calendar.',
  },
  {
    id: 'marketing',
    label: 'Marketing & Automation',
    description: 'Email flows, blog, bulk outreach, digital vault, and trust-building content.',
  },
  {
    id: 'ai',
    label: 'AI & Smart Tools',
    description: 'Gemini-powered CAD, design chat, outreach icebreakers, and concierge chatbot.',
  },
  {
    id: 'analytics',
    label: 'Analytics & Insights',
    description: 'Funnel metrics, lead source performance, popular specs, and dashboard tiles.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Supabase, Paystack, Resend, JewelersShowcase embed, and planned Nivoda mode.',
  },
  {
    id: 'multiTenant',
    label: 'Branding, Multi‑Tenant & Security',
    description: 'Per‑jeweller branding, RLS, roles, multi-store scaffolding, and white-label hooks.',
  },
  {
    id: 'support',
    label: 'Support & Services',
    description: 'Onboarding, migration, training, and success enablement.',
  },
];

// -------------------------
// Features
// -------------------------

// NOTE: All pricing numbers here are INTERNAL heuristics for your dev brain.
// They are NOT what you must charge; they simply help you see relative weight.

export const DEV_PRICING_FEATURES: DevPricingFeature[] = [
  // CRM
  {
    key: 'crm_leads_pipeline',
    group: 'crm',
    label: 'Leads CRM & Pipeline',
    short: 'Statuses, sources, notes, RLS per jeweller.',
    long:
      'Full CRM for leads with statuses, source attribution (Chatbot, Builder, Explore, Partner Nudge, etc.), RLS per jeweller, and real-time updates. ' +
      'Typical tools like this alone are sold at $50–150/mo in generic CRMs.',
    baseMonthlyUsd: 80,
    baseSetupUsd: 400,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.6,
    weightMargin: 0.2,
    weightTime: 0.5,
  },
  {
    key: 'client_vault_portal',
    group: 'crm',
    label: 'Client Vault & Portal',
    short: 'Secure portal for designs, orders, and assets.',
    long:
      'Client-facing portal where buyers can log in, see designs, track status, download guides, and feel “concierge-level” service. ' +
      'Reduces inbound “where’s my ring?” noise and increases perceived professionalism.',
    baseMonthlyUsd: 70,
    baseSetupUsd: 400,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.2,
    weightTime: 0.6,
  },
  {
    key: 'partner_nudge',
    group: 'crm',
    label: 'Partner Nudge & Sharing',
    short: 'Shareable design links that generate new leads.',
    long:
      'Mechanic for clients to share designs with partners/family; clicks and enquiries become new leads attributed as “Partner Nudge”. ' +
      'Subtle viral loop that can turn one enquiry into multiple serious prospects.',
    baseMonthlyUsd: 30,
    baseSetupUsd: 150,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.1,
    weightTime: 0.2,
  },

  // Builder & CAD
  {
    key: 'builder_multi_step',
    group: 'builder',
    label: 'Ring & Jewellery Builder',
    short: 'Multi-step builder for rings, bands, and jewellery.',
    long:
      'The jewel craft configurator: guides clients through type, style, metal, stones, quality tier, ring size, budget, inspiration images, and notes. ' +
      'Captures production-grade specs while feeling like a guided concierge conversation.',
    baseMonthlyUsd: 120,
    baseSetupUsd: 800,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.7,
    weightMargin: 0.4,
    weightTime: 0.8,
  },
  {
    key: 'ai_cad_generator',
    group: 'builder',
    label: 'AI CAD Generator (OpenSCAD)',
    short: 'Manufacturing-accurate OpenSCAD + spec sheets.',
    long:
      'Google Gemini-powered CAD assistant that outputs dimensionally accurate OpenSCAD code, full spec sheets, and pitch-deck prompts. ' +
      'Targets 0.1mm accuracy, proper prongs, and casting scale factors—this is serious production tooling.',
    baseMonthlyUsd: 180,
    baseSetupUsd: 1200,
    includedIn: ['atelier', 'maison'],
    weightRevenue: 0.5,
    weightMargin: 0.7,
    weightTime: 0.8,
    dependsOn: ['builder_multi_step'],
  },
  {
    key: 'design_image_chat',
    group: 'builder',
    label: 'Design Image Chat (Jeweller)',
    short: 'Upload inspiration images and turn them into specs.',
    long:
      'Lets the jeweller upload a client’s photo / Pinterest link and have AI describe it, extract specs, and propose changes. ' +
      'Bridges the gap between “I like this” and “here is a manufacturable brief”.',
    baseMonthlyUsd: 90,
    baseSetupUsd: 400,
    includedIn: ['atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.5,
    weightTime: 0.7,
    dependsOn: ['builder_multi_step'],
  },

  // Orders & Production
  {
    key: 'order_pipeline',
    group: 'orders',
    label: 'Order Status & Production Pipeline',
    short: 'Quote → Approved → Deposit → Sourcing → Production → Ready.',
    long:
      'Structured production pipeline with timestamps for each stage, editable milestones, and hooks for notifications. ' +
      'Aligns with “Track Your Brilliance” client view and internal Kanban.',
    baseMonthlyUsd: 80,
    baseSetupUsd: 500,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.3,
    weightMargin: 0.5,
    weightTime: 0.6,
  },
  {
    key: 'manual_quote_builder',
    group: 'orders',
    label: 'Manual Quote Builder',
    short: 'Ops-side quotes with jeweller pricing rules.',
    long:
      'Back-office quote interface that uses jeweller-specific pricing tables (piece base, metal premiums, setting costs, margin targets) instead of fixed hardcoded prices.',
    baseMonthlyUsd: 70,
    baseSetupUsd: 400,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.5,
    weightMargin: 0.6,
    weightTime: 0.5,
  },

  // Catalog & 3D
  {
    key: 'catalog_management',
    group: 'catalog',
    label: 'Catalog Management & Variants',
    short: 'Per-jeweller product catalogue with metal/shape variants.',
    long:
      'CRUD for catalogue products with variants (metal + karat + shape/setting), spec fields, images, visibility, and CSV seeding from product exports.',
    baseMonthlyUsd: 60,
    baseSetupUsd: 350,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.3,
    weightTime: 0.4,
  },
  {
    key: 'three_d_models',
    group: 'catalog',
    label: '3D Model Viewer (GLB)',
    short: 'Attach GLB models and view interactively.',
    long:
      'R3F / <model-viewer> based interactive 3D viewer for GLB models on product pages and hero; supports Supabase Storage-backed assets.',
    baseMonthlyUsd: 40,
    baseSetupUsd: 300,
    includedIn: ['atelier', 'maison'],
    weightRevenue: 0.3,
    weightMargin: 0.2,
    weightTime: 0.1,
    dependsOn: ['catalog_management'],
  },
  {
    key: 'explore_feed',
    group: 'catalog',
    label: 'Explore Feed (User Generations)',
    short: 'Public gallery of builder creations with enquiry links.',
    long:
      'Feed of anonymised/generated designs from the builder that visitors can browse and enquire on—turns past work into ongoing lead magnets.',
    baseMonthlyUsd: 50,
    baseSetupUsd: 250,
    includedIn: ['atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.1,
    weightTime: 0.2,
  },

  // E‑commerce
  {
    key: 'collection_storefront',
    group: 'ecommerce',
    label: 'Collection & Storefront',
    short: 'Filterable collection grid, cards, and navigation.',
    long:
      'Public-facing collection page with filters (shape images, metal, setting, price), cards, and navigation. Matches modern DTC UX.',
    baseMonthlyUsd: 70,
    baseSetupUsd: 400,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.5,
    weightMargin: 0.2,
    weightTime: 0.2,
  },
  {
    key: 'checkout_paystack',
    group: 'ecommerce',
    label: 'Checkout & Paystack',
    short: 'Checkout for pre-configs linked to CRM + Paystack.',
    long:
      'Checkout flow for configured catalogue pieces that creates CRM entities (design + lead + order) and redirects customers to Paystack payment links.',
    baseMonthlyUsd: 90,
    baseSetupUsd: 500,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.6,
    weightMargin: 0.3,
    weightTime: 0.3,
  },

  // Appointments
  {
    key: 'book_visit',
    group: 'appointments',
    label: 'Book a Visit',
    short: 'Calendar, availability, meeting-purpose buttons, map.',
    long:
      'Client-side booking page that respects jeweller opening hours, offers meeting-purpose quick selects, embeds a map, and emphasises “by appointment only”.',
    baseMonthlyUsd: 50,
    baseSetupUsd: 300,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.1,
    weightTime: 0.5,
  },

  // Marketing
  {
    key: 'email_flows',
    group: 'marketing',
    label: 'Email Flows & Automation',
    short: 'Trigger-based flows for quotes, updates, promos.',
    long:
      'Configurable flows for key lifecycle events (quote approved, status updates, reminders, promos), with templates, duplication, and Resend-backed delivery.',
    baseMonthlyUsd: 80,
    baseSetupUsd: 500,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.6,
    weightMargin: 0.3,
    weightTime: 0.4,
  },
  {
    key: 'blog_content',
    group: 'marketing',
    label: 'Blog & Content Hub',
    short: 'CMS-style blog for education and SEO.',
    long:
      'Simple but complete blog system for long-form articles, used to educate clients and support organic search.',
    baseMonthlyUsd: 30,
    baseSetupUsd: 200,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.3,
    weightMargin: 0.0,
    weightTime: 0.1,
  },

  // AI & Smart Tools
  {
    key: 'ai_bulk_icebreakers',
    group: 'ai',
    label: 'Bulk AI Icebreakers',
    short: 'Upload CSV/XLSX and generate outreach openers.',
    long:
      'Bulk upload leads from CSV/JSON/Excel and generate personalised, structured cold email openers for outbound campaigns. Preserves ordering and exports to CSV.',
    baseMonthlyUsd: 120,
    baseSetupUsd: 400,
    includedIn: ['atelier', 'maison'],
    weightRevenue: 0.7,
    weightMargin: 0.1,
    weightTime: 0.7,
  },
  {
    key: 'chatbot_concierge',
    group: 'ai',
    label: 'Chatbot Concierge',
    short: 'On-site conversational assistant & lead capture.',
    long:
      'Floating concierge widget and Mia chatbot that guide visitors, answer questions, route them into Builder/Book/Collection, and capture leads.',
    baseMonthlyUsd: 60,
    baseSetupUsd: 300,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.5,
    weightMargin: 0.0,
    weightTime: 0.3,
  },

  // Analytics
  {
    key: 'analytics_dashboard',
    group: 'analytics',
    label: 'Dashboard & Funnel Analytics',
    short: 'Leads by source, conversion, status distribution.',
    long:
      'Operations Hub tiles and charts summarising leads/sources, funnel conversion, and order statuses so owners can see performance at a glance.',
    baseMonthlyUsd: 50,
    baseSetupUsd: 250,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.4,
    weightMargin: 0.3,
    weightTime: 0.3,
  },

  // Integrations
  {
    key: 'integration_nivoda',
    group: 'integrations',
    label: 'Nivoda Mode (Planned)',
    short: 'Live diamond sourcing behind a paywall.',
    long:
      'Placeholder for deep integration to Nivoda or similar diamond sourcing API, gated to higher packages and used primarily by serious ateliers.',
    baseMonthlyUsd: 200,
    baseSetupUsd: 800,
    includedIn: ['maison'],
    weightRevenue: 0.5,
    weightMargin: 0.5,
    weightTime: 0.1,
  },

  // Multi-tenant & Support
  {
    key: 'branding_multi_tenant',
    group: 'multiTenant',
    label: 'Branding, Terms, & Multi-tenant',
    short: 'Per-jeweller logos, T&Cs, About, RLS.',
    long:
      'Per-tenant branding (logos in navbar/footer/quotes/vault), editable terms/about/address, and full RLS multi-tenancy in Supabase.',
    baseMonthlyUsd: 40,
    baseSetupUsd: 400,
    includedIn: ['spark', 'atelier', 'maison'],
    weightRevenue: 0.1,
    weightMargin: 0.2,
    weightTime: 0.1,
  },
];

// -------------------------
// ROI heuristics & notes
// -------------------------

export const DEV_ROI_NOTES = {
  inventoryTurnoverIncrease: 0.235, // 23.5%
  inventoryReduction: 0.12, // 12%+
  typicalSalesUpliftCrm: [0.12, 0.25], // 12–25%
  quotingTimeSaved: [0.6, 0.8], // 60–80%
  marginImprovementRange: [0.05, 0.15], // 5–15%
  narrative:
    'Benchmarks from jewellery CRM/POS and inventory studies show 12–25% sales uplift, ' +
    '12–15% inventory reduction, and 60–80% time savings on quoting when adopting tools like this. ' +
    'Your stack (builder + CAD + CRM + flows + AI outreach) realistically sits at the upper end for boutiques.',
};

