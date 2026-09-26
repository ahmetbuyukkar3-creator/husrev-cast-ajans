/* Hüsrev Cast Ajans taslak — kabuk, yönlendirme, modal, bildirim */
(function (C) {
  'use strict';
  var esc = C.esc, icon = C.icon;
  C.state = { secili: [], hedefProje: null, filtre: null, takvimAy: null };

  // ---------- bildirim ----------
  C.toast = function (msg, tip) {
    var host = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (tip === 'err' ? ' toast-err' : '');
    el.innerHTML = icon(tip === 'err' ? 'info' : 'check', 16) + '<span>' + esc(msg) + '</span>';
    host.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  };

  // ---------- modal ----------
  C.modal = function (opts) {
    var wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal' + (opts.genis ? ' modal-wide' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(opts.baslik) + '</h3><button class="icon-btn" data-close aria-label="Kapat">' + icon('x') + '</button></div>' +
      '<div class="modal-body">' + opts.govde + '</div>' +
      (opts.alt === false ? '' : '<div class="modal-foot"><button class="btn btn-ghost" data-close>Vazgeç</button><button class="btn btn-primary" data-ok>' + esc(opts.tamam || 'Kaydet') + '</button></div>') +
      '</div>';
    document.body.appendChild(wrap);
    var close = function () { wrap.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) close(); });
    wrap.querySelectorAll('[data-close]').forEach(function (b) { b.onclick = close; });
    var ok = wrap.querySelector('[data-ok]');
    if (ok) ok.onclick = function () { if (opts.onOk && opts.onOk(wrap.querySelector('.modal-body')) === false) return; close(); };
    if (opts.onMount) opts.onMount(wrap.querySelector('.modal-body'), close);
    var first = wrap.querySelector('input,select,textarea'); if (first) first.focus();
    return close;
  };

  // ---------- menü ----------
  var MENU = [
    { h: '#/panel', ad: 'Genel Bakış', ic: 'panel' },
    { h: '#/havuz', ad: 'Yetenek Havuzu', ic: 'users' },
    { h: '#/basvurular', ad: 'Başvurular', ic: 'inbox', sayac: function () { return C.db.talents.filter(function (t) { return t.durum === 'basvuru'; }).length; } },
    { h: '#/projeler', ad: 'Projeler', ic: 'folder' },
    { h: '#/paketler', ad: 'Aday Paketleri', ic: 'box' },
    { h: '#/takvim', ad: 'Takvim', ic: 'cal' },
    { h: '#/musteriler', ad: 'Müşteriler', ic: 'building' },
    { ayrac: 'Ayarlar' },
    { h: '#/kullanicilar', ad: 'Kullanıcılar', ic: 'shield' },
    { h: '#/kayit-sorulari', ad: 'Kayıt Soruları', ic: 'list' },
    { h: '#/taslak-notlari', ad: 'Taslak Notları', ic: 'note' }
  ];

  C.shell = function (aktif, baslik, govde, sag) {
    var u = C.me(), rol = C.ROLES[u.rol];
    var nav = MENU.map(function (m) {
      if (m.ayrac) return '<div class="nav-sep">' + esc(m.ayrac) + '</div>';
      var n = m.sayac ? m.sayac() : 0;
      var on = aktif.indexOf(m.h) === 0 ? ' on' : '';
      return '<a class="nav-item' + on + '" href="' + m.h + '">' + icon(m.ic, 19) + '<span>' + esc(m.ad) + '</span>' + (n ? '<em class="nav-count">' + n + '</em>' : '') + '</a>';
    }).join('');
    var initials = u.ad.split(' ').map(function (s) { return s[0]; }).join('').slice(0, 2);
    return '<div class="app">' +
      '<aside class="side" id="side">' +
        '<a class="brand brand-gorsel" href="#/panel" aria-label="Genel bakış"><canvas id="brandCanvas" aria-hidden="true"></canvas></a>' +
        '<nav class="nav">' + nav + '</nav>' +
        '<div class="side-foot">' +
          '<button class="tema-btn" id="temaBtn" type="button">' + icon('spark', 15) + '<span>Koyu tema</span><i class="tb-sw"></i></button>' +
          '<a class="kayit-link" href="aday/" target="_blank" rel="noopener">' + icon('link', 16) + '<span>Manken aday sitesi</span>' + icon('arrowR', 14) + '</a>' +
          '<div class="me"><span class="avatar-s">' + esc(initials) + '</span><div><b>' + esc(u.ad) + '</b><small>' + esc(rol.ad) + '</small></div>' +
          '<button class="icon-btn" id="cikis" title="Çıkış / rol değiştir">' + icon('logout', 17) + '</button></div>' +
        '</div>' +
      '</aside>' +
      '<div class="main">' +
        '<header class="top"><button class="icon-btn only-m" id="menuBtn" aria-label="Menü">' + icon('menu') + '</button>' +
          '<h1>' + baslik + '</h1><div class="top-right">' + (sag || '') +
          (!rol.edit ? '<span class="ro-pill">' + icon('eye', 14) + ' Salt okunur</span>' : '') + '</div></header>' +
        '<main class="content">' + govde + '</main>' +
      '</div></div>';
  };
  C.bindShell = function () {
    var c = document.getElementById('cikis');
    if (c) c.onclick = function () { C.logout(); location.hash = '#/giris'; };
    var tb = document.getElementById('temaBtn');
    if (tb) tb.onclick = function () { C.temaDegistir(); };
    var m = document.getElementById('menuBtn');
    if (m) m.onclick = function () { document.getElementById('side').classList.toggle('open'); };
  };

  // ---------- tema (K-013) ----------
  C.tema = function () { return document.documentElement.getAttribute('data-tema') || 'koyu'; };
  C.temaDegistir = function () {
    var yeni = C.tema() === 'koyu' ? 'acik' : 'koyu';
    document.documentElement.setAttribute('data-tema', yeni);
    try { localStorage.setItem('husrev.tema', yeni); } catch (e) { }
  };

  // sayıları sıfırdan yukarı saydırır
  C.saydir = function (kok) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    (kok || document).querySelectorAll('[data-say]').forEach(function (el) {
      var hedef = +el.getAttribute('data-say'), t0 = performance.now();
      (function f(t) { var p = Math.max(0, Math.min(1, (t - t0) / 900)); el.textContent = Math.round(hedef * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    });
  };

  // ---------- yönlendirme ----------
  C.routes = [];
  C.route = function (pattern, fn, opts) { C.routes.push({ re: pattern, fn: fn, pub: opts && opts.pub }); };
  C.go = function (h) { if (location.hash === h) C.render(); else location.hash = h; };
  C.render = function () {
    var h = location.hash || '#/panel';
    var root = document.getElementById('app');
    for (var i = 0; i < C.routes.length; i++) {
      var r = C.routes[i], m = h.match(r.re);
      if (!m) continue;
      if (!r.pub && !C.me()) { location.hash = '#/giris'; return; }
      document.body.className = r.pub ? 'pub' : 'in';
      window.scrollTo(0, 0);
      r.fn.apply(null, [root].concat(m.slice(1)));
      return;
    }
    location.hash = C.me() ? '#/panel' : '#/giris';
  };

  // ---------- küçük parçalar ----------
  C.avatar = function (t, size) {
    var dot = t.durum === 'aktif' ? '<i class="dot d-' + C.find(C.UYGUNLUK, t.uygunluk).renk + '" title="' + esc(C.find(C.UYGUNLUK, t.uygunluk).ad) + '"></i>' : '';
    return '<span class="avatar" style="--s:' + (size || 64) + 'px"><img src="' + C.photo(t, 0) + '" alt="">' + dot + '</span>';
  };
  C.iletisim = function (t) {
    if (!C.can('contact')) return '<span class="masked">' + icon('lock', 13) + ' Gizli</span>';
    return esc(t.c.telefon);
  };
  C.bos = function (ic, baslik, alt, aksiyon) {
    return '<div class="empty">' + icon(ic, 28) + '<b>' + esc(baslik) + '</b>' + (alt ? '<p>' + esc(alt) + '</p>' : '') + (aksiyon || '') + '</div>';
  };
  C.editBtn = function (html) { return C.can('edit') ? html : ''; };
  C.options = function (list, sel, bosEtiket) {
    return (bosEtiket !== undefined ? '<option value="">' + esc(bosEtiket) + '</option>' : '') + list.map(function (o) {
      var v = typeof o === 'object' ? o.k : o, a = typeof o === 'object' ? o.ad : o;
      return '<option value="' + esc(v) + '"' + (String(sel) === String(v) ? ' selected' : '') + '>' + esc(a) + '</option>';
    }).join('');
  };
  C.val = function (root, sel) { var el = root.querySelector(sel); return el ? el.value.trim() : ''; };

  // ---------- panoya kopyala ----------
  C.copy = function (text) {
    var done = function () { C.toast('Link kopyalandı'); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, function () { fallback(); }); } else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { } ta.remove(); }
  };
  C.paketUrl = function (k) { return location.href.split('#')[0] + '#/p/' + k.token; };
})(window.C);
