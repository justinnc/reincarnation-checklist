export function fmtVnd(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1_000_000) return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " \u20ab";
  return new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "long" }).format(n) + " \u20ab";
}

export function stakeLabel(stake: "quarter" | "half" | "all", size: "big" | "small" = "big"): string {
  const labels: Record<string, string> = {
    "quarter-big": "1/4 túi", "quarter-small": "1/8 túi",
    "half-big": "1/2 túi", "half-small": "1/4 túi",
    "all-big": "Cả túi", "all-small": "1/2 túi",
  };
  return labels[`${stake}-${size}`];
}

export function oddsBar(winIn10: number): string[] {
  return Array.from({ length: 10 }, (_, i) => (i < winIn10 ? "win" : "lose"));
}

export function heartColor(heart: number): "green" | "yellow" | "red" {
  if (heart >= 7) return "green";
  if (heart >= 4) return "yellow";
  return "red";
}

export function heartStatusLabel(heart: number): string {
  if (heart >= 7) return "Khỏe";
  if (heart >= 4) return "Mệt";
  if (heart >= 1) return "Kiệt sức";
  return "Nhập viện";
}
