/**
 * i18n.js — react-i18next základ (Krok 2, 2026-07-03).
 *
 * MVP: jediný jazyk (cs), žádný přepínač — jen infrastruktura pro budoucí
 * lokalizaci (viz docs/INVENTAR.md "i18n přes translation_keys", V8 blueprint).
 * `cs.json` je bundlovaný staticky (ne přes i18next-http-backend) — pro jeden
 * jazyk zbytečná komplikace navíc.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './locales/cs.json';

i18n.use(initReactI18next).init({
  resources: { cs: { translation: cs } },
  lng: 'cs',
  fallbackLng: 'cs',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
