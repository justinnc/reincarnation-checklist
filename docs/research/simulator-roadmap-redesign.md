# Thiết kế lại "Sổ trọng sinh" thành **bàn cờ đường đời 1986 → 2024** (chỉ Việt Nam)

> Ngày nghiên cứu/truy xuất nguồn: 08/11/2026. Phạm vi: chỉ Việt Nam. Bản này **thay thế hoàn toàn** `/simulator` hiện tại (game lật bài 20 lá ở `src/lib/cardgame/*`, `src/components/cardgame/*`), không phải chế độ chơi thêm.
> Tài liệu này kế thừa và **không mở lại** các quyết định đã chốt ở `docs/research/simulator-cardgame-redesign.md`: công thức tiền `túi − tiền bỏ ra + tiền bỏ ra × hệ số`, mã hoá 😄/😢 bằng mặt cười + màu + chữ, định dạng tiền gọn kiểu Việt (`fmtVnd`), thang 6 bậc, 💡 Nhớ lại, Đề hôm nay theo seed, dữ liệu chỉ Việt Nam, không dùng từ "cược".
> Mọi nhận định về game khác đều trích từ URL đã thực sự mở trong lượt này (danh sách nguồn ở cuối, đánh số [n]). Mọi con số cân bằng đều từ một mô phỏng Monte Carlo chạy trên **đúng dữ liệu `deckData.ts` hiện có** trong lượt này (mục 6). Mọi chỗ không truy xuất được đều ghi ở mục 9.

---

## Tóm tắt điều hành

- **Vòng chơi mới (một câu):** *Quân cờ của bạn đi dọc một con đường 20 trạm từ 1986 đến 2024. Đến mỗi trạm, bạn chọn 1 trong 3–4 cách (Làm lớn / Làm nhỏ / Nghỉ ngơi, thêm 💡 Nhớ lại nếu là tin đồn), túi 💰 và thanh ❤️ nhảy ngay, rồi quân cờ bước sang trạm kế. Mục tiêu: về đích 2024 thật giàu mà không để cạn tiền hay cạn sức.*
- **Tài nguyên thứ hai là ❤️ Sức khỏe & Tinh thần,** gồm 10 trái tim, bắt đầu 10/10. Đây là lựa chọn duy nhất khớp cả 6 biến cố đã có trong `EVENTS` (cưới, sinh con, cha mẹ ốm, thưởng Tết, bị lừa, khủng hoảng) **và** khớp với cảm giác thua lỗ. Thanh đầy là tốt, cùng chiều với tiền, giống mạng sống của Candy Crush [6] chứ không đếm ngược như Stress của Darkest Dungeon [19]. Phương án "Gia đình", "Uy tín" hay "Stress" đều bị loại có lý do (mục 2.3).
- **Luật ❤️ có hai tầng, mượn trực tiếp từ Darkest Dungeon** (ngưỡng 100 thì bị phạt, 200 thì nguy kịch [19]). ❤️ ≤ 3 là vùng 🥵 **Kiệt sức**: khoá "Làm lớn", ngã ba chỉ được làm nhỏ. ❤️ = 0 là 🏥 **Nhập viện**: ván kết thúc ngay và túi bị **×0,5** (viện phí và bỏ dở). Mất máu chỉ đến từ **thua khi Làm lớn (−2❤️)** và từ **biến cố**. Hồi máu chỉ có hai đường: **Nghỉ ngơi (+1❤️)** và vài lựa chọn vui trong biến cố.
- **Lựa chọn 3–4 phương án, không có phương án độn.** Mỗi phương án khác nhau thật trên trục *tiền ↔ sức*: 🔥 Làm lớn (bỏ đúng mức in trên lá, thua thì −2❤️) · 🌱 Làm nhỏ (bỏ một nửa mức đó, không mất ❤️) · 🛌 Nghỉ ngơi (không tiền, +1❤️) · 💡 Nhớ lại (chỉ trên lá 🗣). Biến cố không còn là nút "Tiếp" mà thành 3 lựa chọn đổi tiền lấy sức, kiểu ngân sách gia đình của Papers, Please [24] và This War of Mine [25].
- **Minh bạch tuyệt đối, chỉ một loại thông tin ẩn.** Mọi phương án in sẵn 💰 và ❤️ trước khi bấm. Thứ duy nhất bị giấu vẫn là tỉ lệ thật của lá 🗣, mở bằng 💡. Ta **không** dùng kiểu Reigns: Game of Thrones (chỉ báo chỉ số nào bị ảnh hưởng, không báo mạnh yếu hay tăng giảm [14]), vì làm vậy sẽ thêm một kiểu thông tin ẩn thứ hai.
- **Bàn cờ thẳng, có "ngã ba hình thoi".** Đường đi là một dải duy nhất; ở 4 trạm ngã ba, đường tách làm hai làn rồi nhập lại ngay trạm sau (một quyết định, hai lá). **Không** dùng nhánh dài kiểu Mario Party hay Slay the Spire, vì năm phải luôn tăng dần, Đề hôm nay phải so được giữa mọi người, và chọn tuyến trước là một quyết định trì hoãn (đã bị loại ở thiết kế trước).
- **Phát hiện 2 lỗi trong code hiện tại mà bàn cờ sẽ làm lộ ra:** (1) `buildDeck` cho **năm đi lùi ở 1000/1000 seed** đã thử, và ghép ngã ba lệch tới 15 năm (1996 ↔ 2011); trên một con đường theo năm, lỗi này là chí mạng. (2) **Lộ bẫy:** lá bẫy có viền vàng và nút 💡 riêng mà lá tin đồn thật không có, và ngã ba nào cũng chứa đúng 1 bẫy, thường đi cặp với một lá 🧠, nên lá 🗣 duy nhất trong ngã ba chính là bẫy. Bộ sinh bàn cờ mới sửa cả hai: 🗣 trong ngã ba là bẫy đúng **50%** số lần (mục 3.6).
- **Cân bằng (4.000 ván mỗi chiến lược, dữ liệu thật):** "Biết lịch sử + giữ sức" có trung vị **5,8 tỷ** (Đại gia), nhập viện 4%. "Biết lịch sử nhưng tham" được 4,6 tỷ, nhập viện 17%. "Làm lớn hết" được 1,8 tỷ, nhập viện 31%. "Làm nhỏ hết" được 1,0 tỷ, "Ngẫu nhiên" 0,45 tỷ, "Nghỉ hết" 40 triệu. Cả kiến thức lịch sử lẫn việc giữ sức đều được thưởng.
- **Tái sử dụng:** giữ nguyên `rng.ts`, toàn bộ dữ liệu 31 lá trong `deckData.ts`, công thức tiền, `tierOf`/`TIERS`, `fmtVnd`, `OddsFaces` (😄/😢), `turnRng`. **Viết lại** `deck.ts` (thành `board.ts`), `resolveChoice`/`recall` trong `engine.ts`, và toàn bộ UI (`CardGameApp.tsx`, phần dưới của `GameCard.tsx`). Ước lượng khoảng **5–6 ngày công** cho 1 dev.

---

## 1. Nghiên cứu A: điều gì làm một bàn cờ hay một con đường **nhìn là hiểu**

### 1.1 Bảng so sánh

| Game | Cơ chế duy nhất làm bàn cờ dễ đọc | Tiến độ: thẳng hay rẽ nhánh? | Chỉ số có luôn hiện? | Ô tốt/xấu/ngẫu nhiên phân biệt trước khi tới? | Bằng chứng (đã mở) | Bài học cho Sổ trọng sinh |
|---|---|---|---|---|---|---|
| **The Game of Life** (Milton Bradley/Hasbro) | **Con đường chính là đời người:** đi từ đầu đời đến nghỉ hưu, dọc đường gặp đại học, việc làm, cưới hỏi, con cái | Phần lớn thẳng. Bản 2021 có "more split paths… certain paths giving advantages and disadvantages" | Tiền là tiền giấy trên tay (không có thanh) | Ô Pay Day và ô sự kiện in sẵn trên bàn | "simulates a person's travels through their life, from early adulthood to retirement, with college if chosen, jobs, marriage, and possible children" [1]. Bản 1991 thêm **Life Tiles** thưởng việc tốt, "added up the amounts on the tiles to their cash total" ở cuối ván. Cũng từ bản đó, "The spaces that forced players to go back were removed" [1]. Độ may rủi: "High (spinning a wheel…)" [1] | **Mô hình gần nhất về chủ đề**: đường đời, cưới, sinh con, nghỉ hưu, đúng 6 biến cố ta có. Life Tiles là tiền lệ cho **điểm phụ cộng ở cuối** (danh hiệu ❤️ ở mục 2.6). Việc Hasbro bỏ ô bắt lùi lại cũng ủng hộ việc ta **không bắt quân cờ đi lùi** |
| **Mario Party** (Nintendo) | **Màu ô báo trước hệ quả:** ô xanh cho xu, ô đỏ trừ xu, ô xanh lá có dấu "?" kích hoạt sự kiện | Bàn nhiều nhánh. Riêng Mario Party 9 và 10: "move in a shared vehicle along a linear path" | Xu và sao trên HUD | **Có:** ô xanh, đỏ, "?" nhìn thấy từ xa | "blue spaces reward coins, while red spaces detract them. Special spaces trigger dynamic elements" [2]. Ô xanh cho "three to twelve" xu [3]. Ô đỏ "Subtracts three of the player's coins" [4]. Ô sự kiện "is a green space with a question mark" [5] | Loại trạm phải đọc được **trước khi tới**, bằng biểu tượng + hình dạng + màu. Trạm ⚡ biến cố giống ô "?": biết có chuyện xảy ra, chưa biết chuyện gì. Bản 9/10 cho thấy **đường thẳng vẫn đủ làm game bàn cờ** |
| **Candy Crush Saga** (King) | **Bản đồ "saga": một dải màn chơi đánh số uốn lượn,** cố ý làm cho giống bàn cờ | Thẳng (màn n → n+1) | Mạng sống luôn hiện | Không áp dụng (màn nào cũng là màn chơi) | Ý tưởng ban đầu gồm "making the saga map visually look like a board game" [6]. Người chơi có 5 mạng, mất một mạng khi thua màn, hết mạng phải chờ, "a life is restored every half-hour" [6] | Bố cục **đường uốn lượn dọc màn hình điện thoại**, mỗi trạm một vòng tròn có số hoặc năm. **Phản ví dụ:** hồi mạng theo giờ là cơ chế kiếm tiền, ta **không** làm |
| **Snakes and Ladders / Chutes and Ladders** | **Ô đánh số + rắn/thang nối hai ô**, tiến độ là một con số | Thẳng (lưới zig-zag) | Vị trí là thứ duy nhất cần nhìn | **Có:** rắn và thang vẽ sẵn trên bàn | "numbered, gridded squares"; "a simple race based on sheer luck"; bản gốc là bài học đạo đức: "progression up the board represented a life journey complicated by virtues (ladders) and vices (snakes)" [7] | (1) Đường đời có "đức" và "tật" là chủ đề rất gần trọng sinh. (2) **Phản ví dụ về cơ chế:** may rủi thuần (đổ xúc xắc) không có quyết định nào. Ta **bỏ xúc xắc**: mỗi lựa chọn là một bước. Thụt lùi thể hiện qua 💰/❤️, không qua vị trí |
| **Super Mario Bros. 3** (Nintendo) | **Bản đồ thế giới nhìn từ trên xuống,** đường nối các biểu tượng màn chơi | Rẽ nhánh nhẹ, cùng về một lâu đài | Có | Có (biểu tượng màn, pháo đài) | "an overworld map… has several paths leading from the world's entrance to a castle. Paths connect to action panels, fortresses, and other map icons" [8]. Thuật ngữ chung: overworld là "an area… that interconnects all its levels" [11] | Mọi nhánh đều về một đích: đó chính là ý của "ngã ba hình thoi". Biểu tượng trạm là ngôn ngữ thị giác chính |
| **Slay the Spire / Slay the Spire 2** (Mega Crit) | **Bản đồ tầng có nhiều tuyến** dẫn tới trùm | Rẽ nhánh | Có | Có | "a number of potential encounters distributed in a branching structure with a boss… at the end" [9]. Bản 2: "each randomly-generated act shown as a map with multiple routes to reach the act's boss" [10] | **Không chọn mô hình này:** chọn tuyến là quyết định trì hoãn và hợp với game 30–60 phút. Ta chỉ giữ ý **thấy trước toàn bộ bản đồ** để tự lên kế hoạch giữ sức |
| **Jumanji** (phim 1995) | **Sau mỗi lần đổ, một câu thông báo hệ quả hiện giữa bàn cờ** | Thẳng | — | — | "With each dice roll, the game pieces move by themselves and a cryptic message describing the roll's outcome appears in the crystal ball at the center of the board" [12] | Thẩm mỹ: sau mỗi lựa chọn, một **dòng kết quả ngắn hiện ngay tại trạm** (ví dụ "REE kẹt thanh khoản, bạn bán non"). Ta lấy cảm giác bàn cờ cổ, **không** lấy sự bí ẩn: câu của ta phải rõ ràng chứ không "cryptic" |
| **Reigns: Her Majesty / Reigns: Game of Thrones** (Nerial) | **Bốn thanh chỉ số luôn nằm trên đầu màn hình;** chạm đáy hoặc chạm đỉnh là hết | Không có bàn cờ, chỉ chuỗi lá | **Luôn hiện** | GoT: lá chỉ báo *chỉ số nào* bị ảnh hưởng | Her Majesty: "four pillars… the church, the people, the military, and the economy. The queen's reign ends whenever one of the four metrics becomes too high or too low" [13]. GoT: "Each card indicates which factors would be affected by either decision, but not how strongly or whether the effect would be positive or negative" [14]. Bản gốc có 29 kiểu chết [15] | **Hai thanh luôn hiện** (💰 và ❤️), không cần mở menu. Cạn một thanh bất kỳ thì hết ván, giống Reigns. **Không** mượn kiểu "báo mập mờ" của GoT (xem 1.4) |
| **Plants vs. Zombies** | — | — | — | — | Trang Wikipedia đã mở [26] chỉ mô tả màn phòng thủ, **không** có nội dung về bản đồ thế giới | Không dùng làm căn cứ (mục 9) |

