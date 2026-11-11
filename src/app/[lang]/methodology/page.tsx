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
    subtitle: "Cách chúng tôi thu thập, tính toán số liệu và cách bạn có thể báo lỗi.",
    updated: "Cập nhật lần cuối: 11/11/2026",
    sections: [
      {
        h: "1. 'Có liên kết nguồn' và 'Đã rà soát chéo' nghĩa là gì",
        p: "Mỗi con số trên trang có mức độ kiểm tra khác nhau. Chúng tôi nói rõ từng mức:",
        bullets: [
          "Có liên kết nguồn: Nhãn '2 liên kết nguồn', '3 liên kết nguồn' cho biết số tài liệu công khai (báo chí, hồ sơ niêm yết, văn bản pháp luật, dữ liệu giá lịch sử) được dẫn link để bạn tự đối chiếu. Nhãn này KHÔNG có nghĩa là số liệu đã được kiểm chứng độc lập.",
          "Đã rà soát chéo (tự động): Với một số ít con số nổi bật nhất, một quy trình có hỗ trợ AI đối chiếu giá và ngày tháng với đoạn trích từ nguồn, sau đó một lượt AI thứ hai kiểm tra lại. Đây là bước kiểm tra nội bộ, không phải thẩm định của con người hay kiểm toán chuyên nghiệp, và vẫn có thể bỏ sót lỗi. Ví dụ: lần rà soát đầu tiên đã không phát hiện mốc Ethereum dùng giá ICO năm 2014; con số này đã được sửa.",
          "Không có chứng nhận chuyên môn: Cả hai mức trên đều là quy trình biên tập nội bộ, không phải chứng nhận pháp lý hay tư vấn đầu tư. Chúng tôi không phải tổ chức tài chính được cấp phép."
        ]
      },
      {
        h: "2. Cơ sở giá & cách tính hệ số lợi nhuận",
        p: "Hệ số lợi nhuận được tính theo các nguyên tắc sau:",
        bullets: [
          "Giá danh nghĩa: Mọi giá trị là số tiền danh nghĩa theo đồng tiền gốc của từng thị trường, chưa trừ lạm phát, trừ khi ghi rõ.",
          "Chỉ tính theo giá: Hệ số chỉ phản ánh thay đổi giá, chưa gồm cổ tức tiền mặt, thuế, phí giao dịch, phí lưu ký hay chi phí vay.",
          "Chia tách & cổ phiếu thưởng: Giá mua và giá bán luôn là giá thực tế tại thời điểm giao dịch. Nếu giữa hai thời điểm cổ phiếu được chia tách hoặc phát hành cổ phiếu thưởng/cổ tức bằng cổ phiếu, trang của mốc sẽ ghi 1 cổ phiếu ban đầu thành bao nhiêu cổ phiếu, và hệ số = giá bán × số cổ phiếu đó ÷ giá mua. Không có dòng này nghĩa là hệ số = giá bán ÷ giá mua.",
          "Giá mua phải mua được vào thời điểm đó: Với thương vụ nhà đầu tư cá nhân mua được, giá mua là giá có thể giao dịch vào hoặc sau ngày của mốc. Giá ICO, giá trước niêm yết chỉ được nêu làm bối cảnh, không dùng để tính hệ số.",
          "Thương vụ riêng tư: Vòng gọi vốn hạt giống, cổ phần trước IPO và các thương vụ người thường không tham gia được bị loại khỏi bảng xếp hạng và chế độ 'Thực tế'.",
          "Ngày quan sát: Khi có dữ liệu, trang của từng mốc ghi ngày mua, ngày bán và cơ sở giá. Bảng xếp hạng gồm các mốc có ngày kết thúc và đồng tiền khác nhau, nên không so sánh trực tiếp được."
        ]
      },
      {
        h: "3. Thanh khoản, khả năng thực hiện & thiên kiến kẻ sống sót",
        p: "Con số trên lý thuyết thường khác xa kết quả thực tế:",
        bullets: [
          "Rào cản thanh khoản: Nhiều thương vụ lãi khủng trên giấy (như vòng gọi vốn hạt giống của Facebook hay đợt bán trước của các đồng tiền mã hoá) chỉ dành cho nhà đầu tư chuyên nghiệp hoặc bị khoá vốn nhiều năm.",
          "Thao túng giá: Các vụ thao túng (như vụ Louis Holdings – TGG tại Việt Nam) chỉ được trình bày như bài học lịch sử. Chúng bị loại khỏi bảng xếp hạng và công cụ tính toán vì nhà đầu tư đại chúng không thể bán ở vùng đỉnh.",
          "Thiên kiến kẻ sống sót: Trang này tập trung vào những thương vụ thành công nổi bật nhất. Trong thực tế, hàng nghìn đợt IPO, dự án tiền mã hoá và doanh nghiệp khác đã phá sản hoặc mất gần hết giá trị."
        ]
      },
      {
        h: "4. Đơn giản hoá trong công cụ mô phỏng & trò chơi",
        p: "Các công cụ như 'Nếu bạn đã đầu tư' và 'Thử thách sống sót' dùng mô hình đơn giản (không tính trượt giá, tỷ lệ lạm phát cố định) để minh hoạ và giải trí, không thay thế được kế hoạch tài chính cá nhân."
      }
    ],
    feedbackTitle: "Báo lỗi & đề xuất sửa số liệu",
    feedbackText: "Nếu bạn thấy liên kết hỏng, ngày sai, giá không khớp với nguồn công khai hoặc phần giải thích sai bản chất sự kiện, hãy gửi cho chúng tôi kèm mã mốc và nguồn đối chiếu. Chúng tôi sẽ kiểm tra và cập nhật.",
    feedbackAction: "Gửi phản hồi / Báo lỗi số liệu",
    disclaimerLinkText: "Đọc toàn bộ tuyên bố miễn trừ trách nhiệm"
  },
  en: {
    heading: "Methodology & Data Corrections",
    subtitle: "How we compile and calculate historical figures — and how to report an error.",
    updated: "Last revised: Nov 11, 2026",
    sections: [
      {
        h: "1. What 'source-linked' and 'cross-checked' mean",
        p: "Figures on this site have different levels of checking. Here is what each level means:",
        bullets: [
          "Source-linked: The '2 source links' badge counts the public references (news reports, filings, prospectuses, price archives) linked on the page so you can check them yourself. It does NOT mean the figure was independently verified.",
          "Cross-checked (automated): For a small set of the most prominent figures, an AI-assisted process compares the listed prices and dates against excerpts from the cited sources, and a second AI pass reviews the first. This is an internal consistency check, not a human or professional audit, and it can miss errors. Example: the first pass missed that the Ethereum milestone used a 2014 presale price; that figure has since been corrected.",
          "No professional certification: Neither level is legal certification or investment advice. We are not a licensed financial institution."
        ]
      },
      {
        h: "2. Price basis & how multiples are calculated",
        p: "Multiples follow these rules:",
        bullets: [
          "Nominal: Figures are in each market's own currency at the time, not inflation-adjusted unless stated.",
          "Price-only: Multiples reflect price change only. They exclude cash dividends, taxes, trading fees, custody fees and borrowing costs.",
          "Splits & bonus shares: Entry and exit prices are always the actual quoted prices on each date. If the stock split or issued bonus shares or stock dividends in between, the milestone page shows how many shares one original share became, and multiple = exit price × that number ÷ entry price. If no such row is shown, multiple = exit price ÷ entry price.",
          "Entry must have been buyable: For retail-buyable milestones, the entry price is one you could trade at on or after the milestone's date. Presale and pre-listing prices are given as context only and are not used for the multiple.",
          "Private deals: Seed rounds, pre-IPO stakes and other deals ordinary investors could not join are excluded from rankings and from 'Realistic' playbooks.",
          "Observation dates: Where recorded, each milestone page shows the entry date, exit date and price basis. Rankings mix different end dates and currencies, so rows are not directly comparable."
        ]
      },
      {
        h: "3. Liquidity, feasibility & survivorship bias",
        p: "Theoretical numbers often differ sharply from what was achievable:",
        bullets: [
          "Liquidity: Many extraordinary paper returns (such as angel notes or token presales) were limited to accredited investors or locked up for years with no way to sell.",
          "Market manipulation: Manipulation cases (such as Louis Holdings – TGG in Vietnam) are presented as historical case studies only. They are excluded from rankings and calculators because public investors could not exit at the peak.",
          "Survivorship bias: This site highlights the most prominent winners. Thousands of other IPOs, tokens and companies from the same periods went bankrupt or lost almost all their value."
        ]
      },
      {
        h: "4. Simulation & game simplifications",
        p: "Tools such as the 'What If' calculator and 'Survival Run' use simplified assumptions (no slippage, stylized inflation rates) for illustration and entertainment. They are not a substitute for personal financial planning."
      }
    ],
    feedbackTitle: "Report an error or suggest a correction",
    feedbackText: "If you find a broken link, a wrong date, a price that doesn't match a public source, or an explanation that misstates what happened, send it to us with the milestone ID and your source. We will check it and update the record.",
    feedbackAction: "Submit a correction",
    disclaimerLinkText: "Read the full disclaimer"
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

      <section id="corrections" className="scroll-mt-20 rounded-2xl border border-gold/40 bg-gold/5 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">{copy.feedbackTitle}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{copy.feedbackText}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href="https://github.com/justinnc/reincarnation-checklist/issues/new?title=%5BData+Correction%5D&body=Milestone+ID%3A%0APage+URL%3A%0AProposed+Correction%3A%0ASource+Citation%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-on-gold shadow-sm transition hover:opacity-90"
          >
            <span>✉️</span>
            <span>{copy.feedbackAction}</span>
          </a>
          <Link
            href={`/${lang}/disclaimer`}
            className="text-sm font-medium text-muted underline decoration-line-strong underline-offset-4 hover:text-gold"
          >
            {copy.disclaimerLinkText} →
          </Link>
        </div>
      </section>
    </article>
  );
}
