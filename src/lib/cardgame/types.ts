export type Stake = "quarter" | "half" | "all";
export type CardKind = "memory" | "rumor" | "trap";

export interface CardStat {
  id: string;
  milestoneId: string;
  kind: CardKind;
  year: number;
  icon: string;
  verb: string;
  story: string;
  stake: Stake;
  winIn10: number;
  winMult: number;
  loseMult: number;
  loseWhy: string;
  real?: { winIn10: number; winMult: number; loseMult: number; loseWhy: string; explain: string };
}

export interface EventOption {
  id: "a" | "b" | "c";
  icon: string;
  label: string;
  /** |money| < 1 => fraction of current wallet; otherwise a fixed VND delta. */
  money: number;
  heart: number;
}

export interface EventStat {
  id: string;
  icon: string;
  title: string;
  story: string;
  options: [EventOption, EventOption, EventOption];
}

export type BoardNode =
  | { kind: "single"; year: number; card: CardStat }
  | { kind: "fork"; year: number; left: CardStat; right: CardStat }
  | { kind: "event"; year: number; approx: true; event: EventStat };

export type Choice =
  | { t: "big" }
  | { t: "small" }
  | { t: "rest" }
  | { t: "lane"; side: "left" | "right" }
  | { t: "event"; option: "a" | "b" | "c" };

export type Outcome = "win" | "lose" | "rest" | "event" | "trapAvoided" | "trapHit";

export interface NodeRecord {
  index: number;
  choice: Choice;
  outcome: Outcome;
  usedRecall: boolean;
  before: number;
  after: number;
  heartBefore: number;
  heartAfter: number;
  label: string;
}

export interface GameState {
  v: 3;
  seed: number;
  nodes: BoardNode[];
  index: number;
  wallet: number;
  heart: number;
  recallsLeft: number;
  revealedIds: Set<string>;
  history: NodeRecord[];
  finished: boolean;
  endedBy: null | "finish" | "hospital" | "broke";
}

export const STARTING_CAPITAL = 50_000_000;
export const TOTAL_NODES = 20;
export const STARTING_RECALLS = 3;

export const HEART_MAX = 10;
export const HEART_START = 10;
export const HEART_EXHAUSTED = 3; // heart <= this locks "big" and fork-lanes downgrade to "small"
export const BIG_LOSS_HEART = -2;
export const REST_HEART = 1;
export const HOSPITAL_MULT = 0.5;
export const BROKE_BELOW = 1_000_000;

export const TIERS = [
  { id: "pham_nhan", label: "Phàm nhân", min: 0 },
  { id: "tieu_thuong", label: "Tiểu thương", min: 150_000_000 },
  { id: "trung_luu", label: "Trung lưu", min: 1_000_000_000 },
  { id: "dai_gia", label: "Đại gia", min: 5_000_000_000 },
  { id: "tai_phiet", label: "Tài phiệt", min: 25_000_000_000 },
  { id: "thien_menh", label: "Thiên mệnh chi tử", min: 100_000_000_000 },
] as const;
