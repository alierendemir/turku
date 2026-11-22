/* Bağlama akort aleti. Mikrofondan gelen sesin perdesini otokorelasyonla bulur.
   Ses cihazdan dışarı çıkmaz, hiçbir yere kaydedilmez. */
var Akort = (function () {
  var NOTALAR = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
  var ctx = null, akis = null, analiz = null, tampon = null, dongu = null, dinleyici = null;

  function notaIndeksi(ad) { return NOTALAR.indexOf(ad); }

  /* Frekansı en yakın notaya çevirir. la: La sesinin frekansı (varsayılan 440). */
  function notaBul(hz, la) {
    var yariton = 12 * Math.log2(hz / la) + 69; // MIDI numarası
    var yakin = Math.round(yariton);
    return { ad: NOTALAR[((yakin % 12) + 12) % 12], oktav: Math.floor(yakin / 12) - 1, sent: Math.round((yariton - yakin) * 100), midi: yariton };
  }

  /* Hedef notaya göre oktavdan bağımsız sapma (sent, -600 ile 600 arası). */
  function hedefSapma(hz, la, hedefAd) {
    var midi = 12 * Math.log2(hz / la) + 69;
    var fark = (midi - notaIndeksi(hedefAd)) * 100;
    fark = ((fark % 1200) + 1200) % 1200;
    if (fark > 600) fark -= 1200;
    return Math.round(fark);
  }

  function perdeBul(veri, ornekleme) {
    var n = veri.length, rms = 0, i;
    for (i = 0; i < n; i++) rms += veri[i] * veri[i];
    rms = Math.sqrt(rms / n);
    if (rms < 0.008) return -1;
    var enKucuk = Math.floor(ornekleme / 1000), enBuyuk = Math.floor(ornekleme / 60);
    var enIyi = -1, enIyiDeger = 0, oncekiDeger = 1, buldu = false;
    var r = new Float32Array(enBuyuk + 2);
    for (var gecikme = enKucuk; gecikme <= enBuyuk; gecikme++) {
      var toplam = 0, enerji = 0;
      for (i = 0; i < n - gecikme; i++) { toplam += veri[i] * veri[i + gecikme]; enerji += veri[i] * veri[i] + veri[i + gecikme] * veri[i + gecikme]; }
      var deger = enerji ? (2 * toplam / enerji) : 0;
      r[gecikme] = deger;
      if (deger > 0.88 && deger > oncekiDeger) {
        buldu = true;
        if (deger > enIyiDeger) { enIyiDeger = deger; enIyi = gecikme; }
      } else if (buldu) { break; }
      oncekiDeger = deger;
    }
    if (enIyi < 0) return -1;
    var a = r[enIyi - 1] || 0, b = r[enIyi], c = r[enIyi + 1] || 0;
    var kayma = (a - c) / (2 * (a - 2 * b + c) || 1);
    if (!isFinite(kayma) || Math.abs(kayma) > 1) kayma = 0;
    return ornekleme / (enIyi + kayma);
  }

  function baslat(geriCagir) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error("destek"));
    dinleyici = geriCagir;
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (s) {
      akis = s;
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      var kaynak = ctx.createMediaStreamSource(s);
      analiz = ctx.createAnalyser();
      analiz.fftSize = 2048;
      kaynak.connect(analiz);
      tampon = new Float32Array(analiz.fftSize);
      var gecmis = [];
      dongu = setInterval(function adim() {
        analiz.getFloatTimeDomainData(tampon);
        var hz = perdeBul(tampon, ctx.sampleRate);
        if (hz > 0) { gecmis.push(hz); if (gecmis.length > 5) gecmis.shift(); }
        else if (gecmis.length) gecmis.shift();
        var orta = -1;
        if (gecmis.length >= 3) { var k = gecmis.slice().sort(function (x, y) { return x - y; }); orta = k[Math.floor(k.length / 2)]; }
        if (dinleyici) dinleyici(orta);
      }, 60);
    });
  }

  function durdur() {
    if (dongu) clearInterval(dongu);
    dongu = null; dinleyici = null;
    if (akis) akis.getTracks().forEach(function (t) { t.stop(); });
    akis = null;
  }

  function calisiyor() { return !!akis; }

  /* Seçilen notayı referans ses olarak çalar. */
  function sesCal(ad, la, oktav) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    var midi = (oktav + 1) * 12 + notaIndeksi(ad);
    var hz = la * Math.pow(2, (midi - 69) / 12);
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = "triangle"; o.frequency.value = hz;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 2.3);
  }

  return { notaBul: notaBul, hedefSapma: hedefSapma, baslat: baslat, durdur: durdur, calisiyor: calisiyor, sesCal: sesCal, NOTALAR: NOTALAR, perdeBul: perdeBul };
})();
