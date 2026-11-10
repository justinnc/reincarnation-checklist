import { allMilestones, countries, getCountry, yearOf } from "./data";
import type { Locale } from "./i18n";
import type { Country, Milestone } from "./types";

export interface SurvivalRound {
  roundIndex: number;
  milestone: Milestone;
  isTrap: boolean;
  rawMultiple: number;
  cappedMultiple: number;
  year: number;
  /** Assumed annual game rate, NOT historical CPI. */
  inflationRate?: number;
  /** Holding period until the next round; final round = 0. */
  yearGap?: number;
}

export interface SurvivalRun {
  id: string;
  country: Country;
  startYear: number;
  initialCapital: number;
  rounds: SurvivalRound[];
}

export type DecisionType = "all_in" | "cautious" | "skip";

export interface DecisionResult {
  roundIndex: number;
  round: SurvivalRound;
  decision: DecisionType;
  prevNetWorth: number;
  newNetWorth: number;
  multiplierEffect: number;
  headline: { en: string; vi: string };
  feedback: { en: string; vi: string };
  isSuccess: boolean;
  inflationLoss: number;
}

export interface SurvivalRank {
  tier: string;
  badge: string;
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  emoji: string;
}

/** Shuffles an array in place and returns it */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateSurvivalRun(
  preferredCountry?: string,
  preferredYear?: number
): SurvivalRun {
  let country = preferredCountry ? getCountry(preferredCountry) : undefined;
  if (!country) {
    country = countries[Math.floor(Math.random() * countries.length)];
  }

  const countryMilestones = allMilestones.filter(
    (m) => m.country.toLowerCase() === country.code.toLowerCase()
  );

  const years = countryMilestones.map((m) => yearOf(m)).filter((y) => y > 0);
  const minCountryYear = years.length ? Math.min(...years) : 1980;
  const maxCountryYear = years.length ? Math.max(...years) : 2024;

  let startYear = preferredYear ?? (minCountryYear + Math.floor(Math.random() * Math.max(1, maxCountryYear - minCountryYear - 12)));
  if (startYear < minCountryYear) startYear = minCountryYear;
  if (startYear > maxCountryYear - 8) startYear = Math.max(minCountryYear, maxCountryYear - 12);

  let pool = countryMilestones.filter((m) => yearOf(m) >= startYear);
  if (pool.length < 5) {
    pool = countryMilestones;
    startYear = minCountryYear;
  }

  const traps = pool.filter((m) => (m.opportunity.returnMultiple ?? 1) <= 0.2);
  const gains = pool.filter((m) => (m.opportunity.returnMultiple ?? 1) > 1);

  const pickedMilestones: Milestone[] = [];

  // Target: 1 to 2 traps, remaining gains
  const targetTraps = Math.min(traps.length, Math.random() > 0.4 ? 2 : 1);
  const targetGains = 5 - targetTraps;

  const shuffledTraps = shuffle(traps);
  const shuffledGains = shuffle(gains);

  pickedMilestones.push(...shuffledTraps.slice(0, targetTraps));
  pickedMilestones.push(...shuffledGains.slice(0, targetGains));

  // If still less than 5, backfill from remaining pool
  if (pickedMilestones.length < 5) {
    const pickedIds = new Set(pickedMilestones.map((m) => m.id));
    const leftovers = shuffle(pool.filter((m) => !pickedIds.has(m.id)));
    while (pickedMilestones.length < 5 && leftovers.length > 0) {
      pickedMilestones.push(leftovers.pop()!);
    }
  }

  // Sort strictly chronologically
  pickedMilestones.sort((a, b) => a.date.localeCompare(b.date));

  const rounds: SurvivalRound[] = pickedMilestones.map((m, idx) => {
    const mult = m.opportunity.returnMultiple ?? 1;
    const isTrap = mult <= 0.2;
    // Cap multiple for game balance: 1.5x up to 18x per round
    const cappedMultiple = isTrap ? 0 : Math.min(Math.max(mult, 1.5), 18);
    return {
      roundIndex: idx + 1,
      milestone: m,
      isTrap,
      rawMultiple: mult,
      cappedMultiple,
      year: yearOf(m),
      inflationRate: 0.03,
      yearGap: idx + 1 < pickedMilestones.length ? Math.max(0, yearOf(pickedMilestones[idx + 1]) - yearOf(m)) : 0,
    };
  });

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    country,
    startYear: rounds[0]?.year ?? startYear,
    initialCapital: 1000,
    rounds,
  };
}

