/**
 * IMMONOVA — Virtual Tour — viewer pubblico
 *
 * Le foto sono panoramiche "cilindriche" scattate con la modalità Panorama
 * NATIVA del telefono (non Fotosfera/Photo Sphere): coprono un arco orizzontale
 * (tipicamente 180-240°), senza soffitto/pavimento e senza gli errori di
 * parallasse/distorsione della modalità sfera completa in ambienti piccoli.
 * Non usa più Pannellum (pensato per sfere complete 360°×180°, formato diverso
 * da queste foto): è un motore su misura, nessuna libreria esterna richiesta.
 *
 * Interazione: si trascina l'immagine con mouse/dito e scorre in modo
 * CONTINUO e REALE — non ci sono foto multiple che si alternano, è la stessa
 * fotografia che scorre pixel per pixel sotto il dito, esattamente come si
 * trascina una singola immagine. Il trascinamento è vincolato ai bordi reali
 * dell'arco catturato (non essendo una sfera intera, non si può girare oltre
 * quello che è stato fotografato).
 *
 * Gli hotspot (punti cliccabili verso un'altra stanza) sono ancorati a un
 * punto preciso della foto (percentuale orizzontale) e si spostano insieme
 * all'immagine mentre trascini, esattamente come nei tour a sfera.
 *
 * Formato scena atteso:
 *   { id, title, image_url,
 *     hotspots: [{ x_pct, target_scene_id, text }] }
 * x_pct è la posizione orizzontale del punto (0-100) rispetto alla foto intera.
 *
 * USO:
 *   <div id="tour360" style="width:100%;height:480px;position:relative"></div>
 *   <script>
 *     // tourData = il contenuto della colonna opportunities.virtual_tour_360
 *     ImmonovaTour360.render('tour360', tourData);
 *   </script>
 */
