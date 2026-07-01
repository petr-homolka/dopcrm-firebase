/**
 * React entry point — Doprovázení CRM (MVP)
 *
 * Pořadí inicializace:
 *   1. initPersistence()  → zapne IndexedDB offline cache (Firebase)
 *   2. <App>              → ThemeProvider (MUI) + AuthProvider + RouterProvider + lazy stránky
 *
 * Chyba persistence (multi-tab / iOS private) = ošetřena uvnitř initPersistence,
 * aplikace se spustí i bez offline cache.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { initPersistence } from './services/firebase.js';
import { bootstrapAuthStore } from './store/authStore.js';
import App from './App.js';

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
