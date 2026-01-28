
export type StoneType = 'Natural' | 'Lab' | 'Moissanite' | 'N/A';
export type Metal = 'Yellow Gold' | 'White Gold' | 'Rose Gold' | 'Silver' | 'Platinum' | '18K Gold' | '14K Gold' | 'Sterling Silver' | 'Other';
export type StoneCategory = 'Diamond' | 'Sapphire' | 'Emerald' | 'Ruby' | 'Moissanite' | 'Aquamarine' | 'Amethyst' | 'None' | 'Other';
export type Shape = 'Round' | 'Princess' | 'Oval' | 'Cushion' | 'Emerald' | 'Pear' | 'Marquise' | 'Heart' | 'Asscher' | 'Radiant' | 'N/A';
export type QualityTier = 'Super High Quality' | 'Balance Size & Quality' | 'Maximize Size' | 'N/A';
export type SettingStyle = 'Solitaire' | 'Halo' | 'Pave' | 'Trilogy' | 'Emerald Accents' | 'Sapphire Accents';
export type JewelleryType = 'Engagement Ring' | 'Loose Stone' | 'Earrings' | 'Necklace' | 'Bracelet' | 'Wedding Band' | 'Pendant' | 'Ring' | 'Other';
export type Timeline = 'As soon as possible' | 'Within 1 month' | 'Within 3 months' | 'Within 6 months' | "I'm flexible";

export type OrderStatus = 'Quoted' | 'Approved' | 'Deposit Paid' | 'Sourcing Stone' | 'In Production' | 'Final Polish' | 'Ready' | 'Collected';

export type LeadStatus = 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost' | 'Closed';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  requestType: string;
  description: string;
  date: string;
  status: LeadStatus;
  nudgedByClient?: boolean;
  catalogProductId?: string;
  source?: 'Chatbot' | 'Partner Nudge' | 'Ring Builder' | 'Collection Enquiry' | 'Manual' | 'Explore';
  linkedDesignId?: string;
}

