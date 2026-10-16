# -*- coding: utf-8 -*-
# Bài 2–8. Mỗi khối: ('p',html) ('h3',txt) ('aside',html) ('table',[(k,v)]) ('steps',[(t,d)]) ('check',[...],[msg5,msg34,msg12]) ('calc',kind)
L = {}

L[2] = dict(
 q='"Mua cổ phiếu là mua cái gì? Có cầm được, sờ được không, hay chỉ là con số nhảy múa trên điện thoại?"',
 tra=('Bạn mua một miếng của công ty, chỉ là không được cắt mang về', [
  ('p','Cổ phiếu là giấy chứng nhận bạn sở hữu một phần doanh nghiệp. Ngày xưa nó là tờ giấy in hoa văn, cất trong két. Bây giờ nó là một dòng số trong tài khoản, do Tổng công ty Lưu ký và Bù trừ chứng khoán Việt Nam giữ hộ. Không sờ được, nhưng cũng không mối mọt, không ai lấy trộm được, trừ khi bạn tự đưa mật khẩu cho "chuyên gia" trên Zalo.'),
  ('p','Cầm cổ phiếu, bạn có <b>ba quyền</b> chính: được chia lãi (cổ tức), được đi họp đại hội cổ đông để biểu quyết, và được bán lại phần của mình cho người khác. Quyền thứ ba là thứ cả chợ đang hăng hái dùng hằng ngày. Hai quyền đầu thì ít ai nhớ, giống như mua nhà xong chỉ nhớ quyền bán nhà.'),
  ('p','Còn chuyện giá lên xuống: giá cổ phiếu là cái giá người mua và người bán thống nhất được tại một thời điểm. Nó phản ánh hai thứ: <b>công ty làm ăn ra sao</b>, và <b>đám đông đang vui hay đang sợ</b>. Ngắn hạn, đám đông thắng. Dài hạn, việc làm ăn thắng.')]),
 vd=('Quán phở bà Tư, phần 2: cổ tức và họp cổ đông', [
  ('p','Nhớ quán phở bà Tư ở bài 1 chứ? Bạn nắm 10 phần trên 10.000 phần. Cuối năm quán lãi 200 triệu. Bà Tư triệu tập họp, cả hội thống nhất: chia một nửa lãi cho cổ đông, nửa còn lại giữ lại mua thêm nồi nước dùng.'),
  ('table',[('Lãi cả năm của quán','200.000.000 đ'),('Chia cho cổ đông (50%)','100.000.000 đ'),('Mỗi phần nhận','10.000 đ'),('Bạn có 10 phần, nhận','100.000 đ'),('Tính trên 1 triệu bỏ ra','10%')]),
  ('p','Đó là <b>cổ tức tiền mặt</b>. Nếu bà Tư không chia tiền mà tặng thêm phần, ví dụ cứ 10 phần được thêm 1 phần, thì gọi là <b>cổ tức bằng cổ phiếu</b>. Nghe sướng, nhưng thật ra cái bánh vẫn thế, chỉ cắt nhỏ ra thành nhiều miếng hơn. Miếng to hay miếng nhỏ thì tổng vẫn là một cái bánh.'),
  ('aside','Mệnh giá cổ phiếu ở Việt Nam là 10.000 đồng. Khi công ty công bố "cổ tức 10%", nghĩa là 10% của mệnh giá, tức 1.000 đồng mỗi cổ phiếu, chứ không phải 10% giá thị trường.')]),
 ctv=('Đọc nhanh "căn cước" của một cổ phiếu', [
  ('p','Trước khi mua mã nào, mở trang thông tin doanh nghiệp (trên app chứng khoán hoặc mục Giải mã cổ phiếu của Top Broker) và trả lời được 5 dòng sau:'),
  ('steps',[('Mã và sàn','Ba chữ cái, niêm yết ở HOSE, HNX hay UPCoM. Sàn UPCoM thường có doanh nghiệp nhỏ hơn và quy định công bố thông tin lỏng hơn.'),
            ('Công ty bán cái gì','Nói được trong một câu. Không nói được thì chưa nên mua.'),
            ('Vốn hóa','Giá nhân số cổ phiếu. Cho biết công ty to hay nhỏ, như so một siêu thị với một tạp hóa.'),
            ('Ai đang nắm nhiều','Cổ đông lớn, người nội bộ, tỷ lệ nước ngoài. Biết ai ngồi cùng thuyền với mình.'),
            ('Cổ tức mấy năm gần đây','Đều đặn, thất thường hay không có. Nói lên khá nhiều về tính cách công ty.')])]),
 traps=[('"Cổ tức cổ phiếu là được cho không."','Bánh được cắt thêm miếng, nhưng không to thêm. Giá cổ phiếu sẽ được điều chỉnh giảm tương ứng vào ngày giao dịch không hưởng quyền.'),
        ('"Mua là thành chủ, chủ thì có quyền."','Nắm 0,001% thì quyền biểu quyết của bạn nặng ngang một hạt tiêu trong nồi phở. Chủ thật là cổ đông lớn.'),
        ('"Giá cổ phiếu là giá trị công ty."','Giá là cái người ta trả, giá trị là cái người ta nhận. Hai thứ này hay đi lạc nhau, có khi lạc cả năm.')],
 nho='Mua cổ phiếu là mua một miếng của việc làm ăn,<br>không phải mua một con số để ngắm nó nhảy.',
 quiz=[('Công ty công bố cổ tức tiền mặt 15%. Mỗi cổ phiếu nhận bao nhiêu?',['1.500 đồng','15% giá thị trường','150 đồng'],0,'Cổ tức tính trên mệnh giá 10.000 đồng: 15% × 10.000 = 1.500 đồng.'),
       ('Nhận cổ tức bằng cổ phiếu 10% thì tài sản của bạn thay đổi thế nào?',['Tăng thêm 10%','Gần như không đổi, chỉ có thêm cổ phiếu và giá được điều chỉnh','Giảm 10%'],1,'Số cổ phiếu tăng nhưng giá điều chỉnh giảm tương ứng. Tổng giá trị gần như giữ nguyên.'),
       ('Về dài hạn, điều gì quyết định giá cổ phiếu?',['Số người bàn tán trên mạng','Việc làm ăn của doanh nghiệp','Màu của bảng điện'],1,'Ngắn hạn đám đông chi phối, dài hạn lợi nhuận và giá trị doanh nghiệp quyết định.')])

