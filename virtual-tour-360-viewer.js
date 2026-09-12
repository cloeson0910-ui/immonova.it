/**
 * IMMONOVA — Virtual Tour 360° — viewer pubblico
 * Self-hosted, motore open source (Pannellum, licenza MIT — vedi PANNELLUM_LICENSE.txt).
 * Nessuna chiamata a servizi esterni a pagamento: le uniche richieste di rete sono
 * verso il tuo stesso Supabase Storage (bucket "virtual-tours-360").
 *
 * USO — nella pagina pubblica (es. report-view.html / dossier-send.html), dove vuoi
 * mostrare il tour:
 *
 *   <link rel="stylesheet" href="/path/pannellum.css">
 *   <script src="/path/pannellum.js"></script>
 *   <script src="/path/virtual-tour-360-viewer.js"></script>
 *
 *   <div id="tour360" style="width:100%;height:480px"></div>
 *   <script>
 *     // tourData = il contenuto della colonna opportunities.virtual_tour_360
 *     // (gia' letta insieme al resto dei dati dell'opportunita')
 *     ImmonovaTour360.render('tour360', tourData);
 *   </script>
 */
(function (global) {
  "use strict";

  function buildPannellumConfig(tourData) {
    var scenes = {};
    (tourData.scenes || []).forEach(function (s) {
      scenes[s.id] = {
        type: "equirectangular",
        panorama: s.image_url,
        pitch: typeof s.pitch === "number" ? s.pitch : 0,
        yaw: typeof s.yaw === "number" ? s.yaw : 0,
        hfov: typeof s.hfov === "number" ? s.hfov : 110,
        hotSpots: (s.hotspots || []).map(function (h) {
          /* NIENTE cssClass qui: Pannellum lo sostituisce interamente alle sue classi
             predefinite invece di aggiungerlo, e senza quelle classi l'hotspot diventa
             largo/alto 0px — invisibile e non cliccabile pur esistendo nel DOM. Lasciando
             cssClass non impostato, Pannellum applica il suo pallino cliccabile standard. */
          return {
            pitch: h.pitch,
            yaw: h.yaw,
            type: "scene",
            text: h.text || "",
            sceneId: h.target_scene_id,
          };
        }),
      };
    });
    return {
      default: {
        firstScene: tourData.first_scene_id || (tourData.scenes && tourData.scenes[0] && tourData.scenes[0].id),
        sceneFadeDuration: 600,
        autoLoad: true,
        compass: false,
      },
      scenes: scenes,
    };
  }

  function render(containerId, tourData) {
    if (!tourData || !Array.isArray(tourData.scenes) || !tourData.scenes.length) {
      var el = document.getElementById(containerId);
      if (el) el.innerHTML = '<p style="padding:16px;color:#888;font-size:13px">Virtual tour non ancora disponibile per questo immobile.</p>';
      return null;
    }
    if (typeof pannellum === "undefined") {
      console.error("[ImmonovaTour360] pannellum.js non caricato prima di virtual-tour-360-viewer.js");
      return null;
    }
    var config = buildPannellumConfig(tourData);
    return pannellum.viewer(containerId, Object.assign({}, config.default, { scenes: config.scenes }));
  }

  global.ImmonovaTour360 = { render: render };
})(window);
