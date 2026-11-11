import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { localeAlternates, SITE_URL } from "@/lib/seo";

const COPY = {
  vi: {
    heading: "Miễn trừ trách nhiệm",
    updated: "Cập nhật lần cuối: 2026",
    sections: [
      {
        h: "Không phải lời khuyên đầu tư",
        p: "Toàn bộ nội dung trên The Reincarnation Checklist — các mốc lịch sử, số liệu lợi nhuận, 'Sổ trọng sinh', 'Bảng giá theo năm' — mang tính giải trí và giáo dục lịch sử tài chính. Đây không phải khuyến nghị mua, bán hay nắm giữ bất kỳ cổ phiếu, tiền mã hóa, vàng, bất động sản hay tài sản nào, và không cấu thành dịch vụ tư vấn đầu tư theo Luật Chứng khoán 2019. Chúng tôi không có giấy phép tư vấn đầu tư chứng khoán. Quyết định đầu tư của bạn là trách nhiệm của riêng bạn; hãy tham khảo chuyên gia tài chính được cấp phép trước khi ra quyết định.",
      },
      {
        h: "Số liệu lịch sử, không đảm bảo tương lai",
        p: "'Lợi nhuận quá khứ không đảm bảo kết quả tương lai.' Các con số về lợi nhuận, giá mua/bán trong quá khứ được tổng hợp từ nguồn công khai tại thời điểm nghiên cứu và có thể đã lỗi thời, làm tròn, hoặc dựa trên cách tính khác với cách bạn tính. Số liên kết nguồn chỉ cho biết có bao nhiêu tài liệu tham khảo được liệt kê; không có nghĩa là số liệu hay từng khẳng định đã được kiểm tra độc lập.",
      },
      {
        h: "Tiền mã hóa",
        p: "Tại Việt Nam, tiền mã hóa chưa được công nhận là phương tiện thanh toán hợp pháp (Ngân hàng Nhà nước, công văn 5747/NHNN-PC 2017; Nghị định 52/2024/NĐ-CP). Nội dung liên quan đến crypto trên trang chỉ mang tính ghi chép lịch sử thị trường, không phải khuyến khích giao dịch.",
      },
      {
        h: "'Sổ trọng sinh' là trò chơi",
        p: "Mọi kết quả trong trò chơi mô phỏng là giả định, dựa trên dữ liệu lịch sử được đơn giản hóa cho mục đích giải trí. Kết quả trò chơi không phản ánh khả năng sinh lời thực tế nếu áp dụng ngoài đời.",
      },
      {
        h: "Bảng giá theo năm",
        p: "Số liệu giá cả theo năm được tổng hợp từ báo chí, văn bản pháp luật và các trang tổng hợp công khai (xem nguồn trích dẫn ở mỗi mục). Một số chuỗi chỉ có vài mốc rời rạc, không phải số liệu thống kê chính thức liên tục — phù hợp để tham khảo khi viết truyện hoặc tìm hiểu, không phù hợp để trích dẫn học thuật hoặc pháp lý.",
      },
      {
        h: "Góp ý & báo lỗi",
        p: "Nếu bạn phát hiện số liệu sai, hãy gửi báo lỗi qua mục \"Báo lỗi & đề xuất sửa số liệu\" ở cuối trang Phương pháp tính (liên kết bên dưới), kèm mã mốc và nguồn đối chiếu.",
      },
    ],
  },
  en: {
    heading: "Disclaimer",
    updated: "Last updated: 2026",
    sections: [
      {
        h: "Not investment advice",
        p: "All content on The Reincarnation Checklist — historical milestones, return figures, the Rebirth Simulator, the Price Almanac — is for entertainment and financial-history education only. It is not a recommendation to buy, sell, or hold any stock, cryptocurrency, gold, real estate, or other asset, and does not constitute investment advisory services. We hold no investment-advisory license. Your investment decisions are your own responsibility; consult a licensed financial professional before acting.",
      },
      {
        h: "Historical figures, no future guarantee",
        p: "Past performance does not guarantee future results. Historical return and price figures were compiled from public sources at research time and may be outdated, rounded, or computed on a different basis than you expect. A source-link count only shows how many references are listed; it does not mean the figures or claims have been independently checked.",
      },
      {
        h: "Cryptocurrency",
        p: "In Vietnam, cryptocurrency is not recognized as a legal means of payment (State Bank of Vietnam notice 5747/NHNN-PC, 2017; Decree 52/2024/NĐ-CP). Crypto-related content here is historical record-keeping only, not a trading recommendation.",
      },
      {
        h: "The Rebirth Simulator is a game",
        p: "Every outcome in the simulator is hypothetical, based on simplified historical data for entertainment purposes. Game results do not reflect real-world returns you could actually achieve.",
      },
      {
        h: "Price Almanac",
        p: "Year-by-year price figures are compiled from press articles, legal documents, and public aggregator sites (see the cited sources on each item). Some series only have a few scattered data points, not an official continuous statistical series — suitable as reference for fiction writing or general curiosity, not for academic or legal citation.",
      },
      {
        h: "Corrections",
        p: "If you spot an error, use \"Report an error\" at the bottom of the Methodology page (linked below) and include the milestone ID and your source.",
      },
    ],
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/disclaimer">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  const description = copy.sections[0]?.p.slice(0, 160);
  return {
    title: copy.heading,
    description,
    alternates: { canonical: `${SITE_URL}/${lang}/disclaimer`, languages: localeAlternates("/disclaimer") },
    openGraph: { images: [`/${lang}/opengraph-image`], title: copy.heading, description, url: `/${lang}/disclaimer` },
  };
}

export default async function DisclaimerPage({ params }: PageProps<"/[lang]/disclaimer">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const copy = COPY[lang];

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{copy.heading}</h1>
        <p className="text-sm text-faint">{copy.updated}</p>
      </header>
      <div className="space-y-6">
        {copy.sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-lg font-bold">{s.h}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
      <footer className="pt-4 border-t border-line text-sm text-muted">
        <Link href={`/${lang}/methodology#corrections`} className="inline-flex items-center gap-1.5 font-semibold text-gold underline underline-offset-4">
          <span>⚖️</span>
          <span>{lang === "vi" ? "Xem chi tiết Phương pháp tính & Tiếp nhận sửa đổi →" : "View detailed Methodology & Corrections →"}</span>
        </Link>
      </footer>
    </article>
  );
}
