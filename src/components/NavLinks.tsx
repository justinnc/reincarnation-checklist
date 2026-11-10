"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { CharmNavBadge } from "@/components/CharmToggle";

type Labels = Record<"timeline" | "world" | "search" | "almanac" | "whatif" | "simulator" | "quiz", string>;

export default function NavLinks({ lang, labels }: { lang: Locale; labels: Labels }) {
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDivElement>(null);
  // Which edges have hidden content: drives the fade mask so a clipped nav is
  // visibly "more to the right", not silently cut off.
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const items: { href: string; label: string; match: string }[] = [
    { href: `/${lang}#countries`, label: labels.timeline, match: `/${lang}` },
    { href: `/${lang}/world`, label: labels.world, match: `/${lang}/world` },
    { href: `/${lang}/search`, label: labels.search, match: `/${lang}/search` },
    { href: `/${lang}/almanac`, label: labels.almanac, match: `/${lang}/almanac` },
    { href: `/${lang}/whatif`, label: labels.whatif, match: `/${lang}/whatif` },
    // ponytail: simulator content is Vietnamese-only for now, so EN users don't get a nav link to a dead end.
    ...(lang === "vi" ? [{ href: `/${lang}/simulator`, label: labels.simulator, match: `/${lang}/simulator` }] : []),
    { href: `/${lang}/quiz`, label: labels.quiz, match: `/${lang}/quiz` },
  ];

  const mask =
    edges.left && edges.right
      ? "linear-gradient(90deg,transparent,#000 2rem,#000 calc(100% - 2.5rem),transparent)"
      : edges.right
        ? "linear-gradient(90deg,#000 calc(100% - 2.5rem),transparent)"
        : edges.left
          ? "linear-gradient(90deg,transparent,#000 2rem)"
          : undefined;

  return (
    <div
      ref={ref}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className="no-scrollbar -my-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto whitespace-nowrap py-1 text-sm text-muted sm:gap-1"
    >
      {items.map((it) => {
        const active = it.match === `/${lang}` ? pathname === it.match : pathname.startsWith(it.match);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-md px-1.5 py-2 transition-colors hover:text-ink ${active ? "font-semibold text-gold" : ""}`}
          >
            {it.label}
          </Link>
        );
      })}
      <span className="w-1 shrink-0" aria-hidden />
      <CharmNavBadge lang={lang} />
    </div>
  );
}
