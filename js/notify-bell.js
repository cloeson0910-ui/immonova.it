/* push: stessa logica di admin/diario.html (window.ImmonovaPush), se la pagina non l'ha già */
if(!window.ImmonovaPush){
/* IMMONOVA – notifiche push collaboratori (app installata).
   Collega il dispositivo all'utente loggato (tabella immonova_push_subscriptions, audience
   "collaborator") tramite la edge function register-collaborator-push.
   IMPORTANTE: un telefono può avere già il permesso notifiche concesso per l'app pubblica
   (iscrizione anonima, senza utente): in quel caso va solo ricollegato all'utente, cosa che
   sync() fa in automatico e in silenzio ad ogni apertura. */
(function(){
  function isStandalone(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
  function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function supported(){ return ("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window); }
  function b64(b){ var p = "=".repeat((4 - b.length % 4) % 4); var r = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(r, function(c){ return c.charCodeAt(0); }); }
  function timeout(p, ms, what){ return Promise.race([p, new Promise(function(_, rej){ setTimeout(function(){ rej(new Error(what + ": tempo scaduto, riprova.")); }, ms); })]); }
  async function errMsg(r){ try{ var j = await r.error.context.json(); return j.error || r.error.message; }catch(e){ return r.error.message; } }
  async function reg(){
    var g = await navigator.serviceWorker.getRegistration("/");
    if(!g) await navigator.serviceWorker.register("/service-worker.js", { scope:"/" });
    return timeout(navigator.serviceWorker.ready, 15000, "Avvio app");
  }
  async function save(client, sub){
    var r = await client.functions.invoke("register-collaborator-push", { body:{ action:"subscribe", subscription:sub.toJSON(), user_agent:navigator.userAgent } });
    if(r.error) throw new Error(await errMsg(r));
    if(!r.data || !r.data.ok) throw new Error((r.data && r.data.error) || "Iscrizione non salvata.");
  }
  function unsupportedText(){
    return isIOS() && !isStandalone()
      ? "Su iPhone le notifiche funzionano solo dall'app: in Safari tocca Condividi → Aggiungi alla schermata Home e apri IMMONOVA dall'icona."
      : "Questo browser non supporta le notifiche push.";
  }
  /* stato: "unsupported" | "denied" | "off" | "on" */
  async function state(){
    if(!supported()) return "unsupported";
    if(Notification.permission === "denied") return "denied";
    try{ var g = await navigator.serviceWorker.getRegistration("/"); var s = g ? await g.pushManager.getSubscription() : null;
      return (s && Notification.permission === "granted") ? "on" : "off"; }catch(e){ return "off"; }
  }
  /* collega in silenzio l'iscrizione già esistente all'utente loggato */
  async function sync(client){
    try{ if(await state() !== "on") return false; var g = await reg(); var s = await g.pushManager.getSubscription(); if(!s) return false; await save(client, s); return true; }
    catch(e){ return false; }
  }
  async function enable(client){
    if(!supported()) throw new Error(unsupportedText());
    var perm = await Notification.requestPermission();
    if(perm !== "granted") throw new Error("Permesso notifiche negato: abilitalo da Impostazioni del telefono → Notifiche → IMMONOVA.");
    var k = await client.functions.invoke("register-collaborator-push", { body:{ action:"key" } });
    if(k.error || !k.data || !k.data.publicKey) throw new Error("Chiave notifiche non disponibile" + (k.error ? ": " + await errMsg(k) : ""));
    var g = await reg();
    var s = await g.pushManager.getSubscription();
    if(!s) s = await timeout(g.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:b64(k.data.publicKey) }), 15000, "Iscrizione");
    await save(client, s);
  }
  async function test(client){
    var r = await client.functions.invoke("register-collaborator-push", { body:{ action:"test" } });
    if(r.error) throw new Error(await errMsg(r));
    return (r.data && r.data.sent) || 0;
  }
  /* widget pronto: pulsante + stato dentro un contenitore */
  async function mount(client, box){
    box.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<button type="button" data-a="on" style="padding:11px 16px;border-radius:9px;border:1px solid rgba(166,127,52,.35);background:#a67f34;color:#fffaf0;font:600 13px inherit;cursor:pointer">🔔 Attiva notifiche</button>' +
      '<button type="button" data-a="test" style="padding:11px 16px;border-radius:9px;border:1px solid rgba(166,127,52,.35);background:#fff;color:#46371a;font:600 13px inherit;cursor:pointer">Invia prova</button></div>' +
      '<div data-s style="font-size:13px;margin-top:8px;line-height:1.5"></div>';
    var st = box.querySelector("[data-s]"), on = box.querySelector('[data-a="on"]'), ts = box.querySelector('[data-a="test"]');
    function say(t, ok){ st.textContent = t; st.style.color = ok === false ? "#8a1f1f" : ok ? "#2b5a26" : "#56492d"; }
    async function refresh(){
      var s = await state();
      if(s === "unsupported"){ on.style.display = "none"; ts.style.display = "none"; say(unsupportedText(), false); return; }
      if(s === "denied"){ ts.style.display = "none"; say("Notifiche bloccate: abilitale da Impostazioni del telefono → Notifiche → IMMONOVA, poi tocca Attiva.", false); return; }
      if(s === "on"){ say("Collegamento del dispositivo…"); var ok = await sync(client);
        on.textContent = "🔔 Ricollega notifiche"; ts.style.display = "";
        say(ok ? "Notifiche attive su questo dispositivo per il tuo account." : "Notifiche consentite ma non collegate: tocca Ricollega.", ok); return; }
      ts.style.display = "none"; say("Notifiche non attive su questo dispositivo.");
    }
    on.onclick = async function(){ say("Attivazione in corso…"); try{ await enable(client); say("Notifiche attive su questo dispositivo per il tuo account.", true); ts.style.display = ""; on.textContent = "🔔 Ricollega notifiche"; }catch(e){ say(e.message || String(e), false); } };
    ts.onclick = async function(){ say("Invio prova…"); try{ var n = await test(client); say(n ? "Prova inviata a " + n + " dispositivo/i: deve arrivare tra pochi secondi." : "Nessun dispositivo collegato: tocca Attiva/Ricollega.", !!n); }catch(e){ say(e.message || String(e), false); } };
    refresh();
  }
  window.ImmonovaPush = { state:state, sync:sync, enable:enable, test:test, mount:mount, isIOS:isIOS, isStandalone:isStandalone };
})();
}
/* IMMONOVA – campanella notifiche (tutto il sito, solo per il team loggato).
   - legge immonova_notifications (le stesse notifiche che partono come push sul telefono)
   - aggiornamento in tempo reale + controllo ogni 60 secondi
   - se il dispositivo non riceve le push, lo dice e offre "Attiva notifiche su questo dispositivo"
   Viene caricata da js/config.js: non serve aggiungerla pagina per pagina. */
(function(){
  if(window.__immonovaBell) return; window.__immonovaBell = true;
  var client = window.supabaseClient; if(!client) return;
  var user = null, items = [], open = false;
  var css = '#inb{position:fixed;left:16px;bottom:16px;z-index:99990;font-family:"Avenir Next","Helvetica Neue",Arial,sans-serif}' +
    '#inb .b{width:52px;height:52px;border-radius:50%;background:#2b2416;color:#f1d27a;border:0;font-size:24px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25);position:relative}' +
    '#inb .c{position:absolute;top:-4px;right:-4px;min-width:21px;height:21px;padding:0 5px;border-radius:11px;background:#c0392b;color:#fff;font-size:12px;font-weight:700;line-height:21px;text-align:center}' +
    '#inb .dot{position:absolute;bottom:2px;right:2px;width:12px;height:12px;border-radius:50%;border:2px solid #2b2416}' +
    '#inb .p{position:absolute;left:0;bottom:62px;width:min(380px,calc(100vw - 32px));max-height:70vh;overflow:auto;background:#fffdf7;border:1px solid #e2d6bd;border-radius:14px;box-shadow:0 16px 40px rgba(43,36,22,.25);color:#2b2416}' +
    '#inb .h{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #eee3cc;font-weight:600;position:sticky;top:0;background:#fffdf7}' +
    '#inb .h a{font-size:12px;font-weight:500;color:#a67f34;cursor:pointer;text-decoration:underline}' +
    '#inb .pu{padding:10px 14px;font-size:12.5px;line-height:1.45;background:#fff7e0;border-bottom:1px solid #eee3cc}' +
    '#inb .pu button{margin-top:6px;padding:8px 12px;border-radius:8px;border:0;background:#a67f34;color:#fffaf0;font-size:12.5px;cursor:pointer}' +
    '#inb .i{padding:11px 14px;border-bottom:1px solid #f1e9d8;cursor:pointer;font-size:13.5px;line-height:1.4}' +
    '#inb .i.u{background:#fbf3df}#inb .i:hover{background:#f6edd7}' +
    '#inb .i b{display:block;font-size:13.5px}#inb .i .t{font-size:11.5px;color:#8b7d63;margin-top:3px}' +
    '#inb .e{padding:22px 14px;text-align:center;color:#8b7d63;font-size:13px}';
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function ago(iso){ var d = (Date.now() - new Date(iso).getTime()) / 1000; if(d < 60) return "adesso"; if(d < 3600) return Math.floor(d / 60) + " min fa"; if(d < 86400) return Math.floor(d / 3600) + " h fa";
    return new Date(iso).toLocaleString("it-IT", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }); }
  var box, btn, cnt, dot, panel;
  function build(){
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box = document.createElement("div"); box.id = "inb";
    box.innerHTML = '<div class="p" hidden></div><button class="b" type="button" title="Notifiche">🔔<span class="c" hidden></span><span class="dot"></span></button>';
    document.body.appendChild(box);
    btn = box.querySelector(".b"); cnt = box.querySelector(".c"); dot = box.querySelector(".dot"); panel = box.querySelector(".p");
    btn.onclick = function(e){ e.stopPropagation(); open = !open; panel.hidden = !open; if(open) render(); };
    document.addEventListener("click", function(e){ if(open && !box.contains(e.target)){ open = false; panel.hidden = true; } });
  }
  async function pushState(){ try{ return window.ImmonovaPush ? await window.ImmonovaPush.state() : "unsupported"; }catch(e){ return "off"; } }
  async function render(){
    var unread = items.filter(function(n){ return !n.read_at; }).length;
    cnt.hidden = !unread; cnt.textContent = unread > 99 ? "99+" : unread;
    if(!open) return;
    var ps = await pushState();
    var pu = ps === "on" ? "" : '<div class="pu">' + (ps === "unsupported" ? "Questo dispositivo non riceve le notifiche push: le trovi comunque qui nella campanella." :
      ps === "denied" ? "Notifiche bloccate su questo dispositivo: abilitale dalle impostazioni del browser/telefono." :
      'Le notifiche push non sono attive su questo dispositivo.<br><button type="button" data-on>🔔 Attiva notifiche su questo dispositivo</button>') + '</div>';
    panel.innerHTML = '<div class="h">Notifiche <a data-all>Segna tutte come lette</a></div>' + pu +
      (items.length ? items.map(function(n){ return '<div class="i' + (n.read_at ? "" : " u") + '" data-id="' + n.id + '"><b>' + esc(n.title) + '</b>' + (n.body ? esc(n.body) : "") + '<div class="t">' + ago(n.created_at) + '</div></div>'; }).join("")
        : '<div class="e">Nessuna notifica.</div>');
    var on = panel.querySelector("[data-on]");
    if(on) on.onclick = async function(e){ e.stopPropagation(); on.textContent = "Attivazione…"; try{ await window.ImmonovaPush.enable(client); }catch(err){ alert(err.message || err); } paintDot(); render(); };
    panel.querySelector("[data-all]").onclick = async function(e){ e.stopPropagation(); await client.from("immonova_notifications").update({ read_at:new Date().toISOString() }).eq("user_id", user.id).is("read_at", null); load(); };
    panel.querySelectorAll(".i").forEach(function(el){ el.onclick = async function(){
      var n = items.find(function(x){ return String(x.id) === el.dataset.id; }); if(!n) return;
      if(!n.read_at) await client.from("immonova_notifications").update({ read_at:new Date().toISOString() }).eq("id", n.id);
      if(n.url) location.href = n.url; else load(); }; });
  }
  async function paintDot(){ var s = await pushState(); dot.style.background = s === "on" ? "#3c9a3c" : "#e0b020"; dot.title = s === "on" ? "Notifiche push attive su questo dispositivo" : "Notifiche push non attive su questo dispositivo"; }
  async function load(){
    var r = await client.from("immonova_notifications").select("id,title,body,url,created_at,read_at").eq("user_id", user.id).order("created_at", { ascending:false }).limit(40);
    if(r.error){ box.style.display = "none"; return; }  // tabella non ancora creata
    var before = items.length ? items[0].id : null;
    items = r.data || [];
    if(before && items.length && items[0].id !== before && !items[0].read_at && btn.animate) btn.animate([{ transform:"scale(1)" }, { transform:"scale(1.18)" }, { transform:"scale(1)" }], { duration:500, iterations:2 });
    box.style.display = "";
    render();
  }
  async function start(){
    var s = await client.auth.getSession(); var se = s && s.data && s.data.session; if(!se) return;
    user = se.user;
    var p = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if(!p.data || !p.data.role || p.data.role === "client" || p.data.role === "cliente") return; // solo team
    build(); paintDot(); load();
    try{ if(window.ImmonovaPush) window.ImmonovaPush.sync(client); }catch(e){}
    try{ client.channel("inb-" + user.id).on("postgres_changes", { event:"*", schema:"public", table:"immonova_notifications", filter:"user_id=eq." + user.id }, function(){ load(); }).subscribe(); }catch(e){}
    setInterval(load, 60000);
    document.addEventListener("visibilitychange", function(){ if(!document.hidden) load(); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
