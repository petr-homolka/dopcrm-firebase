/**
 * App.js — MVP wrapper (Doprovázení CRM)
 *
 * Routing:   src/core/router.jsx  (React Router v6, MVP cesty)
 * Moduly:    src/modules/<modul>/ (children, families, documents, calendar, users, companies)
 *
 * NON-MVP — zakomentováno zde i v router.jsx:
 *   Workflow Engine (WF-1..14, exit, ochranná lhůta, převod, GDPR retence)
 *   AI agenti (structureNote, draftReport, OCR, konverzační asistent)
 *   OCR integrace (ocrImage, ocrInvoice, Vertex vision)
 *   Pokročilé reporty (chartBars/Donut/Line/Gauge, exportReport, reportJobs)
 *   Monetizace / FUP (aiTariffs, aiMonthlyCost, orgsBilling, aiFup)
 *   Externisté / výkazy (vykazAdd, vykazApprove, zamestnanci, provozNaklady)
 *   Archiv / zánik DO (orgDissolution, retentionList, mergeContacts)
 */

const App = (() => {

  /* --- KONFIGURACE --- */
  const todayISO = '2026-06-20';

  /* --- TÉMA / BRANDING --- */
  const BRAND_DEFAULTS = { orgName:'Doprovázení, z.s.', accent:'#FFDB4D', logo:'D' };
  function loadBrand(){ try{ return Object.assign({},BRAND_DEFAULTS,JSON.parse(localStorage.getItem('crm-brand')||'{}')); }catch(e){ return {...BRAND_DEFAULTS}; } }
  function saveBrand(b){ try{ localStorage.setItem('crm-brand',JSON.stringify(b)); }catch(e){} }
  function themeKey(){ try{ return localStorage.getItem('crm-theme')||''; }catch(e){ return ''; } }
  function modeKey(){ try{ return localStorage.getItem('crm-mode')==='dark'?'dark':'light'; }catch(e){ return 'light'; } }
  function applyTheme(k){ try{ document.body.dataset.theme=k||''; localStorage.setItem('crm-theme',k||''); }catch(e){} }
  function applyMode(m){ m=m==='dark'?'dark':'light'; try{ localStorage.setItem('crm-mode',m); document.body.dataset.mode=m; }catch(e){} }
  function applyBrand(b){ b=b||loadBrand(); document.documentElement.style.setProperty('--accent',b.accent||'#FFDB4D'); }
  function bootBrand(){ applyBrand(); applyTheme(themeKey()); applyMode(modeKey()); }
  function initTheme(host){ bootBrand(); }

  /* --- ROLE / PRÁVA (MVP subset; plný model → src/modules/users) --- */
  const ORG_USERS = [
    {id:'u_super',name:'Superadmin',  role:'superadmin'},
    {id:'u_admin',name:'Vedení DO',   role:'vedeni'},
    {id:'u_ko1',  name:'M. Dvořák',  role:'ko', worker:'M. Dvořák'},
    {id:'u_ko2',  name:'L. Horáková',role:'ko', worker:'L. Horáková'},
    {id:'u_asist',name:'Asistentka', role:'asistent'},
    {id:'u_fos1', name:'Jana Nováková',role:'pestoun',linkId:'f1'},
    {id:'u_kid1', name:'Lukáš Dohnal', role:'dite',  linkId:'k3'},
  ];
  const ROLE_SCOPES = { superadmin:'all', vedeni:'all', ko:'own', asistent:'own', pestoun:'self', dite:'self', externista:'extern' };
  const ROLE_CAPS = {
    superadmin: ['sensitive.view','contacts.edit','contacts.delete','notes.add','docs.upload','docs.delete','tasks.manage','reports.generate','settings.access','settings.branding','users.manage','roles.manage','templates.manage'],
    vedeni:     ['sensitive.view','contacts.edit','notes.add','docs.upload','tasks.manage','reports.generate','settings.access','settings.branding','users.manage','roles.manage'],
    ko:         ['sensitive.view','contacts.edit','notes.add','docs.upload','tasks.manage','reports.generate'],
    asistent:   ['notes.add','docs.upload','tasks.manage'],
    pestoun:    ['docs.upload'],
    dite:       [],
    externista: [],
  };
  function currentUser(){ const id=localStorage.getItem('crm-cur')||'u_admin'; return ORG_USERS.find(u=>u.id===id)||ORG_USERS[1]; }
  function roleOf(u){ const r=(u||currentUser()).role||'ko'; return { key:r, scope:ROLE_SCOPES[r]||'own' }; }
  function can(cap){ return (ROLE_CAPS[currentUser().role]||[]).includes(cap); }
  function switchUser(id){ localStorage.setItem('crm-cur',id); location.reload(); }
  function openRoleSwitcher(){ alert('Role switcher: nastav localStorage crm-cur na: '+ORG_USERS.map(u=>u.id+' ('+u.role+')').join(', ')); }
  function initAccount(){ const u=currentUser(); const el=document.querySelector('.account'); if(el&&el.querySelector('.av-name')) el.querySelector('.av-name').textContent=u.name; }

  /* --- MVP NAVIGACE (viz src/core/router.jsx pro React verzi) --- */
  const RAIL_MVP = [
    ['prehled.html','Přehled',   'M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 15h8v6H3z'],
    ['pestouni.html','Pěstouni', 'M12 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c0-3.5 3-6 7-6s7 2.5 7 6'],
    ['deti.html','Děti',         'M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 21v-4a5 5 0 0 1 10 0v4'],
    ['ostatni.html','Kontakty',  'M4 4h16v12H8l-4 4zM8 9h8M8 12h5'],
    ['kalendar.html','Kalendář', 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4'],
    ['dokumenty.html','Dokumenty','M6 2h8l4 4v16H6zM14 2v4h4'],
    ['vzdelavani.html','Vzdělávání','M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5'],
    // NON-MVP (zakomentováno — odpovídá router.jsx):
    // ['reporty.html','Reporty','M3 3v18h18M7 14l3-3 3 2 5-6'],
    // ['sprava.html','Správa','M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],
    // ['archiv.html','Archiv','M3 3h18v4H3z M5 7v14h14V7'],
    // ['monetizace.html','Monetizace','M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  ];
  function renderRail(active){
    const u=currentUser(), sc=roleOf(u).scope;
    let items = RAIL_MVP;
    if(sc==='self') items=[['#','Moje karta','M12 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c0-3.5 3-6 7-6s7 2.5 7 6'],['kalendar.html','Kalendář','M3 5h18v16H3zM3 9h18M8 3v4M16 3v4'],['dokumenty.html','Dokumenty','M6 2h8l4 4v16H6zM14 2v4h4']];
    if(sc==='extern') items=[['#','Výkaz','M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 4 0M9 13l2 2 4-4']];
    const ico = ([href,title,d])=>`<a class="rail-ico ${title===active?'active':''}" href="${href}" title="${title}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${d}"/></svg><span class="rl">${title}</span></a>`;
    const settingsLink = can('settings.access')?`<a class="rail-ico ${active==='Nastavení'?'active':''}" href="nastaveni.html" title="Nastavení"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></a>`:'';
    return `<a class="logo" href="prehled.html" id="railLogo">D</a>${items.map(ico).join('')}<div class="rail-spacer"></div>${settingsLink}<div class="rail-ico" title="Přepnout roli" onclick="App.openRoleSwitcher()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg></div>`;
  }

  /* --- VEŘEJNÉ API --- */
  return {
    todayISO,
    loadBrand, saveBrand, themeKey, modeKey, applyTheme, applyMode, applyBrand, bootBrand, initTheme,
    currentUser, roleOf, can, switchUser, openRoleSwitcher, initAccount,
    renderRail, RAIL_MVP, ORG_USERS,
  };

})();
