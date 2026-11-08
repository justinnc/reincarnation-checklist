"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { formatMoney, formatMultiple } from "@/lib/format";
import { ASSETS, assetMaxYear, computeWhatIf } from "@/lib/whatif/engine";
import type { AssetId } from "@/lib/whatif/types";

const PRESET_AMOUNTS = [1_000_000, 10_000_000, 50_000_000, 100_000_000];

const COPY = {
  vi: {
    title: "Nếu bạn đã đầu tư...",
    assetLabel: "Chọn một thứ để \"đầu tư\"",
    yearLabel: "Bắt đầu từ năm",
    amountLabel: "Số tiền bỏ ra",
    customAmount: "Số khác",
    resultPrefix: "thì đến hôm nay, bạn sẽ có",
    multiplePrefix: "— gấp",
    share: "Sao chép link kết quả",
    copied: "Đã sao chép!",
    screenshotHint: "Mẹo: chụp màn hình thẻ này để chia sẻ lên mạng xã hội.",
    caveatLabel: "Lưu ý",
    baseline: "So với để không (lạm phát ăn mòn)",
  },
  en: {
    title: "If you had invested...",
    assetLabel: "Pick something to \"invest\" in",
    yearLabel: "Starting year",
    amountLabel: "Amount",
    customAmount: "Custom",
    resultPrefix: "you would have today",
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

  const [asset, setAsset] = useState<AssetId>((params.get("asset") as AssetId) || "vn_gold");
  const [year, setYear] = useState<number>(Number(params.get("year")) || 2010);
  const [amount, setAmount] = useState<number>(Number(params.get("amount")) || 10_000_000);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const def = ASSETS.find((a) => a.id === asset)!;
  const maxYear = assetMaxYear(asset);
  const minYear = Math.max(def.minYear, 1980);

  const result = useMemo(() => {
    const y = Math.min(Math.max(year, minYear), maxYear);
    return computeWhatIf(asset, y, amount);
  }, [asset, year, amount, minYear, maxYear]);

  const baseline = useMemo(() => computeWhatIf("cash", Math.min(Math.max(year, minYear), maxYear), amount), [year, amount, minYear, maxYear]);

  const syncUrl = (next: { asset?: AssetId; year?: number; amount?: number }) => {
    const a = next.asset ?? asset;
    const y = next.year ?? year;
    const amt = next.amount ?? amount;
    const sp = new URLSearchParams({ asset: a, year: String(y), amount: String(amt) });
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const pickAsset = (id: AssetId) => {
    const newMax = assetMaxYear(id);
    const newDef = ASSETS.find((a) => a.id === id)!;
    const newMin = Math.max(newDef.minYear, 1980);
    const y = Math.min(Math.max(year, newMin), newMax);
    setAsset(id);
    setYear(y);
    syncUrl({ asset: id, year: y });
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-faint">{copy.assetLabel}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ASSETS.map((a) => (
            <button
              key={a.id}
              onClick={() => pickAsset(a.id)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                asset === a.id ? "border-gold bg-gold/10 font-semibold" : "border-line text-muted hover:border-line-strong"
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
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">{copy.amountLabel}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((p) => (
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
                {formatMoney(p, "VND", lang)}
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
          {def.icon} {def.label[lang]} · {year} → {result.endYear}
        </p>
        <p className="mt-3 font-display text-4xl font-extrabold text-gold sm:text-5xl">
          {formatMoney(result.finalValue, "VND", lang)}
        </p>
        <p className="mt-1 text-muted">
          {copy.multiplePrefix} {formatMultiple(result.multiple, lang)} {copy.resultPrefix.replace(copy.multiplePrefix, "")}
        </p>
        {asset !== "cash" && (
          <p className="mt-3 text-xs text-faint">
            {copy.baseline}: {formatMoney(baseline.finalValue, "VND", lang)} ({formatMultiple(baseline.multiple, lang)})
          </p>
        )}
        {def.caveat && <p className="mx-auto mt-4 max-w-md text-xs text-faint">⚠️ {copy.caveatLabel}: {def.caveat[lang]}</p>}
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
