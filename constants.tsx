
import React from 'react';

// Import quality tier images
import superHighQualityImg from './src/Color/Super High Quality.png';
import balanceImg from './src/Color/Balance.png';
import maxSizeImg from './src/Color/max Size.png';

// Import setting images
import solitaireImg from './src/Settings/Solitaire.png';
import haloImg from './src/Settings/Halo.png';
import paveImg from './src/Settings/Pave.png';
import threeStoneImg from './src/Settings/three-stone.png';
import emeraldAccentsImg from './src/Settings/emerald accents.png';
import sapphireAccentsImg from './src/Settings/Sapphire Accents.png';

// Import shape images
import roundImg from './src/Shapes/Round.png';
import ovalImg from './src/Shapes/Oval.png';
import emeraldImg from './src/Shapes/Emerald.png';
import pearImg from './src/Shapes/Pear.png';
import princessImg from './src/Shapes/Princess.png';
import cushionImg from './src/Shapes/Cushion.png';
import radiantImg from './src/Shapes/Radiant.png';
import marquiseImg from './src/Shapes/Marquise.png';
import heartImg from './src/Shapes/Heart.png';
import asscherImg from './src/Shapes/Asscher.png';

// Import TDG logo
import tdgLogoImg from './src/TDG logo.png';

// #DontPayRetail — We create each piece custom. No inventory. Under retail. Ethically sourced. Certified.
export const DONTPAYRETAIL = '#DontPayRetail';

export const BASE_PRICE = 3800;

// Lab-grown: fraction of natural base. Market 2025–2026; we charge under retail.
export const LAB_DIAMOND_PRICE_FACTOR = 0.042;
// Stone bases (ZAR) — under retail; no inventory, custom only.
export const NATURAL_DIAMOND_BASE = 47200;
export const MOISSANITE_BASE = 4200;
export const GEMSTONE_BASE = 15800;

// The Diamond Guy — Cape Town
export const TDG_ADDRESS = 'Suite 303, The Foundry, 18 Cardiff St, De Waterkant, Cape Town, 8001';
export const TDG_PHONE = '063 617 1823';
// Africa/Johannesburg; Sat–Sun Closed; Mon–Thu 9–17; Fri 9–16
export const OPENING_HOURS = [
  { day: 0, name: 'Sunday', open: null, close: null },
  { day: 1, name: 'Monday', open: 9, close: 17 },
  { day: 2, name: 'Tuesday', open: 9, close: 17 },
  { day: 3, name: 'Wednesday', open: 9, close: 17 },
  { day: 4, name: 'Thursday', open: 9, close: 17 },
  { day: 5, name: 'Friday', open: 9, close: 16 },
  { day: 6, name: 'Saturday', open: null, close: null }
];

export const QUALITY_TIERS: Record<string, { label: string, sub: string, color: string, clarity: string, factor: number, description: string, img: string, caratMax: number, isRecommended?: boolean }> = {
  'Super High Quality': {
    label: 'Super High Quality',
    sub: 'Ultra white, no visible imperfections',
    color: 'F Color +',
    clarity: 'VVS2 Clarity +',
    factor: 2.2,
    description: 'The pinnacle of brilliance. Stones in this tier appear perfectly white and flawless even under magnification. Ideal for those who refuse to compromise.',
    img: superHighQualityImg,
    caratMax: 0.26
  },
  'Balance Size & Quality': {
    label: 'Balance Size & Quality',
    sub: 'Pretty white, no imperfections to naked eye',
    color: 'H Color +',
    clarity: 'VS2 Clarity +',
    factor: 1.45,
    description: 'The professional choice. Expertly balanced to provide maximum beauty and size without paying for invisible perfections. Most popular for engagement rings.',
    img: balanceImg,
    caratMax: 0.34,
    isRecommended: true
  },
  'Maximize Size': {
    label: 'Maximize Size',
    sub: 'Slight yellow with small imperfections',
    color: 'K Color +',
    clarity: 'SI2 Clarity +',
    factor: 0.85,
    description: 'For those who want presence. A slight warm tint is visible, but the stone offers massive visual impact for the price. Perfect for yellow gold settings.',
    img: maxSizeImg,
    caratMax: 0.5
  }
};

