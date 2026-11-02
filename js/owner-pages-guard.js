/* ==========================================================================
   js/owner-pages-guard.js
   Elenco UNICO e centralizzato delle pagine riservate solo all'account
   owner (Claudio). Per aggiungere o togliere una pagina dal gruppo "Owner"
   basta modificare questo file soltanto: dashboard.html lo usa per
   mostrare/nascondere la voce di menu, e ogni pagina owner-only lo usa
   per bloccare anche l'accesso diretto via URL (non solo il link).

   AGGIORNATO 02/11/2026 su richiesta esplicita del titolare: "Impostazioni
   Sito" e "Notifiche Broadcast" spostate da Gestione a Owner (vedi
   page-catalog.js), quindi aggiunte qui. Aggiunta anche "contratto-partner.html"
   (nuova pagina, accordo di partnership editabile/stampabile/inviabile).
   ========================================================================== */

var OWNER_ONLY_EMAIL = "claudio.romano@bluewin.ch";

var OWNER_ONLY_PAGES = [
  "permissions.html",
  "watermark-retroattivo.html",
  "data-sources-bulk-import.html",
  "catalogo-verificati.html",
  "team-admin.html",
  "articoli.html",
  "email-composer.html",
  "contabilita.html",
  "ads-manager.html",
  "settings.html",
  "statistics.html",
  "meta-ads-planner.html",
  "site-settings.html",
  "broadcast-notifications.html",
  "contratto-partner.html"
];

/* Da chiamare SUBITO DOPO aver verificato la sessione (checkAuth), su ogni
   pagina della lista sopra, passando il client Supabase già creato dalla
   pagina e l'id dell'utente loggato. Se la pagina corrente non è nella
   lista, non fa nulla e lascia proseguire normalmente -- così lo stesso
   script può essere incluso ovunque senza effetti collaterali. */
async function guardOwnerOnlyPage(client, userId){
  var page = (location.pathname.split("/").pop() || "").toLowerCase();
  if(OWNER_ONLY_PAGES.indexOf(page) === -1) return true;

  var result = await client.from("profiles").select("email").eq("id", userId).single();
  var email = String((result.data && result.data.email) || "").trim().toLowerCase();

  if(email !== OWNER_ONLY_EMAIL){
    window.location.href = "dashboard.html";
    return false;
  }
  return true;
}
