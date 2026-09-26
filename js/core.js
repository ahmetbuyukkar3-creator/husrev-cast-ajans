/* Hüsrev Cast Ajans taslak — ortak yardımcılar, sabitler, kayıt soruları */
window.C = window.C || {};
(function (C) {
  'use strict';

  // ---------- küçük yardımcılar ----------
  C.esc = function (v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };
  C.uid = function (p) { return (p || 'id') + Math.random().toString(36).slice(2, 9); };
  C.token = function () { return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6); };
  C.hash = function (s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); };

  C.today = function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  C.iso = function (d) { var z = function (n) { return n < 10 ? '0' + n : n; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };
  C.addDays = function (n) { var d = C.today(); d.setDate(d.getDate() + n); return C.iso(d); };
  C.parse = function (s) { if (!s) return null; var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  C.AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  C.GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  C.fmtDate = function (s, withDay) {
    var d = C.parse(s); if (!d) return '—';
    var out = d.getDate() + ' ' + C.AYLAR[d.getMonth()] + ' ' + d.getFullYear();
    if (withDay) out = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][d.getDay()] + ', ' + out;
    return out;
  };
  C.fmtShort = function (s) { var d = C.parse(s); return d ? d.getDate() + ' ' + C.AYLAR[d.getMonth()].slice(0, 3) : '—'; };
  C.age = function (s) {
    var d = C.parse(s); if (!d) return null;
    var t = new Date(), a = t.getFullYear() - d.getFullYear();
    if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
    return a;
  };
  C.daysFromNow = function (s) { var d = C.parse(s); return d ? Math.round((d - C.today()) / 86400000) : null; };
  C.money = function (n) { return n || n === 0 ? Number(n).toLocaleString('tr-TR') + ' ₺' : '—'; };
  C.norm = function (s) { return String(s || '').toLocaleLowerCase('tr-TR'); };

  // ---------- ikonlar (elle çizilmiş, 24px çizgi) ----------
  var P = {
    panel: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13l2.5 8v6H3v-6z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevL: '<path d="M15 6l-6 6 6 6"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.9 3.9L20 16M20 20v-4h-4"/>'
  };
  C.icon = function (name, size) {
    var s = size || 18;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
  };

  // ---------- yer tutucu portre (gerçek fotoğraf yoksa) ----------
  C.portrait = function (seed, v, gender) {
    var h = (C.hash(seed) + (v || 0) * 53) % 360;
    var b1 = 'hsl(' + h + ',22%,84%)', b2 = 'hsl(' + ((h + 28) % 360) + ',26%,66%)';
    var fg = 'hsl(' + h + ',24%,34%)', hair = 'hsl(' + ((h + 200) % 360) + ',18%,24%)';
    var female = gender === 'Kadın';
    var hairPath = female
      ? '<path d="M86 172c0-62 28-100 64-100s64 38 64 100v92c-18 12-40 14-64 14s-46-2-64-14z" fill="' + hair + '" opacity=".72"/>'
      : '<path d="M98 146c0-42 22-72 52-72s52 30 52 72c-8-18-26-28-52-28s-44 10-52 28z" fill="' + hair + '" opacity=".8"/>';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + b1 + '"/><stop offset="1" stop-color="' + b2 + '"/></linearGradient></defs>' +
      '<rect width="300" height="400" fill="url(#g)"/>' +
      '<path d="M34 400c8-86 54-128 116-128s108 42 116 128z" fill="' + fg + '" opacity=".55"/>' +
      '<rect x="132" y="220" width="36" height="60" rx="16" fill="hsl(' + ((h + 20) % 360) + ',18%,58%)"/>' +
      (female ? hairPath : '') + '<ellipse cx="150" cy="170" rx="50" ry="62" fill="hsl(' + ((h + 20) % 360) + ',20%,' + (female ? 70 : 64) + '%)"/>' + (female ? '' : hairPath) +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  // fotoğraf değeri: gerçek dataURL ya da "ph:<v>"
  C.photo = function (t, i) {
    var list = (t.c && t.c.fotograflar) || [];
    var src = list[i || 0];
    if (!src) src = 'ph:' + (i || 0);
    if (src.indexOf('ph:') === 0) return C.portrait(t.id, +src.slice(3), t.c.cinsiyet);
    return src;
  };
  C.photoCount = function (t) { return ((t.c && t.c.fotograflar) || []).length; };

  // ---------- roller ve yetkiler ----------
  C.ROLES = {
    yonetici: { ad: 'Yönetici', edit: true, contact: true, users: true, not: 'Her şey + kullanıcı yönetimi' },
    cast: { ad: 'Cast Direktörü', edit: true, contact: true, not: 'Yetenek, proje, paket, takvim (taslak — A-4b)' },
    finans: { ad: 'Finans', edit: false, contact: true, not: 'Sadece görüntüleme (K-005)' },
    temsilci: { ad: 'Müşteri Temsilcisi', edit: true, contact: true, ownClients: true, not: 'Sadece kendine atanan müşterilerin projeleri (taslak — A-4b)' },
    kisitli: { ad: 'Kısıtlı Kullanıcı', edit: false, contact: false, not: 'Düzenleyemez (K-005); iletişim bilgisi gizli (taslak — A-4a)' }
  };

  // ---------- durum sözlükleri ----------
  C.PROJE_DURUM = [
    { k: 'aktif', ad: 'Aktif', renk: 'blue' },
    { k: 'teklif_bekleyen', ad: 'Teklif Bekleyen', renk: 'amber' },
    { k: 'teklif_yapilan', ad: 'Teklif Yapılan', renk: 'indigo' },
    { k: 'onay_bekleyen', ad: 'Onay Bekleyen', renk: 'amber' },
    { k: 'onaylanan', ad: 'Onaylanan', renk: 'green' },
    { k: 'onaylanmayan', ad: 'Onaylanmayan', renk: 'red' }
  ];
  C.ADAY_DURUM = [
    { k: 'onerildi', ad: 'Önerildi', renk: 'gray' },
    { k: 'musteri_secti', ad: 'Müşteri seçti', renk: 'green' },
    { k: 'musteri_reddetti', ad: 'Müşteri uygun bulmadı', renk: 'red' },
    { k: 'kesinlesti', ad: 'Kesinleşti', renk: 'blue' }
  ];
  C.UYGUNLUK = [
    { k: 'musait', ad: 'Müsait', renk: 'green' },
    { k: 'mesgul', ad: 'Meşgul', renk: 'amber' },
    { k: 'pasif', ad: 'Pasif', renk: 'gray' }
  ];
  C.ETKINLIK = [
    { k: 'cekim', ad: 'Çekim', renk: 'green' },
    { k: 'prova', ad: 'Prova', renk: 'indigo' },
    { k: 'casting', ad: 'Casting', renk: 'blue' },
    { k: 'toplanti', ad: 'Toplantı', renk: 'amber' }
  ];
  C.find = function (list, k) { for (var i = 0; i < list.length; i++) if (list[i].k === k) return list[i]; return { k: k, ad: k, renk: 'gray' }; };
  C.badge = function (list, k) { var d = C.find(list, k); return '<span class="badge b-' + d.renk + '">' + C.esc(d.ad) + '</span>'; };

  C.SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Eskişehir', 'Muğla', 'Adana', 'Diğer'];
  C.IS_TURLERI = ['Reklam filmi', 'Dizi', 'Sinema filmi', 'Kısa film', 'Katalog çekimi', 'Defile', 'Klip', 'Etkinlik / Tanıtım', 'Diğer'];

  // ---------- KAYIT SORULARI ----------
  // Soru listesi tek yerden yönetilir: form, profil ve paket bu listeden çizilir.
  // Yeni soru eklemek = buraya bir satır eklemek (ileride panelden — B-6c açık).
  var EHH = ['Evet', 'Hayır', 'Görüşülür'];
  C.TEMEL_SORULAR = [
    { id: 'kisisel', ad: 'Kişisel Bilgiler', aciklama: 'Size ulaşabilmemiz için temel bilgiler.', alanlar: [
      { k: 'ad', ad: 'Ad', tip: 'text', zorunlu: true, yarim: true },
      { k: 'soyad', ad: 'Soyad', tip: 'text', zorunlu: true, yarim: true },
      { k: 'cinsiyet', ad: 'Cinsiyet', tip: 'select', secenek: ['Kadın', 'Erkek', 'Belirtmek istemiyorum'], zorunlu: true, yarim: true },
      { k: 'dogumTarihi', ad: 'Doğum tarihi', tip: 'date', zorunlu: true, yarim: true },
      { k: 'sehir', ad: 'Yaşadığınız şehir', tip: 'select', secenek: C.SEHIRLER, zorunlu: true, yarim: true },
      { k: 'musaitlik', ad: 'Genel müsaitlik', tip: 'select', secenek: ['Her zaman', 'Hafta içi', 'Hafta sonu', 'Görüşülür'], zorunlu: true, yarim: true },
      { k: 'telefon', ad: 'Telefon', tip: 'tel', zorunlu: true, yarim: true, iletisim: true, ipucu: '05xx xxx xx xx' },
      { k: 'eposta', ad: 'E-posta', tip: 'email', zorunlu: true, yarim: true, iletisim: true },
      { k: 'instagram', ad: 'Instagram', tip: 'text', yarim: true, iletisim: true, ipucu: '@kullaniciadi' },
      { k: 'kategoriler', ad: 'Hangi alanlarda çalışmak istiyorsunuz?', tip: 'multi', secenek: ['Manken', 'Oyuncu', 'Figüran', 'Fotomodel', 'Dansçı'], zorunlu: true }
    ]},
    { id: 'fiziksel', ad: 'Fiziksel Özellikler', aciklama: 'Doğru işle eşleşmeniz için ölçülerinizi eksiksiz girin.', alanlar: [
      { k: 'boy', ad: 'Boy', tip: 'number', birim: 'cm', zorunlu: true, ceyrek: true },
      { k: 'kilo', ad: 'Kilo', tip: 'number', birim: 'kg', zorunlu: true, ceyrek: true },
      { k: 'beden', ad: 'Beden', tip: 'select', secenek: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], zorunlu: true, ceyrek: true },
      { k: 'ayakkabi', ad: 'Ayakkabı', tip: 'number', birim: 'no', zorunlu: true, ceyrek: true },
      { k: 'gogus', ad: 'Göğüs', tip: 'number', birim: 'cm', ceyrek: true },
      { k: 'bel', ad: 'Bel', tip: 'number', birim: 'cm', ceyrek: true },
      { k: 'kalca', ad: 'Kalça', tip: 'number', birim: 'cm', ceyrek: true },
      { k: 'ten', ad: 'Ten rengi', tip: 'select', secenek: ['Açık', 'Buğday', 'Esmer', 'Koyu'], ceyrek: true },
      { k: 'sacRengi', ad: 'Saç rengi', tip: 'select', secenek: ['Siyah', 'Koyu kahve', 'Açık kahve', 'Kumral', 'Sarı', 'Kızıl', 'Gri / Beyaz', 'Boyalı / Renkli'], zorunlu: true, yarim: true },
      { k: 'sacUzunlugu', ad: 'Saç uzunluğu', tip: 'select', secenek: ['Kazıtılmış', 'Kısa', 'Orta', 'Uzun', 'Çok uzun'], zorunlu: true, yarim: true },
      { k: 'gozRengi', ad: 'Göz rengi', tip: 'select', secenek: ['Kahverengi', 'Ela', 'Yeşil', 'Mavi', 'Gri', 'Siyah'], zorunlu: true, yarim: true },
      { k: 'dovme', ad: 'Dövme', tip: 'select', secenek: ['Yok', 'Var — kapatılabilir', 'Var — görünür yerde'], zorunlu: true, yarim: true },
      { k: 'piercing', ad: 'Piercing', tip: 'select', secenek: ['Yok', 'Var — çıkarılabilir', 'Var — kalıcı'], yarim: true },
      { k: 'ozelIz', ad: 'Belirgin iz / özel işaret', tip: 'text', yarim: true, ipucu: 'Örn. yara izi, doğum lekesi' }
    ]},
    { id: 'egitim', ad: 'Eğitim ve Oyunculuk', aciklama: 'Eğitiminiz, deneyiminiz ve özel becerileriniz.', alanlar: [
      { k: 'egitimDurumu', ad: 'Eğitim durumu', tip: 'select', secenek: ['İlköğretim', 'Lise', 'Ön lisans', 'Lisans', 'Yüksek lisans', 'Öğrenci'], zorunlu: true, yarim: true },
      { k: 'okul', ad: 'Okul / bölüm', tip: 'text', yarim: true },
      { k: 'oyunculukEgitimi', ad: 'Oyunculuk eğitimi', tip: 'select', secenek: ['Yok', 'Kurs / atölye', 'Özel ders', 'Konservatuvar'], zorunlu: true, yarim: true },
      { k: 'oyunculukDetay', ad: 'Eğitimi nereden aldınız?', tip: 'text', yarim: true },
      { k: 'deneyim', ad: 'Rol aldığınız yapımlar', tip: 'textarea', ipucu: 'Yapım adı, yıl ve rolünüz. Deneyiminiz yoksa boş bırakın.' },
      { k: 'diller', ad: 'Konuştuğunuz diller', tip: 'multi', secenek: ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Rusça', 'Arapça', 'İspanyolca', 'İtalyanca'], zorunlu: true },
      { k: 'beceriler', ad: 'Özel beceriler', tip: 'multi', secenek: ['Dans', 'Şarkı', 'Enstrüman', 'Yüzme', 'Binicilik', 'Dövüş sanatları', 'Profesyonel spor', 'Şive / aksan', 'B sınıfı ehliyet', 'Motosiklet ehliyeti'] }
    ]},
    { id: 'tavizler', ad: 'Rol İçin Tavizler', aciklama: 'Bir rol için neleri kabul edebileceğinizi işaretleyin. Kararınızı her iş öncesi ayrıca teyit ederiz.', alanlar: [
      { k: 'sacKesim', ad: 'Rol için saçımı kestirebilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'sacBoya', ad: 'Rol için saçımı boyatabilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'sakal', ad: 'Sakal / bıyık kesebilir veya uzatabilirim', tip: 'tri', secenek: EHH },
      { k: 'kiloDegisim', ad: 'Rol için kilo alıp verebilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'mayo', ad: 'Mayo / iç giyim çekimine katılabilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'opusme', ad: 'Öpüşme sahnesinde oynayabilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'geceCekim', ad: 'Gece çekimine katılabilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'sehirDisi', ad: 'Şehir dışı çekime gidebilirim', tip: 'tri', secenek: EHH, zorunlu: true },
      { k: 'yurtDisi', ad: 'Yurt dışı çekime gidebilirim', tip: 'tri', secenek: EHH }
    ]},
    { id: 'medya', ad: 'Fotoğraf ve Video', aciklama: 'Yüz ve boy fotoğrafı en az birer tane olsun. Filtresiz, doğal ışıkta çekilmiş fotoğraflar tercih edilir.', alanlar: [
      { k: 'fotograflar', ad: 'Fotoğraflar (en fazla 6)', tip: 'photos', zorunlu: true },
      { k: 'video', ad: 'Tanıtım videosu linki', tip: 'url', ipucu: 'YouTube, Vimeo veya Google Drive linki' }
    ]},
    { id: 'riza', ad: 'Onay', aciklama: 'Kişisel verilerinizin işlenmesine ilişkin onaylar.', alanlar: [
      { k: 'kvkk', ad: 'Kişisel verilerimin, casting süreçlerinde değerlendirilmek ve yapım şirketlerine aday olarak sunulmak amacıyla Hüsrev Cast Ajans tarafından işlenmesine açık rıza veriyorum.', tip: 'bool', zorunlu: true, rizaMetni: true },
      { k: 'iletisimIzni', ad: 'İş ve casting duyuruları için benimle telefon / e-posta yoluyla iletişime geçilmesine izin veriyorum.', tip: 'bool' }
    ]}
  ];
  // Yöneticinin panelden eklediği sorular (K-011) temel listeye bölüm bölüm eklenir
  C.EK_SORU_BOLUMLERI = ['kisisel', 'fiziksel', 'egitim', 'tavizler'];
  C.sorulariKur = function (ek) {
    C.SORULAR = C.TEMEL_SORULAR.map(function (b) {
      var ekler = (ek || []).filter(function (q) { return q.bolum === b.id; }).map(function (q) { var c = JSON.parse(JSON.stringify(q)); c.ozel = true; return c; });
      return { id: b.id, ad: b.ad, aciklama: b.aciklama, alanlar: b.alanlar.concat(ekler) };
    });
  };
  C.sorulariKur([]);

  // Aday şifresi: taslakta bile düz metin saklanmaz
  C.sifreOzet = function (sifre) {
    var metin = 'husrev:' + sifre;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(metin)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    return Promise.resolve('h' + C.hash(metin));
  };

  C.alan = function (k) {
    for (var i = 0; i < C.SORULAR.length; i++) for (var j = 0; j < C.SORULAR[i].alanlar.length; j++) if (C.SORULAR[i].alanlar[j].k === k) return C.SORULAR[i].alanlar[j];
    return null;
  };
  C.bolum = function (id) { for (var i = 0; i < C.SORULAR.length; i++) if (C.SORULAR[i].id === id) return C.SORULAR[i]; return null; };
  C.deger = function (t, k) {
    var f = C.alan(k), v = t.c ? t.c[k] : undefined;
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return '—';
    if (Array.isArray(v)) return v.join(', ');
    if (f && f.tip === 'bool') return v ? 'Evet' : 'Hayır';
    if (f && f.birim) return v + ' ' + f.birim;
    if (f && f.tip === 'date') return C.fmtDate(v);
    return v;
  };
  C.adSoyad = function (t) { return (t.c.ad || '') + ' ' + (t.c.soyad || ''); };
})(window.C);
