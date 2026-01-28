import React, { useState, useEffect, useMemo } from 'react';
import { getJewelerEmail } from '../lib/supabase';
import { fetchJewelerAvailability, fetchAppointments, createAppointment } from '../lib/supabase';
import { getAvailableSlotsForDate } from '../lib/calendarSlots';
import type { JewelerAvailabilitySlot, Appointment, OpeningHoursEntry } from '../types';
import { Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

function openingHoursToSlots(hours: OpeningHoursEntry[] | null | undefined): JewelerAvailabilitySlot[] {
  if (!hours?.length) return [];
  return hours
    .filter((h) => h.open != null && h.close != null)
    .map((h) => ({
      id: `oh-${h.day}`,
      jewelerId: '',
      dayOfWeek: h.day,
      startTime: `${String(h.open!).padStart(2, '0')}:00`,
      endTime: `${String(h.close!).padStart(2, '0')}:00`,
      updatedAt: '',
    }));
}

interface BookConsultationProps {
  theme?: 'dark' | 'light';
  onNavigate?: (view: string) => void;
  /** Store hours used when jeweler has no custom availability slots. */
  openingHours?: OpeningHoursEntry[] | null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = last.getDate();
  const flat: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) flat.push(null);
  for (let d = 1; d <= days; d++) flat.push(d);
  const rows: (number | null)[][] = [];
  for (let r = 0; r < flat.length; r += 7) rows.push(flat.slice(r, r + 7));
  return rows;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isPast(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day);
  const t = new Date();
  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);
  return d < t;
}

