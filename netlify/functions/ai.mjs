// AI diễn giải cho Bác sĩ danh mục – POST /api/ai
// Gọi Claude qua Netlify AI Gateway (biến môi trường tự có: NETLIFY_AI_GATEWAY_KEY/URL hoặc ANTHROPIC_API_KEY/BASE_URL).
// Không lưu dữ liệu người dùng. AI chỉ diễn giải số liệu đã tính sẵn và nêu câu hỏi; không khuyến nghị.

const MODEL = process.env.TB_AI_MODEL || 'claude-sonnet-5-5';
const FALLBACK = 'claude-sonnet-4-5';

const SYSTEM = `Bạn là "Bác sĩ danh mục" của Top Broker (topbroker.fun), một công cụ giúp nhà đầu tư chứng khoán Việt Nam hiểu danh mục của chính họ.

NGUYÊN TẮC (bắt buộc, không ngoại lệ):
1. Công thức tính toán tạo ra kết quả số học: mọi con số đã được tính sẵn trong dữ liệu gửi kèm. KHÔNG tự tính lại, KHÔNG bịa thêm số. Chỉ dùng số có trong dữ liệu; khi nhắc số, ghi đúng như dữ liệu.
2. Dữ liệu doanh nghiệp tạo cơ sở để đánh giá luận điểm đầu tư: bạn KHÔNG có báo cáo tài chính, định giá hay tin tức trong dữ liệu này. Không suy đoán về kết quả kinh doanh, định giá, tin đồn của doanh nghiệp như thể đã biết; hãy biến chúng thành câu hỏi cần kiểm tra và nêu rõ dữ liệu nào còn thiếu.
3. AI diễn giải và nêu các câu hỏi cần kiểm tra: giải thích con số nghĩa là gì trong đời thực, nối các con số với nhau, tách rõ đâu là điều số liệu đã chứng minh, đâu chỉ là giả thuyết.
4. Người dùng quyết định phương án cuối cùng: TUYỆT ĐỐI không khuyên mua, bán, giữ, cắt lỗ, bình quân giá; không nói phương án nào "nên", "tốt hơn", "hợp lý hơn"; không xếp hạng phương án; không đưa giá mục tiêu hay dự báo giá. Được phép mô tả đánh đổi và hệ quả của từng phương án theo số liệu.

VĂN PHONG: tiếng Việt bình dân, như anh môi giới giải thích cho khách quen ở quán trà đá. Xưng "bạn". Câu ngắn, mỗi ý 1 câu, tối đa khoảng 25 chữ. Không thuật ngữ khó; nếu buộc phải dùng (Rtt, margin, tỷ trọng) thì giải thích luôn bằng lời thường. Đi thẳng vào điểm quan trọng nhất, bỏ ý phụ. Có thể dí dỏm nhẹ kiểu miền Bắc nhưng không đùa cợt về khoản lỗ.

ĐẦU RA: chỉ viết các dòng theo đúng mẫu dưới, mỗi ý một dòng, mỗi dòng bắt đầu bằng mã nhãn và dấu "|". Không viết gì khác, không dùng markdown. Ngắn gọn là ưu tiên số một.
TT|1–2 câu: điều quan trọng nhất (chỉ 1 dòng TT)
SL|ý số liệu nói gì, dẫn 1 con số làm căn cứ (2–3 dòng SL)
GT|giả thuyết, ghi rõ vì sao mới là giả thuyết (1–2 dòng GT)
CH|câu hỏi bạn nên tự kiểm tra (2–3 dòng CH)
TH|thông tin còn thiếu (1–2 dòng TH)`;

