# DESIGN.md — Přítomnost
## Design systém pro CRM doprovázejících organizací pěstounské péče

> **Instrukce pro Claude Code:** Tento dokument je závazný. Před implementací JAKÉHOKOLIV UI si jej přečti celý. Při pochybnostech platí sekce „Zakázané vzory". Pokud existuje složka `design-refs/`, prohlédni si screenshoty před psaním kódu. Nikdy nevracej Modernize/Bootstrap vzory — provádíme úplný přechod na soft design.

---

## 1. Vize a charakter

Přítomnost je nástroj pro **klíčové osoby v terénu** — lidi, kteří jezdí za pěstounskými rodinami, zapisují, fotí, nahrávají a pak generují zprávy pro OSPOD a soudy. Aplikace musí působit:

- **Lidsky a klidně** — pracujeme s citlivými rodinnými tématy, ne s fakturami. Žádný korporátní dashboard.
- **Lehce** — hodně vzduchu, měkké tvary, jemné barvy. Inspirace: Amie.so (playful minimalismus).
- **Mobile-first** — primární zařízení je telefon v terénu (PWA, iOS, Android). Desktop je sekundární pro kancelářskou práci a administraci.
- **Rychle po ruce** — klíčová osoba potřebuje během návštěvy 2 ťuknutími fotit, nahrávat nebo zapsat poznámku.

**Mentální model:** kalendářově-lidský nástroj (jako Amie), ne tabulkový CRM (jako Salesforce). Střed vesmíru je **rodina a její příběh v čase**, ne datová tabulka.

---

## 2. Barevný systém

### 2.1 Primární paleta — Forest Teal

```
--primary-900: #0F3D3A   (tmavé texty na teal pozadí, aktivní stavy)
--primary-700: #14544F   (hover primárních tlačítek)
--primary-600: #1A6B64   (PRIMÁRNÍ — tlačítka, aktivní ikony, odkazy)
--primary-100: #D7EAE7   (pozadí aktivních položek, vybrané stavy)
--primary-50:  #EDF6F5   (jemná pozadí sekcí, hover řádků)
```

### 2.2 Barevné kódování entit (KLÍČOVÉ — používat konzistentně všude)

Každý typ entity má svou barvu. Používá se ve štítcích, avatarech, tečkách v kalendáři, levém proužku karet (`border-left: 3px solid`), nikdy jako plné pozadí velkých ploch.

| Entita | Význam | Text/ikona | Pastelové pozadí |
|---|---|---|---|
| **Pěstounská rodina** | zelená | `#15803D` (green-700) | `#F0FDF4` (green-50) |
| **OSPOD** | modrá | `#1D4ED8` (blue-700) | `#EFF6FF` (blue-50) |
| **Soud** | šedá | `#44403C` (stone-700) | `#F5F5F4` (stone-100) |
| **Biologická rodina** | jantarová | `#B45309` (amber-700) | `#FFFBEB` (amber-50) |
| **Krize / urgentní** | terakota | `#C2410C` (orange-700) | `#FFF7ED` (orange-50) |

Vzor štítku: `rounded-full px-2.5 py-0.5 text-xs font-medium` + kombinace text-700 na pozadí-50. Nikdy sytá barva na sytém pozadí.

### 2.3 Neutrály a sémantika

```
Pozadí aplikace:   #FAFAF9 (stone-50) — nikdy čistě bílá plocha ani šedý #f0f0f0 admin podklad
Karty/panely:      #FFFFFF
Text primární:     #292524 (stone-800) — NIKDY čistá černá #000
Text sekundární:   #78716C (stone-500)
Text terciární:    #A8A29E (stone-400) — placeholdery, metadata
Oddělovače:        #F5F5F4 (stone-100) — a používat je MINIMÁLNĚ, oddělovat whitespace
Success: #15803D / Error: #B91C1C / Warning: #B45309 — vždy s pastelovým pozadím
```

---

## 3. Typografie

- **Font:** Inter (variable), fallback system-ui. Načíst lokálně, ne z CDN (offline PWA).
- **Váhy:** 400 (body), 500 (labely, položky), 600 (nadpisy). **Nikdy 700+** — tučné působí těžce.
- **Velikosti:**
  - Body a položky seznamů: `text-sm` (14px)
  - Nadpisy sekcí: `text-base font-semibold` (16px)
  - Nadpis obrazovky: `text-lg` až `text-xl font-semibold` (18–20px), na mobilu 18px
  - Metadata, časy, štítky: `text-xs` (12px), stone-400/500
