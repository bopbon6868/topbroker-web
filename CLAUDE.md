# Top Broker – topbroker.fun

Website đầu tư tiếng Việt của anh Hải (môi giới chứng khoán, Zalo 0939 660 996). Website tĩnh. Các mục Tin nhanh, Bài viết và trang quản trị /admin đã bỏ theo yêu cầu ngày 16/10/2026: không tạo lại nếu anh không yêu cầu.

## Nơi sửa và cách đưa lên
- Kho GitHub: **bopbon6868/topbroker-web** (công khai, nhánh `main`). Gắn kho bằng công cụ `add_repo` (owner `bopbon6868`, repo `topbroker-web`, access `push`), rồi clone.
- Thư mục `site/` là toàn bộ website. Push lên `main` thì Netlify tự đưa lên topbroker.fun sau khoảng 1 phút.
- Kiểm tra: WebFetch `https://topbroker-web.netlify.app/?v=<số ngẫu nhiên>` (WebFetch hay trả bản cũ của topbroker.fun).
- Nếu push bị từ chối: `git pull --rebase` rồi push lại.

## Quy tắc nội dung (bắt buộc)
- Không khuyến nghị mua/bán. Chỉ mô tả, phân tích, giải thích tác động.
- Mọi con số có nguồn và mốc thời gian. Không bịa số.
- Nhãn tin: mạng xã hội, diễn đàn là "Chưa xác minh"; báo chính thống, HOSE/HNX là "Tin chuẩn"; Ngân hàng Nhà nước là "NHNN".
- Giọng văn: dễ hiểu, gọn, dí dỏm kiểu miền Bắc, không bôi nhọ ai.

## Lịch tự động
- 7:45, 12:15, 15:45 và 20:45 hằng ngày (mốc 8:00, 12:30, 16:00, 21:00), chạy trên mây: sửa bản tin, bảng Thị trường, 3 tin cần biết, Lịch (`site/index.html`), Radar (`site/radar/index.html`) và `TB.UPDATED`/`TB.TICKER` trong `site/assets/site.js`.

- Chạy cả 7 ngày trong tuần. Đến giờ là cập nhật và đăng thẳng lên web, KHÔNG hỏi lại anh Hải (anh đã dặn ngày 16/10/2026).
- Thứ Bảy, Chủ Nhật và ngày lễ (sàn Việt Nam nghỉ): không viết như thể có phiên giao dịch. Bản tin xoay sang tổng kết tuần của thị trường Việt Nam (giữ số đóng cửa phiên gần nhất, ghi rõ ngày), tin vĩ mô, NHNN, doanh nghiệp công bố cuối tuần, thế giới, crypto (chạy cả cuối tuần), và những điều cần để ý cho tuần tới. Lịch cần nhớ ưu tiên sự kiện tuần tới.

## Không đụng
- Phần đồng hồ (`TB.now`/`tbTick`), phần giá tự cập nhật (`TB.LIVE`, `tbApply`, `TB.LIVEMAP`) và đoạn mở cửa sổ Webgame trong `site/assets/site.js`.
- Thuộc tính `data-q` trên các ô giá ở trang chủ, và máy lấy giá `netlify/functions/quotes.mjs` (/api/quotes: Yahoo và VNDirect; chỉ số Việt Nam cố ý trễ 15 phút). Số tĩnh trong HTML chỉ là số dự phòng khi máy lấy giá lỗi.
- Dòng ngày giờ `class="date"` (`data-clock`) trên trang chủ: tự chạy theo giờ thực.
