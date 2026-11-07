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
- [ ] Cân bằng lại độ khó, mở rộng thư viện sự kiện, thẻ kết quả dạng ảnh, bảng xếp hạng "Đề của ngày"
- [ ] Mở rộng almanac + milestone theo `docs/research/content-expansion.md` (cơ hội vốn nhỏ, kỹ năng nên học sớm, bỏ lỡ kinh điển)
- [ ] Quy trình làm mới giá tự động theo `docs/research/data-quality.md`
- [ ] SEO: OG image cho từng mốc, sitemap
- [ ] Chia sẻ điểm quiz / checklist lên mạng xã hội
- [ ] Deploy Vercel
- [ ] (Khi cần) Database: chỉ khi có tài khoản, bảng xếp hạng mini game, hoặc cho người dùng đóng góp dữ liệu

⚠️ Nội dung mang tính giải trí/giáo dục, không phải lời khuyên đầu tư.