### 1.2 Cơ chế "đọc ngay" rút ra cho bàn cờ

1. **Một con đường, một hướng, năm luôn tăng** (Candy Crush [6], Mario Party 9/10 [2], Snakes & Ladders [7]). Nhánh, nếu có, phải nhập lại ngay (SMB3: mọi đường về một lâu đài [8]).
2. **Loại trạm đọc được trước khi tới, bằng biểu tượng + hình dạng + màu,** không bao giờ chỉ dựa vào màu (Mario Party [2][3][4][5]; quy tắc đa mã hoá của bản trước).
3. **Chỉ số luôn hiện** ở đầu màn hình (Reigns [13][14], Oregon Trail hiện "health of the party" trên màn hình đi đường [16]).
4. **Không có xúc xắc, không bắt lùi:** mỗi lựa chọn là một bước tiến. Thụt lùi nằm ở tài nguyên (Life đã bỏ ô bắt lùi [1]; Snakes & Ladders cho thấy may rủi thuần không có quyết định [7]).
5. **Hệ quả hiện ngay tại trạm** bằng một câu ngắn (Jumanji [12]).

---

## 2. Nghiên cứu B: tài nguyên thứ hai bên cạnh tiền

### 2.1 Bảng so sánh

| Game | Tài nguyên phụ | Thang đo | Cái gì làm giảm / tăng | Cạn thì sao? | Bằng chứng (đã mở) |
|---|---|---|---|---|---|
| **The Oregon Trail** (1985) | Sức khỏe cả đoàn + lương thực + vật tư | Hiện trên màn hình đi đường cùng ngày, thời tiết, số cân lương thực | Bệnh, tai nạn ngẫu nhiên ("a party member falling ill"). Người chơi chỉnh tốc độ đi, khẩu phần, nghỉ | **Thua hẳn:** "The game ends when… all five members of the party have died due to illness or injury". Về đích thì chấm điểm theo "ending conditions and supplies of the party" | [16]. Dòng series: "frequent misfortunes, and game over upon death" [17] |
| **Darkest Dungeon** | **Stress** của từng anh hùng (đếm lên) | 0–200, ngưỡng ở 100 | Tăng khi khám phá hoặc chiến đấu, thiếu đèn hay đồ ăn, thấy đồng đội gục. Giảm khi cắm trại hoặc về thị trấn | **Hai tầng:** tới 100 thì bị Affliction (yếu đi) hoặc, hiếm hơn, Virtue. **Tới 200 thì đau tim** và vào Death's Door hoặc chết | Thang 0–200, ngưỡng 100, đau tim ở 200 [19]. Wikipedia: Affliction "will hamper, or possibly enhance" khả năng chiến đấu. Khi thêm luật đau tim chết ngay, "Some Early Access players were dissatisfied… feeling it put the player at far too much disadvantage" [18] |
| **The Banner Saga** | **Morale** của đoàn | Bộ đếm 0–100, 5 trạng thái có tên (Poor 0–10 … Great 90–100) | Mỗi ngày đi đường −10; nghỉ một ngày +10 (nếu đủ vật tư); thắng trận và sự kiện cốt truyện cũng làm thay đổi | **Mềm:** Morale chỉ cộng hoặc trừ Willpower của anh hùng (−2 đến +2) | [20] |
| **The Banner Saga** | **Renown** | — | Thắng trận, hành động "heroic or karmic" | Là **tiền tệ**: dùng để thăng cấp và mua vật tư | [21] |
| **Sunless Sea** | **Terror** | 0–100, có tên từng mức: Serene → Wary → Nervous → Fearful → Haunted → **Crazed (100)** | Tăng dần khi đi trong bóng tối | Ở 100 là "Crazed". **Không trích được** hệ quả cụ thể (mục 9) | Thanh "labeled with a skull icon" [23]. Game có "permanent character death" [22] |
| **Reigns** (cả series) | 4 chỉ số Church/People/Army/Treasury | Thanh luôn hiện | Mỗi lá đẩy lên hoặc xuống | **Thua hẳn,** cạn hoặc tràn **bất kỳ** chỉ số nào cũng hết đời vua, người kế vị chơi tiếp | [13][14] |
| **Papers, Please** | Ngân sách gia đình (tiền nhà, thức ăn, sưởi) | — | Cuối ngày chia tiền cho các khoản thiết yếu | **Thua hẳn:** "if the player goes into debt, the game ends with a game over" | [24] |
| **This War of Mine** | Sức khỏe, đói, **tâm trạng** của từng người | — | Phải giữ cả ba "until the declaration of a ceasefire"; đứa trẻ cần được quan tâm "to prevent it from becoming depressed" | Nhân vật suy sụp hoặc chết | [25] |
| **FTL** | Thân tàu + phi hành đoàn | — | Chiến đấu, sự kiện | "if the ship is destroyed or all of its crew lost, the game ends" | [27] |

### 2.2 Ba câu hỏi và kết luận

**(a) Thanh thứ hai nên là gì?** Đem từng phương án so với **6 biến cố đã có** trong `EVENTS` và với các kết quả xấu của lá bài:

| Phương án | Cưới 💍 | Sinh con 👶 | Cha mẹ ốm 🏥 | Thưởng Tết 🧧 | Bị lừa 😓 | Khủng hoảng 💥 | Thua lá / dính bẫy | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| **❤️ Sức khỏe & Tinh thần** | ✓ (vui, +) | ✓ (vất vả, −) | ✓ (lo lắng, thức đêm, −) | ✓ (nghỉ Tết, +) | ✓ (stress, −) | ✓ (mất ngủ, −) | ✓ (ôm hàng đỉnh, mất ngủ) | **Khớp 7/7**. Có tiền lệ: This War of Mine (health + mood) [25], Oregon Trail (health) [16], Darkest Dungeon (stress) [18][19] |
| Gia đình / Hạnh phúc | ✓ | ✓ | ✓ | ~ | ✗ | ✗ | ✗ | Khớp 3–4/7. "Cạn gia đình" đem ra làm điều kiện thua thì nặng nề và dễ phản cảm |
| Uy tín / Danh tiếng | ✗ | ✗ | ✗ | ~ | ✓ | ~ | ~ | Ở Banner Saga, Renown thực chất là **tiền tệ thứ hai** [21]. Ta sẽ có hai đồng tiền, trái với bài học "một tài nguyên rõ ràng" của bản trước |
| Stress (đếm lên, như Darkest Dungeon) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Đúng chủ đề nhưng **ngược chiều**: tiền lên là tốt, stress lên là xấu. Hai thanh ngược chiều sẽ làm trượt bài kiểm tra 15 giây |
| Thời gian / Tuổi | — | — | — | — | — | — | — | Đã là chính con đường (năm) |

→ **Chọn ❤️ "Sức khỏe & Tinh thần"**, hiển thị là 10 trái tim, **đầy là tốt** (cùng chiều với 💰, giống mạng sống của Candy Crush [6]). Cách đặt tên này gộp "health" và "mood" của This War of Mine [25] thành **một** thanh, vì hai thanh phụ sẽ là quá nhiều cho mục tiêu 15 giây. Về văn hoá, câu "có sức khỏe là có tất cả" đã quen với người Việt, và nó cho phép đặt câu hỏi trọng sinh thật sự: *"Giàu lại lần nữa, nhưng lần này có giữ được sức không?"*

