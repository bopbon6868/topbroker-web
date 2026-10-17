// Kết quả kinh doanh quý gần nhất + định giá cho Bác sĩ danh mục.
// /api/fund?s=HPG,VPB → { f: { HPG: { q, d, bank, rev, revPrev, revY, np, npPrev, npY, pe, pb, roe } } }
// Nguồn: VNDirect finfo (báo cáo tài chính quý, chỉ số định giá). Đơn vị: đồng.
// Mã hàng: 21001 doanh thu thuần (doanh nghiệp, chứng khoán), 421900 thu nhập lãi thuần (ngân hàng),
// 23000 lợi nhuận sau thuế của cổ đông công ty mẹ, 23003 lợi nhuận sau thuế (dự phòng).
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  Accept: 'application/json, */*', Origin: 'https://dstock.vndirect.com.vn', Referer: 'https://dstock.vndirect.com.vn/',
};
const B = 'https://api-finfo.vndirect.com.vn/v4/';
const get = async (u, ms = 6000) => {
  const r = await fetch(B + u, { headers: H, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
};
const yoy = (a, b) => (a == null || b == null || b <= 0 ? null : a / b - 1);

async function one(s) {
  const [fs, rt] = await Promise.all([
    get(`financial_statements?q=code:${s}~reportType:QUARTER~itemCode:21001,421900,23000,23003&sort=fiscalDate:desc&size=60`),
    get(`ratios/latest?filter=ratioCode:PRICE_TO_EARNINGS,PRICE_TO_BOOK,ROAE_TR_AVG5Q&where=code:${s}&order=reportDate&fields=ratioCode,value,reportDate`).catch(() => ({ data: [] })),
  ]);
  const by = {};
  (fs.data || []).forEach(x => { (by[x.fiscalDate] = by[x.fiscalDate] || {})[x.itemCode] = x.numericValue; });
  const dates = Object.keys(by).sort().reverse();
  const np = d => (by[d] ? (by[d][23000] ?? by[d][23003] ?? null) : null);
  const d = dates.find(x => np(x) != null);
  if (!d) return null;
  const bank = by[d][421900] != null && by[d][21001] == null;
  const rev = d2 => (by[d2] ? (bank ? by[d2][421900] : by[d2][21001]) ?? null : null);
  const y = String(+d.slice(0, 4) - 1) + d.slice(4);
  const m = +d.slice(5, 7), q = Math.ceil(m / 3);
  const out = { q: `Q${q}/${d.slice(0, 4)}`, d, bank, rev: rev(d), revPrev: rev(y), np: np(d), npPrev: np(y) };
  out.revY = yoy(out.rev, out.revPrev); out.npY = yoy(out.np, out.npPrev);
  (rt.data || []).forEach(r => {
    if (r.ratioCode === 'PRICE_TO_EARNINGS') out.pe = r.value;
    if (r.ratioCode === 'PRICE_TO_BOOK') out.pb = r.value;
    if (r.ratioCode === 'ROAE_TR_AVG5Q') out.roe = r.value;
  });
  return out;
}

export default async (req) => {
  const u = new URL(req.url);
  const syms = [...new Set((u.searchParams.get('s') || '').toUpperCase().split(',').map(x => x.trim()).filter(x => /^[A-Z0-9]{3,8}$/.test(x)))].slice(0, 25);
  const out = { updated: new Date().toISOString(), src: 'VNDirect', f: {}, errors: {} };
  await Promise.all(syms.map(async s => { try { out.f[s] = await one(s); } catch (e) { out.errors[s] = 'Không lấy được dữ liệu tài chính'; } }));
  return new Response(JSON.stringify(out), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=21600, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/fund' };
