
export type StoneType = 'Natural' | 'Lab' | 'Moissanite' | 'N/A';
export type Metal = 'Yellow Gold' | 'White Gold' | 'Rose Gold' | 'Silver' | 'Platinum' | '18K Gold' | '14K Gold' | 'Sterling Silver' | 'Other';
export type StoneCategory = 'Diamond' | 'Sapphire' | 'Emerald' | 'Ruby' | 'Moissanite' | 'Aquamarine' | 'Amethyst' | 'None' | 'Other';
export type Shape = 'Round' | 'Princess' | 'Oval' | 'Cushion' | 'Emerald' | 'Pear' | 'Marquise' | 'Heart' | 'Asscher' | 'Radiant' | 'N/A';
export type QualityTier = 'Super High Quality' | 'Balance Size & Quality' | 'Maximize Size' | 'N/A';
export type SettingStyle = 'Solitaire' | 'Halo' | 'Pave' | 'Trilogy' | 'Emerald Accents' | 'Sapphire Accents';
export type JewelleryType = 'Engagement Ring' | 'Loose Stone' | 'Earrings' | 'Necklace' | 'Bracelet' | 'Wedding Band' | 'Pendant' | 'Ring' | 'Other';
export type Timeline = 'As soon as possible' | 'Within 1 month' | 'Within 3 months' | 'Within 6 months' | "I'm flexible";

export type OrderStatus = 'Quoted' | 'Approved' | 'Deposit Paid' | 'Sourcing Stone' | 'In Production' | 'Final Polish' | 'Ready' | 'Collected';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  requestType: string;
  description: string;
  date: string;
  status: 'New' | 'Contacted' | 'Closed';
  nudgedByClient?: boolean;
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
  timeline?: Timeline;
  typeOtherDetail?: string;
  gender?: 'Men' | 'Women';
  bandWidth?: number;
  imageUrl?: string;
}

export interface UserState {
  diamondIQ: string[];
  recentDesigns: JewelleryConfig[];
  leads: Lead[];
  currency: 'ZAR' | 'USD' | 'GBP' | 'EUR' | 'AUD' | 'CAD';
  theme: 'dark' | 'light';
  builderDraft?: Partial<JewelleryConfig>;
}

export type AppView = 'Home' | 'RingBuilder' | 'Learn' | 'Chatbot' | 'Portal' | 'Resources' | 'JewelerPortal' | 'Terms';
