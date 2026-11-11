import { formatDate } from "./format";
import { intlLocale, type Locale } from "./i18n";
import type { Opportunity } from "./types";

/** One plain-language sentence explaining how a milestone's multiple was computed.
 *  Single rule everywhere: multiple = exitPrice × splitFactor ÷ entryPrice, prices nominal as quoted. */
export function describePriceBasis(o: Opportunity, lang: Locale): string | null {
  if (o.historicalOnly || !o.returnMultiple) return null;
  const vi = lang === "vi";
  const parts: string[] = [];
  if (o.priceObservations) {
    const e = formatDate(o.priceObservations.entry.date, lang);
    const x = formatDate(o.priceObservations.exit.date, lang);
    parts.push(vi ? `Giá mua ngày ${e}, giá bán ngày ${x}.` : `Entry observed ${e}, exit observed ${x}.`);
  }
  if (o.entryPrice != null && o.exitPrice != null) {
    if (o.splitFactor && o.splitFactor !== 1) {
      const n = new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: 3 }).format(o.splitFactor);
      parts.push(
        vi
          ? `Hệ số = giá bán × ${n} cổ phiếu (sau chia tách, cổ phiếu thưởng) ÷ giá mua. Giá theo đúng thời điểm giao dịch.`
          : `Multiple = exit price × ${n} shares (after splits and bonus issues) ÷ entry price. Prices are as quoted on each date.`,
      );
    } else {
      parts.push(vi ? "Hệ số = giá bán ÷ giá mua, theo giá tại từng thời điểm." : "Multiple = exit price ÷ entry price, as quoted on each date.");
    }
  } else {
    parts.push(vi ? "Hệ số lấy theo nguồn trích dẫn; chưa ghi nhận giá bán cụ thể." : "Multiple as reported by the cited sources; no exit price recorded.");
  }
  parts.push(vi ? "Chưa gồm cổ tức tiền mặt, thuế và phí." : "Cash dividends, taxes and fees are excluded.");
  return parts.join(" ");
}
