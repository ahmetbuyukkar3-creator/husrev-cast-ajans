/* Giriş ekranı sol panel — görselin üzerinde su dalgası (ripple) animasyonu.
   Klasik iki tamponlu dalga yayılımı; görsel dalga eğimine göre kırılır.
   İşlemciyi yormamak için yarım çözünürlükte çizilir, CSS ile büyütülür. */
(function (C) {
  'use strict';

  C.dalga = function (cv, opts) {
    if (!cv) return;
    var ODAK_Y = opts.odakY == null ? 0.35 : opts.odakY; // görselin dikeyde hangi kısmı ortalansın (yüz)
    var OLCEK = 2;
    var ARALIK = opts.damlaAralik || 600, GUC = opts.damlaGuc || 1;
    var ctx = cv.getContext('2d');
    var img = new Image();
    var w, h, doku, cikti, b1, b2, calisiyor = true, sonDamla = 0;
    var azHareket = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function kur() {
      var r = cv.getBoundingClientRect();
      w = Math.max(2, Math.round(r.width / OLCEK));
      h = Math.max(2, Math.round(r.height / OLCEK));
      cv.width = w; cv.height = h;
      // object-fit: cover — odak noktası yüzde kalsın
      var s = Math.max(w / img.width, h / img.height);
      var dw = img.width * s, dh = img.height * s;
      var dx = (w - dw) / 2;
      var dy = Math.min(0, Math.max(h - dh, h / 2 - dh * ODAK_Y));
      ctx.drawImage(img, dx, dy, dw, dh);
      doku = ctx.getImageData(0, 0, w, h);
      cikti = ctx.createImageData(w, h);
      b1 = new Int16Array(w * h);
      b2 = new Int16Array(w * h);
    }

    function damla(x, y, yaricap, guc) {
      x = x | 0; y = y | 0;
      for (var j = -yaricap; j <= yaricap; j++) {
        for (var i = -yaricap; i <= yaricap; i++) {
          var xx = x + i, yy = y + j;
          if (xx < 1 || yy < 1 || xx >= w - 1 || yy >= h - 1) continue;
          var d = Math.sqrt(i * i + j * j);
          if (d <= yaricap) b1[yy * w + xx] += guc * (1 - d / yaricap);
        }
      }
    }

    function adim() {
      var x, y, i;
      for (y = 1; y < h - 1; y++) {
        for (x = 1, i = y * w + 1; x < w - 1; x++, i++) {
          var v = ((b1[i - 1] + b1[i + 1] + b1[i - w] + b1[i + w]) >> 1) - b2[i];
          b2[i] = v - (v >> 5);
        }
      }
      var t = b1; b1 = b2; b2 = t;

      var kd = doku.data, cd = cikti.data;
      for (y = 0; y < h; y++) {
        for (x = 0, i = y * w; x < w; x++, i++) {
          var ox = x > 0 && x < w - 1 ? b1[i - 1] - b1[i + 1] : 0;
          var oy = y > 0 && y < h - 1 ? b1[i - w] - b1[i + w] : 0;
          var sx = x + (ox >> 2), sy = y + (oy >> 2);
          if (sx < 0) sx = 0; else if (sx >= w) sx = w - 1;
          if (sy < 0) sy = 0; else if (sy >= h) sy = h - 1;
          var k = (sy * w + sx) * 4, o = i * 4, isik = ox >> 3;
          cd[o] = kd[k] + isik; cd[o + 1] = kd[k + 1] + isik; cd[o + 2] = kd[k + 2] + isik; cd[o + 3] = 255;
        }
      }
      ctx.putImageData(cikti, 0, 0);
    }

    function dongu(zaman) {
      if (!calisiyor) return;
      if (!document.body.contains(cv)) { calisiyor = false; window.removeEventListener('resize', boyutla); return; } // sayfa değişti
      if (zaman - sonDamla > ARALIK) { // kendiliğinden düşen damlalar
        damla(Math.random() * w, Math.random() * h, 3 + Math.random() * 3, (300 + Math.random() * 300) * GUC);
        sonDamla = zaman;
      }
      adim();
      requestAnimationFrame(dongu);
    }

    var sonHareket = 0;
    cv.parentNode.addEventListener('pointermove', function (e) {
      if (!b1 || e.timeStamp - sonHareket < 30) return;
      sonHareket = e.timeStamp;
      var r = cv.getBoundingClientRect();
      damla((e.clientX - r.left) / OLCEK, (e.clientY - r.top) / OLCEK, 3, 220);
    });
    cv.parentNode.addEventListener('pointerdown', function (e) {
      if (!b1) return;
      var r = cv.getBoundingClientRect();
      damla((e.clientX - r.left) / OLCEK, (e.clientY - r.top) / OLCEK, 6, 900);
    });

    var boyutZaman;
    function boyutla() {
      clearTimeout(boyutZaman);
      boyutZaman = setTimeout(function () { if (calisiyor && img.complete) kur(); }, 150);
    }
    window.addEventListener('resize', boyutla);

    img.onload = function () {
      kur();
      if (azHareket) return; // hareket azaltma açıksa sadece görsel
      requestAnimationFrame(dongu);
    };
    img.src = opts.gorsel;
  };
})(window.C || (window.C = {}));
