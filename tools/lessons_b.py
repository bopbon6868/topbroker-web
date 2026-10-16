# -*- coding: utf-8 -*-
# Bài 9–15
L = {}

L[9] = dict(
 q='"Báo cáo tài chính dày cả trăm trang, toàn số với chữ. Người lười như tôi đọc chỗ nào?"',
 tra=('Ba tờ giấy, ba câu hỏi, thế là đủ cho người lười', [
  ('p','Báo cáo tài chính có ba bảng chính. Người lười chỉ cần nhớ mỗi bảng trả lời một câu hỏi. <b>Kết quả kinh doanh</b>: công ty có lãi không, lãi từ đâu? <b>Bảng cân đối kế toán</b>: công ty có gì, nợ ai bao nhiêu? <b>Lưu chuyển tiền tệ</b>: tiền thật có chảy về túi không?'),
  ('p','Phần lớn người đọc chỉ nhìn đúng một dòng: lợi nhuận sau thuế. Giống như đi xem mắt chỉ nhìn mỗi cái ảnh đại diện. Ảnh thì đẹp, nhưng nợ nần, tính nết, tiền trong túi thì nằm ở hai bảng còn lại.'),
  ('p','Mẹo của dân trong nghề: <b>lợi nhuận là ý kiến, tiền mặt là sự thật</b>. Kế toán có nhiều cách ghi nhận lợi nhuận hợp pháp, nhưng tiền có về tài khoản hay không thì không ai "ghi nhận" hộ được.')]),
 vd=('Soi báo cáo Hòa Phát quý 2/2026 (dữ liệu TCBS)', [
  ('table',[('Lãi sau thuế quý 2','6.424 tỷ'),('Tiền thật thu từ kinh doanh','5.825 tỷ'),('Chi xây nhà máy (capex)','7.034 tỷ'),('Tiền tự do còn lại','Khoảng −1.200 tỷ'),('Hàng tồn kho','55.608 tỷ, tăng 28% so với quý trước')]),
  ('p','Bảng kết quả kinh doanh nói: lãi 6.424 tỷ, quá tốt. Bảng lưu chuyển tiền tệ nói: tiền thật về 5.825 tỷ, mà chi xây nhà máy 7.034 tỷ, quý này tiêu nhiều hơn kiếm. Bảng cân đối nói: kho hàng phình thêm hơn 12.000 tỷ trong ba tháng. Ba bảng ghép lại mới ra bức tranh thật: làm ăn tốt, nhưng tiền đang bị giam vào kho và nhà máy.')]),
 ctv=('3 chỗ phải nhìn, mỗi chỗ 1 phút', [
  ('steps',[('Kết quả kinh doanh: lãi từ đâu','So "lợi nhuận từ hoạt động kinh doanh" với "lợi nhuận trước thuế". Chênh nhau nhiều là có khoản ngoài lề. Bài 10 nói kỹ.'),
            ('Cân đối kế toán: nợ và kho','Nợ vay có tăng nhanh hơn vốn chủ không? Phải thu và tồn kho có phình to bất thường không?'),
            ('Lưu chuyển tiền tệ: tiền thật','"Lưu chuyển tiền thuần từ hoạt động kinh doanh" có dương và xấp xỉ lợi nhuận không? Lãi to mà tiền âm nhiều quý liền là đèn đỏ.')]),
  ('check',['Tôi đã so lãi từ kinh doanh chính với lãi trước thuế.','Tôi đã xem nợ vay và tồn kho thay đổi thế nào so với quý trước.','Tôi đã xem dòng tiền kinh doanh có cùng chiều với lợi nhuận không.'],
   ['3/3: Bạn đọc báo cáo tốt hơn phần lớn nhà đầu tư cá nhân.','Còn sót một bảng. Bảng bị bỏ qua thường là nơi giấu chuyện.','Bạn mới nhìn ảnh đại diện. Mở hai bảng còn lại ra đi.'])]),
 traps=[('"Lãi kỷ lục là công ty tốt."','Lãi kỷ lục có thể do bán tài sản một lần. Xem lãi đến từ đâu trước khi vỗ tay.'),
        ('"Tồn kho nhiều là hàng sẵn sàng bán."','Tồn kho tăng nhanh hơn doanh thu có thể là hàng ế. Nếu giá hàng giảm, công ty phải trích dự phòng.'),
        ('"Dòng tiền âm một quý là có vấn đề."','Một quý âm chưa nói lên gì, nhất là khi đang mở rộng. Âm nhiều quý liền mới đáng lo.')],
 nho='Lợi nhuận là ý kiến, tiền mặt là sự thật.<br>Đọc báo cáo mà bỏ bảng tiền là đọc truyện bỏ chương cuối.',
 quiz=[('Bảng nào cho biết tiền thật có chảy về công ty không?',['Lưu chuyển tiền tệ','Kết quả kinh doanh','Thuyết minh nhân sự'],0,'Báo cáo lưu chuyển tiền tệ ghi nhận dòng tiền thực thu, thực chi.'),
       ('Lãi to nhưng dòng tiền kinh doanh âm nhiều quý liền là dấu hiệu gì?',['Đèn đỏ, cần soi kỹ','Công ty rất tốt','Không có ý nghĩa'],0,'Lợi nhuận không chuyển thành tiền là dấu hiệu cảnh báo.'),
       ('Quý 2/2026, vì sao Hòa Phát "tiêu nhiều hơn kiếm"?',['Tiền thu từ kinh doanh thấp hơn tiền chi xây nhà máy','Vì lỗ','Vì trả cổ tức'],0,'5.825 tỷ thu vào, 7.034 tỷ chi đầu tư.')])

