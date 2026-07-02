# Checklist: AI na OSTRÉ verzi přes Vertex AI EU (přechodové řešení)

> Použij, než pustíš AI na **reálná data dětí**. „Most" mezi demem (free Gemini)
> a cílovým self-hostem. Bez splnění bodů 1–6 reálná data NEpouštět.
> Aplikace se nemění — `App.AI` volá proxy; jen vyměníš proxy demo → `apps-script-ai-proxy-vertex-eu.gs`.

## A. Právní / GDPR (ČR) — POVINNÉ před reálnými daty
- [ ] **1. Vertex AI EU + billing.** GCP projekt, zapnuté Vertex AI API, fakturace (placené = Google netrénuje na datech). Region `europe-west3` (Frankfurt) nebo jiný EU.
- [ ] **2. DPA.** Přijatý **Google Cloud Data Processing Addendum** (Google = zpracovatel). Ověřit seznam sub-zpracovatelů.
- [ ] **3. DPIA** (čl. 35 GDPR) — u dat dětí prakticky povinné. Posoudit rizika + opatření, případně konzultace s ÚOOÚ.
- [ ] **4. Právní titul + souhlasy.** Ujasnit titul zpracování (SPOD/zákonná povinnost vs. souhlas), informovat subjekty (pěstoun, dítě 12+) o použití AI, možnost odmítnout.
- [ ] **5. Záznamy o činnostech zpracování** (čl. 30) — doplnit AI zpracování (účel, kategorie, příjemce = Google EU, lhůty).
- [ ] **6. Region/residency doložitelně.** Volat výhradně regionální EU endpoint (proxy to dělá); žádný přenos do USA.

## B. Technika (defense-in-depth)
- [ ] **7. Pseudonymizace před odesláním** — nahradit jména dětí/pěstounů, adresy, RČ tokeny (`DÍTĚ_1`, `RODINA_A`) **na straně appky/serveru**, po návratu dosadit zpět. (Vertex je sice EU+DPA, ale minimalizace dat = best practice. V8: udělat v `App.AI` před `_call`.)
- [ ] **8. Proxy mimo Apps Script (doporučeno pro ostro).** Ideálně malá **EU funkce** (Cloud Run/Vercel EU), ať i tranzit běží v EU a lze řídit IAM/secrets. Apps Script jako rychlý most akceptovatelný, ale ověř region exekuce.
- [ ] **9. Audit AI akcí** — logovat kdo/kdy/model/akce (ne plný obsah, jen referenci) do `ai_actions` (viz plán V8 §7).
- [ ] **10. Retence + výmaz** — AI výstupy a logy mazat dle politiky; právo na výmaz čistí i případné embeddingy.
- [ ] **11. Limity nákladů** — rozpočtový alarm v GCP, strop „AI kreditů" per organizace.

## C. Provoz / produkt
- [ ] **12. Human-in-the-loop** — AI jen navrhuje, KO kontroluje a schvaluje/podepisuje (už hotovo: disclaimer + editovatelný report).
- [ ] **13. Opt-in per organizace** + možnost AI vypnout (přepnutím na mock / prázdný endpoint).
- [ ] **14. Vždy fallback** — když proxy selže, appka padá na mock (už hotovo).

## Náklady (orientačně)
- Vertex `gemini-1.5-flash` v EU — velmi levné (haléře za běžné volání), škáluje s objemem.
- Lze čerpat z **Google Cloud kreditů pro neziskovky** (přes Google for Nonprofits / TechSoup).

## Migrace na cíl (self-host)
- Až dozraje self-host v EU/ČR: stačí přesměrovat proxy/endpoint na vlastní model — **appka beze změny** (kontrakt `structure`/`report` zůstává). Viz `pritomnost-ai-plan-v8.md`.

---
*Soubory: demo = `apps-script-ai-proxy.gs` (free, jen fiktivní data) · ostrá = `apps-script-ai-proxy-vertex-eu.gs` (EU, reálná data po splnění A1–A6).*
