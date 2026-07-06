/**
 * domainConstants.js — sdílené doménové číselníky, portováno z vanilla
 * prototypu (app.js REL_TYPES/CARE, 2026-07-02).
 *
 * Stejně jako v prototypu jde o konstanty v kódu, ne Firestore kolekci —
 * jsou to pevně dané legislativní/procesní kategorie (typy vztahů, typy
 * péče), ne data, která by uživatel měnil za běhu.
 */

/**
 * Typy vztahů osoby k dítěti — 1:1 přenos z živého vanilla prototypu
 * (`REL_TYPES` v app.js na claude.doprovazeni.com, ne z lokálního zjednodušeného
 * MVP app.js v tomto repu — ten je jen stub bez těchto dat, viz
 * [[crm-port-prototyp-pred-novym-schematem]]). `legal`:
 *   true    = má rodičovská práva (zapsán/a v RL)
 *   false   = bez práv (sociální/biologický bez zápisu, domnělý, popřený…)
 *   'rep'   = zákonný zástupce (osvojitel/poručník/opatrovník) — zastupuje, není rodič
 *   'birth' = matka dle §775 (kdo dítě porodila, právně sporné u náhradního mateřství)
 *   'na'    = koncept "práva k dítěti" se nevztahuje (sourozenci, širší rodina)
 */
/**
 * `legalWeight` — zjednodušení `legal` na tři úrovně pro vizuální štítek u
 * osoby v okolí dítěte (viz docs/domain/vztahy-a-osoby.md): `pecujici`
 * (pěstoun se svěřením — NENÍ položka REL_TYPES, odvozuje se z `custody`,
 * viz `services/org/children.js`), `bez_prav`, `rodicovska_odpovednost`.
 */
