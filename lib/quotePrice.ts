import type { JewelleryConfig, JewelleryType, StoneType, StoneCategory, Shape, QualityTier } from '../types';
import { BASE_PRICE, NATURAL_DIAMOND_BASE, MOISSANITE_BASE, GEMSTONE_BASE, LAB_DIAMOND_PRICE_FACTOR } from '../constants';
import { METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS } from '../constants';

/** Same formula as RingBuilder: compute price from specs. Optionally apply margin (e.g. 1.25 = 25% markup). */
export function calculateQuotePrice(
  cfg: Partial<JewelleryConfig>,
  marginMultiplier: number = 1
): number {
  let price: number;
  if (cfg.type === 'Loose Stone') {
    const stoneBase = NATURAL_DIAMOND_BASE * (cfg.stoneType === 'Lab' ? LAB_DIAMOND_PRICE_FACTOR : 1);
    const shapeFactor = SHAPE_DATA[cfg.shape as Shape]?.factor || 1;
    const qualityFactor = QUALITY_TIERS[cfg.qualityTier || 'Balance Size & Quality']?.factor || 1;
    price = Math.round((stoneBase * Math.pow(cfg.carat || 1, 1.95)) * shapeFactor * qualityFactor);
  } else {
    let p = BASE_PRICE;
    if (cfg.metal) p += METAL_DATA[cfg.metal]?.price || 0;
    if (cfg.settingStyle) p += SETTING_DATA[cfg.settingStyle]?.price || 0;
    if (cfg.stoneCategory && cfg.stoneCategory !== 'None' && cfg.stoneCategory !== 'Other') {
      let stoneBase = cfg.stoneCategory === 'Diamond' ? NATURAL_DIAMOND_BASE : GEMSTONE_BASE;
      if (cfg.stoneCategory === 'Moissanite') stoneBase = MOISSANITE_BASE;
      if (cfg.stoneType === 'Lab') stoneBase *= LAB_DIAMOND_PRICE_FACTOR;
      p += (stoneBase * Math.pow(cfg.carat || 1, 1.95)) * (SHAPE_DATA[cfg.shape as Shape]?.factor || 1);
    } else if (cfg.stoneCategory === 'Other') {
      p += (GEMSTONE_BASE * Math.pow(cfg.carat || 1, 1.95)) * (SHAPE_DATA[cfg.shape as Shape]?.factor || 1);
    }
    p *= (QUALITY_TIERS[cfg.qualityTier || 'Balance Size & Quality']?.factor || 1);
    if (cfg.engraving) p += 950;
    price = Math.round(p);
  }
  return Math.round(price * marginMultiplier);
}
