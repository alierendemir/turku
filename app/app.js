/* Türkü Defteri · Ali Eren Demir
   Tüm kişisel bilgiler (repertuvar, notlar, eklenen türküler, ayarlar) yalnızca bu cihazda localStorage içinde tutulur. */
(function () {
  "use strict";

  var SURUM = "1.3";
  var sayfa = document.getElementById("sayfa");

  /* ---------- Yardımcılar ---------- */
  function oku(anahtar, varsayilan) {
    try { var d = localStorage.getItem(anahtar); return d === null ? varsayilan : JSON.parse(d); } catch (e) { return varsayilan; }
  }
  function yaz(anahtar, deger) {
    try { localStorage.setItem(anahtar, JSON.stringify(deger)); } catch (e) { bildir("Bu tarayıcıda kayıt yapılamıyor."); }
  }
  function kacis(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function sadelestir(s) {
    return String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  var harmanla = new Intl.Collator("tr");
  function siraAnahtari(s) { return String(s || "").replace(/^[^0-9A-Za-zÇĞİÖŞÜÂÎÛçğıöşüâîû]+/, "").replace(/^Â/, "A").replace(/^Î/, "İ").replace(/^Û/, "U").replace(/^â/, "a").replace(/^î/, "i").replace(/^û/, "u"); }
  function siralaAd(a, b) { return harmanla.compare(siraAnahtari(a.ad), siraAnahtari(b.ad)); }
  function ilkHarf(s) { var h = siraAnahtari(s).charAt(0).toLocaleUpperCase("tr"); return /[A-ZÇĞİÖŞÜ]/.test(h) ? h : "#"; }
  function ytKimlik(metin) {
    var m = String(metin || "").match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(String(metin || "").trim()) ? String(metin).trim() : null;
  }
  var toastZaman;
  function bildir(metin) {
    var t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = metin; t.hidden = false;
    clearTimeout(toastZaman); toastZaman = setTimeout(function () { t.hidden = true; }, 2200);
  }
  var YILDIZ_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  var TURLER = { deyis: "Deyiş ve nefes", turku: "Türkü", ozgun: "Özgün" };
  var DILLER = { tr: "Türkçe", ku: "Kurmancî", zz: "Kirmanckî (Zazaca)" };

  /* ---------- Veri ---------- */
  function kendiTurkuler() { return oku("turku-kendi", []); }
  function tumTurkuler() {
    var hazir = (window.TURKULER || []).map(function (t) { return t; });
    return hazir.concat(kendiTurkuler().map(function (t) { t.kendi = true; return t; }));
  }
  function turkuBul(id) { return tumTurkuler().filter(function (t) { return t.id === id; })[0]; }
  function yildizlar() { return oku("turku-yildiz", []); }
  function yildizliMi(id) { return yildizlar().indexOf(id) >= 0; }
  function yildizDegistir(id) {
    var y = yildizlar(), i = y.indexOf(id);
    if (i >= 0) y.splice(i, 1); else y.push(id);
    yaz("turku-yildiz", y);
    return i < 0;
  }
  function seslendirenler(t) {
    var adlar = [];
    (t.dinle || []).forEach(function (d) {
      String(d.kim || "").split(/\s*,\s*/).forEach(function (a) { if (a && adlar.indexOf(a) < 0) adlar.push(a); });
    });
    return adlar;
  }
  function aramaMetni(t) {
    return sadelestir([t.ad, t.sair, t.yore, seslendirenler(t).join(" "), (t.soz || []).join(" ")].join(" "));
  }

  /* ---------- Ayarlar ---------- */
  function punto() { return oku("turku-punto", 20); }
  function puntoUygula() { document.documentElement.style.setProperty("--soz-punto", punto() + "px"); }
  function temaUygula() {
    var t = oku("turku-tema", "sistem");
    if (t === "sistem") document.documentElement.removeAttribute("data-tema");
    else document.documentElement.setAttribute("data-tema", t);
  }
  puntoUygula(); temaUygula();
  window.TD = { bildir: bildir };

  /* ---------- Ekranı açık tutma (Wake Lock) ---------- */
  var kilit = null, kilitIsteniyor = false;
  function uyanikTercih() { return oku("turku-uyanik", true); }
  function kilitAl() {
    kilitIsteniyor = true;
    if (!("wakeLock" in navigator)) return Promise.resolve(false);
    if (kilit) return Promise.resolve(true);
    return navigator.wakeLock.request("screen").then(function (k) {
      kilit = k;
      k.addEventListener("release", function () { kilit = null; uyanikDugmeGuncelle(); });
      uyanikDugmeGuncelle();
      return true;
    }).catch(function () { return false; });
  }
  function kilitBirak() {
    kilitIsteniyor = false;
    if (kilit) { kilit.release().catch(function () {}); kilit = null; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && kilitIsteniyor && !kilit) kilitAl();
  });
  function uyanikDugmeGuncelle() {
    var d = document.getElementById("uyanik");
    if (!d) return;
    var acik = !!kilit;
    d.setAttribute("aria-pressed", acik ? "true" : "false");
    d.querySelector("span").textContent = acik ? "Ekran açık ✓" : "Ekranı açık tut";
  }

  /* ---------- Yönlendirme ---------- */
  var listeDurumu = { ara: "", tur: "hepsi", yore: "" };

  function yonlendir() {
    var h = location.hash.replace(/^#\/?/, "");
    var soru = h.indexOf("?"), parametre = "";
    if (soru >= 0) { parametre = h.slice(soru + 1); h = h.slice(0, soru); }
    var parca = h.split("/").map(decodeURIComponent);
    if (parca[0] !== "t") { kilitBirak(); document.body.classList.remove("okuma"); }
    if (parca[0] !== "akort" && window.Akort) Akort.durdur();
    var sekme = "liste";
    if (parca[0] === "t" && parca[1]) { turkuSayfasi(parca[1], parametre); sekme = parametre.indexOf("r=1") >= 0 ? "repertuvar" : ""; }
    else if (parca[0] === "sanatcilar") { sanatcilarSayfasi(); sekme = "sanatcilar"; }
    else if (parca[0] === "kisi" && parca[1]) { kisiSayfasi(parca[1]); sekme = "sanatcilar"; }
    else if (parca[0] === "repertuvar") { repertuvarSayfasi(); sekme = "repertuvar"; }
    else if (parca[0] === "akort") { akortSayfasi(); sekme = "akort"; }
    else if (parca[0] === "ekle") { ekleSayfasi(parca[1]); sekme = ""; }
    else if (parca[0] === "hakkinda") { hakkindaSayfasi(); sekme = ""; }
    else listeSayfasi();
    Array.prototype.forEach.call(document.querySelectorAll(".alt-menu a"), function (a) {
      a.classList.toggle("etkin", a.getAttribute("data-sekme") === sekme);
    });
  }
  window.addEventListener("hashchange", function () { yonlendir(); window.scrollTo(0, 0); });

  /* ---------- Liste ---------- */
  function satirHtml(t, ek) {
    var bilgi = [];
    if (t.sair) bilgi.push(t.sair);
    var s = seslendirenler(t);
    if (s.length) bilgi.push(s.slice(0, 3).join(", ") + (s.length > 3 ? "…" : ""));
    else if (t.yore) bilgi.push(t.yore);
    var rozet = "";
    if (t.kendi) rozet += '<span class="rozet">Kendi</span>';
    if (t.dil && t.dil !== "tr") rozet += '<span class="rozet">' + kacis(DILLER[t.dil] || t.dil) + "</span>";
    if (!t.soz || !t.soz.length) rozet += '<span class="rozet">Bağlantı</span>';
    var y = yildizliMi(t.id);
    return '<li class="satir"><a href="#/t/' + encodeURIComponent(t.id) + (ek || "") + '"><span class="ad">' + kacis(t.ad) + rozet + '</span><span class="bilgi">' + kacis(bilgi.join(" · ")) + "</span></a>" +
      '<button class="yildiz-dugme" data-yildiz="' + kacis(t.id) + '" aria-pressed="' + y + '" aria-label="' + (y ? "Repertuvardan çıkar" : "Repertuvara ekle") + '">' + YILDIZ_SVG + "</button></li>";
  }

  function yildizBagla(kok, sonra) {
    Array.prototype.forEach.call(kok.querySelectorAll("[data-yildiz]"), function (b) {
      b.addEventListener("click", function () {
        var eklendi = yildizDegistir(b.getAttribute("data-yildiz"));
        b.setAttribute("aria-pressed", eklendi ? "true" : "false");
        b.setAttribute("aria-label", eklendi ? "Repertuvardan çıkar" : "Repertuvara ekle");
        bildir(eklendi ? "Repertuvarına eklendi" : "Repertuvardan çıkarıldı");
        if (sonra) sonra();
      });
    });
  }

  function listeSayfasi() {
    var tumu = tumTurkuler();
    var yoreler = {};
    tumu.forEach(function (t) { if (t.yore) yoreler[t.yore] = 1; });
    var turSec = [["hepsi", "Tümü"], ["deyis", "Deyiş ve nefes"], ["turku", "Türkü"], ["ozgun", "Özgün"], ["ku", "Kurmancî"], ["zz", "Zazaca"], ["kendi", "Eklediklerim"]];
    sayfa.innerHTML =
      '<h1>Türküler</h1><p class="alt-baslik">' + tumu.length + ' kayıt. Yıldızladıkların Repertuvarım sekmesinde toplanır.</p>' +
      '<input class="arama" type="search" id="ara" placeholder="Türkü, dize, ozan ya da sanatçı ara" autocomplete="off" value="' + kacis(listeDurumu.ara) + '">' +
      '<div class="cipler" role="group" aria-label="Tür">' + turSec.map(function (x) {
        return '<button class="cip" data-tur="' + x[0] + '" aria-pressed="' + (listeDurumu.tur === x[0]) + '">' + x[1] + "</button>";
      }).join("") + "</div>" +
      '<div class="cipler" role="group" aria-label="Yöre"><button class="cip" data-yore="" aria-pressed="' + (!listeDurumu.yore) + '">Tüm yöreler</button>' +
      Object.keys(yoreler).sort(function (a, b) { return a.localeCompare(b, "tr"); }).map(function (y) {
        return '<button class="cip" data-yore="' + kacis(y) + '" aria-pressed="' + (listeDurumu.yore === y) + '">' + kacis(y) + "</button>";
      }).join("") + "</div>" +
      '<div id="sonuc"></div>' +
      '<p class="dugme-serit"><a class="dugme" href="#/ekle">+ Kendi türkünü ekle</a></p>';

    var sonuc = document.getElementById("sonuc");
    function ciz() {
      var q = sadelestir(listeDurumu.ara);
      var liste = tumu.filter(function (t) {
        var d = listeDurumu.tur;
        if (d === "kendi" && !t.kendi) return false;
        if ((d === "deyis" || d === "turku" || d === "ozgun") && t.tur !== d) return false;
        if ((d === "ku" || d === "zz") && t.dil !== d) return false;
        if (listeDurumu.yore && t.yore !== listeDurumu.yore) return false;
        return !q || aramaMetni(t).indexOf(q) >= 0;
      }).sort(siralaAd);
      if (!liste.length) { sonuc.innerHTML = '<p class="bos">Aradığın türkü bulunamadı. İstersen sözlerini kendin ekleyebilirsin.</p>'; return; }
      var html = "", harf = null, harfler = [];
      liste.forEach(function (t) {
        var h = ilkHarf(t.ad);
        if (h !== harf) { if (harf !== null) html += "</ul>"; harf = h; harfler.push(h); html += '<div class="harf" id="harf-' + kacis(h) + '">' + kacis(h) + '</div><ul class="liste">'; }
        html += satirHtml(t);
      });
      html += "</ul>";
      var serit = liste.length > 25 ? '<nav class="harf-serit" aria-label="Harfler">' + harfler.map(function (h) { return '<a href="javascript:void(0)" data-git="' + kacis(h) + '">' + kacis(h) + "</a>"; }).join("") + "</nav>" : "";
      sonuc.innerHTML = serit + html;
      yildizBagla(sonuc);
      Array.prototype.forEach.call(sonuc.querySelectorAll("[data-git]"), function (a) {
        a.addEventListener("click", function () { var el = document.getElementById("harf-" + a.getAttribute("data-git")); if (el) el.scrollIntoView({ behavior: "smooth" }); });
      });
    }
    document.getElementById("ara").addEventListener("input", function (e) { listeDurumu.ara = e.target.value; ciz(); });
    Array.prototype.forEach.call(sayfa.querySelectorAll("[data-tur]"), function (b) {
      b.addEventListener("click", function () {
        listeDurumu.tur = b.getAttribute("data-tur");
        Array.prototype.forEach.call(sayfa.querySelectorAll("[data-tur]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        ciz();
      });
    });
    Array.prototype.forEach.call(sayfa.querySelectorAll("[data-yore]"), function (b) {
      b.addEventListener("click", function () {
        listeDurumu.yore = b.getAttribute("data-yore");
        Array.prototype.forEach.call(sayfa.querySelectorAll("[data-yore]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        ciz();
      });
    });
    ciz();
  }

  /* ---------- Türkü sayfası ---------- */
  function turkuSayfasi(id, parametre) {
    var t = turkuBul(id);
    if (!t) { sayfa.innerHTML = '<p class="bos">Bu türkü bulunamadı.</p><p><a href="#/">Listeye dön</a></p>'; return; }
    var repertuvardan = parametre.indexOf("r=1") >= 0;
    var y = yildizliMi(t.id);
    var sozHtml;
    if (t.soz && t.soz.length) {
      sozHtml = '<div class="soz">' + t.soz.map(function (k) { return "<p>" + kacis(k) + "</p>"; }).join("") + "</div>";
    } else {
      sozHtml = '<div class="kart not">' + kacis(t.not || "Bu kaydın sözleri uygulamada yer almıyor. Aşağıdaki bağlantıdan dinleyebilir, sözlere videonun açıklamasından bakabilirsin.") +
        ' Sözleri kendin eklemek istersen <a href="#/ekle/' + encodeURIComponent(t.id) + '">buraya dokun</a>. Eklediğin metin yalnızca bu cihazda kalır.</div>';
    }
    var kunye = [];
    if (t.sair) kunye.push("Söz: " + kacis(t.sair));
    if (t.yore) kunye.push("Yöre: " + kacis(t.yore));
    if (t.tur) kunye.push(kacis(TURLER[t.tur] || t.tur));
    if (t.dil && t.dil !== "tr") kunye.push(kacis(DILLER[t.dil] || t.dil));
    var kaynakHtml = t.kaynak ? '<p class="kunye">Metnin kaynağı: ' + (t.kaynak.url ? '<a href="' + kacis(t.kaynak.url) + '" target="_blank" rel="noopener">' + kacis(t.kaynak.ad) + "</a>" : kacis(t.kaynak.ad)) + (t.kaynak.not ? ". " + kacis(t.kaynak.not) : "") + "</p>" : "";
    var dinle = (t.dinle || []).filter(function (d) { return d.yt; });
    var dinleHtml = dinle.length ? '<h2>Dinle</h2><ul class="dinle-liste">' + dinle.map(function (d) {
      return '<li><a href="https://www.youtube.com/watch?v=' + kacis(d.yt) + '" target="_blank" rel="noopener"><span class="oynat"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg></span><span><strong>' + kacis(d.kim || "YouTube") + "</strong><small>" + kacis(d.baslik || "YouTube'da aç") + "</small></span></a></li>";
    }).join("") + "</ul>" : "";

    var gezinti = "";
    if (repertuvardan) {
      var r = yildizlar().filter(function (x) { return turkuBul(x); }), i = r.indexOf(t.id);
      if (i >= 0 && r.length > 1) {
        var onceki = r[(i - 1 + r.length) % r.length], sonraki = r[(i + 1) % r.length];
        gezinti = '<div class="dugme-serit"><a class="dugme" href="#/t/' + encodeURIComponent(onceki) + '?r=1">‹ Önceki</a><span class="not" style="align-self:center">' + (i + 1) + " / " + r.length + '</span><a class="dugme" href="#/t/' + encodeURIComponent(sonraki) + '?r=1">Sonraki ›</a></div>';
      }
    }

    var notlar = oku("turku-not-" + t.id, "");
    sayfa.innerHTML =
      '<a class="geri" href="' + (repertuvardan ? "#/repertuvar" : "#/") + '">‹ ' + (repertuvardan ? "Repertuvarım" : "Türküler") + "</a>" +
      '<div class="soz-ust"><h1>' + kacis(t.ad) + '</h1><button class="yildiz-dugme" data-yildiz="' + kacis(t.id) + '" aria-pressed="' + y + '" aria-label="' + (y ? "Repertuvardan çıkar" : "Repertuvara ekle") + '">' + YILDIZ_SVG + "</button></div>" +
      '<p class="kunye">' + kunye.join(" · ") + "</p>" +
      '<div class="arac-cubugu">' +
      '<button class="dugme" id="kucult" aria-label="Yazıyı küçült">A−</button>' +
      '<button class="dugme" id="buyut" aria-label="Yazıyı büyüt">A+</button>' +
      '<button class="dugme uyanik" id="uyanik" aria-pressed="false"><span>Ekranı açık tut</span></button>' +
      '<span class="ayrac"></span>' +
      '<button class="dugme" id="okuma" aria-pressed="false">Tam ekran</button>' +
      "</div>" +
      sozHtml + kaynakHtml + gezinti + dinleHtml +
      '<h2>Notlarım</h2><textarea id="notlar" placeholder="Akor, düzen, karar perdesi ya da kendi notların. Yalnızca bu cihazda saklanır.">' + kacis(notlar) + "</textarea>" +
      (t.kendi ? '<div class="dugme-serit"><a class="dugme" href="#/ekle/' + encodeURIComponent(t.id) + '">Düzenle</a><button class="dugme tehlike" id="sil">Sil</button></div>' : "");

    yildizBagla(sayfa);
    document.getElementById("kucult").addEventListener("click", function () { yaz("turku-punto", Math.max(14, punto() - 2)); puntoUygula(); });
    document.getElementById("buyut").addEventListener("click", function () { yaz("turku-punto", Math.min(44, punto() + 2)); puntoUygula(); });
    var uyanik = document.getElementById("uyanik");
    uyanik.addEventListener("click", function () {
      if (kilit) { kilitBirak(); yaz("turku-uyanik", false); uyanikDugmeGuncelle(); bildir("Ekran normal süresinde kapanır"); }
      else {
        yaz("turku-uyanik", true);
        kilitAl().then(function (ok) { uyanikDugmeGuncelle(); bildir(ok ? "Bu sayfa açıkken ekran kapanmaz" : "Bu tarayıcı ekranı açık tutmayı desteklemiyor"); });
      }
    });
    if (uyanikTercih()) kilitAl().then(uyanikDugmeGuncelle);
    var okuma = document.getElementById("okuma");
    okuma.addEventListener("click", function () {
      var acik = document.body.classList.toggle("okuma");
      okuma.setAttribute("aria-pressed", acik ? "true" : "false");
      okuma.textContent = acik ? "Menüleri göster" : "Tam ekran";
    });
    var notAlan = document.getElementById("notlar"), notZaman;
    notAlan.addEventListener("input", function () {
      clearTimeout(notZaman);
      notZaman = setTimeout(function () {
        if (notAlan.value.trim()) yaz("turku-not-" + t.id, notAlan.value); else { try { localStorage.removeItem("turku-not-" + t.id); } catch (e) {} }
      }, 400);
    });
    var sil = document.getElementById("sil");
    if (sil) sil.addEventListener("click", function () {
      if (!confirm("“" + t.ad + "” silinsin mi?")) return;
      yaz("turku-kendi", kendiTurkuler().filter(function (x) { return x.id !== t.id; }));
      yaz("turku-yildiz", yildizlar().filter(function (x) { return x !== t.id; }));
      location.hash = "#/";
    });
  }

  /* ---------- Sanatçılar ---------- */
  function kisiler() {
    var ses = {}, soz = {};
    tumTurkuler().forEach(function (t) {
      seslendirenler(t).forEach(function (k) { ses[k] = (ses[k] || 0) + 1; });
      if (t.sair) soz[t.sair] = (soz[t.sair] || 0) + 1;
    });
    return { ses: ses, soz: soz };
  }
  function sanatcilarSayfasi() {
    var k = kisiler();
    function blok(nesne) {
      var adlar = Object.keys(nesne).sort(function (a, b) { return a.localeCompare(b, "tr"); });
      if (!adlar.length) return '<p class="bos">Henüz kayıt yok.</p>';
      return '<ul class="liste">' + adlar.map(function (a) {
        return '<li class="satir"><a href="#/kisi/' + encodeURIComponent(a) + '"><span class="ad">' + kacis(a) + '</span><span class="bilgi">' + nesne[a] + " kayıt</span></a></li>";
      }).join("") + "</ul>";
    }
    sayfa.innerHTML = "<h1>Sanatçılar</h1><p class=\"alt-baslik\">Seslendirenler ve sözlerin sahibi ozanlar.</p>" +
      "<h2>Seslendirenler</h2>" + blok(k.ses) + "<h2>Ozanlar ve söz yazarları</h2>" + blok(k.soz);
  }
  function kisiSayfasi(ad) {
    var liste = tumTurkuler().filter(function (t) { return t.sair === ad || seslendirenler(t).indexOf(ad) >= 0; }).sort(siralaAd);
    sayfa.innerHTML = '<a class="geri" href="#/sanatcilar">‹ Sanatçılar</a><h1>' + kacis(ad) + '</h1><p class="alt-baslik">' + liste.length + " kayıt</p>" +
      (liste.length ? '<ul class="liste">' + liste.map(function (t) { return satirHtml(t); }).join("") + "</ul>" : '<p class="bos">Kayıt bulunamadı.</p>');
    yildizBagla(sayfa);
  }

  /* ---------- Repertuvar ---------- */
  function repertuvarSayfasi() {
    var r = yildizlar().map(turkuBul).filter(Boolean);
    function ciz() {
      r = yildizlar().map(turkuBul).filter(Boolean);
      sayfa.innerHTML = "<h1>Repertuvarım</h1><p class=\"alt-baslik\">Çalmak istediğin parçalar burada eklediğin sırayla durur. Bir parçayı açtığında Önceki ve Sonraki düğmeleriyle repertuvarın içinde gezinebilirsin.</p>" +
        (r.length ? '<ul class="liste">' + r.map(function (t, i) {
          return satirHtml(t, "?r=1").replace('<button class="yildiz-dugme"', '<button class="yildiz-dugme" data-yukari="' + i + '" aria-label="Yukarı taşı" title="Yukarı taşı" style="width:36px"' + (i === 0 ? " disabled" : "") + '>↑</button><button class="yildiz-dugme"');
        }).join("") + "</ul>" : '<p class="bos">Henüz yıldızladığın bir türkü yok. Listede bir türkünün yanındaki yıldıza dokunduğunda burada görünür.</p>') +
        '<h2>Yedekleme</h2><p class="not">Repertuvarın, notların ve eklediğin türküler bu cihazda saklanır. Telefon değiştirirken yedek dosyası alıp yeni cihazda geri yükleyebilirsin.</p>' +
        '<div class="dugme-serit"><button class="dugme" id="yedekAl">Yedek dosyası indir</button><label class="dugme" style="margin:0;font-weight:400">Yedeği geri yükle<input type="file" id="yedekYukle" accept="application/json,.json" hidden></label></div>';
      yildizBagla(sayfa, ciz);
      Array.prototype.forEach.call(sayfa.querySelectorAll("[data-yukari]"), function (b) {
        b.addEventListener("click", function () {
          var i = +b.getAttribute("data-yukari"), y = yildizlar().filter(function (x) { return turkuBul(x); });
          if (i > 0) { var g = y[i - 1]; y[i - 1] = y[i]; y[i] = g; yaz("turku-yildiz", y); ciz(); }
        });
      });
      document.getElementById("yedekAl").addEventListener("click", yedekAl);
      document.getElementById("yedekYukle").addEventListener("change", yedekYukle);
    }
    ciz();
  }
  function yedekAl() {
    var veri = { uygulama: "turku-defteri", surum: 1, tarih: new Date().toISOString(), yildiz: yildizlar(), kendi: kendiTurkuler(), notlar: {} };
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("turku-not-") === 0) veri.notlar[k.slice(10)] = oku(k, "");
      }
    } catch (e) {}
    var blob = new Blob([JSON.stringify(veri, null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "turku-defteri-yedek.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function yedekYukle(e) {
    var dosya = e.target.files && e.target.files[0];
    if (!dosya) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var v = JSON.parse(r.result);
        if (v.uygulama !== "turku-defteri") throw new Error("tur");
        var kendi = kendiTurkuler(), varOlan = {};
        kendi.forEach(function (t) { varOlan[t.id] = 1; });
        (v.kendi || []).forEach(function (t) { if (t && t.id && !varOlan[t.id]) kendi.push(t); });
        yaz("turku-kendi", kendi);
        var y = yildizlar();
        (v.yildiz || []).forEach(function (id) { if (y.indexOf(id) < 0) y.push(id); });
        yaz("turku-yildiz", y);
        Object.keys(v.notlar || {}).forEach(function (id) { yaz("turku-not-" + id, v.notlar[id]); });
        bildir("Yedek geri yüklendi");
        repertuvarSayfasi();
      } catch (err) { bildir("Bu dosya okunamadı"); }
    };
    r.readAsText(dosya);
  }

  /* ---------- Kendi türkünü ekle ---------- */
  function ekleSayfasi(id) {
    var eski = id ? turkuBul(id) : null;
    var duzenle = eski && eski.kendi;
    var t = eski || {};
    var ytMetin = (t.dinle || []).map(function (d) { return "https://www.youtube.com/watch?v=" + d.yt; }).join("\n");
    sayfa.innerHTML = '<a class="geri" href="' + (eski ? "#/t/" + encodeURIComponent(eski.id) : "#/") + '">‹ Geri</a>' +
      "<h1>" + (duzenle ? "Türküyü düzenle" : "Kendi türkünü ekle") + "</h1>" +
      '<p class="alt-baslik">Eklediğin türkü yalnızca bu cihazda saklanır, kimseyle paylaşılmaz.' + (eski && !duzenle ? " Bu kayıt uygulamadaki türkünün kişisel bir kopyası olarak kaydedilir." : "") + "</p>" +
      '<form id="form">' +
      '<label for="f-ad">Türkünün adı</label><input class="girdi" id="f-ad" required value="' + kacis(t.ad) + '">' +
      '<label for="f-kim">Seslendiren</label><input class="girdi" id="f-kim" placeholder="Örneğin Erdal Erzincan" value="' + kacis(seslendirenler(t).join(", ")) + '">' +
      '<label for="f-sair">Söz</label><input class="girdi" id="f-sair" placeholder="Ozan ya da söz yazarı" value="' + kacis(t.sair) + '">' +
      '<label for="f-yore">Yöre</label><input class="girdi" id="f-yore" value="' + kacis(t.yore) + '">' +
      '<label for="f-tur">Tür</label><select id="f-tur">' + Object.keys(TURLER).map(function (k) { return '<option value="' + k + '"' + (t.tur === k ? " selected" : "") + ">" + TURLER[k] + "</option>"; }).join("") + "</select>" +
      '<label for="f-dil">Dil</label><select id="f-dil">' + Object.keys(DILLER).map(function (k) { return '<option value="' + k + '"' + ((t.dil || "tr") === k ? " selected" : "") + ">" + DILLER[k] + "</option>"; }).join("") + "</select>" +
      '<label for="f-soz">Sözler</label><textarea id="f-soz" style="min-height:240px" placeholder="Kıtaların arasında bir boş satır bırak.">' + kacis((t.soz || []).join("\n\n")) + "</textarea>" +
      '<label for="f-yt">YouTube bağlantıları</label><textarea id="f-yt" style="min-height:70px" placeholder="Her satıra bir bağlantı">' + kacis(ytMetin) + "</textarea>" +
      '<div class="dugme-serit"><button class="dugme ana" type="submit">Kaydet</button></div></form>';
    document.getElementById("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var deger = function (k) { return document.getElementById(k).value.trim(); };
      var kimler = deger("f-kim").split(/\s*,\s*/).filter(Boolean);
      var linkler = deger("f-yt").split(/\s+/).map(ytKimlik).filter(Boolean);
      var dinle = linkler.map(function (yt, i) { return { kim: kimler[i] || kimler[0] || "", yt: yt }; });
      if (!dinle.length && kimler.length) dinle = kimler.map(function (k) { return { kim: k }; });
      var yeni = {
        id: duzenle ? eski.id : "k-" + Date.now().toString(36),
        ad: deger("f-ad"), sair: deger("f-sair"), yore: deger("f-yore"),
        tur: deger("f-tur"), dil: deger("f-dil"),
        soz: deger("f-soz").replace(/\r/g, "").split(/\n\s*\n/).map(function (k) { return k.trim(); }).filter(Boolean),
        dinle: dinle
      };
      if (!yeni.ad) return;
      var liste = kendiTurkuler().filter(function (x) { return x.id !== yeni.id; });
      liste.push(yeni);
      yaz("turku-kendi", liste);
      if (eski && !duzenle && yildizliMi(eski.id) && !yildizliMi(yeni.id)) yildizDegistir(yeni.id);
      bildir("Kaydedildi");
      location.hash = "#/t/" + encodeURIComponent(yeni.id);
    });
  }

  /* ---------- Akort ---------- */
  function akortSayfasi() {
    var duzenAd = oku("turku-duzen", DUZENLER[0].ad);
    var duzen = DUZENLER.filter(function (d) { return d.ad === duzenAd; })[0] || DUZENLER[0];
    var la = oku("turku-la", 440);
    var secili = oku("turku-tel", "alt");
    sayfa.innerHTML = "<h1>Bağlama akort</h1><p class=\"alt-baslik\">Düzeni ve teli seç, “Dinlemeye başla” düğmesine dokun ve teli tek başına çal. Mikrofon sesi yalnızca bu cihazda işlenir, kaydedilmez.</p>" +
      '<label for="duzen">Düzen</label><select id="duzen">' + DUZENLER.map(function (d) { return '<option' + (d.ad === duzen.ad ? " selected" : "") + ">" + kacis(d.ad) + "</option>"; }).join("") + "</select>" +
      '<div class="teller" id="teller"></div>' +
      '<div class="kart akort-ekran"><div class="akort-nota" id="nota">–</div><div class="akort-hz" id="hz">&nbsp;</div>' +
      '<div class="olcek" aria-hidden="true"><div class="ibre" id="ibre"></div></div><div class="akort-durum" id="durum" aria-live="polite">Hedef: ' + kacis(duzen[secili]) + "</div></div>" +
      '<div class="dugme-serit"><button class="dugme ana" id="dinle">Dinlemeye başla</button><button class="dugme" id="cal">Hedef sesi çal</button></div>' +
      '<label for="la">La frekansı (Hz)</label><input class="girdi" id="la" type="number" min="400" max="480" step="1" value="' + la + '">' +
      '<p class="not">Bağlamayı kendi sesine ya da birlikte çaldığın çalgıya göre bir iki perde yukarı ya da aşağı akort edebilirsin. Alet hangi oktavda çaldığına bakmadan seçtiğin notaya olan uzaklığı gösterir.</p>' +
      "<h2>Düzenler</h2><table class=\"duzen\"><thead><tr><th>Düzen</th><th>Üst</th><th>Orta</th><th>Alt</th><th>Karar</th></tr></thead><tbody>" +
      DUZENLER.map(function (d) { return "<tr><td>" + kacis(d.ad) + "</td><td>" + d.ust + "</td><td>" + d.orta + "</td><td>" + d.alt + "</td><td>" + d.karar + "</td></tr>"; }).join("") +
      '</tbody></table><p class="kunye">Kaynak: <a href="' + DUZEN_KAYNAK.url + '" target="_blank" rel="noopener">' + kacis(DUZEN_KAYNAK.metin) + "</a> Tablo 3. Düzenlerin yazımı kaynaklara ve yörelere göre değişebilir.</p>";

    function telleriCiz() {
      document.getElementById("teller").innerHTML = ["ust", "orta", "alt"].map(function (k) {
        return '<button class="tel" data-tel="' + k + '" aria-pressed="' + (k === secili) + '"><small>' + { ust: "Üst tel", orta: "Orta tel", alt: "Alt tel" }[k] + "</small><strong>" + duzen[k] + "</strong></button>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll("[data-tel]"), function (b) {
        b.addEventListener("click", function () { secili = b.getAttribute("data-tel"); yaz("turku-tel", secili); telleriCiz(); document.getElementById("durum").textContent = "Hedef: " + duzen[secili]; document.getElementById("durum").className = "akort-durum"; });
      });
    }
    telleriCiz();
    document.getElementById("duzen").addEventListener("change", function (e) {
      duzen = DUZENLER.filter(function (d) { return d.ad === e.target.value; })[0];
      yaz("turku-duzen", duzen.ad); telleriCiz();
      document.getElementById("durum").textContent = "Hedef: " + duzen[secili];
    });
    document.getElementById("la").addEventListener("change", function (e) {
      var v = Math.min(480, Math.max(400, +e.target.value || 440)); e.target.value = v; la = v; yaz("turku-la", v);
    });
    document.getElementById("cal").addEventListener("click", function () {
      var nota = duzen[secili], idx = Akort.NOTALAR.indexOf(nota);
      Akort.sesCal(nota, la, idx >= Akort.NOTALAR.indexOf("La") ? 3 : 4);
    });
    var dinleDugme = document.getElementById("dinle");
    dinleDugme.addEventListener("click", function () {
      if (Akort.calisiyor()) { Akort.durdur(); dinleDugme.textContent = "Dinlemeye başla"; kilitBirak(); return; }
      Akort.baslat(function (hz) {
        var notaEl = document.getElementById("nota");
        if (!notaEl) return;
        var ibre = document.getElementById("ibre"), durum = document.getElementById("durum");
        if (hz <= 0) { return; }
        var n = Akort.notaBul(hz, la), sapma = Akort.hedefSapma(hz, la, duzen[secili]);
        notaEl.textContent = n.ad;
        document.getElementById("hz").textContent = hz.toFixed(1) + " Hz · " + (n.sent > 0 ? "+" : "") + n.sent + " sent";
        var oran = Math.max(-50, Math.min(50, sapma));
        ibre.style.left = (50 + oran) + "%";
        if (Math.abs(sapma) <= 5) { durum.textContent = duzen[secili] + " tamam"; durum.className = "akort-durum tamam"; }
        else if (Math.abs(sapma) > 300) { durum.textContent = "Hedef " + duzen[secili] + ", çalınan " + n.ad; durum.className = "akort-durum"; }
        else { durum.textContent = sapma < 0 ? "Biraz sık (" + sapma + " sent)" : "Biraz gevşet (+" + sapma + " sent)"; durum.className = "akort-durum"; }
      }).then(function () { dinleDugme.textContent = "Dinlemeyi durdur"; kilitAl(); })
        .catch(function () { bildir("Mikrofona erişilemedi. Tarayıcı izinlerini kontrol et."); });
    });
  }

  /* ---------- Hakkında ---------- */
  function hakkindaSayfasi() {
    var tema = oku("turku-tema", "sistem");
    var hazir = window.TURKULER || [];
    var sozlu = hazir.filter(function (t) { return t.soz && t.soz.length; }).length;
    sayfa.innerHTML = "<h1>Türkü Defteri</h1><p class=\"alt-baslik\">Sürüm " + SURUM + " · Geliştiren: Ali Eren Demir</p>" +
      '<div class="kart"><p>Deyiş, nefes ve türkü sözlerini sakin bir sayfada okumak, çalarken ekranı açık tutmak ve sevdiğin parçaları kendi repertuvarında toplamak için hazırlanmış küçük bir defter.</p>' +
      "<p>Uygulamada " + hazir.length + " kayıt var, bunların " + sozlu + " tanesinin sözleri uygulamanın içinde. Liste düzenli olarak güncellenir. İnternete bağlandığında yeni türküler kendiliğinden gelir.</p></div>" +
      "<h2>Sözler ve kaynaklar</h2>" +
      '<div class="kart not"><p>Uygulamadaki sözler telifi serbest kalmış anonim türkülerden ve yüzyıllar önce yaşamış ozanların deyişlerinden oluşur. Her metnin altında alındığı kaynak yazılıdır. Çoğu metin <a href="https://tr.wikisource.org" target="_blank" rel="noopener">Vikikaynak</a> derlemesinden alınmıştır ve seslendirenlerin söyleyişinden bazı dizelerde ayrılabilir.</p>' +
      "<p>Günümüz sanatçılarının özgün eserlerinin sözleri telif hakkıyla korunduğu için uygulamada yer almaz. Bu eserler için YouTube bağlantısı verilir. Sözlerini videonun açıklamasından okuyup kendi cihazına ekleyebilirsin.</p>" +
      "<p>YouTube bağlantıları ilgili videoları YouTube'da açar. Uygulama video oynatmaz, reklam göstermez.</p></div>" +
      "<h2>Görünüm</h2>" +
      '<div class="cipler" role="group" aria-label="Tema">' + [["sistem", "Cihaza göre"], ["acik", "Açık"], ["koyu", "Koyu"]].map(function (x) {
        return '<button class="cip" data-tema="' + x[0] + '" aria-pressed="' + (tema === x[0]) + '">' + x[1] + "</button>";
      }).join("") + "</div>" +
      "<h2>Gizlilik</h2><div class=\"kart not\"><p>Uygulama hiçbir kişisel veri toplamaz, hesap istemez ve reklam içermez. Repertuvarın, notların ve eklediğin türküler yalnızca bu cihazın tarayıcı belleğinde durur. Akort aleti mikrofon sesini cihazın içinde işler, hiçbir yere göndermez.</p></div>" +
      '<p class="not">Aynı geliştiricinin diğer uygulaması: <a href="https://alierendemir.github.io/sosyoloji/" target="_blank" rel="noopener">Sosyoloji Cebimde</a></p>';
    Array.prototype.forEach.call(sayfa.querySelectorAll("[data-tema]"), function (b) {
      b.addEventListener("click", function () {
        yaz("turku-tema", b.getAttribute("data-tema")); temaUygula();
        Array.prototype.forEach.call(sayfa.querySelectorAll("[data-tema]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
  }

  yonlendir();
})();