export const METAL_DATA: Record<string, { price: number, gradient: string, insight: string, img: string }> = {
  'Platinum': { 
    price: 16500, 
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B4B4B4 50%, #E5E4E2 100%)',
    insight: 'Naturally white and hypoallergenic. The heaviest, most durable precious metal—stones stay secure for life. No plating; holds its finish. Ideal for heirlooms.',
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400'
  },
  'White Gold': { 
    price: 10500, 
    gradient: 'linear-gradient(135deg, #F8F8F8 0%, #D1D1D1 50%, #F8F8F8 100%)',
    insight: '18k White Gold is rhodium-plated for a brilliant mirror finish. Softer than platinum; replating every few years keeps it luminous. A popular, lower-cost white option.',
    img: 'https://images.unsplash.com/photo-1573408302185-912705078827?auto=format&fit=crop&q=80&w=400'
  },
  'Yellow Gold': { 
    price: 10200, 
    gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
    insight: 'Timeless and warm. 18k Yellow Gold pairs beautifully with diamonds and never goes out of style. Higher purity than 14k for a richer colour; slightly softer.',
    img: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400'
  },
  'Rose Gold': { 
    price: 10200, 
    gradient: 'linear-gradient(135deg, #E6C2BF 0%, #B76E79 50%, #E6C2BF 100%)',
    insight: 'Copper alloy gives rose gold its romantic hue and makes it a bit tougher than yellow or white gold. Hypoallergenic-friendly; flattering on most skin tones.',
    img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=400'
  },
  'Silver': { 
    price: 650, 
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 50%, #C0C0C0 100%)',
    insight: 'Affordable and versatile. Silver is softer than gold—best for fashion or occasional wear. Regular polishing prevents tarnish. Great for trying a style before committing to gold.',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400'
  },
  '18K Gold': { 
    price: 10200, 
    gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
    insight: '75% pure gold—richer colour and warmth than 14K. Softer, so it can show wear over decades. Choose 18K for maximum luxury and colour; 14K for durability.',
    img: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400'
  },
  '14K Gold': { 
    price: 8200, 
    gradient: 'linear-gradient(135deg, #F0D875 0%, #D4AF37 50%, #F0D875 100%)',
    insight: '58.3% pure gold. More durable than 18K—ideal for everyday rings. Slightly paler than 18K but holds up to knocks and wear. The practical choice for active lifestyles.',
    img: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400'
  },
  'Sterling Silver': { 
    price: 650, 
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 50%, #C0C0C0 100%)',
    insight: '92.5% pure silver. A step above plain silver. Needs periodic polishing. Perfect for statement pieces, travel, or a first fine-jewellery purchase.',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400'
  },
  'Other': { 
    price: 4200, 
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B4B4B4 50%, #E5E4E2 100%)',
    insight: 'Palladium, titanium, mixed metals, or something else? Tell us what you have in mind and we’ll quote. We craft custom—no inventory, so we can work to your vision.',
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400'
  }
};

export const SETTING_DATA: Record<string, { price: number, img: string }> = {
  'Solitaire': { price: 0, img: solitaireImg },
  'Halo': { price: 7200, img: haloImg },
  'Pave': { price: 5000, img: paveImg },
  'Trilogy': { price: 10000, img: threeStoneImg },
  'Emerald Accents': { price: 9200, img: emeraldAccentsImg },
  'Sapphire Accents': { price: 8800, img: sapphireAccentsImg }
};

export const SHAPE_DATA: Record<string, { factor: number, img: string, insight: string }> = {
  'Round': { factor: 1.2, img: roundImg, insight: 'The standard for sparkle. Round brilliants are engineered for maximum light return.' },
  'Oval': { factor: 1.05, img: ovalImg, insight: 'Elegant and elongating. Ovals create the illusion of longer fingers and larger carat size.' },
  'Emerald': { factor: 0.95, img: emeraldImg, insight: 'Sophisticated step-cuts. Emerald shapes highlight clarity and provide a hall-of-mirrors effect.' },
  'Pear': { factor: 1.0, img: pearImg, insight: 'Unique and adventurous. A teardrop shape that combines the brilliance of a round with the length of a marquise.' },
  'Princess': { factor: 1.1, img: princessImg, insight: 'Modern and geometric. Princess cuts offer a contemporary look with sharp corners and intense fire.' },
  'Cushion': { factor: 1.0, img: cushionImg, insight: 'Soft and romantic. Cushion cuts have rounded corners and larger facets for a vintage glow.' },
  'Radiant': { factor: 1.1, img: radiantImg, insight: 'Brilliant and lively. Radiant cuts combine the elegance of an emerald shape with the fire of a round.' },
  'Marquise': { factor: 1.0, img: marquiseImg, insight: 'Bold and distinct. The boat-shaped marquise maximizes surface area for a grand appearance.' },
  'Heart': { factor: 1.2, img: heartImg, insight: 'Symbolic and sentimental. Heart shapes are a technical feat of symmetry and romance.' },
  'Asscher': { factor: 1.1, img: asscherImg, insight: 'Vintage-inspired step-cut. Asscher shapes offer a distinct Art Deco aesthetic with deep clarity.' }
};

