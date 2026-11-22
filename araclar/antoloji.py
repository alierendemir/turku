import json,re
P='ws/'
pages=json.load(open(P+'pages.json')); sp=json.load(open(P+'sayfalar.json'))
def sayfa_metni(index,n):
    t=sp.get('Sayfa:%s/%d'%(index,n),{}).get('wt','')
    return re.sub(r'<noinclude>.*?</noinclude>','',t,flags=re.S)
def bolum(metin,ad,bas=True,son=True):
    # ad bölümünün içeriği; bas=False ise başından, son=False ise sonuna kadar
    i=0; j=len(metin)
    if bas:
        m=re.search(r'<section begin="?%s"?\s*/>'%re.escape(ad),metin); 
        if m: i=m.end()
    if son:
        m=re.search(r'<section end="?%s"?\s*/>'%re.escape(ad),metin[i:])
        if m: j=i+m.start()
    return metin[i:j]
def cozumle(wt):
    out=[]
    for m in re.finditer(r'<pages\s+([^>]*)/?>',wt):
        a=dict(re.findall(r'(\w+)="?([^"\s/]+(?:[^"]*?)?)"?(?=\s+\w+=|\s*/?$)',m.group(1)))
        idx=re.search(r'index="([^"]+)"',m.group(1)).group(1)
        f=int(re.search(r'from=(\d+)',m.group(1)).group(1)); to=int(re.search(r'to=(\d+)',m.group(1)).group(1))
        only=re.search(r'onlysection="?(\w+)',m.group(1)); fs=re.search(r'fromsection="?(\w+)',m.group(1)); ts=re.search(r'tosection="?(\w+)',m.group(1))
        parca=[]
        for n in range(f,to+1):
            s=sayfa_metni(idx,n)
            if only: s=bolum(s,only.group(1))
            else:
                if n==f and fs: s=bolum(s,fs.group(1),True,False)
                if n==to and ts: s=bolum(s,ts.group(1),False,True)
            parca.append(s)
        out.append('\n'.join(parca))
    return '\n'.join(out)
if __name__=='__main__':
    for t in ['Yemen Ellerinden Beri Gelirken','Aman Hey Erenler Mürvet Sizindir']:
        print('=====',t); print(cozumle(pages[t]['wt'])[:1200])
    k=cozumle(pages['Bektaşî Şairleri ve Nefesleri/Kul Himmet']['wt'])
    print(len(k)); print(k[:3000])
