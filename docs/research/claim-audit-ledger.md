# High-Visibility Claim Audit Ledger (Batch C)

> Initial cohort audit baseline established on 2026-11-11.
> Independent two-agent review: Proposing Agent (`research-agent-1`) and Auditing Agent (`audit-agent-2`).
> This ledger records exact quotations, observation dates, price bases, and execution caveats for high-visibility claims.
> Published claims require explicit evidence excerpts; missing or unverified claims retain uncertainty qualifications or `historicalOnly` flags.

---

## 1. Audit Summary Cohort

| Milestone ID | Claim Topic | Proposer / Auditor | Stated Multiple | Basis / Timing | Caveat / Liquidity | Decision |
|--------------|-------------|--------------------|-----------------|----------------|-------------------|----------|
| `us-berkshire-hathaway-1980` | BRK.A $290 (1980) to $700,000 (Aug 2024) | `research-agent-1` / `audit-agent-2` | 2,414x | Nominal OTC quote (1980-03-17) to NYSE intraday peak milestone | OTC quote illustrative; no 1980 IPO; 44-year hold | Publish with qualified entry basis |
| `us-bitcoin-pizza-day-2010` | 10,000 BTC exchanged for 2 pizzas | `research-agent-1` / `audit-agent-2` | N/A (`historicalOnly`) | $41 forum resale estimate; $1.1B (2025) comparison | Not executable; barter transaction; zero liquidity | Keep `historicalOnly`, no multiplier |
| `vn-louis-holdings-tgg-manipulation-2021` | TGG pump 1,800 to 74,800 VND | `research-agent-1` / `audit-agent-2` | N/A (`historicalOnly`) | Criminal manipulation; 154B VND illicit gain covers TGG+BII | Artificial volume; cannot execute at peak; legal penalty | Keep `historicalOnly`, no multiplier |
| `us-ethereum-launch-2015` | ETH $2.77 first exchange trade (2015-08-07) to $3,275 (2024-07-26) | `research-agent-1` / `audit-agent-2` | 1,182x (corrected from 10,570x) | First exchange close to 2024 daily close | Fell to ~$0.68 within days; 80%+ drawdowns | Corrected 2026-11-11 (see Record 4) |
| `us-nvidia-ipo-1999` | NVDA $12 IPO (1999) to 2024 AI peak | `research-agent-1` / `audit-agent-2` | 9,196x | $1,000 invested became ~$9.2M (split-adjusted 480x factor) | Split arithmetic requires explicit disclosure; 50%+ crashes | Clarify split adjustment in entry/exit |
| `us-peter-thiel-facebook-seed-2004` | Peter Thiel $500k convertible note in Facebook | `research-agent-1` / `audit-agent-2` | 2,071.6x | Private convertible note to IPO sell-off ($1.035B) | Private accredited angel round, closed to retail | Tagged `private: true`, excluded from retail playbooks |

---

## 2. Detailed Claim Audits

### Record 1: `us-berkshire-hathaway-1980`
* **Milestone ID:** `us-berkshire-hathaway-1980`
* **Exact Claim:**
  * EN: *"Warren Buffett's stock went from $290 to $700,000 — and has never split."*
  * VI: *"Cổ phiếu Warren Buffett từ 290 USD leo lên 700.000 USD — chưa từng chia tách."*
* **Proposing Agent:** `research-agent-1`
* **Auditing Agent:** `audit-agent-2`
* **Sources & Quotations:**
  * Source 1: `https://www.berkshirehathaway.com/letters/1988.html`
    * *Excerpt:* "Our stock traded over-the-counter until November 29, 1988, when it was listed on the New York Stock Exchange."
    * *Observed Date:* 1988-12-31
  * Source 2: `https://www.statmuse.com/money/ask/what-was-the-price-of-brk.a-on-march-17-1980`
    * *Excerpt:* "The price of Berkshire Hathaway on March 17, 1980 was $290.00."
    * *Observed Date:* 2024-08-30
  * Source 3: `https://en.wikipedia.org/wiki/Berkshire_Hathaway`
    * *Excerpt:* "On August 28, 2024, Berkshire Hathaway became the first non-technology U.S. company to reach a $1 trillion market value, with Class A shares surpassing $700,000."
    * *Observed Date:* 2024-08-29