export const JEWELLERY_TYPES = [
  'Engagement Ring', 'Loose Stone', 'Earrings', 'Necklace', 'Bracelet', 'Wedding Band', 'Pendant', 'Ring', 'Other'
];

// Step 1 builder: simplified type choices (maps to JewelleryType)
export const JEWELLERY_GUIDE_TYPES = [
  { id: 'ring', label: 'Ring', value: 'Engagement Ring' },
  { id: 'earrings', label: 'Earrings', value: 'Earrings' },
  { id: 'necklace', label: 'Necklace', value: 'Necklace' },
  { id: 'bracelet', label: 'Bracelet', value: 'Bracelet' },
  { id: 'pendant', label: 'Pendant', value: 'Pendant' },
  { id: 'loose', label: 'Loose Diamond', value: 'Loose Stone' },
  { id: 'other', label: 'Other', value: 'Other' }
];

/** Sentinel for "I'm not sure" — we'll quote based on your choices. */
export const BUDGET_NOT_SURE = -1;

export const BUDGET_OPTIONS = [
  { label: 'R5,000+', value: 5000 },
  { label: 'R10,000+', value: 10000 },
  { label: 'R15,000+', value: 15000 },
  { label: 'R25,000+', value: 25000 },
  { label: 'R50,000+', value: 50000 },
  { label: 'R500,000+', value: 500000 },
  { label: 'Custom budget', value: 0 } // 0 = custom input
];

export const GEMSTONE_TYPES = ['Sapphire', 'Ruby', 'Emerald', 'Aquamarine', 'Amethyst', 'Other'];

export const TIMELINE_OPTIONS = [
  { label: 'As soon as possible', value: 'As soon as possible' as const },
  { label: 'Within 1 month', value: 'Within 1 month' as const },
  { label: 'Within 3 months', value: 'Within 3 months' as const },
  { label: 'Within 6 months', value: 'Within 6 months' as const },
  { label: "I'm flexible", value: "I'm flexible" as const }
];

export const RING_SIZE_STANDARDS = ['UK/SA', 'US/Canada', 'EU/mm'];

export const EXCHANGE_RATES: Record<string, { rate: number, flag: string }> = {
  'ZAR': { rate: 1, flag: '🇿🇦' }, 
  'USD': { rate: 18.5, flag: '🇺🇸' }, 
  'GBP': { rate: 23.4, flag: '🇬🇧' }, 
  'EUR': { rate: 20.1, flag: '🇪🇺' }, 
  'AUD': { rate: 12.1, flag: '🇦🇺' }, 
  'CAD': { rate: 13.6, flag: '🇨🇦' }
};

export const FAQ_DATA = [
  { q: "Natural vs Lab vs Moissanite?", a: "Natural diamonds are mined assets. Lab diamonds are chemically identical but high-tech. Moissanite is a silicon carbide gem that offers more fire and brilliance than diamond at a fraction of the cost." },
  { q: "What is the 50% Deposit Policy?", a: "To begin sourcing your specific stone and casting your precious metal, a 50% deposit is required. The balance is due upon collection." },
  { q: "How long is the manufacturing timeline?", a: "Each bespoke piece typically takes 3 to 4 weeks from deposit to final polish, ensuring every detail is perfected." },
  { q: "Do you offer international shipping?", a: "Yes. We offer fully insured, secure international shipping via luxury couriers like Brinks or FedEx Luxury." },
  { q: "What is your warranty policy?", a: "All Diamond Guy jewellery comes with a 1-year manufacturing warranty covering structural defects. This does not cover loss of stones or damage through wear and tear." }
];

export const LOGO_URL = tdgLogoImg;
export const GIA_LOGO = "https://www.thediamondguy.co.za/wp-content/uploads/2024/10/image_2024-10-16_202813802-removebg-preview-e1729799976204.png";
export const EGI_LOGO = "https://www.thediamondguy.co.za/wp-content/uploads/2024/10/image_2024-10-16_202152710-removebg-preview.png";

export const NAV_ITEMS = [
  { id: 'Home', label: 'Home' },
  { id: 'RingBuilder', label: 'Builder' },
  { id: 'Learn', label: 'Learn' },
  { id: 'Blog', label: 'Blog' },
  { id: 'Resources', label: 'Guides' },
  { id: 'Chatbot', label: 'Concierge' },
  { id: 'Portal', label: 'Vault' }
];
