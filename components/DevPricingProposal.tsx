import React, { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEV_PRICING_TIERS,
  DEV_PRICING_FEATURES,
  DEV_PRICING_GROUPS,
  DEV_ROI_NOTES,
  type DevPricingTierId,
} from '../data/devPricingConfig';

type ProposalState = {
  tierId: DevPricingTierId;
  profile: {
    monthlyRevenue: number;
    locations: number;
    staff: number;
  };
  enabledKeys: string[];
  clientName?: string;
};

function formatUsd(x: number): string {
  return `$${x.toLocaleString(undefined, { maximumFractionDigits: x >= 100 ? 0 : 2 })}`;
}

const DevPricingProposal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ProposalState | undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tier = useMemo(
    () => DEV_PRICING_TIERS.find((t) => t.id === (state?.tierId ?? 'atelier'))!,
    [state?.tierId],
  );

  const features = useMemo(
    () => DEV_PRICING_FEATURES.filter((f) => state?.enabledKeys?.includes(f.key)),
    [state?.enabledKeys],
  );

  const profile = state?.profile ?? { monthlyRevenue: 60000, locations: 1, staff: 4 };

  const totals = useMemo(() => {
    const monthlyAddon = features.reduce((sum, f) => sum + f.baseMonthlyUsd, 0);
    const setupAddon = features.reduce((sum, f) => sum + f.baseSetupUsd, 0);
    const monthly = tier.monthlyUsd + monthlyAddon;
    const setup = tier.setupUsd + setupAddon;
    return { monthlyAddon, setupAddon, monthly, setup };
  }, [features, tier.monthlyUsd, tier.setupUsd]);

  const handleDownloadPdf = async () => {
    const root = containerRef.current;
    const w = window as any;
    if (!root || !w.jspdf || !w.jspdf.jsPDF || !w.html2canvas) {
      // Fallback to native print-to-PDF if libraries are unavailable
      window.print();
      return;
    }
    try {
      const { jsPDF } = w.jspdf;
      const doc = new jsPDF('p', 'pt', 'a4');
      const filename = `TDG-proposal-${state?.clientName ? state.clientName.replace(/\s+/g, '-') + '-' : ''}${tier.name}.pdf`;
      await doc.html(root, {
        callback: (d: any) => d.save(filename),
        margin: [32, 24, 32, 24],
        autoPaging: 'text',
        // Use the already-loaded global html2canvas instance to avoid dynamic loading under SES
        html2canvas: w.html2canvas,
      });
    } catch (err) {
      // If html2canvas or jsPDF html plugin fails, fall back to native print-to-PDF
      // eslint-disable-next-line no-console
      console.warn('[DevPricingProposal] PDF generation failed, falling back to window.print()', err);
      window.print();
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xs text-white/70">
          No proposal context found. Open the Dev Pricing Lab and click &quot;Generate Proposal&quot;
          again.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dev/pricing')}
          className="px-4 py-2 rounded-full border border-white/30 text-[10px] uppercase tracking-[0.25em] hover:bg-white/10"
        >
          Back to pricing lab
        </button>
      </div>
    );
  }

  const grouped = DEV_PRICING_GROUPS.map((group) => ({
    group,
    features: features.filter((f) => f.group === group.id),
  })).filter((g) => g.features.length > 0);

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto px-6 md:px-10 py-8 space-y-8 print:px-6 print:py-6"
      >
        {/* Header / Cover */}
        <header className="border-b border-white/15 pb-6 flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-[0.4em] text-emerald-300/80">
            TDG Atelier OS · Internal Proposal
          </p>
          <h1 className="text-3xl md:text-4xl font-thin tracking-[0.18em] uppercase">
            Pricing &amp; ROI Deck
          </h1>
          <p className="text-xs text-white/70 max-w-3xl">
            This is a dev‑only pitch deck view generated from the current configuration in your
            pricing lab. Use the PDF export below to send a professional quote.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-white/70">
            <span className="uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-white/5 border border-white/20">
              {tier.name}
            </span>
            <span>Revenue: {formatUsd(profile.monthlyRevenue)}/mo</span>
            <span>Locations: {profile.locations}</span>
            <span>Staff: {profile.staff}</span>
            {state.clientName && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/15">
                Client: <span className="font-semibold">{state.clientName}</span>
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/70">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/15">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">
                Monthly Fee (est.)
              </p>
              <p className="text-lg font-semibold">
                {formatUsd(totals.monthly)}{' '}
                <span className="text-xs text-white/60 font-normal">/mo</span>
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/15">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">
                Setup Investment
              </p>
              <p className="text-lg font-semibold">{formatUsd(totals.setup)}</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/40">
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200 mb-1">
                Benchmarks
              </p>
              <p className="text-[11px] text-emerald-100">
                +12–25% sales · +5–15% margin · 60–80% quoting time saved (industry ranges)
              </p>
            </div>
          </div>
        </header>

        {/* Feature groups */}
        <section className="space-y-5">
          {grouped.map(({ group, features }) => (
            <div key={group.id} className="border border-white/12 rounded-xl p-4 md:p-5">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.3em]">
                    {group.label}
                  </h2>
                  <p className="text-[11px] text-white/60 mt-1">{group.description}</p>
                </div>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                  {features.length} feature{features.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ul className="space-y-2">
                {features.map((f) => (
                  <li key={f.key} className="flex flex-col md:flex-row md:items-start gap-2">
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-[0.2em]">
                        {f.label}
                      </p>
                      <p className="text-[11px] text-emerald-100/80">{f.short}</p>
                      <p className="text-[11px] text-white/70 mt-1">{f.long}</p>
                    </div>
                    <div className="w-full md:w-40 text-right text-[11px] text-white/65">
                      <p>
                        {formatUsd(f.baseMonthlyUsd)} <span className="text-white/50">/mo</span>
                      </p>
                      <p className="text-white/50">
                        + {formatUsd(f.baseSetupUsd)} <span>setup</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Notes & Actions */}
        <section className="border-t border-white/15 pt-5 space-y-3">
          <p className="text-[11px] text-white/65">
            <span className="font-semibold">How to use this:</span> this proposal is meant as a
            working quote. Adjust numbers in the Dev Pricing Lab, regenerate, and then use your
            browser&apos;s <span className="font-semibold">Print → Save as PDF</span> to export a
            deck you can share with a jeweller.
          </p>
          <p className="text-[11px] text-white/55">
            <span className="font-semibold">ROI narrative snippet:</span> {DEV_ROI_NOTES.narrative}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-gray-100"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => navigate('/dev/pricing')}
              className="px-4 py-2 rounded-full border border-white/30 text-[10px] uppercase tracking-[0.25em] text-white/75 hover:bg-white/10"
            >
              Back to pricing lab
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DevPricingProposal;

