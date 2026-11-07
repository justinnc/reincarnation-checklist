import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import CardGameApp from "@/components/cardgame/CardGameApp";

export const metadata: Metadata = { title: "Sổ trọng sinh — Bộ bài 1986" };

const COPY = {
  vi: {
    kicker: "Trò chơi bài · chỉ Việt Nam",
    heading: "Sổ trọng sinh",
    intro: "20 lá bài, mỗi lá là một mốc lịch sử thật. Nhận hoặc bỏ qua — ai biết lịch sử sẽ giàu hơn.",
    disclaimer:
      "Trò chơi bài dựa trên các mốc lịch sử Việt Nam có thật (xem docs/research/simulator-cardgame-redesign.md). Số tiền, tỉ lệ và hệ số trên mỗi lá là số làm tròn cho trò chơi, không phải số liệu tài chính chính xác và không phải khuyến nghị đầu tư.",
  },
  en: {
    kicker: "Card game · Vietnam-only for now",
    heading: "Sổ trọng sinh (The Rebirth Ledger)",
    intro:
      "20 cards, each one a real Vietnamese historical milestone. Accept or skip — knowing your history pays off. Currently Vietnamese-text only.",
    disclaimer:
      "A card game based on real Vietnam historical milestones. Numbers and odds on each card are rounded for gameplay, not precise financial data, and not investment advice.",
  },
};

export default async function SimulatorPage({ params }: PageProps<"/[lang]/simulator">) {
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
      <div className="mx-auto max-w-md">
        <CardGameApp />
      </div>
      <p className="mx-auto max-w-md text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