L[3] = dict(
 q='"Có 100 triệu tiền nhàn rỗi. Gửi ngân hàng thì sợ lạm phát, mua vàng thì sợ đỉnh, coin thì sợ sập, cổ phiếu thì sợ bị lùa. Rốt cuộc để đâu?"',
 tra=('Mỗi kênh là một con vật nuôi, tính nết khác nhau', [
  ('p','Chọn kênh đầu tư giống chọn vật nuôi. <b>Gửi tiết kiệm</b> là con mèo: lười, ít khi gây chuyện, mỗi tháng đều đặn đẻ ra chút lãi. <b>Vàng</b> là con rùa: sống rất lâu, không đẻ ra gì, nhưng gặp lúc loạn lạc thì người ta tranh nhau mua. <b>Cổ phiếu</b> là con ngựa: chạy được xa, nhưng thỉnh thoảng hất người cưỡi xuống đất. Còn <b>coin</b> là con ngựa hoang chưa thuần: hôm nay phi nước đại, mai đá bạn gãy răng.'),
  ('p','Tháng 10/2026, gửi tiết kiệm 12 tháng ở nhiều ngân hàng được khoảng 7%/năm. Lạm phát 9 tháng đầu năm là 4,52%. Nghĩa là con mèo vẫn đang đẻ ra tiền thật, khoảng 2,5% sau khi trừ trượt giá. Không giàu, nhưng không ai mất ngủ vì con mèo cả.'),
  ('p','Câu hỏi đúng không phải "kênh nào lãi nhất", mà là <b>"tiền này bao lâu nữa mới cần dùng, và nếu nó giảm 30% thì mình có còn ngủ được không"</b>. Trả lời được câu này, việc chọn kênh tự khắc ra.')]),
 vd=('100 triệu, 4 con vật, 1 năm', [
  ('table',[('Gửi tiết kiệm 12 tháng','Khoảng +7%, gần như chắc chắn'),('Vàng','Không có lãi định kỳ; lời lỗ theo giá, mua bán chênh lệch'),('Cổ phiếu (rổ tốt)','Có thể +20% hoặc −20%, có cổ tức'),('Coin (Bitcoin)','Có thể ±50% trở lên; một ngày giảm 3% là chuyện thường')]),
  ('p','Ví dụ gần nhất: trong 12 tháng qua, cổ phiếu PNJ giảm khoảng 64%, VIC tăng khoảng 109%. Cùng là cổ phiếu, một con ngựa về đích, một con ngã xuống hố. Đó là lý do bài 11 sẽ nói chuyện chia trứng vào nhiều giỏ.'),
  ('aside','Bảng trên là minh họa tính nết của từng kênh, không phải dự báo. Không ai, kể cả tôi, biết chắc năm sau kênh nào thắng.')]),
 ctv=('Tính thử sức mạnh của lãi kép', [
  ('p','Kéo thanh trượt để xem 100 triệu (hoặc số tiền bạn chọn) lớn lên thế nào theo thời gian với mỗi mức lãi suất. Đây là phép tính, không phải lời hứa.'),
  ('calc','compound'),
  ('p','Quy tắc 72: lấy 72 chia cho lãi suất là ra số năm để tiền tăng gấp đôi. Lãi 7%/năm thì khoảng 10 năm. Lãi 12%/năm thì khoảng 6 năm. Ai hứa với bạn tiền gấp đôi trong 6 tháng, xin mời ra ngay khỏi quán.')]),
 traps=[('"Gửi tiết kiệm là mất tiền vì lạm phát."','Với lãi khoảng 7% và lạm phát 4,5%, tiền gửi vẫn đang tăng thật. Đừng để ai dọa bỏ con mèo để đi cưỡi ngựa hoang.'),
        ('"Vàng không bao giờ giảm."','Vàng cũng có năm giảm, và chênh lệch mua bán vàng miếng có lúc rất lớn. Mua xong bán ngay là lỗ liền.'),
        ('"Coin lên 10 lần, chậm chân là mất cơ hội."','Thứ lên 10 lần thì cũng có thể xuống còn một phần mười. Chỉ đặt vào coin số tiền mà mất trắng bạn vẫn cười được.')],
 nho='Không có kênh nào tốt nhất.<br>Chỉ có kênh hợp với số tiền, thời gian và giấc ngủ của bạn.',
 quiz=[('Theo quy tắc 72, lãi 8%/năm thì bao lâu tiền gấp đôi?',['Khoảng 9 năm','Khoảng 4 năm','Khoảng 20 năm'],0,'72 ÷ 8 = 9 năm.'),
       ('Lãi tiết kiệm 7%, lạm phát 4,5%. Lãi thật khoảng bao nhiêu?',['Khoảng 2,5%','11,5%','Âm'],0,'Lãi thật xấp xỉ bằng lãi danh nghĩa trừ lạm phát.'),
       ('Câu hỏi quan trọng nhất khi chọn kênh đầu tư là gì?',['Kênh nào đang hot nhất','Bao lâu nữa cần tiền và chịu được giảm bao nhiêu','Bạn bè đang chơi gì'],1,'Thời hạn và sức chịu đựng rủi ro quyết định kênh phù hợp.')])

