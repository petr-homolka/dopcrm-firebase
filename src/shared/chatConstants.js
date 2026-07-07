/**
 * chatConstants.js — konstanty chatu a notifikací (2026-07-06,
 * docs/domain/chat-a-pestounska-appka.md). Vytaženo z domainConstants.js
 * (limit 300 řádků). Hranice soukromí je VYNUCENA ve firestore.rules —
 * tyto konstanty jen řídí UI a výběr autora.
 */

/**
 * Úrovně soukromí zprávy v jednom vlákně na kartě rodiny (4 kategorie dle
 * spec 2026-07-06 — docs/domain/dokumenty-workflow-a-prihlaseni.md §B):
 *   private  — poznámka KO „sobě", čte jen autor
 *   internal — spis týmu, čtou zaměstnanci; pěstoun NIKDY
 *   foster   — zpráva KO ↔ pěstoun, jediná úroveň viditelná pěstounovi
 *   ospod    — komunikace/dokumenty k úřadu (OSPOD/soud), čte tým; pěstoun NIKDY
 */
export const MESSAGE_AUDIENCES = {
  private: { label: 'Poznámka sobě', hint: 'Vidíte jen vy.' },
  internal: { label: 'Interní (tým)', hint: 'Vidí kolegové z organizace, pěstoun ne.' },
  foster: { label: 'Pěstounovi', hint: 'Uvidí pěstoun rodiny i tým.' },
  ospod: { label: 'Pro OSPOD', hint: 'Komunikace k úřadu — vidí tým, pěstoun ne.' },
};

export function messageAudienceLabel(key) {
  return MESSAGE_AUDIENCES[key]?.label ?? key;
}

/** Úroveň, kterou smí zakládat pěstoun ze své appky (jednosměrně KO). */
export const FOSTER_ALLOWED_AUDIENCE = 'foster';

/** Typy notifikací — řídí ikonu a cíl prokliku v notifikačním centru. */
export const NOTIFICATION_TYPES = {
  message: 'Nová zpráva',
  document: 'Dokument ke schválení',
  visit: 'Návštěva po termínu',
};
