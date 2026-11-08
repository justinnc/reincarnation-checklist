# The Reincarnation Checklist ⏳

> Chuyển sinh về quá khứ với toàn bộ ký ức — bạn sẽ làm gì để giàu?

Trang web tổng hợp các mốc lịch sử theo từng quốc gia mà một người "chuyển sinh" có thể tận dụng để kiếm tiền: **mua gì, khi nào mua, khi nào bán, lời bao nhiêu**. Gồm 🇻🇳 Việt Nam và 10 nền kinh tế lớn nhất thế giới theo GDP (IMF).

## Chạy local

```bash
nvm use        # Node 24 (xem .nvmrc) — Node < 22.12 sẽ lỗi build
npm install
npm run dev    # http://localhost:3000
```

## Công nghệ

- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS 4
- Dữ liệu: file JSON trong repo — **chưa cần database**
- i18n: route `/[lang]/...` (`en`, `vi`); mặc định tiếng Anh — `/` luôn redirect sang `/en` (`src/proxy.ts`)

## Cấu trúc

```
src/
  app/[lang]/              # layout, trang chủ
  app/[lang]/[country]/    # timeline theo quốc gia
  app/[lang]/quiz/         # mini game (sắp có)
  components/Timeline.tsx  # lọc theo danh mục + tìm kiếm (client)
  data/milestones/*.json   # DỮ LIỆU các mốc lịch sử, mỗi quốc gia 1 file
  dictionaries/*.json      # chữ trên giao diện theo ngôn ngữ
  lib/types.ts             # schema của 1 mốc lịch sử
  lib/data.ts              # danh sách quốc gia + đọc dữ liệu
```

## Kiểm tra dữ liệu

```bash
npm run validate   # kiểm schema mọi file trong src/data/milestones
```

## Thêm một mốc lịch sử

Thêm object vào `src/data/milestones/<country>.json`:

```json
{
  "id": "us-apple-ipo",
  "country": "us",
  "date": "1980-12-12",
  "category": "stocks",
  "title": { "vi": "...", "en": "..." },
  "description": { "vi": "...", "en": "..." },
  "opportunity": {
    "action": { "vi": "...", "en": "..." },
    "buyWhen": { "vi": "...", "en": "..." },
    "sellWhen": { "vi": "...", "en": "..." },
    "estimatedReturn": { "vi": "...", "en": "..." },
    "returnMultiple": 1000
  },
  "sources": [{ "title": "...", "url": "https://..." }],
  "verified": false
}
```

- `category`: `stocks | crypto | real-estate | technology | business | macro | commodities`
- `date`: `YYYY`, `YYYY-MM` hoặc `YYYY-MM-DD`
- `verified`: để `false` cho tới khi đã đối chiếu nguồn (UI hiện nhãn "Chưa kiểm chứng")
- Text thiếu ngôn ngữ nào sẽ fallback sang `en`.

## Thêm quốc gia / ngôn ngữ

- Quốc gia: tạo `src/data/milestones/<code>.json`, import và thêm vào `countries` trong `src/lib/data.ts`.
- Ngôn ngữ: thêm mã vào `locales` (`src/lib/i18n.ts`), tạo `src/dictionaries/<code>.json`, đăng ký trong `src/lib/dictionaries.ts`.

## Roadmap

