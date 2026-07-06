/**
 * React entry point — Doprovázení CRM (MVP)
 *
 * Pořadí inicializace:
 *   1. initPersistence()  → zapne IndexedDB offline cache (Firebase)
 *   2. <App>              → Tailwind (index.css) + AuthProvider + RouterProvider + lazy stránky
 *
 * Chyba persistence (multi-tab / iOS private) = ošetřena uvnitř initPersistence,
 * aplikace se spustí i bez offline cache.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import './i18n.js';
import { initPersistence } from './services/firebase.js';
import { bootstrapAuthStore } from './store/authStore.js';
import App from './App.js';

// PWA auto-aktualizace (2026-07-06): instalovaná appka se z launcheru jen
// probouzí — bez explicitní kontroly by nový build natáhla až po úplném
// zabití. Proto kontrola aktualizace SW při každém návratu do popředí
// a jednou za hodinu; registerType 'autoUpdate' pak novou verzi aktivuje
// a stránku sám obnoví.
registerSW({
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => registration.update().catch(() => {});
    setInterval(check, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  },
});

async function bootstrap() {
  // Zapnout IndexedDB offline cache — chyby se logují, nepadá
  try {
    await initPersistence();
  } catch (err) {
    console.warn('[CRM] IndexedDB persistence nedostupná:', err.code ?? err.message);
  }

  // Nový B2B SaaS auth store (Zustand) — sleduje Firebase Auth + users/{uid}
  bootstrapAuthStore();

  const root = document.getElementById('root');
  if (!root) throw new Error('[CRM] Element #root nenalezen v index.html');

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
