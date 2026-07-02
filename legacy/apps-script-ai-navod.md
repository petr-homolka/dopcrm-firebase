# Návod: zapnout reálnou AI v demu (Google Apps Script + Gemini)

> Zdarma, využívá tvůj Google účet. **Jen pro demo s fiktivními daty** — Gemini free tier
> může prompty využívat ke zlepšování modelů. Reálná data dětí až self-host / Vertex AI EU.

## 1. Získej Gemini API klíč (zdarma)
1. Otevři **https://aistudio.google.com/app/apikey** (přihlas se Google účtem — klidně ten neziskový).
2. **Create API key** → zkopíruj klíč (`AIza…`). Nikam ho neposílej, použiješ ho jen v kroku 3.

## 2. Vytvoř Apps Script projekt
1. Otevři **https://script.google.com** → **New project**.
2. Smaž ukázkový kód a vlož celý obsah souboru **`apps-script-ai-proxy.gs`**.
3. Vlevo **Project Settings** (ozubené kolo) → dolů **Script properties** → **Add script property**:
   - Name: `GEMINI_API_KEY`
   - Value: *(vlož svůj klíč z kroku 1)* → **Save**.

## 3. Nasaď jako Web App
1. Vpravo nahoře **Deploy → New deployment**.
2. Ozubené kolo u „Select type" → **Web app**.
3. Nastav:
   - **Execute as:** *Me* (tvůj účet)
   - **Who has access:** *Anyone*  ← nutné, aby to mohl volat prohlížeč
4. **Deploy** → poprvé tě to nechá **Authorize access** (povol svému účtu).
5. Zkopíruj **Web app URL** (končí na `…/exec`).

## 4. Zapni v CRM
1. V appce: **Nastavení → Integrace a účty → AI asistent (demo)**.
2. Vlož Web app URL do pole **AI proxy URL** → **Uložit**.
3. Badge se přepne na **„Reálné AI (Gemini)"**.

## 5. Vyzkoušej
- **Hub kontaktu → Chat:** napiš zápis, klikni **✨** → AI strukturuje (kategorie, úkoly, obavy).
- **Hub → Reporty:** vyber období → **✨ Navrhnout draft (AI)** → AI sestaví souhrn.

## Když něco nefunguje
- Appka **vždy spadne zpět na simulaci (mock)**, takže demo běží i bez proxy.
- Health check: otevři Web app URL v prohlížeči — má vrátit `{"ok":true,...}`.
- 401/403 z Gemini → zkontroluj `GEMINI_API_KEY` ve Script properties.
- Po úpravě skriptu udělej **Deploy → Manage deployments → Edit → New version**.

## Náklady
- Gemini **free tier** (model `gemini-1.5-flash`) — pro demo zdarma.
- Apps Script — zdarma součást Google účtu.
