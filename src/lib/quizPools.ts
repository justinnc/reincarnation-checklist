/**
 * Editorial "famous names" pool for the quiz: questions about globally known brands and
 * moments that a casual player can answer without market knowledge. Picks only, no new
 * facts: every question and answer still comes from the milestone's own sourced quiz.
 */
export const EASY_QUIZ_IDS: readonly string[] = [
  "us-bitcoin-pizza-day-2010",
  "us-iphone-launch-2007",
  "us-apple-jobs-return-1997",
  "us-gamestop-squeeze-2021",
  "us-starbucks-ipo-1992",
  "us-google-ipo-2004",
  "us-peter-thiel-facebook-seed-2004",
  "jp-sony-playstation-1994",
  "jp-nintendo-pokemon-go-spike-2016",
  "jp-fast-retailing-uniqlo-listing-1994",
  "fr-lvmh-formation-1987",
  "it-ferrari-ipo-2015",
  "ca-bitcoin-atm-vancouver-2013",
  "cn-beijing-olympics-2008",
  "vn-ridehailing-grab-2014",
  "vn-ecommerce-boom",
];

const EASY = new Set(EASY_QUIZ_IDS);

/** Pool codes: "all", "easy", or a country code. */
export function inQuizPool(q: { id: string; country: string }, pool: string): boolean {
  if (pool === "all") return true;
  if (pool === "easy") return EASY.has(q.id);
  return q.country === pool;
}
