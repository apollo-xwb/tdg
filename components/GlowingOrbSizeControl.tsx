import React, { useState, useMemo } from 'react';
import CustomSelect from './CustomSelect';

const PI = Math.PI;
/** Round brilliant ~6.5 mm at 1 ct; diameter ≈ 6.5 * carat^(1/3) */
const CARAT_TO_DIAMETER = (ct: number) => 6.5 * Math.pow(Math.max(0.1, ct), 1 / 3);
const DIAMETER_TO_CARAT = (d: number) => Math.pow(Math.max(1, d) / 6.5, 3);

export type OrbMetricId = 'diameter_mm' | 'circumference_mm' | 'carat';

export interface OrbMetric {
  id: OrbMetricId;
  label: string;
  unit: string;
  /** min/max/step in this metric's units */
  min: number;
  max: number;
  step: number;
  toDisplay: (diameterMM: number) => number;
  fromDisplay: (v: number) => number;
}

const ORB_METRICS: OrbMetric[] = [
  {
    id: 'diameter_mm',
    label: 'Diameter',
    unit: 'mm',
    min: 8,
    max: 25,
    step: 0.5,
    toDisplay: (d) => d,
    fromDisplay: (v) => v,
  },
  {
    id: 'circumference_mm',
    label: 'Circumference',
    unit: 'mm',
    min: Math.round(8 * PI),
    max: Math.round(25 * PI),
    step: 1,
    toDisplay: (d) => d * PI,
    fromDisplay: (v) => v / PI,
  },
  {
    id: 'carat',
    label: 'Carat (round)',
    unit: 'ct',
    min: 0.2,
    max: 5,
    step: 0.1,
    toDisplay: (d) => DIAMETER_TO_CARAT(d),
    fromDisplay: (v) => CARAT_TO_DIAMETER(v),
  },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface GlowingOrbSizeControlProps {
  theme?: 'dark' | 'light';
  /** Optional initial diameter in mm */
  initialDiameterMM?: number;
  /** Container size in px for the orb (width/height of the stage) */
  stageSize?: number;
}

const GlowingOrbSizeControl: React.FC<GlowingOrbSizeControlProps> = ({
  theme = 'dark',
  initialDiameterMM = 17,
  stageSize = 220,
}) => {
  const [diameterMM, setDiameterMM] = useState(() => clamp(initialDiameterMM, 8, 25));
  const [metricId, setMetricId] = useState<OrbMetricId>('diameter_mm');

  const metric = useMemo(() => ORB_METRICS.find((m) => m.id === metricId) ?? ORB_METRICS[0], [metricId]);
  const displayValue = metric.toDisplay(diameterMM);
  const clampedDisplay = clamp(displayValue, metric.min, metric.max);
  const effectiveDiameter = metric.fromDisplay(clampedDisplay);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setDiameterMM(metric.fromDisplay(clamp(v, metric.min, metric.max)));
  };

  const handleMetricChange = (id: string) => {
    const nextId = id as OrbMetricId;
    setMetricId(nextId);
    const m = ORB_METRICS.find((x) => x.id === nextId)!;
    const nextDisplay = clamp(m.toDisplay(diameterMM), m.min, m.max);
    setDiameterMM(m.fromDisplay(nextDisplay));
  };

  const metricOptions = useMemo(
    () => ORB_METRICS.map((m) => ({ value: m.id, label: `${m.label} (${m.unit})` })),
    []
  );

  // Orb diameter in px: scale so 8mm -> small, 25mm -> most of stage
  const scale = (stageSize * 0.85) / 25;
  const orbSizePx = effectiveDiameter * scale;

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-sm border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: stageSize, height: stageSize }}
        >
          <div
            className="rounded-full transition-all duration-200 ease-out flex items-center justify-center"
            style={{
              width: Math.max(12, orbSizePx),
              height: Math.max(12, orbSizePx),
              background: isDark
                ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), rgba(200,220,255,0.15), rgba(80,100,180,0.08))'
                : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(200,220,255,0.5), rgba(100,120,200,0.2))',
              boxShadow: isDark
                ? `0 0 ${Math.max(20, orbSizePx * 0.6)}px rgba(180,200,255,0.35), 0 0 ${Math.max(40, orbSizePx)}px rgba(120,150,220,0.2), inset 0 0 ${Math.max(8, orbSizePx * 0.2)}px rgba(255,255,255,0.2)`
                : `0 0 ${Math.max(20, orbSizePx * 0.5)}px rgba(100,140,220,0.4), 0 0 ${Math.max(32, orbSizePx * 0.8)}px rgba(80,120,200,0.25), inset 0 0 ${Math.max(6, orbSizePx * 0.15)}px rgba(255,255,255,0.8)`,
            }}
            aria-hidden
          />
        </div>

        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-[9px] uppercase tracking-widest font-bold opacity-80">Metric</label>
            <div className="min-w-[160px]" aria-label="Units for size">
              <CustomSelect
                options={metricOptions}
                value={metricId}
                onChange={handleMetricChange}
                theme={theme}
                compact
                className="rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] opacity-70">
              <span>{metric.min} {metric.unit}</span>
              <span className="font-semibold tabular-nums">
                {metric.id === 'carat' ? displayValue.toFixed(2) : displayValue.toFixed(metric.id === 'diameter_mm' ? 1 : 0)} {metric.unit}
              </span>
              <span>{metric.max} {metric.unit}</span>
            </div>
            <input
              type="range"
              min={metric.min}
              max={metric.max}
              step={metric.step}
              value={clampedDisplay}
              onChange={handleSlider}
              className={`w-full h-2 rounded-full appearance-none cursor-pointer opacity-80 hover:opacity-100 ${isDark ? 'bg-white/10' : 'bg-black/10'} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-current [&::-webkit-slider-thumb]:bg-current [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-current [&::-moz-range-thumb]:bg-current`}
              style={{ accentColor: isDark ? 'rgba(200,220,255,0.9)' : 'rgba(80,120,200,0.9)' }}
              aria-label={`Size in ${metric.label}`}
            />
          </div>

          <p className="text-[9px] uppercase tracking-widest opacity-60">
            {metric.id === 'carat' && (
              <>≈ {effectiveDiameter.toFixed(1)} mm diameter (round brilliant)</>
            )}
            {metric.id === 'diameter_mm' && (
              <>{effectiveDiameter.toFixed(2)} mm diameter · {(effectiveDiameter * PI).toFixed(1)} mm circumference</>
            )}
            {metric.id === 'circumference_mm' && (
              <>{effectiveDiameter.toFixed(2)} mm diameter · {clampedDisplay.toFixed(0)} mm circumference</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlowingOrbSizeControl;