L[4] = dict(
 q='"Mở tài khoản chứng khoán có phải ra quầy, nộp tiền cọc, ký cả chồng giấy không? Nghe ngại quá."',
 tra=('Mở tài khoản giờ còn nhanh hơn gọi một suất cơm văn phòng', [
  ('p','Ngày xưa mở tài khoản phải ra quầy, xếp hàng, ký mỏi tay. Bây giờ hầu hết công ty chứng khoán cho mở online bằng căn cước công dân gắn chip, xác thực khuôn mặt qua camera điện thoại, mất chừng 10 phút. Miễn phí, không cần nộp tiền trước.'),
  ('p','Mỗi người được mở tài khoản ở nhiều công ty chứng khoán khác nhau, nhưng mỗi công ty chỉ một tài khoản. Giống như bạn có thể có thẻ ở nhiều ngân hàng. Tiền nạp vào tài khoản chứng khoán được quản lý tách biệt, công ty chứng khoán không được lấy tiền của bạn đi tiêu.'),
  ('p','Điều quan trọng nhất không phải mở ở đâu cho nhanh, mà là <b>chọn công ty đàng hoàng và người môi giới tử tế</b>. Một người môi giới tốt giúp bạn tránh được những cú ngã đau. Một người môi giới chạy doanh số thì giúp bạn... giao dịch thật nhiều.')]),
 vd=('Những khoản phí khi mở và duy trì', [
  ('table',[('Phí mở tài khoản','Thường miễn phí'),('Phí duy trì','Thường miễn phí hoặc rất thấp'),('Phí giao dịch mỗi lần mua, bán','Khoảng 0,1–0,35% giá trị, tùy công ty'),('Thuế khi bán','0,1% giá trị bán'),('Lãi vay margin (nếu dùng)','Tính theo ngày, tùy công ty')]),
  ('aside','Mức phí cụ thể mỗi công ty một khác và thay đổi theo chính sách. Hỏi rõ trước khi mở, đừng để đến lúc bán mới ngã ngửa.')]),
 ctv=('Mở tài khoản trong 6 bước', [
  ('steps',[('Chuẩn bị','Căn cước công dân gắn chip, điện thoại có camera, số tài khoản ngân hàng đứng tên bạn.'),
            ('Tải app','Tải ứng dụng chính thức của công ty chứng khoán từ App Store hoặc Google Play. Không bấm link lạ gửi qua tin nhắn.'),
            ('Chụp giấy tờ','Chụp hai mặt căn cước, app tự đọc thông tin.'),
            ('Xác thực khuôn mặt','Quay mặt theo hướng dẫn để app đối chiếu với ảnh trên căn cước.'),
            ('Ký hợp đồng điện tử','Đọc kỹ phần phí và phần margin. Không cần đăng ký margin nếu chưa hiểu bài 13.'),
            ('Nạp tiền và đổi mật khẩu','Chuyển khoản từ ngân hàng vào số tài khoản chứng khoán. Đặt mật khẩu mạnh, bật xác thực hai lớp.')]),
  ('p','Sau bước 6, bạn đã có thể đặt lệnh. Bài 5 sẽ chỉ cách đặt lệnh đầu tiên mà không bị bảng điện "ăn thịt".')]),
 traps=[('"Đưa tài khoản cho người khác giao dịch hộ cho tiện."','Đây là cách nhanh nhất để mất tiền mà không biết kêu ai. Không bao giờ đưa mật khẩu, mã OTP cho bất kỳ ai, kể cả người tự xưng nhân viên công ty.'),
        ('"Mở qua link trong nhóm Zalo cho nhanh."','Link giả mạo app chứng khoán không hiếm. Chỉ tải app từ kho ứng dụng chính thức hoặc website của công ty.'),
        ('"Mở xong phải đăng ký margin luôn."','Margin là vay tiền để mua cổ phiếu. Chưa hiểu thì chưa đăng ký. Không đăng ký thì không bao giờ bị gọi ký quỹ lúc nửa đêm.')],
 nho='Mở tài khoản mất 10 phút.<br>Giữ mật khẩu cho riêng mình thì mất cả đời, nhưng đáng.',
 quiz=[('Mỗi người được mở bao nhiêu tài khoản ở một công ty chứng khoán?',['Một','Không giới hạn','Ba'],0,'Mỗi công ty một tài khoản, nhưng được mở ở nhiều công ty khác nhau.'),
       ('Ai đó tự xưng nhân viên công ty chứng khoán xin mã OTP để "hỗ trợ". Bạn làm gì?',['Đưa luôn cho nhanh','Từ chối và gọi tổng đài chính thức để kiểm tra','Đưa nửa mã'],1,'Không ai có quyền xin mã OTP của bạn.'),
       ('Khoản nào bạn phải trả khi bán cổ phiếu?',['Phí giao dịch và thuế 0,1% giá trị bán','Chỉ phí mở tài khoản','Không mất gì'],0,'Bán chứng khoán chịu phí giao dịch và thuế thu nhập cá nhân 0,1% trên giá trị bán.')])

