import type { CatalogProduct } from '../types';

/** Merge CSV products (static catalog) with Supabase products (jeweler-added). CSV takes precedence for same id. */
export function mergeCatalog(csv: CatalogProduct[], supabaseProducts: CatalogProduct[]): CatalogProduct[] {
  const csvIds = new Set(csv.map(p => p.id));
  const fromSupabase = supabaseProducts.filter(p => !csvIds.has(p.id));
  return [...csv, ...fromSupabase];
}
