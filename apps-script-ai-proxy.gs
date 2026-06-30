/**
 * Doprovázení CRM — AI proxy (Google Apps Script → Gemini)
 * Drží API klíč na straně Googlu (prototyp ho nikdy nevidí).
 * Nasaď jako Web App: Deploy → New deployment → type "Web app",
 *   Execute as: Me,  Who has access: Anyone.
 * URL (…/exec) vlož v CRM do Nastavení → Integrace → AI proxy URL.
 *
 * API klíč: Project Settings → Script properties → přidej
 *   GEMINI_API_KEY = <tvůj klíč z aistudio.google.com>
 *
 * ⚠️ Jen pro DEMO s fiktivními daty (Gemini free tier může data využívat).
 */

var MODEL = 'gemini-1.5-flash'; // levný/rychlý; free tier

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents || '{}');
    var action = req.action;
    var out;
    if (action === 'structure')      out = structureNote(req.text || '');
    else if (action === 'report')    out = draftReport(req.stats || {}, req.contact || '');
    else                             out = { error: 'neznámá akce: ' + action };
    return json(out);
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doGet() { return json({ ok: true, model: MODEL }); } // health check

/* ---------- AI akce ---------- */

function structureNote(text) {
  var prompt =
    'Jsi asistent klíčové osoby doprovázející pěstounské rodiny v ČR. ' +
    'Ze surového zápisu z návštěvy vytvoř strukturu. Odpověz POUZE validním JSON ' +
    '(bez markdown) v tomto tvaru: {"cat":"visit|contact|note","summary":"2-3 věty česky",' +
    '"tasks":["úkoly"],"concerns":["obavy"],"ospodNotify":true/false}. ' +
    'ospodNotify=true jen při vážném ohrožení dítěte.\n\nZÁPIS:\n' + text;
  var r = gemini(prompt);
  return parseJson(r, { cat:'note', summary:text.slice(0,160), tasks:[], concerns:[], ospodNotify:false });
}

function draftReport(stats, contact) {
  var f = stats.foster ? ('Vzdělávání pěstouna: ' + stats.foster.done + '/' + stats.foster.req + ' h. ') : '';
  var prompt =
    'Jsi klíčová osoba doprovázející organizace. Napiš návrh SOUHRNU zprávy o průběhu ' +
    'náhradní rodinné péče pro OSPOD, česky, věcně, 4–6 vět. ' +
    'Kontakt: ' + (contact || 'rodina') + '. Ve sledovaném období: ' +
    (stats.events||0) + ' návštěv/kontaktů, ' + (stats.notes||0) + ' záznamů KO. ' + f +
    'Nevymýšlej konkrétní jména ani události nad rámec těchto údajů. ' +
    'Odpověz POUZE textem souhrnu (bez nadpisů a markdownu).';
  var r = gemini(prompt);
  return { text: (r || '').trim() };
}

/* ---------- Gemini volání ---------- */

function gemini(prompt) {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('Chybí GEMINI_API_KEY ve Script properties');
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + key;
  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
  };
  var res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText());
  if (data.error) throw new Error(data.error.message || 'Gemini error');
  try { return data.candidates[0].content.parts[0].text; }
  catch (e) { throw new Error('Neočekávaná odpověď Gemini'); }
}

/* ---------- helpers ---------- */

function parseJson(raw, fallback) {
  try { return JSON.parse(String(raw).replace(/```json|```/g, '').trim()); }
  catch (e) { return fallback; }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