L[10] = dict(
 q='"Công ty báo lãi kỷ lục mà sao giá cổ phiếu lại giảm? Thị trường bị điên à?"',
 tra=('Thị trường không điên, nó chỉ đọc kỹ hơn bạn', [
  ('p','Lãi có hai loại. <b>Lãi thật</b> đến từ việc kinh doanh chính, năm sau còn lặp lại được. <b>Lãi "trúng một lần"</b> đến từ bán tài sản, đánh giá lại khoản đầu tư, hoàn nhập dự phòng, chênh lệch tỷ giá. Loại thứ hai vẫn hợp pháp, vẫn được cộng vào lợi nhuận, nhưng giống trúng xổ số: vui một lần, đừng mong tháng nào cũng trúng.'),
  ('p','Nhà đầu tư chuyên nghiệp định giá cổ phiếu bằng lãi thật. Nên khi công ty báo "lãi kỷ lục" mà phần lớn đến từ trúng xổ số, giá không tăng là chuyện bình thường. Chỉ người đọc tiêu đề mới thấy thị trường điên.'),
  ('p','Ngoài ra còn hai cái bẫy nhỏ. <b>Lợi ích cổ đông thiểu số</b>: tập đoàn lãi to nhưng một phần thuộc về cổ đông khác ở công ty con. <b>Thay đổi phạm vi hợp nhất</b>: công ty con ra vào báo cáo khiến so sánh với năm trước không còn cùng một rổ.')]),
 vd=('Ba ca có thật trên sàn (dữ liệu TCBS)', [
  ('table',[('HPG quý 1/2026','Lãi trước thuế 10.762 tỷ, trong đó khoảng 5.460 tỷ ngoài hoạt động bán thép.'),('VIC quý 2/2026','Lãi hoạt động 9.424 tỷ không đủ trả lãi vay 10.265 tỷ. Khoảng 23.700 tỷ lãi trước thuế đến từ nguồn khác.'),('FPT 6 tháng 2026','Doanh thu giảm 17–22%, lãi cổ đông vẫn tăng 14%. Phần lãi của cổ đông thiểu số gần như biến mất.')]),
  ('p','Cách tính nhanh phần "ngoài lề": lấy <b>lợi nhuận trước thuế</b>, trừ <b>lợi nhuận từ hoạt động kinh doanh</b>, rồi cộng lại <b>chi phí lãi vay</b>. Kết quả dương lớn là công ty đang được nâng đỡ bởi thu nhập tài chính hoặc thu nhập khác. Muốn biết chính xác là khoản gì thì đọc thuyết minh báo cáo tài chính.'),
  ('aside','Có lãi ngoài lề không có nghĩa là công ty xấu. Nó chỉ có nghĩa là bạn không nên nhân lãi quý đó lên 4 để đoán cả năm.')]),
 ctv=('5 câu soi lãi trước khi tin tiêu đề', [
  ('check',['Lãi từ kinh doanh chính tăng hay giảm so với cùng kỳ?','Phần chênh lệch giữa lãi trước thuế và lãi hoạt động có lớn bất thường không?','Lãi của cổ đông công ty mẹ chiếm bao nhiêu trong tổng lãi sau thuế?','Doanh thu có đi cùng chiều với lợi nhuận không?','Thuyết minh có nhắc đến bán tài sản, thoái vốn, hoàn nhập, đánh giá lại không?'],
   ['5/5: Không tiêu đề nào lừa được bạn.','Bạn đã soi được phần lớn. Câu còn lại thường là nơi giấu "trúng xổ số".','Bạn đang tin tiêu đề báo. Tiêu đề viết để được bấm vào, không phải để bạn giàu.'])]),
 traps=[('"Lãi tăng gấp đôi là cổ phiếu phải tăng gấp đôi."','Nếu lãi tăng nhờ khoản một lần, thị trường sẽ không trả giá cho nó.'),
        ('"Doanh thu giảm mà lãi tăng là công ty quản lý giỏi."','Có thể. Cũng có thể do cắt bớt công ty con, do lãi tài chính, hoặc do thay đổi cách hạch toán. Phải biết lý do.'),
        ('"Thuyết minh dài quá, bỏ qua."','Thuyết minh là nơi công ty buộc phải nói thật chi tiết. Mọi bí mật hay ho đều nằm ở đó.')],
 nho='Đừng định giá công ty bằng tờ vé số nó vừa trúng.<br>Hãy định giá bằng cái việc nó làm mỗi ngày.',
 quiz=[('Lãi nào nên dùng để định giá cổ phiếu?',['Lãi từ hoạt động kinh doanh chính, lặp lại được','Lãi kỷ lục bất kỳ','Lãi từ bán tài sản'],0,'Lãi bền vững mới phản ánh giá trị dài hạn.'),
       ('Công thức nhanh ước tính phần lãi ngoài lề là gì?',['LNTT − LN hoạt động + lãi vay','Doanh thu − giá vốn','Vốn chủ × ROE'],0,'Phần chênh này cho thấy thu nhập tài chính hoặc thu nhập khác.'),
       ('Vì sao so sánh lợi nhuận FPT 2026 với 2025 cần thận trọng?',['Vì cấu trúc công ty con có thể đã thay đổi','Vì FPT không công bố báo cáo','Vì giá cổ phiếu giảm'],0,'Phạm vi hợp nhất thay đổi làm hai kỳ không cùng một rổ.')])

