import { allMilestones, countries, getCountry, yearOf } from "./data";
import type { Locale } from "./i18n";
import { t } from "./i18n";
import type { Country, Milestone } from "./types";

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
  initialCapital: number;
  rounds: SurvivalRound[];
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

function cleanHindsightSpoilers(text: string | undefined, isVi: boolean): string {
  if (!text) return "";
  if (isVi) {
    return text
      .replace(/—\s*chưa từng chia tách.*/i, "")
      .replace(/từ\s+\d+[\d.,]*\s*(?:USD|CAD|EUR|VND|đồng)?\s*leo lên\s+\d+[\d.,]*\s*(?:USD|CAD|EUR|VND|đồng)?/gi, "ghi nhận lực cầu mua vào gia tăng mạnh mẽ")
      .replace(/vượt mốc\s+\d+[\d.,]*\s*(?:tỷ|triệu)?\s*(?:USD|CAD|EUR|VND)?/gi, "thu hút dòng tiền quy mô lớn")
      .replace(/tăng\s+\d+[\d.,]*\s*lần/gi, "bước vào chu kỳ tăng trưởng")
      .replace(/giảm\s+\d+[\d.,]*%/gi, "biến động mạnh")
      .replace(/mất\s+\d+[\d.,]*%/gi, "đối mặt áp lực điều chỉnh")
      .trim();
  }
  return text
    .replace(/—\s*and has never split.*/i, "")
    .replace(/went from\s+[\$€£]?\d+[\d.,]*\s*to\s+[\$€£]?\d+[\d.,]*/gi, "experienced strong buying momentum")
    .replace(/soared to\s+[\$€£]?\d+[\d.,]*/gi, "attracted massive investor inflows")
    .replace(/over\s+\d+[\d.,]*x/gi, "solid historical momentum")
    .replace(/dropped\s+\d+[\d.,]*%/gi, "facing market volatility")
    .replace(/plunged\s+\d+[\d.,]*%/gi, "under high trading volatility")
    .trim();
}

export function getContemporaryDispatch(round: SurvivalRound): ContemporaryDispatch {
  const m = round.milestone;
  if (CONTEMPORARY_TRAP_DISPATCHES[m.id]) {
    return CONTEMPORARY_TRAP_DISPATCHES[m.id];
  }

  const viTitle = cleanHindsightSpoilers(m.title.vi, true);
  const enTitle = cleanHindsightSpoilers(m.title.en, false);
  const viSummary = cleanHindsightSpoilers(m.summary ? m.summary.vi : m.description.vi, true);
  const enSummary = cleanHindsightSpoilers(m.summary ? m.summary.en : m.description.en, false);

  const assetNameVi = t(m.opportunity.asset, "vi");
  const assetNameEn = t(m.opportunity.asset, "en");

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
