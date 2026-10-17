// Tạm thời: thử các nguồn dữ liệu tài chính (sẽ xoá sau)
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36', Accept: 'application/json, */*' };
const U = s => ({
  tcbs_is: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/finance/${s}/incomestatement?yearly=0&isAll=false`,
  tcbs_ratio: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/finance/${s}/financialratio?yearly=0&isAll=false`,
  tcbs_overview: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/${s}/overview`,
  vnd_fs: `https://api-finfo.vndirect.com.vn/v4/financial_statements?q=code:${s}~reportType:QUARTER~modelType:2&sort=fiscalDate:desc&size=20`,
  vnd_ratio: `https://api-finfo.vndirect.com.vn/v4/ratios/latest?filter=ratioCode:PRICE_TO_EARNINGS,PRICE_TO_BOOK,ROAE_TR_AVG5Q&where=code:${s}&order=reportDate&fields=ratioCode,value`,
  dchart: `https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=${s}&from=${Math.floor(Date.now()/1000)-20*86400}&to=${Math.floor(Date.now()/1000)}`,
});
export default async (req) => {
  const s = (new URL(req.url).searchParams.get('s') || 'HPG').toUpperCase();
  const out = {};
  await Promise.all(Object.entries(U(s)).map(async ([k, u]) => {
    try { const r = await fetch(u, { headers: H, signal: AbortSignal.timeout(4000) }); const t = await r.text(); out[k] = r.status + ' len' + t.length + ' ' + t.slice(0, +(new URL(req.url).searchParams.get('n')||250)); }
    catch (e) { out[k] = 'ERR ' + e.message; }
  }));
  return new Response(Object.entries(out).map(([k,v])=>k+': '+v).join('\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
};
export const config = { path: '/api/probe' };
