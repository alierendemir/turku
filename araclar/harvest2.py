exec(open('wsget.py').read().split("if __name__")[0])
import time,json
P='ws/'
lists=json.load(open(P+'lists.json'))
allt=sorted(set(t for v in lists.values() for t in v if ':' not in t))
pages={}
for i in range(0,len(allt),50):
    grup=allt[i:i+50]
    d=None
    for k in range(6):
        d=api(action='query',prop='revisions|categories',rvprop='content|ids',rvslots='main',cllimit='max',titles='|'.join(grup),redirects=1)
        if d: break
        time.sleep(30)
    if not d: print('BASARISIZ',i,flush=True); continue
    for p in d['query']['pages'].values():
        if 'revisions' not in p: continue
        r=p['revisions'][0]
        pages[p['title']]={'wt':r['slots']['main']['*'],'revid':r['revid'],'pageid':p['pageid'],'cats':[c['title'] for c in p.get('categories',[])]}
    print(i,len(pages),flush=True)
    json.dump(pages,open(P+'pages.json','w'),ensure_ascii=False,indent=1)
    time.sleep(5)
print('BITTI',len(pages))