export const REL_TYPES = [
  { key: 'otec_rl',      skupina: 'Otec',  label: 'Otec (v rodném listě)',                    legal: true,  legalWeight: 'rodicovska_odpovednost', hint: 'Otcem je vždy muž zapsaný v RL (1.–3. domněnka). Má rodičovská práva.' },
  { key: 'otec_soc',     skupina: 'Otec',  label: 'Otec sociální (v RL, nejspíš nebiologický)', legal: true,  legalWeight: 'rodicovska_odpovednost', hint: 'Zapsán v RL → má práva. Existuje domněnka, že není biologickým otcem.' },
  { key: 'biootec_prav', skupina: 'Otec',  label: 'Bio-otec (pravděpodobný)',                 legal: false, legalWeight: 'bez_prav', hint: 'Domněnka biologického otcovství; dítě v RL otce nemá (nebo zapsaný je sociální). Bez práv, dokud nezapsán soudem.' },
  { key: 'biootec_domn', skupina: 'Otec',  label: 'Bio-otec (domnělý)',                       legal: false, legalWeight: 'bez_prav', hint: 'Domněnka, že je biolog. otec, ale dítě MÁ v RL jiného otce. Bez práv. Zápis jen soudem (popření + určení dle DNA).' },
  { key: 'otec_nezn',    skupina: 'Otec',  label: 'Otec neznámý / nezapsán',                  legal: false, legalWeight: 'bez_prav', hint: 'V RL otec chybí → dítě v očích systému otce nemá.' },
  { key: 'otec_popr',    skupina: 'Otec',  label: 'Otcovství popřeno soudem',                 legal: false, legalWeight: 'bez_prav', hint: 'Otcovství zaniklo rozhodnutím soudu.' },
  { key: 'otec_nevlastni', skupina: 'Otec', label: 'Otec nevlastní (partner matky)',          legal: false, legalWeight: 'bez_prav', hint: 'Partner matky žijící s rodinou, není v RL — bez rodičovských práv.' },

  { key: 'matka_rl',     skupina: 'Matka', label: 'Matka (v rodném listě)',                   legal: true,    legalWeight: 'rodicovska_odpovednost', hint: 'Matkou je žena, která dítě porodila (§775). Nelze měnit.' },
  { key: 'biomatka_mimo',skupina: 'Matka', label: 'Bio-matka (porodila, mimo RL)',            legal: false,   legalWeight: 'bez_prav', hint: 'Reálně porodila, ale není v RL (odložené dítě, utajený porod). Pracuje se s ní jako s domnělým rodičem.' },
  { key: 'matka_nevlastni', skupina: 'Matka', label: 'Matka nevlastní (partnerka otce)',      legal: false,   legalWeight: 'bez_prav', hint: 'Partnerka otce žijící s rodinou, není v RL — bez rodičovských práv.' },
  { key: 'matka_fikce',  skupina: 'Matka', label: 'Matka určená fikcí / soudem',              legal: true,    legalWeight: 'rodicovska_odpovednost', hint: 'U neznámé matky určí matku soud (fikce) nebo místo zůstane volné do osvojení.' },
  { key: 'matka_adopt',  skupina: 'Matka', label: 'Matka adoptivní (osvojitelka)',            legal: true,    legalWeight: 'rodicovska_odpovednost', hint: 'Doplní prázdné místo v RL osvojením — NE pěstounka.' },
  { key: 'genet_matka',  skupina: 'Matka', label: 'Genetická matka (dárkyně vajíček)',        legal: false,   legalWeight: 'bez_prav', hint: 'Náhradní mateřství; právně není matkou, dokud dítě neosvojí.' },
  { key: 'nahr_matka',   skupina: 'Matka', label: 'Náhradní matka (odnosila a porodila)',     legal: 'birth', legalWeight: 'rodicovska_odpovednost', hint: 'Porodila → dle §775 je matkou v RL, dokud genetická matka neosvojí (právně sporné).' },

  { key: 'osvojitel',    skupina: 'Osvojitel / zástupce', label: 'Osvojitel (adoptivní rodič)',       legal: true,  legalWeight: 'rodicovska_odpovednost', hint: 'Osvojením vzniká plný rodičovský vztah, mění se RL.' },
  { key: 'porucnik',     skupina: 'Osvojitel / zástupce', label: 'Poručník',                          legal: 'rep', legalWeight: 'rodicovska_odpovednost', hint: 'Pečuje a zastupuje, když žádný rodič nemá rodičovskou odpovědnost; není rodič.' },
  { key: 'opatrovnik',   skupina: 'Osvojitel / zástupce', label: 'Opatrovník (např. kolizní — OSPOD)', legal: 'rep', legalWeight: 'rodicovska_odpovednost', hint: 'Zastupuje dítě v konkrétní věci / při střetu zájmů.' },

  { key: 'sour_vlastni', skupina: 'Sourozenci', label: 'Vlastní sourozenec',   legal: 'na', legalWeight: 'bez_prav', hint: 'Sdílí oba biologické rodiče.' },
  { key: 'sour_polo',    skupina: 'Sourozenci', label: 'Polorodý sourozenec',  legal: 'na', legalWeight: 'bez_prav', hint: 'Jeden společný biologický rodič.' },
  { key: 'sour_nevl',    skupina: 'Sourozenci', label: 'Nevlastní sourozenec', legal: 'na', legalWeight: 'bez_prav', hint: 'Žádné biologické pouto.' },

  { key: 'prarodic',     skupina: 'Širší rodina', label: 'Prarodič',       legal: 'na', legalWeight: 'bez_prav', hint: 'Babička nebo dědeček.' },
  { key: 'teta',         skupina: 'Širší rodina', label: 'Teta',           legal: 'na', legalWeight: 'bez_prav', hint: 'Sestra jednoho z rodičů.' },
  { key: 'stryc',        skupina: 'Širší rodina', label: 'Strýc',          legal: 'na', legalWeight: 'bez_prav', hint: 'Bratr jednoho z rodičů.' },
  { key: 'jiny',         skupina: 'Širší rodina', label: 'Jiný příbuzný',  legal: 'na', legalWeight: 'bez_prav', hint: 'Vzdálenější příbuzný nebo blízká osoba dítěte.' },

  { key: 'partner_pestouna', skupina: 'Pěstoun', label: 'Partner/manžel pěstouna (bez svěření)', legal: false, legalWeight: 'bez_prav', hint: 'Žije s pěstounem ve společné domácnosti, ale není uveden ve svěření tohoto dítěte (viz custody na kartě rodiny) — nemá k němu žádná práva.' },
];

/** Štítek právního postavení pro `legalWeight` (tři úrovně, DESIGN.md barvy). */
export function legalWeightLabel(weight) {
  if (weight === 'pecujici') return 'Pečující (svěřeno)';
  if (weight === 'rodicovska_odpovednost') return 'Rodičovská odpovědnost';
  return 'Bez práv k dítěti';
}

