import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
  },
}));

import posthog from "posthog-js";
import { __resetAnalyticsForTests, initAnalytics, trackEvent } from "../analytics";

describe("analytics (PostHog)", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    __resetAnalyticsForTests();
    vi.clearAllMocks();
    process.env = { ...origEnv };
    vi.stubGlobal("window", {});
  });

  afterEach(() => {
    process.env = origEnv;
    vi.unstubAllGlobals();
  });

  it("is a no-op when NEXT_PUBLIC_POSTHOG_KEY is unset", () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    initAnalytics();
    trackEvent("survival_started", { country: "vn", start_year: 1995, lang: "vi" });
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("initializes in cookieless memory mode and captures events when key is set", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_123";
    initAnalytics();
    expect(posthog.init).toHaveBeenCalledWith(
      "phc_test_123",
      expect.objectContaining({
        api_host: "https://us.i.posthog.com",
        capture_pageview: "history_change",
        persistence: "memory",
        person_profiles: "identified_only",
      }),
    );

    trackEvent("quiz_completed", { pool: "all", score: 8, total: 10, lang: "en" });
    expect(posthog.capture).toHaveBeenCalledWith("quiz_completed", {
      pool: "all",
      score: 8,
      total: 10,
      lang: "en",
    });
  });
});
