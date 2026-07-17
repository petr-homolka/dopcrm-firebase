# 06 — Datový model a Firestore

## Mapa kolekcí

```
organizations/{orgId}
  └── events/{eventId}          kalendář (title, type, typeLabel, start/end,
                                allDay, assignedTo, fosterFamilyId, status,
                                published)
  └── codelists/...             vlastní typy událostí organizace
users/{uid}                     profil: role, organizationId, nadrizeny,
                                fosterFamilyId (pestoun),
                                externalParticipantId (external), docApprover
  └── notifications/{id}        per-uživatel oznámení (type, title, body,
                                link, read, fromUid) — zakládá klient odesílatele
foster_families/{famId}         name, address, contactPhone/Email, careType,
                                status, assignedTo, organizationId, fosters[]
                                (osoby, ne účty), fosterUserIds[] (Auth pěstouni),
                                socialSpace{}, respitNadstandard, lastVisitAt(denorm)
  └── timeline/{id}             OSA: type note|visit|system|document, title,
                                body, subjectRefs[], occurredAt, pinned(max 3),
                                visit: startedAt/endedAt/durationSeconds/location
  └── messages/{id}             chat: body, audience, recipients, authorUid…
  └── documents/{docId}         title, kind md|pdf|image|docx, content(md),
                                status(workflow), fosterComment, visibleToFoster,
                                subjectRefs, organizationId, assignedTo
      └── versions/{id}         append-only verze obsahu
      └── audit/{id}            append-only auditní stopa workflow
  └── respitEvents/{id}         čerpání respitu (from/to, typ, childIds, kc)
  └── fosterCourses/{id}        vzdělávání (personId → fosters[].id, hodiny…)
children/{childId}              TOP-LEVEL (ne podkolekce!): firstName/lastName,
                                rc, birthDate, fosterFamilyId, organizationId
                                (denorm pro rules), assignedTo (denorm), school{},
                                ospod{}, courtCase{}, idCard{}, passport{},
                                custody{}, relatives[], socialSpace[]
  └── history/{id}              append-only historie změn („nic se nepřepisuje")
  └── permanentNotes/{id}       append-only trvalé poznámky KO
  └── previousFosters/{id}, courtVerdicts/{id}
external_participants/{epId}    EP: organizationId, childId, childName(denorm),
                                relationLabel, displayName, email, status
  └── access/{childId}, grants/{grantId}(verzované), audit/{id}(append-only)
tasks/{id}                      úkoly: organizationId, title, note, dueDate,
                                assignedTo, subjectRefs, status, createdBy
institutions/{id}               adresář: organizationId, name, type(ospod|soud|
                                skola|lekar|jine), contactPerson, phone, email…
foster_invitations/{email}, ep_invitations/{email}   pozvánky (magic link)
```

## Závazná pravidla modelu (CLAUDE.md — porušení = refactor)

1. Dokument = identita + aktuální stav. **Cokoli roste v čase = podkolekce**
   (timeline, dokumenty, audit, kurzy, historie…), nikdy pole v dokumentu.
2. Pole v dokumentu max ~20 položek a nesmí růst neomezeně (childrenIds max 8
   OK; timeline v poli NE).
3. Vztah „kdo má koho" jen JEDNOU: rodina má `assignedTo`; KO seznam rodin
   NEMÁ — získává se dotazem.
4. Denormalizovaná počítadla (lastVisitAt…) aktualizuje výhradně služba,
   ideálně ve `writeBatch` se změnou, která je vyvolala (viz createTimelineEntry
   type visit → batch update lastVisitAt).
5. Seznamové obrazovky čtou JEN hlavní dokumenty; podkolekce až v detailu,
   stránkované po 20 (`SUBCOLLECTION_PAGE_SIZE`), top-level po 50
   (`TOP_LEVEL_PAGE_SIZE`), cursor = poslední doc.
6. Záznam o více osobách se ukládá JEDNOU s `subjectRefs[{kind,id}]`.
   Výjimka: v podkolekci vázané na entitu se ref na TU entitu nedává —
   plyne z cesty; prázdné subjectRefs = „týká se celé entity".
7. `children` je top-level (ne podkolekce rodiny) kvůli org-wide dotazům
   a přesunům mezi rodinami; organizationId/assignedTo se DENORMALIZUJÍ
   z rodiny (rules nedělají get() na rodinu kvůli ceně čtení).

## Indexy a dotazy

- Composite indexy jen kde nutné (`firestore.indexes.json`: timeline filtry
  type+occurredAt, subjectRefs array-contains+occurredAt; events assignedTo+start).
- Jinde se composite indexům VYHÝBÁME: dotaz bez orderBy + řazení na klientovi
  (messages, tasks, institutions) — objemy jsou malé (≤25 rodin na KO).
- `subjectRefs` filtr přes `array-contains` s CELÝM objektem {kind,id}.

## Soubory a média (závazné specifikace, zatím neprovozováno)

Storage per rodina se zděděnými rules; do Firestore jen extrakty/metadata/
miniatury. Ingest pipeline: fotky klientská komprese max 1920px WebP <400 kB;
audio Opus 32 kb/s mono (AAC fallback iOS). Uzavřené spisy → Coldline,
retence 15 let, pak anonymizace (WF-10). Detaily: `docs/domain/
dokumentova-pipeline.md`, `audio-pipeline.md`.
