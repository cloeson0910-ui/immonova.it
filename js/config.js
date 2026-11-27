const SUPABASE_URL = "https://bpzzmitmbavcmcasswbu.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_YySRrYs6VqiGLmP9958PjA_dUM6MDU8";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* Campanella notifiche del team su tutte le pagine (si mostra solo a chi è loggato come team),
   TRANNE sui documenti (dossier, schede, relazioni, contratti, offerte, anteprime): lì non deve mai comparire. */
(function(){
  var NO_BELL = /(report-view|report-view-test|dossier-send|dossier-send-check|dossier-sintetico|onesheet-view|valuation-report|short-rent-report|offer-share|admin-offer-share|contratto-partner|firma-contratto|download|preview|responsive-preview|request-dossier|virtual-tour-viewer|immonova-discovery-test-viewer)\.html$/i;
  var page = location.pathname.split("/").pop() || "index.html";
  if(NO_BELL.test(page) || /\/dossier\//i.test(location.pathname)) return;
  var base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/config\.js.*$/, "") : "/js/";
  var s = document.createElement("script"); s.src = base + "notify-bell.js?v=20261126a"; s.defer = true; document.head.appendChild(s);
})();
