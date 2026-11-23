# Ek kategoriler: Hatayi, Kul Himmet, Nefesler ve diğer ozanların deyişleri -> ws/lists3.json, ws/pages3.json
exec(open('wsget.py').read().split("if __name__")[0])
import time,json,re
KAT=["Kategori:Şah Hatayi'nin deyişleri","Kategori:Şah Hatayi gazelleri","Kategori:Kul Himmet'in deyişleri","Kategori:Nefesler","Kategori:Pir Sultan Abdal'ın deyişleri","Kategori:Kul Nesimi'nin deyişleri","Kategori:Kul Hüseyin'in deyişleri","Kategori:Muhyiddin Abdal eserleri","Kategori:Kaygusuz Abdal şiirleri","Kategori:Ruhsati deyişleri","Kategori:Ruhsati'nin deyişleri","Kategori:Deyiş","Kategori:Hatay türküleri"]
l={}
for c in KAT:
    d=None
    for k in range(6):
        d=api(action='query',list='categorymembers',cmtitle=c,cmlimit=500)
        if d: break
        time.sleep(30)
    l[c]=[x['title'] for x in d['query']['categorymembers']] if d else []
    print(c,len(l[c]),flush=True); time.sleep(3)
json.dump(l,open('ws/lists3.json','w'),ensure_ascii=False,indent=0)
eski=json.load(open('ws/pages.json'))
hedef=sorted(set(t for v in l.values() for t in v if not t.startswith('Kategori:') and t not in eski))
pages={}
for i in range(0,len(hedef),50):
    grup=hedef[i:i+50]; d=None
    for k in range(8):
        d=api(action='query',prop='revisions|categories',rvprop='content|ids',rvslots='main',cllimit='max',titles='|'.join(grup),redirects=1)
        if d: break
        time.sleep(30)
    for p in d['query']['pages'].values():
        if 'revisions' in p:
            pages[p['title']]={'wt':p['revisions'][0]['slots']['main']['*'],'revid':p['revisions'][0]['revid'],'cats':[c['title'] for c in p.get('categories',[])]}
    print(i,len(pages),flush=True); time.sleep(5)
json.dump(pages,open('ws/pages3.json','w'),ensure_ascii=False,indent=1)
sayfa=set()
for t,p in pages.items():
    for m in re.finditer(r'<pages\s+index="([^"]+)"\s+from=(\d+)\s+to=(\d+)',p['wt']):
        for n in range(int(m.group(2)),int(m.group(3))+1): sayfa.add('Sayfa:%s/%d'%(m.group(1),n))
eskiS=json.load(open('ws/sayfalar.json'))
sayfa=sorted(s for s in sayfa if s not in eskiS)
sp={}
for i in range(0,len(sayfa),50):
    grup=sayfa[i:i+50]; d=None
    for k in range(8):
        d=api(action='query',prop='revisions',rvprop='content',rvslots='main',titles='|'.join(grup))
        if d: break
        time.sleep(30)
    for p in d['query']['pages'].values():
        if 'revisions' in p: sp[p['title']]={'wt':p['revisions'][0]['slots']['main']['*']}
    time.sleep(5)
eskiS.update(sp); json.dump(eskiS,open('ws/sayfalar.json','w'),ensure_ascii=False,indent=1)
print('BITTI',len(pages),'yeni sayfa',len(sp))
