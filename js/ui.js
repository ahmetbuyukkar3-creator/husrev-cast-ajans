/* Ortak arayüz yardımcıları */
(function () {
  const U = {};

  U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  U.logo = (boyut) => `
    <svg class="logo-isaret" width="${boyut || 34}" height="${boyut || 34}" viewBox="0 0 40 40" aria-hidden="true">
      <defs><linearGradient id="lg-h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3CF7A"/><stop offset="1" stop-color="#C98A2B"/></linearGradient></defs>
      <path d="M20 2 L37 11 V29 L20 38 L3 29 V11 Z" fill="none" stroke="url(#lg-h)" stroke-width="2"/>
      <path d="M13 12 V28 M27 12 V28 M13 20 H27" stroke="url(#lg-h)" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="20" cy="9" r="1.8" fill="#F3CF7A"/>
    </svg>`;

  U.marka = () => `<span class="marka">${U.logo()}<span class="marka-yazi"><b>Hüsrev</b> Cast Ajans</span></span>`;

  U.basHarf = y => (y.ad[0] + y.soyad[0]).toLocaleUpperCase('tr');

  U.avatar = (y, cls) => `<span class="avatar ${cls || ''}" style="--a:${y.renk[0]};--b:${y.renk[1]}">${U.basHarf(y)}</span>`;

  // Fotoğraf yerine: renkli arka plan + siluet + baş harfler
  U.foto = (y) => `
    <div class="foto" style="--a:${y.renk[0]};--b:${y.renk[1]}">
      <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <circle cx="50" cy="44" r="20" fill="rgba(0,0,0,.28)"/>
        <path d="M12 120 C14 88 30 72 50 72 C70 72 86 88 88 120 Z" fill="rgba(0,0,0,.28)"/>
      </svg>
      <span class="foto-harf">${U.basHarf(y)}</span>
    </div>`;

  U.once = t => {
    const d = Math.round((Date.now() - t) / 60000);
    if (d < 1) return 'az önce';
    if (d < 60) return d + ' dk önce';
    if (d < 1440) return Math.round(d / 60) + ' saat önce';
    const g = Math.round(d / 1440);
    return g === 1 ? 'dün' : g + ' gün önce';
  };

  U.tarih = s => new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  U.toast = (mesaj) => {
    let k = document.getElementById('toast');
    if (!k) { k = document.createElement('div'); k.id = 'toast'; document.body.appendChild(k); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = mesaj;
    k.appendChild(t);
    setTimeout(() => t.classList.add('git'), 2600);
    setTimeout(() => t.remove(), 3000);
  };

  U.modal = (baslik, govde, butonlar) => {
    U.modalKapat();
    const m = document.createElement('div');
    m.className = 'modal-arka';
    m.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <div class="modal-bas"><h3>${baslik}</h3><button class="ikon-btn" data-kapat aria-label="Kapat">✕</button></div>
      <div class="modal-govde">${govde}</div>
      ${butonlar ? `<div class="modal-alt">${butonlar}</div>` : ''}
    </div>`;
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-kapat]')) U.modalKapat(); });
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('acik'));
    return m;
  };
  U.modalKapat = () => document.querySelectorAll('.modal-arka').forEach(m => m.remove());

  U.durumEtiket = {
    aday: ['Değerlendiriliyor', 'et-gri'],
    begenildi: ['Beğenildi', 'et-sari'],
    secildi: ['Seçildi', 'et-yesil'],
    elendi: ['Elendi', 'et-kirmizi']
  };
  U.etiket = d => { const [y, c] = U.durumEtiket[d] || [d, 'et-gri']; return `<span class="etiket ${c}">${y}</span>`; };

  window.U = U;
})();
