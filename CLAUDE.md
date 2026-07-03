# CLAUDE.md — Doprovázení.com

CRM/SaaS pro doprovázející organizace pěstounské péče v ČR. Klíčové osoby (max 25–30 pěstounů,
každý max 8 dětí, většinou 1) pracují primárně v terénu na mobilu. Mobile-first PWA + desktop.

## Dva repozitáře — dělba odpovědnosti
- **Tento repozitář (dopcrm-firebase)** = WEB: desktop + mobilní prohlížeč. Obsahuje VŠE kromě
  nativní terénní appky: dokumenty (editor, AI generování, schvalování, podpis, odesílání
  vč. datové schránky), administraci (Superadmin/Orgadmin), registraci organizací, Cloud
  Functions, firestore.rules — a je **MASTER pro doménovou dokumentaci** (docs/, DESIGN.md).
- **Sesterský repozitář `../pestouni-crm-mobile`** (dopcrm-mobile) = nativní terénní appka
  (Expo/React Native) VÝHRADNĚ pro roli klicova_osoba: agenda Dnes, moje rodiny, detail
  + timeline, capture (foto/audio/poznámka/sken). Nic víc tam nepatří.
- Doménová pravidla, datový model a firestore.rules se mění POUZE zde; mobilní repo je
  jen konzumuje. Změna schématu = vždy nejdřív tady (rules + docs), pak teprve mobil.
- Do tohoto repa NIKDY nepiš React Native kód; mobilní obrazovky sem nepatří.

## Zdroj pravdy (čti v tomto pořadí)
1. **CLAUDE.md** (tento soubor) — pravidla práce
2. **DESIGN.md** — závazný design systém (soft/playful, styl Amie). Čti PŘED každou UI prací.
3. **CURRENT_STATE.md** — aktuální stav, poslední změny, další kroky
4. `docs/` — trvalá dokumentace (datový model, workflow katalog, historie)

## ⛔ ADRESÁŘ /legacy — NIKDY NEČTI, NIKDY NEUPRAVUJ
Obsahuje starý vanilla prototyp (hub.html, mobile.js, style.css, app.js, 24 HTML stránek).
Slouží VÝHRADNĚ jako doménová reference pro člověka. Nesmí se z něj kopírovat kód, styly ani
vzory UI. Pokud úkol vyžaduje doménovou znalost z prototypu (workflow, typy vztahů, exit
engine), je popsána v `docs/domain/` — čerpej odtud. Chybí-li tam, ZEPTEJ SE, nečti /legacy.

## Stack (jediný povolený)
- **Frontend:** React 18 + Vite, **Tailwind CSS** (tokeny z DESIGN.md), ikony lucide-react,
  react-router-dom, zustand. PWA přes **vite-plugin-pwa** (žádný ruční sw.js).
