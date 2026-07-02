# Vztahy a osoby — rodičovství dle práva ČR

Model vztahů mezi osobami v systému musí respektovat české rodinné právo (zákon č. 89/2012
Sb., §775–793), ne jen intuitivní „matka/otec“.

## Klíčové právní principy

- **Otec = vždy muž zapsaný v rodném listě (RL).** Určuje se ve třech po sobě jdoucích
  domněnkách: manžel matky → souhlasné prohlášení rodičů → rozhodnutí soudu. **Práva k dítěti
  má jen rodič zapsaný v RL.** Chybí-li otec v RL, dítě podle systému otce nemá (byť biologicky
  existovat může).
- **Matka = žena, která dítě porodila** (§775, zásada „mater semper certa est“). Mateřství nelze
  smluvně měnit. Výjimky:
  - odložené dítě (babybox, utajený/anonymní porod, útěk z porodnice) → matku určí soud fikcí,
    nebo záznam zůstává neurčený až do osvojení (žena se pak stává **osvojitelkou**, ne
    pěstounkou);
  - náhradní mateřství → žena, která porodila, je matkou v RL; genetická matka (dárkyně vajíček)
    musí dítě **osvojit**, aby získala rodičovská práva.
- Změnu otce v RL může provést jen soud: nejdřív **popření** otcovství, pak **určení** nového
  otce (typicky dle DNA testu). Soud nemusí popření vyhovět, pokud by to bylo v rozporu
  s **nejlepším zájmem dítěte** (např. sociální otec o dítě dlouhodobě pečuje) — domnělý
  biologický otec pak může žalovat o určení otcovství samostatně.

## Typy vztahů (číselník)

Vztah osoby k dítěti se eviduje strukturovaně (klíč, skupina, popisek, právní status,
nápověda), ne volným textem. Právní status (`legal`) nabývá hodnot:
- **má práva** — rodič zapsaný v RL, nebo osvojitel,
- **bez práv** — domnělý/pravděpodobný biologický rodič, nevlastní rodič, rodič mimo RL,
- **zákonný zástupce** — poručník, opatrovník (práva bez rodičovství),
- **netýká se** — sourozenci a širší rodina (evidují se kvůli vztahům, ne kvůli právům).

Skupiny číselníku:
- **Otec:** v RL · sociální (v RL, nebiologický) · biologický otec pravděpodobný ·
  biologický otec domnělý · nezapsán/neznámý · otcovství popřeno.
- **Matka:** v RL · biologická mimo RL · určena fikcí/soudem · adoptivní · genetická
  (dárkyně) · náhradní.
- **Osvojitel / poručník / opatrovník.**
- **Sourozenci:** vlastní (shodná matka i otec) · polorodý (shodný jen jeden rodič) ·
  nevlastní (bez shodného rodiče, žijí ve společné domácnosti).
- **Širší rodina:** prarodiče, teta, strýc a další.

Rozhraní pro zadání vztahu vede uživatele číselníkem po skupinách s nápovědou u každé
položky, a nabízí průvodce „pomoct s otcem“ (pár otázek → navrhne správný právní status —
pravděpodobný/domnělý/sociální).

## Rodné číslo jako primární identifikátor osoby

Rodné číslo (RČ), ne jméno, je primárním identifikátorem osoby v systému — je celoživotně
stálé i při změně jména. Veškeré automatické párování osob (např. rozpoznání sourozenců
napříč různými pěstounskými rodinami, obousměrné doplňování vztahů) musí jít **primárně přes
RČ**; jméno je jen záložní srovnání, pokud RČ chybí. Stejné jméno s odlišným RČ se nesmí
automaticky propojit.

Z toho plynou dvě navazující pravidla:
- **Auto-rozpoznání sourozenců:** pokud dvě děti v systému (třeba i v různých pěstounských
  rodinách) sdílí RČ biologického rodiče, systém je nabídne jako sourozence a odvodí typ
  vztahu (vlastní/polorodý/nevlastní) podle toho, kolik rodičů mají společných.
- **Obousměrné zápisy:** přidání příbuzného/sourozence u jednoho dítěte, pokud je ten
  příbuzný sám evidovaný jako dítě v systému, musí zapsat odpovídající reciproční vazbu
  i u něj — ne jen jednosměrně.

## Otevřené pro V8

Historie změn zápisu v RL (popření/určení otcovství) s důkazní stopou; automatické
propojování sourozenců i přes shodu otce (dnes jen přes matku bývá spolehlivější, protože
otec může v RL chybět).