L[11] = dict(
 q='"Nên dồn hết vào 1 mã cho chắc ăn, hay rải ra 10 mã cho an toàn? Ông anh bảo chia ra là lãi ít."',
 tra=('Trứng một giỏ, giỏ rơi thì làm trứng chiên', [
  ('p','Ông anh nói đúng một nửa: chia ra thì lãi không thể bằng mã tốt nhất. Nhưng ông anh quên nửa còn lại: chia ra thì cũng không bao giờ lỗ bằng mã tệ nhất. Mà ai dám chắc mã mình chọn là mã tốt nhất?'),
  ('p','Đa dạng hóa không phải là mua thật nhiều mã. Mua 10 mã ngân hàng thì vẫn là một giỏ, chỉ là giỏ to hơn. Đa dạng hóa thật là chia vào những thứ <b>không cùng lên cùng xuống</b>: các ngành khác nhau, và cả các kênh khác nhau như tiết kiệm, vàng, cổ phiếu.'),
  ('p','Với nhà đầu tư cá nhân, một danh mục khoảng <b>5–10 mã</b>, mỗi mã không quá 20% vốn, trải qua 3–4 ngành, là đủ. Nhiều hơn thì bạn không theo dõi xuể, thành ra "chơi tập thể" mà chẳng hiểu mã nào.')]),
 vd=('Hai người, cùng 100 triệu, cùng một năm', [
  ('table',[('Anh A dồn 100% vào PNJ','Còn khoảng 36 triệu (PNJ giảm khoảng 64% trong 12 tháng)'),('Chị B chia 5 mã, mỗi mã 20 triệu, có PNJ','PNJ mất khoảng 12,8 triệu; 4 mã còn lại quyết định kết quả'),('Bài học','Một cú sập không đánh gục được danh mục được chia đều')]),
  ('p','Cùng lúc đó, ai dồn hết vào VIC thì gần gấp đôi tài sản. Nhưng trước khi tiếc, hãy tự hỏi: một năm trước, bạn có dám chắc chọn VIC chứ không phải PNJ? Hồi đầu năm 2026, PNJ còn là "cổ phiếu quốc dân" của dân đầu tư giá trị.'),
  ('aside','Số liệu thay đổi giá 12 tháng của PNJ và VIC lấy từ TCBS ngày 15/10/2026. Ví dụ của chị B chỉ minh họa phần thiệt hại của PNJ, không giả định kết quả các mã còn lại.')]),
 ctv=('Tự chấm điểm danh mục của bạn', [
  ('check',['Không mã nào chiếm quá 20% tổng vốn đầu tư.','Danh mục trải qua ít nhất 3 ngành khác nhau.','Tôi theo dõi được tin tức của tất cả các mã đang cầm.','Có một phần tiền nằm ngoài cổ phiếu (tiết kiệm, vàng, tiền mặt dự phòng).','Tôi biết rõ lý do đang giữ từng mã.'],
   ['5/5: Danh mục của bạn có thể ngủ ngon qua bão.','Khá ổn, nhưng còn một hai lỗ hổng. Bão đến thường chui vào đúng chỗ đó.','Danh mục đang là một ván cược. Chia lại trước khi thị trường chia giúp bạn.'])]),
 traps=[('"Mua 10 mã ngân hàng là đa dạng hóa."','Cùng một ngành thì cùng lên cùng xuống. Đó là một giỏ to, không phải nhiều giỏ.'),
        ('"Mã đang lãi thì mua thêm cho đến khi chiếm hết danh mục."','Mã tốt đến mấy cũng có ngày gặp chuyện. Hãy giới hạn tỷ trọng tối đa cho mỗi mã.'),
        ('"Chia ra là tầm thường, dồn mới giàu."','Dồn mới giàu, và dồn cũng mới nghèo. Người sống sót lâu trên thị trường mới là người giàu sau cùng.')],
 nho='Đa dạng hóa là thừa nhận mình không biết trước tương lai.<br>Thừa nhận điều đó là bắt đầu khôn ngoan.',
 quiz=[('Danh mục nào đa dạng hóa tốt hơn?',['5 mã thuộc 4 ngành khác nhau','10 mã đều là ngân hàng','1 mã tốt nhất'],0,'Đa dạng hóa thật là chia vào các tài sản không cùng biến động.'),
       ('Tỷ trọng tối đa hợp lý cho một mã với nhà đầu tư cá nhân là bao nhiêu?',['Khoảng 20%','100%','Khoảng 70%'],0,'Giới hạn khoảng 20% giúp một cú sập không quá đau.'),
       ('Dồn 100 triệu vào một mã giảm 64% thì còn bao nhiêu?',['Khoảng 36 triệu','Khoảng 64 triệu','Khoảng 80 triệu'],0,'100 × (1 − 0,64) = 36 triệu.')])

