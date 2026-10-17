# -*- coding: utf-8 -*-
# "Góc nhìn nhà phân tích" cho chế độ Chuyên gia. Số liệu TCBS chốt 15/10/2026; các con số ước tính được ghi rõ giả định.
# Định dạng: thesis, implied (+ implied_ev), drivers [(tên, giải thích, độ nhạy)], scen {head, rows, note},
#            signs [(g|r, tín hiệu, ý nghĩa)], blind (điều thị trường có thể đang bỏ sót)
E = {}

E['HPG'] = dict(
 thesis='HPG đang ở pha giữa của chu kỳ phục hồi biên lợi nhuận, cùng lúc Dung Quất 2 chuyển từ "tài sản xây dựng" sang "tài sản vận hành". Câu hỏi đúng không phải là lãi có tăng hay không, mà là <b>lãi lõi bền vững bằng bao nhiêu</b> khi Dung Quất 2 chạy đủ công suất, lãi vay đã tính hết vào chi phí và giá thép trở về mức bình thường. Mọi con số "rẻ" hay "đắt" đều phải quy về câu hỏi này.',
 implied='Ở P/B 1,2×, nếu giả định nhà đầu tư đòi lợi suất 13%/năm và lợi nhuận dài hạn tăng 5%/năm, thị trường đang ngầm định HPG duy trì ROE khoảng <b>14,6%</b>. ROE lõi 4 quý gần nhất (đã loại khoản bất thường quý 1) chỉ khoảng 13,1%. Nói cách khác, ở giá này HPG <b>không rẻ như P/E 7,5 gợi ý</b>: nó được định giá khá sát với năng lực sinh lời lõi, và chỉ thực sự rẻ nếu ROE lõi vượt 15% một cách bền vững.',
 implied_ev='ROE ngầm định = P/B × (r − g) + g = 1,2 × (13% − 5%) + 5% ≈ 14,6%. ROE lõi = (23.217 − ~4.600) / 141.516 ≈ 13,1%.',
 drivers=[
  ('Biên gộp (giá HRC trừ giá quặng, than)','Biến số lớn nhất. Biên gộp 2021 đạt 27,5%, năm 2023 chỉ 10,9%.','Mỗi 1 điểm % biên gộp trên doanh thu 4 quý ~190.600 tỷ ≈ 1.900 tỷ lãi gộp ≈ 1.500 tỷ LNST ≈ 8% lãi lõi.'),
  ('Sản lượng Dung Quất 2','Vòng quay tài sản đã giảm từ 0,8 xuống 0,6 vì nhà máy mới chưa tạo đủ doanh thu.','Đưa vòng quay về 0,7–0,8 với biên ròng giữ nguyên là cách duy nhất để ROE vượt 18% mà không cần giá thép tăng.'),
  ('Lãi suất và vốn lưu động','Lãi vay quý 2 là 1.520 tỷ, khoảng 6.000 tỷ/năm, sau khi thôi vốn hóa lãi vay Dung Quất 2.','Mỗi 1 điểm % lãi suất trên 98.530 tỷ nợ vay ≈ 985 tỷ chi phí/năm ≈ 5% lãi lõi. Tồn kho 55.600 tỷ: giá thép giảm 10% có thể buộc trích dự phòng vài nghìn tỷ.'),
  ('Pha loãng cổ phiếu','Cổ tức cổ phiếu 10–35%/năm làm số cổ phiếu tăng đều.','Đợt 10% năm 2026 kéo EPS giảm tương ứng ~9%; tăng trưởng lợi nhuận phải vượt tốc độ pha loãng thì cổ đông mới thực sự có lợi.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST lõi','EPS','P/E ở 20.750','ROE'],
  rows=[['Tiêu cực','Biên gộp về 13% như Q4/25','~14.000 tỷ','~1.660','~12,5×','~9,9%'],
        ['Cơ sở','Biên gộp 16–17%, DQ2 tăng dần','~19.000 tỷ','~2.250','~9,2×','~13,4%'],
        ['Tích cực','Giữ biên 19% của Q2/26 cả năm','~25.000 tỷ','~2.960','~7,0×','~17,7%']],
  note='EPS tính trên 8.443 triệu cổ phiếu, chưa tính đợt cổ tức cổ phiếu tiếp theo. Đây là phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Biên gộp quý 3/2026 từ 18% trở lên','Xác nhận quý 2 không phải đỉnh mùa vụ; kịch bản tích cực có cơ sở.'),
        ('r','Biên gộp quý 3 dưới 15%','Lãi quý 2 là đỉnh; P/E thực tế quay về vùng 10–12 lần.'),
        ('g','Tồn kho giảm dưới 50.000 tỷ, tiền từ kinh doanh lớn hơn LNST','Lãi đang chuyển thành tiền thật, áp lực vay giảm.'),
        ('r','Vay ngắn hạn tiếp tục tăng hơn 10%/quý','Vốn lưu động phình to, rủi ro tái cấp vốn khi lãi suất tăng.'),
        ('g','Báo cáo kết quả mua 50 triệu cp của con trai Chủ tịch sau 5/11','Mua đủ là tín hiệu người trong cuộc đánh giá giá hiện tại hấp dẫn.')],
 blind='Thị trường đang chú ý quá nhiều vào khoản bất thường quý 1 mà bỏ qua chi tiết quan trọng hơn: từ quý 2, lãi vay Dung Quất 2 đã tính thẳng vào chi phí (1.520 tỷ, gấp 3,5 lần cùng kỳ). Nghĩa là con số 6.371 tỷ của quý 2 là lãi đã "sạch" chi phí vốn của nhà máy mới. Nếu quý 2 là nhịp chạy ổn định, lãi năm hóa khoảng 25.000 tỷ và P/E thực khoảng 7 lần. Điểm yếu của lập luận này: quý 2 thường là mùa cao điểm xây dựng, nên cần thêm quý 3 để kiểm chứng.')

E['VPB'] = dict(
 thesis='VPB là một cỗ máy tạo lợi nhuận trước dự phòng rất hiệu quả (chi phí chỉ 20% thu nhập) đang chạy ở tốc độ tín dụng 40%/năm. Lợi nhuận báo cáo thực chất là <b>phần dư sau khi ban lãnh đạo quyết định trích bao nhiêu dự phòng</b>. Vì vậy, câu hỏi định giá không phải "lãi quý tới bao nhiêu" mà là "chi phí rủi ro tín dụng bình thường của danh mục tăng nhanh này là bao nhiêu khi nợ xấu lộ ra sau 12–24 tháng".',
 implied='Ở P/B 1,3×, với lợi suất đòi hỏi 14% và tăng trưởng dài hạn 6%, thị trường ngầm định ROE bền vững khoảng <b>16,4%</b>, thấp hơn ROE hiện tại 18,3% khoảng 2 điểm %. Đó chính là "phí bảo hiểm" thị trường đang trừ cho rủi ro chất lượng tài sản. Nếu ROE giữ được trên 18% qua một chu kỳ tín dụng, khoản chiết khấu này là cơ hội; nếu nợ xấu buộc chi phí tín dụng tăng 30%, ROE sẽ về đúng vùng thị trường đang định giá.',
 implied_ev='ROE ngầm định = 1,3 × (14% − 6%) + 6% ≈ 16,4%.',
 drivers=[
  ('Chi phí tín dụng','Dự phòng 7.910 tỷ/quý, gần bằng lợi nhuận trước thuế.','Mỗi 10% thay đổi dự phòng ≈ 3.160 tỷ LNTT/năm ≈ 2.500 tỷ LNST ≈ 8% lãi năm.'),
  ('Biên lãi NIM','NIM giảm từ 6,0% xuống 5,2% trong 6 quý do tăng trưởng bằng vốn đắt hơn (LDR 158%).','Mỗi 0,1 điểm NIM ≈ 1.400 tỷ thu nhập lãi/năm (ước tính trên tài sản sinh lãi ~1,38 triệu tỷ).'),
  ('Độ bao phủ nợ xấu','LLR 56%: gần một nửa nợ xấu chưa có dự phòng đỡ.','Nâng LLR lên 80% cần trích thêm khoảng 24% số dư nợ xấu, ước tính tương đương khoảng một quý trích lập nếu dư nợ quanh 1 triệu tỷ.'),
  ('Vốn để tăng trưởng','Tăng tín dụng 40% tiêu hao vốn rất nhanh.','Phát hành trái phiếu quốc tế và cổ phiếu là tín hiệu ngân hàng cần vốn; pha loãng hoặc chi phí vốn cao hơn là cái giá của tăng trưởng.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST','EPS','P/E ở 24.450'],
  rows=[['Tiêu cực','Chi phí tín dụng +30%, NIM về 4,9%','~22.000 tỷ','~2.200','~11,1×'],
        ['Cơ sở','Giữ nhịp quý 2/2026','~32.000 tỷ','~3.200','~7,6×'],
        ['Tích cực','Nợ xấu ổn định, dự phòng giảm 20%','~38.000 tỷ','~3.800','~6,4×']],
  note='EPS tính trên khoảng 10 tỷ cổ phiếu (vốn hóa 244.500 tỷ / giá 24.450). Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('r','Nợ cần chú ý (nhóm 2) tăng trong BCTC quý 3','Nợ xấu tương lai đang hình thành; chi phí tín dụng sẽ tăng sau 2–3 quý.'),
        ('g','LLR tăng lên trên 65% mà LNST không giảm','Ngân hàng đủ sức vừa dọn nợ vừa giữ lãi: luận điểm "cỗ máy PPOP" được xác nhận.'),
        ('r','NIM tiếp tục giảm dưới 5%','Tăng trưởng đang mua bằng biên lãi; ROE khó giữ 18%.'),
        ('g','Tăng trưởng tín dụng chậm lại về 20–25% trong khi ROE giữ','Chuyển từ chạy nhanh sang chạy chắc, rủi ro trễ giảm.')],
 blind='Thị trường lo ngại tốc độ cho vay, nhưng ít người tính đệm của VPB: lợi nhuận trước dự phòng mỗi quý khoảng 18.900 tỷ, gấp 2,4 lần số dự phòng hiện tại. Rủi ro tín dụng phải tăng hơn gấp đôi thì ngân hàng mới về hòa vốn. Ngược lại, đây cũng là lý do lợi nhuận VPB "co giãn được": ban lãnh đạo có nhiều dư địa để làm mượt lãi báo cáo, nên nhà phân tích nên theo dõi PPOP và nợ nhóm 2 hơn là LNST.')

