
import React, { useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Clock, MessageSquare, BookOpen, ShoppingBag, Gem, CheckCircle2 } from 'lucide-react';
import { DONTPAYRETAIL } from '../constants';
import type { AppView } from '../types';
import homeImg from '../src/home.png';

const VIDEO_URL = 'https://cdn.create.vista.com/api/media/medium/364417012/stock-video-beautiful-wedding-ring-rotating-on-dark-background-golden-ring-with-diamonds?token=';

const PROCESS_STEPS = [
  { step: 1, title: 'Enquiry', body: 'Send us your idea—via the builder, collection enquiry, or contact. We receive it and respond quickly.' },
  { step: 2, title: 'Quote', body: 'You get a clear, itemised quote. No hidden fees. Natural, lab, or gemstone—we source to your spec.' },
  { step: 3, title: '50% deposit', body: 'Once you accept the quote, we take a 50% deposit. This secures your stone/s—each stone is bought on demand for your custom jewellery. No inventory, no retail markup.' },
  { step: 4, title: 'We order & prepare', body: 'We order the stone and polish the metal. You can track progress. Fully insured.' },
  { step: 5, title: 'Set & finish', body: 'When the stone/s arrive, we set and finish. Final balance is due before collection or dispatch.' },
  { step: 6, title: 'Collection', body: 'We call you when it’s ready. Collect in Cape Town or we ship globally. Certified, guaranteed.' },
];

const NAV_CARDS: { id: AppView; label: string; short: string; icon: React.ReactNode }[] = [
  { id: 'RingBuilder', label: 'Jewellery Builder', short: 'Design your piece', icon: <Gem size={28} strokeWidth={1.2} /> },
  { id: 'Collection', label: 'Collection', short: 'Curated designs', icon: <ShoppingBag size={28} strokeWidth={1.2} /> },
  { id: 'Learn', label: 'Learn', short: 'Stones, shapes, care', icon: <BookOpen size={28} strokeWidth={1.2} /> },
  { id: 'Chatbot', label: 'Contact', short: 'Questions? Get in touch', icon: <MessageSquare size={28} strokeWidth={1.2} /> },
];

