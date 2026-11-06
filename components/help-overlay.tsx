"use client";

import { memo } from "react";
import {
  ArrowUpDown,
  Hash,
  Zap,
  MonitorPlay,
  Palette,
  Globe,
  History,
  BadgeCheck,
} from "lucide-react";

const SECTIONS = [
  {
    icon: ArrowUpDown,
    title: "Navigation",
    body: "Arrow keys (or Android TV / Fire TV D-pad: 19/20/21/22) move between cards. Enter, OK (23) or Space opens the focused site. Escape or Backspace returns home from the site viewer.",
  },
  {
    icon: Hash,
    title: "Quick launch",
    body: "Number keys 1–8 launch the eight quick-launch sites instantly — no navigation needed. Deep-link a site with ?open=ID, e.g. ?open=cinejoy.",
  },
  {
    icon: Zap,
    title: "Power features",
    body: "R opens a random site · C cycles category filters · T opens the theme picker · S or / opens the URL bar · H or ? shows this help.",
  },
  {
    icon: MonitorPlay,
    title: "Inside the site viewer",
    body: "Move the mouse or press any arrow to reveal the toolbar: Back, Reload, Open in new tab. If a site doesn't paint within 4.5s, StreamHub offers a full-tab fallback.",
  },
];

const HIGHLIGHTS = [
  { icon: Palette, label: "5 premium themes" },
  { icon: Globe, label: "URL bar + search" },
  { icon: History, label: "Recently visited" },
  { icon: BadgeCheck, label: "Live status badges" },
];

function HelpOverlay() {
  return (
    <div data-scope="modal" className="overlay-in fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md">
      <div className="mx-auto flex min-h-full w-[min(1100px,92vw)] flex-col items-center justify-center gap-8 py-10">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Remote control guide</h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.28em] text-white/50">
            H or ? toggles this · Esc closes
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="rounded-[var(--radius)] border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-2.5 flex items-center gap-2.5 text-primary">
                <s.icon className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  {s.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-white/60">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {HIGHLIGHTS.map((h) => (
            <span
              key={h.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80"
            >
              <h.icon className="h-3.5 w-3.5 text-primary" />
              {h.label}
            </span>
          ))}
        </div>

        <p className="max-w-2xl text-center text-xs leading-relaxed text-white/40">
          Some sites show an amber “External” badge: they send the X-Frame-Options header, which
          forbids embedding in any app. StreamHub detects this automatically and offers to open
          them in a full browser tab instead.
        </p>
      </div>
    </div>
  );
}

export default memo(HelpOverlay);
