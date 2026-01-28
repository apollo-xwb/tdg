import type { JewelerAvailabilitySlot, Appointment } from '../types';

/** Parse "HH:MM" to minutes since midnight */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Slot length in minutes when suggesting times */
const SLOT_MINUTES = 30;

/**
 * Returns available time slots for a given date.
 * @param availability Jeweler's recurring weekly slots
 * @param appointmentsOnDay Appointments that overlap this date (startAt/endAt as ISO strings for that day)
 * @param dateStr "YYYY-MM-DD"
 */
export function getAvailableSlotsForDate(
  availability: JewelerAvailabilitySlot[],
  appointmentsOnDay: Appointment[],
  dateStr: string
): { start: string; end: string }[] {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const daySlots = availability.filter((a) => a.dayOfWeek === dayOfWeek);
  if (daySlots.length === 0) return [];

  const bookedRanges = appointmentsOnDay
    .filter((a) => a.status === 'scheduled')
    .map((a) => {
      const s = new Date(a.startAt);
      const e = new Date(a.endAt);
      return {
        start: s.getHours() * 60 + s.getMinutes(),
        end: e.getHours() * 60 + e.getMinutes(),
      };
    });

  const out: { start: string; end: string }[] = [];
  const base = dateStr;
  for (const slot of daySlots) {
    const startM = toMinutes(slot.startTime);
    const endM = toMinutes(slot.endTime);
    for (let m = startM; m + SLOT_MINUTES <= endM; m += SLOT_MINUTES) {
      const slotStart = m;
      const slotEnd = m + SLOT_MINUTES;
      const blocked = bookedRanges.some((r) => r.start < slotEnd && r.end > slotStart);
      if (!blocked) out.push({ start: toHHMM(slotStart), end: toHHMM(slotEnd) });
    }
  }
  return out;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
