import json,re,sys,urllib.parse,unicodedata
sys.path.insert(0,'.'); from linkler import LINK
from antoloji import cozumle
pages=json.load(open('ws/pages.json'))
import os
if os.path.exists('ws/pages3.json'):
    for _t,_p in json.load(open('ws/pages3.json')).items(): pages.setdefault(_t,_p)
# Aynı ozanın farklı yazımlarını tek ada indir
AD_ESLE={'Hatayi':'Şah Hatayi','Hatâyî':'Şah Hatayi','Şah Hatâyî':'Şah Hatayi','Şah İsmail Hatayi':'Şah Hatayi','Şah Hatayî':'Şah Hatayi','Pir Sultan':'Pir Sultan Abdal','Pir Sultan Abdal ':'Pir Sultan Abdal'}
OZAN_DEYIS={'Şah Hatayi','Kul Nesimi','Kul Hüseyin','Ruhsati','Kaygusuz Abdal','Seyyid Ali Sultan','Kul Mazlum','Yemini','Abdal Musa','Pir Sultan Abdal','Kul Himmet','Virani','Teslim Abdal','Muhyiddin Abdal','Sıdkı Baba','Derviş Ali','Kul Hasan','Yunus Emre'}
OZAN_PD=OZAN_DEYIS|{'Karacaoğlan','Seyrani'}
YASAK=re.compile(r'Akarsu|Veysel|Sefil Selimi|Nesimi Çimen|Mesleki|Bursalı',re.I)
ILLER=['Tunceli','Erzincan','Sivas','Malatya','Elazığ','Bingöl','Erzurum','Kars','Kayseri','Tokat','Yozgat','Adıyaman','Kahramanmaraş','Çorum','Amasya','Gaziantep','Diyarbakır','Ankara','Kırşehir','Muş']
def sade(s):
    s=s.lower().replace('İ','i').replace('ı','i')
    s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9 ]+',' ',s).split()
def slug(s): return '-'.join(sade(s))
def sablon_sil(w):
    while True:
        y=re.sub(r'\{\{[^{}]*\}\}','',w)
        if y==w: return y
        w=y
def temizle(w):
    w=re.split(r'==\s*Kaynak(?:ça|lar)\s*==|\{\{\s*[Ee]ser son',w)[0]
    w=re.sub(r'<ref[^>]*/>|<ref.*?</ref>','',w,flags=re.S)
    w=re.sub(r'^\s*\*.*$','',w,flags=re.M)
    w=re.sub(r'^\s*=+\s*(.*?)\s*=+\s*$',lambda m:'\n\n— '+m.group(1)+' —\n\n',w,flags=re.M)
    w=re.sub(r'<nowiki>(.*?)</nowiki>',r'\1',w,flags=re.S)
    w=re.sub(r'</?section[^>]*>','',w)
    w=sablon_sil(w)
    w=re.sub(r'\[\[(?:Kategori|Category):[^\]]*\]\]','',w)
    w=re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]',r'\1',w); w=re.sub(r'\[\[([^\]]*)\]\]',r'\1',w)
    w=re.sub(r'<br\s*/?>','\n',w,flags=re.I)
    w=re.sub(r'</?(poem|center|div|span|p|small|big|b|i)[^>]*>','',w,flags=re.I)
    w=re.sub(r"'{2,}",'',w)
    w=w.replace('&nbsp;',' ')
    satirlar=[re.sub(r'^[:\s]+','',l).rstrip() for l in w.split('\n')]
    metin='\n'.join(satirlar).strip()
    kitalar=[re.sub(r'[ \t]+',' ',k).strip() for k in re.split(r'\n\s*\n',metin)]
    return [k for k in kitalar if k and not k.startswith('__')]
