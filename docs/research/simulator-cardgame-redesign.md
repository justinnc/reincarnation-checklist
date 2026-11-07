# Thiết kế lại "Sổ trọng sinh" thành một trò chơi bài thật (chỉ Việt Nam)

> Ngày nghiên cứu/truy xuất nguồn: 07/11/2026. Phạm vi: chỉ Việt Nam (bỏ hẳn chế độ Mỹ/quốc tế).
> Tài liệu này **thay thế phần thiết kế vòng chơi** trong `docs/research/simulator.md` (Phương án C: phân bổ danh mục theo năm). Phần dữ liệu và giấy phép trong tài liệu cũ vẫn còn giá trị tham khảo.
> Mọi nhận định về cơ chế của game khác đều trích nguồn bằng URL đã thực sự mở trong lượt này (danh sách ở cuối). Các con số trong game là **số làm tròn để chơi**, không phải số tài chính chính xác.

---

## Tóm tắt điều hành

- **Chẩn đoán:** bản v1 không phải là game bài, mà là một bảng tính có gắn thẻ. Người chơi phải chọn năm trong 31 năm, chọn độ khó (nhãn tiếng Anh), đọc một đoạn luật, rồi gõ số tiền VND vào 6 ô và bấm "Qua năm" 25–35 lần. Ngoài ra **toàn bộ dữ liệu `vn.json` chỉ sinh ra được 5 thẻ cơ hội** (chỉ 5 mốc có `returnMultiple`), nên phần lớn các năm không có thẻ nào. "Không thấy giá trị" và "khó hiểu" là hai triệu chứng của cùng một lỗi cấu trúc. Vá thêm không cứu được, cần thay vòng chơi.
- **Vòng chơi mới (một câu):** *Lật một lá bài lịch sử Việt Nam, lá bài ghi sẵn bỏ bao nhiêu tiền và mỗi kết quả nhận về bao nhiêu, bạn bấm NHẬN hoặc BỎ QUA (hoặc chọn 1 trong 2 lá), túi tiền nhảy lên/xuống ngay lập tức, rồi lật lá tiếp theo. 20 lượt, khoảng 3 phút.*
- **Mượn mô hình quen thuộc:** quẹt trái/phải trên một lá bài, mỗi lựa chọn đổi chỉ số ngay (Reigns [1][2]). "Bỏ tiền, lật bài, ăn hoặc mất" giống bài cào [13]. Thang tiền thưởng luôn hiển thị và quyền trợ giúp dùng một lần giống *Ai là triệu phú* [15]. Chi phí in sẵn trên lá, ngân sách nhìn thấy được (Slay the Spire, Hearthstone [7][10]).
- **Cái "chất trọng sinh" nằm ở luật chơi, không chỉ ở lời dẫn:** có hai loại lá. 🧠 **Ký ức** là con số bạn nhớ chắc. 🗣 **Tin đồn** là lời thiên hạ nói hồi đó, có thể đúng mà cũng có thể là **bẫy** lấy từ các vụ sập có thật (mua đuổi đỉnh VN-Index 2007, mua vàng đỉnh 2011, sốt đất…). Bạn có 3 lượt 💡 **Nhớ lại** để lật mặt thật một lá tin đồn. Mô phỏng Monte Carlo 4.000 ván cho thấy: người biết lịch sử (né bẫy) có trung vị khoảng 7,5 tỷ. Người nhận hết mọi lá được khoảng 2,3 tỷ, người chọn bừa khoảng 0,28 tỷ, người bỏ hết khoảng 40 triệu. **Kiến thức lịch sử thật sự quyết định điểm.**
- **Điểm số là một con số duy nhất, hiển thị suốt ván:** 💰 túi tiền (ví dụ "350 triệu"), kèm thang 6 bậc *Phàm nhân → Thiên mệnh chi tử* luôn nằm trên màn hình. Không có điểm 0–100 tính ở cuối, không có "tối ưu lý thuyết", không có khái niệm "giá trị thực/danh nghĩa".
- **Dữ liệu:** nội dung chữ dùng lại trực tiếp `vn.json` (tiêu đề, tóm tắt, `insiderTip`, `pitfalls`). Chỉ cần thêm **một bảng "chỉ số lá bài" khoảng 37 dòng** (25 lá ký ức, 6 lá bẫy, 6 lá biến cố), mỗi dòng 5–6 con số. Không cần nghiên cứu mới, chỉ cần khoảng 1 ngày biên tập. Dữ liệu giá theo năm `src/data/sim/vn.json` (CPI, tỷ giá, VN-Index…) **không cần cho game nữa**.
- **Code:** giữ `rng.ts` (seed tất định) và phần mã hoá/giải mã của `share.ts`. Bỏ hoàn toàn `engine.ts` (CPI thực/danh nghĩa, holdings, lãi tiết kiệm, `advanceYear`), `scoring.ts` (baseline/optimal/điểm log), `cards.ts`, và toàn bộ UI hiện tại. Lấy lại khoảng 6 câu chữ trong `events.ts` để làm lá biến cố.
- **Khối lượng:** khoảng 4–5 ngày công cho 1 dev (1 ngày engine và dữ liệu, 2 ngày UI lá bài, 1–2 ngày cân bằng và thử "15 giây" với người lạ).

---

## 1. Nghiên cứu: vì sao các game này hiểu được ngay

### 1.1 Game bài và game sự kiện "nhìn là hiểu"

