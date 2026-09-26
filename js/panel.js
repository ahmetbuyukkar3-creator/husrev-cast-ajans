/* Ajans paneli — hash tabanlı tek sayfa */
(function () {
  const $ = s => document.querySelector(s);
  const e = U.esc;
  const db = () => H.db;
  const aj = () => H.ajans();
  const benim = () => db().yetenekler.filter(y => y.ajans === aj().id);
  const onayli = () => benim().filter(y => y.durum === 'onayli');
  const bekleyen = () => benim().filter(y => y.durum === 'bekliyor');
  const projelerim = () => db().projeler.filter(p => p.ajans === aj().id).sort((a, b) => b.olusturma - a.olusturma);
  const kaydet = () => { H.kaydet(); ciz(); };

  const RENKLER = ['#D9A441', '#E2557B', '#4F8CFF', '#3DDC97', '#9B5CF6', '#FF8C61', '#2EC4B6', '#F3F0E8'];
  const TURLER = ['Manken', 'Oyuncu', 'Figüran', 'Çocuk'];

  function projeDurum(p) {
    if (p.durum === 'Tamamlandı') return ['Tamamlandı', 'et-gri'];
    const secildi = p.roller.some(r => (r.adaylar || []).some(a => a.durum === 'secildi'));
    if (secildi) return ['Seçim yapıldı', 'et-yesil'];
    if (p.paket) return ['Müşteride', 'et-sari'];
    return ['Aday topluyor', 'et-mavi'];
  }
  const paketLink = p => location.origin + location.pathname.replace(/panel\.html$/, '') + 'paket.html#' + p.id;
  const basvuruLink = () => location.origin + location.pathname.replace(/panel\.html$/, '') + 'basvuru.html?ajans=' + aj().slug;

  /* ---------- İskelet ---------- */
  function yanCiz() {
    const r = location.hash || '#/';
    const akt = (h) => (h === '#/' ? r === '#/' : r.startsWith(h)) ? 'aktif' : '';
    const b = bekleyen().length;
    $('#yan').innerHTML = `
      <a href="index.html" class="marka">${U.logo(30)}<span class="marka-yazi"><b>Hüsrev</b> Cast</span></a>
      <button class="ajans-sec" id="ajansSec">
        <span class="ajans-logo">${e(aj().kisa)}</span>
        <div><b>${e(aj().ad)}</b><small>${e(aj().plan)} paket · ${e(aj().sehir)}</small></div>
        <span style="color:var(--soluk)">⇅</span>
      </button>
      <nav class="menu">
        <a href="#/" class="${akt('#/')}"><span class="ik">◎</span>Özet</a>
        <a href="#/yetenekler" class="${akt('#/yetenek')}"><span class="ik">✦</span>Yetenek havuzu</a>
        <a href="#/projeler" class="${akt('#/proje')}"><span class="ik">▣</span>Projeler</a>
        <a href="#/basvurular" class="${akt('#/basvuru')}"><span class="ik">✉</span>Başvurular${b ? `<span class="sayi">${b}</span>` : ''}</a>
        <a href="#/ayarlar" class="${akt('#/ayarlar')}"><span class="ik">⚙</span>Marka ve ayarlar</a>
      </nav>
      <div class="yan-alt">
        <div class="demo-not">Bu bir satış demosudur; veriler bu tarayıcıda tutulur.<br><a id="sifirla">Demoyu baştan başlat</a></div>
      </div>`;
    $('#ajansSec').onclick = ajansDegistir;
    $('#sifirla').onclick = () => confirmModal('Demo verisi ilk hâline dönsün mü?', () => { H.sifirla(); location.hash = '#/'; ciz(); U.toast('Demo sıfırlandı'); });
    $('#kullanici').innerHTML = `<span>${e(aj().yetkili)}</span><span class="avatar" style="--a:${aj().renk};--b:#2a2535">${e(aj().yetkili.split(' ').map(s => s[0]).join(''))}</span>`;
  }

  function confirmModal(soru, evet) {
    const m = U.modal('Emin misiniz?', `<p style="margin:0;color:var(--soluk)">${soru}</p>`, `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="evet">Evet</button>`);
    m.querySelector('#evet').onclick = () => { U.modalKapat(); evet(); };
  }

  function ajansDegistir() {
    const m = U.modal('Ajans değiştir', `
      <p style="margin:0;color:var(--soluk);font-size:14px">Platformda her ajansın kendi alanı var; birbirlerinin verisini görmezler. Demo için ajanslar arasında geçiş yapabilirsiniz.</p>
      <div class="oneri-liste">${db().ajanslar.map(a => `
        <div class="oneri" data-id="${a.id}">
          <span class="ajans-logo" style="background:${a.renk}">${e(a.kisa)}</span>
          <div class="orta"><b>${e(a.ad)}</b><br><small>${e(a.sehir)} · ${db().yetenekler.filter(y => y.ajans === a.id && y.durum === 'onayli').length} yetenek · ${e(a.plan)}</small></div>
          ${a.id === aj().id ? '<span class="etiket et-yesil">Açık</span>' : ''}
        </div>`).join('')}</div>`,
      `<button class="btn" id="yeniAjans">+ Yeni ajans kaydı</button>`);
    m.querySelectorAll('[data-id]').forEach(el => el.onclick = () => {
      db().aktifAjans = el.dataset.id; U.modalKapat(); location.hash = '#/'; kaydet(); U.toast(aj().ad + ' paneline geçildi');
    });
    m.querySelector('#yeniAjans').onclick = yeniAjans;
  }

  function yeniAjans() {
    const m = U.modal('Ajansınızı kaydedin', `
      <p style="margin:0;color:var(--soluk);font-size:14px">Yeni bir ajans platforma dakikalar içinde katılır.</p>
      <div class="alan"><label>Ajans adı</label><input class="girdi" id="ya-ad" placeholder="Örn. Kristal Casting"></div>
      <div class="izgara2">
        <div class="alan"><label>Şehir</label><input class="girdi" id="ya-sehir" value="İstanbul"></div>
        <div class="alan"><label>Yetkili adı</label><input class="girdi" id="ya-yetkili" placeholder="Ad Soyad"></div>
      </div>
      <div class="alan"><label>Marka rengi</label><div class="renkler">${RENKLER.map((r, i) => `<span class="renk ${i === 1 ? 'sec' : ''}" data-r="${r}" style="background:${r}"></span>`).join('')}</div></div>`,
      `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="ya-kaydet">Ajansı oluştur</button>`);
    let renk = RENKLER[1];
    m.querySelectorAll('.renk').forEach(el => el.onclick = () => { m.querySelectorAll('.renk').forEach(x => x.classList.remove('sec')); el.classList.add('sec'); renk = el.dataset.r; });
    m.querySelector('#ya-kaydet').onclick = () => {
      const ad = m.querySelector('#ya-ad').value.trim();
      if (!ad) return U.toast('Ajans adını yazın');
      const slug = ad.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '') || 'ajans';
      const a = {
        id: H.yeniId('a'), ad, slug: slug + (H.ajansSlug(slug) ? db().sayac : ''),
        kisa: ad.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toLocaleUpperCase('tr'),
        renk, sehir: m.querySelector('#ya-sehir').value.trim() || 'İstanbul', plan: 'Deneme', yetkili: m.querySelector('#ya-yetkili').value.trim() || 'Ajans Yöneticisi'
      };
      db().ajanslar.push(a); db().aktifAjans = a.id; U.modalKapat(); location.hash = '#/'; kaydet(); U.toast(ad + ' hazır! 🎉');
    };
  }

  /* ---------- Özet ---------- */
  function ozet() {
    const ps = projelerim();
    const aktif = ps.filter(p => p.durum !== 'Tamamlandı');
    const paketler = ps.filter(p => p.paket).length;
    const secim = ps.reduce((t, p) => t + p.roller.reduce((u, r) => u + (r.adaylar || []).filter(a => a.durum === 'begenildi' || a.durum === 'secildi').length, 0), 0);
    const hareketler = db().hareketler.filter(h => !h.proje || H.proje(h.proje)?.ajans === aj().id).slice(0, 7);
    return `
      <div class="kart hosgeldin">
        <div><h2>Hoş geldiniz, ${e(aj().yetkili.split(' ')[0])} 👋</h2><p>${bekleyen().length ? `${bekleyen().length} yeni başvuru onayınızı bekliyor.` : 'Bugün her şey yolunda.'}</p></div>
        <a class="btn btn-ana" href="#/projeler/yeni">+ Yeni proje</a>
      </div>
      <div class="istatistik">
        <div class="kart ist"><small>Yetenek havuzu</small><b>${onayli().length}</b><span>${bekleyen().length ? '+' + bekleyen().length + ' başvuru bekliyor' : '&nbsp;'}</span></div>
        <div class="kart ist"><small>Aktif proje</small><b>${aktif.length}</b><span>&nbsp;</span></div>
        <div class="kart ist"><small>Gönderilen paket</small><b>${paketler}</b><span>${ps.filter(p => p.paket && p.paket.goruldu).length} tanesi açıldı</span></div>
        <div class="kart ist"><small>Müşteri beğenisi</small><b>${secim}</b><span>beğenilen + seçilen aday</span></div>
      </div>
      <div class="iki-kolon">
        <div class="kart">
          <div class="kart-bas"><h2>Projeler</h2><a class="btn btn-kucuk" href="#/projeler">Tümü</a></div>
          ${ps.length ? ps.slice(0, 5).map(p => { const [d, c] = projeDurum(p); const n = p.roller.reduce((t, r) => t + (r.adaylar || []).length, 0);
            return `<div class="liste-satir" data-git="#/proje/${p.id}"><span class="ajans-logo" style="background:var(--kart2);color:var(--yazi)">${p.tur[0]}</span><div class="orta"><b>${e(p.ad)}</b><small>${e(p.musteri)} · ${n} aday · çekim ${U.tarih(p.cekim)}</small></div><span class="etiket ${c}">${d}</span></div>`; }).join('')
            : `<div class="bos">Henüz proje yok. <a href="#/projeler/yeni">İlk projeyi oluşturun</a></div>`}
        </div>
        <div class="kart">
          <div class="kart-bas"><h2>Son hareketler</h2></div>
          <div style="padding:8px 0">${hareketler.length ? hareketler.map(h => `<div class="hareket"><i></i><div>${e(h.ne)}<small>${U.once(h.zaman)}</small></div></div>`).join('') : '<div class="bos">Henüz hareket yok.</div>'}</div>
        </div>
      </div>`;
  }

  /* ---------- Yetenek havuzu ---------- */
  const filtre = { ara: '', tur: '', cinsiyet: '', sehir: '', yas: '' };
  function yetenekler() {
    const liste = onayli();
    const sehirler = [...new Set(liste.map(y => y.sehir))].sort();
    return `
      <div class="filtre">
        <input class="girdi ara" id="f-ara" placeholder="İsim, beceri, dil ara…" value="${e(filtre.ara)}">
        <select class="girdi" id="f-tur"><option value="">Tüm türler</option>${TURLER.map(t => `<option ${filtre.tur === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select class="girdi" id="f-cinsiyet"><option value="">Cinsiyet</option><option ${filtre.cinsiyet === 'Kadın' ? 'selected' : ''}>Kadın</option><option ${filtre.cinsiyet === 'Erkek' ? 'selected' : ''}>Erkek</option></select>
        <select class="girdi" id="f-yas"><option value="">Yaş</option>${[['0-17', 'Çocuk (0–17)'], ['18-25', '18–25'], ['26-35', '26–35'], ['36-60', '36+']].map(([v, t]) => `<option value="${v}" ${filtre.yas === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select class="girdi" id="f-sehir"><option value="">Şehir</option>${sehirler.map(s => `<option ${filtre.sehir === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <button class="btn" id="yeniYetenek">+ Yetenek ekle</button>
      </div>
      <div class="sonuc-sayi" id="sonucSayi"></div>
      <div class="yetenek-izgara" id="izgara"></div>`;
  }
  function izgaraCiz() {
    const q = filtre.ara.toLocaleLowerCase('tr');
    const [ymin, ymax] = filtre.yas ? filtre.yas.split('-').map(Number) : [0, 200];
    const l = onayli().filter(y =>
      (!filtre.tur || y.tur === filtre.tur) && (!filtre.cinsiyet || y.cinsiyet === filtre.cinsiyet) &&
      (!filtre.sehir || y.sehir === filtre.sehir) && y.yas >= ymin && y.yas <= ymax &&
      (!q || [y.ad, y.soyad, y.tur, y.sehir, ...y.diller, ...y.beceriler].join(' ').toLocaleLowerCase('tr').includes(q)));
    $('#sonucSayi').textContent = `${l.length} yetenek`;
    $('#izgara').innerHTML = l.length ? l.map(y => `
      <div class="ykart" data-y="${y.id}"><div style="position:relative">${U.foto(y)}<span class="etiket et-gri tur" style="background:rgba(0,0,0,.45);color:#fff">${y.tur}</span></div>
      <div class="bilgi"><b>${e(y.ad)} ${e(y.soyad)}</b><small>${y.yas} yaş · ${y.boy} cm · ${e(y.sehir)}</small></div></div>`).join('')
      : `<div class="bos" style="grid-column:1/-1">Bu filtreye uyan yetenek yok.</div>`;
    $('#izgara').querySelectorAll('[data-y]').forEach(el => el.onclick = () => yetenekDetay(el.dataset.y));
  }
  function yetenekBagla() {
    ['ara', 'tur', 'cinsiyet', 'sehir', 'yas'].forEach(k => {
      const el = $('#f-' + k);
      el.oninput = el.onchange = () => { filtre[k] = el.value; izgaraCiz(); };
    });
    $('#yeniYetenek').onclick = () => U.modal('Yetenek ekle', `
      <p style="margin:0;color:var(--soluk);font-size:14px">En kolayı: başvuru linkinizi paylaşın, yetenekler bilgilerini kendileri doldursun.</p>
      <div class="link-kutu"><code>${e(basvuruLink())}</code><button class="btn btn-kucuk" id="kopyala">Kopyala</button></div>`,
      `<a class="btn btn-ana" href="${e(basvuruLink())}" target="_blank">Başvuru sayfasını aç</a>`)
      .querySelector('#kopyala').onclick = () => kopyala(basvuruLink());
    izgaraCiz();
  }

  function yetenekDetay(id) {
    const y = H.yetenek(id);
    const ps = projelerim().filter(p => p.durum !== 'Tamamlandı');
    const gecmis = projelerim().flatMap(p => p.roller.flatMap(r => (r.adaylar || []).filter(a => a.yetenek === id).map(a => ({ p, r, a }))));
    const arka = document.createElement('div'); arka.className = 'cekmece-arka';
    const c = document.createElement('div'); c.className = 'cekmece';
    c.innerHTML = `
      <div style="position:relative">${U.foto(y)}<button class="ikon-btn cek-kapat">✕</button></div>
      <div class="cek-ic">
        <div><span class="etiket et-sari">${y.tur}</span><h2 style="margin-top:8px">${e(y.ad)} ${e(y.soyad)}</h2><div style="color:var(--soluk)">${y.cinsiyet} · ${y.yas} yaş · ${e(y.sehir)}</div></div>
        <div class="olcu">
          <div><small>Boy</small><b>${y.boy} cm</b></div><div><small>Kilo</small><b>${y.kilo} kg</b></div><div><small>Deneyim</small><b>${y.deneyim}</b></div>
          <div><small>Saç</small><b>${y.sac}</b></div><div><small>Göz</small><b>${y.goz}</b></div><div><small>Kayıt</small><b>${U.once(y.eklenme)}</b></div>
        </div>
        <div><div style="color:var(--soluk);font-size:13px;margin-bottom:6px">Diller ve beceriler</div>${[...y.diller, ...y.beceriler].map(s => `<span class="cip">${e(s)}</span>`).join('') || '<span class="cip">Belirtilmemiş</span>'}</div>
        <div class="olcu" style="grid-template-columns:1fr 1fr"><div><small>Telefon</small><b>${e(y.telefon)}</b></div><div><small>E-posta</small><b style="font-size:13px">${e(y.eposta)}</b></div></div>
        ${ps.length ? `<div class="kart" style="padding:14px;display:flex;flex-direction:column;gap:10px">
          <b style="font-size:14px">Projeye aday olarak ekle</b>
          <select class="girdi" id="rolSec">${(() => { const ilk = ps.flatMap(p => p.roller.map(r => p.id + '|' + r.id)).find(v => { const [pi, ri] = v.split('|'); return H.uyarMi(y, H.proje(pi).roller.find(r => r.id === ri).kriter); }); return ps.map(p => `<optgroup label="${e(p.ad)}">${p.roller.map(r => `<option value="${p.id}|${r.id}" ${ilk === p.id + '|' + r.id ? 'selected' : ''}>${e(r.ad)}${H.uyarMi(y, r.kriter) ? ' ✓ uygun' : ''}</option>`).join('')}</optgroup>`).join(''); })()}</select>
          <button class="btn btn-ana" id="ekle">Ekle</button></div>` : ''}
        ${gecmis.length ? `<div><div style="color:var(--soluk);font-size:13px;margin-bottom:8px">Gönderildiği projeler</div>${gecmis.map(g => `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--cizgi);font-size:14px"><span>${e(g.p.ad)} <small style="color:var(--soluk)">· ${e(g.r.ad)}</small></span>${U.etiket(g.a.durum)}</div>`).join('')}</div>` : ''}
      </div>`;
    const kapat = () => { arka.remove(); c.remove(); };
    arka.onclick = kapat; c.querySelector('.cek-kapat').onclick = kapat;
    document.body.append(arka, c);
    const ekle = c.querySelector('#ekle');
    if (ekle) ekle.onclick = () => {
      const [pid, rid] = c.querySelector('#rolSec').value.split('|');
      const r = H.proje(pid).roller.find(x => x.id === rid);
      r.adaylar = r.adaylar || [];
      if (r.adaylar.some(a => a.yetenek === id)) return U.toast('Bu aday zaten bu rolde');
      r.adaylar.push({ yetenek: id, durum: 'aday', not: '' });
      kaydet(); kapat(); U.toast(`${y.ad} “${r.ad}” rolüne eklendi`);
    };
  }

  /* ---------- Projeler ---------- */
  function projeler() {
    const ps = projelerim();
    return `
      <div class="filtre"><div style="flex:1;color:var(--soluk)">${ps.length} proje</div><a class="btn btn-ana" href="#/projeler/yeni">+ Yeni proje</a></div>
      <div class="proje-izgara">${ps.map(p => {
        const [d, c] = projeDurum(p);
        const adaylar = p.roller.flatMap(r => r.adaylar || []);
        const ileri = p.durum === 'Tamamlandı' ? 100 : adaylar.some(a => a.durum === 'secildi') ? 85 : p.paket ? 60 : adaylar.length ? 30 : 8;
        return `<div class="kart pkart" data-git="#/proje/${p.id}">
          <div style="display:flex;justify-content:space-between;gap:10px"><span class="cip" style="margin:0">${e(p.tur)}</span><span class="etiket ${c}">${d}</span></div>
          <h3>${e(p.ad)}</h3>
          <div class="meta"><span>🎬 ${e(p.musteri)}</span><span>📅 ${U.tarih(p.cekim)}</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="yigin">${adaylar.slice(0, 6).map(a => U.avatar(H.yetenek(a.yetenek))).join('')}</div>
            <small style="color:var(--soluk)">${p.roller.length} rol · ${adaylar.length} aday</small>
          </div>
          <div class="ilerleme"><i style="width:${ileri}%"></i></div>
        </div>`; }).join('') || '<div class="bos">Henüz proje yok.</div>'}</div>`;
  }

  function yeniProje() {
    const m = U.modal('Yeni proje', `
      <div class="alan"><label>Proje adı</label><input class="girdi" id="np-ad" placeholder="Örn. Banka reklamı — Kış kampanyası"></div>
      <div class="izgara2">
        <div class="alan"><label>Müşteri (yapım şirketi)</label><input class="girdi" id="np-musteri" placeholder="Örn. Lumen Yapım"></div>
        <div class="alan"><label>Tür</label><select class="girdi" id="np-tur">${['Reklam', 'Dizi', 'Film', 'Klip', 'Katalog'].map(t => `<option>${t}</option>`).join('')}</select></div>
      </div>
      <div class="alan"><label>Çekim tarihi</label><input class="girdi" type="date" id="np-cekim" value="${new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)}"></div>
      <div style="border-top:1px solid var(--cizgi);padding-top:14px;font-weight:600">İlk rol</div>
      ${rolAlanlari()}`,
      `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="np-kaydet">Projeyi oluştur</button>`);
    m.querySelector('#np-kaydet').onclick = () => {
      const ad = m.querySelector('#np-ad').value.trim();
      if (!ad) return U.toast('Proje adını yazın');
      const p = {
        id: H.yeniId('p'), ajans: aj().id, ad, musteri: m.querySelector('#np-musteri').value.trim() || 'Müşteri',
        tur: m.querySelector('#np-tur').value, cekim: m.querySelector('#np-cekim').value, durum: 'Aday topluyor',
        olusturma: Date.now(), roller: [rolOku(m)], paket: null
      };
      db().projeler.push(p); H.hareket(`“${ad}” projesi oluşturuldu`, p.id);
      U.modalKapat(); location.hash = '#/proje/' + p.id; H.kaydet(); U.toast('Proje oluşturuldu');
    };
  }
  function rolAlanlari() {
    return `<div class="izgara2">
        <div class="alan"><label>Rol adı</label><input class="girdi" id="rl-ad" placeholder="Örn. Genç anne"></div>
        <div class="alan"><label>Cinsiyet</label><select class="girdi" id="rl-cins"><option>Kadın</option><option>Erkek</option></select></div>
      </div>
      <div class="izgara2">
        <div class="alan"><label>En küçük yaş</label><input class="girdi" type="number" id="rl-min" value="20"></div>
        <div class="alan"><label>En büyük yaş</label><input class="girdi" type="number" id="rl-max" value="35"></div>
      </div>
      <div class="alan"><label>Açıklama (müşteri görür)</label><input class="girdi" id="rl-acik" placeholder="Örn. Doğal gülüşlü, mutfak sahnesi"></div>`;
  }
  function rolOku(m) {
    return {
      id: H.yeniId('r'), ad: m.querySelector('#rl-ad').value.trim() || 'Rol',
      aciklama: m.querySelector('#rl-acik').value.trim(),
      kriter: { cinsiyet: m.querySelector('#rl-cins').value, yasMin: +m.querySelector('#rl-min').value || 0, yasMax: +m.querySelector('#rl-max').value || 99 },
      adaylar: []
    };
  }

  function projeDetay(id) {
    const p = H.proje(id);
    if (!p || p.ajans !== aj().id) return `<div class="bos">Proje bulunamadı. <a href="#/projeler">Projelere dön</a></div>`;
    const [d, c] = projeDurum(p);
    const tum = p.roller.flatMap(r => r.adaylar || []);
    const say = k => tum.filter(a => a.durum === k).length;
    return `
      <a class="geri" href="#/projeler">← Projeler</a>
      <div class="proje-bas">
        <div><h2>${e(p.ad)}</h2><div class="meta"><span>🎬 ${e(p.musteri)}</span><span>🏷 ${e(p.tur)}</span><span>📅 Çekim ${U.tarih(p.cekim)}</span><span class="etiket ${c}">${d}</span></div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="rolEkle">+ Rol ekle</button>${p.durum !== 'Tamamlandı' ? `<button class="btn" id="tamamla">Projeyi kapat</button>` : ''}</div>
      </div>
      ${p.paket ? `
        <div class="kart paket-seridi">
          <span style="font-size:26px">📨</span>
          <div class="orta"><b>Aday paketi ${e(p.musteri)} ile paylaşıldı</b><br><small>Gönderildi ${U.once(p.paket.gonderildi)} · ${p.paket.goruldu ? 'Müşteri açtı ' + U.once(p.paket.goruldu) : 'Henüz açılmadı'} · ${say('begenildi')} beğeni · ${say('secildi')} seçim · ${say('elendi')} elendi</small></div>
          <button class="btn btn-kucuk" id="linkKopya">Linki kopyala</button>
          <a class="btn btn-ana btn-kucuk" href="${e(paketLink(p))}" target="_blank">Müşteri gözüyle aç ↗</a>
        </div>` : tum.length ? `
        <div class="kart paket-seridi">
          <span style="font-size:26px">✨</span>
          <div class="orta"><b>${tum.length} aday hazır</b><br><small>Adayları tek linkle ${e(p.musteri)}'a gönderin; beğenilerini buradan anında görün.</small></div>
          <button class="btn btn-ana" id="paketGonder">Müşteriye paket gönder</button>
        </div>` : ''}
      ${p.roller.map(r => `
        <div class="kart rol">
          <div class="rol-bas">
            <div><h3>${e(r.ad)}</h3><small>${r.kriter.cinsiyet} · ${r.kriter.yasMin}–${r.kriter.yasMax} yaş${r.aciklama ? ' · ' + e(r.aciklama) : ''}</small></div>
            <button class="btn btn-kucuk" data-adayekle="${r.id}">+ Aday ekle</button>
          </div>
          ${(r.adaylar || []).length ? r.adaylar.map(a => { const y = H.yetenek(a.yetenek); return `
            <div class="aday-satir">
              ${U.avatar(y)}
              <div class="ad"><b data-y="${y.id}">${e(y.ad)} ${e(y.soyad)}</b><small>${y.tur} · ${y.yas} yaş · ${y.boy} cm · ${e(y.sehir)}</small></div>
              ${U.etiket(a.durum)}
              <button class="ikon-btn" title="Rolden çıkar" data-cikar="${r.id}|${y.id}">✕</button>
              ${a.not ? `<div class="not">💬 ${e(p.musteri)}: “${e(a.not)}”</div>` : ''}
            </div>`; }).join('') : `<div class="bos">Bu role henüz aday eklenmedi. <a style="cursor:pointer;color:var(--vurgu)" data-adayekle="${r.id}">Uygun adayları gör</a></div>`}
        </div>`).join('')}`;
  }
  function projeBagla(id) {
    const p = H.proje(id); if (!p) return;
    const pg = $('#paketGonder');
    if (pg) pg.onclick = () => {
      p.paket = { gonderildi: Date.now(), goruldu: null };
      if (p.durum === 'Aday topluyor') p.durum = 'Müşteride';
      H.hareket(`${p.musteri}'a aday paketi gönderildi`, p.id);
      kaydet();
      const link = paketLink(p);
      const mesaj = `Merhaba, “${p.ad}” için aday paketimiz hazır: ${link}`;
      U.modal('Paket hazır 🎉', `
        <p style="margin:0;color:var(--soluk)">Bu linki ${e(p.musteri)} ile paylaşın. Giriş yapmadan adayları görür, beğenir ve seçer.</p>
        <div class="link-kutu"><code>${e(link)}</code><button class="btn btn-kucuk" id="kopyala">Kopyala</button></div>`,
        `<a class="btn" target="_blank" href="https://wa.me/?text=${encodeURIComponent(mesaj)}">WhatsApp'ta paylaş</a><a class="btn btn-ana" target="_blank" href="${e(link)}">Müşteri gözüyle aç ↗</a>`)
        .querySelector('#kopyala').onclick = () => kopyala(link);
    };
    const lk = $('#linkKopya'); if (lk) lk.onclick = () => kopyala(paketLink(p));
    const tm = $('#tamamla'); if (tm) tm.onclick = () => confirmModal('Proje tamamlandı olarak kapansın mı?', () => { p.durum = 'Tamamlandı'; H.hareket(`“${p.ad}” tamamlandı`, p.id); kaydet(); });
    $('#rolEkle').onclick = () => {
      const m = U.modal('Rol ekle', rolAlanlari(), `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="rl-kaydet">Ekle</button>`);
      m.querySelector('#rl-kaydet').onclick = () => { p.roller.push(rolOku(m)); U.modalKapat(); kaydet(); };
    };
    document.querySelectorAll('[data-adayekle]').forEach(b => b.onclick = () => adayEkle(p, p.roller.find(r => r.id === b.dataset.adayekle)));
    document.querySelectorAll('[data-cikar]').forEach(b => b.onclick = () => {
      const [rid, yid] = b.dataset.cikar.split('|');
      const r = p.roller.find(x => x.id === rid); r.adaylar = r.adaylar.filter(a => a.yetenek !== yid); kaydet();
    });
    document.querySelectorAll('.aday-satir [data-y]').forEach(b => b.onclick = () => yetenekDetay(b.dataset.y));
  }

  // Akıllı eşleştirme: kritere uyanlar üstte, uyum puanıyla
  function adayEkle(p, r) {
    const mevcut = new Set((r.adaylar || []).map(a => a.yetenek));
    const kr = r.kriter;
    const puan = y => {
      let s = 0;
      if (y.cinsiyet === kr.cinsiyet) s += 50;
      const orta = (kr.yasMin + kr.yasMax) / 2, yari = Math.max(1, (kr.yasMax - kr.yasMin) / 2);
      s += Math.max(0, 35 - Math.abs(y.yas - orta) / yari * 20);
      if (y.deneyim === 'Deneyimli') s += 10; else if (y.deneyim === 'Orta') s += 5;
      if (y.yas < kr.yasMin || y.yas > kr.yasMax) s -= 25;
      if (y.tur === 'Çocuk' && kr.yasMin >= 18) s -= 60;
      return Math.max(0, Math.min(99, Math.round(s)));
    };
    const liste = onayli().filter(y => !mevcut.has(y.id)).map(y => ({ y, s: puan(y) })).sort((a, b) => b.s - a.s);
    const m = U.modal(`“${e(r.ad)}” için aday seç`, `
      <p style="margin:0;color:var(--soluk);font-size:14px">Rol kriterlerine göre sıraladık: <b style="color:var(--yazi)">${kr.cinsiyet}, ${kr.yasMin}–${kr.yasMax} yaş</b>. En uygun adaylar üstte.</p>
      <input class="girdi" id="oneriAra" placeholder="İsimle ara…">
      <div class="oneri-liste">${liste.map(({ y, s }) => `
        <label class="oneri" data-ad="${e((y.ad + ' ' + y.soyad).toLocaleLowerCase('tr'))}">
          <input type="checkbox" value="${y.id}">
          ${U.avatar(y)}
          <div class="orta"><b>${e(y.ad)} ${e(y.soyad)}</b><br><small>${y.cinsiyet} · ${y.yas} yaş · ${y.boy} cm · ${y.tur} · ${e(y.sehir)}</small></div>
          <span class="uyum" style="${s < 50 ? 'color:var(--soluk)' : ''}">%${s} uyum</span>
        </label>`).join('')}</div>`,
      `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="secEkle">Seçilenleri ekle</button>`);
    m.querySelector('#oneriAra').oninput = ev => { const q = ev.target.value.toLocaleLowerCase('tr'); m.querySelectorAll('.oneri').forEach(o => o.style.display = o.dataset.ad.includes(q) ? '' : 'none'); };
    m.querySelector('#secEkle').onclick = () => {
      const sec = [...m.querySelectorAll('input:checked')].map(i => i.value);
      if (!sec.length) return U.toast('En az bir aday seçin');
      r.adaylar = r.adaylar || [];
      sec.forEach(id => r.adaylar.push({ yetenek: id, durum: 'aday', not: '' }));
      U.modalKapat(); kaydet(); U.toast(`${sec.length} aday eklendi`);
    };
  }

  /* ---------- Başvurular ---------- */
  function basvurular() {
    const l = bekleyen().sort((a, b) => b.eklenme - a.eklenme);
    return `
      <div class="kart" style="margin-bottom:20px"><div class="kart-govde" style="display:flex;flex-direction:column;gap:12px">
        <div><b>Ajansınıza özel başvuru linki</b><div style="color:var(--soluk);font-size:14px">Instagram biyografinize ya da WhatsApp'a koyun. Yeni yetenekler bilgilerini kendileri doldurur, burada onayınıza düşer.</div></div>
        <div class="link-kutu"><code>${e(basvuruLink())}</code><button class="btn btn-kucuk" id="kopyala">Kopyala</button><a class="btn btn-kucuk btn-ana" target="_blank" href="${e(basvuruLink())}">Aç ↗</a></div>
      </div></div>
      <div class="kart">
        <div class="kart-bas"><h2>Onay bekleyenler (${l.length})</h2></div>
        ${l.length ? l.map(y => `
          <div class="basvuru">
            ${U.foto(y)}
            <div class="ad"><b>${e(y.ad)} ${e(y.soyad)}</b><small>${y.tur} · ${y.cinsiyet} · ${y.yas} yaş · ${y.boy} cm · ${y.kilo} kg · ${e(y.sehir)} · ${U.once(y.eklenme)}</small>
              ${[...y.diller, ...y.beceriler].map(s => `<span class="cip">${e(s)}</span>`).join('')}</div>
            <div class="dugmeler"><button class="btn btn-kucuk" data-red="${y.id}">Reddet</button><button class="btn btn-ana btn-kucuk" data-onay="${y.id}">Onayla</button></div>
          </div>`).join('') : '<div class="bos">Bekleyen başvuru yok. Başvuru linkinizi paylaşın, yeni yetenekler buraya düşsün.</div>'}
      </div>`;
  }
  function basvuruBagla() {
    $('#kopyala').onclick = () => kopyala(basvuruLink());
    document.querySelectorAll('[data-onay]').forEach(b => b.onclick = () => {
      const y = H.yetenek(b.dataset.onay); y.durum = 'onayli'; H.hareket(`${y.ad} ${y.soyad} havuza eklendi`); kaydet(); U.toast(`${y.ad} yetenek havuzuna eklendi`);
    });
    document.querySelectorAll('[data-red]').forEach(b => b.onclick = () => {
      db().yetenekler = db().yetenekler.filter(y => y.id !== b.dataset.red); kaydet(); U.toast('Başvuru reddedildi');
    });
  }

  /* ---------- Ayarlar ---------- */
  function ayarlar() {
    const a = aj();
    const ornek = onayli()[0];
    return `
      <div class="iki-kolon">
        <div class="kart"><div class="kart-bas"><h2>Ajans markası</h2></div><div class="kart-govde" style="display:flex;flex-direction:column;gap:16px">
          <div class="izgara2">
            <div class="alan"><label>Ajans adı</label><input class="girdi" id="ay-ad" value="${e(a.ad)}"></div>
            <div class="alan"><label>Logo kısaltması</label><input class="girdi" id="ay-kisa" maxlength="3" value="${e(a.kisa)}"></div>
          </div>
          <div class="izgara2">
            <div class="alan"><label>Şehir</label><input class="girdi" id="ay-sehir" value="${e(a.sehir)}"></div>
            <div class="alan"><label>Yetkili</label><input class="girdi" id="ay-yetkili" value="${e(a.yetkili)}"></div>
          </div>
          <div class="alan"><label>Marka rengi — paneliniz, başvuru sayfanız ve müşteri paketleriniz bu renge bürünür</label>
            <div class="renkler">${RENKLER.map(r => `<span class="renk ${r === a.renk ? 'sec' : ''}" data-r="${r}" style="background:${r}"></span>`).join('')}</div></div>
          <div><button class="btn btn-ana" id="ay-kaydet">Kaydet</button></div>
        </div></div>
        <div class="kart"><div class="kart-bas"><h2>Müşteriniz böyle görür</h2></div><div class="kart-govde">
          <div class="onizleme-paket">
            <div class="ust"><span class="ajans-logo" id="on-logo">${e(a.kisa)}</span><b id="on-ad">${e(a.ad)}</b></div>
            ${ornek ? `<div class="govde">${U.foto(ornek)}<div style="flex:1"><b>${e(ornek.ad)} ${e(ornek.soyad)}</b><br><small style="color:var(--soluk)">${ornek.yas} yaş · ${ornek.boy} cm</small></div><span class="dugme">Seç</span></div>` : ''}
          </div>
          <p style="color:var(--soluk);font-size:13px;margin:14px 0 0">Paketin altında küçük bir “Hüsrev Cast Ajans ile hazırlandı” notu bulunur.</p>
        </div></div>
      </div>
      <div class="kart" style="margin-top:20px"><div class="kart-bas"><h2>Paket ve ekip</h2></div><div class="kart-govde" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
        <div><b>${e(a.plan)} paket</b><div style="color:var(--soluk);font-size:14px">${onayli().length} yetenek · ${projelerim().length} proje · 1 ekip üyesi</div></div>
        <button class="btn" id="ekipDavet">+ Ekip üyesi davet et</button>
      </div></div>`;
  }
  function ayarBagla() {
    let renk = aj().renk;
    document.querySelectorAll('.renk').forEach(el => el.onclick = () => {
      document.querySelectorAll('.renk').forEach(x => x.classList.remove('sec')); el.classList.add('sec');
      renk = el.dataset.r; document.documentElement.style.setProperty('--vurgu', renk);
    });
    $('#ay-ad').oninput = ev => $('#on-ad').textContent = ev.target.value;
    $('#ay-kisa').oninput = ev => $('#on-logo').textContent = ev.target.value.toLocaleUpperCase('tr');
    $('#ay-kaydet').onclick = () => {
      const a = aj();
      a.ad = $('#ay-ad').value.trim() || a.ad; a.kisa = ($('#ay-kisa').value.trim() || a.kisa).toLocaleUpperCase('tr');
      a.sehir = $('#ay-sehir').value.trim(); a.yetkili = $('#ay-yetkili').value.trim() || a.yetkili; a.renk = renk;
      kaydet(); U.toast('Marka ayarları kaydedildi');
    };
    $('#ekipDavet').onclick = () => {
      const m = U.modal('Ekip üyesi davet et', `<div class="alan"><label>E-posta</label><input class="girdi" id="dv" placeholder="ornek@ajans.com"></div>
        <div class="alan"><label>Yetki</label><select class="girdi"><option>Casting yöneticisi — her şeyi yönetir</option><option>Asistan — aday ekler, paket gönderemez</option></select></div>`,
        `<button class="btn" data-kapat>Vazgeç</button><button class="btn btn-ana" id="dvg">Davet gönder</button>`);
      m.querySelector('#dvg').onclick = () => { U.modalKapat(); U.toast('Davet gönderildi (demo)'); };
    };
  }

  function kopyala(t) {
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => U.toast('Link kopyalandı'), () => U.toast('Kopyalanamadı, elle seçin'));
  }

  /* ---------- Yönlendirme ---------- */
  function ciz() {
    document.documentElement.style.setProperty('--vurgu', aj().renk);
    yanCiz();
    const h = location.hash || '#/';
    let b = 'Özet', html, bagla;
    if (h.startsWith('#/yetenek')) { b = 'Yetenek havuzu'; html = yetenekler(); bagla = yetenekBagla; }
    else if (h.startsWith('#/proje/')) { const id = h.split('/')[2]; b = 'Proje'; html = projeDetay(id); bagla = () => projeBagla(id); }
    else if (h.startsWith('#/projeler')) { b = 'Projeler'; html = projeler(); if (h === '#/projeler/yeni') { history.replaceState(null, '', '#/projeler'); bagla = yeniProje; } }
    else if (h.startsWith('#/basvuru')) { b = 'Başvurular'; html = basvurular(); bagla = basvuruBagla; }
    else if (h.startsWith('#/ayarlar')) { b = 'Marka ve ayarlar'; html = ayarlar(); bagla = ayarBagla; }
    else html = ozet();
    $('#baslik').textContent = b;
    document.title = b + ' — ' + aj().ad;
    const ic = $('#icerik'), kay = window.scrollY;
    ic.innerHTML = html;
    ic.querySelectorAll('[data-git]').forEach(el => el.onclick = () => location.hash = el.dataset.git);
    if (bagla) bagla();
    if (ciz.sonHash === location.hash) window.scrollTo(0, kay); else window.scrollTo(0, 0);
    ciz.sonHash = location.hash;
    $('#yan').classList.remove('acik');
  }

  $('#menuAc').onclick = () => $('#yan').classList.toggle('acik');
  window.addEventListener('hashchange', ciz);
  H.degisti = () => { if (!document.querySelector('.modal-arka, .cekmece')) ciz(); };
  ciz();
})();
