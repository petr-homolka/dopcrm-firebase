/**
 * org/ocr.js — extrakce textu z dokumentu (2026-07-06 §E). SEAM: rozhraní je
 * hotové a používá se, ale skutečná extrakce (Vertex AI / Document AI, případně
 * tesseract) potřebuje backend — DOMYSLET (docs/domain/dokumenty-workflow-a-
 * prihlaseni.md §E, docs/INVENTAR.md). Do té doby vrací prázdný text a KO/pěstoun
 * doplní obsah ručně; napojení Vertexu se vsune sem beze změny volajících.
 */

/**
 * Přečte text z nahraného souboru (PDF/obrázek). Zatím placeholder — vrací
 * `{ text: '', engine: 'none' }`. Produkce: volání Vertex Document AI přes
 * EU proxy (viz zapojení AI v paměti crm-ai-zapojeni-uvaha).
 * @returns {Promise<{text:string, engine:string}>}
 */
// eslint-disable-next-line no-unused-vars -- `file` využije až napojení Vertexu
export async function extractTextFromFile(file) {
  return { text: '', engine: 'none' };
}
