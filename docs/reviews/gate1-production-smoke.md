# Gate 1 step 4 — Production smoke (2026-11-12)

> Automated HTTP checks against the live site, https://reincarnation-checklist-justinncs-projects.vercel.app, run by an agent on 2026-11-12 after deploy `ab7b637`/`a3d5fe4`. This is evidence for the "verify production routes, SEO/OG assets" part of Gate 1 step 4. It does **not** cover accessibility, a manual EN/VI mobile/desktop pass on real devices, or a rollback drill.

## Results

| Check | Result |
|---|---|
| `sitemap.xml` | 200; 700 URLs, no duplicates, all on the live host |
| Every sitemap URL | 700 of 700 return 200 |
| Per page (all 700): non-empty `<title>`, canonical equal to its own URL, `og:image` pointing at its own language's image, three hreflang links (en, vi, x-default), `<html lang>` matching the URL, exactly one `<h1>`, no `noindex` | 0 failures |
| Unknown URLs (`/en/does-not-exist`, `/en/us/not-a-milestone`, `/en/zz`, `/en/charm`) | 404 with `noindex` |
| No-locale URLs (`/`, `/almanac`, `/opengraph-image`) | 307 to the `/en/...` equivalent |
| `/en/opengraph-image`, `/vi/opengraph-image` | 200, `image/png` |
| `/icon.svg`, `/apple-icon.png`, `/favicon.ico` | 200 |
| `robots.txt` | 200; allows all, names the sitemap on the live host |
| HTTPS | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (set by Vercel) |

## Found and fixed (in the commits after this run; live once pushed)

1. **Sitemap omitted `/survival` and `/world`** in both languages, although both are public, indexable pages with canonicals. Added; a test now pins the public top-level pages. Sitemap becomes 704 URLs.
2. **No baseline security headers** beyond HSTS: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy` were absent. Added site-wide in `next.config.ts` (`nosniff`, `strict-origin-when-cross-origin`, `SAMEORIGIN`, camera/microphone/geolocation off). Verified on a local production build.

## Left open

- **No Content-Security-Policy.** It needs nonces for Next's inline scripts and an allow-list for the analytics host; treat as its own change.
- **`X-Frame-Options: SAMEORIGIN` blocks third-party embedding.** The roadmap's pass-card embed would need a dedicated route exempted from it.
- **`/fr` (unknown locale without a known prefix) redirects to `/en/fr`, which is a 404.** Harmless, but it is a redirect to a missing page.
- `/en/simulator` is in the sitemap and serves the Vietnam-only card game with an English notice. Left as is (owner rule: the card game is Vietnam-only).
- Not checked here: accessibility, real-device EN/VI passes, rollback.