**(b) Cạn ❤️ là thua hẳn hay chỉ trừ điểm?** Bằng chứng chia hai phe:
- **Thua hẳn:** Oregon Trail [16], Reigns [13][14], Papers, Please [24], FTL [27]. Thua hẳn làm thanh có răng, và các game này đều chơi lại rất nhanh (Reigns cho người kế vị chơi tiếp ngay).
- **Mềm hoặc hai tầng:** Banner Saga (Morale chỉ cộng trừ sức chiến đấu) [20], Darkest Dungeon (100 thì bị phạt, 200 mới nguy kịch [19]). Darkest Dungeon còn cho thấy **chết đột ngột không có cảnh báo làm người chơi bức xúc** [18].

→ **Khuyến nghị: hai tầng, có cảnh báo, cuối cùng vẫn thua hẳn.**
- ❤️ 7–10 là 🟢 *Khỏe*, ❤️ 4–6 là 🟡 *Mệt* (chỉ đổi màu, không có luật).
- ❤️ **1–3** là 🔴 **🥵 Kiệt sức**: nút 🔥 Làm lớn **bị khoá** (🔒 "Mệt quá, cần ❤️ 4+"), và làn ngã ba tự chuyển sang mức Làm nhỏ. Đây là tầng Affliction của Darkest Dungeon [19] hay Morale thấp của Banner Saga [20]: bị phạt, nhưng *nhìn thấy trước*.
- ❤️ **= 0** là 🏥 **Nhập viện**: ván **kết thúc ngay** tại trạm đó, túi **×0,5** (viện phí và bỏ dở). Không có hệ số ×0,5 thì gục ở trạm 18 gần như không mất gì (các lá cuối có hệ số nhỏ, ví dụ vàng 2024 chỉ ×1,3). Hình phạt này giữ nguyên tắc **điểm vẫn là một con số 💰**, không thêm điểm thứ hai.
- 💰 < 1 triệu là 💸 **Phá sản**: kết thúc (mô phỏng: 0,0–0,2% số ván). Như vậy luật ghép đúng một câu: **"cạn tiền hay cạn sức đều hết ván"**, giống Reigns.

**(c) ❤️ ăn khớp gì với dữ liệu sẵn có?** Không cần thêm lá mới. Chỉ cần thêm 3 lựa chọn cho mỗi biến cố trong 6 biến cố, và lựa chọn giữa (B) giữ nguyên `delta` hiện có (mục 3.4).

### 2.3 Vì sao không "trừ điểm cuối" thuần?

Nếu ❤️ chỉ nhân điểm ở cuối (ví dụ ❤️/10 × túi), người chơi sẽ **không cảm thấy** nó trong lúc chơi, giống "Điểm Trọng sinh 0–100" của bản v1 đã bị loại vì "chỉ hiện lúc cuối". Luật khoá Làm lớn ở ❤️ ≤ 3 làm thanh có tác dụng **ngay trong ván**, đúng như Morale tác động trực tiếp lên Willpower trong Banner Saga [20]. Phần thưởng cuối ván thì chỉ là **danh hiệu** (Life Tiles [1]), không nhân vào tiền.

---

## 3. Nghiên cứu C: quyết định 3–4 phương án

### 3.1 Bảng so sánh

| Game | Cấu trúc lựa chọn | Hệ quả hiện trước hay giấu? | Bằng chứng | Bài học |
|---|---|---|---|---|
| **Reigns** (gốc) | Nhị phân (quẹt trái/phải) | Hệ quả lộ sau khi chọn | [13] | Nền tảng của bản lật bài hiện tại |
| **Reigns: Her Majesty** | Nhị phân **+ vật phẩm**: "Items can bypass the choices offered and offer new options" | — | [13] | Cách series vượt ra ngoài nhị phân: **thêm một lối thứ ba có điều kiện** (vật phẩm). 💡 Nhớ lại của ta đúng là "vật phẩm" kiểu này: chỉ hiện trên lá 🗣 |
| **Reigns: Game of Thrones** | Nhị phân | **Giấu một phần:** báo chỉ số nào bị ảnh hưởng, *không* báo mạnh yếu hay tăng giảm | [14] | Phản ví dụ cho triết lý của ta (xem 3.2) |
| **Mass Effect** (dialogue wheel) | 4–6 câu trả lời trên vòng tròn | **Giọng điệu** của mỗi câu báo bằng màu, ký hiệu và vị trí | "Colour, symbols and position communicate whether a response is generally diplomatic, aggressive, neutral, investigative or romantic" [28] | **Vị trí cố định cho từng loại lựa chọn**: 🔥 luôn ở trên, 🌱 thứ hai, 🛌 thứ ba, 💡 cuối. Sau 2–3 trạm người chơi bấm theo vị trí |
| **Visual novel / dating sim** (Dream Daddy) | Chọn câu thoại, nhiều kết thúc | **Không trích được** (mục 9) | "interactive visual novel… choose between seven different single fathers… multiple endings" [29]. Visual novel và dating sim "revolve almost entirely around… branching dialogues" [28] | Chỉ dùng làm bối cảnh, không dùng làm căn cứ cho việc hiện hay giấu chỉ số |
| **Papers, Please** | Mỗi tối chia tiền cho tiền nhà, thức ăn, sưởi | Số tiền hiện rõ, hệ quả (gia đình ốm, đói) đến sau | "decide on a simple budget for rent, food, heat and other necessities for their family; if the player goes into debt, the game ends" [24] | **Đây chính là mô hình trạm biến cố mới:** chi tiền để giữ gia đình (❤️), hoặc giữ tiền và để gia đình chịu |
| **This War of Mine** | Đánh đổi tài nguyên giữa đi tìm đồ, ăn uống, nghỉ, chăm người | — | Giữ "health, hunger, and mood levels" [25] | Trục đánh đổi **tiền ↔ sức** là thứ làm cả ba phương án đều có lý, không phương án nào thắng tuyệt đối |

### 3.2 Hiện hết hay giấu bớt? **Hiện hết** (ngoại trừ 🗣)

- Triết lý đã chốt của dự án: *"học sinh lớp 5 hiểu trong 15 giây; không có thông tin ẩn trừ lá tin đồn/bẫy"*. Code hiện tại tuân thủ: `GameCard` in sẵn tiền bỏ ra, 10 mặt 😄/😢 và hai kết quả. Chỉ lá bẫy mới có `real` bị giấu, mở bằng 💡, và **💡 không đổi kết quả**, chỉ cho xem trước (`effectiveOdds` luôn dùng `real`).
- Nếu làm kiểu Reigns: GoT [14] (báo mập mờ), ta sẽ có **hai kiểu thông tin ẩn** chồng lên nhau: tin đồn sai *và* phương án mập mờ. Người chơi không còn biết 💡 dùng để làm gì. Vì vậy **mọi phương án in rõ 💰 và ❤️** trước khi bấm. Căng thẳng đến từ tỉ lệ 😄/😢 (đã in) và từ tin đồn (giấu có chủ đích), không đến từ chữ mập mờ.
- **Một thay đổi hiển thị có chủ đích:** với 3 phương án có tiền bỏ ra khác nhau, con số "nhận về X" (cách `GameCard` đang in: `stake × mult`) **không so được giữa các phương án**. Mỗi dòng phương án vì vậy in **túi sau khi chọn** ("😄 → túi thành 322tr · 😢 → túi còn 69tr"). Đây là cùng công thức, chỉ đổi điểm quy chiếu.

### 3.3 Bốn phương án chuẩn tại trạm lá đơn (🧠 hoặc 🗣)

| Vị trí | Phương án | Tiền bỏ ra | 😄 | 😢 | ❤️ | Có khi nào |
|---|---|---|---|---|---|---|
| 1 | 🔥 **Làm lớn** | Đúng mức in trên lá (`stake`: ¼ / ½ / cả túi) | `túi − bỏ + bỏ×winMult` | `túi − bỏ + bỏ×loseMult` | **😢 thì −2❤️**, 😄 thì 0 | Luôn có. **Khoá khi ❤️ ≤ 3** |
| 2 | 🌱 **Làm nhỏ** | **Nửa** mức in (¼→⅛, ½→¼, cả túi→½) | như trên với tiền bỏ ra một nửa | như trên | **0** | Luôn có |
| 3 | 🛌 **Nghỉ ngơi** | 0 | — | — | **+1❤️** (tối đa 10; nếu đầy thì ghi "❤️ đã đầy") | Luôn có. Đây là "Bỏ qua" cũ, nhưng giờ **có giá trị** |
| 4 | 💡 **Nhớ lại** (còn n lần) | 0 | — | — | 0 | **Chỉ trên lá 🗣** (cả tin thật lẫn bẫy) khi còn lượt. Không phải lựa chọn kết thúc: bấm xong thì lá lật mặt và 3 phương án trên tính lại theo số thật |

→ Lá 🧠 có **3** phương án, lá 🗣 có **4**. Không có phương án độn: Làm lớn được nhiều tiền nhất nhưng có thể mất sức, Làm nhỏ an toàn cho sức nhưng lãi một nửa, Nghỉ hồi sức. Trong mô phỏng, cả ba đều là lựa chọn tốt nhất ở những tình huống khác nhau (mục 6).

### 3.4 Trạm ngã ba (🔀, hai lá) và trạm biến cố (⚡)

**Ngã ba** (4 phương án): [Làn trái: chơi lá A] · [Làn phải: chơi lá B] · [🛌 Nghỉ] · [💡 nếu có lá 🗣]. Mỗi làn được tính theo **luật Làm lớn** (mức in, 😢 thì −2❤️). Khi ❤️ ≤ 3, cả hai làn tự chuyển sang mức Làm nhỏ (nhãn đổi thành "🥵 chỉ làm nhỏ được"). Không có "Làm nhỏ" riêng cho từng làn, để giữ tối đa 4 nút.

**Biến cố** (3 phương án, không ngẫu nhiên, đều in sẵn). Phương án B giữ đúng `delta` đang có trong `EVENTS` (riêng 🧧 thì A giữ đúng delta):

