/* IMMONOVA – testi base dei contratti (segnalatore / agenzia partner).
   Segnaposto sostituiti alla generazione:
   {{CONTROPARTE}} {{OGGETTO}} {{PENALE_NDA}} {{ALLEGATO_A}} {{DATA}} {{VERSIONE_TABELLA}}
   I testi si possono modificare dalla pagina admin/contratti.html (pulsante "Modifica testo"):
   la versione modificata viene salvata su Supabase (immonova_contract_templates) e ha la precedenza. */
window.IMMONOVA_CONTRACT_TEMPLATES = {

segnalatore: {
  key: "segnalatore_v1",
  title: "Scrittura privata di segnalazione d'affare",
  html: `
<h1>SCRITTURA PRIVATA DI SEGNALAZIONE D'AFFARE</h1>
<p class="c"><b>TRA</b></p>
<p><b>IMMONOVA S.r.l.</b>, con sede legale in Roma, Via Emilio Faà di Bruno n. 43, Codice Fiscale e Partita IVA 18585831003, in persona del legale rappresentante pro tempore, Sig. Claudio Romano (di seguito, la <b>"Società"</b>)</p>
<p class="c"><b>E</b></p>
<p>{{CONTROPARTE}} (di seguito, il <b>"Segnalatore"</b>)</p>
<p>(la Società e il Segnalatore, congiuntamente, le <b>"Parti"</b>)</p>
<h2>PREMESSO CHE</h2>
<p>a) la Società svolge attività di consulenza finalizzata all'individuazione di investitori qualificati per la cessione di asset immobiliari, previa due diligence, e opera esclusivamente su asset off-market;</p>
<p>b) ai fini del presente atto si intende per "asset off-market" un immobile che non sia mai stato pubblicato su alcuna piattaforma, portale o canale pubblicitario e che non sia mai stato posto ufficialmente in vendita;</p>
<p>c) il Segnalatore dichiara di essere venuto a conoscenza di un'opportunità di potenziale interesse per la Società;</p>
<p>d) il Segnalatore dichiara di non essere iscritto nel ruolo degli agenti di affari in mediazione né nei relativi registri camerali, e di non esercitare tale attività in forma professionale, abituale o continuativa;</p>
<p>e) le premesse costituiscono parte integrante e sostanziale del presente atto.</p>
<h2>TUTTO CIÒ PREMESSO, LE PARTI CONVENGONO E STIPULANO QUANTO SEGUE</h2>
<h3>Art. 1 – Oggetto</h3>
<p>1.1 Il Segnalatore comunica alla Società le informazioni relative all'opportunità di seguito descritta: {{OGGETTO}}.</p>
<p>1.2 La segnalazione ha carattere meramente occasionale. L'attività del Segnalatore si esaurisce nella comunicazione delle informazioni di cui al comma 1.1; il Segnalatore si astiene da qualsiasi attività di trattativa, intermediazione, accompagnamento in visita o formulazione di proposte per conto di alcuna delle parti dell'eventuale affare.</p>
<h3>Art. 2 – Dichiarazioni e garanzie del Segnalatore</h3>
<p>2.1 Il Segnalatore dichiara e garantisce che l'asset segnalato possiede i requisiti di cui alla premessa b).</p>
<p>2.2 Il Segnalatore dichiara di avere titolo a comunicare le informazioni trasmesse e che tale comunicazione non viola diritti di terzi né obblighi di riservatezza da cui sia vincolato.</p>
<h3>Art. 3 – Documentazione</h3>
<p>3.1 Il Segnalatore si impegna a fornire alla Società la documentazione relativa all'asset segnalato, ivi comprese visure catastali, planimetrie e titoli di provenienza.</p>
<p>3.2 Qualora il Segnalatore non possa o non intenda provvedere direttamente, è tenuto a comunicare alla Società i recapiti del proprietario, al fine di consentire alla Società la raccolta diretta della documentazione e l'eventuale conferimento di un incarico.</p>
<h3>Art. 4 – Priorità della segnalazione</h3>
<p>4.1 In caso di pluralità di segnalazioni relative al medesimo asset o al medesimo soggetto, è riconosciuta esclusivamente la segnalazione registrata per prima sulla piattaforma IMMONOVA; la data e l'ora di registrazione certificate dalla piattaforma fanno piena prova tra le Parti.</p>
<h3>Art. 5 – Compenso</h3>
<p>5.1 Per la segnalazione la Società riconosce al Segnalatore un compenso lordo in misura fissa, determinato in base al prezzo di vendita dell'asset secondo la Tabella Compensi IMMONOVA in vigore alla data di registrazione della segnalazione ({{VERSIONE_TABELLA}}), allegata al presente atto quale parte integrante e sostanziale (Allegato A).</p>
<h3>Art. 6 – Maturazione ed esigibilità del compenso</h3>
<p>6.1 Il compenso matura ed è esigibile esclusivamente alla conclusione giuridica dell'affare, mediante stipula del contratto preliminare o dell'atto definitivo di compravendita, e comunque solo successivamente all'integrale incasso da parte della Società del proprio compenso professionale.</p>
<p>6.2 Nulla è dovuto al Segnalatore, a titolo di compenso, rimborso spese o indennizzo, qualora l'affare non si concluda per qualsiasi causa.</p>
<h3>Art. 7 – Trattamento fiscale</h3>
<p>7.1 Il compenso è corrisposto previa emissione di ricevuta per prestazione occasionale, con applicazione della ritenuta d'acconto nella misura di legge, ove dovuta.</p>
<h3>Art. 8 – Obbligo di riservatezza</h3>
<p>8.1 Il Segnalatore si obbliga a mantenere la più stretta riservatezza su tutte le informazioni, i dati e i documenti di cui venga a conoscenza in relazione al presente atto o tramite la Società, ivi comprese, a titolo esemplificativo, le informazioni relative ad asset, proprietari, acquirenti, investitori, prezzi e condizioni economiche.</p>
<p>8.2 Il Segnalatore si obbliga a non comunicare tali informazioni a terzi e a non utilizzarle per finalità diverse dall'esecuzione del presente atto.</p>
<p>8.3 L'obbligo di riservatezza vincola il Segnalatore per tutta la durata del rapporto e senza limiti di tempo successivamente alla sua cessazione.</p>
<h3>Art. 9 – Divieto di non scavalcamento</h3>
<p>9.1 Per un periodo di 24 (ventiquattro) mesi dalla data di registrazione della segnalazione, il Segnalatore si obbliga a non intrattenere trattative né a concludere affari, direttamente o per interposta persona, con proprietari, acquirenti o investitori conosciuti tramite la Società, in relazione agli asset oggetto del rapporto.</p>
<h3>Art. 10 – Clausola penale</h3>
<p>10.1 In caso di violazione dell'art. 9, il Segnalatore è tenuto a corrispondere alla Società, a titolo di penale, una somma pari all'intero compenso professionale che la Società avrebbe percepito dall'operazione conclusa in violazione.</p>
<p>10.2 In caso di violazione dell'art. 8, il Segnalatore è tenuto a corrispondere alla Società, a titolo di penale, la somma di {{PENALE_NDA}} per ciascuna violazione accertata.</p>
<p>10.3 Le penali di cui al presente articolo sono dovute salvo il risarcimento del danno ulteriore, ai sensi dell'art. 1382 c.c.</p>
<h3>Art. 11 – Sottoscrizione elettronica</h3>
<p>11.1 Le Parti convengono che il presente atto sia sottoscritto mediante firma elettronica con codice OTP inviato all'indirizzo email del Segnalatore; data, ora, indirizzo IP, codice di verifica e impronta digitale (SHA-256) del documento sono registrati dalla piattaforma IMMONOVA.</p>
<h3>Art. 12 – Legge applicabile e foro competente</h3>
<p>12.1 Il presente atto è regolato dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di Roma.</p>
<p>Roma, {{DATA}}</p>
<p><b>Letto, confermato e sottoscritto.</b></p>
<div class="sign-row"><div><b>IMMONOVA S.r.l.</b><br>Il Legale Rappresentante</div><div><b>Il Segnalatore</b><br>(firma elettronica OTP)</div></div>
<div class="clauses" data-clauses="1"><p><b>Approvazione specifica ai sensi degli artt. 1341 e 1342 c.c.</b></p>
<p>Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., il Segnalatore dichiara di approvare specificamente le seguenti clausole: art. 4 (priorità della segnalazione), art. 6 (maturazione ed esigibilità del compenso), art. 8 (obbligo di riservatezza), art. 9 (divieto di non scavalcamento), art. 10 (clausola penale), art. 12 (foro competente).</p>
<p>Il Segnalatore (seconda firma elettronica OTP)</p></div>
<div class="allegato"><h2>ALLEGATO A – Tabella Compensi IMMONOVA</h2>{{ALLEGATO_A}}</div>
`},

partner: {
  key: "partner_v2",
  title: "Accordo di Partnership Commerciale",
  html: `
<h1>ACCORDO DI PARTNERSHIP COMMERCIALE</h1>
<p class="c"><b>TRA</b></p>
<p><b>IMMONOVA S.r.l.</b>, con sede legale in Roma, Via Emilio Faà di Bruno n. 43, Codice Fiscale e Partita IVA 18585831003, in persona del legale rappresentante pro tempore, Sig. Claudio Romano (di seguito, <b>"IMMONOVA"</b>)</p>
<p class="c"><b>E</b></p>
<p>{{CONTROPARTE}} (di seguito, il <b>"Partner"</b>)</p>
<p>(IMMONOVA e il Partner, congiuntamente, le <b>"Parti"</b>)</p>
<h2>PREMESSO CHE</h2>
<p>a) IMMONOVA gestisce una piattaforma riservata (la <b>"Piattaforma"</b>) dedicata esclusivamente ad asset immobiliari off-market e a investitori qualificati;</p>
<p>b) ai fini del presente Accordo si intende per "asset off-market" un immobile che non sia mai stato pubblicato su alcuna piattaforma, portale o canale pubblicitario e che non sia mai stato posto ufficialmente in vendita;</p>
<p>c) il Partner è un operatore professionale del settore immobiliare, regolarmente abilitato all'esercizio della propria attività, e intende avvalersi della Piattaforma;</p>
<p>d) le premesse e gli allegati costituiscono parte integrante e sostanziale del presente Accordo.</p>
<h2>TUTTO CIÒ PREMESSO, LE PARTI CONVENGONO E STIPULANO QUANTO SEGUE</h2>
<h3>Art. 1 – Oggetto</h3>
<p>1.1 Il presente Accordo disciplina l'accesso del Partner alla Piattaforma al fine di: (i) proporre asset di cui il Partner abbia la disponibilità o l'incarico di vendita (<b>"Asset del Partner"</b>); (ii) presentare ai propri clienti acquirenti asset pubblicati sulla Piattaforma.</p>
<p>1.2 L'adesione non attribuisce al Partner alcuna esclusiva territoriale o di prodotto, salvo diverso patto scritto.</p>
<h3>Art. 2 – Garanzia off-market</h3>
<p>2.1 Il Partner dichiara e garantisce che ogni Asset del Partner proposto sulla Piattaforma possiede i requisiti di cui alla premessa b) e si obbliga a non pubblicarlo su alcun altro canale per tutta la durata della sua presenza sulla Piattaforma.</p>
<p>2.2 In caso di dichiarazione non veritiera o di successiva pubblicazione, IMMONOVA ha facoltà di rimuovere immediatamente l'asset dalla Piattaforma, ferma l'applicazione dell'art. 9.</p>
<p>2.3 Il Partner fornisce la documentazione dell'asset (visure catastali, planimetrie, titoli di provenienza) ovvero, in mancanza, i recapiti del proprietario per consentirne la raccolta diretta da parte di IMMONOVA.</p>
<h3>Art. 3 – Ripartizione dei compensi</h3>
<p>3.1 Qualora l'asset o il cliente acquirente siano di IMMONOVA, ciascuna Parte percepisce esclusivamente il compenso pattuito con il proprio cliente sul proprio lato dell'operazione.</p>
<p>3.2 Qualora un Partner concluda la vendita di un asset presentato sulla Piattaforma da altro Partner, è dovuta a IMMONOVA da <b>ciascuno</b> dei due Partner, per il rispettivo lato, una fee (la <b>"Fee"</b>) calcolata sul prezzo di vendita applicando la scala di Lehman secondo la Tabella Compensi IMMONOVA in vigore alla data di caricamento dell'asset sulla Piattaforma ({{VERSIONE_TABELLA}}), allegata al presente Accordo (Allegato A).</p>
<p>3.3 Ai fini del calcolo fa fede il prezzo risultante dal contratto preliminare o definitivo; in mancanza di comunicazione, la Fee è calcolata sul prezzo di pubblicazione dell'asset.</p>
<h3>Art. 4 – Fatturazione e pagamento</h3>
<p>4.1 La Fee è fatturata da IMMONOVA ed è esigibile entro 15 (quindici) giorni dal perfezionamento della compravendita. In caso di ritardo decorrono di diritto gli interessi moratori di cui al D.Lgs. 231/2002.</p>
<p>4.2 Il Partner comunica a IMMONOVA ogni compravendita conclusa entro 5 (cinque) giorni lavorativi, trasmettendo copia degli atti.</p>
<h3>Art. 5 – Obblighi del Partner</h3>
<p>5.1 Il Partner utilizza la Piattaforma con diligenza professionale, nel rispetto della normativa in materia di mediazione immobiliare, di protezione dei dati personali (Reg. UE 2016/679) e di antiriciclaggio (D.Lgs. 231/2007), e garantisce la veridicità delle informazioni fornite.</p>
<h3>Art. 6 – Obbligo di riservatezza</h3>
<p>6.1 Il Partner si obbliga a mantenere la più stretta riservatezza su asset, proprietari, clienti, investitori, prezzi e condizioni economiche conosciuti tramite la Piattaforma, a non comunicarli a terzi e a non utilizzarli per finalità estranee al presente Accordo, per tutta la sua durata e senza limiti di tempo dopo la cessazione. Il Partner risponde dell'osservanza di tale obbligo da parte dei propri collaboratori.</p>
<h3>Art. 7 – Divieto di non scavalcamento</h3>
<p>7.1 Per 24 (ventiquattro) mesi dall'ultimo contatto generato tramite la Piattaforma, anche successivamente alla cessazione del presente Accordo, il Partner si obbliga a non concludere, direttamente o per interposta persona, operazioni con soggetti o su asset conosciuti tramite la Piattaforma al di fuori della stessa, salvo prova che il contatto sia sorto in modo autonomo e indipendente.</p>
<h3>Art. 8 – Durata e recesso</h3>
<p>8.1 Il presente Accordo ha durata di 24 (ventiquattro) mesi dalla sottoscrizione, con rinnovo tacito per uguali periodi salvo disdetta a mezzo PEC con preavviso di 60 (sessanta) giorni. Il recesso non pregiudica il diritto di IMMONOVA alla Fee sulle operazioni avviate o concluse, né gli obblighi di cui agli artt. 6 e 7.</p>
<p>8.2 IMMONOVA può risolvere di diritto il presente Accordo ai sensi dell'art. 1456 c.c., mediante comunicazione scritta, in caso di violazione degli artt. 2, 6 o 7.</p>
<h3>Art. 9 – Clausola penale</h3>
<p>9.1 In caso di violazione dell'art. 7, il Partner è tenuto a corrispondere a IMMONOVA, a titolo di penale, una somma pari alla Fee che sarebbe stata dovuta a IMMONOVA da entrambi i lati sull'operazione conclusa in violazione.</p>
<p>9.2 In caso di violazione degli artt. 2 o 6, il Partner è tenuto a corrispondere a IMMONOVA, a titolo di penale, la somma di {{PENALE_NDA}} per ciascuna violazione accertata.</p>
<p>9.3 Le penali sono dovute salvo il risarcimento del danno ulteriore, ai sensi dell'art. 1382 c.c.</p>
<h3>Art. 10 – Autonomia delle Parti e dati personali</h3>
<p>10.1 Il presente Accordo non costituisce rapporto di lavoro subordinato, agenzia, associazione o joint venture. Le Parti trattano i dati personali scambiati quali titolari autonomi del trattamento, nel rispetto del Reg. UE 2016/679.</p>
<h3>Art. 11 – Sottoscrizione elettronica</h3>
<p>11.1 Le Parti convengono che il presente Accordo sia sottoscritto mediante firma elettronica con codice OTP inviato all'indirizzo email del Partner; data, ora, indirizzo IP, codice di verifica e impronta digitale (SHA-256) del documento sono registrati dalla Piattaforma.</p>
<h3>Art. 12 – Legge applicabile e foro competente</h3>
<p>12.1 Il presente Accordo è regolato dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di Roma.</p>
<p>Roma, {{DATA}}</p>
<p><b>Letto, confermato e sottoscritto.</b></p>
<div class="sign-row"><div><b>IMMONOVA S.r.l.</b><br>Il Legale Rappresentante</div><div><b>Il Partner</b><br>(firma elettronica OTP)</div></div>
<div class="clauses" data-clauses="1"><p><b>Approvazione specifica ai sensi degli artt. 1341 e 1342 c.c.</b></p>
<p>Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c., il Partner dichiara di approvare specificamente le seguenti clausole: art. 2 (garanzia off-market), art. 3 (ripartizione dei compensi e Fee), art. 7 (divieto di non scavalcamento), art. 8 (durata, recesso e risoluzione), art. 9 (clausola penale), art. 12 (foro competente).</p>
<p>Il Partner (seconda firma elettronica OTP)</p></div>
<div class="allegato"><h2>ALLEGATO A – Tabella Compensi IMMONOVA</h2>{{ALLEGATO_A}}</div>
`}
};

