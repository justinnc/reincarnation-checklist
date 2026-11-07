# Nghiên cứu chất lượng dữ liệu giá — The Reincarnation Checklist

> Phạm vi: nguồn dữ liệu giá cho build-time refresh, kiểm tra độ phủ thực tế (live test), audit độc lập mẫu 25 milestone, và đề xuất hệ thống data-quality. Không có file dữ liệu nào trong `src/data/milestones/*.json` bị chỉnh sửa khi thực hiện báo cáo này.

## Tóm tắt điều hành (Executive Summary)

- **Vấn đề cốt lõi đã xác nhận**: nhiều `returnMultiple` bị "đóng băng" tại thời điểm agent nghiên cứu viết bài (vd. Facebook 44.6x tính đến 2025-08-12), không tự cập nhật — đúng như mô tả trong brief. Không có cơ chế `asOf`/refresh nào trong schema hiện tại (`src/lib/types.ts`).
- **Licensing là rào cản lớn hơn kỹ thuật**: hầu hết nguồn miễn phí/rẻ (Stooq, Yahoo/yfinance, Alpha Vantage free, FRED) đều **cấm hiển thị công khai trên website** hoặc cấm dùng để train/lưu trữ AI — kể cả khi kỹ thuật lấy dữ liệu dễ dàng. Chỉ CoinGecko (có attribution), FMP Enterprise, Tiingo (license riêng), và Twelve Data Business cho phép display công khai hợp pháp ở các mức giá khác nhau.
- **Live test xác nhận Stooq bị chặn bot tự động**: endpoint CSV công khai (`stooq.com/q/d/l/`) hiện trả về trang thách thức proof-of-work JS (Cloudflare-style), không trả CSV thô qua `curl`/HTTP client thường — cần trình duyệt thật hoặc giải pháp headless, làm tăng độ giòn (fragility) cho GitHub Action. CoinGecko hoạt động tốt qua `curl` thuần, không cần API key cho dữ liệu cơ bản.
- **Ước tính độ phủ auto-refresh**: trong 157/252 milestone có numeric field, nhóm có thể refresh tự động với độ tin cậy cao (chỉ số lớn: SSE, CAC40, DAX, FTSE, cổ phiếu US/EU niêm yết, BTC) chiếm khoảng **55-65%**; phần còn lại (bất động sản, VND/chỉ số Việt Nam qua nguồn không chính thức, tỷ giá lịch sử, dữ liệu gộp nhiều tài sản trong 1 trường) khó hoặc không thể tự động hóa rẻ tiền.
- **Audit 25 mẫu (random seed 42)**: 18/25 **OK** (72%), 5/25 **minor issue** (20%, chủ yếu do thiếu `priceBasis`/split-adjustment hoặc thiếu field), 2/25 **wrong** (8%) — một lỗi giá rõ ràng (Nu Holdings exitPrice sai) và một bản ghi gộp sai hai loại tài sản khác nhau (Eni cổ phiếu vs giá khí đốt TTF) khiến cặp entry/exit không thể tái lập từ bất kỳ nguồn nào.
- **Tỷ lệ lỗi ước tính**: ~8% milestone có numeric field chứa lỗi giá rõ ràng cần sửa ngay; ~20% khác cần làm rõ/khớp lại nguồn. Ngoại suy sang toàn bộ 157 milestone có numeric field: ước tính khoảng **12-13 milestone** có lỗi giá thực sự, **~31 milestone** cần rà soát thêm.
- **Đề xuất stack chính**: Stooq cho mirror cá nhân (không public), Twelve Data Business/FMP Enterprise cho hiển thị công khai cổ phiếu/chỉ số toàn cầu khi ngân sách cho phép, CoinGecko Demo (miễn phí, có attribution) cho crypto, FRED cho dữ liệu vĩ mô Mỹ, World Bank/IMF API cho vĩ mô toàn cầu (public domain), và với Việt Nam: vnstock (thư viện Python mã nguồn mở bọc TCBS/VCI) chỉ nên dùng nội bộ để sinh snapshot JSON tĩnh, không gọi trực tiếp runtime vì các API này không công bố ToS cho public redistribution.

