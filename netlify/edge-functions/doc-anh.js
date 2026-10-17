// Nhập danh mục bằng ảnh chụp màn hình app – POST /api/doc-anh (chỉ cho thành viên có mã, anh Hải chốt 18/10/2026).
// Nhận { code, images: [{ type: 'image/jpeg', data: '<base64>' }] } (tối đa 2 ảnh: danh mục + tài sản).
// Kiểm tra mã trong Netlify Blobs "tb-thanh-vien", hạn mức mỗi ngày (mặc định 10 lượt), gọi Claude đọc ảnh qua Netlify AI Gateway.
// Ảnh chỉ dùng để đọc rồi bỏ: không lưu ảnh, không ghi log nội dung. Chỉ cộng lượt dùng khi đọc thành công.
import { getStore } from '@netlify/blobs';

const ENV = k => { try { return (globalThis.Netlify && Netlify.env.get(k)) || (globalThis.Deno && Deno.env.get(k)) || ''; } catch { return ''; } };
const MODEL = ENV('TB_OCR_MODEL') || 'claude-opus-5-5';
const FALLBACK = 'claude-sonnet-5-5';
const HAN_MUC = 10;
const today = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

const SYSTEM = `Bạn chép số liệu từ ảnh chụp màn hình app chứng khoán Việt Nam (SSI, VPS, TCBS, VNDirect, MBS, HSC, Mirae Asset, KIS, VCBS, Vietcap, DNSE, Pinetree…). Chỉ chép đúng số hiện trong ảnh, không đoán, không tự tính thêm.

ĐẦU RA: chỉ các dòng theo mẫu, mỗi dòng bắt đầu bằng mã nhãn và dấu "|". Không viết gì khác, không markdown.
M|MÃ CỔ PHIẾU|tổng khối lượng đang nắm giữ|giá vốn (đồng/cổ phiếu)|giá thị trường trong ảnh (đồng/cổ phiếu, bỏ trống nếu không có)
T|tiền mặt (đồng)
N|tổng dư nợ vay margin/ký quỹ (đồng)
R|tỷ lệ ký quỹ hiện tại (%)
G|ghi chú ngắn khi có chỗ không chắc (tối đa 3 dòng G)

QUY TẮC:
- Khối lượng: lấy tổng nắm giữ. Nếu app tách khả dụng / chờ về / cầm cố / chờ giao dịch thì cộng lại thành tổng, và ghi G nói rõ đã cộng.
- Giá: app thường ghi theo nghìn đồng (28.5, 28,50, 28.500). Luôn đổi ra đồng: 28.5 → 28500.
- Số: chỉ viết chữ số, không dấu phân cách hàng nghìn; thập phân (nếu có) dùng dấu chấm. Số tiền ghi đủ đồng (1,2 tỷ → 1200000000).
- Tiền mặt: số dư tiền có thể dùng (tiền mặt/số dư tiền); không lấy sức mua có cộng margin.
- Dư nợ: tổng nợ vay margin (gốc + lãi nếu app gộp). Không có khoản vay thì không viết dòng N.
- Chỉ có một trong hai ảnh nói về tiền/nợ thì chỉ lấy ở ảnh đó. Mã trùng ở hai ảnh thì chỉ viết một lần.
- Không chép tên người, số tài khoản, số điện thoại.
- Ảnh không phải danh mục/tài sản chứng khoán thì chỉ viết: G|Ảnh không phải màn hình danh mục chứng khoán.`;

