/**
 * Firebase initialization — Doprovázení CRM (MVP)
 *
 * Klíčové bezpečnostní rozhodnutí:
 *   - Role/oprávnění se NIKDY nečtou z Custom Claims (id token).
 *   - Jediný zdroj: Firestore user_roles/{uid}. Viz auth.js.
 *
 * Offline podpora:
 *   - IndexedDB persistence je zapnuta explicitně při startu.
 *   - Při výpadku sítě app pracuje z lokální cache (100% offline).
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Konfigurace z environment variables (nikdy natvrdo v kódu).
// Exportováno (ne jen lokální const) — orgService.js potřebuje stejný config
// pro dočasné SEKUNDÁRNÍ Firebase App instance (zakládání zaměstnanců bez
// odhlášení aktuálního uživatele, viz orgService.js). Používá ho i
// scripts/dev-seed.mjs, ale ten čte svůj vlastní process.env, ne tenhle export.
export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const storage = getStorage(app);

// Firestore s rozšířenou cache (offline-first)
export const db = getFirestore(app);

// ── IndexedDB persistence (offline PWA podpora) ──────────────
// Musí být zavoláno PŘED prvním Firestore dotazem.
// Multi-tab podpora: fallback na memory cache pokud jiný tab drží zámek.
let persistenceReady = false;

export async function initPersistence() {
  if (persistenceReady) return;
  try {
    await enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      synchronizeTabs: true,        // sdílení cache přes záložky
    });
    persistenceReady = true;
    console.info('[Firebase] IndexedDB persistence: ON');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      // Více záložek otevřených → pouze první záložka drží zámek; ostatní běží v paměti
      console.warn('[Firebase] Persistence: jiná záložka drží zámek. Memory fallback.');
    } else if (err.code === 'unimplemented') {
      // Prohlížeč nepodporuje IndexedDB (iOS Safari Private)
      console.warn('[Firebase] Persistence: IndexedDB není dostupný v tomto prohlížeči.');
    } else {
      console.error('[Firebase] Persistence init failed:', err);
    }
  }
}

export default app;