| Biến cố (`id`) | A | B | C |
|---|---|---|---|
| 💍 Đám cưới (`e-wedding`, delta −3%) | Cưới lớn: **−6% túi, ❤️+2** | Cưới vừa: **−3%, ❤️+1** | Đăng ký, mời cơm thân: **0đ, ❤️0** |
| 👶 Con chào đời (`e-childbirth`, −2%) | Thuê người giúp: **−4%, ❤️0** | Nhờ ông bà phụ: **−2%, ❤️−1** | Tự xoay xở: **0đ, ❤️−2** |
| 🏥 Cha mẹ ốm (`e-parent-illness`, −30tr) | Chuyển viện tuyến trên: **−30tr, ❤️0** | Viện tỉnh, tự thức đêm chăm: **−10tr, ❤️−2** | Nhờ anh chị em lo: **0đ, ❤️−3** |
| 🧧 Thưởng Tết đậm (`e-bonus`, +5%) | Giữ cả, đi làm từ mùng 4: **+5%, ❤️0** | Biếu bố mẹ, về quê ăn Tết: **+2%, ❤️+1** | Cả nhà đi du lịch: **0%, ❤️+2** |
| 😓 Bị lừa góp vốn (`e-scam`, −8%) | Theo kiện tới cùng: **−4%, ❤️−3** | Coi như học phí: **−8%, ❤️−1** | Nghỉ một tháng cho nguôi: **−10%, ❤️0** |
| 💥 Khủng hoảng (`e-crisis`, −10%) | Làm thêm bù lỗ: **−5%, ❤️−3** | Gồng chờ hồi: **−10%, ❤️−2** | Cắt lỗ cho nhẹ đầu: **−15%, ❤️0** |

Mỗi biến cố là một **đường đánh đổi đơn điệu**: tiền giữ được nhiều hơn thì ❤️ mất nhiều hơn. Không có phương án nào trội hoàn toàn. Tỉ giá ngầm vào khoảng 1❤️ ≈ 2–5% túi hoặc ≈ 10 triệu, đủ để người chơi đọc là hiểu. Câu chữ là **viết mới cho game**, không phải dữ kiện lịch sử, nên không cần nguồn (vẫn giữ nhãn "số làm tròn cho trò chơi").

### 3.5 Không đổi: cách 💡 hoạt động, **nhưng sửa một lỗ hổng**

Giữ nguyên ý nghĩa của 💡 (3 lượt mỗi ván, chỉ cho xem, không đổi kết quả). **Đổi:** 💡 dùng được trên **mọi** lá 🗣, kể cả tin thật. Lật tin thật sẽ hiện "✅ TIN ĐÚNG, số in là số thật" và vẫn tốn một lượt. Lá bẫy và lá tin đồn thật **phải trông giống hệt nhau** trước khi dùng 💡 (cùng viền, cùng huy hiệu 🗣).

### 3.6 Lỗ hổng thông tin ẩn trong code hiện tại (đã kiểm chứng bằng cách đọc code và chạy `buildDeck`)

| Lỗ hổng | Ở đâu | Hệ quả | Cách sửa trong thiết kế mới |
|---|---|---|---|
| Lá bẫy có viền `border-gold/50`, lá thường thì `border-line` | `GameCard.tsx`, khối `className` của thẻ ngoài | Nhìn viền là biết bẫy | Mọi lá 🗣 cùng một kiểu viền |
| Nút 💡 chỉ hiện khi `card.kind === "trap"`; `recall()` cũng chỉ nhận bẫy | `GameCard.tsx` (điều kiện nút), `engine.ts` (`recall`) | Có nút 💡 tức là bẫy | 💡 hiện trên mọi lá 🗣 |
| Ngã ba nào cũng = 1 bẫy + 1 lá từ pool ký ức; pool đó chủ yếu là 🧠 | `deck.ts` (`forkTurns`) | Trong ngã ba, lá 🗣 thường là lá duy nhất, nên **chính là bẫy** | 2 ngã ba có bẫy + 2 ngã ba có tin thật, mỗi ngã ba = 1 🗣 + 1 🧠. Đo trên 2.000 seed: **🗣 trong ngã ba là bẫy đúng 50%**, 🗣 ở trạm đơn là bẫy 53% |
| **Năm đi lùi**: ngã ba và biến cố bị chèn theo khoảng cách đều, bất kể năm | `deck.ts` (vòng chèn `extras`) | Chạy thử: **1000/1000 seed có năm đi lùi**. Seed `20261108`: lượt 3 là 2007/2015, lượt 4 lại là 2000. Ghép ngã ba lệch tới 15 năm (1996 ↔ 2011, 2001 ↔ 2022) | Sắp **toàn bộ** trạm theo năm. Ngã ba chỉ ghép hai lá cách nhau **≤ 2 năm**. Đo lại: 0 bước lùi, độ lệch tối đa trong ngã ba = 2 năm |

---

## 4. Thiết kế mới: "Sổ trọng sinh: Đường đời 1986"

### 4.1 Vòng chơi

> **Quân cờ đứng ở một trạm → tấm bảng quyết định trượt lên (bàn cờ vẫn thấy ở nửa trên) → chọn 1 trong 3–4 phương án (giá 💰 và ❤️ in sẵn) → 10 mặt 😄/😢 chạy rồi dừng → 💰 và ❤️ nhảy, một dòng kết quả hiện tại trạm → trạm đổi màu theo kết quả → quân cờ bước sang trạm kế.**

- **Mở đầu:** "Bạn vừa trọng sinh về năm 1986. Trong túi 💰 50 triệu, sức khỏe ❤️ 10/10." Toàn bộ con đường 20 trạm đã hiện sẵn. Một nút: **[Bước vào 1986 →]**.
- **Độ dài:** 20 trạm, mỗi trạm 5–10 giây, cả ván 2–4 phút (giống bản lật bài).
- **Mục tiêu (một câu, in dưới HUD):** *"Đi hết đường tới 2024, càng giàu càng lên bậc, đừng để cạn 💰 hay ❤️."*
- **Kết thúc:** tới trạm 20 (2024), hoặc ❤️ = 0 (🏥 Nhập viện), hoặc 💰 < 1 triệu (💸 Phá sản).

### 4.2 Các loại trạm và cách nhận ra **trước khi tới**

| Trạm | Số lượng mỗi ván | Hình dạng / ký hiệu trên bàn | Thấy trước những gì | Giấu tới khi đến |
|---|---|---|---|---|
| 🧠 **Ký ức** | 8–10 | Vòng tròn **viền liền**, biểu tượng của lá (🏞️, 📈…) + năm | Năm, biểu tượng, loại | Tiền bỏ ra và tỉ lệ (hiện khi tới; không có gì ẩn) |
| 🗣 **Tin đồn** (thật *hoặc* bẫy) | 3–5 (trung bình 3,8; cộng 4 làn 🗣 trong ngã ba thì trung bình 7,8 lá 🗣/ván) | Vòng tròn **viền nét đứt** + huy hiệu 🗣 | Năm, biểu tượng, loại | **Tin thật hay bẫy** (chỉ 💡 hoặc kết quả mới lộ) |
| 🔀 **Ngã ba** | 4 | Đường **tách thành hai làn hình thoi** (hai vòng nhỏ cạnh nhau, mỗi vòng mang ký hiệu 🧠 hoặc 🗣) rồi nhập lại | Hai năm, hai biểu tượng, làn nào 🗣 | Như trên |
| ⚡ **Biến cố** | 3 | **Hình lục giác**, ⚡ + dấu "?" (giống ô "?" của Mario Party [5]), năm ước lượng "≈1990" | Có biến cố, năm ước lượng | Biến cố nào |
| 🏁 **Đích 2024** | 1 (là trạm 20) | Cờ đích | — | — |

> Chủ dự án có nêu "trap" như một loại trạm. **Cố ý không làm** trạm bẫy riêng: bẫy phải trông y như tin đồn, nếu không 💡 sẽ vô nghĩa (mục 3.6).

**Sau khi đi qua**, trạm đổi thành ô kết quả, **tái dùng dải emoji của màn kết thúc hiện tại**: 🟩 thắng, 🟥 thua, ⛔ né bẫy, ⚡ biến cố, · nghỉ. Thêm 🏥 cho trạm nhập viện. Nhờ vậy **bàn cờ đã đi chính là lịch sử ván chơi**, không cần bảng nhật ký riêng.

**Nền theo chặng** (4 dải nền nhạt sau đường đi, chỉ để định hướng): *1986–1995 Đổi Mới & mở cửa* · *1996–2005 Sàn chứng khoán ra đời* · *2006–2015 Bong bóng & đóng băng* · *2016–2024 Thời số*.

### 4.3 Khung bàn cờ (ASCII, màn hình điện thoại khoảng 375px)

Đường đi **từ trên xuống** (1986 ở trên cùng), uốn trái–giữa–phải kiểu bản đồ saga [6]. Trang tự cuộn để trạm hiện tại nằm ở khoảng 1/3 màn hình. Chọn hướng trên-xuống thay vì dưới-lên như Candy Crush vì đây là **dòng thời gian** đọc theo chiều cuộn trang; cảm giác "leo lên" đã có ở thang bậc.

```
┌──────────────────────────────────────┐
│ 💰 402 triệu          Trạm 6/20  💡×3 │ ← HUD cố định (sticky)
│ ▓▓▓▓░░ Tiểu thương → Trung lưu: 1 tỷ │ ← thang bậc (giữ nguyên)
│ ❤️ ❤️❤️❤️❤️❤️❤️❤️❤️❤️  10/10 · Khỏe       │ ← 10 trái tim, xanh/vàng/đỏ + chữ
├──────────────────────────────────────┤
│ ┄┄ 1986–1995 · Đổi Mới & mở cửa ┄┄┄┄ │
│  (🟩)1986                            │ ← đã qua: ô kết quả
│      ╲                               │
│       ⬡⚡ ≈1990 (đã qua: −8%,−1❤️)    │
│          ╲                           │
│          (🟩)1993                    │
│              ╲                       │
│              (🟩)1994                │
│              ╱                       │
│          (·)1995  nghỉ +1❤️          │
│ ┄┄ 1996–2005 · Sàn chứng khoán ┄┄┄┄┄ │
│      ╱                               │
│  ┌╌🗣╌┐ 1996   ◀ 🧍 BẠN ĐANG Ở ĐÂY    │ ← viền nét đứt = tin đồn
│  └╌☕╌┘                               │
│      ╲                               │
│     ╱ ╲        🔀 ngã ba 2000–2001    │
│ ┌╌🗣╌┐ (🧠)                            │ ← hai làn hình thoi
│ └╌📈╌┘ (🧵)                            │
│     ╲ ╱                              │
│      ⬡⚡ ≈2003  ?                     │ ← biến cố: biết có, chưa biết gì
│        ╲                             │
│        (🧠🏦)2005                     │
│ ┄┄ 2006–2015 · Bong bóng & đóng băng ┄│
│               ⋮  (cuộn tiếp)          │
│                       🏁 2024         │
└──────────────────────────────────────┘
```

Chú thích một dòng cố định dưới HUD, chỉ hiện ở 3 trạm đầu (A Dark Room: mở dần, giải thích tại chỗ): `( ) ký ức · ┌╌┐ tin đồn · ⬡ biến cố · 🔀 ngã ba`.

### 4.4 Khung màn hình quyết định (tấm bảng trượt lên, bàn cờ vẫn hiện phía trên)

