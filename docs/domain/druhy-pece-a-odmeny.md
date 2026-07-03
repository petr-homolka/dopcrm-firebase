# Druhy pěstounské péče, odměna pěstouna a SPVPP

Zdroje: MPSV (mpsv.cz — SPVPP §47d), zákon č. 359/1999 Sb. o sociálně-právní ochraně dětí
(§47b dohoda o výkonu PP, §47j odměna pěstouna), zákon č. 89/2012 Sb. (NOZ) §958–970
pěstounství. `zakonyprolidi.cz` blokuje automatizované čtení (403) — ustanovení ověřena
přes MPSV/ÚP a komentované znění na Kurzy.cz.

## Svěření dítěte do pěstounské péče — vazba dítě↔pěstoun

Soudní rozhodnutí o svěření odkazuje na **1 nebo 2 osoby** — společnou pěstounskou péči
mohou mít **jen manželé** (§958 odst. 2 NOZ). Vazba dítě↔pěstoun je strukturovaný objekt,
ne prosté ID:

```
custody: {
  type:        'individualni' | 'spolecne',   // 1 nebo 2 pěstouni (jen manželé)
  caregivers:  [uid, ...],                    // 1 nebo 2 položky
  court:       string,                        // který soud rozhodl
  caseNumber:  string,                        // spisová značka
  decidedAt:   timestamp,
}
```

U společné PP mají oba manželé **stejná práva a povinnosti k dítěti** (viz `legalWeight:
'pecujici'` v `vztahy-a-osoby.md` pro OBA). Odměnu (viz níže) i tak pobírá jen jedna osoba
(nebo je rozdělená), a dohodu o výkonu PP podepisují oba (viz níže) — to jsou samostatná,
nezávislá pravidla, ne odvozená ze svěření.

## Druhy pěstounské péče (PP)

- **Pěstounská péče na přechodnou dobu (PPPD)** — dočasná, zpravidla max. cca 1 rok; dítě je
  svěřeno na krizové období, než biologičtí rodiče upraví poměry. Pěstoun je veden jako
  „osoba v evidenci“ — v pohotovosti i bez aktuálně svěřeného dítěte.
- **Dlouhodobá pěstounská péče** — dělí se na:
  - **příbuzenskou** (pěstoun je příbuzný nebo osoba dítěti blízká),
  - **nepříbuzenskou** (pěstoun je pro dítě cizí osoba, zprostředkovaná krajským úřadem).

(Mimo tento model: poručnictví a svěření do péče jiné osoby — jiné právní instituty, systém je
neřeší jako pěstounskou péči.)

## Odměna pěstouna — klíčové pravidlo

- **PPPD (osoby v evidenci) mají nárok na odměnu, i když právě nemají žádné svěřené dítě** —
  jsou v pohotovosti. Výše se odvíjí od koeficientu minimální mzdy a počtu/zdravotního stavu
  dětí.
- **Dlouhodobá (zprostředkovaná, nepříbuzenská) péče** — odměna náleží **jen po dobu**, kdy má
  pěstoun dítě skutečně svěřené.
- **Příbuzenská péče** — typicky jde spíš o „příspěvek při pěstounské péči“ (násobek životního
  minima), opět jen po dobu svěření.
- **Dohoda o výkonu pěstounské péče může existovat i před svěřením dítěte / bez dítěte**,
  zejména u PPPD.

Z toho plyne požadavek na datový model: druh péče a nárok na odměnu se musí dát evidovat **na
úrovni pěstounské domácnosti**, ne jen odvozovat z toho, jestli má aktuálně svěřené dítě —
jinak PPPD v mezidobí bez dítěte ztratí svůj typ péče.

### Kdo odměnu pobírá u společné PP (§47j zákona č. 359/1999 Sb.)

Výchozí stav: odměnu pobírá **jen jedna osoba** — určí ji dohodou manželé sami, a
nedohodnou-li se, určí ji krajská pobočka Úřadu práce. **Výjimka:** manželé, kteří jsou
oba osobou pečující, mohou společně požádat ÚP o rozdělení odměny **na polovinu pro
každého**.

Datový model nese plnou strukturu, MVP ale implementuje jen výchozí stav:

```
remuneration: {
  mode:       'single' | 'split50',   // MVP: jen 'single' má formulář a logiku
  recipients: [uid, ...],             // 'single' => 1 položka, 'split50' => 2 položky
}
```

- **MVP (teď):** formulář a veškerá logika (výpočty, výplatní podklady) pracují jen s
  `mode: 'single'`. `split50` se v datech umí uložit a v UI **jen zobrazit jako štítek**
  („Odměna rozdělena na polovinu — správa ve V-next"), bez editačního formuláře.
- **V-next:** formulář pro `split50` (žádost, schválení ÚP, výpočet poloviny pro každého).

### Dohoda o výkonu pěstounské péče — kdo podepisuje (§47b zákona č. 359/1999 Sb.)

Výchozí stav je opačný, než by se dalo čekat: jsou-li osobou pečující **manželé, dohodu
uzavírají VŽDY společně jako jedinou dohodu** — bez ohledu na to, kolik dětí mají svěřeno
nebo zda je mají svěřeno společně. Oddělené dohody jsou **výjimka**, ne pravidlo: platí jen
když manželé prokazatelně nežijí spolu alespoň 3 měsíce a obecní úřad obce s rozšířenou
působností o tom na žádost jednoho z manželů rozhodne.

```
agreement: {
  scope:       'spolecna' | 'oddelena',
  signatories: [uid, ...],            // 'spolecna' => oba manželé, 'oddelena' => 1
  separationDecision: {               // jen u 'oddelena' — povinné
    authority:  string,               // obecní úřad, který rozhodl
    decidedAt:  timestamp,
  } | null,
}
```

`scope: 'oddelena'` bez vyplněného `separationDecision` je neplatný stav (rules i UI
validace) — bez evidovaného rozhodnutí obecního úřadu se předpokládá `spolecna`.

## SPVPP (státní příspěvek na výkon pěstounské péče)

- **59 400 Kč za kalendářní rok, na jednu dohodu o výkonu PP** (platí od roku 2023). Vyplácí se
  doprovázející organizaci (DO)/úřadu, který dohodu uzavřel. Počítá se poměrně (1/12 za
  každý měsíc trvání dohody).
- **Je to částka per dohoda, ne per dítě.** Pokud aplikace pracuje s rozpočtem „na dítě“
  (např. pro sledování čerpání na tábory, doplatky, drobné výdaje), jde o **interní rozpočtový
  koncept organizace**, ne o legislativní SPVPP — tyto dvě věci se nesmí zaměňovat v UI ani
  v datovém modelu.

## Respit (odlehčovací volno pěstouna)

Zákonné minimum dle §47a zákona č. 359/1999 Sb. Eviduje se na úrovni domácnosti (ne dítěte) —
klíčové jsou dvě odlišné metriky:
- **vykázaný respit** — součet dní jednotlivých vykázaných respitních událostí,
- **reálný odpočinek** — průnik dní, kdy jsou *všechny* svěřené děti mimo domácnost současně.

Nadstandard nad zákonný limit se řeší individuálním plánem ochrany dítěte (IPOD) a eviduje se
zvlášť, nezapočítává se do zákonného čerpání.

## Vzdělávání pěstounů (návazná metrika)

Zákonné hodiny dalšího vzdělávání: **24 hodin/rok** pro dlouhodobou a přechodnou (PPPD) péči,
**18 hodin/rok** pro příbuzenskou péči. Sledování plnění je provozně důležitá metrika napříč
celou organizací (kdo je „pod plánem“), ne jen údaj na kartě pěstouna.
