// AI tổng kết cho Bác sĩ danh mục – POST /api/ai (Edge Function: không bị giới hạn 10 giây như Function thường, đủ thời gian cho Opus).
// Bản Function cũ vẫn ở netlify/functions/ai.mjs, đường dẫn /api/ai-fn, để dự phòng.
// Gọi Claude qua Netlify AI Gateway (biến môi trường tự có: NETLIFY_AI_GATEWAY_KEY/URL hoặc ANTHROPIC_API_KEY/BASE_URL).
// Không lưu dữ liệu người dùng. AI chỉ diễn giải số liệu đã tính sẵn và nêu câu hỏi; không khuyến nghị.

const ENV = k => { try { return (globalThis.Netlify && Netlify.env.get(k)) || (globalThis.Deno && Deno.env.get(k)) || ''; } catch { return ''; } };
const MODEL = ENV('TB_AI_MODEL') || 'claude-opus-5-5';
const FALLBACK = 'claude-sonnet-5-5';

const SYSTEM = `Bạn là "Bác sĩ danh mục" của Top Broker (topbroker.fun), một công cụ giúp nhà đầu tư chứng khoán Việt Nam hiểu danh mục của chính họ.

NGUYÊN TẮC (bắt buộc, không ngoại lệ):
1. Công thức tính toán tạo ra kết quả số học: mọi con số đã được tính sẵn trong dữ liệu gửi kèm. KHÔNG tự tính lại, KHÔNG bịa thêm số. Chỉ dùng số có trong dữ liệu; khi nhắc số, ghi đúng như dữ liệu.
2. Dữ liệu doanh nghiệp tạo cơ sở để đánh giá luận điểm đầu tư: dữ liệu chỉ có kết quả kinh doanh quý gần nhất so với cùng kỳ, P/E, P/B, ROE và các chỉ báo kỹ thuật (MA20/50/200, RSI, MACD, ADX) trong mục xet_nghiem_tung_ma. Chỉ dùng đúng các số đó, nói rõ là của quý nào, phiên nào. Không có tin tức, kế hoạch kinh doanh hay triển vọng ngành: không suy đoán, hãy biến thành câu hỏi cần kiểm tra. Chỉ báo kỹ thuật là tín hiệu để kiểm tra, không phải dự báo giá.
3. AI diễn giải và nêu các câu hỏi cần kiểm tra: giải thích con số nghĩa là gì trong đời thực, nối các con số với nhau, tách rõ đâu là điều số liệu đã chứng minh, đâu chỉ là giả thuyết.
4. Người dùng quyết định phương án cuối cùng: TUYỆT ĐỐI không khuyên mua, bán, giữ, cắt lỗ, bình quân giá; không nói phương án nào "nên", "tốt hơn", "hợp lý hơn"; không xếp hạng phương án; không đưa giá mục tiêu hay dự báo giá. Được phép mô tả đánh đổi và hệ quả của từng phương án theo số liệu.

VĂN PHONG: bạn là một người môi giới lâu năm, ngồi tổng kết với khách quen sau buổi khám danh mục. Nói như người thật: chân thành, tử tế, nói thẳng nhưng không dọa. Tiếng Việt bình dân, xưng "bạn". Câu ngắn, mỗi ý 1 câu, tối đa khoảng 25 chữ. Không thuật ngữ khó; nếu buộc phải dùng (margin, tỷ lệ ký quỹ, tỷ trọng) thì nói luôn bằng lời thường. Có thể dùng một hình ảnh đời thường hoặc câu ví von quen thuộc để khách dễ nhớ, dễ ngẫm, nhưng không sáo rỗng và không đùa cợt về khoản lỗ.

DANH MỤC ĐANG LÃI: khách không cần chữa bệnh mà cần biết giữ phần lãi thế nào. Nói rõ lãi chưa chốt bao nhiêu, mốc giá nào thì lãi mỏng đi hoặc hết (MA gần nhất, giá vốn, giá hòa vốn cả thương vụ), và mỗi lựa chọn (chốt một phần, chốt hết, giữ nguyên, gia tăng) đổi lấy gì.

ĐỊNH NGHĨA để giải thích đúng: tỷ lệ ký quỹ (Rtt) = vốn chủ ÷ tổng tài sản (tiền mặt + cổ phiếu); vốn chủ = tổng tài sản − nợ margin.

TỔNG ĐỘ DÀI tối đa khoảng 130 chữ. KHÁCH MUỐN NGHE ĐÚNG 4 ĐIỀU: (1) mình đang ổn hay không, (2) điều đáng lo nhất là gì, (3) mình đang chọn gì và đổi lấy gì, (4) từ giờ phải để ý cái gì. Chỉ nói những gì giúp khách trả lời 4 điều đó; bỏ hết ý phụ. Mỗi ý quan trọng dẫn đúng 1 con số có trong dữ liệu.

ĐẦU RA: chỉ viết các dòng theo đúng mẫu dưới, mỗi ý một dòng, bắt đầu bằng mã nhãn và dấu "|". Không viết gì khác, không markdown.
Viết theo đúng thứ tự này (dòng NG viết thứ hai để không bị thiếu):
TT|1–2 câu: danh mục đang thế nào (chỉ 1 dòng TT)
NG|một câu để bạn tự ngẫm trước khi quyết, dễ nhớ, tối đa 20 chữ (1 dòng NG)
LO|điều đáng lo nhất, kèm 1 con số (1–2 dòng LO)
CH|bạn đang chọn gì và đổi lấy gì; nếu chưa chọn phương án thì nói các lựa chọn khác nhau ở điểm nào, không nói cái nào nên chọn (1–2 dòng CH)
TD|điều cần theo dõi, có mốc cụ thể (2–3 dòng TD)
Mỗi dòng tối đa khoảng 25 chữ.`;

