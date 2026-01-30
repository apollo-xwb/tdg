
import React, { useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { DONTPAYRETAIL } from '../constants';
import homeImg from '../src/home.png';

const VIDEO_URL = 'https://cdn.create.vista.com/api/media/medium/364417012/stock-video-beautiful-wedding-ring-rotating-on-dark-background-golden-ring-with-diamonds?token=';

const Home: React.FC<{ theme?: 'dark' | 'light'; onStart: () => void; onLearn: () => void }> = ({ theme = 'dark', onStart, onLearn }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Split hero: video left (with text/gradient), image right. Media stretches to top under navbar. */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: video + gradient + text. On mobile, below the image (order-2). */}
        <div className="relative flex flex-col justify-center min-h-[50vh] lg:min-h-screen order-2 lg:order-1">
          <video
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
          <div className="relative z-10 px-6 py-16 lg:py-24 pt-28 lg:pt-32">
            <p className="text-[#A9A9A9] text-[10px] uppercase tracking-[0.4em] mb-2">{DONTPAYRETAIL}</p>
            <p className="text-[#A9A9A9] text-sm uppercase tracking-[0.3em] mb-4">Cape Town • Global</p>
            <h1 className="text-white text-4xl md:text-6xl font-thin tracking-tight leading-tight mb-6">
              CRAFT YOUR DREAM JEWELLERY <br/>
              <span className="font-light italic">WITHOUT THE HASSLE.</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-light mb-6 max-w-xl">
              We pioneer {DONTPAYRETAIL}. Every piece is made to order—no inventory—so you never pay retail. Ethically sourced. Certified. GIA & EGL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStart}
                className="bg-white text-black px-8 py-3.5 text-[10px] uppercase tracking-widest font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group"
              >
                Start Jewellery Builder
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLearn}
                className="text-white border border-white/20 px-8 py-3.5 text-[10px] uppercase tracking-widest font-medium hover:bg-white/5 transition-all"
              >
                Learn About Jewellery
              </button>
            </div>
          </div>
        </div>
        {/* Right on desktop, top on mobile. Gradient blends into black: to-right on desktop, to-bottom on mobile. */}
        <div className="relative min-h-[40vh] lg:min-h-screen order-1 lg:order-2">
          <img src={homeImg} alt="The Diamond Guy" className="absolute inset-0 w-full h-full object-cover" />
          {/* Mobile: image on top, gradient from center to bottom into black (blends with video below) */}
          <div className="absolute inset-0 pointer-events-none lg:hidden bg-[linear-gradient(to_bottom,transparent_50%,#0a0a0a_100%)]" aria-hidden />
          {/* Desktop: image on right, gradient from left (black) to center—blends into video panel on the left */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block bg-[linear-gradient(to_right,#0a0a0a_0%,transparent_50%)]" aria-hidden />
        </div>
      </section>

      {/* Parallax scroll-stopping section */}
      <ParallaxSection theme={theme} className="w-full py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className={`text-[10px] uppercase tracking-[0.35em] mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{DONTPAYRETAIL}</p>
          <p className={`text-[9px] uppercase tracking-widest leading-relaxed ${theme === 'light' ? 'text-black/80' : 'text-white'}`}>
            Pioneers of the movement. Custom only. No inventory—that’s how we charge under retail. Ethically sourced diamonds. Certified. GIA & EGL.
          </p>
        </div>
      </ParallaxSection>

      {/* Features Grid */}
      <section className="py-12 lg:py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
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

/** Parallax section: background layer moves slower on scroll for a scroll-stopping depth effect */
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
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 transition-transform duration-100 will-change-transform"
        style={{ transform: 'translateY(0)' }}
        aria-hidden
      >
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
      <h3 className={`text-sm uppercase tracking-[0.4em] font-light ${isLight ? 'text-black' : 'text-white'}`}>{title}</h3>
      <p className={`text-sm font-light leading-relaxed px-4 ${isLight ? 'text-black' : 'text-white'}`}>{desc}</p>
    </div>
  );
};

export default Home;
