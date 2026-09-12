/**
 * IMMONOVA — Walk Tour — viewer pubblico
 * Nessuna fotosfera, nessuno stitching: ogni ambiente ha un set di foto normali
 * scattate girando su se stessi (di solito 4, un quarto di giro l'una dall'altra).
 *
 * Interazione IDENTICA a un virtual tour a sfera:
 *  - si trascina con il mouse/dito per "girare la testa" (nessuna freccia). Il
 *    movimento è CONTINUO: mentre trascini, la foto attuale scorre/sfuma e quella
 *    adiacente compare gradualmente in proporzione a quanto hai trascinato — non
 *    scatta di colpo solo a fine corsa. È vincolato al solo asse orizzontale
 *    (niente inclinazione su/giù, non essendo una vera sfera);
 *  - il cambio ambiente avviene tramite HOTSPOT posizionati sull'immagine (punti
 *    cliccabili che portano a un'altra stanza), esattamente come nel tour a sfera.
 *
 * Formato scena atteso:
 *   { id, title, photos: [{url, angle}],
 *     hotspots: [{ photo_index, x_pct, y_pct, target_scene_id, text }] }
 * x_pct/y_pct sono percentuali (0-100) rispetto all'immagine, photo_index indica
 * su quale foto della stanza compare quel punto (se assente, compare su tutte).
 *
 * USO:
 *   <div id="walkTour" style="width:100%;height:480px;position:relative"></div>
 *   <script>
 *     // tourData = il contenuto della colonna opportunities.virtual_walk_tour
 *     ImmonovaWalkTour.render('walkTour', tourData);
 *   </script>
 */
