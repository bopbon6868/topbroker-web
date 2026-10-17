// AI tổng kết cho Bác sĩ danh mục – POST /api/ai (Edge Function: không bị giới hạn 10 giây như Function thường, đủ thời gian cho Opus).
// Bản Function cũ vẫn ở netlify/functions/ai.mjs, đường dẫn /api/ai-fn, để dự phòng.
// Gọi Claude qua Netlify AI Gateway (biến môi trường tự có: NETLIFY_AI_GATEWAY_KEY/URL hoặc ANTHROPIC_API_KEY/BASE_URL).
// Không lưu dữ liệu người dùng. AI đóng vai chuyên gia tư vấn: đọc khẩu vị khách và đưa lời khuyên bước tiếp theo (anh Hải yêu cầu 17/10/2026).

const ENV = k => { try { return (globalThis.Netlify && Netlify.env.get(k)) || (globalThis.Deno && Deno.env.get(k)) || ''; } catch { return ''; } };
const MODEL = ENV('TB_AI_MODEL') || 'claude-opus-5-5';
const FALLBACK = 'claude-sonnet-5-5';

const SYSTEM = `Bạn là chuyên gia tư vấn tài chính thuộc nhóm 1% giỏi nhất: hơn 20 năm quản lý tài sản cho nhà đầu tư cá nhân Việt Nam, vừa giỏi phân tích danh mục vừa hiểu sâu tâm lý khách hàng (tài chính hành vi: sợ lỗ, tiếc lãi, neo giá vốn, tự tin thái quá). Khách vừa đi hết buổi khám "Bác sĩ danh mục" của Top Broker (topbroker.fun). Họ đã bỏ thời gian khảo sát, nên họ xứng đáng nhận một câu trả lời rõ ràng: BƯỚC TIẾP THEO NÊN LÀM GÌ.

CÁCH LÀM VIỆC:
1. Đọc khẩu vị: dựa vào khau_vi_va_hoan_canh (5 câu khai báo, điểm theo khai báo và theo hành vi danh mục, độ vênh). Nếu lời nói và hành động vênh nhau (do_venh ≥ 20: danh mục rủi ro hơn khẩu vị khai), nói thẳng nhưng tế nhị; lời khuyên phải theo khẩu vị THẬT mà khách chịu được (khai báo, mức chịu đựng, nhu cầu tiền), không theo hành vi đang quá tay.
2. Ưu tiên an toàn trước: nguy cơ gọi ký quỹ, tiền mặt không đủ cho khoản sắp cần rút, một mã chiếm quá lớn — xử lý điều này trước mọi cơ hội lợi nhuận.
3. Dựa trên số liệu: chỉ dùng số có trong dữ liệu (tỷ trọng, lãi/lỗ, Rtt, kết quả kinh doanh quý gần nhất, MA20/50/200, RSI, MACD, ADX, các phương án và hệ quả). Không bịa số, không đưa giá mục tiêu, không dự báo giá, không gợi ý mã mới ngoài các mã có trong dữ liệu.
4. Đưa lời khuyên dứt khoát: chọn MỘT hướng đi hợp nhất với danh mục, lựa chọn và tính cách của khách, nói rõ làm gì, với mã nào, khoảng bao nhiêu (dùng các phương án/lượng đã có trong dữ liệu nếu có), và vì sao hợp với họ. Nếu khách đã chọn phương án: nói phương án đó có hợp khẩu vị không; hợp thì củng cố cách làm, chưa hợp thì nói cần chỉnh gì. Với mã đang lãi: cân nhắc chốt lời một phần/chốt hết/giữ/gia tăng theo khẩu vị và tín hiệu. Với mã đang lỗ: không neo vào giá vốn; nhìn kinh doanh và xu hướng. Nếu dữ liệu thiếu đến mức không thể khuyên, bước tiếp theo là bổ sung đúng dữ liệu đó.
5. Hiểu tâm lý: nói như người cố vấn tin cậy ngồi đối diện, chạm đúng nỗi lo thật của khách (sợ mất thêm, tiếc nếu bán rồi giá lên, áp lực margin), giúp họ hành động được chứ không chỉ hiểu.

VĂN PHONG: tiếng Việt bình dân, xưng "bạn", chân thành, quyết đoán mà không dọa, không sáo rỗng. Câu ngắn, mỗi dòng tối đa khoảng 30 chữ. Thuật ngữ khó thì nói luôn bằng lời thường. Tỷ lệ ký quỹ (Rtt) = vốn chủ ÷ tổng tài sản; vốn chủ = tổng tài sản − nợ margin.

Suy nghĩ ngắn gọn rồi viết ngay. ĐẦU RA: chỉ viết các dòng theo đúng mẫu, mỗi dòng bắt đầu bằng mã nhãn và dấu "|". Không viết gì khác, không markdown. Thứ tự:
KV|1 câu: khẩu vị thật của khách là gì, có vênh với danh mục không (1 dòng)
LK|VIỆC NÊN LÀM TIẾP THEO: 1–2 câu dứt khoát, cụ thể mã và mức độ, kèm lý do hợp với khách (1 dòng)
NG|một câu để khách ngẫm, dễ nhớ, tối đa 20 chữ (1 dòng)
TT|1 câu: danh mục đang ở đâu, kèm 1 con số (1 dòng)
BC|các bước làm cụ thể, theo thứ tự, có con số (2–3 dòng BC)
TD|khi nào xem lại hoặc đổi kế hoạch: mốc giá, mốc chỉ báo, mốc thời gian cụ thể (1–2 dòng TD)`;