L[12] = dict(
 q='"Lỗ 20% rồi, bán thì tiếc, giữ thì sợ. Hay cứ gồng, kiểu gì chả có ngày về bờ?"',
 tra=('Gồng mãi thì thành lực sĩ, nhưng tài khoản thì gầy rộc', [
  ('p','Cái bẫy lớn nhất của người lỗ là phép toán. Mất 20% thì phải tăng 25% mới về bờ. Mất 50% thì phải tăng gấp đôi. Mất 78% như PNJ từ đỉnh tháng 1/2026 thì phải tăng khoảng 4,5 lần. Lỗ càng sâu, con dốc về bờ càng dựng đứng.'),
  ('p','Cắt lỗ giống nhổ răng sâu: đau một lần, khỏi đau cả năm. Không nhổ thì nó lan sang răng bên cạnh, rồi sang cả hàm. Trong chứng khoán, "răng bên cạnh" là số tiền đáng lẽ đã được đem đi mua mã khác tốt hơn.'),
  ('p','Câu hỏi đúng khi đang lỗ không phải "mình mua giá bao nhiêu", mà là: <b>"nếu hôm nay đang cầm tiền mặt, mình có mua mã này ở giá này không?"</b>. Không thì bán. Thị trường không biết và không quan tâm bạn mua ở giá nào.')]),
 vd=('Bảng toán "về bờ"', [
  ('table',[('Lỗ 10%','Cần tăng 11,1% để hòa vốn'),('Lỗ 20%','Cần tăng 25%'),('Lỗ 30%','Cần tăng 42,9%'),('Lỗ 50%','Cần tăng 100%'),('Lỗ 78% (PNJ từ đỉnh)','Cần tăng khoảng 355%')]),
  ('p','Nhiều nhà đầu tư chuyên nghiệp đặt quy tắc cắt lỗ khi giảm khoảng 7–10% so với giá mua, hoặc khi lý do mua ban đầu không còn đúng nữa. Con số cụ thể tùy phong cách, nhưng điều quan trọng là <b>đặt trước khi mua</b>, không phải nghĩ ra lúc đang đỏ mắt.')]),
 ctv=('Máy tính "về bờ"', [
  ('p','Nhập mức lỗ hiện tại của bạn để xem cần tăng bao nhiêu mới hòa vốn.'),
  ('calc','recover'),
  ('steps',[('Trước khi mua','Viết ra: lý do mua, giá cắt lỗ, giá chốt lời. Ba dòng thôi.'),
            ('Đặt cảnh báo giá','Hầu hết app có chức năng báo khi giá chạm mức bạn chọn.'),
            ('Khi chạm giá cắt lỗ','Làm đúng như đã viết. Đừng sửa kế hoạch lúc đang sợ.'),
            ('Sau khi bán','Ghi lại bài học. Lỗ nhỏ có bài học tốt hơn lỗ to không bài học.')])]),
 traps=[('"Chưa bán là chưa lỗ."','Lỗ trên giấy vẫn là lỗ. Tiền đó không mua được gì khác chừng nào bạn còn gồng.'),
        ('"Bình quân giá xuống cho nhanh về bờ."','Mua thêm khi đang lỗ chỉ đúng khi lý do mua vẫn còn nguyên. Không thì là ném thêm tiền xuống hố.'),
        ('"Đợi về bờ rồi bán."','Có những mã không bao giờ về bờ. Chờ đợi cũng có chi phí: thời gian và cơ hội.')],
 nho='Cắt lỗ không phải thừa nhận thua cuộc.<br>Đó là giữ lại viên đạn cho trận sau.',
 quiz=[('Lỗ 50% thì cần tăng bao nhiêu để hòa vốn?',['100%','50%','25%'],0,'Từ 50 lên 100 là tăng gấp đôi.'),
       ('Thời điểm tốt nhất để quyết định giá cắt lỗ là khi nào?',['Trước khi mua','Khi đã lỗ 30%','Khi bạn bè khuyên'],0,'Quyết định khi còn tỉnh táo, trước khi cảm xúc chen vào.'),
       ('Câu hỏi đúng khi đang lỗ là gì?',['Nếu đang cầm tiền mặt, mình có mua mã này ở giá này không?','Mình mua giá bao nhiêu?','Ai đã khuyên mình mua?'],0,'Quyết định dựa trên hiện tại, không dựa trên giá mua cũ.')])