/* Allegato A dalla versione della tabella compensi */
window.immonovaRenderCompTable = function(tab, type){
  var eur = function(v){ return v == null || v === "" ? "—" : "€ " + Number(v).toLocaleString("it-IT", {maximumFractionDigits:0}); };
  var range = function(r){ return r.a == null ? ("oltre " + eur(r.da)) : ((r.da > 0 ? "da " + eur(r.da + 1) : "fino a") + " " + (r.da > 0 ? "a " : "") + eur(r.a)); };
  var rows = (tab && tab.rows) || [];
  var head = type === "segnalatore"
    ? "<tr><th>Prezzo di vendita dell'asset</th><th>Compenso fisso Segnalatore (lordo)</th></tr>"
    : "<tr><th>Scaglione del prezzo di vendita</th><th>Fee IMMONOVA (scala di Lehman, % marginale sullo scaglione, per lato)</th></tr>";
  var body = rows.map(function(r){
    return "<tr><td>" + range(r) + "</td><td class=\"num\">" + (type === "segnalatore" ? eur(r.segnalatore_eur) : (Number(r.fee_pct).toLocaleString("it-IT",{minimumFractionDigits:2}) + "%")) + "</td></tr>";
  }).join("");
  var note = type === "segnalatore"
    ? "<p class=\"small\">Il compenso è determinato dalla fascia in cui ricade il prezzo di vendita e non è cumulabile tra fasce.</p>"
    : "<p class=\"small\">Scala di Lehman: ogni percentuale si applica solo alla parte del prezzo compresa nel relativo scaglione; la Fee è la somma dei risultati dei singoli scaglioni.</p>";
  return "<table class=\"comp\"><thead>" + head + "</thead><tbody>" + body + "</tbody></table>" + note +
    "<p class=\"small\">Tabella Compensi IMMONOVA – versione " + (tab ? tab.version : "—") + " in vigore dal " + (tab ? new Date(tab.valid_from).toLocaleDateString("it-IT") : "—") + ".</p>";
};

/* Calcolo fee Lehman (marginale per scaglione) e compenso fisso segnalatore */
window.immonovaCompute = function(tab, price){
  var p = Number(price) || 0, fee = 0, seg = null;
  ((tab && tab.rows) || []).forEach(function(r){
    var top = r.a == null ? Infinity : r.a;
    if(p > r.da) fee += (Math.min(p, top) - r.da) * Number(r.fee_pct) / 100;
    if(p > r.da && p <= top) seg = r.segnalatore_eur;
  });
  return { fee: Math.round(fee * 100) / 100, segnalatore: seg };
};
