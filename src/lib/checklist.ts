"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "rc:checklist:v1";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function toggleChecked(id: string) {
  const set = new Set<string>(JSON.parse(read()));
  if (set.has(id)) set.delete(id);
  else set.add(id);
  localStorage.setItem(KEY, JSON.stringify([...set]));
  listeners.forEach((l) => l());
}

export function useChecklist(): Set<string> {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  return useMemo(() => new Set<string>(JSON.parse(raw)), [raw]);
}
