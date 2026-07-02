# Audio pipeline — závazná specifikace
# Uložit jako docs/domain/audio-pipeline.md · navazuje na dokumentova-pipeline.md

Audio je vstupní větev dokumentové pipeline. Vše jde přes `src/services/audioService.js`
(nahrávání + komprese + fronta) a sdílený ingest. Žádná komponenta nesahá na mikrofon přímo.

## 1) Nahrávání a komprese (klient)

- **MediaRecorder API**, mono, 16 kHz vzorkování. Formát s detekcí podpory:
  1. `audio/webm;codecs=opus`, bitrate **32 kb/s** (Android, Chrome, desktop)
  2. fallback `audio/mp4` (AAC ~48 kb/s) — iOS Safari, které Opus/WebM neumí
- Výsledek: **20minutový monolog ≈ 4–5 MB.** Řeč při 32 kb/s Opus je plně srozumitelná
  pro člověka i pro přepis; nikdy nenahrávat ve výchozí kvalitě prohlížeče (10× větší).
- Nahrávání po **chunkách à 30 s** (`timeslice`) do IndexedDB — pád aplikace, příchozí
  hovor ani ztráta signálu nesmí zahodit záznam. Po ukončení se chunky složí a zařadí
  do offline fronty (viz ingest, fáze 1).
- UI dle DESIGN.md §6.4: velké kulaté record tlačítko, živá vlnovka, běžící čas,
  pauza/pokračovat. Zámek obrazovky nesmí nahrávání ukončit (wake lock po dobu záznamu).
- Limit délky 60 min; při 45 min jemné upozornění.

## 2) Dva režimy záznamu (výběr před startem, výchozí dle kontextu)

| | **A · Záznam návštěvy** | **B · Audio poznámka (monolog KO)** |
|---|---|---|
| Kdy | během návštěvy v rodině/jinde | KO sama, typicky v autě po návštěvě |
| Výchozí výstup | strukturovaný zápis návštěvy | **souhrn v bodech** |
| Alternativa | + doslovný přepis na vyžádání | doslovný přepis (volba „slovo od slova") |
| Spouští se z | detailu rodiny nebo doku [+] | doku [+] kdekoli |

Před startem režimu A zobrazit jednorázové poučení: *„Nahráváte rozhovor — informujte
přítomné a získejte jejich souhlas."* (checkbox „přítomní informováni", ukládá se
k záznamu — právní ochrana KO i organizace).

## 3) Zpracování (Cloud Function po uploadu)

1. **Přepis:** Speech-to-Text, jazyk cs-CZ, s časovými značkami. U režimu A zapnout
   diarizaci (rozlišení mluvčích: KO / pěstoun / dítě…).
2. **Strukturování (AI, Gemini EU):**
   - režim A → zápis návštěvy: datum/místo/přítomní · průběh · postřehy ke každému
     dítěti · dohodnuté úkoly · rizika (pokud zazněla)
   - režim B → souhrn: podstatné body, úkoly, termíny; balast (přeřeky, vata) vypustit
   - AI navrhne **koho se záznam týká** (rozpozná jména dětí a pěstounů z kontextu
     rodiny) — jen návrh, potvrzuje člověk.
3. Výstup se uloží jako **koncept** (stav `draft`) — nikdy se nezapisuje přímo.

## 4) Schválení a zápis (KO, do 30 s práce)

Obrazovka „Zkontrolovat zápis": návrh AI (editovatelný, MD editor) + čipy navržených
osob (dítě/pěstoun, možno přidat/ubrat) + přehrávač originálu pro ověření.
Tlačítka: **Schválit a uložit** · Upravit · Zahodit.

- Po schválení vzniká **JEDEN dokument** v `foster_families/{id}/timeline/` s polem
  `subjectRefs: [childId?, fosterId?, …]` — týká-li se záznam dítěte i pěstouna,
  NEduplikuje se; timeline dítěte i pěstouna ho načítají dotazem přes subjectRefs.
- Do záznamu se ukládá: text, typ (návštěva/poznámka), délka a datum původního audia,
  kdo schválil a kdy, příznak „přítomní informováni" (režim A).

## 5) Osud audio souboru (řídí nastavení organizace, per záznam lze změnit)

- **Výchozí: SMAZAT** po schválení zápisu (preferovaná varianta — minimalizace dat,
  GDPR). Mazání provádí Cloud Function, do záznamu se zapíše `audioDeleted: true`.
- **Volitelně: ARCHIVOVAT jako důkaz** — před smazáním překódovat na 16 kb/s Opus
  (20 min ≈ 2,4 MB), přesunout do Storage třídy Coldline, `audioRetained: true`
  + hash souboru do záznamu (integrita důkazu). Přístup jen org_admin a vyšší.
- Neschválené koncepty vč. audia se automaticky mažou po 30 dnech (TTL).
- Dokud zápis není schválen, audio se NEMAŽE nikdy.

## 6) Pravidla

- Audio se nikdy nepřehrává/nestahuje v seznamech — jen v detailu konceptu či záznamu.
- AI dostává jen audio + minimální kontext (jména členů dané rodiny pro rozpoznání),
  nikdy celý spis. EU region povinně.
- Vše funguje offline až po krok uploadu; KO vidí stav: 🎙 nahráno → ⬆ čeká na sync
  → ⚙ AI zpracovává → ✅ ke kontrole.
- MVP = režim B bez diarizace (jednodušší); režim A s diarizací = V8.