| Game | Cơ chế duy nhất làm nó rõ ràng | Bằng chứng (đã mở) | Bài học cho Sổ trọng sinh |
|---|---|---|---|
| **Reigns** (Nerial) | **Một lá, hai lựa chọn.** Cố vấn hiện ra dưới dạng lá bài, người chơi chọn một trong hai câu trả lời, mỗi lựa chọn làm thay đổi một hoặc nhiều trong bốn chỉ số của vương quốc. Kéo lá sang phải là đồng ý. | Wikipedia: "The player can choose between two responses… which has an effect on one or more of the kingdom's four aspects"; "accepting a suggestion by moving the card to the right" [1]. Business Insider: Tinder phổ biến kiểu "swipe right for yes, or left for no" [2]. Nhà phát triển nói người chơi tự quyết nhịp quẹt nhanh hay chậm [3]. | Mỗi màn hình một lá, hai nút (hoặc quẹt). Hệ quả hiện ngay trên chỉ số ở đầu màn hình. |
| **Suzerain** (Torpor Games) | Đọc hội thoại rồi chọn trắc nghiệm, quyết định chính sách kinh tế. | "primarily based around character dialogue… followed by multiple-choice prompts"; quyết định gồm "market-driven or centrally planned economic policies" [4]. | **Phản ví dụ về độ dài:** hợp với game nhiều giờ chơi, không hợp mục tiêu 3 phút. Chỉ mượn ý "chọn 1 trong vài phương án có ghi hệ quả". |
| **Dominion** | Xây bộ bài: mỗi người tự rút từ bộ bài riêng và mua lá mới từ kho chung. | Wikipedia: "each player takes turns drawing from their own personal deck… players can purchase new cards from a common supply" [5]. Hướng dẫn: "The rules are simple, but the sheer number of card interactions can overwhelm beginners"; luật đề xuất dùng bộ "First Game" khi mới học [6]. | **Vì sao không thân thiện với người mới:** quyết định có giá trị *trì hoãn* (mua lá hôm nay, lá đó chỉ phát huy ở lượt sau), cộng với 10 lá Kingdom thay đổi mỗi ván và tương tác chồng chéo. Bản v1 của ta mắc đúng lỗi này: "khoá N năm" là một quyết định trì hoãn. **Ta không làm bộ bài của người chơi, mọi lá giải quyết ngay.** |
| **Slay the Spire** (Mega Crit) | **Chi phí in trên lá và ngân sách mỗi lượt nhìn thấy được:** đầu mỗi lượt có tay bài mới và 3 điểm năng lượng, đánh lá nào cũng được miễn đủ năng lượng. | "Each turn the player receives a fresh hand of cards and three energy points… as long as they have the energy to pay for the energy cost of each card" [7]. | Giá vào in to trên lá, túi tiền nằm cố định trên đầu, nên người chơi luôn biết mình đủ hay không đủ trước khi bấm. |
| **Hearthstone** (Blizzard) | Một tài nguyên rõ ràng (mana) giới hạn việc đánh lá. | "Players use their limited mana crystals to play abilities or summon minions" [10]. | Chỉ có **một tài nguyên duy nhất**: tiền trong túi. Không có USD, vàng, tiết kiệm hay "holding" song song. |
| **A Dark Room** | **Bắt đầu với một nút duy nhất,** cơ chế mở dần. | "Initially, the player can only light and tend a fire in the room… As the game progresses, the player gains the abilities to collect resources…" [8]. | Màn hình đầu chỉ có một nút "Lật lá đầu tiên". Thứ mới (💡 Nhớ lại, lá ngã ba) xuất hiện lần đầu khi cần, kèm đúng một dòng giải thích ngay trên lá. |
| **Klondike (solitaire)** | Một người chơi, mục tiêu nhìn thấy được (4 chồng A→K). | "The aim of the game is to build up four stacks of cards starting with Ace and ending with King" [24]. | Mục tiêu hiển thị liên tục (thang 6 bậc), không phải công thức ẩn chỉ tính ở cuối. |
| **Spiritfarer** | Ghi chú: game của **Thunder Lotus Games** (không phải Coffee Stain), thể loại "management sim" [9]. | Trang Wikipedia lấy về bị cắt ngắn. **Không trích được** mô tả vòng tương tác, nên không dùng làm căn cứ. | (Lỗ hổng truy xuất, xem mục 6.) |

### 1.2 Bài và trò chơi người Việt đã quen (mô hình tư duy có sẵn)

| Trò | Cơ chế làm nó dễ hiểu | Bằng chứng | Dùng thế nào |
|---|---|---|---|
| **Bài cào (ba cây)** | **Bỏ tiền, chia bài, so điểm, ăn bằng tiền cược hoặc mất trọn.** | "nếu điểm cao hơn nhà cái thì họ sẽ nhận số tiền bằng với số tiền cược, nếu thua thì sẽ mất toàn bộ số tiền đã đặt cược" [13]. | Mô hình "bỏ X, lật, thắng nhận Y / thua còn Z" mà hầu như người Việt nào cũng hiểu sẵn. **Khác biệt bắt buộc:** ta in rõ xác suất và kết quả *trước* khi bấm, dùng tiền ảo, và tránh từ "cược" trong giao diện (xem rủi ro ở mục 5). |
| **Tiến lên** | Lượt nào cũng chỉ có hai việc: **đánh lá cao hơn hoặc bỏ lượt**. Thứ hạng lá cố định (2 lớn nhất). | Bảng thứ hạng "2 A K Q J 10 9 8 7 6 5 4 3"; "The core rules are relatively simple" [11]. | Quyết định nhị phân "chơi / bỏ" trên từng lá. |
| **Phỏm (tá lả)** | Gom phỏm (bộ ít nhất 3 lá cùng giá trị hoặc liên tiếp), tính điểm theo lá. | "Các lá bài có cùng giá trị hoặc có các giá trị đứng liên tiếp nhau tạo thành một nhóm (ít nhất 3 lá)… được gọi là phỏm" [12]. | **Phản ví dụ:** quen nhưng phải gom bộ và tính điểm nhiều bước. Không mượn. |
| **Uno** | Một luật duy nhất để đánh: **khớp màu hoặc số**. Mục tiêu một câu. | "The aim of the game is to be the first player to play all of one's own cards" [14]. Được ghi nhận vì "fast pacing, wide age appeal" [14]. | Mục tiêu phải nói được trong một câu: "Lật hết 20 lá, càng giàu càng cao bậc." |
| **Ai là triệu phú** (VTV) | **Thang tiền luôn hiển thị, ba mốc chắc chắn, được dừng bất cứ lúc nào, các quyền trợ giúp mỗi quyền dùng một lần.** | "Có ba cột mốc quan trọng là câu số 5…, câu số 10… và câu số 15"; "quyền dừng cuộc chơi bất cứ lúc nào"; "tất cả các quyền trợ giúp chỉ được sử dụng một lần" [15]. | (1) Thang 6 bậc luôn nằm cạnh lá bài. (2) 3 lượt 💡 Nhớ lại, mỗi lượt dùng một lần. Đây là phép ẩn dụ "trợ giúp" mà người Việt đã quen hơn 20 năm. |

### 1.3 Game kinh tế và đời sống đơn giản: giữ mỗi lượt ở **một lựa chọn hiển nhiên**

