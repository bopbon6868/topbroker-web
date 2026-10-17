# Top Broker – topbroker.fun

Website đầu tư tiếng Việt của anh Hải (môi giới chứng khoán, Zalo 0939 660 996). Website tĩnh. Các mục Tin nhanh, Bài viết và trang quản trị /admin đã bỏ theo yêu cầu ngày 16/10/2026: không tạo lại nếu anh không yêu cầu.

## Nơi sửa và cách đưa lên
- Kho GitHub: **bopbon6868/topbroker-web** (công khai, nhánh `main`). Gắn kho bằng công cụ `add_repo` (owner `bopbon6868`, repo `topbroker-web`, access `push`), rồi clone.
- Thư mục `site/` là toàn bộ website. Push lên `main` thì Netlify tự đưa lên topbroker.fun sau khoảng 1 phút.
- Kiểm tra: WebFetch `https://topbroker-web.netlify.app/?v=<số ngẫu nhiên>` (WebFetch hay trả bản cũ của topbroker.fun).
- Nếu push bị từ chối: `git pull --rebase` rồi push lại.
- Các trang gọi `site.js`/`site.css` kèm `?v=<phiên bản>` để điện thoại không giữ bản cũ. Khi sửa lớn giao diện, đổi số phiên bản ở mọi file HTML (lịch cập nhật tin hằng ngày thì không cần).

## Quy tắc nội dung (bắt buộc)
- Không khuyến nghị mua/bán. Chỉ mô tả, phân tích, giải thích tác động.
- Mọi con số có nguồn và mốc thời gian. Không bịa số.
- Nhãn tin: mạng xã hội, diễn đàn là "Chưa xác minh"; báo chính thống, HOSE/HNX là "Tin chuẩn"; Ngân hàng Nhà nước là "NHNN".
- Giọng văn: dễ hiểu, gọn, dí dỏm kiểu miền Bắc, không bôi nhọ ai.

## Lịch tự động
- 7:45, 12:15, 15:45 và 20:45 hằng ngày (mốc 8:00, 12:30, 16:00, 21:00), chạy trên mây: sửa bản tin, bảng Thị trường, 3 tin cần biết, Lịch (`site/index.html`), Radar (`site/radar/index.html`) và `TB.UPDATED`/`TB.TICKER` trong `site/assets/site.js`.

- Chạy cả 7 ngày trong tuần. Đến giờ là cập nhật và đăng thẳng lên web, KHÔNG hỏi lại anh Hải (anh đã dặn ngày 16/10/2026).
- Thứ Bảy, Chủ Nhật và ngày lễ (sàn Việt Nam nghỉ): không viết như thể có phiên giao dịch. Bản tin xoay sang tổng kết tuần của thị trường Việt Nam (giữ số đóng cửa phiên gần nhất, ghi rõ ngày), tin vĩ mô, NHNN, doanh nghiệp công bố cuối tuần, thế giới, crypto (chạy cả cuối tuần), và những điều cần để ý cho tuần tới. Lịch cần nhớ ưu tiên sự kiện tuần tới.

