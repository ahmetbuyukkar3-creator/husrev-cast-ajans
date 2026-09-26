/* Hüsrev Cast Ajans — Manken aday sitesi. Veri panelle ortak (aynı adres, aynı tarayıcı hafızası). */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;
  var AZ_HAREKET = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DOKUNMATIK = window.matchMedia && matchMedia('(hover: none)').matches;

  C.load();

  var home = document.getElementById('home');
  var page = document.getElementById('page');

  // ============ açılış ============
  function acilisBitir() { document.body.classList.add('ready'); var l = document.getElementById('loader'); if (l) setTimeout(function () { l.remove(); }, 900); }
  window.addEventListener('load', function () { setTimeout(acilisBitir, AZ_HAREKET ? 0 : 650); });
  setTimeout(acilisBitir, 2500); // yedek

  // ============ gezinme ============
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');
  function kaydirma() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 30);
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    adimCizgisi();
  }
  window.addEventListener('scroll', kaydirma, { passive: true });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-to]');
    if (!a) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    var hedef = a.getAttribute('data-to');
    var git = function () { var el = document.getElementById(hedef); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: AZ_HAREKET ? 'auto' : 'smooth' }); };
    if (location.hash && location.hash !== '#/' && location.hash !== '#') { location.hash = '#/'; setTimeout(git, 80); } else git();
  });
  document.getElementById('burger').onclick = function () { document.body.classList.toggle('menu-open'); };

  // imleç ışığı
  var glow = document.getElementById('glow');
  if (!DOKUNMATIK && !AZ_HAREKET) {
    var gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = 'translate(' + (gx - 300) + 'px,' + (gy - 300) + 'px)'; requestAnimationFrame(loop); })();
  } else glow.remove();

  // ============ kaydırınca beliren öğeler ============
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (list) {
    list.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;
  function gozle(kok) { (kok || document).querySelectorAll('[data-reveal]:not(.in)').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); }); }

  // ============ eğilme ve spot ışığı ============
  function etkilesim(kok) {
    if (DOKUNMATIK || AZ_HAREKET) return;
    (kok || document).querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 12) + 'deg) translateZ(0)';
        el.style.setProperty('--gx', (x + 0.5) * 100 + '%'); el.style.setProperty('--gy', (y + 0.5) * 100 + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    (kok || document).querySelectorAll('[data-spot]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ============ adım çizgisi (kaydırmaya bağlı çizilir) ============
  var stepsPath = document.getElementById('stepsPath'), steps = document.getElementById('steps'), pathLen = 0;
  if (stepsPath) { pathLen = stepsPath.getTotalLength(); stepsPath.style.strokeDasharray = pathLen; stepsPath.style.strokeDashoffset = pathLen; }
  function adimCizgisi() {
    if (!stepsPath || home.hidden) return;
    var r = steps.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    stepsPath.style.strokeDashoffset = pathLen * (1 - p);
  }

  // ============ DİJİTAL KART gösterisi ============
  function kart() {
    var ornekler = [
      { ad: 'Ada K.', meta: '24 · İstanbul · Manken', boy: 178, attrs: [['Beden', 'S'], ['Ayakkabı', '39'], ['Göz', 'Ela'], ['Saç', 'Koyu kahve, uzun'], ['Diller', 'TR · EN'], ['Saç kesimi', 'Evet']], durum: 'İnceleniyor' },
      { ad: 'Mert Y.', meta: '27 · İzmir · Fotomodel', boy: 186, attrs: [['Beden', 'L'], ['Ayakkabı', '44'], ['Göz', 'Yeşil'], ['Saç', 'Siyah, kısa'], ['Diller', 'TR · DE'], ['Gece çekimi', 'Evet']], durum: 'Onaylandı' },
      { ad: 'Lina S.', meta: '21 · Antalya · Defile', boy: 181, attrs: [['Beden', 'XS'], ['Ayakkabı', '40'], ['Göz', 'Mavi'], ['Saç', 'Sarı, çok uzun'], ['Diller', 'TR · EN · RU'], ['Şehir dışı', 'Evet']], durum: 'Castinge çağrıldı' }
    ];
    var ad = document.getElementById('compName'), meta = document.getElementById('compMeta'), attrs = document.getElementById('compAttrs');
    var st = document.getElementById('compState'), boyTxt = document.getElementById('boyTxt'), mark = document.getElementById('rulerMark');
    var comp = document.getElementById('comp'), i = 0;
    function goster(o) {
      comp.classList.remove('swap'); void comp.offsetWidth; comp.classList.add('swap');
      ad.textContent = o.ad; meta.textContent = o.meta;
      st.textContent = o.durum; st.className = 'comp-state s' + ornekler.indexOf(o);
      attrs.innerHTML = o.attrs.map(function (a, k) { return '<div style="--d:' + (0.15 + k * 0.09) + 's"><dt>' + esc(a[0]) + '</dt><dd>' + esc(a[1]) + '</dd></div>'; }).join('');
      // boy cetveli: 150–200 cm arası
      var oran = (o.boy - 150) / 50;
      mark.style.bottom = (8 + oran * 78) + '%';
      var bas = 150, t0 = performance.now();
      (function say(t) { var p = Math.max(0, Math.min(1, (t - t0) / 900)); boyTxt.textContent = Math.round(bas + (o.boy - bas) * (1 - Math.pow(1 - p, 3))) + ' cm'; if (p < 1) requestAnimationFrame(say); })(t0);
    }
    goster(ornekler[0]);
    if (!AZ_HAREKET) setInterval(function () { if (document.hidden) return; i = (i + 1) % ornekler.length; goster(ornekler[i]); }, 4200);
    // zaman kodu
    var tc = document.getElementById('tc'), s = 0;
    setInterval(function () { s++; var z = function (n) { return n < 10 ? '0' + n : n; }; tc.textContent = '00:' + z(Math.floor(s / 60)) + ':' + z(s % 60); }, 1000);
    // cetvel çizgileri
    var ticks = comp.querySelector('.ticks'), h = '';
    for (var k = 0; k <= 50; k++) h += '<i class="' + (k % 10 === 0 ? 'l' : k % 5 === 0 ? 'm' : '') + '"></i>';
    ticks.innerHTML = h;
  }

  // ============ SAYFALAR ============
  function sayfaGoster(html, sinif) {
    home.hidden = true; page.hidden = false;
    page.className = 'page ' + (sinif || '');
    page.innerHTML = html;
    window.scrollTo(0, 0);
    gozle(page); etkilesim(page);
  }
  function anaSayfa() { page.hidden = true; page.innerHTML = ''; home.hidden = false; kaydirma(); }

  var HESAP_BOLUMU = {
    id: 'hesap', ad: 'Hesabın', aciklama: 'Başvurunu takip etmek ve bilgilerini sonradan güncellemek için bir şifre belirle. Girişte e-posta adresini kullanacaksın.',
    alanlar: [
      { k: 'sifre', ad: 'Şifre', tip: 'password', zorunlu: true, yarim: true, ipucu: 'En az 6 karakter' },
      { k: 'sifre2', ad: 'Şifre (tekrar)', tip: 'password', zorunlu: true, yarim: true }
    ]
  };
  var IPUCLARI = {
    kisisel: 'Adını ve iletişim bilgilerini doğru yaz; seni bu bilgilerle arayacağız.',
    fiziksel: 'Ölçülerini güncel gir. Emin değilsen bir mezura ile yeniden ölç.',
    egitim: 'Deneyimin yoksa sorun değil; o alanı boş bırakabilirsin.',
    tavizler: 'Dürüst cevap ver. Her iş öncesi seninle ayrıca teyit ederiz.',
    medya: 'Gün ışığında, filtresiz fotoğraflar seçil. En az bir yüz, bir boy fotoğrafı.',
    hesap: 'Şifreni kimseyle paylaşma. Girişte e-posta adresin kullanılır.',
    riza: 'Onay vermeden başvurunu değerlendiremeyiz.'
  };

  function adimListesi(bolumler, aktif) {
    return bolumler.map(function (b, i) { return '<li class="' + (i < aktif ? 'done' : i === aktif ? 'cur' : '') + '"><span>' + (i < aktif ? '✓' : (i + 1)) + '</span>' + esc(b.ad) + '</li>'; }).join('');
  }

  function basvuruSayfasi() {
    var ben = C.adayBen();
    if (ben) { location.hash = '#/basvurum'; return; }
    var bolumler = C.SORULAR.filter(function (b) { return b.id !== 'riza'; }).concat([HESAP_BOLUMU, C.bolum('riza')]);
    sayfaGoster(
      '<div class="apply">' +
        '<aside class="apply-side">' +
          '<div class="apply-side-in">' +
            '<div class="apply-mark"><img class="yuz" src="img/ajans-yuz.jpg" alt=""><i></i></div>' +
            '<h1>Hüsrev Cast<br><span class="grad">aday başvurusu</span></h1>' +
            '<ol class="apply-steps" id="aSteps">' + adimListesi(bolumler, 0) + '</ol>' +
            '<p class="apply-tip" id="aTip">' + esc(IPUCLARI.kisisel) + '</p>' +
            '<a class="apply-login" href="#/giris">Daha önce başvurdun mu? <b>Giriş yap</b></a>' +
          '</div>' +
        '</aside>' +
        '<div class="apply-main"><div class="aform" id="aForm"></div></div>' +
      '</div>', 'p-apply');

    var kok = document.getElementById('aForm');
    C.soruFormu({
      kok: kok, degerler: { fotograflar: [] }, kayitModu: 'aday', bolumler: bolumler,
      onAdim: function (a) {
        document.getElementById('aSteps').innerHTML = adimListesi(bolumler, a);
        document.getElementById('aTip').textContent = IPUCLARI[bolumler[a].id] || '';
      },
      dogrula: function (bid, v) {
        if (bid === 'kisisel' && C.hesapBul(v.eposta)) return 'Bu e-posta adresiyle zaten bir başvuru var. Soldaki “Giriş yap” bağlantısını kullan.';
        if (bid === 'hesap') {
          if ((v.sifre || '').length < 6) return 'Şifre en az 6 karakter olmalı.';
          if (v.sifre !== v.sifre2) return 'Şifreler birbiriyle aynı değil.';
        }
        return '';
      },
      onKaydet: function (v) {
        var sifre = v.sifre; delete v.sifre; delete v.sifre2;
        C.sifreOzet(sifre).then(function (ozet) {
          var t = {
            id: C.uid('t'), durum: 'basvuru', kaynak: 'kayit', olusturma: C.addDays(0), rizaTarihi: C.addDays(0),
            uygunluk: 'musait', etiketler: ['Yeni yüz'], notlar: '', c: v, hesap: { eposta: v.eposta, sifre: ozet }
          };
          C.db.talents.push(t);
          if (!C.save()) { C.db.talents.pop(); return; }
          C.adayGiris(t.id);
          basariEkrani(t);
        });
      }
    });
    // form her adımda yeniden çizildiği için beliren öğeleri yeniden bağla
    new MutationObserver(function () { etkilesim(kok); }).observe(kok, { childList: true });
  }

  function basariEkrani(t) {
    sayfaGoster(
      '<div class="done">' +
        '<canvas id="burst" aria-hidden="true"></canvas>' +
        '<div class="done-in" data-reveal>' +
          '<div class="done-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><path d="M38 62l15 15 30-32"/></svg></div>' +
          '<h1>Başvurun alındı, <span class="grad">' + esc(t.c.ad) + '</span>.</h1>' +
          '<p>Hüsrev Cast Ajans ekibi profilini inceleyecek. Onaylandığında yetenek havuzumuza gireceksin; sana uygun bir iş olduğunda seni arayacağız.</p>' +
          '<div class="done-cta"><a class="btn-glow" href="#/basvurum"><span>Başvuruma git</span></a><a class="btn-line" href="#/">Ana sayfa</a></div>' +
        '</div>' +
      '</div>', 'p-done');
    patlama(document.getElementById('burst'));
  }

  function patlama(cv) {
    if (!cv || AZ_HAREKET) return;
    var ctx = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight, p = [];
    for (var i = 0; i < 260; i++) { var a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 9; p.push({ x: W / 2, y: H * 0.36, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, s: 1 + Math.random() * 3, c: Math.random() > 0.5 ? '19,198,220' : Math.random() > 0.5 ? '10,120,194' : '230,250,255', l: 1 }); }
    (function f() {
      ctx.clearRect(0, 0, W, H); var canli = 0;
      p.forEach(function (q) { q.vy += 0.12; q.vx *= 0.985; q.x += q.vx; q.y += q.vy; q.l -= 0.008; if (q.l > 0) { canli++; ctx.fillStyle = 'rgba(' + q.c + ',' + q.l + ')'; ctx.fillRect(q.x, q.y, q.s, q.s); } });
      if (canli) requestAnimationFrame(f);
    })();
  }

  function girisSayfasi() {
    if (C.adayBen()) { location.hash = '#/basvurum'; return; }
    sayfaGoster(
      '<div class="login-wrap">' +
        '<div class="login-rings" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<form class="login-card" id="lf" data-reveal novalidate>' +
          '<img class="login-mark yuz" src="img/ajans-yuz.jpg" alt="">' +
          '<h1>Başvuruna giriş</h1><p>Başvuru sırasında belirlediğin e-posta ve şifreyle giriş yap.</p>' +
          '<label>E-posta<input type="email" name="eposta" autocomplete="username" required></label>' +
          '<label>Şifre<input type="password" name="sifre" autocomplete="current-password" required></label>' +
          '<div class="form-err" id="lErr" hidden></div>' +
          '<button class="btn-glow wide" type="submit"><span>Giriş yap</span></button>' +
          '<p class="login-alt">Henüz başvurmadın mı? <a href="#/basvur">Hemen başvur</a></p>' +
          '<p class="demo">Taslak deneme hesabı: <code>elif.aydin@ornek.com</code> / <code>husrev123</code></p>' +
        '</form>' +
      '</div>', 'p-login');
    document.getElementById('lf').onsubmit = function (e) {
      e.preventDefault();
      var f = e.target, er = document.getElementById('lErr');
      var t = C.hesapBul(f.eposta.value);
      var hata = function (m) { er.hidden = false; er.textContent = m; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); };
      if (!t || !t.hesap) return hata('Bu e-posta ile bir hesap bulamadık.');
      C.sifreOzet(f.sifre.value).then(function (oz) {
        if (oz !== t.hesap.sifre) return hata('Şifre hatalı.');
        C.adayGiris(t.id); location.hash = '#/basvurum';
      });
    };
  }

  var DURUM = {
    basvuru: { ad: 'İnceleniyor', adim: 1, metin: 'Başvurun Hüsrev Cast Ajans ekibine ulaştı ve inceleniyor. Onaylandığında burada göreceksin.' },
    aktif: { ad: 'Onaylandı', adim: 2, metin: 'Tebrikler! Yetenek havuzumuzdasın. Sana uygun bir iş olduğunda seni arayacağız.' },
    reddedildi: { ad: 'Değerlendirildi', adim: 1, metin: 'Başvurun değerlendirildi. Şu an için sana uygun bir proje bulunmuyor; bilgilerini güncel tutarsan yeniden değerlendirilirsin.' }
  };

  function basvurumSayfasi() {
    var t = C.adayBen();
    if (!t) { location.hash = '#/giris'; return; }
    var d = DURUM[t.durum] || DURUM.basvuru, c = t.c;
    var projeSay = C.db.projects.filter(function (p) { return p.adaylar.some(function (a) { return a.t === t.id; }); }).length;
    var zaman = [['Başvuru alındı', 0], ['İnceleniyor', 1], ['Onaylandı', 2], ['Castinge çağrıldın', 3]];
    var adimNo = t.durum === 'aktif' && projeSay ? 3 : d.adim;
    var foto = C.photo(t, 0);
    sayfaGoster(
      '<div class="me-wrap">' +
        '<section class="me-head" data-reveal>' +
          '<div class="me-photo"><img src="' + foto + '" alt=""><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="94"/></svg></div>' +
          '<div class="me-id"><span class="eyebrow">Başvurum</span><h1>' + esc(C.adSoyad(t)) + '</h1>' +
            '<p>' + esc(C.age(c.dogumTarihi)) + ' yaş · ' + esc(c.sehir) + ' · ' + esc((c.kategoriler || []).join(', ')) + '</p>' +
            '<span class="me-state s-' + t.durum + '"><i></i>' + esc(d.ad) + '</span></div>' +
          '<div class="me-act"><a class="btn-glow" href="#/basvurum/duzenle"><span>Bilgilerimi güncelle</span></a><button class="btn-line" id="cikis">Çıkış yap</button></div>' +
        '</section>' +
        '<section class="me-card" data-reveal style="--d:.1s"><h2>Başvuru durumu</h2><p class="muted">' + esc(d.metin) + '</p>' +
          '<ol class="timeline">' + zaman.map(function (z) { return '<li class="' + (z[1] < adimNo ? 'done' : z[1] === adimNo ? 'cur' : '') + (t.durum === 'reddedildi' && z[1] >= 1 ? ' off' : '') + '"><i></i><span>' + esc(z[0]) + '</span></li>'; }).join('') + '</ol>' +
          (t.adayGuncelleme ? '<p class="me-upd">Son güncellemen: ' + esc(C.fmtDate(t.adayGuncelleme)) + '</p>' : '') +
        '</section>' +
        '<div class="me-grid">' +
          '<section class="me-card" data-reveal style="--d:.15s"><h2>Ölçülerin</h2><dl class="me-meas">' +
            [['Boy', c.boy + ' cm'], ['Kilo', c.kilo + ' kg'], ['Beden', c.beden], ['Ayakkabı', c.ayakkabi], ['Göz', c.gozRengi], ['Saç', (c.sacRengi || '') + (c.sacUzunlugu ? ', ' + c.sacUzunlugu : '')]].map(function (a) { return '<div><dt>' + esc(a[0]) + '</dt><dd>' + esc(a[1] || '—') + '</dd></div>'; }).join('') +
          '</dl></section>' +
          '<section class="me-card" data-reveal style="--d:.2s"><h2>Fotoğrafların <small>' + C.photoCount(t) + '</small></h2><div class="me-photos">' +
            Array.apply(null, Array(Math.max(1, C.photoCount(t)))).map(function (_, i) { return '<img src="' + C.photo(t, i) + '" alt="">'; }).join('') +
          '</div></section>' +
        '</div>' +
      '</div>', 'p-me');
    document.getElementById('cikis').onclick = function () { C.adayCikis(); C.toast('Çıkış yaptın'); location.hash = '#/'; };
  }

  function duzenleSayfasi() {
    var t = C.adayBen();
    if (!t) { location.hash = '#/giris'; return; }
    var bolumler = C.SORULAR.filter(function (b) { return b.id !== 'riza'; });
    sayfaGoster(
      '<div class="apply">' +
        '<aside class="apply-side"><div class="apply-side-in">' +
          '<div class="apply-mark"><img class="yuz" src="img/ajans-yuz.jpg" alt=""><i></i></div>' +
          '<h1>Bilgilerini<br><span class="grad">güncelle</span></h1>' +
          '<ol class="apply-steps" id="aSteps">' + adimListesi(bolumler, 0) + '</ol>' +
          '<p class="apply-tip">Değişikliklerin kaydettiğin anda Hüsrev Cast Ajans ekibinin ekranına yansır.</p>' +
          '<a class="apply-login" href="#/basvurum">← Başvuruma dön</a>' +
        '</div></aside>' +
        '<div class="apply-main"><div class="aform" id="aForm"></div></div>' +
      '</div>', 'p-apply');
    C.soruFormu({
      kok: document.getElementById('aForm'), degerler: t.c, kayitModu: 'aday', bolumler: bolumler, tohum: t.id, sonButon: 'Değişiklikleri kaydet',
      onIptal: function () { location.hash = '#/basvurum'; },
      onAdim: function (a) { document.getElementById('aSteps').innerHTML = adimListesi(bolumler, a); },
      dogrula: function (bid, v) {
        var baska = bid === 'kisisel' ? C.hesapBul(v.eposta) : null;
        return baska && baska.id !== t.id ? 'Bu e-posta adresi başka bir başvuruda kullanılıyor.' : '';
      },
      onKaydet: function (v) {
        var eski = t.c; t.c = v; t.adayGuncelleme = C.addDays(0);
        if (t.hesap) t.hesap.eposta = v.eposta;
        if (!C.save()) { t.c = eski; return; }
        C.toast('Bilgilerin güncellendi'); location.hash = '#/basvurum';
      }
    });
  }

  // ============ yönlendirme ============
  function yonlendir() {
    var h = location.hash || '#/';
    document.body.classList.remove('menu-open');
    var ben = C.adayBen();
    var g = document.getElementById('navGiris');
    g.textContent = ben ? 'Başvurum' : 'Giriş yap'; g.setAttribute('href', ben ? '#/basvurum' : '#/giris');
    if (h === '#/basvur') return basvuruSayfasi();
    if (h === '#/giris') return girisSayfasi();
    if (h === '#/basvurum') return basvurumSayfasi();
    if (h === '#/basvurum/duzenle') return duzenleSayfasi();
    anaSayfa();
  }
  window.addEventListener('hashchange', yonlendir);
  // başka sekmede (panel) veri değişirse güncel kal
  window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('husrev.taslak') === 0) { C.load(); if (location.hash === '#/basvurum') yonlendir(); } });

  if (C.dalga) C.dalga(document.getElementById('heroFoto'), { gorsel: 'img/ajans.jpg', odakY: 0.3 });
  (function () { var f = document.querySelector('.hero-foto'), ip = document.querySelector('.hero-hint'); if (f && ip) f.addEventListener('pointerdown', function () { ip.classList.add('gone'); }); })();
  kart(); gozle(); etkilesim(); yonlendir(); kaydirma();

  // Kontrol kolaylığı: ?onizle=bolumId → animasyonları bitmiş hâliyle o bölüme gider
  var oniz = location.search.match(/[?&]onizle=([\w-]+)/);
  if (oniz) {
    document.body.classList.add('ready', 'oniz');
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    var hedefEl = document.getElementById(oniz[1]);
    if (hedefEl && hedefEl.id !== 'top') { [].forEach.call(home.children, function (el) { if (el !== hedefEl) el.style.display = 'none'; }); hedefEl.style.paddingTop = '110px'; if (stepsPath) stepsPath.style.strokeDashoffset = 0; }
  }
})(window.C);
