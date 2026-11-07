# Nghiên cứu & thiết kế: "Giả lập trọng sinh" (Rebirth Simulator)

> Phạm vi: nghiên cứu sản phẩm tương tự, đề xuất thiết kế game, yêu cầu dữ liệu, kiến trúc kỹ thuật trên stack hiện tại (Next.js 16 + TS + Tailwind, static, không DB) và phạm vi MVP.
> Ngày khảo sát: 07/11/2026. Mọi số liệu về sản phẩm/nguồn dữ liệu bên ngoài đều có trích dẫn `[n]` (danh sách ở cuối). Nhận định thiết kế là ý kiến của người viết, không cần trích dẫn. Chỗ nào chưa kiểm chứng được đánh dấu **[chưa kiểm chứng]**.

## Tóm tắt điều hành

- **Hướng đi khuyến nghị: "Sổ trọng sinh" (Phương án C, lai)**: mỗi lượt = 1 năm, người chơi phân bổ vốn giữa 5–7 lớp tài sản có dữ liệu thật + rút "thẻ cơ hội" lấy từ 252 milestone sẵn có + sự kiện đời ngẫu nhiên theo seed. Kết thúc ở 2025, chấm điểm bằng **tài sản thực (đã trừ lạm phát)** so với hai mốc: "nằm im gửi tiết kiệm" và "trọng sinh hoàn hảo" do engine tự tính.
- **Bài học từ sản phẩm tương tự**: 人生重开模拟器 bùng nổ (3 ngày ~200 triệu lượt) nhờ phiên ngắn, ngẫu nhiên, dễ chia sẻ nhưng bị chê thiếu nội dung khi chơi lặp lại [1][2]; BitLife giữ chân bằng ribbon/kết cục và thử thách [3][4]; các game "quay lại quá khứ" đều phải giải bài toán *biết trước kết quả thì hết vui* bằng cách che tên/giá hoặc chấm điểm theo cách xử lý thay vì số tiền cuối [7][8].
- **Hindsight là tính năng, không phải lỗi** — đúng chất trọng sinh (truyện "trọng sinh 2010, gom 1 triệu BTC" [14][15]). Độ khó đến từ **ràng buộc thực tế**: vốn nhỏ theo tuổi, giới hạn tiếp cận (cá nhân VN không được tự mua cổ phiếu Mỹ [37][38]), sàn sập kiểu Mt. Gox 2014 [36], lạm phát VN 3 chữ số cuối thập niên 1980 [22], phí giao dịch, thuế, thanh khoản, "hiệu ứng cánh bướm".
- **Dữ liệu MVP khả thi** (đã kiểm tra thực tế): VN CPI (IMF WEO từ 1980 [22]; World Bank chỉ có từ 1996 [19]), USD/VND (World Bank, có lỗ hổng năm [20]), lãi tiết kiệm VN (World Bank từ 1993 [21]), VN-Index năm (từ 2000, nguồn CafeF/Yahoo [25][26][27]), vàng VND/lượng (SJC thật từ 2009 [29], trước đó quy đổi LBMA×tỷ giá [31]), S&P 500 tổng lợi nhuận + T-bill + vàng + BĐS Mỹ (Damodaran 1928–2025 [24]), US CPI (FRED [17]), BTC (Blockchain.com từ 08/2010 [33]).
- **Kiến trúc**: engine thuần TS, tất định (seeded RNG), dữ liệu là JSON tĩnh do script build sinh ra; state trong localStorage; chia sẻ bằng URL mã hóa *seed + nhật ký hành động* (người nhận replay lại được, chống sửa điểm); thẻ kết quả PNG vẽ bằng canvas phía client.
- **MVP 1–2 tuần**: chỉ VN (VND), năm khởi đầu 1990–2020, 6 tài sản (tiết kiệm, USD, vàng, VN-Index, BTC, "đất" dạng chỉ số ước lượng có gắn nhãn), ~15 sự kiện đời, thẻ cơ hội từ milestone `vn`, 3 độ khó, xếp hạng 6 bậc, thẻ chia sẻ, chế độ "Đề của ngày". Mỹ/USD là v2.
- **Rủi ro chính**: pháp lý (phải ghi rõ không phải tư vấn đầu tư), cảm giác "cờ bạc" (tránh mọi cơ chế nạp tiền/loot box), **giấy phép dữ liệu** (FRED cấm "scraping" và series có bản quyền bên thứ ba [18]; Coin Metrics CC BY-NC [34]; CoinGecko gói miễn phí chỉ 1 năm lịch sử và bắt buộc ghi nguồn [32]).

---

## 1. Sản phẩm tương tự & bài học

### 1.1 Bảng so sánh

