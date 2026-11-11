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
      "Số liệu dựa trên dữ liệu lịch sử (CPI, tỷ giá, vàng SJC, VN-Index, Bitcoin và các cột mốc). Mọi con số là giá trị danh nghĩa (chưa trừ lạm phát) và chưa điều chỉnh chia tách/cổ tức trừ khi mốc ghi rõ. Có từ 2 nguồn nghĩa là có từ 2 liên kết nguồn, không phải thông tin đã được kiểm chứng hoặc lợi nhuận đã được kiểm toán. Không tính thuế, phí giao dịch, độ trượt thanh khoản. Không phải khuyến nghị đầu tư.",
  },
  en: {
    kicker: "Calculator & Compounding Playbook",
    heading: "If you had invested...",
    intro:
      "Calculate a single asset hold in any of 15 countries, or chain historical milestones into a compounding playbook.",
    disclaimer:
      "Based on historical data (CPI, FX, SJC gold, VN-Index, Bitcoin, and milestones). All figures are nominal (not inflation-adjusted) and not split- or dividend-adjusted unless the milestone says so. Two or more sources listed means links are provided, not that claims were independently fact-checked or returns audited. Does not account for taxes, fees, or liquidity slippage. Not investment advice.",
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
