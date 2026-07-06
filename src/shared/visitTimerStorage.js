/**
 * visitTimerStorage.js — "rozjetá" (běžící) návštěva žije jen v localStorage
 * (2026-07-06), NE ve Firestore — přežije zavření appky na stejném zařízení,
 * ale nevyžaduje žádnou změnu firestore.rules pro rozpracovaný stav. Do
 * Firestore se zapíše jediný `timeline` záznam typu `visit` až při ukončení
 * (createTimelineEntry). Jedna aktivní návštěva na zařízení/uživatele.
 */

const KEY = 'doprovazeni:activeVisit';

export function getActiveVisit() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, startedAt: new Date(parsed.startedAt) };
  } catch {
    return null;
  }
}

export function startActiveVisit({ familyId, familyName, location }) {
  const entry = { familyId, familyName, startedAt: new Date().toISOString(), location };
  localStorage.setItem(KEY, JSON.stringify(entry));
  return { ...entry, startedAt: new Date(entry.startedAt) };
}

export function clearActiveVisit() {
  localStorage.removeItem(KEY);
}

/** Doplní adresu (přijde asynchronně z reverzního geokódování) do už rozjeté návštěvy. */
export function updateActiveVisitLocation(location) {
  const current = getActiveVisit();
  if (!current) return;
  localStorage.setItem(KEY, JSON.stringify({ ...current, startedAt: current.startedAt.toISOString(), location }));
}

export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Krátký popisek pro title timeline záznamu, např. "38 min". */
export function formatDurationShort(totalSeconds) {
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 1) return 'méně než 1 min';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
