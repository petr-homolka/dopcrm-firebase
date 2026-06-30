/* ============================================================
   Doprovázení CRM – MOBILNÍ APLIKACE (samostatná vrstva, SPA)
   Nativní feeling (iOS/Material) + Yandex 360. Sdílí data z App.
   Klientské routování + push/pop přechody, žádné přenačítání stránky.
   Aktivuje se na úzké šířce / dotyku / přes ?m=1.
   ============================================================ */
(function(){
  if(typeof App==='undefined') return;
  const forced = location.search.includes('m=1');
  const off = location.search.includes('m=0');
  const isMob = !off && (forced || window.matchMedia('(max-width:760px)').matches);
  if(!isMob) return;

  const TODAY='2026-06-20', NOW='14:20';
  const MN=['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
  const MNc=['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
  const DOWs=['Po','Út','St','Čt','Pá','So','Ne'];
  const DOWl=['Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota','Neděle'];
  const pad=n=>String(n).padStart(2,'0');
  const isoOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const dowi=d=>(d.getDay()+6)%7;
  const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
  const mondayOf=d=>addDays(d,-dowi(d));
  const toMin=t=>{const[a,b]=t.split(':').map(Number);return a*60+b;};
  const addMin=(t,m)=>{const x=toMin(t)+m;return `${pad(Math.floor(x/60)%24)}:${pad(x%60)}`;};
  const esc=s=>(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const evColor=e=>(App.EVTYPES[e.type]||['',''])[1]||'var(--text-3)';
  const evLabel=e=>(App.EVTYPES[e.type]||['Ostatní'])[0];
  const navLink=loc=>'https://maps.google.com/maps?daddr='+encodeURIComponent(loc||'');
  const mapEmbed=loc=>'https://maps.google.com/maps?q='+encodeURIComponent(loc||'')+'&z=14&output=embed';
  const chev='<svg class="m-chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l6 6-6 6"/></svg>';

  const IC={
    home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    users:'<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21c0-3 3-5 7-5s7 2 7 5M17 11a3 3 0 1 0 0-6"/>',
    child:'<path d="M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 21v-4a5 5 0 0 1 10 0v4"/>',
    cal:'<path d="M3 5h18v16H3zM3 9h18M8 3v4M16 3v4"/>',
    check:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 4 0M9 13l2 2 4-4"/>',
    doc:'<path d="M6 2h8l4 4v16H6zM14 2v4h4"/>',
    more:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bell:'<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    back:'<path d="M15 18l-6-6 6-6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>',
    send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    warn:'<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
    mic:'<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    ai:'<path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 14.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
    sign:'<path d="M3 17s3.5 .5 6-2.5 3.5-7 3.5-7M14 8.5l1.6-1.6a2.1 2.1 0 0 1 3 3L13 15.5l-4 1 1-4zM2 21h20"/>',
  };
  const svg=(p,w)=>`<svg viewBox="0 0 24 24" width="${w||24}" height="${w||24}" fill="none" stroke="currentColor" stroke-width="2">${p}</svg>`;

  const TABS=[
    ['prehled.html','Přehled',IC.home],
    ['pestouni.html','Rodiny',IC.users],
    ['kalendar.html','Kalendář',IC.cal],
    ['ukoly.html','Úkoly',IC.check],
    ['__more__','Více',IC.more],
  ];

  /* ---------- session data ---------- */
  const ADDR='Teplice, Čelakovského 772/3';
  let mEvents = (App.visibleEvents?App.visibleEvents():App.calEvents());
  let mTasks = (App.visibleTasks?App.visibleTasks():App.allTasks()).slice();
  const ENTOPTS=[
    ...App.allFosters().map(p=>({label:p.n,etype:'pestoun',eid:p.id})),
    ...App.allChildren().map(k=>({label:k.n,etype:'dite',eid:k.id})),
    {label:'OSPOD Brno-střed'},{label:'Krajský úřad JMK'},{label:'Vedení DO'},
  ];
  let evDraftEnts=[];
  let evType='visit', evOwner='M. Dvořák', evPickOpen=false;
  const OWNERS=[['M. Dvořák','Michal Dvořák'],['L. Horáková','Lucie Horáková']];
  function renderEvEnts(){ const el=document.getElementById('m-ev-ents'); if(!el)return;
    el.innerHTML=evDraftEnts.length?evDraftEnts.map((s,i)=>`<span class="m-chip">${esc(s.label)} <span style="cursor:pointer;color:var(--text-3);padding:0 2px" onclick="MApp.evRmEnt(${i})">✕</span></span>`).join(''):'<span class="m-rs" style="color:var(--text-3)">Zatím nic – přidej koho se událost týká.</span>'; }
  function evTypeBtns(){ return Object.entries(App.EVTYPES).map(([k,v])=>`<button type="button" class="${evType===k?'on':''}" onclick="MApp.evSetType('${k}')">${v[0]}</button>`).join(''); }
  function evOwnerBtns(){ return OWNERS.map(([k,l])=>`<button type="button" class="${evOwner===k?'on':''}" onclick="MApp.evSetOwner('${k}')">${l}</button>`).join(''); }
  function evFormBody(o){ return `
      <div class="m-field"><label>Název</label><input id="m-ev-t" placeholder="např. Návštěva v domácnosti" value="${esc(o.title||'')}"></div>
      <div class="m-field"><label>Typ události</label><div class="m-seg" id="m-ev-typeseg">${evTypeBtns()}</div></div>
      <div class="m-field"><label>Datum</label><input id="m-ev-d" type="date" value="${o.date}"></div>
      <div class="m-grid2"><div class="m-field"><label>Od</label><input id="m-ev-s" type="time" value="${o.start}"></div><div class="m-field"><label>Do</label><input id="m-ev-e" type="time" value="${o.end}"></div></div>
      <div class="m-field"><label>Klíčová osoba</label><div class="m-seg" id="m-ev-ownerseg">${evOwnerBtns()}</div></div>
      <div class="m-field"><label>Navázáno na (pěstoun / dítě / instituce)</label>
        <div id="m-ev-ents" style="margin-bottom:8px"></div>
        <button type="button" class="m-addbtn" onclick="MApp.evPickToggle()">＋ Přidat kontakt</button>
        <div class="m-pick" id="m-ev-pick" style="display:none"><div class="m-pick-search">${svg(IC.search,18)}<input id="m-ev-pickq" placeholder="Hledat osobu nebo instituci…" oninput="MApp.evPickFilter(this.value)"></div><div class="m-pick-list" id="m-ev-picklist"></div></div>
      </div>
      <div class="m-field"><label>Místo (pro navigaci)</label><input id="m-ev-l" placeholder="${esc(ADDR)}" value="${esc(o.loc||'')}"></div>
      <div class="m-sheet-foot"><button class="m-btn-primary" onclick="${o.save}">${o.saveLabel}</button></div>`; }
  let chatScope='internal', repEdit=false;
  const SHARE_CH=[['internal','Interní chat (DO)',''],['pestoun','Pěstounovi (ke schválení)',''],['dite','Dítěti (ke schválení)',''],['mail','E-mail',''],['sms','SMS',''],['whatsapp','WhatsApp',''],['signal','Signal',''],['telegram','Telegram',''],['link','Odkaz','']];
  function docReal(d){ try{ return (App.docList(d.eid)||[]).find(x=>x.name===d.name)||null; }catch(e){ return null; } }

  /* ============================================================ ROUTING */
  function parseLoc(){
    const page=(location.pathname.split('/').pop()||'prehled.html').toLowerCase()||'prehled.html';
    const params={}; new URLSearchParams(location.search).forEach((v,k)=>params[k]=v);
    return {page,params};
  }
  let route = parseLoc();
  let navDepth = 0;

  function urlFor(r){
    if(r.page==='__chat__') return location.pathname+'#chat';
    const p=new URLSearchParams(r.params||{}); const q=p.toString();
    return r.page+(q?'?'+q:'');
  }
  function tabOf(page){
    if(['prehled.html','pestouni.html','kalendar.html','ukoly.html'].includes(page)) return page;
    if(['deti.html','ostatni.html','dokumenty.html','vzdelavani.html','nastaveni.html'].includes(page)) return '__more__';
    return null;
  }

  /* ============================================================ CHROME */
  function ensureApp(){
    document.body.classList.add('m-active');
    let app=document.getElementById('m-app');
    if(!app){ app=document.createElement('div'); app.id='m-app'; document.body.appendChild(app); }
    return app;
  }
  function screenHtml(){
    const R=SCREENS[route.page]||SCREENS['prehled.html'];
    const showTabs=R.tabs!==false;
    return R.render() +
      (R.fab && (!App.canManageAgenda||App.canManageAgenda())?`<button class="m-fab" onclick="${R.fab}">${svg(IC.plus,28)}</button>`:'') +
      (showTabs?tabbar(tabOf(route.page)):'');
  }
  let topScreen=null;
  // dir: 'push' | 'pop' | 'tab' | 'replace' | 'none'
  function render(dir){
    const app=ensureApp();
    if(dir==='replace' && topScreen && topScreen.parentNode){
      const wb=topScreen.querySelector('.m-week-body');
      const sc=topScreen.querySelector('.m-scroll,.m-chat-stream');
      const top = wb ? {t:wb.scrollTop,l:wb.scrollLeft} : (sc?sc.scrollTop:0);
      topScreen.innerHTML=screenHtml(); afterRender(topScreen,true,top); return;
    }
    const old=topScreen;
    const nw=document.createElement('div'); nw.className='m-screen m-top';
    nw.innerHTML=screenHtml();
    if(dir==='push') nw.classList.add('m-enter-right');
    else if(dir==='pop') nw.classList.add('m-enter-left');
    else if(dir==='tab') nw.classList.add('m-fade');
    if(old) old.classList.remove('m-top');
    app.appendChild(nw);
    topScreen=nw;
    afterRender(nw,false,0);
    // spustit přechod v dalším snímku
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      nw.classList.remove('m-enter-right','m-enter-left','m-fade');
      if(old){
        if(dir==='push') old.classList.add('m-exit-left');
        else if(dir==='pop') old.classList.add('m-exit-right');
        else old.classList.add('m-fade');
      }
    }));
    if(old) setTimeout(()=>{ if(old.parentNode) old.remove(); }, 380);
  }
  function afterRender(screenEl,keepScroll,top){
    if(route.page==='kalendar.html' && calView==='tyden') wireWeek(screenEl,keepScroll,top);
    if(route.page==='__chat__'){ const cs=screenEl.querySelector('.m-chat-stream'); if(cs) cs.scrollTop=cs.scrollHeight; }
    if(route.page==='__search__'){ const si=screenEl.querySelector('#m-search-in'); if(si&&!keepScroll) setTimeout(()=>si.focus(),120); }
  }
  // propojí horizontální/vertikální scroll s fixní hodinovou osou a hlavičkou dnů
  function wireWeek(screenEl,keepScroll,top){
    const body=screenEl.querySelector('.m-week-body');
    const head=screenEl.querySelector('.m-week-headrow');
    const gut=screenEl.querySelector('.m-week-gutinner');
    if(!body||!head||!gut) return;
    const sync=()=>{ head.style.transform=`translateX(${-body.scrollLeft}px)`; gut.style.transform=`translateY(${-body.scrollTop}px)`; updateWeekTitle(body.scrollLeft); };
    body.addEventListener('scroll',()=>{ requestAnimationFrame(sync); },{passive:true});
    const keep = keepScroll && top && typeof top==='object';
    const applyScroll=()=>{
      body.scrollTop = keep ? top.t : 6*WK_HH;
      body.scrollLeft = keep ? top.l : WEEK_START_IDX*WK_WD;
      sync();
    };
    // dvojitý rAF – počkat na rozložení 70 sloupců, jinak se scrollLeft ořízne na 0
    requestAnimationFrame(()=>requestAnimationFrame(applyScroll));
  }
  function updateWeekTitle(scrollLeft){
    const idx=WEEK_RANGE_START+Math.round(scrollLeft/WK_WD);
    const d=addDays(WEEK_BASE,idx); const iso=isoOf(d);
    const el=document.getElementById('m-week-title');
    if(el) el.textContent='Týden '+App.isoWeek(iso)+' · '+MNc[d.getMonth()];
  }

  function tabbar(active){
    const nc=(App.buildNotifs?App.buildNotifs().length:0);
    return `<nav class="m-tabs">${TABS.map(([href,label,ic])=>{
      const on=href===active?'on':'';
      const onclick = href==='__more__' ? `onclick="MApp.more()"` : `onclick="MApp.go('${href}')"`;
      const badge=(href==='__more__'&&nc)?`<span class="m-tbadge">${nc}</span>`:'';
      return `<a class="m-tab ${on}" ${onclick} style="position:relative">${svg(ic,25)}${badge}<span>${label}</span></a>`;
    }).join('')}</nav>`;
  }
  function head(opts){
    const back = opts.back?`<button class="m-iconbtn m-back" onclick="${opts.back}">${svg(IC.back,24)}Zpět</button>`:`<span style="width:8px"></span>`;
    const action = opts.action||'<span style="width:40px"></span>';
    const bar = `<div class="m-head-bar">${back}<div class="m-htitle">${opts.barTitle||''}</div>${action}</div>`;
    const large = opts.large?`<div class="m-large">${esc(opts.large)}</div>`:'';
    const search = opts.search?`<div class="m-search">${svg(IC.search,18)}<input placeholder="${opts.searchPh||'Hledat…'}" oninput="MApp.search(this.value)" value="${esc(MApp_q)}"></div>`:'';
    const seg = opts.seg||'';
    return `<header class="m-head">${bar}${large}${search}${seg}</header>`;
  }
  function row(href,avatar,title,sub,trail,click){
    const act = click?`onclick="${click}"`:(href?`href="${href}"`:'');
    return `<a class="m-row" ${act}>${avatar||''}<div class="m-rmeta"><div class="m-rt">${title}</div>${sub?`<div class="m-rs">${sub}</div>`:''}</div><div class="m-rtrail">${trail||''}${chev}</div></a>`;
  }
  function famName(h){ return h.name.replace('Domácnost ',''); }
  function firstFoster(h){ return (h.fosters.find(x=>x.isFoster)||{}).id; }

  /* ============================================================ PŘEHLED */
  function scrPrehled(){
    const HH=App.visibleHouseholds(), CH=App.visibleChildren();
    const due=HH.filter(h=>h.status!=='ok');
    const nadch=[...HH].sort((a,b)=>App.dayDiff(a.next.iso)-App.dayDiff(b.next.iso));
    const stat=(n,l)=>`<div class="m-stat"><div class="m-num">${n}</div><div class="m-lbl">${l}</div></div>`;
    return head({large:'Přehled',action:`<button class="m-iconbtn" onclick="MApp.openSearch()" title="Hledat">${svg(IC.search,24)}</button>`})+`<div class="m-scroll">
      <div class="m-stats">${stat(HH.length,'Rodin')}${stat(CH.length,'Dětí')}${stat(due.length,'Vyžaduje pozornost')}${stat(mTasks.length,'Otevřené úkoly')}</div>
      <div class="m-sec">Vyžaduje pozornost</div>
      <div class="m-group">${due.length?due.map(h=>row(`hub.html?typ=pestoun&id=${firstFoster(h)}`,App.avatar(famName(h),null,h.photo,40,'sq'),esc(famName(h)),`${h.worker} · ${App.fmtDateTime(h.next)}`,`<span class="m-badge ${h.status}">${App.STATUS[h.status][1]}</span>`)).join(''):'<div class="m-empty" style="padding:24px">Vše v pořádku </div>'}</div>
      <div class="m-sec">Nadcházející návštěvy</div>
      <div class="m-group">${nadch.slice(0,6).map(h=>{const d=App.dayDiff(h.next.iso);const c=d<0?'due':(d<=7?'warn':'');const t=d<0?'po termínu':d===0?'dnes':'za '+d+' d';return row(`hub.html?typ=pestoun&id=${firstFoster(h)}`,App.avatar(famName(h),null,h.photo,40,'sq'),esc(famName(h)),App.fmtDateTime(h.next),`<span class="m-badge ${c}" style="${c?'':'background:var(--active);color:var(--text-2)'}">${t}</span>`);}).join('')}</div>
    </div>`;
  }

  /* ============================================================ RODINY */
  function scrPestouni(){
    const q=MApp_q.toLowerCase();
    const HH=App.visibleHouseholds().filter(h=>!q||h.name.toLowerCase().includes(q)||h.city.toLowerCase().includes(q)||h.worker.toLowerCase().includes(q));
    return head({large:'Pěstouni',search:true,searchPh:'Hledat rodinu, KO, město…'})+`<div class="m-scroll">
      <div class="m-group">${HH.length?HH.map(h=>{
        const fosters=h.fosters.filter(f=>f.isFoster).map(f=>f.n.replace(/\(.*?\)/,'').trim()).join(' & ');
        return row(`hub.html?typ=pestoun&id=${firstFoster(h)}`,App.avatar(famName(h),null,h.photo,40,'sq'),esc(famName(h)),`${esc(fosters)} · ${h.city}`,`<span class="m-badge ${h.status}">${App.STATUS[h.status][1]}</span>`);
      }).join(''):'<div class="m-empty">Nic nenalezeno</div>'}</div>
    </div>`;
  }

  /* ============================================================ DĚTI */
  function scrDeti(){
    const q=MApp_q.toLowerCase();
    const CH=App.visibleChildren().filter(k=>!q||k.n.toLowerCase().includes(q));
    return head({large:'Děti',back:"MApp.back()",search:true,searchPh:'Hledat dítě…'})+`<div class="m-scroll">
      <div class="m-group">${CH.length?CH.map(k=>row(`hub.html?typ=dite&id=${k.id}`,App.avatar(k.n,k.care,k.photo,40),esc(k.n),`${k.age} let · ${k.household.name.replace('Domácnost ','')}`,`<span class="m-dot" style="background:${App.CARE[k.care][2]}"></span>`)).join(''):'<div class="m-empty">Nic nenalezeno</div>'}</div>
    </div>`;
  }

  /* ============================================================ OSTATNÍ */
  function scrOstatni(){
    const q=MApp_q.toLowerCase();
    const list=App.institutions().filter(i=>!q||(i.name+' '+(i.org||'')).toLowerCase().includes(q));
    return head({large:'Ostatní',back:"MApp.back()",search:true,searchPh:'Hledat instituci…'})+`<div class="m-scroll">
      <div class="m-sec">Instituce (${App.institutions().length})</div>
      <div class="m-group">${list.map(i=>row(null,App.avatar(i.name,null,null,40,'sq'),esc(i.name),esc(App.instCatLabel(i.cat)+(i.org?' · '+i.org:'')),'',`MApp.instDetail('${i.id}')`)).join('')||'<div class="m-empty">Nic nenalezeno</div>'}</div>
    </div>`;
  }

  /* ============================================================ ÚKOLY */
  function scrUkoly(){
    const order=['Po termínu','Dnes','Tento týden','Tento měsíc','Později','Bez termínu'];
    const byB={}; mTasks.forEach(t=>{const b=App.dateBucket(t.due);(byB[b]=byB[b]||[]).push(t);});
    const groups=order.filter(b=>byB[b]);
    return head({large:'Úkoly'})+`<div class="m-scroll">
      ${groups.length?groups.map(b=>`<div class="m-sec">${b}</div><div class="m-group">${byB[b].map(t=>{
        const over=App.dayDiff(t.due)<0;
        return row(null,`<span class="m-dot" style="background:${over?'var(--alert-due)':'var(--alert-warn)'};width:11px;height:11px"></span>`,esc(t.title),`${esc(t.ename||'')} · ${t.owner}`,`<span style="${over?'color:var(--alert-due);font-weight:600':'color:var(--text-2)'};font-size:13px">${App.fmtDate(t.due)}</span>`,`MApp.taskDetail(${mTasks.indexOf(t)})`);
      }).join('')}</div>`).join(''):'<div class="m-empty">Žádné úkoly </div>'}
    </div>`;
  }

  /* ============================================================ VZDĚLÁVÁNÍ */
  function scrVzdelavani(){
    const q=MApp_q.toLowerCase();
    const st=p=>p.eduDone>=p.req?'done':(p.eduDone>=p.req*0.6?'mid':'low');
    const all=App.visibleFosters();
    let FO=q?all.filter(p=>p.n.toLowerCase().includes(q)||p.household.name.toLowerCase().includes(q)):all;
    const low=all.filter(p=>st(p)==='low');
    const totDone=all.reduce((a,p)=>a+p.eduDone,0), totReq=all.reduce((a,p)=>a+p.req,0);
    const stat=(n,l)=>`<div class="m-stat"><div class="m-num">${n}</div><div class="m-lbl">${l}</div></div>`;
    let body=`<div class="m-stats">${stat(all.length,'Pěstounů')}${stat(totReq?Math.round(totDone/totReq*100)+' %':'—','Splněnost')}${stat(low.length,'Pod plánem')}</div>`;
    [['low','Pod plánem'],['mid','Rozpracováno'],['done','Splněno']].forEach(([k,lbl])=>{ const list=FO.filter(p=>st(p)===k); if(!list.length)return;
      body+=`<div class="m-sec">${lbl} (${list.length})</div><div class="m-group">${list.map(p=>{const pct=Math.round(p.eduDone/p.req*100);
        return `<a class="m-row" href="hub.html?typ=pestoun&id=${p.id}&sec=vzdelavani">${App.avatar(p.n,null,p.photo,40,'sq')}<div class="m-rmeta"><div class="m-rt">${esc(p.n)}</div><div class="m-rs">${p.eduDone}/${p.req} h · povinnost ${p.req} h</div><div style="margin-top:6px;max-width:300px">${App.eduBar(p.eduDone,p.req,true)}</div></div><div class="m-rtrail"><b>${pct}&nbsp;%</b></div></a>`;}).join('')}</div>`;
    });
    return head({large:'Vzdělávání'})+`<div class="m-scroll">${body}</div>`;
  }

  /* ============================================================ DOKUMENTY */
  const KINDC={PDF:'var(--alert-due)',DOCX:'var(--blue)',XLSX:'var(--green)',JPG:'#8B5CF6',PNG:'#8B5CF6'};
  function scrDokumenty(){
    const q=MApp_q.toLowerCase();
    const seed=App.allDocs().map(d=>({d,s:false})); const saved=(App.allSavedDocs?App.allSavedDocs():[]).map(d=>({d,s:true}));
    const DS=seed.concat(saved).filter(({d})=>!q||((d.name||'')+' '+(d.ename||'')).toLowerCase().includes(q));
    return head({large:'Dokumenty',back:"MApp.back()",search:true,searchPh:'Hledat dokument…'})+`<div class="m-scroll">
      ${App.can('docs.upload')?`<button class="m-btn-primary" style="margin:4px 0 12px;display:flex;align-items:center;justify-content:center;gap:8px" onclick="MApp.aiScan()">${svg(IC.camera,18)} Vyfotit / nahrát a přečíst (AI)</button>`:''}
      <div class="m-group">${DS.length?DS.map(({d,s})=>{
        const did=s?d.id:App.importSeedDoc(d).id; const kind=d.kind||(d.src?'PNG':'DOC');
        const av=d.thumb?`<span class="avatar sq" style="background-image:url('${d.thumb}');background-size:cover;background-position:center"></span>`:`<span class="avatar sq" style="background:${KINDC[kind]||'var(--text-2)'};color:#fff;font-size:10px;font-weight:700">${kind}</span>`;
        return `<div class="m-row" onclick="App.openDocPreview('${did}')">${av}<div class="m-rmeta"><div class="m-rt">${esc(d.name)}</div><div class="m-rs">${(s?(d.typ||'Dokument'):(App.DOC_CATS[d.cat]||'—'))} · ${esc(d.ename||'')}</div></div><div class="m-rtrail"><span style="font-size:12px;color:var(--text-3)">${App.fmtDate(d.date)}</span>${chev}</div></div>`;
      }).join(''):'<div class="m-empty">Nic nenalezeno</div>'}</div>
    </div>`;
  }

  /* ============================================================ KALENDÁŘ */
  const WK_HH=46, WK_WD=110;
  // souvislý rozsah dnů pro týdenní pohled: od pondělí (týden -1) do +9 týdnů
  const WEEK_BASE=mondayOf(new Date(TODAY+'T00:00:00'));      // pondělí aktuálního týdne
  const WEEK_RANGE_START=-7;                                   // začínáme týden zpět
  const WEEK_DAYS=70;                                          // 10 týdnů
  const WEEK_START_IDX=7+dowi(new Date(TODAY+'T00:00:00'));    // index dneška v rozsahu → default scroll
  let calView='agenda', calCursor=new Date(2026,5,20), calSel=TODAY;
  function calSeg(){
    return `<div class="m-seg">${[['agenda','Agenda'],['den','Den'],['tyden','Týden'],['mesic','Měsíc']].map(([v,l])=>`<button class="${calView===v?'on':''}" onclick="MApp.calView('${v}')">${l}</button>`).join('')}</div>`;
  }
  function scrKalendar(){
    let body;
    if(calView==='agenda') body=calAgenda();
    else if(calView==='den') body=calDen();
    else if(calView==='tyden') return head({large:'Kalendář',seg:calSeg()})+calTyden();
    else body=calMesic();
    return head({large:'Kalendář',seg:calSeg()})+`<div class="m-scroll">${body}</div>`;
  }
  function evsOn(iso){ return mEvents.filter(e=>e.date===iso).sort((a,b)=>toMin(a.start)-toMin(b.start)); }
  function tasksOn(iso){ return mTasks.filter(t=>t.due===iso); }
  function calAgenda(){
    const start=new Date(calCursor), byDay={};
    mEvents.forEach(e=>{ if(e.date>=isoOf(start)) (byDay[e.date]=byDay[e.date]||[]).push({ev:e}); });
    mTasks.forEach(t=>{ if(t.due>=isoOf(start)) (byDay[t.due]=byDay[t.due]||[]).push({task:t}); });
    const dates=Object.keys(byDay).sort().slice(0,40);
    if(!dates.length) return '<div class="m-empty">Žádné nadcházející události.</div>';
    return dates.map(date=>{
      const d=new Date(date+'T00:00:00');
      const items=byDay[date].sort((a,b)=>(a.task?9999:toMin(a.ev.start))-(b.task?9999:toMin(b.ev.start)));
      const hol=App.holidaysFor(date); const holTxt=[hol.state,hol.nameday?'svátek '+hol.nameday:''].filter(Boolean).join(' · ');
      return `<div class="m-sec">${date===TODAY?'Dnes · ':''}${d.getDate()}. ${MN[d.getMonth()]} · ${DOWl[dowi(d)]}${holTxt?` · ${holTxt}`:''}</div>
      <div class="m-group">${items.map(it=>{
        if(it.task){const ti=mTasks.indexOf(it.task);const t=it.task;return `<div class="m-row" onclick="MApp.taskDetail(${ti})"><div class="m-ag-time">⚑</div><div class="m-ag-bar" style="background:var(--alert-warn)"></div><div class="m-rmeta"><div class="m-rt">${esc(t.title)}</div><div class="m-rs">Úkol · ${esc(t.ename||'')}</div></div></div>`;}
        const e=it.ev;const idx=mEvents.indexOf(e);return `<div class="m-row" onclick="MApp.evDetail(${idx})"><div class="m-ag-time">${e.start}</div><div class="m-ag-bar" style="background:${evColor(e)}"></div><div class="m-rmeta"><div class="m-rt">${esc(e.title)}</div><div class="m-rs">${e.start}–${addMin(e.start,e.dur)} · ${App.workerFull(e.owner)}${e.loc?' · '+esc(e.loc):''}</div></div></div>`;
      }).join('')}</div>`;
    }).join('');
  }
  function calDen(){
    const iso=calSel; const d=new Date(iso+'T00:00:00');
    const evs=evsOn(iso), tks=tasksOn(iso);
    const nav=`<div class="m-head-bar" style="height:auto;padding:0 8px 8px"><button class="m-iconbtn" onclick="MApp.dayNav(-1)">${svg(IC.back,22)}</button><div class="m-htitle">${d.getDate()}. ${MN[d.getMonth()]} ${d.getFullYear()} · ${DOWl[dowi(d)]}</div><button class="m-iconbtn" onclick="MApp.dayNav(1)" style="transform:rotate(180deg)">${svg(IC.back,22)}</button></div>`;
    let rows='';
    if(tks.length) rows+=`<div class="m-group">${tks.map(t=>`<div class="m-row" onclick="MApp.taskDetail(${mTasks.indexOf(t)})"><div class="m-ag-time">⚑</div><div class="m-ag-bar" style="background:var(--alert-warn)"></div><div class="m-rmeta"><div class="m-rt">${esc(t.title)}</div><div class="m-rs">Úkol</div></div></div>`).join('')}</div>`;
    rows+=`<div class="m-group">${evs.length?evs.map(e=>`<div class="m-row" onclick="MApp.evDetail(${mEvents.indexOf(e)})"><div class="m-ag-time">${e.start}</div><div class="m-ag-bar" style="background:${evColor(e)}"></div><div class="m-rmeta"><div class="m-rt">${esc(e.title)}</div><div class="m-rs">${e.start}–${addMin(e.start,e.dur)} · ${App.workerFull(e.owner)}${e.loc?' · '+esc(e.loc):''}</div></div></div>`).join(''):'<div class="m-empty">Žádné události tento den.</div>'}</div>`;
    return `<div class="m-scroll">${nav}${rows}</div>`;
  }
  function calTyden(){
    const days=[]; for(let i=0;i<WEEK_DAYS;i++) days.push(addDays(WEEK_BASE,WEEK_RANGE_START+i));
    const colW=WEEK_DAYS*WK_WD;
    const headCells=days.map(d=>{const di=isoOf(d);return `<div class="wh ${di===TODAY?'today':''}" style="width:${WK_WD}px"><div>${DOWs[dowi(d)]}</div><div class="wd">${d.getDate()}</div></div>`;}).join('');
    const hours=[]; for(let h=0;h<24;h++) hours.push(`<div class="wg" style="height:${WK_HH}px"><span>${h}:00</span></div>`);
    const colsHtml=days.map(d=>{const di=isoOf(d); const we=dowi(d)>=5;
      const evs=evsOn(di).map(e=>{const idx=mEvents.indexOf(e);const top=toMin(e.start)/60*WK_HH;const ht=Math.max(20,e.dur/60*WK_HH-2);const c=evColor(e);
        return `<div class="m-wk-ev" style="top:${top}px;height:${ht}px;background:color-mix(in srgb,${c} 16%,var(--surface));border-left-color:${c}" onclick="event.stopPropagation();MApp.evDetail(${idx})"><div class="t">${e.start} ${esc(e.title)}</div></div>`;}).join('');
      const now=di===TODAY?`<div class="m-wk-now" style="top:${toMin(NOW)/60*WK_HH}px"></div>`:'';
      return `<div class="m-week-col ${we?'wend':''}" style="width:${WK_WD}px;height:${24*WK_HH}px;background:repeating-linear-gradient(var(--surface),var(--surface) ${WK_HH-1}px,var(--border) ${WK_HH-1}px,var(--border) ${WK_HH}px)" onclick="MApp.weekSlot(event,'${di}')">${now}${evs}</div>`;
    }).join('');
    const startIso=isoOf(addDays(WEEK_BASE,WEEK_RANGE_START+WEEK_START_IDX));
    return `<div class="m-week">
      <div class="m-weeknav"><button class="m-iconbtn" onclick="MApp.weekNav(-1)">${svg(IC.back,22)}</button><div class="t" id="m-week-title">Týden ${App.isoWeek(startIso)}</div><button class="m-iconbtn" onclick="MApp.weekNav(1)" style="transform:rotate(180deg)">${svg(IC.back,22)}</button></div>
      <div class="m-week-head"><div class="m-week-corner"></div><div class="m-week-headscroll"><div class="m-week-headrow" style="width:${colW}px">${headCells}</div></div></div>
      <div class="m-week-main"><div class="m-week-gut"><div class="m-week-gutinner">${hours.join('')}</div></div>
        <div class="m-week-body"><div class="m-week-cols" style="width:${colW}px">${colsHtml}</div></div></div></div>`;
  }
  function calMesic(){
    const y=calCursor.getFullYear(),m=calCursor.getMonth();
    const first=new Date(y,m,1); const start=addDays(first,-dowi(first));
    let cells='';
    for(let i=0;i<42;i++){const d=addDays(start,i);const iso=isoOf(d);const out=d.getMonth()!==m;
      const dots=[...new Set(evsOn(iso).map(e=>evColor(e)))].slice(0,3);
      cells+=`<div class="m-cal-cell ${out?'out':''} ${iso===TODAY?'today':''} ${iso===calSel?'sel':''}" onclick="MApp.pickDay('${iso}')"><span class="d">${d.getDate()}</span><span class="m-cal-dots">${dots.map(c=>`<i style="background:${c}"></i>`).join('')}</span></div>`;
    }
    const monthNav=`<div class="m-head-bar" style="height:auto;padding:2px 8px 10px"><button class="m-iconbtn" onclick="MApp.monNav(-1)">${svg(IC.back,22)}</button><div class="m-htitle">${MNc[m]} ${y}</div><button class="m-iconbtn" onclick="MApp.monNav(1)" style="transform:rotate(180deg)">${svg(IC.back,22)}</button></div>`;
    const dow=`<div class="m-cal-grid">${DOWs.map(x=>`<div class="m-cal-dow">${x}</div>`).join('')}</div>`;
    const evs=evsOn(calSel), tks=tasksOn(calSel); const sd=new Date(calSel+'T00:00:00');
    const list=`<div class="m-sec">${calSel===TODAY?'Dnes · ':''}${sd.getDate()}. ${MN[sd.getMonth()]} · ${DOWl[dowi(sd)]}</div><div class="m-group">${(tks.length||evs.length)?
      tks.map(t=>`<div class="m-row" onclick="MApp.taskDetail(${mTasks.indexOf(t)})"><div class="m-ag-time">⚑</div><div class="m-ag-bar" style="background:var(--alert-warn)"></div><div class="m-rmeta"><div class="m-rt">${esc(t.title)}</div><div class="m-rs">Úkol</div></div></div>`).join('')+
      evs.map(e=>`<div class="m-row" onclick="MApp.evDetail(${mEvents.indexOf(e)})"><div class="m-ag-time">${e.start}</div><div class="m-ag-bar" style="background:${evColor(e)}"></div><div class="m-rmeta"><div class="m-rt">${esc(e.title)}</div><div class="m-rs">${App.workerFull(e.owner)}${e.loc?' · '+esc(e.loc):''}</div></div></div>`).join('')
      :'<div class="m-empty" style="padding:20px">Žádné události.</div>'}</div>`;
    return monthNav+dow+`<div class="m-cal-grid">${cells}</div>`+list;
  }

  /* ============================================================ HUB */
  function personOf(typ,id){
    if(typ==='dite'){ const p=App.allChildren().find(k=>k.id===id); if(p) return {p,name:p.n,sub:`${p.age} let · ${App.CARE[p.care][1]} · ${p.household.name.replace('Domácnost ','')}`,care:p.care,photo:p.photo,shape:'',h:p.household}; }
    const p=App.allFosters().find(f=>f.id===id); if(p) return {p,name:p.n,sub:`Pěstoun · ${p.household.name.replace('Domácnost ','')} · ${p.household.city}`,care:null,photo:p.photo,shape:'sq',h:p.household};
    return null;
  }
  let hubSec=(route.page==='hub.html'&&((route.params||{}).typ==='pestoun'||(route.params||{}).typ==='dite'))?'osa':'udaje';
  let visit=null; // aktivní návštěva: {typ,id,t0} – terénní "nahrávání" času
  /* Osa = syntéza chat + časová osa (jeden proud App.chatList) */
  function chatStream(id,scope){
    const list=App.chatList(id).filter(m=>m.scope===scope);
    return list.map(m=>{
      const cat=App.CHAT_CATS[m.cat]||['',''];
      if(m.who==='sys'){
        const dt=m.date?' · '+App.fmtDate(m.date):'';
        const big=!!m.doc||/podeps|report|zpráv|založ|archiv|převod|schvál|ukončen|výroč|smlouv|dohod/i.test(m.text||'');
        if(big) return `<div class="m-msg sysbig"><div class="m-sysbubble"><span class="ic">${svg(m.doc?IC.doc:IC.bell,18)}</span><div style="flex:1">${esc(m.text)}<div style="color:var(--text-3);font-size:11px;margin-top:2px">${cat[0]}${dt}</div></div></div></div>`;
        return `<div class="m-msg sys"><div class="m-bubble">${esc(m.text)} · ${cat[0]}${dt}</div></div>`;
      }
      const tag=`<div style="font-size:10px;color:${cat[1]};font-weight:700;margin-bottom:2px">${cat[0].toUpperCase()}</div>`;
      return `<div class="m-msg ${m.who==='me'?'me':'them'}"><div class="m-bubble">${tag}${esc(m.text)}<div class="tm">${m.time||''}</div></div></div>`;
    }).join('')||'<div class="m-empty" style="padding:30px 16px">Zatím žádné záznamy.<br><span style="font-size:13px;color:var(--text-3)">Přidej zápis tlačítky dole.</span></div>';
  }
  /* Příbuzní / rodiče + sourozenci v systému (karta dítěte) */
  function relsBlockM(id){ const k=App.diteById(id); if(!k)return ''; const rs=k.relatives||[];
    const groups={}; rs.forEach(r=>{ const m=App.relMeta(r.rel); (groups[m.g]=groups[m.g]||[]).push({r,m}); });
    const order=['Matka','Otec','Sourozenci','Osvojitel / zástupce','Širší rodina'];
    const badge=m=> m.legal===true?'<span style="font-size:10px;background:#e6f6ec;color:#1a8a4a;border-radius:9px;padding:1px 7px;margin-left:6px">práva</span>': m.legal===false?'<span style="font-size:10px;background:var(--alert-due-soft);color:var(--alert-due);border-radius:9px;padding:1px 7px;margin-left:6px">bez práv</span>': m.legal==='rep'?'<span style="font-size:10px;background:var(--active);color:var(--text-2);border-radius:9px;padding:1px 7px;margin-left:6px">zástupce</span>':'';
    let html='<div class="m-sec">Příbuzní / rodiče</div><div class="m-group">';
    html+= rs.length? order.filter(g=>groups[g]).map(g=>`<div class="m-rs" style="padding:8px 14px 2px;text-transform:uppercase;font-size:11px">${g}</div>`+groups[g].map(({r,m})=>`<div class="m-row" style="cursor:default"><span class="avatar sq" style="width:34px;height:34px;font-size:11px;background:var(--avatar-neutral)">${App.ini(r.n)}</span><div class="m-rmeta"><div class="m-rt">${esc(r.n)}${badge(m)}</div><div class="m-rs">${esc(r.rel)}${r.rc?' · RČ '+esc(r.rc):''}${r.note?' · '+esc(r.note):''}</div></div></div>`).join('')).join('') : '<div class="m-empty" style="padding:18px">Zatím bez evidovaných příbuzných.</div>';
    html+=`</div><button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;margin:8px 16px 0;width:auto;justify-content:center;gap:8px;color:var(--accent);font-weight:600" onclick="MApp.relAdd('${id}')">${svg(IC.plus,18)} Přidat příbuzného</button>`;
    const sibs=App.linkedSiblings(id);
    if(sibs.length){ html+='<div class="m-sec">Sourozenci v systému</div><div class="m-group">'+sibs.map(s=>`<a class="m-row" onclick="MApp.go('hub.html?typ=dite&id=${s.id}')">${App.avatar(s.n,s.care,null,34,'')}<div class="m-rmeta"><div class="m-rt">${esc(s.n)}</div><div class="m-rs">${s.type} · společný rodič: ${esc(s.via)}</div></div>${chev}</a>`).join('')+'</div>'; }
    return html; }
  function hubDock(typ,id){
    const active = visit && visit.id===id && visit.typ===typ;
    const canNote=App.can('notes.add'), canDoc=App.can('docs.upload');
    const qbtn=(emoji,label,onclick,on)=>`<button ${on?'':'disabled style="opacity:.4"'} onclick="${onclick}"><span class="qi">${emoji}</span>${label}</button>`;
    return `<div class="m-hubdock">
      <button class="m-visitbtn ${active?'rec':''}" onclick="MApp.visitToggle('${typ}','${id}')">
        ${active?`<span class="m-recdot"></span> Ukončit návštěvu · <span id="m-visit-t">0:00</span>`:`<span class="m-recdot" style="animation:none"></span> Začít návštěvu`}
      </button>
      <div class="m-hubquick">
        ${qbtn(svg(IC.mic,21),'Hlas',`MApp.quickCapture('${typ}','${id}',true)`,canNote)}
        ${qbtn(svg(IC.camera,21),'Foto',`MApp.aiScan()`,canDoc)}
        ${qbtn(svg(IC.edit,21),'Zápis',`MApp.quickCapture('${typ}','${id}',false)`,canNote)}
        ${qbtn(svg(IC.check,21),'Checklist',`MApp.checklist('${typ}','${id}')`,canNote)}
        ${qbtn(svg(IC.sign,21),'Podpis',`MApp.signNew('${typ}','${id}')`,canDoc)}
      </div>
    </div>`;
  }
  function scrHub(){
    const typ=route.params.typ||'pestoun', id=route.params.id;
    const o=personOf(typ,id);
    const name=o?o.name:'Kontakt', h=o&&o.h;
    const docs=App.allDocs().filter(d=>d.eid===id);
    const savedDocs=App.docList?App.docList(id):[];
    const docCount=docs.length+savedDocs.length;
    const tasks=mTasks.filter(t=>t.eid===id);
    const evs=mEvents.filter(e=>e.eid===id).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    const isFoster=typ==='pestoun';
    const segs=[['osa','Osa'],['udaje','Údaje'],['dokumenty','Dokumenty ('+docCount+')'],['kalendar','Kalendář'],...(isFoster&&o&&o.p&&o.p.req?[['vzdelavani','Vzdělávání']]:[]),['report','Report']];
    const info=[];
    if(h){ info.push(['KO',App.workerFull(h.worker),IC.users]); info.push(['Telefon',h.phone,IC.phone]); info.push(['Adresa',h.city+(h.district?', '+h.district:''),IC.map]); info.push(['Organizace',h.do,IC.home]); }
    let content='';
    if(hubSec==='osa'){
      const seg=`<div class="m-seg" style="margin:8px 16px 4px">${[['internal','Interní (DO)'],['pestoun','S pěstounem']].map(([k,l])=>`<button class="${chatScope===k?'on':''}" onclick="MApp.chatScope('${k}')">${l}</button>`).join('')}</div>`;
      content=seg+`<div class="m-osa">${chatStream(id,chatScope)}</div>`;
    } else if(hubSec==='udaje'){
      content=`<div class="m-group">${info.map(([k,v,ic])=>`<a class="m-row" ${k==='Telefon'?`href="tel:${v.replace(/\\s/g,'')}"`:(k==='Adresa'?`href="${navLink(v)}" target="_blank"`:'')} style="${k==='KO'||k==='Organizace'?'cursor:default':''}">${svg(ic,20)}<div class="m-rmeta"><div class="m-rs">${k}</div><div class="m-rt" style="font-size:15px">${esc(v)}</div></div>${(k==='Telefon'||k==='Adresa')?chev:''}</a>`).join('')}</div>
        ${tasks.length?`<div class="m-sec">Úkoly (${tasks.length})</div><div class="m-group">${tasks.map(t=>`<div class="m-row" onclick="MApp.taskDetail(${mTasks.indexOf(t)})"><span class="m-dot" style="background:var(--alert-warn);width:11px;height:11px"></span><div class="m-rmeta"><div class="m-rt">${esc(t.title)}</div><div class="m-rs">${App.fmtDate(t.due)}</div></div>${chev}</div>`).join('')}</div>`:''}
        ${h?(()=>{const vyk=App.respitVykazano(h.id),real=App.respitRealny(h.id),lim=App.respitLimit(h.id);const warn=vyk>0&&real<vyk;return `<div class="m-sec">Respit ${h.kids.length>1?'(rodina)':''}</div><div class="m-group" style="padding:12px">
          <div style="display:flex;justify-content:space-between;font-size:14px"><span>Vykázaný</span><b>${vyk} / ${lim} d</b></div>
          <div style="height:8px;border-radius:5px;background:var(--active);margin:6px 0;overflow:hidden"><div style="height:100%;width:${Math.min(100,Math.round(vyk/lim*100))}%;background:var(--accent)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:14px"><span>Skutečný odpočinek</span><b style="color:${real>0?'var(--alert-ok)':'var(--alert-due)'}">${real} d</b></div>
          ${warn?`<div class="m-rs" style="color:var(--alert-due);margin-top:6px">Pěstoun nečerpá souběžný respit (vždy má doma dítě).</div>`:''}
          ${typ==='dite'?(()=>{const z=App.spvppZustatek(id),w=App.spvppWallet(id);return `<div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px;border-top:1px solid var(--border);padding-top:8px"><span>SPVPP zůstatek</span><b style="color:${z<0?'var(--alert-due)':'inherit'}">${z.toLocaleString('cs')} Kč</b></div>`;})():''}
        </div>`;})():''}`+(typ==='dite'?relsBlockM(id):'');
    } else if(hubSec==='dokumenty'){
      const all=docs.map(d=>({d,s:false})).concat(savedDocs.map(d=>({d,s:true})));
      content=`<div class="m-group">${all.length?all.map(({d,s})=>{
        const kind=d.kind||(d.src?'PNG':'DOC');
        const av=d.thumb?`<span class="avatar sq" style="background-image:url('${d.thumb}');background-size:cover;background-position:center"></span>`:`<span class="avatar sq" style="background:${KINDC[kind]||'var(--text-2)'};color:#fff;font-size:10px;font-weight:700">${kind}</span>`;
        const sub=(s?(d.typ||'Dokument'):(App.DOC_CATS[d.cat]||'—'))+' · '+App.fmtDate(d.date);
        const click=`App.openDocPreview('${s?d.id:App.importSeedDoc(d).id}')`;
        return `<div class="m-row" onclick="${click}">${av}<div class="m-rmeta"><div class="m-rt">${esc(d.name)}</div><div class="m-rs">${sub}</div></div>${chev}</div>`;
      }).join(''):'<div class="m-empty" style="padding:24px">Žádné dokumenty</div>'}</div>`;
    } else if(hubSec==='kalendar'){
      content=`<div class="m-group">${evs.length?evs.map(e=>`<div class="m-row" onclick="MApp.evDetail(${mEvents.indexOf(e)})"><div class="m-ag-time" style="width:46px">${App.fmtDate(e.date).replace(/ \\d{4}$/,'')}</div><div class="m-ag-bar" style="background:${evColor(e)}"></div><div class="m-rmeta"><div class="m-rt">${esc(e.title)}</div><div class="m-rs">${e.start} · ${App.workerFull(e.owner)}</div></div></div>`).join(''):'<div class="m-empty" style="padding:24px">Žádné události navázané na tento kontakt</div>'}</div>`;
    } else if(hubSec==='vzdelavani'){
      const p=o.p; const pct=Math.min(100,Math.round(p.eduDone/p.req*100));
      content=`<div class="m-group" style="padding:16px"><div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600"><span>Splněno</span><span>${p.eduDone} / ${p.req} h</span></div>
        <div style="height:10px;border-radius:6px;background:var(--active);margin-top:10px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pct>=100?'var(--alert-ok)':pct>=60?'var(--alert-warn)':'var(--alert-due)'}"></div></div>
        <div class="m-rs" style="margin-top:8px">Zákonná povinnost ${p.req} h ročně. ${pct>=100?'Splněno ✓':'Chybí '+(p.req-p.eduDone)+' h.'}</div></div>`;
    } else if(hubSec==='report'){
      const presets=[['1. pololetí 2026','2026-01-01','2026-06-30'],['2. pololetí 2026','2026-07-01','2026-12-31'],['Celý rok 2026','2026-01-01','2026-12-31'],['Poslední 3 měsíce','2026-03-20','2026-06-20']];
      content=`<div class="m-group" style="padding:16px">
        <div class="m-rs" style="margin-bottom:10px">Vyber období – sestaví se zpráva o průběhu náhradní rodinné péče pro OSPOD.</div>
        ${presets.map(([l,f,t])=>`<button class="m-list-action" style="border-top:1px solid var(--border)" onclick="MApp.openReport('${typ}','${id}','${f}','${t}')">${svg(IC.doc,20)}<span style="flex:1">${l}</span>${chev}</button>`).join('')}
      </div>`;
    }
    return `<header class="m-head"><div class="m-head-bar"><button class="m-iconbtn m-back" onclick="MApp.back()">${svg(IC.back,24)}Zpět</button><div class="m-htitle"></div><span style="width:40px"></span></div></header>
    <div class="m-scroll m-hub-scroll">
      <div style="padding:14px 16px 6px">
        <div class="m-hubfaces">
          ${App.avatar(name,o&&o.care,o&&o.photo,72,o?o.shape:'sq')}
          ${(isFoster&&h&&h.kids&&h.kids.length)?`<span class="m-hubplus">+</span>`+h.kids.map(k=>`<a class="m-hubkid" onclick="MApp.go('hub.html?typ=dite&id=${k.id}')" title="${esc(k.n)}">${App.avatar(k.n,k.care,k.photo,46,'')}<span>${esc(k.n.split(' ')[0])}</span></a>`).join(''):''}
        </div>
        <div style="text-align:center;font-size:22px;font-weight:800;margin-top:12px">${esc(name)}</div>
        <div style="text-align:center;color:var(--text-2);font-size:14px;margin-top:3px">${esc(o?o.sub:'')}</div>
      </div>
      <div class="m-hubseg">${segs.map(([k,l])=>`<button class="${hubSec===k?'on':''}" onclick="MApp.hubSec('${k}')">${l}</button>`).join('')}</div>
      ${content}
    </div>
    ${hubDock(typ,id)}`;
  }

  /* ============================================================ CHAT (časová osa) */
  function scrChat(){
    const typ=route.params.typ, id=route.params.id||'x';
    const o=personOf(typ,id); const name=o?o.name:'Osa';
    const stream=chatStream(id,chatScope);
    const seg=`<div class="m-seg" style="margin:8px 12px 4px">${[['internal','Interní (DO)'],['pestoun','S pěstounem']].map(([k,l])=>`<button class="${chatScope===k?'on':''}" onclick="MApp.chatScope('${k}')">${l}</button>`).join('')}</div>`;
    const cats=['note','visit','contact'];
    const catSel=`<select id="m-chat-cat" style="border:1px solid var(--border-2);border-radius:20px;padding:0 8px;font-size:12px;background:var(--surface);color:var(--text);flex-shrink:0">${cats.map(c=>`<option value="${c}">${App.CHAT_CATS[c][0]}</option>`).join('')}</select>`;
    return `<header class="m-head"><div class="m-head-bar"><button class="m-iconbtn m-back" onclick="MApp.back()">${svg(IC.back,24)}Zpět</button><div class="m-htitle">${esc(name)}</div>${o?App.avatar(name,o.care,o.photo,32,o.shape):''}<span style="width:8px"></span></div>${seg}</header>
    <div class="m-chat"><div class="m-chat-stream" id="m-chat-stream">${stream}</div>
      <div class="m-composer">${catSel}<input id="m-chat-input" placeholder="Napiš nebo nadiktuj…" onkeydown="if(event.key==='Enter')MApp.chatSend()"><button class="snd" id="m-mic" title="Diktovat" onclick="MApp.aiVoice()" style="background:var(--active);color:var(--text)">${svg(IC.mic,20)}</button><button class="snd" title="AI strukturace" onclick="MApp.aiStructure()" style="background:var(--active);color:var(--accent)">${svg(IC.ai,20)}</button><button class="snd" onclick="MApp.chatSend()">${svg(IC.send,20)}</button></div>
    </div>`;
  }

  /* ============================================================ REPORT (náhled + tisk) */
  function scrReport(){
    const data=App.reportData({etype:route.params.typ,eid:route.params.id,from:route.params.from,to:route.params.to});
    const action=repEdit
      ? `<button class="m-iconbtn" onclick="MApp.repSave()" title="Uložit">${svg('<path d="M20 6 9 17l-5-5"/>',24)}</button>`
      : `<button class="m-iconbtn" onclick="MApp.repEditToggle()" title="Upravit">${svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',24)}</button>`;
    const aiBtn=App.can('reports.generate')?`<button class="m-btn-primary no-print" style="margin:0 0 8px;background:var(--active);color:var(--accent);display:flex;align-items:center;justify-content:center;gap:8px" onclick="MApp.repAIDraft()">${svg(IC.ai,18)} Navrhnout draft (AI)</button><button class="m-btn-primary no-print" style="margin:0 0 12px;background:var(--active);color:var(--accent);display:flex;align-items:center;justify-content:center;gap:8px" onclick="MApp.reportAssistant()">${svg(IC.chat,18)} Asistent zprávy (AI)</button>`:'';
    const bar=repEdit
      ? `${aiBtn}<button class="m-btn-primary no-print" style="margin:0 0 12px" onclick="MApp.repSave()"> Uložit report (zapíše se do chatu)</button><div class="m-rs no-print" style="margin:-6px 0 10px">Klikni do textu/buněk a uprav. Lze přidávat i mazat řádky.</div>`
      : `${aiBtn}<button class="m-btn-primary no-print" style="margin:0 0 12px" onclick="MApp.repPrint()"> Tisk / Uložit PDF</button>`;
    return `<header class="m-head"><div class="m-head-bar"><button class="m-iconbtn m-back" onclick="MApp.back()">${svg(IC.back,24)}Zpět</button><div class="m-htitle">Report pro OSPOD</div>${action}</div></header>
    <div class="m-scroll" style="padding:12px 12px calc(var(--m-tab-h))">
      ${bar}
      <div id="reportPrint" class="report-doc${repEdit?' report-editing':''}">${App.reportInnerHtml(data,repEdit)}</div>
    </div>`;
  }

  /* ============================================================ REPORTY (mobil) */
  let repyPer='q', repyCharts=(App.reportCfgLoad?App.reportCfgLoad().charts!==false:true), repyModel={title:'report',meta:{},tables:[]};
  const RCOL={ok:'var(--alert-ok)',over:'var(--alert-due)',under:'#E08A00'};
  const ACT_M={visit:['Návštěvy','#22C55E'],contact:['Kontakty','#0BB1D5'],term:['Termíny','#FF7F4D'],edu:['Vzdělávání','#3380FF'],other:['Ostatní','#8B5CF6']};
  const SPCAT_M=[['Tábory','#3380FF'],['Doučování','#22C55E'],['Kroužky','#FF7F4D'],['Terapie','#8B5CF6'],['Ostatní','#8A8F98']];
  function spByCat_m(v){ const w=[0.34,0.24,0.18,0.14,0.10]; return SPCAT_M.map((c,i)=>({label:c[0],color:c[1],value:Math.round(v*w[i])})); }
  function pacePct(p){ return p.frac?Math.round(p.actual/(p.expected/p.frac||1)*100):0; }
  function paceColor(p){ return p.status==='over'?RCOL.over:(p.status==='under'?RCOL.under:RCOL.ok); }
  function mPace(p){ const rozp=p.frac>0?Math.round(p.expected/p.frac):0; const fill=rozp?Math.min(100,Math.round(p.actual/rozp*100)):0; const c=paceColor(p);
    const lbl=p.status==='over'?' riziko přečerpání':(p.status==='under'?' nedočerpává se':'✓ v plánu');
    return `<div class="m-pace"><i style="width:${fill}%;background:${c}"></i><b style="left:${Math.round(p.frac*100)}%"></b></div>
      <div class="m-rs">Čerpáno ${p.actual.toLocaleString('cs')} z ${rozp.toLocaleString('cs')} Kč · k dnešku ~${p.expected.toLocaleString('cs')} Kč · <b style="color:${c}">${lbl}</b></div>`; }
  function chartBox(t,svg){ return `<div class="m-chartbox"><div class="ct">${t}</div>${svg}</div>`; }
  function repPerSeg(){ return `<div class="m-seg" style="flex-wrap:wrap">${[['den','Den'],['tyden','Týden'],['mesic','Měsíc'],['q','Čtvrtletí'],['half','Pololetí'],['rok','Rok']].map(([k,l])=>`<button class="${repyPer===k?'on':''}" onclick="MApp.repyPer('${k}')">${l}</button>`).join('')}</div>`; }
  function chartsToggleRow(){ return `<label class="m-chip" style="cursor:pointer;user-select:none"><input type="checkbox" ${repyCharts?'checked':''} onchange="MApp.repyToggle(this.checked)" style="margin-right:6px;vertical-align:middle">Grafy</label>`; }

  function scrReporty(){
    const u=App.currentUser(), role=u.role;
    const exportAction=`<button class="m-iconbtn" title="Export" onclick="MApp.repyExport()">${svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',24)}</button>`;
    const {from,to,label}=App.periodRange(repyPer);
    let inner='';
    if(role==='externista'){ repyModel={title:'report',meta:{},tables:[]}; inner=`<div class="m-empty" style="padding:30px">Reporty nejsou pro externisty.<br><a class="m-chip" style="margin-top:10px;display:inline-block" onclick="MApp.go('vykaz.html')">Otevřít můj výkaz</a></div>`; }
    else if(role==='pestoun'||role==='dite'){
      const m=App.reportEntity(u.linkType,u.linkId,from,to);
      const actItems=Object.keys(ACT_M).map(k=>({label:ACT_M[k][0],color:ACT_M[k][1],value:m.byType[k]||0})).filter(x=>x.value>0);
      const risk=m.daysSince!=null&&m.daysSince>60;
      inner=`<div class="m-card"><div class="m-rt" style="font-size:16px;margin-bottom:6px">Můj přehled · ${esc(m.name)}</div>
        <div class="m-rs">Návštěvy <b>${m.visits}</b> · Kontakty <b>${m.contacts}</b> · Záznamy <b>${m.notes}</b></div>
        <div class="m-rs">Respit <b>${m.respitV}</b>/${m.respitLim} d (reálně ${m.respitR}) ${m.edu?'· Vzdělávání <b>'+m.edu.done+'/'+m.edu.req+' h</b>':''}</div>
        <div class="m-rs">Od posl. kontaktu: <b style="${risk?'color:var(--alert-due)':''}">${m.daysSince==null?'—':m.daysSince+' dní'+(risk?'':'')}</b></div></div>
        ${m.spvpp?`<div class="m-chartbox"><div class="ct">Čerpání SPVPP v roce</div>${mPace(m.spvpp.pacing)}</div>`:''}
        ${repyCharts?chartBox('Aktivita podle typu',App.chartDonut(actItems.length?actItems:[{label:'Žádná',color:'#ccc',value:1}]))+chartBox('Kontakty v čase',App.chartLine(m.trend)):''}`;
      repyModel={title:'Muj prehled '+m.name,meta:{Obdobi:label},tables:[{name:'Metriky',head:['Metrika','Hodnota'],rows:[['Návštěvy',m.visits],['Kontakty',m.contacts],['Záznamy',m.notes],['Respit',m.respitV+'/'+m.respitLim],['Od posl. kontaktu (dní)',m.daysSince==null?'':m.daysSince],m.edu?['Vzdělávání (h)',m.edu.done+'/'+m.edu.req]:null,m.spvpp?['SPVPP čerpáno',m.spvpp.vycerpano]:null].filter(Boolean)}]};
    }
    else if(role==='ko'||role==='asistent'){
      const worker=u.worker, r=App.reportKO(worker,from,to);
      const fam=r.households.map(h=>{const f=(h.fosters.find(x=>x.isFoster)||h.fosters[0]||{}); const m=App.reportEntity('pestoun',f.id,from,to); const sp=h.kids.reduce((a,k)=>{const w=App.spvppWallet(k.id);a.v+=w.vycerpano;a.r+=w.rozpocet;return a;},{v:0,r:0}); return {h,f,m,sp};});
      const allIds=r.households.flatMap(h=>[...h.fosters.map(f=>f.id),...h.kids.map(k=>k.id)]);
      const poTerm=fam.filter(x=>x.m.daysSince!=null&&x.m.daysSince>60);
      inner=`<div class="m-card"><div class="m-rt" style="font-size:16px;margin-bottom:6px">Moje práce · ${esc(App.workerFull(worker))}</div>
        <div class="m-rs">${r.rodin} rodin · Návštěvy <b>${r.visits}</b> · Kontakty <b>${r.contacts}</b> · Činností <b>${r.prace}</b></div>
        <div class="m-rs">Rodiny bez kontaktu &gt;60 dní: <b style="${poTerm.length?'color:var(--alert-due)':''}">${poTerm.length}</b>${poTerm.length?' ('+poTerm.map(x=>famName(x.h)).join(', ')+')':''}</div></div>
        <div class="m-chartbox"><div class="ct">Čerpání SPVPP kmene</div>${mPace(r.spvpp.pacing)}</div>
        ${repyCharts?chartBox('Návštěvy + kontakty dle rodin',App.chartBars(fam.map(x=>({label:famName(x.h).slice(0,8),value:x.m.visits+x.m.contacts}))))+chartBox('Aktivita kmene v čase',App.chartLine(App.monthlySeries(allIds,from,to)))+chartBox('SPVPP dle účelu (ilustrativní)',App.chartDonut(spByCat_m(r.spvpp.vycerpano),{suffix:' Kč'})):''}
        <div class="m-chartbox"><div class="ct">Rodiny – metriky</div><div style="overflow-x:auto"><table class="m-rep-tbl"><thead><tr><th>Rodina</th><th>Náv.</th><th>Kont.</th><th>Posl.</th><th>SPVPP</th></tr></thead><tbody>
          ${fam.map(x=>`<tr><td>${famName(x.h)}</td><td>${x.m.visits}</td><td>${x.m.contacts}</td><td>${x.m.daysSince==null?'—':x.m.daysSince+'d'+(x.m.daysSince>60?'':'')}</td><td>${x.sp.r?x.sp.v.toLocaleString('cs'):'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="m-rs">Žádné rodiny.</td></tr>'}
        </tbody></table></div></div>`;
      repyModel={title:'Report KO '+App.workerFull(worker),meta:{Obdobi:label,KlicovaOsoba:App.workerFull(worker),Rodin:r.rodin},tables:[{name:'Rodiny',head:['Rodina','Návštěvy','Kontakty','Od posl. kontaktu (dní)','Respit','Vzdělávání (h)','SPVPP čerpáno','SPVPP rozpočet'],rows:fam.map(x=>[famName(x.h),x.m.visits,x.m.contacts,x.m.daysSince==null?'':x.m.daysSince,x.m.respitV+'/'+x.m.respitLim,x.m.edu?x.m.edu.done+'/'+x.m.edu.req:'',x.sp.v,x.sp.r])}]};
    }
    else {
      const workers=[...new Set(App.households.map(h=>h.worker))];
      let totV=0,totC=0,totRoz=0,totVyc=0; const perKO=workers.map(w=>{const r=App.reportKO(w,from,to);totV+=r.visits;totC+=r.contacts;totRoz+=r.spvpp.rozpocet;totVyc+=r.spvpp.vycerpano;return {w,r};});
      const allIds=App.households.flatMap(h=>[...h.fosters.map(f=>f.id),...h.kids.map(k=>k.id)]);
      const orgPace=App.spvppPacing(totRoz,totVyc,to);
      inner=`<div class="m-card"><div class="m-rt" style="font-size:16px;margin-bottom:6px">Organizace – souhrn</div>
        <div class="m-rs">${workers.length} klíč. osob · ${App.households.length} rodin</div>
        <div class="m-rs">Návštěvy <b>${totV}</b> · Kontakty <b>${totC}</b> · SPVPP <b>${totVyc.toLocaleString('cs')}</b>/${totRoz.toLocaleString('cs')} Kč</div></div>
        <div class="m-chartbox"><div class="ct">Čerpání ročního SPVPP organizace</div>${mPace(orgPace)}</div>
        ${repyCharts?chartBox('Návštěvy dle klíčových osob',App.chartBars(perKO.map(x=>({label:App.workerFull(x.w).split(' ').pop().slice(0,8),value:x.r.visits}))))+chartBox('Aktivita organizace v čase',App.chartLine(App.monthlySeries(allIds,from,to)))+chartBox('SPVPP čerpání dle KO',App.chartDonut(perKO.map((x,i)=>({label:App.workerFull(x.w),color:SPCAT_M[i%SPCAT_M.length][1],value:x.r.spvpp.vycerpano})),{suffix:' Kč'})):''}
        <div class="m-chartbox"><div class="ct">Podle klíčových osob</div><div style="overflow-x:auto"><table class="m-rep-tbl"><thead><tr><th>Klíčová osoba</th><th>Rodin</th><th>Náv.</th><th>SPVPP</th><th>Stav</th></tr></thead><tbody>
          ${perKO.map(x=>{const p=x.r.spvpp.pacing;const c=paceColor(p);const s=p.status==='over'?'přečerp.':(p.status==='under'?'nedočerp.':'v plánu');return `<tr><td>${App.workerFull(x.w)}</td><td>${x.r.rodin}</td><td>${x.r.visits}</td><td>${x.r.spvpp.vycerpano.toLocaleString('cs')}</td><td style="color:${c}">${s}</td></tr>`;}).join('')}
        </tbody></table></div></div>`;
      repyModel={title:'Report organizace',meta:{Obdobi:label,KlicovychOsob:workers.length,Rodin:App.households.length,Navstevy:totV,Kontakty:totC},tables:[{name:'Podle KO',head:['Klíčová osoba','Rodin','Návštěvy','Kontakty','SPVPP čerpáno','SPVPP rozpočet'],rows:perKO.map(x=>[App.workerFull(x.w),x.r.rodin,x.r.visits,x.r.contacts,x.r.spvpp.vycerpano,x.r.spvpp.rozpocet])}]};
    }
    return head({large:'Reporty', barTitle:label, action:exportAction, seg:repPerSeg()})
      + `<div class="m-scroll" style="padding:10px 12px calc(var(--m-tab-h) + 12px)"><div style="margin:2px 0 8px">${chartsToggleRow()}</div>${inner}</div>`;
  }

  /* ============================================================ GLOBÁLNÍ HLEDÁNÍ */
  const SKIND_IC={'Rodina':IC.users,'Pěstoun':IC.users,'Dítě':IC.child,'Instituce':IC.home,'Dokument':IC.doc,'Událost':IC.cal,'Úkol':IC.check};
  let searchQ='';
  function searchResultsHtml(q){
    const res=App.searchAll(q);
    if(!q) return '<div class="m-empty">Hledej napříč kontakty, dokumenty, událostmi a úkoly.</div>';
    if(!res.length) return '<div class="m-empty">Nic nenalezeno.</div>';
    const order=['Rodina','Pěstoun','Dítě','Instituce','Dokument','Událost','Úkol']; const by={};
    res.forEach(x=>(by[x.kind]=by[x.kind]||[]).push(x));
    return order.filter(k=>by[k]).map(k=>`<div class="m-sec">${k} (${by[k].length})</div><div class="m-group">${by[k].slice(0,8).map(x=>`<a class="m-row" href="${x.href}"><span class="m-dot" style="width:34px;height:34px;border-radius:9px;background:var(--active);color:var(--text-2);display:grid;place-items:center;flex-shrink:0">${svg(SKIND_IC[k]||IC.search,18)}</span><div class="m-rmeta"><div class="m-rt">${esc(x.label)}</div><div class="m-rs">${esc(x.sub)}</div></div>${chev}</a>`).join('')}</div>`).join('');
  }
  function scrSearch(){
    return `<header class="m-head"><div class="m-head-bar"><button class="m-iconbtn m-back" onclick="MApp.back()">${svg(IC.back,24)}</button><div class="m-search" style="flex:1;margin:0 6px 0 0">${svg(IC.search,18)}<input id="m-search-in" placeholder="Hledat vše…" value="${esc(searchQ)}" oninput="MApp.searchInput(this.value)"></div></div></header>
    <div class="m-scroll" id="m-search-res">${searchResultsHtml(searchQ)}</div>`;
  }

  /* ============================================================ NASTAVENÍ */
  function scrNastaveni(){
    const items=[['Organizace & branding',IC.home],['Barvy',IC.gear],['Integrace a účty',IC.cal],['Kontakty organizace',IC.users],['Práva a role',IC.check]];
    return head({large:'Nastavení',back:"MApp.back()"})+`<div class="m-scroll"><div class="m-group">${items.map(([l,ic])=>`<a class="m-list-action" onclick="MApp.toast('${l} (prototyp)')">${svg(ic,22)}<span style="flex:1">${l}</span>${chev}</a>`).join('')}</div>
      <div class="m-group"><a class="m-list-action" onclick="MApp.go('prehled.html')" style="color:var(--alert-due)">${svg(IC.out,22)}Odhlásit se</a></div></div>`;
  }

  /* ============================================================ LOGIN */
  function scrLogin(){
    const b=App.loadBrand?App.loadBrand():{logo:'D',orgName:'Doprovázení, z.s.'};
    return `<div class="m-scroll" style="display:flex;flex-direction:column;justify-content:center;min-height:100%">
      <div style="text-align:center;padding:24px">
        <div style="width:72px;height:72px;border-radius:20px;background:var(--accent);color:var(--accent-text);display:grid;place-items:center;font-weight:800;font-size:32px;margin:0 auto 16px">${b.logo}</div>
        <div style="font-size:24px;font-weight:800">${esc(b.orgName)}</div>
        <div style="color:var(--text-2);margin-top:4px">CRM pro doprovázení pěstounských rodin</div>
        <div class="m-field" style="text-align:left;margin-top:26px"><label>Pracovní e-mail</label><input type="email" placeholder="jmeno@doprovazeni.cz"></div>
        <button class="m-btn-primary" onclick="MApp.go('prehled.html')">Přihlásit se</button>
        <div style="color:var(--text-3);font-size:12px;margin-top:14px">Přihlášení přes magic link (prototyp)</div>
      </div></div>`;
  }

  /* ============================================================ BACKSTAGE (mobil) */
  const BACKSTAGE=[
    ['reporty-manazerske.html',' Manažerské reporty','Výroční zprávy, finance SPVPP, respit dny'],
    ['doklady.html',' Doklady Respit','Faktury → rozúčtování na SPVPP a dny'],
    ['externiste.html',' Externisté & výkazy','Sazebník, schvalování hodin'],
    ['provoz.html',' Provoz & zaměstnanci','Mzdy, docházka, náklady'],
    ['import.html','⬆ Import dat','Migrace z Excelu (staging, rollback)'],
    ['archiv.html',' Archiv / Převod / QR','Stavy dohod, převod, export'],
    ['report-nastaveni.html','⚙ Nastavení reportů','Šablony, branding, automatizace'],
    ['monetizace.html','€ Tarify & AI kredit','Předplatné, spotřeba, FUP'],
  ];
  const BACKSTAGE_NATIVE={'reporty-manazerske.html':1}; // sekce s nativní mobilní verzí (postupně přibývají)
  function scrSprava(){
    if(!App.can('users.manage')) return head({large:'Správa',back:'MApp.back()'})+'<div class="m-scroll"><div class="m-empty" style="padding:34px">Backstage je jen pro vedení / superadmina.</div></div>';
    return head({large:'Správa',barTitle:'Backstage',back:'MApp.back()'})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
      <div class="m-sec">Manažerská a ekonomická agenda</div>
      <div class="m-group">${BACKSTAGE.map(([h,t,d])=>`<a class="m-list-action" onclick="MApp.go('${h}')"><span style="flex:1"><span style="display:block;font-weight:600">${t}</span><span style="font-size:12px;color:var(--text-2)">${d}</span></span>${chev}</a>`).join('')}</div>
      <div class="m-rs" style="padding:6px 14px;color:var(--text-3)">Reporty a Tarify mají plnou mobilní verzi. Rozsáhlé moduly (doklady, import, archiv) se na mobilu připravují – zatím doporučeno na počítači.</div></div>`;
  }
  function scrStub(page){ const it=BACKSTAGE.find(b=>b[0]===page)||['',page,'']; const title=it[1].replace(/^[^\s]+\s/,'');
    return head({large:title,barTitle:'Backstage',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:16px"><div class="m-card"><div class="m-rt" style="font-size:16px">${it[1]}</div><div class="m-rs" style="margin-top:6px">${it[2]}</div>
      <div class="m-rs" style="margin-top:14px;color:var(--text-3)">Tato agenda je rozsáhlá a zatím optimalizovaná pro počítač. Na mobilu se připravuje plně nativní verze.</div>
      <a class="m-btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:14px" onclick="MApp.go('sprava.html')">← Zpět na Správu</a></div></div>`; }

  /* ---- Backstage: Doklady (nativní, read) ---- */
  function scrDoklady(){
    const ds=App.doklady();
    const rows=ds.length?ds.map(d=>`<a class="m-row" onclick="MApp.dokladDetail('${d.id}')"><span class="m-dot" style="width:36px;height:36px;border-radius:10px;background:var(--active);color:var(--text-2);display:grid;place-items:center;flex-shrink:0">${svg(IC.doc,18)}</span><div class="m-rmeta"><div class="m-rt">${esc(d.cislo)}</div><div class="m-rs">${App.fmtDate(d.datum)} · ${(d.total||0).toLocaleString('cs')} Kč · ${d.stav==='zauctovano'?'<span style="color:var(--alert-ok)">zaúčtováno</span>':'návrh'}</div></div>${chev}</a>`).join(''):'<div class="m-empty" style="padding:24px">Zatím žádné doklady.</div>';
    return head({large:'Doklady',barTitle:'Respit / SPVPP',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)"><div class="m-sec">Přijaté doklady (respit)</div><div class="m-group">${rows}</div><div class="m-rs" style="padding:8px 14px;color:var(--text-3)">Nahrání nového dokladu (foto faktury → AI rozúčtování na děti) je optimalizované pro počítač.</div></div>`;
  }
  /* ---- Backstage: Externisté + schvalování výkazů (nativní) ---- */
  function scrExterniste(){
    const pend=App.vykazy({stav:'cekajici'}); const ex=App.externiste();
    const pj=pend.length?pend.map(v=>{const e=App.externistaGet(v.externistaId)||{};const kid=v.diteId?App.diteById(v.diteId):null;
      return `<div class="m-card" style="margin:0 0 10px"><div class="m-rt">${esc(e.jmeno||'?')} · ${esc(e.cinnost||'')}</div>
        <div class="m-rs" style="margin:3px 0 8px">${App.fmtDate(v.datum)} · ${v.hodiny} h${kid?' · '+esc(kid.n):''}${e.sazba?' · odhad '+(v.hodiny*e.sazba).toLocaleString('cs')+' Kč':''}<br>${esc(v.popis||'')}</div>
        <div style="display:flex;gap:8px"><button class="m-btn-primary" style="flex:1;margin:0" onclick="MApp.vykazApprove('${v.id}','schvaleno')">✓ Schválit</button><button class="m-btn-primary" style="flex:1;margin:0;background:var(--alert-due)" onclick="MApp.vykazApprove('${v.id}','zamitnuto')">✕ Zamítnout</button></div></div>`;}).join(''):'<div class="m-empty" style="padding:20px">Žádné výkazy ke schválení </div>';
    const exj=ex.map(e=>{const s=App.vykazSum(e.id);return `<a class="m-row"><span class="m-dot" style="width:36px;height:36px;border-radius:10px;background:var(--active);color:var(--text-2);display:grid;place-items:center;flex-shrink:0">${svg(IC.users,18)}</span><div class="m-rmeta"><div class="m-rt">${esc(e.jmeno)}</div><div class="m-rs">${esc(e.cinnost)} · ${e.sazba} Kč/h · ${e.typPrace==='prima_pece'?'přímá péče':'provoz'} · schváleno ${s.hodiny} h</div></div></a>`;}).join('');
    return head({large:'Externisté',barTitle:'Výkazy',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
      <div class="m-sec">Ke schválení (${pend.length})</div><div style="padding:0 2px">${pj}</div>
      <div class="m-sec" style="margin-top:14px">Externisté (${ex.length})</div><div class="m-group">${exj}</div>
      <div class="m-rs" style="padding:8px 14px;color:var(--text-3)">Po schválení systém spočítá odměnu: přímá péče → SPVPP + den respitu, provoz → režie.</div></div>`;
  }
  /* ---- Backstage: Archiv + export (nativní) ---- */
  const ARCH_SECT=[['zaklad','Základní údaje',1],['deti','Děti',1],['pestouni','Pěstouni',1],['respit','Respit',1],['spvpp','SPVPP',1],['vzdelavani','Vzdělávání',0],['dokumenty','Dokumenty',0]];
  function scrArchiv(){
    const list=App.households;
    const rows=list.map(h=>{const s=App.dohodaStav(h.id);return `<a class="m-row" onclick="MApp.archivExport(${h.id})"><span class="m-dot" style="width:36px;height:36px;border-radius:10px;background:var(--active);color:var(--text-2);display:grid;place-items:center;flex-shrink:0">${svg(IC.home,18)}</span><div class="m-rmeta"><div class="m-rt">${esc(famName(h))}</div><div class="m-rs">${h.city} · ${h.kids.length} dětí · ${App.DOHODA_STAVY[s.stav]}</div></div>${chev}</a>`;}).join('');
    return head({large:'Archiv / Export',barTitle:'Dohody',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)"><div class="m-sec">Dohody – klepni pro export</div><div class="m-group">${rows}</div><div class="m-rs" style="padding:8px 14px;color:var(--text-3)">Export = minimální převoditelná míra, bez soukromých poznámek KO. Převod/QR mezi organizacemi je na počítači.</div></div>`;
  }

  /* ---- Backstage: Provoz & zaměstnanci (nativní, read) ---- */
  function scrProvoz(){
    const Z=App.zamestnanci(), N=App.provozNaklady();
    const mzdy=Z.reduce((a,z)=>a+(z.mzda||0),0);
    const mesic=N.filter(p=>p.perioda==='měsíc').reduce((a,p)=>a+(p.castka||0),0);
    const exp=App.provozExpiring(120);
    const stat=(n,l)=>`<div class="m-stat" style="flex:1"><div class="m-num">${n}</div><div class="m-lbl">${l}</div></div>`;
    return head({large:'Provoz',barTitle:'Zaměstnanci & náklady',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
      <div class="m-card" style="margin:0 0 12px"><div style="display:flex;gap:10px">${stat(mzdy.toLocaleString('cs')+' Kč','Mzdy/měs.')}${stat(mesic.toLocaleString('cs')+' Kč','Provoz/měs.')}</div></div>
      ${exp.length?`<div class="m-card" style="margin:0 0 12px;border-left:3px solid var(--alert-due)"><div class="m-rt" style="color:var(--alert-due)"> Končící smlouvy (do 120 dní)</div>${exp.map(p=>`<div class="m-rs" style="margin-top:4px">${esc(p.nazev)} — ${App.fmtDate(p.platnostDo)}</div>`).join('')}</div>`:''}
      <div class="m-sec">Zaměstnanci (${Z.length})</div><div class="m-group">${Z.map(z=>`<div class="m-row"><span class="m-dot" style="width:36px;height:36px;border-radius:50%;background:var(--avatar-neutral);color:#fff;display:grid;place-items:center;font-weight:700;flex-shrink:0">${App.ini(z.jmeno)}</span><div class="m-rmeta"><div class="m-rt">${esc(z.jmeno)}</div><div class="m-rs">${esc(z.pozice)} · úvazek ${z.uvazek} · ${z.mzda.toLocaleString('cs')} Kč${z.absence&&z.absence.length?' · '+z.absence.length+'× absence':''}</div></div></div>`).join('')}</div>
      <div class="m-sec" style="margin-top:14px">Provozní náklady (${N.length})</div><div class="m-group">${N.map(p=>`<div class="m-row"><span class="m-dot" style="width:36px;height:36px;border-radius:10px;background:var(--active);color:var(--text-2);display:grid;place-items:center;flex-shrink:0">${svg(IC.home,18)}</span><div class="m-rmeta"><div class="m-rt">${esc(p.nazev)}</div><div class="m-rs">${esc(p.kategorie)} · ${esc(p.poskytovatel||'')} · ${p.castka.toLocaleString('cs')} Kč/${p.perioda}${p.platnostDo?' · do '+App.fmtDate(p.platnostDo):''}</div></div></div>`).join('')}</div></div>`;
  }
  /* ---- Backstage: Tarify & AI (nativní, role-aware) ---- */
  function _usageBar(fup){ const pct=fup.limit==null?0:Math.min(100,fup.pct); const c=fup.stav==='blocked'?'var(--alert-due)':(fup.stav==='warn'?'#E08A00':'var(--alert-ok)');
    return `<div class="m-pace"><i style="width:${pct}%;background:${c}"></i></div><div class="m-rs">${fup.used.toLocaleString('cs')} ${fup.limit?'/ '+fup.limit.toLocaleString('cs'):''} tokenů · <b style="color:${c}">${({ok:'v pořádku',warn:'blíží se limitu',blocked:'vyčerpáno',unlimited:'bez limitu',noai:'bez AI',suspended:'pozastaveno'})[fup.stav]}</b></div>`; }
  function scrMonetizace(){
    const role=App.currentUser().role; const t=App.aiTariff(); const ko=App.koCount(); const fup=App.aiFup(); const um=App.aiUsageMonth();
    if(role==='superadmin'){
      const orgs=App.orgsBilling(); const mrr=orgs.reduce((a,o)=>a+App.aiMonthlyCost(o.tarif,o.ko),0); const PB={'zaplaceno':['var(--alert-ok)','zaplaceno'],'po splatnosti':['var(--alert-due)','po splatnosti'],'čeká':['#E08A00','čeká']};
      return head({large:'Tarify',barTitle:'Definice & platby',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
        <div class="m-card" style="margin:0 0 12px"><div class="m-rt">Měsíční tržby (MRR)</div><div class="m-num" style="margin-top:2px">${mrr.toLocaleString('cs')} Kč</div><div class="m-rs">${orgs.length} organizací · po splatnosti: ${orgs.filter(o=>o.platba==='po splatnosti').length}</div></div>
        <div class="m-sec">Definice tarifů</div><div class="m-group">${App.aiTariffsLoad().map(x=>`<div class="m-row"><div class="m-rmeta"><div class="m-rt">${esc(x.nazev)}</div><div class="m-rs">paušál ${(x.pausal||0).toLocaleString('cs')} + ${(x.cenaKO||0).toLocaleString('cs')}/KO · AI ${x.aiKredit==null?'∞':x.aiKredit.toLocaleString('cs')}</div></div></div>`).join('')}</div>
        <div class="m-rs" style="padding:4px 14px;color:var(--text-3)">Úprava cen tarifů je na počítači.</div>
        <div class="m-sec" style="margin-top:8px">Organizace a platby</div><div class="m-group">${orgs.map(o=>{const pb=PB[o.platba]||['#E08A00',o.platba];return `<div class="m-row"><div class="m-rmeta"><div class="m-rt">${esc(o.org)}</div><div class="m-rs">${o.ko} KO · ${App.aiMonthlyCost(o.tarif,o.ko).toLocaleString('cs')} Kč/měs</div></div><span class="m-badge" style="background:${pb[0]}22;color:${pb[0]}">${pb[1]}</span></div>`;}).join('')}</div>
        <div class="m-sec" style="margin-top:8px">Globální AI</div><div style="padding:4px 4px"><button class="m-btn-primary" style="${App.aiSuspended()?'':'background:var(--alert-due)'}" onclick="MApp.mzSuspend(${!App.aiSuspended()})">${App.aiSuspended()?'▶ Obnovit AI':'⏸ Pozastavit AI'}</button></div></div>`;
    }
    // vedení
    const cena=App.aiMonthlyCost(t.key,ko);
    return head({large:'Předplatné',barTitle:'Tarif & spotřeba',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
      <div class="m-card" style="margin:0 0 12px"><div class="m-rt">Aktuální tarif: ${esc(t.nazev)}</div><div class="m-num" style="margin-top:2px">${cena.toLocaleString('cs')} Kč/měs</div><div class="m-rs">paušál ${(t.pausal||0).toLocaleString('cs')} + ${ko} × ${(t.cenaKO||0).toLocaleString('cs')} Kč (KO)</div></div>
      <div class="m-card" style="margin:0 0 12px"><div class="m-rt">Spotřeba AI · ${App.todayISO.slice(0,7)}</div><div class="m-rs" style="margin:3px 0 6px">${um.calls} volání</div>${_usageBar(fup)}</div>
      <div class="m-sec">Změnit tarif</div><div class="m-group">${App.aiTariffsLoad().map(x=>{const c=App.aiMonthlyCost(x.key,ko);return `<div class="m-row" onclick="MApp.mzTariff('${x.key}')" style="cursor:pointer"><div class="m-rmeta"><div class="m-rt">${esc(x.nazev)}${x.key===t.key?' · aktivní':''}</div><div class="m-rs">${c.toLocaleString('cs')} Kč/měs · AI ${x.aiKredit==null?'∞':x.aiKredit.toLocaleString('cs')}</div></div>${x.key===t.key?'<span class="m-badge" style="background:var(--alert-ok)22;color:var(--alert-ok)">✓</span>':chev}</div>`;}).join('')}</div></div>`;
  }
  /* ---- Backstage: Nastavení reportů (nativní – automatizace + design) ---- */
  function scrReportNast(){
    const c=App.reportCfgLoad(); const jobs=App.reportJobs(); const PER=App.REPORT_PERIODY;
    const sw=(k,lbl,on)=>`<label class="m-row" style="cursor:pointer"><div class="m-rmeta"><div class="m-rt" style="font-size:14px;font-weight:500">${lbl}</div></div><span class="m-tgl ${on?'on':''}" onclick="MApp.cfgToggle('${k}',${!on});event.preventDefault()"></span></label>`;
    return head({large:'Reporty',barTitle:'Šablony & automatizace',back:"MApp.go('sprava.html')"})+`<div class="m-scroll" style="padding:8px 12px calc(var(--m-tab-h) + 12px)">
      <div class="m-sec">Design</div><div class="m-group">${sw('charts','Zobrazovat grafy',c.charts)}${sw('logo','Logo v hlavičce',c.logo)}</div>
      <div class="m-sec" style="margin-top:10px">Automatizace (${jobs.length})</div>
      ${jobs.map(j=>`<div class="m-card" style="margin:0 0 10px"><div class="m-rt">${esc(j.nazev)} ${j.aktivni?'<span class="m-badge" style="background:var(--alert-ok)22;color:var(--alert-ok)">aktivní</span>':'<span class="m-badge" style="background:#eee;color:#888">pozastaveno</span>'}</div>
        <div class="m-rs" style="margin:4px 0 8px">${PER[j.perioda]||j.perioda} · ${j.format.toUpperCase()} · ${esc(j.prijemci)}</div>
        <div style="display:flex;gap:6px"><button class="m-na sec" onclick="MApp.jobRun('${j.id}')">Spustit</button><button class="m-na sec" onclick="MApp.jobToggle('${j.id}')">${j.aktivni?'Pozastavit':'Aktivovat'}</button><button class="m-na sec" style="color:var(--alert-due)" onclick="MApp.jobDel('${j.id}')">Smazat</button></div></div>`).join('')||'<div class="m-empty">Žádná automatizace.</div>'}
      <div style="padding:4px 4px"><button class="m-btn-primary" onclick="MApp.jobAddSheet()">+ Přidat automatizaci</button></div></div>`;
  }

  /* ============================================================ SCREEN MAP */
  const SCREENS={
    'prehled.html':{render:scrPrehled},
    'sprava.html':{render:scrSprava,tabs:false},
    'doklady.html':{render:scrDoklady,tabs:false},
    'externiste.html':{render:scrExterniste,tabs:false},
    'provoz.html':{render:scrProvoz,tabs:false},
    'import.html':{render:()=>scrStub('import.html'),tabs:false},
    'archiv.html':{render:scrArchiv,tabs:false},
    'reporty-manazerske.html':{render:()=>scrStub('reporty-manazerske.html'),tabs:false},
    'report-nastaveni.html':{render:scrReportNast,tabs:false},
    'monetizace.html':{render:scrMonetizace,tabs:false},
    'pestouni.html':{render:scrPestouni},
    'deti.html':{render:scrDeti},
    'ostatni.html':{render:scrOstatni},
    'kalendar.html':{render:scrKalendar,fab:'MApp.openEv()'},
    'ukoly.html':{render:scrUkoly,fab:'MApp.openTask()'},
    'dokumenty.html':{render:scrDokumenty},
    'reporty.html':{render:scrReporty},
    'vzdelavani.html':{render:scrVzdelavani},
    'hub.html':{render:scrHub,tabs:false},
    'nastaveni.html':{render:scrNastaveni},
    '__chat__':{render:scrChat,tabs:false},
    '__report__':{render:scrReport,tabs:false},
    '__search__':{render:scrSearch,tabs:false},
    'login.html':{render:scrLogin,tabs:false},
    'index.html':{render:scrLogin,tabs:false},
    '':{render:scrPrehled},
  };

  /* ============================================================ SHEET + TOAST */
  function sheet(title,bodyHtml){
    let bg=document.getElementById('m-sheet-bg');
    if(!bg){ bg=document.createElement('div'); bg.id='m-sheet-bg'; bg.className='m-sheet-bg';
      bg.innerHTML='<div class="m-sheet" id="m-sheet"></div>'; document.body.appendChild(bg);
      bg.addEventListener('click',e=>{ if(e.target===bg) closeSheet(); }); }
    document.getElementById('m-sheet').innerHTML=`<div class="m-sheet-grab"></div><div class="m-sheet-h"><div class="t">${title}</div><button class="x" onclick="MApp.closeSheet()">✕</button></div><div class="m-sheet-body">${bodyHtml}</div>`;
    requestAnimationFrame(()=>{ bg.classList.add('open'); document.getElementById('m-sheet').classList.add('open'); });
  }
  function closeSheet(){ const bg=document.getElementById('m-sheet-bg'); if(!bg)return; bg.classList.remove('open'); const s=document.getElementById('m-sheet'); if(s)s.classList.remove('open'); }
  function toast(t){ let e=document.getElementById('m-toast'); if(!e){e=document.createElement('div');e.id='m-toast';e.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:11px 20px;border-radius:24px;z-index:1200;font-size:14px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.3);transition:opacity .3s';document.body.appendChild(e);} e.textContent=t; e.style.opacity='1'; clearTimeout(e._t); e._t=setTimeout(()=>e.style.opacity='0',1800); }

  /* ============================================================ NAVIGACE */
  function go(href,explicitRoute){
    closeSheet();
    let r;
    if(explicitRoute) r=explicitRoute;
    else{ const u=new URL(href,location.href); const page=(u.pathname.split('/').pop()||'prehled.html').toLowerCase(); const params={}; u.searchParams.forEach((v,k)=>params[k]=v); r={page,params}; }
    if(r.page==='hub.html'){ const t=(r.params||{}).typ; hubSec=(t==='pestoun'||t==='dite')?'osa':'udaje'; chatScope='internal'; }
    const DEEP=['hub.html','__chat__','__report__','__search__'];
    const goingDeep = DEEP.includes(r.page);
    const leavingDeep = DEEP.includes(route.page);
    let dir='tab';
    if(goingDeep) dir='push';
    else if(leavingDeep) dir='pop';
    navDepth++;
    history.pushState({route:r,depth:navDepth}, '', urlFor(r));
    route=r; render(dir);
  }

  /* ============================================================ PUBLIC API */
  let MApp_q='', searchTimer=null;
  window.MApp={
    go,
    back(){ if(navDepth>0) history.back(); else go('prehled.html'); },
    more(){
      const u=App.currentUser(), r=App.roleOf(); const b=App.loadBrand?App.loadBrand():{logo:'D',orgName:'Doprovázení, z.s.',branch:''};
      const settings = App.can('settings.access') ? `<a class="m-list-action" onclick="MApp.go('nastaveni.html')">${svg(IC.gear,22)}<span style="flex:1">Nastavení</span>${chev}</a>` : '';
      sheet('Více',`<div style="display:flex;align-items:center;gap:12px;padding:6px 4px 14px">
        <span class="m-brand-logo" style="width:44px;height:44px;border-radius:13px;background:var(--accent);color:var(--accent-text);display:grid;place-items:center;font-weight:800;font-size:20px">${esc(b.logo)}</span>
        <div><div class="m-brand-name" style="font-weight:700;font-size:16px">${esc(b.orgName)}</div><div class="m-brand-branch" style="font-size:12px;color:var(--text-2)">${esc(b.branch||'')}</div></div></div>
      <div class="m-group" style="margin:4px 0 10px">
        <a class="m-list-action" onclick="MApp.roleSwitch()"><span class="avatar sq" style="width:30px;height:30px;font-size:11px;background:var(--avatar-neutral)">${App.ini(u.name)}</span><span style="flex:1"><span style="display:block;font-weight:600">${u.name}</span><span style="font-size:12px;color:var(--text-2)">${r.label} · přepnout</span></span>${chev}</a>
      </div>
      <div class="m-group" style="margin:0 0 14px">
        <a class="m-list-action" onclick="MApp.openSearch()">${svg(IC.search,22)}<span style="flex:1">Hledat (vše)</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.go('deti.html')">${svg(IC.child,22)}<span style="flex:1">Děti</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.go('ostatni.html')">${svg(IC.users,22)}<span style="flex:1">Ostatní kontakty</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.go('reporty.html')">${svg('<path d="M3 3v18h18M7 14l3-3 3 2 5-6"/>',22)}<span style="flex:1">Reporty</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.go('dokumenty.html')">${svg(IC.doc,22)}<span style="flex:1">Dokumenty</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.go('vzdelavani.html')">${svg('<path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/>',22)}<span style="flex:1">Vzdělávání</span>${chev}</a>
        <a class="m-list-action" onclick="MApp.notifs()">${svg(IC.bell,22)}<span style="flex:1">Upozornění</span>${chev}</a>
        ${App.can('users.manage')?`<a class="m-list-action" onclick="MApp.go('sprava.html')">${svg('<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',22)}<span style="flex:1">Správa (backstage)</span>${chev}</a>`:''}
        ${settings}
      </div>
      <div class="sec-label" style="padding:6px 16px 4px;font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.03em">Vzhled</div>
      <div class="m-group" style="margin:0 0 14px"><div class="m-list-action" style="cursor:default"><span style="flex:1">Design aplikace</span><div class="m-seg" style="width:auto">${[['','Yandex'],['b','Google'],['c','Shadcn']].map(([k,l])=>`<button class="${(App.themeKey()||'')===k?'on':''}" onclick="MApp.themeSet('${k}')">${l}</button>`).join('')}</div></div>
        ${App.themeKey()==='c'?`<div class="m-list-action" style="cursor:default"><span style="flex:1">Režim</span><div class="m-seg" style="width:auto">${[['light','Světlý'],['dark','Tmavý']].map(([k,l])=>`<button class="${App.modeKey()===k?'on':''}" onclick="MApp.modeSet('${k}')">${l}</button>`).join('')}</div></div>`:''}</div>
      <div class="m-group"><a class="m-list-action" onclick="MApp.go('prehled.html')" style="color:var(--alert-due)">${svg(IC.out,22)}Odhlásit se</a></div>`);
    },
    roleSwitch(){
      const cur=App.currentUserId();
      sheet('Zobrazit aplikaci jako',`<div class="m-group" style="margin:4px 0 8px">${App.ORG_USERS.map(u=>{const r=App.roleOf(u);const on=u.id===cur;
        return `<a class="m-list-action" onclick="App.switchUser('${u.id}')" style="${on?'background:var(--active)':''}"><span class="avatar sq" style="width:32px;height:32px;font-size:11px;background:var(--avatar-neutral)">${App.ini(u.name)}</span><span style="flex:1"><span style="display:block;font-weight:600">${u.name}${on?' · aktivní':''}</span><span style="font-size:12px;color:var(--text-2)">${r.label} · ${r.scope==='all'?'celá org.':r.scope==='own'?'přidělené':'vlastní karta'}</span></span>${chev}</a>`;}).join('')}</div>
      <div class="m-rs" style="padding:0 16px 8px">Náhled práv a rozsahu dat dané role.</div>`);
    },
    notifs(){
      const list=App.buildNotifs?App.buildNotifs():[];
      const ic=t=>`<span style="width:34px;height:34px;border-radius:10px;flex-shrink:0;display:grid;place-items:center;background:${t==='due'?'var(--alert-due-soft)':'var(--alert-warn-soft)'};color:${t==='due'?'var(--alert-due)':'var(--alert-warn)'}">${svg(IC.warn,18)}</span>`;
      const actLabel={'visit-due':'Naplánovat návštěvu','edu-low':'Vzdělávání','annual-review':'Vytvořit report'};
      const item=x=>{
        const primary=actLabel[x.kind];
        return `<div style="padding:12px 14px;border-top:1px solid var(--border)">
          <div style="display:flex;gap:10px;align-items:center">${ic(x.t)}<div class="m-rmeta"><div class="m-rt" style="font-size:15px">${esc(x.title)}</div><div class="m-rs">${esc(x.desc)}</div></div></div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            ${primary?`<button class="m-na" onclick="MApp.notifAct('${x.kind}','${x.typ}','${x.eid}')">${primary}</button>`:''}
            ${x.eid?`<button class="m-na sec" onclick="MApp.go('hub.html?typ=${x.typ}&id=${x.eid}')">Otevřít kartu</button>`:''}
          </div></div>`;
      };
      sheet('Upozornění · '+list.length, `<div class="m-group" style="margin:4px 0 8px">${list.length?list.map(item).join(''):'<div class="m-empty">Žádná upozornění </div>'}</div>`);
    },
    notifAct(kind,typ,eid){
      closeSheet();
      if(kind==='visit-due'){ const o=personOf(typ,eid); MApp.openEv(TODAY,'10:00'); if(o){ evDraftEnts=[{label:o.name}]; renderEvEnts(); const ti=document.getElementById('m-ev-t'); if(ti&&!ti.value) ti.value='Návštěva: '+o.name; } }
      else if(kind==='edu-low'){ go(null,{page:'hub.html',params:{typ,id:eid}}); hubSec='vzdelavani'; render('replace'); }
      else if(kind==='annual-review'){ MApp.openReport(typ,eid,'2026-01-01','2026-06-30'); }
    },
    closeSheet, toast,
    search(v){ MApp_q=v; clearTimeout(searchTimer); searchTimer=setTimeout(()=>render('replace'),120); },
    themeSet(k){ App.applyTheme(k); toast('Vzhled: '+(k==='b'?'Google':k==='c'?'Shadcn':'Yandex')); MApp.more(); },
    modeSet(m){ App.applyMode(m); toast('Režim: '+(m==='dark'?'tmavý':'světlý')); MApp.more(); },
    repyPer(k){ repyPer=k; render('replace'); },
    repyToggle(on){ repyCharts=on; const c=App.reportCfgLoad(); c.charts=on; App.reportCfgSave(c); render('replace'); },
    repyExport(){
      const FMT=[['pdf',' PDF / tisk'],['xls',' Excel (.xls)'],['csv',' CSV'],['md',' Markdown'],['xml',' XML'],['json','{ } JSON']];
      sheet('Export reportu',`<div class="m-rs" style="padding:0 4px 6px">Stáhne přesně to, co je na obrazovce (období + role).</div>
        <div class="m-group" style="margin:2px 0 8px">${FMT.map(([f,l])=>`<a class="m-list-action" onclick="MApp.repyDo('${f}')"><span style="flex:1">${l}</span>${chev}</a>`).join('')}</div>`);
    },
    repyDo(fmt){ closeSheet(); App.exportReport(fmt,repyModel); if(fmt!=='pdf') toast('Export ('+fmt.toUpperCase()+') stažen ✓'); },
    calView(v){ calView=v; render('replace'); },
    pickDay(iso){ calSel=iso; if(calView==='mesic') render('replace'); else { calView='den'; render('replace'); } },
    monNav(d){ calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth()+d,1); render('replace'); },
    dayNav(d){ calSel=isoOf(addDays(new Date(calSel+'T00:00:00'),d)); render('replace'); },
    weekSlot(ev,iso){ if(ev.target.closest('.m-wk-ev'))return; const y=ev.offsetY||0; const h=Math.min(20,Math.max(0,Math.floor(y/WK_HH))); MApp.openEv(iso,pad(h)+':00'); },
    weekNav(d){ const b=document.querySelector('.m-week-body'); if(b) b.scrollBy({left:d*7*WK_WD,behavior:'smooth'}); },
    /* ---- NOVÁ UDÁLOST (mobilní bottom-sheet) ---- */
    openEv(date,start){
      date=date||calSel||TODAY; start=start||'09:00';
      evDraftEnts=[]; evType='visit'; evOwner='M. Dvořák'; evPickOpen=false;
      sheet('Nová událost', evFormBody({date,start,end:addMin(start,60),title:'',loc:'',save:'MApp.saveEv()',saveLabel:'Vytvořit událost'}));
      renderEvEnts();
    },
    evSetType(k){ evType=k; const el=document.getElementById('m-ev-typeseg'); if(el) el.innerHTML=evTypeBtns(); },
    evSetOwner(k){ evOwner=k; const el=document.getElementById('m-ev-ownerseg'); if(el) el.innerHTML=evOwnerBtns(); },
    evPickToggle(){ evPickOpen=!evPickOpen; const p=document.getElementById('m-ev-pick'); if(!p)return; p.style.display=evPickOpen?'block':'none'; if(evPickOpen){ MApp.evPickFilter(''); const q=document.getElementById('m-ev-pickq'); if(q) setTimeout(()=>q.focus(),60); } },
    evPickFilter(v){ v=(v||'').toLowerCase().trim(); const el=document.getElementById('m-ev-picklist'); if(!el)return;
      const list=ENTOPTS.filter(o=>!evDraftEnts.some(d=>d.label===o.label)).filter(o=>!v||o.label.toLowerCase().includes(v)).slice(0,40);
      el.innerHTML=list.length?list.map(o=>`<div class="m-pick-item" onclick="MApp.evPickAdd(this.dataset.l)" data-l="${esc(o.label)}">${o.etype?App.avatar(o.label,null,null,28,'sq'):`<span style="width:28px;height:28px;border-radius:7px;background:var(--active);display:grid;place-items:center;flex-shrink:0">${svg(IC.home,16)}</span>`}<span>${esc(o.label)}</span></div>`).join(''):'<div class="m-empty" style="padding:16px">Nic nenalezeno</div>'; },
    evPickAdd(label){ MApp.evAddEnt(label); evPickOpen=false; const p=document.getElementById('m-ev-pick'); if(p)p.style.display='none'; const q=document.getElementById('m-ev-pickq'); if(q)q.value=''; },
    evAddEnt(label){ label=(label||'').trim(); if(!label)return; if(evDraftEnts.some(x=>x.label===label))return; const f=ENTOPTS.find(x=>x.label===label)||{label}; evDraftEnts.push(f); renderEvEnts(); },
    evRmEnt(i){ evDraftEnts.splice(i,1); renderEvEnts(); },
    saveEv(){
      const g=id=>document.getElementById(id);
      const t=g('m-ev-t').value.trim()||'Nová událost';
      const s=g('m-ev-s').value||'09:00', e=g('m-ev-e').value||addMin(s,60);
      const first=evDraftEnts[0]||{};
      mEvents.push({date:g('m-ev-d').value||calSel,start:s,dur:Math.max(30,toMin(e)-toMin(s)),title:t,type:evType,owner:evOwner,etype:first.etype||'',eid:first.eid||'',ename:evDraftEnts.map(x=>x.label).join(', '),href:first.eid?`hub.html?typ=${first.etype}&id=${first.eid}`:'#',loc:g('m-ev-l').value.trim()});
      calSel=g('m-ev-d').value||calSel; closeSheet(); toast('Událost vytvořena ✓'); render('replace');
    },
    /* ---- DETAIL UDÁLOSTI ---- */
    evDetail(idx){
      const e=mEvents[idx]; if(!e)return; const c=evColor(e);
      const d=new Date(e.date+'T00:00:00');
      const linked = e.eid?`<a class="m-chip" onclick="MApp.go('hub.html?typ=${e.etype}&id=${e.eid}')">${App.avatar(e.ename||'?',null,null,22,'sq')} ${esc((e.ename||'').split(',')[0])}</a>`:(e.ename?`<span class="m-d-row" style="border:none;padding:4px 0"><div class="v">${esc(e.ename)}</div></span>`:'');
      const map = e.loc?`<iframe class="m-d-map" title="mapa" loading="lazy" src="${mapEmbed(e.loc)}"></iframe><a class="m-d-nav" href="${navLink(e.loc)}" target="_blank" rel="noopener">${svg(IC.send,18)} Navigovat v telefonu</a>`:'';
      sheet('Detail události',`
        <div class="m-d-title">${esc(e.title)}</div>
        <span class="m-badge" style="background:color-mix(in srgb,${c} 16%,var(--surface));color:${c}">${evLabel(e)}</span>
        <div style="margin-top:10px">
          <div class="m-d-row">${svg(IC.cal,20)}<div><div class="k">Datum a čas</div><div class="v">${d.getDate()}. ${MN[d.getMonth()]} ${d.getFullYear()} · ${DOWl[dowi(d)]}<br>${e.start}–${addMin(e.start,e.dur)}</div></div></div>
          <div class="m-d-row">${svg(IC.users,20)}<div><div class="k">Klíčová osoba</div><div class="v">${App.workerFull(e.owner)}</div></div></div>
          ${(e.eid||e.ename)?`<div class="m-d-row">${svg(IC.home,20)}<div><div class="k">Navázáno na</div><div class="v" style="margin-top:4px">${linked}</div></div></div>`:''}
          <div class="m-d-row">${svg(IC.map,20)}<div style="flex:1;min-width:0"><div class="k">Místo</div><div class="v">${e.loc?esc(e.loc):'<span style="color:var(--text-3)">Bez místa</span>'}</div>${map}</div></div>
        </div>
        <div class="m-d-actions"><button class="sec" onclick="MApp.editEv(${idx})">Upravit</button><button class="del" onclick="MApp.delEv(${idx})">Smazat</button></div>`);
    },
    editEv(idx){
      const e=mEvents[idx]; if(!e)return; evDraftEnts=e.ename?e.ename.split(', ').map(l=>(ENTOPTS.find(x=>x.label===l)||{label:l})):[];
      evType=e.type||'visit'; evOwner=e.owner==='L. Horáková'?'L. Horáková':'M. Dvořák'; evPickOpen=false;
      sheet('Upravit událost', evFormBody({date:e.date,start:e.start,end:addMin(e.start,e.dur),title:e.title,loc:e.loc||'',save:`MApp.updEv(${idx})`,saveLabel:'Uložit změny'}));
      renderEvEnts();
    },
    updEv(idx){ const e=mEvents[idx]; if(!e)return; const g=id=>document.getElementById(id);
      const s=g('m-ev-s').value||e.start, en=g('m-ev-e').value||addMin(s,60);
      e.title=g('m-ev-t').value.trim()||e.title; e.type=evType; e.date=g('m-ev-d').value||e.date; e.start=s; e.dur=Math.max(30,toMin(en)-toMin(s));
      e.owner=evOwner; e.loc=g('m-ev-l').value.trim(); const first=evDraftEnts[0]||{}; e.ename=evDraftEnts.map(x=>x.label).join(', '); e.etype=first.etype||e.etype; e.eid=first.eid||e.eid;
      closeSheet(); toast('Změny uloženy ✓'); render('replace');
    },
    delEv(idx){ if(idx<0||idx>=mEvents.length)return; mEvents.splice(idx,1); closeSheet(); toast('Událost smazána'); render('replace'); },
    /* ---- ÚKOLY ---- */
    openTask(){
      const entOpts=ENTOPTS.map(o=>`<option value="${esc(o.label)}">`).join('');
      sheet('Nový úkol',`
        <div class="m-field"><label>Název úkolu</label><input id="m-tk-t" placeholder="např. Připravit zprávu pro OSPOD"></div>
        <div class="m-field"><label>Termín</label><input id="m-tk-d" type="date" value="${TODAY}"></div>
        <div class="m-field"><label>Klíčová osoba</label><select id="m-tk-o"><option>Michal Dvořák</option><option>Lucie Horáková</option></select></div>
        <div class="m-field"><label>Týká se (kontakt)</label><input id="m-tk-ent" list="m-tk-entlist" placeholder="volitelné…"><datalist id="m-tk-entlist">${entOpts}</datalist></div>
        <button class="m-btn-primary" onclick="MApp.saveTask()">Vytvořit úkol</button>`);
    },
    saveTask(){
      const g=id=>document.getElementById(id);
      const o=g('m-tk-o').value==='Lucie Horáková'?'L. Horáková':'M. Dvořák';
      const entl=(g('m-tk-ent').value||'').trim(); const ent=ENTOPTS.find(x=>x.label===entl)||{};
      mTasks.push({id:'t'+(mTasks.length+1),title:g('m-tk-t').value.trim()||'Nový úkol',due:g('m-tk-d').value||TODAY,owner:o,etype:ent.etype||'',eid:ent.eid||'',ename:entl});
      closeSheet(); toast('Úkol vytvořen ✓'); render('replace');
    },
    taskDetail(idx){
      const t=mTasks[idx]; if(!t)return; const over=App.dayDiff(t.due)<0;
      sheet('Detail úkolu',`
        <div class="m-d-title">${esc(t.title)}</div>
        <div style="margin-top:6px">
          <div class="m-d-row">${svg(IC.cal,20)}<div><div class="k">Termín</div><div class="v" style="${over?'color:var(--alert-due)':''}">${App.fmtDate(t.due)}${over?' · po termínu':''}</div></div></div>
          <div class="m-d-row">${svg(IC.users,20)}<div><div class="k">Klíčová osoba</div><div class="v">${App.workerFull(t.owner)}</div></div></div>
          ${t.eid?`<div class="m-d-row">${svg(IC.home,20)}<div><div class="k">Týká se</div><div class="v" style="margin-top:4px"><a class="m-chip" onclick="MApp.go('hub.html?typ=${t.etype}&id=${t.eid}')">${App.avatar(t.ename||'?',null,null,22,'sq')} ${esc(t.ename||'')}</a></div></div></div>`:''}
        </div>
        <div class="m-d-actions"><button class="sec" onclick="MApp.doneTask(${idx})">Označit jako hotové</button>${t.eid?`<button class="sec" onclick="MApp.go('hub.html?typ=${t.etype}&id=${t.eid}')">Otevřít kartu</button>`:''}</div>`);
    },
    doneTask(idx){ if(idx<0||idx>=mTasks.length)return; mTasks.splice(idx,1); closeSheet(); toast('Úkol hotov ✓'); render('replace'); },
    instDetail(id){
      const i=App.institutions().find(x=>x.id===id); if(!i)return;
      const persons=(i.persons||[]).map(p=>`<div class="m-d-row">${svg(IC.users,20)}<div><div class="k">${esc(p.role||'kontakt')}</div><div class="v">${esc(p.n)}</div></div></div>`).join('')||'<div class="m-rs" style="padding:6px 4px;color:var(--text-3)">Bez kontaktních osob.</div>';
      const assigned=(i.assigned||[]).length?`<div class="m-rs" style="margin:12px 0 4px"><b>Navázané děti (${i.assigned.length})</b></div><div class="m-group">${i.assigned.map(n=>`<div style="padding:10px 14px;border-top:1px solid var(--border);font-size:14px">${esc(n)}</div>`).join('')}</div>`:'';
      sheet('Instituce',`
        <div style="text-align:center;padding:6px 0 12px">${App.avatar(i.name,null,null,64,'sq')}</div>
        <div class="m-d-title" style="text-align:center;font-size:18px">${esc(i.name)}</div>
        <div style="margin-top:8px">
          <div class="m-d-row">${svg(IC.doc,20)}<div><div class="k">Kategorie</div><div class="v">${esc(App.instCatLabel(i.cat))}${i._local?' · <span style="color:var(--accent)">lokálně upraveno</span>':''}</div></div></div>
          ${i.org?`<div class="m-d-row">${svg(IC.home,20)}<div><div class="k">Organizace</div><div class="v">${esc(i.org)}</div></div></div>`:''}
          ${persons}
        </div>
        ${assigned}`);
    },
    /* ---- DOKUMENT ---- */
    docDetail(eid,name){
      const d=App.allDocs().find(x=>x.eid===eid&&x.name===name)||App.allDocs().find(x=>x.name===name); if(!d)return;
      sheet('Dokument',`
        <div style="text-align:center;padding:6px 0 12px"><span class="avatar sq" style="width:64px;height:64px;font-size:18px;background:${KINDC[d.kind]||'var(--text-2)'};color:#fff;font-weight:700">${d.kind}</span></div>
        <div class="m-d-title" style="text-align:center;font-size:18px">${esc(d.name)}</div>
        <div style="margin-top:8px">
          <div class="m-d-row">${svg(IC.doc,20)}<div><div class="k">Kategorie</div><div class="v">${App.DOC_CATS[d.cat]||'—'}</div></div></div>
          <div class="m-d-row">${svg(IC.cal,20)}<div><div class="k">Datum</div><div class="v">${App.fmtDate(d.date)}</div></div></div>
          <div class="m-d-row">${svg(IC.users,20)}<div><div class="k">Kontakt</div><div class="v" style="margin-top:4px"><a class="m-chip" onclick="MApp.go('hub.html?typ=${d.etype}&id=${d.eid}')">${App.avatar(d.ename,null,null,22,'sq')} ${esc(d.ename)}</a></div></div></div>
        </div>
        ${(function(){const r=docReal(d);const ap=r&&r.approvals&&r.approvals.length?r.approvals[r.approvals.length-1]:null;if(!ap)return '';const lbl=ap.state==='approved'?'<span class="m-badge" style="background:var(--alert-ok-soft,#e6f6ec);color:#1a8a4a">Schváleno · '+esc(ap.by||'')+'</span>':ap.state==='rejected'?'<span class="m-badge" style="background:var(--alert-due-soft);color:var(--alert-due)">Zamítnuto</span>':'<span class="m-badge" style="background:var(--alert-warn-soft,#fff3e0);color:#b06b00">Čeká na schválení</span>';return '<div class="m-d-row">'+svg(IC.check,20)+'<div><div class="k">Schválení</div><div class="v" style="margin-top:4px">'+lbl+'</div></div></div>';})()}
        <div class="m-d-actions"><button class="sec" onclick="MApp.docShareSheet('${esc(d.eid)}','${esc(d.name).replace(/'/g,"\\'")}')">Sdílet</button><button class="sec" onclick="MApp.docApproveSheet('${esc(d.eid)}','${esc(d.name).replace(/'/g,"\\'")}')">Schválení</button></div>
        <div class="m-d-actions"><button class="sec" onclick="MApp.toast('Stahování (prototyp)')">Stáhnout</button><button class="sec" onclick="MApp.go('hub.html?typ=${d.etype}&id=${d.eid}')">Karta kontaktu</button></div>`);
    },
    docShareSheet(eid,name){
      const d={eid,name}; const real=docReal(d); const id=real?real.id:null;
      const items=SHARE_CH.map(([k,l,ic])=>`<a class="m-list-action" onclick="MApp.doShare('${eid}','${name.replace(/'/g,"\\'")}','${k}')"><span style="width:26px;text-align:center">${ic}</span><span style="flex:1">${l}</span>${chev}</a>`).join('');
      sheet('Sdílet dokument',`<div class="m-rs" style="padding:0 4px 6px">${esc(name)}</div><div class="m-group" style="margin:2px 0 8px">${items}</div>
        <div class="m-rs" style="padding:0 4px 8px;color:var(--text-3)">Interní / pěstounovi / dítěti = odešle se zároveň ke schválení s auditní stopou.</div>`);
    },
    doShare(eid,name,ch){
      const real=docReal({eid,name}); if(real){ App.docShare(real.id,ch); }
      const apr=(ch==='internal'||ch==='pestoun'||ch==='dite');
      closeSheet(); toast(apr?'Sdíleno + odesláno ke schválení ✓':'Sdíleno ('+ch+') ✓');
    },
    docApproveSheet(eid,name){
      const real=docReal({eid,name}); const u=App.currentUser(); const canApr=['pestoun','dite','vedeni','superadmin'].includes(u.role);
      const aud=real&&real.audit?real.audit.slice(-6):[];
      const hist=aud.length?`<div class="m-group" style="margin:6px 0 8px">${aud.map(a=>`<div style="padding:10px 14px;border-top:1px solid var(--border);font-size:13px"><b>${esc(a.ev)}</b> · ${esc(a.by||'')} <span class="m-rs">${App.fmtDate(a.at)}</span></div>`).join('')}</div>`:'<div class="m-empty" style="padding:18px">Zatím bez historie schvalování.</div>';
      sheet('Schválení dokumentu',`<div class="m-rs" style="padding:0 4px 6px">${esc(name)}</div>
        ${canApr?`<div style="display:flex;gap:8px;padding:0 4px 10px"><button class="m-btn-primary" style="flex:1;margin:0" onclick="MApp.doApprove('${eid}','${name.replace(/'/g,"\\'")}','approved')">✓ Schválit</button><button class="m-btn-primary" style="flex:1;margin:0;background:var(--alert-due)" onclick="MApp.doApprove('${eid}','${name.replace(/'/g,"\\'")}','rejected')">✕ Zamítnout</button></div>`:'<div class="m-rs" style="padding:0 4px 10px;color:var(--text-3)">Vaše role nemůže schvalovat – jen zobrazení stavu.</div>'}
        <div class="m-rs" style="padding:0 4px 4px"><b>Auditní stopa</b></div>${hist}`);
    },
    doApprove(eid,name,decision){ const real=docReal({eid,name}); if(real){ App.docApprove(real.id,decision,''); } closeSheet(); toast(decision==='approved'?'Dokument schválen ✓':'Dokument zamítnut'); render('replace'); },
    /* ---- backstage akce ---- */
    dokladDetail(id){ const d=App.doklady().find(x=>x.id===id); if(!d)return;
      const items=(d.items||[]).map(it=>{const k=App.diteById(it.diteId);return `<div class="m-d-row"><div style="flex:1"><div class="k">${esc((k&&k.n)||it.name||'—')}</div></div><div class="v">${(it.kc||0).toLocaleString('cs')} Kč</div></div>`;}).join('')||'<div class="m-rs">Bez rozúčtování.</div>';
      sheet('Doklad '+esc(d.cislo),`<div class="m-d-row"><div style="flex:1"><div class="k">Datum / typ</div></div><div class="v">${App.fmtDate(d.datum)} · ${esc(d.typ||'')}</div></div>
        <div class="m-d-row"><div style="flex:1"><div class="k">Celkem</div></div><div class="v"><b>${(d.total||0).toLocaleString('cs')} Kč</b></div></div>
        <div class="m-d-row"><div style="flex:1"><div class="k">Stav</div></div><div class="v">${d.stav==='zauctovano'?'<span class="m-badge" style="background:var(--alert-ok-soft,#e6f6ec);color:#1a8a4a">zaúčtováno</span>':'návrh'}</div></div>
        <div class="m-rs" style="margin:12px 0 4px"><b>Rozúčtování na děti (SPVPP)</b></div>${items}`); },
    vykazApprove(id,dec){ App.vykazApprove(id,dec); toast(dec==='schvaleno'?'Výkaz schválen – odměna spočítána ✓':'Výkaz zamítnut'); render('replace'); },
    archivExport(hid){ const h=App.byId(hid); if(!h)return;
      const chk=ARCH_SECT.map(([k,l,on])=>`<label style="display:flex;align-items:center;gap:10px;padding:10px 0;font-size:15px;border-top:1px solid var(--border)"><input type="checkbox" id="ax-${k}" ${on?'checked':''} style="width:18px;height:18px"> ${l}</label>`).join('');
      const fmts=[['pdf','PDF'],['xls','Excel'],['csv','CSV'],['xml','XML'],['json','JSON']];
      sheet('Export – '+esc(famName(h)),`<div class="m-rs" style="padding:0 2px 4px">Vyber, co se vyexportuje (min. míra, bez soukromých poznámek KO).</div>
        <div style="padding:0 2px">${chk}</div>
        <div class="m-field" style="margin-top:12px"><label>Formát</label><select id="ax-fmt">${fmts.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></div>
        <div class="m-sheet-foot"><button class="m-btn-primary" onclick="MApp.archivDoExport(${hid})">Exportovat</button></div>`); },
    archivDoExport(hid){ const h=App.byId(hid); if(!h)return; const g=k=>{const e=document.getElementById('ax-'+k);return e&&e.checked;};
      const fmt=(document.getElementById('ax-fmt')||{}).value||'json'; const tables=[];
      if(g('zaklad')) tables.push({name:'Dohoda',head:['Pole','Hodnota'],rows:[['Název',h.name],['Město',h.city],['Dětí',h.kids.length],['Klíčová osoba',App.workerFull(h.worker)],['Stav',App.DOHODA_STAVY[App.dohodaStav(hid).stav]]]});
      if(g('deti')) tables.push({name:'Děti',head:['Jméno','Věk','Typ péče'],rows:h.kids.map(k=>[k.n,k.age!=null?k.age:'',(App.CARE[k.care]||{}).label||k.care||''])});
      if(g('pestouni')) tables.push({name:'Pěstouni',head:['Jméno','Role'],rows:h.fosters.map(f=>[f.n,f.isFoster?'pěstoun':'člen'])});
      if(g('respit')) tables.push({name:'Respit',head:['Metrika','Dny'],rows:[['Vykázaný',App.respitVykazano(hid)],['Reálný',App.respitRealny(hid)],['Limit',App.respitLimit(hid)]]});
      if(g('spvpp')) tables.push({name:'SPVPP',head:['Dítě','Rozpočet','Vyčerpáno'],rows:h.kids.map(k=>{const w=App.spvppWallet(k.id);return [k.n,w.rozpocet,w.vycerpano];})});
      if(g('vzdelavani')) tables.push({name:'Vzdělávání',head:['Pěstoun','Hodiny','Povinnost'],rows:h.fosters.filter(f=>f.isFoster).map(f=>[f.n,f.eduDone,f.req])});
      if(g('dokumenty')) tables.push({name:'Dokumenty',head:['Název','Datum'],rows:App.allDocs().filter(d=>h.fosters.concat(h.kids).some(p=>p.id===d.eid)).map(d=>[d.name,d.date])});
      if(!tables.length){ toast('Vyber aspoň jednu sekci'); return; }
      App.exportReport(fmt,{title:'Export_'+famName(h).replace(/\s+/g,'_'),meta:{Dohoda:h.name,Export:App.todayISO},tables});
      closeSheet(); toast('Export ('+fmt.toUpperCase()+') ✓'); },
    /* monetizace */
    mzTariff(k){ App.aiTariffSet(k); toast('Tarif: '+App.aiTariff().nazev); render('replace'); },
    mzSuspend(b){ App.aiSuspendSet(b); toast(b?'AI pozastavena':'AI obnovena'); render('replace'); },
    /* nastavení reportů */
    cfgToggle(k,v){ const c=App.reportCfgLoad(); c[k]=v; App.reportCfgSave(c); render('replace'); },
    jobToggle(id){ App.reportJobToggle(id); render('replace'); },
    jobRun(id){ App.reportJobRun(id); toast('Report vytvořen a odeslán (simulace) ✓'); render('replace'); },
    jobDel(id){ App.reportJobDel(id); toast('Smazáno'); render('replace'); },
    jobAddSheet(){ const PER=App.REPORT_PERIODY;
      sheet('Nová automatizace',`
        <div class="m-field"><label>Název</label><input id="jb-nazev" placeholder="Měsíční přehled pro vedení"></div>
        <div class="m-field"><label>Frekvence</label><div class="m-seg" id="jb-perseg">${Object.entries(PER).map(([k,l],i)=>`<button type="button" class="${i===1?'on':''}" data-k="${k}" onclick="MApp._jbPer('${k}')">${l}</button>`).join('')}</div></div>
        <div class="m-field"><label>Formát</label><div class="m-seg" id="jb-fmtseg">${['pdf','xls','csv'].map((f,i)=>`<button type="button" class="${i===0?'on':''}" data-k="${f}" onclick="MApp._jbFmt('${f}')">${f.toUpperCase()}</button>`).join('')}</div></div>
        <div class="m-field"><label>Příjemci (e-mail)</label><input id="jb-prij" placeholder="vedeni@doprovazeni.cz"></div>
        <div class="m-sheet-foot"><button class="m-btn-primary" onclick="MApp.jobAdd()">Přidat automatizaci</button></div>`);
      MApp._jbP='mesicne'; MApp._jbF='pdf'; },
    _jbPer(k){ MApp._jbP=k; document.querySelectorAll('#jb-perseg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k)); },
    _jbFmt(k){ MApp._jbF=k; document.querySelectorAll('#jb-fmtseg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k)); },
    jobAdd(){ const prij=(document.getElementById('jb-prij')||{}).value||''; if(!prij){toast('Zadej e-mail');return;}
      App.reportJobAdd({nazev:(document.getElementById('jb-nazev')||{}).value||'Report',report:'org',perioda:MApp._jbP||'mesicne',den:1,cas:'07:00',prijemci:prij,predmet:'Report {{obdobi}}',format:MApp._jbF||'pdf',sablona:'standard'});
      closeSheet(); toast('Automatizace přidána ✓'); render('replace'); },
    hubSec(k){ hubSec=k; render('replace'); },
    openSearch(){ searchQ=''; go(null,{page:'__search__',params:{}}); },
    searchInput(v){ searchQ=v; const el=document.getElementById('m-search-res'); if(el) el.innerHTML=searchResultsHtml(v); },
    openChat(typ,id){ chatScope='internal'; go(null,{page:'__chat__',params:{typ,id}}); },
    chatScope(k){ chatScope=k; render('replace'); },
    openReport(typ,id,from,to){ closeSheet(); repEdit=false; go(null,{page:'__report__',params:{typ,id,from,to}}); },
    repPrint(){ App.printReport(); },
    repEditToggle(){ repEdit=!repEdit; render('replace'); },
    repSave(){
      const el=document.getElementById('reportPrint'); if(!el)return;
      const p=route.params; const name=`Zpráva OSPOD ${App.fmtDate(p.from)}–${App.fmtDate(p.to)}`;
      App.saveReport(p.id,name,el.innerHTML); repEdit=false; render('replace'); toast('Report uložen a zapsán do chatu ✓');
    },
    chatSend(){
      const i=document.getElementById('m-chat-input'); if(!i)return; const v=i.value.trim(); if(!v)return;
      const cat=(document.getElementById('m-chat-cat')||{}).value||'note';
      App.chatAdd(route.params.id||'x',{cat,scope:chatScope,who:'me',text:v}); i.value='';
      render('replace');
    },
    async aiStructure(){
      const i=document.getElementById('m-chat-input'); const t=i?i.value.trim():''; if(!t){toast('Napiš nejdřív zápis');return;}
      if(!App.can('notes.add')){toast('Bez oprávnění');return;}
      toast(App.AI.live()?'AI pracuje…':'Strukturuji…');
      const r=await App.AI.structureNote(t); MApp._aiR=r; MApp._aiRaw=t;
      const catL=(App.CHAT_CATS[r.cat]||['Poznámka'])[0];
      const li=(a,c)=>a.length?a.map(x=>`<li${c?` style="color:${c}"`:''}>${esc(x)}</li>`).join(''):'<li style="color:var(--text-3)">žádné</li>';
      sheet('Strukturovaný zápis (AI)',`${App.AI.showDisclaimer()?`<div style="background:var(--active);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--text-2);margin:0 4px 10px">${esc(App.AI.disclaimer)}</div>`:''}
        <div style="padding:0 4px"><div style="margin:6px 0"><b>Kategorie:</b> ${catL}</div>
        <div style="margin:6px 0"><b>Shrnutí:</b><div>${esc(r.summary)}</div></div>
        <div style="margin:6px 0"><b>Úkoly:</b><ul style="margin:4px 0 0 18px">${li(r.tasks)}</ul></div>
        <div style="margin:6px 0"><b>Obavy:</b><ul style="margin:4px 0 0 18px">${li(r.concerns,'var(--alert-warn)')}</ul></div>
        ${r.ospodNotify?'<div style="margin:8px 0;color:var(--alert-due);font-weight:600">Zvážit nahlášení OSPOD</div>':''}</div>
        <button class="m-btn-primary" style="margin:12px 4px 4px" onclick="MApp.aiApply()">Vložit jako zápis</button>`);
    },
    aiApply(){ const r=MApp._aiR; if(!r)return; App.chatAdd(route.params.id||'x',{cat:r.cat,scope:chatScope,who:'me',text:MApp._aiRaw});
      closeSheet(); render('replace'); toast('Zápis vložen (AI) ✓'); },
    aiScan(){ if(!App.can('docs.upload')){toast('Bez oprávnění');return;}
      const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.capture='environment';
      i.onchange=async e=>{ const f=e.target.files[0]; if(!f)return; App.progressStart(); toast(App.AI.live()?'AI čte dokument…':'Čtu…');
        const buf=await f.arrayBuffer(); const by=new Uint8Array(buf); let bin=''; for(let k=0;k<by.length;k++)bin+=String.fromCharCode(by[k]);
        const mime=f.type||'image/jpeg'; const src='data:'+mime+';base64,'+btoa(bin);
        const r=await App.AI.ocrImage(btoa(bin), mime, f.name); App.progressStop(); MApp._ocr=Object.assign({name:f.name,src},r); MApp._ocrSheet(); };
      i.click();
    },
    _ocrSheet(){ const r=MApp._ocr; const kd=Object.keys(r.keyData||{});
      sheet('Přečtený dokument (AI)',`<div style="padding:0 4px">
        ${App.AI.showDisclaimer()?`<div style="background:var(--active);border-radius:10px;padding:9px 11px;font-size:12px;color:var(--text-2);margin-bottom:10px">${esc(App.AI.disclaimer)}</div>`:''}
        ${r.src?`<img src="${r.src}" style="max-width:100%;max-height:160px;border-radius:10px;display:block;margin-bottom:8px"/>`:''}
        <div style="margin:6px 0"><b>Typ:</b> ${esc(r.typ||'?')}${r.date?' · '+esc(r.date):''}</div>
        <div style="margin:6px 0"><b>Shrnutí:</b><div>${esc(r.summary||'')}</div></div>
        <div style="margin:6px 0"><b>Data:</b><ul style="margin:4px 0 0 18px">${kd.length?kd.map(k=>`<li>${esc(k)}: ${esc(String(r.keyData[k]))}</li>`).join(''):'<li style="color:var(--text-3)">—</li>'}</ul></div>
        ${r.hours?`<div style="margin:8px 0;color:var(--alert-ok)"><b>Rozpoznáno ${r.hours} h vzdělávání</b></div>`:''}
        <div style="margin:10px 0 2px"><b>Vaše poznámka</b></div><textarea id="m-ocrNote" placeholder="poznámka k dokumentu…" style="width:100%;min-height:44px;border:1px solid var(--border-2);border-radius:10px;padding:8px;font-size:13px"></textarea>
        <div style="display:flex;gap:6px;margin-top:10px"><input id="m-ocrQ" placeholder="Zeptat se na dokument…" style="flex:1;border:1px solid var(--border-2);border-radius:10px;padding:8px 10px"><button class="snd" onclick="MApp.ocrAsk()" style="background:var(--active);color:var(--accent)">→</button></div>
        <div id="m-ocrA" style="font-size:13px;margin-top:8px"></div>
        <button class="m-btn-primary" style="margin:12px 0 4px" onclick="MApp.ocrSave()">Uložit dokument</button></div>`);
    },
    ocrSave(){ const r=MApp._ocr; if(!r)return; const note=(document.getElementById('m-ocrNote')||{}).value||'';
      const finish=(thumb)=>{ const doc=App.docSave({eid:route.params.id,name:r.name,typ:r.typ,date:r.date,summary:r.summary,keyData:r.keyData,src:r.src,thumb,note}); closeSheet(); toast('Dokument uložen ✓'); App.openDocPreview(doc.id); };
      if(r.src) App.makeThumb(r.src,200,finish); else finish('');
    },
    async ocrAsk(){ const q=document.getElementById('m-ocrQ'); const t=q&&q.value.trim(); if(!t)return; const a=document.getElementById('m-ocrA'); a.textContent='…'; a.textContent=await App.AI.askDoc(t,MApp._ocr); },
    aiVoice(){
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){toast('Hlas nepodporován (zkuste Chrome)');return;}
      const btn=document.getElementById('m-mic'), inp=document.getElementById('m-chat-input');
      if(MApp._rec){ MApp._rec.stop(); return; }
      const rec=new SR(); MApp._rec=rec; rec.lang='cs-CZ'; rec.interimResults=true; rec.continuous=true;
      const base=(inp.value||''); let fin='';
      rec.onresult=e=>{ let it=''; for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript; if(e.results[i].isFinal)fin+=t; else it+=t;} inp.value=(base+' '+fin+' '+it).trim(); };
      rec.onend=()=>{ MApp._rec=null; if(btn)btn.innerHTML=svg(IC.mic,20); toast('Diktování ukončeno – uprav a strukturuj'); };
      rec.onerror=ev=>{ MApp._rec=null; if(btn)btn.innerHTML=svg(IC.mic,20); toast('Hlas: '+(ev.error||'chyba')); };
      rec.start(); if(btn)btn.innerHTML=svg(IC.stop,18); toast('Mluvte… (audio se neukládá)');
    },
    /* ---- TERÉNNÍ AKCE NA KARTĚ (dock) ---- */
    visitToggle(typ,id){
      if(visit && visit.id===id && visit.typ===typ){
        const min=Math.max(1,Math.round((Date.now()-visit.t0)/60000));
        visit=null; if(MApp._vt){clearInterval(MApp._vt);MApp._vt=null;}
        render('replace');
        MApp.quickCapture(typ,id,false,'visit','Návštěva v rodině ('+min+' min). ');
        toast('Návštěva ukončena · '+min+' min – doplň zápis');
      } else {
        if(!App.can('notes.add')){toast('Bez oprávnění zapisovat');return;}
        visit={typ,id,t0:Date.now()}; render('replace');
        if(MApp._vt) clearInterval(MApp._vt);
        MApp._vt=setInterval(()=>{ if(!visit){clearInterval(MApp._vt);MApp._vt=null;return;} const el=document.getElementById('m-visit-t'); if(el){const s=Math.floor((Date.now()-visit.t0)/1000); el.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');} },1000);
        toast('Návštěva zahájena  měřím čas');
      }
    },
    quickCapture(typ,id,voice,cat,preset){
      if(!App.can('notes.add')){toast('Bez oprávnění');return;}
      MApp._cap={typ,id,scope:'internal',cat:cat||'visit',ai:null};
      const cats=[['visit','Návštěva'],['contact','Kontakt'],['note','Poznámka']];
      const scopes=[['internal','Interní (DO)'],['pestoun','S pěstounem']];
      const seg=(arr,id2,sel,fn)=>`<div class="m-seg" id="${id2}">${arr.map(([k,l])=>`<button data-k="${k}" class="${sel===k?'on':''}" onclick="${fn}('${k}')">${l}</button>`).join('')}</div>`;
      sheet('Rychlý zápis do časové osy',`<div style="padding:0 4px">
        ${seg(cats,'m-cap-catseg',MApp._cap.cat,'MApp.capCat')}
        ${seg(scopes,'m-cap-scopeseg',MApp._cap.scope,'MApp.capScope')}
        <div style="position:relative;margin-top:2px">
          <textarea id="m-cap-text" placeholder="napiš nebo nadiktuj…" style="width:100%;min-height:96px;border:1px solid var(--border-2);border-radius:12px;padding:11px 48px 11px 12px;font-size:15px;line-height:1.4;box-sizing:border-box">${esc(preset||'')}</textarea>
          <button id="m-cap-mic" onclick="MApp.capMic()" title="Diktovat (cs-CZ)" style="position:absolute;right:8px;bottom:8px;width:38px;height:38px;border:none;border-radius:50%;background:var(--active);color:var(--text);display:grid;place-items:center;cursor:pointer">${svg(IC.mic,20)}</button>
        </div>
        <button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;margin:10px 0 0;justify-content:center;gap:8px;color:var(--accent);font-weight:600" onclick="MApp.capStructure()">${svg(IC.ai,18)} Strukturovat (AI) – kategorie, úkoly, obavy</button>
        <div id="m-cap-ai" style="font-size:13px;margin-top:8px"></div>
        <button class="m-btn-primary" style="margin:12px 0 4px" onclick="MApp.capSave()">Uložit do časové osy</button></div>`);
      if(voice) setTimeout(()=>MApp.capMic(),350);
    },
    capCat(k){ MApp._cap.cat=k; document.querySelectorAll('#m-cap-catseg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k)); },
    capScope(k){ MApp._cap.scope=k; document.querySelectorAll('#m-cap-scopeseg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k)); },
    capMic(){
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      const inp=document.getElementById('m-cap-text'), btn=document.getElementById('m-cap-mic');
      if(!SR){ toast('Hlas nepodporován (zkuste Chrome) – napište ručně'); if(inp)inp.focus(); return; }
      if(MApp._rec){ MApp._rec.stop(); return; }
      const rec=new SR(); MApp._rec=rec; rec.lang='cs-CZ'; rec.interimResults=true; rec.continuous=true;
      const base=(inp&&inp.value||''); let fin='';
      rec.onresult=e=>{ let it=''; for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript; if(e.results[i].isFinal)fin+=t; else it+=t;} if(inp) inp.value=(base+' '+fin+' '+it).trim(); };
      rec.onend=()=>{ MApp._rec=null; if(btn){btn.innerHTML=svg(IC.mic,20);btn.style.background='var(--active)';btn.style.color='var(--text)';} };
      rec.onerror=ev=>{ MApp._rec=null; if(btn){btn.innerHTML=svg(IC.mic,20);btn.style.background='var(--active)';btn.style.color='var(--text)';} toast('Hlas: '+(ev.error||'chyba')); };
      rec.start(); if(btn){btn.innerHTML=svg(IC.stop,18);btn.style.background='var(--alert-due)';btn.style.color='#fff';} toast('Mluvte… (audio se neukládá)');
    },
    async capStructure(){
      const inp=document.getElementById('m-cap-text'); const t=inp?inp.value.trim():''; if(!t){toast('Nejdřív napiš/nadiktuj text');return;}
      const box=document.getElementById('m-cap-ai'); if(box) box.innerHTML='<span style="color:var(--text-3)">AI pracuje…</span>';
      const r=await App.AI.structureNote(t); MApp._cap.ai=r; if(r.cat) MApp.capCat(r.cat);
      const li=a=>a&&a.length?('<ul style="margin:3px 0 0 16px">'+a.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>'):' <span style="color:var(--text-3)">žádné</span>';
      if(box) box.innerHTML=`${App.AI.showDisclaimer()?`<div style="background:var(--active);border-radius:8px;padding:7px 9px;color:var(--text-2);margin-bottom:6px;font-size:12px">${esc(App.AI.disclaimer)}</div>`:''}
        <div><b>Kategorie:</b> ${(App.CHAT_CATS[r.cat]||['Poznámka'])[0]}</div>
        <div style="margin-top:4px"><b>Shrnutí:</b> ${esc(r.summary||'')}</div>
        <div style="margin-top:4px"><b>Úkoly:</b>${li(r.tasks)}</div>
        <div style="margin-top:4px"><b>Obavy:</b>${li(r.concerns)}</div>
        ${r.ospodNotify?'<div style="margin-top:6px;color:var(--alert-due);font-weight:600">Zvážit nahlášení OSPOD</div>':''}`;
    },
    capSave(){
      const inp=document.getElementById('m-cap-text'); const t=inp?inp.value.trim():''; if(!t){toast('Zápis je prázdný');return;}
      const c=MApp._cap; App.chatAdd(c.id,{cat:c.cat,scope:c.scope,who:'me',text:t});
      closeSheet(); render('replace'); toast('Zapsáno do časové osy ✓');
    },
    /* ---- CHECKLISTY (terénní sběr, BEZ závěrů) ---- */
    checklist(typ,id){ if(!App.can('notes.add')){toast('Bez oprávnění');return;}
      const tpls=App.checklistTemplates();
      sheet('Checklist – co vyplnit?', `<div class="m-rs" style="padding:0 4px 6px;color:var(--text-3)">Rychlý sběr informací (kdo je přítomen + situace). Účel = sbírat, ne hodnotit.</div>
        <div class="m-group">${tpls.map(t=>`<a class="m-row" onclick="MApp.clFill('${t.id}','${id}')"><div class="m-rmeta"><div class="m-rt">${esc(t.name)}</div><div class="m-rs">${esc(t.scope||'')}${t.custom?' · vlastní':''} · ${t.items.length} položek</div></div>${chev}</a>`).join('')}</div>
        <button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;margin:8px 0 0;justify-content:center;gap:8px;color:var(--accent);font-weight:600" onclick="MApp.clNew('${id}')">${svg(IC.plus,18)} Vytvořit vlastní checklist</button>`); },
    clFill(tplId,id){ const t=App.checklistGet(tplId); if(!t)return; MApp._cl={tplId,id,ans:{},present:[]};
      const chip=(k,opt,multi)=>`<button type="button" class="m-clchip" data-k="${k}" data-opt="${esc(opt).replace(/"/g,'&quot;')}" onclick="MApp.cl${multi?'Multi':'Pick'}('${k}',this)">${esc(opt)}</button>`;
      const field=it=>{
        if(it.type==='who'){ const cands=App.checklistPresentCandidates(id,t.scope);
          return `<div class="m-clchips" id="m-who">${cands.map(c=>`<button type="button" class="m-clchip" data-who="${esc(c.name).replace(/"/g,'&quot;')}" onclick="MApp.clWho(this)">${esc(c.name)}${c.hint?`<span style="opacity:.55;font-size:11px"> · ${esc(c.hint)}</span>`:''}</button>`).join('')||'<span class="m-rs">Žádní navržení – přidej níže.</span>'}</div>
            <div style="display:flex;gap:6px;margin-top:7px"><input id="m-who-other" placeholder="jiná osoba…" onkeydown="if(event.key==='Enter'){MApp.clWhoAdd();event.preventDefault();}" style="flex:1;border:1px solid var(--border-2);border-radius:10px;padding:8px 11px;font-size:15px"><button type="button" onclick="MApp.clWhoAdd()" style="border:none;background:var(--active);color:var(--accent);border-radius:10px;width:44px;font-size:20px;cursor:pointer">+</button></div>`; }
        if(it.type==='single') return `<div class="m-clchips">${it.opts.map(o=>chip(it.k,o,false)).join('')}</div>`;
        if(it.type==='multi') return `<div class="m-clchips">${it.opts.map(o=>chip(it.k,o,true)).join('')}</div>`;
        if(it.type==='flag') return `<button type="button" class="m-clchip" data-k="${it.k}" onclick="MApp.clFlag('${it.k}',this)">Označit k pozornosti</button>`;
        return `<textarea id="cl-${it.k}" placeholder="…" style="width:100%;min-height:44px;border:1px solid var(--border-2);border-radius:10px;padding:9px;font-size:15px"></textarea>`;
      };
      sheet(esc(t.name), `<div style="padding:0 4px">${t.items.map(it=>`<div style="margin-bottom:15px"><div style="margin-bottom:6px;font-weight:600;font-size:14px">${esc(it.label)}</div>${field(it)}</div>`).join('')}
        <button class="m-btn-primary" style="margin:6px 0 4px" onclick="MApp.clSaveDo()">Uložit checklist do osy</button></div>`); },
    clPick(k,btn){ MApp._cl.ans[k]=btn.dataset.opt; const p=btn.parentElement; p.querySelectorAll('[data-k="'+k+'"]').forEach(b=>b.classList.toggle('on',b===btn)); },
    clMulti(k,btn){ const a=MApp._cl.ans[k]=MApp._cl.ans[k]||[]; const v=btn.dataset.opt; const i=a.indexOf(v); if(i>=0)a.splice(i,1); else a.push(v); btn.classList.toggle('on'); },
    clFlag(k,btn){ MApp._cl.ans[k]=!MApp._cl.ans[k]; btn.classList.toggle('on',MApp._cl.ans[k]); },
    clWho(btn){ const n=btn.dataset.who; const a=MApp._cl.present; const i=a.indexOf(n); if(i>=0)a.splice(i,1); else a.push(n); btn.classList.toggle('on'); },
    clWhoAdd(){ const inp=document.getElementById('m-who-other'); const n=(inp&&inp.value||'').trim(); if(!n)return; App.rememberPerson(n); if(MApp._cl.present.indexOf(n)<0)MApp._cl.present.push(n);
      const wrap=document.getElementById('m-who'); if(wrap){ const b=document.createElement('button'); b.type='button'; b.className='m-clchip on'; b.dataset.who=n; b.textContent=n; b.onclick=function(){MApp.clWho(this);}; wrap.appendChild(b); } if(inp){inp.value='';inp.focus();} },
    clSaveDo(){ const c=MApp._cl; if(!c)return; const t=App.checklistGet(c.tplId);
      t.items.forEach(it=>{ if(it.type==='who'){ c.ans.present=c.present.join(', '); } else if(it.type==='text'){ const el=document.getElementById('cl-'+it.k); if(el)c.ans[it.k]=el.value; } });
      App.checklistFill(c.tplId,c.id,c.ans); closeSheet(); render('replace'); toast('Checklist uložen do osy ✓'); },
    clNew(id){ MApp._cln={id}; const tpls=App.checklistTemplates();
      sheet('Nový vlastní checklist', `<div style="padding:0 4px">
        <div class="m-field"><label>Název</label><input id="cln-name" placeholder="např. Návštěva u babičky"></div>
        <div class="m-field"><label>Vyjít ze vzoru (volitelné)</label><select id="cln-base" onchange="MApp.clClone()" style="width:100%;border:1px solid var(--border-2);border-radius:10px;padding:9px;background:var(--surface);color:var(--text)"><option value="">— prázdné —</option>${tpls.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></div>
        <div class="m-rs" style="margin:2px 0 6px;line-height:1.55">Každý řádek = otázka:<br>• „Nálada: klid/napětí" → výběr ťukem<br>• „Témata: Škola/Zdraví +" → víc voleb (s +)<br>• „Cítí se bezpečně?" → ano / spíš / ne<br>• „Pozor !" → jen označit<br>• „Kdo přítomen" → výběr osob<br>• jinak krátký text</div>
        <textarea id="cln-items" placeholder="Kdo přítomen&#10;Nálada: klidná/napjatá/nehodnoceno&#10;Témata: Škola/Zdraví/Chování +&#10;Cítí se bezpečně?&#10;Pozor !&#10;Poznámka" style="width:100%;min-height:140px;border:1px solid var(--border-2);border-radius:10px;padding:9px;font-size:15px"></textarea>
        <button class="m-btn-primary" style="margin:10px 0 4px" onclick="MApp.clNewSave()">Uložit a použít</button></div>`); },
    clClone(){ const sel=document.getElementById('cln-base'), ta=document.getElementById('cln-items'); if(!sel||!ta)return; const t=App.checklistGet(sel.value); if(!t){ta.value='';return;}
      ta.value=t.items.map(it=>{ if(it.type==='who')return it.label; if(it.type==='flag')return it.label+' !'; if(it.type==='single')return it.label+': '+(it.opts||[]).join('/'); if(it.type==='multi')return it.label+': '+(it.opts||[]).join('/')+' +'; return it.label; }).join('\n');
      const nm=document.getElementById('cln-name'); if(nm&&!nm.value.trim())nm.value=t.name+' (moje verze)'; },
    clNewSave(){ const c=MApp._cln; const name=((document.getElementById('cln-name')||{}).value||'').trim()||'Vlastní checklist';
      const lines=((document.getElementById('cln-items')||{}).value||'').split('\n').map(s=>s.trim()).filter(Boolean);
      if(!lines.length){toast('Přidej aspoň jednu položku');return;}
      const items=lines.map((l,i)=>{ let multi=false; if(/\s\+$/.test(l)){ multi=true; l=l.replace(/\s\+$/,'').trim(); }
        if(/\s!$/.test(l)) return {k:'q'+i,label:l.replace(/\s!$/,'').trim(),type:'flag'};
        const m=l.match(/^(.+?):\s*(.+\/.+)$/);
        if(m) return {k:'q'+i,label:m[1].trim(),type:multi?'multi':'single',opts:m[2].split('/').map(s=>s.trim()).filter(Boolean)};
        if(/kdo|přítom|s kým|jednáno|účast/i.test(l)) return {k:'q'+i,label:l,type:'who'};
        if(/\?\s*$/.test(l)) return {k:'q'+i,label:l,type:'single',opts:['Ano','Spíš ano','Spíš ne','Ne','Nehodnoceno']};
        return {k:'q'+i,label:l,type:'text'}; });
      const t=App.saveChecklistTemplate({name,scope:'Vlastní',items}); closeSheet(); MApp.clFill(t.id,c.id); },
    /* ---- PŘIDAT PŘÍBUZNÉHO (karta dítěte) ---- */
    relAdd(id){ if(!App.can('contacts.edit')){toast('Bez oprávnění');return;} MApp._rel={id}; const groups=App.relGroups();
      sheet('Přidat příbuzného', `<div style="padding:0 4px">
        <button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;margin:0 0 10px;justify-content:center;color:var(--accent);font-weight:600" onclick="MApp.relWizard()">Pomoct s otcem (rodný list)</button>
        <div class="m-field"><label>Vztah k dítěti</label><select id="m-rel-type" onchange="MApp.relHint()" style="width:100%;border:1px solid var(--border-2);border-radius:10px;padding:10px;background:var(--surface);color:var(--text)">${Object.entries(groups).map(([g,arr])=>`<optgroup label="${g}">${arr.map(t=>`<option value="${t.key}">${esc(t.label)}</option>`).join('')}</optgroup>`).join('')}</select></div>
        <div id="m-rel-hint" class="m-rs" style="min-height:32px;margin:2px 0 6px;line-height:1.45"></div>
        <div class="m-field"><label>Jméno</label><input id="m-rel-name" placeholder="jméno a příjmení"></div>
        <div class="m-field"><label>Rodné číslo (primární ID, nemění se)</label><input id="m-rel-rc" placeholder="např. 765912/3210"></div>
        <div class="m-field"><label>Poznámka (nepovinné)</label><input id="m-rel-note" placeholder="např. styk 1× měsíčně"></div>
        <button class="m-btn-primary" style="margin:8px 0 4px" onclick="MApp.relSave()">Přidat příbuzného</button></div>`);
      MApp.relHint(); },
    relHint(){ const sel=document.getElementById('m-rel-type'); const t=App.REL_TYPES.find(x=>x.key===(sel&&sel.value)); const el=document.getElementById('m-rel-hint'); if(el)el.textContent=t&&t.hint?t.hint:''; },
    relSave(){ const r=MApp._rel; const sel=document.getElementById('m-rel-type'); const t=App.REL_TYPES.find(x=>x.key===(sel&&sel.value)); const name=((document.getElementById('m-rel-name')||{}).value||'').trim(); const rc=((document.getElementById('m-rel-rc')||{}).value||'').trim(); const note=((document.getElementById('m-rel-note')||{}).value||'').trim();
      if(!t||!name){toast('Vyber vztah a zadej jméno');return;} App.addChildRelative(r.id,{n:name,rc,rel:t.label,key:t.key,legal:t.legal,note}); closeSheet(); render('replace'); toast('Příbuzný přidán ✓'); },
    relWizard(){ sheet('Pomoct s otcem (RL)', `<div style="padding:0 4px;font-size:14px;line-height:1.55"><p style="margin-top:0"><b>Otec = vždy muž v rodném listě (RL).</b> Práva má jen on.</p><div style="font-weight:600;margin-bottom:7px">Je v RL zapsán otec?</div><div style="display:flex;gap:8px"><button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;justify-content:center" onclick="MApp.relFw(0)">Ne</button><button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;justify-content:center" onclick="MApp.relFwYes()">Ano</button></div><div id="m-fw2" style="margin-top:12px"></div></div>`); },
    relFwYes(){ const el=document.getElementById('m-fw2'); if(el)el.innerHTML=`<div style="font-weight:600;margin-bottom:7px">Domníváte se, že zapsaný NENÍ biologický?</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;justify-content:center" onclick="MApp.relFw(1)">Ne</button><button class="m-list-action" style="border:1px solid var(--border);border-radius:12px;justify-content:center" onclick="MApp.relFw(2)">Ano – bio je jiný</button></div>`; },
    relFw(c){ const msg=c===0?'Domnělého otce zapiš jako „Bio-otec (pravděpodobný)". Dítě zatím v RL otce nemá.':c===1?'Zapsaného jako „Otec (v rodném listě)"; případného jiného domnělého jako „Bio-otec (domnělý)".':'Zapsaného jako „Otec sociální (v RL)" a domnělého biologického jako „Bio-otec (pravděpodobný)".';
      sheet('Doporučení', `<div style="padding:0 4px;font-size:14px;line-height:1.6"><p style="margin-top:0">${esc(msg)}</p><p class="m-rs">Práva má jen otec v RL. Změna jen soudem (popření + určení dle DNA); soud nemusí popřít v nejvyšším zájmu dítěte.</p><button class="m-btn-primary" onclick="MApp.relAdd('${MApp._rel.id}')">Pokračovat na přidání</button></div>`); },
    /* ---- PODEPISOVÁNÍ – sdílený flow (App.signNewDoc), prefill podepisujícího ---- */
    signNew(typ,id){
      if(!App.can('docs.upload')){toast('Bez oprávnění');return;}
      const o=personOf(typ,id); const hh=o&&o.h; let signer=o?o.name:''; let role=typ==='dite'?'dítě':'pěstoun';
      if(hh){ const f=hh.fosters.find(x=>x.isFoster); if(f){ signer=f.n; role='pěstoun'; } }
      App.signNewDoc(id, signer, role);
    },
    /* ---- (zastaralé, ponecháno) původní mobilní podpis ---- */
    signStart(typ,id){
      if(!App.can('docs.upload')){toast('Bez oprávnění');return;}
      const o=personOf(typ,id); const hh=o&&o.h; const signers=[];
      if(hh){ hh.fosters.forEach(f=>signers.push([f.id,f.n,f.isFoster?'pěstoun':'člen domácnosti'])); }
      if(!signers.length&&o){ signers.push([id,o.name,typ==='dite'?'dítě':'']); }
      const tpls=['Souhlas se zpracováním osobních údajů (GDPR)','Souhlas s pořízením a užitím fotografií','Poučení o právech a povinnostech','Předávací protokol dokumentů','Individuální plán ochrany dítěte (IPOD)'];
      MApp._sig={typ,id,doc:tpls[0],signer:signers[0]?signers[0][1]:(o?o.name:''),role:signers[0]?signers[0][2]:''};
      sheet('Podepsat dokument',`<div style="padding:0 4px">
        <div class="m-rs" style="margin:2px 0 4px"><b>Dokument k podpisu</b></div>
        <select id="m-sg-doc" onchange="MApp._sig.doc=this.value" style="width:100%;border:1px solid var(--border-2);border-radius:10px;padding:11px;font-size:15px;background:var(--surface);color:var(--text)">${tpls.map(t=>`<option>${t}</option>`).join('')}</select>
        <div class="m-rs" style="margin:12px 0 4px"><b>Podepisuje</b></div>
        <select id="m-sg-signer" onchange="MApp._sigSetSigner(this.value)" style="width:100%;border:1px solid var(--border-2);border-radius:10px;padding:11px;font-size:15px;background:var(--surface);color:var(--text)">${signers.map(([sid,n,role])=>`<option value="${sid}">${esc(n)}${role?' – '+role:''}</option>`).join('')}</select>
        <div class="m-rs" style="margin:14px 2px;color:var(--text-3)">Dokument předložíte pěstounovi/dítěti, podepíše prstem přímo na displeji. Uloží se křivka podpisu, čas a auditní stopa k dokumentu.</div>
        <button class="m-btn-primary" style="margin:6px 0 4px;display:flex;align-items:center;justify-content:center;gap:8px" onclick="MApp.signPad()">${svg(IC.sign,18)} Předložit k podpisu</button></div>`);
    },
    _sigSetSigner(sid){ const o=personOf(MApp._sig.typ,MApp._sig.id); const hh=o&&o.h; let n='',role='';
      if(hh){ const f=hh.fosters.find(x=>x.id===sid); if(f){ n=f.n; role=f.isFoster?'pěstoun':'člen domácnosti'; } }
      if(!n){ n=o?o.name:''; } MApp._sig.signer=n; MApp._sig.role=role; },
    signPad(){
      const s=MApp._sig;
      sheet('Podpis dokumentu',`<div style="padding:0 4px">
        <div class="m-rs" style="margin:2px 0 4px">${esc(s.doc)}</div>
        <div style="margin:2px 0 10px;font-size:15px">Podepisuje: <b>${esc(s.signer)}</b>${s.role?' · '+esc(s.role):''}</div>
        <div style="position:relative;border:1.5px dashed var(--border-2);border-radius:12px;background:var(--surface);overflow:hidden">
          <canvas id="m-sig-canvas" style="width:100%;height:230px;display:block;touch-action:none"></canvas>
          <div id="m-sig-hint" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--text-3);font-size:15px;pointer-events:none">${svg(IC.sign,20)} Podepište se prstem</div>
          <div style="position:absolute;left:16px;right:16px;bottom:34px;border-bottom:1.5px solid var(--border-2)"></div>
          <div style="position:absolute;left:16px;bottom:14px;color:var(--text-3);font-size:11px">×</div>
        </div>
        <div style="display:flex;gap:9px;margin-top:12px">
          <button class="m-list-action" style="flex:1;border:1px solid var(--border);border-radius:12px;justify-content:center" onclick="MApp.sigClear()">Vymazat</button>
          <button class="m-btn-primary" style="flex:2;margin:0;display:flex;align-items:center;justify-content:center;gap:8px" onclick="MApp.sigConfirm()">${svg(IC.check,18)} Podepsat</button>
        </div>
        <div class="m-rs" style="margin:10px 2px 0;color:var(--text-3);font-size:11px;line-height:1.4">Elektronický podpis dle eIDAS (910/2014). Zaznamenává se dynamická křivka podpisu, čas a vazba na dokument (auditní stopa) → vyšší důkazní váha než prostý obrázek.</div></div>`);
      setTimeout(()=>MApp._sigInit(),120);
    },
    _sigInit(){
      const cv=document.getElementById('m-sig-canvas'); if(!cv)return;
      const rect=cv.getBoundingClientRect(); const dpr=window.devicePixelRatio||1;
      cv.width=Math.round(rect.width*dpr); cv.height=Math.round(rect.height*dpr);
      const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr); ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#111';
      MApp._sigCtx=ctx; MApp._sigPts=[]; MApp._sigDrawing=false; MApp._sigCanvas=cv;
      const pos=ev=>{ const r=cv.getBoundingClientRect(); const tp=ev.touches&&ev.touches[0]?ev.touches[0]:ev; return {x:tp.clientX-r.left,y:tp.clientY-r.top}; };
      const start=ev=>{ ev.preventDefault(); MApp._sigDrawing=true; const p=pos(ev); ctx.beginPath(); ctx.moveTo(p.x,p.y); MApp._sigPts.push({x:Math.round(p.x),y:Math.round(p.y),t:Date.now(),s:1}); const h=document.getElementById('m-sig-hint'); if(h)h.style.display='none'; };
      const move=ev=>{ if(!MApp._sigDrawing)return; ev.preventDefault(); const p=pos(ev); ctx.lineTo(p.x,p.y); ctx.stroke(); MApp._sigPts.push({x:Math.round(p.x),y:Math.round(p.y),t:Date.now(),s:0}); };
      const end=()=>{ MApp._sigDrawing=false; };
      cv.addEventListener('mousedown',start); cv.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
      cv.addEventListener('touchstart',start,{passive:false}); cv.addEventListener('touchmove',move,{passive:false}); cv.addEventListener('touchend',end);
    },
    sigClear(){ const cv=MApp._sigCanvas,ctx=MApp._sigCtx; if(cv&&ctx)ctx.clearRect(0,0,cv.width,cv.height); MApp._sigPts=[]; const h=document.getElementById('m-sig-hint'); if(h)h.style.display='flex'; },
    sigConfirm(){
      const s=MApp._sig, pts=MApp._sigPts||[]; if(pts.length<10){ toast('Podpis je prázdný'); return; }
      const cv=MApp._sigCanvas; const dataURL=cv?cv.toDataURL('image/png'):'';
      const dur=pts.length>1?Math.max(0,pts[pts.length-1].t-pts[0].t):0;
      const basis=s.doc+'|'+s.signer+'|'+App.todayISO+'|'+pts.map(p=>p.x+','+p.y+','+p.s).join(';');
      let hsh=0; for(let i=0;i<basis.length;i++){ hsh=(hsh*31+basis.charCodeAt(i))>>>0; }
      const hash=('00000000'+hsh.toString(16)).slice(-8);
      const d=new Date(); const tm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      const when=App.fmtDate(App.todayISO)+' '+tm;
      const note=`Elektronicky podepsal: ${s.signer}${s.role?' ('+s.role+')':''} · ${when} · zařízení: mobil KO · dynamická křivka ${pts.length} bodů / ${(dur/1000).toFixed(1)} s · otisk dokumentu ${hash}. eIDAS SES/AES, auditní stopa uložena.`;
      const finish=thumb=>{
        App.docSave({eid:s.id,name:s.doc+' – podepsáno',typ:'Podepsaný dokument',date:App.todayISO,src:dataURL,thumb,note,keyData:{Podepsal:s.signer,Role:s.role||'—',Čas:when,'Otisk (hash)':hash,'Body křivky':pts.length}});
        App.chatAdd(s.id,{cat:'doc',scope:'pestoun',who:'sys',text:`Dokument „${s.doc}" elektronicky podepsán – ${s.signer}${s.role?' ('+s.role+')':''}, ${when}. Otisk ${hash}.`,doc:true});
        hubSec='dokumenty'; closeSheet(); render('replace'); toast('Dokument podepsán ✓');
      };
      if(dataURL) App.makeThumb(dataURL,200,finish); else finish('');
    },
    reportAssistant(){ if(!App.can('reports.generate')){toast('Bez oprávnění');return;}
      MApp._ra={type:'OSPOD',from:route.params.from||'2026-01-01',to:route.params.to||'2026-06-30',inc:{visits:true,notes:true,tasks:true,docs:true,edu:true},note:'',focus:'__all__'};
      MApp._raSheet();
    },
    _raSheet(){ const r=MApp._ra; const TYPES=['OSPOD','Interní (DO)','Pro soud','Shrnutí pro pěstouna'];
      const presets=[['1. pol. 2026','2026-01-01','2026-06-30'],['Rok 2026','2026-01-01','2026-12-31'],['3 měsíce','2026-03-20','2026-06-20']];
      const chk=(k,l)=>`<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" ${r.inc[k]?'checked':''} onchange="MApp._raSet('inc.${k}',this.checked)" style="width:16px;height:16px"> ${l}</label>`;
      sheet('Asistent zprávy',`<div style="padding:0 4px">
        <div class="m-rs" style="margin:2px 0"><b>Typ zprávy</b></div><div class="m-seg" style="flex-wrap:wrap">${TYPES.map(t=>`<button class="${r.type===t?'on':''}" onclick="MApp._raSet('type','${t}')">${t}</button>`).join('')}</div>
        <div class="m-rs" style="margin:10px 0 2px"><b>Období</b></div><div class="m-seg">${presets.map(([l,f,t])=>`<button class="${r.from===f&&r.to===t?'on':''}" onclick="MApp._raSet('period','${f}|${t}')">${l}</button>`).join('')}</div>
        <div class="m-rs" style="margin:10px 0 2px"><b>Co zahrnout</b></div>${chk('visits','Návštěvy/kontakty')}${chk('notes','Poznámky KO')}${chk('tasks','Úkoly')}${chk('docs','Dokumenty')}${chk('edu','Vzdělávání')}
        <div class="m-rs" style="margin:10px 0 2px"><b>Zaměření</b></div><div class="m-seg" style="flex-wrap:wrap">${(()=>{const o=personOf(route.params.typ,route.params.id);const items=o&&o.h?(o.h.kids||[]).map(k=>k.n):[];return ['__all__'].concat(items).map(f=>`<button class="${r.focus===f?'on':''}" onclick="MApp._raSet('focus','${f.replace(/'/g,'')}')">${f==='__all__'?'Celá rodina':f}</button>`).join('');})()}</div>
        <div class="m-rs" style="margin:10px 0 2px"><b>Doplňující pokyn</b></div><textarea id="m-ra-note" oninput="MApp._ra.note=this.value" placeholder="nepovinné…" style="width:100%;min-height:50px;border:1px solid var(--border-2);border-radius:10px;padding:8px;font-size:13px">${(r.note||'').replace(/</g,'&lt;')}</textarea>
        <button class="m-btn-primary" style="margin:12px 0 4px" onclick="MApp.reportAssistantGo()">Sestavit zprávu</button></div>`);
    },
    _raSet(path,val){ const r=MApp._ra; if(path==='period'){const[f,t]=val.split('|');r.from=f;r.to=t;} else if(path.startsWith('inc.')){r.inc[path.slice(4)]=val;} else {r[path]=val;} MApp._raSheet(); },
    async reportAssistantGo(){ const r=MApp._ra; closeSheet(); toast(App.AI.live()?'AI sestavuje…':'Sestavuji…');
      const d=App.reportData({etype:route.params.typ,eid:route.params.id,from:r.from,to:r.to});
      const inc=Object.entries(r.inc).filter(([k,v])=>v).map(([k])=>({visits:'návštěvy a kontakty',notes:'poznámky KO',tasks:'úkoly',docs:'dokumenty',edu:'vzdělávání'}[k])).join(', ');
      const focus=r.focus&&r.focus!=='__all__'?` Zaměř se zejména na: ${r.focus}.`:'';
      const prompt=`Jsi klíčová osoba doprovázející organizace. Napiš česky zprávu typu „${r.type}" o průběhu pěstounské péče za období ${App.fmtDate(r.from)}–${App.fmtDate(r.to)}. Zahrň jen: ${inc||'obecný souhrn'}.${focus} Podklady: ${d.events.length} návštěv/kontaktů, ${d.notes.length} záznamů KO, ${d.tasks.length} úkolů, ${d.docs.length} dokumentů${d.foster?', vzdělávání '+d.foster.eduDone+'/'+d.foster.req+' h':''}. ${r.note?'Pokyn: '+r.note+'. ':''}Věcně, 5–8 vět, 3. osoba, nevymýšlej jména. Vrať pouze text.`;
      const text=await App.AI.generate(prompt);
      route.params.from=r.from; route.params.to=r.to; render('replace');
      setTimeout(()=>{ const el=document.querySelector('#reportPrint .rd-summary'); if(el){el.textContent=text;el.scrollIntoView({block:'center'});}
        const rp=document.getElementById('reportPrint'); if(rp&&route.params.id) App.saveReport(route.params.id, `${r.type} · ${App.fmtDate(r.from)}–${App.fmtDate(r.to)}`, rp.innerHTML);
        toast('Zpráva „'+r.type+'" sestavena a uložena ✓'); },120);
    },
    async repAIDraft(){ if(!App.can('reports.generate')){toast('Bez oprávnění');return;}
      const data=App.reportData({etype:route.params.typ,eid:route.params.id,from:route.params.from,to:route.params.to});
      toast(App.AI.live()?'AI sestavuje…':'Sestavuji…');
      const draft=await App.AI.draftReport(data);
      repEdit=true; render('replace');
      setTimeout(()=>{ const el=document.querySelector('#reportPrint .rd-summary'); if(el){ el.textContent=draft; el.scrollIntoView({block:'center'}); } toast('Souhrn navržen AI ✓'); },80);
    },
  };

  /* ============================================================ START */
  window.addEventListener('popstate',e=>{
    closeSheet();
    const st=e.state;
    const r=(st&&st.route)?st.route:parseLoc();
    const dir=(st&&typeof st.depth==='number'&&st.depth<navDepth)?'pop':'tab';
    navDepth=(st&&typeof st.depth==='number')?st.depth:0;
    route=r; render(dir);
  });
  function start(){
    history.replaceState({route:route,depth:0}, '', urlFor(route));
    render('none');
    const app=document.getElementById('m-app');
    // delegovaný click: anchory s interním href přesměruj přes SPA router
    app.addEventListener('click',e=>{
      const a=e.target.closest('a[href]'); if(!a)return;
      const href=a.getAttribute('href');
      if(!href) return;
      if(href==='#'){ e.preventDefault(); return; }
      if(/^https?:|^mailto:|^tel:/.test(href)) return;
      e.preventDefault(); go(href);
    });
    initGestures(app);
  }

  /* ---------- GESTA: swipe-zpět (od levé hrany) + pull-to-refresh ---------- */
  function initGestures(app){
    let sx=null, sy=null;            // start souřadnice
    let backScr=null, backOn=false;  // swipe-zpět
    let ptrEl=null, ptrOn=false, ptrPull=0; // pull-to-refresh
    let ind=null;
    const getInd=()=>{ if(!ind){ ind=document.createElement('div'); ind.className='m-ptr'; ind.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/></svg>'; document.body.appendChild(ind);} return ind; };

    app.addEventListener('touchstart',e=>{
      if(e.touches.length!==1){ sx=null; return; }
      const t=e.touches[0]; sx=t.clientX; sy=t.clientY; backOn=false; ptrOn=false; ptrPull=0;
      backScr=(sx<=26 && navDepth>0) ? app.querySelector('.m-screen.m-top') : null;
      const top=app.querySelector('.m-screen.m-top'); const sc=top&&top.querySelector('.m-scroll');
      ptrEl=(sc && sc.scrollTop<=0) ? sc : null;
    },{passive:true});

    app.addEventListener('touchmove',e=>{
      if(sx==null) return; const t=e.touches[0]; const dx=t.clientX-sx, dy=t.clientY-sy;
      // swipe zpět
      if(backScr && !ptrOn){
        if(!backOn){ if(dx>10 && dx>Math.abs(dy)) backOn=true; else if(Math.abs(dy)>12) backScr=null; }
        if(backOn){ const x=Math.max(0,dx); backScr.style.transition='none'; backScr.style.transform=`translateX(${x}px)`; backScr.style.boxShadow='-10px 0 28px rgba(0,0,0,.16)'; return; }
      }
      // pull-to-refresh
      if(ptrEl && !backOn && dy>0 && ptrEl.scrollTop<=0){
        ptrOn=true; ptrPull=Math.min(96, dy*0.5);
        const el=getInd(); el.style.transition='none'; el.style.opacity=Math.min(1,ptrPull/56); el.style.transform=`translateX(-50%) translateY(${ptrPull}px) rotate(${Math.round(ptrPull*4)}deg)`;
      }
    },{passive:true});

    app.addEventListener('touchend',e=>{
      if(sx==null) return; const dx=(e.changedTouches[0].clientX)-sx;
      // dokončení swipe-zpět
      if(backOn && backScr){ const scr=backScr;
        if(dx>92){ scr.style.transition=''; scr.style.transform=''; scr.style.boxShadow=''; MApp.back(); }
        else { scr.style.transition='transform .2s ease, box-shadow .2s ease'; scr.style.transform=''; scr.style.boxShadow=''; setTimeout(()=>{ if(scr)scr.style.transition=''; },220); }
      }
      // dokončení pull-to-refresh
      if(ptrOn){ const fire=ptrPull>54; if(ind){ ind.style.transition='opacity .25s, transform .25s'; ind.style.opacity='0'; ind.style.transform='translateX(-50%) translateY(0)'; }
        if(fire){ toast('Aktualizováno ✓'); render('replace'); } }
      sx=sy=null; backScr=null; backOn=false; ptrEl=null; ptrOn=false; ptrPull=0;
    },{passive:true});
  }
  if(document.readyState!=='loading') start();
  else document.addEventListener('DOMContentLoaded',start);
})();
