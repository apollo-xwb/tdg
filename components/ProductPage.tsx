import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppView, CatalogProduct, CatalogProductVariant } from '../types';
import { EXCHANGE_RATES, RING_SIZE_STANDARDS, getMetalSwatchGradient, groupMetalsByType, parseMetalLabel } from '../constants';
import { getSizesForSystem } from '../ringSizeData';
import { RING_SYSTEMS } from '../ringSizeData';
import type { RingSizeRow } from '../ringSizeData';
import CustomSelect from './CustomSelect';
import ProductModelViewer from './ProductModelViewer';
import GlowingOrbSizeControl from './GlowingOrbSizeControl';
import RingSizeTable from './RingSizeTable';
import { ArrowLeft, ShoppingBag, ChevronDown, Ruler, BarChart3 } from 'lucide-react';

/** Get effective variant for display */
function getEffectiveVariant(p: CatalogProduct, selectedIndex: number): CatalogProductVariant | null {
  const variants = p.variants;
  if (!variants?.length) return null;
  const idx = Math.max(0, Math.min(selectedIndex, variants.length - 1));
  return variants[idx];
}

interface ProductPageProps {
  catalogProducts: CatalogProduct[];
  setView: (view: AppView) => void;
  currency?: string;
  theme?: 'dark' | 'light';
}

