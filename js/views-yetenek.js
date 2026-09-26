/* Hüsrev Cast Ajans taslak — giriş, genel bakış, yetenek havuzu, profil, başvurular */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;

  // ================= GİRİŞ (demo) =================
  C.route(/^#\/giris$/, function (root) {
    root.innerHTML =
      '<div class="login">' +
        '<div class="login-art login-gorsel"><canvas class="login-canvas" id="loginCanvas" aria-hidden="true"></canvas><div class="login-karart" aria-hidden="true"></div>' +
          '<p class="login-tag">Talep, aday seçimi, müşteri paketi ve takvim tek panelde.</p>' +
          '<div class="login-orb"></div></div>' +
        '<div class="login-box">' +
          '<h1>Panele giriş</h1><p class="muted">Taslak sürüm: şifre yok. Denemek istediğiniz rolü seçin.</p>' +
          '<div class="role-list">' + C.db.users.map(function (u) {
            var r = C.ROLES[u.rol];
            return '<button class="role-card" data-u="' + u.id + '"><span class="avatar-s">' + esc(u.ad.split(' ').map(function (s) { return s[0]; }).join('')) + '</span>' +
              '<span class="rc-text"><b>' + esc(u.ad) + '</b><small>' + esc(r.ad) + ' — ' + esc(r.not) + '</small></span>' + icon('arrowR', 16) + '</button>';
          }).join('') + '</div>' +
          '<a class="login-alt" href="aday/">' + icon('user', 16) + ' Manken aday sitesine git</a>' +
        '</div>' +
      '</div>';
    root.querySelectorAll('.role-card').forEach(function (b) { b.onclick = function () { C.login(b.getAttribute('data-u')); C.go('#/panel'); }; });
    if (C.dalga) C.dalga(root.querySelector('#loginCanvas'), { gorsel: 'img/ajans.jpg', odakY: 0.33 });
  }, { pub: true });

  // ================= GENEL BAKIŞ =================
  C.route(/^#\/panel$/, function (root) {
    var db = C.db, u = C.me();
    var basvuru = db.talents.filter(function (t) { return t.durum === 'basvuru'; });
    var aktif = db.talents.filter(function (t) { return t.durum === 'aktif'; });
    var projeler = C.visibleProjects();
    var acik = projeler.filter(function (p) { return ['onaylanan', 'onaylanmayan'].indexOf(p.durum) < 0; });
    var yakin = db.events.filter(function (e) { var d = C.daysFromNow(e.tarih); return d >= 0 && d <= 10; }).sort(function (a, b) { return (a.tarih + a.saat).localeCompare(b.tarih + b.saat); }).slice(0, 6);
    var geri = db.packages.filter(function (k) { return k.gonderildi; });

    var stat = function (ic, sayi, ad, h) { return '<a class="stat" href="' + h + '"><span class="stat-ic">' + icon(ic, 20) + '</span><b data-say="' + sayi + '">' + sayi + '</b><small>' + esc(ad) + '</small></a>'; };

    var govde =
      '<div class="hello"><div><small class="kicker">' + esc(C.fmtDate(C.iso(new Date()), true)) + '</small><h2>Merhaba <span>' + esc(u.ad.split(' ')[0]) + '</span></h2></div>' +
        C.editBtn('<a class="btn btn-primary" href="#/projeler/yeni">' + icon('plus', 16) + ' Yeni proje</a>') + '</div>' +
      '<div class="stats">' +
        stat('users', aktif.length, 'Havuzdaki yetenek', '#/havuz') +
        stat('inbox', basvuru.length, 'Yeni başvuru', '#/basvurular') +
        stat('folder', acik.length, 'Açık proje', '#/projeler') +
        stat('box', geri.length, 'Müşteri dönüşü gelen paket', '#/paketler') +
      '</div>' +
      '<div class="grid-2">' +
        '<section class="card"><div class="card-head"><h3>Açık projeler</h3><a href="#/projeler" class="link">Tümü</a></div>' +
          (acik.length ? '<div class="rows">' + acik.slice(0, 6).map(function (p) {
            var m = C.client(p.musteriId), dd = C.daysFromNow(p.tarih);
            return '<a class="row" href="#/proje/' + p.id + '"><div class="row-main"><b>' + esc(p.ad) + '</b><small>' + esc(m ? m.ad : '') + ' · ' + esc(p.isTuru) + '</small></div>' +
              '<div class="row-side">' + C.badge(C.PROJE_DURUM, p.durum) + '<small class="' + (dd <= 3 ? 'urgent' : '') + '">' + (dd === 0 ? 'Bugün' : dd > 0 ? dd + ' gün sonra' : Math.abs(dd) + ' gün önce') + '</small></div></a>';
          }).join('') + '</div>' : C.bos('folder', 'Açık proje yok')) +
        '</section>' +
        '<section class="card"><div class="card-head"><h3>Yaklaşan 10 gün</h3><a href="#/takvim" class="link">Takvim</a></div>' +
          (yakin.length ? '<div class="agenda">' + yakin.map(function (e) {
            var d = C.parse(e.tarih), tur = C.find(C.ETKINLIK, e.tur);
            return '<div class="ag-item"><div class="ag-date"><b>' + d.getDate() + '</b><small>' + C.AYLAR[d.getMonth()].slice(0, 3) + '</small></div>' +
              '<div class="ag-body"><span class="badge b-' + tur.renk + '">' + esc(tur.ad) + '</span><b>' + esc(e.baslik) + '</b><small>' + icon('clock', 13) + ' ' + esc(e.saat || '—') + '</small></div></div>';
          }).join('') + '</div>' : C.bos('cal', 'Yaklaşan etkinlik yok')) +
        '</section>' +
      '</div>' +
      '<section class="card"><div class="card-head"><h3>Son başvurular</h3><a href="#/basvurular" class="link">Başvurular</a></div>' +
        (basvuru.length ? '<div class="mini-talents">' + basvuru.map(function (t) {
          return '<a class="mini-t" href="#/yetenek/' + t.id + '">' + C.avatar(t, 52) + '<div><b>' + esc(C.adSoyad(t)) + ', ' + C.age(t.c.dogumTarihi) + '</b><small>' + esc(t.c.sehir) + ' · ' + esc((t.c.kategoriler || []).join(', ')) + '</small></div></a>';
        }).join('') + '</div>' : C.bos('inbox', 'Bekleyen başvuru yok')) +
      '</section>';
    root.innerHTML = C.shell('#/panel', 'Genel Bakış', govde);
    C.bindShell(); C.saydir(root);
  });

  // ================= YETENEK HAVUZU =================
  var VARSAYILAN_FILTRE = { q: '', kategori: '', cinsiyet: '', yasMin: '', yasMax: '', sehir: '', uygunluk: '', etiket: '', boyMin: '', boyMax: '', dil: '', sacKesim: false, sirala: 'ad' };
  function filtreHazirla() {
    if (!C.state.filtre) C.state.filtre = JSON.parse(JSON.stringify(VARSAYILAN_FILTRE));
    return C.state.filtre;
  }
  function uygula(list, f) {
    var q = C.norm(f.q);
    return list.filter(function (t) {
      var c = t.c, yas = C.age(c.dogumTarihi);
      if (q && C.norm(C.adSoyad(t) + ' ' + c.telefon + ' ' + c.eposta + ' ' + (t.etiketler || []).join(' ')).indexOf(q) < 0) return false;
      if (f.kategori && (c.kategoriler || []).indexOf(f.kategori) < 0) return false;
      if (f.cinsiyet && c.cinsiyet !== f.cinsiyet) return false;
      if (f.yasMin && yas < +f.yasMin) return false;
      if (f.yasMax && yas > +f.yasMax) return false;
      if (f.sehir && c.sehir !== f.sehir) return false;
      if (f.uygunluk && t.uygunluk !== f.uygunluk) return false;
      if (f.etiket && (t.etiketler || []).indexOf(f.etiket) < 0) return false;
      if (f.boyMin && +c.boy < +f.boyMin) return false;
      if (f.boyMax && +c.boy > +f.boyMax) return false;
      if (f.dil && (c.diller || []).indexOf(f.dil) < 0) return false;
      if (f.sacKesim && c.sacKesim !== 'Evet') return false;
      return true;
    }).sort(function (a, b) {
      if (f.sirala === 'yeni') return b.olusturma.localeCompare(a.olusturma);
      if (f.sirala === 'yas') return C.age(a.c.dogumTarihi) - C.age(b.c.dogumTarihi);
      return C.adSoyad(a).localeCompare(C.adSoyad(b), 'tr');
    });
  }
  C.kriterdenFiltre = function (p) {
    var k = p.kriter || {}, f = JSON.parse(JSON.stringify(VARSAYILAN_FILTRE));
    f.kategori = k.kategori || ''; f.cinsiyet = k.cinsiyet || ''; f.yasMin = k.yasMin || ''; f.yasMax = k.yasMax || ''; f.boyMin = k.boyMin || ''; f.sehir = k.sehir || '';
    return f;
  };

  C.talentCard = function (t, opts) {
    opts = opts || {};
    var sec = opts.secili, yas = C.age(t.c.dogumTarihi);
    return '<article class="tcard' + (sec ? ' sel' : '') + '" data-t="' + t.id + '">' +
      (opts.secilebilir ? '<button class="tc-check" data-sec="' + t.id + '" aria-label="Seç">' + icon('check', 14) + '</button>' : '') +
      '<a class="tc-top" href="#/yetenek/' + t.id + '">' + C.avatar(t, 68) +
        '<div class="tc-id"><b>' + esc(C.adSoyad(t)) + ', ' + yas + '</b>' +
        '<small>' + icon('pin', 12) + ' ' + esc(t.c.sehir) + ' · ' + esc(C.find(C.UYGUNLUK, t.uygunluk).ad) + (t.adayGuncelleme && C.daysFromNow(t.adayGuncelleme) > -8 ? ' · <span class="upd-dot">güncelledi</span>' : '') + '</small>' +
        '<div class="tc-cats">' + (t.c.kategoriler || []).map(function (k) { return '<span class="chip chip-soft">' + esc(k) + '</span>'; }).join('') + '</div></div></a>' +
      '<dl class="tc-meas"><div><dt>Boy</dt><dd>' + esc(t.c.boy) + '</dd></div><div><dt>Kilo</dt><dd>' + esc(t.c.kilo) + '</dd></div><div><dt>Beden</dt><dd>' + esc(t.c.beden) + '</dd></div><div><dt>Ayak.</dt><dd>' + esc(t.c.ayakkabi) + '</dd></div><div><dt>Göz</dt><dd>' + esc(t.c.gozRengi) + '</dd></div></dl>' +
      '<div class="tc-foot"><span class="tc-phone">' + icon('phone', 13) + ' ' + C.iletisim(t) + '</span>' +
        '<span class="tc-tags">' + (t.etiketler || []).slice(0, 2).map(function (e) { return '<span class="chip">' + esc(e) + '</span>'; }).join('') + '</span></div>' +
      (opts.ek || '') +
      '</article>';
  };

  C.route(/^#\/havuz$/, function (root) {
    var f = filtreHazirla();
    var hedef = C.state.hedefProje ? C.project(C.state.hedefProje) : null;
    var tum = C.db.talents.filter(function (t) { return t.durum === 'aktif'; });
    var etiketler = [];
    tum.forEach(function (t) { (t.etiketler || []).forEach(function (e) { if (etiketler.indexOf(e) < 0) etiketler.push(e); }); });
    etiketler.sort(function (a, b) { return a.localeCompare(b, 'tr'); });

    var filtreHtml =
      '<section class="card filters">' +
        '<div class="search"><span>' + icon('search', 18) + '</span><input id="q" placeholder="İsim, telefon, e-posta veya etiket ara" value="' + esc(f.q) + '"></div>' +
        '<div class="fgrid">' +
          '<label>Kategori<select data-f="kategori">' + C.options(['Manken', 'Oyuncu', 'Figüran', 'Fotomodel', 'Dansçı'], f.kategori, 'Tümü') + '</select></label>' +
          '<label>Cinsiyet<select data-f="cinsiyet">' + C.options(['Kadın', 'Erkek'], f.cinsiyet, 'Tümü') + '</select></label>' +
          '<label>Yaş<div class="range"><input data-f="yasMin" type="number" placeholder="en az" value="' + esc(f.yasMin) + '"><span>–</span><input data-f="yasMax" type="number" placeholder="en çok" value="' + esc(f.yasMax) + '"></div></label>' +
          '<label>Boy (cm)<div class="range"><input data-f="boyMin" type="number" placeholder="en az" value="' + esc(f.boyMin) + '"><span>–</span><input data-f="boyMax" type="number" placeholder="en çok" value="' + esc(f.boyMax) + '"></div></label>' +
          '<label>Şehir<select data-f="sehir">' + C.options(C.SEHIRLER, f.sehir, 'Tümü') + '</select></label>' +
          '<label>Uygunluk<select data-f="uygunluk">' + C.options(C.UYGUNLUK, f.uygunluk, 'Tümü') + '</select></label>' +
          '<label>Etiket<select data-f="etiket">' + C.options(etiketler, f.etiket, 'Tümü') + '</select></label>' +
          '<label>Dil<select data-f="dil">' + C.options(C.alan('diller').secenek, f.dil, 'Tümü') + '</select></label>' +
        '</div>' +
        '<div class="fbar"><label class="check"><input type="checkbox" data-f="sacKesim"' + (f.sacKesim ? ' checked' : '') + '> Saç kestirebilir</label>' +
          '<button class="btn btn-ghost btn-s" id="temizle">' + icon('x', 14) + ' Filtreleri temizle</button></div>' +
      '</section>';

    var govde =
      (hedef ? '<div class="note note-blue target">' + icon('folder', 16) + '<span><b>' + esc(hedef.ad) + '</b> projesi için aday seçiyorsunuz. Filtreler projenin aranan kriterlerinden dolduruldu.</span><button class="btn btn-ghost btn-s" id="hedefBirak">Bırak</button></div>' : '') +
      filtreHtml +
      '<div class="list-head"><h3 id="sayac"></h3><select id="sirala" class="select-s">' + C.options([{ k: 'ad', ad: 'İsme göre' }, { k: 'yeni', ad: 'En yeni' }, { k: 'yas', ad: 'Yaşa göre' }], f.sirala) + '</select></div>' +
      '<div class="tgrid" id="tgrid"></div>' +
      '<div class="selbar" id="selbar" hidden></div>';

    root.innerHTML = C.shell('#/havuz', 'Yetenek Havuzu', govde, C.editBtn('<a class="btn btn-ghost" href="#/yetenek-ekle">' + icon('plus', 16) + ' Yetenek ekle</a>'));
    C.bindShell();

    function listele() {
      var sonuc = uygula(tum, f);
      root.querySelector('#sayac').innerHTML = 'Filtrelenen yetenekler <span>(' + sonuc.length + ')</span>';
      root.querySelector('#tgrid').innerHTML = sonuc.length ? sonuc.map(function (t) {
        return C.talentCard(t, { secilebilir: C.can('edit'), secili: C.state.secili.indexOf(t.id) >= 0 });
      }).join('') : C.bos('search', 'Bu filtrelere uyan yetenek yok', 'Filtreleri gevşetmeyi deneyin.');
      root.querySelectorAll('[data-sec]').forEach(function (b) {
        b.onclick = function (e) {
          e.preventDefault();
          var id = b.getAttribute('data-sec'), i = C.state.secili.indexOf(id);
          if (i >= 0) C.state.secili.splice(i, 1); else C.state.secili.push(id);
          b.closest('.tcard').classList.toggle('sel');
          secimCubugu();
        };
      });
      secimCubugu();
    }
    function secimCubugu() {
      var bar = root.querySelector('#selbar'), n = C.state.secili.length;
      bar.hidden = !n;
      if (!n) return;
      bar.innerHTML = '<div class="sel-faces">' + C.state.secili.slice(0, 5).map(function (id) { var t = C.talent(id); return t ? '<img src="' + C.photo(t, 0) + '" alt="">' : ''; }).join('') + '</div>' +
        '<b>' + n + ' yetenek seçildi</b>' +
        '<button class="btn btn-ghost btn-s" id="secTemizle">Seçimi temizle</button>' +
        '<button class="btn btn-light btn-s" id="projeyeEkle">' + icon('folder', 15) + (hedef ? ' "' + esc(hedef.ad.slice(0, 22)) + '…" projesine ekle' : ' Projeye ekle') + '</button>' +
        '<button class="btn btn-primary btn-s" id="paketYap">' + icon('box', 15) + ' Aday paketi oluştur</button>';
      bar.querySelector('#secTemizle').onclick = function () { C.state.secili = []; listele(); };
      bar.querySelector('#projeyeEkle').onclick = function () {
        if (hedef) { C.projeyeEkle(hedef.id, C.state.secili); C.state.secili = []; var pid = hedef.id; C.state.hedefProje = null; C.state.filtre = null; C.go('#/proje/' + pid + '/adaylar'); }
        else C.projeSecModal(function (pid) { C.projeyeEkle(pid, C.state.secili); C.state.secili = []; C.go('#/proje/' + pid + '/adaylar'); });
      };
      bar.querySelector('#paketYap').onclick = function () { C.paketModal(C.state.secili.slice(), hedef ? hedef.id : ''); };
    }

    root.querySelector('#q').oninput = function (e) { f.q = e.target.value; listele(); };
    root.querySelectorAll('[data-f]').forEach(function (el) {
      var h = function () { f[el.getAttribute('data-f')] = el.type === 'checkbox' ? el.checked : el.value; listele(); };
      el.onchange = h; if (el.tagName === 'INPUT' && el.type !== 'checkbox') el.oninput = h;
    });
    root.querySelector('#sirala').onchange = function (e) { f.sirala = e.target.value; listele(); };
    root.querySelector('#temizle').onclick = function () { C.state.filtre = null; C.render(); };
    var hb = root.querySelector('#hedefBirak'); if (hb) hb.onclick = function () { C.state.hedefProje = null; C.state.filtre = null; C.render(); };
    listele();
  });

  // ================= YETENEK PROFİLİ =================
  C.route(/^#\/yetenek\/(\w+)(?:\/(\w+))?$/, function (root, id, sekme) {
    var t = C.talent(id);
    if (!t) { root.innerHTML = C.shell('#/havuz', 'Bulunamadı', C.bos('user', 'Yetenek bulunamadı')); C.bindShell(); return; }
    if (sekme === 'duzenle') return duzenle(root, t);
    sekme = sekme || 'profil';
    var c = t.c, yas = C.age(c.dogumTarihi), edit = C.can('edit');
    var projeler = C.db.projects.filter(function (p) { return p.adaylar.some(function (a) { return a.t === t.id; }); });

    var SEKMELER = [['profil', 'Profil', 'user'], ['fiziksel', 'Fiziksel', 'ruler'], ['egitim', 'Eğitim ve Beceriler', 'note'], ['tavizler', 'Tavizler', 'check'], ['medya', 'Medya', 'camera'], ['projeler', 'Projeler (' + projeler.length + ')', 'folder']];

    var bolumTablo = function (bid, haric) {
      var b = C.bolum(bid);
      return '<dl class="attrs">' + b.alanlar.filter(function (f) { return !(haric || []).includes(f.k); }).map(function (f) {
        var v = f.iletisim && !C.can('contact') ? '<span class="masked">' + icon('lock', 13) + ' Gizli</span>' : esc(C.deger(t, f.k)).replace(/\n/g, '<br>');
        if (f.tip === 'tri') v = '<span class="tri tri-' + C.norm(c[f.k] || 'yok').replace(/[^a-zçğıöşü]/g, '') + '">' + esc(c[f.k] || '—') + '</span>';
        return '<div class="' + (f.tip === 'textarea' || f.tip === 'multi' || f.tip === 'tri' ? 'wide' : '') + '"><dt>' + esc(f.ad) + '</dt><dd>' + v + '</dd></div>';
      }).join('') + '</dl>';
    };

    var icerik = '';
    if (sekme === 'profil') {
      icerik =
        '<section class="card"><div class="card-head"><h3>Kişisel bilgiler</h3></div>' + bolumTablo('kisisel', ['ad', 'soyad']) + '</section>' +
        '<section class="card"><div class="card-head"><h3>Ajans bilgileri</h3></div>' +
          '<div class="ops">' +
            '<label>Uygunluk<select id="uyg"' + (edit ? '' : ' disabled') + '>' + C.options(C.UYGUNLUK, t.uygunluk) + '</select></label>' +
            '<label class="grow">Etiketler<input id="etk" value="' + esc((t.etiketler || []).join(', ')) + '" placeholder="Virgülle ayırın"' + (edit ? '' : ' disabled') + '></label>' +
            '<label class="full">Ajans notu (adaya görünmez)<textarea id="notlar" rows="2"' + (edit ? '' : ' disabled') + '>' + esc(t.notlar || '') + '</textarea></label>' +
          '</div>' +
          '<div class="meta-line">' + icon('shield', 14) + ' Açık rıza: <b>' + (c.kvkk ? 'Verildi' : 'Yok') + '</b> · ' + esc(C.fmtDate(t.rizaTarihi)) +
            ' &nbsp;·&nbsp; Kaynak: <b>' + (t.kaynak === 'kayit' ? 'Aday sitesinden başvurdu' : 'Ajans ekledi') + '</b> &nbsp;·&nbsp; Kayıt: ' + esc(C.fmtDate(t.olusturma)) +
            (t.hesap ? ' &nbsp;·&nbsp; ' + icon('user', 13) + ' Aday hesabı var' : '') + '</div>' +
          (t.adayGuncelleme ? '<div class="note note-blue upd">' + icon('refresh', 15) + '<span>Aday bilgilerini <b>' + esc(C.fmtDate(t.adayGuncelleme)) + '</b> tarihinde kendisi güncelledi (taslak varsayım — B-6g).</span></div>' : '') +
          (edit ? '<div class="right"><button class="btn btn-primary btn-s" id="ajansKaydet">Kaydet</button></div>' : '') +
        '</section>';
    } else if (sekme === 'fiziksel') icerik = '<section class="card">' + bolumTablo('fiziksel') + '</section>';
    else if (sekme === 'egitim') icerik = '<section class="card">' + bolumTablo('egitim') + '</section>';
    else if (sekme === 'tavizler') icerik = '<section class="card"><p class="muted small">Adayın kayıtta verdiği cevaplar. Her iş öncesi ayrıca teyit edilir.</p>' + bolumTablo('tavizler') + '</section>';
    else if (sekme === 'medya') {
      var n = Math.max(C.photoCount(t), 1);
      icerik = '<section class="card"><div class="card-head"><h3>Fotoğraflar <span class="muted">(' + C.photoCount(t) + ')</span></h3>' +
        '<span class="media-count">' + icon('camera', 15) + ' ' + C.photoCount(t) + ' &nbsp; ' + icon('video', 15) + ' ' + (c.video ? 1 : 0) + '</span></div>' +
        '<div class="media-grid">' + Array.apply(null, Array(n)).map(function (_, i) { return '<figure><img src="' + C.photo(t, i) + '" alt=""></figure>'; }).join('') + '</div>' +
        (c.video ? '<div class="video-row">' + icon('video', 18) + '<a href="' + esc(c.video) + '" target="_blank" rel="noopener">' + esc(c.video) + '</a></div>' : '<p class="muted small">Tanıtım videosu eklenmemiş.</p>') +
        (C.photoCount(t) && t.c.fotograflar[0].indexOf('ph:') === 0 ? '<p class="muted small">' + icon('info', 13) + ' Örnek profil: gerçek fotoğraf yerine yer tutucu görsel.</p>' : '') +
        '</section>';
    } else if (sekme === 'projeler') {
      icerik = '<section class="card">' + (projeler.length ? '<div class="rows">' + projeler.map(function (p) {
        var a = p.adaylar.filter(function (x) { return x.t === t.id; })[0];
        return '<a class="row" href="#/proje/' + p.id + '/adaylar"><div class="row-main"><b>' + esc(p.ad) + '</b><small>' + esc(C.fmtDate(p.tarih)) + '</small></div><div class="row-side">' + C.badge(C.ADAY_DURUM, a.d) + C.badge(C.PROJE_DURUM, p.durum) + '</div></a>';
      }).join('') + '</div>' : C.bos('folder', 'Henüz bir projeye eklenmedi')) + '</section>';
    }

    var basvuruBant = t.durum === 'basvuru' ? '<div class="note note-amber">' + icon('inbox', 16) + '<span>Bu kişi henüz havuzda değil: <b>yeni başvuru</b>. Onaylarsanız havuza girer.</span>' +
      (edit ? '<button class="btn btn-green btn-s" data-onay="' + t.id + '">' + icon('check', 14) + ' Onayla</button><button class="btn btn-ghost btn-s" data-red="' + t.id + '">Reddet</button>' : '') + '</div>' : '';

    var govde = basvuruBant +
      '<div class="profile">' +
        '<aside class="p-side">' +
          '<div class="p-photo"><img src="' + C.photo(t, 0) + '" alt="">' + (t.durum === 'aktif' ? '<i class="dot d-' + C.find(C.UYGUNLUK, t.uygunluk).renk + '"></i>' : '') + '</div>' +
          '<h2>' + esc(C.adSoyad(t)) + '</h2><p class="p-sub">' + yas + ' yaş · ' + esc(c.sehir) + '</p>' +
          '<div class="p-cats">' + (c.kategoriler || []).map(function (k) { return '<span class="chip chip-dark">' + esc(k) + '</span>'; }).join('') + '</div>' +
          '<dl class="p-quick"><div><dt>Boy</dt><dd>' + esc(c.boy) + '</dd></div><div><dt>Kilo</dt><dd>' + esc(c.kilo) + '</dd></div><div><dt>Beden</dt><dd>' + esc(c.beden) + '</dd></div><div><dt>Ayakkabı</dt><dd>' + esc(c.ayakkabi) + '</dd></div></dl>' +
          '<nav class="p-nav">' + SEKMELER.map(function (s) { return '<a class="' + (s[0] === sekme ? 'on' : '') + '" href="#/yetenek/' + t.id + '/' + s[0] + '">' + icon(s[2], 17) + esc(s[1]) + '</a>'; }).join('') + '</nav>' +
          (edit ? '<a class="btn btn-ghost-dark btn-block" href="#/yetenek/' + t.id + '/duzenle">' + icon('edit', 15) + ' Profili düzenle</a>' : '') +
        '</aside>' +
        '<div class="p-main">' + icerik + '</div>' +
      '</div>';

    root.innerHTML = C.shell(t.durum === 'basvuru' ? '#/basvurular' : '#/havuz', '<a class="crumb" href="' + (t.durum === 'basvuru' ? '#/basvurular' : '#/havuz') + '">' + (t.durum === 'basvuru' ? 'Başvurular' : 'Yetenek Havuzu') + '</a> <span class="crumb-sep">/</span> ' + esc(C.adSoyad(t)), govde,
      C.editBtn(t.durum === 'aktif' ? '<button class="btn btn-primary" id="paketTek">' + icon('box', 16) + ' Pakete / projeye ekle</button>' : ''));
    C.bindShell();
    basvuruBagla(root);
    var ak = root.querySelector('#ajansKaydet');
    if (ak) ak.onclick = function () {
      t.uygunluk = root.querySelector('#uyg').value;
      t.etiketler = root.querySelector('#etk').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      t.notlar = root.querySelector('#notlar').value;
      C.save(); C.toast('Kaydedildi'); C.render();
    };
    var pt = root.querySelector('#paketTek');
    if (pt) pt.onclick = function () { if (C.state.secili.indexOf(t.id) < 0) C.state.secili.push(t.id); C.go('#/havuz'); C.toast('Seçime eklendi. Havuzdan paket oluşturabilir veya projeye ekleyebilirsiniz.'); };
  });

  function duzenle(root, t) {
    if (!C.can('edit')) { C.go('#/yetenek/' + t.id); return; }
    root.innerHTML = C.shell('#/havuz', '<a class="crumb" href="#/yetenek/' + t.id + '">' + esc(C.adSoyad(t)) + '</a> <span class="crumb-sep">/</span> Düzenle', '<div class="form-wrap" id="fw"></div>');
    C.bindShell();
    C.soruFormu({
      kok: root.querySelector('#fw'), degerler: t.c, kayitModu: 'ajans', tohum: t.id,
      onIptal: function () { C.go('#/yetenek/' + t.id); },
      onKaydet: function (v) { t.c = v; if (C.save()) { C.toast('Profil güncellendi'); C.go('#/yetenek/' + t.id); } }
    });
  }

  // ================= YETENEK EKLE (ajans) =================
  C.route(/^#\/yetenek-ekle$/, function (root) {
    if (!C.can('edit')) { C.go('#/havuz'); return; }
    root.innerHTML = C.shell('#/havuz', '<a class="crumb" href="#/havuz">Yetenek Havuzu</a> <span class="crumb-sep">/</span> Yeni yetenek',
      '<div class="note note-blue">' + icon('info', 16) + '<span>Ajansın elle eklediği yetenek, adayın dolduracağı formun aynısıyla girilir ve doğrudan havuza düşer (taslak varsayım — B-6d).</span></div><div class="form-wrap" id="fw"></div>');
    C.bindShell();
    C.soruFormu({
      kok: root.querySelector('#fw'), degerler: {}, kayitModu: 'ajans',
      onIptal: function () { C.go('#/havuz'); },
      onKaydet: function (v) {
        var t = { id: C.uid('t'), durum: 'aktif', kaynak: 'ajans', olusturma: C.addDays(0), rizaTarihi: C.addDays(0), uygunluk: 'musait', etiketler: [], notlar: '', c: v };
        C.db.talents.push(t);
        if (C.save()) { C.toast('Yetenek havuza eklendi'); C.go('#/yetenek/' + t.id); } else C.db.talents.pop();
      }
    });
  });

  // ================= BAŞVURULAR =================
  function basvuruBagla(root) {
    root.querySelectorAll('[data-onay]').forEach(function (b) { b.onclick = function () { var t = C.talent(b.getAttribute('data-onay')); t.durum = 'aktif'; t.uygunluk = 'musait'; C.save(); C.toast(C.adSoyad(t) + ' havuza eklendi'); C.render(); }; });
    root.querySelectorAll('[data-red]').forEach(function (b) { b.onclick = function () { var t = C.talent(b.getAttribute('data-red')); t.durum = 'reddedildi'; C.save(); C.toast('Başvuru reddedildi'); C.go('#/basvurular'); }; });
  }
  C.route(/^#\/basvurular$/, function (root) {
    var list = C.db.talents.filter(function (t) { return t.durum === 'basvuru'; }).sort(function (a, b) { return b.olusturma.localeCompare(a.olusturma); });
    var red = C.db.talents.filter(function (t) { return t.durum === 'reddedildi'; });
    var govde =
      '<div class="note note-blue">' + icon('info', 16) + '<span>Manken aday sitesinden başvuran herkes önce buraya düşer; siz onaylayınca havuza girer (K-009). <a href="aday/" target="_blank" rel="noopener">Aday sitesini aç</a></span></div>' +
      (list.length ? '<div class="tgrid">' + list.map(function (t) {
        return C.talentCard(t, { ek: '<div class="tc-actions"><small>' + icon('clock', 13) + ' ' + (C.daysFromNow(t.olusturma) === 0 ? 'Bugün' : Math.abs(C.daysFromNow(t.olusturma)) + ' gün önce') + '</small>' +
          '<a class="btn btn-ghost btn-s" href="#/yetenek/' + t.id + '">İncele</a>' +
          C.editBtn('<button class="btn btn-ghost btn-s" data-red="' + t.id + '">Reddet</button><button class="btn btn-green btn-s" data-onay="' + t.id + '">' + icon('check', 14) + ' Onayla</button>') + '</div>' });
      }).join('') + '</div>' : C.bos('inbox', 'Bekleyen başvuru yok', 'Aday sitesinden gelen yeni başvurular burada görünecek.', '<a class="btn btn-ghost" href="aday/" target="_blank" rel="noopener">Aday sitesini aç</a>')) +
      (red.length ? '<details class="card fold"><summary>Reddedilen başvurular (' + red.length + ')</summary><div class="rows">' + red.map(function (t) {
        return '<div class="row"><div class="row-main"><b>' + esc(C.adSoyad(t)) + '</b><small>' + esc(t.c.sehir) + '</small></div>' + C.editBtn('<button class="btn btn-ghost btn-s" data-onay="' + t.id + '">Yine de onayla</button>') + '</div>';
      }).join('') + '</div></details>' : '');
    root.innerHTML = C.shell('#/basvurular', 'Başvurular', govde);
    C.bindShell(); basvuruBagla(root);
  });
})(window.C);
