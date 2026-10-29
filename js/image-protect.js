/* ============================================================================
   image-protect.js — IMMONOVA (sito pubblico)
   Blocca il menu "Salva immagine" sul tasto destro e il trascinamento (drag&drop)
   per ogni <img> della pagina. Niente overlay/elemento sovrapposto: la versione
   precedente usava un rettangolo trasparente sopra ogni immagine, ma finiva
   anche sopra pulsanti/controlli vicini o sovrapposti (es. frecce e chiusura
   del lightbox), bloccando i click su quelli. Questa versione agisce solo
   sull'evento, senza mettere nulla sopra la pagina: zero interferenza con
   click, pulsanti, link.

   Funziona anche su immagini caricate dopo il caricamento iniziale (card
   generate via JS/fetch), grazie a un MutationObserver.

   USO: includere con un tag script, in fondo al <body>, PRIMA della chiusura:
     <script src="js/image-protect.js"></script>
   ============================================================================ */
(function () {
  "use strict";

  function protectImg(img) {
    if (img.dataset.protected === "1") return;
    img.dataset.protected = "1";
    img.draggable = false;
    img.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    img.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }

  function protectAll(root) {
    (root || document).querySelectorAll("img").forEach(protectImg);
  }

  // Blocco di sicurezza aggiuntivo a livello di documento, nel caso un'immagine
  // sia sfuggita al protectAll iniziale (es. creata e inserita senza passare
  // dal MutationObserver, caso raro ma copre anche questo).
  document.addEventListener("contextmenu", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  function init() {
    protectAll(document);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === "IMG") protectImg(node);
          if (node.querySelectorAll) protectAll(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
