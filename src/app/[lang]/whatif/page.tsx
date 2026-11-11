import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { countries, allMilestonesLite } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import WhatIfTabs from "@/components/whatif/WhatIfTabs";

const COPY = {
  vi: {
    kicker: "Công cụ tính toán & Lộ trình lãi kép",
    heading: "Nếu bạn đã đầu tư...",
    intro:
      "Tính lợi nhuận của một tài sản ở 15 quốc gia hoặc ghép các cột mốc lịch sử thành lộ trình lãi kép.",
    disclaimer:
      "Số liệu dựa trên dữ liệu lịch sử của từng quốc gia (CPI, tỷ giá, lãi suất tiết kiệm, chỉ số chứng khoán, giá vàng), Bitcoin và các cột mốc. Các con số là giá trị danh nghĩa (chưa trừ lạm phát), trừ dòng “Nếu chỉ giữ tiền mặt” đã quy đổi theo CPI, và chỉ tính theo giá (chưa gồm cổ tức tiền mặt); chia tách và cổ phiếu thưởng được tính theo số cổ phiếu ghi trên trang của từng mốc. Có từ 2 nguồn nghĩa là có từ 2 liên kết nguồn, không phải thông tin đã được kiểm chứng hoặc lợi nhuận đã được kiểm toán. Không tính thuế, phí giao dịch, độ trượt thanh khoản. Không phải khuyến nghị đầu tư.",
  },
  en: {
    kicker: "Calculator & Compounding Playbook",
    heading: "If you had invested...",
    intro:
      "Calculate a single asset hold in any of 15 countries, or chain historical milestones into a compounding playbook.",
    disclaimer:
      "Based on each country's historical data (CPI, FX, savings rates, stock indices, gold prices), Bitcoin, and milestones. Figures are nominal (not inflation-adjusted) except the “If you had just held cash” line, which is CPI-adjusted, and price-only (cash dividends excluded); splits and bonus shares are counted using the share multiplier shown on each milestone page. Two or more sources listed means links are provided, not that claims were independently fact-checked or returns audited. Does not account for taxes, fees, or liquidity slippage. Not investment advice.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/whatif">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = COPY[lang];
  return {
    title: copy.heading,
    description: copy.intro,
    alternates: { canonical: `${SITE_URL}/${lang}/whatif`, languages: localeAlternates("/whatif") },
    openGraph: { images: ["/opengraph-image"], title: copy.heading, description: copy.intro, url: `/${lang}/whatif` },
  };
}

export default async function WhatIfPage({ params }: PageProps<"/[lang]/whatif">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const copy = COPY[lang];

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <div className="font-mono text-sm uppercase tracking-widest text-gold">{copy.kicker}</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{copy.heading}</h1>
        <p className="text-lg text-muted">{copy.intro}</p>
      </header>
      <div>
        <Suspense>
          <WhatIfTabs lang={lang} countries={countries} milestones={allMilestonesLite} />
        </Suspense>
      </div>
      <p className="max-w-2xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