E['VIC'] = dict(
 thesis='VIC không còn được định giá như một doanh nghiệp bất động sản có lợi nhuận, mà như một <b>quyền chọn trên cả hệ sinh thái</b>: VinFast, năng lượng, hạ tầng, các mảng mới. Giá phản ánh kỳ vọng nhiều năm tới. Với cổ phiếu dạng này, rủi ro lớn nhất không phải lợi nhuận một quý mà là thời điểm thị trường chuyển từ "trả tiền cho câu chuyện" sang "đòi bằng chứng tiền mặt".',
 implied='Để P/E về mức 15 lần của một doanh nghiệp tăng trưởng tốt, lãi cổ đông công ty mẹ phải đạt khoảng <b>112.800 tỷ/năm</b>, gấp hơn 5 lần mức 4 quý gần nhất. Nhìn theo P/B 9,9×, công thức định giá theo ROE đòi hỏi ROE khoảng 86%, một mức phi thực tế. Kết luận: giá hiện tại không dựa trên lợi nhuận hay vốn sổ sách, mà dựa trên kỳ vọng định giá lại tài sản (đất, dự án, các công ty con) cao hơn nhiều so với sổ sách.',
 implied_ev='Lãi cần cho P/E 15× = 1.692.157 / 15 ≈ 112.800 tỷ. LNST CĐ mẹ 4 quý ≈ 2.744 × 7.762 triệu cp ≈ 21.300 tỷ. ROE ngầm định ở P/B 9,9× (r 15%, g 7%) ≈ 86%.',
 drivers=[
  ('Lãi suất trên 355.810 tỷ nợ vay','Lãi vay quý 2 đã vượt lợi nhuận hoạt động.','Mỗi 1 điểm % lãi suất ≈ 3.560 tỷ chi phí/năm ≈ 17% lãi cổ đông mẹ 4 quý.'),
  ('Nhịp bàn giao bất động sản','Doanh thu nhảy từ 39.135 tỷ (Q3/25) lên 162.227 tỷ (Q4/25) theo lịch bàn giao.','Lợi nhuận theo quý gần như không dự báo được; nên nhìn doanh số bán hàng chưa ghi nhận (người mua trả trước).'),
  ('Lỗ của các mảng đầu tư mới','Lợi nhuận hoạt động bị kéo xuống bởi các mảng chưa có lãi.','Mỗi quý mảng mới cắt lỗ được thêm vài nghìn tỷ có tác động lớn hơn mọi biến động doanh thu bất động sản.'),
  ('Thu nhập tài chính và bất thường','Khoảng 23.700 tỷ lợi nhuận quý 2 đến từ ngoài kinh doanh chính.','Nếu nguồn này không lặp lại, quý 2 thực chất lỗ; P/E 79× sẽ trở thành "không xác định".')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','Lãi CĐ mẹ','P/E ở 218.000'],
  rows=[['Tiêu cực','Không còn lãi tài chính, bất thường','Lỗ hoặc gần 0','Không xác định'],
        ['Cơ sở','Giữ mức 4 quý gần nhất','~21.300 tỷ','~79×'],
        ['Tích cực','Bàn giao lớn và tiếp tục có lãi tài chính','~50.000 tỷ','~34×']],
  note='Ngay cả kịch bản tích cực, P/E vẫn trên 30 lần. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Lợi nhuận hoạt động lớn hơn lãi vay trở lại','Kinh doanh chính tự trả được nợ, giảm phụ thuộc vào thu nhập bất thường.'),
        ('r','Tiền từ kinh doanh âm hai quý liên tiếp','Câu chuyện đang được nuôi bằng vay nợ và huy động mới.'),
        ('r','Thêm tổ chức lớn bán ra sau SSI-SCA','Dòng tiền tổ chức rời đi, giá phụ thuộc nhiều hơn vào cá nhân.'),
        ('g','Một mảng mới công bố có lãi hoặc được định giá qua giao dịch thật','Kỳ vọng được "quy ra tiền", phần chênh giữa giá và sổ sách có cơ sở hơn.')],
 blind='Định giá VIC bằng P/E là dùng sai công cụ, nhưng điều đó không có nghĩa là giá hợp lý. Công cụ đúng là cộng giá trị từng phần (SOTP), và mỗi phần cần một giao dịch thật để kiểm chứng. Khi chưa có các mốc đó, người mua đang trả tiền cho niềm tin. Đòn bẩy 5,8 lần nợ trên vốn chủ khuếch đại cả hai chiều: chỉ một thay đổi nhỏ trong giả định giá trị tài sản cũng làm giá trị cổ đông thay đổi rất lớn.')

E['FPT'] = dict(
 thesis='FPT là doanh nghiệp chất lượng cao (ROE 27%, tiền ròng, cổ tức đều) đang bị định giá như một doanh nghiệp hết tăng trưởng. Toàn bộ luận điểm xoay quanh một câu hỏi: doanh thu giảm 17–22% là do <b>thay đổi phạm vi hợp nhất</b> (vấn đề kế toán, so sánh sai rổ) hay do <b>mất đơn hàng</b> (vấn đề kinh doanh). Hai câu trả lời dẫn tới hai mức định giá khác hẳn nhau.',
 implied='P/E 10,9× tương đương lợi suất lợi nhuận 9,2%. Nếu nhà đầu tư đòi lợi suất 12%/năm, thị trường đang ngầm định lợi nhuận FPT chỉ tăng khoảng <b>2,8%/năm</b> trong dài hạn. Đây là mức tăng của một doanh nghiệp tiện ích, trong khi lãi cổ đông FPT vẫn tăng 14% trong hai quý gần nhất. Sự chênh lệch này chỉ hợp lý nếu thị trường tin rằng tăng trưởng lợi nhuận hiện tại là "ảo" do hợp nhất và thu nhập lãi tiền gửi.',
 implied_ev='E/P = 1 / 10,9 ≈ 9,2%. g ngầm định ≈ r − E/P = 12% − 9,2% ≈ 2,8% (giả định chia cổ tức ổn định).',
 drivers=[
  ('Tăng trưởng doanh thu cùng rổ','Doanh thu báo cáo không so sánh được với năm trước nếu phạm vi hợp nhất thay đổi.','Cần thuyết minh BCTC. Nếu doanh thu cùng rổ vẫn tăng trên 10%, mức định giá hiện tại thấp bất thường.'),
  ('Biên gộp','Giảm từ 37,9% (Q3/25) xuống 31,0% (Q2/26).','Mỗi 1 điểm % biên gộp trên doanh thu 4 quý ~63.700 tỷ ≈ 640 tỷ ≈ 6% lãi năm.'),
  ('Thu nhập từ tiền gửi','Gần 29.000 tỷ tiền và đầu tư ngắn hạn đang đỡ lợi nhuận.','Mỗi 1 điểm % lãi suất tiền gửi ≈ 290 tỷ/năm. Lãi suất giảm thì phần đỡ này mỏng đi.'),
  ('Tỷ giá và thị trường xuất khẩu','Mảng phần mềm xuất khẩu thu bằng ngoại tệ.','Đồng yên, USD biến động ảnh hưởng trực tiếp doanh thu quy đổi và biên lợi nhuận.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','Tăng EPS','EPS','P/E ở 58.000'],
  rows=[['Tiêu cực','Biên gộp tiếp tục giảm, mất đơn hàng','−10%','~4.770','~12,2×'],
        ['Cơ sở','Ổn định, tăng nhẹ','+5%','~5.570','~10,4×'],
        ['Tích cực','Doanh thu cùng rổ tăng trở lại','+15%','~6.100','~9,5×']],
  note='EPS gốc 5.303 (4 quý). Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Thuyết minh cho thấy doanh thu giảm do thay đổi phạm vi hợp nhất','Lợi nhuận không bị "ảo"; mức P/E 10,9 thấp bất thường so với chất lượng doanh nghiệp.'),
        ('r','Giá trị hợp đồng ký mới giảm hai quý liên tiếp','Doanh thu tương lai co lại; thị trường định giá thấp có cơ sở.'),
        ('g','Biên gộp quý 3 hồi lên trên 33%','Áp lực giá bán, chi phí nhân sự đã qua đỉnh.'),
        ('r','Tiền từ kinh doanh tiếp tục âm','Khách trả tiền chậm hơn: dấu hiệu cạnh tranh hoặc khách hàng khó khăn.')],
 blind='Khi một doanh nghiệp tốt rơi về P/E thấp nhất nhiều năm mà không có lời giải thích rõ ràng, giá thường giảm lâu hơn và sâu hơn mức hợp lý: quỹ tổ chức không mua thứ họ chưa hiểu. Rủi ro lớn nhất với FPT lúc này không phải là doanh nghiệp xấu đi, mà là <b>sự mập mờ trong số liệu</b>. Ngày công ty giải thích được khoảng chênh giữa doanh thu và lợi nhuận, đó mới là ngày định giá có thể thay đổi.')

