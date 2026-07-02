/**
 * Doprovázení CRM — AI proxy PRO OSTROU VERZI (Google Apps Script → Vertex AI v EU)
 * ----------------------------------------------------------------------------------
 * Rozdíl proti demo proxy (apps-script-ai-proxy.gs):
 *   • volá VERTEX AI v EU regionu (data residency) místo free Gemini API,
 *   • placené (billing) → Google data NEpoužívá k tréninku,
 *   • autorizace přes OAuth token účtu (ne API klíč v properties).
 *
 * ⚠️ Než tohle pustíš na REÁLNÁ data dětí, projdi `ostra-ai-checklist.md`
 *    (DPA, DPIA, souhlasy, pseudonymizace, audit, retence).
 *
 * SETUP:
 *  1) Google Cloud projekt s povoleným fakturačním účtem + zapnuté „Vertex AI API".
 *  2) Apps Script: Project Settings → Google Cloud Platform (GCP) Project →
 *     „Change project" → vlož číslo svého GCP projektu (standard project).
 *  3) Přidej OAuth scope (viz appsscript.json níže) a účet, který Web App
 *     „executes as", musí mít roli **Vertex AI User** (roles/aiplatform.user).
 *  4) Deploy → Web app → Execute as: Me, Who has access: Anyone → URL …/exec.
 *  5) URL vlož v CRM do Nastavení → Integrace → AI proxy URL.
 *
 * appsscript.json (Project Settings → „Show appsscript.json" → přidej):
 *   "oauthScopes": [
 *     "https://www.googleapis.com/auth/script.external_request",
 *     "https://www.googleapis.com/auth/cloud-platform"
 *   ]
 */

// ---- KONFIGURACE ----
var PROJECT_ID = 'opportune-cairn-500111-b2';   // GCP Project ID (doprovazeni.com)
var REGION     = 'europe-west1';          // Belgie (EU); broad model availability
// zkusí se v pořadí, vezme první dostupný v daném regionu/projektu:
var MODELS     = ['gemini-3.5-flash','gemini-2.5-flash','gemini-2.0-flash-001'];

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    var out;
    if (req.action === 'structure')      out = structureNote(req.text || '');
    else if (req.action === 'report')    out = draftReport(req.stats || {}, req.contact || '');
    else if (req.action === 'generate')  out = { text: (vertex(req.prompt || '') || '').trim() };
    else if (req.action === 'ocr')       out = ocrImage(req.image || '', req.mime || 'image/jpeg');
    else if (req.action === 'invoice')   out = ocrInvoice(req.image || '', req.mime || 'image/jpeg');
    else                                 out = { error: 'neznámá akce: ' + req.action };
    return json(out);
  } catch (err) { return json({ error: String(err) }); }
}
function doGet() { return json({ ok: true, models: MODELS, region: REGION }); }

/* ---- AI akce (stejný výstupní kontrakt jako demo proxy) ---- */
function structureNote(text) {
  var prompt =
    'Jsi asistent klíčové osoby doprovázející pěstounské rodiny v ČR. ' +
    'Ze surového zápisu vytvoř strukturu. Odpověz POUZE validním JSON (bez markdown): ' +
    '{"cat":"visit|contact|note","summary":"2-3 věty česky","tasks":["úkoly"],' +
    '"concerns":["obavy"],"ospodNotify":true/false}. ospodNotify=true jen při vážném ohrožení.\n\nZÁPIS:\n' + text;
  return parseJson(vertex(prompt), { cat:'note', summary:text.slice(0,160), tasks:[], concerns:[], ospodNotify:false });
}
function draftReport(stats, contact) {
  var f = stats.foster ? ('Pěstoun/ka má splněno ' + stats.foster.done + ' z ' + stats.foster.req + ' hodin povinného vzdělávání. ') : '';
  var prompt =
    'Napiš souvislý odstavec (4 až 6 vět) v češtině, který shrnuje PRŮBĚH pěstounské péče za sledované období ' +
    'pro zprávu orgánu sociálně-právní ochrany dětí (OSPOD). Piš věcně, ve třetí osobě, jako klíčová osoba doprovázející organizace. ' +
    'Údaje k zapracování: rodina/kontakt „' + (contact || 'rodina') + '"; ve sledovaném období proběhlo ' +
    (stats.events||0) + ' návštěv a kontaktů a bylo pořízeno ' + (stats.notes||0) + ' záznamů klíčové osoby. ' + f +
    'NEpiš, kdo zprávu zpracoval, NEoslovuj nikoho, NEvymýšlej konkrétní jména dětí ani události nad rámec uvedených údajů. ' +
    'Vrať POUZE text odstavce, bez nadpisu a bez uvozovek.';
  return { text: (vertex(prompt) || '').trim() };
}