| Game | Điều giữ quyết định ở mức "một lựa chọn" | Bằng chứng | Bài học |
|---|---|---|---|
| **High Society** (Knizia) | Mỗi lượt lật **một lá món hàng**, mỗi người chỉ có hai việc: **trả giá cao hơn hoặc bỏ**. Có lá đỏ nhân đôi hoặc chia đôi bộ sưu tập. Người còn ít tiền mặt nhất bị loại, dù đồ đáng giá nhất. | "Each successive player has the option to pass or make a higher bid"; "Promotion to Peerage… double", "Scandal… halves"; "The player with the lowest amount of cash remaining… is eliminated" [17]. | Lá bài có thể **nhân đôi hoặc chia đôi** túi tiền, cực kỳ dễ đọc. Ý "tham quá thì thua" đến từ chi phí, không cần thêm luật. |
| **For Sale** (Dorra) | "Each player has always the choice of either bidding or passing" [18]. | [18] | Thêm một lần xác nhận rằng hai nút (bỏ / chơi) là đủ để tạo căng thẳng. |
| **Welcome To…** | **Lật lá chung, mọi người chọn cùng lúc trong vài lá đang ngửa.** | "At the beginning of each turn, flip over the top card of each construction stack"; "everyone plays at the same time with the same cards" [19]. | Lượt "ngã ba": lật 2 lá cùng thời kỳ, chọn 1 (hoặc bỏ cả hai). Chế độ "Đề hôm nay" để mọi người chơi cùng một bộ bài và so kết quả. |
| **Wavelength** | Mỗi lượt là **một lá, một câu hỏi, một đáp án** được lộ ra ngay sau khi đoán. | "A Spectrum card is then drawn…"; "the sliding hatch is opened and the correct location… is revealed" [20]. | **Khoảnh khắc lật mặt** ngay sau lựa chọn. Với lá 🗣, sau khi chọn thì lộ "THẬT" hay "BẪY" cùng câu chuyện có thật. |
| **Buy Low Sell High** (Steam) | Tự giới thiệu là game chứng khoán "easy to learn, fast-paced", bắt đầu với 5.000 USD, **hơn 40 công ty, 8 ngành**, đọc tin để đoán xu hướng [16]. Đánh giá "Mixed", 46% trong 15 review tích cực [16]. | [16] | **Phản ví dụ:** "dễ học" nhưng vẫn mở rộng ra 40 mã và 8 ngành, và người chơi không mặn mà. Chứng khoán mở = bảng tính. Ta chỉ đưa ra **từng lá một**. *(Không xác minh được game nào tên "Buy Low Sell High" của Mike Mika, xem mục 6.)* |
| **Cookie Clicker** | **Một tài nguyên, một hành động:** bấm bánh quy lớn, được 1 bánh mỗi lần bấm, rồi dùng bánh mua thứ tự sinh bánh. | "the user initially clicks a big cookie on the screen, earning 1 cookie per click" [21]. | Một con số to (💰) tăng có hoạt ảnh đếm. Cảm giác "giàu lên" phải *nhìn thấy* được. Ta **không** mượn vòng lặp vô tận. |
| **Florence** (Mountains) | Kể chuyện bằng **chuỗi chương ngắn**, ít chữ, mỗi chương một tương tác nhỏ củng cố cảm xúc. | "little written dialogue… a series of brief chapters"; "20 chapters" [22]. | Mỗi lá là một "chương" về một năm, flavor text tối đa 1 câu. |
| **Device 6** (Simogo) | Văn bản là giao diện, quẹt để đi tiếp. | "uses mainly text… the player swipes the screen to move through or review the story" [23]. | Quẹt lá để đi tiếp, lịch sử ván chơi là chuỗi lá đã lật (không cần bảng nhật ký riêng). |

### 1.4 Rút ra: 6 quy tắc thiết kế

1. **Một màn hình, một lá (hoặc tối đa 2 lá), tối đa 2–3 nút.** [1][11][17][18]
2. **Hệ quả in trước, lộ ngay sau:** giá vào và hai kết quả viết bằng tiền cụ thể trên lá. Bấm xong là thấy kết quả và túi tiền nhảy ngay. [7][13][20]
3. **Một tài nguyên duy nhất:** 💰 tiền trong túi. [10][21]
4. **Không có quyết định trì hoãn:** không khoá vốn N năm, không danh mục đang nắm giữ. Đây là điểm khiến deck-builder khó với người mới [5][6].
5. **Mục tiêu và tiến độ luôn hiện:** thang bậc kiểu *Ai là triệu phú* [15], mục tiêu nói được trong một câu kiểu Uno [14].
6. **Mở cơ chế dần, giải thích ngay trên lá:** kiểu A Dark Room [8]. Không có màn hình luật.

---

## 2. Thiết kế mới: "Sổ trọng sinh — Bộ bài 1986"

### 2.1 Vòng chơi cốt lõi

> **Lật một lá bài lịch sử Việt Nam → lá ghi sẵn bỏ bao nhiêu tiền và hai kết quả có thể (kèm tỉ lệ "x/10") → bấm NHẬN hoặc BỎ QUA (hoặc chọn 1 trong 2 lá) → 10 ô tỉ lệ sáng chạy rồi dừng ở xanh hoặc đỏ, túi tiền đếm lên/xuống → lá tiếp theo.**

- **Mở đầu:** "Bạn vừa trọng sinh về năm 1986. Trong túi có 50 triệu." Một nút: **[Lật lá đầu tiên]**. Không chọn năm, không chọn độ khó.
- **Độ dài:** 20 lượt theo thứ tự thời gian 1986 → 2024. Mỗi ván dùng khoảng 23 lá (có lượt 2 lá). Mỗi lượt 5–10 giây, cả ván khoảng 2–4 phút.
- **Mục tiêu (một câu, in dưới thang bậc):** "Lật hết 20 lá, càng giàu càng lên bậc cao."
- **Kết thúc:** sau lá thứ 20 là lá "Năm 2025: chốt sổ".

### 2.2 Ba loại lượt (chỉ ba)

| Loại | Số lượt/ván | Người chơi làm gì | Ví dụ |
|---|---|---|---|
| **Lá đơn** (cơ hội) | ~13 | **NHẬN** hoặc **BỎ QUA** (hoặc quẹt phải/trái) | 1993: Mua đất đầm lầy Nam Sài Gòn |
| **Ngã ba** (2 lá cùng thời kỳ) | ~4 | Chạm chọn lá trái hoặc lá phải, hoặc **Bỏ cả hai** | 2000 REE phiên đầu ↔ 2001 xưởng may xuất khẩu Mỹ |
| **Biến cố** (không có lựa chọn) | ~3 | Chỉ bấm **Tiếp** | 1997: Cha mẹ ốm, −30 triệu |

Trên các lá 🧠/🗣 có thêm một yếu tố tuỳ chọn: **💡 Nhớ lại** (3 lượt mỗi ván). Bấm vào một lá 🗣 Tin đồn để lật mặt thật của nó (tin đúng hay bẫy, số liệu thật là gì). Lần đầu gặp lá 🗣, lá đó có một dòng chú thích: *"Bạn không nhớ rõ chuyện này. 💡 để nhớ lại."*

### 2.3 Hai loại lá: 🧠 Ký ức và 🗣 Tin đồn (cốt lõi trọng sinh)

Nếu mọi lá đều là cơ hội thật có lãi thì "nhận hết" luôn thắng, game hết căng (mô phỏng xác nhận: khi bộ bài chưa có bẫy, chiến lược "nhận hết" vượt 50 tỷ ở 68% số ván, còn "bỏ lá tỉ lệ thấp" chỉ đạt trung vị khoảng 14 tỷ, tức là chọn lọc bị trừng phạt). Giải pháp:

- **🧠 Ký ức** (khoảng 70% số lá): con số in trên lá là thật (đã làm tròn). Bạn nhớ chắc nên rủi ro chỉ đến từ thời điểm, thanh khoản, chính sách, và lấy từ trường `pitfalls`.
- **🗣 Tin đồn** (khoảng 30%): con số in trên lá là *điều thiên hạ tin lúc đó*. Một nửa số lá này là **tin đúng** (những thứ bị coi thường hồi đó nhưng cuối cùng thành thật: chuỗi cà phê 1996, sàn chứng khoán 2000, TMĐT 2010, crypto 2021). Nửa còn lại là **bẫy**, dựng từ chính các `pitfalls` trong `vn.json`: mua đuổi VN-Index đỉnh 3/2007, mua đuổi FPT 2007, mua vàng đỉnh 2011, sốt đất 2018, mua đuổi Axie 2022, mua đuổi VinFast sau phiên chào sàn 2023.
- Người thuộc lịch sử sẽ nhận ra bẫy. Người không thuộc thì **học được** ở màn hình lật mặt, kèm link "Chuyện thật →" dẫn tới trang mốc. Đây là phần **giá trị** mà bản v1 thiếu: game trở thành cửa vào cho 252 mốc của site.

