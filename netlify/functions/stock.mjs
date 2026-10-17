// Giá cổ phiếu cho Bác sĩ danh mục.
// /api/stock?s=HPG,VPB         → giá gần nhất (TRỄ 15 PHÚT) và giá tham chiếu phiên trước
// /api/stock?s=HPG,VNINDEX&h=400 → thêm lịch sử giá ngày (đóng cửa, cao, thấp) trong h ngày gần nhất
// Nguồn: VNDirect dchart. Đơn vị giá cổ phiếu trả về: nghìn đồng (như bảng điện).

const DELAY = 15 * 60;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  Accept: '*/*', Origin: 'https://dchart.vndirect.com.vn', Referer: 'https://dchart.vndirect.com.vn/',
};

async function getJSON(url, ms = 7000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: HEADERS, signal: ctl.signal });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally { clearTimeout(t); }
}

const dayVN = ts => new Date((ts + 7 * 3600) * 1000).toISOString().slice(0, 10);

async function quote(sym) {
  const now = Math.floor(Date.now() / 1000);
  const j = await getJSON(`https://dchart-api.vndirect.com.vn/dchart/history?resolution=1&symbol=${sym}&from=${now - 10 * 86400}&to=${now}`);
  if (j?.s !== 'ok' || !j.t?.length) throw new Error('no data');
  let i = j.t.length - 1;
  while (i >= 0 && j.t[i] > now - DELAY) i--;
  if (i < 0) throw new Error('no delayed bar');
  const d = dayVN(j.t[i]);
  let k = i;
  while (k >= 0 && dayVN(j.t[k]) === d) k--;
  return { p: j.c[i], ref: k >= 0 ? j.c[k] : null, t: j.t[i] };
}

async function history(sym, days) {
  const now = Math.floor(Date.now() / 1000);
  const j = await getJSON(`https://dchart-api.vndirect.com.vn/dchart/history?resolution=D&symbol=${sym}&from=${now - days * 86400}&to=${now}`);
  if (j?.s !== 'ok' || !j.t?.length) throw new Error('no data');
  return { t: j.t.map(dayVN), c: j.c, h: j.h, l: j.l };
}

export default async (req) => {
  const u = new URL(req.url);
  const syms = [...new Set((u.searchParams.get('s') || '').toUpperCase().split(',').map(x => x.trim()).filter(x => /^[A-Z0-9]{3,8}$/.test(x)))].slice(0, 40);
  const h = Math.min(800, Math.max(0, parseInt(u.searchParams.get('h') || '0', 10) || 0));
  const out = { updated: new Date().toISOString(), delay: 15, q: {}, h: {}, errors: {} };
  await Promise.all(syms.map(async s => {
    try { out.q[s] = await quote(s); } catch (e) { out.errors[s] = 'Không lấy được giá'; }
    if (h) { try { out.h[s] = await history(s, h); } catch (e) { out.errors[s] = out.errors[s] || 'Không lấy được lịch sử giá'; } }
  }));
  return new Response(JSON.stringify(out), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${h ? 900 : 60}, stale-while-revalidate=300`,
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/stock' };
