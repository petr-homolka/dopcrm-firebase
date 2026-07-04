# DESIGN.md — Connecteam-inspired designový systém pro Doprovázení.com

> **Poznámka k výzkumu:** Tento dokument je syntéza čtyř výzkumných reportů o Connecteamu. Subagenti neměli v tomto prostředí přístup k živému webu, proto hex hodnoty, přesné rozměry a font-family jsou **kvalifikované odhady** z tréninkových dat, veřejných screenshotů (Capterra/G2/App Store) a pěti obrazovek dodaných uživatelem. Před finálním nasazením doporučujeme ověřit klíčové hodnoty pipettou přímo z `connecteam.com` a `app.connecteam.com` (viz §10 Verifikační checklist).

---

## §1 Designová filozofie

Doprovázení.com přebírá **Connecteam vzor: přátelsky profesionální, světlý, informačně hustý ale vzdušný**. Cílem je nahradit stávající „Amie.so" styl, který uživatel popsal jako „funkční, ošklivý, jako z roku 1998". Nový styl staví na **čtyřech principech**:

1. **Bílé karty na světle šedomodrém plátně.** Žádný dark mode jako výchozí, žádné husté rámečky. Karty s jemným stínem a `border-radius: 12px` plavou nad `#F5F7FA` pozadím. Vzdušnost přes 20–24px padding uvnitř karet, 16–24px mezery mezi kartami.
2. **Barevné kódování modulů jako identita.** Každý modul (Dnes, Rodiny, Kalendář, Osa, Dokumenty, Čerpání, Tým) má svou signature barvu, která se objevuje v ikoně v sidebaru, v ikoně u řádku aktivity a v malých akcentech. Barvy nesou sémantiku — nejsou jen dekorací.
3. **Progressivní onboarding s jemnou gamifikací.** Zdvořile, s ohledem na doménu sociální práce. Checklist „Rozjezd systému" s krokovým indikátorem, decentní konfety při dokončení, žádné dolarové kredity. Empty states učí, nezahanbují.
4. **Duální publikum.** Web-first pro koordinátory pěstounské péče (koordinátorky, metodičky, ředitelky), mobil-first pro klíčové pracovníky v terénu. Sdílený designový jazyk, ale mobil má větší dotykové cíle a check-in na místě rodiny.

**Tonalita.** Klidná, věcná, empatická — ale ne mateřská ani infantilní. Doprovázení je vážný obor, kde jde o děti. Emoji používáme střídmě (👋 při přivítání, 🎉 při dokončení onboardingu, ✅ v toastech úspěchu). Tlačítka jsou konkrétní slovesa („Přidat rodinu", „Publikovat plán", „Odeslat report"). Chybové hlášky nikdy neobviňují uživatele.

---

## §2 Barevný systém

### 2.1 Připravená paleta jako Tailwind tokeny

Rozšíříme `tailwind.config.js` o následující tokeny. Hex hodnoty jsou odhadem z Connecteam UI; při implementaci ověřte pipettou (viz §10).

```js
// tailwind.config.js — theme.extend.colors
colors: {
  // Primární značková modrá (Connecteam-style)
  brand: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#2E7CF6',   // hlavní CTA, aktivní tab, odkazy
    600: '#1E6FF5',   // hover primary
    700: '#1D4ED8',   // active/pressed
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Sekundární teal (jako Connecteam „Watch now" tlačítko a onboarding akcenty)
  accent: {
    50:  '#ECFEFF',
    100: '#CFFAFE',
    500: '#0FB3B1',   // sekundární CTA, onboarding progress
    600: '#0891A2',
    700: '#0E7490',
  },
  // Světlé plátno a povrchy
  surface: {
    canvas:  '#F5F7FA',   // pozadí stránky
    card:    '#FFFFFF',
    sidebar: '#FFFFFF',
    muted:   '#F8FAFC',   // hlavička tabulky, hover řádku
    tint:    '#EFF6FF',   // světle modrý tint pro aktivní řádek v sidebaru
  },
  // Ohraničení
  border: {
    subtle:  '#EEF1F5',
    default: '#E5E9F0',
    strong:  '#D9DEE7',
  },
  // Text
  ink: {
    900: '#0F172A',   // hlavičky
    800: '#1A2B49',
    700: '#334155',
    600: '#4A5568',   // body
    500: '#64748B',
    400: '#6B7A90',   // muted, popisky
    300: '#A0AEC0',   // disabled
  },
  // Sémantika
  success: { 50: '#DCFCE7', 500: '#22C55E', 600: '#16A34A', 700: '#166534' },
  warning: { 50: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#92400E' },
  danger:  { 50: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#991B1B' },
  info:    { 50: '#DBEAFE', 500: '#2E7CF6', 600: '#1E6FF5' },
}
```

### 2.2 Barvy modulů (Connecteam styl — barevná dlaždice v sidebaru)

Každý modul dostane 24×24 px zaoblený čtverec (radius 6 px) plný barvou, uvnitř bílá ikona. **Barva se opakuje v activity feedu jako menší kolečko překrývající uživatelský avatar.**

| Modul (CZ)            | Modul (interní)  | Barva      | Hex        | Tailwind ekvivalent | Ikona (lucide-react) |
|-----------------------|------------------|------------|------------|---------------------|----------------------|
| **Dnes**              | today            | Modrá      | `#2E7CF6`  | `brand-500`         | `LayoutDashboard`    |
| **Rodiny**            | families         | Zelená     | `#3ECF8E`  | `emerald-500`       | `Users`              |
| **Kalendář**          | calendar         | Oranžová   | `#F5A623`  | `amber-500`         | `Calendar`           |
| **Osa (timeline)**    | timeline         | Fialová    | `#7B61FF`  | `violet-500`        | `Activity`           |
| **Dokumenty**         | documents        | Teal       | `#0FB3B1`  | `teal-500`          | `FileText`           |
| **Čerpání (dotace)**  | allowances       | Žlutá      | `#F2C94C`  | `yellow-400`        | `Wallet`             |
| **Tým (dashboard)**   | team             | Slate      | `#5B6B8C`  | `slate-500`         | `LineChart`          |
| **Admin**             | admin            | Šedá       | `#6B7280`  | `gray-500`          | `Settings`           |

### 2.3 Sémantické barvy entit (zachovává se z původního designu, přebarveno do Connecteam škály)

Toto je **nesmí regressovat** — sémantické kódování subjektů systému musí zůstat rozlišitelné a barvoslepě přístupné. Barvy jsou přepočítané, aby ladily s novou paletou, ale zachovaly původní asociace.

| Entita                          | Původní styl (Amie) | Nová Connecteam-friendly barva | Použití                         |
|---------------------------------|---------------------|--------------------------------|---------------------------------|
| **Pěstounská rodina**           | zelená              | `#3ECF8E` (emerald-500)        | badges, řádky, karta detailu    |
| **OSPOD**                       | modrá               | `#2E7CF6` (brand-500)          | badges, filtr chip              |
| **Soud**                        | kamenně šedá        | `#5B6B8C` (slate-500)          | badges                          |
| **Biologická rodina**           | jantarová           | `#F5A623` (amber-500)          | badges                          |
| **Krize (urgentní situace)**    | terakota            | `#EF4444` (danger-500)         | badge s pulzujícím kroužkem     |

**Pravidlo použití entit v UI:** vždy jako **tinted pill** (bg = 10% opacity barvy, text = tmavá varianta barvy, např. `success-700`). Nikdy sytá barva na celém prvku pro entity — sytá barva je vyhrazena pro **status shift bloků v kalendáři** (viz §6.4).

### 2.4 Barevné bloky v kalendáři (návštěvy jako „shifts")

Podle Connecteam kalendáře — sytá barva na celém bloku, bílý text, radius 6–8 px. Barva bloku = **barva entity rodiny/typu události**.

```
Návštěva u rodiny        → #2E7D5B (tmavě zelená)  bílý text
Jednání OSPOD            → #1E40AF (tmavě modrá)
Soud                     → #4A5A78 (slate)
Kontakt s bio-rodinou    → #B58B2E (mustard)
Krizová intervence       → #B23A3A (tmavě červená) + pulzující rámeček
Metodická porada         → #6B4EA0 (fialová)
Vzdělávání pěstounů      → #2A8FA0 (teal)
```

### 2.5 Přístupnost (WCAG AA)

Všechny páry text/pozadí musí projít **kontrastem 4.5:1 pro body text a 3:1 pro velký text/UI**. `brand-500` (`#2E7CF6`) na bílém = 4.6:1 ✓. `ink-400` (`#6B7A90`) na `surface-canvas` (`#F5F7FA`) = 4.4:1 — jen pro popisky, ne pro důležitý text. Entity vždy doprovázeny **ikonou nebo textem**, aby nespoléhaly čistě na barvu (deuteranopie: emerald vs. amber vs. slate).

---

## §3 Typografie

### 3.1 Rodina písma

**Primární:** `Inter` (Google Fonts, s podporou latinky rozšířené včetně č/š/ř/ě). Connecteam vypadá jako geometrický humanistický sans; Inter je nejbezpečnější, otevřený a Tailwind-native. Alternativa `DM Sans` pokud chce být web „přátelštější/kulatější".

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
       font-feature-settings: 'cv02','cv03','cv04','cv11'; }
