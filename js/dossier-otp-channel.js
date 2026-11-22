/* IMMONOVA – pagine dossier: scelta del canale per il codice di verifica (Email o WhatsApp).
   Si aggancia al modulo OTP già presente nelle pagine dossier/opportunity-*.html senza riscriverle:
   - aggiunge la scelta "Email / WhatsApp" e il campo cellulare;
   - in modalità WhatsApp l'email diventa facoltativa;
   - aggiunge channel / recipient_phone alla chiamata a otp-generate e mostra dove è stato inviato il codice. */
(function(){
  var L = (document.documentElement.lang || "it").slice(0, 2);
  var T = {
    it: { how:"Ricevi il codice via", email:"Email", wa:"WhatsApp", phone:"Il tuo cellulare (es. +39 333 1234567)", badPhone:"Inserisci un numero di cellulare valido.", sentWa:"Codice inviato su WhatsApp al ", sentEmail:"Codice inviato via email a ", fb:"WhatsApp non disponibile: ", optEmail:"La tua email (facoltativa)" },
    en: { how:"Receive the code via", email:"Email", wa:"WhatsApp", phone:"Your mobile number (e.g. +44 7700 900123)", badPhone:"Please enter a valid mobile number.", sentWa:"Code sent on WhatsApp to ", sentEmail:"Code sent by email to ", fb:"WhatsApp not available: ", optEmail:"Your email (optional)" },
    de: { how:"Code erhalten per", email:"E-Mail", wa:"WhatsApp", phone:"Ihre Handynummer (z. B. +49 151 1234567)", badPhone:"Bitte geben Sie eine gültige Handynummer ein.", sentWa:"Code per WhatsApp gesendet an ", sentEmail:"Code per E-Mail gesendet an ", fb:"WhatsApp nicht verfügbar: ", optEmail:"Ihre E-Mail (optional)" },
    fr: { how:"Recevoir le code par", email:"E-mail", wa:"WhatsApp", phone:"Votre mobile (ex. +33 6 12 34 56 78)", badPhone:"Veuillez saisir un numéro de mobile valide.", sentWa:"Code envoyé sur WhatsApp au ", sentEmail:"Code envoyé par e-mail à ", fb:"WhatsApp indisponible : ", optEmail:"Votre e-mail (facultatif)" },
    es: { how:"Recibir el código por", email:"Email", wa:"WhatsApp", phone:"Tu móvil (ej. +34 612 345 678)", badPhone:"Introduce un número de móvil válido.", sentWa:"Código enviado por WhatsApp al ", sentEmail:"Código enviado por email a ", fb:"WhatsApp no disponible: ", optEmail:"Tu email (opcional)" }
  }[L] || null;
  if(!T) T = { how:"Ricevi il codice via", email:"Email", wa:"WhatsApp", phone:"Cellulare", badPhone:"Numero non valido.", sentWa:"Codice inviato su WhatsApp al ", sentEmail:"Codice inviato via email a ", fb:"WhatsApp non disponibile: ", optEmail:"Email (facoltativa)" };

  function init(){
    var email = document.getElementById("otpEmail"), btn = document.getElementById("sendCodeBtn"), lead = document.getElementById("codeStepLead");
    if(!email || !btn || document.getElementById("otpChanBox")) return;
    var emailPh = email.getAttribute("placeholder") || "";
    var box = document.createElement("div");
    box.id = "otpChanBox";
    box.style.cssText = "margin:0 0 12px;font-size:13px;color:#6b6353";
    box.innerHTML = '<div style="margin-bottom:6px;font-weight:600">' + T.how + '</div>' +
      '<div style="display:flex;gap:8px">' +
      '<label style="flex:1;display:flex;gap:6px;align-items:center;justify-content:center;padding:10px;border:1px solid #ddd3bd;border-radius:6px;cursor:pointer;background:#fff"><input type="radio" name="otpChan" value="email" checked> ' + T.email + '</label>' +
      '<label style="flex:1;display:flex;gap:6px;align-items:center;justify-content:center;padding:10px;border:1px solid #ddd3bd;border-radius:6px;cursor:pointer;background:#fff"><input type="radio" name="otpChan" value="whatsapp"> ' + T.wa + '</label></div>';
    var phone = document.createElement("input");
    phone.type = "tel"; phone.id = "otpPhone"; phone.placeholder = T.phone; phone.autocomplete = "tel";
    phone.style.cssText = "width:100%;font-size:15px;padding:12px 14px;border:1px solid #ddd3bd;border-radius:6px;margin-bottom:12px;box-sizing:border-box;font-family:inherit;display:none";
    email.parentNode.insertBefore(box, email);
    email.parentNode.insertBefore(phone, email);

    function mode(){ var r = document.querySelector('input[name="otpChan"]:checked'); return r ? r.value : "email"; }
    box.addEventListener("change", function(){
      var wa = mode() === "whatsapp";
      phone.style.display = wa ? "" : "none";
      email.placeholder = wa ? T.optEmail : emailPh;
      if(wa) phone.focus();
    });

    var digits = function(v){ var d = String(v || "").replace(/[^0-9]/g, ""); if(d.indexOf("00") === 0) d = d.slice(2); if(/^3\d{8,9}$/.test(d)) d = "39" + d; return d; };
    var FAKE = "@whatsapp.immonova.invalid";

    // prima del controllo email della pagina: in modalità WhatsApp l'email è facoltativa
    btn.addEventListener("click", function(ev){
      if(mode() !== "whatsapp") return;
      var p = digits(phone.value);
      if(p.length < 9){ ev.stopImmediatePropagation(); ev.preventDefault(); var m = document.getElementById("otpMsg"); if(m){ m.textContent = T.badPhone; m.className = "msg err"; } return; }
      if(!email.value.trim()){ email.value = "wa" + p + FAKE; email.dataset.fake = "1"; }
    }, true);

    // aggiunge canale e cellulare alla chiamata otp-generate e legge dove è stato inviato
    var of = window.fetch;
    window.fetch = function(url, opts){
      var isGen = typeof url === "string" && url.indexOf("/otp-generate") >= 0 && opts && opts.body;
      if(isGen){
        try{
          var b = JSON.parse(opts.body);
          if(mode() === "whatsapp"){
            b.channel = "whatsapp"; b.recipient_phone = digits(phone.value);
            if(String(b.recipient_email || "").indexOf(FAKE) > 0) b.recipient_email = null;
          } else b.channel = "email";
          opts = Object.assign({}, opts, { body: JSON.stringify(b) });
        }catch(e){}
      }
      var pr = of.call(this, url, opts);
      if(isGen){
        pr.then(function(res){ return res.clone().json(); }).then(function(d){
          if(email.dataset.fake){ email.value = ""; delete email.dataset.fake; }
          if(!d || !d.ok || !lead) return;
          setTimeout(function(){
            lead.textContent = d.channel === "whatsapp" ? T.sentWa + (d.destination_masked || "") : (d.fallback ? T.fb : "") + T.sentEmail + (d.destination_masked || "");
          }, 80);
        }).catch(function(){});
      }
      return pr;
    };
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
