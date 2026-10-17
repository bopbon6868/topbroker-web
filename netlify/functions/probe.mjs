// Tạm thời: thử các nguồn dữ liệu tài chính (sẽ xoá sau)
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36', Accept: 'application/json, */*' };
const B = 'https://api-finfo.vndirect.com.vn/v4/';
const get = async u => { const r = await fetch(B + u, { headers: H, signal: AbortSignal.timeout(6000) }); return r.json(); };
export default async (req) => {
  const q = new URL(req.url).searchParams, s = (q.get('s') || 'HPG').toUpperCase(), mode = q.get('mode') || 'models', t = q.get('t') || '2';
  let lines = [];
  try {
    if (mode === 'models') {
      const j = await get(`financial_models?sort=displayOrder:asc&q=${q.get('cl')==='0'?'':'codeList:'+s+'~'}modelType:${t}&size=300`);
      lines = (j.data || []).map(d => `${d.itemCode} ${d.itemVnName} [${d.note || ''}]`);
    } else if (mode === 'fs') {
      const j = await get(`financial_statements?q=code:${s}~reportType:QUARTER&sort=fiscalDate:desc&size=${q.get('size')||500}`);
      const d = (j.data || []).filter(x => String(x.modelType) === t); const dates = [...new Set(d.map(x => x.fiscalDate))].slice(0, 6);
      lines.push('dates ' + dates.join(','));
      const want = (q.get('items') || '').split(',').filter(Boolean);
      d.filter(x => x.fiscalDate === dates[0] && (!want.length || want.includes(String(x.itemCode)))).forEach(x => lines.push(`${x.fiscalDate} ${x.itemCode} ${x.numericValue}`));
    } else if (mode === 'is') {
      const j = await get(`financial_statements?q=code:${s}~reportType:QUARTER~fiscalDate:${q.get('d')||'2026-06-30'}&size=500`);
      const d = (j.data || []).filter(x => !/^(1|89|101|411|3|91|103|413)$/.test(String(x.modelType)));
      lines = d.map(x => `${x.modelType} ${x.itemCode} ${x.numericValue}`);
    } else if (mode === 'var') {
      const vs = [`financial_statements?q=code:${s}~reportType:QUARTER~modelType:${t}&sort=fiscalDate:desc&size=200`,
        `financial_statements?q=code:${s}~modelType:${t}~reportType:QUARTER&sort=fiscalDate:desc&size=200`,
        `financial_statements?q=code:${s}~reportType:QUARTER~modelType:${t}&size=200`,
        `financial_statements?q=code:${s}~reportType:QUARTER&sort=fiscalDate:desc&size=1000`,
        `financial_statements?q=code:${s}~reportType:QUARTER~fiscalDate:2026-06-30,2025-06-30&size=500`,
        `financial_statements?q=code:${s}~reportType:QUARTER~itemCode:${q.get('ic')||'23000'}&sort=fiscalDate:desc&size=50`];
      for (const v of vs) { try { const j = await get(v); lines.push((j.data||[]).length + ' total=' + j.totalElements + ' ' + v.slice(0,110) + ' :: ' + JSON.stringify(j).slice(0,120)); } catch (e) { lines.push('ERR ' + e.message + ' ' + v); } }
    } else if (mode === 'mt') {
      const j = await get(`financial_statements?q=code:${s}~reportType:${q.get('rt')||'QUARTER'}&sort=fiscalDate:desc&size=600`);
      const d = j.data || [], m = {};
      d.forEach(x => { const k = x.modelType + ' ' + x.fiscalDate; m[k] = (m[k] || 0) + 1; });
      lines = Object.entries(m).slice(0, 30).map(([k, v]) => k + ' n=' + v);
      lines.push('total ' + d.length + ' ' + JSON.stringify(j).slice(0, 200));
    } else if (mode === 'ratio') {
      const j = await get(`ratios/latest?filter=ratioCode:${q.get('r') || 'PRICE_TO_EARNINGS,PRICE_TO_BOOK,ROAE_TR_AVG5Q,ROAA_TR_AVG5Q,EPS_TR,MARKETCAP'}&where=code:${s}&order=reportDate&fields=ratioCode,value,reportDate`);
      lines = (j.data || []).map(d => `${d.ratioCode} ${d.value} ${d.reportDate}`);
    }
  } catch (e) { lines.push('ERR ' + e.message); }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
};
export const config = { path: '/api/probe' };
