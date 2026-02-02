/**
 * Parses Shopify product export CSV into CatalogProduct format with variants.
 * Products are grouped by Handle; each metal/shape combination is a variant.
 */
import Papa from 'papaparse';
import type { CatalogProduct, ProductSpec } from '../types';

// Vite: import raw CSV as string (bundled at build time)
import csvText from '../src/Products/products_export_1.csv?raw';

export interface CsvProductRow {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  'Option1 Value': string;
  'Option2 Value': string;
  'Variant Price': string;
  'Image Src': string;
  'Variant Image': string;
  Status: string;
}

/** Strip HTML tags for plain-text description */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse specs table from Body HTML (Band width, Side stones count, etc.) */
function parseSpecsFromHtml(html: string): ProductSpec[] {
  if (!html) return [];
  const specs: ProductSpec[] = [];
  const rows = html.split(/<tr[\s>]/i);
  for (const row of rows) {
    const strongMatch = row.match(/<strong[^>]*>([^<]+)<\/strong>/i);
    const tds: string[] = [];
    let m: RegExpExecArray | null;
    const rowRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    while ((m = rowRegex.exec(row)) !== null) tds.push(stripHtml(m[1]).trim());
    if (strongMatch && tds.length >= 2) {
      const label = stripHtml(strongMatch[1]).trim();
      const value = tds[1];
      if (label && value) specs.push({ label, value });
    }
  }
  return specs;
}

/** Parse price string to number (ZAR) */
function parsePrice(val: string): number {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

/** Map CSV metal string to our Metal type (or keep as string for display) */
function normalizeMetal(m: string): string {
  if (!m) return '';
  return m.trim();
}

/** Map CSV shape to our Shape type (or keep as string) */
function normalizeShape(s: string): string {
  if (!s) return '';
  return s.trim();
}

/** Load and parse CSV products. Returns CatalogProduct[] with variants. */
export function loadProductsFromCsv(): CatalogProduct[] {
  const parsed = Papa.parse<CsvProductRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.warn('[productsFromCsv] Parse errors:', parsed.errors);
  }

  const rows = parsed.data ?? [];
  const byHandle = new Map<string, { title: string; body: string; status: string; variants: CatalogProductVariant[]; imageUrls: string[] }>();

  for (const row of rows) {
    const handle = (row.Handle ?? '').trim();
    if (!handle) continue;

    const metal = normalizeMetal(row['Option1 Value'] ?? '');
    const shape = normalizeShape(row['Option2 Value'] ?? '');
    const priceZAR = parsePrice(row['Variant Price'] ?? '');
    const imageSrc = (row['Image Src'] ?? '').trim();
    const variantImage = (row['Variant Image'] ?? '').trim();
    const imageUrl = variantImage || imageSrc || undefined;

    let entry = byHandle.get(handle);
    if (!entry) {
      entry = {
        title: (row.Title ?? '').trim(),
        body: (row['Body (HTML)'] ?? '').trim(),
        status: (row.Status ?? '').trim(),
        variants: [],
        imageUrls: [],
      };
      byHandle.set(handle, entry);
    }

    // First row per handle has product-level data; later rows may have empty title/body
    if (row.Title?.trim()) entry.title = row.Title.trim();
    if (row['Body (HTML)']?.trim()) entry.body = row['Body (HTML)'].trim();
    if (row.Status?.trim()) entry.status = row.Status.trim();

    // Collect unique image URLs (main product images)
    if (imageSrc && !entry.imageUrls.includes(imageSrc)) {
      entry.imageUrls.push(imageSrc);
    }

    // Only add variant if it has metal or shape (skip "default" variant with no options)
    const hasOptions = metal || shape;
    if (hasOptions && priceZAR > 0) {
      entry.variants.push({
        metal,
        shape,
        priceZAR,
        imageUrl: imageUrl || undefined,
      });
    } else if (!hasOptions && priceZAR > 0) {
      // Default variant (no metal/shape) - add as a single variant
      entry.variants.push({
        metal: '',
        shape: '',
        priceZAR,
        imageUrl,
      });
    }
  }

  const now = new Date().toISOString();
  const products: CatalogProduct[] = [];

  for (const [handle, entry] of byHandle) {
    const isActive = entry.status.toLowerCase() === 'active';
    const variants = entry.variants;

    // Use first variant's price as base; Collection will use selected variant
    const priceZAR = variants.length > 0 ? Math.min(...variants.map(v => v.priceZAR)) : 0;
    const firstVariant = variants[0];
    const imageUrls = entry.imageUrls.length
      ? entry.imageUrls
      : firstVariant?.imageUrl
        ? [firstVariant.imageUrl]
        : [];

    const specs = parseSpecsFromHtml(entry.body);
    const product: CatalogProduct = {
      id: `csv-${handle}`,
      jewelerId: 'tdg',
      title: entry.title || handle,
      description: stripHtml(entry.body) || entry.title || handle,
      imageUrls,
      priceZAR,
      isActive,
      createdAt: now,
      updatedAt: now,
      type: 'Engagement Ring',
      specs: specs.length > 0 ? specs : undefined,
    };

    if (variants.length > 1) {
      product.variants = variants;
      product.priceZAR = variants[0]?.priceZAR ?? priceZAR;
      product.metal = firstVariant?.metal ? (firstVariant.metal as CatalogProduct['metal']) : undefined;
      product.shape = firstVariant?.shape ? (firstVariant.shape as CatalogProduct['shape']) : undefined;
    } else if (variants.length === 1) {
      product.priceZAR = variants[0].priceZAR;
      product.metal = (variants[0].metal as CatalogProduct['metal']) || undefined;
      product.shape = (variants[0].shape as CatalogProduct['shape']) || undefined;
      if (variants[0].imageUrl) {
        product.imageUrls = [variants[0].imageUrl, ...product.imageUrls.filter(u => u !== variants[0].imageUrl)];
      }
    }

    if (variants.length > 0 || priceZAR > 0) {
      products.push(product);
    }
  }

  return products;
}
