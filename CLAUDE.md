# Top Broker – Cách Claude đăng bài viết

Dùng khi anh Hải nhắn kiểu "viết bài…", "đăng bài…", "sửa bài…" cho topbroker.fun. (Mục Tin nhanh đã bỏ theo yêu cầu ngày 16/10/2026; tin trong ngày đi vào "3 tin cần biết" và Radar do lịch tự động cập nhật.)

## Nơi đăng
- Kho GitHub: **bopbon6868/topbroker-web** (công khai, nhánh `main`). Gắn kho bằng công cụ `add_repo` (owner `bopbon6868`, repo `topbroker-web`, access `push`), rồi clone.
- Mỗi lần push lên `main`, Netlify tự chạy `python3 tools/build_content.py` và đưa lên topbroker.fun sau khoảng 1 phút.
- Kiểm tra sau khi đăng: WebFetch `https://topbroker-web.netlify.app/<đường dẫn>?v=<số ngẫu nhiên>` (WebFetch hay trả bản cũ của topbroker.fun).

## Bài viết
File mới: `site/content/bai-viet/<slug-khong-dau>.json`
```json
{"tieu_de": "...", "chuyen_muc": "Góc nhìn | Phân tích | Vĩ mô | Chuyện nghề | Hỏi đáp",
 "ngay": "2026-10-17T20:00", "mo_ta": "1 câu dẫn", "anh": "", "tac_gia": "Top Broker",
 "body": "Markdown: ## tiêu đề mục, **đậm**, *nghiêng*, [link](url), - danh sách, 1. danh sách, > trích dẫn", "an": false}
```
Trang bài: `/bai-viet/<slug>/`. Ảnh (nếu có) đặt trong `site/uploads/`, ghi `"anh": "/uploads/ten-anh.png"`.

## Quy tắc nội dung (bắt buộc)
- Không khuyến nghị mua/bán. Chỉ mô tả, phân tích, giải thích tác động.
- Mọi con số có nguồn và mốc thời gian. Không bịa số; tra TCBS hoặc tìm trên web trước khi viết.
- Tin mạng xã hội, diễn đàn: nhãn "Chưa xác minh". Báo chính thống, HOSE/HNX: "Tin chuẩn". Ngân hàng Nhà nước: "NHNN".
- Giọng: dễ hiểu, gọn, dí dỏm kiểu miền Bắc, không bôi nhọ ai. Bài chất lượng: có luận điểm rõ, số liệu dẫn nguồn, phần "điều ít người nói".
- Viết xong: cho anh Hải xem bản nháp nếu anh còn trong cuộc trò chuyện. Nếu anh dặn "đăng luôn" thì đăng.

## Đăng
1. Chạy thử `python3 tools/build_content.py` để chắc file JSON hợp lệ. Rồi `git checkout -- site/index.html site/bai-viet`, vì Netlify tự dựng lại các trang này.
2. Commit "Thêm bài: …", rồi `git push origin main`. Nếu push bị từ chối: `git pull --rebase` rồi push lại.
3. Chờ khoảng 90 giây, kiểm tra trang live, báo anh Hải kèm đường dẫn.

## Không đụng
- Khối `<!--CMS-->…<!--/CMS-->` trên trang chủ (tự dựng).
- Bản tin, bảng Thị trường, 3 tin cần biết, Lịch: lịch tự động 7:45 và 12:15 cập nhật.
- Phần đồng hồ (`TB.now`/`tbTick`), phần giá tự cập nhật (`TB.LIVE`, `tbApply`, `TB.LIVEMAP`) và đoạn mở cửa sổ Webgame trong `site/assets/site.js`.
- Thuộc tính `data-q` trên các ô giá ở trang chủ, và máy lấy giá `netlify/functions/quotes.mjs` (/api/quotes: Yahoo + VNDirect, chỉ số Việt Nam cố ý trễ 15 phút). Số tĩnh trong HTML chỉ là số dự phòng khi máy lấy giá lỗi.
- Trang quản trị `/admin` (Sveltia CMS) là lối phụ để anh Hải tự gõ, dùng chung các file JSON trên.
