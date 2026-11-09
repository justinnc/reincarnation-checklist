"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rc:charm:v1";
const EVENT_NAME = "rc-charm-change";
const EMPTY: string[] = [];
let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;

export function getCharmIds(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    if (!raw) {
      cachedList = EMPTY;
      return cachedList;
    }
    const parsed = JSON.parse(raw);
    cachedList = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
    return cachedList;
  } catch {
    return EMPTY;
  }
}

function saveCharmIds(ids: string[]): string[] {
  if (typeof window === "undefined") return ids;
  const unique = Array.from(new Set(ids));
  try {
    const raw = JSON.stringify(unique);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedList = unique;
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore storage errors
  }
  return unique;
}

export function toggleCharmId(id: string): string[] {
  const cur = getCharmIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  return saveCharmIds(next);
}

export function addCharmIds(ids: string[]): string[] {
  const cur = getCharmIds();
  return saveCharmIds([...cur, ...ids]);
}

export function setAllCharmIds(ids: string[]): string[] {
  return saveCharmIds(ids);
}

export function clearCharmIds(): void {
  saveCharmIds([]);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useCharmIds(): string[] {
  return useSyncExternalStore(subscribe, getCharmIds, () => EMPTY);
}
