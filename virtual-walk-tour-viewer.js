/**
 * IMMONOVA — Walk Tour — viewer pubblico
 * Nessuna fotosfera, nessuno stitching: ogni ambiente ha un set di foto normali
 * scattate girando su se stessi (di solito 4, un quarto di giro l'una dall'altra).
 * Per simulare il "girare la testa" in modo fluido invece di un cambio secco tra
 * una foto e l'altra, la transizione tra due foto adiacenti usa una dissolvenza
 * incrociata combinata a uno scorrimento laterale (la foto in uscita scorre e
 * sfuma da un lato, quella in entrata scorre e appare dall'altro) — un'illusione
 * di movimento continuo, non una vera interpolazione 3D, ma sufficiente a dare
 * la sensazione di "guardarsi intorno" senza il costo di una vera sfera.
 *
 * Avanti/indietro passano da un ambiente al successivo/precedente, nell'ordine
 * in cui le scene sono state aggiunte (virtual_walk_tour.scenes[]).
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

  var TRANSITION_MS = 420;

  function injectStyles() {
    if (document.getElementById("immonova-walk-tour-style")) return;
    var style = document.createElement("style");
    style.id = "immonova-walk-tour-style";
    style.textContent =
      ".iwt-root{position:relative;width:100%;height:100%;overflow:hidden;background:#111;border-radius:8px}" +
      ".iwt-layer{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity " + TRANSITION_MS + "ms ease, transform " + TRANSITION_MS + "ms ease}" +
      ".iwt-arrow{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;border:none;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3}" +
      ".iwt-arrow:hover{background:rgba(0,0,0,.65)}" +
      ".iwt-left{left:10px}.iwt-right{right:10px}" +
      ".iwt-nav{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:10px;z-index:3}" +
      ".iwt-nav button{background:rgba(0,0,0,.55);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:16px;padding:6px 14px;font-size:12px;cursor:pointer}" +
      ".iwt-nav button:disabled{opacity:.3;cursor:default}" +
      ".iwt-title{position:absolute;top:10px;left:12px;color:#fff;font-size:12.5px;background:rgba(0,0,0,.45);padding:4px 10px;border-radius:12px;z-index:3}" +
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

    var leftArrow = document.createElement("button");
    leftArrow.className = "iwt-arrow iwt-left";
    leftArrow.innerHTML = "&#8249;";
    leftArrow.setAttribute("aria-label", "Guarda a sinistra");
    var rightArrow = document.createElement("button");
    rightArrow.className = "iwt-arrow iwt-right";
    rightArrow.innerHTML = "&#8250;";
    rightArrow.setAttribute("aria-label", "Guarda a destra");
    root.appendChild(leftArrow);
    root.appendChild(rightArrow);

    var nav = document.createElement("div");
    nav.className = "iwt-nav";
    var backBtn = document.createElement("button");
    backBtn.textContent = "← Ambiente precedente";
    var fwdBtn = document.createElement("button");
    fwdBtn.textContent = "Ambiente successivo →";
    nav.appendChild(backBtn);
    nav.appendChild(fwdBtn);
    root.appendChild(nav);

    var state = { sceneIndex: 0, photoIndex: 0, front: layerA, back: layerB, animating: false };

    function currentScene() {
      return scenes[state.sceneIndex];
    }

    function setLayerImage(layer, url) {
      layer.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
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
      }, TRANSITION_MS + 30);
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
        state.front.style.transition = "none";
        state.front.style.opacity = "1";
        state.front.style.transform = "translateX(0)";
        state.back.style.transition = "none";
        state.back.style.opacity = "0";
        state.back.style.transform = "translateX(0)";
      }
      backBtn.disabled = (index === 0);
      fwdBtn.disabled = (index === scenes.length - 1);
      var multi = photos.length > 1;
      leftArrow.style.display = multi ? "flex" : "none";
      rightArrow.style.display = multi ? "flex" : "none";
    }

    leftArrow.addEventListener("click", function () { goToPhoto(state.photoIndex - 1, -1); });
    rightArrow.addEventListener("click", function () { goToPhoto(state.photoIndex + 1, 1); });
    backBtn.addEventListener("click", function () { loadScene(state.sceneIndex - 1); });
    fwdBtn.addEventListener("click", function () { loadScene(state.sceneIndex + 1); });

    // trascinamento orizzontale (swipe) come alternativa alle frecce
    var dragStartX = null;
    root.addEventListener("pointerdown", function (e) { dragStartX = e.clientX; });
    root.addEventListener("pointerup", function (e) {
      if (dragStartX === null) return;
      var dx = e.clientX - dragStartX;
      dragStartX = null;
      if (Math.abs(dx) < 30) return;
      if (dx < 0) goToPhoto(state.photoIndex + 1, 1);
      else goToPhoto(state.photoIndex - 1, -1);
    });

    loadScene(0);
    return { goToScene: loadScene };
  }

  global.ImmonovaWalkTour = { render: render };
})(window);