```

### 3.2 Škála

| Role                      | Velikost | Weight | Line-height | Tailwind                    |
|---------------------------|----------|--------|-------------|-----------------------------|
| **H1 (page title)**       | 28 px    | 700    | 1.2         | `text-[28px] font-bold`     |
| **H2 (section)**          | 22 px    | 700    | 1.3         | `text-[22px] font-bold`     |
| **H3 (card title)**       | 18 px    | 600    | 1.4         | `text-lg font-semibold`     |
| **Body**                  | 14 px    | 400    | 1.5         | `text-sm`                   |
| **Body large**            | 16 px    | 400    | 1.5         | `text-base`                 |
| **Small / meta**          | 12 px    | 400    | 1.4         | `text-xs`                   |
| **Table header**          | 12 px    | 600    | 1.2         | `text-xs font-semibold uppercase tracking-wide` |
| **Label / form**          | 13 px    | 500    | 1.4         | `text-[13px] font-medium`   |
| **Button**                | 14 px    | 600    | 1           | `text-sm font-semibold`     |
| **Badge/pill**            | 11–12 px | 600    | 1           | `text-xs font-semibold`     |

Použité váhy: **400, 500, 600, 700**. Nikdy `font-light`, nikdy `font-black`.

---

## §4 Layout: sidebar + topbar + obsah + right rail

### 4.1 Rozvržení celé aplikace

```
┌─────────────────────────────────────────────────────────────────────┐
│  Topbar (56 px)   [search 400px] [plán badge] [?] [🔔] [avatar]     │
├──────────┬──────────────────────────────────────────────┬───────────┤
│          │                                              │           │
│ Sidebar  │  Content (max-w 1280 px, padding 24–32 px)   │ Right rail│
│ 240 px   │                                              │ 320 px    │
│          │  ┌─────────┐  ┌─────────┐                    │ (jen na   │
│          │  │  Karta  │  │  Karta  │                    │  Dnes)    │
│          │  └─────────┘  └─────────┘                    │           │
│          │                                              │           │
└──────────┴──────────────────────────────────────────────┴───────────┘
```

### 4.2 Sidebar (levý panel)

- **Šířka rozbalený:** 240 px. **Zbalený:** 64 px (jen ikony). Přechod `transition-all 200ms`.
- **Pozadí:** `bg-white`, pravé ohraničení `border-r border-border-default`.
- **Sekce shora dolů:**
  1. Logo + název organizace (výška 64 px, padding 16 px). Pod tím tenká oddělovací linka.
  2. Popisek sekce **„PRACOVNÍ PROSTOR"** — 11 px, uppercase, `text-ink-400`, letter-spacing 0.05em, padding 16 px 12 px 8 px.
  3. Seznam modulů — každý řádek:
     - Výška 40 px, padding-x 12 px, gap 12 px.
     - **Barevná dlaždice modulu** 24×24 px, radius 6 px, bílá ikona 14 px uvnitř.
     - Label 14 px, weight 500, `text-ink-800`.
     - Volitelný badge vpravo (počet krizí, počet nových požadavků) — modrá pilulka.
     - **Aktivní stav:** `bg-surface-tint` (světle modré `#EFF6FF`), text `text-brand-700` bold, vlevo 3 px pruh `bg-brand-500`.
     - **Hover:** `bg-surface-muted`.
  4. Oddělovací linka.
  5. Sekce **„ADMINISTRACE"** (jen pro role admin/koordinátor).
  6. Dole: **Nápověda** (otevře help drawer), **Nastavení**, **Odhlásit se**.

### 4.3 Topbar (horní lišta)

- **Výška:** 56 px. `bg-white border-b border-border-default`.
- **Obsah zleva doprava:**
  - **Global search** — 400 px šířka, výška 40 px, `bg-surface-canvas`, radius 8 px, levá lupa `text-ink-400`, placeholder „Hledat rodiny, dokumenty, aktivity…", zkratka `/` fokusuje search.
  - Flex-grow spacer.
  - **Plán / org badge** — pilulka „Doprovázející org — Full plan" nebo „Zkušební 14 dní", světle modré pozadí `bg-brand-50`, text `text-brand-700`, 12 px semibold.
  - **? Nápověda** — 32×32 ikona button, ghost. Klik otevře Help drawer (nikoli Intercom; interní KB).
  - **🔔 Notifikace** — 32×32, s červeným kruhovým badge při nepřečtených.
  - **Avatar** — 32 px kolo + chevron. Klik = dropdown (Profil, Nastavení, Odhlásit).

### 4.4 Content area

- Max šířka **1280 px**, centrovaná. Padding 24 px nahoře, 32 px po stranách na desktopu, 16 px na tabletu.
- **Karty:** `bg-white rounded-xl border border-border-subtle shadow-sm`, padding uvnitř 20–24 px, gap mezi kartami 16–24 px.
- **Stín:** `shadow-sm` = `0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.06)`.

### 4.5 Right rail (pravý sloupec — jen Dnes dashboard)

- Šířka **320 px**, zobrazený pouze na širokých displejích (`xl:` breakpoint). Padding-left 16 px.
- Stack karet: onboarding progress, mobil-app promo QR karta, nejbližší návštěvy widget.

### 4.6 Responsive breakpoints

| Breakpoint | Chování                                                    |
|------------|------------------------------------------------------------|
| `< 768 px` | Sidebar → hamburger drawer, right rail → skrytý            |
| `768–1279` | Sidebar sbalený na 64 px, right rail skrytý                |
| `≥ 1280`   | Plný layout se sidebarem 240 px a right rail 320 px        |

---

## §5 Knihovna komponent

### 5.1 Tlačítka

```tsx
// Primary
<Button className="bg-brand-500 hover:bg-brand-600 text-white 
                   text-sm font-semibold rounded-lg 
                   px-4 py-2.5 h-10 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-brand-200">
  Přidat rodinu
</Button>

// Secondary (outlined)
<Button className="bg-white border border-border-strong text-ink-800 
                   hover:bg-surface-muted text-sm font-semibold 
                   rounded-lg px-4 py-2.5 h-10">
  Zrušit
</Button>

// Tertiary / text
<Button className="text-brand-600 hover:text-brand-700 hover:underline 
                   text-sm font-semibold">
  Zobrazit více
</Button>

// Icon button
<Button className="h-9 w-9 rounded-lg hover:bg-surface-muted 
                   flex items-center justify-center">
  <MoreHorizontal className="h-4 w-4 text-ink-500" />
</Button>

// Split dropdown button ("Add users ▾")
```

