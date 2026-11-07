import type { Action, GameConfig } from "./types";

interface SharePayload {
  v: 1;
  seed: number;
  config: GameConfig;
  actions: Action[];
}

/** Encode game config + action log into a URL-safe string. Deterministic replay, not a trusted score. */
export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(s: string): SharePayload | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SharePayload;
  } catch {
    return null;
  }
}

/** Today's daily-challenge seed string, e.g. "20261107". */
export function todaySeedString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
