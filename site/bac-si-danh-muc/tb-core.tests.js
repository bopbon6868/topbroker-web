/*
 * Bộ kiểm thử TB Core. Chạy được trên trình duyệt (TBCoreTests.run(TBCore)) và Node (node tools/test_core.js).
 * Số mong đợi được tính độc lập bằng Python (không dùng lại code JS), xem tools/core_oracle.py.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TBCoreTests = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function sample(over) {
    var base = {
      rows: [
        { sym: 'HPG', exch: 'HOSE', qty: 2000, cost: 28500, price: 27000 },
        { sym: 'VPB', exch: 'HOSE', qty: 3000, cost: 22000, price: 20500 },
        { sym: 'NVL', exch: 'HOSE', qty: 5000, cost: 15000, price: 13000 },
        { sym: 'SSI', exch: 'HOSE', qty: 2000, cost: 38000, price: 33000 },
        { sym: 'MWG', exch: 'HOSE', qty: 500, cost: 68000, price: 120000 }
      ],
      cash: 20e6, debt: 150e6, call: 0.40, force: 0.30, fee: 0.0015, tax: 0.001
    };
    var o = JSON.parse(JSON.stringify(base));
    if (over) over(o);
    return o;
  }
  function stressed(o) { o.rows.forEach(function (r) { r.price = r.price * 0.75; }); }

  function run(C) {
    var out = [];
    function T(code, group, name, fn) {
      try { var r = fn(); out.push({ code: code, group: group, name: name, pass: !!r.pass, expect: r.expect, got: r.got }); }
      catch (e) { out.push({ code: code, group: group, name: name, pass: false, expect: '', got: 'Lỗi: ' + e.message }); }
    }
    function near(a, b, tol) { return typeof a === 'number' && Math.abs(a - b) <= (tol == null ? 1e-6 : tol); }
    function P(input) { var n = C.normalize(input); if (!n.ok) throw new Error(n.errors[0].msg); return n.P; }
    function pc(x) { return (x * 100).toFixed(3) + '%'; }
    function vnd(x) { return Math.round(x).toLocaleString('vi-VN') + ' đ'; }
    function hasErr(input, code) { return C.normalize(input).errors.some(function (e) { return e.code === code; }); }

    /* ----- Nhập liệu ----- */
    T('IN-01', 'Nhập liệu', 'Danh mục đủ trường được chuẩn hóa', function () {
      var n = C.normalize(sample(function (o) { o.rows[0].sym = ' hpg '; }));
      return { pass: n.ok && n.P.rows[0].sym === 'HPG', expect: 'hợp lệ, mã = HPG', got: n.ok ? 'hợp lệ, mã = ' + n.P.rows[0].sym : n.errors[0].msg };
    });
    T('IN-02', 'Nhập liệu', 'Thiếu giá vốn: chặn, không tự điền', function () {
      var bad = hasErr(sample(function (o) { o.rows[1].cost = null; }), 'IN-02');
      return { pass: bad, expect: 'báo lỗi IN-02', got: bad ? 'báo lỗi IN-02' : 'không báo lỗi' };
    });
    T('IN-04', 'Nhập liệu', 'Tiền mặt và dư nợ bằng 0 được chấp nhận', function () {
      var n = C.normalize(sample(function (o) { o.cash = 0; o.debt = 0; }));
      return { pass: n.ok, expect: 'hợp lệ', got: n.ok ? 'hợp lệ' : n.errors[0].msg };
    });
    T('IN-04b', 'Nhập liệu', 'Bỏ trống tiền mặt: yêu cầu xác nhận', function () {
      var bad = hasErr(sample(function (o) { o.cash = null; }), 'IN-04');
      return { pass: bad, expect: 'báo lỗi IN-04', got: bad ? 'báo lỗi IN-04' : 'không báo lỗi' };
    });
    T('IN-05', 'Nhập liệu', 'Khối lượng âm bị chặn', function () {
      var bad = hasErr(sample(function (o) { o.rows[0].qty = -100; }), 'IN-05');
      return { pass: bad, expect: 'báo lỗi IN-05', got: bad ? 'báo lỗi IN-05' : 'không báo lỗi' };
    });
    T('IN-06', 'Nhập liệu', 'Mã nhập trùng bị chặn', function () {
      var bad = hasErr(sample(function (o) { o.rows[1].sym = 'HPG'; }), 'IN-01');
      return { pass: bad, expect: 'báo lỗi mã trùng', got: bad ? 'báo lỗi mã trùng' : 'không báo lỗi' };
    });
    T('CE-13', 'Nhập liệu', 'Tiền mặt âm: yêu cầu xác minh, không tự sửa', function () {
      var bad = hasErr(sample(function (o) { o.cash = -5e6; }), 'CE-13');
      return { pass: bad, expect: 'báo lỗi CE-13', got: bad ? 'báo lỗi CE-13' : 'không báo lỗi' };
    });
    T('CE-14', 'Nhập liệu', 'Ngưỡng giải chấp ≥ ngưỡng call: không chạy', function () {
      var bad = hasErr(sample(function (o) { o.force = 0.45; }), 'CE-14');
      return { pass: bad, expect: 'báo lỗi CE-14', got: bad ? 'báo lỗi CE-14' : 'không báo lỗi' };
    });
    T('CE-15', 'Nhập liệu', 'Thiếu giá hiện tại: báo thiếu, không dùng giá giả', function () {
      var bad = hasErr(sample(function (o) { o.rows[2].price = null; }), 'CE-15');
      return { pass: bad, expect: 'báo lỗi CE-15', got: bad ? 'báo lỗi CE-15' : 'không báo lỗi' };
    });

    /* ----- Tính toán nền ----- */
    T('CAL-01', 'Tính toán', 'Danh mục mẫu: tài sản ròng 176,5tr; Rtt 54,06%', function () {
      var a = C.assess(P(sample()));
      return { pass: near(a.v.nav, 176.5e6, 1) && near(a.v.rtt, 176.5 / 326.5), expect: '176.500.000 đ · 54,058%', got: vnd(a.v.nav) + ' · ' + pc(a.v.rtt) };
    });
    T('CAL-01b', 'Tính toán', 'Danh mục mẫu: giảm đồng loạt 24,96% thì chạm call (khớp công thức cũ)', function () {
      var p = P(sample()), x = C.dropTo(p, 0.4, null, 0).x, old = C.legacy.dropAllToCall(306.5e6, 20e6, 150e6, 0.4).x;
      return { pass: near(x, 0.249592169657, 1e-9) && near(x, old, 1e-9), expect: '24,959% (cũ: ' + pc(old) + ')', got: pc(x) };
    });
    T('CAL-01c', 'Tính toán', 'Danh mục mẫu: giảm 36,61% thì chạm giải chấp 30%', function () {
      var x = C.dropTo(P(sample()), 0.3, null, 0).x;
      return { pass: near(x, 1 - (150 / 0.7 - 20) / 306.5, 1e-9), expect: '36,611%', got: pc(x) };
    });
    T('CAL-02', 'Tính toán', 'Giá trị cổ phiếu bằng 0: không chia cho 0', function () {
      var a = C.assess(P({ rows: [{ sym: 'HPG', qty: 0, cost: 0, price: 27000 }], cash: 10e6, debt: 5e6, call: 0.4, force: 0.3 }));
      var d = C.dropTo(P({ rows: [{ sym: 'HPG', qty: 0, cost: 0, price: 27000 }], cash: 10e6, debt: 5e6, call: 0.4, force: 0.3 }), 0.4, null, 0);
      return { pass: near(a.v.rtt, 0.5) && d.t === 'never' && isFinite(a.v.rtt), expect: 'Rtt 50%, không bao giờ chạm', got: pc(a.v.rtt) + ', ' + d.t };
    });
    T('CAL-04', 'Tính toán', 'Bán 1.000 HPG trả nợ: tiền thu sau phí thuế 0,25% và lãi/lỗ chốt', function () {
      var s = C.simulate(P(sample()), [{ type: 'sell', sym: 'HPG', shares: 1000, use: 'repay' }]);
      var net = 27e6 * (1 - 0.0025);
      return { pass: s.ok && near(s.P.debt, 150e6 - net, 1e-3) && near(s.realized, net - 28.5e6, 1e-3) && s.P.rows[0].qty === 1000,
        expect: 'nợ còn ' + vnd(150e6 - net) + ', lỗ chốt ' + vnd(net - 28.5e6), got: 'nợ còn ' + vnd(s.P.debt) + ', lỗ chốt ' + vnd(s.realized) };
    });
    T('CAL-06', 'Tính toán', 'Gộp nhiều phương án = cộng các bước thành phần', function () {
      var p = P(sample());
      var s = C.simulate(p, [{ type: 'deposit', amount: 10e6 }, { type: 'sell', sym: 'NVL', shares: 2000, use: 'repay' }]);
      var debt = 150e6 - 10e6 - 26e6 * 0.9975;
      return { pass: s.ok && near(s.P.debt, debt, 1e-3), expect: 'nợ còn ' + vnd(debt), got: 'nợ còn ' + vnd(s.P.debt) };
    });
    T('CAL-07', 'Tính toán', 'Cùng đầu vào chạy lại cho cùng kết quả', function () {
      var a = JSON.stringify(C.minToTarget(P(sample(stressed)), 0.45)), b = JSON.stringify(C.minToTarget(P(sample(stressed)), 0.45));
      return { pass: a === b, expect: 'giống hệt', got: a === b ? 'giống hệt' : 'khác nhau' };
    });

    /* ----- Mô hình margin và hiệu chỉnh ----- */
    T('MG-01', 'Mô hình margin', 'NVL không được cho vay: Rtt mô hình 42,64%, chỉ giảm 4,76% là chạm call', function () {
      var p = P(sample(function (o) { o.rows[2].marginable = false; })), a = C.assess(p), x = C.dropTo(p, 0.4, null, 0).x;
      return { pass: near(a.v.rtt, 111.5 / 261.5) && near(x, 1 - 230 / 241.5, 1e-9), expect: '42,639% · 4,762%', got: pc(a.v.rtt) + ' · ' + pc(x) };
    });
    T('MG-02', 'Mô hình margin', 'Có Rtt app 42,64%: cách mới suy ra đúng 4,76%; cách cũ báo 7,23% (rộng hơn thực tế)', function () {
      var p = P(sample(function (o) { o.appRtt = 111.5 / 261.5; })), a = C.assess(p);
      var x = C.dropTo(p, 0.4, null, a.cal.h).x, old = C.legacy.calibratedDrop(p).x;
      return { pass: near(x, 1 - 230 / 241.5, 1e-9) && near(old, 0.07230279410647, 1e-9) && x < old,
        expect: 'mới 4,762% · cũ 7,230%', got: 'mới ' + pc(x) + ' · cũ ' + pc(old) };
    });
    T('MG-03', 'Mô hình margin', 'Rtt app cao hơn mô hình: giữ số mô hình (bất lợi hơn) và cảnh báo lệch', function () {
      var p = P(sample(function (o) { o.appRtt = 0.60; })), a = C.assess(p);
      return { pass: a.cal.mode === 'app-higher' && a.cal.h === 0 && near(a.v.rtt, 176.5 / 326.5), expect: 'giữ 54,058%, cảnh báo', got: pc(a.v.rtt) + ', ' + a.cal.mode };
    });
    T('MG-04', 'Mô hình margin', 'Giá chặn 20.000 cho HPG: chỉ tính 2.000 × 20.000', function () {
      var p = P(sample(function (o) { o.rows[0].cap = 20000; })), a = C.assess(p);
      var A = 306.5e6 - 54e6 + 40e6 + 20e6;
      return { pass: near(a.v.assets, A, 1), expect: 'tài sản tính margin ' + vnd(A), got: vnd(a.v.assets) };
    });
    T('MG-05', 'Mô hình margin', 'Giá chặn: giá giảm dưới giá chặn mới làm giảm tài sản tính margin', function () {
      var p = P(sample(function (o) { o.rows[0].cap = 20000; })), d = C.dropTo(p, 0.4, 'HPG', 0);
      return { pass: d.t === 'never', expect: 'riêng HPG giảm không đủ chạm call', got: d.t };
    });

    /* ----- Cấp cứu ----- */
    T('CE-01', 'Cấp cứu', 'Đã dưới ngưỡng: báo dưới ngưỡng, không hiện khoảng giảm dương', function () {
      var p = P(sample(stressed)), a = C.assess(p), d = C.dropTo(p, 0.4, null, 0);
      return { pass: a.status === 'below' && d.t === 'below', expect: 'below / below', got: a.status + ' / ' + d.t };
    });
    T('CE-01b', 'Cấp cứu', 'Dưới ngưỡng giải chấp: nhãn riêng', function () {
      var a = C.assess(P(sample(function (o) { o.debt = 250e6; })));
      return { pass: a.status === 'force', expect: 'force', got: a.status };
    });
    T('CE-02', 'Cấp cứu', 'Trên ngưỡng nhưng cách call dưới 10 điểm %: nhãn "gần ngưỡng"', function () {
      var a = C.assess(P(sample(function (o) { o.debt = 190e6; })));
      return { pass: a.status === 'near', expect: 'near (Rtt ' + pc(136.5 / 326.5) + ')', got: a.status + ' (Rtt ' + pc(a.v.rtt) + ')' };
    });
    T('CE-03', 'Cấp cứu', 'Nộp tiền cấn trừ nợ: cần 12,57tr để đưa Rtt từ 39,97% lên 45%', function () {
      var m = C.minToTarget(P(sample(stressed)), 0.45), o = m.options[0];
      var s = C.simulate(P(sample(stressed)), [{ type: 'deposit', amount: o.amount, mode: 'repay' }]);
      return { pass: near(o.amount, 12568750, 1e-3) && near(s.after.v.rtt, 0.45), expect: '12.568.750 đ → Rtt 45,000%', got: vnd(o.amount) + ' → Rtt ' + pc(s.after.v.rtt) };
    });
    T('CE-03b', 'Cấp cứu', 'Nộp tiền để nguyên tiền mặt: cần nhiều hơn (22,85tr)', function () {
      var m = C.minToTarget(P(sample(stressed)), 0.45), o = m.options[1];
      var s = C.simulate(P(sample(stressed)), [{ type: 'deposit', amount: o.amount, mode: 'cash' }]);
      var exp = 150e6 / 0.55 - 249.875e6;
      return { pass: near(o.amount, exp, 1e-3) && near(s.after.v.rtt, 0.45), expect: vnd(exp) + ' → Rtt 45,000%', got: vnd(o.amount) + ' → Rtt ' + pc(s.after.v.rtt) };
    });
    T('CE-04', 'Cấp cứu', 'Bán giữ tiền mã được cho vay: Rtt không cải thiện, không tự giảm nợ', function () {
      var p = P(sample(stressed)), s = C.simulate(p, [{ type: 'sell', sym: 'HPG', shares: 1000, use: 'cash' }]);
      var m = C.minToTarget(p, 0.45), o = m.options.filter(function (x) { return x.kind === 'sell-cash' && x.sym === 'HPG'; })[0];
      return { pass: s.P.debt === 150e6 && s.after.v.rtt <= C.assess(p).v.rtt && o.t === 'no-help', expect: 'nợ giữ 150tr, Rtt không tăng, "không giúp được"', got: 'nợ ' + vnd(s.P.debt) + ', Rtt ' + pc(s.after.v.rtt) + ', ' + o.t };
    });
    T('CE-05', 'Cấp cứu', 'Bán HPG trả nợ để lên 45%: 28,09tr giá trị (1.387 cp, làm tròn 1.400)', function () {
      var p = P(sample(stressed)), o = C.minToTarget(p, 0.45).options.filter(function (x) { return x.kind === 'sell-repay' && x.sym === 'HPG'; })[0];
      return { pass: o.t === 'ok' && near(o.sharesExact, 1386.992206359, 1e-4) && o.shares === 1400,
        expect: '1.386,99 cp → 1.400 cp', got: o.t === 'ok' ? o.sharesExact.toFixed(2) + ' cp → ' + o.shares + ' cp' : o.t };
    });
    T('CE-05b', 'Cấp cứu', 'Bán mã không được cho vay để trả nợ hiệu quả hơn hẳn mã được cho vay', function () {
      var p = P(sample(function (o) { stressed(o); o.rows[2].marginable = false; })), m = C.minToTarget(p, 0.45);
      var nvl = m.options.filter(function (x) { return x.kind === 'sell-repay' && x.sym === 'NVL'; })[0];
      var ssi = m.options.filter(function (x) { return x.kind === 'sell-repay' && x.sym === 'SSI'; })[0];
      var ok = nvl.t === 'ok' && (ssi.t !== 'ok' || nvl.amount < ssi.amount);
      return { pass: ok, expect: 'NVL cần ít tiền bán hơn SSI', got: 'NVL ' + (nvl.amount ? vnd(nvl.amount) : nvl.t) + ' · SSI ' + (ssi.amount ? vnd(ssi.amount) : ssi.t) };
    });
    T('CE-05c', 'Cấp cứu', 'Mục tiêu 50%: bán riêng một mã nào cũng không đủ, nói rõ "bán hết vẫn thiếu"', function () {
      var m = C.minToTarget(P(sample(stressed)), 0.50);
      var all = m.options.filter(function (x) { return x.kind === 'sell-repay'; }).every(function (x) { return x.t === 'insufficient' && x.rttIfAll < 0.5; });
      return { pass: all, expect: 'cả 5 mã: insufficient', got: all ? 'cả 5 mã: insufficient' : 'có mã báo đủ' };
    });
    T('CE-06', 'Cấp cứu', 'Bán hết cổ phiếu vẫn còn nợ: hiện nghĩa vụ còn lại', function () {
      var p = P(sample(function (o) { stressed(o); o.debt = 260e6; o.force = 0.2; o.call = 0.3; }));
      var acts = p.rows.map(function (r) { return { type: 'sell', sym: r.sym, shares: r.qty, use: 'repay' }; });
      var s = C.simulate(p, acts);
      return { pass: s.ok && s.P.debt > 0 && s.flags.indexOf('no-stock-debt-left') >= 0, expect: 'còn nợ > 0 và có cờ cảnh báo', got: 'còn nợ ' + vnd(s.P.debt) + (s.flags.indexOf('no-stock-debt-left') >= 0 ? ', có cờ' : ', thiếu cờ') };
    });
    T('CE-07', 'Cấp cứu', 'Nộp tiền chỉ là giả định: kết quả mang cờ "giả định"', function () {
      var s = C.simulate(P(sample(stressed)), [{ type: 'deposit', amount: 20e6 }]);
      return { pass: s.flags.indexOf('deposit-assumed') >= 0, expect: 'có cờ deposit-assumed', got: s.flags.join(', ') || 'không có cờ' };
    });
    T('CE-09', 'Cấp cứu', 'Nhiều mã giảm khác nhau: tính lại cả danh mục, không cộng kết quả từng mã', function () {
      var p = P(sample()), px = { HPG: 27000 * 0.8, VPB: 20500 * 0.9, NVL: 13000 * 0.7, SSI: 33000, MWG: 120000 * 0.95 };
      var v = C.valueAt(p, px, 0), mv = 43.2e6 + 55.35e6 + 45.5e6 + 66e6 + 57e6;
      return { pass: near(v.rtt, (mv + 20e6 - 150e6) / (mv + 20e6)), expect: pc((mv + 20e6 - 150e6) / (mv + 20e6)), got: pc(v.rtt) };
    });
    T('CE-12', 'Cấp cứu', 'Bán vượt lượng đang có: chặn phương án', function () {
      var s = C.simulate(P(sample()), [{ type: 'sell', sym: 'MWG', shares: 600, use: 'repay' }]);
      return { pass: !s.ok && s.errors[0].code === 'CE-12', expect: 'lỗi CE-12', got: s.ok ? 'không chặn' : s.errors[0].code };
    });
    T('FL-01', 'Phiên sàn', 'Cả danh mục giảm sàn liên tiếp: phiên thứ 5 mới chạm call (giá sàn làm tròn lên)', function () {
      var f = C.floorSessions(P(sample()), 0.4, null, 0);
      return { pass: f.t === 'n' && f.n === 5 && f.prices.HPG === 18900 && f.prices.NVL === 9140, expect: '5 phiên · HPG 18.900 · NVL 9.140', got: f.t === 'n' ? f.n + ' phiên · HPG ' + f.prices.HPG + ' · NVL ' + f.prices.NVL : f.t };
    });
    T('FL-02', 'Phiên sàn', 'Cả danh mục giảm sàn liên tiếp: phiên thứ 7 chạm giải chấp', function () {
      var f = C.floorSessions(P(sample()), 0.3, null, 0);
      return { pass: f.t === 'n' && f.n === 7 && f.prices.MWG === 72500, expect: '7 phiên · MWG 72.500', got: f.t === 'n' ? f.n + ' phiên · MWG ' + f.prices.MWG : f.t };
    });
    T('FL-03', 'Phiên sàn', 'Riêng một mã giảm sàn mãi cũng không kéo được tới call', function () {
      var p = P(sample()), all = p.rows.every(function (r) { return C.floorSessions(p, 0.4, r.sym, 0).t === 'never'; });
      return { pass: all, expect: 'cả 5 mã: never', got: all ? 'cả 5 mã: never' : 'có mã chạm' };
    });
    T('FL-04', 'Phiên sàn', 'NVL không được cho vay: chỉ 1 phiên sàn là chạm call', function () {
      var f = C.floorSessions(P(sample(function (o) { o.rows[2].marginable = false; })), 0.4, null, 0);
      return { pass: f.t === 'n' && f.n === 1 && f.prices.HPG === 25150, expect: '1 phiên · HPG 25.150', got: f.t === 'n' ? f.n + ' phiên · HPG ' + f.prices.HPG : f.t };
    });
    T('FL-05', 'Phiên sàn', 'Giá sàn đúng biên độ từng sàn', function () {
      var a = C.floorPrice('HOSE', 27000), b = C.floorPrice('HNX', 27000), c = C.floorPrice('UPCOM', 27000);
      return { pass: a === 25150 && b === 24300 && c === 23000, expect: 'HOSE 25.150 · HNX 24.300 · UPCoM 23.000', got: 'HOSE ' + a + ' · HNX ' + b + ' · UPCoM ' + c };
    });

    /* ----- Tiền bán chờ T+2 và các điểm đã chốt (21/10/2026) ----- */
    T('T2-01', 'Tiền về T+2', 'Bán 1.400 HPG trả nợ: hôm nay Rtt chưa lên (39,95%), T+2 tiền về mới lên 45,05%', function () {
      var s = C.simulate(P(sample(stressed)), [{ type: 'sell', sym: 'HPG', shares: 1400, use: 'repay' }]);
      return { pass: near(s.afterT0.v.rtt, 0.39952953138784) && near(s.after.v.rtt, 0.45053210698567) && s.P0.debt === 150e6 && s.flags.indexOf('sale-proceeds-t2') >= 0,
        expect: 'hôm nay 39,953%, nợ chưa giảm · T+2 45,053%', got: 'hôm nay ' + pc(s.afterT0.v.rtt) + ', nợ ' + vnd(s.P0.debt) + ' · T+2 ' + pc(s.after.v.rtt) };
    });
    T('T2-02', 'Tiền về T+2', 'Bán mã không được cho vay: Rtt tăng ngay hôm nay (25,42% → 32,00%), T+2 lên 35,09%', function () {
      var p = P(sample(function (o) { stressed(o); o.rows[2].marginable = false; }));
      var s = C.simulate(p, [{ type: 'sell', sym: 'NVL', shares: 2000, use: 'repay' }]);
      return { pass: near(C.assess(p).v.rtt, 0.25419515226849) && near(s.afterT0.v.rtt, 0.31996305132579) && near(s.after.v.rtt, 0.35090739589807),
        expect: '25,420% → hôm nay 31,996% → T+2 35,091%', got: pc(C.assess(p).v.rtt) + ' → hôm nay ' + pc(s.afterT0.v.rtt) + ' → T+2 ' + pc(s.after.v.rtt) };
    });
    T('T2-03', 'Tiền về T+2', 'Bảng "cần tối thiểu" tính theo lúc tiền về và báo kèm Rtt hôm nay', function () {
      var o = C.minToTarget(P(sample(stressed)), 0.45).options.filter(function (x) { return x.kind === 'sell-repay' && x.sym === 'HPG'; })[0];
      return { pass: o.shares === 1400 && near(o.rttAfter, 0.45053210698567) && near(o.rttT0, 0.39952953138784),
        expect: '1.400 cp · T+2 45,053% · hôm nay 39,953%', got: o.shares + ' cp · T+2 ' + pc(o.rttAfter) + ' · hôm nay ' + pc(o.rttT0) };
    });
    T('T2-04', 'Tiền về T+2', 'Nộp tiền vẫn cấn trừ nợ ngay, không phải chờ', function () {
      var s = C.simulate(P(sample(stressed)), [{ type: 'deposit', amount: 12568750 }]);
      return { pass: near(s.afterT0.v.rtt, 0.45) && near(s.P0.debt, 150e6 - 12568750, 1e-3), expect: 'hôm nay đã 45,000%', got: 'hôm nay ' + pc(s.afterT0.v.rtt) };
    });
    T('DEF-01', 'Tiền về T+2', 'Mặc định đã chốt: gần ngưỡng 10 điểm, mục tiêu call + 5, nộp tiền cấn trừ, tiền bán T+2', function () {
      var d = C.DEFAULTS, ok = d.nearBand === 0.10 && d.targetAdd === 0.05 && d.depositMode === 'repay' && d.settle === 't2';
      return { pass: ok, expect: '0,10 · 0,05 · repay · t2', got: d.nearBand + ' · ' + d.targetAdd + ' · ' + d.depositMode + ' · ' + d.settle };
    });

    /* ----- Kiểm thử ngẫu nhiên ----- */
    T('RND-01', 'Ngẫu nhiên', '500 danh mục ngẫu nhiên: lời giải số khớp công thức cũ khi không có giá chặn/mã loại trừ', function () {
      var seed = 7, bad = 0, n = 0;
      function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
      for (var i = 0; i < 500; i++) {
        var rows = [], k = 1 + Math.floor(rnd() * 6);
        for (var j = 0; j < k; j++) rows.push({ sym: 'M' + i + 'X' + j, qty: 100 * (1 + Math.floor(rnd() * 100)), cost: 10000, price: 5000 + Math.floor(rnd() * 100000) });
        var mv = rows.reduce(function (s, r) { return s + r.qty * r.price; }, 0);
        var p = P({ rows: rows, cash: Math.floor(rnd() * mv * 0.3), debt: Math.floor(rnd() * mv * 0.8), call: 0.4, force: 0.3 });
        var a = C.dropTo(p, 0.4, null, 0), b = C.legacy.dropAllToCall(mv, p.cash, p.debt, 0.4);
        if (b.t === 'x') { n++; if (a.t !== 'x' || Math.abs(a.x - b.x) > 1e-9) bad++; }
      }
      return { pass: bad === 0 && n > 100, expect: '0 ca lệch', got: bad + ' ca lệch / ' + n + ' ca có lời giải' };
    });
    T('RND-02', 'Ngẫu nhiên', '300 danh mục bị call ngẫu nhiên: làm theo con số "cần tối thiểu" thì Rtt về đúng mục tiêu', function () {
      var seed = 11, bad = 0, n = 0;
      function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
      for (var i = 0; i < 300; i++) {
        var rows = [], k = 2 + Math.floor(rnd() * 4);
        for (var j = 0; j < k; j++) rows.push({ sym: 'R' + i + 'Y' + j, qty: 100 * (5 + Math.floor(rnd() * 100)), cost: 20000, price: 8000 + Math.floor(rnd() * 80000), marginable: rnd() > 0.2, cap: rnd() > 0.7 ? 9000 + Math.floor(rnd() * 50000) : null });
        var A = rows.reduce(function (s, r) { return s + (r.marginable ? r.qty * (r.cap ? Math.min(r.price, r.cap) : r.price) : 0); }, 0);
        var cash = Math.floor(rnd() * A * 0.1), debt = Math.floor((A + cash) * (0.62 + rnd() * 0.15));
        var p = P({ rows: rows, cash: cash, debt: debt, call: 0.4, force: 0.3, fee: 0.0015, tax: 0.001 });
        var m = C.minToTarget(p, 0.4 + rnd() * 0.15);
        if (m.t !== 'need') continue;
        m.options.forEach(function (o) {
          var s;
          if (o.kind === 'deposit-repay') s = C.simulate(p, [{ type: 'deposit', amount: o.amount, mode: 'repay' }]);
          else if (o.kind === 'deposit-cash') s = C.simulate(p, [{ type: 'deposit', amount: o.amount, mode: 'cash' }]);
          else if (o.t === 'ok') s = C.simulate(p, [{ type: 'sell', sym: o.sym, shares: o.shares, use: o.kind === 'sell-repay' ? 'repay' : 'cash' }]);
          else return;
          n++;
          var r = s.after.v.rtt;
          var exact = o.kind.indexOf('deposit') === 0;
          if (exact ? Math.abs(r - m.target) > 1e-6 : r < m.target - 1e-6) bad++;
        });
      }
      return { pass: bad === 0 && n > 500, expect: '0 ca hụt mục tiêu', got: bad + ' ca hụt / ' + n + ' phương án kiểm lại' };
    });

    return out;
  }
  return { run: run };
});
