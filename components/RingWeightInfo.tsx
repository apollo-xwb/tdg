
import React, { useState } from 'react';
import { EXCHANGE_RATES } from '../constants';
import CustomSelect from './CustomSelect';

type Currency = keyof typeof EXCHANGE_RATES;

function formatCurrency(amount: number, currency: Currency): string {
  const sym: Record<string, string> = { ZAR: 'R', USD: '$', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$' };
  return `${sym[currency] || currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function convertCurrency(amountZAR: number, _from: string, to: Currency): number {
  if (to === 'ZAR') return amountZAR;
  const r = EXCHANGE_RATES[to]?.rate;
  return r ? amountZAR / r : amountZAR;
}

const METAL_PRICES_ZAR = { gold: 1575, platinum: 590 };

interface WeightRow {
  size: string;
  circumference: string;
  gold2: string; platinum2: string;
  gold3: string; platinum3: string;
  gold4: string; platinum4: string;
  gold5: string; platinum5: string;
}

const WEIGHT_DATA: WeightRow[] = [
  { size: 'E', circumference: '42.9', gold2: '1.99', platinum2: '2.73', gold3: '2.98', platinum3: '4.09', gold4: '3.98', platinum4: '5.46', gold5: '4.97', platinum5: '6.82' },
  { size: 'F', circumference: '43.5', gold2: '2.04', platinum2: '2.8', gold3: '3.06', platinum3: '4.2', gold4: '4.08', platinum4: '5.6', gold5: '5.1', platinum5: '7' },
  { size: 'F½', circumference: '44.2', gold2: '2.07', platinum2: '2.84', gold3: '3.1', platinum3: '4.26', gold4: '4.14', platinum4: '5.68', gold5: '5.17', platinum5: '7.09' },
  { size: 'G', circumference: '45.5', gold2: '2.13', platinum2: '2.92', gold3: '3.19', platinum3: '4.38', gold4: '4.26', platinum4: '5.84', gold5: '5.32', platinum5: '7.3' },
  { size: 'G½', circumference: '45.8', gold2: '2.14', platinum2: '2.94', gold3: '3.22', platinum3: '4.41', gold4: '4.29', platinum4: '5.88', gold5: '5.36', platinum5: '7.35' },
  { size: 'H', circumference: '46.1', gold2: '2.16', platinum2: '2.96', gold3: '3.24', platinum3: '4.44', gold4: '4.31', platinum4: '5.92', gold5: '5.39', platinum5: '7.4' },
  { size: 'H½', circumference: '46.4', gold2: '2.17', platinum2: '2.98', gold3: '3.26', platinum3: '4.47', gold4: '4.34', platinum4: '5.96', gold5: '5.43', platinum5: '7.45' },
  { size: 'I', circumference: '46.8', gold2: '2.19', platinum2: '3', gold3: '3.29', platinum3: '4.51', gold4: '4.38', platinum4: '6.01', gold5: '5.48', platinum5: '7.51' },
  { size: 'I½', circumference: '47.1', gold2: '2.2', platinum2: '3.02', gold3: '3.31', platinum3: '4.54', gold4: '4.41', platinum4: '6.05', gold5: '5.51', platinum5: '7.56' },
  { size: 'J', circumference: '47.4', gold2: '2.22', platinum2: '3.04', gold3: '3.33', platinum3: '4.56', gold4: '4.44', platinum4: '6.09', gold5: '5.55', platinum5: '7.61' },
  { size: 'J½', circumference: '47.7', gold2: '2.23', platinum2: '3.06', gold3: '3.35', platinum3: '4.59', gold4: '4.46', platinum4: '6.12', gold5: '5.58', platinum5: '7.66' },
  { size: 'K', circumference: '48', gold2: '2.25', platinum2: '3.08', gold3: '3.37', platinum3: '4.62', gold4: '4.49', platinum4: '6.16', gold5: '5.62', platinum5: '7.7' },
  { size: 'K½', circumference: '48.4', gold2: '2.27', platinum2: '3.11', gold3: '3.4', platinum3: '4.66', gold4: '4.53', platinum4: '6.21', gold5: '5.66', platinum5: '7.77' },
  { size: 'L', circumference: '48.7', gold2: '2.28', platinum2: '3.13', gold3: '3.42', platinum3: '4.69', gold4: '4.56', platinum4: '6.25', gold5: '5.7', platinum5: '7.82' },
  { size: 'L½', circumference: '49', gold2: '2.29', platinum2: '3.15', gold3: '3.44', platinum3: '4.72', gold4: '4.59', platinum4: '6.29', gold5: '5.73', platinum5: '7.86' },
  { size: 'M', circumference: '49.3', gold2: '2.31', platinum2: '3.17', gold3: '3.46', platinum3: '4.75', gold4: '4.61', platinum4: '6.33', gold5: '5.77', platinum5: '7.91' },
  { size: 'M½', circumference: '49.6', gold2: '2.32', platinum2: '3.18', gold3: '3.48', platinum3: '4.78', gold4: '4.64', platinum4: '6.37', gold5: '5.8', platinum5: '7.96' },
  { size: 'N', circumference: '50', gold2: '2.34', platinum2: '3.21', gold3: '3.51', platinum3: '4.81', gold4: '4.68', platinum4: '6.42', gold5: '5.85', platinum5: '8.02' },
  { size: 'N½', circumference: '50.3', gold2: '2.35', platinum2: '3.23', gold3: '3.53', platinum3: '4.84', gold4: '4.71', platinum4: '6.46', gold5: '5.89', platinum5: '8.07' },
  { size: 'O', circumference: '50.6', gold2: '2.37', platinum2: '3.25', gold3: '3.55', platinum3: '4.87', gold4: '4.74', platinum4: '6.5', gold5: '5.92', platinum5: '8.12' },
  { size: 'O½', circumference: '51.2', gold2: '2.4', platinum2: '3.29', gold3: '3.59', platinum3: '4.93', gold4: '4.79', platinum4: '6.57', gold5: '5.99', platinum5: '8.22' },
  { size: 'P', circumference: '51.5', gold2: '2.41', platinum2: '3.31', gold3: '3.62', platinum3: '4.96', gold4: '4.82', platinum4: '6.61', gold5: '6.03', platinum5: '8.27' },
  { size: 'Q', circumference: '53.5', gold2: '2.51', platinum2: '3.44', gold3: '3.76', platinum3: '5.16', gold4: '5.01', platinum4: '6.88', gold5: '6.27', platinum5: '8.6' },
  { size: 'R', circumference: '55.5', gold2: '2.6', platinum2: '3.57', gold3: '3.9', platinum3: '5.35', gold4: '5.2', platinum4: '7.14', gold5: '6.5', platinum5: '8.92' },
];

interface RingWeightInfoProps {
  circumferenceMM: number;
  britishSize?: string;
  theme?: 'dark' | 'light';
}

const RingWeightInfo: React.FC<RingWeightInfoProps> = ({ circumferenceMM, britishSize, theme = 'dark' }) => {
  const [currency, setCurrency] = useState<Currency>('ZAR');

  const row = WEIGHT_DATA.find((r) => r.size === britishSize) ?? WEIGHT_DATA.reduce<WeightRow | null>((best, r) => {
    const d = Math.abs(parseFloat(r.circumference) - circumferenceMM);
    const bd = best ? Math.abs(parseFloat(best.circumference) - circumferenceMM) : Infinity;
    return d < bd ? r : best;
  }, null);

  if (!row) return null;

  const calc = (g: string, metal: 'gold' | 'platinum') => {
    const amt = parseFloat(g) * METAL_PRICES_ZAR[metal];
    return formatCurrency(convertCurrency(amt, 'ZAR', currency), currency);
  };

  const curKeys = Object.keys(EXCHANGE_RATES) as Currency[];

  const rows: [string, keyof WeightRow, keyof WeightRow][] = [['2mm', 'gold2', 'platinum2'], ['3mm', 'gold3', 'platinum3'], ['4mm', 'gold4', 'platinum4'], ['5mm', 'gold5', 'platinum5']];

  return (
    <div className="border border-current/10 rounded-sm p-3 sm:p-4 mt-4 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold">Estimated Ring Weight & Price</h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest opacity-60">Currency</span>
          <div className="w-24 min-w-[5rem]">
            <CustomSelect
              options={curKeys.map((c) => ({ value: c, label: c }))}
              value={currency}
              onChange={(v) => setCurrency(v as Currency)}
              theme={theme}
              compact
            />
          </div>
        </div>
      </div>

      {/* Mobile: stacked cards, no horizontal scroll */}
      <div className="md:hidden space-y-2 min-w-0">
        {rows.map(([w, gk, pk]) => (
          <div key={w} className="py-2 border-b border-current/10 text-[10px] min-w-0">
            <div className="font-bold uppercase tracking-wider mb-0.5">{w}</div>
            <div className="opacity-80 flex flex-wrap gap-x-3 gap-y-0.5">
              <span>Gold {(row as any)[gk]}g ({calc((row as any)[gk], 'gold')})</span>
              <span>Pt {(row as any)[pk]}g ({calc((row as any)[pk], 'platinum')})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: full table */}
      <div className="hidden md:block min-w-0 w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full text-[10px] min-w-[380px]">
          <thead>
            <tr className="border-b border-current/10">
              <th className="text-[9px] uppercase tracking-widest font-bold py-2 text-left">Width</th>
              <th className="text-[9px] uppercase tracking-widest font-bold py-2 text-left">Gold (g)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold py-2 text-left">Gold Price</th>
              <th className="text-[9px] uppercase tracking-widest font-bold py-2 text-left">Platinum (g)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold py-2 text-left">Platinum Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([w, gk, pk]) => (
              <tr key={w} className="border-b border-current/5">
                <td className="py-1.5">{w}</td>
                <td className="py-1.5">{(row as any)[gk]}</td>
                <td className="py-1.5">{calc((row as any)[gk], 'gold')}</td>
                <td className="py-1.5">{(row as any)[pk]}</td>
                <td className="py-1.5">{calc((row as any)[pk], 'platinum')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[9px] opacity-50 mt-3 break-words min-w-0">
        Based on UK ring size {row.size} (circumference: {row.circumference}mm). Prices are estimates. Gold: {formatCurrency(METAL_PRICES_ZAR.gold, currency)}/g, Platinum: {formatCurrency(METAL_PRICES_ZAR.platinum, currency)}/g.
      </p>
    </div>
  );
};

export default RingWeightInfo;