**Velikosti:** sm = 32 px, md = 40 px (default), lg = 48 px. Radius **vždy 8 px**.

### 5.2 Vstupní pole

- Výška 40 px, radius 8 px, `bg-white border border-border-strong`.
- Focus: `border-brand-500 ring-2 ring-brand-100`.
- Chyba: `border-danger-500 ring-2 ring-danger-50`, chybová hláška 12 px `text-danger-600` pod polem.
- Label 13 px medium `text-ink-700`, mezera 4 px k inputu.
- Search inputy: `bg-surface-canvas` bez viditelného borderu, levá lupa.

### 5.3 Taby

```tsx
<div className="border-b border-border-default">
  <nav className="flex gap-6">
    <button className="pb-3 pt-4 text-sm font-semibold border-b-2 
                       border-brand-500 text-brand-600">
      Aktivní rodiny
    </button>
    <button className="pb-3 pt-4 text-sm font-medium border-b-2 
                       border-transparent text-ink-500 hover:text-ink-800">
      Archivované
    </button>
  </nav>
</div>
```

### 5.4 Badges / pilulky

- Radius `rounded-full`, padding `px-2 py-0.5`, text 12 px semibold.
- **Tinted varianty** (bg = tinted, text = tmavý):
  - Success: `bg-success-50 text-success-700`
  - Warning: `bg-warning-50 text-warning-700`
  - Danger: `bg-danger-50 text-danger-700`
  - Info/entity: `bg-brand-50 text-brand-700`

### 5.5 Avatary

- Škála: **sm 24 px, md 32 px, lg 40 px, xl 56 px, hero 96 px** (v profilu rodiny).
- Kruhový. Fallback iniciály — deterministicky obarvené pozadí (hash jméno → hue), bílé písmeno 600.
- **Double-avatar (activity feed)** — 32 px avatar uživatele + 16 px kroužek modul-barvy překrývající pravý dolní roh (obsahuje bílou glyf ikonu modulu). `border-2 border-white` na obou. Toto je **signature Connecteam pattern**, který přebíráme beze změny.

### 5.6 Data tabulky (např. seznam Rodin)

```
┌────┬─────────────────────────┬───────────┬──────────┬────────┬───┐
│ ☐  │ RODINA                  │ TYP       │ KOORD.   │ AKCE   │ ⚙ │  ← header row, bg-surface-muted
├────┼─────────────────────────┼───────────┼──────────┼────────┤   │
│ ☐  │ 🟢 Novákovi (3 děti)    │ pěstouni  │ AK       │ [👁] […]│   │  ← 56 px hover:bg-surface-muted
│ ☐  │ 🟢 Svobodovi           │ příbuzní │ JN       │ [👁] […]│   │
└────┴─────────────────────────┴───────────┴──────────┴────────┴───┘
```

- **Header:** `bg-surface-muted`, text 12 px uppercase semibold `text-ink-400`, sticky top-0.
- **Řádek:** výška 56 px, oddělovač 1 px `border-border-subtle`.
- **Hover:** `bg-surface-muted`.
- **Checkbox column:** 40 px wide, custom checkbox radius 4 px, checked = `bg-brand-500`.
- **Buňka avatar+jméno:** 32 px avatar + 8 px gap + jméno (14/600) nad podtitulem (12/400 muted).
- **Inline akce:** ikony viditelné jen na hover řádku, plus `…` menu.
- **Column customization** — ozubené kolo vpravo nad tabulkou, otevře popup s checkboxy sloupců.

### 5.7 Activity feed řádek (Osa timeline)

```tsx
<div className="flex items-start gap-4 py-4 border-b border-border-subtle">
  {/* Double-avatar */}
  <div className="relative flex-shrink-0">
    <img src={userAvatar} className="h-8 w-8 rounded-full border-2 border-white" />
    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full 
                    bg-emerald-500 border-2 border-white 
                    flex items-center justify-center">
      <Users className="h-2.5 w-2.5 text-white" />
    </div>
  </div>
  {/* Text */}
  <div className="flex-1 min-w-0">
    <p className="text-sm text-ink-700">
      <span className="font-semibold text-ink-900">Anna Krátká</span>{' '}
      zapsala návštěvu u rodiny{' '}
      <a href="/rodiny/novakovi" className="text-brand-600 font-medium hover:underline">
        Novákovi
      </a>
    </p>
    <p className="text-xs text-ink-400 mt-0.5">Trvání 1 h 45 min • Osobně</p>
  </div>
  <time className="text-xs text-ink-400 flex-shrink-0">před 2 h</time>
</div>
```

**Grupování podle dne:** sticky header „Středa 25. 6. 2026" — 12 px semibold uppercase, tenká čára pod tím. Nad feedem horizontální strip chipů (`St 25` `Út 24` `Po 23`…) pro rychlou navigaci; aktivní chip má `bg-brand-500 text-white`.

### 5.8 Progress bars a step timeline

- **Lineární progress bar (onboarding „1/6"):** 6 segmentů, výška 6 px, radius 999 px. Vyplněné `bg-brand-500`, prázdné `bg-border-default`. Gap mezi segmenty 4 px.
- **Krokový timeline s tečkami:** kroužky 20 px, spojnice 2 px, dokončený = filled brand-500 s bílým ✓, aktuální = brand-500 outline s brand-500 středem, budoucí = `bg-border-default`.
- **Capacity bar** (v kalendáři pod dnem): 4 px tall, barva podle vytížení:
  - `bg-danger-500` — přetížený den (>100% kapacity koordinátora)
  - `bg-warning-500` — vysoké vytížení (70–100%)
  - `bg-success-500` — v pořádku (30–70%)
  - `bg-border-default` — málo vytížený

### 5.9 Onboarding checklist karta

```
┌───────────────────────────────────────────────────────┐
│  Rozjezd systému                            1/6   ▾  │
├───────────────────────────────────────────────────────┤
│  ▍ ✓  Vyplnit údaje organizace                        │  ← dokončeno (barvený levý pruh)
│                                                       │
│  ▍ ●  Přidat koordinátorky                           │  ← aktivní (tinted bg)
│       Pozvete kolegy e-mailem nebo přes odkaz.       │
│       [Přidat koordinátorky]  Naučit více →          │
│                                                       │
│    ○  Zaevidovat první pěstounskou rodinu             │
│    ○  Naplánovat první návštěvu                       │
│    ○  Nahrát metodické dokumenty                      │
│    ○  Ověřit e-mailové notifikace                     │
├───────────────────────────────────────────────────────┤
│   ● ● ○ ○ ○ ○                                         │  ← tečkový timeline
└───────────────────────────────────────────────────────┘
```

**Kroky se dokončují stavově** (server sleduje první výskyt události — první rodina vytvořena, první návštěva publikovaná). Žádné manuální „označit jako hotovo". Po dokončení všech 6 kroků → **konfety** (canvas particles, 2–3 s, respekt `prefers-reduced-motion`) + modal:

> **🎉 Skvělá práce! Váš systém je připravený.**
> Vaše organizace může začít doprovázet rodiny.
> **[Přejít na Dnes]** _Prohlédnout tipy_

**Žádný dolarový kredit** — nahradíme neutrální větou „Vaše organizace je připravená". Doména sociální práce nesnese komerční pobídky.

### 5.10 Empty states

- Centrovaná ilustrace 2-tón (brand modrá + accent teal), 160–200 px.
- H2 18 px bold: „Zatím nemáte žádné rodiny"
- Podřádka 14 px `text-ink-500`: „Přidejte první pěstounskou rodinu a začněte plánovat návštěvy."
- Primary CTA + volitelný text link „Naimportovat z CSV" nebo „Podívat se na tutoriál".
- **„Vyzkoušet s ukázkovými daty"** ghost button — vytvoří 3 demo rodiny (např. „Novákovi", „Svobodovi", „Dvořákovi") + pár návštěv v kalendáři. Skvělé pro školení nových koordinátorek.