const STEP = {
  'tong-ket': 'Khách đã đi hết buổi khám. Hãy đọc khẩu vị đầu tư của khách, xem toàn bộ số liệu (khám, chẩn đoán, xét nghiệm từng mã, phương án và hệ quả, kế hoạch nếu đã chọn) rồi đưa lời khuyên bước tiếp theo phù hợp nhất với danh mục, lựa chọn và tính cách của khách.'
};

const hits = new Map();
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 6;
}

let T0 = 0, TESTMODE = false;
function json(obj, status = 200) {
  if (TESTMODE) { obj = { ...obj, http: status, ms: Date.now() - T0 }; status = 200; }
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function handle(req, context) {
  const TEST = req.method === 'GET' && new URL(req.url).searchParams.get('test') === '1';
  T0 = Date.now(); TESTMODE = TEST;
  const qs = new URL(req.url).searchParams; const MAXTOK = TEST && qs.get('max') ? Math.min(2500, +qs.get('max') || 60) : 2500;
  if (TEST && qs.get('ping')) return json({ pong: true, build: 'edge1' });
  if (req.method === 'GET' && !TEST) return json({ ready: !!(ENV('ANTHROPIC_API_KEY') || ENV('NETLIFY_AI_GATEWAY_KEY')), model: MODEL, via: ENV('ANTHROPIC_API_KEY') ? 'anthropic-env' : 'gateway-env' });
  if (req.method !== 'POST' && !TEST) return json({ error: 'Chỉ nhận POST' }, 405);
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'x';
  if (limited(ip)) return json({ error: 'Bạn bấm hơi nhanh. Đợi một phút rồi thử lại nhé.' }, 429);

  const raw = TEST ? JSON.stringify({ buoc: 'tong-ket', so_lieu: { tai_san_rong: 400000000, no_margin: 100000000, rtt: 0.8, nguong_goi_ky_quy: 0.4, lai_lo_pct: -0.12, ma: [{ ma: 'VCG', ty_trong: 0.6, lai_lo_pct: -0.2 }, { ma: 'SSI', ty_trong: 0.4, lai_lo_pct: 0.05 }] } }) : await req.text();
  if (raw.length > 60000) return json({ error: 'Dữ liệu quá lớn.' }, 413);
  let body; try { body = JSON.parse(raw); } catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
  const step = STEP[body.buoc] ? body.buoc : null;
  if (!step || typeof body.so_lieu !== 'object') return json({ error: 'Thiếu bước hoặc số liệu.' }, 400);

  const viaAnthropic = !!(ENV('ANTHROPIC_API_KEY'));
  const key = ENV('ANTHROPIC_API_KEY') || ENV('NETLIFY_AI_GATEWAY_KEY');
  const url = viaAnthropic
    ? (ENV('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages'
    : (ENV('NETLIFY_AI_GATEWAY_URL') || '').replace(/\/$/, '') + '/anthropic/v1/messages';
  if (!key) return json({ error: 'Máy chủ chưa bật AI.' }, 503);

  const userMsg = `${STEP[step]}\n\nSố liệu (JSON, tiền tính bằng đồng, tỷ lệ là số thập phân, ví dụ 0.25 = 25%):\n${JSON.stringify(body.so_lieu)}`;
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 55000);
  try {
    const call = model => fetch(url, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: MAXTOK, ...(/opus-5/.test(model) ? { thinking: { type: 'adaptive' }, output_config: { effort: 'low' } } : { thinking: { type: /sonnet-5/.test(model) ? 'between_tools' : 'disabled' } }), system: SYSTEM, messages: [{ role: 'user', content: userMsg }] }),
    });
    let r = await call(MODEL), used = MODEL, firstErr = null, data = {};
    if (!r.ok) data = await r.json().catch(() => ({}));
    if (!r.ok && (r.status === 400 || r.status === 404) && /model|thinking/i.test(JSON.stringify(data))) {
      firstErr = r.status + ' ' + JSON.stringify(data).slice(0, 300);
      used = FALLBACK; r = await call(FALLBACK); data = {}; if (!r.ok) data = await r.json().catch(() => ({}));
    }
    if (r.ok) data = await r.json().catch(() => ({}));
    if (TEST && !r.ok) return json({ test: true, status: r.status, url_host: new URL(url).host, model: used, detail: JSON.stringify(data).slice(0, 600) }, 200);
    if (!r.ok) { console.log('AI lỗi', r.status, JSON.stringify(data).slice(0, 400)); return json({ error: 'AI đang bận hoặc hết hạn mức. Thử lại sau.', code: r.status, detail: String(data?.error?.message || data?.message || '').slice(0, 160) }, 502); }
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    const out = { khau_vi: '', loi_khuyen: '', tom_tat: '', buoc: [], theo_doi: [], ngam: [] };
    let last = null; const LIST = { BC: 'buoc', TD: 'theo_doi', NG: 'ngam' }, ONE = { KV: 'khau_vi', LK: 'loi_khuyen', TT: 'tom_tat' };
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().replace(/^[-*•\s]+/, '').match(/^(KV|LK|TT|BC|TD|NG)\s*[|:]\s*(.+)$/);
      if (!m) continue;
      const v = m[2].replace(/\*\*/g, '').trim(); if (!v) continue;
      if (ONE[m[1]]) out[ONE[m[1]]] = out[ONE[m[1]]] ? out[ONE[m[1]]] + ' ' + v : v; else { out[LIST[m[1]]].push(v); last = LIST[m[1]]; }
    }
    if (data.stop_reason === 'max_tokens' && last && out[last].length > 1) out[last].pop();
    if (!out.loi_khuyen) {
      console.log('AI sai khuôn', data.stop_reason, text.slice(0, 400));
      return json({ error: 'AI trả lời chưa đúng mẫu. Bấm thử lại.', code: data.stop_reason || '', ...(TEST ? { raw: text.slice(0, 800) } : {}) }, 502);
    }
    const arr = v => (Array.isArray(v) ? v : []).map(x => String(x)).slice(0, 3);
    return json({ khau_vi: out.khau_vi, loi_khuyen: out.loi_khuyen, tom_tat: out.tom_tat, buoc: arr(out.buoc), theo_doi: arr(out.theo_doi).slice(0, 2), ngam: arr(out.ngam).slice(0, 1), model: used, ...(TEST ? { raw: text.slice(0, 800), usage: data.usage, firstErr } : {}) });
  } catch (e) {
    return json({ error: e.name === 'AbortError' ? 'AI trả lời quá lâu. Thử lại nhé.' : 'Không gọi được AI.', detail: String(e.message || e).slice(0, 160) }, 504);
  } finally { clearTimeout(timer); }
}

// Trả lời dạng luồng: gửi khoảng trắng mỗi 4 giây để Netlify không cắt kết nối khi Opus nghĩ lâu,
// cuối cùng gửi JSON (JSON.parse bỏ qua khoảng trắng đầu). Lỗi nằm trong trường "error" của JSON.
export default async (req, context) => {
  const qs = new URL(req.url).searchParams;
  if (req.method === 'GET' && (qs.get('test') !== '1' || qs.get('ping'))) return handle(req, context);
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      c.enqueue(enc.encode(' '));
      const hb = setInterval(() => { try { c.enqueue(enc.encode(' ')); } catch {} }, 4000);
      try { const r = await handle(req, context); const t = await r.text(); const j = JSON.parse(t); if (r.status >= 400 && !j.http) j.http = r.status; c.enqueue(enc.encode(JSON.stringify(j))); }
      catch (e) { c.enqueue(enc.encode(JSON.stringify({ error: 'Không gọi được AI.', detail: String(e && e.message || e).slice(0, 160) }))); }
      finally { clearInterval(hb); c.close(); }
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
};

export const config = { path: '/api/ai', rateLimit: { windowLimit: 8, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