| Sản phẩm | Cơ chế | Điều làm nên sức hút | Điểm yếu / bài học |
|---|---|---|---|
| **人生重开模拟器** (Life Restart Simulator, web) | Chọn 3 thiên phú ngẫu nhiên, chia 20 điểm cho nhan sắc/trí lực/thể chất/gia cảnh, rồi bấm qua từng tuổi [1][2] | 3 ngày ~2 亿 (200 triệu) lượt truy cập, ngày thứ 8 đạt 10 亿 lượt chơi [1][2]; thao tác cực đơn giản, hợp "摸鱼" (lướt lúc rảnh) [1]; sự kiện trào phúng kiểu "Pinduoduo mua Alibaba" [1]; giữ lại 1 thiên phú cho ván sau (meta-progression roguelike) [2] | Wikipedia ghi nhận nội dung trở nên thiếu khi chơi lặp quá nhiều; bản mobile có quảng cáo bị chê [2] |
| **BitLife** (mobile) | Sống từng năm một đời người bằng văn bản | 72 triệu "kiếp" được chơi trong 12 tháng ở các bản quốc tế; có hệ thống challenge [3]; **ribbon** – huy hiệu trên bia mộ tóm tắt cách bạn đã sống, 40 loại [4]; bản địa hóa hệ thống kinh tế theo vùng [3] | Bị phàn nàn là "money grab", nhiều quảng cáo/IAP [5][6] |
| **StockCram – Market Rewind** (web) | Thả vào một thời điểm lịch sử (1907, 1929, 1987…) với $10.000 giả, giá tương lai bị ẩn, quyết định theo tin tức trong ngày [7] | Phiên ~7 phút; **điểm chấm theo cách bạn xử lý tình huống, không phải số tiền cuối** [7] | Người biết lịch sử sẽ "ăn gian" — họ giải bằng cách chấm điểm hành vi |
| **주식 타임머신 / Stock Time Machine** (Android) | Giá cổ phiếu thật + tin tức cùng thời; **giá được quy đổi thành số mới, giữ nguyên tỉ lệ biến động** để người chơi không đoán ra mã/thời điểm [8] | Đặt đúng câu hỏi "nếu quay lại quá khứ thì có thật sự lời không?" [8] | Che dữ liệu = đi ngược tinh thần trọng sinh của chúng ta (ta *muốn* người chơi nhớ) |
| **Market-Replay** (GitHub, Next.js 16) | Replay thị trường Anh từng phiên, khóa hindsight, so với benchmark; "engine mô phỏng thuần, tất định" có Vitest + Playwright [9] | Cùng stack với dự án, chứng minh kiến trúc client-side tất định là khả thi [9] | Thiên về công cụ học, không có yếu tố "đời người" |
| **officialdata.org / DQYDJ** (máy tính "nếu đã đầu tư") | Nhập số tiền + năm → giá trị hôm nay, có tái đầu tư cổ tức và điều chỉnh lạm phát [10][11] | Một câu trả lời "wow" tức thì ($100 năm 1957 → ~$119.364 năm 2026; thực ~6,82%/năm) [10] | Không có lựa chọn, không có câu chuyện → xem một lần rồi thôi. Nhưng **cách trình bày "danh nghĩa vs thực"** là chuẩn mực nên học |
| **Investopedia Simulator** | Giao dịch tiền ảo trên >6.000 mã NYSE/Nasdaq theo thời gian thực [12] | Học thực hành, giải đấu | Thời gian thực → không hợp premise quá khứ |
| **Stock Market Tycoon: Challenge** (Steam) | Thi đấu đầu tư thời gian thực [13] | — | 61,68% đánh giá tích cực trên 54 review [13] — ví dụ sim tài chính "khô" khó giữ chân **[đánh giá định tính của người viết]** |

### 1.2 Truyện trọng sinh định hình kỳ vọng thế nào

- Motif chuẩn: nhân vật nghèo/bệnh trở về một năm cụ thể với ký ức nguyên vẹn rồi "gom" tài sản biết chắc sẽ tăng: *"先10倍杠杆股票。先购1000套房产。先存100万枚比特币"* (đòn bẩy 10 lần cổ phiếu, mua 1000 căn nhà, trữ 1 triệu BTC) [14]. Bản Việt hóa/review trên YouTube cũng theo khuôn "trọng sinh về 2010… gom Bitcoin giá rẻ" [15].
- Hệ quả thiết kế: (a) người chơi **mong được dùng ký ức** — đừng che giá như Stock Time Machine; (b) cái hay của truyện là **khó khăn khi thực thi** (không có vốn ban đầu, gia đình phản đối, pháp luật, bị nghi ngờ). Game phải mô phỏng *ma sát* chứ không phải *mù thông tin*. Chương đầu của truyện điển hình là "kiếm được 2000 tệ", "thùng vàng đầu tiên" [14] → vòng chơi đầu nên là **kiếm vốn mồi**, không phải nhảy thẳng vào BTC.

### 1.3 Rút ra cho thiết kế

1. Phiên ngắn (5–10 phút), bấm "qua năm" là tiến — học 人生重开 [1].
2. Có kết cục/huy hiệu tóm tắt "kiếp này" (ribbon) [4] + một chỉ số dễ khoe.
3. Cùng một đề cho mọi người mỗi ngày + kết quả chia sẻ được mà không lộ đáp án — ba thuộc tính "chịu lực" của Wordle-like [16].
4. Đo cả "danh nghĩa" và "thực" như officialdata [10] — đây cũng là bài học giáo dục quan trọng với VN (lạm phát 1986–1988 trên 350%/năm [22]).
5. Không quảng cáo xâm lấn/IAP (bài học BitLife [5][6]; cũng tránh cảm giác cờ bạc).

---

## 2. Đề xuất thiết kế game

### 2.1 Ba phương án

**Phương án A — "Máy tính có lựa chọn" (Portfolio Sandbox)**
- Mỗi năm: chia % vốn giữa các lớp tài sản; năm sau áp lợi nhuận thật. Không sự kiện, không tuổi.
- (+) Dễ làm nhất (≈ 3–4 ngày), dữ liệu ít, minh bạch. (−) Với hindsight, lời giải tối ưu hiển nhiên ("all-in tài sản tăng mạnh nhất năm đó") → hết vui sau 1–2 ván. Không có chất "đời người".

**Phương án B — "Kiếp người" (BitLife-like narrative)**
- Sống từ tuổi X, có học vấn, nghề, gia đình, sức khỏe, quan hệ; đầu tư chỉ là một nhánh.
- (+) Giữ chân tốt, nhiều nội dung viral. (−) Nội dung viết tay khổng lồ, khó cân bằng, lệch khỏi lõi giá trị của site (dữ liệu tài chính có nguồn). 4–8 tuần trở lên.

**Phương án C — "Sổ trọng sinh" (khuyến nghị): lõi A + ma sát thực tế + thẻ cơ hội từ milestone + sự kiện đời nhẹ**
- Lõi là phân bổ vốn theo năm với dữ liệu thật, nhưng **lời giải tối ưu bị chặn bởi ràng buộc** (mục 2.3) và mỗi năm có 1–3 "thẻ" (cơ hội từ milestone + biến cố đời theo seed) buộc người chơi đánh đổi.
- (+) Tái dùng 252 milestone (mỗi thẻ link về trang chi tiết → tăng traffic nội bộ); có thể bắt đầu nhỏ và mở rộng nội dung dần. (−) Cần cân bằng; cần viết ~15–30 sự kiện.

