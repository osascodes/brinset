export const LAGOS_TIMEZONE = "Africa/Lagos";
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

export function lagosDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isDateKey(value?: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function lagosDayRange(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - LAGOS_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end, key };
}

export function resolveDayKey(value?: string | Date | null) {
  if (typeof value === "string" && isDateKey(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return lagosDateKey(value);
  return lagosDateKey(new Date());
}

export function addDateKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function weekStartKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  return addDateKey(key, -mondayOffset);
}

export function monthStartKey(key: string) {
  return `${key.slice(0, 8)}01`;
}

export function monthEndKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0));
  return last.toISOString().slice(0, 10);
}
