# 01 — Co a proč stavíme

## Produkt

**CRM/SaaS pro doprovázející organizace pěstounské péče v ČR** (produkt
Doprovázení.com, běží na moje.doprovazeni.com). NENÍ to generické CRM —
je to case-management systém nad zákonnou agendou (zákon 359/1999 Sb.).

Multi-tenant: cílově ~1000 organizací, ~10 000 mobilních uživatelů.
Citlivá data dětí → GDPR/EU, auditovatelnost, minimalizace dat v logech
a AI promptech.

## Kdo systém používá (persony)

- **Klíčová osoba (KO)** — hlavní uživatel. Sociální pracovnice, která
  doprovází max 25 pěstounských rodin (limit vynucen `assertFamilyCapacity`),
  každá rodina max 8 dětí (většinou 1). Pracuje PRIMÁRNĚ V TERÉNU NA MOBILU:
  návštěvy rodin, zápisy, fotky, časomíra návštěvy s GPS. V kanceláři pak
  desktop: reporty pro OSPOD, dokumenty, plánování.
- **Vedení DO** (org_admin, vedoucí pobočky, teamleader) — přehledy, schvalování
  dokumentů, správa zaměstnanců. Vedoucí/teamleader jsou JEN KE ČTENÍ
  (`isReadOnlyManager`).
- **Pěstoun** — má vlastní omezenou appku `/moje/*` (chat s KO, dokumenty ke
  schválení, své děti read-only). Přihlašuje se magic linkem z pozvánky KO.
- **Externí účastník (EP)** — biologický rodič, psycholog, škola, OSPOD…
  Obecný účet BEZ implicitních rolí; význam dávají až jemnozrnná, časově
  verzovaná oprávnění. Appka `/ucastnik/*`.
- **Dítě** — NEMÁ účet (závazné pravidlo). Účet dítěte 12+ je modelován jako
  EP se `subjectKind='child'` (připraveno, nepoužívá se).
- **Superadmin** — provozovatel SaaS, spravuje organizace. Organizace se ale
  registrují SAMY (`/registrace`), superadmin je nezakládá.

## Doménová esence (pochop, než začneš)

- **Rodina (foster_family)** = evidenční jednotka: pěstouni (osoby v dokumentu,
  ne účty), svěřené děti (vlastní kolekce), respit, sociální prostor, časová
  osa, chat, dokumenty.
- **Časová osa (timeline)** = deník rodiny, JÁDRO dat: návštěvy (s GPS a délkou),
  poznámky, systémové záznamy, přijaté dokumenty. „Nic se nepřepisuje" je cíl
  (immutabilita zápisů je dočasně POZASTAVENA na žádost vlastníka, mazání
  neexistuje nikdy). Z osy se generují reporty pro OSPOD.
- **Respit** = zákonných 14 dní odpočinku/rok (§47a), „i hodina = celý den";
  nadstandard přes IPOD. **SPVPP** peněženka dítěte (výchozí rozpočet 48 000 Kč,
  konstanta `SPVPP_DEFAULT_ROZPOCET`).
- **Vzdělávání pěstounů** = zákonná povinnost 24 h/rok (dlouhodobá, přechodná)
  nebo 18 h (příbuzenská) — sledovaná metrika („kdo je pod plánem").
- **Dokumenty** mají schvalovací životní cyklus (koncept → pěstoun → vedení →
  uzavření → odeslání OSPOD/soud) s verzemi a auditní stopou.
- **RČ (rodné číslo)** = primární identifikátor osob (děti, příbuzní);
  jméno jen fallback. Z RČ se dopočítává datum narození (`shared/rcUtils.js`).
- Vztahy/rodičovství dle práva ČR: otec = kdo je v rodném listě, matka = kdo
  porodil; domnělí/nevlastní bez práv (číselník REL_TYPES).

## Dva repozitáře — dělba

- **Tento repozitář** (`pestouni-crm-prototyp`, interně dopcrm-firebase) = WEB:
  desktop + mobilní prohlížeč (PWA). Je MASTER pro doménovou dokumentaci,
  datový model a firestore.rules.
- **Sesterský repozitář** `../pestouni-crm-mobile` = nativní terénní appka
  (Expo/React Native), VÝHRADNĚ role klicova_osoba. Změny schématu VŽDY
  nejdřív tady (rules + docs), mobil je jen konzumuje. Do web repa NIKDY
  React Native kód.

## Prototyp vs. V8 (cílový systém)

- Aktuální stav = **prototyp do odvolání**, ale VŠE se dělá pro 1:1 přenos
  do V8 (čisté vrstvy, žádné hacky).
- **V8 FosterFlow Blueprint** = závazné cílové zadání (~143 tabulek,
  10 milníků). Má vždy přednost před ad-hoc rozhodnutími. Klíčové V8 principy:
  karta kontaktu jako jednotný koncept (`persons`), historizace, RLS + audit +
  WORM zálohy, i18n přes translation_keys, DataGridView konfigurovatelné
  tabulky, typy péče A/B/C, households s lifecycle_state.
- Pozor na rozpor v paměti: starší zápis říká „V8 = Supabase + Vercel",
  novější ZÁVAZNÝ zápis říká „produkce = GCP all-in-one, vše na Google
  (do odvolání); Vertex AI ověřeno funkční". Řiď se GCP, dokud uživatel
  neřekne jinak.
- Existuje ještě STARŠÍ vanilla JS prototyp (živý na claude.doprovazeni.com,
  deploy FTP) — slouží jako doménová/UX reference. V tomto repu je jeho kopie
  v `/legacy` — **ZAKÁZÁNO číst i upravovat** (pravidlo CLAUDE.md); doménová
  znalost z něj je přepsána do `docs/domain/`.

## Jazyk a tón

- Komunikace s uživatelem i UI texty: **čeština**.
- ŽÁDNÁ emoji v UI (ikony = lucide-react). Klidný, procedurální tón — je to
  systém pro citlivé rodinné záznamy, ne marketing.
