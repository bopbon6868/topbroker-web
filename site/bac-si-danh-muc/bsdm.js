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
function fmtInt(n) { return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',') ; }
function dispNum(v) { var n = parseNum(v); return v !== '' && v != null && isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9 && n >= 1000 ? fmtInt(n) : (v == null ? '' : v); }
/* Ô nhập số: tự thêm dấu phẩy ngăn cách hàng nghìn khi gõ (1,000,000) */
var NUMSEL = '#in-tbl .qty, #in-tbl .cost, #cash, #debt, #sim-px, #pd-guess, #pd-dep-m, input[data-qk]';
document.addEventListener('input', function (e) {
  var t = e.target; if (!t.matches || !t.matches(NUMSEL)) return;
  var v = t.value; if (!/^[\d,]*$/.test(v)) return;
  var caret = t.selectionStart == null ? v.length : t.selectionStart, before = v.slice(0, caret).replace(/,/g, '').length, raw = v.replace(/,/g, '').replace(/^0+(?=\d)/, '');
  if (!raw) { t.value = ''; return; }
  var nv = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ','); if (nv === v) return;
  t.value = nv;
  var pos = 0, cnt = 0; while (pos < nv.length && cnt < before) { if (nv[pos] !== ',') cnt++; pos++; }
  try { t.setSelectionRange(pos, pos); } catch (er) {}
}, true);
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
var S = load(KEY, { rows: [], cash: '', debt: '', call: '40', force: '30', fee: '0,15', tax: '0,1', apprtt: '' });
var PX = {}, HIST = {}, PORT = null, LAST_SIM = null, LAST_CAUSE = null, LAST_SC = null;
var SECTOR_NAMES = Object.keys(window.TB_SECTORS || {}).concat(['Khác']);

/* ---------- NHẬP ---------- */
function rowHTML(r) {
  var opts = SECTOR_NAMES.map(function (n) { return '<option' + (n === r.sector ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('');
  return '<tr><td data-l="Mã"><input aria-label="Mã" class="sym" placeholder="VD: HPG" value="' + esc(r.sym) + '" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false"></td>' +
    '<td data-l="Khối lượng"><input aria-label="Khối lượng" class="qty" inputmode="numeric" placeholder="1,000" value="' + esc(dispNum(r.qty)) + '"></td>' +
    '<td data-l="Giá vốn (đ)"><input aria-label="Giá vốn" class="cost" inputmode="decimal" placeholder="25,000" value="' + esc(dispNum(r.cost)) + '"></td>' +
    '<td data-l="Giá hiện tại" class="lv-px" aria-live="polite"><span class="lv">–</span></td>' +
    '<td data-l="Lãi/lỗ hiện tại" class="lv-pl" aria-live="polite"><span class="lv">–</span></td>' +
    '<td data-l="Ngành"><select aria-label="Ngành" class="sec">' + opts + '</select></td>' +
    '<td><button type="button" class="x" aria-label="Xóa dòng">×</button></td></tr>';
}
function renderInputs() {
  var tb = $('#in-tbl tbody');
  if (!S.rows.length) S.rows = [{ sym: '', qty: '', cost: '', sector: 'Khác' }];
  tb.innerHTML = S.rows.map(rowHTML).join('');
  liveSoon(0);
  ['cash', 'debt', 'call', 'force', 'fee', 'tax', 'apprtt'].forEach(function (k) { $('#' + k).value = S[k] == null ? '' : (k === 'cash' || k === 'debt' ? dispNum(S[k]) : S[k]); });
}
function readInputs() {
  S.rows = $$('#in-tbl tbody tr').map(function (tr) {
    return { sym: $('.sym', tr).value.trim().toUpperCase(), qty: $('.qty', tr).value.trim(), cost: $('.cost', tr).value.trim(), sector: $('.sec', tr).value };
  });
  ['cash', 'debt', 'call', 'force', 'fee', 'tax', 'apprtt'].forEach(function (k) { S[k] = $('#' + k).value.trim(); });
  store(KEY, S);
}
$('#in-tbl').addEventListener('input', function (e) {
  if (e.target.classList.contains('sym')) {
    var tr = e.target.closest('tr'), v = e.target.value.trim().toUpperCase(), s = sectorOf(v);
    if (v.length >= 3 && s !== 'Khác') $('.sec', tr).value = s;
  }
  readInputs(); liveSoon(600);
});
$('#in-tbl').addEventListener('change', function () { readInputs(); liveSoon(0); });
$('#in-tbl').addEventListener('click', function (e) {
  if (!e.target.classList.contains('x')) return;
  e.target.closest('tr').remove(); readInputs(); if (!S.rows.length) renderInputs(); liveSoon(0);
});
$$('#cash,#debt,#call,#force,#fee,#tax,#apprtt').forEach(function (el) { el.addEventListener('input', readInputs); });
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
    { sym: 'HPG', qty: '2,000', cost: '28,500', sector: 'Thép' },
    { sym: 'VPB', qty: '3,000', cost: '22,000', sector: 'Ngân hàng' },
    { sym: 'NVL', qty: '5,000', cost: '15,000', sector: 'Bất động sản' },
    { sym: 'SSI', qty: '2,000', cost: '38,000', sector: 'Chứng khoán' },
    { sym: 'MWG', qty: '500', cost: '68,000', sector: 'Bán lẻ' }
  ], cash: '20,000,000', debt: '150,000,000', call: '40', force: '30', fee: '0,15', tax: '0,1' };
  store(KEY, S); renderInputs();
  $('#in-msg').textContent = 'Đây là danh mục mẫu để xem thử, không phải danh mục thật của ai.';
});
$('#clear').addEventListener('click', function () {
  S.rows = []; S.cash = ''; S.debt = ''; S.apprtt = ''; store(KEY, S); renderInputs();
  lockStages(true); $('#ket-qua').hidden = true; $('#deep').hidden = true; $('#deep-gate').hidden = true; $('#ocr-res').hidden = true;
});

