/* Hüsrev Cast Ajans taslak — projeler, aday paketleri, müşteri paket sayfası */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;

  // ---------- ortak işlemler ----------
  C.projeyeEkle = function (pid, ids) {
    var p = C.project(pid), n = 0;
    ids.forEach(function (id) { if (!p.adaylar.some(function (a) { return a.t === id; })) { p.adaylar.push({ t: id, d: 'onerildi' }); n++; } });
    C.save(); C.toast(n ? n + ' aday projeye eklendi' : 'Seçilenler zaten projede');
  };

  C.projeSecModal = function (onSec) {
    var acik = C.visibleProjects().filter(function (p) { return ['onaylanan', 'onaylanmayan'].indexOf(p.durum) < 0; });
    C.modal({
      baslik: 'Hangi projeye eklensin?', tamam: 'Ekle',
      govde: acik.length ? '<div class="pick-list">' + acik.map(function (p, i) {
        var m = C.client(p.musteriId);
        return '<label class="pick-row"><input type="radio" name="pp" value="' + p.id + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + esc(p.ad) + '</b><small>' + esc(m ? m.ad : '') + ' · ' + esc(C.fmtDate(p.tarih)) + '</small></span>' + C.badge(C.PROJE_DURUM, p.durum) + '</label>';
      }).join('') + '</div>' : '<p class="muted">Açık proje yok. Önce proje oluşturun.</p>',
      onOk: function (b) { var r = b.querySelector('input[name=pp]:checked'); if (!r) return false; onSec(r.value); }
    });
  };

  var PAKET_ALANLARI = [['fiziksel', 'Fiziksel özellikler'], ['egitim', 'Eğitim, diller ve beceriler'], ['tavizler', 'Rol için tavizler'], ['video', 'Tanıtım videosu']];

  C.paketModal = function (ids, pidVarsayilan) {
    var projeler = C.visibleProjects().filter(function (p) { return p.durum !== 'onaylanmayan'; });
    if (!projeler.length) { C.toast('Paket bir projeye bağlı olmalı. Önce proje oluşturun.', 'err'); return; }
    var pid0 = pidVarsayilan || projeler[0].id;
    C.modal({
      baslik: 'Aday paketi oluştur', tamam: 'Paketi oluştur', genis: true,
      govde:
        '<div class="form-grid">' +
          '<div class="field half"><label>Proje</label><select id="kp">' + C.options(projeler.map(function (p) { return { k: p.id, ad: p.ad }; }), pid0) + '</select></div>' +
          '<div class="field half"><label>Paket başlığı</label><input id="kb" placeholder="Örn. 1. seçki"></div>' +
          '<div class="field full"><span class="lab">Müşteri neleri görsün?</span><div class="checks">' +
            '<label class="check"><input type="checkbox" checked disabled> Fotoğraflar, ad ve yaş</label>' +
            PAKET_ALANLARI.map(function (a) { return '<label class="check"><input type="checkbox" data-al="' + a[0] + '"' + (a[0] !== 'tavizler' ? ' checked' : '') + '> ' + esc(a[1]) + '</label>'; }).join('') +
          '</div><small class="hint">' + icon('lock', 12) + ' Telefon, e-posta ve soyad müşteriye hiçbir zaman gösterilmez (taslak varsayım — E-23).</small></div>' +
          '<div class="field full"><span class="lab">Paketteki adaylar (' + ids.length + ')</span><div class="pk-faces">' + ids.map(function (id) {
            var t = C.talent(id); return t ? '<span class="pk-face"><img src="' + C.photo(t, 0) + '" alt=""><small>' + esc(t.c.ad) + '</small></span>' : '';
          }).join('') + '</div></div>' +
        '</div>',
      onOk: function (b) {
        var pid = b.querySelector('#kp').value, p = C.project(pid);
        var k = {
          id: C.uid('k'), token: C.token(), projeId: pid, baslik: C.val(b, '#kb') || (p.ad + ' — seçki'), talentIds: ids.slice(), olusturma: C.addDays(0),
          alanlar: [].map.call(b.querySelectorAll('[data-al]:checked'), function (x) { return x.getAttribute('data-al'); }), acilma: 0, gonderildi: '', geri: {}
        };
        C.db.packages.push(k);
        ids.forEach(function (id) { if (!p.adaylar.some(function (a) { return a.t === id; })) p.adaylar.push({ t: id, d: 'onerildi' }); });
        C.save();
        C.state.secili = [];
        setTimeout(function () { C.linkModal(k); }, 0);
      }
    });
  };

  C.linkModal = function (k) {
    var url = C.paketUrl(k);
    C.modal({
      baslik: 'Paket hazır', alt: false,
      govde: '<p>Bu linki müşteriye WhatsApp veya e-posta ile gönderin. Müşteri giriş yapmadan adayları inceleyip seçim yapabilir.</p>' +
        '<div class="linkbox"><input readonly value="' + esc(url) + '"><button class="btn btn-primary btn-s" id="kopyala">' + icon('copy', 15) + ' Kopyala</button></div>' +
        '<div class="note note-amber">' + icon('info', 16) + '<span>Demo sürümde veriler bu tarayıcıda tutulur; link başka bir cihazda açılırsa adaylar görünmez (E-27).</span></div>' +
        '<div class="right gap"><a class="btn btn-ghost" href="#/paketler" data-kapat>Paketlere git</a><a class="btn btn-light" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('eye', 15) + ' Müşteri gibi aç</a></div>',
      onMount: function (b, close) {
        b.querySelector('#kopyala').onclick = function () { C.copy(url); };
        b.querySelector('[data-kapat]').addEventListener('click', close);
      }
    });
  };

  // ================= PROJELER LİSTESİ =================
  C.route(/^#\/projeler$/, function (root) {
    var projeler = C.visibleProjects(), aktifSekme = C.state.projeSekme || 'hepsi';
    var say = function (k) { return projeler.filter(function (p) { return p.durum === k; }).length; };
    var sekmeler = [{ k: 'hepsi', ad: 'Tümü', n: projeler.length }].concat(C.PROJE_DURUM.map(function (d) { return { k: d.k, ad: d.ad, n: say(d.k) }; }));
    var liste = projeler.filter(function (p) { return aktifSekme === 'hepsi' || p.durum === aktifSekme; }).sort(function (a, b) { return a.tarih.localeCompare(b.tarih); });
    var u = C.me();
    var govde =
      (C.ROLES[u.rol].ownClients ? '<div class="note note-blue">' + icon('info', 16) + '<span>Müşteri temsilcisi olarak sadece size atanan müşterilerin projelerini görüyorsunuz (taslak varsayım — A-4b).</span></div>' : '') +
      '<div class="tabs">' + sekmeler.map(function (s) { return '<button class="tab' + (s.k === aktifSekme ? ' on' : '') + '" data-s="' + s.k + '">' + esc(s.ad) + ' <em>' + s.n + '</em></button>'; }).join('') + '</div>' +
      (liste.length ? '<div class="ptable card">' +
        '<div class="pt-row pt-head"><span>Proje</span><span>Müşteri</span><span>Tarih</span><span>Aday</span><span>Bütçe</span><span>Durum</span></div>' +
        liste.map(function (p) {
          var m = C.client(p.musteriId), dd = C.daysFromNow(p.tarih);
          return '<a class="pt-row" href="#/proje/' + p.id + '"><span class="pt-name"><b>' + esc(p.ad) + '</b><small>' + esc(p.isTuru) + '</small></span>' +
            '<span>' + esc(m ? m.ad : '—') + '</span>' +
            '<span>' + esc(C.fmtShort(p.tarih)) + '<small class="' + (dd >= 0 && dd <= 3 ? 'urgent' : '') + '">' + (dd === 0 ? 'bugün' : dd > 0 ? dd + ' gün sonra' : 'geçti') + '</small></span>' +
            '<span>' + p.adaylar.length + '</span>' +
            '<span>' + (p.butceMin ? esc(C.money(p.butceMin)) + ' – ' + esc(C.money(p.butceMax)) : '—') + '</span>' +
            '<span>' + C.badge(C.PROJE_DURUM, p.durum) + '</span></a>';
        }).join('') + '</div>' : C.bos('folder', 'Bu durumda proje yok'));
    root.innerHTML = C.shell('#/projeler', 'Projeler', govde, C.editBtn('<a class="btn btn-primary" href="#/projeler/yeni">' + icon('plus', 16) + ' Yeni proje</a>'));
    C.bindShell();
    root.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { C.state.projeSekme = b.getAttribute('data-s'); C.render(); }; });
  });

  // ================= PROJE FORMU (yeni / düzenle) =================
  function projeFormu(root, p) {
    var yeni = !p;
    p = p || { ad: '', musteriId: '', isTuru: '', tarih: '', bulusmaYeri: '', bulusmaSaati: '', mekan: '', butceMin: '', butceMax: '', kriter: {}, durum: 'aktif' };
    var k = p.kriter || {};
    var musteriler = C.db.clients;
    var govde =
      '<form class="card pform" id="pf" novalidate>' +
        '<h3 class="sec-title">İş bilgileri</h3>' +
        '<div class="form-grid">' +
          '<div class="field full"><label>Proje / ilan adı<i class="req">*</i></label><input name="ad" value="' + esc(p.ad) + '" placeholder="Örn. Dondurma reklamı — yaz kampanyası"></div>' +
          '<div class="field half"><label>Müşteri<i class="req">*</i></label><select name="musteriId">' + C.options(musteriler.map(function (m) { return { k: m.id, ad: m.ad }; }), p.musteriId, 'Seçin') + '</select></div>' +
          '<div class="field half"><label>İş türü<i class="req">*</i></label><select name="isTuru">' + C.options(C.IS_TURLERI, p.isTuru, 'Seçin') + '</select></div>' +
          '<div class="field quarter"><label>Tarih<i class="req">*</i></label><input type="date" name="tarih" value="' + esc(p.tarih) + '"></div>' +
          '<div class="field quarter"><label>Buluşma saati</label><input type="time" name="bulusmaSaati" value="' + esc(p.bulusmaSaati) + '"></div>' +
          '<div class="field half"><label>Buluşma yeri</label><input name="bulusmaYeri" value="' + esc(p.bulusmaYeri) + '"></div>' +
          '<div class="field half"><label>Mekan</label><input name="mekan" value="' + esc(p.mekan) + '"></div>' +
          '<div class="field quarter"><label>Bütçe (en az)</label><div class="unit-input"><input type="number" name="butceMin" value="' + esc(p.butceMin) + '"><span>₺</span></div></div>' +
          '<div class="field quarter"><label>Bütçe (en çok)</label><div class="unit-input"><input type="number" name="butceMax" value="' + esc(p.butceMax) + '"><span>₺</span></div></div>' +
        '</div>' +
        '<h3 class="sec-title">Aranan kriterler <small>Havuzda "aday bul" dediğinizde filtreler bunlarla dolar (taslak varsayım — D-22)</small></h3>' +
        '<div class="form-grid">' +
          '<div class="field quarter"><label>Kategori</label><select name="k_kategori">' + C.options(['Manken', 'Oyuncu', 'Figüran', 'Fotomodel', 'Dansçı'], k.kategori, 'Fark etmez') + '</select></div>' +
          '<div class="field quarter"><label>Cinsiyet</label><select name="k_cinsiyet">' + C.options(['Kadın', 'Erkek'], k.cinsiyet, 'Fark etmez') + '</select></div>' +
          '<div class="field quarter"><label>Yaş aralığı</label><div class="range"><input type="number" name="k_yasMin" value="' + esc(k.yasMin) + '"><span>–</span><input type="number" name="k_yasMax" value="' + esc(k.yasMax) + '"></div></div>' +
          '<div class="field quarter"><label>En az boy</label><div class="unit-input"><input type="number" name="k_boyMin" value="' + esc(k.boyMin) + '"><span>cm</span></div></div>' +
          '<div class="field quarter"><label>Şehir</label><select name="k_sehir">' + C.options(C.SEHIRLER, k.sehir, 'Fark etmez') + '</select></div>' +
          '<div class="field full"><label>Ek notlar</label><textarea name="k_not" rows="2" placeholder="Görünüm, tarz, özel istekler">' + esc(k.not) + '</textarea></div>' +
        '</div>' +
        '<div class="form-err" id="pErr" hidden></div>' +
        '<div class="form-nav"><a class="btn btn-ghost" href="' + (yeni ? '#/projeler' : '#/proje/' + p.id) + '">Vazgeç</a><button class="btn btn-primary" type="submit">' + (yeni ? 'Projeyi oluştur' : 'Kaydet') + '</button></div>' +
      '</form>';
    root.innerHTML = C.shell('#/projeler', '<a class="crumb" href="#/projeler">Projeler</a> <span class="crumb-sep">/</span> ' + (yeni ? 'Yeni proje' : esc(p.ad)), '<div class="form-wrap">' + govde + '</div>');
    C.bindShell();
    root.querySelector('#pf').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target), v = {};
      fd.forEach(function (val, key) { v[key] = String(val).trim(); });
      var eksik = [];
      if (!v.ad) eksik.push('Proje adı'); if (!v.musteriId) eksik.push('Müşteri'); if (!v.isTuru) eksik.push('İş türü'); if (!v.tarih) eksik.push('Tarih');
      if (eksik.length) { var er = root.querySelector('#pErr'); er.hidden = false; er.innerHTML = icon('info', 16) + '<span>Lütfen doldurun: ' + eksik.join(', ') + '</span>'; return; }
      var hedef = yeni ? { id: C.uid('p'), durum: 'aktif', olusturma: C.addDays(0), adaylar: [] } : p;
      ['ad', 'musteriId', 'isTuru', 'tarih', 'bulusmaYeri', 'bulusmaSaati', 'mekan'].forEach(function (x) { hedef[x] = v[x]; });
      hedef.butceMin = v.butceMin ? +v.butceMin : ''; hedef.butceMax = v.butceMax ? +v.butceMax : '';
      hedef.kriter = { kategori: v.k_kategori, cinsiyet: v.k_cinsiyet, yasMin: v.k_yasMin, yasMax: v.k_yasMax, boyMin: v.k_boyMin, sehir: v.k_sehir, not: v.k_not };
      if (yeni) C.db.projects.push(hedef);
      C.save(); C.toast(yeni ? 'Proje oluşturuldu' : 'Proje güncellendi'); C.go('#/proje/' + hedef.id);
    };
  }
  C.route(/^#\/projeler\/yeni$/, function (root) { if (!C.can('edit')) return C.go('#/projeler'); projeFormu(root, null); });

  // ================= PROJE DETAY =================
  C.route(/^#\/proje\/(\w+)(?:\/(\w+))?$/, function (root, id, sekme) {
    var p = C.project(id);
    if (!p) { root.innerHTML = C.shell('#/projeler', 'Bulunamadı', C.bos('folder', 'Proje bulunamadı')); C.bindShell(); return; }
    if (sekme === 'duzenle') { if (!C.can('edit')) return C.go('#/proje/' + id); return projeFormu(root, p); }
    sekme = sekme || 'ozet';
    var m = C.client(p.musteriId), edit = C.can('edit');
    var paketler = C.db.packages.filter(function (k) { return k.projeId === p.id; });
    var etkinlikler = C.db.events.filter(function (e) { return e.projeId === p.id; }).sort(function (a, b) { return (a.tarih + a.saat).localeCompare(b.tarih + b.saat); });
    var SEK = [['ozet', 'Özet'], ['adaylar', 'Adaylar (' + p.adaylar.length + ')'], ['paketler', 'Paketler (' + paketler.length + ')'], ['etkinlikler', 'Etkinlikler (' + etkinlikler.length + ')']];

    var icerik = '';
    if (sekme === 'ozet') {
      var k = p.kriter || {};
      var kriterler = [k.kategori, k.cinsiyet, (k.yasMin || k.yasMax) ? (k.yasMin || '?') + '–' + (k.yasMax || '?') + ' yaş' : '', k.boyMin ? k.boyMin + ' cm üstü' : '', k.sehir].filter(Boolean);
      icerik =
        '<div class="grid-2">' +
          '<section class="card"><div class="card-head"><h3>İş bilgileri</h3>' + C.editBtn('<a class="link" href="#/proje/' + p.id + '/duzenle">' + icon('edit', 14) + ' Düzenle</a>') + '</div>' +
            '<dl class="attrs attrs-2">' +
              '<div><dt>Müşteri</dt><dd>' + esc(m ? m.ad : '—') + '</dd></div><div><dt>İş türü</dt><dd>' + esc(p.isTuru) + '</dd></div>' +
              '<div><dt>Tarih</dt><dd>' + esc(C.fmtDate(p.tarih, true)) + '</dd></div><div><dt>Buluşma</dt><dd>' + esc(p.bulusmaSaati || '—') + (p.bulusmaYeri ? ' · ' + esc(p.bulusmaYeri) : '') + '</dd></div>' +
              '<div><dt>Mekan</dt><dd>' + esc(p.mekan || '—') + '</dd></div><div><dt>Bütçe aralığı</dt><dd>' + (p.butceMin ? esc(C.money(p.butceMin)) + ' – ' + esc(C.money(p.butceMax)) : '—') + '</dd></div>' +
            '</dl></section>' +
          '<section class="card"><div class="card-head"><h3>Aranan kriterler</h3></div>' +
            '<div class="crit">' + (kriterler.length ? kriterler.map(function (x) { return '<span class="chip chip-soft">' + esc(x) + '</span>'; }).join('') : '<span class="muted">Belirtilmedi</span>') + '</div>' +
            (k.not ? '<p class="crit-note">' + esc(k.not) + '</p>' : '') +
            C.editBtn('<button class="btn btn-primary btn-s" id="adayBul">' + icon('search', 15) + ' Havuzda uygun aday bul</button>') +
          '</section>' +
        '</div>' +
        '<section class="card"><div class="card-head"><h3>Durum</h3><small class="muted">Durumlar şimdilik elle değiştiriliyor (taslak varsayım — D-20)</small></div>' +
          '<div class="status-flow">' + C.PROJE_DURUM.map(function (d) {
            return '<button class="sf-step sf-' + d.renk + (p.durum === d.k ? ' on' : '') + '" data-durum="' + d.k + '"' + (edit ? '' : ' disabled') + '>' + esc(d.ad) + '</button>';
          }).join('') + '</div>' +
        '</section>';
    } else if (sekme === 'adaylar') {
      var gruplar = C.ADAY_DURUM.map(function (d) { return { d: d, list: p.adaylar.filter(function (a) { return a.d === d.k; }) }; });
      icerik = (p.adaylar.length ? '' : C.bos('users', 'Bu projede henüz aday yok', 'Havuzdan kriterlere uyan adayları seçip ekleyin.', C.editBtn('<button class="btn btn-primary" id="adayBul">' + icon('search', 15) + ' Havuzda aday bul</button>'))) +
        gruplar.filter(function (g) { return g.list.length; }).map(function (g) {
          return '<h3 class="group-title">' + C.badge(C.ADAY_DURUM, g.d.k) + ' <span>' + g.list.length + '</span></h3><div class="tgrid">' + g.list.map(function (a) {
            var t = C.talent(a.t); if (!t) return '';
            var notlar = paketler.map(function (kk) { return kk.geri && kk.geri[t.id] && kk.geri[t.id].n; }).filter(Boolean);
            return C.talentCard(t, { ek:
              (notlar.length ? '<div class="client-note">' + icon('note', 13) + ' <b>Müşteri notu:</b> ' + esc(notlar[notlar.length - 1]) + '</div>' : '') +
              '<div class="tc-actions">' + (edit ? '<select class="select-s" data-ad="' + t.id + '">' + C.options(C.ADAY_DURUM, a.d) + '</select><button class="icon-btn" title="Projeden çıkar" data-cikar="' + t.id + '">' + icon('trash', 16) + '</button>' : C.badge(C.ADAY_DURUM, a.d)) + '</div>' });
          }).join('') + '</div>';
        }).join('');
    } else if (sekme === 'paketler') {
      icerik = paketler.length ? paketler.map(paketSatiri).join('') : C.bos('box', 'Bu proje için paket yok', 'Adaylar sekmesinden ya da havuzdan paket oluşturun.');
    } else if (sekme === 'etkinlikler') {
      icerik = '<section class="card">' + (etkinlikler.length ? '<div class="agenda">' + etkinlikler.map(C.etkinlikSatiri).join('') + '</div>' : C.bos('cal', 'Etkinlik yok')) + '</section>';
    }

    var dd = C.daysFromNow(p.tarih);
    var govde =
      '<div class="phead">' +
        '<div><div class="phead-client">' + icon('building', 15) + ' ' + esc(m ? m.ad : '') + '</div><h2>' + esc(p.ad) + '</h2>' +
          '<div class="phead-meta">' + C.badge(C.PROJE_DURUM, p.durum) + '<span>' + icon('cal', 14) + ' ' + esc(C.fmtDate(p.tarih)) + (dd >= 0 ? ' · ' + (dd === 0 ? 'bugün' : dd + ' gün kaldı') : '') + '</span>' + (p.mekan ? '<span>' + icon('pin', 14) + ' ' + esc(p.mekan) + '</span>' : '') + '</div></div>' +
        '<div class="phead-act">' +
          C.editBtn((p.adaylar.length ? '<button class="btn btn-primary" id="paketOlustur">' + icon('box', 16) + ' Aday paketi gönder</button>' : '') +
          '<button class="btn btn-ghost" id="etkEkle">' + icon('cal', 16) + ' Etkinlik ekle</button>') +
        '</div>' +
      '</div>' +
      '<div class="tabs tabs-line">' + SEK.map(function (s) { return '<a class="tab' + (s[0] === sekme ? ' on' : '') + '" href="#/proje/' + p.id + '/' + s[0] + '">' + esc(s[1]) + '</a>'; }).join('') + '</div>' +
      icerik;

    root.innerHTML = C.shell('#/projeler', '<a class="crumb" href="#/projeler">Projeler</a> <span class="crumb-sep">/</span> ' + esc(p.ad), govde);
    C.bindShell();

    var ab = root.querySelector('#adayBul');
    if (ab) ab.onclick = function () { C.state.hedefProje = p.id; C.state.filtre = C.kriterdenFiltre(p); C.go('#/havuz'); };
    var po = root.querySelector('#paketOlustur');
    if (po) po.onclick = function () {
      var ids = p.adaylar.filter(function (a) { return a.d !== 'musteri_reddetti'; }).map(function (a) { return a.t; });
      C.paketModal(ids.length ? ids : p.adaylar.map(function (a) { return a.t; }), p.id);
    };
    var ee = root.querySelector('#etkEkle');
    if (ee) ee.onclick = function () { C.etkinlikModal({ projeId: p.id, tarih: p.tarih, saat: p.bulusmaSaati }); };
    root.querySelectorAll('[data-durum]').forEach(function (b) {
      b.onclick = function () { durumDegistir(p, b.getAttribute('data-durum')); };
    });
    root.querySelectorAll('[data-ad]').forEach(function (s) {
      s.onchange = function () { var a = p.adaylar.filter(function (x) { return x.t === s.getAttribute('data-ad'); })[0]; a.d = s.value; C.save(); C.render(); };
    });
    root.querySelectorAll('[data-cikar]').forEach(function (b) {
      b.onclick = function () { p.adaylar = p.adaylar.filter(function (x) { return x.t !== b.getAttribute('data-cikar'); }); C.save(); C.toast('Aday projeden çıkarıldı'); C.render(); };
    });
    paketBagla(root);
  });

  // İş kesinleşince takvime işlenir (taslak varsayım — F-29: otomatik)
  function durumDegistir(p, yeni) {
    p.durum = yeni;
    if (yeni === 'onaylanan') {
      p.adaylar.forEach(function (a) { if (a.d === 'musteri_secti') a.d = 'kesinlesti'; });
      var var_ = C.db.events.some(function (e) { return e.projeId === p.id && e.tur === 'cekim'; });
      if (!var_) {
        C.db.events.push({ id: C.uid('e'), tur: 'cekim', baslik: p.ad + ' — çekim', tarih: p.tarih, saat: p.bulusmaSaati || '', projeId: p.id, talentIds: p.adaylar.filter(function (a) { return a.d === 'kesinlesti'; }).map(function (a) { return a.t; }), not: p.mekan || '' });
        C.save(); C.toast('İş kesinleşti — çekim takvime işlendi'); C.render(); return;
      }
    }
    C.save(); C.toast('Durum: ' + C.find(C.PROJE_DURUM, yeni).ad); C.render();
  }

  // ================= PAKETLER =================
  function paketSatiri(k) {
    var p = C.project(k.projeId), m = p ? C.client(p.musteriId) : null;
    var geri = k.geri || {}, evet = 0, hayir = 0;
    Object.keys(geri).forEach(function (id) { if (geri[id].s === 'evet') evet++; if (geri[id].s === 'hayir') hayir++; });
    return '<section class="card pk">' +
      '<div class="pk-head"><div><b>' + esc(k.baslik) + '</b><small>' + esc(p ? p.ad : '') + ' · ' + esc(m ? m.ad : '') + ' · ' + esc(C.fmtDate(k.olusturma)) + '</small></div>' +
        '<div class="pk-state">' + (k.gonderildi ? '<span class="badge b-green">' + icon('check', 12) + ' Müşteri seçimini gönderdi</span>' : k.acilma ? '<span class="badge b-blue">Müşteri ' + k.acilma + ' kez açtı</span>' : '<span class="badge b-gray">Henüz açılmadı</span>') + '</div></div>' +
      '<div class="pk-body"><div class="pk-faces">' + k.talentIds.map(function (id) {
        var t = C.talent(id); if (!t) return '';
        var g = geri[id], cls = g && g.s === 'evet' ? ' yes' : g && g.s === 'hayir' ? ' no' : '';
        return '<a class="pk-face' + cls + '" href="#/yetenek/' + id + '" title="' + esc(g && g.n ? g.n : '') + '"><img src="' + C.photo(t, 0) + '" alt=""><small>' + esc(t.c.ad) + '</small>' + (cls ? '<i>' + icon(cls === ' yes' ? 'check' : 'x', 11) + '</i>' : '') + '</a>';
      }).join('') + '</div>' +
        '<div class="pk-sum"><span><b>' + evet + '</b> seçildi</span><span><b>' + hayir + '</b> uygun değil</span><span><b>' + (k.talentIds.length - evet - hayir) + '</b> yanıtsız</span></div></div>' +
      '<div class="pk-foot"><button class="btn btn-ghost btn-s" data-kopya="' + k.id + '">' + icon('copy', 14) + ' Linki kopyala</button><a class="btn btn-ghost btn-s" href="' + esc(C.paketUrl(k)) + '" target="_blank" rel="noopener">' + icon('eye', 14) + ' Müşteri görünümü</a>' +
        (p ? '<a class="btn btn-ghost btn-s" href="#/proje/' + p.id + '/adaylar">Projeye git</a>' : '') + '</div>' +
      '</section>';
  }
  function paketBagla(root) {
    root.querySelectorAll('[data-kopya]').forEach(function (b) { b.onclick = function () { var k = C.get('packages', b.getAttribute('data-kopya')); C.copy(C.paketUrl(k)); }; });
  }
  C.route(/^#\/paketler$/, function (root) {
    var gorunen = C.visibleProjects().map(function (p) { return p.id; });
    var list = C.db.packages.filter(function (k) { return gorunen.indexOf(k.projeId) >= 0; }).sort(function (a, b) { return b.olusturma.localeCompare(a.olusturma); });
    var govde = '<div class="note note-blue">' + icon('info', 16) + '<span>Paket = müşteriye gönderilen link. Müşteri giriş yapmadan açar, her aday için "seçtim / uygun değil" der ve not bırakır; cevaplar buraya ve projeye düşer (taslak varsayım — E-24).</span></div>' +
      (list.length ? list.map(paketSatiri).join('') : C.bos('box', 'Henüz paket yok', 'Havuzdan aday seçip "Aday paketi oluştur" deyin.', '<a class="btn btn-primary" href="#/havuz">Havuza git</a>'));
    root.innerHTML = C.shell('#/paketler', 'Aday Paketleri', govde);
    C.bindShell(); paketBagla(root);
  });

  // ================= MÜŞTERİ PAKET SAYFASI (giriş yok) =================
  C.route(/^#\/p\/(\w+)$/, function (root, token) {
    var k = C.db.packages.filter(function (x) { return x.token === token; })[0];
    if (!k) { root.innerHTML = '<div class="pub-wrap"><div class="pk-brand"><span class="pk-marka"><img class="yuz-logo" src="img/ajans-yuz.jpg" alt=""><b>Hüsrev Cast Ajans</b></span></div>' + C.bos('link', 'Bu link geçersiz ya da kaldırılmış') + '</div>'; return; }
    k.acilma = (k.acilma || 0) + 1; C.save();
    var p = C.project(k.projeId), m = p ? C.client(p.musteriId) : null;
    var geri = k.geri = k.geri || {};
    var goster = function (al) { return k.alanlar.indexOf(al) >= 0; };

    function adayHtml(t) {
      var g = geri[t.id] || {}, c = t.c, n = Math.max(C.photoCount(t), 1);
      var attrs = [];
      if (goster('fiziksel')) attrs = attrs.concat([['Boy', c.boy + ' cm'], ['Kilo', c.kilo + ' kg'], ['Beden', c.beden], ['Ayakkabı', c.ayakkabi], ['Saç', c.sacRengi + ', ' + c.sacUzunlugu], ['Göz', c.gozRengi], ['Ten', c.ten || '—'], ['Ölçüler', c.gogus ? c.gogus + ' / ' + c.bel + ' / ' + c.kalca : '—']]);
      if (goster('egitim')) attrs = attrs.concat([['Diller', (c.diller || []).join(', ')], ['Oyunculuk eğitimi', c.oyunculukEgitimi], ['Beceriler', (c.beceriler || []).join(', ') || '—']]);
      var taviz = goster('tavizler') ? C.bolum('tavizler').alanlar.filter(function (f) { return c[f.k]; }).map(function (f) { return '<li><span class="tri tri-' + C.norm(c[f.k]).replace(/[^a-zçğıöşü]/g, '') + '">' + esc(c[f.k]) + '</span>' + esc(f.ad) + '</li>'; }).join('') : '';
      return '<article class="cl-t" id="a_' + t.id + '">' +
        '<div class="cl-t-head"><div><h3>' + esc(c.ad) + ' ' + esc((c.soyad || '').charAt(0)) + '.</h3><small>' + C.age(c.dogumTarihi) + ' yaş · ' + esc(c.sehir) + ' · ' + esc((c.kategoriler || []).join(', ')) + '</small></div>' +
          '<div class="cl-media">' + icon('camera', 14) + ' ' + C.photoCount(t) + (goster('video') && c.video ? ' &nbsp;' + icon('video', 14) + ' 1' : '') + '</div>' +
          (g.s === 'evet' ? '<span class="badge b-green big">' + icon('check', 13) + ' Seçildi</span>' : g.s === 'hayir' ? '<span class="badge b-red big">Uygun değil</span>' : '') + '</div>' +
        '<div class="cl-strip">' + Array.apply(null, Array(n)).map(function (_, i) { return '<img src="' + C.photo(t, i) + '" alt="">'; }).join('') + '</div>' +
        (attrs.length ? '<dl class="cl-attrs">' + attrs.map(function (a) { return '<div><dt>' + esc(a[0]) + '</dt><dd>' + esc(a[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
        (taviz ? '<details class="cl-taviz"><summary>Rol için tavizler</summary><ul>' + taviz + '</ul></details>' : '') +
        (goster('video') && c.video ? '<a class="cl-video" href="' + esc(c.video) + '" target="_blank" rel="noopener">' + icon('video', 16) + ' Tanıtım videosunu izle</a>' : '') +
        '<div class="cl-act"><textarea data-not="' + t.id + '" rows="1" placeholder="Not bırakın (isteğe bağlı)">' + esc(g.n || '') + '</textarea>' +
          '<button class="btn ' + (g.s === 'hayir' ? 'btn-red' : 'btn-ghost') + '" data-sec="hayir" data-t="' + t.id + '">Uygun değil</button>' +
          '<button class="btn ' + (g.s === 'evet' ? 'btn-green' : 'btn-light') + '" data-sec="evet" data-t="' + t.id + '">' + icon('check', 15) + ' Seç</button></div>' +
        '</article>';
    }

    function ciz() {
      var adaylar = k.talentIds.map(C.talent).filter(Boolean);
      var secilen = adaylar.filter(function (t) { return geri[t.id] && geri[t.id].s === 'evet'; }).length;
      root.innerHTML =
        '<div class="pub-wrap">' +
          '<header class="pk-brand"><span class="pk-marka"><img class="yuz-logo" src="img/ajans-yuz.jpg" alt=""><b>Hüsrev Cast Ajans</b></span></header>' +
          '<section class="cl-band"><div class="cl-band-in"><div><small class="kicker">Aday paketi</small><h1>' + esc(p ? p.ad : k.baslik) + '</h1>' +
            '<p>' + esc(p ? C.fmtDate(p.tarih) : '') + (p && p.mekan ? ' · ' + esc(p.mekan) : '') + '</p>' +
            '<b class="cl-count">' + secilen + ' / ' + adaylar.length + ' aday seçildi</b></div>' +
            '<div class="cl-client">' + esc(m ? m.ad : '') + '</div></div></section>' +
          '<main class="cl-list">' + adaylar.map(adayHtml).join('') + '</main>' +
          '<footer class="cl-foot"><div><b>Seçimleriniz hazır mı?</b><small>' + (k.gonderildi ? 'Seçimlerinizi ' + esc(C.fmtDate(k.gonderildi)) + ' tarihinde ilettiniz. Değişiklik yapıp tekrar gönderebilirsiniz.' : 'Gönderdiğinizde ajans ekibine iletilir.') + '</small></div>' +
            '<button class="btn btn-primary" id="gonder">Seçimlerimi ajansa gönder ' + icon('arrowR', 16) + '</button></footer>' +
          '<p class="pub-note">Bu sayfa Hüsrev Cast Ajans taslak sürümüdür. Adayların iletişim bilgileri gizlidir.</p>' +
        '</div>';
      root.querySelectorAll('[data-sec]').forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute('data-t'), s = b.getAttribute('data-sec');
          var g = geri[id] = geri[id] || {};
          g.s = g.s === s ? '' : s;
          var ta = root.querySelector('[data-not="' + id + '"]'); g.n = ta ? ta.value.trim() : g.n;
          if (p) { var a = p.adaylar.filter(function (x) { return x.t === id; })[0]; if (a && a.d !== 'kesinlesti') a.d = g.s === 'evet' ? 'musteri_secti' : g.s === 'hayir' ? 'musteri_reddetti' : 'onerildi'; }
          C.save(); var y = window.scrollY; ciz(); window.scrollTo(0, y);
        };
      });
      root.querySelectorAll('[data-not]').forEach(function (ta) {
        ta.onchange = function () { var id = ta.getAttribute('data-not'); (geri[id] = geri[id] || {}).n = ta.value.trim(); C.save(); };
      });
      root.querySelector('#gonder').onclick = function () {
        root.querySelectorAll('[data-not]').forEach(function (ta) { var id = ta.getAttribute('data-not'); (geri[id] = geri[id] || {}).n = ta.value.trim(); });
        k.gonderildi = C.addDays(0); C.save(); C.toast('Teşekkürler, seçimleriniz ajansa iletildi'); var y = window.scrollY; ciz(); window.scrollTo(0, y);
      };
    }
    ciz();
  }, { pub: true });
})(window.C);
