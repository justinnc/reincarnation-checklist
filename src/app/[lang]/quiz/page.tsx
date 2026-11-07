import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { allMilestones, countries } from "@/lib/data";
import Quiz from "@/components/Quiz";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({ params }: PageProps<"/[lang]/quiz">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const questions = allMilestones
    .filter((m) => m.quiz)
    .map((m) => ({ id: m.id, country: m.country, date: m.date, title: m.title, quiz: m.quiz! }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">{dict.quiz.heading}</h1>
        <p className="text-lg text-muted">{dict.quiz.intro}</p>
      </header>
      <Quiz questions={questions} countries={countries} lang={lang} dict={dict.quiz} />
    </div>
  );
}
