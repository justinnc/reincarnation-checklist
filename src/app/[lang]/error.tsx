"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasLocale } from "@/lib/i18n";

const COPY = {
  vi: { heading: "Có gì đó trục trặc.", body: "Trang này bị lỗi khi hiển thị. Thử tải lại, hoặc quay về trang chủ.", retry: "Thử lại", home: "Về trang chủ" },
  en: { heading: "Something broke.", body: "This page failed to render. Try again, or head back home.", retry: "Try again", home: "Back home" },
};

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const seg = (usePathname() ?? "").split("/")[1];
  const lang = hasLocale(seg) ? seg : "en";
  const c = COPY[lang];
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <div className="font-mono text-sm uppercase tracking-widest text-danger">Error{error.digest ? ` · ${error.digest}` : ""}</div>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{c.heading}</h1>
      <p className="mt-4 text-muted">{c.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold hover:brightness-110">
          {c.retry}
        </button>
        <Link href={`/${lang}`} className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-muted hover:text-ink">
          {c.home}
        </Link>
      </div>
    </section>
  );
}