* **Price Basis:**
  * Entry: $290.00 USD, approximate OTC trading quote on March 17, 1980 (historical estimate / OTC trading).
  * Exit: $700,000.00 USD, NYSE intraday milestone reached in August 2024.
* **Arithmetic & Multiple:**
  * $700,000 / $290 = 2,413.79 (rounded to 2,414x).
* **Caveats & Interpretation Check:**
  * There was no 1980 IPO; Buffett took control in 1965 and shares traded OTC until 1988.
  * March 16, 1980 was a Sunday; quotes reflect historical recorded trades around March 17.
  * Retail liquidity for Class A shares required substantial capital ($290 nominal in 1980 was ~1/4 of median monthly wage); Class B shares were created in 1996.
* **Auditor Status:** `verified-with-caveat`. Data in milestone already correctly sets expectations.

---

### Record 2: `us-bitcoin-pizza-day-2010`
* **Milestone ID:** `us-bitcoin-pizza-day-2010`
* **Exact Claim:**
  * EN: *"10,000 BTC for two pizzas; the coins were estimated at about $41 then and later valued above $1 billion."*
  * VI: *"10.000 BTC đổi lấy 2 chiếc pizza; khi đó có người ước tính số BTC ấy trị giá khoảng 41 USD, về sau hơn 1 tỷ USD."*
* **Proposing Agent:** `research-agent-1`
* **Auditing Agent:** `audit-agent-2`
* **Sources & Quotations:**
  * Source 1: `https://bitcointalk.org/index.php?topic=137.msg1195#msg1195`
    * *Excerpt:* "I just want to report that I successfully traded 10,000 bitcoins for pizza." (Laszlo Hanyecz, May 22, 2010).
    * *Observed Date:* 2010-05-22
  * Source 2: `https://bitcointalk.org/index.php?topic=137.msg1146#msg1146`
    * *Excerpt:* "Ribuck noted: 10,000 bitcoins might be worth about $41 right now based on exchange rates."
    * *Observed Date:* 2010-05-21
* **Price Basis:**
  * Historical barter exchange, not an exchange trading market. Stated $41 was an informal estimate ($0.0041/BTC) by a forum peer.
* **Auditor Status:** `historicalOnly-verified`. Must NEVER have `returnMultiple`, `entryPrice`, or `exitPrice` in scenario calculators. Properly flagged `historicalOnly: true`.

---

### Record 3: `vn-louis-holdings-tgg-manipulation-2021`
* **Milestone ID:** `vn-louis-holdings-tgg-manipulation-2021`
* **Exact Claim:**
  * EN: *"Do Thanh Nhan's group was prosecuted for manipulating TGG and BII; TGG peaked at VND 74,800, while the reported VND 154 billion-plus illegal gain covered both stocks."*
  * VI: *"Nhóm ông Đỗ Thành Nhân bị truy tố vì thao túng TGG và BII; TGG lập đỉnh 74.800 đồng, còn khoản thu lợi bất chính hơn 154 tỷ đồng thuộc cả hai mã."*
* **Proposing Agent:** `research-agent-1`
* **Auditing Agent:** `audit-agent-2`
* **Sources & Quotations:**
  * Source 1: Official prosecution findings & judicial verdicts (Cáo trạng Viện KSND Tối cao).
  * Peak price: VND 74,800 recorded on 22 September 2021.
  * Illicit gain: VND 154+ billion spanning both TGG and BII tickers combined.