| Tiêu chí | A | B | C |
|---|---|---|---|
| Công sức MVP | Thấp | Rất cao | Trung bình |
| Độ khó thú vị với hindsight | Thấp | Cao | Cao |
| Tận dụng dữ liệu milestone | Thấp | Trung bình | **Cao** |
| Rủi ro sai dữ liệu | Thấp | Cao | Trung bình |
| Khả năng chia sẻ | Trung bình | Cao | Cao |

### 2.2 Vòng chơi cốt lõi (Phương án C)

1. **Thiết lập**: chọn quốc gia (MVP: VN), năm trọng sinh (slider có sẵn trên site), tuổi lúc trọng sinh (mặc định 18), độ khó. Vốn mặc định theo độ khó (vd. Dễ: 50 triệu VND quy về giá năm 2025; Thường: 10 triệu; Khó: 0 đồng + lương). Vốn nhập vào được **quy đổi theo CPI về năm khởi đầu** để "10 triệu" có cùng sức mua ở mọi năm — nếu không, 10 triệu năm 1990 là cả gia tài.
2. **Mỗi lượt = 1 năm**:
   - Đầu năm: nhận thu nhập (lương theo tuổi/độ khó, có thể tiết kiệm %), rút 1–3 thẻ.
   - Hành động: mua/bán tài sản (theo VND), nhận/bỏ thẻ cơ hội, trả chi phí sự kiện.
   - Cuối năm: engine áp lợi nhuận năm thật, phí, thuế, lạm phát, sự kiện ngẫu nhiên; hiện "nhật ký năm" 2–3 dòng kiểu 人生重开.
3. **Kết thúc** ở 2025 (hoặc năm cuối có dữ liệu): bảng tổng kết, xếp hạng, ribbon, thẻ chia sẻ.

**Độ mịn lượt: năm (không dùng quý).** Lý do: dữ liệu VN theo quý trước 2000 gần như không có; phiên 25–35 lượt ≈ 5–10 phút; quý sẽ gấp 4 số lần bấm. Ngoại lệ: các sự kiện trong năm (sập Mt. Gox tháng 2/2014 [36], khủng hoảng 2008) được mô phỏng bằng **"giá giữa năm"/drawdown trong năm** gắn với thẻ, không cần chuỗi quý.

### 2.3 Ràng buộc giữ độ khó dù biết trước tương lai

| Ràng buộc | Cách mô phỏng | Cơ sở |
|---|---|---|
| **Giới hạn vốn theo tuổi** | Trước 18 tuổi không mở tài khoản; vốn mồi nhỏ; thu nhập tăng theo tuổi | Thiết kế |
| **Giới hạn tiếp cận theo năm** | Tài sản chỉ "mở khóa" khi tồn tại: VN-Index từ 28/7/2000 (100 điểm, chỉ REE và SAM) [26]; BTC có giá giao dịch từ 08/2010 [33] | [26][33] |
| **Giới hạn pháp lý/xuyên biên giới** | Người VN không mua thẳng cổ phiếu Mỹ: NĐ 135/2015 chỉ cho cá nhân đầu tư gián tiếp ra nước ngoài qua ESOP [37]; cá nhân cư trú không được tự chuyển tiền ra nước ngoài mua chứng khoán [38]. Trong game: "Cổ phiếu Mỹ" chỉ mở qua thẻ *Du học/Định cư/Việt kiều* (tốn vốn + vài năm) | [37][38] |
| **Lạm phát** | Điểm chính tính theo giá trị thực; tiền mặt VND bị bào mòn (lạm phát VN 1986: 453,5%, 1988: 374,4% [22]) | [22] |
| **FX** | Giữ USD có lợi/thiệt theo USD/VND (World Bank, bình quân năm [20]) | [20] |
| **Phí & thuế** | Phí giao dịch % mỗi lần mua/bán; thuế 0,1% khi bán chứng khoán VN; chênh lệch mua–bán vàng **[tham số giả định, cần đối chiếu quy định từng giai đoạn — chưa kiểm chứng]** | — |
| **Rủi ro đối tác/sàn sập** | BTC giữ trên "sàn" có xác suất mất trắng; năm 2014 nếu giữ trên Mt. Gox → mất (Mt. Gox xử lý >70% giao dịch BTC đầu 2014 rồi ngừng hoạt động, nộp đơn phá sản tháng 2/2014 [36]). Tự giữ ví lạnh tốn "điểm kỹ năng" + có xác suất mất khóa | [36] |
| **Thanh khoản/khóa vốn** | Đất: mua/bán mất 1 năm, phí cao, không bán từng phần; tiết kiệm có kỳ hạn rút sớm mất lãi | Thiết kế |
| **"Hiệu ứng cánh bướm"** | Vị thế quá lớn so với thị trường (vd. >X% vốn hóa VN-Index đầu những năm 2000) → trượt giá phạt; quá "thần" liên tục → thanh **"Thiên cơ"** tăng, đến ngưỡng kích hoạt biến cố (bị điều tra thuế, người nhà vay tiền, lừa đảo) | Thiết kế, đúng motif truyện |
| **Ký ức mờ dần** (tùy độ khó) | Ở độ Khó, gợi ý từ milestone chỉ cho biết *hướng* (tăng/giảm), không cho biên độ | Thiết kế |
| **Biến cố đời** | Seeded: ốm đau, cưới hỏi, cha mẹ cần tiền, mất việc, trúng thưởng nhỏ — chi phí tính theo % thu nhập | Thiết kế |

### 2.4 Hành động trong game

