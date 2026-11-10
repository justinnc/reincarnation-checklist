"use client";

import type { SurvivalRun, DecisionResult, SurvivalRank } from "./survival";
import type { Locale } from "./i18n";
import { t } from "./i18n";

/**
 * Generates a luxury, high-fidelity Reincarnation Pass Card (3:4 portrait)
 * with security guilloche patterns, gold foil accents, EMV chip, official seal stamp,
 * and crisp typography ready for social media bragging.
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
  // High-resolution 3:4 portrait card (ideal for Story, Feed & Mobile viewing)
  const width = 840;
  const height = 1180;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context");

  // ---------------------------------------------------------
  // 1. BASE BACKGROUND: Deep Obsidian with Radial Vignette
  // ---------------------------------------------------------
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.35,
    80,
    width / 2,
    height * 0.5,
    width * 0.85
  );
  bgGrad.addColorStop(0, "#161922");
  bgGrad.addColorStop(0.55, "#0c0e14");
  bgGrad.addColorStop(1, "#050608");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // ---------------------------------------------------------
  // 2. SECURITY GUILLOCHÉ & GEOMETRIC TIME-GRID BACKGROUND
  // ---------------------------------------------------------
  ctx.save();
  ctx.strokeStyle = "rgba(234, 179, 8, 0.045)";
  ctx.lineWidth = 1;

  // Circular guilloche waves
  for (let r = 80; r < 750; r += 38) {
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.38, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crossed safety lattice lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // ---------------------------------------------------------
  // 3. GOLD FOIL MULTI-LAYER BORDERS & CORNER ART DECO
  // ---------------------------------------------------------
  const margin = 28;
  const innerM = 38;

  // Outer border with subtle gold shine
  const goldBorderGrad = ctx.createLinearGradient(0, 0, width, height);
  goldBorderGrad.addColorStop(0, "#eab308");
  goldBorderGrad.addColorStop(0.25, "#ca8a04");
  goldBorderGrad.addColorStop(0.5, "#fef08a");
  goldBorderGrad.addColorStop(0.75, "#ca8a04");
  goldBorderGrad.addColorStop(1, "#eab308");

  ctx.save();
  ctx.strokeStyle = goldBorderGrad;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Inner fine border
  ctx.strokeStyle = "rgba(234, 179, 8, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(innerM, innerM, width - innerM * 2, height - innerM * 2);

  // Corner Art Deco Flourishes
  const drawCornerDeco = (cx: number, cy: number, sx: number, sy: number) => {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + sx * 28, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * 28);
    ctx.stroke();

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(cx + sx * 10, cy + sy * 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCornerDeco(margin, margin, 1, 1);
  drawCornerDeco(width - margin, margin, -1, 1);
  drawCornerDeco(margin, height - margin, 1, -1);
  drawCornerDeco(width - margin, height - margin, -1, -1);
  ctx.restore();

  // ---------------------------------------------------------
  // 4. HEADER: MINISTRY OF REINCARNATION & CARD SERIAL
  // ---------------------------------------------------------
  // Header Pill / Crest
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(
    lang === "vi"
      ? "BỘ QUẢN LÝ THỜI GIAN & ĐẦU THAI QUỐC TẾ"
      : "MINISTRY OF TEMPORAL REINCARNATION & DESTINY",
    width / 2,
    70
  );

  ctx.fillStyle = goldBorderGrad;
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText(
    lang === "vi" ? "THẺ CĂN CƯỚC TRỌNG SINH" : "REINCARNATION IDENTITY PASS",
    width / 2,
    102
  );

  // Serial Number
  const hashSeed = Math.abs(run.startYear * 31 + run.initialCapital * 7 + netWorth);
  const cardSerial = `RC-${run.startYear}-${run.country.code}-${String((hashSeed % 9000) + 1000)}`;
  ctx.fillStyle = "#ca8a04";
  ctx.font = "700 12px ui-monospace, Menlo, Consolas, monospace";
  ctx.letterSpacing = "2px";
  ctx.fillText(`DOCUMENT NO: ${cardSerial} · SPECIAL CLEARANCE`, width / 2, 126);

  // Horizontal Divider
  const divGrad = ctx.createLinearGradient(70, 0, width - 70, 0);
  divGrad.addColorStop(0, "rgba(234, 179, 8, 0)");
  divGrad.addColorStop(0.5, "rgba(234, 179, 8, 0.45)");
  divGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 142);
  ctx.lineTo(width - 70, 142);
  ctx.stroke();

  // ---------------------------------------------------------
  // 5. TOP SECTION: GOLD CHIP + AWAKENING PROFILE
  // ---------------------------------------------------------
  const topY = 160;

  // 5.1 EMV Gold Security Chip (Left)
  const chipX = 64;
  const chipY = topY + 12;
  const chipW = 74;
  const chipH = 56;

  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  chipGrad.addColorStop(0, "#eab308");
  chipGrad.addColorStop(0.5, "#fef08a");
  chipGrad.addColorStop(1, "#b45309");
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 8);
  ctx.fill();
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chip circuits
  ctx.strokeStyle = "rgba(120, 53, 15, 0.65)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(chipX + 24, chipY);
  ctx.lineTo(chipX + 24, chipY + chipH);
  ctx.moveTo(chipX + 50, chipY);
  ctx.lineTo(chipX + 50, chipY + chipH);
  ctx.moveTo(chipX, chipY + 28);
  ctx.lineTo(chipX + chipW, chipY + 28);
  ctx.stroke();
  ctx.strokeRect(chipX + 24, chipY + 16, 26, 24);

  // 5.2 Awakening Identity Info
  ctx.textAlign = "left";
  ctx.letterSpacing = "normal";

  const profileX = 160;
  ctx.fillStyle = "#64748b";
  ctx.font = "700 11px ui-monospace, monospace";
  ctx.fillText(lang === "vi" ? "ĐIỂM ĐÁP ĐẦU THAI" : "AWAKENING COORDINATES", profileX, topY + 20);

  const countryName = `${run.country.flag} ${t(run.country.name, lang)}  (${run.country.code})`;
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  // Clamp country name to fit within profile area (max width ~580px from x=160)
  const maxCountryWidth = 580;
  const countryMetrics = ctx.measureText(countryName);
  const displayCountryName = countryMetrics.width > maxCountryWidth
    ? countryName.slice(0, Math.floor(countryName.length * maxCountryWidth / countryMetrics.width)) + "…"
    : countryName;
  ctx.fillText(displayCountryName, profileX, topY + 50);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(
    lang === "vi"
      ? `Thức tỉnh: Năm ${run.startYear} · 18 tuổi · Vốn: $${run.initialCapital.toLocaleString()}`
      : `Reincarnated: Year ${run.startYear} · Age 18 · Initial: $${run.initialCapital.toLocaleString()}`,
    profileX,
    topY + 76
  );

  // ---------------------------------------------------------
  // 6. CENTERPIECE: 3D RANK BADGE & HONORARY TITLE
  // ---------------------------------------------------------
  const rankBoxY = 275;
  const rankBoxH = 265;
  const rankBoxW = width - 128;
  const rankBoxX = 64;

  // Glowing container background for Rank
  const rankBoxGrad = ctx.createLinearGradient(0, rankBoxY, 0, rankBoxY + rankBoxH);
  rankBoxGrad.addColorStop(0, "rgba(26, 30, 42, 0.85)");
  rankBoxGrad.addColorStop(1, "rgba(14, 17, 24, 0.95)");
  ctx.fillStyle = rankBoxGrad;
  ctx.beginPath();
  ctx.roundRect(rankBoxX, rankBoxY, rankBoxW, rankBoxH, 18);
  ctx.fill();

  // Gold edge with glow
  ctx.strokeStyle = "rgba(234, 179, 8, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rank Emblem circular halo
  const haloGrad = ctx.createRadialGradient(
    width / 2,
    rankBoxY + 70,
    10,
    width / 2,
    rankBoxY + 70,
    90
  );
  haloGrad.addColorStop(0, "rgba(234, 179, 8, 0.25)");
  haloGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(width / 2, rankBoxY + 70, 90, 0, Math.PI * 2);
  ctx.fill();

  // Badge Emoji
  ctx.textAlign = "center";
  ctx.font = "68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(finalRank.badge, width / 2, rankBoxY + 80);

  // Rank Title
  ctx.fillStyle = goldBorderGrad;
  ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(t(finalRank.title, lang).toUpperCase(), width / 2, rankBoxY + 145);

  // Rank Description
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(t(finalRank.description, lang), width / 2, rankBoxY + 178);

  // Badge level subtitle / status pill
  ctx.fillStyle = "rgba(234, 179, 8, 0.12)";
  ctx.beginPath();
  ctx.roundRect(width / 2 - 140, rankBoxY + 205, 280, 32, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#facc15";
  ctx.font = "700 12px ui-monospace, monospace";
  ctx.letterSpacing = "1px";
  ctx.fillText(
    lang === "vi" ? "★ CHỨNG NHẬN ĐẲNG CẤP LUÂN HỒI ★" : "★ OFFICIALLY VERIFIED SURVIVOR ★",
    width / 2,
    rankBoxY + 225
  );

  // ---------------------------------------------------------
  // 7. FINANCIAL PERFORMANCE: BIG NET WORTH & ROI BADGE
  // ---------------------------------------------------------
  const finY = 565;
  const finBoxH = 185;
  const finBoxW = width - 128;
  const finBoxX = 64;

  ctx.fillStyle = "rgba(18, 21, 30, 0.75)";
  ctx.beginPath();
  ctx.roundRect(finBoxX, finY, finBoxW, finBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left Column: Final Net Worth
  ctx.textAlign = "left";
  ctx.letterSpacing = "normal";

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 12px ui-monospace, monospace";
  ctx.fillText(
    lang === "vi" ? "TỔNG TÀI SẢN THU VỀ" : "FINAL NET WORTH",
    finBoxX + 28,
    finY + 38
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  // Clamp net worth text to fit within financial box (max width ~520px from x=28)
  const netWorthText = `$${netWorth.toLocaleString()}`;
  const maxNetWorthWidth = 520;
  const netWorthMetrics = ctx.measureText(netWorthText);
  const displayNetWorth = netWorthMetrics.width > maxNetWorthWidth
    ? netWorthText.slice(0, Math.floor(netWorthText.length * maxNetWorthWidth / netWorthMetrics.width)) + "…"
    : netWorthText;
  ctx.fillText(displayNetWorth, finBoxX + 28, finY + 95);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(
    lang === "vi"
      ? `Vốn gốc: $${run.initialCapital.toLocaleString()} USD · Chu kỳ 5 ngã rẽ`
      : `Base: $${run.initialCapital.toLocaleString()} USD · 5 Epoch Cycle`,
    finBoxX + 28,
    finY + 130
  );

  // Right Column: ROI multiplier & Success Count
  const roi = (netWorth / run.initialCapital).toFixed(1);
  const isProfitable = netWorth >= run.initialCapital;

  // ROI Pill
  const pillX = finBoxX + finBoxW - 200;
  const pillY = finY + 36;
  ctx.fillStyle = isProfitable ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)";
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, 172, 54, 12);
  ctx.fill();
  ctx.strokeStyle = isProfitable ? "#22c55e" : "#ef4444";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = isProfitable ? "#4ade80" : "#f87171";
  ctx.font = "800 24px ui-monospace, monospace";
  ctx.fillText(`${roi}× ROI`, pillX + 86, pillY + 36);

  const wins = results.filter((r) => r.isSuccess).length;
  ctx.textAlign = "right";
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(
    lang === "vi" ? `Thắng ${wins}/5 ngã rẽ lịch sử` : `Won ${wins}/5 Historical Epochs`,
    finBoxX + finBoxW - 28,
    finY + 130
  );

  // ---------------------------------------------------------
  // 8. 5 TURNING POINTS TIMELINE CHIPS
  // ---------------------------------------------------------
  const turnsY = 775;
  const turnsH = 155;
  const turnsW = width - 128;
  const turnsX = 64;

  ctx.fillStyle = "rgba(18, 21, 30, 0.75)";
  ctx.beginPath();
  ctx.roundRect(turnsX, turnsY, turnsW, turnsH, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 12px ui-monospace, monospace";
  ctx.fillText(
    lang === "vi" ? "HÀNH TRÌNH 5 MỐC ĐỊNH MỆNH" : "5 TURNING POINTS RECORD",
    turnsX + 28,
    turnsY + 36
  );

  const chipSlotW = (turnsW - 56) / 5;
  results.forEach((r, idx) => {
    const cx = turnsX + 28 + idx * chipSlotW + 4;
    const cy = turnsY + 54;
    const cw = chipSlotW - 8;
    const ch = 74;

    ctx.fillStyle = r.isSuccess ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)";
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 10);
    ctx.fill();
    ctx.strokeStyle = r.isSuccess ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 13px ui-monospace, monospace";
    ctx.fillText(String(r.round.year), cx + cw / 2, cy + 24);

    ctx.fillStyle = r.isSuccess ? "#4ade80" : "#f87171";
    ctx.font = "800 15px -apple-system, sans-serif";
    const statusText = r.isSuccess ? "✓ THẮNG" : "✗ DÍNH";
    const maxStatusWidth = cw - 16;
    const statusMetrics = ctx.measureText(statusText);
    const displayStatus = statusMetrics.width > maxStatusWidth
      ? statusText.slice(0, Math.floor(statusText.length * maxStatusWidth / statusMetrics.width)) + "…"
      : statusText;
    ctx.fillText(displayStatus, cx + cw / 2, cy + 46);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 11px ui-monospace, monospace";
    const decisionText = r.decision === "all_in" ? "100%" : r.decision === "cautious" ? "25%" : "0%";
    ctx.fillText(decisionText, cx + cw / 2, cy + 64);
  });

  // ---------------------------------------------------------
  // 9. RED OFFICIAL CIRCULAR STAMP (VINTAGE TILTED SEAL)
  // ---------------------------------------------------------
  ctx.save();
  const stampX = width - 150;
  const stampY = turnsY + turnsH - 30;
  ctx.translate(stampX, stampY);
  ctx.rotate((-14 * Math.PI) / 180); // Tilted 14 degrees

  ctx.strokeStyle = "rgba(220, 38, 38, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 51, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
  ctx.font = "900 10px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";
  ctx.fillText("BỘ QUẢN LÝ THỜI GIAN", 0, -28);
  ctx.font = "900 14px ui-monospace, monospace";
  ctx.fillText("ĐÃ XÁC THỰC", 0, 4);
  ctx.font = "800 11px ui-monospace, monospace";
  ctx.fillText("★ APPROVED ★", 0, 24);
  ctx.font = "700 8px monospace";
  ctx.fillText(`SEQ: ${hashSeed.toString(16).toUpperCase()}`, 0, 38);
  ctx.restore();

  // ---------------------------------------------------------
  // 10. FOOTER: BARCODE, SECURITY HASH & WATERMARK
  // ---------------------------------------------------------
  const footY = 960;

  // Barcode simulation
  ctx.save();
  const barX = 74;
  const barY = footY + 15;
  const barW = width - 148;
  const barH = 46;

  ctx.fillStyle = "#ffffff";
  let currX = barX;
  // Deterministic barcode lines based on run
  for (let b = 0; currX < barX + barW - 20; b++) {
    const lw = ((b * 7 + hashSeed) % 4) + 1.5;
    const gap = ((b * 13 + hashSeed) % 3) + 2;
    ctx.fillRect(currX, barY, lw, barH);
    currX += lw + gap;
  }

  // Machine readable MRZ string - truncate to fit
  const mrz1 = `P<${run.country.code}REINCARNATION<<${run.startYear}<<<<<<<<<<<<<<<<<<<<<<<`;
  const mrz2 = `${cardSerial}<<<<<<NETWORTH<${netWorth}<<<<ROI<${roi}<<<<`;
  const maxMrzWidth = width - 140;
  const mrz1Metrics = ctx.measureText(mrz1);
  const mrz2Metrics = ctx.measureText(mrz2);
  const displayMrz1 = mrz1Metrics.width > maxMrzWidth ? mrz1.slice(0, Math.floor(mrz1.length * maxMrzWidth / mrz1Metrics.width)) + "…" : mrz1;
  const displayMrz2 = mrz2Metrics.width > maxMrzWidth ? mrz2.slice(0, Math.floor(mrz2.length * maxMrzWidth / mrz2Metrics.width)) + "…" : mrz2;
  ctx.fillText(displayMrz1, width / 2, footY + 84);
  ctx.fillText(displayMrz2, width / 2, footY + 104);

  // URL branding watermark
  ctx.fillStyle = "#eab308";
  ctx.font = "700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("REINCARNATION-CHECKLIST.COM", width / 2, footY + 138);
  ctx.restore();

  return canvas.toDataURL("image/png");
}
