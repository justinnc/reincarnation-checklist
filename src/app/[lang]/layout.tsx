import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SITE_URL, localeAlternates } from "@/lib/seo";
import LangSwitch from "@/components/LangSwitch";
import NavLinks from "@/components/NavLinks";
import "../globals.css";

const text = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--nf-text" });
const display = Bricolage_Grotesque({ subsets: ["latin", "vietnamese"], weight: ["700", "800"], variable: "--nf-display" });
const mono = JetBrains_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "600", "700"], variable: "--nf-mono" });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.site.name, template: `%s · ${dict.site.name}` },
    description: dict.site.tagline,
    alternates: { canonical: `${SITE_URL}/${lang}`, languages: localeAlternates("") },
    openGraph: { images: ["/opengraph-image"],
      type: "website",
      siteName: dict.site.name,
      title: dict.site.name,
      description: dict.site.tagline,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      url: `${SITE_URL}/${lang}`,
    },
    twitter: { card: "summary_large_image", title: dict.site.name, description: dict.site.tagline },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${text.variable} ${display.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <nav aria-label="Main" className="mx-auto flex max-w-[1120px] items-center gap-3 px-4 py-2 sm:gap-5 sm:py-3">
            <Link href={`/${lang}`} aria-label={dict.site.name} className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-on-gold">✓</span>
              <span className="hidden xl:inline">{dict.site.name}</span>
            </Link>
            <NavLinks lang={lang} labels={dict.nav} />
            <div className="shrink-0">
              <LangSwitch lang={lang} />
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1120px] flex-1 overflow-x-clip px-4 py-6 sm:py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-display text-2xl font-extrabold">{dict.site.name}</div>
              <p className="mt-1 max-w-md text-sm text-muted">{dict.site.tagline}</p>
            </div>
            <div className="max-w-sm space-y-1 text-xs text-faint">
              <p>{dict.site.disclaimer}</p>
              <div className="flex items-center gap-3 pt-1">
                <Link href={`/${lang}/methodology`} className="inline-block underline decoration-line-strong underline-offset-4 hover:text-gold">
                  {dict.nav.methodology}
                </Link>
                <span>·</span>
                <Link href={`/${lang}/disclaimer`} className="inline-block underline decoration-line-strong underline-offset-4 hover:text-gold">
                  {dict.nav.disclaimer}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