(function (global) {
  "use strict";

  function injectStyles() {
    if (document.getElementById("immonova-tour360-style")) return;
    var style = document.createElement("style");
    style.id = "immonova-tour360-style";
    style.textContent =
      ".it3-root{position:relative;width:100%;height:100%;overflow:hidden;background:#111;border-radius:8px;cursor:grab;touch-action:pan-y;user-select:none}" +
      ".it3-root.it3-dragging{cursor:grabbing}" +
      ".it3-img{position:absolute;top:0;height:100%;left:0;max-width:none;pointer-events:none;will-change:transform}" +
      ".it3-title{position:absolute;top:10px;left:12px;color:#fff;font-size:12.5px;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:12px;z-index:3;pointer-events:none}" +
      ".it3-hint{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(0,0,0,.4);padding:4px 10px;border-radius:12px;z-index:3;pointer-events:none;opacity:.85}" +
      ".it3-hotspot{position:absolute;top:50%;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:rgba(198,150,60,.85);border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;z-index:4;box-shadow:0 0 0 4px rgba(198,150,60,.25)}" +
      ".it3-hotspot:hover{background:rgba(198,150,60,1)}" +
      ".it3-hotspot-label{position:absolute;bottom:120%;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(0,0,0,.7);color:#fff;font-size:11px;padding:3px 8px;border-radius:10px;opacity:0;pointer-events:none;transition:opacity .15s}" +
      ".it3-hotspot:hover .it3-hotspot-label{opacity:1}" +
      ".it3-fade{position:absolute;inset:0;background:#111;opacity:0;pointer-events:none;transition:opacity 260ms ease;z-index:5}" +
      ".it3-empty{padding:16px;color:#888;font-size:13px}";
    document.head.appendChild(style);
  }

  function render(containerId, tourData) {
    injectStyles();
    var el = document.getElementById(containerId);
    if (!el) return null;

    var scenes = (tourData && Array.isArray(tourData.scenes)) ? tourData.scenes : [];
    if (!scenes.length) {
      el.innerHTML = '<p class="it3-empty">Virtual tour non ancora disponibile per questo immobile.</p>';
      return null;
    }

    el.innerHTML = "";
    var root = document.createElement("div");
    root.className = "it3-root";
    el.appendChild(root);

    var img = document.createElement("img");
    img.className = "it3-img";
    img.draggable = false;
    root.appendChild(img);

    var hotspotLayer = document.createElement("div");
    hotspotLayer.style.position = "absolute";
    hotspotLayer.style.inset = "0";
    hotspotLayer.style.zIndex = "3";
    root.appendChild(hotspotLayer);

    var title = document.createElement("div");
    title.className = "it3-title";
    root.appendChild(title);

    var hint = document.createElement("div");
    hint.className = "it3-hint";
    hint.textContent = "Trascina per guardarti intorno";
    root.appendChild(hint);

    var fadeOverlay = document.createElement("div");
    fadeOverlay.className = "it3-fade";
    root.appendChild(fadeOverlay);

    var state = { sceneIndex: 0, offset: 0, minOffset: 0, maxOffset: 0, imgW: 0 };

    function findSceneIndexById(id) {
      for (var i = 0; i < scenes.length; i++) if (scenes[i].id === id) return i;
      return -1;
    }

    function currentScene() {
      return scenes[state.sceneIndex];
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function applyOffset() {
      img.style.transform = "translateX(" + state.offset + "px)";
    }

    function recomputeBounds() {
      var cw = root.clientWidth;
      var ch = root.clientHeight;
      var natW = img.naturalWidth || 1;
      var natH = img.naturalHeight || 1;
      state.imgW = ch * (natW / natH);
      img.style.width = state.imgW + "px";
      if (state.imgW <= cw) {
        // la foto è più stretta del riquadro: nessun trascinamento, centrata
        state.minOffset = state.maxOffset = (cw - state.imgW) / 2;
      } else {
        state.maxOffset = 0;               // bordo sinistro della foto allineato a sinistra
        state.minOffset = cw - state.imgW; // bordo destro della foto allineato a destra
      }
      state.offset = clamp(state.offset, state.minOffset, state.maxOffset);
      applyOffset();
      renderHotspots();
    }

    function renderHotspots() {
      hotspotLayer.innerHTML = "";
      var scene = currentScene();
      var hotspots = scene.hotspots || [];
      hotspots.forEach(function (h) {
        var xPct = (h.x_pct != null ? h.x_pct : 50) / 100;
        var mark = document.createElement("div");
        mark.className = "it3-hotspot";
        mark.style.left = (state.offset + xPct * state.imgW) + "px";
        mark.innerHTML = "→" + '<span class="it3-hotspot-label"></span>';
        mark.querySelector(".it3-hotspot-label").textContent = h.text || "";
        mark.dataset.xPct = String(xPct);
        mark.addEventListener("click", function (e) {
          e.stopPropagation();
          var idx = findSceneIndexById(h.target_scene_id);
          if (idx !== -1) goToScene(idx);
        });
        hotspotLayer.appendChild(mark);
      });
    }

    function updateHotspotPositions() {
      var marks = hotspotLayer.querySelectorAll(".it3-hotspot");
      for (var i = 0; i < marks.length; i++) {
        var xPct = parseFloat(marks[i].dataset.xPct || "0.5");
        marks[i].style.left = (state.offset + xPct * state.imgW) + "px";
      }
    }

    function loadScene(index, skipFade) {
      index = Math.max(0, Math.min(scenes.length - 1, index));
      var scene = scenes[index];

      function doLoad() {
        state.sceneIndex = index;
        state.offset = 0;
        title.textContent = scene.title || "";
        img.onload = recomputeBounds;
        img.src = scene.image_url;
        if (img.complete) recomputeBounds();
        if (!skipFade) {
          requestAnimationFrame(function () { fadeOverlay.style.opacity = "0"; });
        }
      }

      if (skipFade) {
        doLoad();
      } else {
        fadeOverlay.style.opacity = "1";
        setTimeout(doLoad, 260);
      }
    }

    function goToScene(index) {
      loadScene(index, false);
    }

    /* Trascinamento continuo 1:1 con il dito/mouse: è la STESSA immagine che
       scorre (nessuna foto discreta che si alterna), quindi il movimento è
       fluido per costruzione. Bloccato ai bordi reali della panoramica. */
    var dragging = false;
    var dragStartX = 0;
    var offsetAtDragStart = 0;
    var activePointerId = null;

    root.addEventListener("pointerdown", function (e) {
      if (e.target.closest && e.target.closest(".it3-hotspot")) return;
      if (state.minOffset === state.maxOffset) return; // niente da trascinare
      dragging = true;
      activePointerId = e.pointerId;
      dragStartX = e.clientX;
      offsetAtDragStart = state.offset;
      root.classList.add("it3-dragging");
      if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== activePointerId) return;
      state.offset = clamp(offsetAtDragStart + (e.clientX - dragStartX), state.minOffset, state.maxOffset);
      applyOffset();
      updateHotspotPositions();
    });
    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== activePointerId)) return;
      dragging = false;
      root.classList.remove("it3-dragging");
    }
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("pointerleave", endDrag);

    window.addEventListener("resize", recomputeBounds);

    loadScene(0, true);
    return { goToScene: goToScene };
  }

  global.ImmonovaTour360 = { render: render };
})(window);
