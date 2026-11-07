import type { LocalizedText } from "../i18n";
import { mulberry32, weightedPick } from "./rng";
import { getAsset } from "./data";
import { LIFE_EVENTS, MARKET_EVENTS } from "./events";
import type { Action, AssetId, GameConfig, GameState, Holding, YearlyPrices } from "./types";

const STARTING_CAPITAL_BY_DIFFICULTY: Record<GameConfig["difficulty"], number> = {
  easy: 50_000_000,
  normal: 10_000_000,
  hard: 0,
};

const INCOME_BASE_REAL = 4_000_000; // monthly, real 2025 VND, at age 18, before difficulty scaling
const INCOME_GROWTH_PER_YEAR_OF_AGE = 0.04;

export function defaultConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  const difficulty = overrides.difficulty ?? "normal";
  return {
    country: "vn",
    startYear: overrides.startYear ?? 1990,
    startAge: overrides.startAge ?? 18,
    capitalReal: overrides.capitalReal ?? STARTING_CAPITAL_BY_DIFFICULTY[difficulty],
    difficulty,
    daily: overrides.daily,
  };
}

export function initGame(seed: number, config: GameConfig): GameState {
  return {
    v: 1,
    seed,
    rngState: seed,
    config,
    year: config.startYear,
    age: config.startAge,
    cashNominal: toNominal(config.capitalReal, config.startYear),
    savingRatePct: 20,
    holdings: [],
    pendingCards: [],
    activeCards: [],
    flags: {},
    heat: 0,
    log: [],
    history: [],
    finished: false,
  };
}

function cpi(year: number): number {
  const { vnPrices } = requireData();
  return vnPrices.cpiIndex[year] ?? vnPrices.cpiIndex[nearestYearWithData(vnPrices.cpiIndex, year)] ?? 100;
}

function nearestYearWithData(table: Record<number, number>, year: number): number {
  const years = Object.keys(table).map(Number);
  return years.reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best), years[0]);
}

/** Convert a "real" (2025-value) VND amount into nominal VND for the given year. */
export function toNominal(real: number, year: number): number {
  const base = cpi(2025);
  return real * (cpi(year) / base);
}

export function toReal(nominal: number, year: number): number {
  const base = cpi(2025);
  return nominal * (base / cpi(year));
}

let _dataRef: { vnPrices: YearlyPrices } | null = null;
export function provideData(vnPrices: YearlyPrices) {
  _dataRef = { vnPrices };
}
function requireData(): { vnPrices: YearlyPrices } {
  if (!_dataRef) throw new Error("sim engine: call provideData() before use");
  return _dataRef;
}

function assetReturn(asset: AssetId, year: number): number | undefined {
  const { vnPrices } = requireData();
  return vnPrices.returns[asset]?.[year];
}

function netWorth(state: GameState): { nominal: number; real: number } {
  let nominal = state.cashNominal;
  for (const h of state.holdings) nominal += h.units * holdingUnitValueNominal(h, state.year);
  for (const c of state.activeCards) nominal += c.investedNominal; // simple: book value until maturity resolves it
  return { nominal, real: toReal(nominal, state.year) };
}

function holdingUnitValueNominal(h: Holding, year: number): number {
  const { vnPrices } = requireData();
  const close = vnPrices.closes[h.asset]?.[year];
  if (close != null) return close;
  // Fallback: compound cost basis forward by stored returns since purchase (cash-like assets).
  return h.costBasisNominal / Math.max(1, h.units);
}

function applyAction(state: GameState, action: Action): GameState {
  const s = structuredClone(state);
  const asset = (id: AssetId) => getAsset(id)!;

  switch (action.t) {
    case "buy": {
      const def = asset(action.asset);
      const amount = Math.min(action.amount, s.cashNominal);
      if (amount <= 0) return s;
      const fee = amount * def.feeBuy;
      const net = amount - fee;
      s.cashNominal -= amount;
      const existing = s.holdings.find((h) => h.asset === action.asset);
      const unitPrice = unitPriceNominal(action.asset, s.year);
      const units = unitPrice ? net / unitPrice : net;
      if (existing) {
        existing.units += units;
        existing.costBasisNominal += net;
      } else {
        s.holdings.push({ asset: action.asset, units, boughtYear: s.year, costBasisNominal: net });
      }
      s.log.push(logLine(s.year, { vi: `Mua ${def.name.vi} bằng ${fmt(amount)}₫`, en: `Bought ${def.name.en} with ${fmt(amount)}₫` }));
      return s;
    }
    case "sell": {
      const h = s.holdings.find((x) => x.asset === action.asset);
      if (!h) return s;
      const def = asset(action.asset);
      const unitPrice = unitPriceNominal(action.asset, s.year);
      const maxValue = unitPrice ? h.units * unitPrice : h.costBasisNominal;
      const amount = Math.min(action.amount, maxValue);
      const sellUnits = unitPrice ? amount / unitPrice : amount;
      const fee = amount * def.feeSell;
      const tax = amount * (def.taxOnSell ?? 0);
      h.units -= sellUnits;
      h.costBasisNominal = Math.max(0, h.costBasisNominal - amount);
      s.cashNominal += amount - fee - tax;
      s.holdings = s.holdings.filter((x) => x.units > 1e-9);
      s.log.push(logLine(s.year, { vi: `Bán ${def.name.vi}, nhận ${fmt(amount - fee - tax)}₫`, en: `Sold ${def.name.en}, received ${fmt(amount - fee - tax)}₫` }));
      return s;
    }
    case "setSavingRate":
      s.savingRatePct = Math.max(0, Math.min(100, action.pct));
      return s;
    case "takeCard": {
      const idx = s.pendingCards.findIndex((c) => c.id === action.cardId);
      if (idx < 0) return s;
      const [card] = s.pendingCards.splice(idx, 1);
      const costNominal = toNominal(card.costReal, s.year);
      if (costNominal > s.cashNominal) return s;
      s.cashNominal -= costNominal;
      s.activeCards.push({ card, maturesYear: s.year + card.lockYears, investedNominal: costNominal });
      s.log.push(logLine(s.year, card.titleKey));
      return s;
    }
    case "skipCard": {
      s.pendingCards = s.pendingCards.filter((c) => c.id !== action.cardId);
      return s;
    }
    case "endYear":
      return s;
  }
}

