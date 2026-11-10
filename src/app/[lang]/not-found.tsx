"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasLocale } from "@/lib/i18n";

const COPY = {
  vi: { kicker: "404", heading: "Mốc này chưa tồn tại trong dòng thời gian.", body: "Có thể đường dẫn sai, hoặc mốc đã được đổi tên.", home: "Về trang chủ", search: "Tìm mốc" },
  en: { kicker: "404", heading: "This moment isn't on the timeline.", body: "The link may be wrong, or the milestone was renamed.", home: "Back home", search: "Search milestones" },
};

export default function NotFound() {
  const seg = (usePathname() ?? "").split("/")[1];
  const lang = hasLocale(seg) ? seg : "en";
  const c = COPY[lang];
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <div className="font-mono text-sm uppercase tracking-widest text-gold">{c.kicker}</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{c.heading}</h1>
      <p className="mt-4 text-muted">{c.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${lang}`} className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold hover:brightness-110">
          {c.home}
        </Link>
        <Link href={`/${lang}/search`} className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-muted hover:text-ink">
          {c.search}
        </Link>
      </div>
    </section>
  );
}