---

## Phần 1 — Nguồn dữ liệu giá: độ phủ, lịch sử, licensing

### Bảng so sánh

| Nguồn | Độ phủ chính | Độ sâu lịch sử | Split/dividend adjusted | Rate limit (free) | Cần API key | Giá | Licensing cho hiển thị công khai |
|---|---|---|---|---|---|---|---|
| **Stooq** (`stooq.com/q/d/l/`) | US, EU, một phần châu Á, FX, index | Hàng chục năm (phụ thuộc mã) | Có (close adjusted) | Không công bố, nhưng có proof-of-work/chặn bot (xác nhận bằng live test) | Không | Miễn phí | **Chỉ dùng cá nhân, cấm thương mại, cấm redistribute không có sự đồng ý của Stooq** (ToS §5.3); dữ liệu S&P/LME có điều khoản riêng nghiêm ngặt hơn. **Không phù hợp để hiển thị công khai.** |
| **Yahoo Finance (yfinance không chính thức)** | Gần như toàn cầu | Rất sâu | Có | Không công bố, dễ bị chặn IP | Không | Miễn phí (phi chính thức) | ToS Yahoo **cấm thu thập tự động** và **cấm redistribute**; rủi ro pháp lý tăng với sản phẩm thương mại/công khai. Dùng để nghiên cứu nội bộ, không public. |
| **Alpha Vantage** | Cổ phiếu US chủ yếu, FX, crypto, một số chỉ số qua FRED proxy | 20+ năm | Có (`TIME_SERIES_DAILY_ADJUSTED`) | 25 request/ngày (free) | Có | Free / $49.99+/tháng cho thương mại | Free tier = **chỉ cá nhân, phi thương mại**; "commercial" bao gồm cả việc cho người khác xem dữ liệu gián tiếp qua sản phẩm — cần liên hệ `premium@alphavantage.co`. |
| **Twelve Data** | US free; toàn cầu ở tier trả phí | Theo tier | Có | 800 request/ngày (Basic, chỉ "internal non-display") | Có | Free (internal only) → Grow $79 (display, không redistribute) → Business cho redistribute | Free/Basic **không được hiển thị công khai**; cần tier Grow trở lên để display, và **Business plan** mới được redistribute hợp lệ cho bên thứ ba. |
| **Financial Modeling Prep (FMP)** | Toàn cầu ở tier cao, US ở tier thấp | Đến 30 năm (tier cao) | Có | 250 request/ngày (free) | Có | Free → $19-$139/tháng | **"Displaying or redistributing data... requires a specific Data Display and Licensing Agreement"** — kể cả các tier trả phí thông thường chưa chắc đủ, phải ký riêng (Enterprise). |
| **Tiingo** | US mạnh, ít hơn cho quốc tế | 20+ năm (add-on) | Có | 1,000 request/ngày, 50/giờ (free) | Có | Free/$30/$50 | Self-serve plan = **internal use only**; muốn hiển thị cho người ngoài tổ chức phải mua **redistribution license** riêng (liên hệ sales, giá theo use case). |
| **EODHD** | 150,000+ mã toàn cầu | 30+ năm (paid), 1 năm (free) | Có | 20 request/ngày (free) | Có | Free → $19.99+/tháng | Free/personal plan **cấm hiển thị ngoài công ty**; chỉ các gói "Enterprise"/data services agreement mới cho phép hiển thị công khai. |
| **Polygon.io (nay là Massive)** | US mạnh | 2 năm (free), lâu hơn ở tier trả phí | Có | 5 request/phút (free) | Có | Free → $29-$2,499/tháng | Free/cá nhân = "individual use only"; cần **Business tier ($2,499/tháng)** để có quyền display/commercial. |
| **FRED (St. Louis Fed)** | Vĩ mô Mỹ (lãi suất, CPI, GDP...) | Rất sâu (nhiều chuỗi từ thập niên 1950+) | N/A (macro) | Không giới hạn chặt, nhưng **cấm lưu/cache dữ liệu lâu dài và cấm dùng để train AI** (ToS cập nhật 2024) | Có (miễn phí) | Miễn phí | Phần lớn series là **public domain, cần ghi nguồn "FRED"**; một số series bản quyền bên thứ ba cần xin phép riêng. Phù hợp cho macro context, không phù hợp cache tĩnh dài hạn theo ToS hiện hành. |
| **CoinGecko** | Toàn bộ crypto | Lên đến "max" (toàn bộ lịch sử coin) | N/A | 5-15 call/phút (public, không key) hoặc 100 call/phút + 10k call/tháng (Demo, có đăng ký) | Không bắt buộc (Demo cần key miễn phí) | Miễn phí (Demo) → $35+/tháng | **Cho phép hiển thị công khai kể cả ở gói miễn phí/trả phí thấp, miễn có attribution "Data provided by CoinGecko" + link** — đây là nguồn crypto **hợp pháp để public** rẻ nhất trong danh sách. |
| **Binance public API** | Crypto (giá giao dịch thực) | Vài năm (klines) | N/A | Khá cao (1200 weight/phút) | Không | Miễn phí | ToS Binance cho phép dùng market data public cho ứng dụng của bên thứ ba nhưng cấm dùng tên/logo gây hiểu nhầm liên kết chính thức; phù hợp làm **nguồn dự phòng cho BTC/ETH** cạnh CoinGecko. |
| **World Bank / IMF API** | Vĩ mô toàn cầu (GDP, lạm phát, FX chính thức...) | Hàng chục năm | N/A | Không giới hạn công bố rõ | Không | Miễn phí | **Public domain / CC-BY** — nguồn vĩ mô **an toàn nhất về pháp lý** để hiển thị công khai, chỉ cần ghi nguồn. |
| **vnstock (Python, bọc TCBS/VCI/SSI/MSN)** | Cổ phiếu/chỉ số Việt Nam | Theo nguồn gốc (TCBS/VCI thường vài năm đến toàn bộ lịch sử niêm yết) | Thường chưa rõ ràng về điều chỉnh cổ tức/chia tách — cần kiểm tra riêng từng hàm | Phụ thuộc giới hạn ẩn của TCBS/VCI, dễ bị đổi/chặn | Không (thư viện mã nguồn mở, không phải API chính thức có hợp đồng) | Miễn phí | **Không có ToS public rõ ràng cho việc redistribute** vì đây là thư viện cộng đồng gọi API nội bộ của công ty chứng khoán, tương tự rủi ro pháp lý như yfinance. Dùng để build **snapshot JSON tĩnh nội bộ** (build-time, không gọi runtime), không nên coi là nguồn "chính thức được cấp phép". |
| **SSI FastConnect Data (FCData)** | Cổ phiếu/chỉ số Việt Nam (HOSE, HNX...) | EOD + realtime | Chưa xác minh | Cần đăng ký tài khoản SSI, giới hạn theo gói | Có (đăng ký qua chi nhánh SSI) | Có gói miễn phí cho khách hàng SSI, có thể cần tài khoản giao dịch | API chính thức của công ty chứng khoán — licensing cho public display **chưa công bố công khai**, cần liên hệ SSI trực tiếp để xác nhận trước khi dùng cho site public. |
| **SJC Gold / HKEX / JPX / NSE** | Vàng VN, Hong Kong, Nhật, Ấn | Thường chỉ giá hiện tại/ngắn hạn công khai | N/A | Không public API chính thức miễn phí đầy đủ cho hầu hết | Không có key chuẩn | — | SJC chỉ có trang giá, không có API công khai; HKEX/JPX/NSE bán dữ liệu qua market data vendor có hợp đồng — **không có lựa chọn miễn phí hợp pháp để hiển thị công khai** cho các thị trường này. |

