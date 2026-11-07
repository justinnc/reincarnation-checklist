import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import LangSwitch from "@/components/LangSwitch";
import "../globals.css";

const text = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--nf-text" });
const display = Bricolage_Grotesque({ subsets: ["latin", "vietnamese"], weight: ["600", "700", "800"], variable: "--nf-display" });
const mono = JetBrains_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], variable: "--nf-mono" });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: { default: dict.site.name, template: `%s · ${dict.site.name}` }, description: dict.site.tagline };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${text.variable} ${display.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <nav className="mx-auto flex max-w-[1120px] items-center gap-6 px-4 py-4">
            <Link href={`/${lang}`} className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-on-gold">✓</span>
              <span className="hidden sm:inline">{dict.site.name}</span>
            </Link>
            <div className="flex items-center gap-5 text-sm text-muted">
              <Link href={`/${lang}/vn`} className="hover:text-ink">🇻🇳</Link>
              <Link href={`/${lang}/us`} className="hover:text-ink">🇺🇸</Link>
              <Link href={`/${lang}/quiz`} className="hover:text-ink">{dict.nav.quiz}</Link>
            </div>
            <div className="ml-auto">
              <LangSwitch lang={lang} />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-display text-2xl font-extrabold">{dict.site.name}</div>
              <p className="mt-1 max-w-md text-sm text-muted">{dict.site.tagline}</p>
            </div>
            <p className="max-w-sm text-xs text-faint">{dict.site.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