**Trạm 🗣 đơn, 4 phương án** (trạm 6 trong ví dụ mục 5, *trước* khi dùng 💡):
```
│   … bàn cờ (thu nhỏ, trạm hiện tại sáng) …   │
├──────────────────────────────────────────────┤
│ 🗣 TIN ĐỒN                              1996 │
│                    ☕                         │
│        Mở chuỗi quán cà phê kiểu mới         │
│ "Thiên hạ bảo dân mình không chịu trả tiền   │
│   cho cà phê sang."                          │
│  Nếu chơi 10 lần giống vầy thì thường:        │
│  😄😄😄😄😢😢😢😢😢😢   4 lần MAY · 6 lần XUI       │ ← OddsFaces giữ nguyên
├──────────────────────────────────────────────┤
│ 🔥 LÀM LỚN   bỏ ¼ túi = 101tr                 │
│    😄 → túi thành 1,1 tỷ  😢 → còn 302tr ❤️−2   │
│ 🌱 LÀM NHỎ   bỏ ⅛ túi = 50tr                  │
│    😄 → túi thành 755tr   😢 → còn 352tr  ❤️ 0  │
│ 🛌 NGHỈ NGƠI  giữ 402tr               ❤️ +1   │
│ 💡 NHỚ LẠI xem tin này đúng không (còn 3)     │
└──────────────────────────────────────────────┘
```
- Vị trí 4 nút **không bao giờ đổi** (học từ vòng hội thoại Mass Effect [28]). Mỗi nút có biểu tượng + chữ + màu (🔥 vàng, 🌱 xanh, 🛌 xám, 💡 viền vàng).
- Khi ❤️ ≤ 3: nút 🔥 xám lại kèm 🔒 *"Mệt quá, cần ❤️ 4+ mới làm lớn được"*.
- Bấm 💡 thì tấm bảng lật: `🔎 SỰ THẬT` (bẫy, nền đỏ nhạt, hiện `real.explain`) hoặc `✅ TIN ĐÚNG` (tin thật). Ba nút trên tính lại theo số thật, nút 💡 biến mất.

**Trạm ngã ba 🔀**:
```
├──────────────────────────────────────────────┤
│   Đường tách đôi, chọn MỘT làn (hoặc nghỉ)    │
│ ┌───────────────────┐ ┌────────────────────┐ │
│ │🗣 TIN ĐỒN    2000 │ │🧠 KÝ ỨC       2001 │ │
│ │       📈          │ │       🧵           │ │
│ │Mua REE, SAM phiên │ │Mở xưởng may xuất   │ │
│ │đầu tiên           │ │khẩu Mỹ             │ │
│ │😄 6/10 → 1,9 tỷ   │ │😄 8/10 → 1,1 tỷ    │ │
│ │😢 4/10 → 566tr ❤️−2│ │😢 2/10 → 566tr ❤️−2 │ │
│ │ bỏ ½ = 377tr      │ │ bỏ ½ = 377tr       │ │
│ │ [ ◀ ĐI LÀN NÀY ]  │ │ [ ĐI LÀN NÀY ▶ ]   │ │
│ └───────────────────┘ └────────────────────┘ │
│ 🛌 NGHỈ NGƠI  giữ 755tr       ❤️ +1 (đã đầy)  │
│ 💡 NHỚ LẠI làn 🗣 (còn 2)                      │
└──────────────────────────────────────────────┘
```

**Trạm biến cố ⚡**:
```
├──────────────────────────────────────────────┤
│ ⚡ BIẾN CỐ                               ≈1990 │
│                    😓                         │
│              Bị lừa góp vốn                   │
│ "Một người quen rủ góp vốn làm ăn — hoá ra    │
│  là lừa đảo."                                 │
├──────────────────────────────────────────────┤
│ ⚖️ THEO KIỆN TỚI CÙNG   túi → 96tr     ❤️ −3   │
│ 📘 COI NHƯ HỌC PHÍ      túi → 92tr     ❤️ −1   │
│ 🛌 NGHỈ 1 THÁNG CHO NGUÔI túi → 90tr   ❤️  0   │
└──────────────────────────────────────────────┘
```

**Khoảnh khắc kết quả** (khoảng 1,2 giây, bấm để bỏ qua): giữ "đèn chạy" trên 10 mặt 😄/😢 như thiết kế trước. Sau đó **💰 đếm lên hoặc xuống, trái tim vỡ hoặc đầy lại có hoạt ảnh**, một dòng kiểu Jumanji [12] hiện tại trạm ("REE kẹt thanh khoản, bạn bán non."), rồi tấm bảng trượt xuống và quân cờ bước 0,6 giây sang trạm kế. Tấm bảng của trạm mới tự trượt lên.

### 4.5 Bàn cờ có rẽ nhánh không? **Không. Đường thẳng + 4 ngã ba hình thoi**

| Tiêu chí | Nhánh dài kiểu Mario Party / Slay the Spire [2][9][10] | **Thẳng + hình thoi (chọn)** |
|---|---|---|
| Năm luôn tăng | Hai nhánh phải chia khoảng năm, dễ chồng chéo | ✓ Mỗi hình thoi chỉ trong ±2 năm |
| Đề hôm nay so được | Mỗi người đi tuyến khác thì không so được | ✓ Cùng 20 trạm, khác nhau chỉ ở lựa chọn |
| Không có quyết định trì hoãn (nguyên tắc 4 của bản trước) | ✗ Chọn tuyến là chọn trước nhiều trạm | ✓ Mỗi ngã ba là một quyết định, có kết quả ngay |
| Dữ liệu | Cần gấp đôi lá (chỉ có 31) | ✓ Dùng đúng bộ hiện có |
| Cảm giác "chọn đường" | Mạnh | Vừa đủ: đường tách ra thật trên bàn cờ (SMB3: mọi đường về một lâu đài [8]) |

Lớp chiến lược "nhìn trước" vẫn còn: cả 20 trạm hiện từ đầu, nên người chơi có thể **giữ sức** khi thấy ⚡ hoặc chùm trạm 2006–2007 phía trước.

### 4.6 Màn hình kết thúc

```
┌──────────────────────────────────────┐
│          NĂM 2025 — CHỐT SỔ          │
│              💰 2,1 tỷ               │
│      🏅 TRUNG LƯU  ·  🌿 AN NHÀN      │ ← bậc tiền + danh hiệu ❤️
│     ❤️❤️❤️❤️❤️❤️❤️♡♡♡  7/10            │
│   Thiếu 2,9 tỷ nữa là Đại gia        │
├──────────────────────────────────────┤
│  Đường đời của bạn (bàn cờ thu nhỏ): │
│  🟩⚡🟩🟩·🟩🟥⚡🟩⛔🟩🟥🟩·⚡🟩🟩⛔🟩🟩   │
│  🟩 thắng 🟥 thua ⛔ né bẫy ⚡ biến cố · nghỉ │
│  Né 3/4 bẫy · Dùng 💡 2/3 · Nghỉ 2 lần  │
├──────────────────────────────────────┤
│ Trạm tiếc nhất: 1995, bạn nghỉ        │
│   (làm lớn thì đã thắng) → Chuyện thật│
├──────────────────────────────────────┤
│ [Chia sẻ]   [Chơi lại]   [Đề hôm nay] │
└──────────────────────────────────────┘
```

**Danh hiệu ❤️** (theo ❤️ cuối ván, chỉ là chữ đi kèm bậc, **không nhân vào tiền**, giống Life Tiles cộng ở cuối [1]):

| ❤️ cuối | Danh hiệu | Ví dụ ghép |
|---|---|---|
| 7–10 | 🌿 **an nhàn** | "Đại gia an nhàn" |
| 4–6 | 😮‍💨 **vất vả** | "Trung lưu vất vả" |
| 1–3 | 🥵 **kiệt sức** | "Tài phiệt kiệt sức" |
| 0 | 🏥 **nhập viện năm X** (túi đã ×0,5) | "Tiểu thương · nhập viện 2009" |

Văn bản chia sẻ: `Sổ trọng sinh 08/11 · 🏅 Trung lưu an nhàn · 2,1 tỷ · ❤️7/10` + dải 20 ô + `/vi/simulator?d=20261108`.

---

## 5. Ví dụ 7 trạm đầu của một ván thật (con số chính xác)

**Cách tái tạo:** Đề hôm nay 08/11/2026 có `seed = hashSeed("20261108") = 2374510634`. Bàn cờ sinh bằng `buildBoard` ở mục 7.2. Kết quả mỗi trạm dùng đúng hàm hiện có `turnRng(seed, i, "resolve")` (lấy một số `r`; 😄 khi `r < winIn10/10`; `i` tính từ 0). Mọi số dưới đây là output của script chạy trong lượt này, làm tròn khi hiển thị. Bàn cờ của seed này: 1986 · ⚡≈1990 · 1993 · 1994 · 1995 · 🗣1996 · 🔀2000/2001 · ⚡≈2003 · 2005 · 2006 · 2006 · 🗣2007(bẫy) · 🔀2011 · 🔀2014 · 🔀2015 · ⚡≈2018 · 2020 · 🗣2022(bẫy) · 2023 · 2024.

Ban đầu: **💰 50 triệu · ❤️ 10/10 · 💡×3 · Phàm nhân.**