L[5] = dict(
 q='"Bấm mua rồi mà cả buổi không khớp. Bấm lại thì khớp giá cao hơn hẳn. Cái bảng điện này nó ghét tôi à?"',
 tra=('Bảng điện không ghét ai, nó chỉ ghép người mua với người bán', [
  ('p','Mỗi lệnh là một lời rao: "tôi mua 100 cổ phiếu, giá không quá 20.000". Hệ thống của sở giao dịch xếp các lời rao theo nguyên tắc <b>giá tốt hơn được ưu tiên trước, cùng giá thì ai đặt trước được ưu tiên trước</b>. Bạn rao mua thấp hơn người khác thì phải xếp hàng sau, có khi cả buổi không đến lượt.'),
  ('p','Trên sàn HOSE, phiên giao dịch chạy từ 9:00 đến 11:30 và từ 13:00 đến 14:45. Mười lăm phút đầu (9:00–9:15) là phiên mở cửa, mười lăm phút cuối (14:30–14:45) là phiên đóng cửa. Hai phiên này không khớp từng lệnh một mà gom lại, tìm một mức giá khớp được nhiều nhất.'),
  ('p','Số lượng mua bán thông thường phải là bội số của 100 cổ phiếu (lô chẵn). Muốn mua 1–99 cổ phiếu thì đặt lệnh lô lẻ, thường khớp chậm và giá kém hơn. Quy định có thể được sở giao dịch điều chỉnh, app của công ty chứng khoán sẽ hiển thị đúng quy tắc hiện hành.')]),
 vd=('Bốn loại lệnh, nói bằng tiếng chợ', [
  ('table',[('LO (lệnh giới hạn)','"Tôi mua giá này hoặc rẻ hơn." An toàn nhất cho người mới.'),('ATO','"Mua cho tôi ở giá mở cửa, giá nào cũng được." Chỉ đặt trong phiên mở cửa.'),('ATC','"Mua cho tôi ở giá đóng cửa, giá nào cũng được." Chỉ đặt trong phiên đóng cửa.'),('MP (lệnh thị trường)','"Mua ngay, giá nào đang bán cũng lấy." Nhanh nhưng dễ bị khớp giá xấu.')]),
  ('p','Bạn đặt LO mua 1.000 cổ phiếu giá 20.000. Nếu đang có người bán ở 20.000 hoặc thấp hơn, lệnh khớp ngay. Nếu không, lệnh nằm chờ. Còn nếu bạn sốt ruột đặt MP lúc bảng điện đang sôi, có khi khớp ở 20.500, mất thêm 500.000 đồng chỉ vì vội. Vội vàng là một loại phí ẩn, không công ty nào ghi trong biểu phí.')]),
 ctv=('Đặt lệnh đầu tiên trong 5 bước', [
  ('steps',[('Chọn mã','Gõ mã cổ phiếu, xem giá trần (tím), sàn (xanh lơ), tham chiếu (vàng). Bài 6 nói kỹ.'),
            ('Chọn Mua','Kiểm tra lại mã. Gõ nhầm VIC thành VIX là hai câu chuyện khác hẳn nhau.'),
            ('Chọn loại lệnh LO','Người mới nên dùng LO để kiểm soát giá.'),
            ('Nhập giá và khối lượng','Khối lượng là bội số của 100. Giá nằm trong khoảng sàn đến trần.'),
            ('Xác nhận và theo dõi','Vào sổ lệnh xem trạng thái: chờ khớp, khớp một phần, đã khớp. Chưa khớp thì có thể sửa hoặc hủy.')]),
  ('p','Lời khuyên cho lệnh đầu tiên: mua ít thôi, 100 hoặc 200 cổ phiếu, để làm quen với cảm giác tiền thật. Học bơi thì xuống chỗ nông trước.')]),
 traps=[('"Đặt MP cho chắc khớp."','Chắc khớp, nhưng không chắc giá. Mã ít thanh khoản thì lệnh MP có thể khớp ở giá rất xa.'),
        ('"Đặt ATO để mua được giá tốt nhất buổi sáng."','ATO là chấp nhận giá mở cửa, có thể cao hơn hẳn giá hôm qua nếu nhiều người cùng tranh mua.'),
        ('"Lệnh chưa khớp là app lỗi."','Phần lớn là do giá bạn đặt chưa có ai bán (hoặc mua). Xem lại bảng giá trước khi gọi tổng đài.')],
 nho='Bảng điện không ghét ai.<br>Nó chỉ thưởng cho người đặt giá rõ ràng và phạt người vội vàng.',
 quiz=[('Người mới nên dùng loại lệnh nào?',['LO','MP','ATC'],0,'LO giúp bạn kiểm soát giá mua hoặc bán.'),
       ('Phiên đóng cửa trên HOSE diễn ra lúc nào?',['14:30–14:45','9:00–9:15','11:30–13:00'],0,'ATC từ 14:30 đến 14:45.'),
       ('Hai lệnh mua cùng giá, lệnh nào được khớp trước?',['Lệnh đặt trước','Lệnh khối lượng lớn hơn','Lệnh của người quen'],0,'Ưu tiên giá, rồi đến thời gian đặt lệnh.')])

