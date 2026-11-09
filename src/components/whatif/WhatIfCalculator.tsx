"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { formatMoney, formatMultiple } from "@/lib/format";
import { countries } from "@/lib/data";
import Link from "next/link";
import { assetMaxYear, assetsForCountry, cashBaseline, computeWhatIf, PRE_BOUNDARY_NOTE } from "@/lib/whatif/engine";

const PRESET_AMOUNTS_VND = [1_000_000, 10_000_000, 50_000_000, 100_000_000];
const PRESET_AMOUNTS_USD = [100, 1_000, 10_000, 100_000];

const COPY = {
  vi: {
    countryLabel: "Quốc gia",
    assetLabel: "Chọn một thứ để \"đầu tư\"",
    universalHeading: "Đầu tư xuyên quốc gia (tính bằng USD)",
    localHeading: "Thị trường trong nước",
    noLocalNote: "Quốc gia này chưa có dữ liệu thị trường nội địa (lãi suất, chứng khoán riêng) — hiện chỉ có các tài sản đầu tư xuyên quốc gia dưới đây.",
    yearLabel: "Bắt đầu từ năm",
    amountLabel: "Số tiền bỏ ra",
    customAmount: "Số khác",
    resultPrefix: "số tiền ban đầu bạn bỏ ra",
    multiplePrefix: "— gấp",
    share: "Sao chép link kết quả",
    copied: "Đã sao chép!",
    screenshotHint: "Mẹo: chụp màn hình thẻ này để chia sẻ lên mạng xã hội.",
    caveatLabel: "Lưu ý",
    baseline: "So với để không (lạm phát ăn mòn)",
  },
  en: {
    countryLabel: "Country",
    assetLabel: "Pick something to \"invest\" in",
    universalHeading: "Cross-border investments (in USD)",
    localHeading: "Domestic market",
    noLocalNote: "This country has no local-market dataset yet (savings rate, local stock index) — only the cross-border assets below are available.",
    yearLabel: "Starting year",
    amountLabel: "Amount",
    customAmount: "Custom",
    resultPrefix: "your original stake",
    multiplePrefix: "— that's",
    share: "Copy result link",
    copied: "Copied!",
    screenshotHint: "Tip: screenshot this card to share it.",
    caveatLabel: "Note",
    baseline: "vs. doing nothing (inflation erodes it)",
  },
};