E['PNJ'] = dict(
 thesis='PNJ đã chuyển từ câu chuyện tăng trưởng bán lẻ sang câu chuyện <b>bảng cân đối còn lại bao nhiêu cho cổ đông cũ</b>. Hai biến số quyết định tất cả: tỷ lệ khách thực sự mang kim cương đã mua đến bán lại (công ty giả định 80%), và mức pha loãng từ đợt phát hành 550 triệu cổ phiếu giá 10.000 đồng, thấp hơn giá trị sổ sách hiện tại.',
 implied='Tính thô theo kế hoạch: vốn chủ cuối quý 2 khoảng 13.440 tỷ, trừ lỗ kế hoạch 6.270 tỷ còn 7.170 tỷ, cộng 5.500 tỷ huy động thành 12.670 tỷ trên 1.061,7 triệu cổ phiếu, tức khoảng <b>11.900 đồng/cp</b>. Ở giá 18.200, P/B sau phát hành khoảng 1,5 lần. Với vốn hóa sau phát hành khoảng 19.300 tỷ, nếu lợi nhuận trở lại mức năm 2025 (khoảng 2.830 tỷ), P/E vào khoảng 6,8 lần: thị trường đang định giá một phần kịch bản phục hồi.',
 implied_ev='VCSH Q2 ≈ 26.263 × 511,7 triệu ≈ 13.440 tỷ. Sau lỗ và phát hành: 13.440 − 6.270 + 5.500 = 12.670 tỷ / 1.061,7 triệu cp ≈ 11.930đ. Khác với ước tính 12.619đ của VCSC do giả định khác và do VCSC chưa tính phát hành.',
 drivers=[
  ('Tỷ lệ khách bán lại kim cương','Dự phòng 7.071 tỷ dựa trên giả định 80% doanh thu kim cương trong quá khứ sẽ quay lại.','Mỗi 10 điểm % tỷ lệ thực tế thấp hơn giả định ≈ 880 tỷ dự phòng trước thuế có thể hoàn nhập.'),
  ('Giá và đối tượng phát hành','550 triệu cp giá 10.000đ, thấp hơn BVPS hiện tại 26.263đ.','Phát hành dưới giá sổ sách chuyển giá trị từ cổ đông cũ sang cổ đông mới. Nếu chỉ bán được một phần, thiếu vốn cho chính sách thu đổi.'),
  ('Dòng tiền thanh toán mua lại','Kim cương được thanh toán mua lại trong 120 ngày.','Đây là áp lực tiền mặt thật, không chỉ là con số kế toán: công ty cần vốn lưu động ngay trong 2–3 quý tới.'),
  ('Niềm tin thương hiệu','Quý 2 đã bán lỗ gộp lần đầu.','Doanh số trang sức quý 3–4 cho biết khách còn quay lại hay không; đây là giá trị lâu dài duy nhất còn lại.')],
 scen=dict(head=['Kịch bản','Giả định','Lỗ năm 2026','BVPS sau phát hành','P/B ở 18.200'],
  rows=[['Tiêu cực','Ghi nhận 100% dự phòng, lỗ thêm 1.000 tỷ','~7.270 tỷ','~10.990đ','~1,66×'],
        ['Cơ sở','Đúng kế hoạch công ty','~6.270 tỷ','~11.930đ','~1,53×'],
        ['Tích cực','Chỉ 50% khách bán lại','~3.620 tỷ','~14.430đ','~1,26×']],
  note='Giả định phát hành đủ 550 triệu cp giá 10.000đ. Tính thô của Top Broker trên số liệu công bố; không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Nhà đầu tư chiến lược có tên tuổi mua phần lớn 550 triệu cp','Có người trả tiền thật để đứng cùng thuyền, giảm rủi ro thiếu vốn.'),
        ('r','Đợt phát hành không bán hết','Thiếu vốn cho thu đổi, có thể phải bán tài sản hoặc vay đắt.'),
        ('g','Lượng hàng mua lại thực tế quý 3 thấp hơn nhiều so với giả định 80%','Khả năng hoàn nhập dự phòng trong các năm sau.'),
        ('r','Doanh số trang sức quý 3 giảm mạnh so với cùng kỳ','Thương hiệu bị tổn hại thật, không chỉ là cú sốc kế toán.')],
 blind='Nếu giả định 80% là quá thận trọng, phần dự phòng thừa sẽ được hoàn nhập trong các năm sau và tạo ra "lợi nhuận" kế toán chiều ngược lại. Thị trường thường phản ứng mạnh với lỗ một lần, rồi bỏ qua hoàn nhập sau đó. Ngược lại, điều nhiều người bỏ qua là phát hành ở giá 10.000đ, thấp hơn nhiều giá trị sổ sách, đã khóa sẵn một phần thiệt hại cho cổ đông cũ, bất kể kịch bản kinh doanh nào xảy ra.')

E['VIX'] = dict(
 thesis='VIX về bản chất là một <b>quỹ đầu tư đóng có đòn bẩy nhẹ</b> khoác áo công ty chứng khoán. Cách định giá đúng là theo giá trị tài sản ròng (NAV) của danh mục tự doanh, trừ đi mức chiết khấu thị trường áp cho quỹ đóng. P/E gần như vô nghĩa vì lợi nhuận chính là chênh lệch giá trị danh mục.',
 implied='P/B 0,92× nghĩa là thị trường trả 92% giá trị sổ sách, tức chiết khấu khoảng 8%. Vì phần lớn danh mục được ghi theo giá thị trường (FVTPL), giá trị sổ sách xấp xỉ NAV. Quỹ đóng thường bị chiết khấu 10–30% khi thị trường đi xuống. Mức 8% cho thấy thị trường <b>chưa chiết khấu nhiều</b> cho rủi ro tập trung danh mục và rủi ro quản trị.',
 implied_ev='P/B = 11.750 / 12.708 ≈ 0,92×. Tự doanh 36.066 tỷ ≈ 110% VCSH 32.695 tỷ.',
 drivers=[
  ('Biến động giá danh mục','Tự doanh lớn hơn cả vốn chủ.','Mỗi 10% biến động danh mục ≈ 3.600 tỷ ≈ 11% VCSH ≈ 1.120đ BVPS (sau thuế 20%).'),
  ('Mức độ tập trung','Chưa có số liệu chi tiết từ TCBS về các mã lớn nhất trong danh mục.','Danh mục tập trung vào vài mã thanh khoản thấp thì NAV sổ sách khó bán được đúng giá.'),
  ('Pha loãng','Vốn điều lệ tăng 60% chỉ trong quý 2.','Lợi nhuận phải tăng nhanh hơn số cổ phiếu thì EPS mới không bị mỏng đi.'),
  ('Thanh khoản thị trường chung','Mảng môi giới gần như không đáng kể (80 nhân viên).','VIX gần như không có "đệm" doanh thu ổn định khi thị trường đi ngang.')],
 scen=dict(head=['Kịch bản danh mục','Thay đổi BVPS','BVPS ước tính','P/B ở 11.750'],
  rows=[['Danh mục −15%','~−1.680đ','~11.030đ','~1,07×'],
        ['Đi ngang','0','~12.710đ','~0,92×'],
        ['Danh mục +15%','~+1.680đ','~14.390đ','~0,82×']],
  note='Giả định thuế 20% trên phần lãi/lỗ đánh giá lại và 2.573 triệu cổ phiếu. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('r','Thuyết minh cho thấy danh mục tập trung vào ít mã thanh khoản thấp','NAV sổ sách kém tin cậy; chiết khấu nên lớn hơn mức 8% hiện tại.'),
        ('g','VN-Index lấy lại xu hướng tăng với thanh khoản cao','Lợi nhuận VIX phục hồi nhanh, độ nhạy cao làm lợi thế.'),
        ('r','Tiếp tục tăng vốn mạnh trong khi lợi nhuận chưa hồi','Pha loãng không đi kèm sinh lời.'),
        ('g','Công ty công bố mua lại cổ phiếu khi P/B dưới 1','Ban lãnh đạo xác nhận NAV đáng tin.')],
 blind='Nhiều người coi P/B dưới 1 là "biên an toàn". Với một quỹ đóng, điều đó chỉ đúng nếu NAV có thể quy ra tiền ở giá sổ sách. Nếu danh mục tập trung vào các mã ít thanh khoản, chiết khấu 8% không phải là biên an toàn mà là định giá chưa đủ thận trọng. Điểm mấu chốt cần làm rõ là danh sách và tỷ trọng các mã trong danh mục tự doanh.')

