
import React, { useState } from 'react';
import { FAQ_DATA, METAL_DATA } from '../constants';
import { ChevronDown, ChevronUp, Star, ShieldCheck, Zap, Info, HelpCircle, Package, ArrowRight, MessageSquare, BookOpen } from 'lucide-react';

type LearnCategory = 'All' | '4Cs' | 'Metals' | 'Process' | 'NaturalvLab';

const Learn: React.FC<{ onNavigate?: (v: any) => void, theme?: 'dark' | 'light' }> = ({ onNavigate, theme }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<LearnCategory>('All');
  const isDark = theme === 'dark';

  const categories: { id: LearnCategory, label: string }[] = [
    { id: 'All', label: 'All Knowledge' },
    { id: '4Cs', label: 'The 4Cs' },
    { id: 'Metals', label: 'Precious Metals' },
    { id: 'Process', label: 'Our Process' },
    { id: 'NaturalvLab', label: 'Natural vs Lab' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-24 animate-fadeIn">
      
      {/* Introduction with Stylized Speech Bubbles */}
      <section className="space-y-10 max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#00B67A] overflow-hidden bg-white shrink-0 shadow-lg">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Concierge" />
          </div>
          <div className="relative bg-white text-black p-6 rounded-2xl shadow-xl border-l-4 border-[#00B67A] flex-grow">
            <div className="flex gap-3">
              <MessageSquare size={16} className="text-[#00B67A] mt-1 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">
                Not sure where to start? Browse our educational cards below to learn about diamonds, metals, and pricing. If you need personalized assistance, click <button onClick={() => onNavigate?.('Chatbot')} className="text-[#00B67A] font-bold underline hover:opacity-80 transition-opacity">'What Now?'</button> to chat with an expert.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start flex-row-reverse gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#00B67A] overflow-hidden bg-white shrink-0 shadow-lg">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Concierge" />
          </div>
          <div className="relative bg-white text-black p-6 rounded-2xl shadow-xl border-r-4 border-[#00B67A] flex-grow text-right">
            <div className="flex flex-row-reverse gap-3">
              <MessageSquare size={16} className="text-[#00B67A] mt-1 shrink-0" />
              <div>
                <h3 className="text-[12px] uppercase tracking-[0.3em] font-bold mb-2">Jewellery Guide</h3>
                <p className="text-sm font-medium leading-relaxed">
                  Already know what you want? Use our Design Hub to explore options and create your perfect piece.
                </p>
                <button 
                  onClick={() => onNavigate?.('RingBuilder')}
                  className="mt-4 px-6 py-2 border border-black text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all rounded-full flex items-center gap-2 ml-auto"
                >
                  Go to Design Hub <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <header className="text-center space-y-12">
        <h1 className="text-4xl lg:text-7xl font-thin tracking-tighter uppercase">The Brilliance Hub</h1>
        
        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 pt-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 lg:px-8 py-3 lg:py-4 text-[9px] lg:text-[10px] uppercase tracking-[0.3em] transition-all border font-semibold ${
                activeCategory === cat.id 
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-[#121212] text-white border-black shadow-xl')
                  : 'border-current/10 opacity-40 hover:opacity-100 hover:border-current/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {(activeCategory === 'All' || activeCategory === '4Cs') && (
        <section className="space-y-16 animate-fadeIn">
          <div className="flex items-center gap-6">
            <Zap className="text-amber-500" size={32} />
            <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">The Universal 4Cs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 lg:gap-12">
            <EducationBlock 
              title="Cut: The Engine of Sparkle"
              content="The most critical factor. Cut determines how well facets interact with light. An 'Excellent' cut can hide lower clarity, but a 'Poor' cut will look dull regardless of other factors."
            />
            <EducationBlock 
              title="Color: Absence of Tint"
              content="Diamond color is evaluated from D (colorless) to Z (light yellow). For white gold settings, D-H is recommended. For yellow gold, you can go lower for better value."
            />
            <EducationBlock 
              title="Clarity: Microscopic Purity"
              content="Measures internal inclusions. 'Eye-clean' diamonds (SI1 or VS2) offer the best value, as imperfections are invisible to the naked eye."
            />
            <EducationBlock 
              title="Carat: Weight and Scale"
              content="Carat refers specifically to physical weight. Pricing grows exponentially at major benchmarks (1.0ct, 2.0ct). Choosing 0.95ct can save you significantly."
            />
          </div>
        </section>
      )}

      {(activeCategory === 'All' || activeCategory === 'Metals') && (
        <section className="space-y-16 animate-fadeIn">
          <div className="flex items-center gap-6">
            <Package className="text-slate-400" size={32} />
            <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">Precious Metals Guide</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(METAL_DATA).map(([name, data]) => (
              <div key={name} className="glass p-8 border border-current/10 rounded-sm space-y-6 group overflow-hidden hover:border-current/30 transition-all">
                <div className="aspect-video overflow-hidden rounded-sm mb-4">
                  <img src={data.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={name} />
                </div>
                <h4 className="text-[12px] uppercase tracking-[0.4em] font-bold">{name}</h4>
                <p className="text-xs opacity-60 font-light leading-relaxed">{data.insight}</p>
                <div className="pt-4 border-t border-current/5 flex items-center gap-2">
                   <ShieldCheck size={14} className="text-emerald-500" />
                   <span className="text-[9px] uppercase tracking-widest opacity-40">Certified High-Purity</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(activeCategory === 'All' || activeCategory === 'NaturalvLab') && (
        <section className="glass p-10 lg:p-12 rounded-sm space-y-12 animate-fadeIn border border-current/10">
          <div className="flex items-center gap-6">
            <Star className="text-sky-500" size={32} />
            <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">Nature vs Science</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-lg font-light uppercase tracking-widest">Identical Brilliance</h3>
              <p className="opacity-50 text-sm leading-relaxed font-light">
                Lab diamonds are identical to natural diamonds in every physical, chemical, and optical way. They are created in controlled environments mimicking Earth's natural conditions. Choosing lab allows for larger stones and higher quality tiers within the same investment budget.
              </p>
              <div className="flex gap-4 lg:gap-6">
                 <StatBox val="100%" label="Chemical Identity" />
                 <StatBox val="70%" label="Typ. Savings" />
                 <StatBox val="0%" label="Mining Conflict" />
              </div>
            </div>
            <div className="aspect-square bg-current/[0.02] flex items-center justify-center p-12 rounded-sm border border-current/5">
               <DiamondIcon size={120} strokeWidth={0.5} className="opacity-20 animate-pulse" />
            </div>
          </div>
        </section>
      )}

      {(activeCategory === 'All' || activeCategory === 'Process') && (
        <section className="space-y-16 animate-fadeIn">
          <div className="flex items-center gap-6">
            <ShieldCheck className="text-emerald-500" size={32} />
            <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">The Bespoke Process</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            <ProcessStep num="01" title="Config" text="Configure your vision here or consult with us directly on WhatsApp." />
            <ProcessStep num="02" title="Sourcing" text="We source certified stones from global hubs based on your tier selection." />
            <ProcessStep num="03" title="Crafting" text="Master jewelers cast your setting in precious metals over 3-4 weeks." />
            <ProcessStep num="04" title="Collection" text="Secure collection in our private studios or fully insured global delivery." />
          </div>
        </section>
      )}

      {/* NEW: Knowledge Assets Section */}
      <section className="space-y-12 animate-fadeIn py-16 border-t border-current/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <BookOpen className="text-indigo-400" size={32} />
            <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">The Digital Library</h2>
          </div>
          <button 
            onClick={() => onNavigate?.('Resources')}
            className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-40 hover:opacity-100 transition-all underline underline-offset-8"
          >
            View All Guides
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
           <GuidePreviewCard 
              title="Wedding Planning" 
              subtitle="The Definitive Master Template" 
              onClick={() => onNavigate?.('Resources')} 
           />
           <GuidePreviewCard 
              title="Ring Selection" 
              subtitle="Confidential Sourcing Dossier" 
              onClick={() => onNavigate?.('Resources')} 
           />
        </div>
      </section>

      <section className="space-y-12 pt-12 border-t border-current/10">
        <div className="flex items-center gap-4">
           <HelpCircle className="opacity-40" />
           <h2 className="text-2xl lg:text-3xl font-thin tracking-tighter uppercase">Concierge FAQ</h2>
        </div>
        <div className="grid gap-6">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className="glass rounded-sm overflow-hidden border border-current/10">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-8 lg:p-10 text-left hover:bg-current/[0.02] transition-all"
              >
                <span className="text-[10px] lg:text-xs uppercase tracking-[0.3em] font-light">{item.q}</span>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <div className="px-8 lg:px-10 pb-8 lg:pb-10 animate-fadeIn">
                  <p className="text-xs opacity-50 font-light leading-relaxed max-w-3xl">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const EducationBlock = ({ title, content }: any) => (
  <div className="space-y-4 border-l-2 border-current/10 pl-8 lg:pl-10 py-4 hover:border-current transition-all">
    <h4 className="text-[10px] lg:text-[11px] uppercase tracking-[0.5em] font-bold">{title}</h4>
    <p className="text-xs opacity-40 leading-relaxed font-light">{content}</p>
  </div>
);

const ProcessStep = ({ num, title, text }: any) => (
  <div className="glass p-10 lg:p-12 space-y-6 rounded-sm border border-current/10 hover:border-current/30 transition-all">
    <span className="text-3xl lg:text-4xl font-thin opacity-10">{num}</span>
    <h4 className="text-[9px] lg:text-[10px] uppercase tracking-widest font-bold">{title}</h4>
    <p className="text-[9px] lg:text-[10px] opacity-40 leading-relaxed font-light">{text}</p>
  </div>
);

const StatBox = ({ val, label }: any) => (
  <div className="text-center p-6 lg:p-8 border border-current/10 bg-current/[0.02] flex-1">
    <span className="block text-xl lg:text-2xl font-thin mb-1">{val}</span>
    <span className="text-[8px] lg:text-[9px] uppercase tracking-widest opacity-40">{label}</span>
  </div>
);

const GuidePreviewCard = ({ title, subtitle, onClick }: any) => (
  <button 
    onClick={onClick}
    className="glass p-10 text-left border border-current/5 hover:border-current/20 transition-all flex flex-col gap-4 group"
  >
     <div className="w-12 h-1 bg-current/10 group-hover:bg-current transition-colors"></div>
     <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold">{title}</h4>
     <p className="text-[9px] uppercase tracking-widest opacity-40">{subtitle}</p>
  </button>
);

const DiamondIcon = ({ size, className, strokeWidth }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3h12l4 6-10 12L2 9z" />
    <path d="M11 3v18" />
    <path d="M5 8h14" />
  </svg>
);

export default Learn;
