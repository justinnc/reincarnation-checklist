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

---

## Unpriced multiples and trap framing (2026-11-11)

**Prices added** (same rule: `exitPrice × splitFactor ÷ entryPrice`; researched by four agents, applied after review; several excerpts came from search snippets and are marked as such in agent transcripts):

| Milestone | Was | Now | Basis |
|---|---|---|---|
| `us-dell-ipo-1988` | 420.7× (no prices) | 420.7× | $8.50 → $37.25 (2000-01-28), ×96 — all from Dell FY2000 annual report |
| `us-march-2009-bottom` | 3.98× | 4.12× | 676.53 → 2,786.57 (2018-03-09) |
| `us-covid-crash-bottom-2020` | 1.76× | 1.76× | 2,237.40 → 3,948.72 (2023-03-23) |
| `us-monster-beverage-hansen-compounding-2002` | 1,040× | 1,134× | ~$8.28 (2004-01-02, Yahoo-derived) → $48.92 (2026-08-24), ×192; article's "$1.04M" contradicts its own "111,000%" |
| `de-vw-dieselgate-2015` | 0.81× (exit €130.20, no entry) | 0.814× | €162.40 → €132.20 (VOW3 Xetra closes) |
| `it-luxottica-growth` | 50× | 64.1× | ~$9.50 (derived from $0.95 split-adj.) → $60.90 last NYSE close, ×10; company's 50× mixed USD and EUR |
| `it-campari-growth` | 15× (market cap) | 16.6× (price) | €31 IPO → €12.86 (2021-12-31), ×40; matches Campari AR +1,558.7% |
| `gb-right-to-buy-1980` | 5.36× | 6.36× | Halifax £30,898 (1983) → £196,478 (2007); 5.36 misread "+536%" |
| `gb-london-property-boom-1995-2007` | 3.2× | 3.19× | Halifax £61,666 (1995) → £196,478 (2007); national average |
| `gb-fca-crypto-derivatives-ban-2020` | 5.5× | 6.37× | BTC $10,604 (2020-10-06) → $67,567 (2021-11-08) |
| `in-bajaj-finance-decade-2014-2024` | 29.76× | 29.73× | ₹2,437 → ₹7,245 (Sep 2014 → Sep 2024, Yahoo-derived), ×10 |
| `in-adani-hindenburg-2023` | 0.364× | 0.455× | ₹3,442 → ₹1,565 (2023-02-02); 0.364 matched no price |
| `jp-olympus-accounting-scandal-2011` | 10× | 10.4× | ¥460 (2011-11-11) → ¥4,800 (2015-12-30, Yahoo-derived) |
| `jp-abenomics-kuroda-qqe-2013` | 1.8× | 1.8× | 8,664.73 (2012-11-14) → 15,627.26 (2013-05-22); milestone date moved to 14 Nov announcement |
| `th-capital-controls-black-tuesday-2006` | 1.11× (exit "2007-10") | 1.11× | 622.14 → 691.55 next session; exit date fixed |
| `th-cp-all-7eleven-compounder-2008` | 16.47× | 12.5× | ฿12.30 → ฿77 (Yahoo-derived), ×2; 16.47 included dividends |
| `vn-mwg-listing-2014` | 12× | 16.7× | 81,500 first-day close → 160,200 (2022-04-15), ×8.5; old 12× from a CafeF series missing the 2021 stock dividend |
| `vn-crypto-boom-vietnam` | 30× | 27.8× | AXS $5.76 (2021-07-01) → $160.36 (2021-11-07) |