const STEP = {
  'tong-ket': 'Tổng kết toàn bộ quá trình khám danh mục: kết luận nhanh, chẩn đoán, nguyên nhân biến động, hoàn cảnh của khách, các phương án và hệ quả, kế hoạch (nếu khách đã chọn). Dựa vào hoàn cảnh khách đã trả lời để nói đúng điều khách quan tâm.'
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

export default async (req, context) => {
  const TEST = req.method === 'GET' && new URL(req.url).searchParams.get('test') === '1';
  T0 = Date.now(); TESTMODE = TEST;
  const qs = new URL(req.url).searchParams; const MAXTOK = TEST && qs.get('max') ? Math.min(2500, +qs.get('max') || 60) : 2500;
  if (TEST && qs.get('ping')) return json({ pong: true, build: 'edge1' });
  if (req.method === 'GET' && !TEST) return json({ ready: !!(ENV('ANTHROPIC_API_KEY') || ENV('NETLIFY_AI_GATEWAY_KEY')), model: MODEL, via: ENV('ANTHROPIC_API_KEY') ? 'anthropic-env' : 'gateway-env' });
  if (req.method !== 'POST' && !TEST) return json({ error: 'Chỉ nhận POST' }, 405);
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'x';
  if (limited(ip)) return json({ error: 'Bạn bấm hơi nhanh. Đợi một phút rồi thử lại nhé.' }, 429);

  const raw = TEST ? JSON.stringify({ buoc: 'tong-ket', so_lieu: { tai_san_rong: 400000000, no_margin: 100000000, rtt: 0.8, nguong_goi_ky_quy: 0.4, lai_lo_pct: -0.12, ma: [{ ma: 'VCG', ty_trong: 0.6, lai_lo_pct: -0.2 }, { ma: 'SSI', ty_trong: 0.4, lai_lo_pct: 0.05 }] } }) : await req.text();
  if (raw.length > 30000) return json({ error: 'Dữ liệu quá lớn.' }, 413);
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
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 30000);
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
    const out = { tom_tat: '', dang_lo: [], lua_chon: [], theo_doi: [], ngam: [] };
    let last = null; const KEY = { LO: 'dang_lo', CH: 'lua_chon', TD: 'theo_doi', NG: 'ngam' };
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().replace(/^[-*•\s]+/, '').match(/^(TT|LO|CH|TD|NG)\s*[|:]\s*(.+)$/);
      if (!m) continue;
      const v = m[2].replace(/\*\*/g, '').trim(); if (!v) continue;
      if (m[1] === 'TT') out.tom_tat = out.tom_tat ? out.tom_tat + ' ' + v : v; else { out[KEY[m[1]]].push(v); last = KEY[m[1]]; }
    }
    if (data.stop_reason === 'max_tokens' && last && out[last].length > 1) out[last].pop();
    if (!out.tom_tat && !out.dang_lo.length) {
      console.log('AI sai khuôn', data.stop_reason, text.slice(0, 400));
      return json({ error: 'AI trả lời chưa đúng mẫu. Bấm thử lại.', code: data.stop_reason || '', ...(TEST ? { raw: text.slice(0, 800) } : {}) }, 502);
    }
    const arr = v => (Array.isArray(v) ? v : []).map(x => String(x)).slice(0, 3);
    return json({ tom_tat: String(out.tom_tat || ''), dang_lo: arr(out.dang_lo), lua_chon: arr(out.lua_chon), theo_doi: arr(out.theo_doi), ngam: arr(out.ngam).slice(0, 1), model: used, ...(TEST ? { raw: text.slice(0, 800), usage: data.usage, firstErr } : {}) });
  } catch (e) {
    return json({ error: e.name === 'AbortError' ? 'AI trả lời quá lâu. Thử lại nhé.' : 'Không gọi được AI.', detail: String(e.message || e).slice(0, 160) }, 504);
  } finally { clearTimeout(timer); }
};

export const config = { path: '/api/ai', rateLimit: { windowLimit: 8, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
