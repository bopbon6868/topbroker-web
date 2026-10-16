# Top Broker – Hướng dẫn vận hành website

## Cấu trúc thư mục

```
index.html              Trang chủ (Bản tin hôm nay)
assets/site.css         Giao diện khung chung (đầu trang, thanh chỉ số, chân trang)
assets/site.js          Sổ đăng ký sản phẩm + thanh chỉ số + menu
radar/index.html        Radar tin nóng
co-phieu/hpg/index.html Giải mã cổ phiếu HPG
sap-ra-mat/index.html   Trang giới thiệu các công cụ sắp ra mắt
assets/logo.svg         Logo (biểu tượng nến tăng), kèm favicon và icon iPhone
assets/webgame-*.png    Logo Webgame: dùng cho site game (webgame-512.png, webgame-apple-touch-icon.png, webgame-favicon-32.png)
```

## Đưa lên Netlify (lần đầu, khoảng 5 phút)

1. Giải nén file zip.
2. Vào https://app.netlify.com/drop, kéo cả thư mục `site` thả vào trang.
3. Netlify cấp một đường link dạng `ten-ngau-nhien.netlify.app`. Website đã chạy.
4. Đổi tên site cho dễ nhớ: **Site configuration → Change site name**, ví dụ `topbroker-web`.

## Chuyển tên miền: web về topbroker.fun, game sang game.topbroker.fun

Hiện game đang giữ tên miền `topbroker.fun` trên Netlify. Phải làm **đúng thứ tự** dưới đây,
vì một tên miền chỉ gắn được cho một site. Làm xong trong khoảng 15 phút, sau đó chờ 5 đến 60 phút để tên miền chạy.

**Bước 1. Gắn tên miền mới cho game (chưa gỡ tên cũ)**
1. Mở site **game** trên Netlify → **Domain management → Add a domain** → gõ `game.topbroker.fun` → Verify → Add.
2. Nếu tên miền dùng Netlify DNS (mục **Domains** có `topbroker.fun`), Netlify tự tạo bản ghi, không cần làm gì thêm.
   Nếu tên miền quản lý ở nơi mua (Mắt Bão, PA, Namecheap…), vào đó thêm bản ghi:
   `CNAME  game  →  <tên-site-game>.netlify.app`
3. Mở thử `https://game.topbroker.fun`. Chạy được và có ổ khóa HTTPS thì sang bước 2.

**Bước 2. Gỡ topbroker.fun khỏi game**
1. Vẫn ở site game → Domain management → đặt `game.topbroker.fun` làm **Primary domain**.
2. Ở dòng `topbroker.fun` và `www.topbroker.fun` → **Options → Remove domain**.

**Bước 3. Gắn topbroker.fun cho web Top Broker**
1. Mở site **topbroker-web** → **Add a domain** → `topbroker.fun` → Add (Netlify tự thêm `www`).
2. Netlify DNS: tự xong. Nếu quản lý DNS ở nơi mua, kiểm tra hai bản ghi:
   `A      @    →  75.2.60.5`
   `CNAME  www  →  <tên-site-web>.netlify.app`
3. Vào **HTTPS → Verify DNS configuration → Provision certificate** nếu ổ khóa chưa tự có.

**Kiểm tra cuối:** `topbroker.fun` mở ra trang Top Broker; menu **Webgame ↗** mở `game.topbroker.fun`.
Ai đã lưu link game cũ thì gửi lại link mới qua Zalo. Nếu game có đường dẫn con (ví dụ `topbroker.fun/choi`) mà nhiều người
đã lưu, báo em để em thêm file chuyển hướng tự động.

## Viết bản tin mỗi sáng (khoảng 5 phút)

Mở `index.html` bằng Notepad hoặc TextEdit, tìm chữ `BẢN TIN`:
1. Sửa ngày giờ ở 2 chỗ: dòng `Thứ Sáu, 16 tháng 10 · cập nhật 11:30` và `16/10/2026 · 11:30` trong thẻ.
2. Sửa 3 câu trong `<span data-t>…</span>`. Chữ muốn in đậm thì bọc trong `<b>…</b>`.
3. Sửa 4 con số trong khối `class="bn"` (VN-Index, Vàng, Dầu Brent, Bitcoin).
4. Lưu file, kéo thả lại thư mục `site` lên Netlify.

Muốn gửi khách: chụp màn hình thẻ bản tin rồi gửi qua Zalo.

Thanh Thị trường gồm 5 dòng (Việt Nam, Mỹ, Á – Âu, Hàng hóa & tiền số, Dòng tiền); sửa số trong các khối `class="q"`.

## Cập nhật nội dung

Kéo thả lại thư mục `site` vào mục **Deploys** của site trên Netlify. Link giữ nguyên.

## Thêm một công cụ mới

1. Mở `assets/site.js`, thêm 1 dòng vào `TB.PRODUCTS`, ví dụ:
   `{id:'loc', name:'Bộ lọc dòng tiền', group:'Phân tích', status:'live', href:'bo-loc/index.html', desc:'...', nav:'Bộ lọc'}`
2. Tạo thư mục `bo-loc/` và file `index.html`. Trong trang cần có:
   - `<link rel="stylesheet" href="../assets/site.css">`
   - `<body data-root="../" data-page="loc">`
   - `<div id="tb-top"></div>` ở đầu và `<div id="tb-foot"></div>` ở cuối
   - `<script src="../assets/site.js"></script>`
3. Menu, trang chủ và chân trang tự cập nhật.

Mục Webgame trong menu là dòng `id:'game'` trong `TB.PRODUCTS`; đổi link game thì sửa `href` ở đó.

Muốn đổi số trên thanh chỉ số chạy ngang: sửa `TB.TICKER` trong `assets/site.js`.