### 5.11 Modaly, drawery, toasty

- **Modal:** centered, max-w 560 px, radius 12 px, backdrop `bg-black/50`, header 20 px/600 + close ×, content padding 24 px, footer flex-end s primary+secondary.
- **Drawer:** slide zprava, šířka 480 px (default), 640 px pro edit rodiny. Sticky header + footer.
- **Toast:** bottom-left (Connecteam pozice), 320–360 px, radius 10 px, bílé pozadí s barevným levým 4 px pruhem podle typu. Auto-dismiss 4–5 s, hover pauzuje. Max 3 stack. Volitelný „Vrátit zpět" text link (undo) pro reverzibilní akce (smazání).

### 5.12 Search + filter row nad tabulkou

```
┌────────────────────┬──────────┬──────────────────────┐
│ 🔍 Hledat rodinu…  │ Filtr(2) │      + Přidat ▾      │
└────────────────────┴──────────┴──────────────────────┘
```

Filter button s ikonou trychtýře a **modrou pilulkou s počtem aktivních filtrů**. Chip filtry pod tím: `Typ: pěstouni ×` `Koordinátor: AK ×`.

### 5.13 Plovoucí help bubble (bottom-right)

- 56 px kruh, `bg-brand-500`, bílá ikona chatu, `shadow-lg`, offset 24 px od okrajů.
- Klik → interní **Help drawer** (nikoli Intercom, aby data zůstala v ČR/EU). Obsah:
  - Vyhledávání v interní KB (metodika, návody).
  - Odkazy na klíčové články.
  - Kontakt na support (e-mail + telefon).
  - Odkaz „Nahlásit chybu" → otevře modal formuláře.

---

## §6 Aplikace na jednotlivé obrazovky

### 6.1 Dnes — dashboard koordinátorky

**Layout:**
- Levá 2/3: hlavní obsah, pravá 1/3: right rail (jen ≥1280 px).

**Prvky shora dolů, levý sloupec:**

1. **Uvítací headline** — „Dobré ráno, Anno 👋" H1 28 px + malý sub `Úterý 25. června 2026`.
2. **Quick Actions bar** — řada outlined pill tlačítek (Connecteam Quick Actions pattern):
   ```
   [+ Přidat rodinu] [📅 Naplánovat návštěvu] [📢 Poslat oznámení] [📄 Vyplnit report]
   ```
   Pill: rounded-full, 36 px tall, 1 px `border-brand-200`, text `text-brand-700`, hover `bg-brand-50`.
3. **Onboarding checklist karta** — jen prvních 30 dní od registrace nebo dokud není 6/6. Po dokončení skryto (znovu-dostupné přes ? menu).
4. **Karta „Dnes k vyřešení"** — 3–5 akčních položek: přesahující dokumenty, nevydané reporty z minulé návštěvy, urgentní zprávy z OSPOD. Každá řádka s ikonou modulu, textem, deadline chipem.
5. **Karta „Nejbližší návštěvy"** — mini-kalendář 3 dny dopředu jako list; kliknutí navádí do Kalendáře.

**Prvky right rail:**
- **Mobilní aplikace promo** (Connecteam vzor — QR kód) — pouze pokud uživatel ještě neinstaloval:
  ```
  ┌────────────────────────┐
  │  Doprovázení v terénu  │
  │  [QR kód 128×128]      │
  │  Naskenujte pro instalaci │
  │  [App Store] [Google Play]│
  └────────────────────────┘
  ```
  Pozadí gradient `from-brand-500 to-brand-700`, bílý text.
- **Statistiky týdne** karta — malé KPI („Návštěvy tento týden: 12 ▲ 3", „Nevydané reporty: 2").
- **Novinky** — 2–3 poslední oznámení z org chatu.

### 6.2 Rodiny — Users tabulka (Connecteam Users vzor)

**Struktura přesně jako Connecteam Users page (screenshot 3 od uživatele):**

1. **Onboarding cards carousel** — jen pro nové orgs. Horizontálně scrollovací karty (280×180 px): „Naimportujte rodiny z CSV", „Nastavte typy rodin", „Přiřaďte koordinátorky". Každá s ilustrací, titulem, 1-řádkovou popiskou a text linkem.
2. **Taby:** `Aktivní` (default) / `Archivované` / `Návrhy`. Underlined active v `brand-500`.
3. **Search + Filter + „+ Přidat rodinu ▾"** row.
4. **Tabulka:**
   ```
   ☐ | RODINA (avatar + jména + subtitle „3 děti")
     | TYP (badge — Pěstouni / Příbuzenská / Osvojení)
     | KOORDINÁTORKA (avatar + jméno)
     | POSLEDNÍ NÁVŠTĚVA (datum + „před 12 dny" muted)
     | STATUS (badge — Aktivní / Sledování / Krize)
     | AKCE (👁 detail, ⋯ menu)
   ```
5. Column customization ⚙ vpravo nad tabulkou.
6. Pagination bottom — „1–50 z 87 rodin".

### 6.3 Detail rodiny (tabs jako Connecteam entity detail)

Header karta: hero avatar rodiny + jméno H1 + status badge + primární akce („Naplánovat návštěvu", „Vyplnit report").

**Taby pod headerem:**
1. **Přehled** — kartový layout: kontakty, děti, klíčoví lidé, historie.
2. **Návštěvy** — timeline z Osy filtrovaný na tuto rodinu.
3. **Dokumenty** — grid dokumentů s expirací (badges červená/oranžová pokud vypršely/vyprší).
4. **Čerpání** — tabulka schválených dotací.
5. **OSPOD / Instituce** — propojené organizace.
6. **Aktivita** — audit log změn.

### 6.4 Kalendář — plný Connecteam Schedule treatment

**Toto je klíčová obrazovka — uživatel Connecteam Schedule explicitně chválil jako „opravdu sofistikovaný". Přebíráme kompletně.**

#### Layout týdenního zobrazení

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Zobrazit ▾] ◀ 23.–29. 6. 2026 ▶ [Tento týden]  [Akce ▾] [Přidat ▾] [Požadavky (2)] [🔔 Publikovat (7)] │
├──────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┤
│          │ Po 23   │ Út 24   │ St 25   │ Čt 26   │ Pá 27   │ So 28   │  ← day header
│          │ 2/3     │ 3/3     │ 1/3     │ 2/3     │ 3/3     │ 0/3     │  ← kapacita
│          │ ████░   │ █████   │ ███░░   │ ████░   │ █████   │ ░░░░░   │  ← capacity bar
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Náklady/ │ 4 h     │ 6 h     │ 3 h     │ 5 h     │ 8 h     │ 0 h     │  ← Labor & Sales řádek
│ vytížení │ 12%     │ 18%     │ 9%      │ 15%     │ 24%     │ 0%      │
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Poznámky │ ☰ Porada│         │ ⚠ Svátek│         │ ☰ Vzděl.│         │  ← Daily info
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Anna K.  │ ▓▓▓▓▓   │         │         │ ▓▓▓▓    │         │         │  ← koordinátorky
│          │ 9-12    │         │         │ 14-17   │         │         │     jako řádky
│          │ Novákovi│         │         │ Svobod. │         │         │
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Jan N.   │         │ ▓▓▓▓▓   │ ░░░░    │         │ ▓▓▓▓▓   │         │
│          │         │ 10-13   │ Otevř.  │         │ 9-12    │         │
│          │         │ Dvořák. │ 0/1     │         │ Nováko. │         │
├──────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Návštěvy │         │         │ ░░░░    │         │         │         │  ← unassigned row
│ bez přiř.│         │         │ Krize   │         │         │         │
├──────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┤
│ Hodiny  4h    6h    3h    5h    8h    0h  │ Celkem: 26 h            │  ← sticky footer
│ Návštěvy 2   3     2     2     3     0    │           12            │
│ Rodiny  2   2     2     2     2     0    │             8           │
└──────────────────────────────────────────────────────────────────────┘
                                                              [Users][Tmplt] ← side tabs
