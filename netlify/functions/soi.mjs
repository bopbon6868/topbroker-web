// Soi mã theo ngành: ngành, nhóm so sánh và số liệu tài chính 3 năm cho trang /soi-ma/.
// /api/soi?s=AGG            → nhóm so sánh = 6 mã vốn hóa lớn nhất cùng ngành cấp 3 (ICB, VNDirect)
// /api/soi?s=AGG&p=VHM,NVL,KDH → nhóm so sánh tự chọn (3–10 mã)
// Nguồn: VNDirect finfo (phân ngành ICB, báo cáo tài chính năm, P/E – P/B cuối năm, chỉ số hiện tại).
// Tiền: tỷ đồng. Tỷ lệ: số thập phân (0,15 = 15%). Giá lấy riêng qua /api/stock.
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  Accept: 'application/json, */*', Origin: 'https://dstock.vndirect.com.vn', Referer: 'https://dstock.vndirect.com.vn/',
};
const B = 'https://api-finfo.vndirect.com.vn/v4/';
const get = async (u, ms = 7000) => {
  const r = await fetch(B + u, { headers: H, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error('VNDirect ' + r.status);
  return (await r.json()).data || [];
};
const N_PEERS = 6;
const SYM = /^[A-Z0-9]{3,8}$/;
const num = v => typeof v === 'number' && isFinite(v);
const div = (a, b) => (num(a) && num(b) && b !== 0 ? a / b : null);
const grow = (a, b) => (num(a) && num(b) && b > 0 ? a / b - 1 : null);
const mean2 = (a, b) => (num(a) && num(b) ? (a + b) / 2 : num(a) ? a : null);

// Mã hàng báo cáo tài chính (VNDirect)
const IT = {
  rev: 21001, gp: 23100, op: 23110, np: 23000, npAll: 23003, pbt: 23800, int: 22509,
  ta: 12700, ca: 11000, liab: 13000, stl: 13100, sd: 13110, ld: 13340, eq: 14000, cash: 11100, cfo: 32000,
  nii: 421900, toi: 421701, loan: 412100, dep: 413300, ppop: 88888,
};
const ITEMS = Object.values(IT).join(',');

function ratios(cur, prev, bank) {
  const np = cur.np ?? cur.npAll;
  const npPrev = prev ? (prev.np ?? prev.npAll) : null;
  const o = {
    roe: div(np, mean2(cur.eq, prev?.eq)),
    roa: div(np, mean2(cur.ta, prev?.ta)),
    npG: grow(np, npPrev),
  };
  if (bank) {
    o.niiTa = div(cur.nii, mean2(cur.ta, prev?.ta));
    o.loanG = grow(cur.loan, prev?.loan);
    o.depG = grow(cur.dep, prev?.dep);
    o.ldr = div(cur.loan, cur.dep);
    o.cir = num(cur.ppop) && num(cur.toi) && cur.toi > 0 ? 1 - cur.ppop / cur.toi : null;
    o.eqTa = div(cur.eq, cur.ta);
  } else {
    o.gm = div(cur.gp, cur.rev);
    o.npm = div(cur.npAll ?? np, cur.rev);
    o.revG = grow(cur.rev, prev?.rev);
    o.de = div((cur.sd || 0) + (cur.ld || 0), cur.eq);
    o.le = div(cur.liab, cur.eq);
    o.cr = div(cur.ca, cur.stl);
    o.ic = num(cur.int) && cur.int > 0 && num(cur.pbt) ? (cur.pbt + cur.int) / cur.int : null;
    o.cfoNp = num(cur.cfo) && num(np) && np > 0 ? cur.cfo / np : null;
  }
  return o;
}

export default async (req) => {
  const u = new URL(req.url);
  const t = (u.searchParams.get('s') || '').toUpperCase().trim();
  const manual = [...new Set((u.searchParams.get('p') || '').toUpperCase().split(/[^A-Z0-9]+/).filter(x => SYM.test(x) && x !== t))].slice(0, 10);
  const send = (body, status = 200, cache = true) => new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': cache ? 'public, durable, s-maxage=21600, stale-while-revalidate=3600' : 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
  if (!SYM.test(t)) return send({ error: 'Mã không hợp lệ' }, 400, false);

  try {
    // 1) thông tin mã + phân ngành ICB cấp 2, 3
    const [info, ind] = await Promise.all([
      get(`stocks?q=code:${t}&fields=code,shortName,companyName,floor,status,type`),
      get(`industry_classification?q=codeList:${t}~industryLevel:2,3`).catch(() => []),
    ]);
    const me = info[0];
    if (!me) return send({ error: `Không tìm thấy mã ${t}` }, 404, false);
    const l2 = ind.find(x => String(x.industryLevel) === '2'), l3 = ind.find(x => String(x.industryLevel) === '3');
    const out = {
      t, updated: new Date().toISOString(), src: 'VNDirect',
      name: me.shortName || me.companyName || t, company: me.companyName || '', floor: String(me.floor || '').replace('HSX', 'HOSE'),
      industry: l3?.vietnameseName || l2?.vietnameseName || '', industry2: l2?.vietnameseName || '',
      names: { [t]: me.shortName || t }, floors: { [t]: me.floor || '' }, mcap: {},
    };

    // 2) nhóm so sánh
    let peers = [];
    if (manual.length >= 3) {
      const st = await get(`stocks?q=code:${manual.join(',')}&fields=code,shortName,floor&size=20`);
      st.forEach(x => { out.names[x.code] = x.shortName || x.code; out.floors[x.code] = x.floor || ''; });
      peers = manual.filter(x => out.names[x]);
      out.peerSrc = 'manual';
    } else {
      const pool = (lv) => (lv?.codeList || '').split(',').map(x => x.trim()).filter(x => SYM.test(x) && x !== t);
      let cand = pool(l3); out.peerLevel = 3;
      if (cand.length < N_PEERS) { cand = pool(l2); out.peerLevel = 2; out.industry = l2?.vietnameseName || out.industry; }
      if (!cand.length) return send({ ...out, error: 'Chưa có phân ngành cho mã này. Hãy nhập nhóm so sánh tự chọn.' }, 200, false);
      const st = await get(`stocks?q=code:${cand.join(',')}~status:listed~type:STOCK&fields=code,shortName,floor&size=400`);
      const listed = st.map(x => x.code);
      st.forEach(x => { out.names[x.code] = x.shortName || x.code; out.floors[x.code] = x.floor || ''; });
      const mc = await get(`ratios/latest?filter=ratioCode:MARKETCAP&where=code:${listed.join(',')}&order=reportDate&fields=code,value`);
      peers = mc.filter(x => num(x.value)).sort((a, b) => b.value - a.value).slice(0, N_PEERS).map(x => x.code);
      out.peerSrc = 'icb';
    }
    if (peers.length < 3) return send({ ...out, peers, error: 'Không đủ mã để so sánh. Hãy nhập 3–7 mã vào ô nhóm so sánh tự chọn.' }, 200, false);
    out.peers = peers;
    const all = [t, ...peers];
    const y1 = new Date().getFullYear() - 5;

    // 3) báo cáo tài chính năm, P/E – P/B cuối năm, chỉ số hiện tại
    const yearEnds = [0, 1, 2, 3].map(k => `${new Date().getFullYear() - 1 - k}-12-31`).join(',');
    const [fs, hist, now] = await Promise.all([
      get(`financial_statements?q=code:${all.join(',')}~reportType:ANNUAL~itemCode:${ITEMS}~fiscalDate:gte:${y1}-01-01&sort=fiscalDate:desc&size=3000`, 8000),
      get(`ratios?q=code:${all.join(',')}~ratioCode:PRICE_TO_EARNINGS,PRICE_TO_BOOK~reportDate:${yearEnds}&size=200`).catch(() => []),
      get(`ratios/latest?filter=ratioCode:MARKETCAP,PRICE_TO_EARNINGS,PRICE_TO_BOOK,BETA,FREEFLOAT,OUTSTANDING_SHARES,DIVIDEND_YIELD,ROAE_TR_AVG5Q&where=code:${all.join(',')}&order=reportDate&fields=code,ratioCode,value,reportDate`).catch(() => []),
    ]);

    const raw = {};
    fs.forEach(x => {
      const y = +String(x.fiscalDate).slice(0, 4);
      const k = Object.keys(IT).find(kk => IT[kk] === +x.itemCode);
      if (!k || !num(x.numericValue)) return;
      ((raw[x.code] = raw[x.code] || {})[y] = raw[x.code][y] || {})[k] = x.numericValue / 1e9;
    });
    const bankOf = c => { const r = raw[c]; if (!r) return false; const y = Math.max(...Object.keys(r).map(Number)); return num(r[y].nii) && !num(r[y].rev); };
    out.isBank = bankOf(t);
    const yrs = raw[t] ? Object.keys(raw[t]).map(Number).filter(y => num(raw[t][y].np ?? raw[t][y].npAll)).sort((a, b) => a - b) : [];
    if (!yrs.length) return send({ ...out, error: `VNDirect chưa có báo cáo tài chính năm của ${t}.` }, 200, false);
    out.years = yrs.slice(-3);

    out.fin = {}; out.st = {};
    all.forEach(c => {
      out.fin[c] = {}; out.st[c] = {};
      out.years.forEach(y => {
        const cur = raw[c]?.[y]; if (!cur) return;
        out.st[c][y] = cur;
        out.fin[c][y] = ratios(cur, raw[c]?.[y - 1], out.isBank);
      });
    });
    hist.forEach(x => {
      const y = +String(x.reportDate).slice(0, 4); const f = out.fin[x.code]?.[y]; if (!f || !num(x.value)) return;
      if (x.ratioCode === 'PRICE_TO_EARNINGS') f.pe = x.value; else if (x.ratioCode === 'PRICE_TO_BOOK') f.pb = x.value;
    });
    out.now = {};
    now.forEach(x => {
      const o = (out.now[x.code] = out.now[x.code] || {});
      const k = { MARKETCAP: 'mcap', PRICE_TO_EARNINGS: 'pe', PRICE_TO_BOOK: 'pb', BETA: 'beta', FREEFLOAT: 'ff', OUTSTANDING_SHARES: 'so', DIVIDEND_YIELD: 'dy', ROAE_TR_AVG5Q: 'roeTtm' }[x.ratioCode];
      if (k && num(x.value)) { o[k] = x.value; if (k === 'pe') o.asof = x.reportDate; }
    });
    out.missing = all.filter(c => !Object.keys(out.fin[c]).length);
    return send(out);
  } catch (e) {
    return send({ error: 'Không lấy được dữ liệu từ VNDirect (' + (e.name === 'TimeoutError' ? 'quá thời gian chờ' : e.message) + '). Thử lại sau ít phút.' }, 502, false);
  }
};

export const config = { path: '/api/soi' };
