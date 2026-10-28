/* ============================================================================================
   PAGE_CATALOG -- unica fonte di verita' per l'elenco di tutte le pagine private concedibili.
   Usata da:
     - users.html (pannello Permessi: cosa si puo' concedere a un collaboratore)
     - dashboard.html (menu dinamico: cosa compare davvero nel menu di CHI sta navigando)
   Tenerla in un unico file evita che le due pagine finiscano per mostrare elenchi diversi
   (successo gia' una volta: "dove cazzo sono le 36 pagine?!" -- causato da due copie disallineate
   dello stesso elenco). Se aggiungi una pagina nuova al sito, aggiungila SOLO qui.

   Ogni voce:
     section  -- raggruppamento nel menu ("Attività" / "Dati" / "Gestione" / "Owner")
     key      -- page_key stabile, e' anche il filename reale della pagina (es. "investors.html")
     label    -- etichetta italiana di default (fallback se la traduzione i18n non e' disponibile)
     i18nKey  -- chiave data-i18n gia' usata altrove per questa voce di menu, se esiste (per
                 riusare le traduzioni esistenti nel menu dinamico); null se non ne ha una propria

   NOTA (27/10/2026) su "Log Accessi": la voce sotto compare nel menu Owner (quindi, nel
   funzionamento normale di questo catalogo, per chi ha is_platform_owner=true o un grant
   esplicito) -- ma access-logs.html fa ANCHE un controllo proprio, indipendente da questo menu,
   che blocca chiunque non sia esattamente claudio.romano@bluewin.ch, anche se per errore
   qualcuno venisse granted qui. Richiesta esplicita dell'utente: "solo per me non per tutti gli
   admin" -- il catalogo da solo non basterebbe a garantirlo (un altro owner futuro o un grant
   manuale lo vedrebbe comunque nel menu), quindi la vera barriera resta dentro la pagina stessa
   (vedi ALLOWED_EMAIL in access-logs.html) + la RLS sul DB, non questa voce di menu.

   NOTA (27/10/2026) su "Servizi Esterni": stesso discorso di "Log Accessi" -- la voce compare
   nel menu Owner ma access-logs.html-style gate (ALLOWED_EMAIL = claudio.romano@bluewin.ch)
   dentro servizi-esterni.html e' la vera barriera, visto che contiene informazioni di spesa/
   pagamenti. Nessuna RLS necessaria qui: la tabella e' scritta staticamente nel codice della
   pagina, non letta dal database.
   ============================================================================================ */
var PAGE_CATALOG = [
  {section:"Attività", key:"calendar.html", label:"Calendario", i18nKey:"nav_calendar"},
  {section:"Attività", key:"opportunities.html", label:"Immobili", i18nKey:"nav_opportunities"},
  {section:"Attività", key:"opportunity-form.html", label:"Nuova Opportunità", i18nKey:null},
  {section:"Attività", key:"valuations.html", label:"Valutazioni Immobiliari", i18nKey:"nav_valuations"},
  {section:"Attività", key:"video-calls.html", label:"Videochiamate", i18nKey:"nav_video_calls"},
  {section:"Attività", key:"voice-notes.html", label:"Note Vocali Collaboratori", i18nKey:"nav_voice_notes"},
  {section:"Attività", key:"short-rent.html", label:"Short Rent", i18nKey:"nav_short_rent"},
  {section:"Attività", key:"search-mandates.html", label:"Mandati di Ricerca", i18nKey:"nav_search_mandates"},
  {section:"Attività", key:"search-mandate-form.html", label:"Nuovo Mandato di Ricerca", i18nKey:"nav_search_mandate"},
  {section:"Attività", key:"property-acquisition-form.html", label:"Acquisizione Immobile", i18nKey:"nav_property_acquisition"},
  {section:"Attività", key:"documenti.html", label:"Documenti", i18nKey:"nav_documents"},
  {section:"Attività", key:"opportunities-pipeline.html", label:"Proposte / Pipeline", i18nKey:"nav_offers"},
  {section:"Attività", key:"investors.html", label:"Contatti / Investitori", i18nKey:"nav_investors"},
  {section:"Attività", key:"investor-form.html", label:"Nuovo Investitore", i18nKey:null},
  {section:"Attività", key:"events.html", label:"Eventi", i18nKey:"nav_events"},
  {section:"Attività", key:"event-form.html", label:"Nuovo Evento", i18nKey:null},
  {section:"Attività", key:"success-stories.html", label:"Success Stories", i18nKey:"nav_success_stories"},
  {section:"Attività", key:"notizie.html", label:"Notizie", i18nKey:"nav_news"},
  {section:"Dati", key:"data-sources.html", label:"Fonti Dati", i18nKey:"nav_data_sources"},
  {section:"Dati", key:"manual-overrides.html", label:"Dati Verificati", i18nKey:"nav_manual_overrides"},
  {section:"Dati", key:"destination-photos.html", label:"Foto Destinazioni", i18nKey:"nav_destination_photos"},
  {section:"Dati", key:"catalogo-verificati.html", label:"Catalogo Verificati", i18nKey:"nav_catalog_verified"},
  {section:"Gestione", key:"inquiries.html", label:"Richieste", i18nKey:"nav_requests"},
  {section:"Gestione", key:"users.html", label:"Utenti", i18nKey:"nav_users"},
  {section:"Gestione", key:"social-composer.html", label:"Post Social", i18nKey:"nav_social_composer"},
  {section:"Gestione", key:"site-settings.html", label:"Impostazioni Sito", i18nKey:"nav_site_settings"},
  {section:"Gestione", key:"broadcast-notifications.html", label:"Notifiche Broadcast", i18nKey:"nav_broadcast_notifications"},
  {section:"Gestione", key:"responsive-preview.html", label:"Anteprima Responsive", i18nKey:"nav_responsive_preview"},
  {section:"Owner", key:"articoli.html", label:"Articoli / Blog Sito", i18nKey:"nav_blog_articles"},
  {section:"Owner", key:"team-admin.html", label:"Team", i18nKey:"nav_team"},
  {section:"Owner", key:"email-composer.html", label:"Comunicazioni", i18nKey:"nav_communications"},
  {section:"Owner", key:"contabilita.html", label:"Contabilità", i18nKey:"nav_contabilita"},
  {section:"Owner", key:"ads-manager.html", label:"Pubblicità", i18nKey:"nav_ads"},
  {section:"Owner", key:"settings.html", label:"Social", i18nKey:"nav_social"},
  {section:"Owner", key:"statistics.html", label:"Statistiche", i18nKey:"nav_statistics"},
  {section:"Owner", key:"meta-ads-planner.html", label:"Test A/B Meta Ads", i18nKey:"nav_ads_ab"},
  {section:"Owner", key:"watermark-retroattivo.html", label:"Watermark Retroattivo", i18nKey:"nav_watermark_retro"},
  {section:"Owner", key:"data-sources-bulk-import.html", label:"Import Fonti Estero", i18nKey:"nav_data_sources_bulk"},
  {section:"Owner", key:"access-logs.html", label:"Log Accessi", i18nKey:null},
  {section:"Owner", key:"servizi-esterni.html", label:"Servizi Esterni", i18nKey:null}
];