(function (global) {
  "use strict";

  var SNAP_MS = 220;          // durata dell'animazione di completamento/ritorno
  var DRAG_STEP_PX = 220;     // px di trascinamento per passare da una foto alla adiacente
  var COMMIT_THRESHOLD = 0.5; // oltre questa frazione di DRAG_STEP_PX, al rilascio si passa alla foto vicina

  function injectStyles() {
    if (document.getElementById("immonova-walk-tour-style")) return;
    var style = document.createElement("style");
    style.id = "immonova-walk-tour-style";
    style.textContent =
      ".iwt-root{position:relative;width:100%;height:100%;overflow:hidden;background:#111;border-radius:8px;cursor:grab;touch-action:pan-y;user-select:none}" +
      ".iwt-root.iwt-dragging{cursor:grabbing}" +
      ".iwt-layer{position:absolute;inset:0;background-size:cover;background-position:center;pointer-events:none}" +
      ".iwt-layer.iwt-snap{transition:opacity " + SNAP_MS + "ms ease, transform " + SNAP_MS + "ms ease}" +
      ".iwt-title{position:absolute;top:10px;left:12px;color:#fff;font-size:12.5px;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:12px;z-index:3;pointer-events:none}" +
      ".iwt-hint{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(0,0,0,.4);padding:4px 10px;border-radius:12px;z-index:3;pointer-events:none;opacity:.85}" +
      ".iwt-hotspot{position:absolute;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;background:rgba(198,150,60,.85);border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;z-index:4;box-shadow:0 0 0 4px rgba(198,150,60,.25)}" +
      ".iwt-hotspot:hover{background:rgba(198,150,60,1)}" +
      ".iwt-hotspot-label{position:absolute;bottom:120%;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(0,0,0,.7);color:#fff;font-size:11px;padding:3px 8px;border-radius:10px;opacity:0;pointer-events:none;transition:opacity .15s}" +
      ".iwt-hotspot:hover .iwt-hotspot-label{opacity:1}" +
      ".iwt-empty{padding:16px;color:#888;font-size:13px}";
    document.head.appendChild(style);
  }

  function render(containerId, tourData) {
    injectStyles();
    var el = document.getElementById(containerId);
    if (!el) return null;

    var scenes = (tourData && Array.isArray(tourData.scenes)) ? tourData.scenes : [];
    if (!scenes.length) {
      el.innerHTML = '<p class="iwt-empty">Virtual tour non ancora disponibile per questo immobile.</p>';
      return null;
    }

    el.innerHTML = "";
    var root = document.createElement("div");
    root.className = "iwt-root";
    el.appendChild(root);

    var layerA = document.createElement("div");
    layerA.className = "iwt-layer";
    var layerB = document.createElement("div");
    layerB.className = "iwt-layer";
    layerB.style.opacity = "0";
    root.appendChild(layerA);
    root.appendChild(layerB);

    var title = document.createElement("div");
    title.className = "iwt-title";
    root.appendChild(title);

    var hint = document.createElement("div");
    hint.className = "iwt-hint";
    hint.textContent = "Trascina per guardarti intorno";
    root.appendChild(hint);

    var hotspotLayer = document.createElement("div");
    hotspotLayer.style.position = "absolute";
    hotspotLayer.style.inset = "0";
    hotspotLayer.style.zIndex = "3";
    root.appendChild(hotspotLayer);

    // front = foto corrente "ferma"; back = foto adiacente che entra durante il trascinamento
    var state = { sceneIndex: 0, photoIndex: 0, front: layerA, back: layerB, dragDir: 0, dragging: false };

    function findSceneIndexById(id) {
      for (var i = 0; i < scenes.length; i++) if (scenes[i].id === id) return i;
      return -1;
    }

    function currentScene() {
      return scenes[state.sceneIndex];
    }

    function setLayerImage(layer, url) {
      layer.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
    }

    function renderHotspots() {
      hotspotLayer.innerHTML = "";
      var scene = currentScene();
      var hotspots = scene.hotspots || [];
      hotspots.forEach(function (h) {
        if (typeof h.photo_index === "number" && h.photo_index !== state.photoIndex) return;
        var mark = document.createElement("div");
        mark.className = "iwt-hotspot";
        mark.style.left = (h.x_pct != null ? h.x_pct : 50) + "%";
        mark.style.top = (h.y_pct != null ? h.y_pct : 50) + "%";
        mark.innerHTML = "→" + '<span class="iwt-hotspot-label"></span>';
        mark.querySelector(".iwt-hotspot-label").textContent = h.text || "";
        mark.addEventListener("click", function (e) {
          e.stopPropagation();
          var idx = findSceneIndexById(h.target_scene_id);
          if (idx !== -1) loadScene(idx);
        });
        hotspotLayer.appendChild(mark);
      });
    }

    function resetLayers() {
      state.front.classList.remove("iwt-snap");
      state.back.classList.remove("iwt-snap");
      state.front.style.opacity = "1";
      state.front.style.transform = "translateX(0)";
      state.back.style.opacity = "0";
      state.back.style.transform = "translateX(0)";
    }

    function loadScene(index) {
      index = Math.max(0, Math.min(scenes.length - 1, index));
      state.sceneIndex = index;
      state.photoIndex = 0;
      var scene = currentScene();
      var photos = scene.photos || [];
      title.textContent = scene.title || "";
      if (photos.length) {
        setLayerImage(state.front, photos[0].url);
      }
      resetLayers();
      hint.style.display = photos.length > 1 ? "block" : "none";
      renderHotspots();
    }

    /* Trascinamento continuo, solo asse orizzontale, con feedback visivo in tempo
       reale (niente attesa fino a fine corsa): mentre trascini, la foto adiacente
       (nella direzione del trascinamento) viene mostrata dietro e la sua opacità/
       posizione seguono 1:1 il movimento del dito. Al rilascio: se hai superato
       COMMIT_THRESHOLD del percorso, si passa definitivamente alla foto adiacente
       (piccola animazione di completamento), altrimenti si torna indietro alla
       foto di partenza. Il cambio ambiente avviene solo tramite hotspot. */
    var dragStartX = 0;
    var activePointerId = null;

    function neighborIndex(dir) {
      var photos = (currentScene().photos || []);
      var n = photos.length;
      if (!n) return state.photoIndex;
      return ((state.photoIndex + dir) % n + n) % n;
    }

    function updateDragVisual(dx) {
      var photos = (currentScene().photos || []);
      if (photos.length < 2) return;
      var dir = dx < 0 ? 1 : -1; // trascini a sinistra -> avanzi alla foto successiva (come guardare a destra)
      if (dx === 0) dir = state.dragDir || 1;
      state.dragDir = dir;
      var progress = Math.min(1, Math.abs(dx) / DRAG_STEP_PX);
      var nIdx = neighborIndex(dir);
      setLayerImage(state.back, photos[nIdx].url);
      state.front.classList.remove("iwt-snap");
      state.back.classList.remove("iwt-snap");
      state.back.style.opacity = String(progress);
      state.back.style.transform = "translateX(" + (dir > 0 ? (1 - progress) * 10 : -(1 - progress) * 10) + "%)";
      state.front.style.opacity = String(1 - progress * 0.85);
      state.front.style.transform = "translateX(" + (dir > 0 ? -progress * 10 : progress * 10) + "%)";
      state._dragProgress = progress;
      state._dragNeighbor = nIdx;
    }

    function commitDrag() {
      var nIdx = state._dragNeighbor;
      state.front.classList.add("iwt-snap");
      state.back.classList.add("iwt-snap");
      state.back.style.opacity = "1";
      state.back.style.transform = "translateX(0)";
      state.front.style.opacity = "0";
      var dir = state.dragDir;
      state.front.style.transform = "translateX(" + (dir > 0 ? "-10%" : "10%") + ")";
      var finishedFront = state.front, finishedBack = state.back;
      setTimeout(function () {
        finishedFront.classList.remove("iwt-snap");
        finishedBack.classList.remove("iwt-snap");
        state.front = finishedBack;
        state.back = finishedFront;
        state.photoIndex = nIdx;
        renderHotspots();
      }, SNAP_MS + 20);
    }

    function cancelDrag() {
      state.front.classList.add("iwt-snap");
      state.back.classList.add("iwt-snap");
      state.front.style.opacity = "1";
      state.front.style.transform = "translateX(0)";
      state.back.style.opacity = "0";
      state.back.style.transform = "translateX(0)";
      var f = state.front, b = state.back;
      setTimeout(function () {
        f.classList.remove("iwt-snap");
        b.classList.remove("iwt-snap");
      }, SNAP_MS + 20);
    }

    function startDrag(clientX, pointerId) {
      var photos = (currentScene().photos || []);
      if (photos.length < 2) return;
      state.dragging = true;
      dragStartX = clientX;
      activePointerId = pointerId;
      root.classList.add("iwt-dragging");
    }

    function onDragMove(clientX) {
      if (!state.dragging) return;
      updateDragVisual(clientX - dragStartX);
    }

    function endDrag() {
      if (!state.dragging) return;
      state.dragging = false;
      root.classList.remove("iwt-dragging");
      if ((state._dragProgress || 0) >= COMMIT_THRESHOLD) commitDrag();
      else cancelDrag();
      state._dragProgress = 0;
    }

    root.addEventListener("pointerdown", function (e) {
      if (e.target.closest && e.target.closest(".iwt-hotspot")) return; // non avviare il trascinamento sopra un hotspot
      startDrag(e.clientX, e.pointerId);
    });
    root.addEventListener("pointermove", function (e) {
      if (state.dragging && e.pointerId === activePointerId) onDragMove(e.clientX);
    });
    root.addEventListener("pointerup", function (e) { if (e.pointerId === activePointerId) endDrag(); });
    root.addEventListener("pointercancel", function (e) { if (e.pointerId === activePointerId) endDrag(); });
    root.addEventListener("pointerleave", function (e) { if (e.pointerId === activePointerId) endDrag(); });

    loadScene(0);
    return { goToScene: loadScene };
  }

  global.ImmonovaWalkTour = { render: render };
})(window);
