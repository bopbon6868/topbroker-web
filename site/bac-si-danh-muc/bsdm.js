/* Bác sĩ danh mục – mọi tính toán chạy trên trình duyệt; dữ liệu lưu localStorage của máy người dùng. */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var API = (location.protocol === 'file:' ? 'https://topbroker.fun' : '') + '/api/stock';
var KEY = 'tb-bsdm-v1', JKEY = 'tb-bsdm-journal-v1';
var MINUS = '−';

/* ---------- tiện ích số ---------- */
function parseNum(v) {
  var s = String(v == null ? '' : v).trim().replace(/\s/g, '').replace(/đ|vnd/gi, '');
  if (!s) return NaN;
  var neg = /^[-−]/.test(s); s = s.replace(/^[-−+]/, '');
  if (s.indexOf('.') >= 0 && s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.indexOf(',') >= 0) s = /,\d{3}(,|$)/.test(s) && !/,\d{1,2}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  else if (/\.\d{3}(\.|$)/.test(s) && !/\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
  var n = parseFloat(s);
  return neg ? -n : n;
}
function toDong(x) { return x > 0 && x < 1000 ? Math.round(x * 1000) : x; }  // 28,5 → 28.500 đ
function nf(n, d) { try { return n.toLocaleString('vi-VN', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); } catch (e) { return n.toFixed(d || 0); } }
function sgn(n, s) { return (n > 0 ? '+' : n < 0 ? MINUS : '') + s; }
function money(n, signed) {
  var a = Math.abs(n), s;
  if (a >= 1e9) s = nf(a / 1e9, 2) + ' tỷ';
  else if (a >= 1e6) s = nf(a / 1e6, 1) + ' tr';
  else s = nf(a, 0) + ' đ';
  return signed ? sgn(n, s) : (n < 0 ? MINUS : '') + s;
}
function pct(x, d, signed) { if (x == null || !isFinite(x)) return '–'; var s = nf(Math.abs(x * 100), d == null ? 1 : d) + '%'; return signed === false ? (x < 0 ? MINUS : '') + s : sgn(x, s); }
function cls(x) { return x > 0 ? 'up' : x < 0 ? 'dn' : ''; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function lot(q) { return Math.max(0, Math.floor(q / 100) * 100); }
function sectorOf(sym) {
  var S = window.TB_SECTORS || {};
  for (var k in S) if (S[k].indexOf(sym) >= 0) return k;
  return 'Khác';
}
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function hm(ts) { var d = new Date((ts + 7 * 3600) * 1000); return ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2) + ' ' + ('0' + d.getUTCDate()).slice(-2) + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2); }
function today() { var d = new Date(Date.now() + 7 * 3600 * 1000); return d.toISOString().slice(0, 10); }
function vnDate(iso) { var p = String(iso).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }

/* ---------- trạng thái ---------- */
var S = load(KEY, { rows: [], cash: '', debt: '', call: '40', force: '30', fee: '0,15', tax: '0,1' });
var PX = {}, HIST = {}, PORT = null, LAST_SIM = null, LAST_CAUSE = null, LAST_SC = null;
var SECTOR_NAMES = Object.keys(window.TB_SECTORS || {}).concat(['Khác']);

