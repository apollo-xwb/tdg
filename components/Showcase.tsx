import React, { useEffect } from 'react';

const SHOWCASE_URL = 'https://demo-frame-categoryembed.jewelershowcase.com/';

interface ShowcaseProps {
  theme?: 'dark' | 'light';
}

const Showcase: React.FC<ShowcaseProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const src = 'https://assets.jewelershowcase.com/iframe-resizer-parent/main.js';
    const alreadyLoaded = Array.from(document.getElementsByTagName('script')).some(
      (s) => s.src === src
    );
    if (alreadyLoaded) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="mt-4">
      <div
        className={`
          mt-6 w-full rounded-xl overflow-hidden border 
          ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-black/40'}
          shadow-xl
        `}
      >
        <div className={`px-6 py-4 border-b ${isLight ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-black/40'}`}>
          <p className={`text-[10px] uppercase tracking-[0.3em] font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>
            Live Online Showcase
          </p>
          <p className={`mt-1 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Browse styles, compare designs, and save favourites. Click any piece to view more details directly on our partner site.
          </p>
        </div>
        <div className="relative w-full" style={{ minHeight: '900px' }}>
          <iframe
            src={SHOWCASE_URL}
            title="Jewelers Showcase – Online Collection"
            className="block w-full h-[1200px]"
            style={{ border: 'none', width: '1px', minWidth: '100%' }}
            loading="lazy"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        </div>
      </div>
    </section>
  );
};

export default Showcase;

