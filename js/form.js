/* Hüsrev Cast Ajans taslak — kayıt soruları formu (aday kaydı + panelden ekleme/düzenleme) */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;
  var TOHUM = 'yeni', CINS = '';

  function alanHtml(f, v) {
    var id = 'f_' + f.k, req = f.zorunlu ? '<i class="req">*</i>' : '';
    var cls = 'field' + (f.yarim ? ' half' : '') + (f.ceyrek ? ' quarter' : '');
    var lab = '<label for="' + id + '">' + esc(f.ad) + req + '</label>';
    var hint = f.ipucu && f.tip !== 'textarea' && f.tip !== 'text' && f.tip !== 'tel' && f.tip !== 'url' && f.tip !== 'password' ? '<small class="hint">' + esc(f.ipucu) + '</small>' : '';
    switch (f.tip) {
      case 'text': case 'email': case 'tel': case 'url': case 'date': case 'password':
        return '<div class="' + cls + '">' + lab + '<input id="' + id + '" data-k="' + f.k + '" type="' + f.tip + '" value="' + esc(v || '') + '"' + (f.ipucu ? ' placeholder="' + esc(f.ipucu) + '"' : '') + '></div>';
      case 'number':
        return '<div class="' + cls + '">' + lab + '<div class="unit-input"><input id="' + id + '" data-k="' + f.k + '" type="number" inputmode="numeric" value="' + esc(v || '') + '"><span>' + esc(f.birim || '') + '</span></div></div>';
      case 'textarea':
        return '<div class="' + cls + ' full">' + lab + '<textarea id="' + id + '" data-k="' + f.k + '" rows="3" placeholder="' + esc(f.ipucu || '') + '">' + esc(v || '') + '</textarea></div>';
      case 'select':
        return '<div class="' + cls + '">' + lab + '<select id="' + id + '" data-k="' + f.k + '">' + C.options(f.secenek, v || '', 'Seçin') + '</select>' + hint + '</div>';
      case 'multi':
        var sel = v || [];
        return '<div class="field full"><span class="lab">' + esc(f.ad) + req + '</span><div class="chips-pick" data-k="' + f.k + '" data-tip="multi">' +
          f.secenek.map(function (o) { return '<button type="button" class="pick' + (sel.indexOf(o) >= 0 ? ' on' : '') + '" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div></div>';
      case 'tri':
        return '<div class="field full tri-row"><span class="lab">' + esc(f.ad) + req + '</span><div class="seg" data-k="' + f.k + '" data-tip="tri">' +
          f.secenek.map(function (o) { return '<button type="button" class="seg-b' + (v === o ? ' on' : '') + '" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div></div>';
      case 'bool':
        return '<div class="field full"><label class="consent' + (f.rizaMetni ? ' consent-main' : '') + '"><input type="checkbox" data-k="' + f.k + '"' + (v ? ' checked' : '') + '><span>' + esc(f.ad) + req + '</span></label>' +
          (f.rizaMetni ? '<p class="consent-note">' + icon('info', 14) + ' Taslak metindir. Nihai açık rıza ve aydınlatma metni hukuki danışmanla hazırlanacak (B-11 açık).</p>' : '') + '</div>';
      case 'photos':
        var list = v || [];
        return '<div class="field full"><span class="lab">' + esc(f.ad) + req + '</span><div class="photo-grid" data-k="' + f.k + '" data-tip="photos">' +
          list.map(function (src, i) { return '<div class="ph-item"><img src="' + (src.indexOf('ph:') === 0 ? C.portrait(TOHUM, +src.slice(3), CINS) : src) + '" alt=""><button type="button" class="ph-del" data-i="' + i + '" aria-label="Kaldır">' + icon('x', 14) + '</button></div>'; }).join('') +
          (list.length < 6 ? '<label class="ph-add">' + icon('upload', 22) + '<span>Fotoğraf ekle</span><input type="file" accept="image/*" multiple hidden></label>' : '') +
          '</div></div>';
    }
    return '';
  }

  // Görseli küçültüp dataURL'e çevirir (tarayıcı hafızası sınırlı olduğu için)
  function kucult(file) {
    return new Promise(function (res) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 720, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
          var cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = function () { res(null); };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /**
   * opts: { kok, degerler, kayitModu ('aday'|'ajans'), onKaydet(degerler), onIptal }
   */
  C.soruFormu = function (opts) {
    var vals = JSON.parse(JSON.stringify(opts.degerler || {}));
    var adim = 0, kok = opts.kok;
    TOHUM = opts.tohum || 'yeni'; CINS = vals.cinsiyet || '';
    var bolumler = opts.bolumler || C.SORULAR;

    function topla() {
      var b = bolumler[adim];
      b.alanlar.forEach(function (f) {
        if (f.tip === 'multi') vals[f.k] = [].map.call(kok.querySelectorAll('[data-k="' + f.k + '"] .pick.on'), function (x) { return x.getAttribute('data-v'); });
        else if (f.tip === 'tri') { var on = kok.querySelector('[data-k="' + f.k + '"] .seg-b.on'); vals[f.k] = on ? on.getAttribute('data-v') : ''; }
        else if (f.tip === 'bool') { var cb = kok.querySelector('[data-k="' + f.k + '"]'); vals[f.k] = !!(cb && cb.checked); }
        else if (f.tip === 'photos') { /* anlık güncelleniyor */ }
        else { var el = kok.querySelector('[data-k="' + f.k + '"]'); if (el) vals[f.k] = f.tip === 'number' ? (el.value ? +el.value : '') : el.value.trim(); }
      });
    }
    function eksikler() {
      var b = bolumler[adim], out = [];
      b.alanlar.forEach(function (f) {
        if (!f.zorunlu) return;
        var v = vals[f.k];
        if (f.tip === 'bool' ? !v : (v === undefined || v === '' || (Array.isArray(v) && !v.length))) out.push(f);
      });
      if (b.id === 'kisisel' && vals.eposta && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(vals.eposta)) out.push({ k: 'eposta', ad: 'E-posta (geçerli adres)' });
      return out;
    }

    function ciz() {
      var b = bolumler[adim], son = adim === bolumler.length - 1;
      var yas = C.age(vals.dogumTarihi);
      var cocukUyari = b.id === 'riza' && yas !== null && yas < 18
        ? '<div class="note note-amber">' + icon('info', 16) + '<span>18 yaşından küçük aday: veli / vasi onayı gerekecek. Bu adım henüz tasarlanmadı (B-12 açık).</span></div>' : '';
      kok.innerHTML =
        '<ol class="stepper">' + bolumler.map(function (x, i) {
          return '<li class="' + (i < adim ? 'done' : i === adim ? 'cur' : '') + '"><span>' + (i < adim ? icon('check', 13) : (i + 1)) + '</span><em>' + esc(x.ad) + '</em></li>';
        }).join('') + '</ol>' +
        '<div class="form-card">' +
          '<div class="form-head"><small>Adım ' + (adim + 1) + ' / ' + bolumler.length + '</small><h2>' + esc(b.ad) + '</h2><p>' + esc(b.aciklama) + '</p></div>' +
          '<div class="form-grid">' + b.alanlar.map(function (f) { return alanHtml(f, vals[f.k]); }).join('') + '</div>' + cocukUyari +
          '<div class="form-err" id="formErr" hidden></div>' +
          '<div class="form-nav">' +
            (adim > 0 ? '<button type="button" class="btn btn-ghost" id="geri">' + icon('arrowL', 16) + ' Geri</button>' : (opts.onIptal ? '<button type="button" class="btn btn-ghost" id="iptal">Vazgeç</button>' : '<span></span>')) +
            '<button type="button" class="btn btn-primary" id="ileri">' + (son ? (opts.sonButon || (opts.kayitModu === 'aday' ? 'Başvurumu gönder' : 'Kaydet')) + ' ' + icon('check', 16) : 'Devam ' + icon('arrowR', 16)) + '</button>' +
          '</div>' +
        '</div>';
      bagla();
    }

    function bagla() {
      kok.querySelectorAll('.chips-pick .pick').forEach(function (p) { p.onclick = function () { p.classList.toggle('on'); }; });
      kok.querySelectorAll('.seg').forEach(function (s) {
        s.querySelectorAll('.seg-b').forEach(function (b) { b.onclick = function () { s.querySelectorAll('.seg-b').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); }; });
      });
      var pg = kok.querySelector('.photo-grid');
      if (pg) {
        var inp = pg.querySelector('input[type=file]');
        if (inp) inp.onchange = function () {
          topla();
          var files = [].slice.call(inp.files, 0, 6 - (vals.fotograflar || []).length);
          Promise.all(files.map(kucult)).then(function (list) {
            vals.fotograflar = (vals.fotograflar || []).concat(list.filter(Boolean));
            ciz();
          });
        };
        pg.querySelectorAll('.ph-del').forEach(function (b) { b.onclick = function () { topla(); vals.fotograflar.splice(+b.getAttribute('data-i'), 1); ciz(); }; });
      }
      var g = kok.querySelector('#geri'); if (g) g.onclick = function () { topla(); adim--; ciz(); if (opts.onAdim) opts.onAdim(adim); kok.scrollIntoView({ behavior: 'smooth' }); };
      var ip = kok.querySelector('#iptal'); if (ip) ip.onclick = opts.onIptal;
      kok.querySelector('#ileri').onclick = function () {
        topla();
        var e = eksikler(), box = kok.querySelector('#formErr');
        kok.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); });
        if (e.length) {
          box.hidden = false;
          box.innerHTML = icon('info', 16) + '<span>Lütfen doldurun: ' + e.map(function (f) { return esc(f.ad.length > 40 ? 'Açık rıza onayı' : f.ad); }).join(', ') + '</span>';
          e.forEach(function (f) { var el = kok.querySelector('[data-k="' + f.k + '"]'); if (el) (el.closest('.field') || el).classList.add('bad'); });
          return;
        }
        var ozel = opts.dogrula ? opts.dogrula(bolumler[adim].id, vals) : '';
        if (ozel) { box.hidden = false; box.innerHTML = icon('info', 16) + '<span>' + esc(ozel) + '</span>'; return; }
        if (adim < bolumler.length - 1) { adim++; ciz(); if (opts.onAdim) opts.onAdim(adim); kok.scrollIntoView({ behavior: 'smooth' }); }
        else opts.onKaydet(vals);
      };
    }
    ciz();
  };
})(window.C);
