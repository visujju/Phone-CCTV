# StreamHub — TV Browser

A premium, D-pad navigable streaming-site launcher for smart TVs, Android TV, Fire TV
and anything with a remote control. Built with **Next.js 16 (App Router) + TypeScript +
Tailwind CSS 4 + shadcn/ui conventions**. No Framer Motion — CSS transitions only, tuned
for TV GPUs.

> The original `Phone-CCTV` prototype files (`server.js`, `camera.html`, `viewer.html`,
> root `manifest.json`, `sw.js`) are kept untouched for reference.

## Run

```bash
npm install
npm run build
npm start          # http://localhost:3000
npm run dev        # dev mode
npm run icons      # regenerate PWA icons/screenshots (Python + Pillow)
```

## Remote / keyboard controls

| Input | Action |
| --- | --- |
| ← → ↑ ↓ (or keycodes 19/20/21/22 on Android TV / Fire TV) | Move focus between cards |
| Enter / OK (23) / Space | Open focused site |
| Escape / Backspace | Return from site viewer / close overlays |
| 1–8 | Quick-launch the eight quick-launch bookmarks |
| T | Theme picker (1–5 quick-pick inside) |
| S or / | URL bar (URL or DuckDuckGo search) |
| H or ? | Help overlay |
| C | Cycle category filters |
| R | Open a random site |
| `?open=ID` | Auto-launch a bookmark (PWA shortcuts) |

Mouse cursor auto-hides after 2.5 s; all scrollbars are hidden — D-pad only.

## Features

- **Hero spotlight** that follows focus (8xl gradient title, tagline, description,
  numbered indicator, pagination dots, metadata badges, 192 px brand tile with "Press OK").
- **Category pills** (All / Movies / Series / Live TV / Anime / K-Drama / Kids).
- **Bookmark rows** (300 px tiles, horizontal scroll, `scrollIntoView` on focus):
  Recently Visited (last 6, localStorage) → Bookmarks → Quick Launch.
- **Premium focus system**: `scale(1.04)`, gradient border ring via `mask-composite`,
  triple box-shadow glow in the card's brand color, top sheen, corner glow.
- **Site viewer**: sandboxed full-screen iframe (`autoplay`, `encrypted-media`,
  `fullscreen`, `popups`, `presentation`), `referrerPolicy="no-referrer"`, auto-hiding
  toolbar (Back / Reload / Open in new tab), brand-colored loading spinner, and a 4.5 s
  paint-timeout fallback for sites that send `X-Frame-Options: DENY` (e.g. PrimeShows).
- **Five themes** (Cinema, Netflix, Prime Video, Disney+, Apple TV+) — each overrides
  ~17 OKLCH CSS custom properties on `<html data-theme>`; persisted in localStorage.
  Disney+ adds starlight dots, Apple TV+ a frosted-glass overlay.
- **Ambient background**: drifting brand-colored blob, counter-blob, vignette, CSS film
  grain — all GPU-only transforms.
- **PWA**: full manifest (fullscreen, landscape, 6 icons incl. maskable, 2 screenshots,
  4 `?open=` shortcuts), preconnects to all streaming domains, installable on Android TV.

## Performance

- Static prerender: **~5 ms server response, ~66 KB HTML** (budget: <40 ms, <80 KB).
- All components `memo()`-wrapped, lazy `useState` initializers for greeting/clock,
- CSS-only animations (`transform`, `will-change`, `translateZ(0)`), reduced 90 px blur.
