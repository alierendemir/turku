# Vikikaynak'tan türkü ve deyiş sayfalarının listesini çıkarır: ws/lists.json ve ws/lists2.json
exec(open('wsget.py').read().split("if __name__")[0])
import time,json,os
os.makedirs('ws',exist_ok=True)
lists={}
for c in ['Kategori:Tunceli türküleri','Kategori:Erzincan türküleri','Kategori:Sivas türküleri','Kategori:Malatya türküleri','Kategori:Elazığ türküleri','Kategori:Bingöl türküleri','Kategori:Abdal Musa']:
    d=api(action='query',list='categorymembers',cmtitle=c,cmlimit=500); time.sleep(3)
    lists[c]=[x['title'] for x in d['query']['categorymembers']] if d else []
for who in ['Pir Sultan Abdal','Kul Himmet','Nesimi','Virani','Teslim Abdal','Karacaoğlan','Yunus Emre','Seyrani']:
    d=api(action='query',list='search',srsearch='insource:"esersahibi='+who+'"',srlimit=500); time.sleep(3)
    lists[who]=[x['title'] for x in d['query']['search']] if d else []
json.dump(lists,open('ws/lists.json','w'),ensure_ascii=False,indent=0)
l2={}
for c in ['Kategori:Pir Sultan Abdal eserleri','Kategori:Virani eserleri','Kategori:Bektaşi Şairleri ve Nefesleri']:
    d=api(action='query',list='categorymembers',cmtitle=c,cmlimit=500); time.sleep(3)
    l2[c]=[x['title'] for x in d['query']['categorymembers']] if d else []
json.dump(l2,open('ws/lists2.json','w'),ensure_ascii=False,indent=0)
print({k:len(v) for k,v in {**lists,**l2}.items()})