### Khuyến nghị stack (primary + fallback theo nhóm tài sản)

| Nhóm tài sản | Primary | Fallback | Ghi chú licensing |
|---|---|---|---|
| Cổ phiếu Mỹ/EU/UK niêm yết lớn | Twelve Data (tier Grow trở lên nếu display) hoặc FMP Starter+ | Tiingo (mua add-on redistribution nếu cần) | Free tier **không được** dùng để hiển thị công khai — đây là lỗi tuân thủ dễ mắc phải nhất nếu build pipeline dùng free key hiện tại. |
| Chỉ số (S&P 500, FTSE, CAC40, DAX, Shanghai Composite...) | FRED (cho các chỉ số Mỹ có sẵn) + Twelve Data cho chỉ số quốc tế | World Bank/IMF cho dữ liệu vĩ mô liên quan | Chỉ số US từ S&P/Dow Jones có điều khoản licensing riêng ngay cả khi lấy qua Stooq — tránh. |
| Crypto (BTC, ETH...) | CoinGecko Demo (miễn phí, có attribution) | Binance public API (klines) | Hợp pháp public ở mức miễn phí — ưu tiên dùng ngay. |
| Vàng (thế giới) | World Bank commodity price data / FRED (giá vàng USD) | CoinGecko (một số token vàng) | Tránh scrape SJC trực tiếp; nếu cần giá vàng SJC, nên trích dẫn thủ công theo ngày thay vì tự động hóa pháp lý chưa rõ. |
| Cổ phiếu/chỉ số Việt Nam (VIC, VNM, VN-Index...) | vnstock để build **snapshot JSON tĩnh tại build-time**, review thủ công trước khi publish | TCBS/SSI public page (trích dẫn thủ công) | Không gọi runtime; coi là "best-effort", gắn nhãn `dataSource: "community-unofficial"` trong schema đề xuất ở Phần 4. |
| Bất động sản (Berlin, Toronto, VN...) | Không có API giá rẻ phù hợp — tiếp tục trích dẫn thủ công từ báo cáo chính thức (TRREB, Destatis/Accentro, Savills VN...) | — | Nhóm này về cơ bản **không thể auto-refresh** bằng ngân sách nhỏ; giữ nguyên quy trình review thủ công theo kỳ (vd. hàng năm). |
| Tỷ giá (GBP/USD, VND/USD...) | FRED (Fed exchange rate series) hoặc World Bank | — | Public domain, an toàn pháp lý. |