L[13] = dict(
 q='"Công ty chứng khoán cho vay thêm, lãi gấp đôi chứ sao. Vay margin có gì sai?"',
 tra=('Margin là con dao hai lưỡi, mà lưỡi quay về phía mình sắc hơn', [
  ('p','Margin là vay tiền công ty chứng khoán để mua thêm cổ phiếu, dùng chính cổ phiếu đó làm tài sản đảm bảo. Cổ phiếu tăng thì lãi nhân lên. Cổ phiếu giảm thì lỗ cũng nhân lên, cộng thêm tiền lãi vay tính theo từng ngày, kể cả ngày bạn đang khóc.'),
  ('p','Khi giá giảm đến một ngưỡng, công ty chứng khoán sẽ <b>gọi ký quỹ</b> (call margin): yêu cầu nộp thêm tiền hoặc bán bớt cổ phiếu. Không nộp kịp thì họ tự bán, gọi là <b>bán giải chấp</b>, giá nào cũng bán. Những phiên cả bảng xanh lơ thường là phiên giải chấp hàng loạt: người này bán, kéo giá xuống, khiến người kia bị gọi ký quỹ, lại bán tiếp. Hiệu ứng domino, mà bạn là một quân cờ.'),
  ('p','Người dùng margin thường không thua vì chọn sai cổ phiếu. Họ thua vì <b>không có thời gian chờ</b>. Người không vay có thể gồng qua cơn bão. Người vay thì bị bão quét trước khi trời kịp tạnh.')]),
 vd=('100 triệu vốn, vay thêm 100 triệu', [
  ('table',[('Tổng mua','200 triệu cổ phiếu'),('Cổ phiếu tăng 20%','Tài sản 240 triệu, trả nợ 100 → còn 140, lãi 40% vốn'),('Cổ phiếu giảm 20%','Tài sản 160 triệu, trả nợ 100 → còn 60, lỗ 40% vốn'),('Cổ phiếu giảm 30%','Tài sản 140 triệu, trả nợ 100 → còn 40, lỗ 60% vốn'),('Cổ phiếu giảm 50%','Tài sản 100 triệu, trả nợ 100 → còn 0, mất trắng')]),
  ('p','Chưa tính tiền lãi vay. Giả sử lãi margin 12%/năm, vay 100 triệu trong 3 tháng mất khoảng 3 triệu tiền lãi, dù giá lên hay xuống. Lãi suất cụ thể tùy công ty chứng khoán và có thể thay đổi.'),
  ('aside','Bảng trên giả định không bị bán giải chấp giữa chừng. Thực tế, khi giảm khoảng 20–30%, bạn có thể đã bị gọi ký quỹ và bị bán ở giá thấp nhất.')]),
 ctv=('Máy tính margin', [
  ('p','Chọn tỷ lệ vay và mức giá biến động để thấy vốn của bạn thay đổi ra sao.'),
  ('calc','margin'),
  ('check',['Tôi hiểu ngưỡng gọi ký quỹ và ngưỡng bán giải chấp của công ty mình.','Tôi có sẵn tiền dự phòng để nộp thêm khi bị gọi ký quỹ.','Khoản vay không quá một nửa vốn tự có.','Tôi chỉ vay cho mã có thanh khoản tốt, không vay mua penny.'],
   ['4/4: Bạn dùng margin như dùng dao bếp: cẩn thận và đúng việc.','Bạn đang dùng margin với vài kẽ hở. Bão không cần nhiều kẽ hở.','Tạm thời đừng dùng margin. Không vay thì không bao giờ bị gọi lúc nửa đêm.'])]),
 traps=[('"Vay ít thôi, không sao."','Vay ít mà mua mã biến động mạnh thì vẫn bị quét. Mức độ rủi ro phụ thuộc cả vào khoản vay lẫn loại cổ phiếu.'),
        ('"Bị gọi ký quỹ thì nộp thêm là xong."','Nộp thêm để giữ một vị thế đang lỗ là ném tiền vào chỗ đang thủng. Hãy hỏi lại lý do mua trước khi nộp.'),
        ('"Công ty cho vay mã này nghĩa là mã này an toàn."','Danh sách cho vay chỉ là tiêu chí quản lý rủi ro của công ty, không phải lời bảo đảm cổ phiếu sẽ tăng.')],
 nho='Margin không làm bạn giỏi hơn.<br>Nó chỉ làm cái giỏi và cái dở của bạn to gấp đôi.',
 quiz=[('Vốn 100 triệu, vay thêm 100 triệu, cổ phiếu giảm 30%. Vốn còn bao nhiêu?',['40 triệu','70 triệu','85 triệu'],0,'Tài sản 140 triệu trừ nợ 100 triệu còn 40 triệu.'),
       ('Bán giải chấp là gì?',['Công ty chứng khoán tự bán cổ phiếu khi bạn không nộp đủ ký quỹ','Bạn tự bán chốt lời','Bán cổ phiếu lô lẻ'],0,'Họ bán để thu hồi khoản vay, giá nào cũng bán.'),
       ('Người dùng margin thường thua vì điều gì nhất?',['Không có thời gian chờ giá hồi phục','Phí mở tài khoản','Chọn mã có tên khó nhớ'],0,'Áp lực ký quỹ buộc bán đúng lúc giá thấp.')])