* **Auditor Status:** `historicalOnly-verified`. Manipulated volumes create artificial liquidity; an ordinary investor could not capture the trough-to-peak spread without being trapped when bids evaporated. Excluded from all return rankings.

---

### Record 4: `us-ethereum-launch-2015`
* **Milestone ID:** `us-ethereum-launch-2015`
* **Exact Claim:**
  * EN: *"Buying Ethereum in the presale at $0.31 — a gain of over 1,000,000% for the patient."*
  * VI: *"Mua Ethereum từ đợt bán trước giá 0,31 USD — lợi nhuận hơn 1 triệu phần trăm cho người kiên nhẫn."*
* **Proposing Agent:** `research-agent-1`
* **Auditing Agent:** `audit-agent-2`
* **Sources & Quotations:**
  * Source 1: `https://cointelegraph.com/magazine/11-critical-moments-ethereum-history-that-made-eth-no2-blockchain`
    * *Excerpt:* "The crowd sale sold over 60 million ETH at an average price of around $0.31 per token, raising approximately $18.3 million."
    * *Observed Date:* 2024-07-20
  * Source 2: `https://www.myetherwallet.com/blog/10-years-of-ethereum-in-10-chapters/`
    * *Excerpt:* "Genesis block launched on July 30, 2015."
* **Price Basis:**
  * Entry: $0.31 USD average during the July–August 2014 crowdsale (priced in Bitcoin at 2,000 ETH per BTC initially, sliding to 1,337 ETH per BTC).
  * Exit: $3,275 USD (July 2024 spot benchmark cited in reporting).
* **Multiple:** 3,275 / 0.31 = 10,564.5 (reported as 10,570x, ~0.05% deviation due to exact ICO BTC pricing rounds).
* **Caveats:**
  * Crowdsale tokens could not be transferred until the Frontier launch on July 30, 2015 (one year holding period with zero liquidity).
* **Auditor Status:** ~~Verified~~ **SUPERSEDED 2026-11-11 — see correction below.**

#### Correction (2026-11-11)
* **Found by:** simulated persona review (`docs/reviews/gate1-simulated-persona-feedback.md`), confirmed against data and sources.
* **Defect 1 — entry basis:** milestone date is the 2015-07-30 mainnet launch, but the multiple used the 2014 presale price ($0.31). A buyer at the milestone date could not get that price; presale tokens were BTC-only and illiquid for a year.
* **Defect 2 — exit observation:** `$3,275` was tagged `2024-07-20`; ETH closed ~$3,518 that day. $3,275 matches the 2024-07-26 close.
* **Fix:** entry $2.77 (first Kraken trade, 2015-08-07; Cointelegraph "Five Years of Ethereum"), exit $3,275 (2024-07-26 close; Coinranking). Multiple 3,275 / 2.77 = 1,182.3 → **1,182×** (was 10,570×). Summary, action, buyWhen, estimatedReturn, priceObservations, claimReview evidence and sources updated in `src/data/milestones/us.json`. ICO price kept as context and in the quiz question only.
* **Process lesson:** the auditor checked that each number matched *a* source excerpt, not that the entry was buyable *at the milestone date*. Audits now also check: entry observation date ≥ milestone date for retail-buyable milestones, and exit observation date matches the quoted exit price.
* **Sweep:** all ranked, non-private milestones were scanned for presale/ICO/seed/pre-IPO/OTC entry wording or entry observations before the milestone date. Only this record failed; `jp-softbank-alibaba-stake-2000` and `us-peter-thiel-facebook-seed-2004` are `private` and are now excluded from the home ranking.

---

### Record 5: `us-nvidia-ipo-1999`
* **Milestone ID:** `us-nvidia-ipo-1999`
* **Exact Claim:**
  * EN: *"$1,000 into Nvidia's 1999 IPO grew into over $9 million thanks to the AI boom."*
  * VI: *"1.000 USD vào IPO Nvidia năm 1999 trở thành hơn 9 triệu USD nhờ cơn sốt AI."*
