import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AlmanacItem } from "./almanac";

const DIR = join(process.cwd(), "src/data/almanac");

let cache: AlmanacItem[] | null = null;

function loadAll(): AlmanacItem[] {
  if (cache) return cache;
  const items: AlmanacItem[] = [];
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
    const data = JSON.parse(readFileSync(join(DIR, file), "utf8")) as AlmanacItem[];
    items.push(...data);
  }
  cache = items;
  return items;
}

export const getAllAlmanacItems = () => loadAll();
export const getAlmanacItems = (country: string) => loadAll().filter((i) => i.country === country);
export const getAlmanacItem = (id: string) => loadAll().find((i) => i.id === id);
export const getAlmanacCountries = () => [...new Set(loadAll().map((i) => i.country))];
