import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import "../globals.css";

const font = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-main",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.site.name, description: dict.site.tagline };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-white/10">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
            <Link href={`/${lang}`} className="font-bold tracking-tight">
              ⏳ {dict.site.name}
            </Link>
            <Link href={`/${lang}/quiz`} className="text-sm opacity-70 hover:opacity-100">
              {dict.nav.quiz}
            </Link>
            <div className="ml-auto flex gap-2 text-sm">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  className={`rounded px-2 py-1 uppercase ${l === lang ? "bg-amber-400 text-black" : "opacity-60 hover:opacity-100"}`}
                >
                  {l}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-white/10 py-6 text-center text-xs opacity-60">
          {dict.site.disclaimer}
        </footer>
      </body>
    </html>
  );
}

