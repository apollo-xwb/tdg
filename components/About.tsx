
import React from 'react';
import { Star } from 'lucide-react';
import { DONTPAYRETAIL, GOOGLE_RATING, GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_URL } from '../constants';

const DEFAULT_ABOUT = (
  <>
    <p className="text-base md:text-lg font-light leading-relaxed opacity-90 max-w-2xl">
      At The Diamond Guy, we specialise in bespoke engagement rings and handcrafted jewellery, uniquely designed to reflect your style and budget. Founded by Darren Phillips, we are South Africa&apos;s premier private jeweller—offering a highly personalised experience that blends honest guidance with exceptional craftsmanship.
    </p>

    <div className="flex flex-wrap items-center gap-3 py-4">
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-current/20 hover:border-current/50 transition-colors"
        aria-label={`${GOOGLE_RATING} out of 5 stars, ${GOOGLE_REVIEW_COUNT} Google reviews`}
      >
        <span className="font-semibold tabular-nums">{GOOGLE_RATING.toFixed(1)}</span>
        <span className="flex items-center gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={18} className="fill-current" strokeWidth={0} />
          ))}
        </span>
        <span className="text-[10px] uppercase tracking-wider opacity-90">{GOOGLE_REVIEW_COUNT} Google reviews</span>
      </a>
    </div>

    <div className="space-y-8 text-sm font-light opacity-90 leading-relaxed max-w-3xl">
      <section>
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4">{DONTPAYRETAIL} — Why we do it</h2>
        <p>
          We believe you should never pay retail for something made for you. Every piece we create is custom made to order. We hold minimal inventory, work directly with certified sources, and pass the savings on. That&apos;s the promise behind {DONTPAYRETAIL}: ethical, traceable, and under retail—every time.
        </p>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Ethics & certification</h2>
        <p>
          We ethically source GIA-certified natural and lab-grown diamonds, ensuring every stone meets the highest standards of quality, beauty, and sustainability. From timeless engagement rings to statement jewellery, every creation is crafted with integrity and built to last.
        </p>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Your story, your design</h2>
        <p>
          Every piece tells a story of love and commitment. We work with you from first sketch to final polish—offering honest guidance on stone choice, metal, and design so the result reflects who you are. Bespoke means no compromise: your style, your budget, your timeline.
        </p>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Cape Town & beyond</h2>
        <p>
          Based in Cape Town, we serve clients across South Africa and internationally. Whether you visit us in person or work with us remotely, you get the same attention to detail, the same promise of {DONTPAYRETAIL}, and the same commitment to craftsmanship that has defined The Diamond Guy since day one.
        </p>
      </section>
    </div>
  </>
);

const About: React.FC<{ theme?: 'dark' | 'light'; content?: string | null }> = ({ theme = 'dark', content }) => {
  const useCustom = typeof content === 'string' && content.trim().length > 0;
  const isDark = theme === 'dark';

  return (
    <div className={`max-w-4xl mx-auto px-6 py-20 space-y-12 animate-fadeIn ${isDark ? 'text-white' : 'text-black'}`}>
      <header>
        <h1 className="text-5xl font-thin tracking-tighter uppercase">Our Story</h1>
        <p className="text-[10px] uppercase tracking-[0.35em] opacity-70 mt-2">{DONTPAYRETAIL}. Founded on it.</p>
      </header>

      {useCustom ? (
        <div
          className="text-sm font-light leading-relaxed opacity-90 max-w-3xl space-y-6"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {content!.trim()}
        </div>
      ) : (
        DEFAULT_ABOUT
      )}
    </div>
  );
};

export default About;