| Trạm | Nút (mốc thật trong `vn.json`) | Các phương án in trên bảng | Người chơi | `r` → kết quả | 💰 sau | ❤️ sau | Bậc |
|---|---|---|---|---|---|---|---|
| 1 | 🧠 **1986** `vn-doi-moi-1986` "Mở tiệm tạp hoá tư nhân" (½ · 8/10 · ×3 · ×0,5) | 🔥 bỏ 25tr: 😄 túi **100tr** / 😢 **37,5tr** ❤️−2 · 🌱 bỏ 12,5tr: 😄 **75tr** / 😢 **43,75tr** · 🛌 50tr (❤️ đã đầy) | 🔥 Làm lớn | 0,532 < 0,8 → 😄 | **100tr** | 10 | Phàm nhân |
| 2 | ⚡ **≈1990** `e-scam` "Bị lừa góp vốn" | ⚖️ kiện: **96tr** ❤️−3 · 📘 học phí: **92tr** ❤️−1 · 🛌 nghỉ: **90tr** ❤️0 | 📘 Coi như học phí | (không ngẫu nhiên) | **92tr** | **9** | Phàm nhân |
| 3 | 🧠 **1993** `vn-phu-my-hung-land` "Mua đất đầm lầy Nam Sài Gòn" (½ · 9/10 · ×6 · ×0,5) | 🔥 bỏ 46tr: 😄 **322tr** / 😢 **69tr** ❤️−2 · 🌱 bỏ 23tr: 😄 **207tr** / 😢 **80,5tr** · 🛌 92tr ❤️+1 | 🔥 Làm lớn | 0,856 < 0,9 → 😄 | **322tr** | 9 | ⬆ **Tiểu thương** |
| 4 | 🧠 **1994** `vn-us-embargo-lift-1994` "Mở công ty xuất nhập khẩu" (¼ · 8/10 · ×3 · ×0,5) | 🔥 bỏ 80,5tr: 😄 **483tr** / 😢 **281,75tr** ❤️−2 · 🌱 bỏ 40,25tr: 😄 **402,5tr** / 😢 **301,9tr** · 🛌 322tr ❤️+1 | 🌱 Làm nhỏ (thấy ⚡ ở trạm 8, muốn giữ sức) | 0,517 < 0,8 → 😄 | **402,5tr** | 9 | Tiểu thương |
| 5 | 🧠 **1995** `vn-us-normalization-1995` "Đón khách Mỹ đầu tiên về làm ăn" (¼ · 8/10 · ×2 · ×0,5) | 🔥 bỏ 100,6tr: 😄 **503,1tr** / 😢 **352,2tr** ❤️−2 · 🌱 bỏ 50,3tr: 😄 **452,8tr** / 😢 **377,3tr** · 🛌 402,5tr ❤️+1 | 🛌 Nghỉ ngơi | (không lật; `r` = 0,044 nên làm lớn thì đã 😄, màn cuối ghi "trạm tiếc nhất") | **402,5tr** | **10** | Tiểu thương |
| 6 | 🗣 **1996** `vn-coffee-chain-boom` "Mở chuỗi quán cà phê kiểu mới" (¼ · 4/10 · ×8 · ×0) | Như khung 4.4. Bấm **💡 (3→2)** thì lật **✅ TIN ĐÚNG** (số in là số thật). 🔥 bỏ 100,6tr: 😄 **1,107 tỷ** / 😢 **301,9tr** ❤️−2 · 🌱 bỏ 50,3tr: 😄 **754,7tr** / 😢 **352,2tr** · 🛌 402,5tr | 💡 rồi 🌱 Làm nhỏ | 0,281 < 0,4 → 😄 | **754,7tr** | 10 | Tiểu thương |
| 7 | 🔀 **2000 ↔ 2001**: 🗣 `vn-hose-first-session-2000` "Mua REE, SAM phiên đầu tiên" (½ · 6/10 · ×4 · ×0,5) ↔ 🧠 `vn-bta-2001` "Mở xưởng may xuất khẩu Mỹ" (½ · 8/10 · ×2 · ×0,5) | Làn 🗣: bỏ 377,3tr: 😄 **1,887 tỷ** / 😢 **566,0tr** ❤️−2 · Làn 🧠: bỏ 377,3tr: 😄 **1,132 tỷ** / 😢 **566,0tr** ❤️−2 · 🛌 754,7tr · 💡 (còn 2) | Đi làn 🗣 REE, **không** dùng 💡 | 0,844 ≥ 0,6 → 😢 "thanh khoản cực thấp, kẹt lệnh nhiều tháng" (làn 🧠 cũng 😢 vì 0,844 ≥ 0,8) | **566,0tr** | **8** | Tiểu thương (rung đỏ) |

Diễn biến: **💰 50 → 100 → 92 → 322 → 402,5 → 402,5 → 754,7 → 566,0 triệu** · **❤️ 10 → 10 → 9 → 9 → 9 → 10 → 10 → 8** · 💡 còn 2. Khoảng 50 giây chơi.

Ví dụ này cho thấy đủ 5 tình huống: (1) Làm lớn thắng, (2) biến cố đổi tiền lấy sức, (4) Làm nhỏ để giữ sức, (5) Nghỉ hồi ❤️ (và cái giá cơ hội hiện ở màn cuối), (6) 💡 trên một **tin thật** (không phải chỉ bẫy mới có 💡), (7) thua ở ngã ba và mất 2❤️.

**Xem trước trạm 8:** ⚡ ≈2003 `e-parent-illness` "Cha mẹ ốm" với túi 566tr: 🏥 tuyến trên **536tr, ❤️0** · viện tỉnh tự chăm **556tr, ❤️−2** · nhờ anh chị em **566tr, ❤️−3**. Người chơi đang ❤️ 8: chọn phương án đầu thì giữ 8 (xanh), phương án cuối thì xuống 5 (vàng). Đây đúng là đánh đổi kiểu Papers, Please [24].

---

## 6. Cân bằng: mô phỏng Monte Carlo (dữ liệu thật, luật mục 2–4)

Script chạy trong lượt này (thư mục scratch, không nằm trong repo). Nó import **nguyên văn** `rng.ts` và `deckData.ts` hiện tại, dùng `buildBoard` ở mục 7.2, luật ❤️ ở mục 2.2 và biến cố ở mục 3.4. Mỗi chiến lược chạy 4.000 ván với cùng tập seed.

| Chiến lược | Mô tả | Trung vị 💰 | P10 – P90 | 🏥 Nhập viện | ❤️ trung vị cuối | Bậc phổ biến |
|---|---|---|---|---|---|---|
| Nghỉ hết | Luôn 🛌, biến cố chọn B | **40 triệu** | 35 – 46tr | 0% | 10 | Phàm nhân |
| Ngẫu nhiên | Bấm bừa | **0,45 tỷ** | 0,07 – 3,5 tỷ | 2% | 6 | Tiểu thương |
| Làm nhỏ hết | Luôn 🌱; ngã ba chọn làn có kỳ vọng in cao hơn | **1,0 tỷ** | 0,16 – 7,7 tỷ | 1% | 3 | Tiểu thương |
| Làm lớn hết | Luôn 🔥; ngã ba chọn kỳ vọng in cao hơn (nên hay dính bẫy); biến cố chọn A | **1,8 tỷ** | 0,17 – 23 tỷ | **31%** | 2 | Trung lưu |
| Làm lớn + 💡 | Như trên nhưng dùng 💡 cho 3 lá 🗣 đầu tiên gặp (cả tin thật) | **2,4 tỷ** | 0,18 – 35 tỷ | 28% | 2 | Trung lưu |
| Biết lịch sử, tham | Né mọi bẫy, còn lại 🔥 hết | **4,6 tỷ** | 0,25 – 76 tỷ | **17%** | 3 | Trung lưu |
| **Biết lịch sử + giữ sức** | Né bẫy; 🔥 nếu lá ≥ 7/10, không thì 🌱; ❤️ ≤ 3 thì 🛌 | **5,8 tỷ** | 0,34 – 59 tỷ | **4%** | 5 | **Đại gia** |

Kết luận:
- Thứ tự mong muốn **đạt được**: biết lịch sử + giữ sức > biết lịch sử tham > làm lớn + 💡 > làm lớn hết > làm nhỏ hết > ngẫu nhiên > nghỉ hết.
- ❤️ **có răng mà không áp đảo**: người tham bị nhập viện khoảng 1/3 số ván, người biết giữ sức khoảng 1/25. Không chiến lược hợp lý nào bị ❤️ "giết" quá 1/3 số ván.
- Kiến thức lịch sử vẫn là yếu tố số 1 (×2,5 so với làm lớn hết). Giữ sức thêm khoảng +25% trung vị và giảm nhập viện từ 17% xuống 4%.
- **Luật đã thử và bỏ** (cùng mô phỏng): "Làm lớn tốn −1❤️ ngay cả khi thắng" làm **100%** người làm lớn và 98% người làm nhỏ nhập viện, quá khắc nghiệt. "Làm nhỏ thua cũng −1❤️" làm 79–89% người làm nhỏ nhập viện. Luật cuối (chỉ 😢 khi Làm lớn mới −2❤️, ngã ba tự hạ xuống Làm nhỏ khi kiệt sức) là bản duy nhất qua được tất cả tiêu chí trên.
- **Nút chỉnh nếu thử nghiệm thấy quá gắt:** đổi 😢 khi Làm lớn từ −2 thành −1 với lá ¼ túi, hoặc cho 🛌 hồi +2. Mỗi lần chỉnh phải chạy lại `balance.test.ts`.

---

## 7. Đặc tả triển khai

### 7.1 Kiểu dữ liệu (thay `types.ts`)

```ts
// giữ nguyên: Stake, CardKind, CardStat, STARTING_CAPITAL, STARTING_RECALLS, TIERS
export interface EventOption { id: "a" | "b" | "c"; icon: string; label: string; money: number /* |x|<1: % túi, else VND */; heart: number }
export interface EventStat { id: string; icon: string; title: string; story: string; options: [EventOption, EventOption, EventOption] } // bỏ `delta`, giá trị cũ thành option b

export type BoardNode =
  | { kind: "single"; year: number; card: CardStat }
  | { kind: "fork"; year: number; left: CardStat; right: CardStat }   // left = năm sớm hơn
  | { kind: "event"; year: number; approx: true; event: EventStat };

export type Choice =
  | { t: "big" } | { t: "small" } | { t: "rest" }
  | { t: "lane"; side: "left" | "right" }
  | { t: "event"; option: "a" | "b" | "c" };

export interface NodeRecord { index: number; choice: Choice; outcome: "win" | "lose" | "rest" | "event" | "trapAvoided" | "trapHit"; usedRecall: boolean; before: number; after: number; heartBefore: number; heartAfter: number; label: string }

export interface GameState {
  v: 3; seed: number; nodes: BoardNode[]; index: number;
  wallet: number; heart: number; recallsLeft: number; revealedIds: Set<string>;
  history: NodeRecord[]; finished: boolean; endedBy: null | "finish" | "hospital" | "broke";
}
export const TOTAL_NODES = 20;
export const HEART_MAX = 10, HEART_START = 10, HEART_EXHAUSTED = 3; // ≤3 khoá Làm lớn
export const BIG_LOSS_HEART = -2, REST_HEART = +1, HOSPITAL_MULT = 0.5, BROKE_BELOW = 1_000_000;
```

### 7.2 `board.ts` (thay `deck.ts`): bộ sinh bàn cờ tất định

```
buildBoard(seed):
  rng = mulberry32(seed ^ 0x9e3779b9)                       // giống deck.ts hiện tại
  A. Xương sống cố định 1986–2005 (dữ liệu chỉ có 8 lá trong khoảng này):
     6 trạm đơn: doi-moi-1986, phu-my-hung-1993, us-embargo-1994, us-normalize-1995, coffee-1996 (🗣), hnx-2005
     1 ngã ba tin thật: hose-2000 (🗣) ↔ bta-2001 (🧠)
  B. 2006–2024 (ngẫu nhiên theo seed):
     traps = shuffle(TRAP_CARDS).slice(0,4)
     2 ngã ba bẫy: traps[0], traps[1], mỗi cái ghép một 🧠 năm ≥2006, |Δnăm| ≤ 2, ưu tiên khác milestoneId
     1 ngã ba tin thật: một 🗣 (ecommerce-2010 | grab-2014 | crypto-2021) + một 🧠 |Δnăm| ≤ 2
     2 trạm 🗣 đơn là bẫy: traps[2], traps[3]
     lấp thêm trạm đơn (🧠 còn lại + 🗣 thật còn lại) cho đủ 10 nút lá ở giai đoạn B
  C. Sắp tất cả 17 nút theo năm (cùng năm thì trạm đơn trước ngã ba)
  D. 3 biến cố (shuffle(EVENTS).slice(0,3)) chèn vào 3 khoảng trống năm lớn nhất
     (hoà thì lấy khoảng sớm hơn), year = trung điểm, hiển thị "≈"
  assert length == 20, năm không giảm, |Δnăm| trong ngã ba ≤ 2
```
Đã chạy trên 4.000+ seed: không lần nào lỗi, 0 bước lùi năm, độ lệch tối đa trong ngã ba 2 năm. Khoảng 1986→1993 luôn là khoảng trống lớn nhất, nên **trạm 2 luôn là ⚡**. Đây là điều có lợi: người chơi gặp cơ chế biến cố ngay ở trạm thứ hai, kiểu A Dark Room.

