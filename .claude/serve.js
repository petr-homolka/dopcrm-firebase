const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const MT={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};

// Lokální "Vertex-like" AI proxy pro TESTOVÁNÍ živého režimu (mimikuje kontrakt Apps Script proxy).
// Marker [Vertex EU] dokazuje, že odpověď přišla z proxy (ne z mocku ve frontendu).
function aiProxy(req,res){
  let body='';
  req.on('data',c=>body+=c);
  req.on('end',()=>{
    let out={error:'bad request'};
    try{
      const r=JSON.parse(body||'{}');
      if(r.action==='structure'){
        const t=(r.text||'').toLowerCase();
        out={
          cat: /(návštěv|byli|doma|rodin)/.test(t)?'visit':/(volal|telefon)/.test(t)?'contact':'note',
          summary: '[Vertex EU] '+((r.text||'').trim().slice(0,150)||'(prázdný zápis)'),
          tasks: (r.text||'').match(/(zajistit|domluvit|kontaktovat|doložit|objednat)[^.!?\n]*/gi)||[],
          concerns: /(problém|absen|smutn|kriz|nemoc)/.test(t)?['Zmíněn možný problém – sledovat.']:[],
          ospodNotify: /(ospod|ohrožen|násil)/.test(t)
        };
      } else if(r.action==='report'){
        const s=r.stats||{};
        out={ text:'[Vertex EU] Ve sledovaném období proběhlo '+(s.events||0)+' návštěv a kontaktů, evidováno '+(s.notes||0)+' záznamů KO. '+
          (s.foster?('Vzdělávání pěstouna '+s.foster.done+'/'+s.foster.req+' h. '):'')+
          'Spolupráce s rodinou je funkční, péče probíhá v souladu s dohodou; nebyly zjištěny skutečnosti vyžadující mimořádné opatření OSPOD. Doporučujeme pokračovat v pravidelných návštěvách.' };
      }
    }catch(e){ out={error:String(e)}; }
    res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify(out));
  });
}

http.createServer((req,res)=>{
  if(req.url.split('?')[0]==='/ai-proxy' && req.method==='POST') return aiProxy(req,res);
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/prehled.html';
  const f=path.join(root,p);
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end('404');return;}
    res.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'}); res.end(d); });
}).listen(8765,()=>console.log('serving on 8765'));