- [x] MVP: timeline VN + Mỹ, lọc danh mục, tìm kiếm, song ngữ
- [x] v0.2: DESIGN.md, chọn năm trọng sinh, checklist cá nhân, trang chi tiết, bảng xếp hạng, quiz, 53 mốc (51 đã kiểm chứng) — xem `docs/REVIEW.md`
- [x] v0.3: thêm 9 nước top 10 GDP (Trung Quốc, Đức, Nhật, Ấn Độ, Anh, Pháp, Ý, Canada, Brazil) — tổng 252 mốc; mốc "bán khống/tránh xa" hiển thị % giảm
- [ ] Thêm quốc gia mới (spec nghiên cứu mẫu: `docs/research-specs/`)
- [x] v0.4: trang `/almanac` (Bảng giá theo năm, Việt Nam) + trang `/disclaimer` dùng chung — xem `docs/research/`
- [x] v0.5: engine "Sổ trọng sinh" chạy được tại `/simulator` (beta) — pure TS engine (seeded RNG, vitest 24 test), trang chơi thử; DỮ LIỆU GIÁ ĐANG LÀ PLACEHOLDER chờ agent nghiên cứu thay bằng số liệu có nguồn (xem `docs/research/simulator.md`)
- [x] v0.6: ghép dữ liệu giá thật vào Sổ trọng sinh (CPI/FX/vàng/VN-Index/BTC có nguồn); nối cơ chế "thẻ cơ hội" vào gameplay (trước đó code có sẵn nhưng chưa dùng — nguyên nhân chính khiến game bị nhạt); hiện sự kiện nổi bật mỗi năm; nhật ký hành trình ở màn kết quả
- [x] Bảng giá theo năm: thay chuỗi xăng RON92 4 điểm rời rạc bằng chuỗi 9 năm (2009-2017) có min/max/nguồn
- [x] v0.7: Thiết kế lại hoàn toàn "Sổ trọng sinh" thành CARD GAME (chỉ Việt Nam), thay bản dashboard phân bổ vốn cũ. Xem docs/research/simulator-cardgame-redesign.md: nghiên cứu Reigns/High Society/Ai là triệu phú/bài cào để rút ra 6 quy tắc thiết kế, 20 lượt/ván (~2-4 phút), 37 lá (25 ký ức/tin đồn + 6 bẫy + 6 biến cố), cơ chế 💡 Nhớ lại, mô phỏng Monte Carlo xác nhận "biết lịch sử" (~7,5 tỷ) thắng "nhận hết" (~2,3 tỷ) thắng "ngẫu nhiên" (~0,28 tỷ). Xoá hoàn toàn engine v1 (src/lib/sim), viết mới src/lib/cardgame + src/components/cardgame
- [x] v0.8: THÊM trang /whatif ("Nếu bạn đã đầu tư") — công cụ what-if investment calculator, không phải game. Chọn tài sản (tiền mặt/tiết kiệm/USD/vàng SJC/VN-Index/Bitcoin) + năm bắt đầu + số tiền -> giá trị hôm nay, dùng lại dữ liệu giá thật đã nghiên cứu (src/data/whatif/vn.json, khôi phục từ git history). Trạng thái lưu trong URL query -> link chia sẻ tái tạo đúng kết quả. Nghiên cứu xác nhận thể loại này (FomoDejavu, WhatIfInvest.com) đã có traffic thật mà không cần gamify.
- [x] v0.9: /whatif hỗ trợ ĐA QUỐC GIA — mỗi quốc gia có tài sản thị trường nội địa riêng nếu có dữ liệu (VN: 5 tài sản, Mỹ: 2 tài sản mới + T-bill/CPI nghiên cứu mới), LUÔN có nhóm "đầu tư xuyên quốc gia" (vàng thế giới USD/oz, Bitcoin, S&P 500) cho mọi quốc gia kể cả 9 nước chưa có dữ liệu riêng. Khôi phục kiến trúc engine thành local-vs-universal asset scope. Sửa bug: đổi tài sản khác loại tiền (VND<->USD) không reset số tiền, gây hiểu nhầm.
- [x] v1.0: /whatif có dữ liệu thị trường nội địa cho TẤT CẢ 11 quốc gia (trước chỉ VN+Mỹ) — 9 agent song song nghiên cứu CPI/chỉ số chứng khoán/lãi suất tiết kiệm cho Trung Quốc (SSE), Nhật (Nikkei 225, có lãi suất âm 2016-2024), Đức (DAX, giới hạn từ 1999-Euro), Ấn Độ (SENSEX), Anh (FTSE 100), Pháp (CAC 40, giới hạn 1999), Ý (FTSE MIB, giới hạn 1999), Canada (S&P/TSX), Brazil (Ibovespa, giới hạn từ 1994-đồng Real do siêu lạm phát/đổi tiền nhiều lần). Engine tổng quát hoá qua SIMPLE_COUNTRY_CONFIG.
- [x] v1.1: /whatif thêm ghi chú liên kết đến mốc lịch sử gốc cho Đức/Pháp/Ý/Brazil — 4 nước này đã có sẵn mốc về đổi tiền tệ (hội tụ lãi suất Euro, Plano Real) trong danh sách 252 mốc, nhưng calculator giới hạn năm bắt đầu SAU đúng giai đoạn cơ hội lớn nhất đó, nên cần dẫn người dùng qua trang chi tiết thay vì để họ tưởng thiếu dữ liệu
- [x] v1.3: Thiết kế lại 'Sổ trọng sinh' thành BẢN ĐỒ ĐƯỜNG ĐI (board game 20 trạm, 1986-2024) với 3-4 lựa chọn mỗi trạm (Làm lớn/Làm nhỏ/Nghỉ ngơi, hoặc 3 lựa chọn cho biến cố) và thanh ❤️ Sức khỏe & Tinh thần làm tài nguyên thứ 2 song song tiền. Theo nghiên cứu docs/research/simulator-roadmap-redesign.md. Phát hiện và sửa 2 lỗi trong engine cũ: (1) năm trên bàn cờ có thể đi lùi, (2) bẫy tự lộ mình qua viền/nút 💡 khác với tin đồn thật trong ngã ba.
- [x] v1.2: XOÁ HẲN tính năng checklist (nút dấu tick "đã đọc" + thanh tiến độ) — giá trị quá mỏng (chỉ đánh dấu local, không đồng bộ, không ghi chú), và text nav "Checklist của tôi" vốn đã mồ côi (không trỏ tới route nào). Xoá src/lib/checklist.ts, CheckButton.tsx, ChecklistProgress.tsx, dọn mọi import liên quan + key dictionary thừa.
- [ ] Cân bằng lại độ khó game bài, mở rộng thư viện sự kiện, thẻ kết quả dạng ảnh cho /simulator
- [ ] Mở rộng almanac + milestone theo `docs/research/content-expansion.md` (cơ hội vốn nhỏ, kỹ năng nên học sớm, bỏ lỡ kinh điển)
- [ ] Quy trình làm mới giá tự động theo `docs/research/data-quality.md`
- [ ] SEO: OG image cho từng mốc, sitemap
- [ ] Chia sẻ điểm quiz / checklist lên mạng xã hội
- [ ] Deploy Vercel
- [ ] (Khi cần) Database: chỉ khi có tài khoản, bảng xếp hạng mini game, hoặc cho người dùng đóng góp dữ liệu

⚠️ Nội dung mang tính giải trí/giáo dục, không phải lời khuyên đầu tư.
