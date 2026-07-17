# 04 — Jak funguje mobil

## Filozofie (závazná)

Mobil NENÍ responsivní web. Je to **samostatná „nativní" aplikace** ve
vlastní vrstvě `src/mobile/` s vlastními primitivy a vlastní vizuální
identitou (aktuálně iOS feel: modrá #007AFF, Noto Sans, spodní tab bar dle
Apple HIG — 49pt + safe-area, ikony 26px, labely 10px). Aktivuje se
<1024px přes `useIsMobile()`; `Responsive.jsx` vybírá komponentu per route.
ŽÁDNÉ sdílené JSX s desktopem, žádné `lg:` breakpointy v jedné komponentě.

Instalovatelná PWA (manifest + service worker přes vite-plugin-pwa,
auto-update bez zavření appky).

## Primitivy `src/mobile/ui/` (skládej VÝHRADNĚ z nich)

`MobileShell` (tab bar per role + ActiveVisitBanner), `MobileTopNav`
(vč. variant="hero"), `NativeHero` + `HeroBody` (modrý hero blok, obsah
najíždí zaoblenou hranou — „Lidl vzor"), `NativeButton` (pill),
`NativeSheet` (bottom-sheet modal), `NativeSegmented`, `NativeFormRow` +
`NativeFormGroup` + `RowInput/RowSelect/RowTextarea` (horizontální
label-vlevo/hodnota-vpravo formuláře; `stacked` pro textarey),
`NativeInfoRow` (read-only tabulka údajů), `NativeListRow`, `NativeCard`,
`NativeBits` (NativeChip, SectionLabel, NativeEmptyState, NATIVE_EVENT_BORDER),
`NativeSwitch`, `NativeFab`, `NotificationBell`.

Závazná mobilní spec: DESIGN.md §12 (typo škála 10/12/13/15/17/22/56, 16px
inputy proti iOS zoomu, radius native-card 18 / native-input 10 / pill,
ŽÁDNÁ zelená, žádné stíny, 1px separátory).

## Obrazovky zaměstnance (role klicova_osoba…)

- **Dnes** (`MobileHomeScreen`) — pozdrav, 2×2 quick actions, dnešní program,
  detail události v sheetu.
- **Rodiny** (`MobileFamiliesScreen` + `MobilePeopleTabs`) — segmenty
  Rodiny/Pěstouni/Děti, hledání, seskupování (město/termín/druh PP).
- **Kalendář** (`MobileCalendarScreen`) — swipe pás dnů (týdny prstem),
  hodinový rozvrh dne 7–19 (prázdná hodina = tap → nová událost
  s předvyplněným časem), FAB, detail/úprava/smazání v sheetech.
- **Detail rodiny** (`MobileFamilyDetailScreen`) — hero + taby: Osa (výchozí,
  s FAB časomíry), Pěstouni, Respit, Sociální, Děti, Chat, Dokumenty.
- **Detail dítěte** (`MobileChildDetailScreen`) — hero + 8 segmentů (Identita,
  Škola, OSPOD a soud, Biologická rodina, Sociální prostor, Poznámky,
  Historie, Účastníci) — sdílí hooky s desktopem, JSX vlastní.
- **Časomíra návštěvy** (`MobileVisitTimerScreen`) — Giant Timer (modrá
  karta), GPS poloha při startu, po ukončení zápis do osy (délka, poznámka);
  rozjetá návštěva žije v localStorage + persistentní banner v shellu.
- **Dokument detail**, **Účastník detail + PermissionGrantSheet**,
  **Oznámení**, **Profil**, **Nastavení** — mobilní verze desktop funkcí.

## Pěstounská appka `/moje/*` (role pestoun)

Taby Domů / Chat / Profil. `FosterHomeScreen` (moje děti read-only, dokumenty
ke schválení), `FosterChildScreen`, `FosterChatScreen` (jen úroveň `foster`,
jednosměrně KO), `FosterDocumentScreen` (schválit / okomentovat dokument).
Přihlášení: magic link (`MagicLinkScreen` na `/prihlaseni` — dokončí
sign-in z e-mailu a bootstrapne profil z pozvánky).

## Appka externího účastníka `/ucastnik/*` (role external)

`EPHomeScreen` — vidí VÝHRADNĚ svá aktivní oprávnění (výchozí = nic),
každé přihlášení se audituje; `EPAuditScreen` — vlastní auditní historie.
Gated data-views (skutečné dokumenty/osa dle grantů) jsou TODO — viz kap. 11.

## Mobilní i18n — ROZPRACOVÁNO

Stav: 7 souborů převedeno na `t('m.*', 'default')` (Home, Families,
FamilyDetail, ChildDetail, Respit, Calendar, Timeline-částečně), zbytek
(~30 souborů) má natvrdo češtinu. Vzor a pravidla: kap. 12. Idempotentní —
už obalené řetězce nech být.