- Číselné údaje (počty dětí, termíny) tabulkovým řezem: `tabular-nums`.
- Žádný UPPERCASE kromě mikro-labelů sekcí (`text-xs uppercase tracking-wide text-stone-400`).

---

## 4. Tvary, stíny, prostor

```
Border-radius:  karty a panely 16px (rounded-2xl), tlačítka a inputy 12px (rounded-xl),
                štítky a avatary plně kulaté (rounded-full)
Stíny:          shadow-sm na kartách, shadow-lg POUZE na plovoucích prvcích
                (FAB, command palette, bottom sheet). Nikdy tvrdý border kolem karty —
                karta = bílé pozadí + rounded-2xl + shadow-sm, žádné border-gray-300.
Spacing:        base 4px grid; vnitřní padding karet p-4 (mobil) / p-5 (desktop);
                mezery mezi sekcemi space-y-6; položky seznamů py-3
Dotykové cíle:  min. 44×44px na mobilu, vždy
```

---

## 5. Layout

### 5.1 Mobil (primární)

- **Spodní navigace** (bottom tab bar), 4 položky + centrální akce:
  `Dnes` (agenda) · `Rodiny` · **[ + ]** · `Dokumenty` · `Profil`
- **Centrální [+] tlačítko** = primary-600 kruh, po ťuknutí se rozbalí **bottom sheet s rychlým záznamem**: 📷 Fotka · 🎙 Nahrávka · ✏️ Poznámka · 📄 Skenovat dokument. Toto je nejdůležitější interakce celé aplikace — max 2 ťuknutí od otevření k záznamu.
- Obsah: jeden sloupec, karty rounded-2xl, pull-to-refresh, nekonečný scroll.
- Modály NE — používat **bottom sheets** (zaoblené horní rohy 24px, drag handle, backdrop blur).
- Bezpečné zóny: `env(safe-area-inset-*)` pro notch a home indicator.

### 5.2 Desktop

- Levý sidebar **max 240px**, bílé pozadí, bez borderu (oddělen barvou pozadí aplikace). Položky: ikona 20px + label text-sm, aktivní = bg-primary-50 + text-primary-700 + rounded-xl.
- Obsah max-width 1100px, centrovaný. Detail entity může otevírat pravý panel (400px) místo přechodu na novou stránku — vzor „peek".
- **Command palette (Cmd/Ctrl+K)** — vyhledání rodiny, akce, navigace. Vzor Amie: velké zaoblené pole, výsledky s ikonami a barevnými tečkami entit.

---

## 6. Klíčové obrazovky

### 6.1 Dnes (domovská obrazovka klíčové osoby)

