import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addCharmIds, clearCharmIds, getCharmIds, setAllCharmIds, toggleCharmId } from "../charm";

// ponytail: minimal window/localStorage shim; no jsdom dependency needed for this module.
const store = new Map<string, string>();
const fakeWindow = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

beforeEach(() => {
  store.clear();
  Object.assign(globalThis, {
    window: fakeWindow,
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  });
  clearCharmIds();
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe("charm storage", () => {
  it("starts empty", () => {
    expect(getCharmIds()).toEqual([]);
  });

  it("toggles an id on and off", () => {
    expect(toggleCharmId("a")).toEqual(["a"]);
    expect(toggleCharmId("b")).toEqual(["a", "b"]);
    expect(toggleCharmId("a")).toEqual(["b"]);
    expect(getCharmIds()).toEqual(["b"]);
  });

  it("deduplicates when adding and setting", () => {
    addCharmIds(["a", "a", "b"]);
    expect(addCharmIds(["b", "c"])).toEqual(["a", "b", "c"]);
    expect(setAllCharmIds(["x", "x"])).toEqual(["x"]);
  });

  it("clears everything", () => {
    addCharmIds(["a"]);
    clearCharmIds();
    expect(getCharmIds()).toEqual([]);
  });

  it("persists as JSON and drops non-string entries on read", () => {
    store.set("rc:charm:v1", JSON.stringify(["ok", 42, null, "fine"]));
    expect(getCharmIds()).toEqual(["ok", "fine"]);
  });

  it("returns empty on corrupt or non-array storage", () => {
    store.set("rc:charm:v1", "{not json");
    expect(getCharmIds()).toEqual([]);
    store.set("rc:charm:v1", '{"a":1}');
    expect(getCharmIds()).toEqual([]);
  });

  it("returns the same array reference while storage is unchanged", () => {
    addCharmIds(["a"]);
    expect(getCharmIds()).toBe(getCharmIds());
  });
});

describe("charm storage without a window (SSR)", () => {
  it("reads empty and does not throw on writes", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(getCharmIds()).toEqual([]);
    expect(toggleCharmId("a")).toEqual(["a"]);
  });
});
