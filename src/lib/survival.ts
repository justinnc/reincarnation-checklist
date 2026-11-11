import { allMilestones, countries, getCountry, yearOf } from "./data";
import type { Locale } from "./i18n";
import { intlLocale, t } from "./i18n";
import type { Country, Milestone } from "./types";
import contemporaryDispatches from "@/data/survival-dispatches.json";

export interface ContemporaryDispatch {
  headline: { vi: string; en: string };
  dispatch: { vi: string; en: string };
  sentiment: { vi: string; en: string };
}

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
  /** Year asked for via URL/preference, when it differed from the playable start year. */
  requestedYear?: number;
  initialCapital: number;
  rounds: SurvivalRound[];
}

/** Locale-aware number formatting ("1,000" / "1.000"). */
export function formatNumber(value: number, lang: Locale, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits }).format(value);
}

/** Game capital in USD: EN "$1,000", VI "1.000 USD". */
export function formatUsd(value: number, lang: Locale): string {
  const n = formatNumber(Math.round(value), lang);
  return lang === "vi" ? `${n} USD` : `$${n}`;
}

/** Multiplier such as "18×" / "2,5×". */
export function formatTimes(value: number, lang: Locale): string {
  return `${formatNumber(value, lang, 2)}×`;
}

/** "1 year" / "5 years" / "5 năm". */
export function formatYears(years: number, lang: Locale): string {
  if (lang === "vi") return `${formatNumber(years, lang)} năm`;
  return `${formatNumber(years, lang)} ${years === 1 ? "year" : "years"}`;
}

/** Copy for the Skip button: hides the holding period when it is zero. */
export function skipChoiceText(yearGap: number, lang: Locale): string {
  if (yearGap <= 0) {
    return lang === "vi"
      ? "Giữ tiền mặt. Không có thời gian chờ đến mốc tiếp theo nên không hao hụt sức mua; không có thưởng né bẫy."
      : "Hold cash. No time passes before the next event, so no purchasing-power loss; no dodge bonus.";
  }
  return lang === "vi"
    ? `Giữ tiền ${formatYears(yearGap, lang)} đến mốc tiếp theo. Sức mua giảm theo lạm phát giả định 3%/năm; không có thưởng né bẫy.`
    : `Hold cash for ${formatYears(yearGap, lang)} until the next event. Purchasing power falls at an assumed 3%/year; no dodge bonus.`;
}

/** Short notice when the requested start year had to be moved to a playable one. */
export function getYearClampNotice(run: SurvivalRun, lang: Locale): string | null {
  const requested = run.requestedYear;
  if (requested === undefined || !Number.isFinite(requested) || requested === run.startYear) return null;
  const country = t(run.country.name, lang);
  if (requested > run.startYear) {
    return lang === "vi"
      ? `Không đủ sự kiện từ năm ${requested} cho ${country} — bắt đầu từ năm ${run.startYear}.`
      : `Not enough events from ${requested} on for ${country} — starting in ${run.startYear}.`;
  }
  return lang === "vi"
    ? `Chưa có sự kiện nào trước năm ${run.startYear} cho ${country} — bắt đầu từ năm ${run.startYear}.`
    : `No events before ${run.startYear} for ${country} — starting in ${run.startYear}.`;
}

export type DecisionType = "all_in" | "cautious" | "skip";

