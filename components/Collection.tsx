import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppView, CatalogProduct, CatalogProductVariant, Lead } from '../types';
import { EXCHANGE_RATES, getMetalSwatchGradient, groupMetalsByType, parseMetalLabel, SETTING_DATA, SHAPE_DATA } from '../constants';
import { MessageSquare, X, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import ProductModelViewer from './ProductModelViewer';
import CustomSelect from './CustomSelect';
import Showcase from './Showcase';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'type' | 'metal';

interface CollectionProps {
  catalogProducts: CatalogProduct[];
  addLead: (lead: Lead) => void;
  setView: (view: AppView) => void;
  currency?: string;
  theme?: 'dark' | 'light';
}

/** Get effective price for sorting (min of variants or base) */
function getSortPrice(p: CatalogProduct): number {
  if (p.variants?.length) {
    return Math.min(...p.variants.map(v => v.priceZAR));
  }
  return p.priceZAR ?? 0;
}

/** Get effective variant for display (selected or first) */
function getEffectiveVariant(p: CatalogProduct, selectedIndex: number): CatalogProductVariant | null {
  const variants = p.variants;
  if (!variants?.length) return null;
  const idx = Math.max(0, Math.min(selectedIndex, variants.length - 1));
  return variants[idx];
}

/** Get all shapes present in products (from variants or product) */
function getProductShapes(p: CatalogProduct): string[] {
  const fromVariants = (p.variants ?? []).map(v => v.shape).filter(Boolean);
  if (fromVariants.length) return [...new Set(fromVariants)];
  return p.shape ? [p.shape] : [];
}

/** Get all metal types present in products */
function getProductMetalTypes(p: CatalogProduct): string[] {
  const metals = (p.variants ?? []).map(v => v.metal).filter(Boolean);
  if (!metals.length && p.metal) return [parseMetalLabel(p.metal).metalType];
  return [...new Set(groupMetalsByType(metals).map(g => g.metalType))];
}

/** Get setting style from product (product-level only; variants don't have setting in type) */
function getProductSetting(p: CatalogProduct): string | null {
  return p.settingStyle ?? null;
}

const Collection: React.FC<CollectionProps> = ({ catalogProducts, addLead, setView, currency = 'ZAR', theme = 'dark' }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [filterShape, setFilterShape] = useState<string | null>(null);
  const [filterMetal, setFilterMetal] = useState<string | null>(null);
  const [filterPriceMin, setFilterPriceMin] = useState<number | null>(null);
  const [filterPriceMax, setFilterPriceMax] = useState<number | null>(null);
  const [filterSetting, setFilterSetting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVariantByProduct, setSelectedVariantByProduct] = useState<Record<string, number>>({});
  const [enquiryProduct, setEnquiryProduct] = useState<CatalogProduct | null>(null);
  const [enquiryVariantIndex, setEnquiryVariantIndex] = useState<number>(0);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'collection' | 'showcase'>('collection');

  const active = useMemo(() => catalogProducts.filter(p => p.isActive !== false), [catalogProducts]);

  const allShapes = useMemo(() => {
    const set = new Set<string>();
    active.forEach(p => getProductShapes(p).forEach(s => set.add(s)));
    return [...set].sort();
  }, [active]);

  const allMetalTypes = useMemo(() => {
    const set = new Set<string>();
    active.forEach(p => getProductMetalTypes(p).forEach(m => set.add(m)));
    return [...set].sort();
  }, [active]);

  const allSettings = useMemo(() => {
    const set = new Set<string>();
    active.forEach(p => {
      const s = getProductSetting(p);
      if (s) set.add(s);
    });
    return [...set].sort((a, b) => (SETTING_DATA[a] ? 0 : 1) - (SETTING_DATA[b] ? 0 : 1));
  }, [active]);

  const filtered = useMemo(() => {
    return active.filter(p => {
      if (filterShape) {
        const shapes = getProductShapes(p);
        if (!shapes.some(s => s.toLowerCase() === filterShape.toLowerCase())) return false;
      }
      if (filterMetal) {
        const metals = getProductMetalTypes(p);
        if (!metals.some(m => m === filterMetal)) return false;
      }
      if (filterSetting) {
        const s = getProductSetting(p);
        if (!s || s !== filterSetting) return false;
      }
      const price = getSortPrice(p);
      if (filterPriceMin != null && price < filterPriceMin) return false;
      if (filterPriceMax != null && price > filterPriceMax) return false;
      return true;
    });
  }, [active, filterShape, filterMetal, filterSetting, filterPriceMin, filterPriceMax]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        break;
      case 'price-asc':
        list.sort((a, b) => getSortPrice(a) - getSortPrice(b));
        break;
      case 'price-desc':
        list.sort((a, b) => getSortPrice(b) - getSortPrice(a));
        break;
      case 'type':
        list.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        break;
      case 'metal':
        list.sort((a, b) => (a.metal || '').localeCompare(b.metal || ''));
        break;
      default:
        break;
    }
    return list;
  }, [filtered, sortBy]);

  const hasActiveFilters = filterShape || filterMetal || filterSetting || filterPriceMin != null || filterPriceMax != null;

  const handleEnquireSubmit = () => {
    if (!enquiryProduct) return;
    const variant = getEffectiveVariant(enquiryProduct, enquiryVariantIndex);
    const variantInfo = variant ? ` (${[variant.metal, variant.shape].filter(Boolean).join(' / ')})` : '';
    const lead: Lead = {
      id: `COL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: enquiryName.trim() || 'Collection enquirer',
      email: enquiryEmail.trim() || '',
      phone: enquiryPhone.trim() || '',
      requestType: 'Collection Enquiry',
      description: `Enquiry about: ${enquiryProduct.title}${variantInfo}. ${enquiryMessage.trim()}`.trim(),
      date: new Date().toLocaleDateString(),
      status: 'New',
      catalogProductId: enquiryProduct.id,
      source: 'Collection Enquiry'
    };
    addLead(lead);
    setEnquiryProduct(null);
    setEnquiryVariantIndex(0);
    setEnquiryName('');
    setEnquiryEmail('');
    setEnquiryPhone('');
    setEnquiryMessage('');
    setView('Chatbot');
  };

  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;

  return (
    <div className="w-full px-6 lg:px-8 py-12 animate-fadeIn">
      <div className={activeTab === 'collection' ? 'max-w-6xl mx-auto space-y-12' : 'space-y-10'}>
      <header className={`flex flex-col gap-6 pb-10 ${activeTab === 'collection' ? 'border-b border-current/10' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Curated designs</p>
            <h1 className="text-5xl font-thin tracking-tighter uppercase">Collection</h1>
            <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setActiveTab('collection')}
                className={`px-3 py-1.5 rounded-full border text-[9px] font-semibold transition-all ${
                  activeTab === 'collection'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : theme === 'dark'
                      ? 'border-white/20 text-white/80 hover:bg-white/5'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Our collection
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('showcase')}
                className={`px-3 py-1.5 rounded-full border text-[9px] font-semibold transition-all ${
                  activeTab === 'showcase'
                    ? 'bg-black text-white border-black shadow-sm'
                    : theme === 'dark'
                      ? 'border-white/20 text-white/80 hover:bg-white/5'
                      : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Online showcase
              </button>
            </div>
          </div>
          {activeTab === 'collection' && (
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[10px] uppercase tracking-wider font-bold transition-all ${
                  hasActiveFilters ? 'border-emerald-500/50 bg-emerald-500/10' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && `(${[filterShape, filterMetal, filterSetting, filterPriceMin, filterPriceMax].filter(Boolean).length})`}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase opacity-68">Sort</span>
                <CustomSelect
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price-asc', label: 'Price: low → high' },
                    { value: 'price-desc', label: 'Price: high → low' },
                    { value: 'type', label: 'Type' },
                    { value: 'metal', label: 'Metal' },
                  ]}
                  value={sortBy}
                  onChange={v => setSortBy(v as SortKey)}
                  theme={theme}
                  className="w-48"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'collection' && showFilters && (
        <div className={`p-6 rounded-sm border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'} space-y-6 animate-fadeIn`}>
          <h3 className="text-[10px] uppercase tracking-widest font-bold">Filter by</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allShapes.length > 0 && (
              <div>
                <label className="block text-[11px] uppercase opacity-70 mb-2">Stone shape</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterShape(null)}
                    className={`p-2 rounded-sm border text-[9px] uppercase tracking-wider transition-all ${
                      !filterShape ? 'border-emerald-500/50 bg-emerald-500/10 font-bold' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {allShapes.map(shape => {
                    const shapeData = SHAPE_DATA[shape];
                    const isSelected = filterShape === shape;
                    return (
                      <button
                        key={shape}
                        onClick={() => setFilterShape(isSelected ? null : shape)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-sm border transition-all min-w-[56px] touch-manipulation ${
                          isSelected ? 'border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                        }`}
                        title={shape}
                      >
                        {shapeData?.img ? (
                          <img src={shapeData.img} alt={shape} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center text-[10px] font-bold">{shape[0]}</span>
                        )}
                        <span className="text-[8px] truncate max-w-full">{shape}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {allMetalTypes.length > 0 && (
              <div>
                <label className="block text-[11px] uppercase opacity-70 mb-2">Metal</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterMetal(null)}
                    className={`p-2 rounded-sm border text-[11px] uppercase tracking-wider transition-all ${
                      !filterMetal ? 'border-emerald-500/50 bg-emerald-500/10 font-bold' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {allMetalTypes.map(metal => {
                    const isSelected = filterMetal === metal;
                    return (
                      <button
                        key={metal}
                        onClick={() => setFilterMetal(isSelected ? null : metal)}
                        className={`w-9 h-9 rounded-full border-2 transition-all touch-manipulation ${
                          isSelected ? 'border-emerald-500/50 ring-2 ring-emerald-500/30 scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ background: getMetalSwatchGradient(metal) }}
                        title={metal}
                        aria-label={metal}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {allSettings.length > 0 && (
              <div>
                <label className="block text-[11px] uppercase opacity-70 mb-2">Setting</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterSetting(null)}
                    className={`p-2 rounded-sm border text-[11px] uppercase tracking-wider transition-all ${
                      !filterSetting ? 'border-emerald-500/50 bg-emerald-500/10 font-bold' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {allSettings.map(setting => {
                    const isSelected = filterSetting === setting;
                    const settingData = SETTING_DATA[setting];
                    return (
                      <button
                        key={setting}
                        onClick={() => setFilterSetting(isSelected ? null : setting)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-sm border transition-all min-w-[56px] touch-manipulation ${
                          isSelected ? 'border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30' : theme === 'dark' ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'
                        }`}
                        title={setting}
                      >
                        {settingData?.img ? (
                          <img src={settingData.img} alt={setting} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center text-[10px] font-bold">{setting.slice(0, 2)}</span>
                        )}
                        <span className="text-[10px] truncate max-w-full">{setting}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] uppercase opacity-70 mb-2">Price range (ZAR)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterPriceMin ?? ''}
                  onChange={e => setFilterPriceMin(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className={`w-24 px-2 py-1.5 text-[10px] rounded-sm border ${
                    theme === 'dark' ? 'bg-black/30 border-white/20' : 'bg-white border-gray-200'
                  }`}
                />
                <span className="text-[11px] opacity-60">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterPriceMax ?? ''}
                  onChange={e => setFilterPriceMax(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className={`w-24 px-2 py-1.5 text-[10px] rounded-sm border ${
                    theme === 'dark' ? 'bg-black/30 border-white/20' : 'bg-white border-gray-200'
                  }`}
                />
                {(filterPriceMin != null || filterPriceMax != null) && (
                  <button
                    onClick={() => { setFilterPriceMin(null); setFilterPriceMax(null); }}
                    className="text-[11px] uppercase opacity-70 hover:opacity-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] opacity-60">
            Showing {sorted.length} of {active.length} designs
          </p>
        </div>
      )}

      {activeTab === 'collection' ? (
        sorted.length === 0 ? (
          <p className="text-center py-24 opacity-60 uppercase tracking-widest text-[10px]">No designs in the collection yet. Check back soon.</p>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map(p => {
            const variantIdx = selectedVariantByProduct[p.id] ?? 0;
            const variant = getEffectiveVariant(p, variantIdx);
            const displayPrice = variant ? variant.priceZAR : (p.priceZAR ?? 0);
            const displayImage = variant?.imageUrl || p.imageUrls?.[0];
            const metals = [...new Set((p.variants ?? []).map(v => v.metal).filter(Boolean))];
            const metalGroups = groupMetalsByType(metals);
            const shapes = [...new Set((p.variants ?? []).map(v => v.shape).filter(Boolean))];
            const hasVariants = p.variants && p.variants.length > 1;
            const currentMetalType = variant?.metal ? parseMetalLabel(variant.metal).metalType : '';
            const currentKarat = variant?.metal ? parseMetalLabel(variant.metal).karat : '';
            const activeGroup = metalGroups.find(g => g.metalType === currentMetalType);
            const showKaratPills = activeGroup && activeGroup.karats.length > 1;

            const selectVariantByMetal = (fullMetal: string) => {
              const idx = p.variants!.findIndex(v => v.metal === fullMetal && (variant?.shape ? v.shape === variant.shape : true));
              const fallback = p.variants!.findIndex(v => v.metal === fullMetal);
              setSelectedVariantByProduct(prev => ({ ...prev, [p.id]: idx >= 0 ? idx : fallback >= 0 ? fallback : 0 }));
            };

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/collection/${p.id}`)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/collection/${p.id}`); } }}
                className="glass border border-current/5 rounded-sm overflow-hidden flex flex-col cursor-pointer hover:border-current/15 transition-colors"
              >
                <div className="aspect-square relative bg-black/20 min-h-[240px]">
                  {p.modelUrl ? (
                    <ProductModelViewer src={p.modelUrl} alt={p.title} poster={displayImage} className="absolute inset-0 w-full h-full" />
                  ) : (
                    <img
                      src={displayImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow" onClick={e => e.stopPropagation()}>
                  <h3 className="text-[11px] uppercase tracking-widest font-bold">{p.title}</h3>
                  <p className="text-[11px] opacity-68 mt-1 line-clamp-2">{p.description || [p.type, variant?.metal || p.metal, variant?.shape || p.shape, p.stoneCategory].filter(Boolean).join(' • ')}</p>
                  {hasVariants && metalGroups.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Metal type">
                        {metalGroups.map(group => {
                          const isSelected = currentMetalType === group.metalType;
                          const handleClick = () => selectVariantByMetal(group.fullMetals[0] ?? '');
                          return (
                            <button
                              key={group.metalType}
                              type="button"
                              onClick={handleClick}
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
                      {showKaratPills && activeGroup && (
                        <div className="flex flex-wrap gap-1" role="group" aria-label="Karat options">
                          {activeGroup.karats.map(karat => {
                            const fullMetal = activeGroup.fullMetals.find(fm => parseMetalLabel(fm).karat === karat) ?? activeGroup.fullMetals[0];
                            const isSelected = currentKarat === karat;
                            return (
                              <button
                                key={karat}
                                type="button"
                                onClick={() => selectVariantByMetal(fullMetal)}
                                className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded-sm border transition-all touch-manipulation ${
                                  isSelected
                                    ? 'bg-white/15 border-current font-bold'
                                    : 'border-current/30 opacity-70 hover:opacity-100'
                                }`}
                              >
                                {karat}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {variant?.metal && (
                        <p className="text-[9px] uppercase tracking-wider opacity-80" aria-live="polite">
                          {variant.metal}
                        </p>
                      )}
                      {shapes.length > 1 && (
                        <CustomSelect
                          options={shapes.map(s => ({ value: s, label: s }))}
                          value={variant?.shape ?? ''}
                          onChange={shape => {
                            const metal = variant?.metal ?? '';
                            const idx = p.variants!.findIndex(v => v.shape === shape && (metal ? v.metal === metal : true));
                            setSelectedVariantByProduct(prev => ({ ...prev, [p.id]: idx >= 0 ? idx : 0 }));
                          }}
                          theme={theme}
                          compact
                          className="min-w-[80px] sm:min-w-[100px]"
                        />
                      )}
                    </div>
                  )}
                  <p className={`text-sm mt-4 ${theme === 'light' ? 'font-bold text-gray-900' : 'font-thin'}`}>
                    {currency} {Math.round(displayPrice / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-100 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Buy
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setEnquiryProduct(p); setEnquiryVariantIndex(variantIdx); }}
                      className="flex-1 py-3 border border-current/20 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} /> Enquire
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        <Showcase theme={theme} />
      )}
      </div>

      {activeTab === 'collection' && enquiryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn" onClick={() => setEnquiryProduct(null)}>
          <div className="glass border border-white/10 rounded-sm p-8 max-w-md w-full space-y-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] uppercase tracking-widest font-bold">Enquire: {enquiryProduct.title}</h3>
              <button onClick={() => setEnquiryProduct(null)} className="p-2 opacity-60 hover:opacity-100"><X size={18}/></button>
            </div>
            {enquiryProduct.variants && enquiryProduct.variants.length > 1 && (
              <div className="flex flex-wrap gap-3 items-end">
                {(() => {
                  const enquiryMetals = [...new Set(enquiryProduct.variants!.map(v => v.metal).filter(Boolean))];
                  const enquiryGroups = groupMetalsByType(enquiryMetals);
                  const enquiryVariant = getEffectiveVariant(enquiryProduct, enquiryVariantIndex);
                  const enquiryMetalType = enquiryVariant?.metal ? parseMetalLabel(enquiryVariant.metal).metalType : '';
                  const enquiryKarat = enquiryVariant?.metal ? parseMetalLabel(enquiryVariant.metal).karat : '';
                  const enquiryShape = enquiryVariant?.shape ?? '';
                  const enquiryActiveGroup = enquiryGroups.find(g => g.metalType === enquiryMetalType);
                  const enquiryShowKarat = enquiryActiveGroup && enquiryActiveGroup.karats.length > 1;

                  const selectEnquiryVariant = (fullMetal: string) => {
                    const idx = enquiryProduct.variants!.findIndex(v => v.metal === fullMetal && (enquiryShape ? v.shape === enquiryShape : true));
                    const fallback = enquiryProduct.variants!.findIndex(v => v.metal === fullMetal);
                    setEnquiryVariantIndex(idx >= 0 ? idx : fallback >= 0 ? fallback : 0);
                  };

                  return enquiryGroups.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-[8px] uppercase opacity-60 mb-1.5">Metal</label>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="Metal type">
                        {enquiryGroups.map(group => {
                          const isSelected = enquiryMetalType === group.metalType;
                          return (
                            <button
                              key={group.metalType}
                              type="button"
                              onClick={() => selectEnquiryVariant(group.fullMetals[0] ?? '')}
                              className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 touch-manipulation ${
                                isSelected ? 'border-white scale-110 ring-2 ring-emerald-500/30' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                              }`}
                              style={{ background: getMetalSwatchGradient(group.metalType) }}
                              title={group.metalType}
                              aria-pressed={isSelected}
                              aria-label={`Select ${group.metalType}`}
                            />
                          );
                        })}
                      </div>
                      {enquiryShowKarat && enquiryActiveGroup && (
                        <div className="flex flex-wrap gap-1" role="group" aria-label="Karat options">
                          {enquiryActiveGroup.karats.map(karat => {
                            const fullMetal = enquiryActiveGroup.fullMetals.find(fm => parseMetalLabel(fm).karat === karat) ?? enquiryActiveGroup.fullMetals[0];
                            const isSelected = enquiryKarat === karat;
                            return (
                              <button
                                key={karat}
                                type="button"
                                onClick={() => selectEnquiryVariant(fullMetal)}
                                className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded-sm border transition-all touch-manipulation ${
                                  isSelected ? 'bg-white/15 border-white font-bold' : 'border-white/30 opacity-70 hover:opacity-100'
                                }`}
                              >
                                {karat}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {enquiryVariant?.metal && (
                        <p className="text-[9px] uppercase tracking-wider opacity-80" aria-live="polite">
                          {enquiryVariant.metal}
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
                {[...new Set(enquiryProduct.variants.map(v => v.shape).filter(Boolean))].length > 1 && (
                  <div>
                    <label className="block text-[8px] uppercase opacity-60 mb-1">Shape</label>
                    <CustomSelect
                      options={[...new Set(enquiryProduct.variants.map(v => v.shape).filter(Boolean))].map(s => ({ value: s, label: s }))}
                      value={getEffectiveVariant(enquiryProduct, enquiryVariantIndex)?.shape ?? ''}
                      onChange={shape => {
                        const metal = getEffectiveVariant(enquiryProduct, enquiryVariantIndex)?.metal ?? '';
                        const idx = enquiryProduct.variants!.findIndex(v => v.shape === shape && (metal ? v.metal === metal : true));
                        setEnquiryVariantIndex(idx >= 0 ? idx : 0);
                      }}
                      theme="dark"
                      compact
                      className="min-w-[100px] sm:min-w-[120px]"
                    />
                  </div>
                )}
              </div>
            )}
            <p className="text-[12px] opacity-68">We’ll get in touch to discuss this design and next steps.</p>
            <input type="text" placeholder="Name" value={enquiryName} onChange={e => setEnquiryName(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <input type="email" placeholder="Email" value={enquiryEmail} onChange={e => setEnquiryEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <input type="tel" placeholder="Phone" value={enquiryPhone} onChange={e => setEnquiryPhone(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <textarea placeholder="Message (optional)" value={enquiryMessage} onChange={e => setEnquiryMessage(e.target.value)} rows={2} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30 resize-none" />
            <button onClick={handleEnquireSubmit} className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200">
              Send enquiry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
