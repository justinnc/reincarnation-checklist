"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { locales, type Locale } from "@/lib/i18n";

/** Same page in the other language, keeping ?query and #hash so shared playbook/result links survive the toggle. */
export default function LangSwitch({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={<Pills lang={lang} query="" />}>
      <WithQuery lang={lang} />
    </Suspense>
  );
}

function WithQuery({ lang }: { lang: Locale }) {
  const query = useSearchParams().toString();
  return <Pills lang={lang} query={query} />;
}

function Pills({ lang, query }: { lang: Locale; query: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.split("/").slice(2).join("/");
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);
  const suffix = `${query ? `?${query}` : ""}${hash}`;

  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs font-medium">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest ? `/${rest}` : ""}${suffix}`}
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
