/**
 * navConfig.js — navigační definice pro starší generický Layout.jsx (Sekce A).
 * Vytaženo z router.jsx (2026-07-06, limit 300 řádků) — čistá datová konstanta,
 * proto vlastní modul (žádná react-refresh výjimka jako když bydlela v router.jsx).
 * `labelKey` (ne natvrdo text) kvůli i18n; překlad dělá až konzument (Layout.jsx).
 */

export const MVP_NAV = [
  { path: '/prehled',    labelKey: 'nav.items.prehled',    icon: 'grid' },
  { path: '/pestouni',   labelKey: 'nav.items.pestouni',   icon: 'user' },
  { path: '/deti',       labelKey: 'nav.items.deti',       icon: 'child' },
  { path: '/kontakty',   labelKey: 'nav.items.kontakty',   icon: 'building' },
  { path: '/kalendar',   labelKey: 'nav.items.kalendar',   icon: 'calendar' },
  { path: '/vzdelavani', labelKey: 'nav.items.vzdelavani', icon: 'book' },
];
