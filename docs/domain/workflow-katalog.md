# Workflow katalog — Doprovázení CRM

Katalog procesů, které systém musí podporovat kolem životního cyklu pěstounské rodiny a
doprovázející organizace (DO). Zdroj pro budoucí Návod/FAQ i pro návrh datového modelu.
Stav u každého WF vychází z ověřeného chování ve vanilla prototypu — v React implementaci
zatím nic z tohoto nemusí existovat, viz `docs/INVENTAR.md`.

## WF-1 · Exit pěstouna (výpověď základní smlouvy o doprovázení)

**Fáze rodiny:** `active → protected → exit_proposed → exit_approved → exiting → exited (archiv)`
(+ vedlejší stav `returning`).

Základní dohoda o výkonu pěstounské péče se uzavírá a ruší **pouze fyzicky** — systém proces
kolem ní jen řídí, sám dohodu online neukončuje.

1. **Iniciace:** pěstoun nebo klíčová osoba (KO) podá **návrh** na ukončení. Pěstoun sám
   ukončit nemůže, jen navrhuje.
2. **Schválení** KO/vedením spustí **přechodné období** (default 60 dní, viz WF-2).
   Připomínka: fyzicky podepsat výpověď.
3. **Během přechodu** má pěstoun omezené možnosti (většina záznamů read-only), hledá si novou
   DO. Respit/SPVPP se dočerpá.
4. **Exit pack** (viz WF-3a) se vygeneruje a odešle. Hlášení jde na OSPOD každého dítěte,
   případně krajský úřad a soud.
5. **Finalizace** po uplynutí lhůty → rodina se **zneviditelní** z běžných seznamů, ale zůstává
   **dohledatelná v archivu** (OSPOD/soud se může zeptat i roky zpět).

## WF-2 · Ochranná lhůta

Nastavuje se **už při podpisu základní smlouvy** (default +90 dní od podpisu), ne až při
zahájení exitu. V ochranné lhůtě má pěstoun omezené možnosti (nemůže např. spustit okamžitý
odchod) — exit se dokončí až po jejím uplynutí. Důvod: dát čas najít novou DO a nepřerušit
péči o dítě skokově.

## WF-3 · Předání nové doprovázející organizaci (data handover)

**3a. Exit pack** — tři adresáti:
- **pěstoun** — potvrzení o ukončení, přehled vzdělávání, kontakty,
- **OSPOD/soud** — oficiální hlášení,
- **nová DO** — předávací minimum.

**3b. Souhlas po kategoriích dat** (rozhoduje KO/vedení), matice předání:
- **povinně sdílet:** absolvované vzdělávání (kde/jaké/kolik hodin), čerpání respitu, základní
  identifikace dětí, typ péče;
- **default nepředávat:** soukromé poznámky KO z časové osy (deníky, pocity), interní
  hodnocení;
- **volitelné** (KO zaškrtne): dokumenty, kalendář, detail SPVPP.

Úrovně předání: plná / omezená / základní / definovaná KO.

**3c.** Pokud je nová DO v systému, lze předat spis elektronicky (stejná matice kategorií);
pokud není, jde o export souborem (PDF/CSV/XML/ZIP).

## WF-4 · Dotaz externí DO před podpisem

Externí DO se může na pěstouna zeptat **dříve, než s ním podepíše**. Eviduje se jen
**„kontakt ze strany externí DO — bez podrobností“** (jméno DO, datum, kdo přijal) — žádná
data o pěstounovi ven. Teprve po podpisu nové DO může požádat o skutečná data (→ WF-3).

## WF-5 · Návrat pěstouna

Ukončený pěstoun se chce vrátit. Navrhne návrat → vedení buď **schválí** (vznikne nová aktivní
smlouva, fyzicky podepsaná) nebo **odmítne** (důvod jde do auditu). Historie z archivu se
připojí k nové kartě.

## WF-6 · Mimořádné pozastavení / podezření na ohrožení dítěte

Rodina se okamžitě přepne do `protected` + příznak `investigating`, notifikace jde vedení a
OSPOD. Uzavření šetření rodinu z vyšetřovaného stavu vrátí.

## WF-7 · Zletilost dítěte / odchod z péče

Viz „Životní cyklus dítěte“ — zletilost vede na uzávěrku SPVPP a závěrečnou zprávu.

## WF-8 · Úmrtí (role-aware)

Důsledky se liší podle role zemřelého:
- **dítě** → stav zemřelo, uzávěrka SPVPP, závěrečná zpráva, hlášení OSPOD/soud;
- **pěstoun** → spis se zmrazí a chrání, **všechny svěřené děti přejdou do stavu navrženo
  k přemístění** (rozhoduje soud);