/** Badge tone pro `legalWeight` — pěstoun zelená (`family`), rodičovská odpovědnost amber, jinak stone. */
export function legalWeightTone(weight) {
  if (weight === 'pecujici') return 'family';
  if (weight === 'rodicovska_odpovednost') return 'warning';
  return 'neutral';
}

export function relLabel(key) {
  return REL_TYPES.find((r) => r.key === key)?.label ?? key;
}

export function relLegalLabel(legal) {
  if (legal === true) return 'práva k dítěti';
  if (legal === 'rep') return 'zákonný zástupce';
  if (legal === 'birth') return 'matka dle porodu';
  if (legal === 'na') return 'rodinná vazba';
  return 'bez práv';
}

export function relLegalColor(legal) {
  if (legal === true) return 'success';
  if (legal === 'rep') return 'info';
  if (legal === 'birth') return 'success';
  if (legal === 'na') return 'default';
  return 'warning';
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

/**
 * Zaměstnanecká hierarchie organizace (zadání 2026-07-02):
 *   org_admin (zástupce/ředitel) → vedouci_pobocky → teamleader →
 *   klicova_osoba → asistent_ko; zamestnanec = podpůrný personál bez
 *   řídicí role (sekretářka, ekonomka…), typicky bez nadřízeného řetězce
 *   v systému (nadřízený je vždy org_admin/ředitel).
 */
export const EMPLOYEE_ROLES = [
  { key: 'org_admin',      label: 'Zástupce organizace (ředitel/ka)' },
  { key: 'vedouci_pobocky', label: 'Vedoucí pobočky' },
  { key: 'teamleader',     label: 'Teamleader' },
  { key: 'klicova_osoba',  label: 'Klíčová osoba' },
  { key: 'asistent_ko',    label: 'Asistent klíčové osoby' },
  { key: 'zamestnanec',    label: 'Zaměstnanec (administrativa)' },
];

export function employeeRoleLabel(key) {
  return EMPLOYEE_ROLES.find((r) => r.key === key)?.label ?? key;
}

/**
 * Respit (odlehčovací volno pěstouna) — zákonné minimum dle §47a zákona
 * 359/1999 Sb., portováno z vanilla prototypu (`RESPIT_LIMIT` v app.js na
 * claude.doprovazeni.com). Nadstandard nad limit se řeší individuálním plánem
 * ochrany dítěte (IPOD) a připočítává se zvlášť (`respitNadstandard` na rodině).
 */
export const RESPIT_LIMIT = 14;

/** Typy čerpání respitu — pro výběr při zápisu události. */
export const RESPIT_TYPES = [
  { key: 'tabor_pobyt', label: 'Tábor / pobyt dítěte' },
  { key: 'hlidani', label: 'Hlídání (jiná osoba/organizace)' },
  { key: 'asistence_interni', label: 'Asistence — interní (DO)' },
  { key: 'asistence_externi', label: 'Asistence — externí' },
  { key: 'doucovani', label: 'Doučování (dítě mimo domov)' },
];

export function respitTypeLabel(key) {
  return RESPIT_TYPES.find((t) => t.key === key)?.label ?? key;
}

/** Dny čerpání jedné respitové události (včetně od i do — "i hodina = celý den"). */
export function respitEventDays(ev) {
  const from = new Date(ev.from);
  const to = new Date(ev.to || ev.from);
  const days = Math.round((to - from) / 86400000) + 1;
  return Math.max(1, days);
}

/** Vykázaný respit = součet dní všech událostí (legislativa/finance). */
export function respitVykazano(events) {
  return (events || []).reduce((sum, e) => sum + respitEventDays(e), 0);
}

/** Reálný respit = dny, kdy byly VŠECHNY děti rodiny současně mimo domov (průnik). */
export function respitRealny(events, totalChildrenCount) {
  if (!totalChildrenCount) return 0;
  const dayMap = {};
  (events || []).forEach((e) => {
    let cur = new Date(e.from);
    const end = new Date(e.to || e.from);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      if (!dayMap[key]) dayMap[key] = new Set();
      (e.childIds || []).forEach((id) => dayMap[key].add(id));
      cur = new Date(cur.getTime() + 86400000);
    }
  });
  return Object.values(dayMap).filter((set) => set.size === totalChildrenCount).length;
}

export function respitLimitFor(nadstandard) {
  return RESPIT_LIMIT + (nadstandard || 0);
}

