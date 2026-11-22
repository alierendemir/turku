import json
k=json.load(open('kayit.json'))
for x in k:
    for a in ('sair','yore'):
        if not x.get(a): x.pop(a,None)
    if x.get('soz') is None: x.pop('soz',None)
    for d in x.get('dinle',[]):
        if not d.get('baslik'): d.pop('baslik',None)
ids=[x['id'] for x in k]; assert len(ids)==len(set(ids))
bas='''/* Türkü Defteri verisi. araclar/ klasöründeki betiklerle üretilir, elle düzenlenebilir.
   Sözler telifi serbest metinlerden alınmıştır: Vikikaynak'taki anonim türküler ve kamu malı ozan şiirleri
   (bir bölümü Sadettin Nüzhet Ergun'un "Bektaşi Şairleri ve Nefesleri" derlemesinden). Her kaydın "kaynak" alanında sayfa adresi vardır.
   Günümüz sanatçılarının özgün eserleri için sözler yazılmaz, yalnızca YouTube bağlantısı verilir.
   Alanlar: id, ad, sair, tur (deyis | turku | ozgun), dil (tr | ku | zz), yore, soz (kıtalar), kaynak, dinle [{ kim, yt, baslik }] */
var TURKULER = '''
open('../app/data/turkuler.js','w').write(bas+json.dumps(k,ensure_ascii=False,separators=(',',':')).replace('},{"id"','},\n{"id"')+';\n')
print(len(k))