*Đánh đổi đã biết:* 7 trạm đầu (1986–2005) giống nhau ở mọi ván vì dữ liệu chỉ có 8 lá trong 20 năm đầu. Chỉ kết quả lật và biến cố ≈1990/≈2003 thay đổi. Cách sửa thật là thêm lá từ `content-expansion.md` (quán net 1997–2002…) sau khi kiểm chứng. Đây là việc ngoài phạm vi bản này.

### 7.3 `engine.ts`: `resolveChoice` v3 (giả mã)

```
stake(card, size) = round(wallet × FRAC[card.stake] × (size=="small" ? 0.5 : 1))
playCard(card, size):  odds = effectiveOdds(card)        // giữ nguyên: bẫy luôn dùng real
  win = turnRng(seed, index, "resolve")() < odds.winIn10/10   // giữ nguyên salt cũ
  wallet = round(wallet − s + s × (win ? winMult : loseMult))
  if (!win && size=="big") heart += BIG_LOSS_HEART
big   : if heart ≤ HEART_EXHAUSTED → từ chối (UI đã khoá)
lane  : playCard(lá được chọn, heart ≤ HEART_EXHAUSTED ? "small" : "big")
rest  : heart = min(HEART_MAX, heart + REST_HEART)
event : opt = event.options[x]; wallet = |opt.money|<1 ? wallet×(1+opt.money) : max(0, wallet+opt.money); heart = min(MAX, heart+opt.heart)
sau mỗi nút: heart ≤ 0 → wallet = round(wallet × HOSPITAL_MULT), endedBy="hospital"
             wallet < BROKE_BELOW → endedBy="broke"
             index==20 → endedBy="finish"
recall(state): dùng được khi nút hiện tại có lá kind ∈ {rumor, trap} chưa lộ và recallsLeft>0
```

### 7.4 Thành phần UI (`src/components/cardgame/`)

| Component | Việc |
|---|---|
| `CardGameApp` | Máy trạng thái `intro → board(sheet mở) → result → board(bước đi) → … → end`. Lưu `localStorage` theo seed để F5 không mất ván. Đọc `?d=YYYYMMDD` |
| `Hud` | 💰 (hoạt ảnh đếm) · thang bậc (giữ nguyên markup hiện tại) · `HeartBar` · "Trạm n/20" · 💡×n |
| `HeartBar` | 10 ❤️/♡, màu xanh/vàng/đỏ **kèm chữ** (Khỏe / Mệt / Kiệt sức), hoạt ảnh vỡ hoặc đầy lại |
| `BoardMap` | SVG đường uốn lượn, 20 `NodeDot`, dải nền 4 chặng, token 🧍, tự cuộn tới trạm hiện tại, ngã ba vẽ hình thoi |
| `NodeDot` | Trạng thái `future` (hình dạng + biểu tượng + năm) / `current` (nhấp nháy) / `done` (ô kết quả 🟩🟥⛔⚡·🏥) |
| `DecisionSheet` | Tấm bảng trượt lên: `NodeCard` + 3–4 `OptionRow` ở vị trí cố định |
| `NodeCard` | Tách từ `GameCard`: huy hiệu, năm, biểu tượng, động từ, câu chuyện, `OddsFaces`, mặt `🔎 SỰ THẬT` / `✅ TIN ĐÚNG`, link "Chuyện thật →" |
| `OptionRow` | Biểu tượng + nhãn + tiền bỏ ra + "😄 → túi X / 😢 → túi Y" + ❤️Δ; trạng thái khoá 🔒 |
| `ForkSheet` | 2 `NodeCard` dạng gọn (mobile xếp dọc) + nút làn + 🛌 + 💡 |
| `EventSheet` | Lá ⚡ + 3 `OptionRow` |
| `EndScreen` | 💰, bậc + danh hiệu ❤️, bàn cờ thu nhỏ = dải 20 ô, né bẫy/💡/nghỉ, "trạm tiếc nhất", Chia sẻ/Chơi lại/Đề hôm nay |

---

## 8. Tái sử dụng hay viết lại (so với code **hiện tại**)

| File (số dòng hiện tại) | Quyết định | Giữ gì | Đổi gì | Lý do |
|---|---|---|---|---|
| `lib/cardgame/rng.ts` (27) | **Giữ nguyên 100%** | `mulberry32`, `hashSeed`, `seededShuffle` | — | Nền của Đề hôm nay và tái tạo ví dụ |
| `lib/cardgame/deckData.ts` (50) | **Giữ ~90%** | 25 `MEMORY_CARDS` + 6 `TRAP_CARDS`: **không đổi một số nào** | `EVENTS`: giữ `id/icon/title/story`, thay `delta` bằng `options[3]` (mục 3.4); `delta` cũ thành phương án B | Đây là thiết kế lại giao diện và tương tác, không phải nghiên cứu dữ liệu mới |
| `lib/cardgame/types.ts` (80) | **Sửa ~50%** | `Stake`, `CardKind`, `CardStat`, `STARTING_CAPITAL`, `STARTING_RECALLS`, `TIERS` | `Turn` → `BoardNode` (+`year`), `Choice` mới, `GameState` v3 (+`heart`, `endedBy`), `TurnRecord` → `NodeRecord`, hằng số ❤️ | Thêm chiều ❤️ và 3–4 phương án |
| `lib/cardgame/deck.ts` (65) | **Viết lại** thành `board.ts` (~80 dòng) | Cách khởi tạo `rng = mulberry32(seed ^ 0x9e3779b9)` | Toàn bộ thuật toán (mục 7.2) | **Lỗi năm đi lùi ở 1000/1000 seed** + lộ bẫy trong ngã ba (mục 3.6) |
| `lib/cardgame/engine.ts` (116) | **Sửa ~50%** | `stakeAmount` (thêm hệ số 0,5), `turnRng` (giữ salt `"resolve"`), `effectiveOdds`, `tierOf`, `nextTier` | `initGame` (+heart), `resolveChoice` viết lại (mục 7.3), `recall` mở cho mọi 🗣 | Thêm ❤️, 5 kiểu lựa chọn, điều kiện kết thúc |
| `lib/cardgame/share.ts` (12) | **Giữ ~80%** | `todaySeedString`, khung `encodeShare` | Payload `{v:3, seed, w, h, t, e}` + văn bản chia sẻ có ❤️ | |
| `components/cardgame/format.ts` (13) | **Giữ 100%**, thêm 1 hàm | `fmtVnd`, `oddsBar` | `stakeLabel` thêm "⅛ túi" (Làm nhỏ của lá ¼); thêm `heartLabel(h)` | |
| `components/cardgame/GameCard.tsx` (109) | **Giữ ~50%**, đổi tên thành `NodeCard` | `OddsFaces` (😄/😢 + màu + chữ), phần đầu lá, mặt `🔎 SỰ THẬT`, link "Chuyện thật →" | Bỏ dòng "Bạn bỏ ra" và hai dòng "→ có/→ còn" (chuyển xuống `OptionRow`, đổi sang "túi thành/còn"). **Sửa lộ bẫy**: bỏ viền vàng riêng cho bẫy, 💡 cho mọi 🗣 | |
| `components/cardgame/CardGameApp.tsx` (203) | **Viết lại** (~20% giữ) | Logic `start(daily)`, tính `progressPct` của thang bậc, khung màn kết thúc và chuỗi emoji | Bàn cờ, tấm bảng, HUD 2 thanh, máy trạng thái, `localStorage` | Từ "một lá giữa màn hình" sang "bản đồ + tấm bảng" |
| `app/[lang]/simulator/page.tsx` (44) | **Giữ khung**, đổi chữ | Cấu trúc trang, `hasLocale` | `metadata.title` → "Sổ trọng sinh — Đường đời 1986"; `intro`: "20 trạm từ 1986 đến 2024. Mỗi trạm chọn một cách, giữ cả 💰 lẫn ❤️." | Chỉ nêu ở đây, **không sửa** trong lượt này |
| `__tests__/engine.test.ts` | **Sửa** | Test tất định, `tierOf`, công thức tiền | Test mới: năm không giảm & ngã ba ≤ 2 năm trên 1.000 seed; ❤️ −2 chỉ khi thua lúc Làm lớn; khoá ở ❤️ ≤ 3; nhập viện ×0,5; **tái tạo ví dụ mục 5**: 💰 50→100→92→322→402,5→402,5→754,7→566,0tr, ❤️ 10→10→9→9→9→10→10→8 | |
| `__tests__/balance.test.ts` | **Viết lại** | Khung Monte Carlo + `median` | 7 chiến lược ở mục 6; khẳng định thứ tự trung vị, `bigAll` nhập viện trong khoảng 20–45%, `historyPaced` ≤ 8% | Chặn hồi quy cân bằng trong CI |

**Tổng:** lớp logic (`lib/cardgame`, ~350 dòng) giữ khoảng **60%**; lớp UI (~325 dòng) giữ khoảng **30%**. Toàn bộ **dữ liệu** giữ lại; chỉ thêm 18 dòng phương án biến cố.

*Ngoài phạm vi, ghi nhận để xử lý cùng đợt:* `CardGameApp` tạo link chia sẻ `?s=<base64>`, nhưng trang không đọc tham số này (đã đọc `page.tsx` và `CardGameApp.tsx`). Bản mới dùng `?d=YYYYMMDD` như thiết kế trước đã đề xuất.

---

## 9. Kế hoạch xây dựng

### 9.1 Lịch (1 dev)

