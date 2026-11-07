export function todaySeedString(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function encodeShare(seed: number, result: { wallet: number; tier: string }): string {
  const payload = JSON.stringify({ v: 2, seed, w: result.wallet, t: result.tier });
  if (typeof window === "undefined") return Buffer.from(payload).toString("base64url");
  return btoa(unescape(encodeURIComponent(payload))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
