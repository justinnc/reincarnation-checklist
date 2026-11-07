export function fmtVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";
}

export function stakeLabel(stake: "quarter" | "half" | "all"): string {
  return stake === "quarter" ? "1/4 t\u00fai" : stake === "half" ? "1/2 t\u00fai" : "C\u1ea3 t\u00fai";
}

export function oddsBar(winIn10: number): string[] {
  return Array.from({ length: 10 }, (_, i) => (i < winIn10 ? "win" : "lose"));
}