### 2.4 Cấu tạo một lá bài (in trên **mọi** lá)

| # | Trường | Ví dụ | Nguồn dữ liệu |
|---|---|---|---|
| 1 | **Huy hiệu loại** | 🧠 KÝ ỨC / 🗣 TIN ĐỒN / ⚡ BIẾN CỐ | bảng chỉ số lá (mới) |
| 2 | **Năm** (chữ to nhất) | **1993** | `date` |
| 3 | **Biểu tượng** (emoji/icon theo nhóm) | 🏞️ đất, 📈 cổ phiếu, 🪙 vàng, ☕ kinh doanh, 💻 công nghệ, ₿ crypto | `category` |
| 4 | **Hành động** (bắt đầu bằng động từ, ≤ 8 chữ) | "Mua đất đầm lầy Nam Sài Gòn" | viết lại ngắn từ `opportunity.action` |
| 5 | **Một dòng chuyện** (≤ 1 câu) | "Ai cũng chê vùng sình lầy, nhưng bạn nhớ đại lộ sẽ mọc lên." | rút từ `insiderTip` / `summary` |
| 6 | **Giá vào** | "Bỏ ½ túi = **50 triệu**" (½ túi / ¼ túi / cả túi, đổi ra số tiền cụ thể) | bảng chỉ số lá |
| 7 | **Kết quả tốt** | 🟩 **9/10** · nhận về **300 triệu** (×6) | bảng chỉ số lá |
| 8 | **Kết quả xấu** | 🟥 **1/10** · còn **25 triệu** — "kẹt vốn, phải bán lỗ" | số: bảng chỉ số lá. Lý do: rút gọn `pitfalls` |
| 9 | **Thanh 10 ô** | `🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥`: tỉ lệ được *vẽ ra*, không chỉ viết ra | tính từ #7–8 |
| 10 | **Nút** | [✕ BỎ QUA] [✓ NHẬN] (+ 💡 nếu là lá 🗣) | — |
| 11 | **Mặt sau** (hiện sau khi chọn) | Kết quả, câu chuyện thật 2–3 dòng, link "Chuyện thật →" `/vn/<id>` | `summary`, `pitfalls`, `sources` |

**Quy tắc con số:** chỉ hiển thị số tiền tuyệt đối đã làm tròn (dưới 1 tỷ thì làm tròn tới 10 triệu, từ 1 tỷ trở lên thì làm tròn tới 0,1 tỷ). Hệ số ×N chỉ là chữ nhỏ phụ. Tỉ lệ luôn viết dạng "x/10". Không dùng %, CPI, "thực/danh nghĩa", "khoá N năm" hay "rủi ro vừa".

### 2.5 Khung giao diện (ASCII)

**Màn hình mở đầu**
```
┌──────────────────────────────────────┐
│            SỔ TRỌNG SINH             │
│                                      │
│   ┌──────────────────────────────┐   │
│   │            1986              │   │
│   │      Bạn vừa trọng sinh.     │   │
│   │  Trong túi: 💰 50 triệu.     │   │
│   │   Bạn nhớ hết 40 năm tới.    │   │
│   └──────────────────────────────┘   │
│                                      │
│       [  LẬT LÁ ĐẦU TIÊN  →  ]       │
│         Đề hôm nay · 07/11           │
└──────────────────────────────────────┘
```

**Màn hình một lượt (lá đơn)**
```
┌──────────────────────────────────────┐
│ 💰 100 triệu        Lá 2/20   💡💡💡 │  ← một con số + tiến độ + trợ giúp
│ ▓▓░░░░ Phàm nhân → Tiểu thương: 150tr│  ← thang bậc, luôn hiện
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ 🧠 KÝ ỨC                1993  │  │
│  │            🏞️                  │  │
│  │  Mua đất đầm lầy Nam Sài Gòn   │  │
│  │  "Ai cũng chê sình lầy — bạn   │  │
│  │   nhớ đại lộ sẽ mọc lên."      │  │
│  │ ────────────────────────────── │  │
│  │  Bỏ ½ túi:  50 triệu           │  │
│  │  🟩🟩🟩🟩🟩🟩🟩🟩🟩🟥             │  │
│  │  🟩 9/10 → nhận 300 triệu (×6) │  │
│  │  🟥 1/10 → còn 25 triệu        │  │
│  │          (kẹt vốn, bán lỗ)     │  │
│  └────────────────────────────────┘  │
│                                      │
│    [ ✕ BỎ QUA ]        [ ✓ NHẬN ]    │  ← hoặc quẹt trái/phải
└──────────────────────────────────────┘
```

**Lượt ngã ba (2 lá)**
```
┌──────────────────────────────────────┐
│ 💰 320 triệu        Lá 4/20   💡💡💡 │
│ ▓▓▓░░░ Tiểu thương → Trung lưu: 1 tỷ │
├──────────────────────────────────────┤
│   Chọn MỘT lá (hoặc bỏ cả hai)       │
│ ┌────────────────┐┌────────────────┐ │
│ │🗣 TIN ĐỒN  2000││🧠 KÝ ỨC    2001│ │
│ │      📈        ││      🧵        │ │
│ │Mua REE, SAM    ││Mở xưởng may    │ │
│ │phiên đầu tiên  ││xuất khẩu Mỹ    │ │
│ │Bỏ ½: 160tr     ││Bỏ ½: 160tr     │ │
│ │🟩6/10 → 640tr  ││🟩8/10 → 320tr  │ │
│ │🟥4/10 → 80tr   ││🟥2/10 → 80tr   │ │
│ │   [💡 nhớ lại] ││                │ │
│ └────────────────┘└────────────────┘ │
│           [ Bỏ cả hai ]              │
└──────────────────────────────────────┘
```

**Khoảnh khắc lật kết quả** (khoảng 1,2 giây, bấm để bỏ qua)
```
│  🟩🟩🟩🟩🟩🟩[🟥]🟩🟩🟩   ← đèn chạy rồi dừng
│        ✗  KHÔNG MAY
│  REE kẹt thanh khoản, bạn bán non.
│  💰 320 → 240 triệu   (rung đỏ, số đếm lùi)
│  Chuyện thật →           [ Lá tiếp → ]
```

**Màn hình kết thúc**
```
┌──────────────────────────────────────┐
│            NĂM 2025 — CHỐT SỔ        │
│              💰 8,4 tỷ               │
│          🏅 ĐẠI GIA  (bậc 4/6)       │
│   Thiếu 16,6 tỷ nữa là Tài phiệt     │
├──────────────────────────────────────┤
│ 20 lá của bạn:                       │
│ 🟩🟩⚡🟥🟩⛔🟩·🟩🟩⚡🟩🟥·🟩🟩⚡🟩·🟩  │
│ (🟩 thắng 🟥 thua · bỏ qua ⛔ né bẫy) │
│ Né được 3/4 bẫy · Dùng 💡 2/3        │
├──────────────────────────────────────┤
│ Nếu không làm gì:       40 triệu     │
│ Lá tiếc nhất: 2021 Axie, bạn đã bỏ   │
│   (lẽ ra +X tỷ) → Chuyện thật        │
├──────────────────────────────────────┤
│ [Chia sẻ]  [Chơi lại]  [Đề hôm nay]  │
└──────────────────────────────────────┘
```
Nội dung chia sẻ (văn bản thuần, không phải URL base64 dài):
`Sổ trọng sinh 07/11 · 🏅 Đại gia · 8,4 tỷ` + dải emoji 20 ô + link `/vi/simulator?d=20261107`.