- `buy` / `sell` tài sản (theo số tiền VND).
- `deposit` tiết kiệm có kỳ hạn 1 năm (lãi = lãi suất huy động bình quân năm [21]).
- `takeCard` / `skipCard`: thẻ cơ hội từ milestone (vd. "Mở cửa hàng tư nhân sau Đổi Mới" — `vn-doi-moi-1986`), thẻ có chi phí, thời gian khóa, `returnMultiple` lấy từ dữ liệu milestone kèm biến động ngẫu nhiên theo `risk`.
- `learn` (v2): kỹ năng mở khóa hành động (ví lạnh, ngoại ngữ → du học, kế toán → giảm phí thuế).
- `startBusiness` (v2): dòng tiền hàng năm theo mô hình đơn giản.

### 2.5 Chấm điểm

- **Chỉ số chính: Tài sản thực cuối kỳ (VND theo giá 2025)** — tính bằng CPI VN. Hiển thị phụ: danh nghĩa VND, quy USD (tỷ giá 2025), và **CAGR thực**.
- **"Điểm Trọng sinh" 0–100**: vị trí của người chơi giữa hai mốc engine tự tính cùng ràng buộc:
  - *Phàm nhân* (baseline): toàn bộ vốn gửi tiết kiệm mỗi năm.
  - *Thiên mệnh* (optimal): lời giải tốt nhất dưới cùng ràng buộc (quy hoạch động/greedy theo năm trên tập tài sản mở khóa, có phí). Dùng thang log: `score = 100 × (ln W − ln W_base) / (ln W_opt − ln W_base)`, kẹp [0,100].
  - Lợi ích: so sánh công bằng giữa người chọn 1990 và 2015; tránh việc ai chọn 2010 + BTC luôn thắng.
- **Xếp hạng (6 bậc)**: Phàm nhân → Tiểu thương → Trung lưu → Đại gia → Tài phiệt → Thiên mệnh chi tử. Kèm **ribbon** (như BitLife [4]): "Ôm vàng qua bão", "Nạn nhân Mt. Gox", "Diamond hands", "Con nhà người ta", "Thua cả gửi tiết kiệm"…
- **Độ khó**: Dễ (vốn lớn, gợi ý đầy đủ, không sàn sập), Thường, Khó (vốn 0, ký ức mờ, Thiên cơ nhạy, phí cao). Điểm có hệ số theo độ khó.

### 2.6 Chia sẻ & "Đề của ngày"

- **Thẻ kết quả** (PNG, 1200×630 + 1080×1920 story): năm trọng sinh, vốn đầu → cuối (thực), hạng, ribbon, dải emoji mỗi năm (🟩 thắng lạm phát, 🟥 thua, 🟨 hòa, 💥 biến cố) — chia sẻ được mà không "spoil" chiến lược, đúng nguyên tắc Wordle-like [16].
- **Đề của ngày**: seed = `YYYYMMDD`, cố định năm trọng sinh/vốn/độ khó/chuỗi sự kiện cho mọi người; streak trong localStorage. Bảng xếp hạng toàn cầu cần backend → để v2 (hoặc dùng URL replay để "thách bạn bè").

---

## 3. Yêu cầu dữ liệu

### 3.1 Chuỗi thời gian cần cho thiết kế khuyến nghị (tần suất năm, 1980–2025)

Quy ước: mỗi tài sản lưu **lợi nhuận tổng năm** (đã gồm cổ tức/lãi nếu có) + **mức giá cuối năm** để hiển thị; mỗi quốc gia lưu CPI (chỉ số, bình quân năm hoặc cuối năm — phải thống nhất), FX so với USD, lãi suất phi rủi ro/tiết kiệm.

### 3.2 Danh sách tài sản tối thiểu

**Việt Nam (MVP)**

| Asset id | Ý nghĩa | Mở khóa | Nguồn khuyến nghị | Tình trạng kiểm tra |
|---|---|---|---|---|
| `vn_cash` | Tiền mặt VND | 1980 | — | — |
| `vn_savings` | Tiết kiệm 12 tháng | 1993 (trước đó giả định) | World Bank FR.INR.DPST (từ IMF IFS, CC BY 4.0) [21] | ✅ Đã gọi API: có 28 giá trị, từ 1993 (22,04%) đến 2023 (4,78%); **thiếu 1994–1996, 2024–2025** → bổ sung từ NHNN/báo chí **[chưa kiểm chứng]** |
| `vn_usd` | Giữ USD | 1986 | World Bank PA.NUS.FCRF (bình quân năm, nguồn IMF IFS) [20] | ✅ 40 giá trị; 2024 = 24.164,89 VND/USD. ⚠️ Năm 1983 trả về 1,0 và có năm trống → cần làm sạch thủ công |
| `vn_gold` | Vàng VND/lượng | 1980 | 2009+: giá SJC thật (giavang.org lưu từ 22/07/2009 [29]); 2000–2008: dải giá SJC theo năm (Finhay, đơn vị triệu đồng/lượng) [30]; trước 2000: **proxy** = LBMA PM × 37,5/31,1035 × tỷ giá (SimianX đã công bố bảng theo công thức này, vd. 1995 = 5.139.464 ₫/lượng, 2025 = 138.310.201 ₫/lượng) [31] | ✅ Có; ⚠️ SJC có chênh lệch lớn so với thế giới (đầu 2026 cao hơn ~17 triệu/lượng theo nguồn SimianX dẫn) [31] → ghi rõ "proxy" trước 2009 |
| `vn_index` | VN-Index (giá, chưa gồm cổ tức) | 2000 | Đóng cửa cuối năm từ CafeF/HOSE; bản CSV công khai 2005–2025 (2025 = 1.784,49) [25]; mốc 100 điểm ngày 28/7/2000 [26]; Yahoo `^VNINDEX.VN` [27]; vnstock (Python, nguồn TCBS/SSI) [28] | ✅ 2005–2025 đã xác nhận; ⚠️ 2000–2004 cần lấy thêm (Yahoo/vnstock) |
| `btc` | Bitcoin (USD → quy VND) | 2010 (giữa năm) | Blockchain.com Charts API, giá đầu tiên khác 0: 2010-08-18 = $0,07 [33]; FRED CBBTCUSD (Coinbase) chỉ từ 2014-12-01 [39] | ✅ Đã gọi API |
| `vn_land` | Đất/nhà (chỉ số ước lượng) | 1993 | **Không tìm thấy chuỗi giá nhà VN dài hạn công khai** — chỉ có CPI nhóm nhà ở/vật liệu (CEIC, trả phí) → MVP dùng chỉ số tự dựng, gắn nhãn "ước lượng", hoặc bỏ khỏi MVP | ❌ Chưa có nguồn đạt chuẩn |
| `vn_cpi` | Lạm phát VN | 1980 | IMF WEO (DataMapper PCPIPCH): có 1980→2031 (gồm dự báo) [22]; World Bank FP.CPI.TOTL.ZG chỉ có từ 1996 (30 giá trị trong 1980–2025) [19] | ✅ Dùng IMF cho 1980–1995, WB/GSO cho sau |

