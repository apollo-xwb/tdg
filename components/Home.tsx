
import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { ArrowRight, ArrowUp, ShieldCheck, Sparkles, Clock, MessageSquare, BookOpen, ShoppingBag, Gem, CheckCircle2, PenTool } from 'lucide-react';
import { DONTPAYRETAIL } from '../constants';
import type { AppView } from '../types';
import homeImg from '../src/home.png';
import greyImg from '../src/grey.jpg';
import galleryDark from '../src/Gallery/blkchk.jpg';
import galleryLight from '../src/Gallery/wtchk.jpg';

const HeroRingScene = lazy(() => import('./HeroRingScene'));

export type HeroRingPose = {
  cameraPosition: [number, number, number];
  target: [number, number, number];
  ringRotation: [number, number, number];
};

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
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const stepsRootRef = useRef<HTMLDivElement | null>(null);
  const [activeRingStep, setActiveRingStep] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const poses: HeroRingPose[] = [
    {
      cameraPosition: [4, 3.2, 4.2],
      target: [0, 0, 0],
      ringRotation: [0.1, Math.PI * 0.4, 0],
    },
    {
      cameraPosition: [3.4, 2.6, 3.0],
      target: [0, 0.1, 0],
      ringRotation: [0.1, Math.PI * 0.7, 0],
    },
    {
      cameraPosition: [2.4, 1.8, 2.4],
      target: [0, 0.3, 0],
      ringRotation: [0.2, Math.PI * 1.1, 0],
    },
    {
      cameraPosition: [3.8, 2.4, 3.8],
      target: [0, 0, 0],
      ringRotation: [0.05, Math.PI * 1.6, 0],
    },
  ];

  const carouselImages = [galleryDark, galleryLight];

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const id = window.setInterval(() => {
      setHeroImageIndex(prev => (prev + 1) % carouselImages.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const root = stepsRootRef.current || null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            (a.target as HTMLElement).dataset.stepIndex!.localeCompare(
              (b.target as HTMLElement).dataset.stepIndex!,
            ),
          );
        if (!visible.length) return;
        const idx = Number((visible[0].target as HTMLElement).dataset.stepIndex || '0');
        setActiveRingStep(idx);
      },
      {
        root,
        threshold: 0.55,
      },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Map scroll step to pose (0=hero, 1=nav, 2–7=process steps, 8=parallax)
  // For more “loyal dog” behaviour, let later steps reuse the last pose.
  const poseIndex =
    activeRingStep <= 1
      ? activeRingStep
      : activeRingStep <= 4
      ? 2
      : 3;
  const currentPose = poses[Math.min(poseIndex, poses.length - 1)];

  // Cycle stone colour per scroll step (diamond, ruby, emerald, sapphire, etc.)
  const stonePalette = ['#f7fbff', '#ff1744', '#00e676', '#2979ff', '#ffd54f'];
  const stoneColor = stonePalette[activeRingStep % stonePalette.length];

  return (
    <div className="flex flex-col items-center scroll-smooth">
      {/* Hero + scroll steps: 3D ring left (sticky), storytelling steps right in an internal snapped scroller */}
      <section className="relative w-full min-h-screen lg:grid lg:grid-cols-2 overflow-hidden">
        {/* Subtle animated gradient orbs (Spline-like depth, CSS only) */}
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
        </div>
        {/* Gentle vertical blend between left and right halves */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        {/* Left: sticky 3D ring + hero image (image behind/fallback), no video */}
        <div className="relative order-1 lg:order-1 z-10">
          <div className="sticky top-20 h-screen w-full">
            {/* Hero image as background layer (always visible) */}
            <div className="absolute inset-0 z-0">
              <img
                src={greyImg}
                alt=""
                className="w-full h-full object-cover object-center"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#050505]/85" />
            </div>
            {/* 3D ring on top */}
            <div className="relative z-10 w-full h-full min-h-[50vh] lg:min-h-screen">
              <Suspense
                fallback={
                  <div className="w-full h-full min-h-[50vh] lg:min-h-screen flex items-center justify-center">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Loading 3D ring…</div>
                  </div>
                }
              >
                <HeroRingScene
                  pose={currentPose}
                  background={theme === 'light' ? '#ffffff' : '#0a0a0a'}
                  stoneColor={stoneColor}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Right: internal snapped scroller for hero + steps, with gallery carousel background */}
        <div className="relative order-2 lg:order-2 z-10 bg-black h-screen overflow-hidden">
          {/* Background gallery carousel with darkened overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={carouselImages[heroImageIndex]}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div
            ref={stepsRootRef}
            className="home-steps h-full overflow-y-auto relative z-10"
          >
            {/* Step 0 – hero narrative */}
            <div
              className="relative flex flex-col justify-center min-h-screen snap-start"
              data-step-index={0}
              ref={(el) => {
                stepRefs.current[0] = el;
              }}
            >
              <div className="relative z-10 px-6 py-16 lg:py-24 pt-28 lg:pt-32">
                <p className="text-white/70 text-[11px] uppercase tracking-[0.4em] mb-2">{DONTPAYRETAIL}</p>
                <p className="text-white/70 text-sm uppercase tracking-[0.3em] mb-4">Cape Town • Global</p>
                <h1 className="text-white text-4xl md:text-6xl font-thin tracking-tight leading-tight mb-6">
                  CRAFT YOUR DREAM JEWELLERY <br />
                  <span className="font-light italic">WITHOUT THE HASSLE.</span>
                </h1>
                <p className="text-white/80 text-base md:text-lg font-light mb-8 max-w-xl leading-relaxed">
                  We pioneer {DONTPAYRETAIL}. Every piece is made to order—no inventory—so you never pay retail. Ethically sourced. Certified. GIA & EGL.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <button
                    onClick={onStart}
                    className="bg-white text-black px-8 py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
                  >
                    Start Jewellery Builder
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => onNavigate?.('RingBuilder') ?? onStart()}
                    className="text-white border border-emerald-400/70 px-8 py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <PenTool size={14} /> Customise ring
                  </button>
                  <button
                    onClick={onLearn}
                    className="text-white border border-white/25 px-8 py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-white/10 transition-all"
                  >
                    Learn About Jewellery
                  </button>
                </div>
                <p className="text-white/80 text-[13px] max-w-md">
                  Not sure where to start?{' '}
                  <button
                    type="button"
                    onClick={() => processRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2"
                  >
                    See the typical process
                  </button>{' '}
                  from enquiry to collection.
                </p>
              </div>
            </div>

            {/* Step 1 – where to go (nav cards) */}
            <section
              className={`w-full min-h-screen py-16 lg:py-24 px-6 flex flex-col justify-center snap-start ${theme === 'light' ? 'bg-gray-50' : 'bg-black'}`}
              data-step-index={1}
              ref={(el) => {
                stepRefs.current[1] = el;
              }}
            >
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

            {/* Steps 2–7 – typical process */}
            {PROCESS_STEPS.map(({ step, title, body }, i) => (
              <section
                key={step}
                ref={(el) => {
                  stepRefs.current[2 + i] = el;
                  if (i === 0) (processRef as React.MutableRefObject<HTMLElement | null>).current = el;
                }}
                className={`w-full min-h-screen py-16 lg:py-24 px-6 flex flex-col justify-center scroll-mt-24 snap-start ${theme === 'light' ? 'bg-white' : 'bg-[#0a0a0a]'}`}
                data-step-index={2 + i}
              >
                <div className="max-w-4xl mx-auto w-full">
                  {i === 0 && (
                    <>
                      <p className={`text-[11px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>No surprises</p>
                      <h2 className={`text-2xl md:text-4xl font-thin tracking-tight mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>The typical process</h2>
                      <p className={`text-[14px] md:text-base max-w-2xl mb-10 leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>
                        From your first enquiry to collection—here’s how it works.
                      </p>
                    </>
                  )}
                  <div className={`relative flex gap-6 rounded-xl p-8 border transition-colors ${
                    theme === 'light' ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-white/5'
                  }`}>
                    <div className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-base font-bold ring-4 ${theme === 'light' ? 'bg-emerald-100 text-emerald-800 ring-gray-50' : 'bg-emerald-500/20 text-emerald-400 ring-[#0a0a0a]'}`}>
                      {step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h3>
                      <p className={`text-[15px] md:text-base leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>{body}</p>
                    </div>
                    <div className={`flex-shrink-0 self-start ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-500'}`}>
                      <CheckCircle2 size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                  {i === 0 && (
                    <p className="mt-6 text-[13px] max-w-xl">
                      <button type="button" onClick={() => onNavigate?.('RingBuilder') ?? onStart()} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium">
                        Customise your ring →
                      </button>
                      {' '}Start from the builder and we’ll take it from there.
                    </p>
                  )}
                </div>
              </section>
            ))}

            {/* Step 8 – Parallax / trust strip */}
            <ParallaxSection
              theme={theme}
              className="w-full min-h-[60vh] py-16 px-6 flex flex-col justify-center snap-start"
              data-step-index={8}
              registerStepRef={(el: HTMLElement | null) => {
                stepRefs.current[8] = el;
              }}
            >
              <div className="max-w-2xl mx-auto text-center">
                <p className={`text-[11px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{DONTPAYRETAIL}</p>
                <p className={`text-[13px] uppercase tracking-widest leading-relaxed ${theme === 'light' ? 'text-black/80' : 'text-white/90'}`}>
                  Pioneers of the movement. Custom only. No inventory—that’s how we charge under retail. Ethically sourced diamonds. Certified. GIA & EGL.
                </p>
              </div>
            </ParallaxSection>
          </div>
        </div>
      </section>

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

      {/* Scroll to top shortcut – positioned above chatbot bubble */}
      <button
        type="button"
        onClick={() => {
          if (stepsRootRef.current) {
            stepsRootRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="fixed bottom-24 right-8 z-40 w-10 h-10 rounded-full bg-black/80 text-white flex items-center justify-center shadow-lg border border-white/20 hover:bg-black"
        aria-label="Back to top"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
};

/** Trust strip section – static (no parallax) for smoothness */
const ParallaxSection = ({
  theme,
  className = '',
  children,
  registerStepRef,
  ...rest
}: {
  theme?: 'dark' | 'light';
  className?: string;
  children: React.ReactNode;
  registerStepRef?: (el: HTMLElement | null) => void;
} & React.HTMLAttributes<HTMLElement>) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isDark = theme !== 'light';
  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        registerStepRef?.(el);
      }}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div
          className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]'
              : 'bg-gradient-to-b from-[#f5f5f5] via-[#F9F9F9] to-[#f5f5f5]'
          }`}
        />
        <div
          className={`absolute inset-0 opacity-30 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(212,175,55,0.08),transparent)]'
              : 'bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(212,175,55,0.06),transparent)]'
          }`}
        />
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
