// Thành viên Bác sĩ danh mục – /api/thanh-vien (anh Hải chốt 18/10/2026: mã thành viên do anh cấp qua Zalo).
// Kho: Netlify Blobs "tb-thanh-vien", mỗi mã một bản ghi { code, ten, zalo, ghi_chu, active, created, han_muc, dung: { 'YYYY-MM-DD': n }, tong }.
// GET  ?code=TB-XXXXXX            → kiểm tra mã (công khai): { ok, con_lai, han_muc }
// POST { action, ... } + header x-tb-admin: <mật khẩu quản lý> → list | create | update | delete
// Mật khẩu quản lý: so SHA-256('topbroker:' + mật khẩu) với TB_ADMIN_HASH (biến môi trường) hoặc mã băm mặc định bên dưới.
import { getStore } from '@netlify/blobs';
import { createHash, randomInt } from 'node:crypto';

const DEFAULT_HASH = '8ac158cc1aa4dc54c7037557f2aed1c7006b196c0a56769aaa5d50550ddacccd';
const HAN_MUC = 10; // lượt đọc ảnh mỗi ngày (anh Hải chốt 18/10/2026)
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const today = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
const norm = c => String(c || '').trim().toUpperCase().replace(/\s+/g, '');
const isAdmin = req => {
  const pw = req.headers.get('x-tb-admin') || '';
  const want = (process.env.TB_ADMIN_HASH || DEFAULT_HASH).toLowerCase();
  return !!pw && createHash('sha256').update('topbroker:' + pw).digest('hex') === want;
};
const pub = m => ({ code: m.code, ten: m.ten || '', zalo: m.zalo || '', ghi_chu: m.ghi_chu || '', active: m.active !== false, created: m.created, han_muc: m.han_muc || HAN_MUC, hom_nay: (m.dung || {})[today()] || 0, tong: m.tong || 0, lan_cuoi: m.lan_cuoi || null });
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

export default async (req) => {
  let store;
  try { store = getStore({ name: 'tb-thanh-vien', consistency: 'strong' }); } catch (e) { return json({ error: 'Máy chủ chưa bật kho thành viên.' }, 503); }
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const code = norm(url.searchParams.get('code'));
    if (!/^TB-[A-Z0-9]{4,10}$/.test(code)) return json({ ok: false, error: 'Mã không đúng dạng (ví dụ TB-7K2Q9M).' });
    const m = await store.get(code, { type: 'json' });
    if (!m) return json({ ok: false, error: 'Không tìm thấy mã này. Kiểm tra lại hoặc nhắn Zalo 0939 660 996.' });
    if (m.active === false) return json({ ok: false, error: 'Mã này đang tạm khóa. Nhắn Zalo 0939 660 996 để được hỗ trợ.' });
    const hm = m.han_muc || HAN_MUC;
    return json({ ok: true, han_muc: hm, con_lai: Math.max(0, hm - ((m.dung || {})[today()] || 0)) });
  }

  if (req.method !== 'POST') return json({ error: 'Chỉ nhận GET hoặc POST' }, 405);
  if (!isAdmin(req)) return json({ error: 'Sai mật khẩu quản lý.' }, 401);
  let b; try { b = await req.json(); } catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }

  if (b.action === 'login') return json({ ok: true });
  if (b.action === 'list') {
    const { blobs } = await store.list();
    const all = (await Promise.all(blobs.map(x => store.get(x.key, { type: 'json' })))).filter(Boolean).map(pub);
    all.sort((a, c) => String(c.created).localeCompare(String(a.created)));
    return json({ ok: true, members: all, ngay: today() });
  }
  if (b.action === 'create') {
    let code;
    for (let i = 0; i < 20; i++) { code = 'TB-' + Array.from({ length: 6 }, () => ABC[randomInt(ABC.length)]).join(''); if (!(await store.get(code))) break; }
    const m = { code, ten: clip(b.ten, 80), zalo: clip(b.zalo, 20), ghi_chu: clip(b.ghi_chu, 200), active: true, created: new Date().toISOString(), han_muc: Math.max(1, Math.min(100, +b.han_muc || HAN_MUC)), dung: {}, tong: 0 };
    await store.setJSON(code, m);
    return json({ ok: true, member: pub(m) });
  }
  const code = norm(b.code), m = code ? await store.get(code, { type: 'json' }) : null;
  if (!m) return json({ error: 'Không tìm thấy mã.' }, 404);
  if (b.action === 'update') {
    ['ten', 'zalo', 'ghi_chu'].forEach(k => { if (k in b) m[k] = clip(b[k], k === 'ghi_chu' ? 200 : k === 'ten' ? 80 : 20); });
    if ('active' in b) m.active = !!b.active;
    if ('han_muc' in b) m.han_muc = Math.max(1, Math.min(100, +b.han_muc || HAN_MUC));
    await store.setJSON(code, m);
    return json({ ok: true, member: pub(m) });
  }
  if (b.action === 'delete') { await store.delete(code); return json({ ok: true }); }
  return json({ error: 'Không rõ thao tác.' }, 400);
};

export const config = { path: '/api/thanh-vien', rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