## Bác sĩ danh mục (`site/bac-si-danh-muc/`)
- Công cụ chạy trên trình duyệt: danh mục và nhật ký lưu localStorage của người dùng. Chỉ khi người dùng bấm "Nhờ AI diễn giải", bản tóm tắt số liệu mới được gửi tới `/api/ai` (`netlify/functions/ai.mjs`, Claude qua Netlify AI Gateway, tốn credit Netlify; không lưu dữ liệu). Giá lấy từ `/api/stock` (`netlify/functions/stock.mjs`, VNDirect, trễ 15 phút). Ngành và nhóm so sánh ở `sectors.js`.
- AI chỉ xuất hiện MỘT chỗ: thẻ "AI tổng kết buổi khám" ở cuối chặng 4 (bước `tong-ket`), đọc lại toàn bộ quá trình. Trả lời 4 điều khách muốn nghe (đang thế nào, đáng lo nhất, chọn gì đổi lấy gì, từ giờ để ý gì) + 1 câu để ngẫm; giọng bình dân, dễ hiểu, dễ ngẫm. Không đặt lại nút AI ở các chặng khác (anh Hải dặn 17/10/2026).
- `/api/ai`: phải giữ `thinking: {type:'disabled'}` (model mặc định suy nghĩ trước, ăn hết token, gây trả lời cụt). AI trả lời theo dòng có nhãn TT/LO/CH/TD/NG, không dùng JSON hay tool. Tự kiểm tra: WebFetch `https://topbroker-web.netlify.app/api/ai?test=1&z=<số ngẫu nhiên>` (giới hạn 8 lần/phút).
- Luồng 4 chặng (anh Hải chốt 17/10/2026): **1 Khám danh mục** (gồm cả phần biến động do thị trường/ngành/riêng mã) → **2 Làm rõ hoàn cảnh** (3 câu bấm chọn: thời gian đầu tư, khi nào cần rút tiền, mức chịu đựng tài sản ròng giảm; lưu `S.ctx`) → **3 So sánh phương án** (giữ nguyên, bán bớt giữ tiền, bán bớt trả nợ, cơ cấu sang mã khác, bán hết, mua thêm; có dòng "vượt mức chịu đựng") → **4 Chốt kế hoạch** (thay Nhật ký: lựa chọn, đánh đổi, hoàn cảnh, điều kiện theo dõi gợi ý sẵn, ngày đánh giá lại; lưu localStorage `tb-bsdm-journal-v1`).
- Đầu ra 5 phần (anh Hải chốt 17/10/2026), xếp vào 4 chặng: **Kết luận nhanh** (giá trị CP, tiền mặt, dư nợ, vốn chủ ước tính; lãi/lỗ nằm ở đâu; 1–3 vấn đề) và **Chẩn đoán** (mỗi cảnh báo có số liệu + hệ quả tính theo vốn chủ; chỉ gắn "Đáng lo" khi hệ quả đủ lớn, không vì một tỷ lệ riêng lẻ) ở chặng 1; **Phương án** và **Hệ quả** (vốn chủ theo kịch bản giá, tiền mặt/dư nợ, tỷ trọng từng mã, phí thuế) ở chặng 3; **Kế hoạch tiếp theo** (điều kiện theo dõi, ngày đánh giá lại, dữ liệu còn thiếu, điều có thể làm kết luận thay đổi) ở chặng 4. Gọi "vốn chủ ước tính" thay cho "tài sản ròng".
- Định vị: không khuyến nghị bán/giữ; chỉ mô tả tình trạng, nguyên nhân (tách bằng chứng / giả thuyết / thiếu thông tin) và hệ quả từng phương án. Lịch tự động không sửa phần này.
- **Nguyên tắc cho phần phân tích (anh Hải chốt ngày 17/10/2026, áp dụng cho Bác sĩ danh mục và mọi phần phân tích trên web):**
  1. **Công thức tính toán** tạo ra kết quả số học (giá vốn, lãi lỗ, tỷ trọng, Rtt, kịch bản). Số phải tính ra được, kiểm lại được.
  2. **Dữ liệu doanh nghiệp** tạo cơ sở để đánh giá luận điểm đầu tư (báo cáo tài chính, định giá, tin công bố). Thiếu dữ liệu thì nói là thiếu.
  3. **AI diễn giải và nêu các câu hỏi cần kiểm tra**: giải thích con số nghĩa là gì, tách rõ đâu là bằng chứng, đâu là giả thuyết; không kết luận thay người dùng.
  4. **Người dùng quyết định phương án cuối cùng.** Không gợi ý, không xếp hạng "phương án nên chọn".

## Không đụng
- Phần đồng hồ (`TB.now`/`tbTick`), phần giá tự cập nhật (`TB.LIVE`, `tbApply`, `TB.LIVEMAP`) và đoạn mở cửa sổ Webgame trong `site/assets/site.js`.
- Thuộc tính `data-q` trên các ô giá ở trang chủ, và máy lấy giá `netlify/functions/quotes.mjs` (/api/quotes: Yahoo và VNDirect; chỉ số Việt Nam cố ý trễ 15 phút). Số tĩnh trong HTML chỉ là số dự phòng khi máy lấy giá lỗi.
- Thẻ `a.doc` (lối vào Bác sĩ danh mục) trên trang chủ.
- Dòng ngày giờ `class="date"` (`data-clock`) trên trang chủ: tự chạy theo giờ thực.