E['SHB'] = dict(
 thesis='SHB trông như cổ phiếu "giá trị sâu" (P/E 4,6, P/B 0,74), nhưng chất lượng lợi nhuận đang kém đi. Thu nhập lãi từ cho vay, nguồn ổn định nhất, giảm mạnh; lợi nhuận được đỡ bởi phí dịch vụ tăng đột biến và một quý có khoản "lãi khác" lớn bất thường. Câu hỏi đúng là: <b>lợi nhuận lõi lặp lại được</b> của SHB thực sự bằng bao nhiêu.',
 implied='Ở P/B 0,74×, với lợi suất đòi hỏi 15% và tăng trưởng dài hạn 5%, thị trường ngầm định ROE bền vững khoảng <b>12,4%</b>, thấp hơn ROE báo cáo 17,5% đến 5 điểm %. Thị trường đang chiết khấu khoảng 30% lợi nhuận hiện tại. Nếu loại khoản "lãi khác" 4.200 tỷ ở quý 4/2025 (sau thuế khoảng 3.360 tỷ), LNST 4 quý còn khoảng 8.800 tỷ, ROE khoảng 11,7%: <b>thị trường đang định giá gần đúng lợi nhuận lõi</b>, không quá rẻ.',
 implied_ev='ROE ngầm định = 0,74 × (15% − 5%) + 5% ≈ 12,4%. LNST lõi ≈ 12.146 − 4.200 × 0,8 ≈ 8.790 tỷ → P/E lõi ≈ 55.575 / 8.790 ≈ 6,3×.',
 drivers=[
  ('Thu nhập lãi thuần (NII)','NII 4 quý chỉ 17.769 tỷ, NIM giảm từ 3,9% xuống 2,2%.','Mỗi 10% NII ≈ 1.780 tỷ ≈ 15% LNST 4 quý.'),
  ('Phí dịch vụ quý 2','2.535 tỷ, gấp 3,7 lần cùng kỳ.','Nếu về mức bình thường ~700 tỷ/quý, lợi nhuận mất khoảng 1.800 tỷ/quý trước thuế.'),
  ('Dự phòng','Quý 2 trích 3.825 tỷ, gấp 2,5 lần quý 1.','Đã kéo LLR lên 77%: nếu đây là đợt dọn nợ một lần, các quý sau nhẹ gánh hơn.'),
  ('Pha loãng','Gần 460 triệu cổ phiếu chờ giao dịch, khoảng 8,6% số lưu hành.','EPS giảm tương ứng; áp lực bán khi cổ phiếu mới về tài khoản.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST','EPS*','P/E ở 10.400'],
  rows=[['Tiêu cực','Phí về bình thường, NII không hồi','~9.000 tỷ','~1.550','~6,7×'],
        ['Cơ sở','NII hồi nhẹ, dự phòng giảm','~11.500 tỷ','~1.980','~5,3×'],
        ['Tích cực','NIM hồi về 3%','~14.500 tỷ','~2.500','~4,2×']],
  note='*EPS tính trên ~5.804 triệu cp (đã cộng 460 triệu cp chờ giao dịch). Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','NIM quý 3 hồi lên trên 2,7%','Thu nhập lõi đang phục hồi; mức chiết khấu hiện tại quá lớn.'),
        ('r','Phí dịch vụ quý 3 giảm mạnh về mức cũ','Quý 2 là đỉnh một lần; lợi nhuận lõi thấp hơn báo cáo.'),
        ('r','Nợ nhóm 2 tăng','Đợt dọn nợ quý 2 chưa phải là cuối cùng.'),
        ('g','Đối tác nước ngoài (SMBC) tham gia sâu hơn vào vốn','Chi phí vốn giảm, quản trị rủi ro tốt hơn.')],
 blind='P/E 4,6 thu hút người mua theo chỉ số rẻ, nhưng con số này chứa quý 4/2025 bất thường. Phép tính lại cho thấy P/E lõi khoảng 6,3 lần, không còn là "rẻ hiếm có". Mặt khác, ít người để ý rằng chi phí vận hành của SHB rất thấp (CIR 15%): nếu thu nhập lãi phục hồi, gần như toàn bộ phần tăng thêm sẽ đi thẳng vào lợi nhuận, nên lợi nhuận rất nhạy với NIM theo cả hai chiều.')

E['MSB'] = dict(
 thesis='Toàn bộ mức tăng giá của MSB trong năm là <b>mở rộng hệ số định giá</b> (P/B 0,8 lên 1,2) chứ không phải tăng lợi nhuận: EPS gần như đứng yên. Mở rộng hệ số mà không có lợi nhuận đi kèm là dạng tăng giá mong manh nhất. Nó chỉ bền nếu thị trường đang đi trước một thay đổi thật: đối tác chiến lược, tăng vốn giá cao, hoặc mảng bảo hiểm có giá trị.',
 implied='Ở P/B 1,21×, với lợi suất đòi hỏi 14% và tăng trưởng 5%, thị trường ngầm định ROE bền vững khoảng <b>15,9%</b>, cao hơn ROE hiện tại 13,9% khoảng 2 điểm %. Thị trường đang trả trước cho một sự cải thiện chưa xuất hiện trong số liệu. Phiên 22–23/9 tăng mạnh với khối lượng gấp nhiều lần bình thường, trong khi danh sách tin của TCBS chưa ghi nhận công bố thông tin cơ bản tương xứng.',
 implied_ev='ROE ngầm định = 1,21 × (14% − 5%) + 5% ≈ 15,9%. EPS 4 quý: 1.569 (Q1/26) → 1.573 (Q2/26).',
 drivers=[
  ('Chi phí vận hành','CIR 39%, cao hơn nhiều ngân hàng cùng quy mô.','Mỗi 5 điểm % CIR giảm ≈ 715 tỷ LNTT/năm ≈ 10% LNST.'),
  ('Độ bao phủ nợ xấu','LLR 51,5% trên nợ xấu khoảng 5.700 tỷ (2,5% dư nợ 227.417 tỷ).','Nâng LLR lên 70% cần trích thêm khoảng 1.050 tỷ, gần bằng 2 quý dự phòng hiện tại.'),
  ('Tăng vốn lần 2/2026','Chưa rõ giá và đối tượng.','Phát hành giá cao cho đối tác là chất xúc tác; phát hành giá thấp cho cổ đông hiện hữu là pha loãng.'),
  ('Mảng bảo hiểm','Chủ trương làm cả nhân thọ và phi nhân thọ.','Cần vốn, mất nhiều năm mới có lãi; giá trị chủ yếu nằm ở bán chéo cho khách ngân hàng.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST','EPS','P/E ở 14.650'],
  rows=[['Tiêu cực','Trích thêm dự phòng, lãi giảm','~5.000 tỷ','~1.335','~11,0×'],
        ['Cơ sở','Giữ nhịp 4 quý gần nhất','~6.000 tỷ','~1.600','~9,1×'],
        ['Tích cực','CIR giảm, tín dụng tăng 15%','~7.200 tỷ','~1.920','~7,6×']],
  note='EPS tính trên 3.744 triệu cp, chưa tính đợt tăng vốn lần 2. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Công bố đối tác chiến lược hoặc phát hành giá cao hơn thị giá','Mức mở rộng P/B có cơ sở; thị trường đã đi trước đúng hướng.'),
        ('r','Lợi nhuận quý 3 tiếp tục đi ngang hoặc giảm','Khoảng chênh giữa giá và lợi nhuận nới rộng; rủi ro điều chỉnh tăng.'),
        ('r','RSI vượt 70 kèm khối lượng giảm','Đà tăng cạn dần, người mua muộn chịu rủi ro.'),
        ('g','LLR tăng lên trên 60% mà lãi không giảm','Chất lượng lợi nhuận cải thiện thật.')],
 blind='Khi giá tăng mạnh với khối lượng lớn mà không có thông tin công khai tương xứng, người mua nhỏ lẻ thường là bên biết ít nhất. Nếu có một sự kiện tốt sắp được công bố, phần lớn giá trị đã được những người biết trước thu về. Nếu không có sự kiện nào, mức P/B 1,2 sẽ phải được lợi nhuận "lấp đầy" trong nhiều quý, trong khi lợi nhuận đang đi ngang.')