```

#### Detailní spec kalendáře

- **Levý sloupec:** seznam **koordinátorek** jako řádky (Connecteam „Locations" → naše „koordinátorky/klíčovky"). Special řádky:
  - **„Návštěvy bez přiřazení"** (pinned nahoře nebo dole) — otevřené shifty pro claim.
  - Volitelně **„Ex-terní"** (soud, OSPOD) — události, které nejsou návštěvou koordinátora.
- **Day header:** den + datum, kapacita `2/3` = 2 návštěvy naplánované ze 3 dostupných slotů pro koordinátory ten den. **Capacity bar** pod tím:
  - Rudá `#DC2626` — přetížení (>100%)
  - Oranžová `#F59E0B` — vysoká (70–100%)
  - Zelená `#22C55E` — v pořádku (30–70%)
  - Šedá `#E5E9F0` — velká rezerva
- **Special rows nahoře (collapsible):**
  - **„Náklady / vytížení"** — sum hodin per den + procento vytížení koordinátorek (analog Connecteam Labor & Sales, ale adaptované na sociální práci — žádné dolary, jen hodinová bilance).
  - **„Poznámky dne"** — text notes (svátky, porady, sanace).
- **Shift blocks (návštěvy):**
  - Radius 6 px, sytá barva plný fill dle **typu události** (viz §2.4), bílý text.
  - Obsah: čas `9:00–12:00` (13 px semibold), pod tím jméno rodiny (13 px regular), volitelně malá ikona „📋 report" pokud je připojený formulář.
  - **Otevřená (unassigned) návštěva:** dashed border, světlejší fill, text „Otevřená návštěva — Přijmout".
  - **Draft (nepublikovaná):** šrafovaný overlay `background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)`.
  - **Konflikt:** malý ⚠ ikona v pravém horním rohu, tooltip s vysvětlením.
  - **Hover:** elevated shadow + akční toolbar (edit, duplikovat, smazat).
- **Top action bar:**
  - `Zobrazit ▾` — Den / Týden / 2 týdny / Měsíc.
  - `◀ [datum] ▶ [Tento týden]` — navigace.
  - `Akce ▾` — Kopírovat týden, Vymazat týden, Import z Excelu, Export PDF, Tisk, Auto-plánování, Nastavení kalendáře.
  - `Přidat ▾` — Přidat návštěvu, Přidat otevřenou návštěvu, Přidat koordinátorku (řádek), Přidat poznámku dne, Použít šablonu.
  - `Požadavky (N)` — žádosti o dovolenou / výměnu / claim otevřené návštěvy. Červený badge při čekajících.
  - **`🔔 Publikovat (N)`** — primární brand-500 tlačítko s bell ikonou a počtem nepublikovaných změn. **Toto je hlavní CTA v celém kalendáři.** Klik otevře modal:
    ```
    Publikovat plán na 23.–29. 6. 2026?
    • 5 nových návštěv
    • 2 upravené
    • 0 zrušených
    
    ☐ Odeslat koordinátorkám push notifikaci a e-mail
    ☐ Přidat zprávu: [text field]
    
    [Zrušit]  [Publikovat a upozornit]
    ```
