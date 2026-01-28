import React from 'react';
import { X, Ruler, Circle, FileText, Scissors, Sparkles } from 'lucide-react';
import RingSizeTable from './RingSizeTable';
import GlowingOrbSizeControl from './GlowingOrbSizeControl';
import { RING_SYSTEMS } from '../ringSizeData';

interface RingSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

const RingSizeGuideModal: React.FC<RingSizeGuideModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ring-size-guide-title"
    >
      <div
        className={`max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-sm border shadow-xl animate-fadeIn ${
          isDark ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-black/10 text-black'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-current/10 px-6 py-4 backdrop-blur-sm bg-inherit">
          <h2 id="ring-size-guide-title" className="text-[11px] uppercase tracking-[0.4em] font-bold">
            Ring size guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-10">
          <p className="text-[10px] uppercase tracking-widest opacity-78 max-w-2xl">
            Find your size using any of the methods below, then use the conversion chart to match your region.
          </p>

          <section>
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <Ruler size={14} /> How to measure
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className={`p-4 rounded-sm border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                <h4 className="text-[9px] uppercase tracking-widest font-bold mb-2">String or paper strip</h4>
                <p className="text-[10px] opacity-85 leading-relaxed">
                  Wrap a non-stretch string or a strip of paper around the base of the finger. Mark where it overlaps, then measure the length in mm. That’s the circumference—use the chart to find your size.
                </p>
              </div>
              <div className={`p-4 rounded-sm border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                <h4 className="text-[9px] uppercase tracking-widest font-bold mb-2">Existing ring</h4>
                <p className="text-[10px] opacity-85 leading-relaxed">
                  Place a ring that fits well on a ruler and measure the inside diameter in mm. Match that diameter in the chart to get your size in UK/SA, US, or EU.
                </p>
              </div>
              <div className={`p-4 rounded-sm border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                <h4 className="text-[9px] uppercase tracking-widest font-bold mb-2">Printable ring sizer</h4>
                <p className="text-[10px] opacity-85 leading-relaxed">
                  Print a ring sizer at 100% scale (no scaling). Slip the tapered band over your finger; the number where it sits snugly is your size. Ensure your printer is set to actual size.
                </p>
              </div>
              <div className={`p-4 rounded-sm border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                <h4 className="text-[9px] uppercase tracking-widest font-bold mb-2">Jeweler or mandrel</h4>
                <p className="text-[10px] opacity-85 leading-relaxed">
                  A jeweler can size you in seconds. Mandrels (cone-shaped tools marked with sizes) are used in stores—you slide rings on until one fits. Best for accuracy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <Circle size={14} /> Measuring tools & methods
            </h3>
            <ul className={`space-y-2 text-[10px] opacity-85 ${isDark ? 'text-white' : 'text-black'}`}>
              <li className="flex items-start gap-2">
                <Scissors size={12} className="mt-0.5 flex-shrink-0 opacity-60" />
                <span><strong className="uppercase tracking-wider">String + ruler</strong> — Free. Wrap, mark, measure length in mm = circumference.</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText size={12} className="mt-0.5 flex-shrink-0 opacity-60" />
                <span><strong className="uppercase tracking-wider">Printable sizer</strong> — Download from our Guides or use a standard PDF. Print at 100%, then follow the cut-and-wrap instructions.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ruler size={12} className="mt-0.5 flex-shrink-0 opacity-60" />
                <span><strong className="uppercase tracking-wider">Measure a ring</strong> — Inner diameter in mm (edge to edge, not including the band). Twice that × 3.14 ≈ circumference, or look up diameter in the chart.</span>
              </li>
              <li className="flex items-start gap-2">
                <Circle size={12} className="mt-0.5 flex-shrink-0 opacity-60" />
                <span><strong className="uppercase tracking-wider">Jeweler / mandrel</strong> — In-store sizing is fastest and most reliable. Sizes are often given in UK/SA or US.</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Visualize size
            </h3>
            <p className="text-[9px] opacity-65 mb-3">
              Use the slider to see how big a given size looks. Switch the metric to diameter (mm), circumference (mm), or carat (round stone).
            </p>
            <GlowingOrbSizeControl theme={theme} initialDiameterMM={17} stageSize={200} />
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-2">Size standards & conversions</h3>
            <p className="text-[9px] opacity-65 mb-4">
              UK/SA use letters (e.g. M, N); US/Canada use numbers; EU/French use circumference in mm. Use the chart to convert between systems.
            </p>
            <div className={isDark ? '' : 'ring-1 ring-black/10 rounded-sm overflow-hidden'}>
              <RingSizeTable />
            </div>
            <p className="text-[8px] uppercase tracking-widest opacity-50 mt-2">
              {RING_SYSTEMS.map(s => s.label).join(' · ')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RingSizeGuideModal;
