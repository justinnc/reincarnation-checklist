import posthog from "posthog-js";

export type AnalyticsEvent =
  | "survival_started"
  | "survival_round_decided"
  | "survival_completed"
  | "pass_card_downloaded"
  | "survival_shared"
  | "quiz_started"
  | "quiz_completed"
  | "quiz_shared";

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
  try {
    posthog.init(key, {
      api_host: host,
      defaults: "2025-05-24",
      capture_pageview: "history_change",
      capture_pageleave: true,
      persistence: "memory",
      person_profiles: "identified_only",
      // Data minimisation: only page views and the named game events below are sent. Pinned off
      // in code so a PostHog dashboard toggle can't silently widen collection beyond what the
      // Methodology page discloses.
      autocapture: false,
      rageclick: false,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      capture_exceptions: false,
      disable_session_recording: true,
      disable_surveys: true,
    });
    initialized = true;
  } catch {
    // Never let analytics initialization break the app.
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | undefined>,
): void {
  if (!initialized || typeof window === "undefined") return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Ignore tracking failures.
  }
}

export function __resetAnalyticsForTests(): void {
  initialized = false;
}
