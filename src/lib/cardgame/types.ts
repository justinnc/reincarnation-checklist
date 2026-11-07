export type Stake = "quarter" | "half" | "all";
export type CardKind = "memory" | "rumor" | "trap";

export interface CardStat {
  id: string;
  /** Links to src/data/milestones/vn.json for title/summary/insiderTip/pitfalls/sources. */
  milestoneId: string;
  kind: CardKind;
  year: number;
  icon: string;
  /** Short verb-first action line, e.g. "Mua đất đầm lầy Nam Sài Gòn". */
  verb: string;
  /** One-line flavor/story, ≤1 sentence. */
  story: string;
  stake: Stake;
  /** Odds out of 10 of the GOOD outcome, as printed on the card face. */
  winIn10: number;
  winMult: number;
  loseMult: number;
  /** Short reason for the bad outcome, e.g. "kẹt vốn, phải bán lỗ". */
  loseWhy: string;
  /** For trap cards only: the REAL odds/outcome, revealed by 💡 or after choosing. */
  real?: { winIn10: number; winMult: number; loseMult: number; loseWhy: string; explain: string };
}

export interface EventStat {
  id: string;
  icon: string;
  title: string;
  story: string;
  /** Fixed nominal VND delta (can be negative). */
  delta: number;
}

export type Turn =
  | { kind: "single"; card: CardStat }
  | { kind: "fork"; left: CardStat; right: CardStat }
  | { kind: "event"; event: EventStat };

export type Choice =
  | { t: "accept" }
  | { t: "skip" }
  | { t: "pickLeft" }
  | { t: "pickRight" }
  | { t: "skipBoth" }
  | { t: "ack" };

export interface TurnRecord {
  turnIndex: number;
  outcome: "win" | "lose" | "skip" | "event" | "trapAvoided" | "trapHit";
  usedRecall: boolean;
  before: number;
  after: number;
  label: string;
}

export interface GameState {
  v: 2;
  seed: number;
  turns: Turn[];
  turnIndex: number;
  wallet: number;
  recallsLeft: number;
  revealedTrapIds: Set<string>;
  history: TurnRecord[];
  finished: boolean;
}

export const STARTING_CAPITAL = 50_000_000;
export const TOTAL_TURNS = 20;
export const STARTING_RECALLS = 3;

export const TIERS = [
  { id: "pham_nhan", label: "Phàm nhân", min: 0 },
  { id: "tieu_thuong", label: "Tiểu thương", min: 150_000_000 },
  { id: "trung_luu", label: "Trung lưu", min: 1_000_000_000 },
  { id: "dai_gia", label: "Đại gia", min: 5_000_000_000 },
  { id: "tai_phiet", label: "Tài phiệt", min: 25_000_000_000 },
  { id: "thien_menh", label: "Thiên mệnh chi tử", min: 100_000_000_000 },
] as const;
