import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEV_PRICING_TIERS,
  DEV_PRICING_GROUPS,
  DEV_PRICING_FEATURES,
  DEV_ROI_NOTES,
  type DevPricingTierId,
  type DevPricingGroupId,
  type DevPricingFeature,
} from '../data/devPricingConfig';

/**
 * DevPricingLab
 *
 * Internal-only “inception showroom” for you as the builder.
 * Think of this as a Tesla configurator for your SaaS pricing and value model.
 *
 * It never appears in normal navigation – only when dev mode is toggled and the
 * current user is whitelisted in VITE_DEV_PRICING_ADMINS.
 */

type StoreProfile = {
  monthlyRevenue: number;
  locations: number;
  staff: number;
};

const DEFAULT_PROFILE: StoreProfile = {
  monthlyRevenue: 60000,
  locations: 1,
  staff: 4,
};

function formatUsd(x: number): string {
  return `$${x.toLocaleString(undefined, { maximumFractionDigits: x >= 100 ? 0 : 2 })}`;
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function getFeaturesForGroup(groupId: DevPricingGroupId): DevPricingFeature[] {
  return DEV_PRICING_FEATURES.filter((f) => f.group === groupId);
}

const DevPricingLab: React.FC = () => {
  const navigate = useNavigate();
  const [activeTier, setActiveTier] = useState<DevPricingTierId>('atelier');
  const [activeGroup, setActiveGroup] = useState<DevPricingGroupId>('crm');
  const [profile, setProfile] = useState<StoreProfile>(DEFAULT_PROFILE);
  const [clientName, setClientName] = useState<string>('');
  const [enabledKeys, setEnabledKeys] = useState<Set<string>>(
    () => new Set(DEV_PRICING_FEATURES.filter((f) => f.includedIn.includes('atelier')).map((f) => f.key)),
  );

  const tier = useMemo(
    () => DEV_PRICING_TIERS.find((t) => t.id === activeTier)!,
    [activeTier],
  );

  const toggledFeatures = useMemo(
    () => DEV_PRICING_FEATURES.filter((f) => enabledKeys.has(f.key)),
    [enabledKeys],
  );

  const { monthlyAddonUsd, setupAddonUsd, projectedExtraRevenue, projectedExtraMargin, paybackMonths } = useMemo(() => {
    const monthAddon = toggledFeatures.reduce((sum, f) => sum + f.baseMonthlyUsd, 0);
    const setupAddon = toggledFeatures.reduce((sum, f) => sum + f.baseSetupUsd, 0);

    // Simple ROI heuristic: weight revenue & margin contributions against store profile.
    const avgRevenueWeight =
      toggledFeatures.length === 0
        ? 0
        : toggledFeatures.reduce((sum, f) => sum + f.weightRevenue, 0) / toggledFeatures.length;
    const avgMarginWeight =
      toggledFeatures.length === 0
        ? 0
        : toggledFeatures.reduce((sum, f) => sum + f.weightMargin, 0) / toggledFeatures.length;

    // Clamp uplift bands to 12–25% for CRM stacks, but scale by weights.
    const [minSales, maxSales] = DEV_ROI_NOTES.typicalSalesUpliftCrm;
    const salesUplift = clamp(minSales + (maxSales - minSales) * avgRevenueWeight, minSales, maxSales);
    const [minMargin, maxMargin] = DEV_ROI_NOTES.marginImprovementRange;
    const marginUplift = clamp(minMargin + (maxMargin - minMargin) * avgMarginWeight, minMargin, maxMargin);

    const projectedExtraRev = profile.monthlyRevenue * salesUplift;
    const projectedExtraMarg = projectedExtraRev * marginUplift;

    const totalMonthlyFee = tier.monthlyUsd + monthAddon;
    const payback =
      projectedExtraMarg > 0 ? (tier.setupUsd + setupAddon) / projectedExtraMarg : Number.POSITIVE_INFINITY;

    return {
      monthlyAddonUsd: monthAddon,
      setupAddonUsd: setupAddon,
      projectedExtraRevenue: projectedExtraRev,
      projectedExtraMargin: projectedExtraMarg,
      paybackMonths: payback,
    };
  }, [toggledFeatures, profile.monthlyRevenue, tier.monthlyUsd, tier.setupUsd]);

  const handleToggleFeature = (key: string) => {
    setEnabledKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetToTierPreset = (tierId: DevPricingTierId) => {
    const preset = DEV_PRICING_FEATURES.filter((f) => f.includedIn.includes(tierId)).map((f) => f.key);
    setEnabledKeys(new Set(preset));
  };

  const currentGroup = DEV_PRICING_GROUPS.find((g) => g.id === activeGroup)!;
  const groupFeatures = getFeaturesForGroup(activeGroup);

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col">
      <header className="border-b border-white/10 px-6 md:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="text-[9px] uppercase tracking-[0.4em] text-emerald-400/80">Dev Only</p>
          <h1 className="text-2xl md:text-3xl font-thin tracking-[0.25em] uppercase">
            Atelier Pricing Lab
          </h1>
          <p className="text-xs text-white/60 max-w-2xl">
            Your private showroom for experimenting with tiers, features, and ROI. Nothing here is
            visible to real jewelers – it&apos;s pricing inception.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">
            Current Tier Canvas
          </span>
          <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1 gap-1">
            {DEV_PRICING_TIERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTier(t.id);
                  resetToTierPreset(t.id);
                }}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] rounded-full transition-all ${
                  activeTier === t.id ? 'bg-white text-black font-semibold' : 'text-white/60'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-white/70">
          <label className="text-[9px] uppercase tracking-[0.3em] text-white/50">
            Client name (for proposal)
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Aurora Diamonds"
            className="mt-1 w-48 bg-black/40 border border-white/25 rounded-full px-3 py-1 text-[11px] placeholder:text-white/40"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ml-auto px-3 py-1.5 rounded-full border border-white/20 text-[9px] uppercase tracking-[0.25em] text-white/70 hover:bg-white/10 transition-colors"
        >
          Exit lab
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left sidebar: groups */}
        <aside className="border-r border-white/10 bg-gradient-to-b from-[#050608] to-[#050608]/80 px-5 py-6 space-y-4">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">Feature Clusters</p>
          <div className="flex flex-col gap-1.5">
            {DEV_PRICING_GROUPS.map((group) => {
              const isActive = activeGroup === group.id;
              const count = DEV_PRICING_FEATURES.filter((f) => f.group === group.id).length;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-[10px] uppercase tracking-[0.2em] transition-all ${
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{group.label}</span>
                    <span className="text-[9px] opacity-70">{count}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 text-[10px] text-white/40 leading-relaxed">
            <p className="mb-1 font-semibold text-white/70">ROI heuristics baked in:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Sales uplift band: {Math.round(DEV_ROI_NOTES.typicalSalesUpliftCrm[0] * 100)}–
                {Math.round(DEV_ROI_NOTES.typicalSalesUpliftCrm[1] * 100)}% for CRM + automation.
              </li>
              <li>
                Margin improvement: {Math.round(DEV_ROI_NOTES.marginImprovementRange[0] * 100)}–
                {Math.round(DEV_ROI_NOTES.marginImprovementRange[1] * 100)}% on custom.
              </li>
              <li>
                Quoting time saved: {Math.round(DEV_ROI_NOTES.quotingTimeSaved[0] * 100)}–
                {Math.round(DEV_ROI_NOTES.quotingTimeSaved[1] * 100)}%.
              </li>
            </ul>
          </div>
        </aside>

        {/* Middle: configurator for active group */}
        <section className="px-6 py-6 lg:py-8 overflow-y-auto">
          <div className="mb-6 space-y-2">
            <h2 className="text-sm uppercase tracking-[0.35em] text-emerald-300">
              {currentGroup.label}
            </h2>
            <p className="text-xs text-white/70 max-w-2xl">{currentGroup.description}</p>
          </div>

          <div className="space-y-4">
            {groupFeatures.map((feature) => {
              const enabled = enabledKeys.has(feature.key);
              return (
                <article
                  key={feature.key}
                  className={`relative rounded-xl border px-4 py-4 md:px-5 md:py-5 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center ${
                    enabled ? 'border-emerald-400/70 bg-emerald-400/5' : 'border-white/12 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(feature.key)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs uppercase tracking-[0.2em] ${
                          enabled
                            ? 'border-emerald-400 bg-emerald-400 text-black'
                            : 'border-white/30 text-white/50'
                        }`}
                      >
                        {enabled ? 'On' : 'Off'}
                      </button>
                      <div>
                        <h3 className="text-xs md:text-sm uppercase tracking-[0.25em]">
                          {feature.label}
                        </h3>
                        <p className="text-[11px] text-emerald-200/80 mt-0.5">{feature.short}</p>
                      </div>
                    </div>
                    <p className="text-[11px] md:text-xs text-white/70 leading-relaxed">{feature.long}</p>
                    {feature.dependsOn && feature.dependsOn.length > 0 && (
                      <p className="text-[10px] text-amber-300/80">
                        Depends on: {feature.dependsOn.map((d) => d.replace(/_/g, ' ')).join(', ')}.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[140px]">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Internal price anchor
                    </span>
                    <div className="text-right">
                      <p className="text-sm">
                        {formatUsd(feature.baseMonthlyUsd)} <span className="text-xs text-white/60">/mo</span>
                      </p>
                      <p className="text-[11px] text-white/50">
                        + {formatUsd(feature.baseSetupUsd)} <span className="text-[10px]">setup</span>
                      </p>
                    </div>
                    <div className="mt-1 flex gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                        Rev {Math.round(feature.weightRevenue * 100)}%
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                        Margin {Math.round(feature.weightMargin * 100)}%
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] uppercase tracking-[0.2em] text-white/55">
                        Time {Math.round(feature.weightTime * 100)}%
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Right: summary & ROI */}
        <aside className="border-l border-white/10 bg-[#050608]/95 px-6 py-6 lg:py-8 space-y-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
              Store Profile (for ROI)
            </p>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/70">Monthly revenue</span>
                <input
                  type="number"
                  value={profile.monthlyRevenue}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, monthlyRevenue: Number(e.target.value || 0) }))
                  }
                  className="w-28 bg-black/50 border border-white/20 px-2 py-1 text-right text-[11px] rounded-sm"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/70">Locations</span>
                <input
                  type="number"
                  min={1}
                  value={profile.locations}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, locations: Number(e.target.value || 1) }))
                  }
                  className="w-16 bg-black/50 border border-white/20 px-2 py-1 text-right text-[11px] rounded-sm"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/70">Staff using the system</span>
                <input
                  type="number"
                  min={1}
                  value={profile.staff}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, staff: Number(e.target.value || 1) }))
                  }
                  className="w-16 bg-black/50 border border-white/20 px-2 py-1 text-right text-[11px] rounded-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">Pricing Canvas</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Base monthly (tier)</span>
                <span className="font-semibold">{formatUsd(tier.monthlyUsd)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Feature add-ons</span>
                <span>{formatUsd(monthlyAddonUsd)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-200">
                <span className="text-white/80">Total monthly</span>
                <span className="font-semibold">
                  {formatUsd(tier.monthlyUsd + monthlyAddonUsd)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-white/70">Setup (tier)</span>
                <span>{formatUsd(tier.setupUsd)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/70">Setup add-ons</span>
                <span>{formatUsd(setupAddonUsd)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-200">
                <span className="text-white/80">Total setup</span>
                <span className="font-semibold">
                  {formatUsd(tier.setupUsd + setupAddonUsd)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">ROI Sketch</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Projected extra revenue / mo</span>
                <span className="text-emerald-200 font-semibold">
                  {formatUsd(projectedExtraRevenue || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Projected extra margin / mo</span>
                <span className="text-emerald-200 font-semibold">
                  {formatUsd(projectedExtraMargin || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Payback period (months)</span>
                <span className="font-semibold">
                  {Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : '∞'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-white/45 leading-relaxed mt-2">
              These aren&apos;t promises – they&apos;re grounded heuristics based on jewellery CRM /
              POS case studies: 12–25% sales uplift, 12–15% inventory reduction, and 60–80% less
              time burned on quoting.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <button
              type="button"
              className="w-full py-2.5 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.3em] font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigate('/dev/pricing/proposal', {
                  state: {
                    tierId: tier.id,
                    profile,
                    enabledKeys: Array.from(enabledKeys),
                    clientName: clientName.trim() || undefined,
                  },
                });
              }}
            >
              Generate Proposal Deck
            </button>
            <p className="text-[10px] text-white/45">
              When you&apos;re ready, wire this button to a Supabase Edge Function that renders a
              pitch deck PDF based on <code>DEV_PRICING_FEATURES</code> and the current selection.
            </p>
          </div>
        </aside>
      </div>
      {/* Dev-only footer strip */}
      <footer className="border-t border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 px-6 md:px-8 py-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/60">
        <span className="uppercase tracking-[0.25em]">
          TDG Atelier OS · Internal Pricing Lab
        </span>
        <span className="flex items-center gap-3">
          <span>Benchmarks: +12–25% sales · +5–15% margin · 60–80% quoting time saved</span>
        </span>
      </footer>
    </div>
  );
};

export default DevPricingLab;