L[6] = dict(
 q='"Màu tím, màu xanh lơ, màu vàng, xanh lá, đỏ... nhìn bảng điện như nhìn đèn nháy đám cưới. Đọc sao đây?"',
 tra=('Mỗi màu là một tín hiệu, học một lần là nhớ cả đời', [
  ('p','Mỗi ngày, mỗi mã cổ phiếu có ba mức giá mốc. <b>Giá tham chiếu</b> (màu vàng) thường là giá đóng cửa phiên trước. <b>Giá trần</b> (màu tím) là mức cao nhất được phép trong ngày. <b>Giá sàn</b> (màu xanh lơ) là mức thấp nhất được phép. Trên sàn HOSE, biên độ thông thường là ±7% so với tham chiếu.'),
  ('p','Giá đang cao hơn tham chiếu thì hiện màu xanh lá, thấp hơn thì màu đỏ. Chạm trần là tím, chạm sàn là xanh lơ. Vậy nên cả bảng điện xanh lơ là ngày cả chợ khóc, cả bảng tím là ngày cả chợ mua đuổi. Hai ngày đó đều là ngày nên bình tĩnh nhất.'),
  ('p','Ngoài màu sắc, có ba cột đáng xem: <b>dư mua</b> (người đang xếp hàng mua ở các mức giá), <b>dư bán</b> (người đang xếp hàng bán), và <b>tổng khối lượng</b> (đã khớp bao nhiêu trong ngày). Bên cạnh còn có cột nước ngoài mua, nước ngoài bán.')]),
 vd=('Đọc một dòng bảng điện', [
  ('p','Giả sử mã ABC có tham chiếu 20.000 đồng.'),
  ('table',[('Giá tham chiếu (vàng)','20.000'),('Giá trần (tím), +7%','21.400'),('Giá sàn (xanh lơ), −7%','18.600'),('Giá khớp hiện tại','20.300 (xanh lá, +1,5%)'),('Dư mua tốt nhất','20.250 × 15.000 cp'),('Dư bán tốt nhất','20.300 × 3.000 cp'),('Tổng khối lượng','1.250.000 cp')]),
  ('p','Nghĩa là: người mua đang xếp hàng đông ở 20.250, người bán ở 20.300 thì mỏng. Muốn mua ngay thì phải chấp nhận 20.300. Khối lượng 1,25 triệu cổ phiếu cho biết hôm nay mã này có người quan tâm. Còn so với hôm qua nhiều hay ít thì phải nhìn khối lượng trung bình.'),
  ('aside','Bước giá trên HOSE thay đổi theo vùng giá, ví dụ giá thấp thì nhảy từng 10 đồng, giá cao thì nhảy 50 hoặc 100 đồng. App sẽ tự báo nếu bạn nhập sai bước giá.')]),
 ctv=('Bài tập 5 phút với bảng điện', [
  ('steps',[('Chọn 3 mã quen','Ví dụ HPG, VPB, FPT. Đừng mở cả trăm mã, mắt hoa mà đầu không vào.'),
            ('Ghi giá tham chiếu, trần, sàn','Tự tính ±7% xem có khớp với số trên app không.'),
            ('Nhìn dư mua, dư bán','Bên nào dày hơn? Dày bên mua chưa chắc giá sẽ tăng, vì lệnh có thể bị hủy bất cứ lúc nào.'),
            ('So khối lượng','So khối lượng hôm nay với vài phiên trước. Tăng đột biến là có chuyện, hãy sang Radar xem tin.'),
            ('Ghi một câu nhận xét','"Hôm nay HPG tăng nhẹ, khối lượng thấp, chưa có tiền lớn vào." Viết được câu này là bạn đã đọc được bảng điện.')])]),
 traps=[('"Dư mua dày là sắp lên."','Lệnh treo có thể là "lệnh mồi", đặt cho người khác nhìn rồi hủy. Đừng tin mỗi con số trên bảng.'),
        ('"Mã tím là phải mua ngay."','Mua giá trần là mua đúng mức cao nhất của ngày. Hôm sau có khi mở cửa đỏ lòm.'),
        ('"Cả bảng xanh lơ là phải bán hết."','Bán khi cả chợ bán thì thường bán đúng đáy ngày. Bình tĩnh xem lại lý do mình mua.')],
 nho='Tím là lúc người ta tham, xanh lơ là lúc người ta sợ.<br>Cả hai lúc đều nên chậm lại một nhịp.',
 quiz=[('Mã có giá tham chiếu 30.000 trên HOSE. Giá trần khoảng bao nhiêu?',['32.100','33.000','30.700'],0,'30.000 × 1,07 = 32.100 đồng.'),
       ('Màu xanh lơ trên bảng điện nghĩa là gì?',['Giá sàn','Giá trần','Giá tham chiếu'],0,'Xanh lơ là giá sàn, tím là giá trần, vàng là tham chiếu.'),
       ('Dư mua rất dày có chắc giá sẽ tăng không?',['Chắc chắn tăng','Không chắc, lệnh có thể bị hủy','Chắc chắn giảm'],1,'Lệnh chờ có thể bị hủy bất cứ lúc nào, không phải lời hứa.')])