### 2.6 Điểm và thang bậc (hiện suốt ván)

| Bậc | Túi tiền | Ghi chú |
|---|---|---|
| 1. Phàm nhân | < 150 triệu | Bắt đầu ở đây (50 triệu) |
| 2. Tiểu thương | 150 triệu – 1 tỷ | |
| 3. Trung lưu | 1 – 5 tỷ | Trung vị của người "nhận hết" (~2,3 tỷ) |
| 4. Đại gia | 5 – 25 tỷ | Trung vị của người "biết lịch sử" (~7,5 tỷ) |
| 5. Tài phiệt | 25 – 100 tỷ | |
| 6. Thiên mệnh chi tử | ≥ 100 tỷ | ~8% ván của người biết lịch sử |

Mô phỏng Monte Carlo (4.000 ván mỗi chiến lược, 14 lá ký ức + 4 lá bẫy mỗi ván, 2 biến cố −10%, 3 lượt 💡; chạy trong lượt nghiên cứu này, xem bảng chỉ số nháp ở mục 3.2):

| Chiến lược | Trung vị | P10 – P90 | Bậc phổ biến nhất |
|---|---|---|---|
| Bỏ qua hết | 40 triệu | — | Phàm nhân (100%) |
| Chọn ngẫu nhiên | ~0,28 tỷ | 0,04 – 2,6 tỷ | Tiểu thương |
| Nhận hết | ~2,3 tỷ | 0,2 – 28 tỷ | Trung lưu |
| Biết lịch sử (né bẫy) | ~7,5 tỷ | 0,7 – 82 tỷ | Đại gia |

Kết luận: kiến thức giúp tăng khoảng 3 lần so với "nhận hết", và khoảng 27 lần so với chọn bừa. May rủi vẫn đủ để đáng chơi lại. Cần chạy lại mô phỏng sau khi chốt bảng chỉ số (mục 4, ngày 4).

### 2.7 Ví dụ 5 lá đầu tiên của một ván thật (con số chính xác)

Túi ban đầu: **💰 50 triệu · Phàm nhân**.

| Lượt | Lá (mốc thật trong `vn.json`) | Trên lá in gì | Người chơi | Kết quả | 💰 sau lượt | Bậc |
|---|---|---|---|---|---|---|
| 1 | 🧠 **1986** · `vn-doi-moi-1986` · "Mở tiệm tạp hoá tư nhân" | Bỏ ½ = **25tr** · 🟩 8/10 → nhận **75tr** (×3) · 🟥 2/10 → còn **12tr** ("siêu lạm phát cuối 1980s ăn mòn tiền", từ `pitfalls`) | ✓ NHẬN | 🟩 thắng: 50 − 25 + 75 | **100 triệu** | Phàm nhân (thanh tiến độ: còn 50tr nữa) |
| 2 | 🧠 **1993** · `vn-phu-my-hung-land` · "Mua đất đầm lầy Nam Sài Gòn" | Bỏ ½ = **50tr** · 🟩 9/10 → nhận **300tr** (×6) · 🟥 1/10 → còn **25tr** ("kẹt vốn, thanh khoản thấp") | ✓ NHẬN | 🟩 thắng: 100 − 50 + 300 | **350 triệu** | ⬆ **Tiểu thương** (hoạt ảnh lên bậc) |
| 3 | ⚡ **1997** · Biến cố (`life_parent_illness` trong `events.ts`) "Cha mẹ ốm, bạn lo viện phí" | **−30 triệu** (cố định, in sẵn) | [Tiếp] | — | **320 triệu** | Tiểu thương |
| 4 | Ngã ba: 🗣 **2000** `vn-hose-first-session-2000` "Mua REE, SAM phiên đầu" ↔ 🧠 **2001** `vn-bta-2001` "Mở xưởng may xuất khẩu Mỹ" | Trái: ½ = **160tr** · 🟩 6/10 → **640tr** · 🟥 4/10 → **80tr** ("thanh khoản cực thấp"). Phải: ½ = **160tr** · 🟩 8/10 → **320tr** · 🟥 2/10 → **80tr** ("vụ kiện chống bán phá giá") | Chọn **trái** (không dùng 💡) | 🟥 thua: 320 − 160 + 80 | **240 triệu** | Tiểu thương (rung đỏ) |
| 5 | 🧠 **2006** · `vn-fpt-listing-2006` · "Gom FPT trên OTC, bán phiên chào sàn" (`returnMultiple: 2.5`) | **Cả túi** = **240tr** · 🟩 7/10 → **600tr** (×2,5) · 🟥 3/10 → **72tr** ("mua đuổi, rồi sập 2008") | ✓ NHẬN (tất tay) | 🟩 thắng: 240 × 2,5 | **600 triệu** | Tiểu thương (còn 400tr nữa là Trung lưu) |

Diễn biến túi tiền: **50 → 100 → 350 → 320 → 240 → 600 triệu**, khoảng 40 giây chơi.

**Xem trước lá 6** (lá bẫy đầu tiên): 🗣 **2007** "Mua thêm cổ phiếu khi VN-Index vượt 1.100, ai cũng đang lãi". Mặt trước in: ½ = 300tr · 🟩 8/10 → 900tr · 🟥 2/10 → 90tr. Người chơi bấm **💡 Nhớ lại** (còn 2), lá lật mặt: **BẪY** · 🟩 1/10 → 450tr · 🟥 9/10 → 90tr, kèm dòng "VN-Index đỉnh 1.170 ngày 12/3/2007, rồi rơi về 235 điểm tháng 2/2009" (từ `vn-vnindex-peak-2007` / `pitfalls`). Người chơi BỎ QUA và túi giữ nguyên 600 triệu. Trên dải kết quả cuối ván, lá này hiện thành ⛔ "né bẫy".

### 2.8 Ngẫu nhiên, Đề hôm nay, chia sẻ

- **Một seed quyết định cả ván:** rút lá nào cho ván (chọn khoảng 14/25 lá ký ức, 4/6 bẫy, 3/6 biến cố, xếp theo năm) và kết quả mỗi lần lật. Dùng lại `mulberry32` và `hashSeed`.
- **Đề hôm nay:** seed = `hashSeed("20261107")`. Mọi người cùng một bộ bài và cùng kết quả lật, nên khác biệt chỉ đến từ lựa chọn. Chia sẻ dải emoji kèm link `?d=YYYYMMDD`.
- **Replay đáng tin:** URL chia sẻ = seed + chuỗi lựa chọn (`N`/`S`/`L`/`R`/`💡`, khoảng 25 ký tự). (Bản v1 gửi `actions: []` nên không replay được, xem mục 4.3.)

---

## 3. Dữ liệu

### 3.1 Xác nhận: hầu như không cần nghiên cứu mới