export function calculateDecisionOutcome(
  round: SurvivalRound,
  decision: DecisionType,
  prevNetWorth: number
): DecisionResult {
  let newNetWorth = prevNetWorth;
  let multiplierEffect = 1;
  let isSuccess = false;
  let headline = { en: "", vi: "" };
  let feedback = { en: "", vi: "" };

  if (decision === "all_in") {
    if (round.isTrap) {
      // Disastrous loss: lost ~90%
      multiplierEffect = 0.1;
      newNetWorth = Math.max(10, Math.round(prevNetWorth * multiplierEffect));
      isSuccess = false;
      headline = {
        vi: "💀 ĐU ĐỈNH CHÁY TÀI KHOẢN!",
        en: "💀 CAUGHT IN THE CRASH! ACCOUNT WIPED!",
      };
      feedback = {
        vi: `Bạn tất tay vào một cạm bẫy huỷ diệt tài sản. Vốn bốc hơi 90%, chỉ còn lại chút tàn dư sinh tồn.`,
        en: `You went all-in on a devastating historical trap. 90% of your net worth dissolved instantly.`,
      };
    } else {
      // Big win
      multiplierEffect = round.cappedMultiple;
      newNetWorth = Math.round(prevNetWorth * multiplierEffect);
      isSuccess = true;
      headline = {
        vi: "🚀 TẤT TAY THẮNG LỚN! TÀI SẢN BÙNG NỔ!",
        en: "🚀 ALL-IN JACKPOT! WEALTH MULTIPLIED!",
      };
      feedback = {
        vi: `Quyết định dũng cảm! Bạn ăn trọn con sóng lớn với mức nhân ${round.cappedMultiple}× vốn.`,
        en: `Audacious move! You captured the full historical wave with a ${round.cappedMultiple}× return.`,
      };
    }
  } else if (decision === "cautious") {
    if (round.isTrap) {
      // Lost only on the 25% allocation: retain 78% of portfolio
      multiplierEffect = 0.78;
      newNetWorth = Math.max(10, Math.round(prevNetWorth * multiplierEffect));
      isSuccess = false;
      headline = {
        vi: "⚠️ DÍNH BẪY NHẸ! BẢO TOÀN ĐƯỢC 78% VỐN",
        en: "⚠️ MINOR LOSS! PRESERVED 78% CAPITAL",
      };
      feedback = {
        vi: `Sự kiện này sụp đổ, nhưng nhờ bạn chỉ thăm dò 25% vốn nên danh mục chỉ sứt mẻ nhẹ.`,
        en: `The market crashed, but your 25% cautious bet protected the vast majority of your capital.`,
      };
    } else {
      // 75% cash + 25% * cappedMultiple
      multiplierEffect = Number((0.75 + 0.25 * round.cappedMultiple).toFixed(2));
      newNetWorth = Math.round(prevNetWorth * multiplierEffect);
      isSuccess = true;
      headline = {
        vi: "📈 LÃI AN TOÀN! TĂNG TRƯỞNG VỮNG CHẮC",
        en: "📈 SAFE PROFIT! STEADY GROWTH",
      };
      feedback = {
        vi: `Thăm dò thận trọng mang về mức tăng +${Math.round((multiplierEffect - 1) * 100)}% danh mục an toàn.`,
        en: `Cautious sizing secured a solid +${Math.round((multiplierEffect - 1) * 100)}% gain without downside risk.`,
      };
    }
  } else {
    // Arcade rule only: purchasing-power equivalent, not a nominal bank debit.
    const rate = round.inflationRate ?? 0.03;
    const years = round.yearGap ?? 0;
    if (!Number.isFinite(rate) || rate < 0 || !Number.isFinite(years) || years < 0) {
      throw new RangeError("Invalid inflation assumptions");
    }
    multiplierEffect = 1 / (1 + rate) ** years;
    newNetWorth = Math.min(prevNetWorth, Math.max(0, Math.round(prevNetWorth * multiplierEffect)));
    isSuccess = round.isTrap;
    headline = round.isTrap
      ? { vi: "🛡️ NÉ BẪY THÀNH CÔNG", en: "🛡️ TRAP AVOIDED" }
      : { vi: "👀 BỎ LỠ CƠ HỘI", en: "👀 OPPORTUNITY MISSED" };
    feedback = {
      vi: `Giữ tiền ${years} năm; lạm phát giả định ${rate * 100}%/năm. Sức mua quy đổi giảm ${prevNetWorth - newNetWorth}. Đây là luật game, không phải CPI lịch sử hay khoản trừ tiền ngân hàng.`,
      en: `Cash held for ${years} years; assumed inflation ${rate * 100}%/year. Purchasing-power equivalent falls by ${prevNetWorth - newNetWorth}. This is a game rule, not historical CPI or a bank debit.`,
    };
  }

  return {
    roundIndex: round.roundIndex,
    round,
    decision,
    prevNetWorth,
    newNetWorth,
    multiplierEffect,
    headline,
    feedback,
    isSuccess,
    inflationLoss: decision === "skip" ? prevNetWorth - newNetWorth : 0,
  };
}

