/* Giải mã cổ phiếu: xếp bài mới/vừa cập nhật lên đầu, đưa bài mới nhất ra trang chủ, nhãn UPDATE và "Bài liên quan".
   Dữ liệu: co-phieu/articles.js (sinh bởi tools/build_articles.py). */
(function () {
  var A = (window.TB_ARTICLES || []).slice();
  if (!A.length) return;
  function key(a) { return a.upd || a.pub; }
  A.sort(function (a, b) { return key(a) < key(b) ? 1 : key(a) > key(b) ? -1 : 0; });
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dm(iso) { var p = String(iso).slice(0, 10).split('-'); return p[2] + '/' + p[1]; }
  function dmy(iso) { var p = String(iso).slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  var NOW = Date.now();
  function badge(a) {
    if (a.upd) return '<span class="tb-ab upd">UPDATE ' + dm(a.upd) + '</span>';
    if (NOW - new Date(a.pub + ':00+07:00').getTime() < 3 * 86400000) return '<span class="tb-ab new">MỚI</span>';
    return '';
  }
  var css = document.createElement('style');
  css.textContent = '.tb-ab{display:inline-block;font-family:var(--tb-sans,inherit);font-size:10.5px;font-weight:800;letter-spacing:.05em;border-radius:999px;padding:2px 8px;vertical-align:2px;margin-right:6px;line-height:1.4}' +
    '.tb-ab.upd{background:#e0262f;color:#fff}.tb-ab.new{background:#1f6fd1;color:#fff}' +
    '.tb-rel{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}' +
    '.tb-rel a{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:16px;background:var(--card,#fff);box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.05);text-decoration:none;color:inherit}' +
    '.tb-rel b{font-size:15.5px}.tb-rel span{font-size:14px;line-height:1.45;opacity:.8}.tb-rel em{font-style:normal;font-size:12px;opacity:.6}' +
    '.tb-upd{border-left:4px solid #e0262f;background:#fdf3f2;border-radius:14px;padding:14px 16px;margin:6px 0 4px;font-size:15px;line-height:1.55}' +
    '.tb-upd ul{margin:6px 0 0;padding-left:18px}.tb-upd a{color:var(--blue,#1f6fd1);font-weight:600}' +
    '.tb-old{background:#fff4e0;border:1px solid #f0c27a;border-radius:14px;padding:12px 16px;margin:12px 0;font-size:15px}.tb-old a{font-weight:700}';
  document.head.appendChild(css);

  /* 1. Trang danh sách Cổ phiếu */
  var tbl = document.querySelector('.main .tbl');
  if (tbl) {
    var hd = tbl.querySelector('.hd');
    tbl.innerHTML = (hd ? hd.outerHTML : '') + A.map(function (a) {
      return '<a class="st" href="' + a.tk.toLowerCase() + '/index.html"><span class="tk">' + a.tk + '</span><span class="nm">' + badge(a) + esc(a.name) + '<small>' + esc(a.sector) + ' · ' + (a.upd ? 'cập nhật ' + dm(a.upd) : 'đăng ' + dm(a.pub)) + '</small></span>' +
        '<span class="px mono">' + esc(a.price) + '</span><span class="mono ' + a.m1[0] + '">' + esc(a.m1[1]) + '</span><span class="mono ' + a.y1[0] + '">' + esc(a.y1[1]) + '</span><span class="mono ' + a.pk[0] + '">' + esc(a.pk[1]) + '</span>' +
        '<span class="ln">' + esc(a.line) + ' <span class="more">Đọc tiếp →</span></span></a>';
    }).join('');
  }

  /* 2. Trang chủ: xoay tua mỗi ngày một bài (anh Hải yêu cầu 18/10/2026).
     Ngày có bài mới đăng/cập nhật thì bài đó lên trước; các ngày sau lần lượt lùi về bài cũ hơn, hết danh sách thì quay vòng. */
  var feat = document.querySelector('.feat');
  if (feat && feat.querySelector('h3') && A.length) {
    var vnDay = function (ms) { return Math.floor((ms + 7 * 3600 * 1000) / 86400000); };
    var newest = Date.parse(key(A[0]) + ':00+07:00'), today = vnDay(Date.now());
    var off = isFinite(newest) ? Math.max(0, today - vnDay(newest)) : 0;
    var f = A[off % A.length];
    var oldArt = feat.querySelector('svg');  // tranh riêng của bài đang lên (tools/art/<MÃ>.svg)
    if (f.art && oldArt) { var t = document.createElement('div'); t.innerHTML = f.art; if (t.firstChild) oldArt.parentNode.replaceChild(t.firstChild, oldArt); }
    var box = feat.querySelector('div') || feat, base = 'co-phieu/' + f.tk.toLowerCase() + '/index.html';
    box.innerHTML = '<span class="tkr">' + badge(f) + esc(f.sector) + '</span>' +
      '<h3><a href="' + base + '">' + esc(f.title) + '</a></h3>' +
      '<div class="px">' + esc(f.price) + ' <span class="' + f.y1[0] + '">' + esc(f.y1[1]) + ' 1 năm</span></div>' +
      '<ul>' + f.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<div class="chips">' + A.filter(function (a) { return a !== f; }).map(function (a) { return '<a href="co-phieu/' + a.tk.toLowerCase() + '/index.html">' + (a.upd ? '↻ ' : '') + a.tk + '</a>'; }).join('') +
      '<a class="more" href="' + base + '">Đọc tiếp phân tích ' + f.tk + ' →</a></div>';
  }

  /* 3. Trang từng mã: nhãn UPDATE, bản cũ, bài liên quan */
  var m = location.pathname.match(/\/co-phieu\/([a-z0-9]+)\/(?:(\d{4}-\d{2}-\d{2})\/)?(?:index\.html)?$/i);
  if (!m) return;
  var tk = m[1].toUpperCase(), oldDate = m[2], me = A.filter(function (a) { return a.tk === tk; })[0];
  if (!me) return;
  var up = oldDate ? '../../' : '../', hero = document.querySelector('.hero');
  if (oldDate && hero) {
    hero.insertAdjacentHTML('afterbegin', '<div class="tb-old">Đây là <b>bản phân tích cũ ngày ' + dmy(oldDate) + '</b>. Số liệu có thể đã thay đổi. <a href="../index.html">Xem bản mới nhất ' + (me.upd ? '(cập nhật ' + dmy(me.upd) + ')' : '') + ' →</a></div>');
  } else if (me.upd && hero) {
    var sub = hero.querySelector('.sub'); if (sub) sub.insertAdjacentHTML('afterbegin', badge(me));
    hero.insertAdjacentHTML('beforeend', '<div class="tb-upd"><b>Bản cập nhật ngày ' + dmy(me.upd) + '.</b>' +
      (me.changes && me.changes.length ? ' Điểm khác so với bài trước:<ul>' + me.changes.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      (me.history && me.history.length ? '<div style="margin-top:6px">Các bản trước: ' + me.history.map(function (h) { return '<a href="' + h + '/index.html">' + dmy(h) + '</a>'; }).join(' · ') + '</div>' : '') + '</div>');
  }
  var secName = me.sector.split('·').pop().trim();
  var same = A.filter(function (a) { return a.tk !== tk && a.sector.split('·').pop().trim() === secName; });
  var rest = A.filter(function (a) { return a.tk !== tk && same.indexOf(a) < 0; }).slice(0, Math.max(2, 4 - same.length));
  var links = (me.history || []).filter(function (h) { return h !== oldDate; }).map(function (h) { return '<a href="' + up + tk.toLowerCase() + '/' + h + '/index.html"><em>Bản cũ</em><b>' + tk + ' ngày ' + dmy(h) + '</b><span>Bài phân tích trước đó của chính mã này.</span></a>'; })
    .concat(same.concat(rest).slice(0, 6).map(function (a) {
      return '<a href="' + up + a.tk.toLowerCase() + '/index.html"><em>' + (same.indexOf(a) >= 0 ? 'Cùng ngành' : 'Mới đăng') + ' · ' + (a.upd ? 'cập nhật ' : '') + dm(a.upd || a.pub) + '</em><b>' + badge(a) + esc(a.tk + ' · ' + a.name) + '</b><span>' + esc(a.line) + '</span></a>';
    }));
  var legal = document.querySelector('footer.legal');
  if (legal && links.length) legal.insertAdjacentHTML('beforebegin', '<section><div class="sh"><h2>Bài liên quan</h2></div><div class="tb-rel">' + links.join('') + '</div></section>');
})();
