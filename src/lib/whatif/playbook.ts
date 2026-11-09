import type { Milestone } from "@/lib/types";

const SPECULATIVE_OR_PRIVATE_IDS = new Set([
  "vn-louis-holdings-tgg-manipulation-2021",
  "vn-lan-dot-bien-bubble-2020",
  "vn-vinfast-nasdaq-2023",
  "us-bitcoin-pizza-day-2010",
  "us-peter-thiel-facebook-seed-2004",
  "us-apple-ronald-wayne-stake-1980",
  "us-gamestop-squeeze-2021",
  "th-more-return-stock-corner-2022",
]);

/**
 * Some milestones are cataloged by their peak/catalyst date rather than the
 * accumulation start date described in buyWhen. Map their true capital-lockup
 * start date so compounding chains cannot treat a 2-year rally as a 0-month trade.
 */
const ENTRY_DATE_OVERRIDES: Record<string, string> = {
  "vn-vnindex-peak-2007": "2005-01",
  "vn-vnindex-1200-peak-2018": "2017-01",
  "vn-thu-thiem-land-auction-2021": "2020-10",
  "us-gamestop-squeeze-2021": "2020-08",
  "de-biontech-covid-vaccine-rally-2020": "2019-10",
};

export function isSpeculativeOrPrivate(m: Milestone): boolean {
  if (SPECULATIVE_OR_PRIVATE_IDS.has(m.id)) return true;
  const text = `${m.id} ${m.title.en}`.toLowerCase();
  return text.includes("manipulation") || text.includes("ponzi") || text.includes("seed");
}

export interface PlaybookCandidate {
  milestone: Milestone;
  startYear: number;
  endYear: number;
  startYM: number;
  endYM: number;
  periodLabel: string;
  multiple: number;
  speculative: boolean;
}

export interface PlaybookStep {
  candidate: PlaybookCandidate;
  capitalBefore: number;
  deployedCapital: number;
  capitalAfter: number;
  cumulativeMultiple: number;
  overlapsPrevious: boolean;
  cappedByLiquidity: boolean;
}

export interface PlaybookResult {
  steps: PlaybookStep[];
  initialCapital: number;
  finalCapital: number;
  totalMultiple: number;
  hasOverlap: boolean;
  hasLiquidityCap: boolean;
}

export function effectiveEntryDate(m: Milestone): string {
  return ENTRY_DATE_OVERRIDES[m.id] ?? m.date;
}

export function parseStartYear(dateStr: string): number {
  const y = Number(dateStr.slice(0, 4));
  return Number.isFinite(y) ? y : 2000;
}

export function parseYM(dateStr: string, defaultMonth: number): number {
  const y = parseStartYear(dateStr);
  const mPart = dateStr.length >= 7 ? Number(dateStr.slice(5, 7)) : defaultMonth;
  const m = Number.isFinite(mPart) && mPart >= 1 && mPart <= 12 ? mPart : defaultMonth;
  return y * 12 + (m - 1);
}

export function parseEndYear(m: Milestone): number {
  const start = parseStartYear(effectiveEntryDate(m));
  const exit = m.opportunity.exitDate;
  if (exit) {
    const y = Number(exit.slice(0, 4));
    if (Number.isFinite(y) && y >= start) return y;
  }
  return Math.max(start + 1, 2025);
}

export function parseEndYM(m: Milestone): number {
  const startYM = parseYM(effectiveEntryDate(m), 1);
  const exit = m.opportunity.exitDate;
  if (exit) {
    const ym = parseYM(exit, 12);
    if (ym >= startYM) return ym;
  }
  return Math.max(startYM + 12, 2025 * 12 + 11);
}

export function getPlaybookCandidates(milestones: Milestone[]): PlaybookCandidate[] {
  return milestones
    .filter((m) => (m.opportunity.returnMultiple ?? 0) > 1)
    .map((m) => {
      const entryRaw = effectiveEntryDate(m);
      const startYear = parseStartYear(entryRaw);
      const endYear = parseEndYear(m);
      const startYM = parseYM(entryRaw, 1);
      const endYM = parseEndYM(m);
      const startStr = entryRaw.length >= 7 ? entryRaw.slice(0, 7) : String(startYear);
      const exitRaw = m.opportunity.exitDate;
      const endStr = exitRaw ? (exitRaw.length >= 7 ? exitRaw.slice(0, 7) : String(endYear)) : String(endYear);
      return {
        milestone: m,
        startYear,
        endYear,
        startYM,
        endYM,
        periodLabel: `${startStr}→${endStr}`,
        multiple: m.opportunity.returnMultiple!,
        speculative: isSpeculativeOrPrivate(m),
      };
    })
    .sort((a, b) => a.startYM - b.startYM || a.endYM - b.endYM || b.multiple - a.multiple);
}

function maxDeployableFor(c: PlaybookCandidate, stakeUnit: number): number {
  if (c.speculative) return stakeUnit * 10;
  const capLevel = c.milestone.opportunity.capital;
  if (capLevel === "low") return stakeUnit * 50;
  if (capLevel === "medium") return stakeUnit * 500;
  return stakeUnit * 5000;
}

