import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { allMilestones, countries } from "@/lib/data";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import WhatIfTabs from "@/components/whatif/WhatIfTabs";

const COPY = {
  vi: {
    kicker: "Công cụ tính toán & Lộ trình lãi kép",
    heading: "Nếu bạn đã đầu tư...",
    intro:
      "Tính lợi nhuận 1 tài sản tại Việt Nam hoặc tự ghép Chuỗi Trọng Sinh Liên Hoàn qua 15 quốc gia để xem vốn nhân lên bao nhiêu lần.",
    disclaimer:
      "Số liệu dựa trên dữ liệu lịch sử đã nghiên cứu (CPI, tỷ giá, vàng SJC, VN-Index, Bitcoin và 328 cột mốc lịch sử). Không tính thuế, phí giao dịch, độ trượt thanh khoản. Không phải khuyến nghị đầu tư.",
  },
  en: {
    kicker: "Calculator & Compounding Playbook",
    heading: "If you had invested...",
    intro:
      "Calculate a single Vietnam asset hold or chain multiple historical milestones across 15 countries into a compounding playbook.",
    disclaimer:
      "Based on researched historical data (CPI, FX, SJC gold, VN-Index, Bitcoin, and 328 historical milestones). Does not account for taxes, fees, or liquidity slippage. Not investment advice.",
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
          <WhatIfTabs lang={lang} countries={countries} milestones={allMilestones} />
        </Suspense>
      </div>
      <p className="max-w-2xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