**Mỹ (v2 hoặc chế độ quốc tế)**

| Asset id | Nguồn | Tình trạng |
|---|---|---|
| `us_sp500_tr` | Damodaran "Historical Returns" 1928–2025: S&P 500 (gồm cổ tức), small cap, T-bill 3 tháng, T-bond 10 năm, Baa, **Real Estate, Gold** (vd. 2025: S&P +17,78%, vàng +66,22%) [24]; Shiller (giá, cổ tức, CPI theo tháng từ 1871) [23] | ✅ Một file đủ 7 lớp tài sản Mỹ |
| `us_tbill` | Damodaran [24] hoặc FRED TB3MS (từ 1934) [40] | ✅ |
| `us_cpi` | FRED CPIAUCSL (tháng, từ 1947) [17]; Damodaran cũng có cột Inflation [24] | ✅ |
| `us_gold`, `us_realestate` | Damodaran [24] | ✅ |
| `btc` | như trên | ✅ |
| Dự phòng giá chỉ số | Stooq (CSV không cần key) [35] | ⚠️ Endpoint `^spx` trả về trang kiểm tra JavaScript khi gọi bằng curl [41]; ghi chú của bên thứ ba cũng cảnh báo vượt giới hạn sẽ trả HTML [35] |

### 3.3 Giấy phép & lưu ý

- **World Bank** (deposit rate, FX, CPI): CC BY 4.0 [21] → được dùng, phải ghi nguồn.
- **IMF WEO**: điều khoản sử dụng **[chưa kiểm chứng trong khảo sát này]** — cần đọc trước khi phát hành.
- **FRED**: dùng tự do cho mục đích cá nhân/phi thương mại nếu ghi FRED là nguồn; **cấm "data mining, scraping or extraction"**; series có thông báo bản quyền thuộc bên thứ ba, muốn dùng ngoài mục đích cá nhân phải xin chủ sở hữu [18]. → Site có quảng cáo/thương mại thì **ưu tiên Damodaran/World Bank, dùng FRED chỉ ở bước build, lưu số tổng hợp năm, ghi nguồn**; kiểm tra từng series có copyright hay không.
- **Damodaran / Shiller**: dữ liệu công khai, nhưng **không thấy điều khoản giấy phép rõ ràng [chưa kiểm chứng]** → ghi nguồn đầy đủ, chỉ lưu lợi nhuận năm đã tổng hợp.
- **CoinGecko**: gói Demo miễn phí chỉ có lịch sử ngày 1 năm và bắt buộc ghi nguồn; giấy phép thương mại từ gói trả phí [32]. Đã thử API công khai: truy vấn ngày 31-12-2013 bị từ chối vì vượt 365 ngày. → Không dùng cho lịch sử.
- **Coin Metrics Community**: Creative Commons BY-NC 4.0 (phi thương mại) [34] → tránh nếu site có doanh thu.
- **Blockchain.com Charts API**: điều khoản **[chưa kiểm chứng]**; vì chỉ cần ~15 điểm cuối năm, rủi ro thấp nhưng vẫn cần ghi nguồn.
- **CafeF/Yahoo/vnstock (VN-Index)**: CSV công khai tự ghi "official: false", là bản phân phối lại của giá đóng cửa HOSE [25]; điều khoản Yahoo/CafeF **[chưa kiểm chứng]**. 21 con số đóng cửa cuối năm là sự kiện (fact) — rủi ro bản quyền thấp nhưng nên đối chiếu với báo cáo thường niên HOSE.
- **Giá vàng SJC**: các trang tổng hợp (giavang.org, Finhay) không công bố giấy phép **[chưa kiểm chứng]** → chỉ lấy ~25 điểm năm, trích nguồn, đối chiếu 2 nguồn.

---

## 4. Kiến trúc kỹ thuật

### 4.1 Tổng quan

```
scripts/build-sim-data.mjs   (chạy tay/CI, KHÔNG chạy lúc build Next)
  ├─ tải World Bank / IMF / Damodaran / Blockchain.com / CSV thủ công (vàng SJC, VN-Index)
  ├─ chuẩn hóa → lợi nhuận năm, CPI, FX
  └─ ghi src/data/sim/{vn,us}.json  + provenance (url, ngày tải, license)

src/lib/sim/
  ├─ types.ts        (kiểu dữ liệu, bên dưới)
  ├─ rng.ts          (mulberry32/sfc32 seeded, thuần)
  ├─ engine.ts       (reducer thuần: (state, action) => state; advanceYear(state, data))
  ├─ scoring.ts      (baseline, optimal DP, rank, ribbons)
  ├─ events.ts       (bảng sự kiện + điều kiện)
  ├─ cards.ts        (milestone → OpportunityCard)
  ├─ share.ts        (encode/decode URL, replay)
  └─ __tests__/      (vitest)

src/app/[lang]/simulator/page.tsx          (client component, static)
src/app/[lang]/simulator/result/page.tsx   (đọc ?s=, replay, vẽ thẻ)
```