L[14] = dict(
 q='"Sao cứ mua là giảm, bán là tăng? Chắc có ai theo dõi tài khoản tôi."',
 tra=('Không ai theo dõi bạn cả, chỉ có cảm xúc của bạn theo dõi đám đông', [
  ('p','Không có ai ngồi canh tài khoản của bạn để đánh ngược. Chỉ là bạn mua đúng lúc ai cũng muốn mua, và bán đúng lúc ai cũng muốn bán. Lúc giá tăng mạnh, tin tốt dồn dập, nhóm Zalo rộn ràng, bạn mua. Đó thường là lúc người mua cuối cùng đã vào. Không còn ai mua tiếp thì giá đi xuống.'),
  ('p','Các nhà nghiên cứu tâm lý gọi một phần của chuyện này là <b>sợ lỡ cơ hội</b> (FOMO) khi giá lên, và <b>sợ mất mát</b> khi giá xuống. Nỗi đau mất 1 triệu thường mạnh hơn niềm vui lãi 1 triệu. Thế nên ta ôm hàng lỗ quá lâu và bán hàng lãi quá sớm, ngược hẳn với điều nên làm.'),
  ('p','Thị trường như một cái chợ lúc tan: ai cũng chen nhau mua lúc đông nhất và vội vàng bán tống bán tháo lúc vắng nhất. Người bình tĩnh đi ngược dòng thường được giá tốt hơn, nhưng đi ngược dòng thì cô đơn lắm.')]),
 vd=('Hai câu chuyện 12 tháng qua (giá TCBS)', [
  ('table',[('VIC','Tăng từ khoảng 62.000 (8/2025) lên đỉnh 256.100 (9/2026), nay 218.000'),('PNJ','Từ đỉnh khoảng 84.700 (1/2026) xuống còn 18.200'),('Điểm chung','Phần lớn người mua đông nhất ở gần vùng đỉnh, khi tin tốt nhiều nhất')]),
  ('p','Người mua VIC lúc đang được bàn tán nhiều nhất, tháng 9/2026, hiện lỗ khoảng 15%. Người mua PNJ đầu năm 2026 vì "cổ phiếu quốc dân, doanh nghiệp tốt" hiện mất gần 4/5. Cả hai đều mua vào lúc cảm giác an toàn nhất. Cảm giác an toàn trên thị trường thường là thứ đắt nhất.')]),
 ctv=('Bộ phanh cảm xúc 5 câu', [
  ('p','Trước khi bấm Mua hoặc Bán trong lúc thị trường đang nóng hoặc đang hoảng, trả lời 5 câu này. Nếu không trả lời được "Có" ít nhất 4 câu, đóng app, đi pha ấm trà.'),
  ('check',['Tôi quyết định dựa trên kế hoạch viết sẵn, không phải vì giá vừa chạy mạnh.','Tôi không mua chỉ vì sợ lỡ chuyến tàu.','Tôi không bán chỉ vì sợ mất thêm, khi lý do nắm giữ vẫn còn.','Tôi đã ngủ qua một đêm trước quyết định này.','Nếu sai, tôi chấp nhận được hậu quả mà không đổ lỗi cho ai.'],
   ['5/5: Bạn đang làm chủ cảm xúc. Hiếm lắm đấy.','Bạn đang ở ranh giới. Chờ thêm một phiên rồi quyết cũng chưa muộn.','Cảm xúc đang cầm chuột thay bạn. Đóng app, pha trà, quay lại sau.'])]),
 traps=[('"Ai cũng mua, chắc chắn đúng."','Khi ai cũng đã mua, còn ai mua tiếp để đẩy giá lên?'),
        ('"Giảm sâu thế này chắc là đáy rồi."','Đáy chỉ biết được khi đã qua. Giảm sâu có thể còn sâu hơn, như PNJ.'),
        ('"Lần này khác."','Câu nói đắt giá nhất trong lịch sử đầu tư. Lần nào cũng có người nói thế.')],
 nho='Bạn không bị ai theo dõi.<br>Bạn chỉ đang mua cùng lúc với tất cả mọi người.',
 quiz=[('Vì sao người mới thường mua gần đỉnh?',['Vì mua khi tin tốt và đám đông hưng phấn nhất','Vì có người theo dõi tài khoản','Vì phí giao dịch'],0,'Tâm lý đám đông và sợ lỡ cơ hội đẩy người ta vào lúc giá cao.'),
       ('"Sợ mất mát" khiến nhà đầu tư thường làm gì?',['Ôm hàng lỗ quá lâu, bán hàng lãi quá sớm','Cắt lỗ đúng kế hoạch','Không bao giờ giao dịch'],0,'Nỗi đau thua lỗ lớn hơn niềm vui lãi, dẫn đến quyết định ngược.'),
       ('Cách đơn giản để tránh quyết định theo cảm xúc là gì?',['Viết kế hoạch trước và ngủ qua một đêm','Theo dõi bảng điện cả ngày','Nghe nhóm Zalo'],0,'Kế hoạch có sẵn và khoảng nghỉ giúp cảm xúc dịu lại.')])