- **klíčová osoba** → všechny její rodiny **převezme jiná KO**, vše auditováno.

## WF-9 · Zánik / fúze doprovázející organizace

Hromadný převod všech aktivních rodin na nástupnickou DO.

## WF-10 · GDPR retence a skartace

Retenční lhůta po archivaci: **15 let**. Po uplynutí lhůty se domácnost anonymizuje. Systém
musí hlídat blížící se i propadlé lhůty.

## WF-11 · Žádost subjektu údajů (GDPR čl. 15–17)

Žádost o přístup / opravu / výmaz se eviduje s **lhůtou 30 dní** na vyřízení a zapisuje do
časové osy rodiny.

## WF-12 · Důkazní balíček pro spor (OSPOD/soud)

Agregace všech dokumentů, podpisů a dětí rodiny do jednoho read-only balíčku, navazuje na
důkazní protokol dokumentu (viz `dokumenty-clm.md`).

## WF-13 · Změna klíčové osoby (interní předání spisu)

Změna odpovědné KO u rodiny, s předávacím protokolem; historie zůstává zachována u rodiny.

## WF-14 · Sloučení duplicit kontaktů

Duplicitní kontakt se sloučí do ponechaného — jeho dokumenty se přesunou, historie obou
zůstává dohledatelná, akce je auditovaná.

## WF-15 · Ad-hoc / vlastní workflow

Když případ nezapadá do žádného předdefinovaného WF, KO/vedení si **poskládá vlastní
pojmenovaný postup** (seznam kroků), uloží ho k opakovanému použití, aplikuje na konkrétní
rodinu a postupně odškrtává kroky (auditováno).

## WF-16 · Rozvod pěstounů se společnou PP

**Spouštěč: nové soudní rozhodnutí o svěření dítěte**, vydané ještě PŘED samotným
rozvodem — soud nerozvede manžele, kteří jsou společnými pěstouny, dokud nejsou upravena
práva a povinnosti pěstounů pro dobu po rozvodu (dítě zůstává v mezidobí svěřené oběma,
viz `druhy-pece-a-odmeny.md`, §958 NOZ).

1. **Svěření zůstane jen jednomu** z manželů → vazba dítě↔pěstoun u druhého manžela
   zaniká (mění se z `legalWeight: 'pecujici'` na `'bez_prav'`, viz `vztahy-a-osoby.md`);
   dítě zůstává s tím, komu bylo svěřeno. Rozvod manželství společnou PP manželů
   automaticky ukončuje, i bez výslovného dodatečného rozhodnutí.
2. **Svěření zůstane oběma** (výjimečně, střídavá péče po rozvodu) → `custody.type`
   zůstává `'spolecne'`, ale manželství skončilo → dohoda o výkonu PP (`agreement`) se
   musí přehodnotit na `scope: 'oddelena'` s evidovaným rozhodnutím obecního úřadu
   (podmínka 3 měsíců odděleného soužití se u rozvedených považuje za splněnou).
3. **Odměna (`remuneration`)** se přehodnotí: byla-li `split50`, rozdělení zaniká spolu
   se zánikem manželství — přechod na `mode: 'single'` s příjemcem tím, komu zůstalo
   svěřeno (nebo oběma jako dvěma samostatným domácnostem, řeší se case-by-case s ÚP).
4. Zapsat **systémový záznam** do timeline rodiny (`type: 'system'`, dle `timeline.md`)
   s lidsky čitelným popisem nového rozhodnutí a jeho dopadu na svěření/odměnu/dohodu.

## Checklisty (terénní sběr KO)

Účel: KO rychle a bez komplikací **sbírá informace** (kdo je přítomen, jaká je situace) —
**nedělá závěry**. Slouží jako podklad pro reporty, ukládá se do časové osy rodiny.

Vestavěné šablony: obecná (krátká, na každou návštěvu), škola/učitel, volný čas, biologická
rodina, sousedé/okolí, rozhovor s dítětem, lékař/zdraví, OSPOD/jednání s úřadem, krizová/
mimořádná návštěva, soud/opatrovnické jednání, vzdělávání pěstouna — a k tomu možnost KO
založit si **vlastní šablonu** (typy otázek: výběr z možností, ano/ne, příznak, volný text,
„kdo je přítomen“).

---

**Mapování na obrazovky (orientační, z prototypu):** exit/převod/archiv mají společnou
domovskou obrazovku s kartou rodiny (stav, ochranná lhůta, dostupné akce, exit pack, matice
předání, dotazy externích DO, návrat). Detail rodiny/kontaktu ukazuje stavový pruh (ochranná
zóna / v přechodu / archiv) se zkratkou do exit procesu. Nastavení organizace řídí délku
ochranné lhůty, výchozí matici předání a skartační lhůty.