Ne dashboard s grafy! Agenda dne jako v Amie:
- Nahoře pozdrav + datum („Dobré ráno, Jano · středa 2. července").
- Časová osa dnešních návštěv a úkolů — karty s barevným levým proužkem podle entity, čas, jméno rodiny, adresa (ťuknutí → navigace v mapách).
- Sekce „Čeká na vás": neschválené zápisy, dokumenty k podpisu, blížící se termíny (zprávy pro OSPOD, prodloužení dohod) — max 3 položky + „zobrazit vše".
- Krizové položky vždy nahoře s terakotovým proužkem.

### 6.2 Rodiny (seznam)

- Klíčová osoba má max ~30 pěstounů → **žádné stránkování, žádná tabulka**. Svislý seznam karet: kulatý avatar s iniciálami (pastelově zelené pozadí), jméno rodiny, pod ním děti jako mini-avatary/čipy (max 8, většinou 1), štítek stavu, datum poslední návštěvy.
- Vyhledávání nahoře jako zaoblené pole `rounded-full bg-stone-100`, bez borderu.
- Filtry jako horizontálně scrollovatelné čipy, ne dropdown.

### 6.3 Detail rodiny — srdce aplikace

Struktura (mobil: taby, desktop: dvousloupec):
1. **Hlavička:** avatar, jméno, štítky, děti jako čipy (ťuknutí → detail dítěte), rychlé akce (zavolat, navigovat, nový zápis).
2. **Příběh (timeline):** chronologický proud všech záznamů — návštěvy, fotky, přepisy, dokumenty, e-maily. Každý záznam = karta s ikonou typu, časem a náhledem. Toto je hlavní pohled, ne tabulka polí.
3. **Dokumenty:** mřížka náhledů se štítky typu (rozsudek, zpráva, vysvědčení, faktura…).
4. **Děti:** vývoj dítěte v čase (time-series) — jednoduché sparkline grafy, měkké křivky, žádné mřížky grafů.
5. **Dohoda a termíny:** stav dohody o výkonu PP, povinné návštěvy (min. 1× za 2 měsíce → vizuální indikátor „zbývá X dní"), vzdělávání pěstounů (24 h/rok → jemný progress ring).

### 6.4 Záznam v terénu (capture)

- **Fotka:** rovnou fotoaparát, po vyfocení přiřazení k rodině (naposledy navštívená předvyplněná) + volitelný popisek. Offline-first: uložit lokálně, sync později, indikátor `cloud-off` ikonkou.
- **Nahrávka:** velké kulaté tlačítko record, živá vlnovka (waveform) v primary-600, po ukončení automaticky „Přepsat pomocí AI" → strukturovaný zápis (souhrn, postřehy, úkoly). Stav zpracování jako jemný pulzující štítek „AI zpracovává…", ne spinner přes celou obrazovku.
- **Skenování dokumentu:** kamera s detekcí okrajů, OCR, AI klasifikace typu (rozsudek/zpráva/vysvědčení/účtenka/faktura) → uživatel jen potvrdí předvyplněný štítek a rodinu.

### 6.5 Dokumenty a editor

- **MD editor:** čistý WYSIWYG nad markdownem (styl Notion/Amie notes): bez viditelné syntaxe, plovoucí toolbar při označení textu, `/` menu pro bloky. Pozadí bílé, text stone-800, max šířka čtení 680px.
- **AI generování:** tlačítko „Vygenerovat zprávu" → bottom sheet: typ dokumentu (zpráva pro OSPOD, půlroční zpráva, záznam z návštěvy…), období, rodina → AI složí návrh z historických zápisů (RAG). Návrh se otevře v editoru se štítkem „Návrh AI — zkontrolujte" (amber-50), diff-friendly úpravy.
- **Schvalovací workflow:** stavy jako barevné štítky: `Koncept` (stone) → `Ke schválení` (blue) → `Schváleno` (green) → `Podepsáno` (primary) → `Odesláno` (green + ikona). Timeline schvalování v detailu dokumentu (kdo, kdy, komentář).
- **Podpis:** podpisové pole prstem na mobilu (canvas, bottom sheet), na desktopu myší nebo nahraný podpis.
- **Odeslání:** sheet se způsoby doručení jako velké karty s ikonami: E-mail · WhatsApp · Sdílet (nativní share sheet) · **Datová schránka** (např. na OSPOD — zobrazit ID schránky příjemce, stav doručenky jako timeline).

### 6.6 Administrace

Stejný design systém, jen hustší informace — NE jiný „admin skin".

- **Orgadmin** (správa jedné organizace): tým klíčových osob (karty s kapacitou — progress ring „24/30 pěstounů"), přiřazování rodin (drag & drop na desktopu), šablony dokumentů, nastavení organizace (logo, datová schránka, e-mailová doména), přehled termínů a výkonů (jemné bar charty, zaoblené sloupce, žádné mřížky).
- **Superadmin** (celý SaaS): seznam organizací jako karty (počet uživatelů, rodin, stav předplatného), onboarding nové organizace jako průvodce (wizard s kroky jako tečky, ne breadcrumb), feature flagy, audit log (prostý seznam, monospace jen pro ID), stav systému.
- Role viditelná jemně: mini štítek u avataru v profilu, ne banner přes celou aplikaci.

---

## 7. Interakce a pohyb

- Hover/press na všem klikatelném: `hover:bg-stone-100 active:scale-[0.98] transition duration-150`.
- Přechody obrazovek na mobilu: nativní slide (PWA view transitions API, s fallbackem).
- Optimistické UI: záznam se zobrazí okamžitě, sync indikátor diskrétně.
- Prázdné stavy: přátelská ilustrace v pastelových barvách palety + jedna věta + jedna akce („Zatím žádné zápisy. Až navštívíte rodinu, začněte tlačítkem +.").
- Toasty: dole (nad bottom nav), rounded-full, tmavé (stone-800) s bílým textem, auto-dismiss 3 s.
- `prefers-reduced-motion` respektovat vždy.
- Skeleton loading (pulzující stone-100 obdélníky s rounded-xl), nikdy fullscreen spinner.

---

## 8. Přístupnost a terén

- Kontrast min. AA — pastelová pozadí jsou jen podklad, informaci vždy nese text-700 barva + ikona/tvar (ne jen barva — barvoslepost).
- Offline-first: vše zapisovatelné funguje bez signálu; globální stav sync jako tečka u avataru (zelená = sync, amber = čeká).
- Jedna ruka: primární akce v dolní polovině obrazovky, destruktivní akce nikdy vedle častých.
- Citlivá data: rozmazání náhledů fotek dětí v přepínači aplikací (privacy screen), rychlé zamčení.

---

## 9. Zakázané vzory (anti-Modernize checklist)

Claude Code NIKDY nepoužije:

- ❌ Bootstrap komponenty, třídy `btn-primary`, `card-header`, výchozí modrou `#0d6efd`
- ❌ Tabulky s viditelnou mřížkou pro seznamy entit (tabulka povolena jen v adminu pro audit log a fakturaci — a i tam bez svislých čar, řádky oddělené jen py a hover pozadím)
- ❌ Tvrdé bordery `border border-gray-300` kolem karet — karty definuje pozadí + stín
- ❌ Gradientová tlačítka, glow efekty, glassmorphism
- ❌ Font-weight 700+, čistá černá `#000`, čistě šedé pozadí `#f0f0f0`
- ❌ Breadcrumbs na mobilu, horní hamburger menu (máme bottom nav)
- ❌ Modální okna na mobilu (→ bottom sheet), víc než 1 modál naráz kdekoli
- ❌ Emoji přímo v UI textech a tlačítkách (ikony = Lucide, stroke 1.75)
- ❌ Dashboard s KPI dlaždicemi a koláčovými grafy jako úvodní obrazovka
- ❌ Sidebar širší než 240px, tmavý sidebar

---

## 10. Technické zásady UI vrstvy

- **Stack:** React + Tailwind, ikony **lucide-react**, PWA (service worker, offline cache, install prompt), Firebase (Auth, Firestore, Storage, Functions), CI přes GitHub.
- Design tokeny výše zapsat do `tailwind.config` (`theme.extend.colors.primary`, `entity.family`, `entity.ospod`, …) — v kódu POUZE tokeny, nikdy ad-hoc hex.
- Komponentová knihovna v `src/components/ui/` — Button, Card, Badge, Avatar, BottomSheet, Chip, EmptyState, Timeline, RecordButton. Každá nová obrazovka SKLÁDÁ z těchto komponent, nevytváří vlastní styly.
- **Zlatý standard:** až bude odladěna obrazovka „Detail rodiny", označíme ji zde jako referenční. Veškeré nové UI musí vizuálně odpovídat jejímu kódu (spacing, třídy, vzory).

---

## 11. Plán migrace z Modernize

1. **Fáze 0:** smazat odkazy na Modernize z CLAUDE.md, odstranit Bootstrap/Modernize CSS a assety z repozitáře (jinak bude CC vzory míchat!).
2. **Fáze 1:** tailwind.config s tokeny + složka `src/components/ui/` se základními komponentami + layout shell (bottom nav mobil, sidebar desktop).
3. **Fáze 2:** obrazovka „Dnes" a „Rodiny" v novém designu.
4. **Fáze 3:** „Detail rodiny" — iterovat do dokonalosti → prohlásit za zlatý standard.
5. **Fáze 4:** capture flow (+, fotka, audio, sken), dokumenty a editor.
6. **Fáze 5:** workflow schvalování/podpis/odeslání, poté admin rozhraní.
7. Průběžně: screenshoty Amie do `design-refs/` (kalendář, notes, kontakt, settings) jako vizuální reference pro CC.
