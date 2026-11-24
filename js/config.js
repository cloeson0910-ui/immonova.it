const SUPABASE_URL = "https://bpzzmitmbavcmcasswbu.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_YySRrYs6VqiGLmP9958PjA_dUM6MDU8";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* Campanella notifiche del team su tutte le pagine (si mostra solo a chi è loggato come team). */
(function(){
  var base = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/config\.js.*$/, "") : "/js/";
  var s = document.createElement("script"); s.src = base + "notify-bell.js?v=20261124b"; s.defer = true; document.head.appendChild(s);
})();
