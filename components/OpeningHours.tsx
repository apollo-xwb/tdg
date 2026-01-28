
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { OPENING_HOURS, TDG_ADDRESS, TDG_PHONE } from '../constants';
import type { OpeningHoursEntry } from '../types';

const HOURS_DEFAULT: OpeningHoursEntry[] = OPENING_HOURS;

// Africa/Johannesburg
const nowSA = () => {
  const d = new Date();
  return new Date(d.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }));
};

const getNext = (hours: OpeningHoursEntry[]): { label: 'Opening in' | 'Closing in'; ms: number } => {
  const n = nowSA();
  const day = n.getDay();
  const hrs = n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600;
  const s = hours.find(o => o.day === day) ?? hours[0];
  if (s?.open != null && s?.close != null) {
    if (hrs < s.open) return { label: 'Opening in', ms: (s.open - hrs) * 3600 * 1000 };
    if (hrs < s.close) return { label: 'Closing in', ms: (s.close - hrs) * 3600 * 1000 };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const t = hours.find(o => o.day === d);
    if (t?.open != null) {
      const next = new Date(n);
      next.setDate(next.getDate() + i);
      next.setHours(t.open, 0, 0, 0);
      return { label: 'Opening in', ms: next.getTime() - n.getTime() };
    }
  }
  return { label: 'Opening in', ms: 0 };
};

const fmt = (ms: number) => {
  if (ms <= 0) return '0m';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const OpeningHoursCountdown: React.FC<{ className?: string; hours?: OpeningHoursEntry[] | null }> = ({ className = '', hours }) => {
  const h = hours ?? HOURS_DEFAULT;
  const [v, setV] = useState(() => getNext(h));
  useEffect(() => {
    const t = setInterval(() => setV(getNext(h)), 60000);
    return () => clearInterval(t);
  }, [h]);
  return (
    <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 ${className}`}>
      <Clock size={12} />
      <span>{v.label} {fmt(v.ms)}</span>
    </div>
  );
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const OpeningHoursBlock: React.FC<{ compact?: boolean; hours?: OpeningHoursEntry[] | null }> = ({ hours }) => {
  const h = hours ?? HOURS_DEFAULT;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-80">
        <Clock size={12} /> Hours
      </div>
      <ul className="text-[9px] uppercase tracking-widest opacity-60 space-y-0.5">
        {DAY_ORDER.map(d => {
          const o = h.find(x => x.day === d)!;
          return o?.open != null ? <li key={d}>{o.name} {o.open}:00–{o.close}:00</li> : <li key={d}>{o?.name ?? 'Day'} Closed</li>;
        })}
      </ul>
    </div>
  );
};

export const AddressBlock: React.FC<{ address?: string | null }> = ({ address }) => (
  <div className="flex items-start gap-2">
    <MapPin size={12} className="mt-0.5 opacity-60" />
    <span className="text-[9px] uppercase tracking-widest opacity-60 leading-snug">{address ?? TDG_ADDRESS}</span>
  </div>
);

export const PhoneBlock: React.FC = () => (
  <a href={`tel:${TDG_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-2 text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100">
    <Phone size={12} /> {TDG_PHONE}
  </a>
);
