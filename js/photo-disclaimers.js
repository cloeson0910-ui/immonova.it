/* IMMONOVA – Disclaimer sulle foto.
   I testi NON vengono mai bruciati nell'immagine: sono salvati sulla scheda e mostrati
   come fascia sovrapposta (sito pubblico, dossier, PDF).
   opportunities.photo_disclaimers = [{id, text}]
   opportunities.gallery_disclaimers = [id|null, ...] stesso ordine di gallery_images */
(function(){
  var translated = {};   // id -> testo tradotto nella lingua corrente
  function norm(v){
    if(Array.isArray(v)) return v.filter(Boolean);
    if(typeof v === "string" && v.trim()){ try{ var p = JSON.parse(v); return Array.isArray(p) ? p.filter(Boolean) : []; }catch(e){ return []; } }
    return [];
  }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]; }); }
  function ensureStyle(){
    if(document.getElementById("ph-disc-style")) return;
    var st = document.createElement("style"); st.id = "ph-disc-style";
    st.textContent = ".ph-disc{position:absolute;left:0;right:0;bottom:0;z-index:3;background:rgba(20,16,10,.66);color:#fff;font-family:'Avenir Next','Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.35;letter-spacing:.01em;padding:6px 10px;text-align:left;pointer-events:none}"
      + ".ph-disc-wrap{position:relative;display:block}"
      + ".pdf-export-mode .ph-disc{font-size:6.5pt;padding:1.6mm 3mm}"
      + ".lightbox-disc{position:absolute;left:50%;bottom:54px;transform:translateX(-50%);max-width:80vw;background:rgba(20,16,10,.75);color:#fff;font-size:13px;line-height:1.4;padding:8px 14px;text-align:center}";
    document.head.appendChild(st);
  }
  function maps(o){
    var discs = Array.isArray(o && o.photo_disclaimers) ? o.photo_disclaimers : [];
    var ids = Array.isArray(o && o.gallery_disclaimers) ? o.gallery_disclaimers : [];
    var byId = {}; discs.forEach(function(d){ if(d && d.id && d.text) byId[d.id] = d.text; });
    var byUrl = {};
    ["gallery_images","gallery_images_clean"].forEach(function(k){
      norm(o && o[k]).forEach(function(u, i){ if(ids[i] && byId[ids[i]]) byUrl[u] = ids[i]; });
    });
    // copertina = stessa foto di una gallery? eredita il disclaimer
    return { byId:byId, byUrl:byUrl };
  }
  window.ImmonovaPhotoDisclaimers = {
    /* Traduce i testi nella lingua del dossier/pagina (una volta per lingua). */
    prepare: async function(o, lang, client){
      ensureStyle();
      translated = {};
      var m = maps(o), ids = Object.keys(m.byId);
      if(!ids.length || !lang || lang === "it" || !client) return;
      var key = "immonova_phdisc_" + lang + "_" + ids.map(function(i){ return m.byId[i]; }).join("|").length + "_" + ids.join(",");
      try{ var c = JSON.parse(localStorage.getItem(key) || "null"); if(c){ translated = c; return; } }catch(e){}
      try{
        var r = await client.functions.invoke("translate-public-content", { body:{ language:lang, source_language:"it", context:"Disclaimer shown on real estate listing photos.", texts:ids.map(function(i){ return m.byId[i]; }) } });
        if(r && r.data && Array.isArray(r.data.translations)){
          ids.forEach(function(i, n){ if(r.data.translations[n]) translated[i] = r.data.translations[n]; });
          try{ localStorage.setItem(key, JSON.stringify(translated)); }catch(e){}
        }
      }catch(e){ console.warn("Traduzione disclaimer foto non riuscita, uso l'italiano:", e); }
    },
    textFor: function(o, url){
      if(!url) return "";
      var m = maps(o), id = m.byUrl[url];
      if(!id) return "";
      return translated[id] || m.byId[id] || "";
    },
    bandHTML: function(o, url){
      ensureStyle();
      var t = this.textFor(o, url);
      return t ? '<div class="ph-disc">' + esc(t) + '</div>' : "";
    }
  };
})();
