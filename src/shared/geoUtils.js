/**
 * geoUtils.js — jednorázový zápis polohy při zahájení návštěvy (2026-07-06).
 * VĖDOMĚ jen jeden bod, ne trasa/kontinuální sledování — sledování pohybu
 * zaměstnance v pracovní době má reálné právní/GDPR konotace, jeden zápis
 * "kde návštěva začala" je důkaz místa, ne sledování pohybu.
 *
 * Reverzní geokódování (lat/lng → adresa) přes OpenStreetMap Nominatim —
 * zdarma, ale bez SLA a s limitem ~1 dotaz/s (jejich usage policy). Pro
 * nízký objem (jeden dotaz na zahájenou návštěvu) v pořádku; při reálném
 * provozním nasazení zvážit placenou alternativu (Google Geocoding) pro
 * garantovanou dostupnost — zaznamenáno v docs/INVENTAR.md.
 */

/** @returns {Promise<{lat:number,lng:number,accuracy:number,capturedAt:string}|null>} null = nedostupné/zamítnuto — nikdy neblokuje zahájení návštěvy. */
export function captureLocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        capturedAt: new Date().toISOString(),
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/** Klikací odkaz na mapu (doplněk k textové adrese, ne náhrada). */
export function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

/**
 * Reverzní geokódování přes Nominatim (OpenStreetMap) — krátká adresa ve
 * stylu "Ulice 7, Město", ne plné `display_name` (to je zbytečně
 * dlouhé — okres/PSČ/země navíc). Vrací null při chybě/timeoutu — nikdy
 * neblokuje zápis návštěvy, adresa je jen doplňující zobrazovaný text.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.municipality;
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    const short = [street, city].filter(Boolean).join(', ');
    return short || data.display_name || null;
  } catch {
    return null;
  }
}
