/* Hüsrev Cast Ajans taslak — takvim, müşteriler, kullanıcılar, ayarlar, aday kayıt sayfası */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;

  // ================= TAKVİM =================
  C.etkinlikSatiri = function (e) {
    var d = C.parse(e.tarih), tur = C.find(C.ETKINLIK, e.tur), p = e.projeId ? C.project(e.projeId) : null;
    var kisiler = (e.talentIds || []).map(C.talent).filter(Boolean);
    return '<div class="ag-item"><div class="ag-date"><b>' + d.getDate() + '</b><small>' + C.AYLAR[d.getMonth()].slice(0, 3) + '</small></div>' +
      '<div class="ag-body"><span class="badge b-' + tur.renk + '">' + esc(tur.ad) + '</span><b>' + esc(e.baslik) + '</b>' +
      '<small>' + icon('clock', 13) + ' ' + esc(e.saat || '—') + (e.not ? ' · ' + esc(e.not) : '') + (p ? ' · <a href="#/proje/' + p.id + '">' + esc(p.ad) + '</a>' : '') + '</small>' +
      (kisiler.length ? '<div class="ag-people">' + kisiler.map(function (t) { return '<img src="' + C.photo(t, 0) + '" alt="" title="' + esc(C.adSoyad(t)) + '">'; }).join('') + '</div>' : '') +
      '</div></div>';
  };

  C.etkinlikModal = function (on) {
    on = on || {};
    var projeler = C.visibleProjects();
    var aktifler = C.db.talents.filter(function (t) { return t.durum === 'aktif'; });
    var p0 = on.projeId ? C.project(on.projeId) : null;
    var secili = p0 ? p0.adaylar.filter(function (a) { return a.d !== 'musteri_reddetti'; }).map(function (a) { return a.t; }) : [];
    C.modal({
      baslik: 'Etkinlik ekle', tamam: 'Takvime ekle', genis: true,
      govde: '<div class="form-grid">' +
        '<div class="field quarter"><label>Tür</label><select id="et">' + C.options(C.ETKINLIK, 'casting') + '</select></div>' +
        '<div class="field quarter"><label>Tarih</label><input type="date" id="ed" value="' + esc(on.tarih || C.addDays(0)) + '"></div>' +
        '<div class="field quarter"><label>Saat</label><input type="time" id="es" value="' + esc(on.saat || '10:00') + '"></div>' +
        '<div class="field quarter"><label>Proje</label><select id="ep">' + C.options(projeler.map(function (p) { return { k: p.id, ad: p.ad }; }), on.projeId || '', 'Projesiz') + '</select></div>' +
        '<div class="field full"><label>Başlık</label><input id="eb" placeholder="Örn. Casting — Kadıköy ofis" value="' + esc(p0 ? p0.ad + ' — casting' : '') + '"></div>' +
        '<div class="field full"><label>Not</label><input id="en" placeholder="Adres, hazırlık notu"></div>' +
        '<div class="field full"><span class="lab">Katılacak yetenekler</span><div class="chips-pick" id="ek">' + aktifler.map(function (t) {
          return '<button type="button" class="pick pick-face' + (secili.indexOf(t.id) >= 0 ? ' on' : '') + '" data-v="' + t.id + '"><img src="' + C.photo(t, 0) + '" alt="">' + esc(C.adSoyad(t)) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="form-err" id="eErr" hidden></div>' +
        '</div>',
      onMount: function (b) {
        b.querySelectorAll('#ek .pick').forEach(function (x) { x.onclick = function () { x.classList.toggle('on'); }; });
        b.querySelector('#ep').onchange = function (e) { var p = C.project(e.target.value); if (p && !C.val(b, '#eb')) b.querySelector('#eb').value = p.ad + ' — ' + C.find(C.ETKINLIK, b.querySelector('#et').value).ad.toLocaleLowerCase('tr-TR'); };
      },
      onOk: function (b) {
        var baslik = C.val(b, '#eb'), tarih = C.val(b, '#ed');
        if (!baslik || !tarih) { var er = b.querySelector('#eErr'); er.hidden = false; er.innerHTML = icon('info', 16) + '<span>Başlık ve tarih gerekli.</span>'; return false; }
        var ids = [].map.call(b.querySelectorAll('#ek .pick.on'), function (x) { return x.getAttribute('data-v'); });
        var saat = C.val(b, '#es');
        // Çakışma uyarısı (taslak varsayım — F-30)
        var cakisan = C.db.events.filter(function (e) { return e.tarih === tarih && e.saat === saat && (e.talentIds || []).some(function (id) { return ids.indexOf(id) >= 0; }); });
        C.db.events.push({ id: C.uid('e'), tur: C.val(b, '#et'), baslik: baslik, tarih: tarih, saat: saat, projeId: C.val(b, '#ep'), talentIds: ids, not: C.val(b, '#en') });
        C.save();
        C.toast(cakisan.length ? 'Eklendi — dikkat: aynı saatte başka etkinliği olan yetenek var' : 'Takvime eklendi', cakisan.length ? 'err' : '');
        C.render();
      }
    });
  };

  C.route(/^#\/takvim$/, function (root) {
    var ay = C.state.takvimAy || (function () { var d = C.today(); d.setDate(1); return C.iso(d); })();
    C.state.takvimAy = ay;
    var bas = C.parse(ay), yil = bas.getFullYear(), aySira = bas.getMonth();
    var ilkGun = (bas.getDay() + 6) % 7; // pazartesi = 0
    var gunSayisi = new Date(yil, aySira + 1, 0).getDate();
    var bugun = C.iso(C.today());
    var hucreler = [];
    for (var i = 0; i < ilkGun; i++) hucreler.push(null);
    for (var g = 1; g <= gunSayisi; g++) hucreler.push(C.iso(new Date(yil, aySira, g)));
    while (hucreler.length % 7) hucreler.push(null);
    var olaylar = C.db.events;
    var ayin = olaylar.filter(function (e) { return e.tarih.slice(0, 7) === ay.slice(0, 7); }).sort(function (a, b) { return (a.tarih + a.saat).localeCompare(b.tarih + b.saat); });

    var govde =
      '<div class="cal-wrap">' +
        '<section class="card cal">' +
          '<div class="cal-head"><button class="icon-btn" id="onceki" aria-label="Önceki ay">' + icon('chevL') + '</button><h3>' + C.AYLAR[aySira] + ' ' + yil + '</h3><button class="icon-btn" id="sonraki" aria-label="Sonraki ay">' + icon('chevR') + '</button>' +
            '<button class="btn btn-ghost btn-s" id="bugun">Bugün</button>' +
            '<div class="legend">' + C.ETKINLIK.map(function (t) { return '<span><i class="lg lg-' + t.renk + '"></i>' + esc(t.ad) + '</span>'; }).join('') + '</div></div>' +
          '<div class="cal-grid">' + C.GUNLER.map(function (d) { return '<div class="cal-dow">' + d + '</div>'; }).join('') +
            hucreler.map(function (h) {
              if (!h) return '<div class="cal-cell off"></div>';
              var gunun = olaylar.filter(function (e) { return e.tarih === h; }).sort(function (a, b) { return (a.saat || '').localeCompare(b.saat || ''); });
              return '<div class="cal-cell' + (h === bugun ? ' today' : '') + '" data-gun="' + h + '"><span class="cal-n">' + C.parse(h).getDate() + '</span>' +
                gunun.slice(0, 3).map(function (e) { var t = C.find(C.ETKINLIK, e.tur); return '<span class="ev ev-' + t.renk + '" title="' + esc(e.baslik) + '"><b>' + esc(e.saat || '') + '</b> ' + esc(e.baslik) + '</span>'; }).join('') +
                (gunun.length > 3 ? '<span class="ev-more">+' + (gunun.length - 3) + ' daha</span>' : '') + '</div>';
            }).join('') +
          '</div>' +
        '</section>' +
        '<section class="card cal-side"><div class="card-head"><h3>Bu ay</h3><span class="muted">' + ayin.length + ' etkinlik</span></div>' +
          (ayin.length ? '<div class="agenda">' + ayin.map(C.etkinlikSatiri).join('') + '</div>' : C.bos('cal', 'Bu ay etkinlik yok')) +
        '</section>' +
      '</div>';
    root.innerHTML = C.shell('#/takvim', 'Takvim', govde, C.editBtn('<button class="btn btn-primary" id="yeniEt">' + icon('plus', 16) + ' Etkinlik ekle</button>'));
    C.bindShell();
    var kay = function (n) { var d = C.parse(ay); d.setMonth(d.getMonth() + n); C.state.takvimAy = C.iso(d); C.render(); };
    root.querySelector('#onceki').onclick = function () { kay(-1); };
    root.querySelector('#sonraki').onclick = function () { kay(1); };
    root.querySelector('#bugun').onclick = function () { C.state.takvimAy = null; C.render(); };
    var y = root.querySelector('#yeniEt'); if (y) y.onclick = function () { C.etkinlikModal({}); };
    if (C.can('edit')) root.querySelectorAll('[data-gun]').forEach(function (c) { c.ondblclick = function () { C.etkinlikModal({ tarih: c.getAttribute('data-gun') }); }; c.title = 'Çift tıklayın: bu güne etkinlik ekleyin'; });
  });

  // ================= MÜŞTERİLER =================
  C.route(/^#\/musteriler$/, function (root) {
    var temsilciler = C.db.users.filter(function (u) { return u.rol === 'temsilci'; });
    var govde = '<div class="note note-blue">' + icon('info', 16) + '<span>Yapım şirketleri ayrı bir liste olarak tutuluyor (taslak varsayım — D-18). Müşteriler Faz 1\'de sisteme giriş yapmaz; sadece paket linkini açar.</span></div>' +
      '<div class="clients">' + C.db.clients.map(function (m) {
        var pr = C.db.projects.filter(function (p) { return p.musteriId === m.id; });
        var tm = C.get('users', m.temsilciId);
        return '<section class="card client"><div class="client-head"><span class="client-logo">' + esc(m.ad.charAt(0)) + '</span><div><b>' + esc(m.ad) + '</b><small>' + esc(m.yetkili) + '</small></div></div>' +
          '<dl class="attrs attrs-2"><div><dt>Telefon</dt><dd>' + (C.can('contact') ? esc(m.telefon) : '<span class="masked">' + icon('lock', 13) + ' Gizli</span>') + '</dd></div><div><dt>E-posta</dt><dd>' + (C.can('contact') ? esc(m.eposta) : '<span class="masked">' + icon('lock', 13) + ' Gizli</span>') + '</dd></div>' +
          '<div><dt>Temsilci</dt><dd>' + esc(tm ? tm.ad : 'Atanmadı') + '</dd></div><div><dt>Proje</dt><dd>' + pr.length + '</dd></div></dl></section>';
      }).join('') + '</div>';
    root.innerHTML = C.shell('#/musteriler', 'Müşteriler', govde, C.editBtn('<button class="btn btn-primary" id="yeniM">' + icon('plus', 16) + ' Müşteri ekle</button>'));
    C.bindShell();
    var y = root.querySelector('#yeniM');
    if (y) y.onclick = function () {
      C.modal({
        baslik: 'Müşteri ekle',
        govde: '<div class="form-grid"><div class="field full"><label>Şirket adı</label><input id="ma"></div><div class="field half"><label>Yetkili kişi</label><input id="my"></div><div class="field half"><label>Telefon</label><input id="mt"></div><div class="field half"><label>E-posta</label><input id="me"></div>' +
          '<div class="field half"><label>Müşteri temsilcisi</label><select id="mr">' + C.options(temsilciler.map(function (u) { return { k: u.id, ad: u.ad }; }), '', 'Atanmadı') + '</select></div></div>',
        onOk: function (b) {
          if (!C.val(b, '#ma')) return false;
          C.db.clients.push({ id: C.uid('m'), ad: C.val(b, '#ma'), yetkili: C.val(b, '#my'), telefon: C.val(b, '#mt'), eposta: C.val(b, '#me'), temsilciId: C.val(b, '#mr') });
          C.save(); C.toast('Müşteri eklendi'); C.render();
        }
      });
    };
  });

  // ================= KULLANICILAR =================
  C.route(/^#\/kullanicilar$/, function (root) {
    var yonetici = C.can('users'), me = C.me();
    var govde =
      '<div class="note note-blue">' + icon('info', 16) + '<span>Ajansa yeni kullanıcıyı sadece <b>yönetici</b> ekler (K-002). Kırmızı işaretli satırlar henüz onaylanmamış taslak yetkiler.</span></div>' +
      '<section class="card"><div class="card-head"><h3>Ekip</h3></div><div class="rows">' + C.db.users.map(function (u) {
        var r = C.ROLES[u.rol];
        return '<div class="row"><span class="avatar-s">' + esc(u.ad.split(' ').map(function (s) { return s[0]; }).join('')) + '</span><div class="row-main"><b>' + esc(u.ad) + (u.id === me.id ? ' <small class="muted">(siz)</small>' : '') + '</b><small>' + esc(u.eposta) + '</small></div>' +
          '<div class="row-side"><span class="badge b-' + (r.edit ? 'blue' : 'gray') + '">' + esc(r.ad) + '</span>' + (yonetici && u.id !== me.id ? '<button class="icon-btn" data-sil="' + u.id + '" title="Kaldır">' + icon('trash', 16) + '</button>' : '') + '</div></div>';
      }).join('') + '</div></section>' +
      '<section class="card"><div class="card-head"><h3>Rol yetkileri</h3></div><div class="perm">' +
        '<div class="perm-row perm-head"><span>Rol</span><span>Görüntüleme</span><span>Düzenleme</span><span>İletişim bilgisi</span><span>Kullanıcı yönetimi</span><span>Kaynak</span></div>' +
        Object.keys(C.ROLES).map(function (k) {
          var r = C.ROLES[k], ok = function (b) { return b ? '<span class="yes">' + icon('check', 15) + '</span>' : '<span class="no">' + icon('x', 15) + '</span>'; };
          var taslak = /taslak/.test(r.not);
          return '<div class="perm-row' + (taslak ? ' draft' : '') + '"><span><b>' + esc(r.ad) + '</b></span><span>' + ok(true) + '</span><span>' + ok(r.edit) + '</span><span>' + ok(r.contact) + '</span><span>' + ok(r.users) + '</span><span class="small">' + esc(r.not) + '</span></div>';
        }).join('') + '</div></section>';
    root.innerHTML = C.shell('#/kullanicilar', 'Kullanıcılar', govde, yonetici ? '<button class="btn btn-primary" id="yeniU">' + icon('plus', 16) + ' Kullanıcı ekle</button>' : '');
    C.bindShell();
    root.querySelectorAll('[data-sil]').forEach(function (b) { b.onclick = function () { C.db.users = C.db.users.filter(function (u) { return u.id !== b.getAttribute('data-sil'); }); C.save(); C.toast('Kullanıcı kaldırıldı'); C.render(); }; });
    var y = root.querySelector('#yeniU');
    if (y) y.onclick = function () {
      C.modal({
        baslik: 'Kullanıcı ekle',
        govde: '<div class="form-grid"><div class="field full"><label>Ad soyad</label><input id="ua"></div><div class="field half"><label>E-posta</label><input id="ue" type="email"></div>' +
          '<div class="field half"><label>Rol</label><select id="ur">' + C.options(Object.keys(C.ROLES).map(function (k) { return { k: k, ad: C.ROLES[k].ad }; }), 'cast') + '</select></div></div>' +
          '<p class="muted small">Taslakta davet e-postası gönderilmez; kullanıcı giriş ekranında görünür.</p>',
        onOk: function (b) {
          if (!C.val(b, '#ua')) return false;
          C.db.users.push({ id: C.uid('u'), ad: C.val(b, '#ua'), eposta: C.val(b, '#ue'), rol: C.val(b, '#ur') });
          C.save(); C.toast('Kullanıcı eklendi'); C.render();
        }
      });
    };
  });

  // ================= KAYIT SORULARI =================
  var TIP_AD = { text: 'Kısa metin', email: 'E-posta', tel: 'Telefon', url: 'Link', date: 'Tarih', number: 'Sayı', textarea: 'Uzun metin', select: 'Tek seçim', multi: 'Çoklu seçim', tri: 'Evet / Hayır / Görüşülür', bool: 'Onay kutusu', photos: 'Fotoğraf yükleme' };
  var EKLENEBILIR_TIPLER = ['text', 'textarea', 'number', 'select', 'multi', 'tri'];
  C.route(/^#\/kayit-sorulari$/, function (root) {
    var yonetici = C.can('users');
    var toplam = 0, ozel = C.db.ekSorular.length; C.SORULAR.forEach(function (b) { toplam += b.alanlar.length; });
    var govde =
      '<div class="note note-blue">' + icon('info', 16) + '<span>Aday sitesindeki kayıt formunda sorulan <b>' + toplam + ' soru</b>' + (ozel ? ' (' + ozel + ' tanesi sonradan eklendi)' : '') + '. Yeni soruyu <b>sadece yönetici</b> ekler (K-011); eklenen soru aday sitesindeki forma ve aday profillerine hemen yansır.</span></div>' +
      C.SORULAR.map(function (b, i) {
        var eklenebilir = C.EK_SORU_BOLUMLERI.indexOf(b.id) >= 0;
        return '<section class="card"><div class="card-head"><h3><span class="step-n">' + (i + 1) + '</span> ' + esc(b.ad) + '</h3><span class="muted">' + b.alanlar.length + ' soru</span></div>' +
          '<div class="q-list">' + b.alanlar.map(function (f) {
            return '<div class="q-row' + (f.ozel ? ' q-new' : '') + '"><span class="q-name">' + esc(f.ad) + (f.ozel ? ' <span class="badge b-indigo">Sonradan eklendi</span>' : '') + '</span><span class="q-type">' + esc(TIP_AD[f.tip] || f.tip) + '</span>' +
              '<span class="q-opts">' + (f.secenek ? esc(f.secenek.join(' · ')) : '') + '</span>' +
              '<span class="q-end">' + (f.zorunlu ? '<span class="badge b-blue">Zorunlu</span>' : '<span class="badge b-gray">İsteğe bağlı</span>') +
              (f.ozel && yonetici ? '<button class="icon-btn" data-soru-sil="' + esc(f.k) + '" title="Soruyu kaldır">' + icon('trash', 15) + '</button>' : '') + '</span></div>';
          }).join('') + '</div>' +
          (eklenebilir && yonetici ? '<button class="btn btn-ghost btn-s q-add" data-soru-ekle="' + b.id + '">' + icon('plus', 14) + ' Bu bölüme soru ekle</button>' : '') +
          '</section>';
      }).join('');
    root.innerHTML = C.shell('#/kayit-sorulari', 'Kayıt Soruları', govde,
      (!yonetici ? '<span class="ro-pill">' + icon('lock', 14) + ' Soruları sadece yönetici ekler</span>' : '') + '<a class="btn btn-ghost" href="aday/#/basvur" target="_blank" rel="noopener">' + icon('eye', 16) + ' Formu aday gözüyle aç</a>');
    C.bindShell();

    root.querySelectorAll('[data-soru-sil]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-soru-sil');
        C.db.ekSorular = C.db.ekSorular.filter(function (q) { return q.k !== k; });
        C.sorulariKur(C.db.ekSorular); C.save(); C.toast('Soru kaldırıldı. Daha önce verilen cevaplar profillerde saklı kalır.'); C.render();
      };
    });
    root.querySelectorAll('[data-soru-ekle]').forEach(function (b) {
      b.onclick = function () {
        var bolum = C.bolum(b.getAttribute('data-soru-ekle'));
        C.modal({
          baslik: '“' + bolum.ad + '” bölümüne soru ekle', tamam: 'Soruyu ekle',
          govde: '<div class="form-grid">' +
            '<div class="field full"><label>Soru</label><input id="sq" placeholder="Örn. Sahne deneyiminiz var mı?"></div>' +
            '<div class="field half"><label>Cevap tipi</label><select id="st">' + C.options(EKLENEBILIR_TIPLER.map(function (t) { return { k: t, ad: TIP_AD[t] }; }), 'text') + '</select></div>' +
            '<div class="field half"><label>&nbsp;</label><label class="check"><input type="checkbox" id="sz"> Zorunlu soru</label></div>' +
            '<div class="field full" id="soWrap" hidden><label>Seçenekler (virgülle ayırın)</label><input id="so" placeholder="Örn. Az, Orta, Çok"></div>' +
            '<div class="form-err" id="sErr" hidden></div></div>',
          onMount: function (m) {
            var t = m.querySelector('#st');
            t.onchange = function () { m.querySelector('#soWrap').hidden = ['select', 'multi'].indexOf(t.value) < 0; };
          },
          onOk: function (m) {
            var soru = C.val(m, '#sq'), tip = C.val(m, '#st');
            var secenek = C.val(m, '#so').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
            var hata = !soru ? 'Soru metnini yazın.' : (['select', 'multi'].indexOf(tip) >= 0 && secenek.length < 2) ? 'En az iki seçenek yazın.' : '';
            if (hata) { var e = m.querySelector('#sErr'); e.hidden = false; e.innerHTML = icon('info', 16) + '<span>' + esc(hata) + '</span>'; return false; }
            var q = { k: C.uid('ek_'), bolum: bolum.id, ad: soru, tip: tip, zorunlu: m.querySelector('#sz').checked, ekleyen: C.me().ad, tarih: C.addDays(0) };
            if (tip === 'tri') q.secenek = ['Evet', 'Hayır', 'Görüşülür'];
            if (secenek.length && ['select', 'multi'].indexOf(tip) >= 0) q.secenek = secenek;
            if (tip === 'text' || tip === 'select' || tip === 'number') q.yarim = true;
            C.db.ekSorular.push(q); C.sorulariKur(C.db.ekSorular); C.save(); C.toast('Soru eklendi — aday formunda artık görünüyor'); C.render();
          }
        });
      };
    });
  });

  // ================= TASLAK NOTLARI =================
  var VARSAYIMLAR = [
    ['A-4a', 'Kısıtlı kullanıcı adayların ve müşterilerin telefon / e-posta bilgilerini göremez.'],
    ['A-4b', 'Cast direktörü her şeyi düzenler; müşteri temsilcisi sadece kendine atanan müşterilerin projelerini görür.'],
    ['B-6g', 'Onaylı aday bilgilerini güncellediğinde değişiklik doğrudan geçerli olur; panelde "aday güncelledi" notu görünür.'],
    ['B-6h', 'Aday sitesi "manken" odaklı tanıtılıyor ama formda oyuncu / figüran da seçilebiliyor.'],
    ['B-6d', 'Ajans da aynı formla elle yetenek ekleyebilir; bu kayıt doğrudan havuza girer.'],
    ['B-6e', 'Kayıt soruları taslak bir listedir; ajansın onayına sunulacak.'],
    ['B-6f', 'Aday sitesi de şimdilik sadece bu bilgisayarda (localhost) açılır; gerçek adaylar ancak site yayına alınınca başvurabilir.'],
    ['B-10', 'Müsaitlik: adayın beyan ettiği genel müsaitlik + ajansın tuttuğu Müsait / Meşgul / Pasif durumu.'],
    ['B-13', 'Fotoğraflar yüklenir (en fazla 6), video link olarak girilir.'],
    ['D-18', 'Müşteriler (yapım şirketleri) ayrı bir liste olarak tutulur.'],
    ['D-20', 'Proje durumları elle değiştirilir; teklif akışı Faz 2\'de.'],
    ['D-21', 'Adayın proje içinde kendi durumu var: Önerildi / Müşteri seçti / Uygun bulmadı / Kesinleşti.'],
    ['D-22', 'Projenin "aranan kriterleri" havuz filtrelerini otomatik doldurur.'],
    ['E-23', 'Müşteri paketinde telefon, e-posta ve soyad gizli; diğer bölümleri ajans paket bazında seçer.'],
    ['E-24', 'Müşteri paket linkinde her aday için "Seç / Uygun değil" der ve not bırakır; cevap panele düşer.'],
    ['F-29', 'Proje "Onaylanan" yapılınca çekim etkinliği takvime otomatik eklenir.'],
    ['F-30', 'Aynı yetenek aynı gün ve saatte iki etkinliğe eklenirse uyarı verilir.']
  ];
  C.route(/^#\/taslak-notlari$/, function (root) {
    var govde =
      '<section class="card"><div class="card-head"><h3>Bu taslak nedir?</h3></div>' +
        '<p>Tıklanabilir bir ön izleme. Arka taraf (sunucu, veritabanı) yok; bütün veriler <b>bu tarayıcıda</b> tutuluyor. Başka bilgisayar ya da tarayıcı aynı veriyi görmez. Sayfayı yenileseniz de kaybolmaz.</p>' +
        '<p class="muted small">Cevabı henüz gelmemiş sorularda aşağıdaki varsayımlar kullanıldı. Her biri kolayca değiştirilebilir; kodlar <code>knowledge/05-acik-sorular.md</code> dosyasındaki soru numaralarıdır.</p>' +
      '</section>' +
      '<section class="card"><div class="card-head"><h3>Taslak varsayımları (' + VARSAYIMLAR.length + ')</h3></div><div class="assume">' +
        VARSAYIMLAR.map(function (v) { return '<div class="as-row"><span class="as-code">' + esc(v[0]) + '</span><span>' + esc(v[1]) + '</span></div>'; }).join('') +
      '</div></section>' +
      '<section class="card"><div class="card-head"><h3>Örnek veri</h3></div><p>Örnek yetenekler, projeler ve paketler uydurmadır; fotoğraflar yer tutucu çizimdir. Denemelerden sonra başlangıç hâline dönmek için:</p>' +
        '<button class="btn btn-ghost" id="sifirla">' + icon('refresh', 16) + ' Örnek veriyi sıfırla</button></section>';
    root.innerHTML = C.shell('#/taslak-notlari', 'Taslak Notları', govde);
    C.bindShell();
    var s = root.querySelector('#sifirla');
    s.onclick = function () {
      if (s.getAttribute('data-onay')) { var uid = C.me().id; C.reset(); C.login(C.get('users', uid) ? uid : 'u1'); C.state = { secili: [], hedefProje: null, filtre: null, takvimAy: null }; C.toast('Örnek veri sıfırlandı'); C.go('#/panel'); return; }
      s.setAttribute('data-onay', '1'); s.classList.add('btn-red'); s.innerHTML = icon('refresh', 16) + ' Emin misiniz? Tekrar tıklayın';
    };
  });

  // ================= ADAY KAYIT SAYFASI (herkese açık) =================
  C.route(/^#\/kayit$/, function () { location.href = 'aday/#/basvur'; }, { pub: true });
  C.route(/^#\/eski-kayit$/, function (root) {
    root.innerHTML =
      '<div class="reg">' +
        '<aside class="reg-side">' +
          '<img class="reg-logo yuz-logo" src="img/ajans-yuz.jpg" alt="">' +
          '<h1>Hüsrev Cast Ajans yetenek ağına katılın</h1>' +
          '<p>Reklam, dizi, film, katalog ve defile projeleri için adaylarımızı bu formla değerlendiriyoruz.</p>' +
          '<ul class="reg-points"><li>' + icon('check', 16) + ' Yaklaşık 8 dakika sürer</li><li>' + icon('check', 16) + ' Bilgileriniz yalnızca casting sürecinde kullanılır</li><li>' + icon('check', 16) + ' Uygun bir iş olduğunda sizi arayacağız</li></ul>' +
          '<div class="reg-orb"></div>' +
        '</aside>' +
        '<main class="reg-main"><div class="reg-inner" id="rf"></div></main>' +
      '</div>';
    C.soruFormu({
      kok: root.querySelector('#rf'), degerler: { fotograflar: [] }, kayitModu: 'aday',
      onKaydet: function (v) {
        var t = { id: C.uid('t'), durum: 'basvuru', kaynak: 'kayit', olusturma: C.addDays(0), rizaTarihi: C.addDays(0), uygunluk: 'musait', etiketler: ['Yeni yüz'], notlar: '', c: v };
        C.db.talents.push(t);
        if (!C.save()) { C.db.talents.pop(); return; }
        root.querySelector('#rf').innerHTML =
          '<div class="form-card done-card"><span class="done-ic">' + icon('check', 34) + '</span><h2>Başvurunuz alındı</h2>' +
          '<p>Teşekkürler ' + esc(v.ad) + '. Bilgilerinizi inceledikten sonra uygun bir proje olduğunda sizinle iletişime geçeceğiz.</p>' +
          '<a class="btn btn-ghost" href="#/kayit" id="yeniKayit">Yeni kayıt</a></div>';
        root.querySelector('#yeniKayit').onclick = function (e) { e.preventDefault(); C.render(); };
      }
    });
  }, { pub: true });
})(window.C);
