# 13 — Workflow podrobně (krok za krokem: aktér → akce → data → notifikace)

Dvě roviny: **A) aplikační workflow** (implementované, popsané níže přesně
tak, jak běží v kódu) a **B) doménový katalog procesů** (`docs/domain/
workflow-katalog.md`, WF-1..16 — zákonné/organizační procesy, v appce
z většiny ZATÍM NEIMPLEMENTOVANÉ; jsou zdrojem pro budoucí Návod/FAQ a V8).

---

## A1) Schvalovací workflow dokumentu (nejsložitější automat v systému)

Soubory: `org/documents.js`, `org/documentWorkflow.js`,
`shared/documentConstants.js`; UI `DocumentActionsBar` (desktop) /
`DocumentActions` (mobil), pěstoun `FosterDocumentScreen`.

Stavy: `draft → foster_review → (commented | approved_foster) → final →
mgmt_review → closed | closed_foster_unapproved | closed_ko_unapproved |
closed_both_unapproved → sent | filed`.

Krok za krokem:
1. **KO založí dokument** (`createMarkdownDocument`) — stav `draft`,
   verze 1, audit `created`. (Nebo `ingestDocument` pro příchozí — viz A4.)
2. **KO edituje** — `saveMarkdownVersion` ukládá NOVOU verzi do podkolekce
   `versions` (append-only) + audit `version`. Editovat lze, dokud dokument
   není uzavřený/odeslaný/uložený.
3. **KO → pěstoun**: `sendToFosterReview` — stav `foster_review`, audit
   `sent_foster`, notifikace pěstounům rodiny (`fosterUserIds`), dokument
   se pěstounovi zviditelní (`visibleToFoster`).