const BookConsultation: React.FC<BookConsultationProps> = ({ theme = 'dark', onNavigate, openingHours }) => {
  const jewelerId = getJewelerEmail();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [date, setDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<JewelerAvailabilitySlot[]>([]);
  const [appointmentsOnDay, setAppointmentsOnDay] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const grid = useMemo(() => buildMonthGrid(viewMonth.year, viewMonth.month), [viewMonth.year, viewMonth.month]);

  const openWeekdays = useMemo(() => {
    const effective = availability.length ? availability : openingHoursToSlots(openingHours);
    return new Set(effective.map((s) => s.dayOfWeek));
  }, [availability, openingHours]);

  useEffect(() => {
    if (!jewelerId) return;
    fetchJewelerAvailability(jewelerId).then(setAvailability);
  }, [jewelerId]);

  useEffect(() => {
    if (!jewelerId || !date) return;
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');
    fetchAppointments(jewelerId, dayStart.toISOString(), dayEnd.toISOString()).then((apps) => {
      setAppointmentsOnDay(apps);
      const effective = availability.length ? availability : openingHoursToSlots(openingHours);
      const s = getAvailableSlotsForDate(effective, apps, date);
      setSlots(s);
      setSelectedSlot(null);
    });
  }, [jewelerId, date, availability, openingHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jewelerId || !date || !selectedSlot || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    const startAt = new Date(date + 'T' + selectedSlot.start + ':00');
    const endAt = new Date(date + 'T' + selectedSlot.end + ':00');
    const id = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ok = await createAppointment({
      id,
      jewelerId,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      clientName: name.trim(),
      clientEmail: email.trim(),
      summary: summary.trim() || 'Consultation',
      status: 'scheduled',
    });
    setSubmitting(false);
    if (ok) setDone(true);
    else alert('Booking failed. Please try again.');
  };

  if (!jewelerId) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-widest opacity-70">Booking is not configured. Set your jeweller in the app.</p>
        {onNavigate && <button type="button" onClick={() => onNavigate('Home')} className="mt-6 text-[10px] uppercase tracking-widest underline hover:no-underline">Back to home</button>}
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-24 text-center animate-fadeIn">
        <CheckCircle className="mx-auto mb-6 text-emerald-500" size={64} />
        <h2 className="text-2xl font-thin tracking-tight uppercase mb-4">You&apos;re booked</h2>
        <p className="text-[11px] uppercase tracking-widest opacity-80 mb-8">We&apos;ll see you then. If you need to change or cancel, get in touch.</p>
        {onNavigate && <button type="button" onClick={() => onNavigate('Home')} className="px-8 py-4 border border-current text-[10px] uppercase tracking-widest hover:bg-white/5">Back to home</button>}
      </div>
    );
  }

  const isDark = theme === 'dark';
  const cardClass = isDark ? 'glass border-white/10' : 'bg-white/5 border-black/10';
  const cellClass = (day: number | null, year: number, month: number) => {
    if (day === null) return 'opacity-0 cursor-default';
    const past = isPast(year, month, day);
    const closed = !openWeekdays.has(new Date(year, month, day).getDay());
    const dStr = dateKey(year, month, day);
    const selected = date === dStr;
    if (past || closed) return 'opacity-40 cursor-not-allowed';
    return selected
      ? 'bg-white text-black font-bold ring-2 ring-current cursor-pointer'
      : 'hover:bg-white/10 cursor-pointer';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 lg:py-16 animate-fadeIn">
      <h1 className="text-3xl font-thin tracking-tighter uppercase mb-2 flex items-center gap-3">
        <Calendar size={28} /> Book a visit
      </h1>
      <p className="text-[10px] uppercase tracking-widest opacity-70 mb-10">Pick a day on the calendar, then choose an available time.</p>

      <div className="grid lg:grid-cols-[1fr,380px] gap-10 lg:gap-14">
        {/* Calendar */}
        <div className={cardClass + ' border rounded-sm p-6'}>
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setViewMonth((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }))}
              className="p-2 -m-2 hover:bg-white/10 rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-[11px] uppercase tracking-widest font-bold">
              {MONTHS[viewMonth.month]} {viewMonth.year}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }))}
              className="p-2 -m-2 hover:bg-white/10 rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-[8px] uppercase tracking-widest opacity-60 py-1 font-bold">
                {w}
              </div>
            ))}
            {grid.flatMap((row, ri) =>
              row.map((day, ci) => {
                const dStr = day !== null ? dateKey(viewMonth.year, viewMonth.month, day) : '';
                const past = day !== null && isPast(viewMonth.year, viewMonth.month, day);
                const closed = day !== null && !openWeekdays.has(new Date(viewMonth.year, viewMonth.month, day).getDay());
                return (
                  <button
                    key={`${ri}-${ci}`}
                    type="button"
                    disabled={past || closed || day === null}
                    onClick={() => day !== null && !past && !closed && setDate(dStr)}
                    className={`py-3 text-[11px] uppercase tracking-widest transition-colors rounded-sm ${cellClass(day, viewMonth.year, viewMonth.month)}`}
                  >
                    {day ?? ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Slots + form */}
        <div className="space-y-6">
          {date && (
            <>
              <div className={cardClass + ' border rounded-sm p-6 space-y-4'}>
                <label className="text-[9px] uppercase tracking-widest font-bold block flex items-center gap-2">
                  <Clock size={12} /> {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </label>
                {slots.length === 0 && (
                  <p className="text-[10px] opacity-65">No availability on this day. Pick another date.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.start + slot.end}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2.5 text-[10px] uppercase tracking-widest border transition-all rounded-sm ${
                        selectedSlot?.start === slot.start ? 'bg-white text-black border-white' : 'border-current/30 hover:border-current/60'
                      }`}
                    >
                      {slot.start} – {slot.end}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className={cardClass + ' border rounded-sm p-6 space-y-4'}>
                <p className="text-[9px] uppercase tracking-widest font-bold block">Your details</p>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-black/30 border border-current/20 p-3 text-sm focus:outline-none focus:border-current/50 placeholder:text-white/70 placeholder:opacity-90"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/30 border border-current/20 p-3 text-sm focus:outline-none focus:border-current/50 placeholder:text-white/70 placeholder:opacity-90"
                />
                <div>
                  <label className="text-[8px] uppercase tracking-widest font-bold block mb-2">What would you like to discuss?</label>
                  <textarea
                    placeholder="e.g. Engagement ring consultation, stone viewing..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    className="w-full bg-black/30 border border-current/20 p-3 text-sm focus:outline-none focus:border-current/50 placeholder:text-white/70 placeholder:opacity-90 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedSlot || !name.trim() || !email.trim() || submitting}
                  className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {submitting ? 'Booking…' : 'Confirm booking'}
                </button>
              </form>
            </>
          )}
          {!date && (
            <div className={cardClass + ' border rounded-sm p-8 text-center'}>
              <Clock size={32} className="mx-auto mb-4 opacity-40" />
              <p className="text-[10px] uppercase tracking-widest opacity-70">Select a day on the calendar to see available times.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookConsultation;
