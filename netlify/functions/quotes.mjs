// Máy lấy giá cho topbroker.fun – trả về /api/quotes
// Quốc tế, hàng hóa, crypto: Yahoo Finance (nguồn miễn phí, chỉ số có thể trễ vài phút).
// Chỉ số Việt Nam: VNDirect dchart, CHỦ ĐỘNG LÀM TRỄ 15 PHÚT (không phát lại dữ liệu thời gian thực của Sở).
// Kết quả được CDN của Netlify giữ 30 giây, nên dù nhiều khách cùng xem, nguồn chỉ bị gọi ~2 lần/phút.

const YAHOO = {
  DJI: '^DJI', IXIC: '^IXIC', GSPC: '^GSPC', VIX: '^VIX',
  N225: '^N225', HSI: '^HSI', KS11: '^KS11', FTSE: '^FTSE',
  GOLD: 'GC=F', BRENT: 'BZ=F', WTI: 'CL=F', BTC: 'BTC-USD', ETH: 'ETH-USD',
};
const VN = { VNINDEX: 'VNINDEX', VN30: 'VN30', HNX: 'HNX', UPCOM: 'UPCOM' };
const VN_DELAY = 15 * 60; // giây
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', Accept: 'application/json' };

async function getJSON(url, ms = 6000, headers = UA) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers, signal: ctl.signal });
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function yahoo(key, sym) {
  const path = `/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`;
  let j;
  try { j = await getJSON('https://query1.finance.yahoo.com' + path); }
  catch { j = await getJSON('https://query2.finance.yahoo.com' + path); }
  const m = j?.chart?.result?.[0]?.meta;
  if (!m || m.regularMarketPrice == null) throw new Error('no data ' + sym);
  const prev = m.chartPreviousClose ?? m.previousClose;
  const now = Date.now() / 1000;
  const reg = m.currentTradingPeriod?.regular;
  const open = key === 'BTC' || key === 'ETH' || (reg && now >= reg.start && now <= reg.end);
  return { p: m.regularMarketPrice, c: prev ? (m.regularMarketPrice / prev - 1) * 100 : null, t: m.regularMarketTime, open: !!open };
}

function vnParts(ts) {
  const d = new Date((ts + 7 * 3600) * 1000);
  return { day: d.toISOString().slice(0, 10), mins: d.getUTCHours() * 60 + d.getUTCMinutes(), wd: d.getUTCDay() };
}
function vnOpen(ts) {
  const { mins, wd } = vnParts(ts);
  return wd >= 1 && wd <= 5 && ((mins >= 540 && mins <= 690) || (mins >= 780 && mins <= 885));
}

const VN_YAHOO = { VNINDEX: '^VNINDEX.VN', VN30: '^VN30.VN', HNX: '^HASTC.VN', UPCOM: '^UPCOM.VN' };
const VND_HEADERS = { 'User-Agent': UA['User-Agent'], Accept: '*/*', Origin: 'https://dchart.vndirect.com.vn', Referer: 'https://dchart.vndirect.com.vn/' };

// Dự phòng: Yahoo (nến 5 phút), vẫn cắt trễ 15 phút
async function vnYahoo(key) {
  const sym = VN_YAHOO[key];
  const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`);
  const r = j?.chart?.result?.[0];
  const m = r?.meta, ts = r?.timestamp || [], cl = r?.indicators?.quote?.[0]?.close || [];
  if (!m) throw new Error('no data ' + sym);
  const now = Math.floor(Date.now() / 1000), cut = now - VN_DELAY;
  let i = ts.length - 1;
  while (i >= 0 && (ts[i] > cut || cl[i] == null)) i--;
  const p = i >= 0 ? cl[i] : m.regularMarketPrice, t = i >= 0 ? ts[i] : m.regularMarketTime;
  const prev = m.chartPreviousClose ?? m.previousClose;
  return { p: Math.round(p * 100) / 100, c: prev ? (p / prev - 1) * 100 : null, t, open: vnOpen(now), delay: 15, src: 'yahoo' };
}

async function vndirect(sym) {
  try { return await vndirectRaw(sym); }
  catch (e) { return await vnYahoo(sym); }
}

async function vndirectRaw(sym) {
  const now = Math.floor(Date.now() / 1000);
  const j = await getJSON(`https://dchart-api.vndirect.com.vn/dchart/history?resolution=1&symbol=${sym}&from=${now - 8 * 86400}&to=${now}`, 6000, VND_HEADERS);
  if (j?.s !== 'ok' || !j.t?.length) throw new Error('no data ' + sym);
  const cut = now - VN_DELAY;
  let i = j.t.length - 1;
  while (i >= 0 && j.t[i] > cut) i--;
  if (i < 0) throw new Error('no delayed bar ' + sym);
  const day = vnParts(j.t[i]).day;
  let k = i;
  while (k >= 0 && vnParts(j.t[k]).day === day) k--;
  const prev = k >= 0 ? j.c[k] : null;
  return { p: j.c[i], c: prev ? (j.c[i] / prev - 1) * 100 : null, t: j.t[i], open: vnOpen(now), delay: 15 };
}

export default async () => {
  const jobs = [
    ...Object.entries(YAHOO).map(([k, s]) => yahoo(k, s).then(v => [k, v])),
    ...Object.entries(VN).map(([k, s]) => vndirect(s).then(v => [k, v])),
  ];
  const res = await Promise.allSettled(jobs);
  const q = {}, errors = [];
  res.forEach(r => r.status === 'fulfilled' ? (q[r.value[0]] = r.value[1]) : errors.push(String(r.reason?.message || r.reason)));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), q, errors }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=30, stale-while-revalidate=120',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/quotes' };