---

## Phần 2 — Kiểm tra độ phủ thực tế (live coverage test)

### Kết quả test trực tiếp

- **Stooq** (`https://stooq.com/q/d/l/?s=nvda.us&i=d`, `^spx`, `7203.jp`, `0700.hk`, `vnm.us`, `^ftm`, `vic.vn`): tất cả 7 request qua `curl` **đều bị chặn** — server trả về trang HTML chứa thử thách proof-of-work SHA-256 (kiểu Cloudflare "Just a Moment"), không trả CSV. Điều này có nghĩa Stooq **không dùng được trực tiếp từ một GitHub Action chạy curl/Node fetch đơn giản** nữa; cần headless browser (Playwright) để vượt qua, làm tăng chi phí vận hành và độ giòn của pipeline — cộng với vấn đề licensing ở Phần 1, Stooq **không nên là nguồn chính cho site public**.
- **CoinGecko** (`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=5`): **hoạt động ngay, không cần key**, trả về mảng `[timestamp, price]` đầy đủ. Đây là nguồn dễ tích hợp nhất trong toàn bộ danh sách.
- Do giới hạn thời gian, các nguồn trả phí (Twelve Data, FMP, Tiingo, EODHD, Polygon, SSI FCData) **chưa được live-test bằng key thật** trong phạm vi báo cáo này — cần một bước riêng khi chọn nhà cung cấp cuối cùng, đăng ký key dùng thử và chạy test thực tế trước khi cam kết.

### Ánh xạ tài sản mẫu sang ticker (asset-inventory.tsv)