export default function WhatIfCalculator({ lang }: { lang: Locale }) {
  const copy = COPY[lang];
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [country, setCountry] = useState(params.get("country") || "vn");
  const assets = useMemo(() => assetsForCountry(country), [country]);
  const [assetId, setAssetId] = useState(params.get("asset") || assets[0]?.id || "vn_gold");
  const [year, setYear] = useState<number>(Number(params.get("year")) || 2010);
  const [amount, setAmount] = useState<number>(Number(params.get("amount")) || 10_000_000);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const asset = assets.find((a) => a.id === assetId) ?? assets[0];
  const maxYear = assetMaxYear(asset);
  const minYear = Math.max(asset.minYear, 1980);
  const presets = asset.currency === "USD" ? PRESET_AMOUNTS_USD : PRESET_AMOUNTS_VND;

  const result = useMemo(() => {
    const y = Math.min(Math.max(year, minYear), maxYear);
    return computeWhatIf(asset, y, amount);
  }, [asset, year, amount, minYear, maxYear]);

  const baseline = useMemo(() => {
    const y = Math.min(Math.max(year, minYear), maxYear);
    return cashBaseline(country, y, amount);
  }, [country, year, amount, minYear, maxYear]);

  const syncUrl = (next: { country?: string; asset?: string; year?: number; amount?: number }) => {
    const sp = new URLSearchParams({
      country: next.country ?? country,
      asset: next.asset ?? assetId,
      year: String(next.year ?? year),
      amount: String(next.amount ?? amount),
    });
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const DEFAULT_AMOUNT_VND = 10_000_000;
  const DEFAULT_AMOUNT_USD = 1_000;

  const pickCountry = (code: string) => {
    const newAssets = assetsForCountry(code);
    const newAsset = newAssets[0];
    const newMax = assetMaxYear(newAsset);
    const newMin = Math.max(newAsset.minYear, 1980);
    const y = Math.min(Math.max(year, newMin), newMax);
    const currencyChanged = newAsset.currency !== asset.currency;
    const newAmount = currencyChanged ? (newAsset.currency === "USD" ? DEFAULT_AMOUNT_USD : DEFAULT_AMOUNT_VND) : amount;
    setCountry(code);
    setAssetId(newAsset.id);
    setYear(y);
    if (currencyChanged) {
      setAmount(newAmount);
      setCustomAmount("");
    }
    syncUrl({ country: code, asset: newAsset.id, year: y, amount: newAmount });
  };

  const pickAsset = (id: string) => {
    const newAsset = assets.find((a) => a.id === id)!;
    const newMax = assetMaxYear(newAsset);
    const newMin = Math.max(newAsset.minYear, 1980);
    const y = Math.min(Math.max(year, newMin), newMax);
    const currencyChanged = newAsset.currency !== asset.currency;
    const newAmount = currencyChanged ? (newAsset.currency === "USD" ? DEFAULT_AMOUNT_USD : DEFAULT_AMOUNT_VND) : amount;
    setAssetId(id);
    setYear(y);
    if (currencyChanged) {
      setAmount(newAmount);
      setCustomAmount("");
    }
    syncUrl({ asset: id, year: y, amount: newAmount });
  };

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, ignore */
    }
  };

  const localAssets = assets.filter((a) => a.scope === "local");
  const universalAssets = assets.filter((a) => a.scope === "universal");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-faint">{copy.countryLabel}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => pickCountry(c.code)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                country === c.code ? "border-gold bg-gold/10 font-semibold" : "border-line text-muted hover:border-line-strong"
              }`}
            >
              {c.flag} {c.name[lang]}
            </button>
          ))}
        </div>

        {localAssets.length === 0 && <p className="mt-3 text-xs text-faint">{copy.noLocalNote}</p>}

        {PRE_BOUNDARY_NOTE[country] && (
          <p className="mt-3 rounded-lg bg-gold/10 p-3 text-xs text-muted">
            💡 {PRE_BOUNDARY_NOTE[country].text[lang]}{" "}
            <Link href={`/${lang}/${country}/${PRE_BOUNDARY_NOTE[country].milestoneId}`} className="font-semibold text-gold underline">
              {lang === "vi" ? "Xem mốc lịch sử →" : "See the milestone →"}
            </Link>
          </p>
        )}

        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-faint">{copy.assetLabel}</p>
        {localAssets.length > 0 && (
          <>
            <p className="mt-2 text-xs text-faint">{copy.localHeading}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {localAssets.map((a) => (
                <button
                  key={a.id}
                  onClick={() => pickAsset(a.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    assetId === a.id ? "border-gold bg-gold/10 font-semibold" : "border-line text-muted hover:border-line-strong"
                  }`}
                >
                  <span className="mr-1.5">{a.icon}</span>
                  {a.label[lang]}
                </button>
              ))}
            </div>
          </>
        )}
        <p className="mt-3 text-xs text-faint">{copy.universalHeading}</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {universalAssets.map((a) => (
            <button
              key={a.id}
              onClick={() => pickAsset(a.id)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                assetId === a.id ? "border-gold bg-gold/10 font-semibold" : "border-line text-muted hover:border-line-strong"
              }`}
            >
              <span className="mr-1.5">{a.icon}</span>
              {a.label[lang]}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold uppercase tracking-wider text-faint">{copy.yearLabel}</span>
            <span className="font-mono text-lg font-bold text-gold">{year}</span>
          </div>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={Math.min(Math.max(year, minYear), maxYear)}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              syncUrl({ year: y });
            }}
            className="mt-2 w-full accent-[#f4b740]"
          />
          <div className="flex justify-between text-xs text-faint">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">
            {copy.amountLabel} ({asset.currency})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setAmount(p);
                  setCustomAmount("");
                  syncUrl({ amount: p });
                }}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  amount === p && !customAmount ? "border-gold bg-gold/10 font-semibold" : "border-line text-muted"
                }`}
              >
                {formatMoney(p, asset.currency, lang)}
              </button>
            ))}
            <input
              type="number"
              placeholder={copy.customAmount}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                const v = Number(e.target.value);
                if (v > 0) {
                  setAmount(v);
                  syncUrl({ amount: v });
                }
              }}
              className="w-28 rounded-full border border-line bg-raised px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-8 text-center">
        <p className="text-sm text-muted">
          {asset.icon} {asset.label[lang]} · {year} → {result.endYear}
        </p>
        <p className="mt-3 font-display text-4xl font-extrabold text-gold sm:text-5xl">
          {formatMoney(result.finalValue, result.currency, lang)}
        </p>
        <p className="mt-1 text-muted">
          {copy.multiplePrefix} {formatMultiple(result.multiple, lang)} {copy.resultPrefix}
        </p>
        {baseline && asset.id !== `${country}_cash` && (
          <p className="mt-3 text-xs text-faint">
            {copy.baseline}: {formatMoney(baseline.finalValue, baseline.currency, lang)} ({formatMultiple(baseline.multiple, lang)})
          </p>
        )}
        {asset.caveat && <p className="mx-auto mt-4 max-w-md text-xs text-faint">⚠️ {copy.caveatLabel}: {asset.caveat[lang]}</p>}
        <p className="mt-5 text-xs text-faint">{copy.screenshotHint}</p>
        <button
          onClick={copyLink}
          className="mt-3 rounded-full border border-line-strong px-5 py-2 text-sm font-semibold text-muted hover:text-ink"
        >
          {copied ? copy.copied : copy.share}
        </button>
      </div>
    </div>
  );
}