- **Chữ:** dùng lại nguyên `src/data/milestones/vn.json` (28 mốc, 27 mốc `verified: true`) qua `getMilestones("vn")`: `title`, `summary`, `insiderTip`, `pitfalls`, `category`, `date`, `id` (để link). **Loại** `vn-mobile-phone-boom` vì `verified: false`.
- **Số:** chỉ 5/28 mốc có `opportunity.returnMultiple` (FPT 2,5; VN-Index đỉnh 3,6; vàng 2008–11 2,8; crypto 30; VinFast 3,7). Với các mốc còn lại, `estimatedReturn` là văn bản ("tăng hàng trăm lần", "lãi 50–100%"). Vì vậy **cần thêm một bảng chỉ số lá** viết tay, đã làm tròn, bám theo `estimatedReturn` và `pitfalls`, có nhãn "số làm tròn cho trò chơi".
- **Không cần** chuỗi giá theo năm (`src/data/sim/vn.json`: CPI, tỷ giá, lãi tiết kiệm, VN-Index, BTC). Game không quy đổi thực/danh nghĩa nữa. File có thể giữ lại cho việc khác hoặc xoá sau.

### 3.2 Bảng chỉ số lá: dạng dữ liệu đề xuất (`src/data/cardgame/vn-deck.ts`)

```ts
type Stake = "quarter" | "half" | "all";
interface CardStat {
  milestoneId: string;          // link vn.json (bẫy dùng id của mốc gốc)
  kind: "memory" | "rumor" | "event";
  verb: { vi: string };         // "Mua đất đầm lầy Nam Sài Gòn"
  icon: string;                 // "🏞️"
  stake: Stake;                 // event: không dùng
  win: { in10: number; mult: number };   // 9, 6
  lose: { mult: number; why: { vi: string } }; // 0.5, "kẹt vốn"
  shown?: { winIn10: number; winMult: number }; // chỉ cho bẫy: số "thiên hạ đồn"
  isTrap?: boolean;
  eventDelta?: number;          // event: -30_000_000 (cố định)
}
```

Bảng nháp đã dùng trong mô phỏng (cần biên tập lại; số liệu là giả định trò chơi, chỉ làm tròn theo hướng của `estimatedReturn`):

| id | Lá | Giá vào | 🟩 | 🟥 còn |
|---|---|---|---|---|
| vn-doi-moi-1986 | 🧠 | ½ | 8/10 ×3 | ×0,5 |
| vn-phu-my-hung-land | 🧠 | ½ | 9/10 ×6 | ×0,5 |
| vn-us-embargo-lift-1994 | 🧠 | ¼ | 8/10 ×3 | ×0,5 |
| vn-us-normalization-1995 | 🧠 | ¼ | 8/10 ×2 | ×0,5 |
| vn-coffee-chain-boom | 🗣 thật | ¼ | 4/10 ×8 | ×0 |
| vn-hose-first-session-2000 | 🗣 thật | ½ | 6/10 ×4 | ×0,5 |
| vn-bta-2001 | 🧠 | ½ | 8/10 ×2 | ×0,5 |
| vn-hnx-launch-2005 | 🧠 | ½ | 7/10 ×3 | ×0,5 |
| vn-vinamilk-listing-2006 | 🧠 | ½ | 9/10 ×2 | ×0,7 |
| vn-fpt-listing-2006 | 🧠 | cả | 7/10 ×2,5 | ×0,3 |
| vn-wto-accession-2007 | 🧠 | ½ | 6/10 ×3 | ×0,4 |
| vn-vingroup-listing-2007 | 🧠 | ½ | 7/10 ×4 | ×0,3 |
| vn-hoa-phat-listing-2007 | 🧠 | ½ | 7/10 ×3 | ×0,4 |
| vn-gold-surge-2008-2011 | 🧠 | ½ | 8/10 ×2,8 | ×0,7 |
| vn-vnindex-bottom-2009 | 🧠 | ½ | 7/10 ×3 | ×0,5 |
| vn-ecommerce-boom | 🗣 thật | ¼ | 3/10 ×10 | ×0 |
| vn-real-estate-slump-2011-2013 | 🧠 | ½ | 8/10 ×1,8 | ×0,8 |
| vn-ridehailing-grab-2014 | 🗣 thật | ¼ | 6/10 ×2 | ×0,5 |
| vn-mwg-listing-2014 | 🧠 | ½ | 8/10 ×4 | ×0,5 |
| vn-long-thanh-airport-2015 | 🧠 | ½ | 5/10 ×4 | ×0,3 |
| vn-vjc-listing-2017 | 🧠 | ½ | 6/10 ×2 | ×0,6 |
| vn-covid-bottom-2020 | 🧠 | ½ | 8/10 ×2,3 | ×0,6 |
| vn-crypto-boom-vietnam | 🗣 thật | ¼ | 3/10 ×30 | ×0 |
| vn-vinfast-nasdaq-2023 | 🧠 | ¼ | 4/10 ×3,7 | ×0,2 |
| vn-gold-surge-2024 | 🧠 | ½ | 9/10 ×1,3 | ×0,9 |
| *bẫy* ← vn-vnindex-peak-2007 | 🗣 bẫy | ½ | in 8/10 ×3 · thật 1/10 ×1,5 | ×0,3 |
| *bẫy* ← vn-fpt-listing-2006 (pitfalls) | 🗣 bẫy | ½ | in 8/10 ×2 · thật 1/10 ×1,3 | ×0,3 |
| *bẫy* ← vn-gold-surge-2008-2011 (đỉnh 2011) | 🗣 bẫy | ½ | in 8/10 ×2 · thật 1/10 ×1,2 | ×0,6 |
| *bẫy* ← vn-long-thanh-airport-2015 (sốt đất) | 🗣 bẫy | ½ | in 7/10 ×3 · thật 2/10 ×1,5 | ×0,3 |
| *bẫy* ← vn-crypto-boom-vietnam (mua đuổi 2022) | 🗣 bẫy | ¼ | in 6/10 ×5 · thật 1/20 ×2 | ×0,05 |
| *bẫy* ← vn-vinfast-nasdaq-2023 (mua đuổi) | 🗣 bẫy | ¼ | in 6/10 ×3 · thật 1/20 ×1,5 | ×0,2 |
| 6 biến cố ← `events.ts` (đám cưới, con chào đời, cha mẹ ốm, thưởng Tết, bị lừa, khủng hoảng 2008/COVID) | ⚡ | — | số cố định in sẵn, ví dụ −30tr / +20tr / −10% túi | — |

*Lưu ý tính nhất quán:* mỗi lá bẫy phải trỏ về mốc gốc và câu `pitfalls` tương ứng, để lúc "lật mặt" chỉ trích nội dung đã có nguồn trong `vn.json`, không tự bịa thêm sự kiện.

---

## 4. Kế hoạch xây dựng

### 4.1 Tái sử dụng hay bỏ (engine `src/lib/sim`)