export function getSurvivalRank(finalNetWorth: number, initialCapital = 1000): SurvivalRank {
  const multiple = finalNetWorth / initialCapital;
  if (multiple < 0.3) {
    return {
      tier: "broke",
      badge: "💀",
      title: { vi: "Kẻ Trắng Tay", en: "Broke Time Traveler" },
      description: {
        vi: "Bị thị trường vắt kiệt. Dù mang ký ức tương lai nhưng bạn đã gục ngã trước những cạm bẫy tàn khốc.",
        en: "Wiped out by historical traps. Even with future memories, market crashes left you empty-handed.",
      },
      emoji: "💀",
    };
  }
  if (multiple < 1.5) {
    return {
      tier: "survivor",
      badge: "💼",
      title: { vi: "Thường Dân An Phận", en: "Cautious Citizen" },
      description: {
        vi: "Sống sót qua nhiều biến động nhưng bỏ lỡ hầu hết các cơ hội lớn. Ít nhất bạn không bị phá sản!",
        en: "Survived the turbulence by playing it safe, but missed life-changing turning points.",
      },
      emoji: "💼",
    };
  }
  if (multiple < 10) {
    return {
      tier: "merchant",
      badge: "🏠",
      title: { vi: "Phú Nông Mới Nổi", en: "Comfortable Trader" },
      description: {
        vi: "Nhân nhiều lần tài sản, xây được cơ ngơi vững chắc. Một kiếp sống trọng sinh ấm no.",
        en: "Multiplied your net worth several times. Built a solid life and secured assets.",
      },
      emoji: "🏠",
    };
  }
  if (multiple < 80) {
    return {
      tier: "tycoon",
      badge: "🏎️",
      title: { vi: "Đại Gia Địa Phương", en: "Local Whale" },
      description: {
        vi: "Tay to thực thụ! Bạn nắm giữ chuỗi tài sản đắc địa và được nể trọng trên thương trường.",
        en: "A recognized market player with prime assets and an enviable portfolio.",
      },
      emoji: "🏎️",
    };
  }
  if (multiple < 500) {
    return {
      tier: "master",
      badge: "👑",
      title: { vi: "Bậc Thầy Trọng Sinh", en: "Reincarnation Master" },
      description: {
        vi: "Kỹ năng phán đoán xuất sắc. Né chuẩn cạm bẫy, ăn trọn mọi sóng thần tài chính!",
        en: "Exceptional foresight. Evaded deadly crashes, rode every major bull market to perfection!",
      },
      emoji: "👑",
    };
  }
  return {
    tier: "god",
    badge: "🚀",
    title: { vi: "Ông Trùm Thời Gian", en: "God of Time" },
    description: {
      vi: "Thao túng toàn bộ lịch sử kinh tế. Bạn nắm quyền lực tài chính làm rung chuyển các thị trường!",
      en: "Rewrote economic history. Your astronomical wealth rivals sovereign nations!",
    },
    emoji: "🚀",
  };
}

export function generateShareText(
  run: SurvivalRun,
  results: DecisionResult[],
  finalNetWorth: number,
  lang: Locale
): string {
  const rank = getSurvivalRank(finalNetWorth, run.initialCapital);
  const multiple = (finalNetWorth / run.initialCapital).toFixed(1);
  const icons = results.map((r) => (r.isSuccess ? "🟩" : "🟥")).join("");

  if (lang === "vi") {
    return `🎲 Thử Thách Trọng Sinh: Kiếp sống tại ${run.country.flag} ${run.country.name.vi} (${run.startYear} - 2024)\n💰 Vốn: $${run.initialCapital.toLocaleString()} ➔ $${finalNetWorth.toLocaleString()} (${multiple}×)\n${rank.badge} Danh hiệu: ${rank.title.vi}\n${icons}\nThử xem bạn sống sót được qua 5 ngã rẽ lịch sử không?`;
  }

  return `🎲 Reincarnation Survival Run: Life in ${run.country.flag} ${run.country.name.en} (${run.startYear} - 2024)\n💰 Capital: $${run.initialCapital.toLocaleString()} ➔ $${finalNetWorth.toLocaleString()} (${multiple}×)\n${rank.badge} Rank: ${rank.title.en}\n${icons}\nCan you survive 5 historical market turnarounds?`;
}