4. **Pěstoun v /moje/***: `fosterApprove` → `approved_foster` (audit
   `foster_approved`) NEBO `fosterComment(text)` → `commented` (audit
   `foster_commented`, `fosterComment` se zobrazuje KO žlutě). Smyčka
   3↔4 se může opakovat.
5. **KO označí Konečný**: `markFinal` → `final` (audit `marked_final`).
6. **KO → vedení**: `sendToMgmtReview(approverUid)` — výběr schvalovatele
   z rolí org_admin/vedoucí/teamleader (předvyplněno `profile.docApprover`),
   stav `mgmt_review`, audit `sent_mgmt`, notifikace schvalovateli.
7. **Vedení**: `mgmtApprove` → `closed` (audit `mgmt_approved`) NEBO
   `mgmtReject(note)` → zpět `draft` (audit `mgmt_rejected` s důvodem).
   Vedení může též rovnou `closeWithReservation(varianta)` — uzavření
   s výhradou (kdo neschválil, je ve stavu: `closed_foster_unapproved` atd.).
8. **Po uzavření**: `sendToAuthority('OSPOD'|'Soud')` → `sent` (audit
   `sent_authority` + zápis do časové osy rodiny) NEBO `fileDocument` →
   `filed` (audit `filed`). Konec životního cyklu.

Kdo co smí: editace a kroky 1–6 = KO (canManage); krok 7 jen management;
pěstoun jen krok 4 a jen u `visibleToFoster` dokumentů. Vynuceno v UI
(gating) i firestore.rules.

## A2) Report pro OSPOD (nadstavba nad A1)

1. KO v detailu rodiny „Vyplnit report" → `ReportGenerateDrawer` (období,
   default poslední 3 měsíce).
2. `generateOspodReport`: `fetchTimelineForPeriod` stránkuje osu (early-stop
   před `from`, strop 12 stránek) → `buildOspodReportMarkdown` (hlavička
   rodiny, Průběh péče = poznámky, Návštěvy s délkou, Vzdělávání
   hodiny/limit, Shrnutí k ručnímu doplnění) → `createMarkdownDocument`
   se `subjectRefs` na všechny děti.
3. Dál jede PŘESNĚ automat A1 (report = obyčejný dokument). Tisk/PDF
   z `DocumentDetailPanel` (čisté okno, md→HTML, window.print).

## A3) Návštěva v rodině (mobil, jádro práce KO)

1. (Volitelně) plán v kalendáři: `createEvent` type `visit` s rodinou.
2. KO na Ose rodiny FAB „Návštěva" → `/admin/terenni/:id/navsteva`
   (Giant Timer). Start: uloží `startedAt` + jednorázová GPS poloha do
   **localStorage** (`visitTimerStorage`) — rozjetá návštěva NENÍ ve
   Firestore; persistentní banner v MobileShell.
3. Ukončení: poznámka (rekapitulace) → `createTimelineEntry` type `visit`
   s `startedAt/endedAt/durationSeconds/location` + **batch** update
   `foster_families.lastVisitAt` (denormalizace).
4. Důsledky: obrazovka Dnes — „Čeká na vás" = rodiny s lastVisitAt starším
   45 dní (krize >60, červeně); statistika návštěv týdne.

## A4) Příjem dokumentu zvenku (ingest → data v čase)

`ingestDocument(familyId, {title, source: email|foto|foster, extractedText…})`
→ vytvoří dokument (kind pdf/image, stav draft) + **zápis do časové osy**
type `document` s přečteným textem (podklad pro reporty a budoucí AI).
OCR text se zatím vkládá ručně (seam `org/ocr.js`); e-mailový kanál
(pestoun.jmeno@…) čeká na MX/parser.

## A5) Chat a notifikace

1. Odesílatel zvolí úroveň (private/internal/foster/ospod — viz kap. 05)
   → `sendMessage` do `foster_families/{id}/messages`.
2. `useChatThread.send` PO zápisu založí notifikace protistraně (klientsky):
   zaměstnanec+foster → pěstounům rodiny (link /moje/chat); pěstoun →
   přiřazené KO (link na rodinu); internal s recipients → vyjmenovaným.
3. Příjemce: zvonek (poll 60 s) → dropdown → klik = `markNotificationRead`
   + navigace na `link`. Mazat zprávu smí jen autor; pěstoun píše VŽDY
   jen `foster`.

## A6) Pozvání pěstouna (magic link, invitation-first)

1. KO v detailu rodiny „Pozvat pěstouna" (`InviteFosterButton`) →
   `createFosterInvitation` (doc id = sanitizovaný e-mail; nese familyId,
   organizationId) + `sendFosterMagicLink` (Firebase e-mail link,
   continue URL `/prihlaseni`).
2. Pěstoun klikne v e-mailu → `MagicLinkScreen`: `isMagicLink()` →
   `completeMagicLink(email)` → `acceptFosterInvitationIfNeeded`:
   najde pozvánku → vytvoří `users/{uid}` {role:'pestoun', organizationId,
   fosterFamilyId} → redirect `/moje`.
3. Rules od té chvíle pouští pěstouna přes JEHO profil (fosterOfFamily).
   Stejný vzor pro EP (`ep_invitations` → role `external`).

## A7) Životní cyklus oprávnění externího účastníka

1. KO pozve EP z karty dítěte (A6 vzorem). EP po přihlášení NEVIDÍ NIC.
2. Necitlivé oprávnění: KO `grantDirect` (volitelně platnost od–do) →
   grant `active`. Audit.
3. Citlivé oprávnění (Medical, SignDocuments, ChatWithChild…):
   `requestGrant` (reasonType: court/parent_request/agreement…, sourceType
   = č.j./dokument, důvod, platnost, časová okna) → stav `requested` →
   vedení `approveGrant` → `approved` → KO `activateGrant` → `active`.
   Tři různí aktéři, každý krok auditován.
4. Vyhodnocení přístupu: `hasPermission(grants, key, childId, now)` =
   grant `active` ∧ v platnosti ∧ `isWithinTimeWindows` (denní / týdenní
   s dny a lichou/sudou paritou ISO týdne). EPHomeScreen ukazuje jen
   aktivní.
5. Odebrání: `revokeGrant` = nastaví `validTo=now` (grant se NIKDY nemaže —
   časová verzovanost). Každé přihlášení EP → audit `login`.

## A8) Úkoly, instituce, vzdělávání (jednoduché cykly)

- Úkol: `createTask` (termín, řešitel, poznámka) → kanban dle termínu →
  checkbox `setTaskStatus done/open` (optimistické UI) → delete.
  Úkoly dnes/po termínu se propisují na Dnes.
- Instituce: CRUD adresáře, seskupení dle typu.
- Vzdělávání: `addFosterCourse(familyId, personId, {hodiny…})` → součty
  per pěstoun vs. `CARE_TYPES[careType].requiredHours` (24/24/18) →
  přehled „pod plánem" + indikace v tabu Pěstouni.

## A9) Registrace organizace a zaměstnanci

Self-service `/registrace` (org + první org_admin). Zaměstnance zakládá
org_admin (`createEmployee` přes sekundární Auth instanci — nevykopne
admina), role + nadřízený. KO dostává rodiny přes `assignedTo`
(kapacita max 25 hlídána `assertFamilyCapacity`).

---

## B) Doménový katalog WF-1..16 (docs/domain/workflow-katalog.md)

Zákonné/organizační procesy — **v této appce zatím neimplementované**
(část existovala ve starším vanilla prototypu jako „exit engine"):
WF-1 Exit pěstouna · WF-2 Ochranná lhůta (60 dní) · WF-3 Předání nové DO
(data handover) · WF-4 Dotaz externí DO před podpisem · WF-5 Návrat
pěstouna · WF-6 Mimořádné pozastavení / podezření na ohrožení dítěte ·
WF-7 Zletilost / odchod z péče · WF-8 Úmrtí (role-aware) · WF-9 Zánik/fúze
DO · WF-10 GDPR retence a skartace · WF-11 Žádost subjektu údajů ·
WF-12 Důkazní balíček pro spor · WF-13 Změna KO (předání spisu) ·
WF-14 Sloučení duplicit · WF-15 Ad-hoc workflow · WF-16 Rozvod pěstounů
se společnou PP. + Checklisty terénního sběru KO (obecný/speciální/vlastní,
bez závěrů, do Osy) a životní cyklus dítěte
(`docs/domain/zivotni-cyklus-ditete.md`).

Až se budou implementovat: každý WF má v katalogu kroky, aktéry a lhůty —
navrhni je jako stavové automaty ve stylu A1 (stav v dokumentu, přechody
ve službě, audit podkolekce, notifikace klientsky/Functions).