| File | Quyết định | Lý do |
|---|---|---|
| `rng.ts` (`mulberry32`, `hashSeed`, `weightedPick`) | **Giữ nguyên** (+ `rng.test.ts`) | Seed tất định vẫn là nền của Đề hôm nay và replay |
| `share.ts` | **Giữ** `encodeShare`/`decodeShare`/`todaySeedString`, **đổi** kiểu payload thành `{v:2, seed, choices: string}` | Payload cũ gắn với `GameConfig`/`Action` |
| `events.ts` | **Chỉ lấy chữ** của khoảng 6 sự kiện, đổi `effect` sang số tiền cố định | Hiệu ứng `pctOfNetWorth`, `heat`, `assetLoss` thuộc mô hình cũ |
| `types.ts` | **Bỏ phần lớn** (`Asset`, `YearlyPrices`, `Holding`, `ActiveCard`, `Action`, `GameState` v1). Giữ ý tưởng `RANKS` | Mô hình danh mục không còn |
| `engine.ts` | **Bỏ** (`toNominal/toReal`, CPI, lương theo tuổi, `advanceYear`, `applyActions`) | Không còn năm, tuổi, lạm phát, nắm giữ |
| `scoring.ts` | **Bỏ** (`baselineFinalReal`, `optimalFinalReal`, `rebirthScore` log 0–100) | Điểm mới = túi tiền + bậc theo ngưỡng cố định |
| `cards.ts` | **Bỏ** (`cardsFromMilestones` chỉ ra 5 thẻ, `lockYears`, cửa sổ năm `year-2..year+1`) | Thay bằng bộ bài từ bảng chỉ số |
| `data.ts`, `src/data/sim/vn.json` | **Không dùng cho game** | Có thể để dành cho trang khác |
| `engine.test.ts`, `scoring.test.ts` | **Viết lại** | |

Ước lượng: giữ khoảng 70/440 dòng (~15%), chủ yếu là RNG và share.

**Engine mới** (`src/lib/cardgame/`, thuần TS, khoảng 150 dòng):
- `buildDeck(seed, stats, milestones) → Turn[]`: 20 lượt theo năm, kiểu `single | fork | event`.
- `resolve(state, choice, rng) → { state, outcome }`: `choice ∈ accept | skip | left | right | none`.
- `recall(state, cardId)`: dùng 💡, lật số thật.
- `tierOf(wallet)`, `nextTierGap(wallet)`.
- `GameState = { seed, turnIndex, wallet, recallsLeft, history: {cardId, choice, win?}[] }`.
- Test: tất định theo seed, tổng tiền khớp ví dụ 50 → 600 ở mục 2.7, ngưỡng bậc, Đề hôm nay ổn định.
- Script cân bằng `scripts/balance-cardgame.ts`: Monte Carlo 4 chiến lược như mục 2.6, chạy trong CI để chặn trường hợp "nhận hết" ≥ "biết lịch sử".

### 4.2 Thành phần UI (`src/components/cardgame/`)

| Component | Việc |
|---|---|
| `CardGameApp` | Máy trạng thái `intro → turn → reveal → end`. Lưu `localStorage` để F5 không mất ván |
| `WalletHud` | 💰 số lớn có hoạt ảnh đếm, "Lá n/20", 💡×3 |
| `TierLadder` | Thanh 6 bậc, nhãn "còn X nữa lên <bậc>", hoạt ảnh lên bậc |
| `GameCard` | Đúng 11 trường ở mục 2.4. Hỗ trợ quẹt (pointer events) và 2 nút. Mặt sau là `CardBack` |
| `OddsBar` | 10 ô xanh/đỏ, kiêm "đèn chạy" khi lật kết quả |
| `ForkPair` | 2 `GameCard` cạnh nhau (mobile xếp dọc) + "Bỏ cả hai" |
| `EventCard` | Lá ⚡, một nút "Tiếp" |
| `RecallButton` | 💡, chỉ hiện trên lá 🗣 |
| `EndScreen` | Số cuối, bậc, dải emoji 20 ô, "nếu không làm gì", "lá tiếc nhất", 3 link "Chuyện thật", Chia sẻ / Chơi lại |

### 4.3 Những chỗ gây rối trong `SimulatorApp.tsx` hiện tại phải xoá/thay

| Dòng | Thứ hiện có | Vì sao gây rối | Thay bằng |
|---|---|---|---|
| 68–79 | Thanh trượt "Năm trọng sinh" 1990–2020 | Bắt quyết định 31 phương án trước khi hiểu game | Luôn bắt đầu 1986 |
| 80–93 | Nút độ khó `easy/normal/hard` (chữ Anh trong UI Việt) | Quyết định vô nghĩa với người mới, nhãn không dịch | Bỏ. Độ khó nằm trong bộ bài |
| 95–99 | Đoạn luật "Mỗi năm bạn sẽ nhận 1–2 thẻ… khoá vài năm…" | Phải đọc luật mới chơi được tức là đã thất bại tiêu chí 15 giây | Bỏ. Lá đầu tự giải thích |
| 53–62, 194 | `netWorthReal` thực ra cộng giá trị **danh nghĩa**, HUD ghi "Tài sản (danh nghĩa)", màn cuối lại ghi "Tài sản cuối (thực)" | Biệt ngữ, và đơn vị lệch giữa HUD với màn cuối (lỗi) | 💰 một con số, không có tính từ |
| 216–222 | Dòng thẻ "giá · khoá N năm · Rủi ro vừa" + "×3,6 (nếu đúng)" | Không có tỉ lệ, không có số tiền khi thua, khái niệm "khoá năm" | Kết quả tốt và xấu bằng tiền, tỉ lệ x/10 |
| (`cards.ts`) | Chỉ 5 mốc có `returnMultiple` nên chỉ có 5 thẻ cho 1990–2025 | Hầu hết các năm trống thẻ, "không thấy giá trị" | Bộ 37 lá |
| 237–274 | Lưới "Đầu tư tự do": 6 ô gõ VND, nút Mua, hiện `units.toFixed(4)`, nhãn `proxy/secondary` | Bảng tính, không phải game bài. Gõ số, đơn vị lẻ 4 chữ số, chữ Anh | Bỏ hoàn toàn |
| 276–281 | Nút "Qua năm X →" bấm 25–35 lần | Phần lớn lượt không có gì xảy ra | 20 lượt, lượt nào cũng có lá |
| 199–204 | Thông báo sự kiện năm chỉ có chữ, không có số tiền | Không thấy hệ quả | Lá ⚡ in sẵn ±tiền |
| 283–297, 148–160 | Hai bảng "Nhật ký" | Thông tin thừa, chỉ đọc | Dải 20 lá ở màn cuối |
| 113–141 | "Điểm Trọng sinh" 0–100 tính log giữa "gửi tiết kiệm" và "Tối ưu lý thuyết" | Không giải thích được, chỉ hiện lúc cuối | Túi tiền + bậc, hiện suốt ván |
| 117–120, 142 | URL chia sẻ base64 thô với `actions: []` | Không replay được (lỗi), không ai muốn dán | Văn bản ngắn + dải emoji + `?d=` |

*Ngoài phạm vi sửa của tài liệu này nhưng cần đổi khi triển khai:* lời dẫn trong `src/app/[lang]/simulator/page.tsx` ("Chọn năm trọng sinh, phân bổ vốn…") và câu miễn trừ nhắc CPI/tỷ giá/VN-Index. Sửa thành "Trò chơi bài dựa trên mốc lịch sử thật; con số đã làm tròn cho trò chơi, không phải khuyến nghị đầu tư."

