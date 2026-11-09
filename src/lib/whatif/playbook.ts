import type { Milestone } from "@/lib/types";

export interface PlaybookCandidate {
  milestone: Milestone;
  startYear: number;
  endYear: number;
  multiple: number;
}

export interface PlaybookStep {
  candidate: PlaybookCandidate;
  capitalBefore: number;
  capitalAfter: number;
  cumulativeMultiple: number;
  overlapsPrevious: boolean;
}

export interface PlaybookResult {
  steps: PlaybookStep[];
  initialCapital: number;
  finalCapital: number;
  totalMultiple: number;
  hasOverlap: boolean;
}

export function parseStartYear(dateStr: string): number {
  const y = Number(dateStr.slice(0, 4));
  return Number.isFinite(y) ? y : 2000;
}

export function parseEndYear(m: Milestone): number {
  const start = parseStartYear(m.date);
  const exit = m.opportunity.exitDate;
  if (exit) {
    const y = Number(exit.slice(0, 4));
    if (Number.isFinite(y) && y >= start) return y;
  }
  return start + 1;
}

export function getPlaybookCandidates(milestones: Milestone[]): PlaybookCandidate[] {
  return milestones
    .filter((m) => (m.opportunity.returnMultiple ?? 0) > 1)
    .map((m) => ({
      milestone: m,
      startYear: parseStartYear(m.date),
      endYear: parseEndYear(m),
      multiple: m.opportunity.returnMultiple!,
    }))
    .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear || b.multiple - a.multiple);
}

export function simulatePlaybook(
  candidates: PlaybookCandidate[],
  selectedIds: string[],
  initialCapital: number,
): PlaybookResult {
  const selectedSet = new Set(selectedIds);
  const ordered = candidates
    .filter((c) => selectedSet.has(c.milestone.id))
    .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear);

  let capital = Math.max(0, initialCapital);
  let cumulativeMultiple = 1;
  let prevEndYear: number | null = null;
  let hasOverlap = false;

  const steps: PlaybookStep[] = ordered.map((c) => {
    const overlapsPrevious = prevEndYear !== null && c.startYear < prevEndYear;
    if (overlapsPrevious) hasOverlap = true;
    const capitalBefore = capital;
    const capitalAfter = capital * c.multiple;
    cumulativeMultiple *= c.multiple;
    capital = capitalAfter;
    prevEndYear = Math.max(prevEndYear ?? c.endYear, c.endYear);
    return {
      candidate: c,
      capitalBefore,
      capitalAfter,
      cumulativeMultiple,
      overlapsPrevious,
    };
  });

  return {
    steps,
    initialCapital,
    finalCapital: capital,
    totalMultiple: cumulativeMultiple,
    hasOverlap,
  };
}

/**
 * Finds the non-overlapping sequence of milestones (next.startYear >= prev.endYear)
 * that maximizes the product of returnMultiples (equivalent to maximizing sum of log(multiple)).
 */
export function findOptimalNonOverlappingChain(candidates: PlaybookCandidate[], maxSteps = 6): string[] {
  if (candidates.length === 0) return [];
  const sorted = [...candidates].sort((a, b) => a.endYear - b.endYear || a.startYear - b.startYear);
  const n = sorted.length;

  // dp[i][k] = best log-multiple using a subset of sorted[0..i] ending at i with length k
  const dp: number[][] = Array.from({ length: n }, () => Array(maxSteps + 1).fill(-Infinity));
  const parent: number[][] = Array.from({ length: n }, () => Array(maxSteps + 1).fill(-1));

  for (let i = 0; i < n; i++) {
    const w = Math.log(sorted[i].multiple);
    dp[i][1] = w;
    for (let j = 0; j < i; j++) {
      if (sorted[j].endYear <= sorted[i].startYear) {
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