| Milestone | Asset | Ticker/ID đề xuất | Nguồn khả thi |
|---|---|---|---|
| us-facebook-ipo-2012 | Facebook/Meta | `META` (Nasdaq) | Twelve Data / FMP |
| cn-baidu-ipo-2005 | Baidu | `BIDU` (Nasdaq) | Twelve Data / FMP |
| cn-xiaomi-ipo-2018 | Xiaomi | `1810.HK` | Twelve Data (HK coverage ở tier cao hơn) / EODHD |
| jp-softbank-dotcom-crash-2000 | SoftBank Group | `9984.T` | EODHD (JPX qua nhà cung cấp) |
| fr-pacte-law-crypto-2019 | Bitcoin | `bitcoin` (CoinGecko id) | CoinGecko |
| gb-ftse-low-2009 | FTSE 100 | `^FTSE` | Twelve Data / FRED (không có) |
| cn-a-share-bubble-2015 | SSE Composite | `000001.SS` (ký hiệu tham khảo) | EODHD / Twelve Data |
| vn-vingroup-listing-2007 | VIC | `VIC.VN` (không chuẩn hóa rộng rãi) | vnstock (snapshot tĩnh) |

**Ước tính độ phủ auto-refresh**: trong 157 milestone có `entryPrice`/`returnMultiple`, nhóm **cổ phiếu/chỉ số niêm yết công khai lớn (US, EU, UK, JP, HK, CN đại chỉ số)** — ước lượng khoảng 85-95 milestone — có thể refresh tự động với độ tin cậy cao qua Twelve Data/FMP/EODHD trả phí. Nhóm **crypto** (khoảng 5-8 milestone) refresh dễ dàng qua CoinGecko. Nhóm **bất động sản, tỷ giá lịch sử tự do, chỉ số/cổ phiếu Việt Nam, hoặc bản ghi gộp nhiều loại tài sản trong một trường** (ví dụ `it-natural-gas-crisis-2022`) — ước lượng 55-65 milestone — khó/không thể auto-refresh rẻ tiền, cần giữ review thủ công. **Tổng ước tính: ~55-65% milestone có numeric field refresh được tự động, phần còn lại cần con người.**

---

## Phần 3 — Audit độc lập mẫu 25 milestone

**Phương pháp**: `random.seed(42)` trên 157 dòng có `entryPrice` hoặc `returnMultiple` trong `asset-inventory.tsv`, `random.sample(..., 25)`. Không sửa file dữ liệu gốc; kết quả đầy đủ ở `docs/research/audit-sample.json`.

### Kết quả tổng hợp

| Trạng thái | Số lượng | Tỷ lệ |
|---|---|---|
| OK | 18 | 72% |
| Minor issue | 5 | 20% |
| Wrong | 2 | 8% |

### Hai lỗi rõ ràng (wrong)

