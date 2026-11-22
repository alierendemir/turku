# Türkü Defteri · Claude için çalışma talimatı

Bu depo Ali Eren Demir'in "Türkü Defteri" uygulamasıdır. Sosyoloji Cebimde (alierendemir/sosyoloji) ile bağlantısı yoktur, ayrı tutulur.

## Uygulama
- `app/` klasöründe derleme gerektirmeyen bir PWA. Yayın adresi: https://alierendemir.github.io/turku/ . `main` dalına giren her `app/` değişikliği `.github/workflows/pages.yml` ile yayınlanır.
- Dosyalar: `app/app.js` (sayfalar, repertuvar, ekranı açık tutma), `app/akort.js` (mikrofonlu bağlama akort aleti), `app/kurulum.js` (İndir penceresi), `app/data/turkuler.js` (türküler), `app/data/duzenler.js` (Kaya 2021, Tablo 3), `app/sw.js` (önbellek, `SURUM` "turku-defteri-" ile başlar).
- Eski adres `alierendemir.github.io/sosyoloji/turku/` bu adrese yönlendirir. Aynı köken olduğu için repertuvar, notlar ve eklenen türküler (localStorage) yeni adreste de görünür.

## Güncelleme
- Haftalık zamanlanmış görev yoktur. Ali Eren Demir istediğinde güncellenir.
- Güncellemeden sonra `app/sw.js` içindeki `SURUM` ve `app/app.js` içindeki `SURUM` değerini artır. PR aç ve testler geçince birleştir (`merge_pull_request`, tam 40 karakterlik head SHA ile).
- Test: `app/` içinde `python3 -m http.server` başlat, Playwright ile telefon boyutunda liste, arama, türkü, sanatçılar, repertuvar, akort ve İndir penceresini aç. Konsol hatası ve yatay taşma ara. İndir penceresini kapatmak için `localStorage` içine `turku-indir-ertele` yaz.

## Veri kuralları (çok önemli)
- Sözler yalnızca Vikikaynak'taki anonim türküler ve ölümünün üzerinden 70 yıldan fazla geçmiş ozanların metinlerinden alınır. Söz uydurma, telifli söz yazma.
- Günümüz sanatçılarının özgün eserleri, Kurmancî ve Kirmanckî kayıtlar yalnızca YouTube bağlantısıyla girer (`araclar/baglanti.py`).
- YouTube video kimliği yalnızca web aramasında görülen gerçek adresten alınır. Başlıkta sanatçının adı geçmiyorsa kullanılmaz. Aynı adlı birden çok sayfa varsa eşleme yapılmaz (`araclar/linkler.py`).
- Dilini kaynaktan doğrulamadığın kayda dil etiketi koyma.
- Veri üretimi: `araclar/BENIOKU.md`. Ortamda `tr.wikisource.org` erişime açık olmalı.

## Yazım kuralları (kullanıcının kesin tercihleri)
- Noktalı virgül kullanma.
- "sadece/yalnızca ... değil, aynı zamanda" kalıbını hiç kullanma.
- Önce olumsuz sonra olumlu söyleyen "X değil, Y" yapısını kullanma.
- "-ken" ekiyle birlikte gereksiz "aynı zamanda" kullanma.
- Her yere virgül koyma, mekanik cümle kurma.
- Keskin ve kategorik ifadeler yerine ölçülü ve anlaşılır bir dil kullan. Kelime tekrarından kaçın.
- Kullanıcıyla Türkçe konuş.
