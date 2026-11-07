import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export default async function QuizPage({ params }: PageProps<"/[lang]/quiz">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <div className="space-y-3 py-16 text-center">
      <div className="text-5xl">🎮</div>
      <h1 className="text-2xl font-bold">{dict.quiz.heading}</h1>
      <p className="opacity-70">{dict.quiz.comingSoon}</p>
    </div>
  );
}