interface HomeProps {
  theme?: 'dark' | 'light';
  onStart: () => void;
  onLearn: () => void;
  onNavigate?: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ theme = 'dark', onStart, onLearn, onNavigate }) => {
  const processRef = useRef<HTMLElement>(null);

  return (
    <div className="flex flex-col items-center">
      {/* Hero: video left, image right. Gradient mesh overlay for depth. */}
      <section className="relative w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen overflow-hidden">
        {/* Subtle animated gradient orbs (Spline-like depth, CSS only) */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
        </div>

        <div className="relative flex flex-col justify-center min-h-[50vh] lg:min-h-screen order-2 lg:order-1 z-10">
          <video
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/92 to-transparent" />
          <div className="relative z-10 px-6 py-16 lg:py-24 pt-28 lg:pt-32">
            <p className="text-[#A9A9A9] text-[11px] uppercase tracking-[0.4em] mb-2">{DONTPAYRETAIL}</p>
            <p className="text-[#A9A9A9] text-sm uppercase tracking-[0.3em] mb-4">Cape Town • Global</p>
            <h1 className="text-white text-4xl md:text-6xl font-thin tracking-tight leading-tight mb-6">
              CRAFT YOUR DREAM JEWELLERY <br />
              <span className="font-light italic">WITHOUT THE HASSLE.</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-light mb-8 max-w-xl leading-relaxed">
              We pioneer {DONTPAYRETAIL}. Every piece is made to order—no inventory—so you never pay retail. Ethically sourced. Certified. GIA & EGL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onStart}
                className="bg-white text-black px-8 py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group"
              >
                Start Jewellery Builder
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLearn}
                className="text-white border border-white/20 px-8 py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-white/5 transition-all"
              >
                Learn About Jewellery
              </button>
            </div>
            <p className="text-gray-500 text-[13px] max-w-md">
              Not sure where to start? <button type="button" onClick={() => processRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">See the typical process</button> from enquiry to collection.
            </p>
          </div>
        </div>

        <div className="relative min-h-[40vh] lg:min-h-screen order-1 lg:order-2 z-10">
          <img src={homeImg} alt="The Diamond Guy" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none lg:hidden bg-[linear-gradient(to_bottom,transparent_50%,#0a0a0a_100%)]" aria-hidden />
          <div className="absolute inset-0 pointer-events-none hidden lg:block bg-[linear-gradient(to_right,#0a0a0a_0%,transparent_50%)]" aria-hidden />
        </div>
      </section>

      {/* Where to go: visual nav cards */}
      <section className={`w-full py-16 lg:py-24 px-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
        <div className="max-w-5xl mx-auto">
          <p className={`text-[11px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>What you can do here</p>
          <h2 className={`text-2xl md:text-3xl font-thin tracking-tight mb-10 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Navigate the app</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {NAV_CARDS.map(({ id, label, short, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id === 'RingBuilder') onStart();
                  else if (id === 'Learn') onLearn();
                  else onNavigate?.(id);
                }}
                className={`group flex flex-col items-start p-6 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                  theme === 'light'
                    ? 'border-gray-200 bg-white hover:border-emerald-400 hover:shadow-lg'
                    : 'border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-white/10'
                }`}
              >
                <span className={`mb-3 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{icon}</span>
                <span className={`text-[13px] font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>{label}</span>
                <span className={`text-[12px] mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{short}</span>
                <span className={`mt-2 text-[11px] uppercase tracking-wider flex items-center gap-1 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Go <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* The typical process */}
      <section
        ref={processRef}
        className={`w-full py-16 lg:py-24 px-6 scroll-mt-24 ${theme === 'light' ? 'bg-white' : 'bg-[#0a0a0a]'}`}
      >
        <div className="max-w-4xl mx-auto">
          <p className={`text-[11px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>No surprises</p>
          <h2 className={`text-2xl md:text-4xl font-thin tracking-tight mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>The typical process</h2>
          <p className={`text-[14px] md:text-base max-w-2xl mb-12 leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>
            From your first enquiry to collection—here’s how it works. We receive your enquiry, you get quoted, and once you accept we take a 50% deposit to secure your stone/s (each stone is bought on demand for your custom jewellery). We then order the stone, polish the metal, and when the stone/s arrive we set and call you when it’s ready for collection.
          </p>
          <div className="relative space-y-0">
            {/* Vertical timeline connector */}
            <div
              className={`absolute left-[29px] top-6 bottom-6 w-px hidden sm:block ${
                theme === 'light' ? 'bg-emerald-200/80' : 'bg-emerald-500/30'
              }`}
              aria-hidden
            />
            {PROCESS_STEPS.map(({ step, title, body }) => (
              <div
                key={step}
                className={`relative flex gap-6 rounded-xl p-6 border transition-colors mb-8 last:mb-0 ${
                  theme === 'light' ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ring-4 ${theme === 'light' ? 'bg-emerald-100 text-emerald-800 ring-gray-50' : 'bg-emerald-500/20 text-emerald-400 ring-[#0a0a0a]'}`}>
                  {step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-semibold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h3>
                  <p className={`text-[14px] md:text-base leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>{body}</p>
                </div>
                <div className={`flex-shrink-0 self-start ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-500'}`}>
                  <CheckCircle2 size={22} strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax / trust strip */}
      <ParallaxSection theme={theme} className="w-full py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className={`text-[11px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{DONTPAYRETAIL}</p>
          <p className={`text-[13px] uppercase tracking-widest leading-relaxed ${theme === 'light' ? 'text-black/80' : 'text-white/90'}`}>
            Pioneers of the movement. Custom only. No inventory—that’s how we charge under retail. Ethically sourced diamonds. Certified. GIA & EGL.
          </p>
        </div>
      </ParallaxSection>

      {/* Features Grid */}
      <section className={`py-12 lg:py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 ${theme === 'light' ? 'bg-gray-50' : ''}`}>
        <Feature
          theme={theme}
          icon={<ShieldCheck size={32} strokeWidth={1} />}
          title="Ethical Sourcing"
          desc={`Natural or Lab—every stone is certified and ethically verified. ${DONTPAYRETAIL}.`}
        />
        <Feature
          theme={theme}
          icon={<Sparkles size={32} strokeWidth={1} />}
          title="Master Craftsmanship"
          desc="Each piece is made to order. No inventory. Custom design, under retail."
        />
        <Feature
          theme={theme}
          icon={<Clock size={32} strokeWidth={1} />}
          title="Global Concierge"
          desc="Track from CAD to final polish. Fully insured global delivery."
        />
      </section>
    </div>
  );
};

/** Parallax section: background layer moves slower on scroll */
const ParallaxSection = ({ theme, className = '', children }: { theme?: 'dark' | 'light'; className?: string; children: React.ReactNode }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      const distanceFromCenter = sectionCenter - viewportCenter;
      const parallaxFactor = 0.15;
      const offset = distanceFromCenter * parallaxFactor;
      bg.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDark = theme !== 'light';
  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div ref={bgRef} className="absolute inset-0 -z-10 transition-transform duration-100 will-change-transform" style={{ transform: 'translateY(0)' }} aria-hidden>
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]' : 'bg-gradient-to-b from-[#f5f5f5] via-[#F9F9F9] to-[#f5f5f5]'}`} />
        <div className={`absolute inset-0 opacity-30 ${isDark ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(212,175,55,0.08),transparent)]' : 'bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(212,175,55,0.06),transparent)]'}`} />
      </div>
      {children}
    </section>
  );
};

const Feature = ({ theme = 'dark', icon, title, desc }: { theme?: 'dark' | 'light'; icon: React.ReactNode; title: string; desc: string }) => {
  const isLight = theme === 'light';
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className={`mb-2 ${isLight ? 'text-black' : 'text-white'}`}>{icon}</div>
      <h3 className={`text-[15px] uppercase tracking-[0.4em] font-light ${isLight ? 'text-black' : 'text-white'}`}>{title}</h3>
      <p className={`text-[14px] font-light leading-relaxed px-4 ${isLight ? 'text-black/80' : 'text-white/90'}`}>{desc}</p>
    </div>
  );
};

export default Home;
