# Životní cyklus dokumentu (CLM)

Dokumenty v systému (souhlasy, poučení, zprávy pro OSPOD, předávací protokoly, základní
dohoda o výkonu pěstounské péče...) procházejí definovaným životním cyklem se stavy, verzemi,
kolaborací mezi klíčovou osobou (KO) a pěstounem, a auditovatelným podpisem.

## Stavy dokumentu

`koncept (draft) → ke sdílení/vyjádření (review) → okomentováno (commented) →
k podpisu (to_sign) → podepsáno (signed) → navrženo pozastavení (suspend_proposed) →
pozastaveno (suspended) → navrženo ukončení (term_proposed) → ukončeno (terminated)`

## Kolaborace KO ↔ pěstoun

Dokument se mezi KO a pěstounem může posílat tam a zpět opakovaně, vždy dohledatelně:
- KO sdílí dokument s pěstounem k vyjádření (stav se změní na „ke sdílení“),
- pěstoun odešle své vyjádření/komentář (nemusí rovnou podepisovat),
- KO zapracuje připomínky a vytvoří **novou verzi** — verze se zvyšuje, předchozí verze zůstává
  jako snímek v historii, ne přepsaná.

## Dodatek vs. nový dokument

Rozlišují se dva různé vztahy mezi dokumenty:
- **dodatek** — navazuje na již podepsaný dokument, je s ním svázaný (např. dodatek ke
  smlouvě),
- **odvozený nový dokument** — vznikl z existujícího jako vzor/inspirace, ale je to
  samostatný dokument bez právní vazby na původní.

## Pozastavení a ukončení = vždy návrh → schválení

Pěstoun **nemůže sám** dokument pozastavit ani ukončit — může to jen **navrhnout**. KO dokument
navrhuje pěstounovi stejně tak. Teprve KO schválení dokončí:
navrh → schválení KO → finalizace (ukončení dokumentu zruší platnost podpisů) / obnovení
z pozastavení.

**Základní dohoda o výkonu pěstounské péče je vždy uzamčená pro online úpravy** — nelze ji
online editovat, podepsat ani vypovědět. Existuje **pouze ve fyzické podobě**; systém řídí a
eviduje procesy kolem ní (viz workflow katalog, WF-1/WF-2), ale samotný dokument v elektronické
podobě nikdy nevzniká jako závazný.

## Podpis

- Podpis se pořizuje jako **elektronický podpis** (typicky prstem na dotykovém displeji) —
  právně jde o elektronický podpis dle nařízení eIDAS (č. 910/2014).
  - Holý obrázek podpisu má **slabou důkazní váhu**. Proto se k podpisu vždy váže **dynamický
    biometrický záznam** (body křivky podpisu + čas pořízení) a **auditní stopa** — tato
    kombinace posouvá důkazní hodnotu směrem k zaručenému elektronickému podpisu (AES, čl. 26
    eIDAS).
  - Kvalifikovaný elektronický podpis (QES) nebo ověření přes bankovní identitu (BankID/NIA)
    je určen pro dokumenty s vysokým rizikem/důležitostí — volitelné rozšíření, ne
    povinná součást každého podpisu.
- Každý podpis nese: jméno podepisujícího, jeho roli, čas, kryptografický otisk dokumentu
  v době podpisu a (je-li použito) potvrzení bankovní identity.
- Dokument může mít **více podepisujících** (např. oba pěstouni v domácnosti).

## Důkazní protokol

Pro účely dokazování před OSPOD/soudem musí být k dokumentu dostupný **důkazní protokol**:
chronologický přehled všeho, co se s dokumentem stalo — úpravy, komentáře, verze, podpisy —
včetně toho, kdo a v jaké roli danou akci provedl. Klíčová vlastnost: záznamy jsou
**řetězeny kryptografickým otiskem** (každý další záznam obsahuje otisk předchozího), takže
jakýkoli zpětný zásah do historie je zjistitelný (tamper-evidence). Protokol musí jít
vytisknout/exportovat jako PDF. Významné události z historie dokumentu se zrcadlí i do časové
osy příslušné rodiny/dítěte, aby byly vidět v kontextu ostatního dění.

## Sdílení mimo systém

Odeslání dokumentu ven (pěstounovi, OSPOD, jiné organizaci) preferuje **nativní sdílení
zařízení** (systémový share sheet), aby fungovalo se všemi kanály, které si uživatel na svém
telefonu/počítači sám zvolí (e-mail, WhatsApp, datová schránka apod.), místo pevně
naprogramovaného seznamu kanálů v aplikaci. Odeslání do datové schránky je zvláštní případ —
vyžaduje ID schránky příjemce a sledování stavu doručenky.

## Do V8 (otevřené)

WORM úložiště pro uzavřené dokumenty, reálné kvalifikované časové razítko (TSA), reálné
generování PDF/náhledů kancelářských formátů, řízení pořadí více podepisujících, granulární
práva pro omezený (pěstounský) pohled na dokument.
