import type { JewelleryConfig, JewelleryType, StoneType, StoneCategory, Shape, QualityTier, JewelerPricingRules } from '../types';
import { BASE_PRICE, NATURAL_DIAMOND_BASE, MOISSANITE_BASE, GEMSTONE_BASE, LAB_DIAMOND_PRICE_FACTOR } from '../constants';
import { METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS } from '../constants';

function getBasePrice(r?: JewelerPricingRules | null, jewelleryType?: JewelleryType): number {
  if (jewelleryType && r?.pieceBaseByType?.[jewelleryType] != null && r.pieceBaseByType[jewelleryType]! >= 0)
    return r.pieceBaseByType[jewelleryType]!;
  if (r?.basePrice != null && r.basePrice >= 0) return r.basePrice;
  return BASE_PRICE;
}
function getMetalPrice(metal: string, r?: JewelerPricingRules | null): number {
  if (r?.metalPremiums && typeof r.metalPremiums[metal] === 'number') return r.metalPremiums[metal];
  return METAL_DATA[metal]?.price ?? 0;
}
function getSettingPrice(setting: string, r?: JewelerPricingRules | null): number {
  if (r?.settingPrices && typeof r.settingPrices[setting] === 'number') return r.settingPrices[setting];
  return SETTING_DATA[setting]?.price ?? 0;
}
function getShapeFactor(shape: string): number {
  return SHAPE_DATA[shape as Shape]?.factor ?? 1;
}
function getQualityFactor(tier: string, r?: JewelerPricingRules | null): number {
  if (r?.qualityFactors && typeof r.qualityFactors[tier] === 'number') return r.qualityFactors[tier];
  return QUALITY_TIERS[tier]?.factor ?? 1;
}
function getStoneBases(r?: JewelerPricingRules | null): { natural: number; moissanite: number; gemstone: number; labFactor: number } {
  const sb = r?.stoneBases;
  return {
    natural: (sb?.naturalDiamond != null && sb.naturalDiamond >= 0) ? sb.naturalDiamond : NATURAL_DIAMOND_BASE,
    moissanite: (sb?.moissanite != null && sb.moissanite >= 0) ? sb.moissanite : MOISSANITE_BASE,
    gemstone: (sb?.gemstone != null && sb.gemstone >= 0) ? sb.gemstone : GEMSTONE_BASE,
    labFactor: (sb?.labDiamondFactor != null && sb.labDiamondFactor >= 0) ? sb.labDiamondFactor : LAB_DIAMOND_PRICE_FACTOR,
  };
}

/** Same formula as RingBuilder: compute price from specs. Optionally apply margin (e.g. 1.25 = 25% markup). Uses jeweler pricing rules when provided. */
export function calculateQuotePrice(
  cfg: Partial<JewelleryConfig>,
  marginMultiplier: number = 1,
  pricingRules?: JewelerPricingRules | null
): number {
  const bases = getStoneBases(pricingRules);
  let price: number;
  if (cfg.type === 'Loose Stone') {
    const stoneBase = bases.natural * (cfg.stoneType === 'Lab' ? bases.labFactor : 1);
    const shapeFactor = getShapeFactor(cfg.shape as string);
    const qualityFactor = getQualityFactor(cfg.qualityTier || 'Balance Size & Quality', pricingRules);
    price = Math.round((stoneBase * Math.pow(cfg.carat || 1, 1.95)) * shapeFactor * qualityFactor);
  } else {
    let p = getBasePrice(pricingRules, cfg.type as JewelleryType);
    if (cfg.metal) p += getMetalPrice(cfg.metal, pricingRules);
    if (cfg.settingStyle) p += getSettingPrice(cfg.settingStyle, pricingRules);
    if (cfg.stoneCategory && cfg.stoneCategory !== 'None' && cfg.stoneCategory !== 'Other') {
      let stoneBase = cfg.stoneCategory === 'Diamond' ? bases.natural : bases.gemstone;
      if (cfg.stoneCategory === 'Moissanite') stoneBase = bases.moissanite;
      if (cfg.stoneType === 'Lab') stoneBase *= bases.labFactor;
      p += (stoneBase * Math.pow(cfg.carat || 1, 1.95)) * getShapeFactor(cfg.shape as string);
    } else if (cfg.stoneCategory === 'Other') {
      p += (bases.gemstone * Math.pow(cfg.carat || 1, 1.95)) * getShapeFactor(cfg.shape as string);
    }
    p *= getQualityFactor(cfg.qualityTier || 'Balance Size & Quality', pricingRules);
    if (cfg.engraving) p += 950;
    price = Math.round(p);
  }
  return Math.round(price * marginMultiplier);
}
