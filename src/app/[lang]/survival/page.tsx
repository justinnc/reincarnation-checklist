import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "@/lib/i18n";
import { countries } from "@/lib/data";
import SurvivalGame from "@/components/survival/SurvivalGame";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const isVi = lang === "vi";
  return {
    title: isVi
      ? "Thử Thách Sống Sót Trọng Sinh | Cẩm Nang Trọng Sinh"
      : "Reincarnation Survival Run | The Reincarnation Checklist",
    description: isVi
      ? "Vòng quay ngẫu nhiên và minigame sống sót qua 5 ngã rẽ lịch sử. Bắt đầu với $1.000, bạn có thành tỷ phú hay phá sản trắng tay?"
      : "Roulette roll your starting identity and survive 5 historical market turning points with $1,000. Will you become a tycoon or go broke?",
  };
}

export default async function SurvivalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted">
          {lang === "vi" ? "Đang kết nối cánh cổng thời gian..." : "Connecting to the time portal..."}
        </div>
      }
    >
      <SurvivalGame lang={lang as Locale} countries={countries} />
    </Suspense>
  );
}
