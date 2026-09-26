/* Hüsrev Cast Ajans taslak — veri: tarayıcıda (localStorage) tutulur, backend yok */
(function (C) {
  'use strict';
  var KEY = 'husrev.taslak.v2';
  var SKEY = 'husrev.oturum.v1';
  var DEMO_SIFRE = 'f25d788cb978533c2d33781fe7f89ace2ab3542022f904079b021e1632550287'; // husrev123

  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }

  function makeSeed() {
    var r = rng(20260923);
    var pick = function (a) { return a[Math.floor(r() * a.length)]; };
    var some = function (a, min, max) { var n = min + Math.floor(r() * (max - min + 1)); var c = a.slice().sort(function () { return r() - 0.5; }); return c.slice(0, n); };
    var between = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };

    var kisiler = [
      ['Elif', 'Aydın', 'Kadın'], ['Zeynep', 'Kaya', 'Kadın'], ['Defne', 'Arslan', 'Kadın'], ['Ece', 'Yıldız', 'Kadın'],
      ['Selin', 'Koç', 'Kadın'], ['Nazlı', 'Demir', 'Kadın'], ['İpek', 'Şahin', 'Kadın'], ['Lara', 'Tekin', 'Kadın'],
      ['Kerem', 'Aksoy', 'Erkek'], ['Emir', 'Polat', 'Erkek'], ['Barış', 'Kurt', 'Erkek'], ['Onur', 'Yalçın', 'Erkek'],
      ['Arda', 'Erdem', 'Erkek'], ['Cem', 'Güneş', 'Erkek'], ['Kaan', 'Özkan', 'Erkek'], ['Hakan', 'Sarı', 'Erkek'],
      ['Asya', 'Öztürk', 'Kadın'], ['Yusuf', 'Tan', 'Erkek'], ['Melis', 'Çelik', 'Kadın']
    ];
    var etiketHavuzu = ['Yeni yüz', 'Deneyimli', 'Reklam yüzü', 'Güler yüzlü', 'Atletik', 'Aile rolü', 'Ofis tipi', 'Sert karakter', 'Premium'];
    var talents = kisiler.map(function (k, i) {
      var kadin = k[2] === 'Kadın';
      var basvuru = i >= 16;
      var yas = i === 15 ? 52 : i === 7 ? 11 : between(19, 38);
      var dogum = new Date(); dogum.setFullYear(dogum.getFullYear() - yas); dogum.setMonth(between(0, 11)); dogum.setDate(between(1, 27));
      var boy = kadin ? between(160, 181) : between(172, 192);
      var c = {
        ad: k[0], soyad: k[1], cinsiyet: k[2], dogumTarihi: C.iso(dogum), sehir: pick(['İstanbul', 'İstanbul', 'İstanbul', 'İzmir', 'Ankara', 'Antalya', 'Bursa']),
        musaitlik: pick(['Her zaman', 'Hafta içi', 'Hafta sonu', 'Görüşülür']),
        telefon: '05' + between(30, 55) + ' ' + between(100, 999) + ' ' + between(10, 99) + ' ' + between(10, 99),
        eposta: C.norm(k[0]).replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o') + '.' + C.norm(k[1]).replace(/[ıİ]/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o') + '@ornek.com',
        instagram: '@' + C.norm(k[0]).replace(/[^a-z]/g, '') + between(10, 99),
        kategoriler: yas < 16 ? ['Oyuncu'] : some(kadin ? ['Manken', 'Oyuncu', 'Figüran', 'Fotomodel', 'Dansçı'] : ['Manken', 'Oyuncu', 'Figüran', 'Fotomodel'], 1, 3),
        boy: yas < 16 ? 142 : boy, kilo: yas < 16 ? 36 : Math.round(boy * (kadin ? 0.33 : 0.42) - between(0, 6)),
        beden: yas < 16 ? 'XS' : kadin ? pick(['XS', 'S', 'S', 'M']) : pick(['M', 'L', 'L', 'XL']),
        ayakkabi: yas < 16 ? 34 : kadin ? between(36, 40) : between(41, 45),
        gogus: kadin ? between(80, 92) : between(92, 106), bel: kadin ? between(58, 68) : between(74, 86), kalca: kadin ? between(86, 96) : between(92, 102),
        ten: pick(['Açık', 'Buğday', 'Buğday', 'Esmer']),
        sacRengi: pick(['Siyah', 'Koyu kahve', 'Açık kahve', 'Kumral', 'Sarı']), sacUzunlugu: kadin ? pick(['Orta', 'Uzun', 'Çok uzun']) : pick(['Kısa', 'Kısa', 'Orta']),
        gozRengi: pick(['Kahverengi', 'Kahverengi', 'Ela', 'Yeşil', 'Mavi']), dovme: pick(['Yok', 'Yok', 'Var — kapatılabilir']), piercing: 'Yok', ozelIz: '',
        egitimDurumu: yas < 16 ? 'İlköğretim' : pick(['Lise', 'Ön lisans', 'Lisans', 'Lisans', 'Öğrenci']), okul: pick(['', 'Mimar Sinan GSÜ — Tiyatro', 'Anadolu Üniv. — İşletme', 'Ege Üniv. — İletişim', 'Bilgi Üniv. — Film']),
        oyunculukEgitimi: pick(['Yok', 'Kurs / atölye', 'Kurs / atölye', 'Özel ders', 'Konservatuvar']), oyunculukDetay: pick(['', 'Moda Sahnesi atölyesi', 'Kent Oyuncuları kursu', 'Özel koç ile 1 yıl']),
        deneyim: pick(['', 'Kahve markası reklam filmi (2025) — ana karakter\nDizi "Kıyı" (2024) — konuk oyuncu', 'Tekstil kataloğu (2025), iki sezon defile', 'Kısa film "Eşik" (2023) — başrol', 'Market zinciri reklamı (2024) — figüran']),
        diller: ['Türkçe'].concat(some(['İngilizce', 'Almanca', 'Rusça', 'Fransızca'], 0, 2)),
        beceriler: some(['Dans', 'Şarkı', 'Yüzme', 'Binicilik', 'Profesyonel spor', 'B sınıfı ehliyet', 'Enstrüman', 'Şive / aksan'], 0, 3),
        sacKesim: pick(['Evet', 'Hayır', 'Görüşülür']), sacBoya: pick(['Evet', 'Hayır', 'Görüşülür']), sakal: kadin ? '' : pick(['Evet', 'Görüşülür']),
        kiloDegisim: pick(['Hayır', 'Görüşülür', 'Evet']), mayo: pick(['Evet', 'Hayır', 'Görüşülür']), opusme: pick(['Hayır', 'Görüşülür', 'Evet']),
        geceCekim: pick(['Evet', 'Evet', 'Görüşülür']), sehirDisi: pick(['Evet', 'Görüşülür']), yurtDisi: pick(['Evet', 'Hayır', 'Görüşülür']),
        fotograflar: ['ph:0', 'ph:1', 'ph:2', 'ph:3'].slice(0, between(2, 4)), video: r() > 0.5 ? 'https://youtube.com/watch?v=ornek' : '',
        kvkk: true, iletisimIzni: r() > 0.3
      };
      var gun = basvuru ? between(0, 3) : between(20, 400);
      return {
        id: 't' + (i + 1), durum: basvuru ? 'basvuru' : 'aktif', kaynak: basvuru || r() > 0.4 ? 'kayit' : 'ajans',
        olusturma: C.addDays(-gun), rizaTarihi: C.addDays(-gun),
        uygunluk: basvuru ? 'musait' : pick(['musait', 'musait', 'musait', 'mesgul', 'pasif']),
        etiketler: basvuru ? ['Yeni yüz'] : some(etiketHavuzu, 1, 3), notlar: '', c: c
      };
    });
    // Aday sitesi deneme hesabı: elif.aydin@ornek.com / husrev123
    talents[0].hesap = { eposta: talents[0].c.eposta, sifre: DEMO_SIFRE };
    // çocuk profil (18 yaş altı) — veli rızası sorusu açık (B-12)
    talents[7].etiketler = ['Çocuk oyuncu'];

    var users = [
      { id: 'u1', ad: 'Buse Karaca', eposta: 'buse@husrevcast.com', rol: 'yonetici' },
      { id: 'u2', ad: 'Tolga Er', eposta: 'tolga@husrevcast.com', rol: 'cast' },
      { id: 'u3', ad: 'Nur Sevim', eposta: 'nur@husrevcast.com', rol: 'finans' },
      { id: 'u4', ad: 'Deniz Uçar', eposta: 'deniz@husrevcast.com', rol: 'temsilci' },
      { id: 'u5', ad: 'Ozan Bilgin', eposta: 'ozan@husrevcast.com', rol: 'kisitli' }
    ];
    var clients = [
      { id: 'm1', ad: 'Oda 7 Reklam', yetkili: 'Gizem Tunç', telefon: '0212 555 10 20', eposta: 'gizem@oda7.ornek', temsilciId: 'u4' },
      { id: 'm2', ad: 'Martı Prodüksiyon', yetkili: 'Serkan Akın', telefon: '0212 555 30 40', eposta: 'serkan@marti.ornek', temsilciId: 'u4' },
      { id: 'm3', ad: 'Sarmaşık Yapım', yetkili: 'Aslı Duman', telefon: '0216 555 50 60', eposta: 'asli@sarmasik.ornek', temsilciId: '' },
      { id: 'm4', ad: 'Kuzeyışık Film', yetkili: 'Levent Oral', telefon: '0232 555 70 80', eposta: 'levent@kuzeyisik.ornek', temsilciId: '' }
    ];
    var projects = [
      { id: 'p1', ad: 'Dondurma Reklamı — Yaz Kampanyası', musteriId: 'm1', isTuru: 'Reklam filmi', tarih: C.addDays(9), bulusmaYeri: 'Kadıköy iskele önü', bulusmaSaati: '07:30', mekan: 'Moda sahili, İstanbul', butceMin: 8000, butceMax: 12000,
        kriter: { kategori: 'Manken', cinsiyet: 'Kadın', yasMin: 20, yasMax: 30, boyMin: 165, sehir: 'İstanbul', not: 'Güler yüzlü, doğal görünüm. Saç kesimi gerekmiyor.' },
        durum: 'onay_bekleyen', olusturma: C.addDays(-6),
        adaylar: [{ t: 't1', d: 'musteri_secti' }, { t: 't2', d: 'onerildi' }, { t: 't4', d: 'musteri_reddetti' }, { t: 't5', d: 'onerildi' }] },
      { id: 'p2', ad: 'Dizi "Kıyı" — Kafe Sahnesi Figüranları', musteriId: 'm2', isTuru: 'Dizi', tarih: C.addDays(4), bulusmaYeri: 'Set karavanları', bulusmaSaati: '09:00', mekan: 'Beykoz set alanı', butceMin: 1500, butceMax: 2000,
        kriter: { kategori: 'Figüran', cinsiyet: '', yasMin: 20, yasMax: 45, boyMin: '', sehir: 'İstanbul', not: '12 figüran, günlük kıyafet.' },
        durum: 'aktif', olusturma: C.addDays(-2), adaylar: [{ t: 't10', d: 'onerildi' }, { t: 't12', d: 'onerildi' }] },
      { id: 'p3', ad: 'Sonbahar Kataloğu', musteriId: 'm3', isTuru: 'Katalog çekimi', tarih: C.addDays(15), bulusmaYeri: 'Stüdyo girişi', bulusmaSaati: '10:00', mekan: 'Maslak stüdyo', butceMin: 6000, butceMax: 9000,
        kriter: { kategori: 'Manken', cinsiyet: '', yasMin: 20, yasMax: 32, boyMin: 172, sehir: '', not: 'Erkek ve kadın, katalog deneyimi tercih.' },
        durum: 'teklif_bekleyen', olusturma: C.addDays(-1), adaylar: [] },
      { id: 'p4', ad: 'Kısa Film "Eşik 2" — Başrol', musteriId: 'm4', isTuru: 'Kısa film', tarih: C.addDays(2), bulusmaYeri: 'Alsancak Kordon', bulusmaSaati: '08:00', mekan: 'İzmir, Alsancak', butceMin: 15000, butceMax: 20000,
        kriter: { kategori: 'Oyuncu', cinsiyet: 'Kadın', yasMin: 25, yasMax: 32, boyMin: '', sehir: '', not: 'Oyunculuk eğitimi şart. Rol için saç kısaltılacak.' },
        durum: 'onaylanan', olusturma: C.addDays(-20), adaylar: [{ t: 't3', d: 'kesinlesti' }] },
      { id: 'p5', ad: 'Banka Reklamı — Aile', musteriId: 'm1', isTuru: 'Reklam filmi', tarih: C.addDays(-10), bulusmaYeri: '', bulusmaSaati: '', mekan: 'Levent', butceMin: 10000, butceMax: 14000,
        kriter: { kategori: 'Oyuncu', cinsiyet: '', yasMin: '', yasMax: '', boyMin: '', sehir: '', not: 'Anne, baba ve çocuk.' },
        durum: 'onaylanmayan', olusturma: C.addDays(-30), adaylar: [{ t: 't16', d: 'musteri_reddetti' }, { t: 't8', d: 'musteri_reddetti' }] },
      { id: 'p6', ad: 'Otomobil Lansmanı — Karşılama Ekibi', musteriId: 'm2', isTuru: 'Etkinlik / Tanıtım', tarih: C.addDays(20), bulusmaYeri: 'Fuar alanı B kapısı', bulusmaSaati: '16:00', mekan: 'İstanbul Kongre Merkezi', butceMin: 3000, butceMax: 4500,
        kriter: { kategori: 'Manken', cinsiyet: '', yasMin: 21, yasMax: 30, boyMin: 170, sehir: 'İstanbul', not: 'İngilizce bilen 6 kişi.' },
        durum: 'teklif_yapilan', olusturma: C.addDays(-4), adaylar: [] }
    ];
    var packages = [
      { id: 'k1', token: 'dnd7x2qa', projeId: 'p1', baslik: 'Dondurma reklamı — 1. seçki', talentIds: ['t1', 't2', 't4', 't5'], olusturma: C.addDays(-3),
        alanlar: ['fiziksel', 'egitim', 'tavizler'], acilma: 3, gonderildi: C.addDays(-2),
        geri: { t1: { s: 'evet', n: 'Kesinlikle bu yüz, ana karakter için.' }, t4: { s: 'hayir', n: 'Tarz olarak uymadı.' } } }
    ];
    var events = [
      { id: 'e1', tur: 'casting', baslik: 'Dondurma reklamı — casting', tarih: C.addDays(1), saat: '14:00', projeId: 'p1', talentIds: ['t1', 't2', 't5'], not: 'Kadıköy ofis' },
      { id: 'e2', tur: 'cekim', baslik: 'Kısa film "Eşik 2" — çekim', tarih: C.addDays(2), saat: '08:00', projeId: 'p4', talentIds: ['t3'], not: '' },
      { id: 'e3', tur: 'prova', baslik: 'Eşik 2 — kostüm provası', tarih: C.addDays(0), saat: '16:30', projeId: 'p4', talentIds: ['t3'], not: 'Saç kesimi aynı gün' },
      { id: 'e4', tur: 'cekim', baslik: 'Dizi "Kıyı" — kafe sahnesi', tarih: C.addDays(4), saat: '09:00', projeId: 'p2', talentIds: [], not: '' },
      { id: 'e5', tur: 'toplanti', baslik: 'Sarmaşık Yapım ile katalog toplantısı', tarih: C.addDays(3), saat: '11:00', projeId: 'p3', talentIds: [], not: 'Maslak' },
      { id: 'e6', tur: 'cekim', baslik: 'Dondurma reklamı — çekim', tarih: C.addDays(9), saat: '07:30', projeId: 'p1', talentIds: [], not: '' },
      { id: 'e7', tur: 'toplanti', baslik: 'Haftalık ekip toplantısı', tarih: C.addDays(6), saat: '10:00', projeId: '', talentIds: [], not: '' }
    ];
    return { v: 1, ekSorular: [], talents: talents, users: users, clients: clients, projects: projects, packages: packages, events: events };
  }

  C.db = null;
  C.load = function () {
    try { var raw = localStorage.getItem(KEY); if (raw) { C.db = JSON.parse(raw); } } catch (e) { C.db = null; /* bozuksa yeniden kur */ }
    if (!C.db) { C.db = makeSeed(); C.save(); }
    C.db.ekSorular = C.db.ekSorular || [];
    // eski taslak verisinde deneme aday hesabı yoksa ekle
    if (!C.db.talents.some(function (t) { return t.hesap; })) { var t1 = C.talent('t1'); if (t1) t1.hesap = { eposta: t1.c.eposta, sifre: DEMO_SIFRE }; }
    C.sorulariKur(C.db.ekSorular);
  };
  C.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(C.db)); return true; }
    catch (e) { C.toast && C.toast('Tarayıcı hafızası doldu. Daha küçük ya da daha az fotoğraf deneyin.', 'err'); return false; }
  };
  C.reset = function () { C.db = makeSeed(); C.save(); C.sorulariKur(C.db.ekSorular); };

  // oturum
  C.session = function () { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } };
  C.login = function (uid) { try { localStorage.setItem(SKEY, JSON.stringify({ uid: uid })); } catch (e) { } };
  C.logout = function () { try { localStorage.removeItem(SKEY); } catch (e) { } };
  // Aday oturumu (aday sitesi) — panel oturumundan ayrı
  var AKEY = 'husrev.aday.oturum.v1';
  C.adayGiris = function (tid) { try { localStorage.setItem(AKEY, tid); } catch (e) { } };
  C.adayCikis = function () { try { localStorage.removeItem(AKEY); } catch (e) { } };
  C.adayBen = function () { var id = null; try { id = localStorage.getItem(AKEY); } catch (e) { } return id ? C.talent(id) : null; };
  C.hesapBul = function (eposta) {
    var e = C.norm(eposta).trim();
    return C.db.talents.filter(function (t) { return C.norm((t.hesap && t.hesap.eposta) || t.c.eposta) === e; })[0] || null;
  };
  C.me = function () { var s = C.session(); if (!s) return null; return C.db.users.filter(function (u) { return u.id === s.uid; })[0] || null; };
  C.can = function (perm) { var u = C.me(); return !!(u && C.ROLES[u.rol] && C.ROLES[u.rol][perm]); };

  // erişim kısayolları
  C.get = function (col, id) { return C.db[col].filter(function (x) { return x.id === id; })[0] || null; };
  C.talent = function (id) { return C.get('talents', id); };
  C.client = function (id) { return C.get('clients', id); };
  C.project = function (id) { return C.get('projects', id); };
  C.visibleProjects = function () {
    var u = C.me();
    if (u && C.ROLES[u.rol].ownClients) {
      var mine = C.db.clients.filter(function (m) { return m.temsilciId === u.id; }).map(function (m) { return m.id; });
      return C.db.projects.filter(function (p) { return mine.indexOf(p.musteriId) >= 0; });
    }
    return C.db.projects;
  };
})(window.C);