L[7] = dict(
 q='"Bán xong rồi mà tiền chưa về tài khoản. Lãi 2 triệu mà rút ra không được 2 triệu. Tiền đi đâu?"',
 tra=('Tiền không biến mất, nó chỉ đi đường vòng qua T+2 và qua phí', [
  ('p','Ở Việt Nam, chứng khoán và tiền được thanh toán theo chu kỳ <b>T+2</b>: hôm nay (ngày T) bạn mua hoặc bán, thì đến ngày làm việc thứ hai sau đó cổ phiếu hoặc tiền mới về tài khoản. Mua thứ Hai, cổ phiếu về thứ Tư. Bán thứ Năm, tiền về thứ Hai tuần sau, vì thứ Bảy, Chủ nhật hệ thống cũng nghỉ như mọi người.'),
  ('p','Cần tiền gấp thì có dịch vụ <b>ứng trước tiền bán</b>: công ty chứng khoán cho bạn nhận trước, đổi lại thu một khoản phí tính theo số ngày. Tiện, nhưng đừng biến nó thành thói quen, kẻo phí ăn dần vào lãi.'),
  ('p','Còn chuyện lãi 2 triệu rút không được 2 triệu: vì mỗi lần mua, bán đều mất phí giao dịch, và khi bán thì phải nộp thêm thuế thu nhập cá nhân <b>0,1% trên giá trị bán</b>. Thuế tính trên số tiền bán, không phải trên tiền lãi. Lỗ vẫn phải nộp. Nhà nước không chia buồn với ai cả.')]),
 vd=('Một vòng mua bán, tính đến từng đồng', [
  ('p','Giả sử phí giao dịch 0,15% mỗi chiều.'),
  ('table',[('Mua 1.000 cp × 20.000 đ','20.000.000 đ'),('Phí mua (0,15%)','30.000 đ'),('Bán 1.000 cp × 22.000 đ','22.000.000 đ'),('Phí bán (0,15%)','33.000 đ'),('Thuế bán (0,1%)','22.000 đ'),('Lãi trước phí','2.000.000 đ'),('Lãi thực nhận','1.915.000 đ')]),
  ('p','Nghe 85.000 đồng thì ít. Nhưng nếu mỗi tuần mua bán vài lần, mỗi tháng phí và thuế có thể ngốn vài phần trăm vốn. Người lướt sóng liên tục thường làm giàu cho công ty chứng khoán và ngân sách nhà nước trước, rồi mới đến lượt mình, nếu còn.'),
  ('aside','Mức thuế 0,1% trên giá trị chuyển nhượng được quy định tại Luật Thuế thu nhập cá nhân 2025, áp dụng từ 1/7/2026. Phí giao dịch tùy từng công ty chứng khoán.')]),
 ctv=('Tự kiểm tra chi phí thật của mình', [
  ('steps',[('Mở sao kê','Vào app, xem lịch sử giao dịch 3 tháng gần nhất.'),
            ('Cộng tổng phí và thuế','Nhiều app có sẵn mục "phí đã trả". Không có thì cộng tay.'),
            ('Chia cho vốn trung bình','Ra tỷ lệ chi phí trên vốn. Trên 1–2% một quý là bạn đang giao dịch quá nhiều.'),
            ('Đếm số lệnh','Bao nhiêu lệnh mua bán trong 3 tháng? Bao nhiêu lệnh thật sự có lý do rõ ràng?'),
            ('Đặt quy tắc','Ví dụ: không mua bán lại cùng một mã trong vòng 5 phiên nếu không có tin mới.')])]),
 traps=[('"Lỗ thì không phải nộp thuế."','Thuế 0,1% tính trên giá trị bán, bán lỗ vẫn nộp.'),
        ('"Mua sáng nay, chiều bán luôn được."','Cổ phiếu mua hôm nay phải chờ chu kỳ thanh toán mới về tài khoản và bán được.'),
        ('"Phí có 0,15%, lướt càng nhiều càng lãi."','Mỗi vòng mua bán tốn khoảng 0,4% cả phí lẫn thuế. Lướt 10 vòng là mất 4% trước khi kịp lãi đồng nào.')],
 nho='Phí và thuế không bao giờ thua lỗ.<br>Giao dịch càng nhiều, họ càng thắng chắc.',
 quiz=[('Bán cổ phiếu vào thứ Năm, tiền về tài khoản khi nào (không có ngày nghỉ lễ)?',['Thứ Hai tuần sau','Thứ Sáu','Ngay lập tức'],0,'T+2 tính theo ngày làm việc: thứ Sáu là T+1, thứ Hai là T+2.'),
       ('Bán 50 triệu đồng cổ phiếu, thuế thu nhập cá nhân là bao nhiêu?',['50.000 đồng','500.000 đồng','0 đồng nếu lỗ'],0,'0,1% × 50.000.000 = 50.000 đồng, kể cả khi lỗ.'),
       ('Cách giảm chi phí giao dịch hiệu quả nhất là gì?',['Giao dịch ít hơn, có lý do rõ ràng','Đổi sang lệnh MP','Bán ngay khi vừa mua'],0,'Ít giao dịch, mỗi lệnh có lý do, là cách tiết kiệm chắc nhất.')])

