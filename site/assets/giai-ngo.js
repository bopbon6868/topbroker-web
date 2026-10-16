/* =========================================================
   GIẢI NGỐ CHỨNG KHOÁN · dữ liệu mục lục + từ điển
   Thêm bài mới: đổi status của bài thành 'live' và tạo thư mục
   giai-ngo/bai-XX/index.html theo mẫu bai-01.
   ========================================================= */
window.GN = {
  ZALO: '0939660996',
  STAGES: [
    {id:1, name:'Vỡ lòng',     note:'Chứng khoán là cái gì, có ăn được không'},
    {id:2, name:'Mở hàng',     note:'Mở tài khoản, đặt lệnh, hiểu phí và tiền về'},
    {id:3, name:'Đọc vị',      note:'Ba con số và một bản báo cáo đủ để không bị lùa'},
    {id:4, name:'Giữ tiền',    note:'Chia vốn, cắt lỗ, tránh vay quá tay'},
    {id:5, name:'Tâm lý',      note:'Đu đỉnh, bán đáy và nghệ thuật lùa gà'},
    {id:6, name:'Kênh khác & nâng cao', note:'Vàng, coin, dòng tiền và đầu tư định kỳ'}
  ],
  LESSONS: [
    {n:1,  s:1, status:'live', min:5, t:'Chứng khoán là sới bạc hay cái chợ?', q:'Mẹ bảo dính vào chứng khoán là bán nhà. Có đúng không?'},
    {n:2,  s:1, status:'live', min:4, t:'Cổ phiếu là gì? Mua một miếng của quán phở', q:'Mua cổ phiếu là mua cái gì, cầm được không?'},
    {n:3,  s:1, status:'live', min:5, t:'Gửi tiết kiệm, mua vàng, ôm coin hay mua cổ phiếu?', q:'Có 100 triệu thì để đâu cho khỏi mất ngủ?'},
    {n:4,  s:2, status:'live', min:4, t:'Mở tài khoản trong 10 phút, không cần ra quầy', q:'Mở tài khoản có mất tiền không, cần giấy tờ gì?'},
    {n:5,  s:2, status:'live', min:5, t:'Đặt lệnh đầu tiên: LO, ATO, ATC, MP nói cho dễ', q:'Bấm mua rồi mà sao không khớp?'},
    {n:6,  s:2, status:'live', min:4, t:'Bảng điện xanh đỏ tím vàng: đọc trong 5 phút', q:'Màu tím với màu xanh lơ là sao?'},
    {n:7,  s:2, status:'live', min:4, t:'Phí, thuế và chuyện "tiền về T+2"', q:'Bán xong rồi sao chưa rút được tiền?'},
    {n:8,  s:3, status:'live', min:5, t:'P/E, P/B, ROE: ba con số đủ để không bị lùa', q:'Cổ phiếu 5 nghìn có rẻ hơn cổ phiếu 50 nghìn không?'},
    {n:9,  s:3, status:'live', min:5, t:'Báo cáo tài chính cho người lười: 3 chỗ phải nhìn', q:'Báo cáo dày cả trăm trang, đọc chỗ nào?'},
    {n:10, s:3, status:'live', min:5, t:'Lãi thật, lãi ảo: những gì ít người nói cho bạn', q:'Công ty báo lãi kỷ lục mà sao giá lại giảm?'},
    {n:11, s:4, status:'live', min:4, t:'Chia trứng vào giỏ: bao nhiêu mã là đủ?', q:'Nên mua 1 mã cho chắc hay 10 mã cho an toàn?'},
    {n:12, s:4, status:'live', min:4, t:'Cắt lỗ: đau một lần còn hơn ôm cả đời', q:'Lỗ 20% rồi, bán hay gồng?'},
    {n:13, s:4, status:'live', min:5, t:'Margin: vay tiền mua cổ phiếu, con dao hai lưỡi', q:'Vay thêm để lãi gấp đôi có gì sai?'},
    {n:14, s:5, status:'live', min:4, t:'Đu đỉnh và bán đáy: vì sao ta luôn mua lúc đắt', q:'Sao cứ mua là giảm, bán là tăng?'},
    {n:15, s:5, status:'live', min:5, t:'Phím hàng, hội nhóm Zalo và nghệ thuật lùa gà', q:'Nhóm VIP thu phí có đáng tin không?'},
    {n:16, s:5, status:'soon', min:4, t:'FOMO và cổ phiếu nhà hàng xóm', q:'Bạn bè ai cũng lãi, mình có nên nhảy vào ngay?'},
    {n:17, s:6, status:'soon', min:5, t:'Vàng: của để dành hay hàng đầu cơ?', q:'Vàng lên cao thế này còn mua được không?'},
    {n:18, s:6, status:'soon', min:5, t:'Coin: miền Tây hoang dã của dân đầu tư', q:'Bitcoin có phải lừa đảo không?'},
    {n:19, s:6, status:'soon', min:5, t:'Đọc dòng tiền: khối lượng, khối ngoại và van tiền NHNN', q:'Tiền đang chảy vào đâu, nhìn ở chỗ nào?'},
    {n:20, s:6, status:'soon', min:4, t:'Đầu tư định kỳ: công thức cho người bận rộn', q:'Không có thời gian theo dõi thì làm sao?'}
  ],
  /* Từ điển vỉa hè: [từ, loại, nghĩa dễ hiểu, câu thâm] */
  DICT: [
    ['Đu đỉnh','lóng','Mua đúng lúc giá cao nhất, ngay trước khi nó lao dốc.','Leo lên đỉnh núi đúng lúc núi quyết định thành vực.'],
    ['Bắt đáy','lóng','Mua khi nghĩ giá đã xuống thấp nhất.','Đáy thì có nhiều tầng, tầng hầm còn có cả tầng hầm B2.'],
    ['Bắt dao rơi','lóng','Cố mua khi giá đang lao dốc mạnh.','Dao rơi thì nên đợi nó cắm xuống đất rồi hẵng nhặt.'],
    ['Úp bô','lóng','Bị kẹp hàng, nhất là khi mua theo đám đông ở vùng giá cao.','Người úp bô thường là người cuối cùng biết tin.'],
    ['Lùa gà','lóng','Tung tin, hô hào để kéo người mới vào mua đỡ hàng cho mình.','Gà thì tưởng được cho ăn, hóa ra là được vỗ béo.'],
    ['Gà','lóng','Nhà đầu tư mới, ít kinh nghiệm, dễ nghe theo người khác.','Ai cũng từng là gà; đáng sợ là làm gà mãi không chịu lớn.'],
    ['Cá mập','lóng','Nhà đầu tư vốn lớn, đủ sức làm giá một mã cổ phiếu.','Cá mập không cần bơi nhanh, chỉ cần há miệng đúng chỗ.'],
    ['Tay to','lóng','Như cá mập: người hoặc nhóm có nhiều tiền, đủ sức chi phối giá.','Tay to thì vỗ một cái là cả bảng điện rung rinh.'],
    ['Đội lái','lóng','Nhóm người phối hợp đẩy giá lên rồi bán ra kiếm lời. Hành vi này có thể vi phạm pháp luật.','Lái xe thì cần bằng, lái giá thì có ngày cần luật sư.'],
    ['Phím hàng','lóng','Mách mã cổ phiếu nên mua, thường không kèm lý do rõ ràng.','Phím hàng miễn phí thường là thứ đắt nhất trên đời.'],
    ['Hàng về','lóng','Cổ phiếu mua đã về tài khoản và được phép bán.','Hàng về là lúc biết mình vui hay mình... gồng.'],
    ['Gồng lỗ','lóng','Cố giữ cổ phiếu đang lỗ, chờ giá hồi về.','Gồng mãi thì thành lực sĩ, nhưng tài khoản thì gầy rộc.'],
    ['Gồng lãi','lóng','Giữ cổ phiếu đang lãi để chờ lãi thêm.','Kiểu gồng hiếm thấy nhất trên sàn chứng khoán.'],
    ['Cắt lỗ','chuẩn','Bán chấp nhận lỗ để không lỗ thêm.','Như nhổ răng sâu: đau một lần, khỏi đau cả năm.'],
    ['Chốt lời','chuẩn','Bán ra khi đang lãi để biến lãi trên giấy thành tiền thật.','Lãi chưa chốt là lãi của thị trường, chưa phải của mình.'],
    ['All-in','lóng','Dồn toàn bộ tiền vào một mã.','Trứng một giỏ, giỏ rơi là làm trứng chiên.'],
    ['Call margin','chuẩn','Công ty chứng khoán yêu cầu nộp thêm tiền khi tài sản vay ký quỹ sụt giá.','Tiếng chuông đêm khuya đáng sợ nhất của dân chơi margin.'],
    ['Bán giải chấp','chuẩn','Công ty chứng khoán tự bán cổ phiếu khi khách không nộp đủ tiền ký quỹ.','Không phải mình bán, mà là "được" bán giúp, giá nào cũng bán.'],
    ['Trần','chuẩn','Mức giá cao nhất được phép trong phiên, hiện màu tím trên bảng điện.','Màu tím mộng mơ, ai mua được giá trần cũng mơ... được bán.'],
    ['Sàn','chuẩn','Mức giá thấp nhất được phép trong phiên, hiện màu xanh lơ.','Xanh lơ trên bảng điện, xanh mặt dưới bàn phím.'],
    ['Trắng bên mua','lóng','Giá sàn mà không ai đặt mua, muốn bán cũng không bán được.','Chợ đông người bán, không một bóng người mua.'],
    ['Bò và Gấu','chuẩn','Bò là thị trường tăng (húc sừng lên), Gấu là thị trường giảm (vả xuống).','Bò thì ai cũng thích cưỡi, Gấu đến thì ai cũng thành nhà đầu tư dài hạn.'],
    ['Cổ phiếu quốc dân','lóng','Mã có nhiều người Việt nắm giữ, quen mặt với số đông.','Quốc dân cùng mua, quốc dân cùng... gồng.'],
    ['Penny','lóng','Cổ phiếu giá thấp, vốn hóa nhỏ, giá biến động mạnh.','Rẻ là một chuyện, đáng tiền là chuyện khác.'],
    ['Xanh vỏ đỏ lòng','lóng','Chỉ số tăng nhưng phần lớn cổ phiếu lại giảm.','Nhìn VN-Index thì vui, nhìn danh mục thì buồn.'],
    ['Lướt sóng','lóng','Mua bán trong thời gian ngắn để ăn chênh lệch giá.','Lướt giỏi thì được sóng, lướt dở thì uống nước.'],
    ['Bull trap','chuẩn','Bẫy tăng giá: giá tăng như sắp bùng nổ rồi đột ngột quay đầu.','Cửa mở toang, bước vào mới biết là cái lồng.'],
    ['Room ngoại','chuẩn','Tỷ lệ tối đa nhà đầu tư nước ngoài được sở hữu ở một doanh nghiệp.','Phòng VIP có hạn, khách Tây phải xếp hàng.'],
    ['Khối ngoại','chuẩn','Nhóm nhà đầu tư nước ngoài, được thống kê mua bán riêng mỗi phiên.','Ông khách Tây mua thì cả chợ ngó, bán thì cả chợ run.'],
    ['Bơm tiền / Hút tiền','chuẩn','Ngân hàng Nhà nước cho ngân hàng vay thêm (bơm) hoặc thu tiền về (hút).','Van nước tổng của hồ tiền, mở hay khép là cả làng biết.']
  ]
};
