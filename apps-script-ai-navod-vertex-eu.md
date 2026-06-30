# Návod: zapnout REÁLNÝ Vertex AI (EU) pro CRM

> Cíl: appka volá skutečné Gemini přes **Vertex AI v EU regionu** (Frankfurt) — placené
> (= bez tréninku na datech), s EU data residency. Most před self-hostem.
> ⚠️ I tak: na reálná data dětí teprve po splnění `ostra-ai-checklist.md` (DPA, DPIA, souhlasy).
> Pro první test používej jen **fiktivní data** (prototyp je má smyšlená).

## 1) Google Cloud projekt + billing
1. **https://console.cloud.google.com** → nahoře vyber/vytvoř projekt → poznamenej si **Project ID** (např. `dopro-crm-123`).
2. **Billing**: Menu → *Billing* → propoj fakturační účet (Vertex vyžaduje billing). Neziskové kredity lze čerpat přes Google for Nonprofits / TechSoup.

## 2) Zapni Vertex AI API
- Menu → *APIs & Services → Library* → najdi **„Vertex AI API"** → **Enable**.

## 3) Apps Script projekt
1. **https://script.google.com** → *New project*.
2. Vlož celý obsah **`apps-script-ai-proxy-vertex-eu.gs`**.
3. Nahoře v kódu uprav:
   - `PROJECT_ID = 'tvuj-project-id'`
   - `REGION = 'europe-west3'`  (Frankfurt; pokud model nebude dostupný, zkus `europe-west4` nebo `europe-west1`)
   - `MODEL = 'gemini-1.5-flash'`  (levný; pro kvalitnější drafty `gemini-1.5-pro`)

## 4) Propoj Apps Script s GCP projektem
1. Apps Script → *Project Settings* (ozubené kolo) → **Google Cloud Platform (GCP) Project** → *Change project*.
2. Vlož **Project number** (najdeš v Cloud Console → Dashboard). Ulož.

## 5) OAuth scopes
1. Apps Script → *Project Settings* → zaškrtni **„Show appsscript.json manifest file"**.
2. V editoru otevři `appsscript.json` a přidej:
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/script.external_request",
  "https://www.googleapis.com/auth/cloud-platform"
]
```

## 6) Oprávnění účtu
- Účet, pod kterým web app poběží (ty), musí mít v GCP roli **Vertex AI User** (`roles/aiplatform.user`).
  Vlastník projektu ji má automaticky. (Cloud Console → *IAM* zkontroluje.)

## 7) Nasaď jako Web App
1. Apps Script vpravo nahoře → **Deploy → New deployment** → typ **Web app**.
2. **Execute as:** *Me* · **Who has access:** *Anyone*.
3. **Deploy** → **Authorize access** (povol scopes svému účtu).
4. Zkopíruj **Web app URL** (`…/exec`).

## 8) Health check
- Otevři URL v prohlížeči → má vrátit `{"ok":true,"model":"gemini-1.5-flash","region":"europe-west3"}`.
  - Když chyba o oprávnění/API → zkontroluj kroky 2, 4, 6.

## 9) Zapni v CRM
- **Nastavení → Integrace a účty → AI asistent (demo)** → vlož Web app URL → **Uložit**.
- Badge přepne na **„Reálné AI (Gemini)"**. Otestuj v Hubu (Chat ✨, Reporty ✨) na webu i mobilu.

## Časté chyby
- **404 / model not found** → model není v daném regionu; změň `REGION` nebo `MODEL`, ulož, *Deploy → Manage deployments → Edit → New version*.
- **403 / permission** → chybí Vertex AI User role nebo nepropojený GCP projekt (krok 4/6).
- **Po každé úpravě kódu** nasaď novou verzi (Manage deployments → Edit → New version), jinak běží stará.

## Náklady
- `gemini-1.5-flash` v EU = haléře za běžné volání. Nastav rozpočtový alarm v GCP (*Billing → Budgets & alerts*).