L[15] = dict(
 q='"Nhóm VIP thu phí 5 triệu một tháng, cam kết lãi 30%, có cả ảnh chụp tài khoản lãi khủng. Có nên vào không?"',
 tra=('Gà thì tưởng được cho ăn, hóa ra là được vỗ béo', [
  ('p','Mô hình lùa gà cổ điển gồm bốn bước. <b>Mồi</b>: phát miễn phí vài mã trúng, khoe ảnh tài khoản lãi to. <b>Nuôi</b>: kéo vào nhóm kín, thu phí "VIP", tạo cảm giác được ưu ái. <b>Lùa</b>: đồng loạt hô một mã, thường là mã nhỏ, ít thanh khoản. <b>Xả</b>: người đứng sau bán ra đúng lúc cả đàn gà ùa vào mua. Gà úp bô, chủ trại thu tiền.'),
  ('p','Ủy ban Chứng khoán Nhà nước đã nhiều lần cảnh báo: cá nhân, tổ chức không có giấy phép mà khuyến nghị mua bán cổ phiếu là vi phạm Luật Chứng khoán, và đã có trường hợp bị xử phạt. Người được cấp phép tư vấn cũng không được cam kết lợi nhuận. Ai cam kết lãi 30% một tháng thì hoặc không hiểu thị trường, hoặc hiểu quá rõ túi tiền của bạn.'),
  ('p','Ảnh chụp tài khoản lãi khủng là thứ dễ làm giả nhất trên đời, chỉ cần vài phút chỉnh sửa. Còn ảnh tài khoản lỗ thì chẳng ai đăng.')]),
 vd=('Soi thử vài chủ đề trên diễn đàn công khai (F247, tháng 10/2026)', [
  ('table',[('"ASP – siêu penny hồi sinh..."','Hô giá trị gấp nhiều lần, số liệu không dẫn nguồn, kéo dài 2 tháng, hơn 51.000 lượt xem'),('"Cấp báo cực kỳ nguy hiểm..."','Kêu bán gấp GVR, BSR, không số liệu; trái ngược với dự báo của một công ty chứng khoán rằng BSR, GVR vượt kế hoạch'),('"QNS lãi quý 3 tăng 19%"','Không dẫn công bố của doanh nghiệp, cuối bài kèm quảng cáo môi giới và số điện thoại')]),
  ('p','Không phải bài nào trên diễn đàn cũng là lùa gà. Nhưng cả ba bài trên đều có chung dấu hiệu: <b>số liệu không nguồn, giọng điệu thúc giục, và một lời mời đi kèm</b>. Radar tin nóng của Top Broker gắn nhãn "Chưa xác minh" cho những tin như vậy.')]),
 ctv=('Máy dò lùa gà: 6 dấu hiệu', [
  ('p','Đánh dấu các dấu hiệu bạn thấy ở nhóm hoặc bài viết đang đọc. Càng nhiều dấu, càng nên chạy.'),
  ('check',['Cam kết lợi nhuận cụ thể, kiểu "lãi 30%/tháng", "x2 tài khoản".','Thu phí để vào nhóm kín, nhóm VIP.','Hô mã nhỏ, ít người giao dịch, giá thấp.','Thúc giục: "mua ngay kẻo lỡ", "phiên mai bay".','Khoe ảnh tài khoản lãi, không bao giờ khoe lỗ.','Xin mật khẩu, mã OTP hoặc đề nghị "giao dịch hộ".'],
   ['6 dấu hiệu: đây là trại gà. Rời nhóm ngay, đừng ngoái lại.','Có vài dấu hiệu đáng ngờ. Đừng xuống tiền theo bất cứ lời hô nào ở đây.','Chưa thấy dấu hiệu rõ. Vẫn nên kiểm tra mọi con số với nguồn chính thống.'])]),
 traps=[('"Nhóm này lần trước hô trúng thật."','Hô 10 mã, trúng 3 mã thì chỉ khoe 3 mã. Bạn chỉ thấy phần được cho thấy.'),
        ('"Đóng phí rồi thì phải theo cho hết."','Tiền phí đã mất, đừng mất thêm tiền vốn chỉ vì tiếc tiền phí.'),
        ('"Họ là chuyên gia, có hẳn chứng chỉ."','Hỏi tên công ty chứng khoán họ làm việc và kiểm tra trên trang của Ủy ban Chứng khoán. Chuyên gia thật không cam kết lãi.')],
 nho='Phím hàng miễn phí là thứ đắt nhất trên đời.<br>Nhóm VIP thu phí còn đắt hơn.',
 quiz=[('Dấu hiệu nào cho thấy rõ nhất một nhóm đang lùa gà?',['Cam kết lợi nhuận cụ thể và thúc giục mua ngay','Chia sẻ báo cáo tài chính có nguồn','Khuyên đa dạng hóa'],0,'Không ai được phép cam kết lợi nhuận trên thị trường chứng khoán.'),
       ('Vì sao nhóm lùa gà thích hô cổ phiếu nhỏ, ít thanh khoản?',['Vì dễ kéo giá và dễ xả hàng cho người mua sau','Vì cổ phiếu nhỏ an toàn hơn','Vì phí giao dịch thấp hơn'],0,'Ít người giao dịch thì vài người có thể chi phối giá.'),
       ('Khuyến nghị mua bán cổ phiếu khi không có giấy phép là gì?',['Hành vi vi phạm Luật Chứng khoán','Hoạt động hợp pháp nếu miễn phí','Được phép trên mạng xã hội'],0,'Ủy ban Chứng khoán Nhà nước đã cảnh báo và xử phạt các trường hợp như vậy.')])