/* ---------- NHẬP ---------- */
function rowHTML(r) {
  var opts = SECTOR_NAMES.map(function (n) { return '<option' + (n === r.sector ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
  return '<tr><td data-l="Mã"><input aria-label="Mã" class="sym" placeholder="VD: HPG" value="' + esc(r.sym) + '" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false"></td>' +
    '<td data-l="Khối lượng"><input aria-label="Khối lượng" class="qty" inputmode="numeric" placeholder="1.000" value="' + esc(r.qty) + '"></td>' +
    '<td data-l="Giá vốn (đ)"><input aria-label="Giá vốn" class="cost" inputmode="decimal" placeholder="25.000" value="' + esc(r.cost) + '"></td>' +
    '<td data-l="Ngành"><select aria-label="Ngành" class="sec">' + opts + '</select></td>' +
    '<td><button type="button" class="x" aria-label="Xóa dòng">×</button></td></tr>';
}
function renderInputs() {
  var tb = $('#in-tbl tbody');
  if (!S.rows.length) S.rows = [{ sym: '', qty: '', cost: '', sector: 'Khác' }];
  tb.innerHTML = S.rows.map(rowHTML).join('');
  ['cash', 'debt', 'call', 'force', 'fee', 'tax'].forEach(function (k) { $('#' + k).value = S[k] == null ? '' : S[k]; });
}
function readInputs() {
  S.rows = $$('#in-tbl tbody tr').map(function (tr) {
    return { sym: $('.sym', tr).value.trim().toUpperCase(), qty: $('.qty', tr).value.trim(), cost: $('.cost', tr).value.trim(), sector: $('.sec', tr).value };
  });
  ['cash', 'debt', 'call', 'force', 'fee', 'tax'].forEach(function (k) { S[k] = $('#' + k).value.trim(); });
  store(KEY, S);
}
$('#in-tbl').addEventListener('input', function (e) {
  if (e.target.classList.contains('sym')) {
    var tr = e.target.closest('tr'), v = e.target.value.trim().toUpperCase(), s = sectorOf(v);
    if (v.length >= 3 && s !== 'Khác') $('.sec', tr).value = s;
  }
  readInputs();
});
$('#in-tbl').addEventListener('change', readInputs);
$('#in-tbl').addEventListener('click', function (e) {
  if (!e.target.classList.contains('x')) return;
  e.target.closest('tr').remove(); readInputs(); if (!S.rows.length) renderInputs();
});
$$('#cash,#debt,#call,#force,#fee,#tax').forEach(function (el) { el.addEventListener('input', readInputs); });
$('#add-row').addEventListener('click', function () {
  readInputs(); S.rows.push({ sym: '', qty: '', cost: '', sector: 'Khác' }); renderInputs();
  var ins = $$('#in-tbl .sym'); ins[ins.length - 1].focus();
});
$('#paste-toggle').addEventListener('click', function () { var b = $('#paste-box'); b.hidden = !b.hidden; if (!b.hidden) $('#paste').focus(); });
$('#paste-go').addEventListener('click', function () {
  readInputs();
  var rows = S.rows.filter(function (r) { return r.sym; }), n = 0;
  $('#paste').value.split(/\n+/).forEach(function (line) {
    var tk = line.trim().split(/[\s;\t|]+/).filter(Boolean);
    var sym = null, nums = [];
    tk.forEach(function (t) {
      if (!sym && /^[A-Za-z][A-Za-z0-9]{2,7}$/.test(t)) sym = t.toUpperCase();
      else if (!isNaN(parseNum(t))) nums.push(t);
    });
    if (sym && nums.length >= 2) { rows.push({ sym: sym, qty: nums[0], cost: nums[1], sector: sectorOf(sym) }); n++; }
  });
  S.rows = rows; store(KEY, S); renderInputs();
  $('#in-msg').textContent = n ? 'Đã thêm ' + n + ' mã từ phần dán.' : 'Chưa đọc được dòng nào. Mỗi dòng cần có mã, khối lượng, giá vốn.';
});
$('#demo').addEventListener('click', function () {
  S = { rows: [
    { sym: 'HPG', qty: '2.000', cost: '28.500', sector: 'Thép' },
    { sym: 'VPB', qty: '3.000', cost: '22.000', sector: 'Ngân hàng' },
    { sym: 'NVL', qty: '5.000', cost: '15.000', sector: 'Bất động sản' },
    { sym: 'SSI', qty: '2.000', cost: '38.000', sector: 'Chứng khoán' },
    { sym: 'MWG', qty: '500', cost: '68.000', sector: 'Bán lẻ' }
  ], cash: '20.000.000', debt: '150.000.000', call: '40', force: '30', fee: '0,15', tax: '0,1' };
  store(KEY, S); renderInputs();
  $('#in-msg').textContent = 'Đây là danh mục mẫu để xem thử, không phải danh mục thật của ai.';
});
$('#clear').addEventListener('click', function () {
  S.rows = []; S.cash = ''; S.debt = ''; store(KEY, S); renderInputs();
  $$('#kham,#nguyen-nhan,#mo-phong').forEach(function (s) { s.hidden = true; }); updateSteps();
});

/* ---------- lấy giá ---------- */
function getJSON(url) { return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
function fetchQuotes(syms) {
  return getJSON(API + '?s=' + syms.join(',')).then(function (j) {
    Object.keys(j.q || {}).forEach(function (s) { var q = j.q[s]; PX[s] = { p: s === 'VNINDEX' ? q.p : q.p * 1000, ref: q.ref == null ? null : (s === 'VNINDEX' ? q.ref : q.ref * 1000), t: q.t }; });
    return j;
  });
}
function fetchHist(syms) {
  var need = syms.filter(function (s) { return !HIST[s]; }), chunks = [];
  for (var i = 0; i < need.length; i += 20) chunks.push(need.slice(i, i + 20));
  return Promise.all(chunks.map(function (c) {
    return getJSON(API + '?s=' + c.join(',') + '&h=400').then(function (j) {
      Object.keys(j.h || {}).forEach(function (s) { HIST[s] = j.h[s]; });
    }).catch(function () {});
  }));
}

/* ---------- 1 · KHÁM ---------- */
function settings() {
  return {
    cash: Math.max(0, parseNum(S.cash) || 0), debt: Math.max(0, parseNum(S.debt) || 0),
    call: (parseNum(S.call) || 0) / 100, force: (parseNum(S.force) || 0) / 100,
    fee: (parseNum(S.fee) || 0) / 100, tax: (parseNum(S.tax) || 0) / 100
  };
}
function dropToCall(mvOther, qS, pS, cash, debt, call) {
  if (!debt) return { t: 'none' };
  var needAssets = debt / (1 - call), base = mvOther + cash;
  if (!(qS * pS > 0)) return base >= needAssets ? { t: 'indep' } : { t: 'below' };
  var x = 1 - (needAssets - base) / (qS * pS);
  if (x <= 0) return { t: 'below' };
  if (x >= 1) return { t: 'safe' };
  return { t: 'x', x: x };
}
function dropAllToCall(mv, cash, debt, call) {
  if (!debt) return { t: 'none' };
  var x = 1 - (debt / (1 - call) - cash) / mv;
  return x <= 0 ? { t: 'below' } : x >= 1 ? { t: 'safe' } : { t: 'x', x: x };
}
function dtcSentence(d, sym) {
  return d.t === 'x' ? sym + ' giảm thêm ' + pct(d.x, 1, false) + ' thì chạm ngưỡng gọi ký quỹ.'
    : d.t === 'below' ? 'Đang ở dưới ngưỡng gọi ký quỹ.'
    : d.t === 'safe' ? sym + ' có giảm sâu đến đâu cũng chưa làm chạm ngưỡng gọi ký quỹ.'
    : d.t === 'indep' ? 'Ngưỡng gọi ký quỹ không còn phụ thuộc ' + sym + '.' : '';
}
function dtcText(d, who) {
  return d.t === 'none' ? 'Không vay margin' : d.t === 'below' ? 'Đã ở dưới ngưỡng' : d.t === 'safe' ? 'Không chạm ngưỡng' : d.t === 'indep' ? 'Không phụ thuộc mã này' : (who || '') + 'giảm thêm ' + pct(d.x, 1, false);
}

function buildPortfolio() {
  var st = settings(), rows = [], errs = [];
  S.rows.forEach(function (r) {
    if (!r.sym) return;
    var q = parseNum(r.qty), c = toDong(parseNum(r.cost));
    if (!/^[A-Z0-9]{3,8}$/.test(r.sym)) { errs.push(r.sym + ': mã không hợp lệ'); return; }
    if (!(q > 0) || !(c > 0)) { errs.push(r.sym + ': thiếu khối lượng hoặc giá vốn'); return; }
    var ex = rows.filter(function (x) { return x.sym === r.sym; })[0];
    if (ex) { ex.cost = (ex.cost * ex.qty + c * q) / (ex.qty + q); ex.qty += q; }
    else rows.push({ sym: r.sym, qty: q, cost: c, sector: r.sector || sectorOf(r.sym) });
  });
  return { rows: rows, errs: errs, st: st };
}

function exam() {
  readInputs();
  var b = buildPortfolio(), msg = $('#in-msg');
  if (!b.rows.length) { msg.textContent = b.errs.length ? b.errs.join(' · ') : 'Nhập ít nhất một mã, khối lượng và giá vốn.'; return; }
  msg.textContent = 'Đang lấy giá…';
  var syms = b.rows.map(function (r) { return r.sym; });
  fetchQuotes(syms.concat(['VNINDEX'])).then(function (j) {
    var miss = b.rows.filter(function (r) { return !PX[r.sym]; }).map(function (r) { return r.sym; });
    b.rows = b.rows.filter(function (r) { return PX[r.sym]; });
    if (!b.rows.length) { msg.textContent = 'Không lấy được giá cho: ' + miss.join(', ') + '. Kiểm tra lại mã.'; return; }
    msg.textContent = (b.errs.length ? b.errs.join(' · ') + ' · ' : '') + (miss.length ? 'Không lấy được giá: ' + miss.join(', ') + ' (đã bỏ qua).' : '');
    PORT = calc(b.rows, b.st);
    renderExam(); aiReset('kham');
    $('#kham').hidden = false; $('#nguyen-nhan').hidden = false; $('#mo-phong').hidden = false; updateSteps();
    initSim(); runCause(); renderJournal();
    $('#kham').scrollIntoView({ behavior: 'smooth' });
  }).catch(function () { msg.textContent = 'Chưa lấy được giá (mạng hoặc nguồn giá đang lỗi). Thử lại sau ít phút.'; });
}
$('#run').addEventListener('click', exam);

function calc(rows, st) {
  var P = { rows: rows.map(function (r) { var p = PX[r.sym].p; return { sym: r.sym, qty: r.qty, cost: r.cost, sector: r.sector, p: p, t: PX[r.sym].t, ref: PX[r.sym].ref, mv: r.qty * p, cv: r.qty * r.cost }; }), st: st };
  P.mv = P.rows.reduce(function (a, r) { return a + r.mv; }, 0);
  P.cv = P.rows.reduce(function (a, r) { return a + r.cv; }, 0);
  P.rows.forEach(function (r) { r.w = r.mv / P.mv; r.pl = r.mv - r.cv; r.plp = r.pl / r.cv; });
  P.assets = P.mv + st.cash; P.nav = P.assets - st.debt; P.rtt = P.assets ? P.nav / P.assets : 0; P.lev = P.nav > 0 ? P.assets / P.nav : Infinity;
  P.sectors = {};
  P.rows.forEach(function (r) { P.sectors[r.sector] = (P.sectors[r.sector] || 0) + r.w; });
  return P;
}

function renderExam() {
  var P = PORT, st = P.st, d = dropAllToCall(P.mv, st.cash, st.debt, st.call);
  var ts = Math.max.apply(null, P.rows.map(function (r) { return r.t || 0; }));
  $('#px-time').textContent = 'Giá lúc ' + hm(ts) + ' · trễ 15 phút · nguồn VNDirect';
  var rttCls = !st.debt ? '' : P.rtt < st.call ? 'bad' : P.rtt < st.call + 0.1 ? 'warn' : '';
  $('#kpi').innerHTML = [
    ['Giá trị cổ phiếu', money(P.mv), P.rows.length + ' mã'],
    ['Tiền mặt', money(st.cash), pct(st.cash / P.assets, 1, false) + ' tổng tài sản'],
    ['Dư nợ margin', money(st.debt), st.debt ? 'Đòn bẩy ' + nf(P.lev, 2) + ' lần' : 'Không vay'],
    ['Tài sản ròng', money(P.nav), 'Tài sản − nợ'],
    ['Lãi/lỗ chưa chốt', '<span class="' + cls(P.mv - P.cv) + '">' + money(P.mv - P.cv, true) + '</span>', '<span class="' + cls(P.mv - P.cv) + '">' + pct((P.mv - P.cv) / P.cv) + ' so với giá vốn</span>'],
    ['Tỷ lệ ký quỹ Rtt', st.debt ? pct(P.rtt, 1, false) : '–', st.debt ? 'Gọi ký quỹ ' + pct(st.call, 0, false) + ' · giải chấp ' + pct(st.force, 0, false) : 'Không vay margin', rttCls],
    ['Cả danh mục giảm thêm', d.t === 'x' ? pct(d.x, 1, false) : '–', d.t === 'x' ? 'thì chạm ngưỡng gọi ký quỹ' : dtcText(d), d.t === 'below' ? 'bad' : d.t === 'x' && d.x < 0.15 ? 'warn' : ''],
    ['Biến động hôm nay', (function () { var ch = P.rows.reduce(function (a, r) { return a + (r.ref ? r.qty * (r.p - r.ref) : 0); }, 0); return '<span class="' + cls(ch) + '">' + money(ch, true) + '</span>'; })(), 'so với giá tham chiếu']
  ].map(function (k) { return '<div class="' + (k[3] || '') + '"><span>' + k[0] + '</span><b>' + k[1] + '</b><em>' + k[2] + '</em></div>'; }).join('');

  var rows = P.rows.slice().sort(function (a, b) { return b.mv - a.mv; });
  $('#hold-tbl').innerHTML = '<thead><tr><th>Mã</th><th class="n">Khối lượng</th><th class="n">Giá vốn</th><th class="n">Thị giá</th><th class="n">Giá trị</th><th class="n">Tỷ trọng</th><th class="n">Lãi/lỗ</th></tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr><td><span class="tk">' + r.sym + '</span><span class="sub">' + esc(r.sector) + '</span></td><td class="n">' + nf(r.qty) + '</td><td class="n">' + nf(r.cost) + '</td>' +
        '<td class="n">' + nf(r.p) + (r.ref ? '<span class="sub ' + cls(r.p - r.ref) + '">' + pct(r.p / r.ref - 1) + ' hôm nay</span>' : '') + '</td><td class="n">' + money(r.mv) + '</td><td class="n">' + pct(r.w, 1, false) + '</td>' +
        '<td class="n ' + cls(r.pl) + '">' + money(r.pl, true) + '<span class="sub ' + cls(r.pl) + '">' + pct(r.plp) + '</span></td></tr>';
    }).join('') + '</tbody><tfoot><tr><td>Tổng</td><td></td><td class="n">' + money(P.cv) + '</td><td></td><td class="n">' + money(P.mv) + '</td><td class="n">100%</td><td class="n ' + cls(P.mv - P.cv) + '">' + money(P.mv - P.cv, true) + '</td></tr></tfoot>';

  var secs = Object.keys(P.sectors).sort(function (a, b) { return P.sectors[b] - P.sectors[a]; });
  $('#sector-bars').innerHTML = secs.map(function (s) {
    var w = P.sectors[s];
    return '<div class="bar"><span>' + esc(s) + '</span><span class="t"><i class="' + (w > 0.4 ? 'hot' : '') + '" style="width:' + (w * 100).toFixed(1) + '%"></i></span><b>' + pct(w, 0, false) + '</b></div>';
  }).join('');

  var f = [], top = rows[0], top3 = rows.slice(0, 3).reduce(function (a, r) { return a + r.w; }, 0);
  if (top.w > 0.25) f.push(['w', '<b>' + top.sym + '</b> chiếm ' + pct(top.w, 0, false) + ' giá trị cổ phiếu. Một tin xấu riêng của mã này tác động mạnh lên cả danh mục.']);
  if (rows.length > 3 && top3 > 0.7) f.push(['w', '3 mã lớn nhất chiếm ' + pct(top3, 0, false) + ' danh mục.']);
  if (secs.length && P.sectors[secs[0]] > 0.4 && secs[0] !== 'Khác') f.push(['w', 'Ngành <b>' + esc(secs[0]) + '</b> chiếm ' + pct(P.sectors[secs[0]], 0, false) + '. Danh mục phụ thuộc nhiều vào chu kỳ của một ngành.']);
  if (st.debt) {
    if (P.rtt < st.force) f.push(['b', 'Rtt ' + pct(P.rtt, 1, false) + ' đã dưới ngưỡng bán giải chấp ' + pct(st.force, 0, false) + '.']);
    else if (P.rtt < st.call) f.push(['b', 'Rtt ' + pct(P.rtt, 1, false) + ' đã dưới ngưỡng gọi ký quỹ ' + pct(st.call, 0, false) + '.']);
    else if (d.t === 'x' && d.x < 0.15) f.push(['w', 'Cả danh mục chỉ cần giảm thêm ' + pct(d.x, 1, false) + ' là chạm ngưỡng gọi ký quỹ.']);
    f.push([P.lev > 2 ? 'w' : '', 'Đòn bẩy ' + nf(P.lev, 2) + ' lần: cổ phiếu biến động 10% thì tài sản ròng biến động khoảng ' + pct(0.1 * P.mv / P.nav, 0, false) + '.']);
  }
  var deep = rows.filter(function (r) { return r.plp < -0.2; });
  if (deep.length) f.push(['', deep.length + ' mã đang lỗ hơn 20% so với giá vốn: ' + deep.map(function (r) { return '<b>' + r.sym + '</b> (' + pct(r.plp, 0) + ')'; }).join(', ') + '.']);
  var tiny = rows.filter(function (r) { return r.w < 0.03; });
  if (tiny.length >= 3) f.push(['', tiny.length + ' mã chiếm dưới 3% mỗi mã: khó tạo khác biệt cho danh mục nhưng vẫn tốn công theo dõi.']);
  var unk = rows.filter(function (r) { return r.sector === 'Khác'; });
  if (unk.length) f.push(['', 'Chưa xác định ngành của ' + unk.map(function (r) { return r.sym; }).join(', ') + ': chọn ngành ở bảng nhập để phân tích chính xác hơn.']);
  if (!f.filter(function (x) { return x[0]; }).length) f.unshift(['g', 'Chưa thấy điểm tập trung hay đòn bẩy vượt các mốc tham khảo.']);
  $('#flags').innerHTML = f.map(function (x) { return '<li class="' + x[0] + '"><span>' + x[1] + '</span></li>'; }).join('');
}

/* ---------- 2 · NGUYÊN NHÂN ---------- */
function ret(sym, n) {
  var h = HIST[sym]; if (!h || h.c.length < 2) return null;
  var i0 = Math.max(0, h.c.length - 1 - n);
  return { r: h.c[h.c.length - 1] / h.c[i0] - 1, c0: h.c[i0], c1: h.c[h.c.length - 1], d0: h.t[i0], d1: h.t[h.t.length - 1], full: h.c.length - 1 >= n };
}
function peersOf(sector) { return ((window.TB_SECTORS || {})[sector] || []).slice(0, 10); }

function runCause() {
  if (!PORT) return;
  var n = +$('#period').value, secs = {};
  PORT.rows.forEach(function (r) { if (r.sector !== 'Khác' && r.sector !== 'Quỹ ETF') secs[r.sector] = 1; });
  var need = ['VNINDEX'].concat(PORT.rows.map(function (r) { return r.sym; }));
  Object.keys(secs).forEach(function (s) { need = need.concat(peersOf(s)); });
  need = need.filter(function (v, i, a) { return a.indexOf(v) === i; });
  $('#cause-note').textContent = 'Đang tải lịch sử giá…';
  fetchHist(need).then(function () { renderCause(n); });
}
$('#period').addEventListener('change', runCause);

function renderCause(n) {
  var P = PORT, st = P.st, M = ret('VNINDEX', n);
  if (!M) { $('#cause-note').textContent = 'Chưa tải được lịch sử VN-Index. Thử lại sau ít phút.'; return; }
  var secRet = {}, secUsed = {};
  Object.keys(P.sectors).forEach(function (s) {
    var rs = peersOf(s).map(function (p) { var x = ret(p, n); return x ? [p, x.r] : null; }).filter(Boolean);
    if (rs.length >= 2) { secRet[s] = rs.reduce(function (a, x) { return a + x[1]; }, 0) / rs.length; secUsed[s] = rs.map(function (x) { return x[0]; }); }
  });
  var lines = [], V0 = 0, dV = 0, cM = 0, cS = 0, cO = 0, short = false;
  P.rows.forEach(function (r) {
    var R = ret(r.sym, n); if (!R) return;
    if (!R.full) short = true;
    var Sx = secRet[r.sector] != null ? secRet[r.sector] : M.r;
    var v0 = r.qty * R.c0 * 1000, dv = r.qty * (R.c1 - R.c0) * 1000;
    V0 += v0; dV += dv; cM += v0 * M.r; cS += v0 * (Sx - M.r); cO += v0 * (R.r - Sx);
    lines.push({ r: r, R: R.r, S: Sx, hasS: secRet[r.sector] != null, v0: v0, dv: dv });
  });
  var nav0 = V0 + st.cash - st.debt;
  LAST_CAUSE = { tu_ngay: M.d0, den_ngay: M.d1, so_phien: n, vnindex_bien_dong: M.r, gia_tri_cp_dau_ky: V0, gia_tri_cp_thay_doi: dV,
    dong_gop: { thi_truong_chung: cM, nhom_nganh: cS, rieng_doanh_nghiep: cO }, tien_mat: st.cash, du_no_margin: st.debt,
    tai_san_rong_dau_ky: nav0, bien_dong_tai_san_rong: nav0 > 0 ? dV / nav0 : null,
    nganh: Object.keys(secRet).map(function (k) { return { nganh: k, bien_dong: secRet[k], so_voi_thi_truong: secRet[k] - M.r, ma_dung_de_tinh: secUsed[k] }; }),
    tung_ma: lines.map(function (l) { return { ma: l.r.sym, nganh: l.r.sector, bien_dong_ma: l.R, thi_truong_chung: M.r, nganh_so_thi_truong: l.S - M.r, rieng_doanh_nghiep: l.R - l.S, co_du_lieu_nganh: l.hasS, dong_gop_dong: l.dv, ty_trong_dau_ky: V0 ? l.v0 / V0 : 0 }; }),
    ma_da_co_bai_giai_ma: (window.TB_DECODED || []).filter(function (m) { return P.rows.some(function (r) { return r.sym === m; }); }),
    gia_dinh: 'Giữ đúng khối lượng hiện tại suốt kỳ; tiền mặt và dư nợ không đổi; nhóm ngành = trung bình các mã cùng ngành' };
  aiReset('nguyen-nhan');
  $('#cause-note').textContent = 'Từ ' + vnDate(M.d0) + ' đến ' + vnDate(M.d1) + ' (' + n + ' phiên). Giả định bạn giữ đúng khối lượng hiện tại suốt kỳ; tiền mặt và dư nợ không đổi.' + (short ? ' Một số mã chưa đủ lịch sử cho cả kỳ.' : '');

  var parts = [['Thị trường chung', cM, '#3b5b8a'], ['Nhóm ngành', cS, '#b4470a'], ['Riêng doanh nghiệp', cO, '#6b4fb8']];
  var mx = Math.max.apply(null, parts.map(function (p) { return Math.abs(p[1]); }).concat([1]));
  $('#decomp').innerHTML = '<div class="dc-rows"><div><span>Giá trị cổ phiếu thay đổi</span><b class="' + cls(dV) + '">' + money(dV, true) + '</b><span>' + pct(V0 ? dV / V0 : 0) + '</span></div>' +
    parts.map(function (p) { return '<div><span>Do ' + p[0].toLowerCase() + '</span><b class="' + cls(p[1]) + '">' + money(p[1], true) + '</b><span>' + pct(V0 ? p[1] / V0 : 0) + '</span></div>'; }).join('') + '</div>' +
    '<div style="margin-top:14px">' + parts.map(function (p) {
      var w = Math.abs(p[1]) / mx * 50;
      return '<div class="bar"><span>' + p[0] + '</span><span class="t" style="position:relative;height:12px"><i style="position:absolute;top:0;height:12px;background:' + p[2] + ';' + (p[1] < 0 ? 'right:50%;' : 'left:50%;') + 'width:' + w.toFixed(1) + '%"></i><i style="position:absolute;left:50%;top:-3px;width:1px;height:18px;background:#999;border-radius:0"></i></span><b class="' + cls(p[1]) + '">' + pct(V0 ? p[1] / V0 : 0, 1) + '</b></div>';
    }).join('') + '</div>' +
    (st.debt && nav0 > 0 ? '<p class="note" style="margin-top:8px">Đòn bẩy: cổ phiếu ' + (dV < 0 ? 'giảm ' : 'tăng ') + pct(Math.abs(dV / V0), 1, false) + ', nhưng tài sản ròng ' + (dV < 0 ? 'giảm ' : 'tăng ') + pct(Math.abs(dV / nav0), 1, false) + ' vì dư nợ margin ' + money(st.debt) + ' khuếch đại khoảng ' + nf(V0 / nav0, 2) + ' lần.</p>' : '');

  lines.sort(function (a, b) { return a.dv - b.dv; });
  $('#cause-tbl').innerHTML = '<thead><tr><th>Mã</th><th class="n">Biến động mã</th><th class="n">Thị trường chung</th><th class="n">Nhóm ngành so thị trường</th><th class="n">Riêng doanh nghiệp</th><th class="n">Đóng góp vào danh mục</th></tr></thead><tbody>' +
    lines.map(function (l) {
      return '<tr><td><span class="tk">' + l.r.sym + '</span><span class="sub">' + esc(l.r.sector) + (l.hasS ? '' : ' · chưa đủ dữ liệu ngành') + '</span></td><td class="n ' + cls(l.R) + '">' + pct(l.R) + '</td><td class="n ' + cls(M.r) + '">' + pct(M.r) + '</td>' +
        '<td class="n ' + cls(l.S - M.r) + '">' + pct(l.S - M.r) + '</td><td class="n ' + cls(l.R - l.S) + '">' + pct(l.R - l.S) + '</td><td class="n ' + cls(l.dv) + '">' + money(l.dv, true) + '</td></tr>';
    }).join('') + '</tbody>';

  // bằng chứng
  var ok = [], hy = [], miss = [];
  ok.push('VN-Index ' + (M.r < 0 ? 'giảm ' : 'tăng ') + pct(Math.abs(M.r), 1, false) + ' trong kỳ. Riêng phần thị trường chung đã làm danh mục ' + (cM < 0 ? 'mất ' : 'được ') + money(Math.abs(cM)) + '.');
  Object.keys(secRet).forEach(function (s) {
    var g = secRet[s] - M.r;
    if (Math.abs(g) >= 0.03) ok.push('Nhóm ' + esc(s) + ' ' + (g < 0 ? 'yếu hơn' : 'mạnh hơn') + ' thị trường ' + nf(Math.abs(g * 100), 1) + ' điểm % (tính trên ' + secUsed[s].join(', ') + ').');
  });
  lines.forEach(function (l) {
    var o = l.R - l.S;
    if (Math.abs(o) >= 0.05) ok.push('<b>' + l.r.sym + '</b> ' + (o < 0 ? 'yếu hơn' : 'mạnh hơn') + ' ngành của nó ' + nf(Math.abs(o * 100), 1) + ' điểm %.');
    if (o <= -0.05) hy.push('<b>' + l.r.sym + '</b> yếu hơn ngành: có thể do kết quả kinh doanh, tin riêng của doanh nghiệp, định giá đã cao hơn ngành, hoặc dòng tiền lớn rút ra. Cần đối chiếu báo cáo tài chính và tin công bố.');
  });
  Object.keys(secRet).forEach(function (s) { if (secRet[s] - M.r <= -0.03) hy.push('Nhóm ' + esc(s) + ' yếu hơn thị trường: có thể do chu kỳ ngành, chính sách hoặc dòng tiền xoay vòng sang nhóm khác. Đây là giả thuyết, chưa phải kết luận.'); });
  if (st.debt && nav0 > 0) ok.push('Margin khuếch đại biến động khoảng ' + nf(V0 / nav0, 2) + ' lần: thay đổi ' + pct(dV / V0, 1) + ' của cổ phiếu thành ' + pct(dV / nav0, 1) + ' của tài sản ròng.');
  var losers = lines.filter(function (l) { return l.dv < 0; }), tl = losers.reduce(function (a, l) { return a + l.dv; }, 0);
  if (losers.length >= 2 && tl < 0) {
    var t2 = losers.slice(0, 2), s2 = t2[0].dv + t2[1].dv;
    ok.push('Hai mã ' + t2.map(function (l) { return '<b>' + l.r.sym + '</b>'; }).join(' và ') + ' gây ra ' + pct(s2 / tl, 0, false) + ' tổng phần giảm trong kỳ: phân bổ vốn quyết định nhiều hơn số lượng mã.');
  }
  hy.push('Định giá: giá giảm có thể làm cổ phiếu rẻ hơn, hoặc phản ánh lợi nhuận sắp giảm. Chỉ biết khi so P/E, P/B với lợi nhuận dự kiến.');
  miss.push('Ngày mua và giá từng lần mua: phân tích đang giả định bạn giữ khối lượng hiện tại suốt kỳ.');
  var dec = P.rows.filter(function (r) { return (window.TB_DECODED || []).indexOf(r.sym) >= 0; }), notDec = P.rows.filter(function (r) { return (window.TB_DECODED || []).indexOf(r.sym) < 0; });
  if (dec.length) miss.push('Kết quả kinh doanh và định giá: Top Broker đã giải mã ' + dec.map(function (r) { return '<a href="../co-phieu/' + r.sym.toLowerCase() + '/index.html">' + r.sym + '</a>'; }).join(', ') + '.' + (notDec.length ? ' Chưa có cho ' + notDec.map(function (r) { return r.sym; }).join(', ') + '.' : ''));
  else miss.push('Kết quả kinh doanh và định giá của ' + notDec.map(function (r) { return r.sym; }).join(', ') + ': Top Broker chưa có bài giải mã.');
  var un = P.rows.filter(function (r) { return !secRet[r.sector]; });
  if (un.length) miss.push('Chưa có nhóm so sánh ngành cho ' + un.map(function (r) { return r.sym; }).join(', ') + ' (phần ngành đang tính bằng 0).');
  if (st.debt) miss.push('Lãi vay margin đã trả trong kỳ: chưa trừ vào kết quả.');
  miss.push('Mục tiêu, thời gian đầu tư và khả năng chịu lỗ của bạn: cùng một con số, mỗi người sẽ có lựa chọn khác nhau.');
  $('#ev-ok').innerHTML = ok.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  $('#ev-hy').innerHTML = hy.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  $('#ev-miss').innerHTML = miss.map(function (x) { return '<li>' + x + '</li>'; }).join('');
}

/* ---------- 3 · MÔ PHỎNG ---------- */
function initSim() {
  var sel = $('#sim-sym'), cur = sel.value;
  var rows = PORT.rows.slice().sort(function (a, b) { return a.plp - b.plp; });
  sel.innerHTML = rows.map(function (r) { return '<option value="' + r.sym + '">' + r.sym + ' · ' + pct(r.plp, 0) + ' so với giá vốn</option>'; }).join('');
  if (cur && PORT.rows.some(function (r) { return r.sym === cur; })) sel.value = cur;
  simDefaults(); sim();
}
function simDefaults() {
  var r = PORT.rows.filter(function (x) { return x.sym === $('#sim-sym').value; })[0];
  $('#sim-px').value = nf(r.p); $('#sim-buy').value = nf(Math.max(100, lot(r.qty * 0.3)));
  $('#sim-src').value = PORT.st.debt ? 'margin' : 'cash';
}
$('#sim-sym').addEventListener('change', function () { simDefaults(); sim(); });
$$('#sim-sell,#sim-buy,#sim-src,#sim-px,#sim-scope').forEach(function (el) { el.addEventListener('input', sim); el.addEventListener('change', sim); });

function scenarioNAV(o, sym, shock, scope) {
  var mv = 0;
  PORT.rows.forEach(function (r) {
    var q = r.sym === sym ? o.q : r.qty, p = r.sym === sym ? o.basePx : r.p;
    mv += q * p * (1 + (scope === 'all' || r.sym === sym ? shock : 0));
  });
  var assets = mv + o.cash;
  return { nav: assets - o.debt, rtt: assets ? (assets - o.debt) / assets : 1 };
}

function sim() {
  if (!PORT) return;
  var st = PORT.st, sym = $('#sim-sym').value, r = PORT.rows.filter(function (x) { return x.sym === sym; })[0];
  var px = toDong(parseNum($('#sim-px').value)) || r.p, sp = Math.min(100, Math.max(0, parseNum($('#sim-sell').value) || 0)) / 100;
  var bq = lot(parseNum($('#sim-buy').value) || 0), src = $('#sim-src').value, scope = $('#sim-scope').value;
  $('#sim-now').innerHTML = '<b>' + sym + '</b> hiện có ' + nf(r.qty) + ' cp, giá vốn ' + nf(r.cost) + ' đ, thị giá ' + nf(r.p) + ' đ (' + pct(r.plp) + '), chiếm ' + pct(r.w, 1, false) + ' giá trị cổ phiếu. Giao dịch đều làm tròn lô 100 cp; giá giả định ' + nf(px) + ' đ.';
  var mvOther = PORT.mv - r.mv;
  function sell(q, repay) {
    var gross = q * px, net = gross * (1 - st.fee - st.tax), realized = net - q * r.cost;
    var pay = repay ? Math.min(st.debt, net) : 0;
    return { q: r.qty - q, cost: r.qty - q > 0 ? r.cost : 0, cash: st.cash + net - pay, debt: st.debt - pay, realized: realized, fees: gross * (st.fee + st.tax), basePx: px };
  }
  var opts = [];
  opts.push({ k: 'hold', label: 'Giữ nguyên', o: { q: r.qty, cost: r.cost, cash: st.cash, debt: st.debt, realized: 0, fees: 0, basePx: px } });
  var sq = Math.min(r.qty, lot(r.qty * sp) || (sp > 0 && r.qty >= 100 ? 100 : 0));
  if (sq > 0 && sq < r.qty) {
    opts.push({ k: 'sell', label: 'Bán bớt ' + nf(sq) + ' cp, giữ tiền', o: sell(sq, false) });
    if (st.debt) opts.push({ k: 'sellpay', label: 'Bán bớt ' + nf(sq) + ' cp, trả nợ margin', o: sell(sq, true) });
  }
  opts.push({ k: 'all', label: 'Bán hết' + (st.debt ? ', trả nợ margin' : ', giữ tiền'), o: sell(r.qty, !!st.debt) });
  if (bq > 0) {
    var cost = bq * px * (1 + st.fee), fromCash = src === 'cash' ? Math.min(st.cash, cost) : 0, borrow = cost - fromCash;
    opts.push({ k: 'buy', label: 'Mua thêm ' + nf(bq) + ' cp' + (borrow > 0 ? (fromCash > 0 ? ' (thiếu tiền mặt, vay thêm ' + money(borrow) + ')' : ' bằng margin') : ' bằng tiền mặt'),
      o: { q: r.qty + bq, cost: (r.qty * r.cost + cost) / (r.qty + bq), cash: st.cash - fromCash, debt: st.debt + borrow, realized: 0, fees: bq * px * st.fee, basePx: px } });
  }
  opts.forEach(function (x) {
    var o = x.o, mv = mvOther + o.q * px, assets = mv + o.cash;
    o.mv = mv; o.nav = assets - o.debt; o.rtt = assets ? o.nav / assets : 1; o.w = mv ? o.q * px / mv : 0;
    o.unreal = o.q * (px - o.cost); o.dtc = dropToCall(mvOther, o.q, px, o.cash, o.debt, st.call);
  });
  LAST_SIM = { sym: sym, px: px, opts: opts, date: today() };
  var head = '<thead><tr><th></th>' + opts.map(function (x, i) { return '<th><b>' + esc(x.label) + '</b><button type="button" class="btn sm ghost pick" data-i="' + i + '">Chọn & ghi nhật ký</button></th>'; }).join('') + '</tr></thead>';
  function row(lbl, f) { return '<tr><td>' + lbl + '</td>' + opts.map(function (x) { return '<td>' + f(x.o) + '</td>'; }).join('') + '</tr>'; }
  $('#sim-tbl').innerHTML = head + '<tbody>' +
    row('Khối lượng ' + sym + ' còn lại', function (o) { return nf(o.q); }) +
    row('Giá vốn bình quân', function (o) { return o.q ? nf(o.cost) : '–'; }) +
    row('Lãi/lỗ đã chốt (sau phí, thuế)', function (o) { return '<span class="' + cls(o.realized) + '">' + (o.realized ? money(o.realized, true) : '0') + '</span>'; }) +
    row('Lãi/lỗ chưa chốt của ' + sym, function (o) { return o.q ? '<span class="' + cls(o.unreal) + '">' + money(o.unreal, true) + '</span>' : '–'; }) +
    row('Tiền mặt', function (o) { return money(o.cash); }) +
    row('Dư nợ margin', function (o) { return money(o.debt); }) +
    row('Tỷ trọng ' + sym + ' trong cổ phiếu', function (o) { return pct(o.w, 1, false); }) +
    row('Tài sản ròng', function (o) { return money(o.nav); }) +
    row('Tỷ lệ ký quỹ Rtt', function (o) { return o.debt ? pct(o.rtt, 1, false) : '–'; }) +
    row(sym + ' giảm bao nhiêu thì chạm ngưỡng gọi ký quỹ', function (o) { return dtcText(o.dtc); }) +
    '</tbody>';

  var shocks = [-0.3, -0.2, -0.1, 0, 0.1, 0.2];
  var sc = shocks.map(function (s) { return opts.map(function (x) { return scenarioNAV(x.o, sym, s, scope); }); });
  $('#sc-tbl').innerHTML = '<thead><tr><th>' + (scope === 'all' ? 'Cả danh mục' : sym) + ' đi tiếp</th>' + opts.map(function (x) { return '<th><b>' + esc(x.label) + '</b></th>'; }).join('') + '</tr></thead><tbody>' +
    sc.map(function (rw, i) {
      var best = Math.max.apply(null, rw.map(function (v) { return v.nav; }));
      return '<tr><td>' + (shocks[i] ? pct(shocks[i], 0) : 'Đứng giá') + '</td>' + rw.map(function (v) {
        var tag = PORT.st.debt || v.rtt < 1 ? (v.rtt < st.force ? ' <span class="dn">· giải chấp</span>' : v.rtt < st.call ? ' <span class="dn">· gọi ký quỹ</span>' : '') : '';
        return '<td class="' + (Math.abs(v.nav - best) < 1 && rw.length > 1 ? 'best' : '') + '">' + money(v.nav) + '<span class="sub ' + cls(v.nav - PORT.nav) + '">' + money(v.nav - PORT.nav, true) + ' so với hiện tại</span>' + tag + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';

  LAST_SC = { shocks: shocks, scope: scope, sc: sc };
  aiReset('mo-phong');
  var hold = opts[0], d20 = shocks.indexOf(-0.2), u20 = shocks.indexOf(0.2);
  $('#trade').innerHTML = opts.map(function (x, i) {
    var o = x.o, dn = sc[d20][i].nav - sc[d20][0].nav, up = sc[u20][i].nav - sc[u20][0].nav, t = [];
    if (x.k === 'hold') {
      t.push('Không tốn phí, không chốt lỗ, giữ nguyên cơ hội hồi phục.');
      t.push('Nếu ' + sym + ' giảm thêm 20%, tài sản ròng mất ' + money(PORT.nav - sc[d20][0].nav) + '.');
      if (o.debt) t.push('Rtt giữ nguyên ' + pct(o.rtt, 1, false) + '. ' + dtcSentence(o.dtc, sym));
    } else {
      if (o.realized) t.push((o.realized < 0 ? 'Chốt lỗ ' : 'Chốt lãi ') + money(Math.abs(o.realized)) + ' (đã gồm ' + money(o.fees) + ' phí, thuế).');
      if (x.k === 'buy') t.push('Giá vốn từ ' + nf(r.cost) + ' xuống ' + nf(o.cost) + ' đ: đẹp hơn trên giấy, nhưng tỷ trọng ' + sym + ' tăng lên ' + pct(o.w, 0, false) + (o.debt > st.debt ? ' và nợ tăng ' + money(o.debt - st.debt) : '') + '.');
      else t.push('Tỷ trọng ' + sym + ' từ ' + pct(r.w, 0, false) + ' còn ' + pct(o.w, 0, false) + (o.debt < st.debt ? '; nợ giảm ' + money(st.debt - o.debt) : '; tiền mặt tăng ' + money(o.cash - st.cash)) + '.');
      t.push('So với giữ nguyên: nếu giá giảm thêm 20% thì <span class="' + cls(dn) + '">' + money(dn, true) + '</span>; nếu tăng 20% thì <span class="' + cls(up) + '">' + money(up, true) + '</span>.');
      if (o.debt) t.push('Rtt ' + pct(o.rtt, 1, false) + '. ' + dtcSentence(o.dtc, sym));
    }
    return '<div><b>' + esc(x.label) + '</b>' + t.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>';
  }).join('');
}
$('#sim-tbl').addEventListener('click', function (e) {
  var b = e.target.closest('.pick'); if (!b || !LAST_SIM) return;
  openJournal(+b.getAttribute('data-i'));
});

/* ---------- 4 · NHẬT KÝ ---------- */
var J = load(JKEY, []), PENDING = null;
function openJournal(i) {
  var x = LAST_SIM.opts[i];
  PENDING = {
    id: Date.now().toString(36), date: today(), sym: LAST_SIM.sym, px: LAST_SIM.px, vni: PX.VNINDEX ? PX.VNINDEX.p : null,
    choice: x.label, k: x.k,
    opts: LAST_SIM.opts.map(function (y) { return { label: y.label, q: y.o.q, cash: y.o.cash, debt: y.o.debt }; }),
    navNow: PORT.nav, rtt: PORT.rtt
  };
  $('#jr-title').textContent = LAST_SIM.sym + ' · ' + x.label;
  var d = new Date(Date.now() + 7 * 3600 * 1000 + 30 * 86400000); $('#jr-review').value = d.toISOString().slice(0, 10);
  $('#jr-why').value = ''; $('#jr-watch').value = '';
  $('#jr-form').hidden = false; $('#nhat-ky').scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { $('#jr-why').focus(); }, 400);
}
$('#jr-cancel').addEventListener('click', function () { $('#jr-form').hidden = true; PENDING = null; });
$('#jr-form').addEventListener('submit', function (e) {
  e.preventDefault(); if (!PENDING) return;
  PENDING.why = $('#jr-why').value.trim();
  PENDING.watch = $('#jr-watch').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) { return { t: s, st: '?' }; });
  PENDING.review = $('#jr-review').value; PENDING.lesson = '';
  J.unshift(PENDING); store(JKEY, J); PENDING = null; $('#jr-form').hidden = true; renderJournal();
});
function renderJournal() {
  var box = $('#jr-list');
  if (!J.length) { box.innerHTML = '<p class="empty">Chưa có quyết định nào. Ở bước 3, bấm "Chọn & ghi nhật ký" dưới phương án bạn chọn.</p>'; return; }
  var syms = J.map(function (e) { return e.sym; }).concat(['VNINDEX']).filter(function (v, i, a) { return a.indexOf(v) === i; });
  var need = syms.filter(function (s) { return !PX[s]; });
  (need.length ? fetchQuotes(need).catch(function () {}) : Promise.resolve()).then(function () {
    box.innerHTML = J.map(function (e, idx) {
      var now = PX[e.sym] ? PX[e.sym].p : null, vn = PX.VNINDEX ? PX.VNINDEX.p : null, due = e.review && e.review <= today();
      var cmp = '';
      if (now) {
        var vals = e.opts.map(function (o) { return o.q * now + o.cash - o.debt; }), chosen = vals[e.opts.map(function (o) { return o.label; }).indexOf(e.choice)];
        cmp = '<div class="tw"><table class="bs-t"><thead><tr><th>Nếu khi đó chọn</th><th class="n">Tài sản ròng hôm nay so với lựa chọn của bạn</th></tr></thead><tbody>' +
          e.opts.map(function (o, i) { var dlt = vals[i] - chosen; return '<tr><td>' + esc(o.label) + (o.label === e.choice ? ' <b>(đã chọn)</b>' : '') + '</td><td class="n ' + cls(dlt) + '">' + (o.label === e.choice ? '–' : money(dlt, true)) + '</td></tr>'; }).join('') +
          '</tbody></table></div><p class="note">Số dương: phương án đó hôm nay cho tài sản ròng cao hơn lựa chọn của bạn; số âm: thấp hơn. Chỉ tính phần ' + e.sym + ', tiền mặt và dư nợ, theo giá ' + e.sym + ' hiện tại. Kết quả tốt hay xấu chưa nói lên quyết định đúng hay sai: hãy xem các giả định ở trên có đứng vững không.</p>';
      }
      return '<article class="jr" data-i="' + idx + '"><div class="jr-h"><b>' + e.sym + ' · ' + esc(e.choice) + '</b><span>' + vnDate(e.date) + (due ? ' <em class="due">Đến hạn xem lại</em>' : e.review ? ' · xem lại ' + vnDate(e.review) : '') + '</span></div>' +
        '<p>Giá lúc quyết định ' + nf(e.px) + ' đ' + (now ? ' → hôm nay ' + nf(now) + ' đ (<span class="' + cls(now - e.px) + '">' + pct(now / e.px - 1) + '</span>)' : '') +
        (e.vni && vn ? ' · VN-Index ' + nf(e.vni, 2) + ' → ' + nf(vn, 2) + ' (<span class="' + cls(vn - e.vni) + '">' + pct(vn / e.vni - 1) + '</span>)' : '') + '</p>' +
        (e.why ? '<p><b>Giả định ban đầu:</b> ' + esc(e.why) + '</p>' : '') +
        (e.watch && e.watch.length ? '<b>Điều kiện theo dõi</b><ul class="watch">' + e.watch.map(function (w, wi) {
          return '<li><select data-w="' + wi + '" aria-label="Trạng thái"><option value="?"' + (w.st === '?' ? ' selected' : '') + '>Chưa rõ</option><option value="y"' + (w.st === 'y' ? ' selected' : '') + '>Đang đúng</option><option value="n"' + (w.st === 'n' ? ' selected' : '') + '>Đã sai</option></select>' + esc(w.t) + '</li>';
        }).join('') + '</ul>' : '') + cmp +
        '<label>Bài học rút ra (điền khi xem lại)<textarea rows="2" class="lesson">' + esc(e.lesson || '') + '</textarea></label>' +
        '<div class="bs-row end" style="margin-top:0"><button type="button" class="btn sm ghost danger del">Xóa ghi chép này</button></div></article>';
    }).join('');
  });
}
$('#jr-list').addEventListener('change', function (e) {
  var a = e.target.closest('.jr'); if (!a) return; var en = J[+a.getAttribute('data-i')];
  if (e.target.hasAttribute('data-w')) en.watch[+e.target.getAttribute('data-w')].st = e.target.value;
  if (e.target.classList.contains('lesson')) en.lesson = e.target.value;
  store(JKEY, J);
});
$('#jr-list').addEventListener('input', function (e) {
  if (!e.target.classList.contains('lesson')) return;
  J[+e.target.closest('.jr').getAttribute('data-i')].lesson = e.target.value; store(JKEY, J);
});
$('#jr-list').addEventListener('click', function (e) {
  if (!e.target.classList.contains('del')) return;
  J.splice(+e.target.closest('.jr').getAttribute('data-i'), 1); store(JKEY, J); renderJournal();
});
$('#jr-export').addEventListener('click', function () {
  var blob = new Blob([JSON.stringify({ danhMuc: S, nhatKy: J, luc: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bac-si-danh-muc-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
});
$('#jr-import').addEventListener('change', function (e) {
  var f = e.target.files[0]; if (!f) return;
  f.text().then(function (t) {
    var d = JSON.parse(t);
    if (d.danhMuc) { S = d.danhMuc; store(KEY, S); renderInputs(); }
    if (Array.isArray(d.nhatKy)) { J = d.nhatKy; store(JKEY, J); renderJournal(); }
  }).catch(function () { alert('File không đúng định dạng bản sao lưu.'); });
});

/* ---------- AI diễn giải ---------- */
var AI_API = (location.protocol === 'file:' ? 'https://topbroker.fun' : '') + '/api/ai';
var AI_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" fill="currentColor"/></svg>';
var AI_TITLE = { 'kham': 'AI đọc kết quả khám', 'nguyen-nhan': 'AI đọc nguyên nhân', 'mo-phong': 'AI đọc các phương án' };
function r3(x) { return typeof x === 'number' ? Math.round(x * 1000) / 1000 : x; }
function aiPayload(step) {
  if (!PORT) return null;
  var st = PORT.st;
  if (step === 'kham') {
    var d = dropAllToCall(PORT.mv, st.cash, st.debt, st.call);
    return { tong: { gia_tri_co_phieu: Math.round(PORT.mv), gia_von: Math.round(PORT.cv), lai_lo_chua_chot: Math.round(PORT.mv - PORT.cv), lai_lo_pct: r3((PORT.mv - PORT.cv) / PORT.cv),
        tien_mat: st.cash, du_no_margin: st.debt, tai_san_rong: Math.round(PORT.nav), rtt: st.debt ? r3(PORT.rtt) : null, nguong_goi_ky_quy: st.call, nguong_giai_chap: st.force,
        don_bay_lan: st.debt ? r3(PORT.lev) : 1, ca_danh_muc_giam_them_thi_cham_nguong_goi: d.t === 'x' ? r3(d.x) : d.t },
      tung_ma: PORT.rows.map(function (r) { return { ma: r.sym, nganh: r.sector, khoi_luong: r.qty, gia_von: Math.round(r.cost), thi_gia: r.p, gia_tri: Math.round(r.mv), ty_trong: r3(r.w), lai_lo_pct: r3(r.plp), bien_dong_hom_nay: r.ref ? r3(r.p / r.ref - 1) : null }; }),
      ty_trong_nganh: PORT.sectors, canh_bao_theo_cong_thuc: $$('#flags li').map(function (li) { return li.textContent; }),
      ma_da_co_bai_giai_ma: (window.TB_DECODED || []).filter(function (m) { return PORT.rows.some(function (r) { return r.sym === m; }); }) };
  }
  if (step === 'nguyen-nhan') return LAST_CAUSE;
  if (step === 'mo-phong' && LAST_SIM && LAST_SC) {
    var r = PORT.rows.filter(function (x) { return x.sym === LAST_SIM.sym; })[0];
    return { ma: LAST_SIM.sym, hien_tai: { khoi_luong: r.qty, gia_von: Math.round(r.cost), thi_gia: r.p, lai_lo_pct: r3(r.plp), ty_trong: r3(r.w), tai_san_rong: Math.round(PORT.nav), rtt: st.debt ? r3(PORT.rtt) : null, du_no: st.debt, tien_mat: st.cash },
      gia_gia_dinh_giao_dich: LAST_SIM.px, phi_giao_dich: st.fee, thue_ban: st.tax, nguong_goi_ky_quy: st.call, nguong_giai_chap: st.force,
      phuong_an: LAST_SIM.opts.map(function (x) { var o = x.o; return { ten: x.label, khoi_luong_con: o.q, gia_von_binh_quan: Math.round(o.cost), lai_lo_da_chot: Math.round(o.realized), lai_lo_chua_chot: Math.round(o.unreal), tien_mat: Math.round(o.cash), du_no: Math.round(o.debt), ty_trong_ma: r3(o.w), tai_san_rong: Math.round(o.nav), rtt: o.debt ? r3(o.rtt) : null, ma_giam_them_thi_cham_nguong_goi: o.dtc.t === 'x' ? r3(o.dtc.x) : o.dtc.t }; }),
      kich_ban: { pham_vi: LAST_SC.scope === 'all' ? 'cả danh mục cùng biến động' : 'chỉ mã này biến động',
        bang: LAST_SC.shocks.map(function (sh, i) { return { bien_dong_gia: sh, tai_san_rong_tung_phuong_an: LAST_SC.sc[i].map(function (v) { return Math.round(v.nav); }), rtt_tung_phuong_an: LAST_SC.sc[i].map(function (v) { return r3(v.rtt); }) }; }) } };
  }
  return null;
}
function aiReset(step) {
  var box = $('#ai-' + step); if (!box) return;
  box.innerHTML = '<div class="ai-h"><h3>' + AI_ICON + AI_TITLE[step] + '</h3><button type="button" class="btn ai-go">Nhờ AI diễn giải</button></div>' +
    '<p class="consent">AI chỉ đọc các con số đã tính ở trên, giải thích chúng nghĩa là gì và nêu những câu hỏi bạn nên tự kiểm tra. AI không khuyên mua, bán hay giữ. Bấm nút là đồng ý gửi bản tóm tắt số liệu (không có tên, số tài khoản) để AI đọc; dữ liệu không được lưu lại.</p>';
}
function li(a) { return a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
function aiRun(step) {
  var box = $('#ai-' + step), data = aiPayload(step);
  if (!data) { box.querySelector('.consent').textContent = 'Chưa có số liệu cho bước này. Hãy khám danh mục trước.'; return; }
  var btn = box.querySelector('.ai-go'); btn.disabled = true;
  var ld = document.createElement('div'); ld.className = 'load'; ld.innerHTML = '<i></i>AI đang đọc số liệu, mất khoảng 10–20 giây…'; box.appendChild(ld);
  var old = box.querySelector('.err'); if (old) old.remove();
  fetch(AI_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buoc: step, so_lieu: data }) })
    .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error || 'Lỗi') + (j.code ? ' (mã ' + j.code + (j.detail ? ': ' + j.detail : '') + ')' : '')); return j; }); })
    .then(function (j) {
      box.innerHTML = '<div class="ai-h"><h3>' + AI_ICON + AI_TITLE[step] + '</h3><button type="button" class="btn sm ghost ai-go">Diễn giải lại</button></div>' +
        (j.tom_tat ? '<p class="tt">' + esc(j.tom_tat) + '</p>' : '') +
        '<div class="ai-grid">' +
        (j.dien_giai.length ? '<div class="a"><h4>Số liệu nói gì</h4><ul>' + li(j.dien_giai) + '</ul></div>' : '') +
        (j.gia_thuyet.length ? '<div class="b"><h4>Mới là giả thuyết</h4><ul>' + li(j.gia_thuyet) + '</ul></div>' : '') +
        (j.cau_hoi.length ? '<div class="c"><h4>Câu hỏi bạn nên tự kiểm tra</h4><ul>' + li(j.cau_hoi) + '</ul></div>' : '') +
        (j.thieu_du_lieu.length ? '<div class="d"><h4>Còn thiếu dữ liệu</h4><ul>' + li(j.thieu_du_lieu) + '</ul></div>' : '') +
        '</div><p class="meta">Diễn giải bởi AI (' + esc(j.model || 'Claude') + ') dựa trên số liệu đã tính. AI có thể sai; quyết định cuối cùng là của bạn.</p>';
    })
    .catch(function (e) {
      ld.remove(); btn.disabled = false;
      var er = document.createElement('p'); er.className = 'err'; er.textContent = (e.message || 'Chưa gọi được AI.') + ' Trong lúc chờ, bạn xem phần ghi chú tự động bên dưới.'; box.appendChild(er);
    });
}
document.addEventListener('click', function (e) { var b = e.target.closest('.ai-go'); if (!b) return; aiRun(b.closest('.ai').getAttribute('data-step')); });

/* ---------- thanh bước ---------- */
function updateSteps() {
  $$('.bs-steps a').forEach(function (a) { var s = $('#' + a.getAttribute('data-step')); a.classList.toggle('off', !!(s && s.hidden)); });
}
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) $$('.bs-steps a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-step') === en.target.id); }); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('.bs-sec').forEach(function (s) { io.observe(s); });
}

renderInputs(); updateSteps(); renderJournal();
if (S.rows.some(function (r) { return r.sym && r.qty && r.cost; })) $('#in-msg').textContent = 'Đã khôi phục danh mục lần trước trên máy này. Bấm "Khám danh mục" để cập nhật giá.';
})();
