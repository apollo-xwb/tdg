
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { JewelleryConfig, UserState, OrderStatus, JewelleryType, StoneType, StoneCategory } from '../types';
import { BASE_PRICE, LAB_DIAMOND_PRICE_FACTOR, NATURAL_DIAMOND_BASE, MOISSANITE_BASE, GEMSTONE_BASE, METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS, EXCHANGE_RATES, JEWELLERY_TYPES, RING_SIZE_STANDARDS, GIA_LOGO, EGI_LOGO, LOGO_URL, BUDGET_OPTIONS, GEMSTONE_TYPES, TIMELINE_OPTIONS, JEWELLERY_GUIDE_TYPES, DONTPAYRETAIL } from '../constants';
import { Download, Save, Info, ChevronRight, ChevronLeft, Ruler, AlertCircle, Eye, User, Mail, Shield, CheckCircle, Send, Clock, BadgeCheck, Wand2, HelpCircle, MessageSquare, CreditCard, Upload } from 'lucide-react';

interface Props {
  userState: UserState;
  onSave: (d: JewelleryConfig) => void;
  onUpdateDraft: (d: Partial<JewelleryConfig>) => void;
}

// UK/SA Ring Sizes - Internal Diameter in mm (accurate measurements from conversion chart)
// Based on official ring size conversion standards
const SIZE_TO_MM: Record<string, number> = {
  'A': 11.95,      // A (1/2) - from chart
  'B': 12.37,      // B (1) - from chart
  'C': 12.78,      // C (1 1/2) - from chart
  'D': 13.21,      // D (2) - from chart
  'E': 13.61,      // E (2 1/2) - from chart
  'F': 14.05,      // F (3) - from chart
  'G': 14.48,      // Interpolated between F and H
  'H': 14.88,      // Interpolated
  'I': 15.04,      // I (4 1/4) - from chart
  'J': 15.37,      // Interpolated between I and K
  'K': 15.70,      // Interpolated (J 1/2 is 15.70)
  'L': 16.10,      // Interpolated
  'M': 16.51,      // M (6) - from chart
  'N': 16.93,      // Interpolated
  'O': 17.35,      // O (7) - from chart
  'P': 17.77,      // Interpolated
  'Q': 18.19,      // Q (8) - from chart
  'R': 18.80,      // Interpolated
  'S': 19.41,      // S 3/4 (9 1/2) - from chart (closest to S)
  'T': 19.80,      // Interpolated
  'U': 20.20,      // U 1/2 (10 1/2) - from chart (closest to U)
  'V': 20.64,      // Interpolated
  'W': 21.08,      // W 3/4 (11 1/2) - from chart (closest to W)
  'X': 21.28,      // Interpolated
  'Y': 21.49,      // Y (12) - from chart
  'Z': 22.00       // Interpolated (Z+1 is 22.33)
};
const RING_SIZES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const MAIN_METALS = ['Platinum', '18K Gold', '14K Gold', 'White Gold', 'Rose Gold', 'Sterling Silver', 'Other'] as const;

