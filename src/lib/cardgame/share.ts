export interface SharePayload {
  v: number;
  seed: number;
  w: number;
  h: number;
  t: string;
  s?: string;
}

export function todaySeedString(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function encodeShare(
  seed: number,
  result: { wallet: number; heart: number; tier: string; strip?: string },
): string {
  const payload = JSON.stringify({
    v: 3,
    seed,
    w: result.wallet,
    h: result.heart,
    t: result.tier,
    ...(result.strip ? { s: result.strip } : {}),
  });
  if (typeof window === "undefined") return Buffer.from(payload).toString("base64url");
  return btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeShare(code: string): SharePayload | null {
  if (!code || typeof code !== "string" || code.length > 512) return null;
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const jsonStr =
      typeof window === "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(padded)));
    const obj = JSON.parse(jsonStr);
    if (
      typeof obj !== "object" ||
      obj === null ||
      typeof obj.seed !== "number" ||
      !Number.isFinite(obj.seed) ||
      typeof obj.w !== "number" ||
      !Number.isFinite(obj.w) ||
      typeof obj.h !== "number" ||
      !Number.isFinite(obj.h) ||
      typeof obj.t !== "string"
    ) {
      return null;
    }
    return {
      v: typeof obj.v === "number" ? obj.v : 3,
      seed: obj.seed,
      w: obj.w,
      h: obj.h,
      t: obj.t,
      ...(typeof obj.s === "string" ? { s: obj.s } : {}),
    };
  } catch {
    return null;
  }
}