- **Backend:** Firebase — Auth, Firestore (multi-tenant schéma „sekce B" ve firestore.rules),
  Storage, Functions v2. AI: Vertex AI (Gemini) přes EU proxy, mock fallback bez backendu.
- **Zakázáno:** MUI (@mui/*, @emotion/*) — probíhá odstranění; nové komponenty NIKDY v MUI.
  Bootstrap, jQuery, inline styly (`style={{}}`), ad-hoc hex barvy mimo tailwind.config.

## Architektura
- `src/modules/<doména>/` — stránky a komponenty domény (families, children, documents,
  calendar, users, admin…)
- `src/components/ui/` — sdílená UI knihovna (Button, Card, Badge, Avatar, BottomSheet, Chip,
  EmptyState, Timeline…). Nové obrazovky SKLÁDAJ z těchto komponent.
- `src/services/` — veškerá komunikace s Firebase; komponenty NIKDY nevolají Firestore přímo.
- `src/shared/domainConstants.js` — role, stavy, typy (EMPLOYEE_ROLES, REL_TYPES, CARE_TYPES…).

## Doménová pravidla (neměnná)
- Hierarchie: organizations → users (zaměstnanci) → foster_families → children.
  Pěstouni a děti NEJSOU Auth uživatelé.
- Role: superadmin · org_admin · vedouci_pobocky · teamleader · klicova_osoba · asistent_ko ·
  zamestnanec. Každý zaměstnanec má `nadrizeny`.
- Registrace organizace = self-service (`/registrace`), superadmin ji NEZAKLÁDÁ.
- Limit: max 25 rodin na klíčovou osobu (`assertFamilyCapacity`).
- RČ = primární identifikátor osob (děti, příbuzní); jméno jen fallback.
- Citlivá data dětí: žádné údaje do logů, AI promptů posílat jen nezbytné minimum.

## Pracovní postup
- Po každé ucelené změně aktualizuj **CURRENT_STATE.md** (datum, co, proč, ověření).
  CURRENT_STATE.md drž pod 300 řádků — starší záznamy přesouvej do `docs/history.md`.
- Tento soubor (CLAUDE.md) NEROSTE — je to pravidlo, ne deník. Historie patří do docs/.
- Před commitem: `npm run build` musí projít čistě; `npm run lint` bez chyb.
- Firestore rules měň jen s výslovným souhlasem uživatele a vždy nasaď
  (`firebase deploy --only firestore:rules`).
- Komunikuj česky. Žádná emoji v UI (ikony = lucide-react).

## Pravidla velikosti (tvrdá, bez výjimek)
- Žádný soubor v `src/` nesmí přesáhnout **300 řádků**. Blíží-li se limitu, ROZDĚL ho dřív,
  než pokračuješ — to je součást úkolu, ne „až někdy".
- Jedna komponenta = jeden soubor. Jedna služba = jedna doména (`familyService.js`,
  `documentService.js`…), žádný „dataService" na všechno.
- Hlavní soubory (`App.js`, `router.jsx`, `index.js` modulů) jsou POUZE směrovače/obsahy:
  importují a skládají, neobsahují logiku.
- Markdown: CLAUDE.md neroste nikdy; CURRENT_STATE.md max 300 řádků (starší → docs/history.md);
  každé téma v docs/ = vlastní soubor, ne přílepek.
- V `.eslintrc` je pravidlo `max-lines: ["error", 300]` — build s velkým souborem neprojde.
- `docs/INVENTAR.md` je master checklist projektu: při plánování se do něj VŽDY podívej,
  po implementaci funkce aktualizuj její stav.

## Pravidla datového modelu (Firestore)
- Dokument obsahuje POUZE identitu a aktuální stav. Cokoli roste v čase (zápisy, návštěvy,
  dokumenty, vzdělávání, historie, audit) = VŽDY podkolekce, nikdy pole v dokumentu.
- Pole v dokumentu smí mít max ~20 položek a nesmí růst neomezeně (childrenIds ano — max 8;
  timeline ne).
- Vztah „kdo má koho" existuje jen JEDNOU: rodina má `assignedTo`, klíčová osoba seznam
  rodin NEMÁ — získává se dotazem.
- Denormalizovaná počítadla (familiesCount, lastVisitAt…) aktualizuje výhradně příslušná
  služba v `src/services/`, ideálně v batch zápisu se změnou, která je vyvolala.
- Seznamové obrazovky čtou jen hlavní dokumenty; podkolekce až v detailu, stránkované po 20.
- Záznam týkající se více osob (dítě + pěstoun) se ukládá JEDNOU s polem `subjectRefs`.

## Pravidla souborů a médií
- Soubory VŽDY Firebase Storage se security rules zděděnými z rodiny; NIKDY externí
  úložiště (Disk, FTP, hosting). Do Firestore jen extrakty, metadata a miniatury.
- Vše přes ingest: fotky komprimovat na klientu (max 1920px, WebP, cíl < 400 kB),
  audio Opus 32 kb/s mono (fallback AAC pro iOS). Detaily: `docs/domain/
  dokumentova-pipeline.md` a `docs/domain/audio-pipeline.md` — závazné specifikace.
- Uzavřené spisy → Storage Coldline (retence 15 let, pak anonymizace dle WF-10).

## Ověřování UI
Každou novou obrazovku ověř na mobilním viewportu (390×844) i desktopu. Musí odpovídat
DESIGN.md — zkontroluj podle sekce „Zakázané vzory" (§9) před dokončením úkolu.
