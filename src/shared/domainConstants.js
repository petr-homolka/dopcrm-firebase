/**
 * domainConstants.js — sdílené doménové číselníky, portováno z vanilla
 * prototypu (app.js REL_TYPES/CARE, 2026-07-02).
 *
 * Stejně jako v prototypu jde o konstanty v kódu, ne Firestore kolekci —
 * jsou to pevně dané legislativní/procesní kategorie (typy vztahů, typy
 * péče), ne data, která by uživatel měnil za běhu.
 */

/**
 * Typy vztahů osoby k dítěti. `legal`:
 *   true  = má rodičovská práva (zapsán/a v RL)
 *   false = bez práv (sociální/biologický bez zápisu, domnělý…)
 *   'rep' = zákonný zástupce (osvojitel/poručník/opatrovník)
 *   'birth' = matka dle §775 (kdo dítě porodila, bez ohledu na zápis)
 */
export const REL_TYPES = [
  { key: 'mat_rl',      skupina: 'Matka',  label: 'Matka (v rodném listě)',       legal: true,  hint: 'Matka zapsaná v RL — má práva k dítěti.' },
  { key: 'mat_mimo',    skupina: 'Matka',  label: 'Matka (mimo RL)',              legal: 'birth', hint: 'Porodila dítě (§775), ale není zapsaná v RL.' },
  { key: 'mat_adop',    skupina: 'Matka',  label: 'Matka (adoptivní)',            legal: true,  hint: 'Matka po osvojení — plná rodičovská práva.' },
  { key: 'mat_gen',     skupina: 'Matka',  label: 'Matka (genetická/náhradní)',   legal: false, hint: 'Genetická nebo náhradní matka — bez práv.' },

  { key: 'ot_rl',       skupina: 'Otec',   label: 'Otec (v rodném listě)',        legal: true,  hint: 'Otec zapsaný v RL — má práva k dítěti.' },
  { key: 'ot_bio_pravd',skupina: 'Otec',   label: 'Otec (bio-pravděpodobný)',     legal: false, hint: 'Pravděpodobný biologický otec, není v RL — bez práv.' },
  { key: 'ot_bio_domn', skupina: 'Otec',   label: 'Otec (bio-domnělý)',           legal: false, hint: 'Domnělý biologický otec — bez práv, řeší soud.' },
  { key: 'ot_nevlastni',skupina: 'Otec',   label: 'Otec (nevlastní)',             legal: false, hint: 'Partner matky, není v RL — bez práv.' },
  { key: 'ot_nez',      skupina: 'Otec',   label: 'Otec (nezapsán)',              legal: false, hint: 'Dítě nemá otce zapsaného v RL.' },
  { key: 'ot_popr',     skupina: 'Otec',   label: 'Otec (popřen)',                legal: false, hint: 'Otcovství bylo soudně popřeno — bez práv.' },

  { key: 'sib_vlastni', skupina: 'Sourozenci', label: 'Sourozenec (vlastní)',     legal: false, hint: 'Stejná matka i otec.' },
  { key: 'sib_polo',    skupina: 'Sourozenci', label: 'Sourozenec (polorodý)',    legal: false, hint: 'Sdílí jen jednoho rodiče.' },
  { key: 'sib_nevl',    skupina: 'Sourozenci', label: 'Sourozenec (nevlastní)',   legal: false, hint: 'Rodinná vazba bez společného rodiče.' },

  { key: 'osvojitel',   skupina: 'Zákonný zástupce', label: 'Osvojitel',   legal: 'rep', hint: 'Zákonný zástupce po osvojení.' },
  { key: 'porucnik',    skupina: 'Zákonný zástupce', label: 'Poručník',    legal: 'rep', hint: 'Soudem určený poručník.' },
  { key: 'opatrovnik',  skupina: 'Zákonný zástupce', label: 'Opatrovník',  legal: 'rep', hint: 'Opatrovník (typicky pro nemocné/postižené dítě).' },

  { key: 'prarodic',    skupina: 'Širší rodina', label: 'Prarodič', legal: false, hint: 'Babička nebo dědeček.' },
  { key: 'teta',        skupina: 'Širší rodina', label: 'Teta',     legal: false, hint: 'Sestra jednoho z rodičů.' },
  { key: 'stryc',       skupina: 'Širší rodina', label: 'Strýc',    legal: false, hint: 'Bratr jednoho z rodičů.' },
];

export function relLabel(key) {
  return REL_TYPES.find((r) => r.key === key)?.label ?? key;
}

export function relLegalLabel(legal) {
  if (legal === true) return 'práva k dítěti';
  if (legal === 'rep') return 'zákonný zástupce';
  if (legal === 'birth') return 'matka dle porodu';
  return 'bez práv';
}

export function relLegalColor(legal) {
  if (legal === true) return 'success';
  if (legal === 'rep') return 'info';
  if (legal === 'birth') return 'success';
  return 'default';
}

/** Skupiny pro výběr v UI (select po skupinách, jako v prototypu). */
export function relGroups() {
  const groups = {};
  for (const r of REL_TYPES) {
    (groups[r.skupina] ??= []).push(r);
  }
  return groups;
}

/**
 * Typy péče — shodné s prototypem (App.CARE): barva pro odznaky/avatary
 * a počet povinných hodin vzdělávání pěstouna za 12 měsíců.
 */
export const CARE_TYPES = {
  long: { label: 'Dlouhodobá péče', short: 'Dlouhodobá', color: '#6B7FD0', requiredHours: 24 },
  temp: { label: 'Přechodná péče',  short: 'Přechodná',  color: '#F59E0B', requiredHours: 24 },
  kin:  { label: 'Příbuzenská péče', short: 'Příbuzenská', color: '#8B5CF6', requiredHours: 18 },
};

export function careLabel(key) {
  return CARE_TYPES[key]?.label ?? key ?? '—';
}