L[8] = dict(
 q='"Cổ phiếu 5 nghìn với cổ phiếu 50 nghìn, cái nào rẻ hơn? Đương nhiên 5 nghìn chứ, rẻ gấp 10 lần mà!"',
 tra=('Rẻ hay đắt không nằm ở giá, mà ở thứ bạn nhận được', [
  ('p','Một bát phở 50 nghìn có đủ thịt, một bát 5 nghìn chỉ có nước. Bát nào rẻ? Cổ phiếu cũng thế: giá một cổ phiếu chẳng nói lên gì nếu không biết nó đại diện cho bao nhiêu lãi và bao nhiêu tài sản. Ba con số dưới đây giúp bạn đo việc đó.'),
  ('p','<b>P/E</b> (giá trên lợi nhuận): trả bao nhiêu đồng để mua 1 đồng lãi mỗi năm. P/E 10 nghĩa là bỏ 100 đồng, công ty làm ra khoảng 10 đồng lãi cho phần của bạn. <b>P/B</b> (giá trên giá trị sổ sách): trả bao nhiêu đồng cho 1 đồng vốn thật của công ty sau khi trừ hết nợ. <b>ROE</b>: cứ 100 đồng vốn của chủ, công ty đẻ ra bao nhiêu đồng lãi mỗi năm.'),
  ('p','Bộ ba này phải đọc cùng nhau. P/E thấp mà ROE cũng thấp thì có khi là hàng rẻ vì chất lượng kém. P/B cao mà ROE rất cao thì có khi là hàng đắt xắt ra miếng.')]),
 vd=('Ba mã thật, ba bài học (dữ liệu TCBS, 15/10/2026)', [
  ('table',[('HPG: P/E 7,5 · P/B 1,2 · ROE 17,7%','Trông rẻ. Nhưng bỏ khoản lãi bất thường quý 1, P/E lõi khoảng 9,4.'),('VIC: P/E 79 · P/B 9,9','100 đồng chỉ mua được khoảng 1,3 đồng lãi mỗi năm. Đang trả tiền cho kỳ vọng.'),('PNJ: P/E 3,8 · P/B 0,7','Trông rất rẻ. Nhưng kế hoạch 2026 là lỗ 6.270 tỷ: P/E tính trên lãi quá khứ.')]),
  ('p','PNJ là ví dụ kinh điển của <b>bẫy P/E thấp</b>. P/E được tính bằng lợi nhuận đã qua, như nhìn gương chiếu hậu mà lái xe. Khi phía trước là khúc cua lỗ nặng, cái gương chẳng giúp được gì.'),
  ('aside','Mỗi ngành có mặt bằng P/E, P/B riêng. Ngân hàng thường được so bằng P/B, công nghệ thường có P/E cao hơn thép. So sánh trong cùng ngành mới công bằng.')]),
 ctv=('Kiểm tra nhanh "đắt hay rẻ" trong 4 bước', [
  ('check',['Tôi biết P/E của mã này và mặt bằng P/E của ngành.','Tôi đã xem lợi nhuận năm nay có đột biến hay sắp lỗ không, chứ không chỉ nhìn năm ngoái.','Tôi đã xem ROE có ổn định trên 12–15% vài năm liền không.','Tôi đã so P/B với ROE: trả nhiều tiền cho vốn thì vốn đó phải sinh lời tốt.'],
   ['4/4: Bạn đang định giá như người làm nghề.','Còn thiếu vài bước. Rẻ thật hay rẻ vì có vấn đề, cần kiểm tra thêm.','Bạn đang mua theo cảm giác "giá thấp là rẻ". Đó là cửa ngõ của bẫy giá trị.']),
  ('p','Muốn xem nhanh ba con số này cho từng mã kèm giải thích dễ hiểu, vào mục Giải mã cổ phiếu trên Top Broker.')]),
 traps=[('"Giá 5 nghìn là rẻ."','Giá một cổ phiếu không nói lên đắt rẻ. Phải xem nó đại diện cho bao nhiêu lãi, bao nhiêu tài sản.'),
        ('"P/E thấp là món hời."','P/E thấp có thể vì lợi nhuận sắp giảm, như PNJ. Luôn hỏi: lãi năm sau có giữ được không?'),
        ('"P/E 79 là đắt, chắc chắn sẽ giảm."','Đắt có thể còn đắt hơn rất lâu nếu đám đông còn tin. Định giá cao là rủi ro, không phải thời điểm.')],
 nho='Giá là cái bạn trả, giá trị là cái bạn nhận.<br>Bát phở 5 nghìn chưa chắc đã rẻ.',
 quiz=[('P/E bằng 10 nghĩa là gì?',['Bỏ 100 đồng, công ty làm ra khoảng 10 đồng lãi mỗi năm','Giá sẽ tăng 10 lần','Công ty có 10 năm tuổi'],0,'P/E 10 tương đương lợi suất lợi nhuận khoảng 10%.'),
       ('Vì sao P/E 3,8 của PNJ có thể là cái bẫy?',['Vì tính trên lãi quá khứ, trong khi năm nay dự kiến lỗ','Vì PNJ ở sàn HNX','Vì giá dưới 20 nghìn'],0,'P/E dùng lợi nhuận đã qua, không phản ánh khoản lỗ sắp tới.'),
       ('ROE 25% nghĩa là gì?',['100 đồng vốn chủ đẻ ra 25 đồng lãi mỗi năm','Giá tăng 25%','Nợ bằng 25% vốn'],0,'ROE đo hiệu quả sinh lời trên vốn chủ sở hữu.')])