E['NVL'] = dict(
 thesis='Với NVL, lợi nhuận báo cáo gần như không có ý nghĩa định giá. Đây là một câu chuyện <b>giá trị tài sản trong tái cấu trúc</b>: cổ phiếu đáng giá bao nhiêu phụ thuộc vào (1) quỹ đất, dự án thực sự bán được bao nhiêu tiền, (2) bao nhiêu nợ sẽ chuyển thành cổ phiếu, và (3) khi nào pháp lý được gỡ để chuyển tồn kho thành tiền.',
 implied='P/B 0,71× nghe như chiết khấu 29% vốn chủ, khoảng 19.100 tỷ. Nhưng vì tổng tài sản gấp gần 4 lần vốn chủ, mức chiết khấu đó chỉ tương đương giả định tài sản bị đánh giá cao khoảng <b>7,4%</b>. Với tồn kho cần khoảng 52 năm để bán hết theo tốc độ hiện tại, giả định tài sản chỉ "đội giá" 7,4% là khá lạc quan.',
 implied_ev='Chiết khấu = 65.238 × (1 − 10.700/15.134) ≈ 19.100 tỷ; 19.100 / tổng tài sản 258.658 ≈ 7,4%.',
 drivers=[
  ('Giá trị thật của tồn kho','Tài sản chủ yếu là đất, dự án dở dang.','Mỗi 5% giá trị tài sản bị đánh giá lại ≈ 12.900 tỷ ≈ 20% vốn chủ ≈ 4.000đ BVPS.'),
  ('Lãi vay được vốn hóa','Chi phí lãi vay trên báo cáo chỉ khoảng 145 tỷ/quý, rất thấp so với nợ vay ước tính hơn 70.000 tỷ.','Phần lớn lãi vay đang được cộng vào giá trị tồn kho. Khi dự án hoàn thành, lãi vay phải tính vào chi phí như trường hợp Dung Quất 2 của HPG.'),
  ('Chuyển đổi trái phiếu thành cổ phiếu','Số cổ phiếu lưu hành đã cao hơn số niêm yết khoảng 33%.','Mỗi đợt chuyển đổi giảm nợ nhưng chia giá trị còn lại cho nhiều cổ phiếu hơn.'),
  ('Tiến độ pháp lý','Aqua City không phải nộp thêm tiền sử dụng đất (30/9).','Gỡ pháp lý là cách duy nhất để tồn kho chuyển thành tiền và doanh thu thật.')],
 scen=dict(head=['Kịch bản tài sản','Đánh giá lại tài sản','BVPS điều chỉnh','P/B ở 10.700'],
  rows=[['Sổ sách đúng','0%','~15.130đ','~0,71×'],
        ['Tài sản cao hơn thực tế 5%','−12.900 tỷ','~11.100đ','~0,96×'],
        ['Tài sản cao hơn thực tế 10%','−25.900 tỷ','~7.060đ','~1,52×']],
  note='Tính trên 3.204,5 triệu cp lưu hành, chưa tính chuyển đổi trái phiếu thêm. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','BCTC quý 3 xác nhận lãi 9 tháng từ bàn giao, không phải từ tái cấu trúc nợ','Lợi nhuận bắt đầu có tiền thật đi kèm.'),
        ('r','Lãi tiếp tục đến chủ yếu từ thu nhập tài chính, xóa nợ, đánh giá lại','Lợi nhuận không quy ra tiền, không giúp trả nợ.'),
        ('g','Tiền từ kinh doanh dương và tồn kho giảm','Tài sản đang được chuyển thành tiền.'),
        ('r','Giá chuyển đổi trái phiếu thấp hơn thị giá','Pha loãng mạnh, cổ đông hiện hữu chịu thiệt.')],
 blind='Thông báo "lãi 9 tháng vượt kế hoạch" dễ khiến người ta nghĩ doanh nghiệp đã hồi phục. Nhưng quý 2 cho thấy kinh doanh chính gần như hòa vốn, phần lớn lãi đến từ khoản ngoài. Trong tái cấu trúc, các khoản như xóa nợ, đánh giá lại, chuyển đổi trái phiếu đều tạo ra lợi nhuận kế toán mà không tạo ra tiền mặt. Điều cần xem là dòng tiền kinh doanh, không phải dòng lợi nhuận.')

E['MWG'] = dict(
 thesis='MWG đã chuyển từ câu chuyện mở rộng sang câu chuyện <b>tăng biên lợi nhuận</b>: biên hoạt động tăng từ 4,4% lên 7,2% trong 5 quý. Ở quy mô doanh thu gần 180.000 tỷ, mỗi điểm % biên là hơn 1.400 tỷ lợi nhuận. Câu hỏi then chốt là biên 7% là mức mới bền vững hay là đỉnh, khi đối thủ và sức mua có thể kéo biên về lại.',
 implied='P/E 10,9× tương đương lợi suất lợi nhuận 9,2%. Với lợi suất đòi hỏi 12%, thị trường ngầm định lợi nhuận dài hạn chỉ tăng khoảng <b>2,8%/năm</b>, ngay sau một năm lãi tăng gấp đôi. Thị trường đang định giá MWG như thể biên lợi nhuận đã ở đỉnh và sẽ quay đầu.',
 implied_ev='E/P = 1 / 10,9 ≈ 9,2%; g ngầm định ≈ 12% − 9,2% ≈ 2,8%. EV/EBITDA 11,1×.',
 drivers=[
  ('Biên hoạt động','Từ 4,4% (Q2/25) lên 7,2% (Q2/26).','Mỗi 1 điểm % trên doanh thu ~180.000 tỷ ≈ 1.800 tỷ EBIT ≈ 1.600 tỷ LNST ≈ 16% lãi.'),
  ('Tăng trưởng doanh thu','+29,6% cùng kỳ trong quý 2.','Doanh thu tăng giúp chi phí cố định (thuê mặt bằng, nhân sự) được dàn mỏng, nên lợi nhuận tăng nhanh hơn doanh thu.'),
  ('Vốn lưu động và nợ phải trả','Nợ phải trả/vốn chủ tăng từ 1,3 lên 1,9 trong một quý.','Nếu do chiếm dụng vốn nhà cung cấp theo mùa thì lành mạnh; nếu do vay ngắn hạn tăng thì chi phí lãi sẽ tăng.'),
  ('Hành vi người nội bộ','Có người nội bộ bán ra khi P/E đã về 11 lần.','Người trong cuộc bán khi lợi nhuận tăng gấp đôi là thông tin cần cân nhắc, dù có thể vì lý do cá nhân.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST','EPS','P/E ở 72.800'],
  rows=[['Tiêu cực','Biên về 5%, doanh thu 200.000 tỷ','~9.000 tỷ','~6.100','~11,9×'],
        ['Cơ sở','Biên 6,5%, doanh thu 205.000 tỷ','~12.000 tỷ','~8.130','~9,0×'],
        ['Tích cực','Biên 7,5%, doanh thu 215.000 tỷ','~14.500 tỷ','~9.830','~7,4×']],
  note='LNST ước tính ≈ 90% EBIT (quý 2/2026 là 95%). EPS tính trên 1.475,7 triệu cp. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Biên gộp quý 3 giữ trên 21%','Biên tăng là cấu trúc, không phải mùa vụ.'),
        ('r','Người nội bộ tiếp tục bán','Người hiểu doanh nghiệp nhất đang chốt lời; cần thận trọng.'),
        ('r','Vay ngắn hạn tăng nhanh hơn doanh thu','Tăng trưởng đang được tài trợ bằng nợ.'),
        ('g','Tiền từ kinh doanh 4 quý lớn hơn LNST','Lợi nhuận chất lượng cao, có tiền thật đi kèm.')],
 blind='Thị trường đang đặt cược rằng biên lợi nhuận sẽ quay đầu. Ngành bán lẻ thường có lợi thế quy mô: khi hệ thống cửa hàng đã tối ưu, chi phí cố định trên mỗi đồng doanh thu tiếp tục giảm. Nếu biên 6,5–7% là mức mới, P/E thực tế dưới 10 lần. Nhưng việc người nội bộ bán ra đúng lúc này là tín hiệu không nên bỏ qua: họ có thể thấy điều số liệu chưa cho thấy.')