**Left as "reported, no prices"** (`gb-black-wednesday-1992` superseded 2026-11-12: now priced as the saver scenario, see "Black Wednesday: saver scenario priced" at the end)**:** `gb-black-wednesday-1992`, `jp-softbank-alibaba-stake-2000` (private deals) and `vn-phu-quoc-land-fever-2014` (only price pair is one resident's quoted plot, not a recorded sale).

**Follow-up:** replace Yahoo-derived prices (Monster entry, Bajaj, Olympus exit, CP All) with exchange or news closes when available. → Done 2026-11-11, see "Yahoo-derived prices: firmer sources" below.

**Trap framing:** 52 milestones rewritten (EN+VI) so advice fields lead with exit / stay out / protect savings; shorting, puts, CDS and currency shorts appear only as past-tense descriptions of what professionals did, with a risk note. Enforced by `data.test.ts › trap framing in every market` (the previous data fails it on 50 milestones).

---

## Yahoo-derived prices: firmer sources (2026-11-11)

Researched by 4 parallel agents (read-only), then every excerpt below was re-fetched and checked by the parent agent before editing data. Status: **agent-checked**, not human-verified. No stored price or multiple changed; sources were added and one source title corrected.

| Milestone | Price | Primary evidence (re-fetched) | Result |
|---|---|---|---|
| `th-cp-all-7eleven-compounder-2008` | entry ฿12.30 | SET company highlight, archived 2009-08-09: "ค่าสถิติสำคัญ ณ วันที่ … 30/12/2551 … ราคาล่าสุด(บาท) … 12.30", market cap 55,265.72m (= 12.30 × 4,493.15m shares, so unadjusted) | **Confirmed exact** (30 Dec 2008 close). Not the crisis low: CP All FY08 IR deck gives a 12-month low of ฿7.00 (agent-read; deck PDF blocked to direct fetch). Copy already says "end-2008", so no wording change. |
| `th-cp-all-7eleven-compounder-2008` | exit ฿77 | SET company highlight, archived 2021-10-28: "Statistics as of 29/12/2017 … Last Price(Baht) 77.00", market cap 691,698.80 | **Confirmed exact.** splitFactor 2 (2012 1:1 stock dividend) supported by CP All 3Q12 statements (agent-read); share count 4,493.1m → 8,983.1m shows no other event 2008–2017. |
| `jp-olympus-accounting-scandal-2011` | exit ¥4,800 | Olympus 有価証券報告書 FY ending Mar 2016, p.46: "月別 平成27年10月 11月 12月 … 最高（円） 4,135 5,000 4,950 … 最低（円） 3,665 4,025 4,520", TSE First Section | **Bracketed** (Dec 2015 range ¥4,520–4,950). Exact 30 Dec 2015 close 4,800.07 only from Stooq unadjusted daily data (aggregator; not added as a source). |
| `jp-olympus-accounting-scandal-2011` | entry ¥460 | Arab News: "It slipped nearly 5 percent to 460 yen Friday on the Tokyo Stock Exchange." | **Confirmed** as the 11 Nov 2011 close (date inferred from "Friday"; Stooq close 459.96). Source title was wrong ("Olympus slips to 460 yen"); now the page's real title. The true Nov 2011 low was ¥424 intraday (Olympus AR2013); ¥460 kept as the realistic fill. |
| `in-bajaj-finance-decade-2014-2024` | entry ₹2,437 | Bajaj Finance 28th Annual Report FY2015, p.34, Table 2: "Sept – 14 2,711.00 2,426.00 2,721.30 2,429.25" (BSE H/L, NSE H/L) | **Bracketed** (Sep 2014 NSE range ₹2,429.25–2,721.30). |
| `in-bajaj-finance-decade-2014-2024` | exit ₹7,244.90 | — | **Still Yahoo-only** as of 2026-11-11; **superseded 2026-11-12, see the follow-up below.** NSE/BSE bhavcopies returned 403; ET Now live blog has an intraday ₹7,218 at 14:40 IST. Note: a second ×10 action (Jun 2025 1:2 split + 4:1 bonus) means today's Yahoo shows ~₹724.49 for this date; the stored figure is nominal pre-2025. |
| `us-monster-beverage-hansen-compounding-2002` | entry $8.28 | Hansen Natural 10-K FY2004 (SEC), Item 5: "First Quarter $ 14.43 $ 7.92" (2004 bid closing quotations, pre-split); FY2003 Q4 $9.40 / $5.79 | **Bracketed** (Q1 2004 range). Exact 2 Jan 2004 close not found in a primary source. Split dates per 10-Ks: 2-for-1 8 Aug 2005, 4-for-1 7 Jul 2006, 2-for-1 15 Feb 2012, 3-for-1 Nov 2016, 2-for-1 27 Mar 2023, 2-for-1 10 Aug 2026 (×192). |

**Remaining follow-up:** exact daily closes for Bajaj (5 Sep 2024) and Hansen (2 Jan 2004) need an exchange bhavcopy / archived newspaper table; the data stays labelled "about" where only a range is confirmed.

### Follow-up 2026-11-12: Bajaj exit close confirmed

Status: **agent-checked** (single agent, document downloaded and read directly), not human-verified. No stored price or multiple changed; one source added.

| Milestone | Price | Evidence | Result |
|---|---|---|---|
| `in-bajaj-finance-decade-2014-2024` | exit ₹7,244.90 (5 Sep 2024) | Aditya Birla Sun Life Mutual Fund, "Daily Equity Market Pulse-September 09, 2024" (PDF created 2024-09-09), table "Nifty 50 Top 5 Gainers", columns "Company / 6-Sep-24 / Prev_Day / % Change / 1 Week": "Bajaj Finance 7,317.15 7,244.90 1.00 1.63", footer "Source: NSE" | **Confirmed exact.** 6 Sep 2024 was a Friday, so "Prev_Day" is Thursday 5 Sep 2024. This is a fund house's daily sheet quoting NSE, not the exchange's own file; it is independent of Yahoo and matches it to the paisa. |

Still not pinned to the day after another attempt:
- **Bajaj, exchange file:** NSE bhavcopy, NSE historical API and BSE price API all return 403 "Access Denied" (curl and a real browser); no Wayback copy of the 5 Sep 2024 bhavcopies.
- **Hansen 2 Jan 2004 ($8.28):** EDGAR has no Hansen filing dated or reporting that day (nearest: a Form 4 for 7 Jan 2004, an S-8 on 4 Feb 2004). No primary daily quote found; stays bracketed by the 10-K quarterly range.
- **Olympus 30 Dec 2015 (¥4,800):** only aggregator daily tables were found (Stooq; Kabutan's yearly table shows a 2015 close of 1,200.0, which is ¥4,800 ÷ 4 on a split-adjusted basis); stays bracketed by the 有価証券報告書 monthly range.

## Black Wednesday: saver scenario priced (2026-11-12)

Status: **agent-checked** (single agent; the Bank of England table was fetched directly as CSV and as HTML), not human-verified. Owner approved pricing the saver scenario instead of Soros's trade.

**Defect found.** `gb-black-wednesday-1992` said Soros closed "right after the UK exited the ERM on 16 Sept 1992, once sterling had fallen roughly 15% against the Deutschmark", and the insider tip said a saver "avoided the roughly 15% fall". The Bank of England's daily spot series does not support 15% at that point.

**Evidence.** Bank of England Statistical Interactive Database, series XUDLDMS "Spot exchange rate, Deutschemark into Sterling" and XUDLUSS (US dollar), fetched 2026-11-12. The Bank states these rates "are not official rates and are no more authoritative than that of any commercial bank operating in the London foreign exchange market". Rows as returned:

| Date | DM per £ (XUDLDMS) | $ per £ (XUDLUSS) |
|---|---|---|
| 01 Sep 1992 | 2.7859 | 2.0002 |
| 16 Sep 1992 | 2.7784 | 1.8467 |
| 17 Sep 1992 | 2.6323 | 1.775 |
| 30 Sep 1992 | 2.5095 | 1.777 |
| 05 Oct 1992 (lowest DM rate Aug–Dec 1992) | 2.393 | 1.716 |
| 31 Dec 1992 | 2.452 | 1.515 |

Computed: 16 Sep → 17 Sep −5.3%; 16 Sep → 30 Sep −9.7%; 16 Sep → 5 Oct −13.9%; 1 Sep → 30 Sep −9.9%; 1 Sep → 5 Oct −14.1%.

**Changes.**
- `sellWhen` and `insiderTip` (EN/VI): "roughly 15%" replaced by the dated figures (about 5% next day, about 10% by 30 Sep, about 14% at the 5 Oct low). The claim about when Soros closed his position was dropped: no cited source dates it.
- Priced as the saver scenario: `entryPrice` 35.99, `exitPrice` 39.85, `priceCurrency` GBP (was USD), unit "100 Deutschmarks", `exitDate` 1992-09-30 (was 1992-09-16), `returnMultiple` 1.11 (was 1.1, the reported Soros ratio of about $1bn on about $10bn).
- **Derived, not quoted:** the two prices are 100 ÷ the quoted DM-per-£ rate (100 ÷ 2.7784 = 35.99; 100 ÷ 2.5095 = 39.85). `estimatedReturn` prints the quoted rates next to them. `priceObservations.basis` is "other" (indicative spot rate, not an exchange close).
- The 5 Oct low is mentioned in text only; it is not used for the multiple (bottom-picking).
- `private: true` kept, so the item still stays out of Biggest wins and Realistic playbooks. Soros's ~$1bn / ~$10bn remains in the text as reported.
- Source added: Bank of England database, XUDLDMS, September 1992.

**Known display nit:** the detail page rounds the prices to "£36" and "£40"; the exact figures are in the estimated-return text.
