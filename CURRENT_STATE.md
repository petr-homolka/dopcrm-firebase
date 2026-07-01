# CURRENT_STATE
**Verze:** 1.1.0 (CI/CD — automatický deploy z GitHubu)
**Živá URL:** https://opportune-cairn-500111-b-b2bea.web.app
**Vlastní doména:** https://moje.doprovazeni.com (CNAME → opportune-cairn-500111-b-b2bea.web.app, Firebase Hosting custom domain, status: successfully verified)
**GitHub repo:** https://github.com/petr-homolka/dopcrm-firebase (branch `main`)
**Aktuální cíl:** Rozšířit Bento Grid layout na další moduly (Pěstouni, Děti, Kontakty…), naplnit Firestore testovacími daty.

**Mobil (pestouni-crm-mobile) — POZASTAVENO (2026-06-30):**
Expo Go na zařízení uživatele stále hlásí nekompatibilitu i po downgradu na SDK 56 a aktualizaci appky.
Mobilní vývoj se dál neřeší dnes — viz `pestouni-crm-mobile/CURRENT_STATE.md` pro plný stav a TODO,
až se k tomu vrátíme. Web pokračuje samostatně.

**CI/CD — GitHub → Firebase Hosting (2026-06-30, NOVĚ HOTOVO):**
- Git repo (lokální, `main` branch) propojen s GitHubem: `git remote origin` → `https://github.com/petr-homolka/dopcrm-firebase.git`
- **Push permission fix:** uložený git credential na tomto PC patřil účtu „Doprovazeni" bez zápisu do repa → uživatel přidal „Doprovazeni" jako collaborator s právem zápisu → push funguje
- `firebase init hosting:github` (spuštěno uživatelem interaktivně, autorizace GitHub App v prohlížeči jako `petr-homolka`):
  - Vytvořen GCP service account `github-action-1285520940` s Firebase Hosting Admin právy
  - JSON klíč nahrán jako GitHub secret `FIREBASE_SERVICE_ACCOUNT_OPPORTUNE_CAIRN_500111_B_B2BEA` (repo Settings → Secrets)
  - `.github/workflows/firebase-hosting-merge.yml` — **push do `main`** → `npm ci && npm run build` → deploy na live kanál (`moje.doprovazeni.com`)
  - `.github/workflows/firebase-hosting-pull-request.yml` — PR → preview deploy (vygenerováno automaticky, i když jsme původně chtěli jen merge-deploy; ponecháno, nevadí)
- **Od teď: `git push` do `main` = automatický build + deploy.** `npm run deploy` (ruční) zůstává funkční jako fallback, ale už není potřeba.
- Workflow soubory zacommitované a pushnuté (`98f7e7e`) — první automatický běh spuštěn tímto pushem, ověřit stav na https://github.com/petr-homolka/dopcrm-firebase/actions

**Firebase Hosting — konfigurace:**
- `firebase.json` — `hosting.public = "dist"`, `ignore` (firebase.json, dotfiles, node_modules), `rewrites` `**` → `/index.html` (SPA fallback)
- `.firebaserc` — `default` projekt `opportune-cairn-500111-b-b2bea`
- `package.json` → skript `"deploy": "vite build && firebase deploy --only hosting"` (ruční fallback)
- `firebase-tools` jako devDependency

**Co je funkční (web, beze změny od v0.9.8):**
- Firebase Auth (Email/Password, uživatel petr.homolka@doprovazeni.com)
- Firestore databáze (europe-west3), kolekce `user_roles`
- RBAC: role `superadmin` načtena z `user_roles/Me2AINlkoofbBrLQkcz9DAbufED3`
- MUI (Material Design 3) + **Bento Grid styl**: `theme.js` export `bento` (radius 20, shadow scale, hover scale 1.02), `MuiCard` override
- `DashboardPage.jsx` v bento layoutu: hero pozdrav karta (span 2) + 2× KPI karta + full-width karta s tabulkou posledních rodin
- `Layout.jsx` (MUI Drawer/AppBar), `Login.jsx` (MUI), `dataService.js`
- Production build ověřen bez chyb (978 modulů)

**Vite dev server:** `npm run dev` → localhost:5173 (nebo 5174 je-li 5173 obsazený)
**Vanilla prototyp:** stále funkční (prehled.html, hub.html atd. — nedotčeno), FTP deploy nezměněn

**Tenant:** `tenantId: "doprovazeni-brno"` (v user_roles dokumentu)

**Známá neškodná chyba CI/CD (2026-07-01):** První 2 automatické běhy skončily červeně —
`FAILED_PRECONDITION: Can't release ... supplied version is the current active version`.
Příčina: push obsahoval jen změny v `.md`/`.yml` souborech, ne v `src/`, takže `npm run build`
vyprodukoval bajt-přesně stejný `dist/` jako už nasazená verze (z předchozího ručního
`npm run deploy`) → Firebase odmítne "vydat" verzi, která je už aktivní. **Appka zůstává
správně nasazená a funkční**, jde jen o kosmetický červený status. Ověří se automaticky
zeleně při příštím pushi se skutečnou změnou v `src/`.

**Chybí / TODO (nasazení):**
- Ověřit v GitHubu (Actions tab), že při příští reálné změně kódu (`src/`) proběhne běh zeleně
- Zvážit nasazení Firestore Security Rules zároveň (`firebase deploy --only hosting,firestore:rules`), zatím test mode
- `FIREBASE_SERVICE_ACCOUNT_...` secret obsahuje citlivý JSON klíč — nikdy ho nevypisovat do chatu/logů, spravovat jen přes GitHub repo Settings → Secrets

**Chybí / TODO (web, obecně):**
- Bento Grid layout rozšířit na ostatní stub stránky (Pěstouni, Děti, Kontakty, Kalendář, Dokumenty, Vzdělávání, Uživatelé, Nastavení, Hub)
- V Firestore zatím neexistují žádné `data_objects` dokumenty typu `family`/`child` → Dashboard zobrazí 0 / „Žádné rodiny k zobrazení" (očekávané, čeká na reálná data)
- Firestore Security Rules nasadit (`firebase deploy --only firestore:rules`)
- Přepnout Firestore z test mode na produkční rules před ostrým provozem