E['BSR'] = dict(
 thesis='Lợi nhuận BSR là hàm số của <b>chênh lệch giá sản phẩm xăng dầu với giá dầu thô</b> nhân với sản lượng lọc. Nhà máy không thay đổi, giá thị trường thay đổi. Vì vậy, với BSR, câu hỏi định giá đúng là lợi nhuận trung bình chu kỳ bằng bao nhiêu, không phải lợi nhuận 4 quý gần nhất.',
 implied='Ở P/B 1,9×, với lợi suất đòi hỏi 14% và tăng trưởng 3%, thị trường ngầm định ROE bền vững khoảng <b>24%</b>. Năm 2025 ROE dưới 10%, ROE 4 quý gần nhất 30%. Thị trường đang ngầm giả định phần lớn "thời được mùa" của năm 2026 sẽ kéo dài nhiều năm. Nếu lấy trung bình hai năm 2025–2026 làm mức chu kỳ, ROE khoảng 18–20%, thấp hơn mức thị trường đang định giá.',
 implied_ev='ROE ngầm định = 1,9 × (14% − 3%) + 3% ≈ 23,9%. LNST 2025 ≈ 5.215 tỷ; 4 quý gần nhất 19.900 tỷ.',
 drivers=[
  ('Biên gộp (chênh lệch giá sản phẩm và dầu thô)','Từ 1–3% năm 2025 lên 15–21% năm 2026.','Mỗi 1 điểm % biên gộp trên doanh thu ~177.500 tỷ ≈ 1.780 tỷ ≈ 1.600 tỷ LNST ≈ 8% lãi.'),
  ('Lãi, lỗ tồn kho theo giá dầu','Tồn kho khoảng 31 ngày giá vốn, ước tính khoảng 13.000 tỷ.','Giá dầu giảm 20% có thể gây lỗ tồn kho một lần khoảng 2.600 tỷ; giá dầu tăng thì ngược lại, làm lãi "đẹp" hơn thực chất.'),
  ('Sản lượng và bảo dưỡng','Nhà máy dừng bảo dưỡng định kỳ làm mất sản lượng cả quý.','Một đợt bảo dưỡng lớn có thể làm lợi nhuận quý đó giảm mạnh dù giá thị trường tốt.'),
  ('Thoái vốn của PVN','2,13% vốn, khoảng 107 triệu cp, trước 3/2027.','Khoảng 3.000 tỷ cổ phiếu ở giá hiện tại cần người mua; tăng tỷ lệ cổ phiếu tự do.')],
 scen=dict(head=['Kịch bản','Biên gộp bình quân','LNST','EPS','P/E ở 28.200'],
  rows=[['Tiêu cực','5% (giữa 2025 và 2026)','~5.900 tỷ','~1.180','~23,9×'],
        ['Cơ sở','10%','~13.600 tỷ','~2.720','~10,4×'],
        ['Tích cực','15% (giữ như Q2/26)','~21.200 tỷ','~4.240','~6,7×']],
  note='Giả định doanh thu ~170.000 tỷ, chi phí bán hàng và quản lý ~1.900 tỷ, thuế ~10%, 5.007 triệu cp. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Biên gộp quý 3 giữ trên 12% dù giá dầu điều chỉnh','Chênh lệch giá sản phẩm bền hơn kỳ vọng; kịch bản cơ sở có thể bị vượt.'),
        ('r','Brent giảm nhanh về dưới 85 USD','Lỗ tồn kho và biên co lại cùng lúc.'),
        ('r','Lịch bảo dưỡng tổng thể được công bố','Sản lượng một quý bị mất, lợi nhuận giảm mạnh.'),
        ('g','Cổ tức tiền mặt tăng mạnh từ lợi nhuận năm 2026','Doanh nghiệp chia lại "lãi được mùa" cho cổ đông thay vì giữ lại.')],
 blind='Nhiều người nhìn BSR như cổ phiếu Nhà nước ổn định, ít nợ, an toàn. Ít nợ là đúng, nhưng lợi nhuận lại thuộc loại biến động mạnh nhất sàn. P/E thấp lúc lãi đỉnh là cái bẫy kinh điển của cổ phiếu chu kỳ: lúc lợi nhuận cao nhất thì P/E trông rẻ nhất. Với BSR, cách định giá an toàn hơn là dùng lợi nhuận trung bình nhiều năm, ở mức đó P/E không còn thấp.')

# ---- Đợt 3 (SSI, TCB, GEX, PDR, VCG): số liệu TCBS chốt phiên 16/10/2026 ----
E['SSI'] = dict(
 thesis='SSI là cổ phiếu chu kỳ của thanh khoản thị trường, và vừa chuyển sang một bảng cân đối "nhiều vốn, ít đòn bẩy" sau quý 1/2026. Câu hỏi đúng không phải là lãi quý tới cao hay thấp, mà là <b>số vốn mới được đưa vào cho vay ký quỹ và tự doanh nhanh đến đâu, với chi phí vốn bao nhiêu</b>. ROA đã tăng từ 3,4% lên 5,1%; ROE chỉ tăng theo nếu đòn bẩy quay lại.',
 implied='Ở P/B 1,4×, nếu nhà đầu tư đòi lợi suất 14%/năm và lợi nhuận dài hạn tăng 5%/năm, thị trường đang ngầm định ROE bền vững khoảng <b>17,6%</b>. ROE 4 quý là 13,9%, năm hóa riêng quý 2 chỉ khoảng 12,1%. Với ROA hiện tại 5,1%, muốn đạt ROE 17,6% thì tài sản/vốn phải tăng từ 2,4 lên khoảng 3,5 lần. Nói cách khác, giá hiện tại đã trả trước cho việc <b>dùng hết số vốn mới</b>, chưa hẳn là rẻ.',
 implied_ev='ROE ngầm định = P/B × (r − g) + g = 1,4 × (14% − 5%) + 5% ≈ 17,6%. Đòn bẩy cần = 17,6% / 5,1% ≈ 3,45×. ROE năm hóa Q2/26 = 1.231 × 4 / 40.724 ≈ 12,1%.',
 drivers=[
  ('Thanh khoản thị trường','Phí môi giới và nhu cầu vay ký quỹ đi theo giá trị giao dịch toàn thị trường.','Doanh thu dao động từ 2.159 tỷ (Q1/25) đến 4.177 tỷ (Q3/25), gần gấp đôi chỉ theo nhịp thị trường.'),
  ('Dư nợ ký quỹ và đòn bẩy','Phải thu (chủ yếu cho vay ký quỹ) là tài sản lớn nhất. Đòn bẩy đã giảm từ 3,2× xuống 2,4×.','Mỗi 0,5 lần tài sản/VCSH tăng thêm với ROA giữ 5,1% ≈ +2,5 điểm % ROE.'),
  ('Chi phí vốn','Lãi vay 4 quý ≈ 3.000 tỷ trên nợ vay ước tính ~52.900 tỷ (1,3 × VCSH).','Mỗi 1 điểm % lãi suất ≈ 530 tỷ chi phí/năm ≈ 11% LNST 4 quý (4.801 tỷ).'),
  ('Tự doanh','Quý 4/2025 biên gộp tụt từ ~71% xuống 51%, nhiều khả năng do mảng tài sản tài chính.','Một quý tự doanh xấu có thể lấy đi 500–700 tỷ lãi so với nhịp bình thường (so Q4/25 với Q3/25).')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST CĐ mẹ','EPS','P/E ở 19.450','ROE'],
  rows=[['Tiêu cực','Thanh khoản giảm, lãi về mức Q4/25 (~817 tỷ/quý)','~3.300 tỷ','~1.100','~17,7×','~8,1%'],
        ['Cơ sở','Giữ nhịp Q2/26 (~1.230 tỷ/quý)','~4.900 tỷ','~1.630','~11,9×','~12,0%'],
        ['Tích cực','Dùng hết vốn mới, đòn bẩy lên ~3×','~6.400 tỷ','~2.130','~9,1×','~15,7%']],
  note='EPS tính trên 3.001,3 triệu cổ phiếu, ROE trên VCSH 40.724 tỷ. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Dư nợ ký quỹ quý 3 tăng hơn 10% so với quý 2','Vốn mới đang được dùng; ROE có cơ sở đi lên.'),
        ('r','Chi phí lãi vay tăng nhanh hơn doanh thu thêm một quý nữa','Biên lãi từ cho vay ký quỹ đang bị bào mòn.'),
        ('g','Biên gộp giữ trên 70% trong quý 3','Mảng tự doanh không tạo cú sốc như quý 4/2025.'),
        ('r','Giá trị giao dịch toàn thị trường giảm kéo dài','Kịch bản tiêu cực; P/E thực tế cao hơn con số 12 lần đang thấy.')],
 blind='P/B giảm từ 2,7× xuống 1,4× trong một năm trông như cổ phiếu đã rẻ đi một nửa. Thực ra khoảng 40% mức giảm đó đến từ mẫu số: từ cuối quý 3/2025, vốn mỗi cổ phiếu tăng từ 10.369 lên 13.525 đồng (+30%), trong khi giá giảm khoảng 30%. Vốn tăng làm công ty an toàn hơn nhưng cũng kéo ROE xuống trong ngắn hạn. Người chỉ nhìn P/B sẽ thấy rẻ; người nhìn ROE năm hóa (~12%) sẽ thấy giá đang trả trước cho tăng trưởng.')