/* ---------- NHẬP BẰNG ẢNH (thành viên có mã, anh Hải chốt 18/10/2026) ---------- */
var MKEY = 'tb-member-v1', MB_API = (location.protocol === 'file:' ? 'https://topbroker.fun' : '') + '/api/thanh-vien', OCR_API = (location.protocol === 'file:' ? 'https://topbroker.fun' : '') + '/api/doc-anh';
var MB = load(MKEY, null), SHOTS = [null, null];
function setTab(t) {
  $('#t-tay').setAttribute('aria-selected', String(t === 'tay')); $('#t-anh').setAttribute('aria-selected', String(t === 'anh'));
  $('#tab-tay').hidden = t !== 'tay'; $('#tab-anh').hidden = t !== 'anh';
  if (t === 'anh') mbShow();
}
$('#t-tay').addEventListener('click', function () { setTab('tay'); });
$('#t-anh').addEventListener('click', function () { setTab('anh'); });
function mbShow() {
  var ok = !!(MB && MB.code);
  $('#mb-gate').hidden = ok; $('#mb-up').hidden = !ok;
  if (ok) { $('#mb-me').textContent = MB.code; $('#mb-left').textContent = MB.left == null ? 'đang kiểm tra lượt…' : 'còn ' + MB.left + ' lượt đọc ảnh hôm nay'; if (!MB.checked) mbCheck(MB.code, true); }
  ocrReady();
}
function mbCheck(code, silent, msgSel) {
  var M = $(msgSel || '#mb-msg');
  code = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^TB-[A-Z0-9]{4,10}$/.test(code)) { M.textContent = 'Mã có dạng TB-XXXXXX (chữ và số).'; return Promise.resolve(false); }
  if (!silent) M.textContent = 'Đang kiểm tra mã…';
  return getJSON(MB_API + '?code=' + encodeURIComponent(code)).then(function (j) {
    if (j.ok) { MB = { code: code, ten: j.ten || '', left: j.con_lai, checked: true }; store(MKEY, { code: code, ten: j.ten || '' }); M.textContent = ''; mbShow(); meBar(); return true; }
    if (silent) { MB = null; store(MKEY, null); mbShow(); mbRevoked(j.error); meBar(); }
    M.textContent = j.error || 'Mã chưa đúng.'; return false;
  }).catch(function () { M.textContent = 'Chưa kiểm tra được mã (mạng hoặc máy chủ đang lỗi). Thử lại sau ít phút.'; if (MB) { MB.checked = true; mbShow(); } return !!(MB && MB.code); });
}
/* Mã đã lưu nhưng bị khóa/xóa: đóng phần chuyên sâu, hiện cổng nhập mã */
function mbRevoked(err) { if (!$('#deep').hidden) { $('#deep').hidden = true; $('#deep-gate').hidden = false; $('#dg-msg').textContent = err || 'Mã thành viên không còn dùng được.'; } }
$('#mb-check').addEventListener('click', function () { mbCheck($('#mb-code').value); });
$('#mb-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); mbCheck($('#mb-code').value); } });
function meBar() { try { if (window.TB && TB.renderMe) TB.renderMe(); } catch (e) {} }
/* Thoát từ góc phải đầu trang (site.js phát sự kiện tb-member-out) */
window.addEventListener('tb-member-out', function () { MB = null; $('#mb-code').value = ''; mbShow(); mbRevoked('Đã thoát mã thành viên. Nhập mã để mở lại phần khám chuyên sâu.'); });
$('#mb-out').addEventListener('click', function () { MB = null; store(MKEY, null); meBar(); $('#mb-code').value = ''; mbShow(); mbRevoked('Đã thoát mã thành viên. Nhập mã để mở lại phần khám chuyên sâu.'); });
/* Thu nhỏ ảnh trên máy trước khi gửi: cạnh dài tối đa 2000px, JPEG 0,85 */
function shrink(file) {
  return new Promise(function (ok, bad) {
    var fr = new FileReader();
    fr.onerror = bad;
    fr.onload = function () {
      var im = new Image();
      im.onerror = function () { bad(new Error('Không mở được ảnh')); };
      im.onload = function () {
        var k = Math.min(1, 2000 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
        var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
        var url = cv.toDataURL('image/jpeg', 0.85);
        ok({ type: 'image/jpeg', data: url.split(',')[1], url: url });
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function ocrReady() { $('#ocr-go').disabled = !(MB && MB.code && SHOTS[0] || MB && MB.code && SHOTS[1]) || (MB && MB.left === 0); }
$$('.mb-slots .slot').forEach(function (sl) {
  var i = +sl.getAttribute('data-i'), inp = $('input', sl), img = $('img', sl), rm = $('.rm', sl);
  inp.addEventListener('change', function () {
    var f = inp.files[0]; if (!f) return;
    $('#ocr-msg').textContent = 'Đang chuẩn bị ảnh…';
    shrink(f).then(function (o) { SHOTS[i] = o; img.src = o.url; img.hidden = false; rm.hidden = false; sl.classList.add('has'); $('#ocr-msg').textContent = ''; ocrReady(); })
      .catch(function () { $('#ocr-msg').textContent = 'Không mở được ảnh này. Thử ảnh chụp màn hình JPG hoặc PNG.'; });
  });
  rm.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); SHOTS[i] = null; img.hidden = true; img.removeAttribute('src'); rm.hidden = true; inp.value = ''; sl.classList.remove('has'); ocrReady(); });
});
$('#ocr-go').addEventListener('click', function () {
  var imgs = SHOTS.filter(Boolean).map(function (o) { return { type: o.type, data: o.data }; });
  if (!imgs.length || !MB) return;
  var btn = $('#ocr-go'), msg = $('#ocr-msg'); btn.disabled = true; msg.innerHTML = '<span class="spin"></span>AI đang đọc ảnh, mất khoảng 10–30 giây…';
  fetch(OCR_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: MB.code, images: imgs }) })
    .then(function (r) { return r.text(); }).then(function (t) { var j = JSON.parse(t.trim() || '{}'); if (j.con_lai != null) MB.left = j.con_lai; if (j.member === false) { MB = null; store(MKEY, null); } if (j.error) throw new Error(j.error); return j; })
    .then(function (j) { msg.textContent = ''; ocrApply(j); })
    .catch(function (e) { msg.textContent = (e.message || 'Chưa đọc được ảnh.'); mbShow(); })
    .then(function () { ocrReady(); if (MB) $('#mb-left').textContent = 'còn ' + MB.left + ' lượt đọc ảnh hôm nay'; });
});
function ocrApply(j) {
  readInputs();
  var had = S.rows.filter(function (r) { return r.sym; }).length;
  var rows = (j.rows || []).map(function (r) { return { sym: r.sym, qty: fmtInt(r.qty), cost: r.cost ? fmtInt(Math.round(toDong(r.cost))) : '', sector: sectorOf(r.sym), ai: 1 }; });
  if (rows.length) S.rows = rows;
  if (j.cash != null) S.cash = fmtInt(j.cash);
  if (j.debt != null) S.debt = fmtInt(j.debt); else if (rows.length) S.debt = S.debt || '';
  if (j.rtt != null && j.rtt > 0 && j.rtt < 1000) S.apprtt = String(j.rtt).replace('.', ',');
  store(KEY, S); renderInputs(); setTab('tay');
  $$('#in-tbl tbody tr').forEach(function (tr, i) { if (S.rows[i] && S.rows[i].ai) { tr.classList.add('ai'); if (!S.rows[i].cost) { var c = $('.cost', tr); c.classList.add('need'); c.placeholder = 'Điền giá vốn'; } } });
  var noCost = rows.filter(function (r) { return !r.cost; }).map(function (r) { return r.sym; });
  var box = $('#ocr-res');
  box.innerHTML = '<b>AI đã đọc ' + rows.length + ' mã' + (j.cash != null ? ', tiền mặt ' + money(j.cash) : '') + (j.debt != null ? ', dư nợ ' + money(j.debt) : '') + (j.rtt != null ? ', tỷ lệ ký quỹ ' + nf(j.rtt, 1) + '%' : '') + '.</b> ' +
    'Soát lại từng dòng đánh dấu vàng ở bảng dưới (AI có thể đọc nhầm số), sửa nếu sai, rồi bấm <b>Bắt đầu khám</b>.' +
    (had && rows.length ? ' Bảng cũ (' + had + ' mã) đã được thay bằng số đọc từ ảnh.' : '') +
    (noCost.length ? '<br><b>Chưa đọc được giá vốn:</b> ' + noCost.join(', ') + '. Điền tay giúp nhé.' : '') +
    (j.debt == null ? '<br>Không thấy dư nợ trong ảnh: nếu bạn có vay margin, chụp thêm màn hình tài sản hoặc điền tay.' : '') +
    ((j.notes || []).length ? '<ul>' + j.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '');
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
if (MB && MB.code) { MB.checked = false; mbCheck(MB.code, true); }

/* ---------- Giá hiện tại và lãi/lỗ ngay trong bảng nhập (anh Hải yêu cầu 21/10/2026) ---------- */
var LV_T = null, LV_BAD = {};
function liveSoon(ms) { clearTimeout(LV_T); LV_T = setTimeout(liveFetch, ms); }
function liveFetch() {
  var syms = S.rows.map(function (r) { return r.sym; }).filter(function (s, i, a) { return /^[A-Z0-9]{3,8}$/.test(s) && a.indexOf(s) === i; });
  var need = syms.filter(function (s) { return !PX[s] && !LV_BAD[s]; });
  liveRender();
  if (!need.length) return;
  $$('#in-tbl tbody tr').forEach(function (tr) { var s = $('.sym', tr).value.trim().toUpperCase(); if (need.indexOf(s) >= 0) $('.lv-px .lv', tr).textContent = 'đang lấy giá…'; });
  fetchQuotes(need).then(function () { need.forEach(function (s) { if (!PX[s]) LV_BAD[s] = 1; }); }, function () {}).then(liveRender);
}
function liveRender() {
  var tv = 0, tc = 0, n = 0, ts = 0;
  $$('#in-tbl tbody tr').forEach(function (tr) {
    var s = $('.sym', tr).value.trim().toUpperCase(), q = parseNum($('.qty', tr).value), c = toDong(parseNum($('.cost', tr).value));
    var px = $('.lv-px .lv', tr), pl = $('.lv-pl .lv', tr), X = PX[s];
    if (!/^[A-Z0-9]{3,8}$/.test(s)) { px.textContent = '–'; pl.textContent = '–'; pl.className = 'lv'; return; }
    if (!X) { px.textContent = LV_BAD[s] ? 'không lấy được giá' : '–'; pl.textContent = '–'; pl.className = 'lv'; return; }
    var chg = X.ref ? X.p / X.ref - 1 : null;
    px.innerHTML = '<b>' + nf(X.p) + '</b>' + (chg != null ? ' <small class="' + cls(chg) + '" title="So với giá tham chiếu hôm nay">' + pct(chg, 1) + '</small>' : '');
    ts = Math.max(ts, X.t || 0);
    if (q > 0 && c > 0) {
      var v = q * (X.p - c); tv += q * X.p; tc += q * c; n++;
      pl.className = 'lv ' + cls(v); pl.innerHTML = '<b>' + money(v, true) + '</b> <small>' + pct(X.p / c - 1, 1) + '</small>';
    } else { pl.className = 'lv'; pl.textContent = 'nhập KL, giá vốn'; }
  });
  var sum = $('#in-sum');
  if (sum) sum.innerHTML = n ? 'Tổng ' + n + ' mã: giá trị <b>' + money(tv) + '</b>, ' + (tv >= tc ? 'lãi' : 'lỗ') + ' <b class="' + cls(tv - tc) + '">' + money(Math.abs(tv - tc)) + ' (' + pct(tv / tc - 1, 1) + ')</b> so với giá vốn. Giá lúc ' + hm(ts) + ', trễ 15 phút, nguồn VNDirect.' : '';
}

/* ---------- lấy giá ---------- */
function getJSON(url) { return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
function fetchQuotes(syms) {
  return getJSON(API + '?s=' + syms.join(',')).then(function (j) {
    Object.keys(j.q || {}).forEach(function (s) { var q = j.q[s]; PX[s] = { p: s === 'VNINDEX' ? q.p : q.p * 1000, ref: q.ref == null ? null : (s === 'VNINDEX' ? q.ref : q.ref * 1000), t: q.t, x: q.x || null }; });
    return j;
  });
}
var HPEND = {};
function fetchHist(syms) {
  var need = syms.filter(function (s) { return !HIST[s] && !HPEND[s]; }), chunks = [], wait = syms.filter(function (s) { return HPEND[s]; }).map(function (s) { return HPEND[s]; });
  for (var i = 0; i < need.length; i += 20) chunks.push(need.slice(i, i + 20));
  return Promise.all(wait.concat(chunks.map(function (c) {
    var pr = getJSON(API + '?s=' + c.join(',') + '&h=400').then(function (j) {
      Object.keys(j.h || {}).forEach(function (s) { HIST[s] = j.h[s]; });
    }).catch(function () {}).then(function () { c.forEach(function (s) { delete HPEND[s]; }); });
    c.forEach(function (s) { HPEND[s] = pr; });
    return pr;
  })));
}

/* ---------- XÉT NGHIỆM: chỉ báo kỹ thuật (tính từ lịch sử giá ngày) ---------- */
function sma(a, n) { var o = new Array(a.length).fill(null), s = 0; for (var i = 0; i < a.length; i++) { s += a[i]; if (i >= n) s -= a[i - n]; if (i >= n - 1) o[i] = s / n; } return o; }
function ema(a, n) {
  var o = new Array(a.length).fill(null), k = 2 / (n + 1), st = -1;
  for (var i = 0; i < a.length; i++) { if (a[i] == null) continue; if (st < 0) st = i; if (i - st === n - 1) { var s = 0; for (var j = st; j <= i; j++) s += a[j]; o[i] = s / n; } else if (i - st >= n) o[i] = a[i] * k + o[i - 1] * (1 - k); }
  return o;
}
function wilder(a, n, start) { var o = new Array(a.length).fill(null), s = 0; for (var i = start; i < a.length; i++) { if (i < start + n) { s += a[i]; if (i === start + n - 1) o[i] = s / n; } else o[i] = (o[i - 1] * (n - 1) + a[i]) / n; } return o; }
function techOf(sym) {
  var h = HIST[sym]; if (!h || !h.c || h.c.length < 30) return null;
  var c = h.c, n = c.length, L = n - 1, T = { n: n, d: h.t[L], p: c[L] };
  [20, 50, 200].forEach(function (m) { if (n >= m) { var s = sma(c, m); T['ma' + m] = s[L]; T['ma' + m + 'p'] = s[Math.max(0, L - 5)]; } });
  // RSI 14 (Wilder)
  var up = [0], dn = [0]; for (var i = 1; i < n; i++) { var d = c[i] - c[i - 1]; up.push(Math.max(d, 0)); dn.push(Math.max(-d, 0)); }
  if (n > 15) { var au = wilder(up, 14, 1), ad = wilder(dn, 14, 1); T.rsi = ad[L] === 0 ? 100 : 100 - 100 / (1 + au[L] / ad[L]); }
  // MACD 12-26-9
  if (n >= 35) {
    var e12 = ema(c, 12), e26 = ema(c, 26), mc = c.map(function (_, i) { return e12[i] != null && e26[i] != null ? e12[i] - e26[i] : null; }), sg = ema(mc, 9);
    T.macd = mc[L]; T.sig = sg[L]; T.hist = mc[L] - sg[L];
    for (var k = L; k > L - 6 && k > 0; k--) { if (sg[k - 1] == null) break; var a1 = mc[k] - sg[k], a0 = mc[k - 1] - sg[k - 1]; if (a1 > 0 && a0 <= 0) { T.cross = { t: 'up', ago: L - k }; break; } if (a1 < 0 && a0 >= 0) { T.cross = { t: 'dn', ago: L - k }; break; } }
  }
  // ADX 14 (cần giá cao/thấp)
  if (h.h && h.l && h.h.length === n && n > 30) {
    var tr = [0], pdm = [0], mdm = [0];
    for (var j = 1; j < n; j++) { var um = h.h[j] - h.h[j - 1], dm = h.l[j - 1] - h.l[j]; pdm.push(um > dm && um > 0 ? um : 0); mdm.push(dm > um && dm > 0 ? dm : 0); tr.push(Math.max(h.h[j] - h.l[j], Math.abs(h.h[j] - c[j - 1]), Math.abs(h.l[j] - c[j - 1]))); }
    var atr = wilder(tr, 14, 1), sp = wilder(pdm, 14, 1), sm = wilder(mdm, 14, 1), dx = [];
    for (var z = 0; z < n; z++) { if (atr[z] == null || !atr[z]) { dx.push(null); continue; } var pd = 100 * sp[z] / atr[z], md = 100 * sm[z] / atr[z]; dx.push(pd + md ? 100 * Math.abs(pd - md) / (pd + md) : 0); if (z === L) { T.pdi = pd; T.mdi = md; } }
    var first = dx.findIndex(function (v) { return v != null; }), ax = wilder(dx.map(function (v) { return v == null ? 0 : v; }), 14, first);
    T.adx = ax[L];
  }
  return T;
}
/* Đọc chỉ báo thành lời: chỉ mô tả, không khuyến nghị */
function techRead(T) {
  if (!T) return null;
  var p = T.p, R = [], sc = 0, lv = [];
  var mas = [20, 50, 200].filter(function (m) { return T['ma' + m]; }), above = mas.filter(function (m) { return p >= T['ma' + m]; });
  if (mas.length) {
    sc += above.length - mas.length / 2;
    R.push(above.length === mas.length ? 'Giá nằm trên cả ' + mas.map(function (m) { return 'MA' + m; }).join(', ') + ': xu hướng tăng ở mọi khung đang giữ.'
      : !above.length ? 'Giá nằm dưới cả ' + mas.map(function (m) { return 'MA' + m; }).join(', ') + ': xu hướng giảm ở mọi khung.'
      : 'Giá trên ' + above.map(function (m) { return 'MA' + m; }).join(', ') + ' nhưng dưới ' + mas.filter(function (m) { return above.indexOf(m) < 0; }).map(function (m) { return 'MA' + m; }).join(', ') + ': xu hướng các khung đang lệch nhau.');
    if (T.ma50 && T.ma200) R.push('MA50 ' + (T.ma50 > T.ma200 ? 'nằm trên' : 'nằm dưới') + ' MA200: nền trung – dài hạn ' + (T.ma50 > T.ma200 ? 'đang tích cực' : 'đang tiêu cực') + '.');
  }
  if (T.rsi != null) {
    var r = Math.round(T.rsi);
    if (T.rsi >= 70) { R.push('RSI ' + r + ': vùng quá mua theo quy ước (trên 70). Giá đã lên nhanh, dễ có nhịp nghỉ; trong xu hướng mạnh RSI có thể ở cao khá lâu.'); }
    else if (T.rsi <= 30) { R.push('RSI ' + r + ': vùng quá bán theo quy ước (dưới 30). Giá đã giảm nhanh, có thể hồi kỹ thuật nhưng chưa phải tín hiệu đảo chiều.'); }
    else { sc += T.rsi >= 50 ? 0.5 : -0.5; R.push('RSI ' + r + ': ' + (T.rsi >= 50 ? 'động lượng nghiêng về bên mua.' : 'động lượng nghiêng về bên bán.')); }
  }
  if (T.macd != null) {
    sc += T.hist > 0 ? 0.5 : -0.5;
    R.push('MACD ' + (T.hist > 0 ? 'nằm trên' : 'nằm dưới') + ' đường tín hiệu' + (T.cross ? ', vừa cắt ' + (T.cross.t === 'up' ? 'lên' : 'xuống') + (T.cross.ago ? ' ' + T.cross.ago + ' phiên trước' : ' phiên gần nhất') : '') + ': động lượng ' + (T.hist > 0 ? 'đang mạnh lên.' : 'đang yếu đi.'));
  }
  if (T.adx != null) {
    var a = Math.round(T.adx), dir = T.pdi > T.mdi ? 'tăng' : 'giảm';
    R.push('ADX ' + a + ': ' + (T.adx < 20 ? 'chưa có xu hướng rõ, giá chủ yếu đi ngang.' : T.adx < 25 ? 'xu hướng ' + dir + ' đang hình thành.' : T.adx < 40 ? 'xu hướng ' + dir + ' rõ ràng.' : 'xu hướng ' + dir + ' rất mạnh, nhưng ở mức này cũng dễ chững lại.'));
  }
  var tag = sc >= 1.5 ? ['g', 'Khỏe'] : sc <= -1.5 ? ['r', 'Yếu'] : ['n', 'Trung tính'];
  if (T.rsi >= 70 && tag[0] === 'g') tag = ['g', 'Khỏe, đang nóng'];
  if (T.rsi <= 30 && tag[0] === 'r') tag = ['r', 'Yếu, đã giảm sâu'];
  mas.forEach(function (m) { lv.push(['MA' + m, Math.round(T['ma' + m] * 100) * 10]); });
  return { lines: R, tag: tag, lv: lv, score: sc };
}

/* ---------- XÉT NGHIỆM: kết quả kinh doanh mới nhất (/api/fund, VNDirect) ---------- */
var FUND = {}, FUND_API = (location.protocol === 'file:' ? 'https://topbroker.fun' : '') + '/api/fund';
function fetchFund(syms) {
  var need = syms.filter(function (s) { return !(s in FUND); });
  if (!need.length) return Promise.resolve();
  return getJSON(FUND_API + '?s=' + need.join(',')).then(function (j) { need.forEach(function (s) { FUND[s] = (j.f || {})[s] || null; }); }).catch(function () {});
}
function fundRead(F) {
  if (!F || !F.q) return null;
  var R = [], g = function (x) { return x == null ? '' : ' (' + pct(x, 0) + ' so với cùng kỳ)'; }, sc = 0;
  var bil = function (v) { return Math.abs(v) >= 1e12 ? nf(v / 1e12, 2) + ' nghìn tỷ' : nf(v / 1e9, 0) + ' tỷ'; };
  if (F.rev != null) R.push((F.bank ? 'Thu nhập lãi thuần ' : 'Doanh thu ') + bil(F.rev) + g(F.revY) + '.');
  if (F.np != null) {
    R.push('Lợi nhuận sau thuế ' + (F.np < 0 ? 'lỗ ' + bil(-F.np) : bil(F.np)) + (F.npPrev != null && F.npPrev <= 0 && F.np > 0 ? ' (cùng kỳ lỗ)' : F.npPrev != null && F.npPrev > 0 && F.np < 0 ? ' (cùng kỳ còn lãi)' : g(F.npY)) + '.');
    sc = F.np < 0 ? -2 : F.npY == null ? 0 : F.npY >= 0.15 ? 1 : F.npY <= -0.15 ? -1 : 0;
  }
  var v = [];
  if (F.pe != null && F.pe > 0) v.push('P/E ' + nf(F.pe, 1));
  if (F.pb != null && F.pb > 0) v.push('P/B ' + nf(F.pb, 1));
  if (F.roe != null) v.push('ROE ' + pct(F.roe, 1, false));
  if (v.length) R.push(v.join(' · ') + '.');
  var tag = sc >= 1 ? ['g', 'Lợi nhuận tăng'] : sc <= -2 ? ['r', 'Đang lỗ'] : sc <= -1 ? ['r', 'Lợi nhuận giảm'] : ['n', 'Đi ngang'];
  return { lines: R, tag: tag, q: F.q, score: sc };
}

/* Mốc MA gần nhất phía dưới / phía trên giá (đơn vị đồng) */
var MA_PLAIN = { 20: '1 tháng', 50: '2,5 tháng', 200: '10 tháng' };
function maLevels(sym) { var T = techOf(sym); if (!T) return []; return [20, 50, 200].filter(function (m) { return T['ma' + m]; }).map(function (m) { return { n: 'giá trung bình ' + MA_PLAIN[m], code: 'MA' + m, v: Math.round(T['ma' + m] * 100) * 10 }; }); }
/* Nói tiếng người: xu hướng giá không dùng thuật ngữ (thuật ngữ để trong mục "Xem chỉ báo") */
function plainTech(T) {
  if (!T) return null;
  var p = T.p, R = [], mas = [20, 50, 200].filter(function (m) { return T['ma' + m]; });
  var above = mas.filter(function (m) { return p >= T['ma' + m]; }), below = mas.filter(function (m) { return p < T['ma' + m]; });
  var nm = function (a) { return a.map(function (m) { return MA_PLAIN[m]; }).join(', ').replace(/, ([^,]*)$/, ' và $1'); };
  if (mas.length) R.push(!below.length ? 'Giá đang trên mức trung bình ' + nm(mas) + ': xu hướng tăng đang giữ.'
    : !above.length ? 'Giá đang dưới mức trung bình ' + nm(mas) + ': xu hướng đang yếu' + (mas.length > 1 ? ' cả ngắn lẫn dài hạn.' : '.')
    : 'Giá trên mức trung bình ' + nm(above) + ' nhưng dưới mức trung bình ' + nm(below) + ': ' + (above.indexOf(20) >= 0 ? 'ngắn hạn đang hồi, dài hạn chưa đổi chiều.' : 'nền dài hạn còn giữ, ngắn hạn đang yếu đi.'));
  var lowShort = T.ma20 && p < T.ma20;
  if (T.rsi != null && T.rsi <= 30) R.push('Giá đã giảm rất nhanh: có thể bật lại ngắn, nhưng chưa phải dấu hiệu đảo chiều.');
  else if (T.rsi != null && T.rsi >= 70) R.push('Giá đã tăng nóng: dễ có nhịp nghỉ, phần lãi dễ bị rung lắc.');
  else if (T.hist != null) R.push(T.hist < 0 ? (lowShort ? 'Đà giảm chưa dừng.' : 'Đà tăng đang chậm lại.') : (lowShort ? 'Đà giảm đang chậm lại.' : 'Đà tăng đang được giữ.'));
  if (T.adx != null && T.adx < 20) R.push('Giá chủ yếu đi ngang, chưa có xu hướng rõ.');
  return R;
}
function maBelow(sym, px) { return maLevels(sym).filter(function (l) { return l.v < px; }).sort(function (a, b) { return b.v - a.v; })[0] || null; }
function maAbove(sym, px) { return maLevels(sym).filter(function (l) { return l.v > px; }).sort(function (a, b) { return a.v - b.v; })[0] || null; }
function techWeak(T) { return !!T && ((T.ma20 && T.p < T.ma20 && T.hist < 0) || (T.ma50 && T.p < T.ma50)); }

/* Bác sĩ đọc: ghép vị thế của khách với tín hiệu (chỉ mô tả, có số) */
function doctorRead(r) {
  var T = techOf(r.sym), tr = techRead(T), fr = fundRead(FUND[r.sym]), t = [];
  if (r.plp >= 0) {
    t.push('Đang lãi ' + pct(r.plp, 0) + (T ? (techWeak(T) ? ' nhưng tín hiệu kỹ thuật đang yếu đi.' : tr.tag[0] === 'g' ? ', xu hướng còn giữ.' : ', xu hướng chưa rõ.') : '.'));
    var b = maBelow(r.sym, r.p);
    if (b) { var pl = b.v / r.cost - 1; t.push('Lùi về ' + b.n + ' (' + nf(b.v) + ' đ, ' + pct(b.v / r.p - 1, 1) + ') thì ' + (pl >= 0 ? 'lãi còn ' + pct(pl, 0) : 'chuyển sang lỗ ' + pct(pl, 0)) + '.'); }
    else if (T) t.push('Giá đang dưới mọi mức trung bình (1, 2,5 và 10 tháng): không còn mốc nào đỡ phía dưới.');
    if (T && T.rsi >= 70) t.push('RSI ' + Math.round(T.rsi) + ': giá đã chạy nhanh, phần lãi dễ bị rung lắc.');
  } else {
    t.push('Đang lỗ ' + pct(-r.plp, 0, false) + ', cần tăng ' + pct(r.cost / r.p - 1, 0, false) + ' để về giá vốn.');
    var a = maAbove(r.sym, r.p);
    if (a) t.push('Mốc gần nhất phía trên là ' + a.n + ' (' + nf(a.v) + ' đ, ' + pct(a.v / r.p - 1, 1) + '): giá vượt lại mốc này mới thoát xu hướng giảm của khung đó.');
    else if (T) t.push('Giá đã nằm trên mọi mức trung bình (1, 2,5 và 10 tháng): xu hướng đã cải thiện dù vẫn dưới giá vốn.');
  }
  if (fr && FUND[r.sym].npY != null) t.push('Lợi nhuận ' + fr.q + ' ' + (FUND[r.sym].npY >= 0 ? 'tăng ' : 'giảm ') + pct(Math.abs(FUND[r.sym].npY), 0, false) + ' so với cùng kỳ' + (FUND[r.sym].npY <= -0.15 ? ': nền cơ bản đang đi lùi, đáng kiểm tra lại lý do nắm giữ.' : FUND[r.sym].npY >= 0.15 ? ': nền cơ bản đang đi lên.' : '.'));
  else if (fr && FUND[r.sym].np < 0) t.push('Doanh nghiệp đang lỗ ở ' + fr.q + '.');
  return t.join(' ');
}
function labCard(r) {
  var T = techOf(r.sym), tr = techRead(T), loaded = r.sym in FUND, F = FUND[r.sym], fr = fundRead(F);
  var h = '<div class="lb-h"><span class="tk">' + r.sym + '</span><span class="pl ' + cls(r.plp) + '">' + pct(r.plp) + ' so với giá vốn</span><span class="sub">' + pct(r.w, 0, false) + ' danh mục</span></div>';
  h += '<div class="lb-tags">' + (fr ? '<span class="lb-tag ' + fr.tag[0] + '">Kinh doanh: ' + fr.tag[1] + '</span>' : '') + (tr ? '<span class="lb-tag ' + tr.tag[0] + '">Xu hướng: ' + tr.tag[1] + '</span>' : '') + '</div>';
  h += '<h5>Kết quả kinh doanh' + (fr ? ' ' + fr.q : '') + '</h5>' + (fr ? '<ul>' + fr.lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '<p class="na">' + (loaded ? 'Chưa lấy được báo cáo tài chính của mã này (có thể là chứng chỉ quỹ hoặc mã mới niêm yết).' : 'Đang tải…') + '</p>');
  h += '<h5>Xu hướng giá' + (T ? ' · phiên ' + vnDate(T.d) : '') + '</h5>' + (tr ? '<ul>' + plainTech(T).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '<p class="na">' + (HIST[r.sym] ? 'Chưa đủ lịch sử giá để đọc xu hướng.' : 'Đang tải…') + '</p>');
  if (T) h += '<details class="ind"><summary>Xem chỉ báo (MA, RSI, MACD, ADX)</summary><ul>' + tr.lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
    '<div class="lv"><span>Giá <b>' + nf(r.p) + '</b></span><span>Giá vốn của bạn <b>' + nf(r.cost) + '</b></span>' + maLevels(r.sym).map(function (l) { return '<span>' + l.code + ' <b>' + nf(l.v) + '</b></span>'; }).join('') + '</div></details>';
  if (T || fr) h += '<p class="read"><b>Bác sĩ đọc:</b> ' + doctorRead(r) + '</p>';
  return '<article class="lb">' + h + '</article>';
}
function renderLab() {
  if (!PORT) return;
  var rows = PORT.rows.slice().sort(function (a, b) { return b.mv - a.mv; });
  $('#lab').innerHTML = rows.map(labCard).join('');
  var qs = rows.map(function (r) { return FUND[r.sym] && FUND[r.sym].q; }).filter(Boolean), qd = qs.filter(function (v, i, a) { return a.indexOf(v) === i; });
  var anyT = rows.map(function (r) { return techOf(r.sym); }).filter(Boolean)[0];
  $('#lab-note').textContent = (qd.length ? 'Kết quả kinh doanh quý gần nhất đã công bố (' + qd.join(', ') + '), so với cùng kỳ năm trước. ' : '') + (anyT ? 'Chỉ báo kỹ thuật tính đến phiên ' + vnDate(anyT.d) + '. ' : '') + 'Nguồn VNDirect. Tín hiệu chỉ để tự kiểm tra, không phải khuyến nghị.';
  renderPdLab();
}
function renderPdLab() { var el = $('#pd-lab'); if (!el || !PORT || !PD.sym) return; var r = curRow(); el.innerHTML = r ? labCard(r) : ''; }
function loadLab() {
  if (!PORT) return;
  var syms = PORT.rows.map(function (r) { return r.sym; });
  renderLab();
  Promise.all([fetchFund(syms), fetchHist(syms.concat(['VNINDEX']))]).then(function () { renderLab(); renderDiag(); renderQuick(); if (PD.sym) sim(); });
}

/* ---------- 1 · KHÁM ---------- */
function settings() {
  return {
    cash: Math.max(0, parseNum(S.cash) || 0), debt: Math.max(0, parseNum(S.debt) || 0),
    call: (parseNum(S.call) || 0) / 100, force: (parseNum(S.force) || 0) / 100,
    fee: (parseNum(S.fee) || 0) / 100, tax: (parseNum(S.tax) || 0) / 100,
    appRtt: (parseNum(S.apprtt) || 0) / 100
  };
}
/* ---------- MÔ HÌNH MARGIN (lõi tb-core.js, Đợt 1 – anh Hải chốt 21/10/2026) ----------
   Tài sản tính margin = tiền + Σ KL × min(giá, giá chặn) × (mã được cho vay) × (1 − h).
   h suy ra từ Rtt app theo hướng bất lợi hơn (lõi calibrate). Rtt = (tài sản tính margin − nợ) ÷ tài sản tính margin. */
var CORE = window.TBCore, MGH = 0;
function metaOf(sym) { return S.rows.filter(function (x) { return x.sym === sym; })[0] || {}; }
function mgOf() { return true; }   // cột Cho vay: anh Hải bỏ 26/10/2026, mọi mã coi như được cho vay (lõi vẫn hỗ trợ marginable)
function capOf() { return null; }   // giá chặn: anh Hải bỏ khỏi bảng nhập 21/10/2026 (lõi vẫn hỗ trợ nếu cần lại)
function exchOf(sym) { return (PX[sym] && PX[sym].x) || 'HOSE'; }
function advOf(sym) { var h = HIST[sym]; if (!h || !h.v || h.v.length < 5) return null; var a = h.v.slice(-20).filter(function (v) { return v > 0; }); return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : null; }
function holdOf(P) { return P.rows.map(function (r) { return { sym: r.sym, q: r.qty, p: r.p }; }); }
function cntV(sym, q, p) { if (!(q > 0) || !mgOf(sym)) return 0; var c = capOf(sym); return q * (c ? Math.min(p, c) : p) * (1 - MGH); }
function mAssets(hold, cash) { return hold.reduce(function (a, h) { return a + cntV(h.sym, h.q, h.p); }, 0) + cash; }
function mRtt(hold, cash, debt) { if (!(debt > 0)) return 1; var A = mAssets(hold, cash); return A > 0 ? (A - debt) / A : 0; }
function coreP(hold, cash, debt, st) {
  st = st || PORT.st;
  return { rows: hold.filter(function (h) { return h.q > 0; }).map(function (h) { return { sym: h.sym, exch: exchOf(h.sym), qty: h.q, cost: 0, price: h.p, marginable: mgOf(h.sym), cap: capOf(h.sym), adv20: advOf(h.sym) }; }),
    cash: cash, debt: debt, recv: 0, call: st.call, force: st.force, fee: st.fee, tax: st.tax, appRtt: null, nearBand: CORE.DEFAULTS.nearBand };
}
function mapD(d) { return d.t === 'never' ? { t: 'safe' } : d.t === 'nodebt' ? { t: 'none' } : d; }
/* Cả danh mục giảm đều bao nhiêu thì chạm ngưỡng thr (mặc định ngưỡng call) */
function dropAll(hold, cash, debt, thr) { if (!(debt > 0)) return { t: 'none' }; return mapD(CORE.dropTo(coreP(hold, cash, debt), thr == null ? PORT.st.call : thr, null, MGH)); }
/* Riêng mã sym giảm bao nhiêu thì chạm ngưỡng call (các mã khác đứng giá) */
function dropOne(hold, cash, debt, sym) {
  if (!(debt > 0)) return { t: 'none' };
  var P = coreP(hold, cash, debt), d = CORE.dropTo(P, PORT.st.call, sym, MGH);
  if (d.t === 'never' && !P.rows.some(function (r) { return r.sym === sym && r.marginable; })) return { t: 'indep' };
  return mapD(d);
}
function dropNow(P) { return dropAll(holdOf(P), P.st.cash, P.st.debt); }
function floorNow(P, thr) { return P.st.debt ? CORE.floorSessions(coreP(holdOf(P), P.st.cash, P.st.debt), thr == null ? P.st.call : thr, null, MGH) : { t: 'nodebt' }; }
function dtcSentence(d, sym) {
  return d.t === 'x' ? sym + ' giảm thêm ' + pct(d.x, 1, false) + ' thì chạm ngưỡng call margin.'
    : d.t === 'below' ? 'Đang ở dưới ngưỡng call margin.'
    : d.t === 'safe' ? sym + ' có giảm sâu đến đâu cũng chưa làm chạm ngưỡng call margin.'
    : d.t === 'indep' ? 'Ngưỡng call margin không còn phụ thuộc ' + sym + '.' : '';
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
    PORT = calc(b.rows, b.st); PLAN = {}; PLAN_ORDER = [];
    renderExam(); aiReset('tong-ket'); $('#ai-tong-ket').hidden = false;
    lockStages(false);
    renderCtx(); initSim(); runCause(); renderJournal(); loadLab();
    renderQuick(); $('#ket-qua').hidden = false;
    setTimeout(function () { $('#ket-qua').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
  }).catch(function () { msg.textContent = 'Chưa lấy được giá (mạng hoặc nguồn giá đang lỗi). Thử lại sau ít phút.'; });
}
$('#run').addEventListener('click', exam);

function calc(rows, st) {
  var P = { rows: rows.map(function (r) { var p = PX[r.sym].p; return { sym: r.sym, qty: r.qty, cost: r.cost, sector: r.sector, p: p, t: PX[r.sym].t, ref: PX[r.sym].ref, mv: r.qty * p, cv: r.qty * r.cost }; }), st: st };
  P.mv = P.rows.reduce(function (a, r) { return a + r.mv; }, 0);
  P.cv = P.rows.reduce(function (a, r) { return a + r.cv; }, 0);
  P.rows.forEach(function (r) { r.w = r.mv / P.mv; r.pl = r.mv - r.cv; r.plp = r.pl / r.cv; });
  P.assets = P.mv + st.cash; P.nav = P.assets - st.debt; P.lev = P.nav > 0 ? P.assets / P.nav : Infinity;
  P.rttOwn = P.assets ? P.nav / P.assets : 0;
  // Rtt theo mô hình margin; có Rtt app thì hiệu chỉnh theo hướng bất lợi hơn (lõi tb-core.js)
  MGH = 0;
  var cp = coreP(holdOf(P), st.cash, st.debt, st); cp.appRtt = st.appRtt > 0 && st.appRtt <= 1 ? st.appRtt : null;
  P.cal = CORE.calibrate(cp); MGH = P.cal.h || 0;
  P.massets = mAssets(holdOf(P), st.cash); P.rtt = mRtt(holdOf(P), st.cash, st.debt);
  P.status = CORE.assess(Object.assign(cp, { appRtt: cp.appRtt })).status;
  P.sectors = {};
  P.rows.forEach(function (r) { P.sectors[r.sector] = (P.sectors[r.sector] || 0) + r.w; });
  return P;
}

function renderExam() {
  var P = PORT, st = P.st, d = dropNow(P);
  var ts = Math.max.apply(null, P.rows.map(function (r) { return r.t || 0; }));
  $('#px-time').textContent = 'Giá lúc ' + hm(ts) + ' · trễ 15 phút · nguồn VNDirect';
  var rttCls = !st.debt ? '' : P.rtt < st.call ? 'bad' : P.rtt < st.call + CORE.DEFAULTS.nearBand ? 'warn' : '';
  $('#kpi').innerHTML = [
    ['Giá trị cổ phiếu', money(P.mv), P.rows.length + ' mã'],
    ['Tiền mặt', money(st.cash), pct(st.cash / P.assets, 1, false) + ' tổng tài sản'],
    ['Dư nợ margin', money(st.debt), st.debt ? 'Đòn bẩy ' + nf(P.lev, 2) + ' lần' : 'Không vay'],
    ['Tài sản ròng', money(P.nav), 'Tài sản − nợ'],
    ['Lãi/lỗ chưa chốt', '<span class="' + cls(P.mv - P.cv) + '">' + money(P.mv - P.cv, true) + '</span>', '<span class="' + cls(P.mv - P.cv) + '">' + pct((P.mv - P.cv) / P.cv) + ' so với giá vốn</span>'],
    ['Tỷ lệ ký quỹ Rtt', st.debt ? pct(P.rtt, 1, false) : '–', st.debt ? 'Call margin ' + pct(st.call, 0, false) + ' · giải chấp ' + pct(st.force, 0, false) + (st.appRtt > 0 ? ' · app ' + pct(st.appRtt, 1, false) : '') : 'Không vay margin', rttCls],
    ['Cả danh mục giảm thêm', d.t === 'x' ? pct(d.x, 1, false) : '–', d.t === 'x' ? 'thì chạm ngưỡng call margin' : dtcText(d), d.t === 'below' ? 'bad' : d.t === 'x' && d.x < 0.15 ? 'warn' : ''],
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

  renderDiag();
}

/* ---------- Kết luận nhanh + Chẩn đoán ---------- */
var DIAG = [];
function renderDiag() {
  var P = PORT; if (!P) return;
  var st = P.st, C = ctx(), nav = P.nav, D = [], d = dropNow(P);
  var rows = P.rows.slice().sort(function (a, b) { return b.mv - a.mv; }), top = rows[0];
  var navPct = function (v) { return nav > 0 ? pct(v / nav, 1, false) : '–'; };
  function add(lv, title, fact, why) { D.push({ lv: lv, title: title, fact: fact, why: why }); }
  // 1. một mã chiếm tỷ trọng lớn
  if (top && top.w > 0.25) {
    var i1 = 0.2 * top.mv;
    add(nav > 0 && i1 / nav >= 0.1 ? 'bad' : 'warn', 'Một mã chiếm tỷ trọng lớn',
      '<b>' + top.sym + '</b> chiếm ' + pct(top.w, 0, false) + ' giá trị cổ phiếu (' + money(top.mv) + ').',
      'Riêng ' + top.sym + ' giảm 20% thì tài sản ròng giảm ' + money(i1) + ' (' + navPct(i1) + '). Một tin xấu riêng của mã này đủ làm cả danh mục chao đảo.');
  }
  // 2. tập trung 3 mã / ngành
  if (rows.length > 3) {
    var t3 = rows.slice(0, 3), w3 = t3.reduce(function (a, r) { return a + r.w; }, 0), m3 = t3.reduce(function (a, r) { return a + r.mv; }, 0);
    if (w3 > 0.7) add(nav > 0 && 0.2 * m3 / nav >= 0.15 ? 'bad' : 'warn', 'Danh mục tập trung cao',
      '3 mã lớn nhất (' + t3.map(function (r) { return r.sym; }).join(', ') + ') chiếm ' + pct(w3, 0, false) + ' giá trị cổ phiếu.',
      'Ba mã này cùng giảm 20% thì tài sản ròng giảm ' + money(0.2 * m3) + ' (' + navPct(0.2 * m3) + ').');
  }
  var secs = Object.keys(P.sectors).sort(function (a, b) { return P.sectors[b] - P.sectors[a]; });
  if (secs.length && P.sectors[secs[0]] > 0.4 && secs[0] !== 'Khác') {
    var sm = P.sectors[secs[0]] * P.mv;
    add(nav > 0 && 0.2 * sm / nav >= 0.15 ? 'bad' : 'warn', 'Phụ thuộc vào một ngành',
      'Ngành <b>' + esc(secs[0]) + '</b> chiếm ' + pct(P.sectors[secs[0]], 0, false) + ' giá trị cổ phiếu.',
      'Cả ngành giảm 20% thì tài sản ròng giảm ' + money(0.2 * sm) + ' (' + navPct(0.2 * sm) + '). Các mã cùng ngành thường lên xuống cùng nhau.');
  }
  // 3. dư nợ khuếch đại biến động
  if (st.debt) {
    var lvD = P.rtt < st.call || (d.t === 'x' && d.x < 0.15) || d.t === 'below' ? 'bad' : P.lev > 1.5 ? 'warn' : 'info';
    add(lvD, 'Dư nợ khuếch đại biến động tài sản ròng',
      'Dư nợ ' + money(st.debt) + ', đòn bẩy ' + nf(P.lev, 2) + ' lần, tỷ lệ ký quỹ ' + pct(P.rtt, 1, false) + ' (ngưỡng call ' + pct(st.call, 0, false) + ').',
      'Cổ phiếu giảm 10% thì tài sản ròng giảm khoảng ' + navPct(0.1 * P.mv) + '. ' + (d.t === 'x' ? 'Cả danh mục giảm thêm ' + pct(d.x, 1, false) + ' là chạm ngưỡng call margin.' : d.t === 'below' ? 'Hiện đã dưới ngưỡng call margin.' : ''));
  }
  // 4. tiền mặt
  var cashW = nav > 0 ? st.cash / nav : 0;
  if (C.liq === '3m' && cashW < 0.2) add('bad', 'Tiền mặt chưa đủ cho nhu cầu rút sớm', 'Bạn có thể cần tiền trong 3 tháng, nhưng tiền mặt chỉ ' + money(st.cash) + ' (' + pct(cashW, 1, false) + ' tài sản ròng).', 'Cần rút nhiều hơn số này thì phải bán cổ phiếu ở đúng giá lúc đó, kể cả khi đang lỗ.');
  else if (st.debt && P.assets && st.cash / P.assets < 0.05) add('warn', 'Thiếu tiền mặt làm đệm', 'Tiền mặt ' + money(st.cash) + ', chỉ ' + pct(st.cash / P.assets, 1, false) + ' tổng tài sản trong khi đang vay margin.', 'Nếu bị call margin, bạn phải nộp thêm tiền từ ngoài hoặc bán cổ phiếu đúng lúc giá thấp.');
  // 5. lỗ sâu
  var deep = rows.filter(function (r) { return r.plp < -0.2; }), wd = deep.reduce(function (a, r) { return a + r.w; }, 0);
  if (deep.length) add(wd > 0.25 ? 'warn' : 'info', 'Mã lỗ sâu so với giá vốn',
    deep.map(function (r) { return '<b>' + r.sym + '</b> ' + pct(r.plp, 0); }).join(', ') + ', chiếm ' + pct(wd, 0, false) + ' giá trị cổ phiếu.',
    'Để về giá vốn: ' + deep.map(function (r) { return r.sym + ' cần tăng ' + pct(r.cost / r.p - 1, 0, false); }).join(', ') + '. Đây là quãng đường giá phải đi, không phải dự báo.');
  // 5b. mã đang lãi: phần lãi chưa chốt và độ bền của xu hướng
  var win = rows.filter(function (r) { return r.plp > 0.05; }), unr = win.reduce(function (a, r) { return a + r.pl; }, 0);
  if (win.length && nav > 0 && unr / nav >= 0.05) {
    var weakW = win.filter(function (r) { return techWeak(techOf(r.sym)); }), giveBack = 0, gb = [];
    win.forEach(function (r) { var b = maBelow(r.sym, r.p); if (b) { var l = r.qty * (r.p - b.v); giveBack += l; gb.push(r.sym + ' lùi về ' + b.n + ' (' + nf(b.v) + ' đ) mất ' + money(l)); } });
    var wTop = win.slice().sort(function (a, b) { return b.pl - a.pl; }).slice(0, 3);
    add(weakW.length && weakW.reduce(function (a, r) { return a + r.pl; }, 0) / nav >= 0.05 ? 'warn' : 'info', weakW.length ? 'Có mã đang lãi nhưng xu hướng yếu đi' : 'Phần lãi chưa chốt cần được giữ',
      'Lãi chưa chốt ' + money(unr) + ' (' + navPct(unr) + ' tài sản ròng), nằm chủ yếu ở ' + wTop.map(function (r) { return '<b>' + r.sym + '</b> ' + pct(r.plp, 0); }).join(', ') + '.' + (weakW.length ? ' ' + weakW.map(function (r) { return '<b>' + r.sym + '</b>'; }).join(', ') + ' đã xuống dưới đường trung bình ngắn/trung hạn.' : ''),
      (gb.length ? gb.slice(0, 3).join('; ') + '. Các mã lãi cùng lùi về mốc MA gần nhất thì tài sản ròng giảm ' + money(giveBack) + ' (' + navPct(giveBack) + ').' : 'Lãi trên giấy chỉ thành tiền khi bán; giá lùi thì phần lãi này mỏng đi.') + ' Chặng 3 có các phương án chốt lời một phần, chốt hết, giữ nguyên hoặc gia tăng để so sánh.');
  }
  // 5c. mã lỗ đi kèm kinh doanh đi lùi
  rows.filter(function (r) { var F = FUND[r.sym]; return r.plp < -0.1 && F && ((F.npY != null && F.npY <= -0.15) || F.np < 0); }).forEach(function (r) {
    var F = FUND[r.sym], fr = fundRead(F);
    add(r.w >= 0.1 ? 'warn' : 'info', 'Mã lỗ và kinh doanh cũng đi lùi',
      '<b>' + r.sym + '</b> lỗ ' + pct(-r.plp, 0, false) + ' so với giá vốn; lợi nhuận ' + fr.q + (F.np < 0 ? ' là lỗ' : ' giảm ' + pct(-F.npY, 0, false) + ' so với cùng kỳ') + '.',
      'Giá thấp hơn giá vốn có lý do cơ bản đi kèm. Để về giá vốn, ' + r.sym + ' cần tăng ' + pct(r.cost / r.p - 1, 0, false) + ', trong khi lợi nhuận chưa cho thấy đà hồi phục: cần kiểm tra doanh nghiệp có kế hoạch cải thiện ra sao.');
  });
  // 6. dữ liệu chưa đủ
  var gaps = [];
  var unk = rows.filter(function (r) { return r.sector === 'Khác'; });
  if (unk.length) gaps.push('chưa rõ ngành của ' + unk.map(function (r) { return r.sym; }).join(', '));
  if (!C.hz || !C.liq || !C.tol || !C.goal || !C.react) gaps.push('chưa trả lời đủ 5 câu hoàn cảnh ở chặng 2 (để đọc khẩu vị đầu tư)');
  var noF = rows.filter(function (r) { return (r.sym in FUND) && !FUND[r.sym]; });
  if (noF.length) gaps.push('chưa lấy được kết quả kinh doanh của ' + noF.map(function (r) { return r.sym; }).join(', '));
  if (rows.some(function (r) { return r.sector !== 'Khác'; })) gaps.push('triển vọng ngành và kế hoạch kinh doanh cả năm của doanh nghiệp (xem bài Giải mã nếu có)');
  if (gaps.length) add('info', 'Dữ liệu chưa đủ để đánh giá chính xác', 'Còn thiếu: ' + gaps.join('; ') + '.', 'Kết luận ở trên có thể thay đổi khi bổ sung các thông tin này.');
  var rank = { bad: 0, warn: 1, info: 2 };
  D.sort(function (a, b) { return rank[a.lv] - rank[b.lv]; });
  var serious = D.filter(function (x) { return x.lv !== 'info'; });
  if (!serious.length) D.unshift({ lv: 'ok', title: 'Chưa thấy điểm đáng lo', fact: 'Tỷ trọng, mức tập trung và đòn bẩy đều chưa vượt các mốc tham khảo.', why: 'Vẫn nên xem phần dữ liệu còn thiếu bên dưới.' });
  DIAG = D;
  var LV = { bad: 'Đáng lo', warn: 'Cần theo dõi', info: 'Thông tin', ok: 'Ổn' };
  $('#diag').innerHTML = D.map(function (x) { return '<article class="dg ' + x.lv + '"><div class="dg-h"><b>' + x.title + '</b><span class="lv">' + LV[x.lv] + '</span></div><p>' + x.fact + '</p><p class="why"><b>Hệ quả có thể:</b> ' + x.why + '</p></article>'; }).join('');
  // Kết luận nhanh
  var pl = P.mv - P.cv, losers = P.rows.filter(function (r) { return r.pl < 0; }).sort(function (a, b) { return a.pl - b.pl; }), lossSum = losers.reduce(function (a, r) { return a + r.pl; }, 0);
  var lead = 'Danh mục đang ' + (pl < 0 ? 'lỗ <b class="dn">' + money(-pl) + '</b>' : 'lãi <b class="up">' + money(pl) + '</b>') + ' (' + pct(pl / P.cv) + ') so với giá vốn.';
  if (losers.length) { var l2 = losers.slice(0, 2), s2 = l2.reduce(function (a, r) { return a + r.pl; }, 0); lead += ' Phần lỗ nằm chủ yếu ở ' + l2.map(function (r) { return '<b>' + r.sym + '</b>'; }).join(' và ') + (losers.length > 2 ? ' (' + pct(s2 / lossSum, 0, false) + ' tổng phần lỗ)' : '') + '.'; }
  var gainers = P.rows.filter(function (r) { return r.pl > 0; }).sort(function (a, b) { return b.pl - a.pl; });
  if (gainers.length) lead += ' Phần lãi nằm chủ yếu ở ' + gainers.slice(0, 2).map(function (r) { return '<b>' + r.sym + '</b> (' + pct(r.plp, 0) + ')'; }).join(' và ') + '.';
  if (pl > 0) lead += ' Với danh mục đang lãi, câu hỏi chính là giữ phần lãi thế nào: chốt một phần, chốt hết, giữ nguyên hay gia tăng.';
  if (st.debt) lead += ' Bạn đang vay margin ' + money(st.debt) + ', đòn bẩy ' + nf(P.lev, 2) + ' lần.';
  var nb = D.filter(function (x) { return x.lv === 'bad'; }).length, nw = D.filter(function (x) { return x.lv === 'warn'; }).length;
  lead += nb || nw ? ' Có ' + (nb ? nb + ' điểm đáng lo' : '') + (nb && nw ? ' và ' : '') + (nw ? nw + ' điểm cần theo dõi' : '') + '.' : ' Chưa thấy điểm đáng lo theo các mốc tham khảo.';
  $('#quick-lead').innerHTML = lead;
  $('#quick-kpi').innerHTML = [['Giá trị cổ phiếu', money(P.mv), P.rows.length + ' mã'], ['Tiền mặt', money(st.cash), pct(cashW, 1, false) + ' tài sản ròng'], ['Dư nợ', money(st.debt), st.debt ? 'Đòn bẩy ' + nf(P.lev, 2) + ' lần' : 'Không vay'], ['Tài sản ròng', money(nav), 'Tài sản − nợ']]
    .map(function (k) { return '<div><span>' + k[0] + '</span><b>' + k[1] + '</b><em>' + k[2] + '</em></div>'; }).join('');
  var topList = (serious.length ? serious : D).slice(0, 3);
  $('#quick-top').innerHTML = topList.map(function (x) { return '<li class="' + x.lv + '"><b>' + x.title + ':</b> ' + x.fact + '</li>'; }).join('');
}

/* ---------- KẾT QUẢ 30 GIÂY: điểm sức khỏe, điều đáng lo nhất (bằng tiền), việc cần kiểm tra ---------- */
var QUICK = null;
function px10(v) { return Math.round(v / 10) * 10; }
function weakInfo(r) {
  var T = techOf(r.sym), F = FUND[r.sym], why = [];
  if (techWeak(T)) why.push('xu hướng giá yếu');
  if (F && F.np < 0) why.push('doanh nghiệp đang lỗ');
  else if (F && F.npY != null && F.npY <= -0.15) why.push('lợi nhuận giảm ' + pct(-F.npY, 0, false) + ' so với cùng kỳ');
  return why;
}
function health(P) {
  var st = P.st, C = ctx(), d = dropNow(P), I = [];
  var rows = P.rows.slice().sort(function (a, b) { return b.mv - a.mv; }), top = rows[0], nav = P.nav;
  var cashW = nav > 0 ? st.cash / nav : 0;
  // 1. đòn bẩy margin (tối đa −40)
  var m = { k: 'Đòn bẩy margin', max: 40, pts: 0 };
  if (!st.debt) m.txt = 'Không vay margin.';
  else if (d.t === 'below') { m.pts = 40; m.txt = 'Đang dưới ngưỡng call margin.'; }
  else if (d.t === 'safe') { m.pts = 3; m.txt = 'Có vay ' + money(st.debt) + ' nhưng còn rất xa ngưỡng call margin.'; }
  else { m.pts = d.x < 0.1 ? 35 : d.x < 0.2 ? 25 : d.x < 0.3 ? 15 : 6; m.txt = 'Vay ' + money(st.debt) + '; cả danh mục giảm thêm ' + pct(d.x, 1, false) + ' (mất ' + money(d.x * P.mv) + ') là bị call margin.'; }
  I.push(m);
  // 2. mã lớn nhất (−20)
  I.push({ k: 'Mã lớn nhất', max: 20, pts: top.w > 0.5 ? 20 : top.w > 0.35 ? 14 : top.w > 0.25 ? 8 : 0, txt: top.sym + ' chiếm ' + pct(top.w, 0, false) + ' giá trị cổ phiếu; giảm 20% là tài sản ròng mất ' + money(0.2 * top.mv) + '.' });
  // 3. một ngành (−10)
  var secs = Object.keys(P.sectors).filter(function (s) { return s !== 'Khác'; }).sort(function (a, b) { return P.sectors[b] - P.sectors[a]; }), sw = secs.length ? P.sectors[secs[0]] : 0;
  I.push({ k: 'Một ngành', max: 10, pts: sw > 0.6 ? 10 : sw > 0.4 ? 5 : 0, txt: secs.length ? 'Ngành ' + secs[0] + ' chiếm ' + pct(sw, 0, false) + ' giá trị cổ phiếu.' : 'Chưa rõ ngành của các mã.' });
  // 4. tiền mặt so với nhu cầu (−15)
  var c = { k: 'Tiền mặt', max: 15, pts: 0, txt: 'Tiền mặt ' + money(st.cash) + ' (' + pct(cashW, 0, false) + ' tài sản ròng).' };
  if (C.liq === '3m' && cashW < 0.2) { c.pts = 15; c.txt += ' Bạn có thể cần rút tiền trong 3 tháng.'; }
  else if (C.liq === '1y' && cashW < 0.1) { c.pts = 8; c.txt += ' Bạn có thể cần rút tiền trong năm.'; }
  else if (st.debt && P.assets && st.cash / P.assets < 0.05) { c.pts = 5; c.txt += ' Đang vay margin mà gần như không có tiền mặt làm đệm.'; }
  if (!C.liq) c.txt += ' (Chưa trả lời câu nhu cầu tiền ở chặng 2.)';
  I.push(c);
  // 5. mã đang yếu về xu hướng giá hoặc kinh doanh (−15)
  var loaded = rows.some(function (r) { return HIST[r.sym] || (r.sym in FUND); });
  var weak = rows.filter(function (r) { return weakInfo(r).length; }), ww = weak.reduce(function (a, r) { return a + r.w; }, 0);
  I.push({ k: 'Mã đang yếu', max: 15, pts: loaded ? Math.round(15 * Math.min(1, ww)) : 0,
    txt: !loaded ? 'Đang tải xu hướng giá và kết quả kinh doanh từng mã…' : weak.length ? weak.map(function (r) { return r.sym + ' (' + weakInfo(r).join(', ') + ')'; }).join('; ') + ': chiếm ' + pct(ww, 0, false) + ' giá trị cổ phiếu.' : 'Chưa thấy mã nào yếu về xu hướng giá hay kinh doanh.' });
  var score = Math.max(0, 100 - I.reduce(function (a, x) { return a + x.pts; }, 0));
  return { score: score, lv: score >= 75 ? ['g', 'Khỏe'] : score >= 50 ? ['w', 'Cần để ý'] : ['b', 'Đáng lo'], items: I, d: d, loaded: loaded };
}
/* Độ nhạy của một mã với VN-Index (beta), tính từ lợi suất ngày ~120 phiên gần nhất, ghép theo ngày */
function betaOf(sym) {
  var a = HIST[sym], m = HIST.VNINDEX; if (!a || !m || !a.c || !m.c) return null;
  var mi = {}; m.t.forEach(function (t, i) { mi[t] = i; });
  var xs = [], ys = [];
  for (var i = Math.max(1, a.c.length - 120); i < a.c.length; i++) {
    var j = mi[a.t[i]], j0 = mi[a.t[i - 1]]; if (j == null || j0 == null || !a.c[i - 1] || !m.c[j0]) continue;
    ys.push(a.c[i] / a.c[i - 1] - 1); xs.push(m.c[j] / m.c[j0] - 1);
  }
  if (xs.length < 40) return null;
  var mx = xs.reduce(function (s, v) { return s + v; }, 0) / xs.length, my = ys.reduce(function (s, v) { return s + v; }, 0) / ys.length, cv = 0, vr = 0;
  for (var k = 0; k < xs.length; k++) { cv += (xs[k] - mx) * (ys[k] - my); vr += (xs[k] - mx) * (xs[k] - mx); }
  return vr ? Math.max(0, Math.min(3, cv / vr)) : null;
}
/* Điều đáng lo nhất (anh Hải góp ý 18/10/2026): ưu tiên margin/đòn bẩy, các mã đang yếu và biến động chung của thị trường.
   Mã chiếm tỷ trọng lớn chỉ là mối lo lớn khi chính mã đó đang yếu hoặc đang lỗ. */
function worries(P) {
  var st = P.st, C = ctx(), nav = P.nav, d = dropNow(P), W = [];
  var rows = P.rows.slice().sort(function (a, b) { return b.mv - a.mv; }), top = rows[0], cashW = nav > 0 ? st.cash / nav : 0;
  var navP = function (v) { return nav > 0 ? ' (' + pct(v / nav, 0, false) + ' tài sản ròng)' : ''; };
  var list = function (a) { return a.map(function (r) { return '<b>' + r.sym + '</b>'; }).join(', '); };
  // 1. margin: sắp/đã call
  if (st.debt && d.t === 'below') {
    var mt = CORE.minToTarget(coreP(holdOf(P), st.cash, st.debt), st.call), dep = mt.t === 'need' ? mt.options[0].amount : 0;
    W.push({ k: 'margin', s: 100, w: 'Danh mục <b>đã dưới ngưỡng call margin</b>. Cần khoảng <b>' + money(dep) + '</b> nộp thêm để về lại ngưỡng.',
      t: 'Mở app kiểm tra tỷ lệ ký quỹ thực tế và hạn bổ sung. Khoản <b>' + money(dep) + '</b> lấy từ đâu cần có câu trả lời trước khi công ty chứng khoán bán giải chấp.' });
  } else if (st.debt && d.t === 'x') {
    W.push({ k: 'margin', s: d.x < 0.1 ? 90 : d.x < 0.15 ? 85 : d.x < 0.2 ? 75 : d.x < 0.3 ? 55 : 35, w: 'Danh mục mất thêm <b>' + money(d.x * P.mv) + '</b> (cổ phiếu giảm thêm ' + pct(d.x, 1, false) + ') là <b>bị call margin</b>.',
      t: 'Chuẩn bị trước nguồn tiền nếu bị call margin: mỗi <b>' + money(0.1 * P.mv) + '</b> nộp thêm giúp danh mục chịu thêm được 10% giảm giá.' + (top ? ' Mốc giá cần theo dõi: <b>' + top.sym + ' ' + nf(px10(top.p * (1 - d.x))) + ' đ</b> (nếu cả danh mục cùng giảm).' : '') });
  }
  // 2. đòn bẩy cao dù chưa sát ngưỡng call
  if (st.debt && P.lev >= 1.4 && !(W[0] && W[0].s >= 55)) {
    W.push({ k: 'lev', s: P.lev >= 2 ? 65 : P.lev >= 1.6 ? 55 : 45, w: 'Đang vay <b>' + money(st.debt) + '</b>, đòn bẩy ' + nf(P.lev, 2) + ' lần: cổ phiếu giảm 10% là tài sản ròng mất <b>' + money(0.1 * P.mv) + '</b>' + navP(0.1 * P.mv) + '.',
      t: 'Tính trước: nếu thị trường giảm 10–15%, bạn giữ tỷ lệ ký quỹ bằng nguồn tiền nào, và lãi vay margin mỗi tháng đang tốn bao nhiêu.' });
  }
  // 3. các mã đang yếu (xu hướng giá hoặc kinh doanh)
  var weak = rows.filter(function (r) { return weakInfo(r).length; }).sort(function (a, b) { return weakInfo(b).length - weakInfo(a).length || a.pl - b.pl; }), ww = weak.reduce(function (a, r) { return a + r.w; }, 0);
  if (weak.length) {
    var wl = weak.reduce(function (a, r) { return a + r.pl; }, 0), why = weak.slice(0, 3).map(function (r) { return '<b>' + r.sym + '</b> (' + weakInfo(r).join(', ') + ')'; }).join('; ');
    W.push({ k: 'weak', s: Math.min(80, 30 + 60 * ww), w: 'Các mã đang yếu chiếm <b>' + pct(ww, 0, false) + '</b> danh mục' + (wl < 0 ? ', đang lỗ tổng <b>' + money(-wl) + '</b>' : '') + ': ' + why + (weak.length > 3 ? ' và ' + (weak.length - 3) + ' mã khác' : '') + '.',
      t: 'Xem lại lý do nắm giữ ' + list(weak.slice(0, 3)) + ': điều gì đã khác so với lúc mua (Xem sâu → xét nghiệm từng mã).' });
  }
  // 4. biến động chung của thị trường: độ nhạy danh mục (beta) và xu hướng VN-Index
  var TV = techOf('VNINDEX'), bs = rows.map(function (r) { var b = betaOf(r.sym); return b == null ? null : b * r.w; }), known = rows.filter(function (r, i) { return bs[i] != null; });
  if (known.length) {
    var kw = known.reduce(function (a, r) { return a + r.w; }, 0), beta = bs.filter(function (v) { return v != null; }).reduce(function (a, v) { return a + v; }, 0) / (kw || 1);
    var loss = 0.1 * beta * P.mv, mWeak = techWeak(TV), maTxt = TV && TV.ma50 ? nf(TV.ma50, 0) : null;
    W.push({ k: 'mkt', s: (mWeak ? 50 : 25) + Math.min(20, (beta - 1) * 25) + (st.debt ? 8 : 0),
      w: (mWeak ? 'Thị trường chung đang yếu (VN-Index dưới mức trung bình ' + (TV.ma20 && TV.p < TV.ma20 ? '1 tháng' : '2,5 tháng') + '). ' : '') + 'Danh mục ' + (beta >= 1.15 ? 'nhạy hơn thị trường' : beta <= 0.85 ? 'ít nhạy hơn thị trường' : 'đi gần sát thị trường') + ' (độ nhạy ' + nf(beta, 1) + '): VN-Index giảm 10% thì danh mục ước mất <b>' + money(loss) + '</b>' + navP(loss) + '.',
      t: maTxt ? 'Theo dõi VN-Index quanh <b>' + maTxt + ' điểm</b> (mức trung bình 2,5 tháng): ' + (TV.p < TV.ma50 ? 'vượt lại được mốc này thì áp lực chung dịu bớt.' : 'thủng mốc này thì các mã thường cùng chịu áp lực.') : 'Theo dõi xu hướng VN-Index: danh mục của bạn đi theo thị trường chung khá sát.' });
  }
  // 5. tiền cần rút sớm
  if (C.liq === '3m' && cashW < 0.2) W.push({ k: 'liq', s: 70, w: 'Bạn có thể cần rút tiền trong 3 tháng nhưng tiền mặt chỉ <b>' + money(st.cash) + '</b>: rút nhiều hơn thì phải bán cổ phiếu ở giá lúc đó, kể cả khi đang lỗ.',
    t: 'Ghi ra số tiền cụ thể sẽ cần rút và ngày cần, rồi so với <b>' + money(st.cash) + '</b> tiền mặt đang có.' });
  // 6. tập trung một mã: chỉ nặng khi mã đó đang yếu hoặc đang lỗ
  if (top && top.w > 0.25) {
    var i1 = 0.2 * top.mv, tw = weakInfo(top), bad = tw.length || top.pl < 0;
    W.push({ k: 'top', s: bad ? 35 + Math.min(35, nav > 0 ? i1 / nav * 120 : 0) : 20,
      w: 'Riêng <b>' + top.sym + '</b> chiếm ' + pct(top.w, 0, false) + ' danh mục' + (bad ? (tw.length ? ' và đang ' + tw.join(', ') : ' và đang lỗ ' + pct(-top.plp, 0, false)) : ', hiện vẫn ' + (top.pl > 0 ? 'lãi ' + pct(top.plp, 0) : 'ổn') + ' và xu hướng chưa xấu') + ': giảm 20% là tài sản ròng mất <b>' + money(i1) + '</b>' + navP(i1) + '.',
      t: bad ? 'Xem lại lý do nắm giữ <b>' + top.sym + '</b>: kết quả kinh doanh quý gần nhất và mức giá nào thì bạn sẽ xem lại (Xem sâu → chặng 2).' : 'Đặt sẵn mức giá ' + top.sym + ' mà bạn sẽ xem lại (ví dụ thủng mức trung bình 2,5 tháng), vì mã lớn nhất quyết định phần lớn kết quả danh mục.' });
  }
  W.sort(function (a, b) { return b.s - a.s; });
  if (!W.length || W[0].s < 30) W.unshift({ k: 'ok', s: 0, w: 'Chưa thấy rủi ro lớn theo các mốc tham khảo.' + (W[0] ? ' Đáng để ý nhất: ' + W[0].w : ''), t: 'Đặt ngày tái khám (Xem sâu → chặng 4) để xem lại khi giá hoặc kết quả kinh doanh thay đổi.' });
  return W;
}
/* Giá từng mã chạm ngưỡng call margin (các mã khác đứng giá) */
function callPrices(P) {
  var st = P.st; if (!st.debt) return [];
  return P.rows.slice().sort(function (a, b) { return b.mv - a.mv; }).slice(0, 3).map(function (r) {
    var d = dropOne(holdOf(P), st.cash, st.debt, r.sym);
    return { sym: r.sym, t: d.t, x: d.x, px: d.t === 'x' ? px10(r.p * (1 - d.x)) : null };
  });
}
function floorTxt(P) {
  var f = floorNow(P), noX = P.rows.some(function (r) { return !(PX[r.sym] && PX[r.sym].x); });
  return f.t === 'n' ? ', tương đương <b>' + f.n + ' phiên giảm sàn liên tiếp</b>' + (noX ? ' (coi các mã chưa rõ sàn là HOSE, biên độ 7%)' : '') : '';
}
function marginNote(P) {
  var st = P.st, c = P.cal || {}, nm = P.rows.filter(function (r) { return !mgOf(r.sym); }).map(function (r) { return r.sym; });
  var t = 'Rtt tính theo tài sản được công ty chứng khoán công nhận (<b>' + money(P.massets) + '</b>)';
  t += nm.length ? ', không tính ' + nm.join(', ') + ' (không được cho vay)' : '';
  t += '. ';
  if (c.mode === 'app-lower') t += 'Rtt app ' + pct(st.appRtt, 1, false) + ' thấp hơn cách tính này nên đã coi như công ty không công nhận khoảng <b>' + money(c.excluded) + '</b> giá trị cổ phiếu: mốc call báo theo hướng bất lợi hơn. ';
  else if (c.mode === 'app-higher') t += 'Rtt app ' + pct(st.appRtt, 1, false) + ' cao hơn cách tính này: giữ số thấp hơn cho chắc, nên hỏi công ty cách tính. ';
  else if (c.mode === 'match') t += 'Khớp với Rtt app. ';
  else if (c.mode === 'inconsistent') t += 'Rtt app không khớp được với số tiền mặt, dư nợ đã nhập: kiểm tra lại. ';
  else t += 'Chưa nhập Rtt app: nhập tỷ lệ ký quỹ app đang hiện ở phần nhập để mốc call sát hơn (công ty có thể không cho vay một số mã). ';
  return t + 'Kiểm tra lại trên app.';
}
/* Cần tối thiểu bao nhiêu để Rtt về call + 5 điểm (anh Hải chốt 21/10/2026). Phép tính, không phải khuyến nghị. */
function needHTML(P) {
  var st = P.st, tg = Math.min(0.95, st.call + CORE.DEFAULTS.targetAdd), m = CORE.minToTarget(coreP(holdOf(P), st.cash, st.debt), tg);
  var h = '<h3>Cần tối thiểu bao nhiêu để Rtt về ' + pct(tg, 0, false) + '</h3>';
  if (m.t === 'ok') return '';   // Rtt đã trên call + 5 điểm: không cần khung này
  if (m.t !== 'need') return '';
  var dep = m.options[0], sells = m.options.filter(function (o) { return o.kind === 'sell-repay'; });
  var ok = sells.filter(function (o) { return o.t === 'ok'; }).sort(function (a, b) { return a.amount - b.amount; }), no = sells.filter(function (o) { return o.t !== 'ok'; });
  var liq = function (o) { return o.liquidity === 'over-adv' ? ' <span class="dn">· vượt khối lượng giao dịch bình quân 1 phiên</span>' : o.liquidity === 'heavy' ? ' <span class="dn">· bằng ' + pct(o.advPct, 0, false) + ' khối lượng bình quân 1 phiên, khó bán hết trong ngày</span>' : ''; };
  h += '<ul class="kq-need">' +
    '<li><b>Nộp ' + money(dep.amount) + '</b> (công ty tự cấn trừ nợ): Rtt lên ' + pct(tg, 0, false) + ' ngay khi tiền vào tài khoản.</li>' +
    ok.slice(0, 3).map(function (o) { return '<li>Hoặc <b>bán ' + nf(o.shares) + ' cp ' + o.sym + '</b> (≈ ' + money(o.amount) + ', ' + pct(o.pctOfQty, 0, false) + ' số đang có) để trả nợ: tiền về sau T+2 thì Rtt lên ' + pct(o.rttAfter, 1, false) + '; trong lúc chờ, Rtt khoảng ' + pct(o.rttT0, 1, false) + '.' + liq(o) + '</li>'; }).join('') +
    (no.length ? '<li>' + no.map(function (o) { return o.sym; }).join(', ') + ': bán hết riêng mã đó vẫn chưa đủ.</li>' : '') + '</ul>' +
    '<p class="note">Thiếu hụt quy ra tiền trả nợ: ' + money(m.shortfall) + '. Bán ở giá hiện tại, đã trừ phí ' + pct(st.fee, 2, false) + ' và thuế ' + pct(st.tax, 1, false) + '; chưa xét khả năng khớp lệnh khi mã nằm sàn. Đây là phép tính để bạn tự cân nhắc, không phải khuyến nghị.</p>';
  return h;
}
function ring(v, lv) {
  var R = 44, C = 2 * Math.PI * R, off = C * (1 - v / 100);
  return '<svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="' + R + '" fill="none" stroke="#eee9df" stroke-width="10"/><circle class="arc ' + lv + '" cx="55" cy="55" r="' + R + '" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 55 55)"/></svg>';
}
function renderQuick() {
  var P = PORT; if (!P) return;
  var st = P.st, H = health(P), W = worries(P), top = W[0];
  QUICK = { diem: H.score, muc: H.lv[1], dang_lo: top.w.replace(/<[^>]+>/g, ''), viec_can_kiem_tra: top.t.replace(/<[^>]+>/g, '') };
  var ts = Math.max.apply(null, P.rows.map(function (r) { return r.t || 0; }));
  $('#kq-time').textContent = 'Giá lúc ' + hm(ts) + ' · trễ 15 phút';
  $('#kq-score').innerHTML = '<div class="ring">' + ring(H.score, H.lv[0]) + '<b>' + H.score + '</b><span>/100</span></div><div class="kq-lv ' + H.lv[0] + '">' + H.lv[1] + '</div><small>Điểm sức khỏe danh mục</small>' + (H.loaded ? '' : '<small class="ld">Đang tải dữ liệu từng mã, điểm có thể đổi</small>');
  $('#kq-worry').innerHTML = top.w;
  $('#kq-todo').innerHTML = top.t;
  var nx = W.slice(1).filter(function (x) { return x.k !== 'ok' && x.s >= 30; }).slice(0, 2);
  $('#kq-next').innerHTML = nx.length ? '<small>Rủi ro tiếp theo</small><ul>' + nx.map(function (x) { return '<li>' + x.w + '</li>'; }).join('') + '</ul>' : '';
  $('#kq-next').hidden = !nx.length;
  $('#kq-break').innerHTML = H.items.map(function (x) { return '<li><span class="pt' + (x.pts ? ' m' : '') + '">' + (x.pts ? MINUS + x.pts : '0') + '<i>/' + x.max + '</i></span><span><b>' + x.k + ':</b> ' + esc(x.txt) + '</span></li>'; }).join('');
  var mb = $('#kq-margin');
  if (st.debt) {
    var d = H.d, cp = callPrices(P);
    mb.innerHTML = '<h3>Mốc call margin</h3><ul>' +
      '<li>' + (d.t === 'x' ? 'Cả danh mục giảm thêm <b>' + pct(d.x, 1, false) + '</b> (mất <b>' + money(d.x * P.mv) + '</b>)' + floorTxt(P) + ' là bị call margin. Tương ứng: ' + P.rows.slice().sort(function (a, b) { return b.mv - a.mv; }).slice(0, 3).map(function (r) { return '<b>' + r.sym + ' về ' + nf(px10(r.p * (1 - d.x))) + ' đ</b>'; }).join(', ') + ' nếu cùng giảm.' : d.t === 'below' ? '<b>Đang dưới ngưỡng call margin.</b>' : 'Cổ phiếu có giảm sâu, danh mục vẫn chưa chạm ngưỡng call margin.') + '</li>' +
      (d.t !== 'x' ? '' : (function () { var near = cp.filter(function (c) { return c.t === 'x' && c.x <= 0.35; });
        return near.length ? near.map(function (c) { var r = P.rows.filter(function (x) { return x.sym === c.sym; })[0]; return '<li>Riêng <b>' + c.sym + '</b> về <b>' + nf(c.px) + ' đ</b> (' + pct(-c.x, 1) + ' so với ' + nf(r.p) + ') là bị call, dù các mã khác đứng giá.</li>'; }).join('')
          : '<li>Không mã nào đủ lớn để một mình kéo bạn tới ngưỡng call (mã lớn nhất phải giảm hơn 35%): rủi ro chính là cả danh mục cùng giảm.</li>'; })()) + '</ul>' +
      '<p class="note">' + marginNote(P) + '</p>' + needHTML(P);
    mb.hidden = false;
  } else mb.hidden = true;
}
/* Khám chuyên sâu chỉ cho thành viên có mã (anh Hải chốt 18/10/2026). Thẻ 30 giây ai cũng xem được. */
var DEEP_WANT = 'kham';
function openDeep(stage) {
  if (MB && MB.code) { $('#deep-gate').hidden = true; $('#deep').hidden = false; openStage(stage || 'kham', true); return; }
  DEEP_WANT = stage || 'kham'; $('#deep').hidden = true; $('#deep-gate').hidden = false; $('#dg-msg').textContent = '';
  setTimeout(function () { $('#deep-gate').scrollIntoView({ behavior: 'smooth', block: 'start' }); try { $('#dg-code').focus({ preventScroll: true }); } catch (e) {} }, 30);
}
$('#deep-go').addEventListener('click', function () { openDeep('kham'); });
function dgTry() { mbCheck($('#dg-code').value, false, '#dg-msg').then(function (ok) { if (ok) openDeep(DEEP_WANT); }); }
$('#dg-check').addEventListener('click', dgTry);
$('#dg-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); dgTry(); } });

/* ---------- NHẬT KÝ QUYẾT ĐỊNH: lần trước bạn chọn gì, đến hôm nay ra sao (trung thực cả khi kết quả xấu) ---------- */
function hb(n) { return n > 0 ? 'cao hơn' : 'thấp hơn'; }
function jrBrief(e) {
  var L = [];
  if (e.multi) {
    var val = function (S) { var ok = true, v = S.cash - S.debt; S.h.forEach(function (h) { var p = PX[h.sym] ? PX[h.sym].p : null; if (p == null) { ok = false; p = h.px; } v += h.q * p; }); return { v: v, ok: ok }; };
    var vA = val(e.after), vB = val(e.before), dlt = vA.v - vB.v - (e.after.dep || 0), chg = e.sum && e.sum.navA != null ? vA.v - e.sum.navA : null;
    L.push('Theo giá hôm nay, tài sản ròng theo phác đồ khoảng <b>' + money(vA.v) + '</b>' + (chg != null ? ', <span class="' + cls(chg) + '">' + money(chg, true) + '</span> so với lúc quyết định' : '') + '.');
    L.push('So với nếu giữ nguyên cả danh mục: <b class="' + cls(dlt) + '">' + money(dlt, true) + '</b>' + (Math.abs(dlt) < 1000 ? ' (gần như ngang nhau).' : ': phác đồ đang cho kết quả <b>' + (dlt > 0 ? 'tốt hơn' : 'kém hơn') + '</b>.'));
    var qOfH = function (H, sym) { var x = H.filter(function (h) { return h.sym === sym; })[0]; return x ? x.q : 0; };
    e.acts.forEach(function (a) {
      var now = PX[a.sym] ? PX[a.sym].p : null; if (now == null) return;
      var qB = qOfH(e.before.h, a.sym), qA = qOfH(e.after.h, a.sym), mv = '<b>' + a.sym + '</b> · ' + esc(a.choice) + ': giá ' + nf(a.px) + ' → ' + nf(now) + ' đ (<span class="' + cls(now - a.px) + '">' + pct(now / a.px - 1) + '</span>). ';
      if (qA === qB) { var alt = qB * (a.px - now); L.push(mv + (Math.abs(alt) < 1000 ? 'Giữ hay bán hết lúc đó đến nay chưa khác biệt đáng kể.' : 'Nếu khi đó bán hết, tài sản ròng hôm nay ' + hb(alt) + ' khoảng <b>' + money(Math.abs(alt)) + '</b> (chưa tính phí, thuế).')); }
      else { var df = (qA - qB) * (now - a.px); L.push(mv + (Math.abs(df) < 1000 ? 'So với giữ nguyên mã này, đến nay chưa khác biệt đáng kể.' : 'Lựa chọn này làm tài sản ròng hôm nay ' + hb(df) + ' khoảng <b>' + money(Math.abs(df)) + '</b> so với giữ nguyên mã này.')); }
    });
    if (!(vA.ok && vB.ok)) L.push('Một số mã chưa có giá mới, đang tính theo giá lúc quyết định.');
  } else if (e.opts) {
    var now1 = PX[e.sym] ? PX[e.sym].p : null;
    if (now1) {
      var vals = e.opts.map(function (o) { return o.q * now1 + o.cash - o.debt + (o.alt ? o.alt.q * (PX[o.alt.sym] ? PX[o.alt.sym].p : o.alt.px) : 0); }), ci = e.opts.map(function (o) { return o.label; }).indexOf(e.choice);
      L.push('<b>' + e.sym + '</b> · ' + esc(e.choice) + ': giá ' + nf(e.px) + ' → ' + nf(now1) + ' đ (<span class="' + cls(now1 - e.px) + '">' + pct(now1 / e.px - 1) + '</span>).');
      e.opts.forEach(function (o, i) { if (i === ci || ci < 0) return; var dd = vals[i] - vals[ci]; L.push('Nếu khi đó chọn ' + esc(o.label) + ': tài sản ròng hôm nay ' + (Math.abs(dd) < 1000 ? 'gần như bằng lựa chọn của bạn.' : hb(dd) + ' khoảng <b>' + money(Math.abs(dd)) + '</b>.')); });
    }
  }
  return L;
}
function renderBrief() {
  var box = $('#jr-brief'); if (!box) return;
  if (!J.length) { box.hidden = true; return; }
  box.innerHTML = '<div class="jb-h"><div><span class="kick2">Nhật ký quyết định</span><h2 id="jb-t">Lần trước bạn đã chọn gì, đến hôm nay ra sao</h2></div><button type="button" class="btn sm ghost" id="jb-open">Mở nhật ký đầy đủ</button></div>' +
    J.slice(0, 2).map(function (e) { var due = e.review && e.review <= today();
      return '<article class="jb-e"><div class="jb-eh"><b>' + vnDate(e.date) + ' · ' + (e.multi ? 'Phác đồ ' + e.acts.length + ' mã (' + esc(e.sym) + ')' : esc(e.sym) + ' · ' + esc(e.choice)) + '</b>' + (due ? '<em class="due">Đến hạn tái khám</em>' : e.review ? '<span class="note">Tái khám ' + vnDate(e.review) + '</span>' : '') + '</div><ul>' + jrBrief(e).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></article>'; }).join('') +
    '<p class="note">Kết quả tính tới hôm nay theo giá trễ 15 phút, <b>chưa phải kết luận đúng hay sai</b>: quyết định hợp lý vẫn có thể ra kết quả xấu trong ngắn hạn, và ngược lại. Hãy xem các điều kiện theo dõi có còn đúng.</p>';
  box.hidden = false;
}
document.addEventListener('click', function (e) { if (!e.target.closest('#jb-open')) return; openDeep('tien-hanh'); });

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
  aiReset('tong-ket');
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

/* ---------- 2 · HOÀN CẢNH ---------- */
var HZ = { s: 'khoảng 3 tháng', m: '6 tháng đến 1 năm', l: 'trên 1 năm' }, LIQ = { '3m': 'có thể cần rút tiền trong 3 tháng tới', '1y': 'có thể cần rút tiền trong vòng 1 năm', 'no': 'chưa cần rút tiền ít nhất 1 năm' };
var GOAL = { keep: 'giữ tiền, hơn gửi tiết kiệm là được', grow: 'tài sản lớn dần đều đặn', max: 'lãi càng nhiều càng tốt, chấp nhận sóng gió' }, REACT = { all: 'bán hết cho nhẹ đầu', sell: 'bán bớt một phần', hold: 'ngồi im chờ hồi', buy: 'mua thêm vì giá rẻ' };
function ctx() { var c = S.ctx || {}; return { hz: c.hz || null, liq: c.liq || null, tol: c.tol ? +c.tol : null, goal: c.goal || null, react: c.react || null }; }

/* ---------- Khẩu vị đầu tư: điểm khai báo (5 câu) và điểm hành vi (cách danh mục đang được xây) ---------- */
var KV_LV = [[30, 'Thận trọng', 'Ưu tiên giữ vốn, ngại sụt giảm hơn là tiếc cơ hội.'], [55, 'Cân bằng', 'Chấp nhận biến động vừa phải để đổi lấy tăng trưởng.'], [75, 'Tăng trưởng', 'Sẵn sàng chịu sóng lớn để tìm lợi nhuận cao hơn.'], [101, 'Mạo hiểm', 'Chấp nhận rủi ro cao, kể cả mất một phần lớn vốn.']];
function kvLevel(x) { for (var i = 0; i < KV_LV.length; i++) if (x < KV_LV[i][0]) return { i: i, name: KV_LV[i][1], desc: KV_LV[i][2] }; }
function profile() {
  var C = ctx(), d = [], b = [];
  if (C.hz) d.push({ s: 0, m: 0.5, l: 1 }[C.hz]);
  if (C.liq) d.push({ '3m': 0, '1y': 0.5, no: 1 }[C.liq]);
  if (C.tol) d.push({ 0.1: 0, 0.2: 1 / 3, 0.3: 2 / 3, 0.5: 1 }[C.tol]);
  if (C.goal) d.push({ keep: 0, grow: 0.5, max: 1 }[C.goal]);
  if (C.react) d.push({ all: 0, sell: 1 / 3, hold: 2 / 3, buy: 1 }[C.react]);
  var dec = d.length >= 3 ? Math.round(100 * d.reduce(function (a, x) { return a + x; }, 0) / d.length) : null;
  var beh = null, why = [];
  if (PORT) {
    var P = PORT, top = P.rows.slice().sort(function (a, c) { return c.w - a.w; })[0], st = P.st;
    var cashW = P.nav > 0 ? st.cash / P.nav : 0;
    beh = behScore(top.w, P.rows.length, st.debt ? P.lev : 1, cashW);
    why.push(st.debt ? 'vay margin, đòn bẩy ' + nf(P.lev, 2) + ' lần' : 'không vay margin');
    why.push('mã lớn nhất ' + top.sym + ' chiếm ' + pct(top.w, 0, false));
    why.push(P.rows.length + ' mã');
    why.push('tiền mặt ' + pct(cashW, 0, false) + ' tài sản ròng');
  }
  var o = { dec: dec, beh: beh, why: why, n: d.length };
  o.decL = dec == null ? null : kvLevel(dec); o.behL = beh == null ? null : kvLevel(beh);
  o.gap = dec != null && beh != null ? beh - dec : null;
  return o;
}
function behScore(topW, n, lev, cashW) {
  var sL = lev >= 1.7 ? 1 : lev >= 1.3 ? 0.67 : lev > 1.001 ? 0.33 : 0;
  var sC = topW >= 0.4 ? 1 : topW >= 0.25 ? 0.6 : 0.2, sN = n <= 2 ? 1 : n <= 4 ? 0.6 : n <= 7 ? 0.3 : 0;
  var sK = cashW < 0.05 ? 1 : cashW < 0.2 ? 0.5 : 0;
  return Math.round(100 * (sL * 0.4 + sC * 0.25 + sN * 0.15 + sK * 0.2));
}
function renderProfile() {
  var el = $('#profile'); if (!el) return;
  var K = profile();
  function bar(v, lbl) { return '<div class="kv-bar"><span>' + lbl + '</span><span class="kv-t"><i style="left:' + v + '%"></i></span><b>' + kvLevel(v).name + ' · ' + v + '/100</b></div>'; }
  var h = '<span class="kick2">Khẩu vị đầu tư</span><h3>' + (K.decL ? 'Bạn thuộc nhóm <em class="kv-n kv' + K.decL.i + '">' + K.decL.name + '</em>' : 'Khẩu vị đầu tư của bạn') + '</h3>';
  if (!K.decL) h += '<p class="note">Trả lời ít nhất 3 trong 5 câu ở trên để Bác sĩ đọc khẩu vị của bạn.</p>';
  else h += '<p>' + K.decL.desc + '</p>';
  h += '<div class="kv-scale"><span>Thận trọng</span><span>Cân bằng</span><span>Tăng trưởng</span><span>Mạo hiểm</span></div>';
  if (K.decL) h += bar(K.dec, 'Bạn nói');
  if (K.behL) h += bar(K.beh, 'Danh mục cho thấy');
  if (K.behL) h += '<p class="note">"Danh mục cho thấy" chấm theo cách danh mục đang được xây: ' + K.why.join(', ') + '.</p>';
  if (K.gap != null) {
    if (K.gap >= 20) h += '<p class="kv-gap w"><b>Lời nói và hành động đang vênh nhau.</b> Bạn tự nhận là ' + K.decL.name.toLowerCase() + ', nhưng danh mục đang được xây theo kiểu ' + K.behL.name.toLowerCase() + '. Khi thị trường xấu, người ở thế này thường bị bất ngờ vì mức sụt giảm lớn hơn mình tưởng.</p>';
    else if (K.gap <= -20) h += '<p class="kv-gap">Danh mục đang an toàn hơn khẩu vị bạn khai: bạn còn dư địa chịu rủi ro, nhưng không bắt buộc phải dùng.</p>';
    else h += '<p class="kv-gap g">Khẩu vị bạn khai và cách danh mục đang được xây khá khớp nhau.</p>';
  }
  el.innerHTML = h;
}
function ctxText(c) {
  c = c || ctx(); var t = [];
  if (c.hz) t.push('Thời gian đầu tư: ' + HZ[c.hz]);
  if (c.liq) t.push('Nhu cầu tiền: ' + LIQ[c.liq]);
  if (c.tol) t.push('Chịu được tài sản ròng giảm thêm tối đa ' + pct(c.tol, 0, false) + (c.tol >= 0.5 ? ' trở lên' : ''));
  if (c.goal) t.push('Mục tiêu: ' + GOAL[c.goal]);
  if (c.react) t.push('Khi danh mục giảm 20%: ' + REACT[c.react]);
  var K = profile(); if (K.decL) t.push('Khẩu vị: ' + K.decL.name + (K.behL && Math.abs(K.gap) >= 20 ? ' (danh mục thực tế: ' + K.behL.name + ')' : ''));
  return t;
}
function ctxPayload() { var c = ctx(), K = profile(); return { thoi_gian_dau_tu: c.hz ? HZ[c.hz] : 'chưa trả lời', nhu_cau_tien: c.liq ? LIQ[c.liq] : 'chưa trả lời', muc_chiu_dung_von_chu_giam: c.tol, muc_tieu: c.goal ? GOAL[c.goal] : 'chưa trả lời', phan_ung_khi_giam_20pct: c.react ? REACT[c.react] : 'chưa trả lời',
  khau_vi: { theo_khai_bao: K.decL ? K.decL.name + ' (' + K.dec + '/100)' : 'chưa đủ câu trả lời', theo_hanh_vi_danh_muc: K.behL ? K.behL.name + ' (' + K.beh + '/100)' : null, can_cu_hanh_vi: K.why, do_venh: K.gap } }; }
$('#ctx').addEventListener('change', function (e) {
  if (e.target.type !== 'radio') return;
  S.ctx = S.ctx || {}; S.ctx[e.target.name] = e.target.value; store(KEY, S); renderCtx(); if (PORT) { renderDiag(); sim(); renderPlan(); renderQuick(); }
});
function renderCtx() {
  var c = S.ctx || {};
  renderProfile();
  ['hz', 'liq', 'tol', 'goal', 'react'].forEach(function (k) { $$('#ctx input[name="' + k + '"]').forEach(function (i) { i.checked = i.value === c[k]; }); });
  if (!PORT) return;
  var P = PORT, st = P.st, C = ctx(), out = [];
  if (!C.hz && !C.liq && !C.tol) out.push(['', 'Trả lời các câu ở trên để xem hoàn cảnh của bạn khớp hay vênh với danh mục ở chỗ nào.']);
  if (C.tol) {
    var lossAmt = C.tol * P.nav, sDrop = P.mv ? lossAmt / P.mv : 0, d = dropNow(P);
    out.push([sDrop < 0.15 ? 'w' : '', 'Mức chịu đựng ' + pct(C.tol, 0, false) + ' tài sản ròng ≈ <b>' + money(lossAmt) + '</b>. ' + (st.debt ? 'Vì đang vay margin (đòn bẩy ' + nf(P.lev, 2) + ' lần), ' : '') + (sDrop >= 1 ? 'cổ phiếu có mất trắng cũng chưa tới mức này.' : 'cả danh mục cổ phiếu chỉ cần giảm thêm khoảng <b>' + pct(sDrop, 1, false) + '</b> là chạm mức này.')]);
    if (st.debt && d.t === 'x') out.push([d.x < sDrop ? 'b' : '', d.x < sDrop ? 'Ngưỡng call margin đến <b>trước</b> mức chịu đựng của bạn: cả danh mục giảm thêm ' + pct(d.x, 1, false) + ' là đã bị call margin.' : 'Ngưỡng call margin đến sau mức chịu đựng của bạn (cả danh mục giảm thêm ' + pct(d.x, 1, false) + ').']);
    var big = P.rows.slice().sort(function (a, b) { return b.mv - a.mv; })[0];
    if (big && big.mv > 0) { var sb = lossAmt / big.mv; out.push(['', 'Riêng <b>' + big.sym + '</b> (mã lớn nhất) ' + (sb >= 1 ? 'có mất trắng cũng chưa làm tài sản ròng giảm tới mức này.' : 'giảm thêm ' + pct(sb, 1, false) + ' là một mình nó đã làm tài sản ròng giảm ' + pct(C.tol, 0, false) + '.')]); }
  }
  if (C.liq) {
    var cashW = P.nav > 0 ? st.cash / P.nav : 0;
    out.push([C.liq === '3m' && cashW < 0.2 ? 'w' : '', 'Tiền mặt sẵn có ' + money(st.cash) + ', bằng ' + pct(cashW, 1, false) + ' tài sản ròng. Cần rút nhiều hơn số này thì phần thiếu phải bán cổ phiếu ở đúng giá lúc đó' + (st.debt ? ', và rút tiền khi đang vay sẽ làm tỷ lệ ký quỹ giảm thêm' : '') + '.']);
  }
  if (C.hz || C.liq) {
    var losers = P.rows.filter(function (r) { return r.plp < 0; }).sort(function (a, b) { return a.plp - b.plp; }), short = C.hz === 's' || C.liq === '3m';
    if (losers.length) out.push([short ? 'w' : '', 'Để về giá vốn, ' + losers.slice(0, 4).map(function (r) { return '<b>' + r.sym + '</b> cần tăng ' + pct(r.cost / r.p - 1, 0, false); }).join(', ') + '. ' + (short ? 'Thời gian bạn có khá ngắn so với quãng đường giá phải đi.' : 'Đây là quãng đường giá phải đi, không phải dự báo.')]);
    else out.push(['g', 'Chưa có mã nào lỗ so với giá vốn.']);
  }
  $('#ctx-notes').innerHTML = out.map(function (x) { return '<li class="' + x[0] + '"><span>' + x[1] + '</span></li>'; }).join('');
}

/* ---------- 3 · LÊN PHÁC ĐỒ ---------- */
var OPT_LOSS = ['hold', 'sell', 'sellpay', 'swap', 'all', 'buy', 'deposit'], OPT_GAIN = ['hold', 'sell', 'all', 'buy', 'sellpay', 'swap', 'deposit'];
function gain() { var r = curRow(); return !!r && r.plp > 0; }
function optOrder() { return gain() ? OPT_GAIN : OPT_LOSS; }
var PD = { sym: null, on: {}, q: {}, to: '', src: 'cash', dep: { m: 'rtt', v: 0.6 } };
function curRow() { return PORT.rows.filter(function (x) { return x.sym === PD.sym; })[0]; }
function initSim() {
  var rows = PORT.rows.slice().sort(function (a, b) { return a.plp - b.plp; });
  renderChips(rows);
  setSym(PD.sym && PORT.rows.some(function (r) { return r.sym === PD.sym; }) ? PD.sym : rows[0].sym);
  renderChips(); renderPlan();
}
function renderChips(rows) {
  rows = rows || PORT.rows.slice().sort(function (a, b) { return a.plp - b.plp; });
  $('#pd-syms').innerHTML = rows.map(function (r) {
    var a = PLAN[r.sym];
    return '<button type="button" class="pd-chip sym' + (a ? ' done' : '') + (r.sym === PD.sym ? ' on' : '') + '" role="radio" aria-checked="' + (r.sym === PD.sym) + '" data-sym="' + r.sym + '"><b>' + (a ? '✓ ' : '') + r.sym + '</b><span class="' + cls(r.plp) + '">' + pct(r.plp, 0) + '</span><em>' + (a ? esc(a.label) : pct(r.w, 0, false) + ' danh mục') + '</em></button>';
  }).join('');
}
function setSym(sym) {
  var m = $('#plan-msg'); if (m && PD.sym && PD.sym !== sym) m.hidden = true;
  var st = PORT.st; PD.sym = sym;
  var r = curRow();
  PD.on = {};   // khách tự tích phương án (anh Hải yêu cầu 21/10/2026)
  PD.q = { sell: { m: 'pct', v: 0.25 }, sellpay: { m: 'pct', v: 0.25 }, swap: { m: 'pct', v: 0.25 }, buy: { m: 'pct', v: 0.25 } };
  var others = PORT.rows.filter(function (x) { return x.sym !== sym; }).sort(function (a, b) { return b.plp - a.plp; });
  PD.to = others.length ? others[0].sym : ''; PD.src = st.cash > 0 ? 'cash' : 'margin'; PD.dep = { m: 'rtt', v: 0.6 };
  $('#sim-px').value = fmtInt(r.p); $('#pd-guess').value = '';
  $$('#pd-syms .pd-chip').forEach(function (b) { var on = b.getAttribute('data-sym') === sym; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
  $$('.pd-sym').forEach(function (e) { e.textContent = sym; });
  renderOpts(); renderPdLab(); sim();
}
function canPartial(r) { return r.qty >= 200; }
function optInfo(k) {
  var st = PORT.st, r = curRow();
  if (r.plp > 0) return {
    hold: ['Giữ nguyên, chờ thêm', 'Không bán: lãi tiếp tục chạy theo giá, lên thì lãi thêm, xuống thì lãi mỏng đi.'],
    sell: ['Chốt lời một phần', 'Bán bớt để biến một phần lãi trên giấy thành tiền thật, phần còn lại chạy tiếp.'],
    all: ['Chốt lời hết', 'Bán toàn bộ ' + r.sym + ', khóa phần lãi thành tiền' + (st.debt ? ', ưu tiên trả nợ margin.' : '.')],
    buy: ['Gia tăng vị thế', 'Mua thêm ' + r.sym + ' ở giá cao hơn giá vốn: vị thế lớn hơn, giá vốn bình quân tăng lên.'],
    sellpay: ['Chốt lời một phần, trả nợ', 'Bán bớt, dùng tiền thu về trả nợ margin.'],
    swap: ['Chốt lời, chuyển sang mã khác', 'Bán bớt ' + r.sym + ', dùng tiền thu về mua mã khác.'],
    deposit: ['Nộp thêm tiền trả nợ', 'Không bán gì, nộp tiền từ ngoài vào để giảm dư nợ margin.']
  }[k];
  return {
    hold: ['Giữ nguyên', 'Không làm gì, chấp nhận biến động giá.'],
    sell: ['Bán bớt, giữ tiền mặt', 'Giảm tỷ trọng một phần, tiền để lại trong tài khoản.'],
    sellpay: ['Bán bớt để trả nợ', 'Bán một phần, dùng tiền thu về trả nợ margin.'],
    swap: ['Chuyển sang mã khác', 'Bán bớt mã này, dùng tiền thu về mua mã khác.'],
    all: ['Bán hết', 'Rút hẳn khỏi ' + r.sym + (st.debt ? ', tiền thu về ưu tiên trả nợ margin.' : ', giữ tiền mặt.')],
    buy: ['Mua thêm', 'Tăng số cổ phiếu ' + r.sym + ', kéo giá vốn bình quân xuống.'],
    deposit: ['Nộp thêm tiền trả nợ', 'Không bán gì, nộp tiền từ ngoài vào để giảm dư nợ margin.']
  }[k];
}
function qtyHTML(k, mode) {
  var pcts = mode === 'buy' ? [[0.25, '25%'], [0.5, '50%'], [1, '100%']] : [[0.25, '25%'], [0.5, '50%'], [0.75, '75%']];
  return '<div class="pd-q"><span class="pd-lbl">' + (mode === 'buy' ? 'Mua thêm bao nhiêu? <small>(% so với số đang có)</small>' : 'Bán bao nhiêu? <small>(% số đang có)</small>') + '</span>' +
    '<div class="pd-chips">' + pcts.map(function (p) { return '<button type="button" class="pd-chip" data-k="' + k + '" data-pct="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>' +
    '<div class="pd-2"><label>Hoặc số cổ phiếu<input data-qk="' + k + '" data-m="q" inputmode="numeric" placeholder="VD: 1,000"></label>' +
    '<label>Hoặc số tiền ' + (mode === 'buy' ? 'muốn bỏ ra' : 'muốn thu về') + ' (đ)<input data-qk="' + k + '" data-m="m" inputmode="numeric" placeholder="VD: 50,000,000"></label></div></div>';
}
function renderOpts() {
  var st = PORT.st, r = curRow();
  var others = PORT.rows.filter(function (x) { return x.sym !== r.sym; });
  $('#pd-opts').innerHTML = optOrder().map(function (k) {
    var inf = optInfo(k), dis = '', inner = '';
    if ((k === 'sellpay' || k === 'deposit') && !st.debt) dis = 'Bạn không vay margin nên không có nợ để trả.';
    if ((k === 'sell' || k === 'sellpay' || k === 'swap') && !canPartial(r)) dis = dis || 'Chỉ có ' + nf(r.qty) + ' cp, không bán bớt được theo lô 100.';
    if (k === 'sell' || k === 'sellpay') inner = qtyHTML(k, 'sell');
    if (k === 'swap') inner = qtyHTML(k, 'sell') + '<div class="pd-q"><span class="pd-lbl">Mua mã nào?</span><div class="pd-chips">' +
      others.map(function (x) { return '<button type="button" class="pd-chip" data-to="' + x.sym + '">' + x.sym + '</button>'; }).join('') + '</div>' +
      '<div class="pd-2"><label>Hoặc gõ mã khác<input id="pd-to-new" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="VD: FPT"></label></div></div>';
    if (k === 'buy') inner = qtyHTML(k, 'buy') + '<div class="pd-q"><span class="pd-lbl">Tiền lấy từ đâu?</span><div class="pd-chips"><button type="button" class="pd-chip" data-src="cash">Tiền mặt</button><button type="button" class="pd-chip" data-src="margin">Vay margin</button></div></div>';
    if (k === 'deposit') inner = '<div class="pd-q"><span class="pd-lbl">Nộp bao nhiêu?</span><div class="pd-chips"><button type="button" class="pd-chip" data-dep="0.5">Đủ đưa Rtt lên 50%</button><button type="button" class="pd-chip" data-dep="0.6">Đủ đưa Rtt lên 60%</button><button type="button" class="pd-chip" data-dep="all">Trả hết nợ</button></div>' +
      '<div class="pd-2"><label>Hoặc số tiền nộp (đ)<input id="pd-dep-m" inputmode="numeric" placeholder="VD: 30,000,000"></label></div></div>';
    if (dis) PD.on[k] = false;
    return '<div class="pd-o' + (dis ? ' dis' : '') + (PD.on[k] ? ' on' : '') + '" data-k="' + k + '"><label class="pd-chk"><input type="checkbox" data-k="' + k + '"' + (PD.on[k] ? ' checked' : '') + (dis ? ' disabled' : '') + '><span><b>' + inf[0] + '</b><em>' + (dis || inf[1]) + '</em></span></label>' +
      (inner ? '<div class="pd-in"' + (PD.on[k] ? '' : ' hidden') + '>' + inner + '<p class="pd-res" id="res-' + k + '"></p></div>' : '') + '<div class="pd-save" data-k="' + k + '" hidden></div></div>';
  }).join('');
}
$('#pd-syms').addEventListener('click', function (e) { var b = e.target.closest('[data-sym]'); if (b) setSym(b.getAttribute('data-sym')); });
$('#pd-opts').addEventListener('change', function (e) {
  var t = e.target;
  if (t.type === 'checkbox') { var k = t.getAttribute('data-k'); PD.on[k] = t.checked; var box = t.closest('.pd-o'); box.classList.toggle('on', t.checked); var inn = box.querySelector('.pd-in'); if (inn) inn.hidden = !t.checked; sim(); }
  if (t.id === 'pd-to-new') newTarget(t.value);
});
$('#pd-opts').addEventListener('click', function (e) {
  var b = e.target.closest('.pd-chip'); if (!b) return;
  if (b.hasAttribute('data-pct')) PD.q[b.getAttribute('data-k')] = { m: 'pct', v: +b.getAttribute('data-pct') };
  if (b.hasAttribute('data-to')) { PD.to = b.getAttribute('data-to'); var ni = $('#pd-to-new'); if (ni) ni.value = ''; }
  if (b.hasAttribute('data-src')) PD.src = b.getAttribute('data-src');
  if (b.hasAttribute('data-dep')) { var v = b.getAttribute('data-dep'); PD.dep = v === 'all' ? { m: 'all' } : { m: 'rtt', v: +v }; }
  sim();
});
$('#pd-opts').addEventListener('input', function (e) {
  var t = e.target, v = toDong(parseNum(t.value));
  if (t.hasAttribute('data-qk')) { if (v > 0) PD.q[t.getAttribute('data-qk')] = { m: t.getAttribute('data-m'), v: t.getAttribute('data-m') === 'q' ? parseNum(t.value) : parseNum(t.value) }; sim(); }
  if (t.id === 'pd-dep-m') { if (parseNum(t.value) > 0) PD.dep = { m: 'm', v: parseNum(t.value) }; sim(); }
});
$('#pd-opts').addEventListener('keydown', function (e) { if (e.target.id === 'pd-to-new' && e.key === 'Enter') { e.preventDefault(); newTarget(e.target.value); } });
function newTarget(v) {
  v = String(v || '').trim().toUpperCase(); if (!/^[A-Z0-9]{3,8}$/.test(v)) return;
  PD.to = v;
  if (PX[v] || PORT.rows.some(function (r) { return r.sym === v; })) { sim(); return; }
  $('#res-swap') && ($('#res-swap').textContent = 'Đang lấy giá ' + v + '…');
  fetchQuotes([v]).then(function () { sim(); }, function () { sim(); });
}
$$('#sim-px,#sim-scope,#pd-guess').forEach(function (el) { el.addEventListener('input', sim); el.addEventListener('change', sim); });

function scenarioNAV(o, sym, shock, scope) {
  var mv = 0;
  PORT.rows.forEach(function (r) {
    var q = r.sym === sym ? o.q : r.qty, p = r.sym === sym ? o.basePx : r.p;
    mv += q * p * (1 + (scope === 'all' || r.sym === sym ? shock : 0));
  });
  if (o.alt) mv += o.alt.q * o.alt.px * (1 + (scope === 'all' ? shock : 0));
  var assets = mv + o.cash, hold = [];
  PORT.rows.forEach(function (r) { var q = r.sym === sym ? o.q : r.qty, p = r.sym === sym ? o.basePx : r.p; hold.push({ sym: r.sym, q: q, p: p * (1 + (scope === 'all' || r.sym === sym ? shock : 0)) }); });
  if (o.alt) hold.push({ sym: o.alt.sym, q: o.alt.q, p: o.alt.px * (1 + (scope === 'all' ? shock : 0)) });
  return { nav: assets - o.debt, rtt: mRtt(hold, o.cash, o.debt) };
}

function sim() {
  if (!PORT || !PD.sym) return;
  var st = PORT.st, sym = PD.sym, r = curRow();
  var px = toDong(parseNum($('#sim-px').value)) || r.p, scope = $('#sim-scope').value;
  var netK = 1 - st.fee - st.tax, buyK = 1 + st.fee;
  $('#sim-now').innerHTML = '<b>' + sym + '</b> đang có ' + nf(r.qty) + ' cp, giá vốn ' + nf(r.cost) + ' đ, thị giá ' + nf(r.p) + ' đ (' + pct(r.plp) + '), chiếm ' + pct(r.w, 1, false) + ' giá trị cổ phiếu.';
  var mvOther = PORT.mv - r.mv;
  function qOf(k) {
    var s = PD.q[k] || { m: 'pct', v: 0.25 }, q;
    if (k === 'buy') q = s.m === 'pct' ? Math.max(100, lot(r.qty * s.v)) : s.m === 'q' ? lot(s.v) : lot(s.v / (px * buyK));
    else { q = s.m === 'pct' ? lot(r.qty * s.v) : s.m === 'q' ? lot(s.v) : lot(s.v / (px * netK)); if (q === 0 && s.m === 'pct') q = 100; q = Math.min(q, r.qty); }
    return q;
  }
  function sell(q, repay) {
    var gross = q * px, net = gross * netK, realized = net - q * r.cost;
    var pay = repay ? Math.min(st.debt, net) : 0;
    return { q: r.qty - q, cost: r.qty - q > 0 ? r.cost : 0, cash: st.cash + net - pay, debt: st.debt - pay, realized: realized, fees: gross * (st.fee + st.tax), basePx: px, net: net, pay: pay };
  }
  var res = {}, opts = [];
  var G = r.plp > 0 && px > r.cost;
  optOrder().forEach(function (k) {
    if (!PD.on[k]) return;
    if (k === 'hold') opts.push({ k: k, label: G ? 'Giữ nguyên, chờ thêm' : 'Giữ nguyên', o: { q: r.qty, cost: r.cost, cash: st.cash, debt: st.debt, realized: 0, fees: 0, basePx: px } });
    if (k === 'sell' || k === 'sellpay' || k === 'swap') {
      var q = qOf(k), o = sell(q, k === 'sellpay');
      if (!q) { res[k] = 'Chưa đủ 100 cp để bán.'; return; }
      res[k] = '→ Bán <b>' + nf(q) + ' cp</b> (' + pct(q / r.qty, 0, false) + ' số đang có), thu về ≈ <b>' + money(o.net) + '</b> sau phí, thuế' + (k === 'sellpay' ? '; trả nợ ' + money(o.pay) + (o.net > o.pay ? ', còn dư ' + money(o.net - o.pay) + ' tiền mặt' : '') : '') + '.';
      if (k === 'swap') {
        var to = PD.to, inP = PORT.rows.filter(function (x) { return x.sym === to; })[0], tp = inP ? inP.p : PX[to] ? PX[to].p : null;
        if (!to) { res[k] += ' Chọn mã muốn mua.'; return; }
        if (to === sym) { res[k] += ' Mã mua phải khác ' + sym + '.'; return; }
        if (!tp) { res[k] += ' Chưa lấy được giá ' + to + '.'; return; }
        var aq = lot(o.net / (tp * buyK));
        if (!aq) { res[k] += ' Số tiền chưa đủ mua 100 cp ' + to + '.'; return; }
        o.cash -= aq * tp * buyK; o.fees += aq * tp * st.fee; o.alt = { sym: to, q: aq, px: tp, ext: !inP };
        res[k] += ' Mua <b>' + nf(aq) + ' cp ' + to + '</b> giá ' + nf(tp) + ' đ' + (inP ? '' : ' (mã mới)') + '.';
        opts.push({ k: k, label: (G ? 'Chốt ' : 'Bán ') + nf(q) + ' cp, mua ' + nf(aq) + ' ' + to, o: o });
      } else opts.push({ k: k, label: G ? 'Chốt lời ' + nf(q) + ' cp' + (k === 'sellpay' ? ', trả nợ' : '') : 'Bán ' + nf(q) + ' cp, ' + (k === 'sellpay' ? 'trả nợ' : 'giữ tiền'), o: o });
    }
    if (k === 'all') opts.push({ k: k, label: (G ? 'Chốt lời hết' : 'Bán hết') + (st.debt ? ', trả nợ' : ''), o: sell(r.qty, !!st.debt) });
    if (k === 'buy') {
      var bq = qOf('buy'), cost = bq * px * buyK, fromCash = PD.src === 'cash' ? Math.min(st.cash, cost) : 0, borrow = cost - fromCash;
      res[k] = '→ Mua <b>' + nf(bq) + ' cp</b>, tốn ≈ <b>' + money(cost) + '</b> (gồm phí)' + (borrow > 0 ? (fromCash > 0 ? ': ' + money(fromCash) + ' tiền mặt, vay thêm ' + money(borrow) : ', vay margin toàn bộ') : ', trả bằng tiền mặt') + '.' + (PD.src === 'cash' && borrow > 0 ? ' Tiền mặt không đủ nên phần thiếu tính là vay margin.' : '');
      opts.push({ k: k, label: (G ? 'Gia tăng ' : 'Mua thêm ') + nf(bq) + ' cp' + (borrow > 0 ? ' (vay)' : ''), o: { q: r.qty + bq, cost: (r.qty * r.cost + cost) / (r.qty + bq), cash: st.cash - fromCash, debt: st.debt + borrow, realized: 0, fees: bq * px * st.fee, basePx: px } });
    }
    if (k === 'deposit') {
      var A = PORT.massets, amt = PD.dep.m === 'all' ? st.debt : PD.dep.m === 'm' ? Math.min(PD.dep.v, st.debt) : Math.max(0, Math.min(st.debt, st.debt - A * (1 - PD.dep.v)));
      if (!amt) { res[k] = 'Tỷ lệ ký quỹ đã ở mức này, không cần nộp thêm.'; return; }
      var nd = st.debt - amt;
      res[k] = '→ Nộp <b>' + money(amt) + '</b>, dư nợ còn ' + money(nd) + ', tỷ lệ ký quỹ lên ' + pct(A ? (A - nd) / A : 1, 1, false) + '.';
      opts.push({ k: k, label: 'Nộp ' + money(amt) + ' trả nợ', o: { q: r.qty, cost: r.cost, cash: st.cash, debt: nd, realized: 0, fees: 0, basePx: px, dep: amt } });
    }
  });
  // cập nhật dòng kết quả và trạng thái nút
  OPT_LOSS.forEach(function (k) { var e = $('#res-' + k); if (e) e.innerHTML = PD.on[k] ? (res[k] || '') : ''; });
  $$('#pd-opts .pd-chip[data-pct]').forEach(function (b) { var s = PD.q[b.getAttribute('data-k')]; b.classList.toggle('on', !!s && s.m === 'pct' && Math.abs(s.v - +b.getAttribute('data-pct')) < 1e-9); });
  $$('#pd-opts .pd-chip[data-to]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-to') === PD.to); });
  $$('#pd-opts .pd-chip[data-src]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-src') === PD.src); });
  $$('#pd-opts .pd-chip[data-dep]').forEach(function (b) { var v = b.getAttribute('data-dep'); b.classList.toggle('on', v === 'all' ? PD.dep.m === 'all' : PD.dep.m === 'rtt' && PD.dep.v === +v); });
  $$('#pd-opts input[data-qk]').forEach(function (inp) { var s = PD.q[inp.getAttribute('data-qk')]; if (document.activeElement !== inp && (!s || s.m !== inp.getAttribute('data-m'))) inp.value = ''; });

  if (!opts.length) {
    LAST_SIM = { sym: sym, px: px, opts: [], date: today() }; LAST_SC = null;
    ['#sim-tbl', '#sc-tbl', '#w-tbl'].forEach(function (id) { $(id).innerHTML = '<tbody><tr><td class="empty">Tích ít nhất một phương án ở Bước 2 để xem hệ quả.</td></tr></tbody>'; });
    $('#trade').innerHTML = ''; aiReset('tong-ket'); return;
  }
  var C = ctx();
  opts.forEach(function (x) {
    var o = x.o, altV = o.alt ? o.alt.q * o.alt.px : 0, mv = mvOther + altV + o.q * px, assets = mv + o.cash;
    var hold = PORT.rows.filter(function (z) { return z.sym !== sym; }).map(function (z) { return { sym: z.sym, q: z.qty, p: z.p }; }).concat([{ sym: sym, q: o.q, p: px }]).concat(o.alt ? [{ sym: o.alt.sym, q: o.alt.q, p: o.alt.px }] : []);
    o.mv = mv; o.nav = assets - o.debt; o.rtt = mRtt(hold, o.cash, o.debt); o.w = mv ? o.q * px / mv : 0;
    // Tiền bán chờ T+2 (anh Hải chốt 21/10/2026): trong lúc chờ, tiền bán chưa trả được nợ
    o.rttT0 = o.pay ? (function () { var A0 = mAssets(hold, o.cash) + o.pay; return st.debt ? (A0 - st.debt) / A0 : 1; })() : null;
    o.be = o.q ? (o.q * o.cost - (o.realized || 0)) / o.q : null;
    o.unreal = o.q * (px - o.cost); o.dtc = dropOne(hold, o.cash, o.debt, sym); o.tolX = null;
    if (C.tol) {
      var expo = scope === 'all' ? mv : o.q * px, lim = (1 - C.tol) * PORT.nav;
      o.tolX = !expo ? { t: 'indep' } : o.nav <= lim ? { t: 'over' } : (o.nav - lim) / expo >= 1 ? { t: 'safe' } : { t: 'x', x: (o.nav - lim) / expo };
    }
  });
  LAST_SIM = { sym: sym, px: px, opts: opts, date: today() };
  var anyDep = opts.some(function (x) { return x.o.dep; });
  var chosen = PLAN[sym] ? PLAN[sym].label : null;
  updSave(opts, chosen, sym);
  var head = '<thead><tr><th></th>' + opts.map(function (x, i) { var on = chosen === x.label; return '<th><b>' + esc(x.label) + '</b><button type="button" class="btn sm ' + (on ? '' : 'ghost ') + 'pick" data-i="' + i + '">' + (on ? '✓ Đã vào phác đồ' : 'Đưa vào phác đồ') + '</button></th>'; }).join('') + '</tr></thead>';
  function row(lbl, f) { return '<tr><td>' + lbl + '</td>' + opts.map(function (x) { return '<td>' + f(x.o) + '</td>'; }).join('') + '</tr>'; }
  $('#sim-tbl').innerHTML = head + '<tbody>' +
    row('Tài sản ròng', function (o) { return '<b>' + money(o.nav) + '</b>' + (o.dep ? '<span class="sub">gồm ' + money(o.dep) + ' nộp thêm</span>' : ''); }) +
    row('Tiền mặt', function (o) { return money(o.cash); }) +
    row('Dư nợ margin', function (o) { return money(o.debt); }) +
    row('Tỷ lệ ký quỹ Rtt', function (o) { return (o.debt ? pct(o.rtt, 1, false) : '–') + (o.rttT0 != null ? '<span class="sub">khi tiền bán về (T+2); trong lúc chờ ' + pct(o.rttT0, 1, false) + '</span>' : ''); }) +
    (anyDep ? row('Tiền nộp thêm từ ngoài', function (o) { return o.dep ? money(o.dep) : '0'; }) : '') +
    row('Khối lượng ' + sym + ' còn lại', function (o) { return nf(o.q); }) +
    row('Giá vốn bình quân ' + sym, function (o) { return o.q ? nf(o.cost) : '–'; }) +
    row('Tỷ trọng ' + sym + ' trong cổ phiếu', function (o) { return pct(o.w, 1, false); }) +
    row('Lãi/lỗ đã chốt (sau phí, thuế)', function (o) { return '<span class="' + cls(o.realized) + '">' + (o.realized ? money(o.realized, true) : '0') + '</span>'; }) +
    row('Lãi/lỗ chưa chốt của ' + sym, function (o) { return o.q ? '<span class="' + cls(o.unreal) + '">' + money(o.unreal, true) + '</span>' : '–'; }) +
    row('Giá hòa vốn cả thương vụ ' + sym + ' <span class="sub">tính cả phần đã chốt</span>', function (o) {
      if (!o.q) return o.realized ? '<span class="sub">Đã thoát hết, ' + (o.realized >= 0 ? 'lãi' : 'lỗ') + ' đã chốt</span>' : '–';
      if (o.be <= 0) return '<b>Không còn rủi ro lỗ</b><span class="sub">phần đã chốt đủ bù kể cả khi phần còn lại về 0</span>';
      return nf(Math.round(o.be / 10) * 10) + ' đ<span class="sub ' + (o.be < px ? 'up' : 'dn') + '">' + (o.be < px ? 'giá giảm ' + pct(1 - o.be / px, 1, false) + ' mới hết lãi' : 'giá cần tăng ' + pct(o.be / px - 1, 1, false) + ' để hòa vốn') + '</span>';
    }) +
    row('Phí + thuế dự kiến', function (o) { return o.fees ? '<span class="dn">' + money(-o.fees) + '</span>' : '0'; }) +
    row(sym + ' giảm bao nhiêu thì chạm ngưỡng call margin', function (o) { return dtcText(o.dtc); }) +
    (C.tol ? row((scope === 'all' ? 'Cả danh mục' : sym) + ' giảm bao nhiêu thì vượt mức chịu đựng ' + pct(C.tol, 0, false) + ' của bạn', function (o) { var t = o.tolX; return !t ? '–' : t.t === 'over' ? '<span class="dn">Đã vượt</span>' : t.t === 'safe' ? 'Không vượt' : t.t === 'indep' ? 'Không phụ thuộc mã này' : 'giảm thêm ' + pct(t.x, 1, false); }) : '') +
    '</tbody>';

  var SR = [-0.3, -0.2, -0.1, 0, 0.1, 0.2].map(function (s) { return { s: s, l: s ? pct(s, 0) : 'Đứng giá', c: '' }; });
  maLevels(sym).concat(G ? [{ n: 'giá vốn', v: Math.round(r.cost) }] : []).forEach(function (lv) {
    var s0 = lv.v / px - 1; if (Math.abs(s0) < 0.005 || Math.abs(s0) > 0.5) return;
    SR.push({ s: s0, l: 'Về ' + lv.n + ' (' + nf(lv.v) + ' đ, ' + pct(s0, 1) + ')', c: 'lvl' });
  });
  SR.sort(function (a, b) { return a.s - b.s; });
  var g = toDong(parseNum($('#pd-guess').value));
  if (g > 0) SR.push({ s: g / px - 1, l: 'Giá bạn đoán ' + nf(g) + ' đ (' + pct(g / px - 1, 0) + ')', c: 'guess' });
  var shocks = SR.map(function (x) { return x.s; }), labels = SR.map(function (x) { return x.l; });
  var sc = shocks.map(function (s) { return opts.map(function (x) { return scenarioNAV(x.o, sym, s, scope); }); });
  $('#sc-tbl').innerHTML = '<thead><tr><th>' + (scope === 'all' ? 'Cả danh mục' : sym) + ' đi tiếp</th>' + opts.map(function (x) { return '<th><b>' + esc(x.label) + '</b></th>'; }).join('') + '</tr></thead><tbody>' +
    sc.map(function (rw, i) {
      var best = Math.max.apply(null, rw.map(function (v) { return v.nav; }));
      return '<tr' + (SR[i].c ? ' class="' + SR[i].c + '"' : '') + '><td>' + labels[i] + '</td>' + rw.map(function (v) {
        var tag = v.rtt < st.force ? ' <span class="dn">· giải chấp</span>' : v.rtt < st.call ? ' <span class="dn">· call margin</span>' : '';
        return '<td class="' + (Math.abs(v.nav - best) < 1 && rw.length > 1 ? 'best' : '') + '">' + money(v.nav) + '<span class="sub ' + cls(v.nav - PORT.nav) + '">' + money(v.nav - PORT.nav, true) + ' so với hiện tại</span>' + tag + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';
  LAST_SC = { shocks: shocks, scope: scope, sc: sc };

  var syms = PORT.rows.slice().sort(function (a, b) { return b.mv - a.mv; }).map(function (z) { return z.sym; });
  opts.forEach(function (x) { if (x.o.alt && syms.indexOf(x.o.alt.sym) < 0) syms.push(x.o.alt.sym); });
  $('#w-tbl').innerHTML = '<thead><tr><th>Mã</th>' + opts.map(function (x) { return '<th><b>' + esc(x.label) + '</b></th>'; }).join('') + '</tr></thead><tbody>' +
    syms.map(function (m) {
      var cur = PORT.rows.filter(function (z) { return z.sym === m; })[0], cw = cur ? cur.w : 0;
      return '<tr><td><span class="tk">' + m + '</span><span class="sub">' + (cur ? 'hiện ' + pct(cw, 1, false) : 'mã mới') + '</span></td>' + opts.map(function (x) {
        var o = x.o, v = (m === sym ? o.q * px : cur ? cur.mv : 0) + (o.alt && o.alt.sym === m ? o.alt.q * o.alt.px : 0), w = o.mv ? v / o.mv : 0, dw = w - cw;
        return '<td>' + pct(w, 1, false) + (Math.abs(dw) >= 0.001 ? '<span class="sub ' + (dw > 0 ? 'up' : 'dn') + '">' + (dw > 0 ? '+' : MINUS) + nf(Math.abs(dw * 100), 1) + ' điểm</span>' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('') + '<tr><td>Tiền mặt / tài sản ròng</td>' + opts.map(function (x) { return '<td>' + (x.o.nav > 0 ? pct(x.o.cash / x.o.nav, 1, false) : '–') + '</td>'; }).join('') + '</tr></tbody>';
  aiReset('tong-ket');
  var holdO = { q: r.qty, cost: r.cost, cash: st.cash, debt: st.debt, basePx: px }, h20 = scenarioNAV(holdO, sym, -0.2, scope).nav, hu20 = scenarioNAV(holdO, sym, 0.2, scope).nav;
  $('#trade').innerHTML = opts.map(function (x) {
    var o = x.o, dn = scenarioNAV(o, sym, -0.2, scope).nav - h20, up = scenarioNAV(o, sym, 0.2, scope).nav - hu20, t = [];
    if (x.k === 'hold' && G) {
      t.push('Không tốn phí; lãi chưa chốt ' + money(o.unreal) + ' tiếp tục chạy theo giá.');
      var mb = maBelow(sym, px);
      t.push(mb ? sym + ' lùi về ' + mb.n + ' (' + nf(mb.v) + ' đ) thì lãi chưa chốt còn ' + money(o.q * (mb.v - o.cost)) + '; giá về ' + nf(Math.round(o.cost)) + ' đ (' + pct(o.cost / px - 1, 1) + ') là hết lãi.' : 'Giá về ' + nf(Math.round(o.cost)) + ' đ (' + pct(o.cost / px - 1, 1) + ') là hết lãi.');
      if (o.debt) t.push('Rtt giữ nguyên ' + pct(o.rtt, 1, false) + '. ' + dtcSentence(o.dtc, sym));
    } else if (x.k === 'hold') {
      t.push('Không tốn phí, không chốt lỗ, giữ nguyên cơ hội hồi phục.');
      t.push('Nếu ' + sym + ' giảm thêm 20%, tài sản ròng mất ' + money(PORT.nav - h20) + '.');
      if (o.debt) t.push('Rtt giữ nguyên ' + pct(o.rtt, 1, false) + '. ' + dtcSentence(o.dtc, sym));
    } else if (x.k === 'deposit') {
      t.push('Nộp thêm ' + money(o.dep) + ' từ ngoài: nợ còn ' + money(o.debt) + ', Rtt lên ' + pct(o.rtt, 1, false) + '. Không chốt lỗ, không tốn phí giao dịch.');
      t.push('Tài sản ròng tăng đúng bằng số tiền nộp: đó là tiền của bạn chuyển vào, không phải lãi. Số tiền này không còn dùng cho việc khác được.');
      t.push(dtcSentence(o.dtc, sym));
    } else {
      if (o.realized) t.push((o.realized < 0 ? 'Chốt lỗ ' : 'Chốt lãi ') + money(Math.abs(o.realized)) + ' (đã gồm ' + money(o.fees) + ' phí, thuế).');
      if (x.k === 'swap') t.push('Tỷ trọng ' + sym + ' từ ' + pct(r.w, 0, false) + ' còn ' + pct(o.w, 0, false) + '; tiền chuyển sang ' + o.alt.sym + ', nợ giữ nguyên. Rủi ro chuyển từ ' + sym + ' sang ' + o.alt.sym + ' chứ không mất đi.');
      else if (x.k === 'buy' && o.cost > r.cost) t.push('Giá vốn bình quân từ ' + nf(Math.round(r.cost)) + ' lên ' + nf(Math.round(o.cost)) + ' đ: vị thế lớn hơn nhưng đệm lãi mỏng đi, giá chỉ cần giảm ' + pct(1 - o.cost / px, 1, false) + ' là cả vị thế hết lãi (trước đó là ' + pct(1 - r.cost / px, 1, false) + '). Tỷ trọng ' + sym + ' lên ' + pct(o.w, 0, false) + (o.debt > st.debt ? ', nợ tăng ' + money(o.debt - st.debt) : '') + '.');
      else if (x.k === 'buy') t.push('Giá vốn từ ' + nf(Math.round(r.cost)) + ' xuống ' + nf(Math.round(o.cost)) + ' đ: đẹp hơn trên giấy, nhưng tỷ trọng ' + sym + ' tăng lên ' + pct(o.w, 0, false) + (o.debt > st.debt ? ' và nợ tăng ' + money(o.debt - st.debt) : '') + '.');
      else if (x.k === 'all' && G) t.push('Lãi được khóa thành tiền' + (o.debt < st.debt ? ', nợ giảm ' + money(st.debt - o.debt) : '') + '; đổi lại, nếu ' + sym + ' tiếp tục tăng thì bạn không còn hưởng phần đó.');
      else t.push('Tỷ trọng ' + sym + ' từ ' + pct(r.w, 0, false) + ' còn ' + pct(o.w, 0, false) + (o.debt < st.debt ? '; nợ giảm ' + money(st.debt - o.debt) : '; tiền mặt tăng ' + money(o.cash - st.cash)) + '.');
      if (G && o.q && o.q < r.qty && o.be != null) t.push('Phần ' + nf(o.q) + ' cp còn lại: ' + (o.be <= 0 ? 'phần đã chốt đủ bù kể cả khi giá về 0.' : 'giá về ' + nf(Math.round(o.be / 10) * 10) + ' đ (' + pct(o.be / px - 1, 1) + ') mới làm cả thương vụ hết lãi, thay vì ' + nf(Math.round(r.cost)) + ' đ nếu giữ nguyên.'));
      t.push('So với giữ nguyên: nếu ' + sym + ' giảm thêm 20% thì <span class="' + cls(dn) + '">' + money(dn, true) + '</span>; nếu tăng 20% thì <span class="' + cls(up) + '">' + money(up, true) + '</span>.');
      if (o.debt) t.push('Rtt ' + pct(o.rtt, 1, false) + '. ' + dtcSentence(o.dtc, sym));
    }
    x.trade = t.map(function (s) { return s.replace(/<[^>]+>/g, ''); });
    return '<div><b>' + esc(x.label) + '</b>' + t.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>';
  }).join('');
}
/* Nút lưu ngay cuối mỗi ô phương án đã tích (anh Hải yêu cầu 18/10/2026) */
function updSave(opts, chosen, sym) {
  $$('#pd-opts .pd-save').forEach(function (el) {
    var k = el.getAttribute('data-k'), i = -1;
    opts.forEach(function (x, j) { if (x.k === k) i = j; });
    if (!PD.on[k] || i < 0) { el.hidden = true; el.innerHTML = ''; return; }
    var on = chosen === opts[i].label;
    el.innerHTML = on ? '<button type="button" class="btn pd-savebtn done" data-pi="' + i + '">✓ Đã lưu vào phác đồ: ' + esc(opts[i].label) + '</button>'
      : '<button type="button" class="btn pd-savebtn" data-pi="' + i + '">Lưu phương án này vào phác đồ ' + sym + ' →</button><span class="note">Lưu xong chuyển sang mã tiếp theo; Bước 4 gộp lại cho cả danh mục.</span>';
    el.hidden = false;
  });
}
$('#pd-opts').addEventListener('click', function (e) {
  var b = e.target.closest('.pd-savebtn'); if (!b || !LAST_SIM) return;
  e.preventDefault(); addToPlan(+b.getAttribute('data-pi'));
});
$('#sim-tbl').addEventListener('click', function (e) {
  var b = e.target.closest('.pick'); if (!b || !LAST_SIM) return;
  addToPlan(+b.getAttribute('data-i'));
});

/* ---------- 3 · BƯỚC 4: PHÁC ĐỒ CẢ DANH MỤC (gộp quyết định nhiều mã) ---------- */
var PLAN = {}, PLAN_ORDER = [], LAST_COMBO = null;
function addToPlan(i) {
  var x = LAST_SIM.opts[i], sym = LAST_SIM.sym, o = x.o;
  PLAN[sym] = { sym: sym, k: x.k, label: x.label, trade: x.trade || [],
    o: { q: o.q, cost: o.cost, cash: o.cash, debt: o.debt, realized: o.realized || 0, fees: o.fees || 0, basePx: o.basePx, alt: o.alt ? { sym: o.alt.sym, q: o.alt.q, px: o.alt.px } : null, dep: o.dep || 0, be: o.be } };
  if (PLAN_ORDER.indexOf(sym) < 0) PLAN_ORDER.push(sym);
  renderChips(); sim(); renderPlan();
  var left = PORT.rows.filter(function (r) { return !PLAN[r.sym]; }).sort(function (a, b) { return b.w - a.w; });
  var m = $('#plan-msg');
  m.innerHTML = '✓ Đã đưa <b>' + sym + ' · ' + esc(x.label) + '</b> vào phác đồ (' + PLAN_ORDER.length + '/' + PORT.rows.length + ' mã). ' +
    (left.length ? '<button type="button" class="btn sm" data-next="' + left[0].sym + '">Xử lý tiếp ' + left[0].sym + ' →</button> ' : '') +
    '<button type="button" class="btn sm ghost" data-goplan="1">Xem phác đồ cả danh mục</button>';
  m.hidden = false;
  setTimeout(function () { $('#pd-syms').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
}
document.addEventListener('click', function (e) {
  var n = e.target.closest('[data-next]'); if (n) { setSym(n.getAttribute('data-next')); renderChips(); $('#plan-msg').hidden = true; return; }
  if (e.target.closest('[data-goplan]')) { $('#plan-box').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  var d = e.target.closest('[data-unplan]'); if (d) { var s = d.getAttribute('data-unplan'); delete PLAN[s]; PLAN_ORDER = PLAN_ORDER.filter(function (x) { return x !== s; }); renderChips(); sim(); renderPlan(); return; }
  var ed = e.target.closest('[data-edit]'); if (ed) { setSym(ed.getAttribute('data-edit')); renderChips(); $('#pd-syms').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

function portStats(H, cash, debt) {
  var rows = Object.keys(H).map(function (k) { return H[k]; }).filter(function (h) { return h.q > 0; });
  var mv = rows.reduce(function (a, h) { return a + h.q * h.px; }, 0), assets = mv + cash, nav = assets - debt;
  rows.forEach(function (h) { h.mv = h.q * h.px; h.w = mv ? h.mv / mv : 0; });
  var top = rows.slice().sort(function (a, b) { return b.w - a.w; })[0] || null, sec = {};
  rows.forEach(function (h) { sec[h.sector] = (sec[h.sector] || 0) + h.w; });
  var lev = nav > 0 ? assets / nav : Infinity;
  var hold = rows.map(function (h) { return { sym: h.sym, q: h.q, p: h.px }; });
  return { rows: rows, mv: mv, cash: cash, debt: debt, assets: assets, nav: nav, rtt: mRtt(hold, cash, debt), lev: lev, top: top, sec: sec,
    dtc: dropAll(hold, cash, debt), beh: top ? behScore(top.w, rows.length, debt ? lev : 1, nav > 0 ? cash / nav : 0) : 0 };
}
function combine() {
  var st = PORT.st, H0 = {}, H = {}, cash = st.cash, debt = st.debt, realized = 0, fees = 0, dep = 0, acts = [];
  PORT.rows.forEach(function (r) { H0[r.sym] = { sym: r.sym, q: r.qty, cost: r.cost, px: r.p, sector: r.sector }; H[r.sym] = { sym: r.sym, q: r.qty, cost: r.cost, px: r.p, sector: r.sector }; });
  PLAN_ORDER.forEach(function (sym) {
    var a = PLAN[sym], o = a.o, h = H[sym]; if (!a || !h) return; acts.push(a);
    h.q = o.q; h.cost = o.cost; h.px = o.basePx;
    cash += o.cash - st.cash; debt += o.debt - st.debt; realized += o.realized; fees += o.fees; dep += o.dep;
  });
  acts.forEach(function (a) {
    var al = a.o.alt; if (!al) return;
    var t = H[al.sym] || (H[al.sym] = { sym: al.sym, q: 0, cost: al.px, px: al.px, sector: sectorOf(al.sym), ext: true });
    t.cost = (t.q * t.cost + al.q * al.px) / (t.q + al.q); t.q += al.q;
  });
  if (debt < 0) { cash -= debt; debt = 0; }
  if (cash < 0) { debt -= cash; cash = 0; }
  var B = portStats(H0, st.cash, st.debt), A = portStats(H, cash, debt);
  return { B: B, A: A, acts: acts, realized: realized, fees: fees, dep: dep, H0: H0, H: H };
}
function renderPlan() {
  var list = $('#plan-list'), res = $('#plan-res'); if (!list || !PORT) return;
  if (!PLAN_ORDER.length) {
    list.innerHTML = '<p class="note">Chưa có mã nào trong phác đồ. Ở Bước 3, bấm <b>"Đưa vào phác đồ"</b> ở đầu cột phương án bạn chọn cho từng mã. Mã nào chưa quyết định được tính là giữ nguyên.</p>';
    res.innerHTML = ''; LAST_COMBO = null; return;
  }
  var C = combine(), B = C.B, A = C.A, st = PORT.st, K = ctx(); LAST_COMBO = C;
  var undec = PORT.rows.filter(function (r) { return !PLAN[r.sym]; }).map(function (r) { return r.sym; });
  list.innerHTML = '<ol class="pl-acts">' + C.acts.map(function (a) {
    var r = PORT.rows.filter(function (z) { return z.sym === a.sym; })[0];
    return '<li><div><b>' + a.sym + '</b> · ' + esc(a.label) + '<span class="sub">' + (a.trade[0] ? esc(a.trade[0]) : '') + '</span></div><span class="pl-btn"><button type="button" class="btn sm ghost" data-edit="' + a.sym + '">Sửa</button><button type="button" class="btn sm ghost danger" data-unplan="' + a.sym + '">Bỏ</button></span></li>';
  }).join('') + '</ol>' + (undec.length ? '<p class="note">Chưa quyết định (tính là giữ nguyên): ' + undec.map(function (s) { return '<button type="button" class="lnk" data-edit="' + s + '">' + s + '</button>'; }).join(', ') + '.</p>' : '<p class="note">Đã có quyết định cho tất cả ' + PORT.rows.length + ' mã.</p>');
  function row(l, f, g) { var a = f(B), b = f(A); return '<tr><td>' + l + '</td><td>' + a + '</td><td><b>' + b + '</b>' + (g ? g() : '') + '</td></tr>'; }
  function dtcT(d) { return d.t === 'x' ? 'giảm thêm ' + pct(d.x, 1, false) : d.t === 'none' ? 'Không vay' : d.t === 'safe' ? 'Không chạm' : 'Đã dưới ngưỡng'; }
  var tolF = function (S) { if (!K.tol || !S.mv) return '–'; var lim = (1 - K.tol) * PORT.nav, x = (S.nav - lim) / S.mv; return S.nav <= lim ? 'Đã vượt' : x >= 1 ? 'Không vượt' : 'giảm thêm ' + pct(x, 1, false); };
  var h = '<h4 class="pl-h">Trước và sau phác đồ</h4><div class="tw"><table class="bs-t bs-cmp"><thead><tr><th></th><th>Hiện tại</th><th>Sau phác đồ</th></tr></thead><tbody>' +
    row('Tài sản ròng', function (S) { return money(S.nav); }, function () { return C.dep ? '<span class="sub">gồm ' + money(C.dep) + ' nộp thêm</span>' : ''; }) +
    row('Giá trị cổ phiếu', function (S) { return money(S.mv); }) +
    row('Tiền mặt', function (S) { return money(S.cash) + (S.nav > 0 ? '<span class="sub">' + pct(S.cash / S.nav, 0, false) + ' tài sản ròng</span>' : ''); }) +
    row('Dư nợ margin', function (S) { return money(S.debt); }) +
    row('Tỷ lệ ký quỹ Rtt <span class="sub">sau phác đồ: khi tiền bán đã về (T+2)</span>', function (S) { return S.debt ? pct(S.rtt, 1, false) : '–'; }) +
    row('Đòn bẩy', function (S) { return S.debt ? nf(S.lev, 2) + ' lần' : '1 lần (không vay)'; }) +
    row('Số mã · mã lớn nhất', function (S) { return S.rows.length + ' mã · ' + (S.top ? S.top.sym + ' ' + pct(S.top.w, 0, false) : '–'); }) +
    row('Cả danh mục giảm bao nhiêu thì chạm ngưỡng call margin', function (S) { return dtcT(S.dtc); }) +
    (K.tol ? row('Cả danh mục giảm bao nhiêu thì vượt mức chịu đựng ' + pct(K.tol, 0, false) + ' của bạn', tolF) : '') +
    row('Khẩu vị danh mục thể hiện', function (S) { return kvLevel(S.beh).name + ' · ' + S.beh + '/100'; }) +
    '<tr><td>Lãi/lỗ đã chốt (sau phí, thuế)</td><td>–</td><td><b class="' + cls(C.realized) + '">' + (C.realized ? money(C.realized, true) : '0') + '</b></td></tr>' +
    '<tr><td>Phí + thuế dự kiến</td><td>–</td><td>' + (C.fees ? '<span class="dn">' + money(-C.fees) + '</span>' : '0') + '</td></tr>' +
    '</tbody></table></div>';
  var KP = profile();
  if (KP.decL) {
    var g0 = B.beh - KP.dec, g1 = A.beh - KP.dec;
    h += '<p class="kv-gap' + (Math.abs(g1) < 20 ? ' g' : g1 >= 20 ? ' w' : '') + '"><b>So với khẩu vị bạn khai (' + KP.decL.name.toLowerCase() + ', ' + KP.dec + '/100):</b> danh mục ' + (Math.abs(g1) < 20 ? 'sau phác đồ khớp với khẩu vị' : g1 >= 20 ? 'sau phác đồ vẫn rủi ro hơn khẩu vị ' + g1 + ' điểm' : 'sau phác đồ an toàn hơn khẩu vị ' + (-g1) + ' điểm') + (Math.abs(g0 - g1) >= 3 ? ' (hiện tại lệch ' + (g0 > 0 ? '+' : '') + g0 + ' điểm).' : '.') + '</p>';
  }
  var syms = B.rows.map(function (r) { return r.sym; }); A.rows.forEach(function (r) { if (syms.indexOf(r.sym) < 0) syms.push(r.sym); });
  var wB = {}, wA = {}; B.rows.forEach(function (r) { wB[r.sym] = r.w; }); A.rows.forEach(function (r) { wA[r.sym] = r.w; });
  syms.sort(function (a, b) { return (wA[b] || 0) - (wA[a] || 0); });
  h += '<h4 class="pl-h">Tỷ trọng từng mã</h4><div class="tw"><table class="bs-t bs-cmp"><thead><tr><th>Mã</th><th>Hiện tại</th><th>Sau phác đồ</th></tr></thead><tbody>' + syms.map(function (m) {
    var a = wB[m] || 0, b = wA[m] || 0, d = b - a, hA = C.H[m];
    return '<tr><td><span class="tk">' + m + '</span>' + (PLAN[m] ? '<span class="sub">' + esc(PLAN[m].label) + '</span>' : hA && hA.ext ? '<span class="sub">mã mới</span>' : '') + '</td><td>' + pct(a, 1, false) + '</td><td><b>' + (b ? pct(b, 1, false) : 'Không còn') + '</b>' + (Math.abs(d) >= 0.001 ? '<span class="sub ' + (d > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '+' : MINUS) + nf(Math.abs(d * 100), 1) + ' điểm</span>' : '') + '</td></tr>';
  }).join('') + '</tbody></table></div>';
  var shocks = [-0.3, -0.2, -0.1, 0, 0.1, 0.2];
  h += '<h4 class="pl-h">Tài sản ròng nếu cả danh mục đi tiếp</h4><div class="tw"><table class="bs-t bs-cmp"><thead><tr><th>Cả danh mục</th><th>Hiện tại</th><th>Sau phác đồ</th></tr></thead><tbody>' + shocks.map(function (sh) {
    function v(S) { var mv = S.mv * (1 + sh), as = mv + S.cash, nv = as - S.debt, rt = as ? nv / as : 1; return { nav: nv, tag: S.debt && rt < st.force ? ' <span class="dn">· giải chấp</span>' : S.debt && rt < st.call ? ' <span class="dn">· call margin</span>' : '' }; }
    var a = v(B), b = v(A), d = b.nav - a.nav;
    return '<tr><td>' + (sh ? pct(sh, 0) : 'Đứng giá') + '</td><td>' + money(a.nav) + a.tag + '</td><td><b>' + money(b.nav) + '</b>' + b.tag + '<span class="sub ' + cls(d) + '">' + money(d, true) + ' so với hiện tại</span></td></tr>';
  }).join('') + '</tbody></table></div><p class="note">Giả định mọi mã cùng tăng giảm một tỷ lệ; các mã đã quyết định tính theo giá giao dịch giả định của từng mã. Tiền thu về và nợ được bù trừ chung: tiền mặt âm tính thành vay thêm, trả nợ thừa tính thành tiền mặt. Chưa tính lãi vay margin theo thời gian.</p>';
  res.innerHTML = h;
}

/* ---------- các chặng: bấm mới mở ---------- */
function openStage(id, scroll) {
  $$('.bs-stage').forEach(function (s) {
    var on = s.id === id, h = $('.bs-stage-h', s), b = $('.bs-stage-b', s);
    b.hidden = !on; h.setAttribute('aria-expanded', String(on)); s.classList.toggle('open', on);
  });
  if (scroll) setTimeout(function () { $('#' + id).scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
  updateSteps();
}
function lockStages(lock) {
  ['kham', 'bat-benh', 'phac-do'].forEach(function (id) { var s = $('#' + id); s.classList.toggle('locked', lock); $('.bs-stage-h', s).disabled = lock; if (lock) { $('.bs-stage-b', s).hidden = true; s.classList.remove('open'); } });
  $('#lock-note').hidden = !lock; updateSteps();
}
$$('.bs-stage-h').forEach(function (h) {
  h.addEventListener('click', function () { var s = h.closest('.bs-stage'); if (s.classList.contains('open')) { $('.bs-stage-b', s).hidden = true; h.setAttribute('aria-expanded', 'false'); s.classList.remove('open'); updateSteps(); } else openStage(s.id, true); });
});
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-open]'); if (b) { openStage(b.getAttribute('data-open'), true); return; }
  var a = e.target.closest('.bs-steps a'); if (!a) return;
  var id = a.getAttribute('data-step'), s = $('#' + id);
  if (s && s.classList.contains('bs-stage')) { e.preventDefault(); if (!s.classList.contains('locked')) openStage(id, true); }
});

/* ---------- 4 · CHỐT KẾ HOẠCH ---------- */
var J = load(JKEY, []), PENDING = null;
function openPlanJournal() {
  if (!PORT) return;
  if (!PLAN_ORDER.length) { openStage('phac-do', false); var m = $('#plan-msg'); m.innerHTML = 'Chưa có mã nào trong phác đồ. Ở Bước 3, bấm <b>"Đưa vào phác đồ"</b> ở đầu cột phương án bạn chọn.'; m.hidden = false; $('#pd-syms').closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  var CB = combine(), A = CB.A, B = CB.B, st = PORT.st, C = ctx(), w = [], chg = [];
  var snap = function (H) { return Object.keys(H).map(function (k) { return { sym: k, q: H[k].q, px: H[k].px }; }).filter(function (h) { return h.q > 0; }); };
  PENDING = { id: Date.now().toString(36), date: today(), multi: true, vni: PX.VNINDEX ? PX.VNINDEX.p : null,
    acts: CB.acts.map(function (a) { return { sym: a.sym, choice: a.label, px: a.o.basePx, trade: a.trade }; }),
    before: { h: snap(CB.H0), cash: B.cash, debt: B.debt }, after: { h: snap(CB.H), cash: A.cash, debt: A.debt, dep: CB.dep },
    sum: { navB: B.nav, navA: A.nav, rttB: B.rtt, rttA: A.rtt, realized: CB.realized, fees: CB.fees, behB: B.beh, behA: A.beh },
    navNow: PORT.nav, ctx: ctxText() };
  PENDING.sym = CB.acts.map(function (a) { return a.sym; }).join(', ');
  PENDING.choice = CB.acts.length + ' quyết định';
  if (A.debt) w.push('Tỷ lệ ký quỹ không xuống dưới ' + pct(Math.min(0.95, st.call + 0.1), 0, false) + ' (ngưỡng call ' + pct(st.call, 0, false) + '; sau phác đồ là ' + pct(A.rtt, 1, false) + ')');
  CB.acts.forEach(function (a) {
    if (!a.o.q) return; var mb = maBelow(a.sym, a.o.basePx), F = FUND[a.sym], fr = fundRead(F);
    if (mb) w.push('Giá ' + a.sym + ' giữ trên ' + mb.n + ' (≈ ' + nf(mb.v) + ' đ lúc lập kế hoạch)');
    if (a.o.be != null && a.o.be > 0 && a.o.be < a.o.basePx) w.push('Giá ' + a.sym + ' chưa về mức hòa vốn cả thương vụ ' + nf(Math.round(a.o.be / 10) * 10) + ' đ');
    w.push('Kết quả kinh doanh quý tới của ' + a.sym + (fr && F.npY != null ? ' so với ' + fr.q + ' (lợi nhuận ' + (F.npY >= 0 ? 'tăng ' : 'giảm ') + pct(Math.abs(F.npY), 0, false) + ' so với cùng kỳ)' : ''));
    if (mb) chg.push('Giá ' + a.sym + ' thủng ' + mb.n + ' và đà giảm tăng tốc');
  });
  CB.acts.forEach(function (a) { if (a.o.alt) w.push('Kết quả kinh doanh của ' + a.o.alt.sym + ' (mã nhận thêm tiền)'); });
  if (C.liq === '3m' || C.liq === '1y') w.push('Tiền mặt đủ cho khoản có thể cần rút ' + (C.liq === '3m' ? 'trong 3 tháng' : 'trong năm') + ' (sau phác đồ: ' + money(A.cash) + ')');
  if (PX.VNINDEX) w.push('VN-Index (lúc lập kế hoạch ' + nf(PX.VNINDEX.p, 2) + ' điểm) không giảm quá 10%');
  if (A.dtc.t === 'x') chg.push('Cả danh mục giảm thêm ' + pct(A.dtc.x, 1, false) + ' thì chạm ngưỡng call margin');
  chg.push('Kết quả kinh doanh hoặc tin công bố của các mã chính khác hẳn kỳ vọng');
  chg.push('Bạn phải rút tiền sớm hơn hoặc nhiều hơn dự kiến');
  if (A.debt) chg.push('Lãi suất margin hoặc danh mục cho vay của công ty chứng khoán thay đổi');
  chg.push('Thị trường chung đổi chiều mạnh (VN-Index biến động quá 10%)');
  var miss = DIAG.filter(function (z) { return z.lv === 'info' && /chưa đủ/.test(z.title); }).map(function (z) { return z.fact.replace(/<[^>]+>/g, '').replace(/^Còn thiếu: /, ''); });
  if (st.debt || A.debt) miss.push('lãi vay margin phải trả theo thời gian chưa được tính vào kết quả');
  var undec = PORT.rows.filter(function (r) { return !PLAN[r.sym]; }).map(function (r) { return r.sym; });
  PENDING.miss = miss; PENDING.chg = chg;
  PENDING.trade = ['Tài sản ròng ' + money(B.nav) + ' → ' + money(A.nav) + (CB.dep ? ' (gồm ' + money(CB.dep) + ' nộp thêm)' : ''), 'Tiền mặt ' + money(B.cash) + ' → ' + money(A.cash) + '; dư nợ ' + money(B.debt) + ' → ' + money(A.debt) + (A.debt ? '; Rtt ' + pct(A.rtt, 1, false) : ''),
    'Lãi/lỗ chốt ' + (CB.realized ? money(CB.realized, true) : '0') + ', phí thuế ' + money(CB.fees), 'Mã lớn nhất sau phác đồ: ' + (A.top ? A.top.sym + ' ' + pct(A.top.w, 0, false) : '–') + '; khẩu vị danh mục ' + kvLevel(B.beh).name + ' → ' + kvLevel(A.beh).name];
  $('#jr-title').textContent = 'Phác đồ ' + CB.acts.length + ' mã (' + PENDING.sym + ')';
  $('#jr-auto').innerHTML = '<div><b>Các quyết định</b><ul>' + PENDING.acts.map(function (a) { return '<li><b>' + a.sym + '</b>: ' + esc(a.choice) + ' (giá giả định ' + nf(a.px) + ' đ)</li>'; }).join('') + (undec.length ? '<li>Giữ nguyên: ' + undec.join(', ') + '</li>' : '') + '</ul></div>' +
    '<div><b>Hệ quả cả danh mục</b><ul>' + PENDING.trade.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
    '<div><b>Hoàn cảnh</b>' + (PENDING.ctx.length ? '<ul>' + PENDING.ctx.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<span>Chưa trả lời chặng 2.</span>') + '</div>' +
    '<div><b>Dữ liệu còn thiếu</b>' + (miss.length ? '<ul>' + miss.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<span>Không có.</span>') + '</div>' +
    '<div><b>Điều có thể làm kết luận thay đổi</b><ul>' + chg.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
  var days = C.hz === 's' ? 14 : C.hz === 'l' ? 90 : 30;
  var d = new Date(Date.now() + 7 * 3600 * 1000 + days * 86400000); $('#jr-review').value = d.toISOString().slice(0, 10);
  $('#jr-why').value = ''; $('#jr-watch').value = w.filter(function (v, i2, ar) { return ar.indexOf(v) === i2; }).join('\n');
  aiReset('tong-ket'); $('#jr-form').hidden = false; $('#jr-hint').hidden = true; openStage('tien-hanh', true); setTimeout(function () { $('#jr-why').focus(); }, 400);
}
$('#plan-go').addEventListener('click', openPlanJournal);
$('#jr-cancel').addEventListener('click', function () { $('#jr-form').hidden = true; $('#jr-hint').hidden = false; PENDING = null; });
$('#jr-form').addEventListener('submit', function (e) {
  e.preventDefault(); if (!PENDING) return;
  PENDING.why = $('#jr-why').value.trim();
  PENDING.watch = $('#jr-watch').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) { return { t: s, st: '?' }; });
  PENDING.review = $('#jr-review').value; PENDING.lesson = '';
  J.unshift(PENDING); store(JKEY, J); PENDING = null; $('#jr-form').hidden = true; $('#jr-hint').hidden = false; renderJournal();
});
function renderJournal() {
  var box = $('#jr-list');
  renderBrief();
  if (!J.length) { box.innerHTML = '<p class="empty">Chưa có kế hoạch nào.</p>'; return; }
  var syms = J.reduce(function (a, e) { return e.multi ? a.concat(e.before.h.concat(e.after.h).map(function (h) { return h.sym; })) : a.concat([e.sym]); }, []).concat(J.reduce(function (a, e) { return a.concat((e.opts || []).filter(function (o) { return o.alt; }).map(function (o) { return o.alt.sym; })); }, [])).concat(['VNINDEX']).filter(function (v, i, a) { return a.indexOf(v) === i; });
  var need = syms.filter(function (s) { return !PX[s]; });
  (need.length ? fetchQuotes(need).catch(function () {}) : Promise.resolve()).then(function () {
    box.innerHTML = J.map(function (e, idx) {
      if (e.multi) return multiCard(e, idx);
      var now = PX[e.sym] ? PX[e.sym].p : null, vn = PX.VNINDEX ? PX.VNINDEX.p : null, due = e.review && e.review <= today();
      var cmp = '';
      if (now) {
        var vals = e.opts.map(function (o) { return o.q * now + o.cash - o.debt + (o.alt ? o.alt.q * (PX[o.alt.sym] ? PX[o.alt.sym].p : o.alt.px) : 0); }), chosen = vals[e.opts.map(function (o) { return o.label; }).indexOf(e.choice)];
        cmp = '<div class="tw"><table class="bs-t"><thead><tr><th>Nếu khi đó chọn</th><th class="n">Tài sản ròng hôm nay so với lựa chọn của bạn</th></tr></thead><tbody>' +
          e.opts.map(function (o, i) { var dlt = vals[i] - chosen; return '<tr><td>' + esc(o.label) + (o.label === e.choice ? ' <b>(đã chọn)</b>' : '') + '</td><td class="n ' + cls(dlt) + '">' + (o.label === e.choice ? '–' : money(dlt, true)) + '</td></tr>'; }).join('') +
          '</tbody></table></div><p class="note">Số dương: phương án đó hôm nay cho tài sản ròng cao hơn lựa chọn của bạn; số âm: thấp hơn. Chỉ tính phần ' + e.sym + ', tiền mặt và dư nợ, theo giá ' + e.sym + ' hiện tại. Kết quả tốt hay xấu chưa nói lên quyết định đúng hay sai: hãy xem các giả định ở trên có đứng vững không.</p>';
      }
      return '<article class="jr" data-i="' + idx + '"><div class="jr-h"><b>' + e.sym + ' · ' + esc(e.choice) + '</b><span>' + vnDate(e.date) + (due ? ' <em class="due">Đến hạn đánh giá lại</em>' : e.review ? ' · đánh giá lại ' + vnDate(e.review) : '') + '</span></div>' +
        '<p>Giá lúc quyết định ' + nf(e.px) + ' đ' + (now ? ' → hôm nay ' + nf(now) + ' đ (<span class="' + cls(now - e.px) + '">' + pct(now / e.px - 1) + '</span>)' : '') +
        (e.vni && vn ? ' · VN-Index ' + nf(e.vni, 2) + ' → ' + nf(vn, 2) + ' (<span class="' + cls(vn - e.vni) + '">' + pct(vn / e.vni - 1) + '</span>)' : '') + '</p>' +
        (e.trade && e.trade.length ? '<b>Đánh đổi đã chấp nhận</b><ul class="plain">' + e.trade.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        (e.ctx && e.ctx.length ? '<p><b>Hoàn cảnh lúc đó:</b> ' + esc(e.ctx.join('; ')) + '.</p>' : '') +
        (e.why ? '<p><b>Vì sao chọn:</b> ' + esc(e.why) + '</p>' : '') +
        (e.chg && e.chg.length ? '<b>Điều có thể làm kết luận thay đổi</b><ul class="plain">' + e.chg.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        (e.miss && e.miss.length ? '<b>Dữ liệu còn thiếu</b><ul class="plain">' + e.miss.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        (e.watch && e.watch.length ? '<b>Điều kiện theo dõi</b><ul class="watch">' + e.watch.map(function (w, wi) {
          return '<li><select data-w="' + wi + '" aria-label="Trạng thái"><option value="?"' + (w.st === '?' ? ' selected' : '') + '>Chưa rõ</option><option value="y"' + (w.st === 'y' ? ' selected' : '') + '>Đang đúng</option><option value="n"' + (w.st === 'n' ? ' selected' : '') + '>Đã sai</option></select>' + esc(w.t) + '</li>';
        }).join('') + '</ul>' : '') + cmp +
        '<label>Bài học rút ra (điền khi đánh giá lại)<textarea rows="2" class="lesson">' + esc(e.lesson || '') + '</textarea></label>' +
        '<div class="bs-row end" style="margin-top:0"><button type="button" class="btn sm ghost cp">Sao chép kế hoạch</button><button type="button" class="btn sm ghost danger del">Xóa kế hoạch này</button></div></article>';
    }).join('');
    renderBrief();
  });
}
function watchHTML(e) {
  return e.watch && e.watch.length ? '<b>Điều kiện theo dõi</b><ul class="watch">' + e.watch.map(function (w, wi) {
    return '<li><select data-w="' + wi + '" aria-label="Trạng thái"><option value="?"' + (w.st === '?' ? ' selected' : '') + '>Chưa rõ</option><option value="y"' + (w.st === 'y' ? ' selected' : '') + '>Đang đúng</option><option value="n"' + (w.st === 'n' ? ' selected' : '') + '>Đã sai</option></select>' + esc(w.t) + '</li>';
  }).join('') + '</ul>' : '';
}
function multiCard(e, idx) {
  var vn = PX.VNINDEX ? PX.VNINDEX.p : null, due = e.review && e.review <= today();
  var val = function (S) { var ok = true, v = S.cash - S.debt; S.h.forEach(function (h) { var p = PX[h.sym] ? PX[h.sym].p : null; if (p == null) { ok = false; p = h.px; } v += h.q * p; }); return { v: v, ok: ok }; };
  var vA = val(e.after), vB = val(e.before), dlt = vA.v - vB.v - (e.after.dep || 0);
  var lines = e.acts.map(function (a) { var now = PX[a.sym] ? PX[a.sym].p : null; return '<li><b>' + a.sym + '</b> · ' + esc(a.choice) + ': giá lúc quyết định ' + nf(a.px) + ' đ' + (now ? ' → hôm nay ' + nf(now) + ' đ (<span class="' + cls(now - a.px) + '">' + pct(now / a.px - 1) + '</span>)' : '') + '</li>'; }).join('');
  return '<article class="jr" data-i="' + idx + '"><div class="jr-h"><b>Phác đồ ' + e.acts.length + ' mã · ' + esc(e.sym) + '</b><span>' + vnDate(e.date) + (due ? ' <em class="due">Đến hạn đánh giá lại</em>' : e.review ? ' · đánh giá lại ' + vnDate(e.review) : '') + '</span></div>' +
    '<ul class="plain">' + lines + '</ul>' +
    (e.vni && vn ? '<p>VN-Index ' + nf(e.vni, 2) + ' → ' + nf(vn, 2) + ' (<span class="' + cls(vn - e.vni) + '">' + pct(vn / e.vni - 1) + '</span>)</p>' : '') +
    (e.trade && e.trade.length ? '<b>Hệ quả đã chấp nhận</b><ul class="plain">' + e.trade.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
    '<p><b>Theo giá hôm nay:</b> phác đồ cho tài sản ròng <span class="' + cls(dlt) + '">' + money(dlt, true) + '</span> so với nếu giữ nguyên cả danh mục' + (e.after.dep ? ' (đã trừ ' + money(e.after.dep) + ' tiền nộp thêm)' : '') + '.' + (vA.ok && vB.ok ? '' : ' Một số mã chưa có giá mới, đang tính theo giá lúc quyết định.') + ' Kết quả tốt hay xấu chưa nói lên quyết định đúng hay sai: hãy xem các giả định có còn đứng vững.</p>' +
    (e.ctx && e.ctx.length ? '<p><b>Hoàn cảnh lúc đó:</b> ' + esc(e.ctx.join('; ')) + '.</p>' : '') +
    (e.why ? '<p><b>Vì sao chọn:</b> ' + esc(e.why) + '</p>' : '') +
    (e.chg && e.chg.length ? '<b>Điều có thể làm kết luận thay đổi</b><ul class="plain">' + e.chg.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
    (e.miss && e.miss.length ? '<b>Dữ liệu còn thiếu</b><ul class="plain">' + e.miss.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') + watchHTML(e) +
    '<label>Bài học rút ra (điền khi đánh giá lại)<textarea rows="2" class="lesson">' + esc(e.lesson || '') + '</textarea></label>' +
    '<div class="bs-row end" style="margin-top:0"><button type="button" class="btn sm ghost cp">Sao chép kế hoạch</button><button type="button" class="btn sm ghost danger del">Xóa kế hoạch này</button></div></article>';
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
function planText(e) {
  return (e.multi ? ['PHÁC ĐỒ · ' + vnDate(e.date)].concat(e.acts.map(function (a) { return '- ' + a.sym + ': ' + a.choice + ' (giá ' + nf(a.px) + ' đ)'; })) : ['KẾ HOẠCH · ' + e.sym + ' · ' + vnDate(e.date), 'Lựa chọn: ' + e.choice + ' (giá ' + nf(e.px) + ' đ)'])
    .concat(e.trade && e.trade.length ? [e.multi ? 'Hệ quả cả danh mục:' : 'Đánh đổi:'].concat(e.trade.map(function (t) { return '- ' + t; })) : [])
    .concat(e.ctx && e.ctx.length ? ['Hoàn cảnh:'].concat(e.ctx.map(function (t) { return '- ' + t; })) : [])
    .concat(e.why ? ['Vì sao chọn: ' + e.why] : [])
    .concat(e.watch && e.watch.length ? ['Điều kiện theo dõi:'].concat(e.watch.map(function (w) { return '- ' + w.t; })) : [])
    .concat(e.chg && e.chg.length ? ['Điều có thể làm kết luận thay đổi:'].concat(e.chg.map(function (t) { return '- ' + t; })) : [])
    .concat(e.miss && e.miss.length ? ['Dữ liệu còn thiếu:'].concat(e.miss.map(function (t) { return '- ' + t; })) : [])
    .concat(e.review ? ['Đánh giá lại: ' + vnDate(e.review)] : []).concat(['(Bác sĩ danh mục · topbroker.fun)']).join('\n');
}
$('#jr-list').addEventListener('click', function (e) {
  if (e.target.classList.contains('cp')) {
    var t = planText(J[+e.target.closest('.jr').getAttribute('data-i')]), b = e.target;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Đã sao chép ✓'; }, function () { window.prompt('Sao chép kế hoạch:', t); });
    return;
  }
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
var AI_TITLE = { 'tong-ket': 'Chuyên gia nói gì với bạn' };
function r3(x) { return typeof x === 'number' ? Math.round(x * 1000) / 1000 : x; }
function aiPayload(step) {
  if (!PORT) return null;
  var st = PORT.st;
  if (step === 'tong-ket') {
    var k = aiPayload('kham'), m = aiPayload('mo-phong'), plan = PENDING ? { quyet_dinh_tung_ma: PENDING.acts ? PENDING.acts.map(function (a) { return { ma: a.sym, lua_chon: a.choice, gia: a.px }; }) : null, lua_chon: PENDING.choice, ma: PENDING.sym, danh_doi: PENDING.trade, ly_do: $('#jr-why').value.trim(), dieu_kien_theo_doi: $('#jr-watch').value.split('\n').filter(Boolean), ngay_danh_gia_lai: $('#jr-review').value, dieu_co_the_lam_thay_doi: PENDING.chg, du_lieu_con_thieu: PENDING.miss }
      : J[0] && J[0].date === today() ? { quyet_dinh_tung_ma: J[0].acts ? J[0].acts.map(function (x) { return { ma: x.sym, lua_chon: x.choice, gia: x.px }; }) : null, lua_chon: J[0].choice, ma: J[0].sym, danh_doi: J[0].trade, ly_do: J[0].why, dieu_kien_theo_doi: (J[0].watch || []).map(function (w) { return w.t; }), ngay_danh_gia_lai: J[0].review, dieu_co_the_lam_thay_doi: J[0].chg, du_lieu_con_thieu: J[0].miss } : null;
    var PC = PLAN_ORDER.length ? combine() : null;
    var phacdo = PC ? { quyet_dinh: PC.acts.map(function (a) { return { ma: a.sym, phuong_an: a.label, danh_doi: a.trade }; }), ma_chua_quyet_dinh_giu_nguyen: PORT.rows.filter(function (r) { return !PLAN[r.sym]; }).map(function (r) { return r.sym; }),
      truoc: { von_chu: Math.round(PC.B.nav), tien_mat: Math.round(PC.B.cash), du_no: Math.round(PC.B.debt), rtt: PC.B.debt ? r3(PC.B.rtt) : null, ma_lon_nhat: PC.B.top ? PC.B.top.sym + ' ' + r3(PC.B.top.w) : null, khau_vi_danh_muc: PC.B.beh },
      sau: { von_chu: Math.round(PC.A.nav), tien_mat: Math.round(PC.A.cash), du_no: Math.round(PC.A.debt), rtt: PC.A.debt ? r3(PC.A.rtt) : null, ma_lon_nhat: PC.A.top ? PC.A.top.sym + ' ' + r3(PC.A.top.w) : null, khau_vi_danh_muc: PC.A.beh, ca_danh_muc_giam_them_thi_cham_nguong_goi: PC.A.dtc.t === 'x' ? r3(PC.A.dtc.x) : PC.A.dtc.t, ty_trong: PC.A.rows.map(function (h) { return { ma: h.sym, ty_trong: r3(h.w) }; }) },
      lai_lo_chot: Math.round(PC.realized), phi_thue: Math.round(PC.fees), tien_nop_them: Math.round(PC.dep) } : 'Khách chưa đưa mã nào vào phác đồ';
    return { khau_vi_va_hoan_canh: ctxPayload(), the_ket_qua_30_giay: QUICK, ket_luan_nhanh: $('#quick-lead').textContent, kham: k, phac_do_ca_danh_muc: phacdo, phuong_an_ma_dang_xem: m, ke_hoach_da_chon: plan || 'Khách chưa lưu kế hoạch' };
  }
  if (step === 'kham') {
    var d = dropNow(PORT);
    return { tong: { gia_tri_co_phieu: Math.round(PORT.mv), gia_von: Math.round(PORT.cv), lai_lo_chua_chot: Math.round(PORT.mv - PORT.cv), lai_lo_pct: r3((PORT.mv - PORT.cv) / PORT.cv),
        tien_mat: st.cash, du_no_margin: st.debt, tai_san_rong: Math.round(PORT.nav), rtt: st.debt ? r3(PORT.rtt) : null, nguong_goi_ky_quy: st.call, nguong_giai_chap: st.force,
        don_bay_lan: st.debt ? r3(PORT.lev) : 1, ca_danh_muc_giam_them_thi_cham_nguong_goi: d.t === 'x' ? r3(d.x) : d.t,
        rtt_cach_tinh: 'theo tài sản được công ty chứng khoán công nhận (mã được cho vay, giá chặn, hiệu chỉnh theo Rtt app)', rtt_app: st.appRtt > 0 ? r3(st.appRtt) : null,
        ma_khong_duoc_cho_vay: PORT.rows.filter(function (r) { return !mgOf(r.sym); }).map(function (r) { return r.sym; }),
        so_phien_giam_san_lien_tiep_thi_cham_call: (function () { var f = floorNow(PORT); return f.t === 'n' ? f.n : f.t; })() },
      tung_ma: PORT.rows.map(function (r) { return { ma: r.sym, nganh: r.sector, khoi_luong: r.qty, gia_von: Math.round(r.cost), thi_gia: r.p, gia_tri: Math.round(r.mv), ty_trong: r3(r.w), lai_lo_pct: r3(r.plp), bien_dong_hom_nay: r.ref ? r3(r.p / r.ref - 1) : null }; }),
      ty_trong_nganh: PORT.sectors, chan_doan_theo_cong_thuc: DIAG.map(function (x) { return { muc: x.lv, van_de: x.title, so_lieu: x.fact.replace(/<[^>]+>/g, ''), he_qua: x.why.replace(/<[^>]+>/g, '') }; }),
      ma_da_co_bai_giai_ma: (window.TB_DECODED || []).filter(function (m) { return PORT.rows.some(function (r) { return r.sym === m; }); }),
      xet_nghiem_tung_ma: PORT.rows.map(function (r) {
        var F = FUND[r.sym], T = techOf(r.sym), tr = techRead(T);
        return { ma: r.sym, lai_lo_pct: r3(r.plp),
          kinh_doanh: F ? { quy: F.q, doanh_thu_hoac_thu_nhap_lai_thuan: F.rev, so_cung_ky: r3(F.revY), loi_nhuan_sau_thue: F.np, ln_so_cung_ky: r3(F.npY), pe: r3(F.pe), pb: r3(F.pb), roe: r3(F.roe) } : 'chưa có dữ liệu',
          ky_thuat: T ? { phien: T.d, gia: T.p, ma20: r3(T.ma20), ma50: r3(T.ma50), ma200: r3(T.ma200), rsi14: r3(T.rsi), macd_tren_duong_tin_hieu: T.hist > 0, adx14: r3(T.adx), huong_xu_huong_theo_di: T.pdi > T.mdi ? 'tăng' : 'giảm', doc_theo_cong_thuc: tr.lines, danh_gia: tr.tag[1] } : 'chưa có dữ liệu',
          bac_si_doc: (T || F) ? doctorRead(r) : null };
      }),
      nguyen_nhan_bien_dong: LAST_CAUSE ? { tu_ngay: LAST_CAUSE.tu_ngay, den_ngay: LAST_CAUSE.den_ngay, vnindex_bien_dong: LAST_CAUSE.vnindex_bien_dong, gia_tri_cp_thay_doi: LAST_CAUSE.gia_tri_cp_thay_doi, dong_gop: LAST_CAUSE.dong_gop, bien_dong_tai_san_rong: LAST_CAUSE.bien_dong_tai_san_rong, tung_ma: LAST_CAUSE.tung_ma } : null,
      hoan_canh: ctxPayload() };
  }
  if (step === 'mo-phong' && LAST_SIM && LAST_SC) {
    var r = PORT.rows.filter(function (x) { return x.sym === LAST_SIM.sym; })[0];
    return { ma: LAST_SIM.sym, hien_tai: { khoi_luong: r.qty, gia_von: Math.round(r.cost), thi_gia: r.p, lai_lo_pct: r3(r.plp), ty_trong: r3(r.w), tai_san_rong: Math.round(PORT.nav), rtt: st.debt ? r3(PORT.rtt) : null, du_no: st.debt, tien_mat: st.cash },
      hoan_canh: ctxPayload(), gia_gia_dinh_giao_dich: LAST_SIM.px, phi_giao_dich: st.fee, thue_ban: st.tax, nguong_goi_ky_quy: st.call, nguong_giai_chap: st.force,
      phuong_an: LAST_SIM.opts.map(function (x) { var o = x.o; return { ten: x.label, khoi_luong_con: o.q, gia_von_binh_quan: Math.round(o.cost), lai_lo_da_chot: Math.round(o.realized), lai_lo_chua_chot: Math.round(o.unreal), tien_mat: Math.round(o.cash), du_no: Math.round(o.debt), ty_trong_ma: r3(o.w), tai_san_rong: Math.round(o.nav), rtt: o.debt ? r3(o.rtt) : null, ma_giam_them_thi_cham_nguong_goi: o.dtc.t === 'x' ? r3(o.dtc.x) : o.dtc.t, muc_giam_thi_vuot_muc_chiu_dung: o.tolX ? (o.tolX.t === 'x' ? r3(o.tolX.x) : o.tolX.t) : null, mua_them_ma_khac: o.alt ? { ma: o.alt.sym, khoi_luong: o.alt.q } : null }; }),
      kich_ban: { pham_vi: LAST_SC.scope === 'all' ? 'cả danh mục cùng biến động' : 'chỉ mã này biến động',
        bang: LAST_SC.shocks.map(function (sh, i) { return { bien_dong_gia: sh, tai_san_rong_tung_phuong_an: LAST_SC.sc[i].map(function (v) { return Math.round(v.nav); }), rtt_tung_phuong_an: LAST_SC.sc[i].map(function (v) { return r3(v.rtt); }) }; }) } };
  }
  return null;
}
function aiReset(step) {
  var box = $('#ai-' + step); if (!box) return;
  var K = profile();
  box.innerHTML = '<div class="ai-h"><h3>' + AI_ICON + AI_TITLE[step] + '</h3><button type="button" class="btn ai-go">Hỏi chuyên gia: tôi nên làm gì tiếp?</button></div>' +
    '<p class="consent">Chuyên gia AI đọc lại toàn bộ buổi khám: số liệu danh mục, kết quả kinh doanh và tín hiệu kỹ thuật từng mã, khẩu vị đầu tư' + (K.decL ? ' (' + K.decL.name.toLowerCase() + ')' : '') + ', các phương án bạn đã so sánh, rồi đưa lời khuyên bước tiếp theo hợp với danh mục và tính cách của bạn. ' + (K.n < 5 ? '<b>Trả lời đủ 5 câu ở chặng 2 để lời khuyên sát với bạn hơn.</b> ' : '') + 'Đây là ý kiến tham khảo, quyết định cuối cùng là của bạn. Bấm nút là đồng ý gửi bản tóm tắt số liệu (không có tên, số tài khoản); dữ liệu không được lưu lại.</p>';
}
function li(a) { return a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
function aiRun(step) {
  var box = $('#ai-' + step), data = aiPayload(step);
  if (!data) { box.querySelector('.consent').textContent = 'Chưa có số liệu cho bước này. Hãy khám danh mục trước.'; return; }
  var btn = box.querySelector('.ai-go'); btn.disabled = true;
  var ld = document.createElement('div'); ld.className = 'load'; ld.innerHTML = '<i></i>Chuyên gia đang đọc lại cả buổi khám, mất khoảng 15–40 giây…'; box.appendChild(ld);
  var old = box.querySelector('.err'); if (old) old.remove();
  fetch(AI_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buoc: step, so_lieu: data, code: MB && MB.code }) })
    .then(function (r) { return r.json().then(function (j) { if (!r.ok || j.error) throw new Error((j.error || 'Lỗi') + (j.code ? ' (mã ' + j.code + (j.detail ? ': ' + j.detail : '') + ')' : '')); return j; }); })
    .then(function (j) {
      box.innerHTML = '<div class="ai-h"><h3>' + AI_ICON + AI_TITLE[step] + '</h3><button type="button" class="btn sm ghost ai-go">Hỏi lại</button></div>' +
        (j.khau_vi ? '<p class="kvline"><b>Khẩu vị của bạn:</b> ' + esc(j.khau_vi) + '</p>' : '') +
        (j.tom_tat ? '<p class="tt">' + esc(j.tom_tat) + '</p>' : '') +
        (j.loi_khuyen ? '<div class="lk"><small>Việc nên làm tiếp theo</small>' + esc(j.loi_khuyen) + '</div>' : '') +
        '<div class="ai-grid">' +
        ((j.buoc || []).length ? '<div class="b"><h4>Làm thế nào</h4><ol class="steps">' + li(j.buoc) + '</ol></div>' : '') +
        ((j.theo_doi || []).length ? '<div class="a"><h4>Khi nào xem lại</h4><ul>' + li(j.theo_doi) + '</ul></div>' : '') +
        '</div>' + ((j.ngam || []).length ? '<p class="ngam">' + esc(j.ngam[0]) + '</p>' : '') + '<p class="meta">Ý kiến tham khảo của chuyên gia AI (' + esc(j.model || 'Claude') + '), dựa trên số liệu bạn nhập và dữ liệu thị trường trễ 15 phút; không phải khuyến nghị chính thức của công ty chứng khoán. AI có thể sai; quyết định và trách nhiệm cuối cùng là của bạn.</p>';
    })
    .catch(function (e) {
      ld.remove(); btn.disabled = false;
      var er = document.createElement('p'); er.className = 'err'; er.textContent = (e.message || 'Chưa gọi được AI.') + ' Các con số và kế hoạch ở trên vẫn dùng được bình thường.'; box.appendChild(er);
    });
}
document.addEventListener('click', function (e) { var b = e.target.closest('.ai-go'); if (!b) return; aiRun(b.closest('.ai').getAttribute('data-step')); });

/* ---------- thanh bước ---------- */
function updateSteps() {
  $$('.bs-steps a').forEach(function (a) { var s = $('#' + a.getAttribute('data-step')); a.classList.toggle('off', !!(s && s.classList.contains('locked'))); a.classList.toggle('on', !!(s && s.classList.contains('open'))); });
}

renderInputs(); updateSteps(); renderJournal();
if (S.rows.some(function (r) { return r.sym && r.qty && r.cost; })) $('#in-msg').textContent = 'Đã khôi phục danh mục lần trước trên máy này. Bấm "Bắt đầu khám" để cập nhật giá.';
})();