export function simulatePlaybook(
  candidates: PlaybookCandidate[],
  selectedIds: string[],
  initialCapital: number,
  options?: { realistic?: boolean; stakeUnit?: number },
): PlaybookResult {
  const realistic = options?.realistic ?? false;
  const stakeUnit = options?.stakeUnit ?? Math.max(1, initialCapital);
  const selectedSet = new Set(selectedIds);
  const ordered = candidates
    .filter((c) => selectedSet.has(c.milestone.id))
    .sort((a, b) => a.startYM - b.startYM || a.endYM - b.endYM);

  let capital = Math.max(0, initialCapital);
  let prevEndYM: number | null = null;
  let hasOverlap = false;
  let hasLiquidityCap = false;

  const steps: PlaybookStep[] = ordered.map((c) => {
    const overlapsPrevious = prevEndYM !== null && c.startYM <= prevEndYM;
    if (overlapsPrevious) hasOverlap = true;
    const capitalBefore = capital;
    let deployedCapital = capital;
    let cappedByLiquidity = false;
    if (realistic) {
      const capLimit = maxDeployableFor(c, stakeUnit);
      if (capital > capLimit) {
        deployedCapital = capLimit;
        cappedByLiquidity = true;
        hasLiquidityCap = true;
      }
    }
    const uninvested = capital - deployedCapital;
    const capitalAfter = deployedCapital * c.multiple + uninvested;
    capital = capitalAfter;
    prevEndYM = Math.max(prevEndYM ?? c.endYM, c.endYM);
    const cumulativeMultiple = initialCapital > 0 ? capitalAfter / initialCapital : 1;
    return {
      candidate: c,
      capitalBefore,
      deployedCapital,
      capitalAfter,
      cumulativeMultiple,
      overlapsPrevious,
      cappedByLiquidity,
    };
  });

  const totalMultiple = initialCapital > 0 ? capital / initialCapital : 1;
  return {
    steps,
    initialCapital,
    finalCapital: capital,
    totalMultiple,
    hasOverlap,
    hasLiquidityCap,
  };
}

export function findOptimalNonOverlappingChain(
  candidates: PlaybookCandidate[],
  maxSteps = 5,
  options?: { realisticOnly?: boolean; fromYear?: number },
): string[] {
  const realisticOnly = options?.realisticOnly ?? false;
  const fromYear = options?.fromYear;
  const pool = candidates.filter((c) => {
    if (realisticOnly && c.speculative) return false;
    if (fromYear !== undefined && c.startYear < fromYear) return false;
    return true;
  });
  if (pool.length === 0) return [];
  const sorted = [...pool].sort((a, b) => a.endYM - b.endYM || a.startYM - b.startYM);
  const n = sorted.length;

  const dp: number[][] = Array.from({ length: n }, () => Array(maxSteps + 1).fill(-Infinity));
  const parent: number[][] = Array.from({ length: n }, () => Array(maxSteps + 1).fill(-1));

  for (let i = 0; i < n; i++) {
    const w = Math.log(sorted[i].multiple);
    dp[i][1] = w;
    for (let j = 0; j < i; j++) {
      if (sorted[j].endYM < sorted[i].startYM) {
        for (let k = 2; k <= maxSteps; k++) {
          if (dp[j][k - 1] > -Infinity && dp[j][k - 1] + w > dp[i][k]) {
            dp[i][k] = dp[j][k - 1] + w;
            parent[i][k] = j;
          }
        }
      }
    }
  }

  let bestI = 0;
  let bestK = 1;
  let bestScore = -Infinity;
  for (let i = 0; i < n; i++) {
    for (let k = 1; k <= maxSteps; k++) {
      if (dp[i][k] > bestScore) {
        bestScore = dp[i][k];
        bestI = i;
        bestK = k;
      }
    }
  }

  const chain: string[] = [];
  let curI = bestI;
  let curK = bestK;
  while (curI !== -1 && curK >= 1) {
    chain.push(sorted[curI].milestone.id);
    const prevI = parent[curI][curK];
    curI = prevI;
    curK--;
  }
  return chain.reverse();
}

export function findOptimalChainIncluding(
  candidates: PlaybookCandidate[],
  pinId: string,
  maxSteps = 5,
  options?: { realisticOnly?: boolean },
): string[] {
  const pin = candidates.find((c) => c.milestone.id === pinId);
  if (!pin) return findOptimalNonOverlappingChain(candidates, maxSteps, options);
  const beforePool = candidates.filter((c) => c.endYM < pin.startYM);
  const afterPool = candidates.filter((c) => c.startYM > pin.endYM);
  const beforeChain = findOptimalNonOverlappingChain(beforePool, Math.max(1, Math.floor((maxSteps - 1) / 2)), options);
  const remaining = Math.max(1, maxSteps - 1 - beforeChain.length);
  const afterChain = findOptimalNonOverlappingChain(afterPool, remaining, options);
  return [...beforeChain, pinId, ...afterChain];
}