/** Postavení biologického/sociálního příbuzného vůči dítěti — pro rychlý filtr/přehled v UI. */
export const KINSHIP_POSITIONS = [
  { key: 'otec', label: 'Otec' },
  { key: 'matka', label: 'Matka' },
  { key: 'sestra', label: 'Sestra' },
  { key: 'bratr', label: 'Bratr' },
  { key: 'prarodic', label: 'Prarodič' },
  { key: 'ostatni', label: 'Ostatní' },
];

export function kinshipPositionFor(relKey) {
  const rel = REL_TYPES.find((r) => r.key === relKey);
  if (!rel) return 'ostatni';
  if (rel.skupina === 'Otec') return 'otec';
  if (rel.skupina === 'Matka') return 'matka';
  if (rel.skupina === 'Sourozenci') return rel.key.includes('sestra') ? 'sestra' : 'bratr';
  if (rel.skupina === 'Širší rodina' && rel.key === 'prarodic') return 'prarodic';
  return 'ostatni';
}

/**
 * Odměna pěstouna — dle MPSV: PPPD (přechodná péče) = nárok i bez aktuálně
 * svěřeného dítěte (pohotovostní režim), dlouhodobá/příbuzenská péče = nárok
 * jen po dobu, kdy má rodina svěřené dítě. Viz [[crm-druhy-pp-odmena]].
 */
export const SPVPP_DOHODA_ROK = 59400;

export function odmenaEligible(careType, hasAssignedChildren) {
  if (careType === 'temp') return true;
  return !!hasAssignedChildren;
}

export function odmenaStatusLabel(careType, hasAssignedChildren) {
  if (odmenaEligible(careType, hasAssignedChildren)) return 'Nárok na odměnu pěstouna';
  return 'Bez nároku — dlouhodobá/příbuzenská péče vyžaduje svěřené dítě';
}

// ── Právní vazby: svěření, odměna, dohoda (docs/domain/druhy-pece-a-odmeny.md, 2026-07-03) ──

/** Typ svěření dítěte — společnou PP mohou mít jen manželé (§958 odst. 2 NOZ). */
export const CUSTODY_TYPES = {
  individualni: 'Individuální (1 pěstoun)',
  spolecne: 'Společné (manželé)',
};

export function custodyTypeLabel(key) {
  return CUSTODY_TYPES[key] ?? key ?? '—';
}

/** Odměna pěstouna u společné PP (§47j zákona č. 359/1999 Sb.) — MVP jen `single`. */
export const REMUNERATION_MODES = {
  single: 'Jedna osoba',
  split50: 'Rozděleno na polovinu (V-next)',
};

export function remunerationModeLabel(mode) {
  return REMUNERATION_MODES[mode] ?? mode ?? '—';
}

/** Dohoda o výkonu PP — kdo podepisuje (§47b zákona č. 359/1999 Sb.). */
export const AGREEMENT_SCOPES = {
  spolecna: 'Společná dohoda (oba manželé)',
  oddelena: 'Oddělené dohody (rozhodnutí obecního úřadu)',
};

export function agreementScopeLabel(scope) {
  return AGREEMENT_SCOPES[scope] ?? scope ?? '—';
}

// ── Kalendář (Sekce B, audit nálezu #5, 2026-07-03) ──────────────

/** Typy kalendářních událostí — port konceptu EVTYPES z vanilla prototypu. */
export const EVENT_TYPES = {
  visit: 'Návštěva rodiny',
  meeting: 'Jednání/schůzka',
  deadline: 'Termín/lhůta',
  education: 'Vzdělávání',
  other: 'Ostatní',
};

export function eventTypeLabel(key) {
  return EVENT_TYPES[key] ?? key;
}

/**
 * Barva levého pruhu karty události podle typu — sdíleno mezi TodayPage.jsx
 * (Dnes) a CalendarAgendaList.jsx (Kalendář agenda), aby stejný typ události
 * vypadal v obou stejně (DESIGN.md §11.4 shift card vzor).
 */
export const EVENT_BORDER_CLASS = {
  visit: 'border-module-families',
  meeting: 'border-brand-500',
  deadline: 'border-entity-crisis-text',
  education: 'border-entity-bio-text',
  other: 'border-border-default',
};

// Chat/notifikace konstanty se přesunuly do src/shared/chatConstants.js
// (2026-07-06, limit 300 řádků) — docs/domain/chat-a-pestounska-appka.md.
