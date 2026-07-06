/**
 * rcUtils.js — validace a rozbor českého rodného čísla (2026-07-06). Cíl:
 * klíčová osoba nemá ručně vyplňovat datum narození, když ho lze z RČ
 * dopočítat, a má se hned dozvědět, když si RČ přehodila/přeťukla.
 *
 * Formát: YYMMDD/XXX(X). Měsíc kóduje pohlaví (+50 ženy) a přečíslování při
 * vyčerpání čísel v rámci dne (+20, od r. 2004) — obojí kombinovatelné.
 * Kontrolní součet (dělitelnost 11) platí jen pro čísla se 4místnou koncovkou
 * (od 1954) a MÁ výjimky (cizinci, historická data) — proto je to varování,
 * ne blokující chyba; formát a platnost data narození ANO blokují.
 */

function centuryFor(yy, hasFullSuffix) {
  if (!hasFullSuffix) return 1900; // 3místná koncovka = přidělováno jen do 1954
  const currentYY = new Date().getFullYear() % 100;
  // Dvojčíslí "z budoucnosti" (větší než aktuální rok v tomto století) může
  // patřit jen do minulého století — jinak preferujeme bližší, pravděpodobnější století.
  return yy > currentYY + 1 ? 1900 : 2000;
}

/**
 * @param {string} rawRc
 * @returns {{ valid: boolean, error: string|null, birthDate: Date|null, gender: 'f'|'m'|null, checksumWarning: boolean }}
 */
export function parseRc(rawRc) {
  const digits = (rawRc || '').replace(/[\s/]/g, '');
  const empty = { valid: false, error: null, birthDate: null, gender: null, checksumWarning: false };
  if (!digits) return empty;

  if (!/^\d{9,10}$/.test(digits)) {
    return { ...empty, error: 'Rodné číslo musí mít 9 nebo 10 číslic.' };
  }

  const yy = Number(digits.slice(0, 2));
  let mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  let gender = 'm';

  if (mm >= 71 && mm <= 82) { mm -= 70; gender = 'f'; }
  else if (mm >= 51 && mm <= 62) { mm -= 50; gender = 'f'; }
  else if (mm >= 21 && mm <= 32) { mm -= 20; }

  if (mm < 1 || mm > 12) {
    return { ...empty, error: 'Rodné číslo obsahuje neplatný měsíc.' };
  }
  if (dd < 1 || dd > 31) {
    return { ...empty, error: 'Rodné číslo obsahuje neplatný den.' };
  }

  const hasFullSuffix = digits.length === 10;
  const year = centuryFor(yy, hasFullSuffix) + yy;
  const birthDate = new Date(year, mm - 1, dd);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (birthDate.getMonth() !== mm - 1 || birthDate.getDate() !== dd || birthDate > today) {
    return { ...empty, error: 'Rodné číslo obsahuje neplatné datum narození.' };
  }

  const checksumWarning = hasFullSuffix && Number(digits) % 11 !== 0;

  return { valid: true, error: null, birthDate, gender, checksumWarning };
}

/** Pro <input type="date"> — 'YYYY-MM-DD'. */
export function toDateInputValue(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
