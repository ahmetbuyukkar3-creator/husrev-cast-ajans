/* Hüsrev Cast Ajans — demo verisi ve tarayıcı hafızası (localStorage).
   Backend yok: tüm sayfalar aynı adresten açıldığı için bu hafızayı paylaşır. */
(function () {
  const ANAHTAR = 'husrev.demo.v1';

  // Tekrarlanabilir rastgele sayı: demo her sıfırlandığında aynı veri gelir.
  function tohum(s) {
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  const KADIN = ['Elif', 'Zeynep', 'Defne', 'Ecrin', 'Asya', 'Mira', 'Lara', 'Duru', 'Nehir', 'Selin', 'Ada', 'Ceren', 'Irmak', 'Melis', 'Buse', 'Naz', 'Eylül', 'Derin', 'İlayda', 'Sude'];
  const ERKEK = ['Emir', 'Kerem', 'Arda', 'Deniz', 'Mert', 'Kaan', 'Efe', 'Can', 'Barış', 'Ozan', 'Tuna', 'Alp', 'Onur', 'Yiğit', 'Berk', 'Doruk', 'Umut', 'Cem', 'Batu', 'Aras'];
  const SOYAD = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Koç', 'Kurt', 'Özkan', 'Aksoy', 'Tekin', 'Polat', 'Erdem', 'Güneş', 'Yıldız', 'Aktaş', 'Karaca'];
  const SEHIR = ['İstanbul', 'İstanbul', 'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];
  const SAC = ['Siyah', 'Kahverengi', 'Kumral', 'Sarı', 'Kızıl'];
  const GOZ = ['Kahverengi', 'Ela', 'Yeşil', 'Mavi', 'Siyah'];
  const DIL = ['İngilizce', 'Almanca', 'Fransızca', 'Rusça', 'Arapça', 'İspanyolca'];
  const BECERI = ['Dans', 'Şarkı', 'Yüzme', 'Binicilik', 'Dövüş sanatları', 'Piyano', 'Gitar', 'Aksan', 'Doğaçlama', 'Ehliyet', 'Kayak', 'Tenis'];
  const TUR = ['Manken', 'Oyuncu', 'Oyuncu', 'Figüran', 'Manken', 'Çocuk'];
  const RENK = [['#F3B562', '#E2557B'], ['#6A8DFF', '#9B5CF6'], ['#2EC4B6', '#3A86FF'], ['#FF8C61', '#CE4257'], ['#8AC926', '#1982C4'], ['#F15BB5', '#9B5DE5'], ['#FFCA3A', '#FF595E'], ['#00BBF9', '#00F5D4']];

  function sec(r, dizi) { return dizi[Math.floor(r() * dizi.length)]; }
  function birkac(r, dizi, en) {
    const k = dizi.slice().sort(() => r() - 0.5);
    return k.slice(0, Math.floor(r() * (en + 1)));
  }

  function yetenekUret(r, id, ajans, gunOnce) {
    const cins = r() < 0.55 ? 'Kadın' : 'Erkek';
    const tur = sec(r, TUR);
    const yas = tur === 'Çocuk' ? 6 + Math.floor(r() * 9) : 18 + Math.floor(r() * 32);
    const boy = tur === 'Çocuk' ? 115 + Math.floor(r() * 45)
      : cins === 'Kadın' ? (tur === 'Manken' ? 172 : 158) + Math.floor(r() * 14)
        : (tur === 'Manken' ? 182 : 168) + Math.floor(r() * 16);
    const ad = sec(r, cins === 'Kadın' ? KADIN : ERKEK);
    const soyad = sec(r, SOYAD);
    return {
      id, ajans,
      ad, soyad, cinsiyet: cins, tur, yas, boy,
      kilo: Math.round(boy - (cins === 'Kadın' ? 110 : 100) + (r() * 12 - 4)),
      sac: sec(r, SAC), goz: sec(r, GOZ), sehir: sec(r, SEHIR),
      diller: birkac(r, DIL, 2), beceriler: birkac(r, BECERI, 3),
      deneyim: tur === 'Figüran' ? 'Yeni' : sec(r, ['Yeni', 'Orta', 'Deneyimli', 'Deneyimli']),
      telefon: '05' + (30 + Math.floor(r() * 25)) + ' ' + (100 + Math.floor(r() * 900)) + ' ' + (10 + Math.floor(r() * 90)) + ' ' + (10 + Math.floor(r() * 90)),
      eposta: (ad + '.' + soyad).toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/i̇/g, 'i') + '@ornek.com',
      renk: sec(r, RENK),
      durum: 'onayli',
      eklenme: Date.now() - gunOnce * 86400000
    };
  }

  function ilkVeri() {
    const r = tohum(42);
    const ajanslar = [
      { id: 'a1', ad: 'Yıldız Casting', kisa: 'YC', slug: 'yildiz', renk: '#D9A441', sehir: 'İstanbul', plan: 'Pro', yetkili: 'Selin Arslan' },
      { id: 'a2', ad: 'Mavi Perde Ajans', kisa: 'MP', slug: 'maviperde', renk: '#4F8CFF', sehir: 'İzmir', plan: 'Başlangıç', yetkili: 'Kaan Demir' },
      { id: 'a3', ad: 'Sahne Işığı Casting', kisa: 'SI', slug: 'sahneisigi', renk: '#E2557B', sehir: 'Ankara', plan: 'Kurumsal', yetkili: 'Derin Koç' }
    ];
    const yetenekler = [];
    let n = 1;
    [['a1', 42], ['a2', 16], ['a3', 14]].forEach(([aj, adet]) => {
      for (let i = 0; i < adet; i++) yetenekler.push(yetenekUret(r, 'y' + n++, aj, Math.floor(r() * 120) + 3));
    });
    // Bekleyen başvurular (yeni gelmiş)
    for (let i = 0; i < 4; i++) {
      const y = yetenekUret(r, 'y' + n++, 'a1', i === 0 ? 0 : i);
      y.durum = 'bekliyor';
      yetenekler.push(y);
    }

    const a1 = yetenekler.filter(y => y.ajans === 'a1' && y.durum === 'onayli');
    const uygun = (kr) => a1.filter(y => y.cinsiyet === kr.cinsiyet && y.yas >= kr.yasMin && y.yas <= kr.yasMax && y.tur !== 'Çocuk');

    const projeler = [
      {
        id: 'p1', ajans: 'a1', ad: 'Kahve Markası TV Reklamı', musteri: 'Lumen Yapım', tur: 'Reklam',
        cekim: '2026-10-14', durum: 'Müşteride', olusturma: Date.now() - 6 * 86400000,
        roller: [
          { id: 'r1', ad: 'Genç anne', aciklama: 'Sıcak, doğal gülüşlü; mutfak sahnesi.', kriter: { cinsiyet: 'Kadın', yasMin: 26, yasMax: 38 } },
          { id: 'r2', ad: 'Baba', aciklama: 'Sakallı olabilir, sakin enerji.', kriter: { cinsiyet: 'Erkek', yasMin: 30, yasMax: 45 } }
        ],
        paket: { gonderildi: Date.now() - 2 * 86400000, goruldu: Date.now() - 86400000 }
      },
      {
        id: 'p2', ajans: 'a1', ad: '“Gece Yarısı” Dizisi — Konuk Rol', musteri: 'Atlas Film', tur: 'Dizi',
        cekim: '2026-10-22', durum: 'Aday topluyor', olusturma: Date.now() - 2 * 86400000,
        roller: [
          { id: 'r3', ad: 'Dedektif yardımcısı', aciklama: 'Atletik, aksiyon sahnesi var.', kriter: { cinsiyet: 'Erkek', yasMin: 24, yasMax: 34 } },
          { id: 'r4', ad: 'Gazeteci', aciklama: 'Hızlı konuşan, keskin bakışlı.', kriter: { cinsiyet: 'Kadın', yasMin: 25, yasMax: 40 } }
        ],
        paket: null
      },
      {
        id: 'p3', ajans: 'a1', ad: 'Spor Giyim Katalog Çekimi', musteri: 'Nova Ajans', tur: 'Katalog',
        cekim: '2026-09-18', durum: 'Tamamlandı', olusturma: Date.now() - 30 * 86400000,
        roller: [{ id: 'r5', ad: 'Kadın model', aciklama: '', kriter: { cinsiyet: 'Kadın', yasMin: 18, yasMax: 28 } }],
        paket: { gonderildi: Date.now() - 25 * 86400000, goruldu: Date.now() - 24 * 86400000 }
      }
    ];
    // Rollere aday yerleştir
    const aday = (rol, adet, durumlar) => {
      rol.adaylar = uygun(rol.kriter).slice(0, adet).map((y, i) => ({ yetenek: y.id, durum: (durumlar && durumlar[i]) || 'aday', not: '' }));
    };
    aday(projeler[0].roller[0], 5, ['begenildi', 'aday', 'begenildi', 'elendi', 'aday']);
    aday(projeler[0].roller[1], 4, ['aday', 'begenildi']);
    projeler[0].roller[0].adaylar[0].not = 'Çok doğal, bunu görüşmeye çağıralım.';
    aday(projeler[1].roller[0], 2);
    aday(projeler[1].roller[1], 1);
    aday(projeler[2].roller[0], 4, ['secildi', 'elendi', 'elendi', 'begenildi']);

    const hareketler = [
      { ne: 'Lumen Yapım paketi açtı', proje: 'p1', zaman: Date.now() - 86400000 },
      { ne: 'Lumen Yapım 3 adayı beğendi', proje: 'p1', zaman: Date.now() - 80000000 },
      { ne: 'Yeni başvuru geldi', zaman: Date.now() - 3600000 },
      { ne: '“Gece Yarısı” projesi oluşturuldu', proje: 'p2', zaman: Date.now() - 2 * 86400000 }
    ];

    return { surum: 1, aktifAjans: 'a1', ajanslar, yetenekler, projeler, hareketler, sayac: n };
  }

  const H = {
    db: null,
    yukle() {
      try { const s = localStorage.getItem(ANAHTAR); if (s) { this.db = JSON.parse(s); return; } } catch (e) { }
      this.db = ilkVeri();
      this.kaydet();
    },
    kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(this.db)); } catch (e) { } },
    sifirla() { this.db = ilkVeri(); this.kaydet(); },
    ajans(id) { return this.db.ajanslar.find(a => a.id === (id || this.db.aktifAjans)); },
    ajansSlug(slug) { return this.db.ajanslar.find(a => a.slug === slug); },
    yetenek(id) { return this.db.yetenekler.find(y => y.id === id); },
    proje(id) { return this.db.projeler.find(p => p.id === id); },
    yeniId(on) { return on + (this.db.sayac++); },
    hareket(ne, proje) { this.db.hareketler.unshift({ ne, proje, zaman: Date.now() }); this.db.hareketler = this.db.hareketler.slice(0, 40); },
    uyarMi(y, kr) { return y.cinsiyet === kr.cinsiyet && y.yas >= kr.yasMin && y.yas <= kr.yasMax; }
  };

  // Başka sekmede (ör. paket ekranı) değişiklik olursa yenile.
  window.addEventListener('storage', e => {
    if (e.key === ANAHTAR) { H.yukle(); if (typeof H.degisti === 'function') H.degisti(); }
  });

  H.yukle();
  window.H = H;
})();