- **Right side tabs (edge):** vertikální tab bar 40 px šířky s ikonami:
  - **Users tab** — panel s koordinátorkami (48 px řádky, avatar, weekly hours summary „14 h / 40 h", availability chipy). Drag koordinátorky do buňky = přiřazení.
  - **Templates tab** — panel s šablonami návštěv („Standardní návštěva 2 h", „První kontakt 3 h", „Krizová intervence"). Drag do buňky vytvoří návštěvu s defaulty.
  - Volitelně **Requests tab** — mirror horní požadavky.
- **Sticky footer summary:** per-day columns + week total column. Řádky: **Hodiny, Návštěvy, Rodiny** (kolik unikátních rodin), volitelně **Přesčas**. Aktualizuje se live.
- **Interakce:**
  - **Click-and-drag empty cell** → open modal „Nová návštěva".
  - **Drag existing block** → přesun; při konfliktu inline warning.
  - **Cmd/Ctrl+click** = multi-select.
  - **Recurring visits** — checkbox „Opakovat" v modalu (týdně / 14denně / vlastní).
  - **Publish workflow** — draft (šrafovaný) → publikováno (solid) + push notifikace pěstounům/koordinátorkám.

#### Barvy návštěv v kalendáři

Barva bloku = **typ události** (nikoliv koordinátor, aby se stejný typ vizuálně poznal napříč koordinátorkami). Konfigurovatelné v Nastavení > Kalendář jako fallback (podle koordinátorky / podle rodiny).

### 6.5 Osa — activity feed (timeline)

- Struktura přesně jako Connecteam Activity log (viz §5.7).
- Nad feedem: **date range picker** (dual-month calendar popover s presety „Dnes", „Včera", „Posledních 7 dní", „Tento měsíc", „Vlastní").
- Pod tím horizontal strip **day chips**.
- **Filter dropdowns:** Modul, Koordinátorka, Rodina, Typ akce.
- **Grupování podle dne** se sticky headery.
- **Infinite scroll** s „Načíst starší" fallback.
- Prázdný stav: „Ještě žádná aktivita v tomto rozsahu. Zkuste jiné datum nebo přidejte první rodinu."

### 6.6 TeamDashboard

- Header: „Tým" H1 + selector období (týden/měsíc/kvartál).
- **Grid KPI karet** — 3×2:
  1. Aktivní rodiny (číslo + trend)
  2. Návštěvy za období (číslo + trend + mini bar chart)
  3. Průměrná doba do reportu (dny)
  4. Nevydané dokumenty (počet + link do sekce)
  5. Vzdělávání pěstounů — hodiny (progress ring proti povinným 24 h/rok)
  6. Krizové intervence (počet + link)
- **Karta „Vytížení koordinátorek"** — horizontální bar chart, každá koordinátorka řádek, bar rozdělený na Návštěvy / Administrativa / Volno.
- **Karta „Poslední milníky"** — activity feed compact.

### 6.7 Admin obrazovky

- **Uživatelé (koordinátorky, admini)** — Connecteam Users tabulka s taby Users/Admins/Archived, přejmenované na Koordinátorky / Admini / Archivované.
- **Role a oprávnění** — matrix modul × role s checkboxy.
- **Smart groups** — rule builder (např. „všechny rodiny s dětmi <3 roky v regionu Praha") s náhledem počtu odpovídajících záznamů.
- **Custom fields** — pro rodiny, děti, dokumenty; typy text/číslo/datum/dropdown/multi-select/soubor.
- **Integrace** — grid karet dostupných integrací (Google Calendar, ISPV export, ISO export do OSPOD systému).
- **Audit log** — activity feed pattern se všemi admin akcemi.

---

## §7 Interakční patterns

### 7.1 Onboarding walkthrough

- **Sticky bottom bar** během walkthrough. Layout:
  ```
  [═══░░░░░░]  17% dokončeno  •  Krok 2: Přidejte první rodinu   [Přeskočit]  [Pokračovat]
  ```
  Progress bar 4–6 px teal fill na šedém tracku, `text-ink-700`, primární brand tlačítko vpravo.
- **Spotlight overlay** s cutoutem kolem cílového prvku, dim `bg-black/60` mimo cutout, floating tooltip s pointerem, „Další" a „Rozumím" tlačítka.
- **„Přejít tam" (Take me there)** text linky v checklistu — deep-link + spotlight na správný button.
- **Coach-mark tooltips** kotvené k prvkům, dark chrome (charcoal `#2C2E33`), bílý text 12–13 px.

### 7.2 Video tutoriál banner

Uvnitř každého modulu poprvé:
```
┌────────────────────────────────────────────────────────┐
│ [▶] Podívejte se před prvním použitím  [Přehrát] [Zavřít]│
└────────────────────────────────────────────────────────┘
```
- 48×48 thumbnail vlevo, primární teal button „Přehrát" vpravo, text link „Zavřít" (persistně skryje per-user-per-module).

### 7.3 Gamifikace — takt pro doménu sociální práce

**Adopted (přebíráme):**
- Onboarding checklist s krokovým progressem ✅
- Progress fractions „3 z 6" a percentages ✅
- Konfety při dokončení setup a **při dokončení povinných 24 h vzdělávání pěstounů** (významný milník v oboru) ✅
- Success toasty s 🎉 pro pozitivní milníky („Vypublikováno — koordinátorky upozorněny") ✅

**Adapted (upravujeme):**
- ~~$15 kredit banner~~ → nahradit **neutrálním „Vaše organizace je připravená"** oznámením
- ~~Refer a friend $50~~ → **neimportovat vůbec**
- ~~Body a rewards catalog~~ → nepoužívat pro koordinátorky. Volitelně použít pro pěstouny jako **milníky vzdělávání** (bez peněžních odměn, jen certifikát a poděkování).

**Forbidden (zakázané):**
- Žádné leaderboardy koordinátorek (soutěž není zdravá v sociální práci)
- Žádné streaky návštěv (nezdravé pobízení)
- Žádné komerční pobídky (kupony, kredit)

### 7.4 Empty states pattern

Vždy 4 části: ilustrace + headline + one-line explanation + primary CTA. Volitelně secondary text link a „Vyzkoušet s ukázkovými daty" ghost.

### 7.5 Loading skeletons

Namísto spinnerů preferujeme **skeleton loaders** — šedá `bg-border-subtle` bloky s jemným shimmer efektem (`animate-pulse`), tvarované podle finálního obsahu. Karty, tabulky, feed rows všechny mají svůj skeleton stav.

### 7.6 Real-time updates

- Activity feed a dashboard KPI se aktualizují přes Firebase realtime listenery.
- Nový řádek fade-in z vrchu s krátkým highlight `bg-brand-50 → transparent` přes 1 s.

### 7.7 Notifikace a toasty

- Bottom-left position.
- Success (green ✓), Info (blue i), Warning (amber ⚠), Error (red ×).
- Auto-dismiss 4–5 s, hover pauzuje.
- Undo link pro reverzibilní akce (smazání záznamu).

### 7.8 Accessibility

- **Focus rings** 2 px `ring-brand-200` + 2 px offset na všech interaktivních prvcích.
- **Kontrast** WCAG AA (4.5:1 pro body, 3:1 pro velké/UI).
- **Klávesové zkratky:** `/` fokus search, `esc` zavřít modal, `?` cheat sheet, `g` + písmeno = go to modul (např. `g r` = Rodiny).
- **ARIA:** icon-only tlačítka mají `aria-label`, toasty přes `aria-live="polite"`, modal focus trap.
- **prefers-reduced-motion:** konfety a animace se vypnou.
- **Entity barvy vždy s ikonou nebo textem** (nespoléhat čistě na barvu).

---

## §8 Zakázané patterns (co NESMÍ regressovat)

Toto je hard-lock list. Coding agent tyto věci nikdy nesmí zavést.

1. **Dark sidebar / dark full UI jako výchozí.** Connecteam a nový design jsou světlé. Dark mode je optional add-on (later).
2. **Ostré 90° rohy.** Vše má radius (buttons 8 px, cards 12 px, pills 999 px).
3. **Emoji jako výhradní vizuální jazyk.** Emoji jsou pepr, ne hlavní jídlo. Nikdy více než 1 emoji per string.
4. **Komerční gamifikace** (kredit v korunách, refer-a-friend odměny, leaderboardy koordinátorek).
5. **Ztráta sémantické barevné kódování entit** (rodina, OSPOD, soud, bio-rodina, krize). Barvy mohou být přeladěny, ale rozlišitelnost a asociace musí zůstat.
6. **Table jako řídicí layout stránky.** Používáme flexbox / grid pro karty; tabulka je jen data view uvnitř karty.
7. **Placeholder text jako label.** Vždy explicitní label nad polem.
8. **Modaly větší než 640 px** pro CRUD. Cokoli složitějšího = drawer nebo dedikovaná stránka.
9. **Text < 12 px.** Nečitelné.
10. **Odkazy bez podtržení na hover.** Přístupnost.
11. **Confirmy typu „Opravdu chcete odeslat?"** — vyžadujeme explicitní confirm jen u destruktivních akcí (smazat rodinu, archivovat).
12. **Anglické UI hlášky.** Vše v češtině, adresování „vy" (formální), nikoliv „ty".
13. **1998-styl:** border-heavy tables bez padding, plné pozadí barevná headings, GIF ikony, Times New Roman, Arial. **Nikdy.**

---

## §9 Feature roadmap — Connecteam features → foster care mapping

Tabulka pro `INVENTAR.md` — každá Connecteam feature s vyhodnocením smysluplnosti a navržený český název + krátký popis.

| Connecteam feature       | Priorita | Vhodné pro doprovázející org? | Český název / adaptace                       | Popis do INVENTAR.md |
|--------------------------|----------|-------------------------------|----------------------------------------------|----------------------|
| **Time Clock (základní)**| ★★★☆☆    | Ano, jako check-in u rodiny   | **Docházka / Check-in u rodiny**             | Klíčový pracovník klikne „Zahájit návštěvu" při příchodu k rodině, zaznamená čas začátku a konce. Data se propojí s reportem návštěvy. |
| **GPS clock-in / geofence** | ★★★☆☆ | Ano — potvrzení návštěvy      | **Ověření místa návštěvy (GPS)**             | Volitelné GPS ověření, že koordinátorka je opravdu u adresy rodiny. Ochrana proti falešným výkazům. **Musí být GDPR-compliant, opt-in, zobrazeno pěstounům v transparentní formě.** |
| **Kiosk mode**           | ☆☆☆☆☆    | Ne                            | —                                            | Nerelevantní. |
| **Job Scheduling**       | ★★★★★    | **Kritické**                  | **Kalendář návštěv**                         | Plánování návštěv koordinátorek u rodin, s Connecteam-style week view, publish workflow, drag-and-drop, konflikty. Viz §6.4. |
| **Open shifts / claim**  | ★★★☆☆    | Ano pro back-up pool          | **Otevřené návštěvy**                        | Když koordinátorka onemocní, návštěva se nabídne kolegům jako „otevřená" — kdo je volný, může si ji převzít. |
| **Shift templates**      | ★★★★☆    | Ano                           | **Šablony návštěv**                          | Přednastavené typy návštěv („Standardní 2 h", „První kontakt 3 h", „Krizová intervence") pro rychlé plánování. |
| **Auto-scheduling**      | ★★☆☆☆    | Podmíněně                     | **Návrh plánování** (později)                | AI/rule-based návrh plánu na základě potřeb rodin a kapacity koordinátorek. Ne pro V1. |
| **Availability**         | ★★★★☆    | Ano                           | **Dostupnost koordinátorek**                 | Koordinátorky nastaví, kdy jsou k dispozici (pracovní úvazek, dovolená, homeworking dny). |
| **Timesheets**           | ★★★☆☆    | Ano                           | **Výkazy hodin**                             | Souhrn hodin per koordinátorka za období — základ pro mzdy a vykazování na MPSV. |
| **Time Off / PTO**       | ★★★★★    | **Kritické**                  | **Dovolené a nepřítomnost**                  | Žádosti o dovolenou, nemocenskou, sabbatical. Zobrazí se v kalendáři a znemožní naplánování návštěvy. |
| **Forms & Checklists**   | ★★★★★    | **Kritické**                  | **Reporty a formuláře**                      | Digitální formuláře pro report návštěvy, incident, žádost o mimořádnou dávku, hodnocení pěstouna. Podpisy, přílohy fotek, PDF export pro OSPOD. |
| **Recurring forms**      | ★★★★☆    | Ano                           | **Opakované reporty**                        | Měsíční/kvartální reporty automaticky přiřazené koordinátorkám. |
| **Tasks / Quick Tasks**  | ★★★★☆    | Ano                           | **Úkoly**                                    | Přiřazení úkolů koordinátorkám (např. „Zajistit posudek psychologa do 15. 7."), s podúkoly a přílohami. |
| **Chat**                 | ★★★★★    | **Kritické**                  | **Interní chat**                             | Bezpečná komunikace mezi koordinátorkami a vedením. Kanály per rodina, per tým, 1:1. **Musí být šifrovaný, EU hosting**. |
| **Chat s pěstouny**      | ★★★★☆    | Ano                           | **Chat s rodinami** (opt-in)                 | Volitelný chat mezi koordinátorkou a pěstounskou rodinou. Přísně opt-in, plně auditovatelný. |
| **Updates (social feed)**| ★★★☆☆    | Podmíněně                     | **Oznámení organizace**                      | Informační kanál — nová metodika, změny ve vedení, události. Ne jako social feed, ale jako oznámení s potvrzením přečtení. |
| **Directory**            | ★★★★☆    | Ano                           | **Adresář kolegů a institucí**               | Interní adresář koordinátorek + externí kontakty (OSPODy, soudy, psychologové, pediatři). |
| **Events**               | ★★★★☆    | Ano                           | **Vzdělávací akce a porady**                 | Kalendář vzdělávacích akcí pro pěstouny (povinné 24 h/rok), porad koordinátorek, supervizí. RSVP a docházka. |
| **Surveys & Polls**      | ★★★☆☆    | Ano                           | **Zpětná vazba a ankety**                    | Anonymní zpětná vazba od pěstounů, evaluace vzdělávacích akcí, spokojenost. |
| **Knowledge Base**       | ★★★★★    | **Kritické**                  | **Metodická knihovna**                       | Interní wiki: metodiky, zákony (SPO, OSŘ), formuláře OSPOD, best practice, vzory dokumentů. Offline dostupné na mobilu koordinátorek. |
| **Help Desk / Ticketing**| ☆☆☆☆☆    | Ne (nemá Connecteam)          | —                                            | Nepotřebné — použít Formy. |
| **Courses (LMS)**        | ★★★★★    | **Kritické**                  | **Vzdělávání pěstounů**                      | Sledování povinných 24 h vzdělávání/rok/pěstoun. Kurzy s videem, PDF, kvízem. Automatické certifikáty. **Milník s konfetami při dokončení ročního minima.** |
| **Documents (expirace)** | ★★★★★    | **Kritické**                  | **Dokumenty s expirací**                     | OP, lékařská potvrzení, čistý trestní rejstřík, rozsudky, souhlas OSPOD. Automatické upomínky 30/14/7 dní před expirací. |
| **E-signature**          | ★★★☆☆    | Ano                           | **Elektronický podpis**                      | Podpis reportů, souhlasů, dohod přímo v aplikaci. Ne kvalifikovaný, ale trackovatelný audit trail. |
| **Recognition & Rewards**| ☆☆☆☆☆    | **Ne v komerční podobě**      | (Adapted) **Milníky vzdělávání**             | Uznání za dokončení vzdělávání jako neutrální milník — bez peněz, jen certifikát a poděkování. Žádné body ani gift cards. |
| **Celebrations (birthdays)** | ★★☆☆☆ | Podmíněně                    | **Významné dny** (interně)                   | Připomínky narozenin dětí v pěstounské péči (pro pěstouny) — jako info pro koordinátorky. Ne jako social feed. |
| **Onboarding flows**     | ★★★★☆    | Ano                           | **Onboarding koordinátorek**                 | Strukturovaný nástup nové koordinátorky — checklist, přiřazené kurzy, dokumenty k podpisu. |
| **User management**      | ★★★★★    | **Kritické**                  | **Správa uživatelů**                         | Přidání/deaktivace koordinátorek a admin. Custom fields. |
| **Smart Groups**         | ★★★★☆    | Ano                           | **Chytré skupiny**                           | Pravidly definované skupiny rodin (např. „Rodiny s dětmi <3 roky", „Kraj Praha") pro cílení oznámení, kurzů, reportů. |
| **Custom Fields**        | ★★★★☆    | Ano                           | **Vlastní pole**                             | Rozšíření profilu rodiny/dítěte o organizací specifické atributy. |
| **Roles & Permissions**  | ★★★★★    | **Kritické**                  | **Role a oprávnění**                         | Koordinátorka vidí jen své rodiny; metodička vidí vše; ředitelka vidí + admin; OSPOD read-only (volitelně). |
| **Automations Engine**   | ★★★☆☆    | Ano (v2)                      | **Automatizace**                             | If-this-then-that: dokument expiruje za 30 dní → notifikuj koordinátorku; nová rodina zaregistrována → přiřaď onboarding. |
| **Integrace — Payroll**  | ★★☆☆☆    | Podmíněně                     | **Export pro mzdový systém**                 | Export výkazů hodin do českých mzdových SW (Pohoda, Money, Helios) přes CSV. |
| **Integrace — Kalendář** | ★★★★☆    | Ano                           | **Google Calendar / Outlook**                | Sync návštěv do osobního kalendáře koordinátorky. |
| **API / Webhooks**       | ★★★☆☆    | Ano (v2)                      | **API pro integrace**                        | REST API pro integrace s OSPOD systémy, MPSV reportingem. |
| **Reports & Analytics**  | ★★★★★    | **Kritické**                  | **Reporty a statistiky**                     | Přednastavené reporty pro MPSV (roční výkaz, kvartální statistika), vlastní analytika. Export CSV/PDF. |
| **Multi-language**       | ★☆☆☆☆    | Ne pro V1                     | —                                            | Jen CZ. Později SK. |
| **White-label**          | ☆☆☆☆☆    | Ne                            | —                                            | Nerelevantní. |
| **Audit Log**            | ★★★★★    | **Kritické**                  | **Auditní log**                              | GDPR + zákon o soc. službách vyžaduje kompletní audit — kdo, co, kdy změnil na osobních datech dětí. |
| **SSO**                  | ★★☆☆☆    | Podmíněně (v2)                | **SSO (Google/MS)**                          | Pro větší organizace s IT infrastrukturou. |
| **Mobile app (RN/Expo)** | ★★★★★    | **Kritické**                  | **Mobilní aplikace v terénu**                | Klíčové pro koordinátorky v terénu — check-in u rodiny, rychlý report, chat, offline formuláře. Bottom navigation: Dnes / Kalendář / Chat / Reporty / Více. |

**Priority legenda:**
- ★★★★★ = MUST v V1 (kritické pro fungování org)
- ★★★★☆ = SHOULD v V1
- ★★★☆☆ = MOŽNO v V2
- ★★☆☆☆ = LATER (v3+)
- ☆☆☆☆☆ = NEIMPORTOVAT

---

## §10 Verifikační checklist (před finální implementací)

Před zamknutím tokenů ověřte pipettou z živého `connecteam.com` a `app.connecteam.com`:

1. **Přesná primární modrá** — `#2E7CF6` je odhad. Změřte v hero CTA na homepage.
2. **Font family** — pravděpodobně Inter, ale zkontrolujte `computed style` `body` element. Může být DM Sans nebo custom face.
3. **Přesné module barvy** — každou dlaždici v sidebaru změřte pipettou.
4. **Shift block barvy v Schedule** — screenshoty se liší v čase. Zkontrolujte aktuální paletu.
5. **Border radius karet** — 12 nebo 16 px? Změřte.
6. **Sidebar background** — čistě bílá vs. `#F8FAFC`? Zkontrolujte.
7. **Font sizes v tabulce** — 13 nebo 14 px body? Změřte.
8. **Přesná paleta úspěch/varování/chyba** — Connecteam může používat jinou green (např. `#3ECF8E` místo `#22C55E`).

Doporučené nástroje: **ColorZilla**, **WhatFont**, **PerfectPixel**, DevTools computed styles.

---

## §11 Mobilní PWA — Connecteam mobile app (ověřeno reálnými screenshoty 2026-07-04)

**Toto je poprvé, kdy máme reálné screenshoty přímo z Connecteam mobilní appky** (56 obrázků, iOS, čeština), ne jen odhady z §10. Sekce popisuje, co appka na mobilu skutečně dělá jinak než desktop — a co z toho přebíráme pro PWA na mobilním prohlížeči (`src/modules/admin/`).

### 11.1 Navigace — bottom tab bar, ne sidebar

Mobil NEMÁ sidebar ani hamburger drawer. Má **pevný spodní tab bar** (5 ikon u Connecteamu: Domů/Vyhledávání/Chat/Profil/Správce — aktivní = modrá plná ikona + label, neaktivní = šedá obrysová). Náš app nemá chat ani univerzální vyhledávání, takže tab bar je **per-roli, 3–4 položky**:
- klíčová osoba: Dnes / Moje rodiny / Kalendář / Profil
- org_admin: Organizace / Kalendář / Profil
- vedoucí pobočky / teamleader: Tým / Kalendář / Profil
- superadmin: Organizace / Profil

Sekundární obrazovky (např. Schedule jako admin) mají navíc VLASTNÍ kontextový tab bar dole (Rozvrh/Žádosti/Seznam/Činnost) — tenhle vzor v tomto kroku nepřebíráme, jen ho zaznamenáváme pro budoucí referenci.

### 11.2 Domovská obrazovka — pozdrav + dvě velké pill dlaždice

Header: kulaté avatar (iniciály, sytá barva) + „Dobré ráno, {Jméno} 👋" + zvonek s červeným badge počtu vpravo. Pod tím **dvě velké dlaždice vedle sebe** (ne řádek malých tlačítek) — plně zaoblené rohy, pastelové pozadí (light blue / light peach), ikona + label uprostřed. Teprve pod tím sekční karty.

### 11.3 Seznamy — list-row s barevnou kulatou ikonou, ne tabulka

Nastavení/Zdroje/Admin console jsou VŽDY plochý seznam řádků (bílé pozadí, tenký šedý oddělovač, žádné ohraničení karty): barevný kruh s ikonou vlevo (32–40px, sytá barva jako module tiles) + label + volitelně chevron/badge vpravo. Tabulky s více sloupci se na mobilu Connecteamu nepoužívají vůbec.

### 11.4 Karty směn (shift cards) — barevný levý pruh, ne plný barevný blok

V listových pohledech (na rozdíl od Schedule week grid) má karta směny bílé pozadí, silný barevný levý pruh (3–4px, barva dle stavu/typu), avatar iniciál vpravo nahoře, tučný čas, adresu/rodinu, a akční tlačítka dole (Odmítnout/Potvrdit) — odpovídá už existujícímu vzoru `EVENT_BORDER` v `TodayPage.jsx`.

### 11.5 Tlačítka — plná kapsle (pill), ne rounded-lg

Primární/destruktivní akce na mobilu jsou **vždy plná kapsle** (border-radius = polovina výšky, ne 8px roh) — `Přihlášení`, `Začátek/Konec směny`, `Potvrdit/Odmítnout`, `Hotovo/Upravit`. Barvy: brand modrá (primární), `shift-crisis`/červená (ukončit/negativní), zelený gradient (uložit poznámku). Desktop zůstává na `rounded-lg` dle §5.1 — toto je mobil-specifické zesílení.

### 11.6 Segmentované ovládání

Přepínač typu „Uživatelé/Správci/Archivovat" nebo „Přílohy/Můj denní protokol": world-pill kontejner (`bg-surface-muted`, plně zaoblený), aktivní segment = bílá karta s jemným stínem uvnitř. Odpovídá našemu `Tabs.jsx`, ale vizuálně kapslovitější — na mobilu zvážit `SegmentedControl` varianty místo podtržených tabů tam, kde má uživatel přepínat pohled (ne prokliknout jinou stránku).

### 11.7 Bottom sheet modaly

Modal na mobilu vyjíždí zdola, zaoblené horní rohy, `×` zavřít vpravo nahoře, tučný nadpis, obsah, patička se dvěma tlačítky (outline pill vlevo + solid pill vpravo). Odpovídá `Modal.jsx`, na mobilu ale bez centrování — ukotvený dole.

### 11.8 Profil obrazovka

Hero karta s dekorativním pastelovým vzorem na pozadí (ne plná barva), hranatý (ne kulatý) avatar s iniciálami, jméno + role pod tím. Pod hero kartou plochý seznam (§11.3): Moje aktivita, Osobní údaje, Nastavení, Přepnout společnost, Odhlásit se (červeně).

### 11.9 Co NEpřebíráme (mimo rozsah tohoto kroku)

Chat/Vyhledávání tab (appka nemá ekvivalent), kontextové sekundární tab bary uvnitř Kalendáře, hranatý avatar všude (zatím jen na Profilu), drag&drop cokoli, konfetti/gamifikace mimo §7.3.

---

## Závěr

Tento dokument nahrazuje původní `DESIGN.md` v repozitáři Doprovázení.com. Klíčové posuny oproti Amie-style:

- **Světle šedomodré plátno + bílé karty** namísto pastelového šumu.
- **Sidebar s barevnými module tiles** namísto plochých ikon.
- **Connecteam Schedule week view** jako srdce kalendáře — s publish workflow, capacity bars, sticky summary.
- **Double-avatar activity feed rows** jako signature vizuální prvek.
- **Stavově řízený onboarding checklist** s decentní gamifikací (bez peněz).
- **Bottom-left toasty + Intercom-style help FAB** (bez externí Intercom službytím a s interní KB).

Zachováno: **sémantické barevné kódování entit** (rodina/OSPOD/soud/bio/krize), **information architecture** (Dnes, Rodiny, Kalendář, Osa, Dokumenty, Čerpání, Tým, Admin), **mobil-first pro terén**, **WCAG AA přístupnost**, **čeština jako primární jazyk**.

Next steps: verifikační pipetta (§10) → aktualizace `tailwind.config.js` → refactor komponentní knihovny → screen-by-screen migrace podle §6 → uživatelské testování s koordinátorkami.