E['TCB'] = dict(
 thesis='TCB là ngân hàng có chất lượng tài sản tốt nhất nhóm tư nhân lớn (nợ xấu 1,1%, dự phòng phủ 126%) và chi phí thấp (CIR 31%). Lợi nhuận tăng đều 12–18%/năm. Câu hỏi đúng là <b>lãi tăng đến từ đâu</b>: quý 2/2026 tăng nhờ phí dịch vụ (+74%) và dự phòng thấp (−36%), trong khi lãi đầu tư gần như mất hẳn. Bền hay không phụ thuộc vào việc phí dịch vụ có phải là dòng tiền lặp lại.',
 implied='Ở P/B 1,2×, với lợi suất đòi hỏi 14% và tăng trưởng dài hạn 6%, thị trường ngầm định ROE bền vững khoảng <b>15,6%</b>, sát mức ROE hiện tại 16,1%. Nghĩa là giá đang phản ánh khá đúng năng lực sinh lời hôm nay, <b>chưa trả thêm cho tăng trưởng</b>, nhưng cũng chưa trừ đi rủi ro nào đáng kể.',
 implied_ev='ROE ngầm định = 1,2 × (14% − 6%) + 6% ≈ 15,6%. ROE 4 quý (TCBS) 16,1%.',
 drivers=[
  ('Biên lãi NIM','NIM ổn định 3,7–3,8% sau khi giảm từ 4,1% đầu 2025.','Tài sản sinh lãi ước tính ~1,18 triệu tỷ (dư nợ 835.813 / 0,708). Mỗi 0,1 điểm NIM ≈ 1.180 tỷ thu nhập/năm ≈ 4% LNST 4 quý.'),
  ('Chi phí tín dụng','Dự phòng quý 2 chỉ 652 tỷ, năm hóa ≈ 0,3% dư nợ.','Nếu chi phí tín dụng về 0,6% dư nợ: +2.400 tỷ dự phòng/năm ≈ −1.900 tỷ LNST ≈ −7% lãi năm.'),
  ('Phí dịch vụ','3.662 tỷ quý 2, chiếm ~25% tổng thu nhập, tăng 74% so với cùng kỳ.','Nếu phí về mức Q4/25 (2.571 tỷ): −1.090 tỷ/quý trước thuế ≈ −12% lãi quý.'),
  ('Tăng trưởng tín dụng','19,3%/năm, LDR (TCBS) 128%.','Tăng trưởng nhanh hơn tiền gửi buộc phải dùng vốn vay đắt hơn; áp lực lên NIM nếu lãi suất huy động tăng.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST CĐ mẹ','EPS','P/E ở 33.200'],
  rows=[['Tiêu cực','Chi phí tín dụng về 0,6%, phí về mức Q4/25','~25.000 tỷ','~3.530','~9,4×'],
        ['Cơ sở','Giữ nhịp Q2/26','~29.400 tỷ','~4.150','~8,0×'],
        ['Tích cực','Tín dụng +20%, NIM giữ 3,7%, phí giữ','~33.000 tỷ','~4.660','~7,1×']],
  note='EPS tính trên 7.086,2 triệu cổ phiếu. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','NIM quý 3 giữ từ 3,7% trở lên','Tăng trưởng tín dụng không phải đánh đổi bằng biên lãi.'),
        ('r','Dự phòng quý 3 tăng vọt hoặc nợ xấu vượt 1,3%','Lãi quý 2 có phần nhờ "nới đệm"; kịch bản tiêu cực có cơ sở.'),
        ('g','Phí dịch vụ giữ trên 3.000 tỷ/quý','Nguồn thu mới đủ bền để thay lãi đầu tư.'),
        ('r','LDR (TCBS) vượt 130% trở lại','Áp lực vốn; ngân hàng có thể phải chậm tăng trưởng hoặc huy động đắt hơn.')],
 blind='Thị trường thấy LLR 126% và yên tâm. Ít người để ý dự phòng quý 2 là thấp nhất 6 quý, và LLR đã giảm từ 129% xuống 126%: một phần lợi nhuận đến từ việc trích ít đi khi đệm còn dày. Đây không phải điều xấu, nhưng là nguồn lãi có giới hạn. Ngược lại, điều cũng ít được nhắc: lợi nhuận trước dự phòng vẫn tăng 16%, nên nếu bỏ hết các yếu tố "may mắn", lõi của TCB vẫn tăng trưởng hai chữ số. Lưu ý: số liệu lấy từ TCBS, công ty con của Techcombank.')

E['GEX'] = dict(
 thesis='GEX là công ty mẹ nắm cổ phần chi phối ở nhiều công ty con (thiết bị điện, vật liệu xây dựng, hạ tầng). Giá trị với cổ đông GEX không nằm ở doanh thu hợp nhất mà ở <b>phần lợi nhuận thực sự chảy về công ty mẹ, trừ đi chi phí nợ ở cấp mẹ</b>. Quý 2/2026 chỉ 40% lợi nhuận về tay cổ đông GEX, trong khi lãi vay hợp nhất đã tăng gấp đôi.',
 implied='Ở P/B 1,5×, với lợi suất đòi hỏi 14% và tăng trưởng 5%, thị trường ngầm định ROE khoảng <b>18,5%</b>, trong khi ROE thực tế chỉ 8%. Khoảng cách lớn này cho thấy giá không dựa trên lợi nhuận hiện tại, mà dựa trên <b>giá trị các công ty con</b> (tổng các phần) cao hơn sổ sách. Trang này không có đủ dữ liệu để định giá từng công ty con, nên đây là điểm anh chị cần tự kiểm tra.',
 implied_ev='ROE ngầm định = 1,5 × (14% − 5%) + 5% ≈ 18,5%. ROE 4 quý (TCBS) 8,0%. Thiếu dữ liệu: tỷ lệ sở hữu và giá trị thị trường của từng công ty con.',
 drivers=[
  ('Tỷ lệ lợi nhuận về công ty mẹ','Quý 2/2026: 40%; quý 2/2025: 55%; quý 4/2025: âm.','Mỗi 10 điểm % thay đổi tỷ lệ này trên LNST 4 quý (~3.257 tỷ) ≈ 326 tỷ ≈ 24% lãi CĐ mẹ 4 quý.'),
  ('Chi phí lãi vay','582 tỷ quý 2, ≈ 1.670 tỷ 4 quý, tăng 113% so với cùng kỳ.','Nợ vay ≈ 1,0 × VCSH ≈ 34.500 tỷ; mỗi 1 điểm % lãi suất ≈ 345 tỷ/năm, tương đương ~25% lãi CĐ mẹ 4 quý (trước khi chia cho cổ đông thiểu số).'),
  ('Biên gộp','Dao động 18,6–23,1% trong 6 quý.','Mỗi 1 điểm % biên gộp trên doanh thu 4 quý 46.679 tỷ ≈ 467 tỷ lãi gộp.'),
  ('Vốn lưu động','Số ngày tồn kho 134, chu kỳ tiền 192 ngày.','Doanh thu tăng 43% kéo nhu cầu vốn lưu động tăng theo; đây là một lý do vay nợ tăng.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST CĐ mẹ','EPS','P/E ở 22.500'],
  rows=[['Tiêu cực','Lặp lại một quý lỗ ở công ty mẹ như Q4/25','~1.000 tỷ','~760','~29,4×'],
        ['Cơ sở','Giữ mức 4 quý gần nhất','~1.373 tỷ','~1.050','~21,4×'],
        ['Tích cực','Giữ nhịp Q2/26 cả năm','~2.160 tỷ','~1.650','~13,6×']],
  note='EPS tính trên 1.308,5 triệu cổ phiếu. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Tỷ lệ lãi về cổ đông GEX quý 3 trên 50%','Công ty mẹ đang giữ được phần lớn hơn từ tăng trưởng.'),
        ('r','Lãi vay tiếp tục tăng hơn 20% so với quý trước','Tăng trưởng đang được tài trợ bằng nợ đắt; ROE khó hồi.'),
        ('g','Lãi CĐ mẹ quý 3/2026 vượt 622 tỷ (Q3/25)','Lãi về công ty mẹ tăng trưởng thật, không chỉ doanh thu.'),
        ('r','Tồn kho và phải thu tăng nhanh hơn doanh thu','Vốn bị "chôn" trong vận hành, áp lực vay tiếp.')],
 blind='Tin tức về GEX thường nhấn vào doanh thu hợp nhất (+43%), con số dễ nhớ nhất. Con số quan trọng hơn với cổ đông là 540 tỷ, phần lợi nhuận về công ty mẹ, giảm 18% so với cùng kỳ. Với công ty mẹ đa ngành, cần đọc báo cáo tài chính riêng của công ty mẹ và tỷ lệ sở hữu ở từng công ty con; hợp nhất có thể che đi việc tiền mặt và lợi nhuận thực sự nằm ở đâu.')

