# Türkü Defteri veri araçları

`data/turkuler.js` dosyası bu betiklerle üretilir. Betikler bu klasörün içinden, sırasıyla çalıştırılır:

1. `python3 liste.py` · Vikikaynak'tan yöre türküleri ve ozan sayfalarının listesini alır.
2. `python3 harvest2.py` · Sayfaların wikitext içeriğini 50'şerli gruplar hâlinde indirir.
3. `python3 harvest4.py` · Pir Sultan Abdal ve Virani sayfalarını, "Bektaşi Şairleri ve Nefesleri" bölümlerini ve bu sayfaların aktardığı `Sayfa:` içeriklerini indirir.
4. `python3 donustur.py` · Metinleri temizler, telif durumunu kontrol eder ve `kayit.json` dosyasını yazar.
5. `python3 yaz.py` · `../data/turkuler.js` dosyasını üretir.

Kurallar:
- Yalnızca anonim türküler ile ölümünün üzerinden 70 yıldan fazla geçmiş ozanların metinleri alınır. `donustur.py` içindeki `YASAK` listesi telifli şairleri dışarıda bırakır.
- `linkler.py` Vikikaynak başlığına YouTube kaydı eşler. Aynı ada sahip birden çok sayfa varsa bağlantı eklenmez.
- `baglanti.py` sözleri telifli olan özgün eserleri ve Kurmancî, Kirmanckî kayıtları yalnızca YouTube bağlantısıyla listeler.
- Vikikaynak sık istekte 429 hatası döndürür. Betikler bekleyip yeniden dener.
- `ws/` ve `kayit.json` ara dosyadır, depoya eklenmez.