### 4.4 Lịch (1 dev)

| Ngày | Việc | Xong khi |
|---|---|---|
| 1 | `vn-deck.ts` (37 lá), engine mới, test | Test tái tạo đúng chuỗi 50 → 600 |
| 2 | `GameCard`, `OddsBar`, `WalletHud`, `TierLadder`, quẹt | Chơi được lá đơn trên mobile |
| 3 | `ForkPair`, `EventCard`, 💡, `EndScreen`, chia sẻ, Đề hôm nay, `localStorage` | Chơi trọn 20 lượt |
| 4 | Script cân bằng, chỉnh bảng số. Viết lại copy trang | "biết lịch sử" > "nhận hết" > "ngẫu nhiên" > "bỏ hết" |
| 5 (đệm) | **Thử 15 giây** với 5 người chưa từng thấy game: không giải thích gì, đếm thời gian tới lần bấm đầu tiên có chủ đích, hỏi "bạn đang cố làm gì?" | ≥ 4/5 người trả lời đúng "làm giàu, lên bậc" trong 15 giây |

---

## 5. Rủi ro và câu hỏi mở

- **Cảm giác cờ bạc:** mô hình "bỏ tiền, lật bài" gần với bài cào [13]. Giảm thiểu bằng cách: không dùng tiền thật, không có nạp tiền hay loot box (giữ nguyên nguyên tắc ở `simulator.md`), không dùng từ "cược", "đặt cửa", "nhà cái" trong giao diện. Tỉ lệ luôn công khai trước khi chọn. Mỗi lá dẫn về câu chuyện lịch sử có nguồn.
- **Độ chính xác lịch sử và số liệu game:** con số trên lá là trừu tượng hoá. Cần nhãn rõ trên mỗi mặt sau: "Số làm tròn cho trò chơi. Chuyện thật →". Lá bẫy chỉ được trích `pitfalls` đã có nguồn.
- **Ít lá (25 ký ức) nên chơi lặp sẽ nhàm:** v2 có thể thêm lá từ `content-expansion.md` (quán net 1997–2002, bán hàng Facebook 2012–2016, Flappy Bird 2014, trà sữa 2012–2018) sau khi các mục đó được kiểm chứng.
- **Câu hỏi cho owner:** (1) Có muốn thêm "mốc an toàn" kiểu *Ai là triệu phú* [15] (qua lá 10 thì giữ chắc bậc) không? Đề xuất để v2, vì MVP cần càng ít khái niệm càng tốt. (2) Giữ tên "Sổ trọng sinh" hay đổi thành "Bộ bài trọng sinh" cho đúng thể loại?

---

## 6. Lỗ hổng truy xuất (đã nêu thẳng, không lấp bằng trí nhớ)

- **"Buy Low Sell High (Mike Mika)":** không tìm thấy. Game cùng tên tìm được là bản trên Steam (liên kết website redfox.games) [16]. Mọi nhận định ở trên chỉ áp dụng cho bản đó.
- **Spiritfarer:** là game của Thunder Lotus Games [9], không phải Coffee Stain. Trang lấy về bị cắt ngắn nên không trích được mô tả vòng tương tác.
- **Hearthstone:** chỉ trích được "limited mana crystals" [10]. Không trích các chi tiết khác về nhịp lượt.
- **Slay the Spire:** chỉ trích cơ chế năng lượng và chi phí [7]. Không khẳng định điều gì khác.
- **Trang BoardGameGeek For Sale** trả 403, nên dùng PDF luật trên qugs.org [18] thay thế.
- Các trò "Chiếc nón kỳ diệu", Balatro, Wordle chỉ được nhắc như cảm hứng thiết kế, **không** dùng làm căn cứ cho nhận định nào.

---

## Nguồn (truy xuất 07/11/2026)

1. Reigns (video game) — Wikipedia. https://en.wikipedia.org/wiki/Reigns_(video_game)
2. "'Reigns' is a fun smartphone game that combines Tinder with 'Game of Thrones'" — Business Insider. https://www.businessinsider.com/reigns-smartphone-game-tinder-game-of-thrones-android-ios-2017-2
3. "Why being trapped in a loop makes Reigns: Her Majesty so satisfying" — Game Developer. https://www.gamedeveloper.com/design/why-being-trapped-in-a-loop-makes-i-reigns-her-majesty-i-so-satisfying
4. Suzerain (video game) — Wikipedia. https://en.wikipedia.org/wiki/Suzerain_(video_game)
5. Dominion (card game) — Wikipedia. https://en.wikipedia.org/wiki/Dominion_(card_game)
6. Dominion — How to Play — gamenight.guide. https://www.gamenight.guide/games/dominion
7. Slay the Spire — Wikipedia. https://en.wikipedia.org/wiki/Slay_the_Spire
8. A Dark Room — Wikipedia. https://en.wikipedia.org/wiki/A_Dark_Room
9. Spiritfarer — Wikipedia. https://en.wikipedia.org/wiki/Spiritfarer
10. Hearthstone — Wikipedia. https://en.wikipedia.org/wiki/Hearthstone
11. Tiến lên — Wikipedia. https://en.wikipedia.org/wiki/Ti%E1%BA%BFn_l%C3%AAn
12. Phỏm — Wikipedia tiếng Việt. https://vi.wikipedia.org/wiki/Ph%E1%BB%8Fm
13. Bài cào — Wikipedia tiếng Việt. https://vi.wikipedia.org/wiki/B%C3%A0i_c%C3%A0o
14. Uno (card game) — Wikipedia. https://en.wikipedia.org/wiki/Uno_(card_game)
15. Ai là triệu phú — Wikipedia tiếng Việt. https://vi.wikipedia.org/wiki/Ai_l%C3%A0_tri%E1%BB%87u_ph%C3%BA
16. Buy Low Sell High — Steam. https://store.steampowered.com/app/934220/Buy_Low_Sell_High/
17. High Society (card game) — Wikipedia. https://en.wikipedia.org/wiki/High_Society_(card_game)
18. For Sale — luật chơi (PDF). https://www.qugs.org/rules/r172.pdf
19. Welcome To… — Game Rules — UltraBoardGames. https://www.ultraboardgames.com/welcome-to/game-rules.php
20. Wavelength (game) — Wikipedia. https://en.wikipedia.org/wiki/Wavelength_(game)
21. Cookie Clicker — Wikipedia. https://en.wikipedia.org/wiki/Cookie_Clicker
22. Florence (video game) — Wikipedia. https://en.wikipedia.org/wiki/Florence_(video_game)
23. Device 6 — Wikipedia. https://en.wikipedia.org/wiki/Device_6
24. Klondike (solitaire) — Wikipedia. https://en.wikipedia.org/wiki/Klondike_(solitaire)

*Ghi chú phương pháp:* số liệu mô phỏng ở mục 2.6 đến từ một script Monte Carlo chạy trong phiên nghiên cứu (4.000 ván mỗi chiến lược, bảng chỉ số nháp ở mục 3.2). Đó là bằng chứng cân bằng sơ bộ, chưa phải kết quả thử nghiệm với người chơi. Kiểm tra trích dẫn tự động bằng ledger: `not_observed`.
