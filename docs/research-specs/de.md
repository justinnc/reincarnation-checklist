Project: 'The Reincarnation Checklist' website. Premise: a person is reborn into the past with all memories of the future. The site lists historical milestones per country that such a person could exploit to make money (what to buy, when to buy, when to sell/avoid, estimated return). Entertainment/education, not financial advice.

YOUR JOB: produce ~20-24 high-quality milestones for GERMANY, period 1980-2025, spread across decades and categories (stocks, crypto, real-estate, technology, business, macro, commodities). Include both big winners AND famous disasters to avoid/short (the play can be 'sell before', 'short', or 'avoid'). Starting ideas (verify; choose the best, add others): Reunification 1990, Deutsche Telekom 'people's share' IPO 1996, Neuer Markt bubble 1997-2003 (sell before crash), euro launch 1999/2002, SAP long-term, Porsche-VW short squeeze Oct 2008, Wirecard fraud 2020 (short), Rheinmetall rally after Feb 2022, DAX lows 2003/2009/2020, Berlin real estate after 2009, Adidas/Puma.

FACT-CHECKING IS MANDATORY: use web_search + web_extract to confirm each date and every number (IPO/listing prices, split-adjusted prices, index levels, FX rates). Prefer Wikipedia, official exchange/company investor-relations pages, central banks, Reuters/Bloomberg/FT/Nikkei/major national press. Set "verified": true ONLY if a source you actually fetched confirms the date and key numbers; otherwise false with explanation in verifiedNote. Never invent numbers; omit optional numeric fields rather than guess. entryPrice/exitPrice must be the price of ONE unit (share, coin, index point, ounce) in the same adjusted basis — never put 'value of $100 invested' into price fields. returnMultiple must equal exitPrice/entryPrice when both are given.

OUTPUT: JSON array (UTF-8, ensure_ascii=False, indent 2) written with Python to /Users/justindang/reincarnation-checklist/data-staging/de.json (create dir). Load it back and validate every object against the schema (required keys, vi+en non-empty in every localized text, category allowed, date format, quiz answer index valid, ids unique, returnMultiple consistency). Fix until valid. Do not touch other files in the repo.

SCHEMA per milestone (LocalizedText = {"vi": string, "en": string}):
{
  "id": "de-<kebab-slug>",
  "country": "de",
  "date": "YYYY-MM-DD" (or "YYYY-MM"/"YYYY" if exact day unknown),
  "category": "stocks"|"crypto"|"real-estate"|"technology"|"business"|"macro"|"commodities",
  "title": LocalizedText (max ~50 chars),
  "summary": LocalizedText (one punchy sentence, max ~140 chars),
  "description": LocalizedText (2-4 sentences, concrete facts and numbers),
  "opportunity": {
    "asset": "e.g. 'Toyota (7203.T)' / 'Nikkei 225' / 'Gold'",
    "action": LocalizedText, "buyWhen": LocalizedText, "sellWhen": LocalizedText (optional),
    "estimatedReturn": LocalizedText,
    "returnMultiple": number (optional, only if verifiable),
    "entryPrice": number (optional), "exitPrice": number (optional),
    "priceCurrency": "EUR" | "USD" | "points" (required if entryPrice given),
    "exitDate": "YYYY-MM-DD or YYYY-MM or YYYY" (optional),
    "risk": "low"|"medium"|"high", "capital": "low"|"medium"|"high"
  },
  "insiderTip": LocalizedText (what ONLY a time traveler knows),
  "pitfalls": LocalizedText (traps / what could go wrong),
  "quiz": { "question": LocalizedText, "choices": [LocalizedText x4], "answer": 0-3, "explanation": LocalizedText },
  "sources": [{"title": "...", "url": "https://..."}] (1-3 real URLs you fetched),
  "verified": boolean,
  "verifiedNote": "short English note: what was confirmed and from where"
}

Vietnamese text must be natural Vietnamese with full diacritics (site owner is Vietnamese); proper nouns may stay in original/English form. Use typographic quotes “ ” not straight double quotes inside text. Vary the quiz answer index across 0-3.

FINAL ANSWER: count, verified true/false counts, list of ids, and facts you could not confirm.