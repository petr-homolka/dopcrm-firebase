# CURRENT_STATE
**Verze:** 0.9.9 (Firebase Hosting konfigurace připravena)
**Aktuální cíl:** Příprava aplikace pro nasazení na Firebase Hosting.

**Mobil (pestouni-crm-mobile) — POZASTAVENO (2026-06-30):**
Expo Go na zařízení uživatele stále hlásí nekompatibilitu i po downgradu na SDK 56 a aktualizaci appky.
Mobilní vývoj se dál neřeší dnes — viz `pestouni-crm-mobile/CURRENT_STATE.md` pro plný stav a TODO,
až se k tomu vrátíme. Web pokračuje samostatně.

**Firebase Hosting — nově připraveno:**
- `firebase.json` — `hosting.public = "dist"`, `ignore` (firebase.json, dotfiles, node_modules), `rewrites` `**` → `/index.html` (SPA fallback)
- `.firebaserc` — `default` projekt `opportune-cairn-500111-b-b2bea` (vyčteno z `.env.local` → `VITE_FIREBASE_PROJECT_ID`)
- `package.json` → nový skript `"deploy": "vite build && firebase deploy --only hosting"`
- `firebase-tools` doinstalován jako devDependency (CLI binárka `firebase` nebyla v systému, bez ní by `npm run deploy` nešel spustit)
- Ověřeno: oba JSON soubory syntakticky validní, `./node_modules/.bin/firebase --version` funguje (15.22.4)
- `.claudesignore` zkontrolován — `firebase.json`/`.firebaserc` nejsou blokované

**Co je funkční (web, beze změny od v0.9.8):**
- Firebase Auth (Email/Password, uživatel petr.homolka@doprovazeni.com)
- Firestore databáze (europe-west3), kolekce `user_roles`
- RBAC: role `superadmin` načtena z `user_roles/Me2AINlkoofbBrLQkcz9DAbufED3`
- MUI (Material Design 3) + **Bento Grid styl**: `theme.js` export `bento` (radius 20, shadow scale, hover scale 1.02), `MuiCard` override
- `DashboardPage.jsx` v bento layoutu: hero pozdrav karta (span 2) + 2× KPI karta + full-width karta s tabulkou posledních rodin
- `Layout.jsx` (MUI Drawer/AppBar), `Login.jsx` (MUI), `dataService.js`
- Production build ověřen bez chyb (978 modulů)

**Vite dev server:** `npm run dev` → localhost:5173 (nebo 5174 je-li 5173 obsazený)
**Vanilla prototyp:** stále funkční (prehled.html, hub.html atd. — nedotčeno)

**Tenant:** `tenantId: "doprovazeni-brno"` (v user_roles dokumentu)

**Chybí / TODO (nasazení):**
- Před prvním `npm run deploy` je nutné jednou spustit `firebase login` (interaktivní přihlášení v prohlížeči) — nelze provést automatizovaně
- Ověřit, že Firebase Hosting je v projektu `opportune-cairn-500111-b-b2bea` aktivovaný (Console → Hosting → Get started, pokud ještě nebylo)
- Po prvním nasazení zkontrolovat živou URL (`<project>.web.app` / `<project>.firebaseapp.com`)
- Zvážit nasazení Firestore Security Rules zároveň (`firebase deploy --only hosting,firestore:rules`), zatím test mode

**Chybí / TODO (web, obecně):**
- Bento Grid layout rozšířit na ostatní stub stránky (Pěstouni, Děti, Kontakty, Kalendář, Dokumenty, Vzdělávání, Uživatelé, Nastavení, Hub)
- V Firestore zatím neexistují žádné `data_objects` dokumenty typu `family`/`child` → Dashboard zobrazí 0 / „Žádné rodiny k zobrazení" (očekávané, čeká na reálná data)
- Firestore Security Rules nasadit (`firebase deploy --only firestore:rules`)
- Přepnout Firestore z test mode na produkční rules před ostrým provozem
