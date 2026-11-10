"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { CharmNavBadge } from "@/components/CharmToggle";

type Labels = Record<"timeline" | "world" | "search" | "almanac" | "whatif" | "simulator" | "quiz", string> & { survival?: string };

const ICONS: Record<string, string> = {
  countries: "📜",
  survival: "🎲",
  world: "🌍",
  search: "🔍",
  almanac: "📊",
  whatif: "💰",
  simulator: "🃏",
  quiz: "❓",
  charm: "🧿",
};

export default function NavLinks({ lang, labels }: { lang: Locale; labels: Labels }) {
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDivElement>(null);
  // Which edges have hidden content: drives the fade mask so a clipped nav is
  // visibly "more to the right", not silently cut off.
  const [edges, setEdges] = useState({ left: false, right: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const items: { href: string; label: string; match: string; icon: string }[] = [
    { href: `/${lang}#countries`, label: labels.timeline, match: `/${lang}`, icon: ICONS.countries },
    { href: `/${lang}/survival`, label: `🎲 ${labels.survival ?? (lang === "vi" ? "Thử thách" : "Survival")}`, match: `/${lang}/survival`, icon: ICONS.survival },
    { href: `/${lang}/world`, label: labels.world, match: `/${lang}/world`, icon: ICONS.world },
    { href: `/${lang}/search`, label: labels.search, match: `/${lang}/search`, icon: ICONS.search },
    { href: `/${lang}/almanac`, label: labels.almanac, match: `/${lang}/almanac`, icon: ICONS.almanac },
    { href: `/${lang}/whatif`, label: labels.whatif, match: `/${lang}/whatif`, icon: ICONS.whatif },
    // ponytail: simulator content is Vietnamese-only for now, so EN users don't get a nav link to a dead end.
    ...(lang === "vi" ? [{ href: `/${lang}/simulator`, label: labels.simulator, match: `/${lang}/simulator`, icon: ICONS.simulator }] : []),
    { href: `/${lang}/quiz`, label: labels.quiz, match: `/${lang}/quiz`, icon: ICONS.quiz },
  ];

  const mask =
    edges.left && edges.right
      ? "linear-gradient(90deg,transparent,#000 2rem,#000 calc(100% - 2.5rem),transparent)"
      : edges.right
        ? "linear-gradient(90deg,#000 calc(100% - 2.5rem),transparent)"
        : edges.left
          ? "linear-gradient(90deg,transparent,#000 2rem)"
          : undefined;

  const isActive = (it: { href: string; match: string }) =>
    it.match === `/${lang}` ? pathname === it.match : pathname.startsWith(it.match);

  return (
    <>
      {/* Mobile hamburger button - visible only on <md screens */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-md hover:bg-raised text-muted hover:text-ink transition-colors"
        aria-label="Menu"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Desktop nav - hidden on mobile, shown on md+ */}
      <div
        ref={ref}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="no-scrollbar -my-1 hidden md:flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto whitespace-nowrap py-1 text-sm text-muted sm:gap-1"
      >
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive(it) ? "page" : undefined}
            className={`shrink-0 rounded-md px-1.5 py-2 transition-colors hover:text-ink ${isActive(it) ? "font-semibold text-gold" : ""}`}
          >
            {it.label}
          </Link>
        ))}
        <span className="w-1 shrink-0" aria-hidden />
        <CharmNavBadge lang={lang} />
      </div>

      {/* Mobile drawer - shown when hamburger clicked */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-bg/95 backdrop-blur flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="font-display text-lg font-bold text-ink">The Reincarnation Checklist</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-raised text-muted hover:text-ink"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive(it) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  isActive(it) ? "bg-gold/15 text-gold" : "text-muted hover:text-ink hover:bg-raised"
                }`}
              >
                <span className="text-xl">{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-line">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Cheat Sheet</span>
              <CharmNavBadge lang={lang} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
