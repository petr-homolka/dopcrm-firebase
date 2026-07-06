/**
 * idUtils.js — interní identifikátor pro osoby bez RČ (2026-07-06): biologická
 * rodina, sociální prostor a další osoby, u kterých pravděpodobně nezískáme
 * RČ (to reálně dostaneme jen od pěstouna, dětí a zaměstnanců organizace).
 * NIKDY se nesmí identita opírat o jméno — dvě různé osoby se stejným
 * jménem/příjmením musí mít v systému jednoznačně odlišný interní klíč.
 */

export function generateLocalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
