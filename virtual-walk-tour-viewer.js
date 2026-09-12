/**
 * IMMONOVA — Walk Tour — viewer pubblico
 * Nessuna fotosfera, nessuno stitching: ogni ambiente ha un set di foto normali
 * scattate girando su se stessi (di solito 4, un quarto di giro l'una dall'altra).
 *
 * Interazione IDENTICA a un virtual tour a sfera:
 *  - si trascina con il mouse/dito per "girare la testa" (nessuna freccia) — qui
 *    il movimento è vincolato al solo asse orizzontale, non essendo una vera sfera;
 *  - il cambio ambiente avviene tramite HOTSPOT posizionati sull'immagine (punti
 *    cliccabili che portano a un'altra stanza), esattamente come nel tour a sfera —
 *    NON con pulsanti fissi "ambiente precedente/successivo".
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

  var TRANSITION_MS = 300;
  var DRAG_DEGREES_PER_PIXEL = 0.35; // sensibilità del trascinamento

  function injectStyles() {
    if (document.getElementById("immonova-walk-tour-style")) return;
    var style = document.createElement("style");
    style.id = "immonova-walk-tour-style";
    style.textContent =
      ".iwt-root{position:relative;width:100%;height:100%;overflow:hidden;background:#111;border-radius:8px;cursor:grab;touch-action:pan-y;user-select:none}" +
      ".iwt-root.iwt-dragging{cursor:grabbing}" +
      ".iwt-layer{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity " + TRANSITION_MS + "ms ease, transform " + TRANSITION_MS + "ms ease;pointer-events:none}" +
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

    var state = { sceneIndex: 0, photoIndex: 0, front: layerA, back: layerB, animating: false, yaw: 0 };

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
        mark.style.pointerEvents = "auto";
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

    function goToPhoto(newIndex, direction) {
      var scene = currentScene();
      var photos = scene.photos || [];
      if (!photos.length || state.animating) return;
      var n = photos.length;
      newIndex = ((newIndex % n) + n) % n;
      if (newIndex === state.photoIndex) return;

      state.animating = true;
      var incoming = state.back;
      var outgoing = state.front;
      setLayerImage(incoming, photos[newIndex].url);
      incoming.style.transition = "none";
      incoming.style.opacity = "0";
      incoming.style.transform = "translateX(" + (direction > 0 ? "6%" : "-6%") + ")";
      // forza reflow prima di riattivare la transizione
      incoming.offsetHeight;
      incoming.style.transition = "";
      requestAnimationFrame(function () {
        incoming.style.opacity = "1";
        incoming.style.transform = "translateX(0)";
        outgoing.style.opacity = "0";
        outgoing.style.transform = "translateX(" + (direction > 0 ? "-6%" : "6%") + ")";
      });

      setTimeout(function () {
        outgoing.style.transition = "none";
        outgoing.style.transform = "translateX(0)";
        state.front = incoming;
        state.back = outgoing;
        state.photoIndex = newIndex;
        state.animating = false;
        renderHotspots();
      }, TRANSITION_MS + 30);
    }

    function loadScene(index) {
      index = Math.max(0, Math.min(scenes.length - 1, index));
      state.sceneIndex = index;
      state.photoIndex = 0;
      state.yaw = 0;
      var scene = currentScene();
      var photos = scene.photos || [];
      title.textContent = scene.title || "";
      if (photos.length) {
        setLayerImage(state.front, photos[0].url);
        state.front.style.transition = "none";
        state.front.style.opacity = "1";
        state.front.style.transform = "translateX(0)";
        state.back.style.transition = "none";
        state.back.style.opacity = "0";
        state.back.style.transform = "translateX(0)";
      }
      hint.style.display = photos.length > 1 ? "block" : "none";
      renderHotspots();
    }

    /* Trascinamento continuo, solo asse orizzontale: si accumula un angolo virtuale
       (come lo yaw di un tour a sfera) e, ogni volta che supera la soglia tra due
       foto adiacenti, si passa alla foto più vicina. Nessuna freccia: si trascina
       e basta, esattamente come nel virtual tour a sfera — qui però il movimento
       non ha componente verticale. Il cambio ambiente avviene solo tramite hotspot. */
    var dragging = false;
    var dragStartX = 0;
    var yawAtDragStart = 0;

    function stepDegrees() {
      var scene = currentScene();
      var photos = scene.photos || [];
      return photos.length ? (360 / photos.length) : 90;
    }

    function onDragMove(clientX) {
      if (!dragging) return;
      var scene = currentScene();
      var photos = scene.photos || [];
      if (photos.length < 2) return;
      var dx = clientX - dragStartX;
      state.yaw = yawAtDragStart - dx * DRAG_DEGREES_PER_PIXEL;
      var step = stepDegrees();
      var targetIndex = Math.round(state.yaw / step) % photos.length;
      targetIndex = ((targetIndex % photos.length) + photos.length) % photos.length;
      if (targetIndex !== state.photoIndex) {
        var direction = (targetIndex === (state.photoIndex + 1) % photos.length) ? 1 : -1;
        goToPhoto(targetIndex, direction);
      }
    }

    function startDrag(clientX) {
      var photos = (currentScene().photos || []);
      if (photos.length < 2) return;
      dragging = true;
      dragStartX = clientX;
      yawAtDragStart = state.yaw;
      root.classList.add("iwt-dragging");
    }

    function endDrag() {
      dragging = false;
      root.classList.remove("iwt-dragging");
    }

    root.addEventListener("pointerdown", function (e) { startDrag(e.clientX); if (root.setPointerCapture) root.setPointerCapture(e.pointerId); });
    root.addEventListener("pointermove", function (e) { onDragMove(e.clientX); });
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("pointerleave", function () { if (dragging) endDrag(); });

    loadScene(0);
    return { goToScene: loadScene };
  }

  global.ImmonovaWalkTour = { render: render };
})(window);