- **Hoàn toàn phía client, tất định**: cùng `seed + config + actions[]` ⇒ cùng kết quả. Không dùng `Math.random`/`Date` trong engine.
- **Lưu trữ**: `localStorage["rc.sim.v1"]` = `{config, actions}` (không lưu state dẫn xuất → nhỏ, tự migrate được khi đổi data bằng cách replay). Có `dataVersion` để cảnh báo khi dữ liệu thay đổi.
- **Chia sẻ**: `?s=` = base64url( JSON nén {v, seed, country, startYear, startAge, capital, difficulty, actions} ). Hành động dạng mảng gọn `[yearIdx, op, assetIdx, amountPermille]`. 25–35 năm × vài hành động ≈ 1–2 KB → vừa URL. Người nhận replay để ra điểm — không thể sửa điểm trực tiếp (chống gian lận nhẹ). Dùng `CompressionStream` (có sẵn trên trình duyệt) nếu cần.
- **Thẻ kết quả**: vẽ `<canvas>` → PNG để tải/chia sẻ (Web Share API). OG image động cần server → v2 (site đang static).
- **Thực thi tiền tệ**: tính bằng `number` theo VND nguyên (đủ chính xác tới ~9×10^15); làm tròn ở bước hiển thị. Nếu cho vốn khổng lồ thì dùng `bigint` cho số dư — chưa cần ở MVP.

### 4.2 Phác thảo kiểu TypeScript

```ts
export type CountryCode = "vn" | "us";
export type AssetId =
  | "vn_cash" | "vn_savings" | "vn_usd" | "vn_gold" | "vn_index" | "vn_land"
  | "btc" | "us_sp500_tr" | "us_tbill" | "us_gold";

export interface Asset {
  id: AssetId;
  name: LocalizedText;
  currency: "VND" | "USD";
  /** Năm đầu tiên được phép mua (theo lịch sử) */
  availableFrom: number;
  /** Điều kiện mở khóa thêm (vd. cần thẻ "Du học" để mua cổ phiếu Mỹ) */
  requiresFlag?: string;
  feeBuy: number;      // tỷ lệ, vd 0.0015
  feeSell: number;
  taxOnSell?: number;  // tỷ lệ trên giá trị bán
  lockYears?: number;  // thanh khoản: số năm không bán được sau khi mua
  indivisible?: boolean;
  counterpartyRisk?: { year: number; lossPct: number; label: string }[]; // Mt.Gox 2014...
  dataQuality: "official" | "secondary" | "proxy" | "estimate";
  sourceIds: string[];
}

export interface YearlyPrices {
  country: CountryCode;
  dataVersion: string;
  years: number[];                             // [1980..2025]
  cpiIndex: Record<number, number>;            // base 2025 = 100
  fxPerUsd: Record<number, number>;            // VND per USD, bình quân năm
  riskFree: Record<number, number>;            // lãi tiết kiệm/T-bill
  /** Lợi nhuận tổng trong năm y (đầu năm → cuối năm), theo tiền tệ gốc của asset */
  returns: Record<AssetId, Record<number, number | null>>;
  /** Giá cuối năm để hiển thị */
  closes: Record<AssetId, Record<number, number | null>>;
  provenance: { seriesId: string; url: string; fetchedAt: string; license?: string }[];
}

export type Action =
  | { t: "buy"; asset: AssetId; amount: number }
  | { t: "sell"; asset: AssetId; amount: number }   // amount theo VND
  | { t: "deposit"; amount: number }
  | { t: "takeCard"; cardId: string }
  | { t: "skipCard"; cardId: string }
  | { t: "setSavingRate"; pct: number }
  | { t: "endYear" };

export interface GameEvent {
  id: string;
  kind: "life" | "market" | "karma";               // karma = do thanh "Thiên cơ"
  title: LocalizedText;
  text: LocalizedText;
  /** Điều kiện xuất hiện */
  when: { minYear?: number; maxYear?: number; minAge?: number; maxAge?: number; minHeat?: number; requiresHolding?: AssetId };
  weight: number;                                   // trọng số cho RNG
  effect:
    | { type: "cashDelta"; pctOfIncome?: number; pctOfNetWorth?: number; fixedReal?: number }
    | { type: "assetLoss"; asset: AssetId; pct: number }
    | { type: "setFlag"; flag: string; cost?: number; years?: number }
    | { type: "heatDelta"; delta: number };
}

export interface OpportunityCard {
  id: string;                 // = milestone.id
  year: number;
  cost: number;               // VND thực (giá 2025) — quy về danh nghĩa khi chơi
  lockYears: number;
  payoffMultiple: number;     // từ milestone.opportunity.returnMultiple
  risk: Level;                // dùng để rải ngẫu nhiên payoff
  milestoneHref: string;
}

export interface Holding { asset: AssetId; units: number; boughtYear: number; costBasis: number }

export interface GameState {
  v: 1;
  seed: number;
  rngState: number;
  config: { country: CountryCode; startYear: number; startAge: number; capitalReal: number; difficulty: "easy" | "normal" | "hard"; daily?: string };
  year: number;
  age: number;
  cash: number;               // VND danh nghĩa
  holdings: Holding[];
  pendingCards: OpportunityCard[];
  activeCards: { card: OpportunityCard; maturesYear: number; invested: number }[];
  flags: Record<string, number>;   // flag → năm hết hạn
  heat: number;                    // "Thiên cơ"
  log: { year: number; lines: LocalizedText[] }[];
  history: { year: number; netWorthNominal: number; netWorthReal: number }[];
  finished: boolean;
}
```

### 4.3 Kiểm thử