/** Jeweler inventory item shown in client Collection; clients can enquire on it */
export interface CatalogProduct {
  id: string;
  jewelerId: string;
  title: string;
  description: string;
  imageUrls: string[];
  priceZAR: number;
  metal?: Metal;
  type?: JewelleryType;
  shape?: Shape;
  carat?: number;
  stoneCategory?: StoneCategory;
  settingStyle?: SettingStyle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JewelleryConfig {
  id: string;
  type: JewelleryType;
  stoneType: StoneType;
  metal: Metal;
  settingStyle: SettingStyle;
  stoneCategory: StoneCategory;
  shape: Shape;
  carat: number; 
  ringSize?: string;
  ringSizeStandard?: string;
  budget: number;
  qualityTier: QualityTier;
  engraving: string;
  priceZAR: number;
  date: string;
  status: OrderStatus;
  isApproved: boolean;
  certLink?: string;
  videoLink?: string;
  paymentLink?: string;
  customNotes?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  isDiscreet?: boolean;
  designInspirationUrl?: string;
  pinterestLink?: string;
  designDescription?: string;
  /** Base style for necklaces, bracelets, earrings, pendants — guides the generative process. */
  pieceStyle?: string;
  timeline?: Timeline;
  typeOtherDetail?: string;
  gender?: 'Men' | 'Women';
  bandWidth?: number;
  imageUrl?: string;
  /** When true, client should be notified (e.g. email) when status changes. Jeweler-facing preference. */
  notifyClientOnStatusChange?: boolean;
  /** Optional cost (ZAR) for margin/COGS tracking. Jeweler-only. */
  costZAR?: number;
  /** Optional margin % applied for this order. Overrides jeweler default when set. */
  marginPercent?: number;
  /** Status changed at (ISO). Populated by backend or jeweler edits. */
  statusUpdatedAt?: string;
  /** Milestone dates keyed by status. Jeweler-editable. */
  milestoneDates?: Partial<Record<OrderStatus, string>>;
  /** Public tracking token for client-facing status page. */
  trackingToken?: string;
  /** Paystack reference from webhook. */
  paystackReference?: string;
  /** When true or unset, design appears in the Explore feed. Set false to hide from Explore. */
  showInExplore?: boolean;
}

export interface UserState {
  diamondIQ: string[];
  recentDesigns: JewelleryConfig[];
  leads: Lead[];
  currency: 'ZAR' | 'USD' | 'GBP' | 'EUR' | 'AUD' | 'CAD';
  theme: 'dark' | 'light';
  builderDraft?: Partial<JewelleryConfig>;
}

export type EmailFlowTriggerType = 'quote_approved' | 'status_update' | 'reminder' | 'promo' | 'custom';

export interface EmailFlowFollowUp {
  delay_days: number;
  subject_template: string;
  body_template: string;
}

export interface EmailFlow {
  id: string;
  jewelerId: string;
  name: string;
  triggerType: EmailFlowTriggerType;
  subjectTemplate: string;
  bodyTemplate: string;
  followUpDays?: number | null;
  isActive: boolean;
  followUps: EmailFlowFollowUp[];
  createdAt: string;
  updatedAt: string;
}

export type AppView = 'Home' | 'RingBuilder' | 'Learn' | 'Chatbot' | 'Portal' | 'Resources' | 'JewelerPortal' | 'Terms' | 'Blog' | 'Collection' | 'Explore' | 'Track' | 'Book' | 'About';

/** Jeweler plan tier; Growth and Pro include Live Diamond Sourcing (Nivoda). */
export type JewelerPackageTier = 'starter' | 'growth' | 'pro';

/** One day's operational hours. open/close in 24h (e.g. 9, 17); null = closed. */
export interface OpeningHoursEntry {
  day: number;
  name: string;
  open: number | null;
  close: number | null;
}

export interface JewelerSettings {
  jewelerId: string;
  packageTier: JewelerPackageTier;
  /** When true, Nivoda integration is used for stone sourcing (paywalled to growth/pro). */
  nivodaSourcingEnabled?: boolean;
  /** Operational hours shown in footer and used for booking when no custom availability is set. */
  openingHours?: OpeningHoursEntry[];
  /** Default logo URL. Used when a placement override is not set. */
  logoUrl?: string | null;
  /** Logo for navbar. Overrides logoUrl when set. */
  logoNavbar?: string | null;
  /** Logo for footer. Overrides logoUrl when set. */
  logoFooter?: string | null;
  /** Logo for quote PDFs. Overrides logoUrl when set. */
  logoQuotes?: string | null;
  /** Logo for Digital Vault / Guides page. Overrides logoUrl when set. */
  logoVault?: string | null;
  /** Terms & conditions HTML or plain text. When set, the public Terms page shows this instead of the default. */
  termsAndConditions?: string | null;
  /** Visit / showroom address (map, footer, Book a visit). When set, overrides default. */
  address?: string | null;
  /** About us / Our Story page content. When set, the About page shows this instead of the default. */
  aboutUs?: string | null;
  /** Jeweler-defined pricing rules for quotes. When set, Manual Quote and builder use these instead of platform defaults. */
  pricingRules?: JewelerPricingRules | null;
  /** Google review URL for post-delivery nudge. When set, client can be prompted to leave a review. */
  googleReviewUrl?: string | null;
  updatedAt: string;
}

/** Jeweler-defined pricing: piece base per type, metal premiums, quality factors, stone bases, default margin. Stored in jeweler_settings.settings. */
export interface JewelerPricingRules {
  /** Fallback when a type has no entry in pieceBaseByType. */
  basePrice?: number;
  /** Piece base (ZAR) per jewellery type — starting amount before metal, setting, stone. Loose Stone uses stone-only pricing. */
  pieceBaseByType?: Partial<Record<JewelleryType, number>>;
  defaultMarginPercent?: number;
  metalPremiums?: Record<string, number>;
  qualityFactors?: Record<string, number>;
  settingPrices?: Record<string, number>;
  stoneBases?: {
    naturalDiamond?: number;
    moissanite?: number;
    gemstone?: number;
    labDiamondFactor?: number;
  };
}

/** Recurring weekly availability slot. dayOfWeek 0 = Sunday, 6 = Saturday. */
export interface JewelerAvailabilitySlot {
  id: string;
  jewelerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  jewelerId: string;
  startAt: string;
  endAt: string;
  clientName: string;
  clientEmail: string;
  summary: string;
  status: AppointmentStatus;
  designId?: string | null;
  leadId?: string | null;
  createdAt: string;
}

/** Item in the Guides / Digital Vault shown to clients (Resources page). Jeweler can add/edit/remove. */
export interface VaultGuide {
  id: string;
  jewelerId: string;
  title: string;
  description: string;
  /** URL to the asset (PDF, etc.). Client downloads from this. */
  downloadUrl: string;
  /** Suggested filename when downloading (e.g. "Wedding_Planner.pdf"). */
  suggestedFilename?: string;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body block for blog posts – aligned with data/blogArticles.ts BodyBlock. */
export type BlogBodyBlock =
  | { type: 'p'; content: string }
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'cta'; to: 'RingBuilder' | 'Chatbot' | 'Resources'; label: string };

/** Blog post written by jeweler. Slug must be unique. publishedAt null = draft. */
export interface BlogPost {
  id: string;
  jewelerId: string;
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  /** ISO date or null if draft */
  publishedAt: string | null;
  readTimeMinutes: number;
  excerpt: string;
  body: BlogBodyBlock[];
  createdAt: string;
  updatedAt: string;
}
