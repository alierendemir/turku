import json,sys,time,urllib.request,urllib.parse
UA={'User-Agent':'LyricsReader/0.1 (personal research script) python-urllib/3.13'}
def api(**p):
    p['format']='json'
    u='https://tr.wikisource.org/w/api.php?'+urllib.parse.urlencode(p)
    for i in range(3):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read()
            return json.loads(r)
        except Exception as e:
            print('ERR',e,file=sys.stderr); time.sleep(10)
if __name__=='__main__':
    cmd=sys.argv[1]
    if cmd=='search':
        d=api(action='query',list='search',srsearch=sys.argv[2],srlimit=sys.argv[3] if len(sys.argv)>3 else 20,srnamespace='0|100|102|14')
        for x in d['query']['search']: print(x['title'])
    elif cmd=='cat':
        d=api(action='query',list='categorymembers',cmtitle=sys.argv[2],cmlimit=500)
        for x in d['query']['categorymembers']: print(x['title'])
    elif cmd=='links':
        d=api(action='parse',page=sys.argv[2],prop='links')
        for x in d['parse']['links']: print(x['*'])
    elif cmd=='wt':
        d=api(action='parse',page=sys.argv[2],prop='wikitext|categories')
        print(d['parse']['wikitext']['*']); print('CATS',[c['*'] for c in d['parse']['categories']])
