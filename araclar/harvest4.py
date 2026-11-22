exec(open('wsget.py').read().split("if __name__")[0])
import json,time,re
P='ws/'
l2=json.load(open(P+'lists2.json')); pages=json.load(open(P+'pages.json'))
hedef=[t for c in ['Kategori:Pir Sultan Abdal eserleri','Kategori:Virani eserleri'] for t in l2[c] if t not in pages]
hedef+=['Bektaşî Şairleri ve Nefesleri/'+x for x in ['Pir Sultan Abdal','Kul Himmet','Hatayi','Virânî','Kaygusuz Abdal','Yunus Emre','Muhyeddin Abdal','Seyyîd Ali Sultan','Kul Mazlum','Yemînî']]
def toplu(basliklar):
    out={}
    for i in range(0,len(basliklar),50):
        grup=basliklar[i:i+50]
        for k in range(8):
            d=api(action='query',prop='revisions|categories',rvprop='content|ids',rvslots='main',cllimit='max',titles='|'.join(grup),redirects=1)
            if d: break
            time.sleep(30)
        for p in d['query']['pages'].values():
            if 'revisions' in p:
                out[p['title']]={'wt':p['revisions'][0]['slots']['main']['*'],'revid':p['revisions'][0]['revid'],'cats':[c['title'] for c in p.get('categories',[])]}
        time.sleep(5)
    return out
yeni=toplu(hedef); pages.update(yeni); print('yeni',len(yeni),flush=True)
json.dump(pages,open(P+'pages.json','w'),ensure_ascii=False,indent=1)
sayfa=set()
for t,p in pages.items():
    for m in re.finditer(r'<pages\s+index="([^"]+)"\s+from=(\d+)\s+to=(\d+)',p['wt']):
        for n in range(int(m.group(2)),int(m.group(3))+1): sayfa.add('Sayfa:%s/%d'%(m.group(1),n))
print('sayfa',len(sayfa),flush=True)
sp=toplu(sorted(sayfa)); json.dump(sp,open(P+'sayfalar.json','w'),ensure_ascii=False,indent=1)
print('BITTI',len(sp))