function unitPriceNominal(asset: AssetId, year: number): number | undefined {
  const { vnPrices } = requireData();
  return vnPrices.closes[asset]?.[year];
}

function logLine(year: number, line: LocalizedText) {
  return { year, lines: [{ vi: line.vi ?? line.en, en: line.en }] };
}

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

/** Advance from `state.year` to `state.year + 1`: apply market returns, income, events, card maturities. */
export function advanceYear(state: GameState): GameState {
  const s = structuredClone(state);
  const rng = mulberry32(s.rngState);
  const next = () => {
    const v = rng();
    s.rngState = (s.rngState + 0x9e3779b9) | 0;
    return v;
  };

  // 1. Apply market returns to holdings for the year just ending.
  for (const h of s.holdings) {
    const r = assetReturn(h.asset, s.year);
    if (r != null) h.costBasisNominal *= 1 + r; // cost basis tracks value for cash-like/no-close assets
  }

  // 2. Income (cash-like job income scaled by age/difficulty), split by savings rate.
  const incomeReal = INCOME_BASE_REAL * 12 * (1 + INCOME_GROWTH_PER_YEAR_OF_AGE * Math.max(0, s.age - 18));
  const incomeNominal = toNominal(incomeReal, s.year);
  s.cashNominal += incomeNominal;

  // 3. Resolve maturing cards.
  s.activeCards = s.activeCards.filter((c) => {
    if (c.maturesYear > s.year + 1) return true;
    const riskJitter = c.card.risk === "high" ? 0.5 + next() : c.card.risk === "medium" ? 0.8 + next() * 0.4 : 0.95 + next() * 0.1;
    const payout = c.investedNominal * c.card.payoffMultiple * riskJitter;
    s.cashNominal += payout;
    s.log.push(
      logLine(s.year + 1, {
        vi: `Thẻ "${c.card.titleKey.vi}" đáo hạn: nhận ${fmt(payout)}₫`,
        en: `Card "${c.card.titleKey.en}" matured: received ${fmt(payout)}₫`,
      }),
    );
    return false;
  });

  // 4. Random life/market event.
  const pool = [...LIFE_EVENTS, ...MARKET_EVENTS].filter((e) => {
    const w = e.when;
    const year = s.year + 1;
    if (w.minYear && year < w.minYear) return false;
    if (w.maxYear && year > w.maxYear) return false;
    if (w.minAge && s.age + 1 < w.minAge) return false;
    if (w.maxAge && s.age + 1 > w.maxAge) return false;
    if (w.minHeat && s.heat < w.minHeat) return false;
    return true;
  });
  const picked = weightedPick(pool, next());
  if (picked) {
    const nw = netWorth(s);
    const effect = picked.effect;
    if (effect.type === "cashDelta") {
      const delta = effect.fixedReal != null ? toNominal(effect.fixedReal, s.year + 1) : nw.nominal * (effect.pctOfNetWorth ?? 0);
      s.cashNominal += delta;
    } else if (effect.type === "assetLoss") {
      const h = s.holdings.find((x) => x.asset === effect.asset);
      if (h) h.costBasisNominal *= 1 - effect.pct;
    } else if (effect.type === "heatDelta") {
      s.heat = Math.max(0, s.heat + effect.delta);
    }
    s.log.push(logLine(s.year + 1, picked.text));
  }

  // 5. Advance clock, record history.
  s.year += 1;
  s.age += 1;
  const nw = netWorth(s);
  s.history.push({ year: s.year, netWorthNominal: nw.nominal, netWorthReal: nw.real });

  return s;
}

export function applyActions(state: GameState, actions: Action[]): GameState {
  return actions.reduce((s, a) => applyAction(s, a), state);
}

export { netWorth };
