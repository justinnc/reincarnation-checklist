import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { localeAlternates, SITE_URL } from "@/lib/seo";
interface PageProps {
  params: Promise<{ lang: string }>;
}

interface Section {
  h: string;
  p: string;
  bullets?: string[];
}

const COPY: Record<string, { heading: string; subtitle: string; updated: string; sections: Section[]; feedbackTitle: string; feedbackText: string; feedbackAction: string; disclaimerLinkText: string }> = {
  vi: {
    heading: "Phương pháp tính & Tiếp nhận sửa đổi",
    subtitle: "Cách chúng tôi thu thập, tính toán số liệu và quy trình tiếp nhận phản hồi hiệu đính.",
    updated: "Cập nhật lần cuối: 2026-11-11",
    sections: [
      {
        h: "1. Phân biệt 'Có liên kết nguồn' và 'Đã kiểm toán độc lập'",
        p: "Chúng tôi phân tách rõ ràng mức độ xác thực của từng số liệu trên website nhằm đảm bảo tính minh bạch:",
        bullets: [
          "Có liên kết nguồn (Source-linked): Đa số mốc sự kiện hiển thị nhãn số lượng nguồn (ví dụ: '2 nguồn', '3 nguồn'). Điều này thể hiện số lượng tài liệu tham khảo công khai (báo chí, hồ sơ IPO, văn bản pháp luật, trang dữ liệu lịch sử) được dẫn link trực tiếp để người đọc đối chiếu, KHÔNG đồng nghĩa số liệu đã được kiểm toán tài chính độc lập.",
          "Đã kiểm toán biên tập (Agent-checked): Một số lượng chọn lọc các mốc có ảnh hưởng lớn được ghi nhận trong sổ kiểm toán nội bộ thông qua quy trình đối soát chéo độc lập giữa 2 tác nhân (người đề xuất và người kiểm toán) đối chiếu từng đoạn trích dẫn, ngày quan sát và cơ sở giá.",
          "Không chứng nhận chuyên môn: Cả hai cấp độ trên đều là quy trình biên tập nội bộ, tuyệt đối không cấu thành chứng nhận pháp lý hoặc kiểm toán chuyên nghiệp từ tổ chức tài chính có thẩm quyền."
        ]
      },
      {
        h: "2. Cơ sở giá & Cách tính hệ số lợi nhuận",
        p: "Các hệ số lợi nhuận (Return Multiples) được tính toán dựa trên các nguyên tắc chuẩn mực sau:",
        bullets: [
          "Giá danh nghĩa vs Giá thực: Toàn bộ giá trị trong các mốc sự kiện phản ánh số tiền danh nghĩa (nominal) theo đồng tiền gốc tại thời điểm diễn ra, trừ khi có chú thích rõ ràng về điều chỉnh lạm phát (real terms).",
          "Lợi nhuận theo giá (Price-only) vs Tổng lợi nhuận (Total Return): Các hệ số nhân phản ánh biến động giá mua - giá bán thuần túy, chưa bao gồm cổ tức tái đầu tư, chi phí cơ hội, chi phí vay mượn (đối với bán khống), hay phí lưu ký/lưu trữ tài sản.",
          "Chia tách cổ phiếu & Tỷ giá hối đoái: Với cổ phiếu niêm yết (như Nvidia, Apple), các mức giá mua vào sau này được quy đổi theo hệ số chia tách lũy kế để phản ánh đúng số vốn ban đầu (ví dụ: $1.000 ban đầu tăng trưởng tương ứng với số lượng cổ phiếu sau 6 đợt chia tách).",
          "Thời điểm quan sát: Giá vào và giá ra đều ghi nhận ngày cụ thể và cơ sở giá (giá đóng cửa ngày, giá chào bán IPO danh nghĩa, hoặc mức đỉnh giao dịch trong ngày khi đạt cột mốc vốn hóa)."
        ]
      },
      {
        h: "3. Thanh khoản, Khả thi thực tế & Định kiến kẻ sống sót",
        p: "Các con số trên lý thuyết thường khác biệt lớn so với việc thực thi trong thực tế:",
        bullets: [
          "Rào cản thanh khoản: Nhiều thương vụ mang lại lợi nhuận khổng lồ trên giấy tờ (như vòng hạt giống thiên thần của Facebook hay ICO Ethereum) đòi hỏi tư cách nhà đầu tư chuyên nghiệp hoặc chịu rủi ro khóa vốn hoàn toàn trong nhiều năm.",
          "Thao túng & Khối lượng ảo: Các trường hợp thao túng giá (như vụ án Louis Holdings TGG tại Việt Nam) được gắn cờ 'Chỉ lưu trữ lịch sử' (historicalOnly). Chúng bị loại khỏi mọi bảng xếp hạng hay công cụ tính toán do thanh khoản một chiều và nhà đầu tư đại chúng không thể chốt lời ở vùng đỉnh.",
          "Định kiến kẻ sống sót (Survivorship Bias): Website tập trung vào những mốc thành công vang dội nhất trong lịch sử. Trong thực tế, hàng ngàn đợt IPO, dự án crypto và doanh nghiệp khác đã phá sản hoặc giảm về 0."
        ]
      },
      {
        h: "4. Đơn giản hóa trong công cụ mô phỏng & trò chơi",
        p: "Các công cụ tương tác như 'Nếu bạn đã đầu tư' (What-If) và 'Thử thách sống sót' (Survival Run) áp dụng các mô hình đơn giản hóa (ví dụ: tái cân bằng danh mục không mất phí trượt giá, tỷ lệ lạm phát cố định) phục vụ mục đích trực quan hóa và giải trí giáo dục, không thể thay thế mô hình hoạch định tài chính cá nhân chuyên nghiệp."
      }
    ],
    feedbackTitle: "Quy trình tiếp nhận sửa đổi & Báo lỗi số liệu",
    feedbackText: "Chúng tôi cam kết duy trì tính trung thực và chính xác của dữ liệu. Nếu bạn phát hiện một liên kết hỏng, số liệu ghi nhận sai ngày, mức giá không khớp với nguồn công khai, hoặc giải thích sai lệch bản chất sự kiện, xin vui lòng gửi phản hồi cho đội ngũ phát triển.",
    feedbackAction: "Gửi phản hồi / Báo lỗi số liệu",
    disclaimerLinkText: "Đọc thêm tuyên bố Miễn trừ trách nhiệm đầy đủ"
  },
  en: {
    heading: "Methodology & Data Corrections",
    subtitle: "How we compile, calculate, and audit historical financial data \u2014 and how to submit corrections.",
    updated: "Last updated: 2026-11-11",
    sections: [
      {
        h: "1. 'Source-Linked' vs. 'Separately Audited' Claims",
        p: "We distinguish between levels of data verification to maintain complete transparency:",
        bullets: [
          "Source-Linked: Most milestones display a badge showing the number of citations (e.g. '2 sources', '3 sources'). This indicates public contemporary references (news reports, regulatory filings, IPO prospectuses, historical archives) available for cross-referencing. It does NOT mean the milestone has been certified by an independent financial auditor.",
          "Agent-Checked (Separately Audited): A select cohort of high-visibility claims is documented in an internal claim audit ledger via a two-agent review process (proposer agent vs. auditor agent) verifying exact quotations, observation dates, price bases, and execution caveats.",
          "No Professional Certification: Neither category constitutes professional legal or investment certification. We are not a licensed financial institution."
        ]
      },
      {
        h: "2. Price Basis & Return Multiples Calculation",
        p: "Multiples and financial values adhere to clear arithmetic standards:",
        bullets: [
          "Nominal vs. Real: Milestone figures represent nominal currencies as recorded at the time of the event, unless explicitly labeled as inflation-adjusted.",
          "Price-Only vs. Total Return: Multipliers reflect capital appreciation between entry and exit price benchmarks. They exclude reinvested dividends, stock borrow fees (for short positions), custodial charges, and capital gains taxes.",
          "Stock Splits & Corporate Actions: For public equities with extensive split histories (e.g., Nvidia, Apple), entry values reflect cumulative split factors so initial capital tracks correctly against post-split shares.",
          "Observation Timing: Records capture specific observation dates and basis types (e.g., daily market close, nominal IPO issue price, or milestone intraday valuation peaks)."
        ]
      },
      {
        h: "3. Liquidity, Feasibility & Survivorship Bias",
        p: "Theoretical calculations must be interpreted alongside real-world execution hurdles:",
        bullets: [
          "Liquidity Constraints: Extraordinary returns (such as angel convertible notes or early token crowdsales) were restricted to accredited participants or carried multi-year lockups with zero secondary liquidity.",
          "Market Manipulation: Severe manipulation cases (such as Louis Holdings TGG in Vietnam) are tagged as 'historicalOnly'. They are excluded from return rankings and calculators because artificial volume made peak exits unachievable for public retail investors.",
          "Survivorship Bias: Highlighted milestones reflect prominent outliers in financial history. Thousands of contemporary ventures, IPOs, and tokens incurred total capital loss."
        ]
      },
      {
        h: "4. Simulation & Game Simplifications",
        p: "Interactive tools such as the 'What If' calculator and 'Survival Run' use simplified assumptions (zero slippage, stylized inflation rates) designed for educational exploration and storytelling rather than actual portfolio construction."
      }
    ],
    feedbackTitle: "Data Corrections & Community Feedback",
    feedbackText: "We welcome community review and correction. If you find an outdated citation, an inaccurate entry/exit price, a flawed split calculation, or missing context, please notify us so we can audit and update the ledger.",
    feedbackAction: "Submit Data Correction / Feedback",
    disclaimerLinkText: "Read our full Legal Disclaimer"
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang] || COPY.en;
  return {
    title: copy.heading,
    description: copy.subtitle,
    alternates: { canonical: `${SITE_URL}/${lang}/methodology`, languages: localeAlternates("/methodology") },
    openGraph: { images: ["/opengraph-image"], title: copy.heading, description: copy.subtitle, url: `/${lang}/methodology` },
  };
}

export default async function MethodologyPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const copy = COPY[lang] || COPY.en;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-line pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-gold">
          <span>\u2696\ufe0f</span>
          <span>Gate 1 Baseline</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.heading}</h1>
        <p className="text-base text-muted sm:text-lg">{copy.subtitle}</p>
        <p className="text-xs text-faint">{copy.updated}</p>
      </header>

      <div className="space-y-6">
        {copy.sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{s.h}</h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{s.p}</p>
            {s.bullets && (
              <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-muted">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-gold/40 bg-gold/5 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">{copy.feedbackTitle}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{copy.feedbackText}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href="https://github.com/justindang/reincarnation-checklist/issues/new?title=%5BData+Correction%5D&body=Milestone+ID%3A%0APage+URL%3A%0AProposed+Correction%3A%0ASource+Citation%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-on-gold shadow-sm transition hover:opacity-90"
          >
            <span>\u2709\ufe0f</span>
            <span>{copy.feedbackAction}</span>
          </a>
          <Link
            href={`/${lang}/disclaimer`}
            className="text-sm font-medium text-muted underline decoration-line-strong underline-offset-4 hover:text-gold"
          >
            {copy.disclaimerLinkText} \u2192
          </Link>
        </div>
      </section>
    </article>
  );
}
