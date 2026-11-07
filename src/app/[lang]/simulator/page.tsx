import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import SimulatorApp from "@/components/sim/SimulatorApp";

export const metadata: Metadata = { title: "Rebirth Simulator" };

const COPY = {
  vi: {
    kicker: "Thử nghiệm — dữ liệu đang được hoàn thiện",
    heading: "Sổ trọng sinh",
    intro: "Chọn năm trọng sinh, phân bổ vốn, và xem bạn giàu đến đâu khi biết trước tương lai.",
    disclaimer: "Trò chơi giải trí/giáo dục dựa trên dữ liệu lịch sử đơn giản hoá — không phải khuyến nghị đầu tư. Một số số liệu giá hiện là DỮ LIỆU TẠM, sẽ sớm được thay bằng số liệu có nguồn kiểm chứng.",
  },
  en: {
    kicker: "Preview — data still being finalized",
    heading: "The Rebirth Ledger",
    intro: "Pick your rebirth year, allocate capital, and see how rich hindsight makes you.",
    disclaimer: "An entertainment/educational game using simplified historical data — not investment advice. Some figures are currently PLACEHOLDER DATA, to be replaced with sourced figures soon.",
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
      <SimulatorApp lang={lang} />
      <p className="max-w-2xl text-xs text-faint">{copy.disclaimer}</p>
    </div>
  );
}