E['PDR'] = dict(
 thesis='PDR lúc này không phải câu chuyện lợi nhuận, mà là câu chuyện <b>thời gian và pháp lý của dự án</b>. Doanh thu gần bằng 0 hai quý liền, lãi báo cáo đến từ khoản ngoài kinh doanh. Giá trị công ty nằm gần như toàn bộ trong tồn kho và phải thu. Định giá phải trả lời: các dự án này mở bán khi nào, bán được giá bao nhiêu, và mỗi năm chờ đợi tốn bao nhiêu.',
 implied='Vốn hóa 11.175 tỷ so với vốn chủ sổ sách 12.610 tỷ: thị trường đang trừ khoảng <b>1.435 tỷ</b>, tương đương khoảng <b>10% giá trị tồn kho ước tính</b>. Mức chiết khấu này không quá sâu so với một doanh nghiệp đang lỗ hoạt động. Lãi vay cộng chi phí vận hành 4 quý gần nhất khoảng 920 tỷ. Nếu không có lãi gộp bù lại, khoản chiết khấu đó chỉ tương đương khoảng <b>1,5 năm chờ đợi</b>.',
 implied_ev='Chiết khấu = 12.610 − 11.175 ≈ 1.435 tỷ. Tồn kho ước tính ≈ 379 × 13.268 / 365 ≈ 13.800 tỷ. Chi phí chờ ≈ lãi vay 4 quý ~405 tỷ + chi phí hoạt động 4 quý ~518 tỷ ≈ 923 tỷ; 1.435 / 923 ≈ 1,55 năm. Lãi gộp 4 quý ~644 tỷ nếu duy trì sẽ kéo dài thời gian này. Ước tính thô, chưa tính lãi vay đã vốn hóa vào dự án.',
 drivers=[
  ('Tiến độ pháp lý và mở bán','Doanh thu theo lịch bàn giao: 438 → 20 → 507 → 361 → 104 → 54 tỷ.','Thiếu dữ liệu: danh sách dự án, tiến độ pháp lý, giá trị hợp đồng đã ký. Đây là biến số lớn nhất mà trang này không đo được.'),
  ('Thu nhập ngoài kinh doanh','Q1/26 và Q2/26 lãi trước thuế dương nhờ khoảng 350–400 tỷ/quý ngoài kinh doanh chính.','Nếu nguồn này không lặp lại, lỗ hoạt động quý 2 (−233 tỷ) là "nhịp nền"; năm hóa ≈ −900 tỷ.'),
  ('Chi phí vốn','Lãi vay quý 2 101 tỷ (+63% YoY), nợ ngắn hạn tăng.','Mỗi 1 điểm % lãi suất trên nợ vay ước tính ~5.000 tỷ (0,4 × VCSH) ≈ 50 tỷ/năm.'),
  ('Thu hồi phải thu','Số ngày phải thu ~4.200, tiền mặt quý 2 tăng mạnh.','Thu được tiền từ phải thu là cách nhanh nhất để giảm nợ mà không cần bán dự án mới.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST CĐ mẹ','EPS','P/E ở 11.200','BVPS cuối kỳ'],
  rows=[['Tiêu cực','Không mở bán, không có thu nhập khác, lỗ như Q2/26','~−900 tỷ','~−900','Không xác định','~11.700'],
        ['Cơ sở','Giữ mức 4 quý gần nhất','~613 tỷ','~614','~18,2×','~13.200'],
        ['Tích cực','Bàn giao dự án lớn, doanh thu quý vượt 1.000 tỷ','~1.500 tỷ','~1.500','~7,5×','~14.100']],
  note='EPS tính trên 997,8 triệu cổ phiếu; BVPS cuối kỳ = 12.618 + EPS, chưa tính cổ tức hay phát hành. Kịch bản tích cực là giả định minh họa, không dựa trên kế hoạch công bố.'),
 signs=[('g','Doanh thu một quý vượt 500 tỷ từ bán, bàn giao','Dự án bắt đầu chuyển thành tiền; lãi lõi quay lại.'),
        ('r','Thêm một quý lỗ hoạt động trên 200 tỷ','Chi phí chờ đang ăn dần vào vốn chủ.'),
        ('g','Lưu chuyển tiền kinh doanh dương và người mua trả trước tăng','Có dòng tiền thật, không chỉ lãi kế toán.'),
        ('r','Nợ vay ngắn hạn tiếp tục tăng','Rủi ro đáo hạn tăng khi chưa có doanh thu.')],
 blind='Nhiều bảng lọc hiển thị P/E 18 và ROE 5% cho PDR, trông như một doanh nghiệp bình thường có lãi. Thực tế, kinh doanh chính đã lỗ hai quý liền và lợi nhuận báo cáo phụ thuộc vào khoản ngoài kinh doanh. Điều ít người để ý ở chiều ngược lại: tiền mặt quý 2 tăng gần 9 lần và nợ vay so với vốn chỉ 0,4 lần, thấp hơn nhiều doanh nghiệp cùng ngành. Biết tiền quý 2 đến từ đâu (vay, thu nợ hay chuyển nhượng) là chìa khóa để đọc đúng PDR.')

E['VCG'] = dict(
 thesis='VCG là tổng thầu hạ tầng có biên lãi mỏng (9–14% gộp) cộng với một danh mục đầu tư và bất động sản. Lợi nhuận 4 quý gần nhất bị chi phối bởi một khoản bất thường ~3.000 tỷ ở quý 3/2025, nên mọi chỉ số "rẻ" (P/E 2,6, ROE 42%) đều <b>không phản ánh năng lực lõi</b>. Câu hỏi đúng: lãi lõi bền vững bao nhiêu, và các vấn đề pháp lý kiểm toán viên nhấn mạnh có ảnh hưởng tài chính hay không.',
 implied='Ở P/B 0,9×, với lợi suất đòi hỏi 14% và tăng trưởng 4%, thị trường ngầm định ROE khoảng <b>13%</b>. ROE lõi (bỏ khoản bất thường) ước tính chỉ khoảng 8,7%. Nghĩa là <b>tính trên lãi lõi, VCG không rẻ</b> như P/E 2,6 gợi ý; giá đang được đỡ bởi giá trị tài sản trên sổ sách hơn là bởi lợi nhuận xây lắp.',
 implied_ev='ROE ngầm định = 0,9 × (14% − 4%) + 4% ≈ 13%. Lãi lõi ước tính = (244 + 353 + 219) / 3 × 4 ≈ 1.090 tỷ/năm; ROE lõi ≈ 1.090 / 12.469 ≈ 8,7%. P/E lõi ≈ 10.577 / 1.090 ≈ 9,7×.',
 drivers=[
  ('Biên gộp xây lắp','Giảm từ 13,8% (Q3/25) xuống 9,2% (Q2/26).','Mỗi 1 điểm % biên gộp trên doanh thu 4 quý 16.321 tỷ ≈ 163 tỷ lãi gộp ≈ 15% lãi lõi năm.'),
  ('Doanh thu tài chính, bất thường','Lãi 6 tháng 2026 tăng 35% chủ yếu nhờ doanh thu tài chính (theo giải trình).','Không thể dự báo; nên tách riêng khi tính P/E.'),
  ('Rủi ro pháp lý','Kiểm toán viên nhấn mạnh việc tạm giam hai lãnh đạo và kết luận thanh tra tại gói thầu Long Thành.','Thiếu dữ liệu về ảnh hưởng tài chính. Rủi ro chủ yếu là khả năng trúng thầu mới và thanh quyết toán công trình.'),
  ('Lãi vay và vốn lưu động','Lãi vay 112 tỷ quý 2, nợ chủ yếu ngắn hạn, EBIT/lãi vay 1,4×.','Lãi hoạt động quý 2 (158 tỷ) chỉ hơn lãi vay 46 tỷ: biên an toàn rất mỏng nếu biên gộp giảm tiếp.')],
 scen=dict(head=['Kịch bản','Giả định 12 tháng tới','LNST CĐ mẹ','EPS','P/E ở 15.150','ROE'],
  rows=[['Tiêu cực','Biên gộp về ~8%, không có thu nhập bất thường','~700 tỷ','~1.000','~15,1×','~5,6%'],
        ['Cơ sở','Giữ nhịp 3 quý gần nhất','~1.090 tỷ','~1.560','~9,7×','~8,7%'],
        ['Tích cực','Biên gộp về 12–13% như 2025','~1.600 tỷ','~2.290','~6,6×','~12,8%']],
  note='EPS tính trên 698,2 triệu cổ phiếu, ROE trên VCSH 12.469 tỷ. Phép thử độ nhạy, không phải dự báo hay giá mục tiêu.'),
 signs=[('g','Biên gộp quý 3/2026 trở lại trên 11%','Quý 2 chỉ là quý xấu; lãi lõi có thể về kịch bản tích cực.'),
        ('r','EPS 4 quý giảm mạnh sau BCTC quý 3 mà giá không điều chỉnh','Thị trường đang dựa vào con số P/E cũ; rủi ro định giá lại.'),
        ('r','Thêm thông tin pháp lý ảnh hưởng đến hợp đồng hoặc thanh toán','Rủi ro chuyển từ "lưu ý" sang ảnh hưởng tài chính thật.'),
        ('g','Khoản cho vay HPX được thu hồi đúng hạn','Giảm lo ngại về chất lượng tài sản ngoài xây lắp.')],
 blind='Nhiều người lọc cổ phiếu theo P/E sẽ thấy VCG ở top rẻ nhất sàn. Nhưng khi quý 3/2026 công bố (thường cuối tháng 10), quý 3/2025 rơi khỏi phép tính 4 quý, và P/E trên các bảng lọc có thể nhảy từ 2,6 lên khoảng 10 lần dù giá không đổi. Nhịp bật 11% của tuần qua diễn ra ngay trước mốc này. Chiều ngược lại cũng đúng: nếu quý 3/2026 lại có khoản bất thường lớn, P/E sẽ tiếp tục thấp; nên đọc kỹ cơ cấu lợi nhuận thay vì chỉ nhìn con số tổng.')
