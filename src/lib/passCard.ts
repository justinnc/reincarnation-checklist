"use client";

import type { SurvivalRun, DecisionResult, SurvivalRank } from "./survival";
import type { Locale } from "./i18n";
import { t } from "./i18n";

/**
 * Generates a high-resolution PNG image of the Reincarnation Pass
 * for sharing on social networks (Facebook, Twitter/X, Instagram).
 */
export async function generateReincarnationPassCard({
  run,
  results,
  finalRank,
  netWorth,
  lang,
}: {
  run: SurvivalRun;
  results: DecisionResult[];
  finalRank: SurvivalRank;
  netWorth: number;
  lang: Locale;
}): Promise<string> {
  const width = 1200;
  const height = 675; // Standard 16:9 social share ratio

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context");

  // 1. Dark futuristic luxury background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0a0b0f");
  bgGrad.addColorStop(0.5, "#12151d");
  bgGrad.addColorStop(1, "#0a0b0f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Radial gold glow from center-top
  const glow = ctx.createRadialGradient(width / 2, 80, 10, width / 2, 80, 500);
  glow.addColorStop(0, "rgba(234, 179, 8, 0.15)");
  glow.addColorStop(1, "rgba(234, 179, 8, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // 2. Ornate dual-layer gold borders
  ctx.strokeStyle = "rgba(234, 179, 8, 0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = "rgba(234, 179, 8, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Corner accents
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + dx * 24, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 24);
    ctx.stroke();
  };
  drawCorner(30, 30, 1, 1);
  drawCorner(width - 30, 30, -1, 1);
  drawCorner(30, height - 30, 1, -1);
  drawCorner(width - 30, height - 30, -1, -1);

  // 3. Header: App title & Certificate badge
  ctx.textAlign = "center";
  ctx.fillStyle = "#eab308";
  ctx.font = "700 14px monospace";
  ctx.fillText(
    lang === "vi"
      ? "THE REINCARNATION CHECKLIST · CHỨNG NHẬN TRỌNG SINH"
      : "THE REINCARNATION CHECKLIST · REINCARNATION PASS",
    width / 2,
    75
  );

  // 4. Large Rank Badge Emoji & Title
  ctx.font = "64px serif";
  ctx.fillText(finalRank.badge, width / 2, 155);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 36px sans-serif";
  ctx.fillText(t(finalRank.title, lang), width / 2, 210);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 16px sans-serif";
  ctx.fillText(t(finalRank.description, lang), width / 2, 240);

  // 5. Grid Box: Left (Identity), Right (Performance)
  const boxY = 275;
  const boxH = 240;
  const boxW = 520;
  const box1X = 65;
  const box2X = 615;

  // Box 1: Awakening Identity
  ctx.fillStyle = "rgba(24, 27, 35, 0.7)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.roundRect(box1X, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#64748b";
  ctx.font = "700 12px monospace";
  ctx.fillText(lang === "vi" ? "HỒ SƠ ĐẦU THAI" : "AWAKENING IDENTITY", box1X + 24, boxY + 36);

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 20px sans-serif";
  ctx.fillText(
    `${run.country.flag} ${t(run.country.name, lang)} (${run.country.code})`,
    box1X + 24,
    boxY + 74
  );

  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 15px sans-serif";
  ctx.fillText(
    lang === "vi" ? `Thức tỉnh năm: ${run.startYear} (18 tuổi)` : `Awakened: ${run.startYear} (Age 18)`,
    box1X + 24,
    boxY + 104
  );

  ctx.fillText(
    lang === "vi" ? `Vốn ban đầu: $${run.initialCapital.toLocaleString()}` : `Starting capital: $${run.initialCapital.toLocaleString()}`,
    box1X + 24,
    boxY + 132
  );

  // Timeline pills
  ctx.fillStyle = "#64748b";
  ctx.font = "700 11px monospace";
  ctx.fillText(lang === "vi" ? "5 NGÃ RẼ LỊCH SỬ:" : "5 TURNING POINTS:", box1X + 24, boxY + 172);

  results.forEach((r, idx) => {
    const px = box1X + 24 + idx * 88;
    const py = boxY + 188;
    ctx.fillStyle = r.isSuccess ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)";
    ctx.strokeStyle = r.isSuccess ? "#22c55e" : "#ef4444";
    ctx.roundRect(px, py, 76, 26, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = r.isSuccess ? "#4ade80" : "#f87171";
    ctx.font = "600 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${r.round.year} ${r.isSuccess ? "✓" : "✗"}`, px + 38, py + 17);
  });

  // Box 2: Financial Scorecard
  ctx.fillStyle = "rgba(24, 27, 35, 0.7)";
  ctx.strokeStyle = "rgba(234, 179, 8, 0.3)";
  ctx.roundRect(box2X, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#eab308";
  ctx.font = "700 12px monospace";
  ctx.fillText(lang === "vi" ? "KẾT QUẢ TÀI SẢN" : "FINANCIAL SCORECARD", box2X + 24, boxY + 36);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 44px sans-serif";
  ctx.fillText(`$${netWorth.toLocaleString()}`, box2X + 24, boxY + 90);

  const mult = (netWorth / run.initialCapital).toFixed(1);
  ctx.fillStyle = "#eab308";
  ctx.font = "700 24px monospace";
  ctx.fillText(`${mult}× ROI`, box2X + 24, boxY + 130);

  const wins = results.filter((r) => r.isSuccess).length;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 15px sans-serif";
  ctx.fillText(
    lang === "vi"
      ? `Thắng: ${wins}/5 ngã rẽ · Vượt đỉnh chu kỳ`
      : `Decisions: ${wins}/5 correct · Survived cycle`,
    box2X + 24,
    boxY + 168
  );

  ctx.fillStyle = "#475569";
  ctx.font = "400 13px sans-serif";
  ctx.fillText(
    lang === "vi"
      ? "Dựa trên dữ liệu giá tài sản thực tế trong lịch sử."
      : "Grounded in historical real asset price benchmarks.",
    box2X + 24,
    boxY + 196
  );

  // 6. Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748b";
  ctx.font = "500 13px sans-serif";
  ctx.fillText(
    "reincarnation-checklist.com · Trọng sinh về quá khứ với toàn bộ ký ức",
    width / 2,
    height - 50
  );

  return canvas.toDataURL("image/png");
}