| Ngày | Việc | Xong khi |
|---|---|---|
| 1 | `types.ts` v3, `board.ts`, `engine.ts` v3, `EVENTS.options`; test tất định, năm tăng, ❤️, nhập viện | Test tái tạo đúng chuỗi 💰/❤️ ở mục 5 |
| 2 | `BoardMap` (SVG, uốn lượn, dải chặng, hình thoi), `NodeDot`, token, tự cuộn | Thấy cả 20 trạm trên mobile 375px, phân biệt 4 loại trạm không cần màu |
| 3 | `DecisionSheet`, `OptionRow`, `NodeCard` (tách từ `GameCard`), `ForkSheet`, `EventSheet`, 💡 cho mọi 🗣, khoá khi kiệt sức | Chơi trọn 20 trạm |
| 4 | `Hud` + `HeartBar`, hoạt ảnh kết quả (đèn chạy, đếm tiền, tim vỡ), `EndScreen`, chia sẻ, `?d=`, `localStorage`, sửa chữ `page.tsx` | Một ván hoàn chỉnh, chia sẻ được |
| 5 | `balance.test.ts` mới, chạy lại cân bằng, chỉnh nút nếu cần (mục 6); kiểm tra a11y (nhãn chữ cho mọi màu, bàn phím 1/2/3/4) | Thứ tự trung vị và tỉ lệ nhập viện như mục 6 |
| 6 (đệm) | **Thử 15 giây** với 5 người (mục 9.2), sửa theo kết quả | ≥ 4/5 đạt |

Tổng **5–6 ngày công**. Bản lật bài trước ước 4–5 ngày; phần tăng thêm chủ yếu nằm ở bàn cờ SVG và tấm bảng.

### 9.2 Bài kiểm tra "15 giây" cho bàn cờ

5 người chưa từng thấy game. Mở thẳng màn hình bàn cờ ở trạm 1, **không giải thích gì**. Sau 15 giây, hỏi ba câu và để họ **chỉ tay** trên màn hình:

1. *"Bạn đang ở đâu, sẽ đi đâu?"* Đạt khi chỉ vào quân cờ/1986 và đường đi xuống tới 2024 ("đi qua các năm").
2. *"Hai thứ trên cùng là gì? Bạn phải làm gì với nó?"* Đạt khi nói được "tiền và sức khỏe, đừng để hết".
3. *"Ở mỗi trạm bạn làm gì?"* Đạt khi nói được "chọn một trong mấy cách".

Đạt khi **≥ 4/5 người trả lời đúng cả 3 câu**. Câu mục tiêu là: *"Tôi đi dọc con đường qua các năm, mỗi trạm chọn một trong mấy cách, và không được để hết tiền hay hết sức."*

Thêm hai kiểm tra phụ (trong 3 trạm đầu): (a) thời gian tới lần bấm có chủ đích đầu tiên ≤ 15 giây; (b) sau trạm 3, người chơi giải thích được Làm lớn khác Làm nhỏ ở chỗ nào (mong đợi: "làm lớn thua thì mất tim"). Ghi lại nếu có ai đoán được trạm 🗣 nào là bẫy **mà không dùng 💡**: nếu có, nghĩa là lại có rò rỉ thông tin.

---

## 10. Rủi ro và câu hỏi mở

- **Cảm giác cờ bạc:** giữ nguyên mọi biện pháp của bản trước (không tiền thật, không nạp tiền, không dùng "cược", tỉ lệ công khai). ❤️ còn **giảm** rủi ro này: game giờ thưởng cho việc nghỉ ngơi và làm vừa sức, không chỉ cho việc tất tay.
- **Chủ đề nhạy cảm trong biến cố:** "Nhờ anh chị em lo" khi cha mẹ ốm có thể bị đọc là bất hiếu. Câu chữ cần biên tập trung tính (là chia việc, không phải bỏ mặc). Phương án C có ❤️−3 là để thể hiện sự áy náy, không phải để phán xét.
- **Bảy trạm đầu cố định** (mục 7.2): hạn chế của dữ liệu, không phải của thiết kế.
- **Hiệu năng SVG trên máy yếu:** 20 nút + một path là rất nhẹ. Hoạt ảnh dùng CSS transform.
- **Câu hỏi cho owner:** (1) Có muốn ❤️ = 0 nhẹ hơn ("nghỉ 2 trạm" thay vì kết thúc) không? Mô phỏng chỉ kiểm tra phương án kết thúc + ×0,5. (2) Tên nút: "Làm lớn/Làm nhỏ" hay "Dốc sức/Vừa sức"? (3) Đường đi trên-xuống (dòng thời gian) hay dưới-lên (leo bậc kiểu Candy Crush)?

---

## 11. Lỗ hổng truy xuất (nêu thẳng, không lấp bằng trí nhớ)

- **Plants vs. Zombies:** trang Wikipedia đã mở [26] không mô tả bản đồ thế giới. **Không dùng** làm căn cứ.
- **Dream Daddy / visual novel:** trang Wikipedia [29] và fandom chỉ mô tả thể loại và nhiều kết thúc, **không** nói lựa chọn có hiện chỉ số hay không. Trang Wikipedia "Visual novel" và "Dating sim" chỉ lấy về được khoảng 3.000 ký tự đầu (phần hộp thông tin). Mọi kết luận về hiện/giấu chỉ số ở mục 3 dựa trên Reigns GoT [14], Mass Effect [28] và Papers, Please [24].
- **Slay the Spire:** chỉ trích được "branching structure" [9] và "map with multiple routes" [10]. Trang fandom và wiki.gg về bản đồ trả về 404/403, nên **không** trích được gì về biểu tượng loại phòng trên bản đồ.
- **Oregon Trail:** trang fandom về Health trả 403. Chỉ trích được "health of the party" hiện trên màn hình đi đường, điều kiện thua và điểm cuối ván [16][17]. **Không** khẳng định các mức good/fair/poor.
- **Sunless Sea / Sunless Skies:** trích được thang Terror 0–100 và tên các mức [23], nhưng các mục "Gaining/Losing Terror" trên fandom trống khi lấy về. Trang Sunless Skies [30] không có mô tả cơ chế Terror. **Không** khẳng định chuyện gì xảy ra ở Terror 100.
- **Banner Saga:** trang Wikipedia [31] không nhắc Morale, nên số liệu Morale/Renown lấy từ fandom [20][21] (wiki cộng đồng, độ tin cậy thấp hơn).
- **Reigns:** trang fandom chính chỉ lấy về được thanh điều hướng. Trang Wikipedia của bản gốc chỉ có đoạn mở đầu phần Gameplay. Nhận định "cạn hoặc tràn là hết đời" lấy từ Her Majesty [13] và GoT [14].
- **Jumanji:** trang về thương hiệu bị cắt ngắn, nên dùng trang phim 1995 [12].
- **Mario Party "Space" (mariowiki):** trang gốc là trang định hướng, nên dùng các trang Blue/Red/Event Space [3][4][5].

---

## Nguồn (truy xuất 08/11/2026)

1. The Game of Life — Wikipedia. https://en.wikipedia.org/wiki/The_Game_of_Life
2. Mario Party — Wikipedia. https://en.wikipedia.org/wiki/Mario_Party
3. Blue Space — Super Mario Wiki. https://www.mariowiki.com/Blue_Space
4. Red Space — Super Mario Wiki. https://www.mariowiki.com/Red_Space
5. Event Space — Super Mario Wiki. https://www.mariowiki.com/Event_Space
6. Candy Crush Saga — Wikipedia. https://en.wikipedia.org/wiki/Candy_Crush_Saga
7. Snakes and ladders — Wikipedia. https://en.wikipedia.org/wiki/Snakes_and_ladders
8. Super Mario Bros. 3 — Wikipedia. https://en.wikipedia.org/wiki/Super_Mario_Bros._3
9. Slay the Spire — Wikipedia. https://en.wikipedia.org/wiki/Slay_the_Spire
10. Slay the Spire 2 — Wikipedia. https://en.wikipedia.org/wiki/Slay_the_Spire_2
11. Overworld — Wikipedia. https://en.wikipedia.org/wiki/Overworld
12. Jumanji (1995 film) — Wikipedia. https://en.wikipedia.org/wiki/Jumanji_(1995_film)
13. Reigns: Her Majesty — Wikipedia. https://en.wikipedia.org/wiki/Reigns:_Her_Majesty
14. Reigns: Game of Thrones — Wikipedia. https://en.wikipedia.org/wiki/Reigns:_Game_of_Thrones
15. Deaths — Reigns Wiki (fandom). https://reigns.fandom.com/wiki/Deaths
16. The Oregon Trail (1985 video game) — Wikipedia. https://en.wikipedia.org/wiki/The_Oregon_Trail_(1985_video_game)
17. The Oregon Trail (series) — Wikipedia. https://en.wikipedia.org/wiki/The_Oregon_Trail_(series)
18. Darkest Dungeon — Wikipedia. https://en.wikipedia.org/wiki/Darkest_Dungeon
19. Stress — Darkest Dungeon Wiki (fandom). https://darkestdungeon.fandom.com/wiki/Stress
20. Morale — The Banner Saga Wiki (fandom). https://bannersaga.fandom.com/wiki/Morale
21. Renown — The Banner Saga Wiki (fandom). https://bannersaga.fandom.com/wiki/Renown
22. Sunless Sea — Wikipedia. https://en.wikipedia.org/wiki/Sunless_Sea
23. Terror — Sunless Sea Wiki (fandom). https://sunlesssea.fandom.com/wiki/Terror
24. Papers, Please — Wikipedia. https://en.wikipedia.org/wiki/Papers,_Please
25. This War of Mine — Wikipedia. https://en.wikipedia.org/wiki/This_War_of_Mine
26. Plants vs. Zombies (video game) — Wikipedia. https://en.wikipedia.org/wiki/Plants_vs._Zombies_(video_game)
27. FTL: Faster Than Light — Wikipedia. https://en.wikipedia.org/wiki/FTL:_Faster_Than_Light
28. Dialogue tree — Wikipedia. https://en.wikipedia.org/wiki/Dialogue_tree
29. Dream Daddy: A Dad Dating Simulator — Wikipedia. https://en.wikipedia.org/wiki/Dream_Daddy:_A_Dad_Dating_Simulator (và fandom: https://dreamdaddy.fandom.com/wiki/Dream_Daddy:_A_Dad_Dating_Simulator)
30. Sunless Skies — Wikipedia. https://en.wikipedia.org/wiki/Sunless_Skies
31. The Banner Saga — Wikipedia. https://en.wikipedia.org/wiki/The_Banner_Saga

*Ghi chú phương pháp:* các con số ở mục 3.6, 5 và 6 đến từ script TypeScript chạy bằng Node 24 trong thư mục scratch của phiên này. Script import nguyên văn `src/lib/cardgame/rng.ts` và `deckData.ts`, nhưng **không** ghi gì vào repo. Đây là bằng chứng cân bằng sơ bộ, chưa phải kết quả thử với người chơi. Bản lật bài trước cũng có số Monte Carlo, nhưng tính trên bảng chỉ số nháp chứ không phải `deck.ts` hiện tại, nên hai bộ số **không so trực tiếp** được với nhau.
