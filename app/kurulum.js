/*
  Türkü Defteri "Uygulamayı indir" yardımcısı (Sosyoloji Cebimde'deki kurulum.js dosyasından uyarlandı).
  - Uygulama zaten ana ekrandan açıldıysa hiçbir şey göstermez.
  - X, Instagram, Facebook gibi uygulamaların içindeki tarayıcıdan açıldıysa
    kullanıcıyı Chrome (Android) ya da Safari'ye (iPhone) yönlendirir.
  - Chrome'da (Android) tarayıcının kendi yükleme penceresini açar.
  - Safari'de (iPhone) Ana Ekrana Ekle adımlarını gösterir.
  Kullanıcı "Tarayıcıda devam et" diyerek pencereyi kapatabilir. Bu tercih yalnızca
  bu cihazda saklanır. Pencere tarayıcıda bir hafta, uygulama içi tarayıcıda bir gün
  boyunca kendiliğinden açılmaz. Üstteki "İndir" düğmesi her zaman görünür.
*/
(function () {
  "use strict";

  var ADRES = new URL("./", location.href).href;
  var ua = navigator.userAgent || "";
  var iOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var uygulamaIci = /Twitter|FBAN|FBAV|FB_IAB|Instagram|Line\/|LinkedInApp|Snapchat|TikTok|musical_ly|BytedanceWebview|Pinterest|WhatsApp|Telegram|GSA\//i.test(ua) ||
    (android && /; wv\)/.test(ua));
  var safari = iOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) && !uygulamaIci;
  var kurulu = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  var yuklemeOlayi = null;

  if (kurulu) return;

  function oku(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* depolama kapalı olabilir */ } }

  /* stiller */
  var stil = document.createElement("style");
  stil.textContent =
    ".indir-dugme{display:inline-flex;align-items:center;gap:6px;border:none;background:#f2e6da;color:#3b2a22;padding:7px 12px;border-radius:999px;font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit}" +
    ".indir-arka{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40;display:flex;align-items:flex-end;justify-content:center}" +
    ".indir-pencere{background:var(--zemin);color:var(--murekkep);width:100%;max-width:520px;border-radius:20px 20px 0 0;padding:22px 18px calc(22px + env(safe-area-inset-bottom));max-height:88vh;overflow:auto;box-shadow:0 -6px 30px rgba(0,0,0,.25)}" +
    ".indir-ust{display:flex;gap:14px;align-items:center;margin-bottom:12px}" +
    ".indir-ust img{width:56px;height:56px;border-radius:14px}" +
    ".indir-ust h2{margin:0;font-size:1.25rem}" +
    ".indir-adim{display:flex;gap:12px;align-items:flex-start;margin:10px 0}" +
    ".indir-no{flex:none;width:28px;height:28px;border-radius:50%;background:var(--vurgu);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.9rem}" +
    ".indir-pencere .dugme{width:100%;justify-content:center;padding:12px;font-size:1rem;margin-top:8px}" +
    ".indir-kapat{display:block;width:100%;background:none;border:none;color:var(--soluk);padding:12px;margin-top:6px;font-size:.95rem;cursor:pointer;font-family:inherit}" +
    ".indir-ikon{display:inline-block;vertical-align:middle;width:18px;height:18px}" +
    ".indir-not{font-size:.85rem;color:var(--soluk)}";
  document.head.appendChild(stil);

  var PAYLAS_IKON = '<svg class="indir-ikon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 11v9h14v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MENU_IKON = '<svg class="indir-ikon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>';

  function adim(no, metin) { return '<div class="indir-adim"><span class="indir-no">' + no + "</span><div>" + metin + "</div></div>"; }

  function icerik() {
    var ust = '<div class="indir-ust"><img src="icons/icon-192.png" alt=""><div><h2>Türkü Defteri</h2><div class="indir-not">Ücretsiz · Reklamsız · Veri toplamaz</div></div></div>';
    if (uygulamaIci && android) {
      return ust + "<p>Uygulamayı telefonuna kurmak için sayfayı Chrome'da açman gerekiyor.</p>" +
        '<button class="dugme ana" id="indir-chrome">Chrome\'da aç ve indir</button>' +
        adim(1, "Düğme çalışmazsa sağ üstteki " + MENU_IKON + " menüsüne dokun.") +
        adim(2, "<b>Tarayıcıda aç</b> ya da <b>Chrome'da aç</b> seçeneğini seç.") +
        adim(3, "Açılan sayfada <b>Uygulamayı indir</b> düğmesine dokun.") +
        '<button class="dugme" id="indir-kopyala">Bağlantıyı kopyala</button>';
    }
    if (uygulamaIci && iOS) {
      return ust + "<p>iPhone'da uygulamayı kurmak için sayfayı <b>Safari</b>'de açman gerekiyor.</p>" +
        '<button class="dugme ana" id="indir-safari">Safari\'de aç</button>' +
        adim(1, "Düğme çalışmazsa sağ üstteki " + MENU_IKON + " ya da " + PAYLAS_IKON + " simgesine dokun.") +
        adim(2, "<b>Safari'de aç</b> seçeneğini seç. Bu seçenek yoksa bağlantıyı kopyalayıp Safari'ye yapıştır.") +
        adim(3, "Safari'de alttaki " + PAYLAS_IKON + " Paylaş düğmesine, ardından <b>Ana Ekrana Ekle</b> seçeneğine dokun.") +
        '<button class="dugme" id="indir-kopyala">Bağlantıyı kopyala</button>';
    }
    if (iOS && !safari) {
      return ust + "<p>iPhone'da uygulamayı ana ekrana eklemek için sayfayı <b>Safari</b>'de açman gerekiyor.</p>" +
        adim(1, "Bağlantıyı kopyala ve Safari'yi aç.") +
        adim(2, "Adres çubuğuna yapıştırıp sayfayı aç.") +
        adim(3, "Alttaki " + PAYLAS_IKON + " Paylaş düğmesine, ardından <b>Ana Ekrana Ekle</b> seçeneğine dokun.") +
        '<button class="dugme ana" id="indir-kopyala">Bağlantıyı kopyala</button>';
    }
    if (iOS) {
      return ust + "<p>Uygulamayı iPhone'una birkaç dokunuşla kurabilirsin.</p>" +
        adim(1, "Alttaki " + PAYLAS_IKON + " <b>Paylaş</b> düğmesine dokun.") +
        adim(2, "Listeyi kaydırıp <b>Ana Ekrana Ekle</b> seçeneğine dokun.") +
        adim(3, "Sağ üstteki <b>Ekle</b> düğmesine dokun. Uygulama ana ekranında görünecek.");
    }
    if (yuklemeOlayi) {
      return ust + "<p>Uygulamayı telefonuna kur. Ana ekrandan açılır, internetsiz de çalışır.</p>" +
        '<button class="dugme ana" id="indir-yukle">Uygulamayı indir</button>';
    }
    if (android) {
      return ust + "<p>Uygulamayı telefonuna kurmak için:</p>" +
        adim(1, "Tarayıcının sağ üstündeki " + MENU_IKON + " menüsüne dokun.") +
        adim(2, "<b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b> seçeneğini seç.") +
        adim(3, "Çıkan pencerede <b>Yükle</b>'ye dokun.");
    }
    return ust + "<p>Uygulamayı telefonuna kurmak için bu sayfayı telefonunda aç:</p><p><b>" + ADRES + "</b></p>" +
      adim(1, "Android'de Chrome menüsünden <b>Uygulamayı yükle</b>.") +
      adim(2, "iPhone'da Safari'de " + PAYLAS_IKON + " <b>Paylaş → Ana Ekrana Ekle</b>.") +
      '<button class="dugme" id="indir-kopyala">Bağlantıyı kopyala</button>';
  }

  function kapat(hatirla) {
    var a = document.getElementById("indir-arka");
    if (a) a.remove();
    if (hatirla) yaz("turku-indir-ertele", String(Date.now()));
  }

  function kopyala() {
    function bildir(m) { if (window.TD && window.TD.bildir) window.TD.bildir(m); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ADRES).then(function () { bildir("Bağlantı kopyalandı"); }, function () { bildir(ADRES); });
    else bildir(ADRES);
  }

  function ac() {
    kapat(false);
    var arka = document.createElement("div");
    arka.className = "indir-arka"; arka.id = "indir-arka";
    arka.setAttribute("role", "dialog"); arka.setAttribute("aria-modal", "true"); arka.setAttribute("aria-label", "Uygulamayı indir");
    arka.innerHTML = '<div class="indir-pencere">' + icerik() + '<button class="indir-kapat" id="indir-devam">Tarayıcıda devam et</button></div>';
    document.body.appendChild(arka);
    arka.addEventListener("click", function (e) { if (e.target === arka) kapat(true); });
    document.getElementById("indir-devam").addEventListener("click", function () { kapat(true); });
    var k = document.getElementById("indir-kopyala"); if (k) k.addEventListener("click", kopyala);
    var c = document.getElementById("indir-chrome");
    if (c) c.addEventListener("click", function () {
      location.href = "intent://" + ADRES.replace(/^https:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(ADRES) + ";end";
    });
    var s = document.getElementById("indir-safari");
    if (s) s.addEventListener("click", function () { location.href = "x-safari-" + ADRES; });
    var y = document.getElementById("indir-yukle");
    if (y) y.addEventListener("click", function () {
      if (!yuklemeOlayi) return;
      yuklemeOlayi.prompt();
      yuklemeOlayi.userChoice.then(function () { yuklemeOlayi = null; kapat(false); });
    });
  }

  /* üst çubuğa kalıcı "İndir" düğmesi */
  function dugmeEkle() {
    var ust = document.querySelector(".ust");
    if (!ust || document.getElementById("indir-ust")) return;
    var b = document.createElement("button");
    b.id = "indir-ust"; b.className = "indir-dugme"; b.type = "button";
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>İndir';
    b.addEventListener("click", ac);
    var listem = ust.querySelector(".ust-dugme");
    var kutu = document.createElement("div");
    kutu.style.cssText = "display:flex;align-items:center;gap:8px";
    ust.insertBefore(kutu, listem);
    kutu.appendChild(b);
    if (listem) kutu.appendChild(listem);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    yuklemeOlayi = e;
  });
  window.addEventListener("appinstalled", function () {
    kapat(false);
    var b = document.getElementById("indir-ust"); if (b) b.remove();
  });

  window.INDIR_AC = ac;

  function basla() {
    dugmeEkle();
    var ertele = +(oku("turku-indir-ertele") || 0);
    var birHafta = 7 * 24 * 60 * 60 * 1000;
    var telefon = iOS || android;
    /* telefonda ilk ziyarette ya da uygulama içi tarayıcıda pencereyi kendiliğinden aç */
    var bekleme = uygulamaIci ? 24 * 60 * 60 * 1000 : birHafta;
    if (telefon && Date.now() - ertele > bekleme) setTimeout(ac, uygulamaIci ? 600 : 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();