let TESTMODE = false;
const json = (o, s = 200) => new Response(JSON.stringify(TESTMODE ? { ...o, http: s } : o), { status: TESTMODE ? 200 : s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const num = v => { const s = String(v || '').replace(/[^\d.]/g, ''); if (!s) return null; const n = parseFloat(s); return isFinite(n) ? n : null; };

async function handle(req) {
  const qs = new URL(req.url).searchParams;
  TESTMODE = req.method === 'GET' && qs.get('test') === '1';
  if (req.method === 'GET') return json({ ready: !!(ENV('ANTHROPIC_API_KEY') || ENV('NETLIFY_AI_GATEWAY_KEY')), model: MODEL, build: 'ocr1' });
  if (req.method !== 'POST') return json({ error: 'Chỉ nhận POST' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
  const code = String(b.code || '').trim().toUpperCase();
  const imgs = (Array.isArray(b.images) ? b.images : []).slice(0, 2).filter(i => i && /^image\/(jpeg|png|webp)$/.test(i.type) && typeof i.data === 'string' && i.data.length > 100);
  if (!imgs.length) return json({ error: 'Chưa có ảnh nào hợp lệ (nhận ảnh JPG, PNG, WebP).' }, 400);
  if (imgs.some(i => i.data.length > 4_500_000)) return json({ error: 'Ảnh quá lớn. Chụp lại hoặc cắt bớt phần thừa.' }, 413);

  let store, m;
  try { store = getStore({ name: 'tb-thanh-vien', consistency: 'strong' }); m = await store.get(code, { type: 'json' }); }
  catch (e) { return json({ error: 'Máy chủ chưa bật kho thành viên.' }, 503); }
  if (!m) return json({ error: 'Mã thành viên không đúng. Nhắn Zalo 0939 660 996 để được cấp mã.', member: false }, 403);
  if (m.active === false) return json({ error: 'Mã thành viên đang tạm khóa. Nhắn Zalo 0939 660 996.', member: false }, 403);
  const d = today(), hm = m.han_muc || HAN_MUC, used = (m.dung || {})[d] || 0;
  if (used >= hm) return json({ error: 'Hôm nay bạn đã dùng hết ' + hm + ' lượt đọc ảnh. Mai dùng tiếp, hoặc nhập tay ngay bây giờ.', con_lai: 0 }, 429);

  const viaAnthropic = !!ENV('ANTHROPIC_API_KEY');
  const key = ENV('ANTHROPIC_API_KEY') || ENV('NETLIFY_AI_GATEWAY_KEY');
  const url = viaAnthropic ? (ENV('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages'
    : (ENV('NETLIFY_AI_GATEWAY_URL') || '').replace(/\/$/, '') + '/anthropic/v1/messages';
  if (!key) return json({ error: 'Máy chủ chưa bật AI.' }, 503);

  const content = imgs.map(i => ({ type: 'image', source: { type: 'base64', media_type: i.type, data: i.data } }));
  content.push({ type: 'text', text: imgs.length > 1 ? 'Hai ảnh trên là của cùng một tài khoản (thường là màn hình danh mục và màn hình tài sản). Chép số liệu theo đúng mẫu.' : 'Chép số liệu trong ảnh theo đúng mẫu.' });
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 55000);
  try {
    const call = model => fetch(url, { method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 2000, ...(/opus-5/.test(model) ? { thinking: { type: 'adaptive' }, output_config: { effort: 'low' } } : { thinking: { type: /sonnet-5/.test(model) ? 'between_tools' : 'disabled' } }), system: SYSTEM, messages: [{ role: 'user', content }] }) });
    let r = await call(MODEL), usedM = MODEL, data = {};
    if (!r.ok) data = await r.json().catch(() => ({}));
    if (!r.ok && (r.status === 400 || r.status === 404) && /model|thinking/i.test(JSON.stringify(data))) { usedM = FALLBACK; r = await call(FALLBACK); data = {}; if (!r.ok) data = await r.json().catch(() => ({})); }
    if (r.ok) data = await r.json().catch(() => ({}));
    if (!r.ok) { console.log('Đọc ảnh lỗi', r.status, String(data?.error?.message || '').slice(0, 200)); return json({ error: 'AI đang bận hoặc hết hạn mức. Thử lại sau, hoặc nhập tay.', code: r.status }, 502); }
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    const out = { rows: [], cash: null, debt: null, rtt: null, notes: [] };
    for (const line of text.split(/\r?\n/)) {
      const p = line.trim().replace(/^[-*•\s]+/, '').split('|').map(s => s.trim());
      if (p[0] === 'M' && /^[A-Z0-9]{3,8}$/.test((p[1] || '').toUpperCase())) {
        const sym = p[1].toUpperCase(), q = num(p[2]), c = num(p[3]), px = num(p[4]);
        if (q > 0 && !out.rows.some(x => x.sym === sym)) out.rows.push({ sym, qty: Math.round(q), cost: c, price: px });
      } else if (p[0] === 'T') out.cash = num(p[1]);
      else if (p[0] === 'N') out.debt = num(p[1]);
      else if (p[0] === 'R') out.rtt = num(p[1]);
      else if (p[0] === 'G' && p[1] && out.notes.length < 3) out.notes.push(p.slice(1).join(' ').slice(0, 200));
    }
    if (!out.rows.length && out.cash == null && out.debt == null) return json({ error: out.notes[0] || 'Chưa đọc được mã nào trong ảnh. Chụp rõ màn hình danh mục (có mã, khối lượng, giá vốn) rồi thử lại.', con_lai: hm - used }, 422);
    // cộng lượt dùng khi đọc thành công
    m.dung = { [d]: used + 1 }; m.tong = (m.tong || 0) + 1; m.lan_cuoi = new Date().toISOString();
    try { await store.setJSON(code, m); } catch (e) {}
    return json({ ok: true, ...out, con_lai: hm - used - 1, model: usedM });
  } catch (e) {
    return json({ error: e.name === 'AbortError' ? 'Đọc ảnh quá lâu. Thử lại với ảnh gọn hơn.' : 'Không gọi được AI đọc ảnh.' }, 504);
  } finally { clearTimeout(timer); }
}

// Trả lời dạng luồng có nhịp giữ kết nối (giống /api/ai), cuối cùng gửi JSON.
export default async (req) => {
  if (req.method === 'GET') return handle(req);
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      c.enqueue(enc.encode(' '));
      const hb = setInterval(() => { try { c.enqueue(enc.encode(' ')); } catch {} }, 4000);
      try { const r = await handle(req); const j = JSON.parse(await r.text()); if (r.status >= 400 && !j.http) j.http = r.status; c.enqueue(enc.encode(JSON.stringify(j))); }
      catch (e) { c.enqueue(enc.encode(JSON.stringify({ error: 'Không gọi được AI đọc ảnh.' }))); }
      finally { clearInterval(hb); c.close(); }
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
};

export const config = { path: '/api/doc-anh', rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