- Repo hiện **chưa có test runner** (package.json chỉ có `lint`, `validate`) → thêm `vitest` (devDependency).
- Unit: RNG tất định (cùng seed → cùng chuỗi); `advanceYear` với dữ liệu giả lập nhỏ; phí/thuế/lạm phát; Mt. Gox loss; khóa thanh khoản.
- **Property test**: replay(`encode(decode(x))`) bất biến; điểm baseline ≤ điểm người chơi tối ưu ≤ optimal; không có số âm/NaN.
- **Golden test**: vài ván kịch bản cố định (vd. "1990, 10 triệu, toàn vàng") → snapshot tài sản cuối; so tay với tính toán độc lập từ chuỗi gốc.
- **Data test** (mở rộng `scripts/validate-data.mjs`): đủ năm, không null trong khoảng `availableFrom`, CPI dương, lợi nhuận trong ngưỡng hợp lý (vd. −95%…+10.000%), mỗi series có provenance.
- E2E (tùy chọn): Playwright chơi 3 năm, chia sẻ, mở link replay — như Market-Replay làm [9].

---

## 5. Phạm vi, rủi ro, câu hỏi mở

### 5.1 MVP (~1–2 tuần, 1 dev)

| Hạng mục | Nội dung |
|---|---|
| Quốc gia | Chỉ **VN**, tiền VND, song ngữ vi/en (dùng `LocalizedText` sẵn có) |
| Năm trọng sinh | 1990–2020 (1980–1989 cần dữ liệu VN kém tin cậy → v2) |
| Tài sản | `vn_cash`, `vn_savings`, `vn_usd`, `vn_gold` (proxy trước 2009), `vn_index` (2000+), `btc` (2011+ để tránh giá ~0); `vn_land` **chỉ nếu** owner chấp nhận chỉ số ước lượng |
| Thẻ | Tự sinh từ milestone `vn` có `returnMultiple` + 3–5 milestone toàn cầu (BTC, Apple…) chỉ mở khi có flag "Du học" (v2) |
| Sự kiện | 15 sự kiện đời + 3 sự kiện thị trường (2008, Mt. Gox 2014, COVID 2020) |
| Chấm điểm | Tài sản thực, điểm Trọng sinh 0–100 (baseline/optimal), 6 hạng, ~8 ribbon |
| Chế độ | Tự do + "Đề của ngày" (seed theo ngày, streak localStorage) |
| Chia sẻ | URL replay + PNG canvas + dải emoji |
| Pháp lý | Disclaimer cố định trên màn hình chơi và kết quả, trang "Nguồn dữ liệu" |
| Kỹ thuật | Engine thuần + vitest + script build dữ liệu + validate |

### 5.2 v2

- Chế độ Mỹ/quốc tế (USD; Damodaran [24] đã đủ dữ liệu), sau đó cn/jp… dùng milestone sẵn có.
- Hệ kỹ năng/nghề, khởi nghiệp, đất với dữ liệu tốt hơn, đòn bẩy (vay mua nhà), thẻ "Du học/Việt kiều" mở cổ phiếu Mỹ.
- Meta-progression kiểu 人生重开: giữ 1 "thiên phú" sang ván sau [2].
- Bảng xếp hạng đề của ngày (cần backend nhỏ/edge function), OG image động.
- Thời kỳ 1980–1989 với siêu lạm phát, đổi tiền, tem phiếu.

### 5.3 Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Bị hiểu là **tư vấn đầu tư** | Cao | Disclaimer "Trò chơi giải trí/giáo dục dựa trên dữ liệu quá khứ, không phải khuyến nghị đầu tư"; không gợi ý tài sản tương lai; không link affiliate sàn |
| **Cảm giác cờ bạc** | Trung bình | Không tiền thật, không IAP/loot box, không "quay thưởng"; nhấn mạnh bài học lạm phát/rủi ro; ribbon hài hước cho người thua |
| **Giấy phép dữ liệu** | Trung bình | Ưu tiên World Bank (CC BY 4.0) [21] và Damodaran; tránh nguồn NC [34] nếu có thương mại; tuân thủ FRED (không scrape, ghi nguồn, kiểm tra series có bản quyền) [18]; lưu số năm tổng hợp, có trang provenance |
| **Sai dữ liệu VN** (vàng trước 2009 là proxy, VN-Index 2000–2004, lãi tiết kiệm thiếu năm, FX 1983 lạ) | Trung bình | `dataQuality` hiển thị cho người chơi; đối chiếu 2 nguồn; khóa năm khởi đầu ≥1990 ở MVP |
| **Vấn đề nhạy cảm chính trị/pháp lý VN** (vàng miếng độc quyền, chuyển tiền ra nước ngoài) | Thấp–TB | Văn phong trung tính, dẫn nguồn văn bản pháp luật; không hướng dẫn lách luật trong đời thực |
| **Cân bằng game** (lời giải hiển nhiên) | Trung bình | Chấm theo optimal có ràng buộc; Thiên cơ; playtest 10–20 ván trước khi ra mắt |

### 5.4 Câu hỏi mở cho owner

1. Site có/sẽ có **doanh thu** (quảng cáo, affiliate) không? Ảnh hưởng trực tiếp đến việc được dùng FRED, Coin Metrics, CoinGecko.
2. Chấp nhận **chỉ số đất/nhà ước lượng** (tự dựng, gắn nhãn) trong MVP, hay bỏ BĐS cho đến khi có nguồn tốt?
3. Năm trọng sinh sớm nhất cho MVP: 1990 (an toàn dữ liệu) hay muốn 1986 (Đổi Mới — đậm chất truyện nhưng dữ liệu yếu)?
4. Chấm điểm chính hiển thị theo **VND thực (giá 2025)** hay **USD**? (Đề xuất: VND thực, USD là phụ.)
5. Mức "nghiêm túc" vs "hài hước": văn phong sự kiện kiểu 人生重开 (trào phúng) hay giáo dục tài chính?
6. Có muốn **cho phép người chơi "phạm luật"** (vd. mua cổ phiếu Mỹ chui) với rủi ro bị phạt trong game, hay chặn hẳn?
7. "Đề của ngày" có cần bảng xếp hạng toàn cầu (cần backend) ngay, hay chỉ chia sẻ link thách bạn bè?
8. Vốn khởi đầu mặc định: 10 triệu VND (giá 2025) — có muốn thêm preset theo motif truyện ("347 đồng", "tiền chia tay") cho vui?
9. Ai sẽ **viết & duyệt nội dung sự kiện** (15–30 sự kiện, song ngữ)?
10. Đặt tên chính thức: "Giả lập trọng sinh", "Sổ trọng sinh" hay khác?