1. **`it-natural-gas-crisis-2022`** — `entryPrice: 20`, `exitPrice: 213.895 EUR` cùng ngày `2022-03-07`. Trường `asset` gộp hai công cụ khác nhau ("Eni S.p.A. (ENI.MI) / natural gas futures (TTF)") nhưng chỉ lưu một cặp giá — không khớp với giá cổ phiếu Eni thực tế đầu tháng 3/2022 (~12-13 EUR) cũng không rõ tương ứng đơn vị nào của TTF. Nguồn: [Eni Annual Report 2022](https://www.eni.com/content/dam/enicom/documents/eng/reports/2022/Annual-Report-2022.pdf).
2. **`br-nubank-ipo-2021`** — `exitPrice: 10.33 USD`. Giá đóng cửa phiên giao dịch đầu tiên theo MarketWatch là **11.91 USD** (+32.4%), không phải 10.33 USD; `returnMultiple` đúng phải ~1.32x. Nguồn: [MarketWatch](http://www.marketwatch.com/story/nu-holdings-stock-opens-25-above-ipo-price-valuing-company-at-nearly-52-billion-2021-12-09).

### Năm vấn đề nhỏ (minor issue)

- `br-magazine-luiza-tang-vot-sup-do` và `br-weg-compounder-longo-han`: không thể tái lập chính xác do nhiều đợt chia tách cổ phiếu chồng lấn — **thiếu trường `priceBasis`/split-adjusted** trong schema khiến không rõ giá đã điều chỉnh theo mốc nào.
- `gb-tell-sid-british-gas-1986`: `entryPrice: 0.5 GBP` nhiều khả năng là đợt đóng tiền từng phần (partly-paid) 50p đầu tiên, không phải giá phát hành đầy đủ 135p — cần chú thích rõ để tránh hiểu lầm.
- `ca-toronto-housing-boom-2000-2022`: `entryPrice` lệch ~0.6% so với số liệu TRREB chính thức (243,255 vs 244,653 CAD) — sai số nhỏ, không ảnh hưởng kết luận.
- `us-starbucks-ipo-1992`: có `returnMultiple: 400` nhưng thiếu `exitPrice`/`exitDate`/`currency` — vi phạm tính toàn vẹn dữ liệu dù entryPrice đúng.

### Ước tính tỷ lệ lỗi

- Tỷ lệ lỗi rõ ràng trong mẫu: **8%** (2/25).
- Tỷ lệ cần rà soát thêm (wrong + minor): **28%** (7/25).
- Ngoại suy tuyến tính sang 157 milestone có numeric field: ước tính khoảng **12-13 milestone** có lỗi giá thực sự cần sửa, và khoảng **44 milestone** nên được rà soát lại nguồn/thêm chú thích.
- Đáng chú ý: **18/25 (72%)** các con số cốt lõi (ngày tháng, mức giá, IPO price, mức đáy/đỉnh chỉ số) khớp chính xác hoặc gần như chính xác với nguồn báo chí/tài chính uy tín — cho thấy chất lượng nghiên cứu nền tảng khá tốt, vấn đề chính nằm ở (a) thiếu metadata hỗ trợ (split basis, exitDate), và (b) một số ít lỗi nhập liệu/diễn giải nguồn.

---

## Phần 4 — Đề xuất hệ thống data-quality

### 4.1 Thay đổi schema (TypeScript)

```typescript
// Mở rộng Opportunity trong src/lib/types.ts
export type PriceBasis = "split-adjusted" | "nominal" | "index-points";
export type VerificationLevel = "source-checked" | "agent-claimed" | "stale";

export interface Opportunity {
  asset?: string;
  // Khi asset gộp nhiều công cụ (vd. "Eni / TTF futures"), BẮT BUỘC tách thành
  // mảng instruments[] thay vì một entryPrice/exitPrice chung — chặn lỗi kiểu
  // it-natural-gas-crisis-2022 ngay từ schema.
  ticker?: string;              // vd. "META", "9984.T", "bitcoin" (CoinGecko id)
  dataSource?: string;          // vd. "twelvedata", "coingecko", "manual-citation"
  priceBasis?: PriceBasis;      // bắt buộc khi có entryPrice/exitPrice là giá cổ phiếu
  action: LocalizedText;
  buyWhen: LocalizedText;
  sellWhen?: LocalizedText;
  estimatedReturn: LocalizedText;
  returnMultiple?: number;      // PHẢI == exitPrice / entryPrice (validator kiểm tra)
  entryPrice?: number;
  exitPrice?: number;
  priceCurrency?: string;       // bắt buộc nếu có entryPrice hoặc exitPrice
  exitDate?: string;            // bắt buộc nếu có exitPrice
  asOf?: string;                // ngày dữ liệu exitPrice được lấy/snapshot lần cuối
  liveExit?: {                  // field được build script tự sinh, KHÔNG edit tay
    price: number;
    asOf: string;
    returnMultiple: number;
    source: string;
  };
  risk?: Level;
  capital?: Level;
}

export interface Milestone {
  // ... giữ nguyên các field hiện có
  verified: boolean;
  verificationLevel?: VerificationLevel; // mới: phân biệt agent tự nhận vs người review
  verifiedNote?: string;
  verifiedBy?: string;           // tên người/agent review cuối, cho audit trail
  verifiedAt?: string;           // ngày review cuối
}
```

### 4.2 Pipeline refresh (script + GitHub Action + cache + fallback)

```
scripts/
  refresh-prices.mjs        # Node script, đọc tất cả milestone có ticker+dataSource
  price-cache.json          # cache kết quả lần chạy gần nhất (commit vào repo)
.github/workflows/
  refresh-prices.yml        # cron hàng đêm (vd. 02:00 UTC), tạo PR tự động nếu có thay đổi
```

- **Luồng xử lý**: (1) đọc milestone có `ticker` + `dataSource` hợp lệ → (2) gọi API tương ứng (Twelve Data/FMP cho cổ phiếu, CoinGecko cho crypto) → (3) nếu thành công, ghi `liveExit` (không đụng `exitPrice` gốc do agent nhập — giữ nguyên lịch sử, chỉ thêm trường tính toán mới) → (4) nếu API lỗi/rate-limit, **fallback sang giá trị cache cũ** trong `price-cache.json` và gắn cờ `stale: true`, không để site crash hoặc hiển thị 0/null.
- **GitHub Action**: chạy mỗi đêm, nếu `liveExit` thay đổi > một ngưỡng (vd. 2%) thì tự tạo Pull Request kèm diff để con người review trước khi merge — **không tự động merge số liệu tài chính** để tránh lỗi nguồn API lan ra production ngay lập tức.
- **Rate limit & chi phí**: với ~90 milestone đủ điều kiện auto-refresh và limit free tier (Twelve Data 800 req/ngày, CoinGecko 10k call/tháng), một lần chạy/ngày nằm hoàn toàn trong hạn mức miễn phí về số lượng request — nhưng **cần tier trả phí để được phép hiển thị công khai** (xem Phần 1).

### 4.3 Validator nghiêm ngặt hơn (bổ sung vào `scripts/validate-data.mjs`)

- `returnMultiple` phải xấp xỉ bằng `exitPrice / entryPrice` (sai số cho phép < 1%) khi cả ba trường cùng tồn tại — bắt được lỗi kiểu Nu Holdings ngay lập tức.
- `exitDate` **bắt buộc** nếu có `exitPrice`.
- `priceCurrency` **bắt buộc** nếu có `entryPrice` hoặc `exitPrice`.
- `priceBasis` bắt buộc khi `dataSource` chỉ ra đây là cổ phiếu từng có lịch sử chia tách (danh sách whitelist công ty known-to-have-splits).
- **Source domain allowlist**: cảnh báo (không chặn cứng) khi `sources[].url` không thuộc danh sách domain tin cậy đã duyệt (báo chí lớn, trang IR chính thức, sàn giao dịch, cơ quan thống kê nhà nước) — giúp lọc các nguồn chất lượng thấp mà agent có thể tự chọn.
- **Link checking**: job CI riêng (chạy ít thường xuyên hơn, vd. hàng tuần) gửi HEAD request tới từng `sources[].url`, báo cáo link chết — không chặn build chính để tránh phụ thuộc uptime bên thứ ba.
- Cảnh báo khi `asset` chứa dấu `/` nối hai tên tài sản khác nhau nhưng chỉ có một cặp entry/exit — bắt lỗi kiểu `it-natural-gas-crisis-2022`.

### 4.4 Quy trình review của con người (verification levels)

| Level | Ý nghĩa | Ai gán |
|---|---|---|
| `agent-claimed` | Mặc định khi agent nghiên cứu tạo milestone; tương đương `verified: true` hiện tại nhưng tách rõ ra là "tự nhận". | Agent |
| `source-checked` | Một người (hoặc agent audit độc lập, không phải agent đã viết) đã mở từng `sources[].url`, xác nhận số liệu khớp. | Reviewer con người/agent kiểm toán |
| `stale` | Trước là `source-checked` nhưng `liveExit.asOf` đã quá hạn (vd. >180 ngày với milestone có sẵn ticker) mà chưa refresh được. | Hệ thống tự gán |

Đề xuất quy trình thực tế: mỗi quý, chạy lại audit kiểu Phần 3 (random sample, seed cố định để tái lập) trên ~10% milestone, nâng cấp `agent-claimed` → `source-checked` theo lô, thay vì cố gắng review toàn bộ 252 milestone một lần.

### 4.5 Trang phương pháp luận (Methodology page) — outline cho người dùng

1. **Dữ liệu đến từ đâu**: milestone ban đầu do AI nghiên cứu, mỗi mốc có nguồn trích dẫn; giải thích sự khác biệt `agent-claimed` vs `source-checked`.
2. **Giá "liveExit" là gì**: giải thích cơ chế build-time refresh, tần suất cập nhật, và vì sao một số milestone không có liveExit (không có ticker công khai, ví dụ bất động sản/VN).
3. **Giới hạn đã biết**: điều chỉnh chia tách cổ phiếu có thể chưa chính xác 100% cho giai đoạn trước 2015 ở một số mã; dữ liệu Việt Nam dựa trên thư viện cộng đồng, có thể trễ hoặc sai lệch nhỏ.
4. **Cách báo lỗi**: link tới GitHub issue template "Report a data error" kèm trường bắt buộc (milestone id, trường sai, nguồn đề xuất).
5. **Ngày cập nhật gần nhất** của toàn site, lấy từ metadata build (tự động, không cần sửa tay).

### 4.6 Kế hoạch triển khai từng bước (ước tính effort)

| Bước | Nội dung | Effort ước tính |
|---|---|---|
| 1 | Sửa 2 lỗi "wrong" đã phát hiện (Nu Holdings, Eni/TTF) + bổ sung field thiếu ở 5 milestone "minor issue" trong mẫu audit | 0.5 ngày |
| 2 | Mở rộng schema (`ticker`, `dataSource`, `priceBasis`, `asOf`, `liveExit`, `verificationLevel`) trong `src/lib/types.ts` — không bắt buộc với dữ liệu cũ (optional fields) | 0.5 ngày |
| 3 | Viết `scripts/refresh-prices.mjs` + đăng ký key Twelve Data (hoặc FMP) tier phù hợp + CoinGecko Demo key | 2-3 ngày (gồm thời gian test rate limit thật) |
| 4 | GitHub Action cron + logic tạo PR tự động khi có thay đổi giá | 1 ngày |
| 5 | Nâng cấp `scripts/validate-data.mjs` theo mục 4.3 | 1 ngày |
| 6 | Gán `ticker`/`dataSource` thủ công cho ~90 milestone đủ điều kiện auto-refresh (không thể tự động hóa bước gán ban đầu) | 2-3 ngày |
| 7 | Audit đầy đủ 252 milestone theo phương pháp Phần 3 (chia nhỏ theo quý, ~25-30 milestone/đợt) | Liên tục, ~1 ngày/quý |
| 8 | Trang methodology + issue template report lỗi | 0.5 ngày |
| **Tổng (giai đoạn 1, không gồm audit định kỳ)** | | **~8-10 ngày làm việc** |

---

## Nguồn tham khảo chính

- Stooq Terms of Service: https://stooq.com/terms.html
- Alpha Vantage Terms of Service: https://www.alphavantage.co/terms_of_service/
- Twelve Data Pricing: https://twelvedata.com/pricing
- Financial Modeling Prep Pricing: https://site.financialmodelingprep.com/pricing-plans
- Tiingo Pricing & Documentation: https://www.tiingo.com/pricing , https://www.tiingo.com/documentation/general/overview
- EODHD Pricing & Terms: https://eodhd.com/pricing , https://eodhd.com/financial-apis/terms-conditions
- Polygon.io/Massive Pricing: https://aifinhub.io/articles/polygon-io-pricing/
- FRED API Terms of Use: https://fred.stlouisfed.org/docs/api/terms_of_use.html
- CoinGecko API Terms & Pricing: https://www.coingecko.com/en/api_terms , https://www.coingecko.com/en/api/pricing
- yfinance/Yahoo Finance ToS risk: https://github.com/kevinkda/yfinance-mcp/blob/main/docs/SECURITY.md
- vnstock (GitHub): https://github.com/vnstock-official/vnstock
- SSI FastConnect Data: https://guide.ssi.com.vn/ssi-products/fastconnect-data
- Chi tiết audit từng milestone: xem `docs/research/audit-sample.json` (các URL nguồn nằm trong trường `sourceUrl` của từng bản ghi).
