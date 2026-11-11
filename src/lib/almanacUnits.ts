/** Turn a price unit like "USD/gallon" or "EUR per Maß (1 litre)" into the thing you can buy
 *  ("gallons", "Maß (1 litre)"), so "671 × USD/gallon" reads as "671 gallons". */
export function quantityLabel(unit: string, units: number, lang: "en" | "vi"): string {
  const m = unit.match(/^(.*?)(?:\s*\/\s*|\s+per\s+)(.+)$/i);
  if (!m) return "";
  const thing = m[2].trim();
  if (lang === "vi" || units <= 1) return thing;
  // Pluralise the head noun (before any parenthesis) in English; leave codes/symbols alone.
  const [, head, tail = ""] = thing.match(/^([^()]*?)(\s*\(.*)?$/) ?? [, thing, ""];
  const words = head.split(" ");
  const last = words[words.length - 1];
  if (/^[A-Z]{2,}$/.test(last) || /[²³]$/.test(last) || /s$/i.test(last)) return thing;
  words[words.length - 1] = /[^aeiou]y$/i.test(last) ? last.slice(0, -1) + "ies" : last + "s";
  return words.join(" ") + tail;
}