## Sources

[1] https://www.qbitai.com/2021/09/28407.html — QbitAI: 人生重开模拟器爆火出圈
[2] https://zh.wikipedia.org/wiki/%E4%BA%BA%E7%94%9F%E9%87%8D%E5%BC%80%E6%A8%A1%E6%8B%9F%E5%99%A8 — Wikipedia: 人生重开模拟器
[3] https://goodgamestudios.com/blog/72-million-virtual-lives-in-one-year-bitlife-impresses-internationally/2022/11/25 — Goodgame Studios: 72 million virtual lives (BitLife)
[4] https://bitlife-life-simulator.fandom.com/wiki/Ribbons — BitLife Wiki: Ribbons
[5] https://www.linkedin.com/posts/felix-braberg-7a732b51_bitlifes-aggressive-interstitial-monetization-activity-7340705985067450371-RR13 — Felix Braberg: BitLife monetization (LinkedIn)
[6] https://www.reddit.com/r/BitLifeApp/comments/1v6bfhl/why_dont_ppl_like_bitlife — Reddit r/BitLifeApp: Why don't ppl like BitLife?
[7] https://www.stockcram.com/tools/stock-market-game — StockCram Market Rewind
[8] https://play.google.com/store/apps/details?id=com.starry.stockreplay&hl=en_AU — Google Play: Stock Time Machine (주식 타임머신)
[9] https://github.com/josh-uk/Market-Replay — GitHub josh-uk/Market-Replay
[10] https://www.officialdata.org/us/stocks/s-p-500 — officialdata.org S&P 500 returns since 1957
[11] https://dqydj.com/stock-return-calculator — DQYDJ Stock Total Return Calculator
[12] https://www.investopedia.com/simulator — Investopedia Stock Simulator
[13] https://steamdb.info/app/3296800/stats — SteamDB: Stock Market Tycoon: Challenge
[14] https://fanqienovel.com/keyword/9585694 — Fanqie: 重生购买比特币小说
[15] https://www.youtube.com/watch?v=1byCj3g1x7Q — YouTube: Trọng sinh về năm 2010 gom Bitcoin
[16] https://neta.art/blog/wordle-after-wordle-daily-puzzle-variants — Neta: After Wordle - daily puzzle design
[17] https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL — FRED CPIAUCSL CSV
[18] https://fred.stlouisfed.org/legal — FRED Legal / Terms FAQ
[19] https://api.worldbank.org/v2/country/VNM/indicator/FP.CPI.TOTL.ZG?format=json&per_page=100&date=1980:2025 — World Bank API: VN inflation FP.CPI.TOTL.ZG
[20] https://data360.worldbank.org/en/indicator/WB_WDI_PA_NUS_FCRF?view=trend&country=VNM&minYear=1960&maxYear=2025 — World Bank Data360: Official exchange rate VNM
[21] https://data.worldbank.org/indicator/FR.INR.DPST?locations=VN — World Bank: Deposit interest rate Viet Nam
[22] https://www.imf.org/external/datamapper/api/v1/PCPIPCH/VNM — IMF DataMapper API: PCPIPCH VNM (WEO)
[23] https://shillerdata.com — Shiller data
[24] https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html — Damodaran: Historical Returns 1928-2025
[25] https://github.com/akitaonrails/worldreports/blob/main/countries/vietnam/data/markets/vnindex.csv — worldreports vnindex.csv (CafeF-derived)
[26] https://vtv.vn/25-nam-phien-giao-dich-chung-khoan-dau-tien-100250802114812031.htm — VTV: 25 năm phiên giao dịch chứng khoán đầu tiên
[27] https://finance.yahoo.com/quote/%5EVNINDEX.VN/history — Yahoo Finance: VNINDEX history
[28] https://github.com/vnstock-official/vnstock — GitHub vnstock
[29] https://giavang.org/trong-nuoc/sjc/lich-su — giavang.org: Lịch sử giá vàng SJC
[30] https://www.finhay.com.vn/gia-vang-qua-cac-nam — Finhay: Lịch sử giá vàng 2000-2026
[31] https://www.simianx.ai/vi/stories/gold-price-by-year-every-year-1971-2026-table — SimianX: Giá vàng qua các năm quy đổi VND/lượng
[32] https://www.coingecko.com/en/api/pricing.md — CoinGecko API pricing
[33] https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=true — Blockchain.com Charts API: market-price
[34] https://gitbook-docs.coinmetrics.io/packages/coin-metrics-community-data — Coin Metrics Community Data
[35] https://financialliterature.com/data/stooq — Stooq usage notes
[36] https://en.wikipedia.org/wiki/Mt._Gox — Wikipedia: Mt. Gox
[37] https://dantri.com.vn/kinh-doanh/con-sot-ipo-tro-lai-pho-wall-nguoi-viet-co-duoc-mua-co-phieu-my-20260610175904658.htm — Dân trí: Người Việt có được mua cổ phiếu Mỹ?
[38] https://www.dsc.com.vn/kien-thuc/gio-giao-dich-chung-khoan-quoc-te — DSC: Giờ giao dịch chứng khoán quốc tế (NĐ 135/2015)
[39] https://fred.stlouisfed.org/graph/fredgraph.csv?id=CBBTCUSD — FRED CBBTCUSD CSV
[40] https://fred.stlouisfed.org/graph/fredgraph.csv?id=TB3MS — FRED TB3MS CSV
[41] https://stooq.com/q/d/l/?s=^spx&i=y — Stooq ^SPX yearly CSV endpoint