/** Loss thresholds used consistently for round selection and scoring. */
function isSurvivalTrap(m: Milestone): boolean {
  return (m.opportunity.returnMultiple ?? 1) <= 0.2;
}

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
function shuffle<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateSurvivalRun(
  preferredCountry?: string,
  preferredYear?: number,
  random: () => number = Math.random
): SurvivalRun {
  let country = preferredCountry ? getCountry(preferredCountry) : undefined;
  if (!country) {
    country = countries[Math.floor(random() * countries.length)];
  }

  // Context-only cases must never become scored rounds, even if malformed data has a numeric return.
  const countryMilestones = allMilestones.filter(
    (m) => m.country.toLowerCase() === country.code.toLowerCase() && !m.opportunity.historicalOnly
  );

  const years = countryMilestones.map((m) => yearOf(m)).filter((y) => y > 0);
  const minCountryYear = years.length ? Math.min(...years) : 1980;
  const maxCountryYear = years.length ? Math.max(...years) : 2024;

  let startYear = preferredYear ?? (minCountryYear + Math.floor(random() * Math.max(1, maxCountryYear - minCountryYear - 12)));
  if (startYear < minCountryYear) startYear = minCountryYear;
  if (startYear > maxCountryYear - 8) startYear = Math.max(minCountryYear, maxCountryYear - 12);

  let pool = countryMilestones.filter((m) => yearOf(m) >= startYear);
  if (pool.length < 5) {
    pool = countryMilestones;
    startYear = minCountryYear;
  }

  const traps = pool.filter(isSurvivalTrap);
  const gains = pool.filter((m) => !isSurvivalTrap(m) && (m.opportunity.returnMultiple ?? 1) > 1);

  const pickedMilestones: Milestone[] = [];

  // Target: 1 to 2 traps, remaining gains
  const targetTraps = Math.min(traps.length, random() > 0.4 ? 2 : 1);
  const targetGains = 5 - targetTraps;

  const shuffledTraps = shuffle(traps, random);
  const shuffledGains = shuffle(gains, random);

  pickedMilestones.push(...shuffledTraps.slice(0, targetTraps));
  pickedMilestones.push(...shuffledGains.slice(0, targetGains));

  // If still less than 5, backfill from remaining pool
  if (pickedMilestones.length < 5) {
    const pickedIds = new Set(pickedMilestones.map((m) => m.id));
    const leftovers = shuffle(pool.filter((m) => !pickedIds.has(m.id)), random);
    while (pickedMilestones.length < 5 && leftovers.length > 0) {
      pickedMilestones.push(leftovers.pop()!);
    }
  }

  // Sort strictly chronologically
  pickedMilestones.sort((a, b) => a.date.localeCompare(b.date));

  const rounds: SurvivalRound[] = pickedMilestones.map((m, idx) => {
    const mult = m.opportunity.returnMultiple ?? 1;
    const isTrap = isSurvivalTrap(m);
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
    startYear,
    ...(preferredYear !== undefined && Number.isFinite(preferredYear) && preferredYear !== startYear
      ? { requestedYear: preferredYear }
      : {}),
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
      // Only call the account "wiped" when practically nothing is left.
      const wiped = newNetWorth <= Math.max(10, prevNetWorth * 0.01);
      headline = wiped
        ? { vi: "💀 ĐU ĐỈNH! TÀI KHOẢN VỀ GẦN 0!", en: "💀 CAUGHT IN THE CRASH! ACCOUNT WIPED!" }
        : { vi: "💀 ĐU ĐỈNH! BỐC HƠI 90% VỐN!", en: "💀 CAUGHT IN THE CRASH! −90% IN ONE HIT!" };
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
        vi: `Quyết định dũng cảm! Bạn ăn trọn con sóng lớn, vốn nhân ${formatTimes(round.cappedMultiple, "vi")}.`,
        en: `Audacious move! You captured the full historical wave and multiplied your stake ${formatTimes(round.cappedMultiple, "en")}.`,
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
    const loss = prevNetWorth - newNetWorth;
    feedback = years > 0
      ? {
          vi: `Giữ tiền ${formatYears(years, "vi")}; lạm phát giả định ${formatNumber(rate * 100, "vi", 2)}%/năm. Sức mua quy đổi giảm ${formatUsd(loss, "vi")}. Đây là luật game, không phải CPI lịch sử hay khoản trừ tiền ngân hàng.`,
          en: `Cash held for ${formatYears(years, "en")}; assumed inflation ${formatNumber(rate * 100, "en", 2)}%/year. Purchasing-power equivalent falls by ${formatUsd(loss, "en")}. This is a game rule, not historical CPI or a bank debit.`,
        }
      : {
          vi: "Giữ tiền mặt. Không có thời gian chờ đến mốc tiếp theo nên sức mua không đổi.",
          en: "Held cash. No time passes before the next event, so purchasing power is unchanged.",
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

export interface SurvivalStats {
  wins: number;
  rounds: number;
  /** Trap rounds where any money was at risk (All-in or Cautious). */
  trapsHit: number;
  /** Trap rounds hit with the whole stack. */
  allInTrapsHit: number;
  multiple: number;
}

export function getSurvivalStats(
  results: DecisionResult[],
  finalNetWorth: number,
  initialCapital = 1000
): SurvivalStats {
  const trapRounds = results.filter((r) => r.round.isTrap && r.decision !== "skip");
  return {
    wins: results.filter((r) => r.isSuccess).length,
    rounds: results.length,
    trapsHit: trapRounds.length,
    allInTrapsHit: trapRounds.filter((r) => r.decision === "all_in").length,
    multiple: finalNetWorth / initialCapital,
  };
}

function trapCount(n: number, lang: Locale): string {
  if (lang === "vi") return `${formatNumber(n, lang)} cạm bẫy`;
  return `${formatNumber(n, lang)} ${n === 1 ? "trap" : "traps"}`;
}

/**
 * Rank depends on the final multiple AND how it was earned, so the shared title never
 * claims flawless foresight for a run that walked into traps.
 */
export function getSurvivalRank(
  finalNetWorth: number,
  initialCapital = 1000,
  results: DecisionResult[] = []
): SurvivalRank {
  const s = getSurvivalStats(results, finalNetWorth, initialCapital);
  const multiple = s.multiple;
  const hasLog = s.rounds > 0;
  const flawless = hasLog && s.trapsHit === 0 && s.wins === s.rounds;
  const finalVi = formatUsd(finalNetWorth, "vi");
  const finalEn = formatUsd(finalNetWorth, "en");
  const startVi = formatUsd(initialCapital, "vi");
  const startEn = formatUsd(initialCapital, "en");
  const scarVi = s.trapsHit > 0 ? ` Dù vậy, bạn đã dính ${trapCount(s.trapsHit, "vi")} trên đường đi.` : "";
  const scarEn = s.trapsHit > 0 ? ` You did step on ${trapCount(s.trapsHit, "en")} along the way.` : "";

  if (multiple < 0.3) {
    return {
      tier: "broke",
      badge: "💀",
      title: { vi: "Kẻ Du Hành Cháy Túi", en: "Rekt Time Traveler" },
      description:
        s.trapsHit > 0
          ? {
              vi: `Mang ký ức tương lai mà vẫn đu đỉnh: ${trapCount(s.trapsHit, "vi")} thiêu rụi vốn, từ ${startVi} còn ${finalVi}. Chụp lại làm bài học cho hậu thế!`,
              en: `Knew the future, still bought the top: ${trapCount(s.trapsHit, "en")} torched ${startEn} down to ${finalEn}. Share it as a warning to others!`,
            }
          : {
              vi: `Từ ${startVi} còn ${finalVi}. Biết trước tương lai cũng không cứu được ví tiền này!`,
              en: `${startEn} down to ${finalEn}. Even future memories couldn't save this wallet!`,
            },
      emoji: "💀",
    };
  }
  if (multiple < 1) {
    return {
      tier: "singed",
      badge: "🔥",
      title: { vi: "Kẻ Du Hành Sém Cánh", en: "Singed Time Traveler" },
      description: {
        vi: `Kết thúc dưới vốn ban đầu (${finalVi} so với ${startVi}). Tương lai tưởng dễ đoán — hóa ra không.`,
        en: `Finished below your starting capital (${finalEn} vs ${startEn}). The future looked obvious — it wasn't.`,
      },
      emoji: "🔥",
    };
  }
  if (multiple < 1.5) {
    return {
      tier: "survivor",
      badge: "💼",
      title: { vi: "Thường Dân An Phận", en: "Cautious Citizen" },
      description: {
        vi: "Về đích gần như hòa vốn. Sống sót được, nhưng bỏ lỡ hầu hết các bước ngoặt đổi đời.",
        en: "Ended roughly where you started. You survived, but missed the life-changing turning points.",
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
        vi: `Nhân tài sản lên ${formatTimes(Number(multiple.toFixed(1)), "vi")}, xây được cơ ngơi vững chắc.${scarVi}`,
        en: `Multiplied your net worth ${formatTimes(Number(multiple.toFixed(1)), "en")} and built a solid life.${scarEn}`,
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
        vi: `Tay to thực thụ! Bạn nắm giữ chuỗi tài sản đắc địa.${scarVi}`,
        en: `A recognized market player with prime assets.${scarEn}`,
      },
      emoji: "🏎️",
    };
  }
  const god = multiple >= 500;
  if (s.allInTrapsHit > 0) {
    return {
      tier: god ? "god" : "master",
      badge: "🩹",
      title: { vi: "Cá Mập Hồi Sinh", en: "Comeback Whale" },
      description: {
        vi: `Mất 90% vì ${trapCount(s.allInTrapsHit, "vi")} mà vẫn về đích ${formatTimes(Number(multiple.toFixed(1)), "vi")}. Không phải tiên tri — chỉ là sóng tăng quá lớn.`,
        en: `Lost 90% on ${trapCount(s.allInTrapsHit, "en")} and still finished at ${formatTimes(Number(multiple.toFixed(1)), "en")}. Not foresight — just huge bull runs.`,
      },
      emoji: "🩹",
    };
  }
  if (!god) {
    return {
      tier: "master",
      badge: "👑",
      title: { vi: "Bậc Thầy Trọng Sinh", en: "Reincarnation Master" },
      description: flawless
        ? {
            vi: "Kỹ năng phán đoán xuất sắc. Né chuẩn cạm bẫy, ăn trọn mọi sóng thần tài chính!",
            en: "Exceptional foresight. Evaded deadly crashes, rode every major bull market to perfection!",
          }
        : hasLog
        ? {
            vi: `Đúng ${s.wins}/${s.rounds} ngã rẽ. Lỡ vài con sóng${s.trapsHit > 0 ? ", sứt mẻ vì bẫy" : ""}, nhưng các cú lớn đã sinh lời.`,
            en: `${s.wins}/${s.rounds} calls right. Missed a few waves${s.trapsHit > 0 ? " and got nicked by a trap" : ""}, but the big bets paid off.`,
          }
        : {
            vi: "Lợi nhuận khủng — các cú lớn đã sinh lời.",
            en: "Huge returns — the big bets paid off.",
          },
      emoji: "👑",
    };
  }
  return {
    tier: "god",
    badge: "🚀",
    title: { vi: "Ông Trùm Thời Gian", en: "God of Time" },
    description: flawless
      ? {
          vi: "Thao túng toàn bộ lịch sử kinh tế. Bạn nắm quyền lực tài chính làm rung chuyển các thị trường!",
          en: "Rewrote economic history. Your astronomical wealth rivals sovereign nations!",
        }
      : {
          vi: `Khối tài sản khổng lồ${hasLog ? ` với ${s.wins}/${s.rounds} ngã rẽ đúng` : ""}.${scarVi}`,
          en: `Astronomical wealth${hasLog ? ` with ${s.wins}/${s.rounds} calls right` : ""}.${scarEn}`,
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
  const rank = getSurvivalRank(finalNetWorth, run.initialCapital, results);
  const multipleText = new Intl.NumberFormat(intlLocale(lang), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    finalNetWorth / run.initialCapital
  );
  const icons = results.map((r) => (r.isSuccess ? "🟩" : "🟥")).join("");

  if (lang === "vi") {
    return `🎲 Thử Thách Trọng Sinh: Kiếp sống tại ${run.country.flag} ${run.country.name.vi} (${run.startYear} - 2024)\n💰 Vốn: ${formatUsd(run.initialCapital, "vi")} ➔ ${formatUsd(finalNetWorth, "vi")} (${multipleText}×)\n${rank.badge} Danh hiệu: ${rank.title.vi}\n${icons}\nThử xem bạn sống sót được qua 5 ngã rẽ lịch sử không?`;
  }

  return `🎲 Reincarnation Survival Run: Life in ${run.country.flag} ${run.country.name.en} (${run.startYear} - 2024)\n💰 Capital: ${formatUsd(run.initialCapital, "en")} ➔ ${formatUsd(finalNetWorth, "en")} (${multipleText}×)\n${rank.badge} Rank: ${rank.title.en}\n${icons}\nCan you survive 5 historical market turnarounds?`;
}

const CONTEMPORARY_TRAP_DISPATCHES: Record<string, ContemporaryDispatch> = {
  "br-ogx-eike-batista-insider-trading-2013": {
    headline: {
      vi: "OGX của tỷ phú Eike Batista tuyên bố trữ lượng dầu khổng lồ",
      en: "Billionaire Eike Batista's OGX Announces Giant Offshore Oil Discovery",
    },
    dispatch: {
      vi: "Cổ phiếu OGX tăng vọt trên sàn B3. Batista tự tin tuyên bố trữ lượng ngoài khơi bồn trũng Campos sẽ đưa ông lên vị trí người giàu nhất hành tinh.",
      en: "OGX shares surge on B3 as Batista boldly claims offshore Campos Basin reserves will crown him the world's richest person.",
    },
    sentiment: {
      vi: "🔥 Cơn sốt dầu khí Brazil: Giới đầu tư đổ xô gom cổ phiếu OGX",
      en: "🔥 Brazilian Oil Euphoria: Mass retail accumulation",
    },
  },
  "ca-bre-x-gold-fraud-1997": {
    headline: {
      vi: "Bre-X Minerals: Tuyên bố phát hiện 'mỏ vàng thế kỷ' tại Busang",
      en: "Bre-X Minerals: Claims Discovery of 'Gold Deposit of the Century' at Busang",
    },
    dispatch: {
      vi: "Cổ phiếu khai khoáng Bre-X tăng vọt từ 0,30 CAD lên đỉnh gần 287 CAD. Hàng vạn nhà đầu tư và các quỹ hưu trí lớn đang đổ xô tranh mua.",
      en: "Bre-X shares skyrocket from CA$0.30 to near CA$287. Tens of thousands of retail investors and major pension funds are piling in.",
    },
    sentiment: {
      vi: "💎 'Cơ hội ngàn năm có một' — Giới phân tích đồng loạt nâng giá mục tiêu",
      en: "💎 'Once in a lifetime strike' — Analysts lift price targets",
    },
  },
  "ca-sino-forest-muddy-waters-2011": {
    headline: {
      vi: "Sino-Forest — Tập đoàn lâm nghiệp thương mại hàng đầu Trung Quốc niêm yết tại Toronto",
      en: "Sino-Forest — China's Commercial Forestry Champion Listed on TSX",
    },
    dispatch: {
      vi: "Công ty công bố quyền sở hữu hàng triệu cây gỗ và đất rừng thương mại bạt ngàn tại tỉnh Quảng Đông. Các quỹ đầu tư phố Wall đang mua ròng mạnh.",
      en: "The company boasts millions of trees and vast commercial plantation concessions across Guangdong, attracting heavy institutional buying.",
    },
    sentiment: {
      vi: "🌲 Sóng cổ phiếu Trung Quốc: Quỹ lớn phố Wall liên tục gom hàng",
      en: "🌲 China Growth Wave: Wall Street mega-funds backing the story",
    },
  },
  "de-neuer-markt-bubble-2000": {
    headline: {
      vi: "Cơn sốt sàn Neuer Markt: Cổ phiếu công nghệ và internet Đức bùng nổ",
      en: "Neuer Markt Mania: German Tech & Internet Equities Skyrocket",
    },
    dispatch: {
      vi: "Sàn giao dịch tăng trưởng Neuer Markt tại Frankfurt ghi nhận dòng tiền ồ ạt đổ vào các startup dot-com với định giá P/E cao ngất ngưởng.",
      en: "Frankfurt's growth exchange Neuer Markt sees unprecedented capital flooding into dot-com startups at astronomical P/E valuations.",
    },
    sentiment: {
      vi: "🚀 Kỷ nguyên số mới: 'Đừng bỏ lỡ cuộc cách mạng Internet'",
      en: "🚀 The New Economy: 'Do not miss the internet revolution'",
    },
  },
  "de-infineon-spinoff-ipo-2000": {
    headline: {
      vi: "Siemens tách mảng chip bán dẫn IPO Infineon giữa đỉnh sóng công nghệ",
      en: "Siemens Spins Off Semiconductor Unit Infineon in Massive IPO",
    },
    dispatch: {
      vi: "Đợt chào bán cổ phiếu lần đầu của Infineon được đăng ký vượt hơn 33 lần. Nhà đầu tư chen chân giành suất phân bổ cổ phiếu bán dẫn tương lai.",
      en: "Infineon's IPO is oversubscribed by 33 times as retail and institutions scramble for shares in Europe's semiconductor champion.",
    },
    sentiment: {
      vi: "⚡ Siêu phẩm chip bán dẫn: Nhu cầu đặt mua vượt 33 lần",
      en: "⚡ Semiconductor Blockbuster: 33x oversubscribed",
    },
  },
  "de-wirecard-fraud-2020": {
    headline: {
      vi: "Ngôi sao FinTech Wirecard thế chỗ Commerzbank trong chỉ số DAX 30",
      en: "FinTech Darling Wirecard Replaces Commerzbank in Germany's DAX 30",
    },
    dispatch: {
      vi: "Biểu tượng công nghệ thanh toán kỹ thuật số của Đức đạt vốn hóa 24 tỷ EUR. Ban lãnh đạo khẳng định mảng kinh doanh tại châu Á đang tăng trưởng thần tốc.",
      en: "Germany's digital payments champion reaches €24B valuation, with leadership touting explosive transaction growth across Asia.",
    },
    sentiment: {
      vi: "💳 Niềm tự hào công nghệ Đức: 'Tương lai không tiền mặt'",
      en: "💳 German Tech Pride: 'The future of cashless transactions'",
    },
  },
  "fr-france-telecom-short-2002": {
    headline: {
      vi: "France Télécom thâu tóm Orange, mở rộng đế chế di động 3G toàn châu Âu",
      en: "France Télécom Acquires Orange to Build Pan-European 3G Mobile Empire",
    },
    dispatch: {
      vi: "Tập đoàn viễn thông quốc gia Pháp chi hàng chục tỷ EUR để giành thị phần di động thế hệ mới và giấy phép tần số băng thông 3G.",
      en: "France's telecom giant commits tens of billions to dominate next-gen cellular networks and secure premium European 3G spectrum.",
    },
    sentiment: {
      vi: "📱 Đại tiệc viễn thông 3G: Tham vọng thống trị thị trường di động",
      en: "📱 3G Telecom Super-cycle: Aggressive pan-European dominance",
    },
  },
  "in-satyam-scandal-2009": {
    headline: {
      vi: "Satyam Computer Services thắng lớn các hợp đồng CNTT toàn cầu",
      en: "Satyam Computer Services Wins Blockbuster Global IT Contracts",
    },
    dispatch: {
      vi: "Một trong bốn tứ trụ gia công phần mềm của Ấn Độ công bố lợi nhuận kỷ lục và kế hoạch đa dạng hóa sang hạ tầng với thương vụ Maytas.",
      en: "One of India's 'Big Four' IT powerhouses posts record reported profits and unveils aggressive infrastructure expansion via Maytas.",
    },
    sentiment: {
      vi: "💻 Vương miện CNTT Ấn Độ: Tăng trưởng lợi nhuận quý ấn tượng",
      en: "💻 Indian IT Crown: Stellar quarterly profit trajectory",
    },
  },
  "in-yes-bank-crisis-2020": {
    headline: {
      vi: "Yes Bank — Ngôi sao ngân hàng tư nhân tăng trưởng nóng nhất Ấn Độ",
      en: "Yes Bank — India's Fastest-Growing Private Banking Juggernaut",
    },
    dispatch: {
      vi: "Ngân hàng ghi nhận tăng trưởng tín dụng vượt xa toàn ngành và liên tục mở rộng cho vay các tập đoàn lớn với lợi suất cao.",
      en: "The private lender posts industry-beating loan book growth, aggressively expanding credit to high-yielding corporate conglomerates.",
    },
    sentiment: {
      vi: "🏦 Cổ phiếu ngân hàng tăng trưởng cao: Khuyến nghị Mua tràn ngập",
      en: "🏦 High-Growth Banking Star: Ubiquitous 'Buy' recommendations",
    },
  },
  "it-popolare-vicenza-share-collapse-2016": {
    headline: {
      vi: "Banca Popolare di Vicenza phát hành cổ phiếu nội bộ ưu đãi cho cổ đông",
      en: "Banca Popolare di Vicenza Offers Exclusive Internal Shares to Patrons",
    },
    dispatch: {
      vi: "Ngân hàng vùng Veneto kêu gọi hàng vạn khách hàng gửi tiết kiệm và doanh nghiệp địa phương mua cổ phần với cam kết giá trị gia tăng bền vững.",
      en: "The Veneto-based lender urges tens of thousands of depositors and local businesses to subscribe to internal shares promising steady capital growth.",
    },
    sentiment: {
      vi: "🏛️ Uy tín ngân hàng lâu đời: Lời mời gọi cổ đông 'vững như bàn thạch'",
      en: "🏛️ Heritage Regional Bank: 'Rock-solid community investment'",
    },
  },
  "jp-livedoor-horie-raid-2006": {
    headline: {
      vi: "Hiện tượng Takafumi Horie và tham vọng truyền thông số của Livedoor",
      en: "The Takafumi Horie Phenomenon: Livedoor's Digital Media Ambitions",
    },
    dispatch: {
      vi: "Doanh nhân trẻ ngạo nghễ Takafumi Horie gây chấn động giới tài chính Tokyo với các thương vụ chia tách cổ phiếu và thâu tóm thù địch Nippon Broadcasting.",
      en: "Maverick entrepreneur Takafumi Horie shakes Tokyo finance with aggressive stock splits and a hostile bid for Nippon Broadcasting.",
    },
    sentiment: {
      vi: "🌐 Cơn sốt cổ phiếu mạng Livedoor: Thần tượng của giới trẻ Nhật",
      en: "🌐 Livedoor Internet Mania: The idol of Japan's new generation",
    },
  },
  "sg-penny-stock-crash-blumont-2013": {
    headline: {
      vi: "Sóng cổ phiếu penny bùng nổ trên sàn Singapore: Blumont, Asiasons tăng hơn 1.000%",
      en: "Penny Stock Frenzy Grips SGX: Blumont, Asiasons Surge Over 1,000%",
    },
    dispatch: {
      vi: "Nhóm cổ phiếu đầu cơ vốn hóa nhỏ tăng phi mã lên hàng tỷ USD chỉ trong vài tháng với thanh khoản chiếm gần một nửa toàn sàn SGX.",
      en: "Speculative small-caps balloon to multi-billion dollar market caps in months, driving nearly half of SGX's daily turnover.",
    },
    sentiment: {
      vi: "📈 Sóng penny kiếm tiền thần tốc: Nhà đầu tư cá nhân đổ xô lướt sóng",
      en: "📈 Get-Rich-Quick Speculation: Retail frenzy dominates the tape",
    },
  },
  "sg-noble-group-collapse-2015": {
    headline: {
      vi: "Noble Group — Tập đoàn giao dịch hàng hóa lớn nhất châu Á mở rộng đế chế",
      en: "Noble Group — Asia's Largest Commodity Merchant Expands Global Dominance",
    },
    dispatch: {
      vi: "Đế chế kinh doanh tài nguyên tại Singapore báo cáo doanh thu hàng chục tỷ USD trong lĩnh vực nông sản, than đá và kim loại công nghiệp.",
      en: "The Singapore-headquartered supply-chain titan posts tens of billions in revenues across agriculture, coal, and metals trading.",
    },
    sentiment: {
      vi: "🚢 Gã khổng lồ chuỗi cung ứng: Đế chế hàng hóa số 1 châu Á",
      en: "🚢 Supply Chain Leviathan: Asia's premier commodities empire",
    },
  },
  "th-stark-corporation-accounting-fraud-2023": {
    headline: {
      vi: "Stark Corporation tham vọng mở rộng toàn cầu với thương vụ thâu tóm Leoni AG",
      en: "Stark Corporation Targets Global Scale With €560M Leoni AG Acquisition",
    },
    dispatch: {
      vi: "Nhà sản xuất dây cáp điện hàng đầu Thái Lan công bố doanh thu tăng vọt và phát hành trái phiếu lãi suất hấp dẫn để tài trợ M&A xuyên biên giới.",
      en: "Thailand's premier wire & cable manufacturer posts soaring revenues and issues high-yield corporate bonds to finance cross-border M&A.",
    },
    sentiment: {
      vi: "🔌 Cổ phiếu tăng trưởng công nghiệp: Thương vụ thâu tóm châu Âu đình đám",
      en: "🔌 Industrial Growth Champion: Blockbuster European acquisition",
    },
  },
  "us-enron-collapse-2001": {
    headline: {
      vi: "Enron lập đỉnh lịch sử — Được bình chọn là 'Công ty sáng tạo nhất nước Mỹ'",
      en: "Enron Hits All-Time High — Named 'America's Most Innovative Company'",
    },
    dispatch: {
      vi: "Tập đoàn năng lượng phố Wall liên tục công bố tăng trưởng doanh thu thần tốc từ các sàn giao dịch năng lượng và băng thông internet tương lai.",
      en: "The Wall Street darling reports astronomical revenue growth from high-tech energy trading and future internet bandwidth exchanges.",
    },
    sentiment: {
      vi: "💡 Ngôi sao sáng nhất Phố Wall: 'Mô hình kinh doanh không thể sụp đổ'",
      en: "💡 Wall Street Superstar: 'A business model built to dominate'",
    },
  },
  "us-ftx-collapse-2022": {
    headline: {
      vi: "Đế chế FTX đạt định giá 32 tỷ USD — Sam Bankman-Fried được ca ngợi là 'J.P. Morgan thời số'",
      en: "FTX Reaches $32B Valuation — Sam Bankman-Fried Hailed as Crypto's J.P. Morgan",
    },
    dispatch: {
      vi: "Sàn giao dịch phái sinh tiền số hoàn tất vòng gọi vốn khủng từ Sequoia Capital và BlackRock, xuất hiện dày đặc trên các biển quảng cáo Super Bowl.",
      en: "The crypto derivatives exchange secures massive venture funding from Sequoia and BlackRock, blanketing the Super Bowl with prime ads.",
    },
    sentiment: {
      vi: "🪙 'Người cứu trợ thị trường' — Niềm tin tuyệt đối của các quỹ đầu tư mạo hiểm",
      en: "🪙 'The Market Savior' — Total backing from tier-one VCs",
    },
  },
  "vn-flc-trinh-van-quyet-manipulation-2022": {
    headline: {
      vi: "Tập đoàn FLC dậy sóng thanh khoản trước thông tin niêm yết Bamboo Airways",
      en: "FLC Group Surges on High Volume Amid Bamboo Airways US Listing Buzz",
    },
    dispatch: {
      vi: "Cổ phiếu trong hệ sinh thái FLC thu hút dòng tiền sôi động kỷ lục, khớp lệnh hàng chục triệu đơn vị mỗi phiên với kỳ vọng mở rộng hàng không và bất động sản.",
      en: "Equities across the FLC ecosystem log record trading volumes on expectations of airline expansion and massive resort developments.",
    },
    sentiment: {
      vi: "✈️ Sóng cổ phiếu hệ sinh thái: Khớp lệnh hàng chục triệu cổ phiếu mỗi ngày",
      en: "✈️ Ecosystem Momentum: Tens of millions of shares traded daily",
    },
  },
};

// Words that only make sense with hindsight (outcomes, later prices, verdicts). The dispatch is
// shown BEFORE the player decides, so any clause containing one of these is dropped.
const HINDSIGHT_EN =
  /\b(later|eventually|ultimately|subsequently|afterwards?|since|then|until|within|would|went on|became|become|becoming|turn(?:ed|ing)? (?:into|out)|grew|grow(?:n|ing)?|rose|rise|rising|risen|soar\w*|surg\w*|skyrocket\w*|rall\w*|recover\w*|tripl\w*|doubl\w*|multibagger|fell|fall(?:s|en|ing)?|drop\w*|plung\w*|crash\w*|collaps\w*|tank\w*|lost|los(?:e|es|ing)|wip\w*|eras\w*|bankrupt\w*|insolven\w*|fraud\w*|scam\w*|scandal\w*|ponzi|delist\w*|disaster\w*|peak\w*|bottom\w*|top|all-time|worst|best|greatest|ever|forever|history's|empire|giant|trillion-dollar|billion-dollar|returned|return of|gain\w*|hold (?:forever|for|until)|sell (?:before|at|the|out)|buy (?:the|at|before|and)|buying the|outpac\w*|sank|sunk|sink\w*|slump\w*|low of|lows?|record low|losses?|hollow\w*|once|initially|at first|at the time|right when|just (?:before|as)|push\w*|dragg\w*|sent \w+ (?:up|down)|further|(?:up|down) (?:about |nearly |roughly |over |by )?\d+|over the (?:next|following)|following (?:decade|years?)|decades?|by (?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w* )?\d{4})\b|\d+(?:[.,]\d+)?\s*[x×](?![a-z])|×/i;
const HINDSIGHT_VI =
  /(sau này|sau đó|sau đổi|đổi tên thành|kéo dài|mở màn|về sau|trước khi|cuối cùng|rốt cuộc|trở thành|kể từ|đến nay|tới nay|ngày nay|hiện nay|thập kỷ|thập niên|tăng|giảm|mất|lao dốc|sụp|sập|vỡ|phá sản|lừa đảo|bê bối|thao túng|gian lận|đỉnh|đáy|bốc hơi|thảm họa|nghìn tỷ|ngàn tỷ|gấp|\d+(?:[.,]\d+)?\s*lần|đế chế|khổng lồ|mãi mãi|lịch sử|tồi tệ|tốt nhất|lớn nhất|nắm giữ|thua lỗ|ban đầu|từng|khi đó|lúc đó|đẩy|thêm \d|×|\d+(?:[.,]\d+)?\s*x(?![a-zà-ỹ]))/i;

function hasHindsight(text: string, isVi: boolean, eventYear: number): boolean {
  if ((isVi ? HINDSIGHT_VI : HINDSIGHT_EN).test(text)) return true;
  // Any year after the event is, by definition, the future.
  if (eventYear > 0) {
    for (const match of text.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)) {
      if (Number(match[1]) > eventYear) return true;
    }
  }
  return false;
}

/**
 * Builds a "no hindsight" dispatch: keeps leading sentences/clauses until the first one that
 * leaks the outcome, and stops there. Returns "" if nothing usable survives.
 */
export function sanitizeDispatchText(text: string | undefined, isVi: boolean, eventYear = 0, maxSentences = 2, maxChars = 280): string {
  if (!text) return "";
  const sentences = text.trim().split(/(?<=[.!?])\s+(?=[A-ZÀ-Ỹ'"‘“(0-9])/u);
  const kept: string[] = [];
  let length = 0;
  for (const sentence of sentences) {
    if (kept.length >= maxSentences) break;
    if (kept.length > 0 && length + sentence.length > maxChars) break;
    const clauses = sentence.split(/(\s+[—–]\s+|;\s+|,\s+(?=(?:then|before|after|but|while|which|only|turning|making|sending|creating|trước khi|sau đó|rồi|nhưng|khiến|biến)\b))/u);
    let out = "";
    for (let i = 0; i < clauses.length; i += 2) {
      const clause = clauses[i];
      if (hasHindsight(clause, isVi, eventYear)) break;
      out += (i > 0 ? clauses[i - 1] : "") + clause;
    }
    out = out.trim().replace(/[\s,;:—–-]+$/u, "");
    if (!out) break;
    const complete = out.length === sentence.trim().length;
    // A truncated follow-up sentence reads as a fragment; only the opener may be shortened,
    // and only if what is left still ends in a real phrase (not "…, China Evergrande Group.").
    if (!complete && kept.length > 0) break;
    if (!complete && (out.split(/,\s+/).pop() ?? "").trim().split(/\s+/).length < 4) break;
    kept.push(/[.!?]$/.test(out) ? out : `${out}.`);
    length += out.length;
    if (!complete) break;
  }
  return kept.join(" ");
}

/** Headlines: keep the part before a dash/colon if the full title leaks the outcome. */
export function sanitizeDispatchHeadline(title: string | undefined, isVi: boolean, eventYear = 0): string {
  if (!title) return "";
  const full = title.trim();
  if (!hasHindsight(full, isVi, eventYear)) return full;
  const head = full.split(/\s+[—–-]\s+|:\s+|,\s+/u)[0].trim();
  return head && head !== full && !hasHindsight(head, isVi, eventYear) ? head : "";
}

export function getContemporaryDispatch(round: SurvivalRound): ContemporaryDispatch {
  const m = round.milestone;
  if (CONTEMPORARY_TRAP_DISPATCHES[m.id]) {
    return CONTEMPORARY_TRAP_DISPATCHES[m.id];
  }
  // Hand-written, hindsight-free dispatches (src/data/survival-dispatches.json); only facts
  // already in the milestone's own sourced description. Enforced by survival-dispatches.test.ts.
  const handWritten = (contemporaryDispatches as Record<string, ContemporaryDispatch>)[m.id];
  if (handWritten) return handWritten;

  const eventYear = yearOf(m);
  const viTitle = sanitizeDispatchHeadline(m.title.vi, true, eventYear);
  const enTitle = sanitizeDispatchHeadline(m.title.en, false, eventYear);
  // The long description usually opens with what was known on the day; summaries are retrospective.
  const pick = (isVi: boolean) => {
    const lang = isVi ? "vi" : "en";
    const fromDescription = sanitizeDispatchText(m.description[lang], isVi, eventYear);
    if (fromDescription.length >= 40) return fromDescription;
    const fromSummary = sanitizeDispatchText(m.summary?.[lang], isVi, eventYear);
    return fromSummary.length >= 40 ? fromSummary : "";
  };
  const viSummary = pick(true);
  const enSummary = pick(false);

  // Asset labels sometimes carry later context in brackets, e.g. "(2000-2001 period)".
  // Also keep only the first of "Old name / New name" pairs (e.g. "Facebook / Meta Platforms").
  const cleanAsset = (name: string, isVi: boolean) =>
    name.split(/\s+\/\s+/)[0].replace(/\s*\([^)]*\)/g, (group) => (hasHindsight(group, isVi, eventYear) ? "" : group)).trim();
  const assetNameVi = cleanAsset(t(m.opportunity.asset, "vi"), true);
  const assetNameEn = cleanAsset(t(m.opportunity.asset, "en"), false);

  return {
    headline: {
      vi: viTitle || `Bản tin tài chính: Cơ hội đầu tư ${assetNameVi}`,
      en: enTitle || `Financial Wire: Investment Opportunity in ${assetNameEn}`,
    },
    dispatch: {
      vi: viSummary || `Thị trường ghi nhận nhiều biến chuyển quan trọng xoay quanh ${assetNameVi}. Giới đầu tư đang theo dõi sát sao.`,
      en: enSummary || `Markets are closely watching developments surrounding ${assetNameEn}. Analysts debate the forward path.`,
    },
    sentiment: {
      vi: `📊 Tiêu điểm thị trường: Sự chú ý dồn về ${assetNameVi}`,
      en: `📊 Market Spotlight: High volume focused on ${assetNameEn}`,
    },
  };
}
