# 05 — Role a bezpečnost

## Hierarchie rolí

**Zaměstnanci** (isStaff): superadmin · org_admin · vedouci_pobocky ·
teamleader · klicova_osoba · asistent_ko · zamestnanec. Každý zaměstnanec má
`nadrizeny`. Vedoucí pobočky + teamleader = **read-only manažeři**
(`isReadOnlyManager` v orgAuth.js — UI schovává mutace přes `canManage`,
rules je nepouští k zápisu).

**Externí role** (nejsou zaměstnanci):
- `pestoun` — Auth účet (revize 2026-07-06; PŮVODNĚ pěstoun účet neměl —
  pravidlo se změnilo, dítě ho dál NEMÁ). Vázán na rodinu přes VLASTNÍ profil
  `users/{uid}.fosterFamilyId` (nikdy ne zápisem do rodiny).
- `external` — externí účastník (EP), vázán přes `users/{uid}.externalParticipantId`.

Role se čte VÝHRADNĚ z Firestore `users/{uid}` (onSnapshot v authStore),
NIKDY z Custom Claims. Guard rout: `RequireOrgRole allowed={[...]}` —
špatná role → redirect na `homePathForRole(role)` (ne na login!).

## firestore.rules — klíčové vzory (NAUČ SE, než cokoli změníš)

1. **`sameOrg()` gated za `isStaff()`** — KRITICKÉ: pestoun i external mají
   `organizationId` své organizace, takže holé `sameOrg` by jim otevřelo
   VŠECHNA data organizace. Proto všude
   `(isStaff() && sameOrg(...)) || úzký disjunkt pro pěstouna/EP přes profil`.
   Tahle chyba se nám reálně stala (pěstoun viděl celý spis) — odhalena při
   ověřování, opravena plošně.
2. **„List dotaz vs. pole v pravidle"** — Firestore zamítne CELÝ list dotaz,
   pokud není staticky dokazatelné, že každý vrácený dokument projde pravidlem.
   Prakticky: rovnostní filtr v dotazu musí odpovídat poli v pravidle
   (např. dotaz na `fosterFamilyId` spadne, když pravidlo chce `sameOrg(organizationId)`
   → přidej `where('organizationId','==',org)`). A autorský disjunkt
   (`resource.data.authorUid == request.auth.uid`) musí být NEPODMÍNĚNÝ,
   jinak dotaz `where('authorUid','==',uid)` spadne.
3. **Append-only podkolekce** — audit, historie, poznámky, verze dokumentů,
   EP audit: `allow update, delete: if false`. Granty se nemažou — revoke
   nastavuje `validTo`.
4. **Create s vlastnictvím** — `request.resource.data.createdBy == request.auth.uid`
   (tasks, institutions).
5. Vždy testuj jako NE-superadmin (superadmin projde vším a chyby zamaskuje).

## Chat — 4 úrovně soukromí (vynucené v rules)

`foster_families/{id}/messages`: `audience` ∈
- `private` — poznámka KO sobě (čte jen autor),
- `internal` — tým organizace (pěstoun NIKDY),
- `foster` — KO ↔ pěstoun (jediná úroveň viditelná pěstounovi),
- `ospod` — podklady pro úřad (tým, pěstoun NIKDY).
Čtení je rozdělené na 2 dotazy (shared in ['internal','foster'] + vlastní
private) kvůli vzoru č. 2. Notifikace protistraně zakládá KLIENT odesílatele
(žádné Cloud Functions) — vědomé zjednodušení.

## Externí účastníci — permission engine (nejcennější kus systému)

Filozofie: ŽÁDNÉ speciální role (rodič/psycholog/škola). Jeden obecný účet;
význam = popisný vztah (`relationLabel`, bez právních účinků) + přidělená
oprávnění + audit. Výchozí stav = VŠECHNO zakázáno.

- **Katalog** `src/shared/externalPermissions.js`: ViewDocuments/Timeline/
  Photos/School/Medical*/Reports/Calendar, Upload/DownloadFiles, SignDocuments*,
  ChatWithCaseWorker/FosterParent*/Child*, ReceiveNotifications, ConfirmVisits,
  VideoCalls* (* = citlivé). Přidání oprávnění = jeden řádek.
- **Granty časově verzované**: `validFrom/validTo` (revoke = nastavit validTo,
  nikdy delete) + `timeWindows` (daily/weekly, days[], from/to HH:MM,
  weekParity all/odd/even přes ISO týden — „každou lichou sobotu 9–12").
- **Citlivá oprávnění = 3 oddělené kroky, každý jiný aktér, vše auditované**:
  requestGrant (doklad: reasonType + sourceType + důvod) → approveGrant
  (vedení) → activateGrant (KO). Necitlivá: grantDirect jedním krokem.
- **Čisté funkce** `isGrantActive`, `isWithinTimeWindows`, `hasPermission` —
  otestované 16/16 node testy (bez Firestore; package.json má type:module,
  jde testovat `node x.mjs`).
- **Neměnný audit** `external_participants/{epId}/audit` — každé přihlášení
  EP, každá změna grantu; IP se doplní až z backendu, device = UA.
- Vynucení je zatím na úrovni rules + UI gate; per-oprávnění vynucení dat
  (Cloud Functions/claims) je TODO.

## Magic linky (přihlášení bez hesla)

Invitation-first: KO založí pozvánku (`foster_invitations/{sanitizedEmail}`
nebo `ep_invitations/...`) → `sendSignInLinkToEmail` → uživatel klikne →
`/prihlaseni` (`MagicLinkScreen`) dokončí `signInWithEmailLink` →
`acceptFosterInvitationIfNeeded` vytvoří `users/{uid}` s rolí pestoun/external
podle pozvánky. E-mailový klik nejde automatizovaně testovat — ověřeno ručně.

## Citlivá data — pravidla chování

- Žádné údaje dětí do logů (console.error jen technické chyby).
- Do AI promptů posílat jen nezbytné minimum.
- Adresa rodiny se nikdy neposílá třetí straně automaticky (viz Mapa).
- Hesla: AI programátor je NIKDY nezadává ani nečte; testovací účty řeší
  seed skripty a uživatel.
