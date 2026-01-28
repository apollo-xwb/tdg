
import React from 'react';

const DEFAULT_TERMS = (
  <div className="space-y-8 text-sm font-light opacity-60 leading-relaxed">
    <section className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-widest font-bold">1. Bespoke Jewellery Manufacturing</h2>
      <p>Every piece created by The Diamond Guy is a custom bespoke item manufactured to your unique specifications. Due to the nature of custom jewellery, timelines are indicative (typically 21-28 business days) and subject to complexity.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-widest font-bold">2. Payment Policy</h2>
      <p>A non-refundable 50% deposit is required to initiate stone sourcing and metal casting. Final balance is due upon collection or prior to secure dispatch.</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-widest font-bold">3. Returns & Alterations</h2>
      <p>Bespoke items are ineligible for return or exchange. We provide one complimentary resizing service within 60 days of collection for engagement rings (where design permits).</p>
    </section>
    <section className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-widest font-bold">4. Integrity Warranty</h2>
      <p>All items carry a 1-year manufacturing warranty covering structural defects. This does not cover loss of stones or damage through wear and tear.</p>
    </section>
  </div>
);

const Terms: React.FC<{ content?: string | null }> = ({ content }) => {
  const useCustom = typeof content === 'string' && content.trim().length > 0;
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 space-y-12 animate-fadeIn">
      <h1 className="text-5xl font-thin tracking-tighter uppercase">Terms & Conditions</h1>
      {useCustom ? (
        <div
          className="text-sm font-light opacity-90 leading-relaxed prose prose-invert max-w-none"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {content!.trim()}
        </div>
      ) : (
        DEFAULT_TERMS
      )}
    </div>
  );
};

export default Terms;
