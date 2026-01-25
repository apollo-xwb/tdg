/**
 * Resolves image IDs used in blog articles to actual image URLs.
 * IDs can be: shape keys (Round, Oval, …), setting keys (Solitaire, Halo, …), or quality tier keys.
 */
import { SHAPE_DATA, SETTING_DATA, QUALITY_TIERS } from '../constants';

export function getBlogImage(id: string): string | undefined {
  return (SHAPE_DATA as Record<string, { img?: string }>)[id]?.img
    ?? (SETTING_DATA as Record<string, { img?: string }>)[id]?.img
    ?? (QUALITY_TIERS as Record<string, { img?: string }>)[id]?.img;
}