const STEP = {
  'kham': 'Bước 1 – Khám sức khỏe danh mục. Diễn giải tình trạng tổng thể: lãi lỗ, mức tập trung theo mã và ngành, đòn bẩy margin, khoảng cách tới ngưỡng gọi ký quỹ.',
  'nguyen-nhan': 'Bước 2 – Tìm nguyên nhân danh mục biến động trong kỳ. Dữ liệu đã tách biến động mỗi mã thành: thị trường chung (VN-Index), nhóm ngành so với thị trường, riêng doanh nghiệp so với ngành; kèm đóng góp bằng tiền, hiệu ứng đòn bẩy, phân bổ vốn. Diễn giải phần nào do thị trường, ngành, doanh nghiệp, đòn bẩy, phân bổ vốn.',
  'mo-phong': 'Bước 3 – So sánh các phương án xử lý một mã. Dữ liệu có trạng thái ngay sau khi thực hiện từng phương án và tài sản ròng theo các kịch bản giá. Diễn giải hệ quả và đánh đổi của từng phương án (giá vốn, lãi lỗ đã chốt, tỷ trọng, tiền mặt, nợ, Rtt, kết quả theo kịch bản). Nhấn mạnh rằng thứ tự các phương án thay đổi theo kịch bản. Không nói phương án nào nên chọn.'
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
  const qs = new URL(req.url).searchParams; const MAXTOK = TEST && qs.get('max') ? Math.min(1200, +qs.get('max') || 60) : 1200;
  if (TEST && qs.get('ping')) return json({ pong: true, build: 'b5' });
  if (req.method === 'GET' && !TEST) return json({ ready: !!(process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY), model: MODEL, via: process.env.ANTHROPIC_API_KEY ? 'anthropic-env' : 'gateway-env' });
  if (req.method !== 'POST' && !TEST) return json({ error: 'Chỉ nhận POST' }, 405);
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'x';
  if (limited(ip)) return json({ error: 'Bạn bấm hơi nhanh. Đợi một phút rồi thử lại nhé.' }, 429);

  const raw = TEST ? JSON.stringify({ buoc: 'kham', so_lieu: { tai_san_rong: 400000000, no_margin: 100000000, rtt: 0.8, nguong_goi_ky_quy: 0.4, lai_lo_pct: -0.12, ma: [{ ma: 'VCG', ty_trong: 0.6, lai_lo_pct: -0.2 }, { ma: 'SSI', ty_trong: 0.4, lai_lo_pct: 0.05 }] } }) : await req.text();
  if (raw.length > 30000) return json({ error: 'Dữ liệu quá lớn.' }, 413);
  let body; try { body = JSON.parse(raw); } catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
  const step = STEP[body.buoc] ? body.buoc : null;
  if (!step || typeof body.so_lieu !== 'object') return json({ error: 'Thiếu bước hoặc số liệu.' }, 400);

  const viaAnthropic = !!(process.env.ANTHROPIC_API_KEY);
  const key = process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;
  const url = viaAnthropic
    ? (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages'
    : (process.env.NETLIFY_AI_GATEWAY_URL || '').replace(/\/$/, '') + '/anthropic/v1/messages';
  if (!key) return json({ error: 'Máy chủ chưa bật AI.' }, 503);

  const userMsg = `${STEP[step]}\n\nSố liệu (JSON, tiền tính bằng đồng, tỷ lệ là số thập phân, ví dụ 0.25 = 25%):\n${JSON.stringify(body.so_lieu)}`;
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const call = model => fetch(url, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: MAXTOK, thinking: { type: 'disabled' }, system: SYSTEM, messages: [{ role: 'user', content: userMsg }] }),
    });
    let r = await call(MODEL), used = MODEL;
    let data = await r.json().catch(() => ({}));
    if (!r.ok && (r.status === 400 || r.status === 404) && /model/i.test(JSON.stringify(data))) {
      used = FALLBACK; r = await call(FALLBACK); data = await r.json().catch(() => ({}));
    }
    if (TEST && !r.ok) return json({ test: true, status: r.status, url_host: new URL(url).host, model: used, detail: JSON.stringify(data).slice(0, 600) }, 200);
    if (!r.ok) { console.log('AI lỗi', r.status, JSON.stringify(data).slice(0, 400)); return json({ error: 'AI đang bận hoặc hết hạn mức. Thử lại sau.', code: r.status, detail: String(data?.error?.message || data?.message || '').slice(0, 160) }, 502); }
    const text = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    const out = { tom_tat: '', dien_giai: [], gia_thuyet: [], cau_hoi: [], thieu_du_lieu: [] };
    let last = null; const KEY = { SL: 'dien_giai', GT: 'gia_thuyet', CH: 'cau_hoi', TH: 'thieu_du_lieu' };
    for (const line of text.split(/\r?\n/)) {
      const m = line.trim().replace(/^[-*•\s]+/, '').match(/^(TT|SL|GT|CH|TH)\s*[|:]\s*(.+)$/);
      if (!m) continue;
      const v = m[2].replace(/\*\*/g, '').trim(); if (!v) continue;
      if (m[1] === 'TT') out.tom_tat = out.tom_tat ? out.tom_tat + ' ' + v : v; else { out[KEY[m[1]]].push(v); last = KEY[m[1]]; }
    }
    if (data.stop_reason === 'max_tokens' && last && out[last].length > 1) out[last].pop();
    if (!out.tom_tat && !out.dien_giai.length) {
      console.log('AI sai khuôn', data.stop_reason, text.slice(0, 400));
      return json({ error: 'AI trả lời chưa đúng mẫu. Bấm thử lại.', code: data.stop_reason || '', ...(TEST ? { raw: text.slice(0, 800), blocks: (data.content || []).map(c => c.type), usage: data.usage } : {}) }, 502);
    }
    const arr = v => (Array.isArray(v) ? v : []).map(x => String(x)).slice(0, 4);
    return json({ tom_tat: String(out.tom_tat || ''), dien_giai: arr(out.dien_giai), gia_thuyet: arr(out.gia_thuyet), cau_hoi: arr(out.cau_hoi), thieu_du_lieu: arr(out.thieu_du_lieu), model: used, ...(TEST ? { raw: text.slice(0, 800), blocks: (data.content || []).map(c => c.type), usage: data.usage } : {}) });
  } catch (e) {
    return json({ error: e.name === 'AbortError' ? 'AI trả lời quá lâu. Thử lại nhé.' : 'Không gọi được AI.', detail: String(e.message || e).slice(0, 160) }, 504);
  } finally { clearTimeout(timer); }
};

export const config = { path: '/api/ai', rateLimit: { windowLimit: 8, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
