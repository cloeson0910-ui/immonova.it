/* IMMONOVA \u2014 Misura mq da planimetria (modulo condiviso).
   Uso: FloorplanMeasure.open({ fields:{ principale:"internal_size", accessoria:"accessory_size", garage:"garage_sqm", giardino:"garden_sqm" }, imageSrc: (facoltativo) });
   - Carica PDF (prima pagina) o immagine.
   - Scala automatica dalla griglia blu "10 metri" delle planimetrie catastali AdE, oppure
     "Imposta scala": due clic su una misura nota + metri.
   - "Aggiungi vano": clic dentro un vano, si colora fino ai muri e calcola mq calpestabili e lordi.
   - "Chiudi apertura": linea su ingresso/porta aperta per non far uscire il colore.
   - "Usa questi mq": somma per tipo e compila i campi indicati. */
(function(){
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  var PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var TYPES = { principale:{label:"Principale", color:[200,160,60]}, accessoria:{label:"Accessoria / deposito", color:[90,140,200]}, garage:{label:"Garage", color:[150,150,150]}, giardino:{label:"Giardino / esterno", color:[90,170,90]} };
  var S, opts, cv, ctx, img, root;

  function fresh(){ return { ppm:null, scaleSource:null, rooms:[], lines:[], walls:null, W:0, H:0, roomType:"principale", scalePts:[], useGross:true, tool:null, drag:null, lineWidth:4 }; }

  function css(){
    if(document.getElementById("fpmCss")) return;
    var st = document.createElement("style"); st.id = "fpmCss";
    st.textContent = "#fpmRoot{position:fixed;inset:0;z-index:99999;background:rgba(20,16,8,.55);display:flex;align-items:center;justify-content:center;font-family:inherit}"
      + "#fpmRoot .fpm-box{background:#faf6ee;width:min(1200px,96vw);max-height:94vh;overflow:auto;padding:18px 20px;border:1px solid rgba(166,127,52,.4);box-shadow:0 10px 40px rgba(0,0,0,.3)}"
      + "#fpmRoot .fpm-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}"
      + "#fpmRoot button{border:1px solid #a67f34;background:#fff;color:#3a2a08;padding:7px 12px;cursor:pointer;font-size:13px}"
      + "#fpmRoot button.on{outline:2px solid #a67f34;background:#f3e6c8}"
      + "#fpmRoot button.main{background:#a67f34;color:#fff}"
      + "#fpmRoot table{width:100%;border-collapse:collapse;font-size:13px}#fpmRoot td,#fpmRoot th{padding:4px 6px;border-bottom:1px solid rgba(166,127,52,.2)}"
      + "#fpmRoot canvas{max-width:100%;display:block;cursor:crosshair;touch-action:none}";
    document.head.appendChild(st);
  }

  function open(o){
    opts = o || {}; S = fresh(); css();
    if(root) root.remove();
    root = document.createElement("div"); root.id = "fpmRoot";
    root.innerHTML = '<div class="fpm-box">'
      + '<div style="display:flex;justify-content:space-between;align-items:center"><strong style="font-size:17px">\ud83d\udccf Misura superficie dalla planimetria</strong><button type="button" data-a="close">\u2715 Chiudi</button></div>'
      + '<div style="font-size:12px;opacity:.8;margin-top:6px">Carica la planimetria (PDF o immagine). La scala si legge da sola dalla griglia "10 metri" delle planimetrie catastali; se manca usa "Imposta scala" su una misura nota. Scegli il tipo e clicca dentro ogni vano. Se il colore esce da un ingresso o da una porta aperta, chiudila con una linea.</div>'
      + '<input type="file" accept="image/*,application/pdf,.pdf" style="display:none" data-a="file">'
      + '<div class="fpm-bar"><button type="button" data-a="load">\ud83d\udcc2 Carica planimetria</button>'
      + '<select data-a="type"><option value="principale">Principale</option><option value="accessoria">Accessoria / deposito</option><option value="garage">Garage</option><option value="giardino">Giardino / esterno</option></select>'
      + '<button type="button" data-a="room">\ud83d\uddb1 Aggiungi vano</button><button type="button" data-a="line">\u270f\ufe0f Chiudi apertura</button><button type="button" data-a="undoline">\u21a9 Togli ultima linea</button><button type="button" data-a="scale">\ud83d\udcd0 Imposta scala</button>'
      + '<label style="font-size:13px"><input type="checkbox" data-a="gross" checked> Superficie lorda (con muri)</label>'
      + '<button type="button" class="main" data-a="apply">\u2714 Usa questi mq</button></div>'
      + '<div data-a="panel"></div><div style="margin-top:10px;border:1px solid rgba(166,127,52,.28);overflow:auto"><canvas></canvas></div></div>';
    document.body.appendChild(root);
    cv = root.querySelector("canvas"); ctx = cv.getContext("2d");
    var q = function(a){ return root.querySelector('[data-a="' + a + '"]'); };
    q("close").onclick = close;
    q("load").onclick = function(){ q("file").click(); };
    q("file").onchange = function(e){ var f = e.target.files[0]; if(f) loadFile(f); e.target.value = ""; };
    q("type").onchange = function(e){ S.roomType = e.target.value; };
    q("room").onclick = function(){ setTool("room"); };
    q("line").onclick = function(){ setTool("line"); };
    q("scale").onclick = function(){ S.scalePts = []; setTool("scale"); };
    q("undoline").onclick = function(){ S.lines.pop(); recompute(); };
    q("gross").onchange = function(e){ S.useGross = e.target.checked; redraw(); panel(); };
    q("apply").onclick = apply;
    cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    panel();
    if(opts.imageSrc) loadSrc(opts.imageSrc);
  }
  function close(){ if(root){ root.remove(); root = null; } window.removeEventListener("pointerup", up); }
  function setTool(t){ S.tool = (S.tool === t) ? null : t; ["room","line","scale"].forEach(function(a){ root.querySelector('[data-a="' + a + '"]').classList.toggle("on", S.tool === a); }); }

  function loadPdfJs(){
    if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function(res, rej){ var s = document.createElement("script"); s.src = PDFJS; s.onload = function(){ window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; res(window.pdfjsLib); }; s.onerror = function(){ rej(new Error("libreria PDF non caricata")); }; document.head.appendChild(s); });
  }
  async function loadFile(f){
    try{
      if(f.type === "application/pdf" || /\.pdf$/i.test(f.name || "")){
        var lib = await loadPdfJs(), pdf = await lib.getDocument({ data: await f.arrayBuffer() }).promise, page = await pdf.getPage(1);
        var b = page.getViewport({ scale:1 }), sc = Math.min(6, Math.max(2, 3000/Math.max(b.width, b.height))), vp = page.getViewport({ scale:sc });
        var c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0,0,c.width,c.height);
        await page.render({ canvasContext:x, viewport:vp }).promise;
        loadSrc(c.toDataURL("image/png"));
      }else{
        var r = new FileReader(); r.onload = function(ev){ loadSrc(ev.target.result); }; r.readAsDataURL(f);
      }
    }catch(e){ alert("Impossibile leggere la planimetria: " + (e && e.message ? e.message : e)); }
  }
  function loadSrc(src){
    img = new Image(); if(!/^data:/.test(src)) img.crossOrigin = "anonymous";
    img.onload = function(){ var keep = S.useGross; S = fresh(); S.useGross = keep; cv.width = img.naturalWidth; cv.height = img.naturalHeight; redraw(); panel(); };
    img.onerror = function(){ alert("Immagine della planimetria non caricabile."); };
    img.src = src;
  }
  function pt(e){ var r = cv.getBoundingClientRect(); return { x:(e.clientX-r.left)*cv.width/r.width, y:(e.clientY-r.top)*cv.height/r.height }; }

  function imageData(){ var c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; var x = c.getContext("2d"); x.drawImage(img,0,0); return x.getImageData(0,0,c.width,c.height); }
  function blueScale(id){
    var W = id.width, H = id.height, d = id.data;
    function blue(i){ return d[i+2] > 150 && d[i] < 120 && d[i+1] < 120; }
    var col = new Uint32Array(W), y, x;
    for(y=0;y<H;y++) for(x=0;x<W;x++) if(blue((y*W+x)*4)) col[x]++;
    var best = -1, bn = 0; for(x=0;x<W;x++) if(col[x] > bn){ bn = col[x]; best = x; }
    if(best < 0 || bn < H*0.3) return null;
    var ticks = [], ml = Math.max(8, Math.round(W/150)), last = -1000;
    for(y=0;y<H;y++){ var len = 0; for(var dx=-ml*3; dx<=ml*3; dx++){ var xx = best+dx; if(xx>=0 && xx<W && blue((y*W+xx)*4)) len++; }
      if(len >= ml*1.6 && len <= ml*6){ if(y - last > ml*2) ticks.push(y); last = y; } }
    if(ticks.length < 3) return null;
    var df = []; for(var i=1;i<ticks.length;i++) df.push(ticks[i]-ticks[i-1]);
    df.sort(function(a,b){return a-b;}); var med = df[Math.floor(df.length/2)];
    var good = df.filter(function(v){ return Math.abs(v-med) < med*0.06; }); if(good.length < 2) return null;
    return good.reduce(function(a,b){return a+b;},0)/good.length/10;
  }
  function box(src, W, H, r, mx){
    var tmp = new Uint8Array(W*H), out = new Uint8Array(W*H), h = Math.floor(r/2), x, y, k, v, p;
    for(y=0;y<H;y++){ var row = y*W; for(x=0;x<W;x++){ v = mx?0:1; for(k=-h;k<=r-h-1;k++){ var xx = x+k; p = (xx<0||xx>=W)?(mx?0:1):src[row+xx]; if(mx){ if(p){v=1;break;} } else if(!p){v=0;break;} } tmp[row+x] = v; } }
    for(x=0;x<W;x++){ for(y=0;y<H;y++){ v = mx?0:1; for(k=-h;k<=r-h-1;k++){ var yy = y+k; p = (yy<0||yy>=H)?(mx?0:1):tmp[yy*W+x]; if(mx){ if(p){v=1;break;} } else if(!p){v=0;break;} } out[y*W+x] = v; } }
    return out;
  }
  function walls(){
    var id = imageData(), W = id.width, H = id.height, d = id.data;
    if(!S.ppm){ var a = blueScale(id); if(a){ S.ppm = a; S.scaleSource = "griglia catastale 10 m (automatica)"; } }
    var dk = new Uint8Array(W*H);
    for(var i=0,p=0;i<W*H;i++,p+=4){ var bl = d[p+2] > 150 && d[p] < 120 && d[p+1] < 120; dk[i] = (!bl && (0.299*d[p]+0.587*d[p+1]+0.114*d[p+2]) < 90) ? 1 : 0; }
    var s = S.ppm ? S.ppm/52.5 : W/3311, kO = Math.max(2, Math.round(3*s)), kC = Math.max(3, Math.round(7*s));
    var w = box(box(dk,W,H,kO,false),W,H,kO,true); w = box(box(w,W,H,kC,true),W,H,kC,false);
    S.walls = w; S.W = W; S.H = H; S.lineWidth = kC;
  }
  function barrier(){
    var W = S.W, H = S.H, b = new Uint8Array(S.walls), c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d"); x.strokeStyle = "#000"; x.lineWidth = Math.max(4, S.lineWidth); x.lineCap = "round";
    S.lines.forEach(function(l){ x.beginPath(); x.moveTo(l.x1,l.y1); x.lineTo(l.x2,l.y2); x.stroke(); });
    var dd = x.getImageData(0,0,W,H).data; for(var i=0,p=3;i<W*H;i++,p+=4) if(dd[p] > 0) b[i] = 1;
    return b;
  }
  function fill(sx, sy){
    var W = S.W, H = S.H, bar = barrier(), s0 = Math.round(sy)*W + Math.round(sx);
    if(bar[s0]) return { error:"Hai cliccato su un muro: clicca all'interno del vano." };
    var seen = new Uint8Array(W*H), st = new Int32Array(W*H), top = 0, n = 0, leak = false, idx = [];
    var maxPx = S.ppm ? 2500*S.ppm*S.ppm : W*H*0.5; st[top++] = s0; seen[s0] = 1;
    while(top){ var i = st[--top]; idx.push(i); n++; if(n > maxPx){ leak = true; break; }
      var x = i % W, y = (i-x)/W; if(x===0||y===0||x===W-1||y===H-1){ leak = true; break; }
      var nb = [i-1,i+1,i-W,i+W]; for(var k=0;k<4;k++){ var j = nb[k]; if(!seen[j] && !bar[j]){ seen[j] = 1; st[top++] = j; } } }
    if(leak) return { error:"Il colore esce dal disegno: c'\u00e8 un'apertura (ingresso, porta, muro interrotto). Usa \"Chiudi apertura\" tracciando una linea sull'apertura, poi riprova." };
    var reg = new Uint8Array(W*H); idx.forEach(function(q){ reg[q] = 1; });
    var r = Math.max(3, Math.round((S.ppm||50)*0.5)*2+1), near = box(reg,W,H,r,true), g = 0;
    for(var q=0;q<W*H;q++) if(reg[q] || (near[q] && S.walls[q])) g++;
    return { idx:Int32Array.from(idx), net:n, gross:g };
  }
  function addRoom(p){
    if(!img){ alert("Carica prima la planimetria."); return; }
    if(!S.walls) walls();
    if(!S.ppm){ alert("Scala non trovata automaticamente: usa \"Imposta scala\" (due clic su una misura nota) e poi riprova."); return; }
    var r = fill(p.x, p.y); if(r.error){ alert(r.error); return; }
    var k = S.ppm*S.ppm; S.rooms.push({ type:S.roomType, seed:p, idx:r.idx, net:r.net/k, gross:r.gross/k }); redraw(); panel();
  }
  function recompute(){
    if(!img) return; if(!S.walls) walls();
    S.rooms.forEach(function(r){ var f = fill(r.seed.x, r.seed.y); if(!f.error){ var k = S.ppm*S.ppm; r.idx = f.idx; r.net = f.net/k; r.gross = f.gross/k; } else r.idx = null; });
    redraw(); panel();
  }
  function redraw(){
    if(!img) return; var W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H); ctx.drawImage(img,0,0);
    if(S.rooms.length){
      var im = ctx.getImageData(0,0,W,H), d = im.data;
      S.rooms.forEach(function(r){ if(!r.idx) return; var c = TYPES[r.type].color; for(var k=0;k<r.idx.length;k++){ var p = r.idx[k]*4; d[p]=(d[p]+c[0])>>1; d[p+1]=(d[p+1]+c[1])>>1; d[p+2]=(d[p+2]+c[2])>>1; } });
      ctx.putImageData(im,0,0);
      S.rooms.forEach(function(r,i){ var fs = Math.max(16, W/70); ctx.save(); ctx.font = "bold " + Math.round(fs) + "px sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = fs/5; ctx.strokeStyle = "#fff"; ctx.fillStyle = "#3a2a08";
        var t = (i+1) + ") " + (S.useGross ? r.gross : r.net).toFixed(1).replace(".", ",") + " mq"; ctx.strokeText(t, r.seed.x, r.seed.y); ctx.fillText(t, r.seed.x, r.seed.y); ctx.restore(); });
    }
    ctx.save(); ctx.strokeStyle = "#d0021b"; ctx.lineWidth = Math.max(4, W/400); ctx.lineCap = "round";
    S.lines.forEach(function(l){ ctx.beginPath(); ctx.moveTo(l.x1,l.y1); ctx.lineTo(l.x2,l.y2); ctx.stroke(); });
    ctx.fillStyle = "#1565c0"; S.scalePts.forEach(function(s){ ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(6, W/250), 0, Math.PI*2); ctx.fill(); });
    ctx.restore();
  }
  function down(e){
    if(!S.tool || !img) return; var p = pt(e);
    if(S.tool === "room"){ var b = root.querySelector('[data-a="room"]'); b.textContent = "\u23f3 Calcolo..."; setTimeout(function(){ try{ addRoom(p); } finally { b.textContent = "\ud83d\uddb1 Aggiungi vano"; } }, 20); return; }
    if(S.tool === "scale"){ S.scalePts.push(p); redraw(); if(S.scalePts.length === 2){ var a = S.scalePts[0], c = S.scalePts[1], px = Math.hypot(c.x-a.x, c.y-a.y);
      var m = parseFloat(String(prompt("Quanto misura in metri il tratto tra i due punti? (es. 2 per una porta di 2 m)") || "").replace(",", ".")); S.scalePts = [];
      if(m > 0 && px > 5){ S.ppm = px/m; S.scaleSource = "misura nota: " + String(m).replace(".", ",") + " m"; S.walls = null; setTool(null); recompute(); } else redraw(); } return; }
    if(S.tool === "line"){ S.drag = p; }
  }
  function move(e){ if(!S.drag) return; var p = pt(e); redraw(); ctx.save(); ctx.strokeStyle = "#d0021b"; ctx.lineWidth = Math.max(4, cv.width/400); ctx.setLineDash([10,6]); ctx.beginPath(); ctx.moveTo(S.drag.x,S.drag.y); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.restore(); }
  function up(e){ if(!S || !S.drag) return; var p = pt(e), a = S.drag; S.drag = null; if(Math.hypot(p.x-a.x, p.y-a.y) > 5){ S.lines.push({ x1:a.x, y1:a.y, x2:p.x, y2:p.y }); recompute(); } else redraw(); }
  function totals(){ var t = { principale:0, accessoria:0, garage:0, giardino:0 }; S.rooms.forEach(function(r){ t[r.type] += S.useGross ? r.gross : r.net; }); return t; }
  function panel(){
    var el = root.querySelector('[data-a="panel"]'), t = totals(), h = '<div style="font-size:13px;margin:6px 0">Scala: <strong>' + (S.ppm ? S.scaleSource : "non ancora rilevata (verr\u00e0 cercata al primo vano)") + '</strong></div>';
    if(S.rooms.length){
      h += '<table><tr><th style="text-align:left">Vano</th><th style="text-align:left">Tipo</th><th style="text-align:right">Calpestabile</th><th style="text-align:right">Lorda</th><th></th></tr>';
      S.rooms.forEach(function(r,i){ h += '<tr><td>' + (i+1) + '</td><td>' + TYPES[r.type].label + '</td><td style="text-align:right">' + r.net.toFixed(1).replace(".", ",") + ' mq</td><td style="text-align:right">' + r.gross.toFixed(1).replace(".", ",") + ' mq</td><td style="text-align:right"><button type="button" data-del="' + i + '">\u2715</button></td></tr>'; });
      h += '</table><div style="margin-top:6px;font-size:13px">Totali (' + (S.useGross ? "lordi" : "calpestabili") + '): ' + Object.keys(t).filter(function(k){ return t[k] > 0; }).map(function(k){ return TYPES[k].label + " <strong>" + t[k].toFixed(1).replace(".", ",") + " mq</strong>"; }).join(" \u00b7 ") + '</div>';
    }
    el.innerHTML = h;
    el.querySelectorAll("[data-del]").forEach(function(b){ b.onclick = function(){ S.rooms.splice(+b.getAttribute("data-del"),1); redraw(); panel(); }; });
  }
  function apply(){
    if(!S.rooms.length){ alert("Nessun vano misurato."); return; }
    var t = totals(), f = opts.fields || {}, done = [], miss = 0;
    Object.keys(t).forEach(function(k){ if(!t[k]) return; var id = f[k] || null;
      var el = id && document.getElementById(id);
      if(!el){ miss += t[k]; return; }
      el.value = Math.round(t[k]); el.dispatchEvent(new Event("input",{bubbles:true})); el.dispatchEvent(new Event("change",{bubbles:true})); done.push(TYPES[k].label + " " + Math.round(t[k]) + " mq"); });
    if(typeof opts.onApply === "function") opts.onApply({ totals:t, useGross:S.useGross, ppm:S.ppm, scaleSource:S.scaleSource });
    alert("Inserito: " + (done.join(", ") || "nessun campo") + (miss ? "\n(Superfici di altro tipo non hanno un campo dedicato in questa pagina: " + Math.round(miss) + " mq non inseriti.)" : ""));
    close();
  }
  window.FloorplanMeasure = { open: open };
})();
