/* ============================================================================
   image-protect.js — IMMONOVA (sito pubblico)
   Sovrappone a ogni <img> della pagina un rettangolo trasparente della stessa
   identica dimensione/posizione: tasto destro -> "Salva immagine" salva quel
   rettangolo vuoto, non la foto vera. Blocca anche il trascinamento (drag&drop)
   dell'immagine fuori dalla pagina. Funziona anche su immagini caricate dopo
   il caricamento iniziale (card generate via JS/fetch), grazie a un
   MutationObserver.

   USO: includere con un tag script, in fondo al <body>, PRIMA della chiusura:
     <script src="js/image-protect.js"></script>
   Va bene su qualsiasi pagina pubblica con foto immobili (es. opportunity.html,
   opportunities.html, index.html, ecc.) — non serve altro, nessuna modifica
   al resto della pagina.
   ============================================================================ */
(function () {
  "use strict";

  function shield(img) {
    if (img.dataset.protected === "1") return;
    if (img.offsetParent === null && img.closest("body") === null) return;

    img.dataset.protected = "1";
    img.draggable = false;
    img.setAttribute("oncontextmenu", "return false");
    img.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
    img.addEventListener("dragstart", function (e) { e.preventDefault(); return false; });

    // Il contenitore dell'immagine deve poter ospitare un elemento in
    // posizione assoluta: se il genitore non ha già position relative/
    // absolute/fixed, lo forziamo sull'immagine stessa con un wrapper.
    var parent = img.parentElement;
    var needsWrapper = true;
    if (parent) {
      var cs = window.getComputedStyle(parent);
      if (cs.position === "relative" || cs.position === "absolute" || cs.position === "fixed" || cs.position === "sticky") {
        needsWrapper = false;
      }
    }

    var container = img;
    if (needsWrapper) {
      var wrapper = document.createElement("span");
      wrapper.style.position = "relative";
      wrapper.style.display = img.style.display === "block" || img.classList.contains("block") ? "block" : "inline-block";
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      container = wrapper;
      container.style.position = "relative";
    } else {
      container = parent;
    }

    var shield = document.createElement("div");
    shield.setAttribute("aria-hidden", "true");
    shield.style.position = "absolute";
    shield.style.top = "0";
    shield.style.left = "0";
    shield.style.width = "100%";
    shield.style.height = "100%";
    shield.style.background = "transparent";
    shield.style.zIndex = "5";
    shield.style.cursor = "inherit";
    shield.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });
    shield.addEventListener("dragstart", function (e) { e.preventDefault(); return false; });
    shield.addEventListener("selectstart", function (e) { e.preventDefault(); return false; });

    container.appendChild(shield);
  }

  function shieldAll(root) {
    (root || document).querySelectorAll("img").forEach(shield);
  }

  // Blocco globale extra: disabilita il menu contestuale su tutta la pagina
  // (non solo sulle immagini) e la combinazione di tasti più comune per il
  // salvataggio pagina.
  document.addEventListener("contextmenu", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "s") {
      e.preventDefault();
    }
  });

  function init() {
    shieldAll(document);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === "IMG") shield(node);
          if (node.querySelectorAll) shieldAll(node);
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
