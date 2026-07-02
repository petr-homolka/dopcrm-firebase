# Druhy pěstounské péče, odměna pěstouna a SPVPP

Zdroje: MPSV (mpsv.cz — SPVPP §47d), zákon č. 359/1999 Sb. o sociálně-právní ochraně dětí.

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
