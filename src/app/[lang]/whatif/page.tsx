import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { localeAlternates, SITE_URL } from "@/lib/seo";
import WhatIfCalculator from "@/components/whatif/WhatIfCalculator";

const COPY = {
  vi: {
    kicker: "Công cụ tính toán",
    heading: "Nếu bạn đã đầu tư...",
    intro: "Chọn một thứ, chọn năm bắt đầu, chọn số tiền — xem hôm nay bạn đáng bao nhiêu. Dùng dữ liệu giá thật của Việt Nam.",
    disclaimer:
      "Số liệu dựa trên dữ liệu lịch sử đã nghiên cứu (CPI, tỷ giá, vàng SJC, VN-Index, Bitcoin — xem docs/research/simulator.md và src/data/whatif/vn.json). Không tính thuế, phí giao dịch, cổ tức. Một số năm là số liệu ước tính/proxy, xem cảnh báo dưới mỗi lựa chọn. Không phải khuyến nghị đầu tư.",
  },
  en: {
    kicker: "Calculator",
    heading: "If you had invested...",
    intro: "Pick an asset, a starting year, and an amount — see what it would be worth today, using real Vietnam price data.",
    disclaimer:
      "Based on researched historical data (CPI, FX, SJC gold, VN-Index, Bitcoin). Does not account for taxes, fees, or dividends. Some years are estimated/proxy data, flagged under each option. Not investment advice.",
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
      <div className="mx-auto max-w-xl">
        <Suspense>
          <WhatIfCalculator lang={lang} />
        </Suspense>
      </div>
      <p className="mx-auto max-w-xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