/* ---- OCR dokumentu z foto/skenu (Vertex vision) ---- */
function ocrImage(b64, mime) {
  if (!b64) return { typ:'Dokument', date:'', summary:'Chybí obrázek.', keyData:{}, hours:null, action:'' };
  var prompt =
    'Přečti tento dokument (foto/sken) z agendy doprovázení pěstounských rodin a vrať POUZE validní JSON (bez markdown): ' +
    '{"typ":"druh dokumentu česky (vysvědčení, osvědčení/potvrzení o vzdělávání, smlouva/dohoda, lékařská zpráva, soudní rozhodnutí, omluvenka, účtenka, jiné)",' +
    '"date":"datum dokumentu YYYY-MM-DD nebo prázdný řetězec","summary":"2-3 věty česky co dokument obsahuje",' +
    '"keyData":{"klíč":"hodnota – důležité údaje z dokumentu"},' +
    '"hours":číslo hodin vzdělávání pokud jde o osvědčení/potvrzení o vzdělávání, jinak null,' +
    '"action":"navržená akce pro klíčovou osobu nebo prázdný řetězec"}';
  return parseJson(vertex(prompt, [{ inlineData: { mimeType: mime, data: b64 } }]),
    { typ:'Dokument', date:'', summary:'Nepodařilo se přečíst obsah.', keyData:{}, hours:null, action:'' });
}

/* ---- Položková faktura (tábor/pobyt): jména + částky per dítě ---- */
function ocrInvoice(b64, mime) {
  if (!b64) return { cislo:'', total:0, items:[] };
  var prompt =
    'Toto je faktura/účtenka za tábor/pobyt dětí v pěstounské péči. Vrať POUZE validní JSON (bez markdown): ' +
    '{"cislo":"číslo dokladu nebo prázdné","total":celková částka číslo,' +
    '"items":[{"name":"jméno dítěte z řádku","amount":částka za toto dítě číslo}]}. ' +
    'Každý řádek = jedno dítě a jeho částka. Ignoruj stravu, počítej jen služby/ubytování/program.';
  return parseJson(vertex(prompt, [{ inlineData: { mimeType: mime, data: b64 } }]), { cislo:'', total:0, items:[] });
}

/* ---- Vertex AI (regionální endpoint = data residency v EU) ---- */
function vertex(prompt, extraParts) {
  var parts = [{ text: prompt }];
  if (extraParts && extraParts.length) parts = parts.concat(extraParts);
  var payload = {
    contents: [{ role: 'user', parts: parts }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
  };
  var lastErr = '';
  for (var i = 0; i < MODELS.length; i++) {
    var url = 'https://' + REGION + '-aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
              '/locations/' + REGION + '/publishers/google/models/' + MODELS[i] + ':generateContent';
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var data = JSON.parse(res.getContentText());
    if (data.error) { lastErr += ' [' + MODELS[i] + ': ' + (data.error.message || res.getResponseCode()) + ']'; continue; }
    try {
      var parts = data.candidates[0].content.parts;
      for (var p = 0; p < parts.length; p++) { if (parts[p].text) return parts[p].text; } // vezmi první textovou část
      lastErr += ' [' + MODELS[i] + ': bez textové části]';
    } catch (e) { lastErr += ' [' + MODELS[i] + ': ' + e + ']'; }
  }
  throw new Error('Žádný model nedostupný v ' + REGION + '. Poslední chyba: ' + lastErr);
}

/* ---- helpers ---- */
function parseJson(raw, fb) { try { return JSON.parse(String(raw).replace(/```json|```/g, '').trim()); } catch (e) { return fb; } }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
