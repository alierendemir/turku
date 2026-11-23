# Vikikaynak başlığının başı (sadeleştirilmiş) -> YouTube kayıtları (WebSearch sonuçlarından, başlıkta sanatçı adı geçenler)
LINK = {
 "otme bulbul otme": [("Tan Taşçı","hOhX89ERr-A")],
 "donen donsun ben donmezem yolumdan": [("Selda Bağcan","tm1GooDLqNc"),("Cem Karaca","90pFKJY98So"),("Ali Sal","MFYRGeSw2f8")],
 "dersim dort dag icinde": [("Erkan Oğur","yQS0j4eQi0E"),("Ahmet Kaya","ARY8KfESMkk"),("Aynur Haşhaş","jgiJVppp0Bk"),("Elvan Sevim","yYPrzTQt9w0")],
 "gurbet elde bir hal geldi basima": [("Cengiz Özkan","f2n_JkPbqw0"),("Yavuz Bingöl","w7WhaNnrlhc"),("Haluk Tolga İlhan","9k8arZkFH5A"),("Uğur Işılak","lK40uStU7yc")],
 "ilgit ilgit esen seher yelleri": [("Gülcan Ertan Hacısüleymanoğlu","ReupGgHzhuQ")],
 "sabahtan cemalin seyran eyledim": [("Erdal Erzincan","GGP-AK6C8-Y"),("Selda Bağcan","2HjOAIO_uxU"),("Erdal Akkaya","D4ohGFQSvNY")],
 "su karsi yaylada goc katar katar": [("Cengiz Özkan","gjfEKqfs384"),("Haluk Tolga İlhan","zgM7noDB9Hw"),("Aynur Haşhaş","fVnWjV-vKtQ")],
 "munzur dagi silelenmis garinen": [("Cengiz Özkan","ygPRFegRihQ"),("Süleyman Hatunoğlu","t3pVGvYTHjc")],
 "sultan suyu gibi caglayip akma": [("Metin Kemal Kahraman","p9yNdWYiMAI"),("Tonguç Vural","UzKeHmCjOG8"),("Deste Günaydın, Özlem Özgür","xphz2297zZg")],
 "derdim coktur kangisina yanayim": [("Kerim Yağcı","Uzblc8B883c"),("Ali Ekber Çiçek","pEfbF2SLjqI")],
 "bir guzelin asigiyim erenler": [("Erdal Erzincan, Mercan Erzincan","NN4DaY4NlAc"),("Erol Eren","EJUvnniuWak"),("Gönül Kahraman","ZC19-WFxb3k")],
 "taze karlar yagmis karin ustune": [("Selda Gündoğan","-U0YGB87tVI"),("İlkay Akkaya","df6sRppZyxc"),("Yıldız Tilbe","e4kzZaIB-yc")],
 "yemen ellerinden beri gelirken": [("Erdal Erzincan","UZ_hHdJjnPA")],
 "kul olayim kalem tutan ellere": [("Erdal Erzincan, Tolga Sağ","qWDrcQSPpdU")],
 "gozun acik ise gel gir katara": [("Erdal Erzincan","lldfE1bvNE4")],
 "ceke ceke ben bu dertten olurum": [("Erdal Erzincan","l_kctfx8qnw")],
 "su yalan dunyaya geldim geleli": [("Yılmaz Çelik","MO_2qxLo77E")],
}
EK = {
 "bugun bize pir geldi": [("Merdan Güzelgün, Kutsal Evcimen","Y74BdeNyRLg"),("Arif Sağ","w4T8nMo7UIM")],
 "ondortbin yil gezdim pervanelikte": [("Ali Ekber Çiçek","GPrM7YiwgCg","Haydar Haydar"),("Erdem Şimşek","ZincFjcZWEU","Haydar Haydar, bağlama")],
 "gelin oldum karabel in eline": [("Muharrem Temiz","u_m43TiDB8o","Yayladan Gel Kömür Gözlüm")],
 "bir ay dogar": [("Cengiz Özkan","4ik9ui97R58")],
 "gonul gel seninle": [("Ender Balkır","FvJJ-Q-Rbqs","Çiçek Türküleri")],
 "nasil yar diyeyim ben boyle yare": [("Ender Balkır","BV5UaP3wgdU","Çiçek Türküleri")],
 "sabahtan ugradim ben bir figana": [("Ender Balkır","sbm1tPy9WfU","Çiçek Türküleri")],
 "bulbul havalanmis": [("Grup Abdal","bzvnxsuIz1g")],
 "ceke ceke ben bu dertten olurum": [("Sabahat Akkiraz","C82Kzn6K3Rg","Sakın Dağlar Gibi Yüceyim Deme ile birlikte")],
 "bir guzelin asigiyim erenler": [("Arif Sağ","JvOAekVmgGw")],
 "seyyah oldum su alemi gezerim": [("Hüseyin Korkankorkmaz","VvJy3rHqHLU","Seyyah Oldum")],
}
for k_,v_ in EK.items(): LINK[k_]=LINK.get(k_,[])+v_
EK2 = {
 "su benim divane gonlum": [("Muharrem Temiz, Cengiz Özkan","krTnlsPsSQ0","Yâre Dokunma, 2001")],
 "hey erenler bir muskilim var benim": [],
}
for k_,v_ in EK2.items():
    if v_: LINK[k_]=LINK.get(k_,[])+v_