* **Proposing Agent:** `research-agent-1`
* **Auditing Agent:** `audit-agent-2`
* **Sources & Quotations:**
  * Source 1: `https://investor.nvidia.com/investor-resources/faqs/default.aspx`
    * *Excerpt:* "NVIDIA went public on January 22, 1999 at an initial public offering price of $12.00 per share."
  * Source 2: `https://finance.yahoo.com/markets/stocks/articles/invested-1-000-nvidia-stock-233108798.html?.tsrc=rss`
    * *Excerpt:* "A $1,000 investment in Nvidia at its IPO would have bought about 83.33 shares. Following six stock splits... that holding would now equal 40,000 shares, worth approximately $9.2 million."
* **Split Structure:**
  * 2-for-1 (2000), 2-for-1 (2001), 2-for-1 (2006), 3-for-2 (2007), 4-for-1 (2021), 10-for-1 (2024).
  * Total split factor: $2 \times 2 \times 2 \times 1.5 \times 4 \times 10 = 480$.
  * Split-adjusted IPO price: $12 / 480 = $0.025 per share.
* **Multiple:** $9,196,000 / $1,000 = 9,196x.
* **Auditor Status:** Verified; explicit split explanation documented.

---

## Price-basis corrections (2026-11-11)

**Rule adopted:** entry and exit prices are the actual quoted prices on each date; `splitFactor` = shares held at exit per share bought (splits, bonus issues, stock dividends; paid rights issues excluded); `returnMultiple = exitPrice × splitFactor ÷ entryPrice`, enforced by `scripts/validate-data.mjs` (±2%) for every priced milestone. Found by simulated persona review; researched by four agents, figures and sources checked before applying.

| Milestone | Was | Now | Basis |
|---|---|---|---|
| `us-nvidia-ipo-1999` | 9,196×, exit "2024" | 9,119× | $12 → $227.98 close 2026-08-27, ×480 (six splits). Article's $229.91 matches no daily close. |
| `us-amazon-ipo-1997` | 1,150× | 1,157× | $18 → $86.77 close 2022-12-21, ×240. Article's "115,933%" is internally inconsistent; dropped. |
| `us-netflix-ipo-2002` | 654× | 646× | $15 → $691.69 close 2021-11-17, ×14. 654× used 2026 prices with a Nov-2021 exit date. |
| `us-starbucks-ipo-1992` | entry $0.27 (adjusted), exit "2024" | 402× | $17 → $106.82 close 2026-05-15, ×64. Entry now nominal like every other milestone. |
| `cn-byd-buffett-2008` | 38× (no stated method) | 33× | HK$8 was a private placement; retail entry HK$11.90 (2008-09-29 close) → HK$392.80 (2025-03-31, stake confirmed fully sold). 2025 ×3 bonus issue is after the exit. |
| `vn-vinamilk-listing-2006` | 15× (unsourced) | 30.6× | VND 53,000 → 208,600 close 2017-12-29, ×7.776 (bonus/stock dividends 2009–2016). |
| `vn-hoa-phat-listing-2007` | 20× (unsourced) | 11.2× | VND 110,000 → 50,700 close 2021-06-25, ×24.32 (12 events 2008–2021). 9.7× from the 127,000 first-day close. |
| `vn-vnindex-peak-2007` | 3.6× / text 290% | 3.81× | 307.50 (end-2005 close, CafeF/SSC) → 1,170.67. |
| `ca-bre-x-gold-fraud-1997` | 0.0003 | 0.000314 | rounding only. |

**Residual uncertainty:** Amazon article publication date inferred (Dec 2022); Netflix 2004/2015 split days confirmed to month only; Vietnamese corporate-action lists come from an aggregator (cophieu68), cross-checked against Vietstock (VNM) and VietnamFinance (HPG); HPG exit close from a single broker bulletin.