const RingBuilder: React.FC<Props> = ({ userState, onSave, onUpdateDraft }) => {
  const [config, setConfig] = useState<Partial<JewelleryConfig>>(() => ({
    id: `TDG-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
    status: 'Quoted',
    isApproved: false,
    date: new Date().toLocaleDateString(),
    carat: 1.0,
    ringSizeStandard: 'UK/SA',
    ringSize: 'M',
    budget: 0,
    isDiscreet: false,
    ...userState.builderDraft
  }));

  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const draft: Partial<JewelleryConfig> = {
      type: config.type,
      stoneType: config.stoneType,
      stoneCategory: config.stoneCategory,
      metal: config.metal,
      settingStyle: config.settingStyle,
      shape: config.shape,
      ringSize: config.ringSize,
      ringSizeStandard: config.ringSizeStandard,
      budget: config.budget,
      qualityTier: config.qualityTier,
      engraving: config.engraving,
      carat: config.carat,
      firstName: config.firstName,
      lastName: config.lastName,
      fullName: config.fullName,
      email: config.email,
      phone: config.phone,
      isDiscreet: config.isDiscreet,
      designInspirationUrl: config.designInspirationUrl,
      pinterestLink: config.pinterestLink,
      designDescription: config.designDescription,
      timeline: config.timeline,
      typeOtherDetail: config.typeOtherDetail
    };
    onUpdateDraft(draft);
  }, [config.type, config.stoneType, config.stoneCategory, config.metal, config.settingStyle, config.shape, config.ringSize, config.ringSizeStandard, config.budget, config.qualityTier, config.engraving, config.carat, config.firstName, config.lastName, config.fullName, config.email, config.phone, config.isDiscreet, config.designInspirationUrl, config.pinterestLink, config.designDescription, config.timeline, config.typeOtherDetail, onUpdateDraft]);

  const steps = useMemo(() => {
    if (config.type === 'Loose Stone') {
      return ['Loose: Origin', 'Loose: Budget', 'Loose: Shape', 'Loose: Quality', 'Contact'];
    }
    const s: string[] = ['Design Inspiration', 'Jewellery Type', 'Budget', 'Metal', 'Stones'];
    if (config.stoneCategory && config.stoneCategory !== 'None') s.push('Shape');
    if (['Engagement Ring', 'Wedding Band', 'Ring'].includes(config.type)) s.push('Setting');
    if (config.stoneCategory === 'Diamond' || config.stoneCategory === 'Moissanite') s.push('Quality Tier');
    s.push('Timeline');
    if (['Engagement Ring', 'Wedding Band', 'Ring'].includes(config.type)) s.push('Ring Size');
    s.push('Contact', 'Review');
    return s;
  }, [config.type, config.stoneCategory]);

  const canProceed = useMemo(() => {
    const cur = steps[step];
    if (cur === 'Design Inspiration') return true;
    if (cur === 'Jewellery Type') return !!config.type && (config.type !== 'Ring' || !!config.typeOtherDetail);
    if (cur === 'Budget') return (config.budget || 0) > 0;
    if (cur === 'Metal') return !!config.metal;
    if (cur === 'Stones') return !!config.stoneCategory && (config.stoneCategory === 'Diamond' || config.stoneCategory === 'None' || config.stoneCategory === 'Moissanite' || GEMSTONE_TYPES.includes(config.stoneCategory));
    if (cur === 'Shape') return !!config.shape;
    if (cur === 'Setting') return !!config.settingStyle;
    if (cur === 'Quality Tier') return !!config.qualityTier;
    if (cur === 'Timeline') return !!config.timeline;
    if (cur === 'Ring Size') return true;
    if (cur === 'Contact') return !!(config.fullName || (config.firstName && config.lastName)) && !!config.email;
    if (cur === 'Loose: Origin') return !!config.stoneType && (config.stoneType === 'Natural' || config.stoneType === 'Lab');
    if (cur === 'Loose: Budget') return (config.budget || 0) > 0;
    if (cur === 'Loose: Shape') return !!config.shape;
    if (cur === 'Loose: Quality') return !!config.qualityTier;
    return true;
  }, [step, config, steps]);

  const calculatePrice = (cfg: Partial<JewelleryConfig>) => {
    if (cfg.type === 'Loose Stone') {
      const stoneBase = NATURAL_DIAMOND_BASE * (cfg.stoneType === 'Lab' ? LAB_DIAMOND_PRICE_FACTOR : 1);
      const shapeFactor = SHAPE_DATA[cfg.shape!]?.factor || 1;
      const qualityFactor = QUALITY_TIERS[cfg.qualityTier || 'Balance Size & Quality']?.factor || 1;
      return Math.round((stoneBase * Math.pow(cfg.carat || 1, 1.95)) * shapeFactor * qualityFactor);
    }
    let price = BASE_PRICE;
    if (cfg.metal) price += METAL_DATA[cfg.metal]?.price || 0;
    if (cfg.settingStyle) price += SETTING_DATA[cfg.settingStyle]?.price || 0;
    if (cfg.stoneCategory && cfg.stoneCategory !== 'None' && cfg.stoneCategory !== 'Other') {
      let stoneBase = cfg.stoneCategory === 'Diamond' ? NATURAL_DIAMOND_BASE : GEMSTONE_BASE;
      if (cfg.stoneCategory === 'Moissanite') stoneBase = MOISSANITE_BASE;
      if (cfg.stoneType === 'Lab') stoneBase *= LAB_DIAMOND_PRICE_FACTOR;
      price += (stoneBase * Math.pow(cfg.carat || 1, 1.95)) * (SHAPE_DATA[cfg.shape!]?.factor || 1);
    } else if (cfg.stoneCategory === 'Other') {
      price += (GEMSTONE_BASE * Math.pow(cfg.carat || 1, 1.95)) * (SHAPE_DATA[cfg.shape!]?.factor || 1);
    }
    price *= (QUALITY_TIERS[cfg.qualityTier || 'Balance Size & Quality']?.factor || 1);
    if (cfg.engraving) price += 950;
    return Math.round(price);
  };

  const calculatedCost = useMemo(() => calculatePrice(config), [config]);

  const generateImg = async (cfg: Partial<JewelleryConfig> = config, applyToState = false) => {
    if (isGenerating) return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200';
    setIsGenerating(true);
    const fallback = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt: string;
      if (cfg.type === 'Loose Stone') {
        prompt = `A hyper-realistic 8K photograph of a loose ${cfg.shape} ${cfg.stoneType || 'natural'} diamond by The Diamond Guy. Single stone on a velvety surface. Master-level studio lighting, deep black minimalist background, macro jewelry shot.`;
      } else {
        const engraveText = cfg.engraving ? `, with the message "${cfg.engraving}" professionally engraved` : "";
        const stoneDesc = cfg.stoneCategory === 'None' || !cfg.stoneCategory ? "pure precious metal design without stones" : `${cfg.shape || 'Round'} ${cfg.stoneCategory}`;
        const extra = cfg.designDescription ? ` Design direction: ${cfg.designDescription}.` : "";
        prompt = `A hyper-realistic 8K photograph of a bespoke ${cfg.type} by The Diamond Guy. Crafted in ${cfg.metal || 'Platinum'}. Featuring ${stoneDesc}${engraveText}.${extra} Master-level studio lighting, deep black minimalist background, macro jewelry shot.`;
      }
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ text: prompt }] } });
      const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (data) {
        const url = `data:image/png;base64,${data}`;
        if (applyToState) setConfig(prev => ({ ...prev, imageUrl: url }));
        return url;
      }
    } catch (e: any) {
      console.error('Image generation error:', e);
      if (e?.status === 429 || e?.message?.includes('429')) console.warn('Rate limit exceeded.');
      if (applyToState) setConfig(prev => ({ ...prev, imageUrl: fallback }));
    } finally {
      setIsGenerating(false);
    }
    return fallback;
  };

  const applyDefaultsForReview = (cfg: Partial<JewelleryConfig>): Partial<JewelleryConfig> => {
    const c = { ...cfg };
    const isRing = ['Engagement Ring', 'Wedding Band', 'Ring'].includes(c.type!);
    if (c.type === 'Loose Stone') {
      if (!c.carat && (c.budget || 0) > 0 && c.qualityTier && c.shape) {
        const stoneBase = NATURAL_DIAMOND_BASE * (c.stoneType === 'Lab' ? LAB_DIAMOND_PRICE_FACTOR : 1);
        const sf = SHAPE_DATA[c.shape]?.factor || 1;
        const qf = QUALITY_TIERS[c.qualityTier]?.factor || 1;
        c.carat = Math.max(0.1, Math.min(10, Math.pow((c.budget! / (stoneBase * sf * qf)), 1 / 1.95)));
      }
      return c;
    }
    if (!c.qualityTier) c.qualityTier = 'Balance Size & Quality';
    if (c.stoneCategory === 'Diamond' && !c.shape) c.shape = 'Round';
    if (isRing && !c.settingStyle) c.settingStyle = 'Solitaire';
    if ((!c.shape || c.shape === 'N/A') && c.stoneCategory && c.stoneCategory !== 'Diamond' && c.stoneCategory !== 'None') c.shape = 'N/A';
    if (!c.shape && !isRing) c.shape = 'N/A';
    if (!c.carat || c.carat <= 0) {
      const qt = c.qualityTier || 'Balance Size & Quality';
      const base = BASE_PRICE; const mp = c.metal ? METAL_DATA[c.metal]?.price || 0 : 0;
      const sp = c.settingStyle ? SETTING_DATA[c.settingStyle]?.price || 0 : 0;
      const qf = QUALITY_TIERS[qt]?.factor || 1;
      const priceBeforeQuality = ((c.budget || 0) - (c.engraving ? 950 : 0)) / qf;
      const stonePrice = priceBeforeQuality - base - mp - sp;
      if (stonePrice > 0 && c.stoneCategory && c.stoneCategory !== 'None') {
        const stoneBase = c.stoneCategory === 'Diamond' ? NATURAL_DIAMOND_BASE : (c.stoneCategory === 'Moissanite' ? MOISSANITE_BASE : GEMSTONE_BASE);
        const adj = c.stoneType === 'Lab' ? stoneBase * LAB_DIAMOND_PRICE_FACTOR : stoneBase;
        const sFac = SHAPE_DATA[c.shape!]?.factor || 1;
        c.carat = Math.max(0.1, Math.min(10, Math.pow(stonePrice / (adj * sFac), 1 / 1.95)));
      } else c.carat = 1;
    }
    return c;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const withDefaults = applyDefaultsForReview(config) as Partial<JewelleryConfig>;
      setConfig(withDefaults);
      setComplete(true);
      generateImg(withDefaults, true);
    }
  };

  const handleSelectAndAdvance = (updateFn: () => void) => {
    updateFn();
    // Auto-advance after a short delay to allow state to update
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      }
    }, 100);
  };

  if (complete) return (
    <ConfigResult 
      config={{...config, priceZAR: calculatedCost} as JewelleryConfig} 
      currency={userState.currency} 
      theme={userState.theme}
      isGenerating={isGenerating} 
      onSave={(d) => { onSave(d); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 3000); }} 
      saved={savedSuccess}
      onUpdateConfig={setConfig}
      onRegenerateImage={generateImg}
      onApprove={(d) => { onSave({...d, status: 'Approved'} as JewelleryConfig); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 3000); }}
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col items-center animate-fadeIn">
      <div className="w-full max-w-4xl mb-12">
        <h1 className="text-2xl lg:text-3xl font-thin tracking-tighter text-center uppercase mb-2">Bespoke Configurator</h1>
        <p className="text-[9px] uppercase tracking-widest text-center opacity-50 mb-12">{DONTPAYRETAIL} — You&apos;re not paying retail.</p>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] lg:text-[12px] uppercase tracking-[0.6em] font-light text-current">{steps[step]}</h4>
          <span className="text-[10px] opacity-40 uppercase tracking-widest">{step + 1} / {steps.length}</span>
        </div>
        <div className="w-full h-[1px] bg-current/10">
          <div className="h-full bg-current transition-all duration-700" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div className="min-h-[450px]">
          {renderStep(steps[step], config, setConfig, step, steps.length, setStep, { currency: userState.currency, steps, hasInspiration: !!(config.designInspirationUrl || config.pinterestLink) })}
          <div className="mt-12 flex gap-6">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="flex-1 py-5 border border-current/10 text-[10px] uppercase tracking-[0.4em] font-light disabled:opacity-20 hover:bg-current/5 transition-all"><ChevronLeft className="inline mr-2" size={16}/> Back</button>
            <button onClick={handleNext} disabled={!canProceed} className={`flex-1 py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${canProceed ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
              {step === steps.length - 1 ? 'Finalize Masterpiece' : 'Continue'} <ChevronRight className="inline ml-2" size={16}/>
            </button>
          </div>
        </div>
        <div className="p-8 lg:p-10 glass rounded-sm space-y-10 border border-current/10">
          <h2 className="text-[11px] uppercase tracking-[0.6em] font-bold border-b border-current/10 pb-4">Indicative Brief</h2>
          <div className="space-y-4">
            {Object.entries(config).map(([k, v]) => {
              if (['id', 'status', 'isApproved', 'date', 'carat', 'ringSizeStandard', 'budget', 'isDiscreet', 'firstName', 'lastName', 'email', 'imageUrl', 'designInspirationUrl', 'certLink', 'videoLink', 'paymentLink', 'customNotes'].includes(k)) return null;
              if (k === 'ringSize' && !['Engagement Ring', 'Wedding Band', 'Ring'].includes(config.type!)) return null;
              if (!v || v === 'N/A' || v === 'None') return null;
              return (
                <div key={k} className="flex justify-between items-center text-[10px] uppercase tracking-widest opacity-60">
                  <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-bold text-current">{v as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderStep = (name: string, config: any, setConfig: any, step: number, totalSteps: number, setStep: any, opts?: { currency?: string; steps?: string[]; hasInspiration?: boolean }) => {
  const update = (updates: any) => setConfig((p: any) => ({ ...p, ...updates }));
  const currency = opts?.currency || 'ZAR';
  const rate = EXCHANGE_RATES[currency]?.rate || 1;
  const formatBudget = (zar: number) => `${currency} ${Math.round(zar / rate).toLocaleString()}`;
  const hasInspiration = opts?.hasInspiration;
  const contactIdx = (opts?.steps || []).indexOf('Contact');
  const selectAndAdvance = (value: any, updateFn?: () => void) => {
    if (updateFn) updateFn();
    else update(value);
    if (step < totalSteps - 1) setTimeout(() => setStep(step + 1), 150);
  };
  const handleSkipToContact = () => {
    const base: any = { metal: 'Platinum', stoneCategory: 'None', stoneType: 'N/A', shape: 'N/A', qualityTier: 'Balance Size & Quality', timeline: "I'm flexible", budget: config.budget || 25000 };
    if (['Engagement Ring', 'Wedding Band', 'Ring'].includes(config.type)) base.settingStyle = 'Solitaire';
    update(base);
    if (contactIdx >= 0) setStep(contactIdx);
  };

  switch (name) {
    case 'Design Inspiration':
      return (
        <DesignInspirationStep config={config} update={update} onFetchLink={async (url: string) => {
          try {
            const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            const html = await res.text();
            const m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
            const img = m ? (m[1] || m[2] || '').trim() : null;
            if (img) update({ designInspirationUrl: img });
            return !!img;
          } catch { return false; }
        }} />
      );
    case 'Jewellery Type': {
      const onTypeSelect = (v: string) => {
        if (v === 'Loose Stone') {
          update({ type: 'Loose Stone', stoneCategory: 'Diamond', ringSubExpanded: undefined });
          setStep(0);
        } else if (v === 'Ring') {
          update({ ringSubExpanded: true, type: undefined });
        } else {
          update({ type: v, ringSubExpanded: undefined });
        }
      };
      const showRingSub = config.ringSubExpanded || ['Wedding Band', 'Engagement Ring', 'Ring'].includes(config.type);
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">What type of jewellery are you looking to create?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[{ id: 'ring', label: 'Ring', value: 'Ring' }, { id: 'earrings', label: 'Earrings', value: 'Earrings' }, { id: 'necklace', label: 'Necklace', value: 'Necklace' }, { id: 'bracelet', label: 'Bracelet', value: 'Bracelet' }, { id: 'pendant', label: 'Pendant', value: 'Pendant' }, { id: 'loose', label: 'Loose Diamond', value: 'Loose Stone' }, { id: 'other', label: 'Other', value: 'Other' }].map(({ id, label, value }) => (
              <button key={id} type="button" onClick={() => onTypeSelect(value)} className={`py-5 border transition-all uppercase tracking-[0.2em] text-[9px] ${(value === 'Ring' && showRingSub) || config.type === value ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{label}</button>
            ))}
          </div>
          {showRingSub && (
            <div className="pl-4 border-l-2 border-current/20 space-y-3">
              <label className="text-[10px] uppercase tracking-widest opacity-40">Ring type</label>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => update({ type: 'Wedding Band', ringSubExpanded: undefined, typeOtherDetail: undefined })} className={`py-3 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.type === 'Wedding Band' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Wedding Band</button>
                <button type="button" onClick={() => update({ type: 'Engagement Ring', ringSubExpanded: undefined, typeOtherDetail: undefined })} className={`py-3 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.type === 'Engagement Ring' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Engagement Ring</button>
                <button type="button" onClick={() => update({ type: 'Ring', ringSubExpanded: true })} className={`py-3 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.type === 'Ring' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Other</button>
              </div>
              {config.type === 'Ring' && (
                <input type="text" value={config.typeOtherDetail || ''} onChange={e => update({ typeOtherDetail: e.target.value })} placeholder="Specify (e.g. signet, cocktail)" className="w-full bg-white/5 border border-white/10 p-3 text-sm font-light focus:outline-none focus:border-current/30" />
              )}
            </div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Describe your design idea</label>
            <textarea value={config.designDescription || ''} onChange={e => update({ designDescription: e.target.value })} placeholder="Please share any details about your design concept..." rows={4} className="w-full bg-white/5 border border-white/10 p-4 text-sm font-light focus:outline-none focus:border-current/30 resize-none" />
          </div>
        </div>
      );
    }
    case 'Budget': {
      const isCustom = config.budget === 0 || ((config.budget || 0) > 0 && !BUDGET_OPTIONS.some(o => o.value === config.budget));
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Your budget helps us tailor the materials and design to match your expectations.</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUDGET_OPTIONS.filter(o => o.value > 0).map(o => (
              <button key={o.value} type="button" onClick={() => update({ budget: o.value })} className={`py-6 border transition-all uppercase tracking-widest text-[9px] ${config.budget === o.value ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{formatBudget(o.value)}+</button>
            ))}
            <button type="button" onClick={() => update({ budget: 0 })} className={`py-6 border transition-all uppercase tracking-widest text-[9px] ${isCustom ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Custom budget</button>
          </div>
          {isCustom && (
            <div>
              <input type="number" value={isCustom ? (config.budget || '') : ''} onChange={e => update({ budget: parseInt(e.target.value) || 0 })} placeholder="Enter amount (ZAR)" className="w-full bg-transparent border-b border-current/20 py-4 text-xl font-thin focus:outline-none focus:border-current" />
            </div>
          )}
        </div>
      );
    }
    case 'Metal':
      return (
        <div className="space-y-6 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Select your preferred metal</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <MetalOptions data={METAL_DATA} keys={MAIN_METALS} current={config.metal} onSelect={(v: string) => selectAndAdvance({ metal: v })} />
          <div className="mt-6 p-4 border border-current/10 bg-current/[0.02]">
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-70 mb-2">{config.metal ? `${config.metal} — why it works` : 'Why metal choice matters'}</p>
            <p className="text-[9px] opacity-60 leading-relaxed">{config.metal && METAL_DATA[config.metal] ? METAL_DATA[config.metal].insight : 'Platinum is the most durable and naturally white. 18K is richer but softer than 14K. White Gold is rhodium-plated and needs replating. Rose Gold is romantic and a bit tougher. Silver and Sterling are affordable; 14K is the practical everyday choice.'}</p>
          </div>
        </div>
      );
    case 'Stones': {
      const showGemstoneList = config.stoneType === 'N/A';
      const isBracelet = config.type === 'Bracelet';
      const isRing = ['Engagement Ring', 'Wedding Band', 'Ring'].includes(config.type);
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">What type of stones would you like?</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <div className="flex flex-wrap gap-3">
            {(isBracelet || isRing) && (
              <button type="button" onClick={() => selectAndAdvance({ stoneCategory: 'None', stoneType: 'N/A', shape: 'N/A' })} className={`py-5 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.stoneCategory === 'None' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>No stones</button>
            )}
            <button type="button" onClick={() => update({ stoneCategory: 'Diamond', stoneType: 'Lab' })} className={`py-5 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.stoneCategory === 'Diamond' && config.stoneType === 'Lab' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{isBracelet ? 'Diamonds (Lab)' : 'Diamonds'}</button>
            {isBracelet && (
              <button type="button" onClick={() => selectAndAdvance({ stoneCategory: 'Moissanite', stoneType: 'Moissanite' })} className={`py-5 px-5 border transition-all uppercase tracking-widest text-[9px] ${config.stoneCategory === 'Moissanite' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Moissanite</button>
            )}
            <button type="button" onClick={() => update({ stoneType: 'N/A', stoneCategory: config.stoneCategory && GEMSTONE_TYPES.includes(config.stoneCategory) ? config.stoneCategory : undefined })} className={`py-5 px-5 border transition-all uppercase tracking-widest text-[9px] ${showGemstoneList ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Gemstones</button>
          </div>
          {showGemstoneList && (
            <>
              <label className="text-[10px] uppercase tracking-widest opacity-40">Select Gemstone Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GEMSTONE_TYPES.map(g => (
                  <button key={g} type="button" onClick={() => selectAndAdvance({ stoneCategory: g })} className={`py-5 border transition-all uppercase tracking-widest text-[9px] ${config.stoneCategory === g ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{g}</button>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    case 'Shape': {
      return (
        <div className="space-y-6 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Choose your stone shape</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <ImageOptions data={SHAPE_DATA} current={config.shape} onSelect={(v: string) => selectAndAdvance({ shape: v })} />
          <button type="button" onClick={() => selectAndAdvance({ shape: 'N/A' })} className={`w-full py-3 border transition-all uppercase tracking-widest text-[9px] ${config.shape === 'N/A' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Other (as advised)</button>
        </div>
      );
    }
    case 'Setting':
      return (
        <div className="space-y-6 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Select your setting style</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <ImageOptions data={SETTING_DATA} current={config.settingStyle} onSelect={(v: string) => selectAndAdvance({ settingStyle: v })} />
        </div>
      );
    case 'Quality Tier': {
      const calcMain = (budget: number, qt: string) => {
        if (!budget || !config.stoneCategory || config.stoneCategory === 'None') return null;
        const base = BASE_PRICE;
        const mp = config.metal ? METAL_DATA[config.metal]?.price || 0 : 0;
        const sp = config.settingStyle ? SETTING_DATA[config.settingStyle]?.price || 0 : 0;
        const ep = config.engraving ? 950 : 0;
        const qf = QUALITY_TIERS[qt]?.factor || 1;
        const priceBefore = (budget - ep) / qf;
        const stonePrice = priceBefore - base - mp - sp;
        if (stonePrice <= 0) return null;
        const sb = config.stoneCategory === 'Diamond' ? NATURAL_DIAMOND_BASE : (config.stoneCategory === 'Moissanite' ? MOISSANITE_BASE : GEMSTONE_BASE);
        const adj = config.stoneType === 'Lab' ? sb * LAB_DIAMOND_PRICE_FACTOR : sb;
        const sf = (config.shape && SHAPE_DATA[config.shape]) ? SHAPE_DATA[config.shape].factor : 1;
        const c = Math.pow(stonePrice / (adj * sf), 1 / 1.95);
        return c >= 0.1 ? c : null;
      };
      const available = Object.keys(QUALITY_TIERS).filter(k => calcMain(config.budget || 0, k));
      return (
        <div className="space-y-6 py-4">
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          {config.budget > 0 && <p className="text-[9px] uppercase tracking-widest opacity-60 text-center">Options based on your budget of {formatBudget(config.budget || 0)}</p>}
          <QualityOptions current={config.qualityTier} onSelect={(v: string) => { const c = calcMain(config.budget || 0, v); update({ qualityTier: v, carat: c || config.carat || 1 }); }} availableTiers={available.length ? available : undefined} budget={config.budget || 0} calculateCarat={(_b: number, qt: string) => calcMain(_b, qt)} />
        </div>
      );
    }
    case 'Timeline':
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Your timeline helps us prioritize your project accordingly.</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <div className="space-y-3">
            {TIMELINE_OPTIONS.map(o => (
              <button key={o.value} type="button" onClick={() => selectAndAdvance({ timeline: o.value })} className={`w-full py-5 border text-left px-6 transition-all uppercase tracking-widest text-[9px] ${config.timeline === o.value ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{o.label}</button>
            ))}
          </div>
          <div className="mt-6 p-4 border border-current/10 bg-current/[0.02]">
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-70 mb-2">Production Timeline Information:</p>
            <ul className="text-[9px] opacity-60 space-y-1 list-disc list-inside">
              <li>Simple designs typically take 3-4 weeks to produce</li>
              <li>Complex designs may take 6-8 weeks or longer</li>
              <li>Rush orders may incur additional fees</li>
              <li>Allow extra time for design revisions and stone selection</li>
            </ul>
          </div>
        </div>
      );
    case 'Ring Size': {
      const mm = SIZE_TO_MM[config.ringSize || 'M'] || 16.51;
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Find your ring size. The circle below is 1:1 real-life internal diameter—hold your finger against the screen to compare.</p>
          {hasInspiration && (
            <button type="button" onClick={handleSkipToContact} className="w-full py-3 border border-dashed border-current/30 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">Skip to contact — we&apos;ll quote from your inspiration</button>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-10">
            <div className="flex-shrink-0 rounded-full border-2 border-current/40 flex items-center justify-center bg-current/5" style={{ width: `${mm}mm`, height: `${mm}mm`, minWidth: 48, minHeight: 48 }} title={config.ringSize ? `UK/SA ${config.ringSize} — ${mm} mm` : 'Select a size'}>
              <span className="text-[8px] opacity-50">{config.ringSize || '—'}</span>
            </div>
            <div className="flex-1 space-y-4">
              <label className="text-[9px] uppercase tracking-widest opacity-70 font-bold block">UK/SA size</label>
              <select value={config.ringSize || ''} onChange={e => update({ ringSize: e.target.value || undefined })} className="w-full bg-white/5 border border-current/20 p-4 text-sm font-light focus:outline-none focus:border-current/40">
                <option value="">Select later</option>
                {RING_SIZES.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
              <div className="p-3 border border-current/10 bg-current/[0.02] space-y-2">
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-70">Tips</p>
                <ul className="text-[8px] opacity-60 space-y-1 list-disc list-inside">
                  <li>Measure when fingers are warm; cold shrinks them.</li>
                  <li>Knuckles can be larger—ring must slide over comfortably.</li>
                  <li>Wider bands often need a half-size up.</li>
                  <li>Not sure? Choose &quot;Select later&quot; in the next step or contact us.</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-[8px] opacity-40">{config.ringSize ? `Internal diameter: ${mm} mm (UK/SA ${config.ringSize}). Matches a real ring.` : 'Default M shown. Select a size to see your 1:1 fit.'}</p>
        </div>
      );
    }
    case 'Contact':
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">We'll use this information to contact you about your design. Your information will be kept private.</p>
          <InputGroup label="Full Name" value={config.fullName || [config.firstName, config.lastName].filter(Boolean).join(' ')} onChange={(v: string) => update({ fullName: v })} placeholder="Your name" />
          <InputGroup label="Email Address" value={config.email} onChange={(v: string) => update({ email: v })} placeholder="Your email" />
          <InputGroup label="Phone Number (optional)" value={config.phone} onChange={(v: string) => update({ phone: v })} placeholder="Your phone number" />
          <InputGroup label="Inscription (optional)" value={config.engraving} onChange={(v: string) => update({ engraving: v })} placeholder="e.g. FOREVER" />
        </div>
      );
    case 'Loose: Origin':
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Lab or Natural diamond?</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => selectAndAdvance({ stoneType: 'Lab' })} className={`flex-1 py-8 border transition-all uppercase tracking-widest text-[10px] ${config.stoneType === 'Lab' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Lab</button>
            <button type="button" onClick={() => selectAndAdvance({ stoneType: 'Natural' })} className={`flex-1 py-8 border transition-all uppercase tracking-widest text-[10px] ${config.stoneType === 'Natural' ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Natural</button>
          </div>
        </div>
      );
    case 'Loose: Budget': {
      const isCustom = config.budget === 0 || ((config.budget || 0) > 0 && !BUDGET_OPTIONS.some(o => o.value === config.budget));
      return (
        <div className="space-y-8 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Your budget determines the carat and quality we can offer.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUDGET_OPTIONS.filter(o => o.value > 0).map(o => (
              <button key={o.value} type="button" onClick={() => update({ budget: o.value })} className={`py-6 border transition-all uppercase tracking-widest text-[9px] ${config.budget === o.value ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>{formatBudget(o.value)}+</button>
            ))}
            <button type="button" onClick={() => update({ budget: 0 })} className={`py-6 border transition-all uppercase tracking-widest text-[9px] ${isCustom ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-60 hover:opacity-100'}`}>Custom budget</button>
          </div>
          {isCustom && (
            <input type="number" value={isCustom ? (config.budget || '') : ''} onChange={e => update({ budget: parseInt(e.target.value) || 0 })} placeholder="Enter amount (ZAR)" className="w-full bg-transparent border-b border-current/20 py-4 text-xl font-thin focus:outline-none focus:border-current mt-4" />
          )}
        </div>
      );
    }
    case 'Loose: Shape':
      return (
        <div className="space-y-6 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Choose your diamond shape</p>
          <ImageOptions data={SHAPE_DATA} current={config.shape} onSelect={(v: string) => selectAndAdvance({ shape: v })} />
        </div>
      );
    case 'Loose: Quality': {
      const calcLoose = (budget: number, qt: string) => {
        if (!budget || !config.shape) return null;
        const sb = NATURAL_DIAMOND_BASE * (config.stoneType === 'Lab' ? LAB_DIAMOND_PRICE_FACTOR : 1);
        const sf = SHAPE_DATA[config.shape]?.factor || 1;
        const qf = QUALITY_TIERS[qt]?.factor || 1;
        const c = Math.pow(budget / (sb * sf * qf), 1 / 1.95);
        return c >= 0.1 ? c : null;
      };
      const available = Object.keys(QUALITY_TIERS).filter(k => calcLoose(config.budget || 0, k));
      return (
        <div className="space-y-6 py-4">
          {config.budget > 0 && <p className="text-[9px] uppercase tracking-widest opacity-60 text-center">Options based on your budget of {formatBudget(config.budget || 0)}</p>}
          <QualityOptions current={config.qualityTier} onSelect={(v: string) => { const c = calcLoose(config.budget || 0, v); update({ qualityTier: v, carat: c || config.carat || 1 }); }} availableTiers={available.length ? available : undefined} budget={config.budget || 0} calculateCarat={(_b: number, qt: string) => calcLoose(_b, qt)} />
        </div>
      );
    }
    case 'Review': {
      const isLoose = config.type === 'Loose Stone';
      return (
        <div className="space-y-6 py-4">
          <p className="text-[11px] uppercase tracking-widest opacity-60">Review your selections before we generate your quotation and visual.</p>
          <div className="text-left space-y-2 text-[10px] uppercase tracking-widest">
            {isLoose ? (
              <>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Type</span><span>Loose Diamond</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Origin</span><span>{config.stoneType}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Budget</span><span>{formatBudget(config.budget||0)}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Shape</span><span>{config.shape}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Quality</span><span>{config.qualityTier}</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Type</span><span>{config.type}{config.type === 'Ring' && config.typeOtherDetail ? ` (${config.typeOtherDetail})` : ''}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Budget</span><span>{formatBudget(config.budget||0)}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Metal</span><span>{config.metal}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Stones</span><span>{config.stoneCategory}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Timeline</span><span>{config.timeline}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="opacity-50">Contact</span><span>{config.fullName || [config.firstName, config.lastName].filter(Boolean).join(' ')}, {config.email}</span></div>
              </>
            )}
          </div>
        </div>
      );
    }
    default: return null;
  }
};

const DesignInspirationStep = ({ config, update, onFetchLink }: { config: any; update: (u: any) => void; onFetchLink: (url: string) => Promise<boolean> }) => {
  const [linkFetching, setLinkFetching] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const handleFetch = async () => {
    const url = (config.pinterestLink || '').trim();
    if (!url) return;
    setLinkFetching(true); setLinkError(null);
    const ok = await onFetchLink(url);
    setLinkFetching(false);
    if (!ok) setLinkError('Could not fetch image from link.');
  };
  const displayUrl = config.designInspirationUrl;
  return (
    <div className="space-y-8 py-4">
      <p className="text-[11px] uppercase tracking-widest opacity-60">Would you like to upload a design image or add a link? This helps us understand your vision.</p>
      <div>
        <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Upload Your Design Inspiration</label>
        <Dropzone value={displayUrl} onChange={(url) => update({ designInspirationUrl: url })} />
        <button type="button" onClick={() => update({ designInspirationUrl: undefined, pinterestLink: undefined })} className="mt-3 py-2 px-4 border border-current/20 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer transition-all rounded-sm">I don&apos;t have an image to upload</button>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-2">Or enter a Pinterest or image link</label>
        <div className="flex gap-2">
          <input type="url" value={config.pinterestLink || ''} onChange={e => { update({ pinterestLink: e.target.value }); setLinkError(null); }} placeholder="https://pinterest.com/pin/..." className="flex-1 bg-white/5 border border-white/10 p-4 text-sm font-light focus:outline-none focus:border-current/30" />
          <button type="button" onClick={handleFetch} disabled={linkFetching || !(config.pinterestLink || '').trim()} className="py-4 px-5 border border-current/20 text-[9px] uppercase tracking-widest disabled:opacity-40">{linkFetching ? 'Fetching…' : 'Fetch'}</button>
        </div>
        {linkError && <p className="text-[9px] text-red-400/80 mt-2">{linkError}</p>}
      </div>
    </div>
  );
};

const Dropzone = ({ value, onChange }: { value?: string; onChange: (url: string) => void }) => {
  const [drag, setDrag] = useState(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) { const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); } };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); } };
  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop} className={`border-2 border-dashed p-10 text-center transition-colors ${drag ? 'border-current/50 bg-current/5' : 'border-current/20'}`}>
      <input type="file" accept="image/*" className="hidden" id="design-upload" onChange={onFile} />
      {value ? <img src={value} alt="Inspiration" className="max-h-40 mx-auto object-contain" /> : <label htmlFor="design-upload" className="cursor-pointer flex flex-col items-center gap-2"><Upload size={24} className="opacity-40" /><span className="text-[9px] uppercase tracking-widest opacity-50">Drag and drop an image, or click to select</span><span className="text-[8px] opacity-40">Upload an image to help us understand your vision</span></label>}
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold ml-1">{label}</label>
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/5 p-4 text-sm font-light focus:outline-none" />
  </div>
);

const GridOptions = ({ options, current, onSelect }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
    {options.map((opt: string) => (
      <button key={opt} onClick={() => onSelect(opt)} className={`py-6 border transition-all uppercase tracking-[0.3em] text-[9px] ${current === opt ? 'border-current bg-current/5 font-bold' : 'border-current/10 opacity-40'}`}>{opt}</button>
    ))}
  </div>
);

const MetalOptions = ({ data, keys, current, onSelect }: { data: Record<string, { gradient: string }>; keys?: readonly string[]; current?: string; onSelect: (k: string) => void }) => {
  const list = keys ? keys.filter(k => data[k]).map(k => [k, data[k]] as const) : Object.entries(data);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
      {list.map(([k, v]) => (
        <button key={k} type="button" onClick={() => onSelect(k)} className={`group border p-4 transition-all ${current === k ? 'border-current bg-current/5 scale-[1.02]' : 'border-current/10 opacity-60 hover:opacity-100'}`}>
          <div className="w-full aspect-square mb-3 rounded-full shadow-lg" style={{ background: v.gradient }}></div>
          <span className="text-[9px] uppercase tracking-widest font-bold block text-center">{k}</span>
        </button>
      ))}
    </div>
  );
};

const ImageOptions = ({ data, current, onSelect }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
    {Object.entries(data || {}).map(([k, v]: any) => {
      if (!v || !v.img) return null;
      return (
        <button key={k} onClick={() => onSelect(k)} className={`group border p-4 transition-all ${current === k ? 'border-current bg-current/5 scale-[1.02]' : 'border-current/10 opacity-60 hover:opacity-100'}`}>
          <img src={v.img} alt={k} className="w-full aspect-square object-contain mb-3" />
          <span className="text-[9px] uppercase tracking-widest font-bold block text-center">{k}</span>
        </button>
      );
    })}
  </div>
);

const QualityOptions = ({ current, onSelect, availableTiers, budget, calculateCarat }: any) => {
  // If availableTiers is provided and not empty, filter to only show those. Otherwise show all.
  const allTiers = Object.entries(QUALITY_TIERS);
  const tiersToShow = (availableTiers && availableTiers.length > 0) ? 
    allTiers.filter(([k]) => availableTiers.includes(k)) :
    allTiers;
  
  if (tiersToShow.length === 0) {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="text-[9px] uppercase tracking-widest opacity-60">
          No quality tiers available for your budget. Please increase your budget or adjust your selections.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 py-4">
      {tiersToShow.map(([k, v]: any) => {
        const calculatedCarat = budget && budget > 0 && calculateCarat ? calculateCarat(budget, k) : null;
        const isAvailable = !availableTiers || availableTiers.length === 0 || availableTiers.includes(k);
        
        return (
          <button 
            key={k} 
            onClick={() => onSelect(k)} 
            disabled={!isAvailable}
            className={`w-full text-left p-6 border transition-all ${current === k ? 'border-current bg-current/5' : isAvailable ? 'border-current/10 opacity-60 hover:opacity-100' : 'border-current/5 opacity-20 cursor-not-allowed'}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 shrink-0">
                <img src={v.img} className="w-full h-full object-contain" alt={v.label} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-[11px] uppercase tracking-widest font-bold">{v.label} Diamond</h5>
                  {v.isRecommended && (
                    <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-[9px] opacity-60 font-light mb-3">{v.sub}</p>
                <div className="grid grid-cols-2 gap-3 text-[9px]">
                  <div>
                    <span className="uppercase tracking-widest opacity-40 block mb-1">Color</span>
                    <span className="font-bold">{v.color}</span>
                  </div>
                  <div>
                    <span className="uppercase tracking-widest opacity-40 block mb-1">Clarity</span>
                    <span className="font-bold">{v.clarity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="uppercase tracking-widest opacity-40 block mb-1">
                      {calculatedCarat ? 'Available Carat' : 'Carat (Max)'}
                    </span>
                    <span className="font-bold">
                      {calculatedCarat ? calculatedCarat.toFixed(2) : v.caratMax}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const ConfigResult = ({ config, currency, theme, isGenerating, onSave, saved, onUpdateConfig, onRegenerateImage, onApprove }: any) => {
  const [advice, setAdvice] = useState<string[]>([]);
  const [variations, setVariations] = useState<JewelleryConfig[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [advisorMsg, setAdvisorMsg] = useState("Hi! I'm here to help you refine your design. Choose a recommendation or ask a direct question.");

  const rate = EXCHANGE_RATES[currency]?.rate || 1;
  // rate = ZAR per 1 unit of foreign currency (e.g. 1 USD = 18.5 ZAR). Convert: amount_foreign = priceZAR / rate.
  const priceInCurrency = Math.round((config.priceZAR ?? 0) / (rate || 1));
  const priceFormatted = priceInCurrency.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const getAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an expert Diamond Concierge for the-diamond-guy.co.za. Based on a budget of ${currency} ${priceFormatted} and a configuration of ${JSON.stringify(config)}, provide 3 professional expert recommendations to optimize the piece. Return ONLY a valid JSON array of strings. Do not mention AI.`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      const items = JSON.parse(res.text?.trim() || '[]');
      setAdvice(items);
    } catch (e) {
      setAdvice(["Consider a lab-grown diamond for similar beauty at a lower cost", "Opt for a simpler setting while maintaining stone quality", "Select a more economical metal choice"]);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const getVariations = async () => {
    setIsLoadingVariations(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an expert jeweler. Generate 3 distinct alternative configurations within a ZAR ${config.budget} budget. Current config: ${JSON.stringify(config)}. Return ONLY a JSON array of objects with these keys: metal, stoneType, stoneCategory, shape, carat, settingStyle, qualityTier, priceZAR. Ensure stoneType is 'Natural', 'Lab', or 'Moissanite'. Do not mention AI.`;
      const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt, config: { responseMimeType: "application/json" } });
      const raw = JSON.parse(res.text?.trim() || '[]');
      const finalVariations = raw.map((v: any) => ({ ...config, ...v, id: `VAR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, date: new Date().toLocaleDateString() }));
      setVariations(finalVariations);
    } catch (e) {
      alert("Variation engine unavailable.");
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const selectVariation = async (v: JewelleryConfig) => {
    onUpdateConfig(v);
    const img = await onRegenerateImage(v);
    onUpdateConfig({ ...v, imageUrl: img });
  };

  const downloadPDF = async () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Page 1: Cover (Black Background)
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 255, 255);
    
    // Add TDG Logo (inverted for black background)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = LOGO_URL;
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          try {
            // Create canvas to invert the logo
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(null); return; }
            
            canvas.width = logoImg.width;
            canvas.height = logoImg.height;
            
            // Draw image
            ctx.drawImage(logoImg, 0, 0);
            
            // Invert colors
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];     // R
              data[i + 1] = 255 - data[i + 1]; // G
              data[i + 2] = 255 - data[i + 2]; // B
              // Keep alpha channel as is
            }
            ctx.putImageData(imageData, 0, 0);
            
            // Convert to base64 and add to PDF
            const invertedLogo = canvas.toDataURL('image/png');
            doc.addImage(invertedLogo, 'PNG', 20, 20, 40, 12);
            resolve(null);
          } catch (e) {
            console.error('Error processing logo:', e);
            resolve(null);
          }
        };
        logoImg.onerror = () => resolve(null);
        if (logoImg.complete) (logoImg.onload as (e?: Event) => void)?.(new Event('load'));
      });
    } catch (e) {
      console.error('Error loading logo:', e);
    }
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(28);
    doc.text("THE DIAMOND GUY", 20, 50);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("BESPOKE MASTERPIECE PROPOSAL • CAPE TOWN", 20, 57);
    if (config.imageUrl) {
      try { doc.addImage(config.imageUrl, 'JPEG', 20, 70, 170, 150); } catch(e) {}
    }
    doc.setFontSize(10);
    doc.text(`REFERENCE: ${config.id}`, 20, 250);
    doc.text(`INDICATIVE VALUATION: ${currency} ${priceFormatted}`, 190, 250, { align: 'right' });

    // Page 2: Specs (White Background)
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(0, 0, 0);
    
    // Add TDG Logo (original, not inverted for white background)
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = LOGO_URL;
      
      await new Promise((resolve) => {
        logoImg.onload = () => {
          try {
            doc.addImage(LOGO_URL, 'PNG', 20, 15, 40, 12);
            resolve(null);
          } catch (e) {
            console.error('Error adding logo to page 2:', e);
            resolve(null);
          }
        };
        logoImg.onerror = () => resolve(null);
        if (logoImg.complete) (logoImg.onload as (e?: Event) => void)?.(new Event('load'));
      });
    } catch (e) {
      console.error('Error loading logo for page 2:', e);
    }
    
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("TECHNICAL SPECIFICATIONS", 20, 40);
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 45, 190, 45);

    let y = 60;
    const specs = config.type === 'Loose Stone'
      ? [["Category", config.type], ["Stone Type", config.stoneType], ["Shape", config.shape || 'N/A'], ["Quality Tier", config.qualityTier || 'N/A']]
      : [["Category", config.type], ["Stone Type", config.stoneType], ["Stone Variety", config.stoneCategory], ["Metal", config.metal || 'N/A'], ["Shape", config.shape || 'N/A'], ["Setting", config.settingStyle || 'N/A'], ["Quality Tier", config.qualityTier || 'N/A']];

    specs.forEach(([label, val]) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(label.toUpperCase(), 20, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text(String(val).toUpperCase(), 190, y, { align: 'right' });
      y += 12;
    });

    // Quality Tier Details
    if (config.qualityTier && QUALITY_TIERS[config.qualityTier]) {
      const qualityTier = QUALITY_TIERS[config.qualityTier];
      y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("QUALITY SPECIFICATIONS", 20, y);
      y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.text("Color:", 25, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text(qualityTier.color.toUpperCase(), 190, y, { align: 'right' });
      y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.text("Clarity:", 25, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text(qualityTier.clarity.toUpperCase(), 190, y, { align: 'right' });
      y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.text(config.type === 'Loose Stone' && config.carat ? "Carat:" : "Carat (Max):", 25, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text(String(config.type === 'Loose Stone' && config.carat ? config.carat.toFixed(2) : qualityTier.caratMax), 190, y, { align: 'right' });
      y += 8;
    }

    if (config.type !== 'Loose Stone') {
      y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("Inscription", 20, y);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text((config.engraving || 'None').toUpperCase(), 190, y, { align: 'right' });
    }

    // Approval Section (if status is Quoted)
    if (config.status === 'Quoted') {
      y += 20;
      doc.setFillColor(59, 130, 246); // Blue background
      doc.rect(20, y, 170, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text("APPROVE THIS QUOTE", 105, y + 10, { align: 'center' });
      doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.text("Visit your Vault portal to approve this proposal", 105, y + 18, { align: 'center' });
      y += 30;
    }

    // Policy Block (Black with White Text on White Page)
    y += 10;
    doc.setFillColor(18, 18, 18);
    doc.rect(20, y, 170, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL POLICIES", 25, y + 10);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("• Valid for 7 days. Subject to stone availability.", 25, y + 18);
    doc.text("• 50% non-refundable deposit required to initiate crafting.", 25, y + 24);
    doc.text("• Lifetime structural warranty included.", 25, y + 30);
    doc.text("• Manufacturing timeline: 21-28 business days.", 25, y + 36);

    doc.save(`TDG-PROPOSAL-${config.id}.pdf`);
  };

  const btnClass = theme === 'dark' ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center animate-fadeIn space-y-16">
      {isGenerating ? (
        <div className="py-32 space-y-8">
           <div className="w-16 h-16 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
           <p className="text-[12px] uppercase tracking-widest opacity-40">Compiling Masterpiece Visuals...</p>
        </div>
      ) : (
        <>
          <img src={config.imageUrl} className="w-full max-w-xl mx-auto aspect-square object-cover shadow-2xl border border-white/5" />
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={getAdvice} className={`${btnClass} px-10 py-5 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 shadow-xl transition-all`}>
              {isLoadingAdvice ? "Consulting..." : <><HelpCircle size={18}/> I Need Advice</>}
            </button>
            {config.type !== 'Loose Stone' && (
              <button onClick={getVariations} className={`${btnClass} px-10 py-5 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 shadow-xl transition-all`}>
                {isLoadingVariations ? "Calculating..." : <><Wand2 size={18}/> Generate Variations</>}
              </button>
            )}
          </div>

          {/* Alternative Masterpieces - HIGHER */}
          {variations.length > 0 && (
            <div className="space-y-6 glass p-8 border border-white/10 text-left animate-fadeIn">
              <h5 className="text-[11px] uppercase tracking-widest font-bold opacity-40">Alternative Masterpieces</h5>
              <div className="grid gap-4 md:grid-cols-3">
                 {variations.map((v, i) => (
                   <button key={i} onClick={() => selectVariation(v)} className="p-6 border border-white/5 hover:border-current/20 text-left transition-all space-y-2 group">
                      <p className="text-[9px] uppercase tracking-widest opacity-60 font-bold">{v.carat}ct {v.shape}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold">{currency} {Math.round((v.priceZAR ?? 0) / (rate || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-[8px] opacity-40 uppercase group-hover:opacity-100 transition-opacity">Select View</p>
                   </button>
                 ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12 text-left glass p-10 border border-current/10 rounded-sm">
             <div className="space-y-8">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <h4 className="text-[11px] uppercase tracking-widest font-bold opacity-40">Technical Brief</h4>
                  <div className="flex gap-4 opacity-40 grayscale">
                    <img src={GIA_LOGO} className="h-6" alt="GIA" />
                    <img src={EGI_LOGO} className="h-6" alt="EGI" />
                  </div>
                </div>

                <div className="space-y-4">
                  <SummaryItem label="Master Category" val={config.type} />
                  {config.type !== 'Loose Stone' && <SummaryItem label="Precious Metal" val={config.metal || 'N/A'} />}
                  {config.type !== 'Loose Stone' && <SummaryItem label="Stone Variety" val={config.stoneCategory} />}
                  {config.type === 'Loose Stone' && <SummaryItem label="Stone Type" val={config.stoneType || 'N/A'} />}
                  {config.type === 'Loose Stone' && <SummaryItem label="Shape" val={config.shape || 'N/A'} />}
                  <SummaryItem label="Quality Tier" val={config.qualityTier} />
                  {config.qualityTier && QUALITY_TIERS[config.qualityTier] && (
                    <>
                      <div className="pt-2 pb-2 border-b border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] uppercase tracking-widest opacity-40 font-medium">Color</span>
                          <span className="text-[11px] uppercase tracking-widest font-bold text-current">{QUALITY_TIERS[config.qualityTier].color}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] uppercase tracking-widest opacity-40 font-medium">Clarity</span>
                          <span className="text-[11px] uppercase tracking-widest font-bold text-current">{QUALITY_TIERS[config.qualityTier].clarity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-widest opacity-40 font-medium">
                            {config.carat ? 'Carat' : 'Carat (Max)'}
                          </span>
                          <span className="text-[11px] uppercase tracking-widest font-bold text-current">
                            {config.carat ? config.carat.toFixed(2) : QUALITY_TIERS[config.qualityTier].caratMax}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  {config.type !== 'Loose Stone' && <SummaryItem label="Authorized Size" val={config.ringSize ? `${config.ringSize} (${config.ringSizeStandard})` : 'N/A'} />}
                  {config.type !== 'Loose Stone' && config.engraving && <SummaryItem label="Inscription" val={config.engraving} />}
                </div>
                
                <div className="border-l-4 border-current bg-current/[0.02] p-6 space-y-4">
                   <h5 className="text-[11px] uppercase tracking-widest font-bold">Advisor Insights</h5>
                   {advice.length === 0 ? (
                     <p className="text-[10px] opacity-40 italic">Click "I Need Advice" for bespoke suggestions.</p>
                   ) : (
                     <div className="space-y-3">
                        {advice.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 opacity-80 cursor-pointer hover:opacity-100" onClick={() => setAdvisorMsg(`Explain: ${item}`)}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5"></div>
                            <p className="text-[10px] uppercase tracking-widest font-medium">{item}</p>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
             
             <div className="text-right space-y-10 flex flex-col justify-between">
                <div>
                   <p className="text-[10px] uppercase opacity-40 mb-2 font-bold tracking-widest">Indicative Valuation</p>
                   <h4 className="text-5xl lg:text-6xl font-thin tracking-tighter">{currency} {priceFormatted}</h4>
                </div>
                <div className="flex flex-col gap-4">
                   <button onClick={() => downloadPDF()} className="w-full py-5 border border-white/20 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2"><Download size={14}/> Download Technical PDF</button>
                   <button onClick={() => alert(`Proposal Ref ${config.id} emailed to ${config.email}`)} className="w-full py-5 border border-white/20 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2"><Mail size={14}/> Email to Inbox</button>
                   <button onClick={() => onSave(config as JewelleryConfig)} className="w-full py-5 bg-white text-black text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                      {saved ? <CheckCircle size={14}/> : <Save size={14}/>} {saved ? 'Saved in Vault' : 'Save as Enquiry'}
                   </button>
                   {config.status === 'Quoted' && (
                     <button onClick={() => onApprove && onApprove(config)} className="w-full py-5 bg-blue-500 text-white text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-blue-600">
                        <CheckCircle size={14}/> Approve Quote
                     </button>
                   )}
                   {config.status === 'Approved' && !config.isApproved && (
                     <div className="w-full py-4 border border-blue-500/30 bg-blue-500/10 text-[9px] uppercase tracking-widest text-center text-blue-400">
                        Awaiting Jeweler Approval
                     </div>
                   )}
                   {config.isApproved && config.paymentLink && (
                     <a href={config.paymentLink} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-emerald-500 text-white text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-emerald-600">
                        <CreditCard size={14}/> Pay 50% Deposit
                     </a>
                   )}
                </div>
             </div>
          </div>

          {/* Master Policies & Info */}
          <div className="max-w-4xl mx-auto space-y-12">
            <h5 className="text-[10px] uppercase tracking-[0.6em] font-bold opacity-30">Master Policies</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <PolicyItem icon={<Clock size={16} />} text="7 Day Validity" />
               <PolicyItem icon={<Shield size={16} />} text="50% Deposit" />
               <PolicyItem icon={<Ruler size={16} />} text="4 Week Crafting" />
               <PolicyItem icon={<BadgeCheck size={16} />} text="Life Warranty" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SummaryItem = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5">
    <span className="text-[9px] uppercase tracking-widest opacity-40 font-medium">{label}</span>
    <span className="text-[11px] uppercase tracking-widest font-bold text-current">{val}</span>
  </div>
);

const PolicyItem = ({ icon, text }: any) => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-40">
      {icon}
    </div>
    <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold">{text}</span>
  </div>
);

export default RingBuilder;