const ProductPage: React.FC<ProductPageProps> = ({ catalogProducts, setView, currency = 'ZAR', theme = 'dark' }) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [variantIndex, setVariantIndex] = useState(0);
  const [ringSizeStandard, setRingSizeStandard] = useState('UK/SA');
  const [ringSize, setRingSize] = useState('');
  const [engraving, setEngraving] = useState('');
  const [ringSizerOpen, setRingSizerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const product = useMemo(() => catalogProducts.find(p => p.id === productId), [catalogProducts, productId]);
  const variant = product ? getEffectiveVariant(product, variantIndex) : null;
  const displayPrice = variant ? variant.priceZAR : (product?.priceZAR ?? 0);
  const displayImage = variant?.imageUrl || product?.imageUrls?.[0];
  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;
  const isDark = theme === 'dark';

  const metals = useMemo(() => [...new Set((product?.variants ?? []).map(v => v.metal).filter(Boolean))], [product]);
  const metalGroups = useMemo(() => groupMetalsByType(metals), [metals]);
  const shapes = useMemo(() => [...new Set((product?.variants ?? []).map(v => v.shape).filter(Boolean))], [product]);
  const hasVariants = product?.variants && product.variants.length > 1;
  const currentMetalType = variant?.metal ? parseMetalLabel(variant.metal).metalType : '';
  const currentKarat = variant?.metal ? parseMetalLabel(variant.metal).karat : '';
  const activeMetalGroup = metalGroups.find(g => g.metalType === currentMetalType);
  const showKaratPills = activeMetalGroup && activeMetalGroup.karats.length > 1;

  const sysKey = ringSizeStandard === 'US/Canada' ? 'US/CA' : ringSizeStandard === 'EU/mm' ? 'FR/RU' : 'UK/SA';
  const ringSizeOptions = useMemo(() => getSizesForSystem(sysKey), [sysKey]);

  const shapeOptions = shapes.map(s => ({ value: s, label: s }));

  const handleVariantChange = (metal?: string, shape?: string) => {
    if (!product?.variants?.length) return;
    const idx = product.variants.findIndex(v =>
      (metal ? v.metal === metal : true) && (shape ? v.shape === shape : true)
    );
    if (idx >= 0) setVariantIndex(idx);
  };

  const sysCol = RING_SYSTEMS.find(s => s.key === sysKey)?.col ?? 'british';

  const handleRingSizeTableSelect = (row: RingSizeRow) => {
    const val = (row as Record<string, string>)[sysCol];
    if (val && val !== '—' && val !== '-') setRingSize(val);
  };

  const handleCheckout = () => {
    navigate('/checkout', {
      state: {
        product,
        variantIndex,
        priceZAR: displayPrice,
        metal: variant?.metal,
        shape: variant?.shape,
        ringSize: ringSize || undefined,
        ringSizeStandard: ringSize ? ringSizeStandard : undefined,
        engraving: engraving.trim() || undefined,
      },
    });
  };

  const handleBack = () => {
    navigate('/collection');
    setView('Collection');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-widest opacity-60">Product not found</p>
        <button onClick={handleBack} className="ml-4 underline">Back to Collection</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 animate-fadeIn">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Media — Back + Image as one sticky unit; top-24 clears fixed navbar; pb-8 creates spacing when content scrolls underneath */}
          <div className={`sticky top-24 z-30 self-start space-y-4 pb-8 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft size={14} /> Back to Collection
            </button>
            <div className="aspect-square relative rounded-2xl overflow-hidden border border-current/10 bg-black/20">
              {product.modelUrl ? (
                <ProductModelViewer
                  src={product.modelUrl}
                  alt={product.title}
                  poster={displayImage}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <img
                  src={displayImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-bold mb-2">
                {product.type || 'Engagement Ring'}
              </p>
              <h1 className="text-4xl lg:text-5xl font-thin tracking-tighter uppercase">{product.title}</h1>
              <p className="mt-4 text-sm opacity-80 leading-relaxed">{product.description}</p>
              {product.specs && product.specs.length > 0 && (
                <div className={`mt-6 border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-sm overflow-hidden`}>
                  <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-3 border-b border-current/10">
                    Specifications
                  </h3>
                  <dl className="divide-y divide-current/5">
                    {product.specs.map((s, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2.5 text-[11px]">
                        <dt className="font-medium opacity-80">{s.label}</dt>
                        <dd className="tabular-nums">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <p className={`text-2xl ${isDark ? 'font-light' : 'font-bold text-gray-900'}`}>
              {currency} {Math.round(displayPrice / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>

            {/* Custom dropdowns / swatches */}
            <div className="space-y-6">
              {hasVariants && metalGroups.length > 0 && (
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Metal</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 sm:gap-2.5" role="group" aria-label="Metal type">
                      {metalGroups.map(group => {
                        const isSelected = currentMetalType === group.metalType;
                        const selectMetal = () => handleVariantChange(group.fullMetals[0] ?? undefined, variant?.shape);
                        return (
                          <button
                            key={group.metalType}
                            type="button"
                            onClick={selectMetal}
                            className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 touch-manipulation ${
                              isSelected ? 'border-current scale-110 ring-2 ring-emerald-500/30' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ background: getMetalSwatchGradient(group.metalType) }}
                            title={group.metalType}
                            aria-pressed={isSelected}
                            aria-label={`Select ${group.metalType}`}
                          />
                        );
                      })}
                    </div>
                    {showKaratPills && activeMetalGroup && (
                      <div className="flex flex-wrap gap-1" role="group" aria-label="Karat options">
                        {activeMetalGroup.karats.map(karat => {
                          const fullMetal = activeMetalGroup.fullMetals.find(fm => parseMetalLabel(fm).karat === karat) ?? activeMetalGroup.fullMetals[0];
                          const isSelected = currentKarat === karat;
                          return (
                            <button
                              key={karat}
                              type="button"
                              onClick={() => handleVariantChange(fullMetal, variant?.shape)}
                              className={`px-2.5 py-1.5 text-[9px] uppercase tracking-wider rounded-sm border transition-all touch-manipulation ${
                                isSelected
                                  ? isDark ? 'bg-white/15 border-current font-bold' : 'bg-emerald-50 border-emerald-600 font-bold'
                                  : isDark ? 'border-white/30 opacity-70 hover:opacity-100' : 'border-gray-300 opacity-70 hover:opacity-100'
                              }`}
                            >
                              {karat}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {variant?.metal && (
                      <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'opacity-80' : 'text-gray-600'}`} aria-live="polite">
                        {variant.metal}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {hasVariants && shapes.length > 1 && (
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Shape</label>
                  <CustomSelect
                    options={shapeOptions}
                    value={variant?.shape ?? ''}
                    onChange={v => handleVariantChange(variant?.metal, v)}
                    placeholder="Select shape"
                    theme={theme}
                    className="max-w-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Ring size standard</label>
                <CustomSelect
                  options={RING_SIZE_STANDARDS.map(s => ({ value: s, label: s }))}
                  value={ringSizeStandard}
                  onChange={v => { setRingSizeStandard(v); setRingSize(''); }}
                  placeholder="Select standard"
                  theme={theme}
                  className="max-w-xs"
                />
              </div>
              {ringSizeOptions.length > 0 && (
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Ring size</label>
                  <CustomSelect
                    options={ringSizeOptions}
                    value={ringSize}
                    onChange={setRingSize}
                    placeholder="Select size"
                    theme={theme}
                    className="max-w-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Engraving (optional)</label>
                <input
                  type="text"
                  value={engraving}
                  onChange={e => setEngraving(e.target.value)}
                  placeholder="e.g. Forever & Always"
                  className={`w-full max-w-md p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-white/5 border-white/20 text-white placeholder:opacity-50' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              {/* Ring size guide — collapsible */}
              <div className={`border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-sm overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => setRingSizerOpen(o => !o)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                    <Ruler size={14} /> Find your ring size
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${ringSizerOpen ? 'rotate-180' : ''}`} />
                </button>
                {ringSizerOpen && (
                  <div className={`p-4 pt-0 space-y-4 ${isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
                    <p className="text-[9px] opacity-70">Use the slider to visualize size, or tap a row in the chart to select.</p>
                    <GlowingOrbSizeControl theme={theme} initialDiameterMM={17} stageSize={180} />
                    <div className={isDark ? '' : 'ring-1 ring-black/10 rounded-sm overflow-hidden'}>
                      <RingSizeTable onSelectRow={handleRingSizeTableSelect} />
                    </div>
                  </div>
                )}
              </div>

              {/* Variant comparison table — collapsible */}
              {hasVariants && product.variants && product.variants.length > 1 && (
                <div className={`border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-sm overflow-hidden`}>
                  <button
                    type="button"
                    onClick={() => setComparisonOpen(o => !o)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                      <BarChart3 size={14} /> Compare variants
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${comparisonOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {comparisonOpen && (
                    <div className={`p-4 pt-0 overflow-x-auto ${isDark ? 'border-t border-white/10' : 'border-t border-gray-200'}`}>
                      <table className="w-full min-w-[280px] text-left text-[10px]">
                        <thead>
                          <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                            <th className="py-2 pr-4 font-bold uppercase tracking-wider">Metal</th>
                            <th className="py-2 pr-4 font-bold uppercase tracking-wider">Shape</th>
                            <th className="py-2 font-bold uppercase tracking-wider">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((v, i) => (
                            <tr
                              key={i}
                              onClick={() => setVariantIndex(i)}
                              className={`cursor-pointer transition-colors ${variantIndex === i ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-50') : ''} ${isDark ? 'hover:bg-white/5 border-b border-white/5' : 'hover:bg-gray-50 border-b border-gray-100'}`}
                            >
                              <td className="py-2.5 pr-4">{v.metal}</td>
                              <td className="py-2.5 pr-4">{v.shape || '—'}</td>
                              <td className="py-2.5 font-medium">{currency} {Math.round(v.priceZAR / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full max-w-md py-5 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
            >
              <ShoppingBag size={20} /> Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