kayit=[]; atlanan=[]
for t,p in sorted(pages.items()):
    w=p['wt']
    if '/' in t: continue
    if '<pages' in w:
        govde=cozumle(w)
        if '<poem' not in govde: atlanan.append((t,'transclusion-bos')); continue
        w=re.sub(r'<pages[^>]*>','',w)+'\n'+'\n\n'.join(re.findall(r'<poem>(.*?)</poem>',govde,flags=re.S))
        w=re.sub(r'\{\{(?:center|orta)\|[^{}]*\}\}','',w)
    m=re.search(r'eser ?sahibi\s*=\s*([^|}\n]*)',w); sahip=(m.group(1).strip() if m else '')
    tel=re.search(r'(?:telif|notlar)\s*=\s*\{\{\s*([^|}]*)',w); tel=tel.group(1).strip().lower() if tel else ''
    derleyen=''
    if '<p>' in sahip or 'kaynak ki' in sahip or 'derleyen' in sahip:
        derleyen=re.sub(r'\s*<p>\s*',', ',sahip).strip(); sahip='Anonim'
    if sahip.lower()=='anonim': sahip='Anonim'
    sahip=AD_ESLE.get(sahip,sahip)
    cats0=' '.join(p['cats'])
    if not sahip or sahip=='Anonim':
        for _kat,_ad in (("Şah Hatayi",'Şah Hatayi'),("Kul Himmet'in",'Kul Himmet'),("Kul Nesimi",'Kul Nesimi'),("Kul Hüseyin",'Kul Hüseyin'),('Ruhsati','Ruhsati'),('Muhyiddin Abdal','Muhyiddin Abdal'),('Kaygusuz Abdal','Kaygusuz Abdal'),('Pir Sultan Abdal','Pir Sultan Abdal')):
            if _kat in cats0 and not sahip: sahip=_ad
    if YASAK.search(sahip) or YASAK.search(derleyen): atlanan.append((t,'telif:'+sahip)); continue
    if not (sahip=='Anonim' or sahip in OZAN_PD or 'anonim' in tel or tel.startswith('km-')): atlanan.append((t,'belirsiz:'+sahip+'/'+tel)); continue
    cats=[c.replace('Kategori:','') for c in p['cats']]
    turkuMu=any('türküleri' in c for c in cats)
    if sahip=='Karacaoğlan' and not turkuMu: atlanan.append((t,'karacaoglan-siir')); continue
    kitalar=temizle(w)
    if len(kitalar)<1 or sum(len(k) for k in kitalar)<60: atlanan.append((t,'metin yok')); continue
    yore=''
    for il in ILLER:
        if any(c.startswith(il+' türküleri') or c.startswith(il+' Türküleri') for c in cats): yore=il; break
    ad=re.sub(r'\s*\([^)]*\)\s*$','',t).strip()
    tur='siir' if 'gazelleri' in cats0 else 'deyis' if (sahip in OZAN_DEYIS or any('nefes' in c.lower() or 'semah' in c.lower() for c in cats) or 'semah' in t.lower()) else 'turku'
    k={'id':slug(t),'ad':ad,'sair':'' if sahip=='Anonim' else sahip,'tur':tur,'dil':'tr','yore':yore,
       'soz':kitalar,'kaynak':{'ad':'Vikikaynak','url':'https://tr.wikisource.org/wiki/'+urllib.parse.quote(t.replace(' ','_'))}}
    if sahip=='Anonim': k['kaynak']['not']='Anonim'+(' · '+derleyen if derleyen else '')
    kayit.append(k)
ANTO={'Pir Sultan Abdal':'Pir Sultan Abdal','Kul Himmet':'Kul Himmet','Hatayi':'Şah Hatayi','Virânî':'Virani','Kaygusuz Abdal':'Kaygusuz Abdal','Yunus Emre':'Yunus Emre','Muhyeddin Abdal':'Muhyiddin Abdal','Seyyîd Ali Sultan':'Seyyid Ali Sultan','Kul Mazlum':'Kul Mazlum','Yemînî':'Yemini'}
ilkler={sade(k['soz'][0].split('\n')[0]).__str__() for k in kayit if k.get('soz')}
for alt,sair in ANTO.items():
    t='Bektaşî Şairleri ve Nefesleri/'+alt
    if t not in pages: continue
    govde=cozumle(pages[t]['wt'])
    siirler='\n\n'.join(re.findall(r'<poem>(.*?)</poem>',govde,flags=re.S))
    parcalar=re.split(r'\{\{(?:center|orta)\|\s*[―—–-]+\s*\d+\s*[―—–-]*\s*\}\}',siirler)
    for p in parcalar[1:]:
        kitalar=temizle(p)
        if not kitalar or sum(len(x) for x in kitalar)<80: continue
        ilk=kitalar[0].split('\n')[0].strip().rstrip('.,;:')
        if sade(ilk).__str__() in ilkler: continue
        ilkler.add(sade(ilk).__str__())
        kayit.append({'id':slug(sair+' '+ilk),'ad':ilk,'sair':sair,'tur':'deyis','dil':'tr','yore':'','soz':kitalar,
          'kaynak':{'ad':'Vikikaynak','url':'https://tr.wikisource.org/wiki/'+urllib.parse.quote(t.replace(' ','_')),'not':'Sadettin Nüzhet Ergun, Bektaşi Şairleri ve Nefesleri'}})
for k in kayit:
    s=' '.join(sade(k['ad']))
    for anahtar,lst in LINK.items():
        es=[x for x in kayit if (' '.join(sade(x['ad']))).startswith(anahtar) or anahtar.startswith(' '.join(sade(x['ad'])))]
        if len(es)==1 and es[0] is k:
            k['dinle']=[{'kim':t_[0],'yt':t_[1],'baslik':(t_[2] if len(t_)>2 else '')} for t_ in lst]
from baglanti import B
for ad,sair,tur,dil,yore,lst in B:
    k={'id':'b-'+slug(ad),'ad':ad,'sair':sair,'tur':tur,'dil':dil,'yore':yore,'soz':None,'dinle':[{'kim':a,'yt':v,'baslik':b} for a,v,b in lst]}
    if not k['dil']: del k['dil']
    if not k['tur']: del k['tur']
    kayit.append(k)
# yinelenen id
gor={}
for k in kayit:
    if k['id'] in gor: gor[k['id']]+=1; k['id']+='-'+str(gor[k['id']])
    else: gor[k['id']]=1
json.dump(kayit,open('kayit.json','w'),ensure_ascii=False,indent=1)
import collections
print(len(kayit),collections.Counter(k.get('tur') for k in kayit),collections.Counter(k.get('yore') for k in kayit))
print('linkli',sum(1 for k in kayit if k.get('dinle')),[k['ad'] for k in kayit if k.get('dinle')])
print('atlanan',len(atlanan),collections.Counter(a[1].split(':')[0] for a in atlanan))
for a in atlanan:
    if not a[1].startswith(('transclusion','karacaoglan')): print(a)
