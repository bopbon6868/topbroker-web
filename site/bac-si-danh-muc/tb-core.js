/*
 * TB Core – lõi tính toán Bác sĩ danh mục (Đợt 1, bản demo)
 * Hàm thuần: cùng đầu vào + cùng phiên bản => cùng kết quả. Không gọi mạng, không đụng giao diện.
 * Dùng được cả trên trình duyệt (window.TBCore) lẫn Node (require).
 *
 * Mô hình margin có tham số (thay cho "thư viện quy tắc theo từng CTCK"):
 *   Tài sản tính margin  A = tiền mặt + Σ KL × min(giá, giá chặn) × (1 nếu mã được cho vay) × (1 − h)
 *   Rtt theo mô hình        = (A − nợ) / A
 *   h = phần chiết khấu suy ra từ Rtt app (0 nếu không nhập Rtt app hoặc app cao hơn mô hình).
 * Nguyên tắc: khi chưa chắc, chọn giả định bất lợi hơn (báo khoảng đệm hẹp hơn, không rộng hơn).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TBCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = 'tb-core 1.0.0-demo (18/10/2026)';
  var BAND = { HOSE: 0.07, HNX: 0.10, UPCOM: 0.15 };   // biên độ dao động giá
  var LOT = 100;                                        // lô chẵn
  var EPS = 1e-9;

  /* ---------- tiện ích ---------- */
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function tick(exch, p) { return exch === 'HOSE' ? (p < 10000 ? 10 : p < 50000 ? 50 : 100) : 100; }
  /** Giá sàn phiên kế tiếp từ giá tham chiếu, làm tròn về phía tham chiếu theo bước giá. */
  function floorPrice(exch, ref) {
    var raw = ref * (1 - BAND[exch]), t = tick(exch, raw);
    var f = Math.ceil(raw / t - EPS) * t;
    return f >= ref ? Math.max(t, ref - t) : f;   // giá thấp: luôn giảm ít nhất 1 bước giá
  }
  /** Tìm giá trị nhỏ nhất của s trong [lo, hi] để f(s) >= target, với f tăng dần. */
  function solveMin(f, target, lo, hi) {
    if (f(lo) >= target - EPS) return lo;
    if (f(hi) < target - EPS) return null;
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (f(mid) >= target) hi = mid; else lo = mid; if (hi - lo < 1e-6) break; }
    return hi;
  }

  /* ---------- 1. Kiểm tra và chuẩn hóa đầu vào ---------- */
  /**
   * input: { rows:[{sym, exch, qty, cost, price, marginable, cap, adv20, priceSrc, priceTs}],
   *          cash, debt, call, force, fee, tax, appRtt, nearBand }
   * Tỷ lệ nhập dạng số thập phân (0.4 = 40%). Tiền tính bằng đồng.
   */
  function normalize(input) {
    var errors = [], warnings = [], seen = {};
    function err(code, field, msg) { errors.push({ code: code, field: field, msg: msg }); }
    var rows = (input.rows || []).map(function (r, i) {
      var where = 'Dòng ' + (i + 1);
      var sym = String(r.sym || '').trim().toUpperCase();
      if (!sym) err('IN-01', 'rows[' + i + '].sym', where + ': chưa có mã cổ phiếu.');
      else if (!/^[A-Z0-9]{3,6}$/.test(sym)) err('IN-01', 'rows[' + i + '].sym', where + ': mã "' + sym + '" không đúng dạng.');
      else if (seen[sym]) err('IN-01', 'rows[' + i + '].sym', where + ': mã ' + sym + ' bị nhập hai lần. Gộp thành một dòng.');
      seen[sym] = 1;
      var exch = String(r.exch || 'HOSE').toUpperCase();
      if (!BAND[exch]) err('IN-01', 'rows[' + i + '].exch', where + ': sàn "' + exch + '" không hợp lệ (HOSE, HNX, UPCOM).');
      if (!isNum(r.qty) || r.qty < 0 || Math.floor(r.qty) !== r.qty) err('IN-05', 'rows[' + i + '].qty', where + ' (' + sym + '): khối lượng phải là số nguyên không âm.');
      if (r.qty > 0 && !(isNum(r.cost) && r.cost > 0)) err('IN-02', 'rows[' + i + '].cost', where + ' (' + sym + '): thiếu giá vốn. Bổ sung giá vốn hoặc bỏ dòng này; hệ thống không tự điền.');
      if (!(isNum(r.price) && r.price > 0)) err('CE-15', 'rows[' + i + '].price', where + ' (' + sym + '): chưa có giá hiện tại. Lấy giá từ nguồn hoặc nhập tay.');
      if (r.cap != null && !(isNum(r.cap) && r.cap > 0)) err('IN-05', 'rows[' + i + '].cap', where + ' (' + sym + '): giá chặn phải là số dương hoặc để trống.');
      return {
        sym: sym, exch: exch, qty: r.qty, cost: r.cost || 0, price: r.price,
        marginable: r.marginable !== false, cap: r.cap == null ? null : r.cap,
        adv20: isNum(r.adv20) && r.adv20 > 0 ? r.adv20 : null,
        priceSrc: r.priceSrc || 'user', priceTs: r.priceTs || null
      };
    });
    ['cash', 'debt'].forEach(function (k) {
      var v = input[k];
      if (v == null || v === '') err('IN-04', k, (k === 'cash' ? 'Tiền mặt' : 'Dư nợ') + ' chưa được xác nhận. Nhập 0 nếu không có.');
      else if (!isNum(v) || v < 0) err('CE-13', k, (k === 'cash' ? 'Tiền mặt' : 'Dư nợ') + ' không được âm. Kiểm tra lại số trên app.');
    });
    var call = input.call, force = input.force;
    if (!(isNum(call) && call > 0 && call < 1) || !(isNum(force) && force > 0 && force < 1) || force >= call)
      err('CE-14', 'call', 'Ngưỡng call margin và giải chấp không hợp lệ: cần 0% < giải chấp < call < 100%.');
    ['fee', 'tax'].forEach(function (k) {
      var v = input[k] == null ? 0 : input[k];
      if (!isNum(v) || v < 0 || v > 0.05) err('IN-05', k, (k === 'fee' ? 'Phí giao dịch' : 'Thuế bán') + ' phải từ 0% đến 5%.');
    });
    var appRtt = input.appRtt == null || input.appRtt === '' ? null : input.appRtt;
    if (appRtt != null && !(isNum(appRtt) && appRtt > 0 && appRtt <= 1)) err('IN-05', 'appRtt', 'Rtt trên app phải từ 0% đến 100%, hoặc để trống.');
    var near = input.nearBand == null ? 0.10 : input.nearBand;
    return {
      ok: errors.length === 0, errors: errors, warnings: warnings,
      P: { rows: rows, cash: input.cash || 0, debt: input.debt || 0, call: call, force: force,
           fee: input.fee || 0, tax: input.tax || 0, appRtt: appRtt, nearBand: near }
    };
  }

  /* ---------- 2. Định giá theo mô hình ---------- */
  function countedRow(r, px, h) {
    if (!r.marginable || r.qty <= 0) return 0;
    var p = r.cap ? Math.min(px, r.cap) : px;
    return r.qty * p * (1 - h);
  }
  /** Tài sản, tài sản ròng, Rtt tại bộ giá prices (map mã → giá), chiết khấu h. */
  function valueAt(P, prices, h) {
    var mv = 0, mc = 0;
    P.rows.forEach(function (r) { var px = prices ? prices[r.sym] : r.price; mv += r.qty * px; mc += countedRow(r, px, h); });
    var A = mc + P.cash, nav = mv + P.cash - P.debt;
    return {
      mv: mv, counted: mc, assets: A, nav: nav,
      rttOwn: mv + P.cash > 0 ? nav / (mv + P.cash) : null,
      rtt: P.debt <= 0 ? 1 : A > 0 ? (A - P.debt) / A : null
    };
  }

  /** Hiệu chỉnh theo Rtt app: suy ra phần tài sản CTCK không công nhận, áp chiết khấu đều lên mã được cho vay. */
  function calibrate(P) {
    var base = valueAt(P, null, 0), out = { h: 0, mode: 'model', note: null, gapPts: null, base: base };
    if (P.appRtt == null) { out.note = 'Chưa nhập Rtt trên app: dùng mô hình theo cờ "được cho vay" và giá chặn.'; return out; }
    if (P.debt <= 0) { out.note = 'Không vay margin nên không cần đối chiếu Rtt.'; return out; }
    out.gapPts = (P.appRtt - base.rtt) * 100;
    if (Math.abs(out.gapPts) < 0.5) { out.mode = 'match'; out.note = 'Rtt app khớp mô hình (lệch dưới 0,5 điểm %).'; return out; }
    if (P.appRtt > base.rtt) {
      out.mode = 'app-higher';
      out.note = 'Rtt app cao hơn mô hình ' + out.gapPts.toFixed(1).replace('.', ',') + ' điểm %. Giữ số mô hình (thấp hơn, bất lợi hơn) và cần đối chiếu cách CTCK tính.';
      return out;
    }
    var Aapp = P.debt / (1 - P.appRtt), excl = base.assets - Aapp;   // phần tài sản app không tính
    if (base.counted <= 0 || excl > base.counted) {
      out.mode = 'inconsistent';
      out.note = 'Rtt app thấp tới mức không giải thích được bằng tài sản cổ phiếu. Kiểm tra lại tiền mặt, dư nợ hoặc số Rtt.';
      return out;
    }
    out.h = excl / base.counted; out.mode = 'app-lower'; out.excluded = excl;
    out.note = 'Rtt app thấp hơn mô hình ' + Math.abs(out.gapPts).toFixed(1).replace('.', ',') + ' điểm %: coi như CTCK không công nhận khoảng ' + Math.round(excl).toLocaleString('vi-VN') + ' đ giá trị cổ phiếu (chia đều theo giá trị).';
    return out;
  }

  /** Trạng thái hiện tại: số liệu + nhãn so với ngưỡng. */
  function assess(P) {
    var cal = calibrate(P), v = valueAt(P, null, cal.h), status;
    if (P.debt <= 0) status = 'nodebt';
    else if (v.rtt == null) status = 'unknown';
    else if (v.rtt < P.force) status = 'force';
    else if (v.rtt < P.call) status = 'below';
    else if (v.rtt < P.call + P.nearBand) status = 'near';
    else status = 'above';
    return { v: v, cal: cal, status: status, version: VERSION };
  }

  /* ---------- 3. Còn cách ngưỡng bao xa ---------- */
  function pricesScaled(P, m, only) {
    var o = {}; P.rows.forEach(function (r) { o[r.sym] = (!only || r.sym === only) ? r.price * m : r.price; }); return o;
  }
  /** Mức giảm đồng loạt (hoặc chỉ một mã) để Rtt chạm ngưỡng thr. Giải bằng chia đôi nên đúng cả khi có giá chặn. */
  function dropTo(P, thr, only, h) {
    if (P.debt <= 0) return { t: 'nodebt' };
    var f = function (x) { var r = valueAt(P, pricesScaled(P, 1 - x, only), h).rtt; return r == null ? -Infinity : r; };
    if (f(0) < thr) return { t: 'below' };
    if (f(1) >= thr) return { t: 'never' };
    var lo = 0, hi = 1;
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (f(mid) >= thr) lo = mid; else hi = mid; if (hi - lo < 1e-12) break; }
    var x = (lo + hi) / 2;
    return { t: 'x', x: x, prices: pricesScaled(P, 1 - x, only) };
  }
  /** Số phiên giảm sàn liên tiếp để Rtt xuống dưới ngưỡng thr (tính giá sàn đúng biên độ và bước giá từng sàn). */
  function floorSessions(P, thr, only, h, maxN) {
    if (P.debt <= 0) return { t: 'nodebt' };
    maxN = maxN || 30;
    var px = {}; P.rows.forEach(function (r) { px[r.sym] = r.price; });
    if (valueAt(P, px, h).rtt < thr) return { t: 'below' };
    for (var n = 1; n <= maxN; n++) {
      P.rows.forEach(function (r) { if (!only || r.sym === only) px[r.sym] = floorPrice(r.exch, px[r.sym]); });
      if (valueAt(P, px, h).rtt < thr) return { t: 'n', n: n, prices: Object.assign({}, px) };
    }
    return { t: 'never', maxN: maxN };
  }

  /* ---------- 4. Mô phỏng phương án ---------- */
  /**
   * actions: [{type:'deposit', amount, mode:'repay'|'cash'}, {type:'sell', sym, shares, price?, use:'repay'|'cash'},
   *           {type:'buy', sym, shares, price?, fund:'cash'|'loan'}]
   * Giả định: tiền bán được ghi nhận ngay vào tài sản tính margin (tùy CTCK; ghi rõ trên kết quả).
   */
  function simulate(P, actions) {
    var Q = JSON.parse(JSON.stringify(P)), fees = 0, realized = 0, deposit = 0, errors = [], flags = [];
    var bySym = {}; Q.rows.forEach(function (r) { bySym[r.sym] = r; });
    (actions || []).forEach(function (a, i) {
      if (a.type === 'deposit') {
        if (!(isNum(a.amount) && a.amount >= 0)) { errors.push({ code: 'IN-05', msg: 'Số tiền nộp không hợp lệ.' }); return; }
        deposit += a.amount;
        if (a.mode === 'cash') Q.cash += a.amount;
        else { var pay = Math.min(a.amount, Q.debt); Q.debt -= pay; Q.cash += a.amount - pay; }
        flags.push('deposit-assumed');
      } else if (a.type === 'sell') {
        var r = bySym[a.sym];
        if (!r) { errors.push({ code: 'CE-12', msg: 'Không có mã ' + a.sym + ' trong danh mục.' }); return; }
        if (!(isNum(a.shares) && a.shares >= 0)) { errors.push({ code: 'IN-05', msg: 'Khối lượng bán ' + a.sym + ' không hợp lệ.' }); return; }
        if (a.shares > r.qty) { errors.push({ code: 'CE-12', msg: 'Bán ' + a.shares + ' cp ' + a.sym + ' vượt lượng đang có (' + r.qty + ').' }); return; }
        var px = a.price || r.price, gross = a.shares * px, cost = gross * (Q.fee + Q.tax), net = gross - cost;
        fees += cost; realized += net - a.shares * r.cost; r.qty -= a.shares;
        if (a.use === 'cash') Q.cash += net;
        else { var p2 = Math.min(net, Q.debt); Q.debt -= p2; Q.cash += net - p2; }
        flags.push('sale-proceeds-immediate');
      } else if (a.type === 'buy') {
        var b = bySym[a.sym];
        if (!b) { errors.push({ code: 'IN-01', msg: 'Mã ' + a.sym + ' chưa có trong danh mục (thêm dòng trước).' }); return; }
        var bp = a.price || b.price, outlay = a.shares * bp * (1 + Q.fee);
        fees += a.shares * bp * Q.fee;
        b.cost = (b.qty * b.cost + outlay) / (b.qty + a.shares); b.qty += a.shares;
        if (a.fund === 'loan') Q.debt += outlay;
        else { var fromCash = Math.min(Q.cash, outlay); Q.cash -= fromCash; Q.debt += outlay - fromCash; }
      }
    });
    var after = errors.length ? null : assess(Q);
    if (after && after.v.mv === 0 && Q.debt > 0) flags.push('no-stock-debt-left');   // CE-06
    return { ok: errors.length === 0, errors: errors, P: Q, after: after, fees: fees, realized: realized, deposit: deposit, flags: flags };
  }

  /* ---------- 5. Cần tối thiểu bao nhiêu để đưa Rtt về mục tiêu ---------- */
  function minToTarget(P, target) {
    var a = assess(P), h = a.cal.h, A = a.v.assets, D = P.debt, phi = P.fee + P.tax;
    if (D <= 0) return { t: 'nodebt' };
    if (a.v.rtt >= target) return { t: 'ok', rtt: a.v.rtt };
    var need = target * A - (A - D);                   // thiếu hụt tính theo tiền trả nợ
    var out = { t: 'need', target: target, shortfall: need, options: [] };
    out.options.push({ kind: 'deposit-repay', amount: need, label: 'Nộp tiền, CTCK tự cấn trừ nợ' });
    out.options.push({ kind: 'deposit-cash', amount: D / (1 - target) - A, label: 'Nộp tiền nhưng để nguyên là tiền mặt' });
    P.rows.forEach(function (r) {
      if (r.qty <= 0) return;
      ['repay', 'cash'].forEach(function (use) {
        var f = function (sh) { var s = simulate(P, [{ type: 'sell', sym: r.sym, shares: sh, use: use }]); return s.ok ? s.after.v.rtt : -1; };
        var w = r.marginable ? (1 - h) * (r.cap ? Math.min(r.price, r.cap) : r.price) / r.price : 0;
        var o = { kind: use === 'repay' ? 'sell-repay' : 'sell-cash', sym: r.sym, weight: w };
        if (use === 'cash' && 1 - phi - w <= EPS) { o.t = 'no-help'; out.options.push(o); return; }
        var sh = solveMin(f, target, 0, r.qty);
        if (sh == null) { o.t = 'insufficient'; o.rttIfAll = f(r.qty); out.options.push(o); return; }
        var lot = Math.min(r.qty, Math.ceil(sh / LOT - EPS) * LOT);
        if (f(lot) < target - EPS) lot = r.qty;   // làm tròn lô vẫn thiếu thì phải bán hết phần lẻ
        o.t = 'ok'; o.sharesExact = sh; o.shares = lot; o.amount = lot * r.price; o.pctOfQty = lot / r.qty;
        o.advPct = r.adv20 ? lot / r.adv20 : null;
        o.liquidity = o.advPct == null ? 'unknown' : o.advPct > 1 ? 'over-adv' : o.advPct > 0.2 ? 'heavy' : 'ok';
        out.options.push(o);
      });
    });
    return out;
  }

  /* ---------- 6. Cách cũ (để so sánh và kiểm thử hồi quy) ---------- */
  var legacy = {
    /** Công thức bản đang chạy: x = 1 − [D/(1−c) − C]/MV (mọi cổ phiếu được tính đủ, giảm đều). */
    dropAllToCall: function (mv, cash, debt, call) {
      if (!debt) return { t: 'nodebt' };
      var x = 1 - (debt / (1 - call) - cash) / mv;
      return x <= 0 ? { t: 'below' } : x >= 1 ? { t: 'never' } : { t: 'x', x: x };
    },
    /** Quy đổi theo tỷ lệ app ÷ Rtt tự tính, giả định tỷ lệ đó không đổi khi giá đổi. */
    calibratedDrop: function (P) {
      var v = valueAt(P, null, 0);
      if (!P.appRtt || !P.debt) return legacy.dropAllToCall(v.mv, P.cash, P.debt, P.call);
      var f = P.appRtt / v.rttOwn;
      return legacy.dropAllToCall(v.mv, P.cash, P.debt, Math.min(0.95, P.call / f));
    }
  };

  return {
    VERSION: VERSION, BAND: BAND, LOT: LOT,
    normalize: normalize, valueAt: valueAt, calibrate: calibrate, assess: assess,
    dropTo: dropTo, floorSessions: floorSessions, floorPrice: floorPrice,
    simulate: simulate, minToTarget: minToTarget, legacy: legacy
  };
});
