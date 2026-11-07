"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export default function LangSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.split("/").slice(2).join("/");
  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs font-medium">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}`}
          aria-current={l === lang ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            l === lang ? "bg-gold text-on-gold" : "text-muted hover:text-ink"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
