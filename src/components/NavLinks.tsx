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

type Item = { href: string; label: string; match: string; icon: string; primary: boolean };

export default function NavLinks({ lang, labels }: { lang: Locale; labels: Labels }) {
  const pathname = usePathname() ?? "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Open state is tied to the path it was opened on, so navigating closes it without an effect.
  const [moreOpenedAt, setMoreOpenedAt] = useState<string | null>(null);
  const isMoreOpen = moreOpenedAt === pathname;
  const setIsMoreOpen = (open: boolean) => setMoreOpenedAt(open ? pathname : null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close the "More" menu on outside click, Escape, or navigation.
  useEffect(() => {
    if (!isMoreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setIsMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMoreOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMoreOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- setter is a stable wrapper

  // Primary items stay inline on desktop; the rest live under "More" so long
  // Vietnamese labels can never be clipped behind the language switch.
  const items: Item[] = [
    { href: `/${lang}#countries`, label: labels.timeline, match: `/${lang}`, icon: ICONS.countries, primary: true },
    { href: `/${lang}/survival`, label: labels.survival ?? (lang === "vi" ? "Thử thách" : "Survival"), match: `/${lang}/survival`, icon: ICONS.survival, primary: true },
    { href: `/${lang}/whatif`, label: labels.whatif, match: `/${lang}/whatif`, icon: ICONS.whatif, primary: true },
    { href: `/${lang}/quiz`, label: labels.quiz, match: `/${lang}/quiz`, icon: ICONS.quiz, primary: true },
    { href: `/${lang}/world`, label: labels.world, match: `/${lang}/world`, icon: ICONS.world, primary: false },
    { href: `/${lang}/almanac`, label: labels.almanac, match: `/${lang}/almanac`, icon: ICONS.almanac, primary: false },
    { href: `/${lang}/search`, label: labels.search, match: `/${lang}/search`, icon: ICONS.search, primary: false },
    // ponytail: simulator content is Vietnamese-only for now, so EN users don't get a nav link to a dead end.
    ...(lang === "vi" ? [{ href: `/${lang}/simulator`, label: labels.simulator, match: `/${lang}/simulator`, icon: ICONS.simulator, primary: false }] : []),
  ];
  const primary = items.filter((it) => it.primary);
  const secondary = items.filter((it) => !it.primary);

  const isActive = (it: { href: string; match: string }) =>
    it.match === `/${lang}` ? pathname === it.match : pathname.startsWith(it.match);
  const moreActive = secondary.some(isActive);
  const moreLabel = lang === "vi" ? "Thêm" : "More";

  return (
    <>
      {/* Mobile/tablet hamburger button - visible below lg */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden ml-auto flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
        aria-label={lang === "vi" ? "Mở menu" : "Menu"}
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

      {/* Desktop nav - lg+ */}
      <div className="hidden lg:flex min-w-0 flex-1 items-center gap-1 whitespace-nowrap text-sm text-muted">
        {primary.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={isActive(it) ? "page" : undefined}
            className={`shrink-0 rounded-md px-2.5 py-2.5 transition-colors hover:text-ink ${isActive(it) ? "font-semibold text-gold" : ""}`}
          >
            {it.label}
          </Link>
        ))}
        <div ref={moreRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            aria-expanded={isMoreOpen}
            aria-haspopup="true"
            className={`flex items-center gap-1 rounded-md px-2.5 py-2.5 transition-colors hover:text-ink ${moreActive ? "font-semibold text-gold" : ""}`}
          >
            {moreLabel}
            <svg className={`h-4 w-4 transition-transform ${isMoreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isMoreOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
              {secondary.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setIsMoreOpen(false)}
                  aria-current={isActive(it) ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive(it) ? "bg-gold/15 font-semibold text-gold" : "text-muted hover:bg-raised hover:text-ink"
                  }`}
                >
                  <span aria-hidden>{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <CharmNavBadge lang={lang} />
      </div>

      {/* Mobile drawer - shown when hamburger clicked */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-bg/95 backdrop-blur flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="font-display text-lg font-bold text-ink">The Reincarnation Checklist</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-ink"
              aria-label={lang === "vi" ? "Đóng menu" : "Close menu"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-2" aria-label={lang === "vi" ? "Điều hướng" : "Mobile navigation"}>
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
        </div>
      )}
    </>
  );
}
