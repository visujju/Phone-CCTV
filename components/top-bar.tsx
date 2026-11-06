"use client";

import { memo } from "react";
import { Tv, Globe, Shuffle, CircleHelp, Palette, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  greeting: string;
  clock: string;
  themeDot: string;
  onUrl: () => void;
  onRandom: () => void;
  onHelp: () => void;
  onTheme: () => void;
}

function TopBar({ greeting, clock, themeDot, onUrl, onRandom, onHelp, onTheme }: Props) {
  const btn =
    "tv-focusable flex items-center gap-2 rounded-[calc(var(--radius)*0.7)] border border-transparent bg-card/80 px-3.5 py-2 text-xs font-semibold text-foreground/90 hover:bg-card";
  return (
    <header className="relative z-20 flex items-center gap-4 px-6 pt-5" data-row="topbar">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--glow)]">
          <Tv className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-extrabold tracking-tight text-foreground">StreamHub</div>
          <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {greeting}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <button type="button" data-focus-id="tb-url" onClick={onUrl} className={cn(btn)} style={{ ["--focus-color" as string]: "var(--primary)" }}>
        <Globe className="h-4 w-4 text-primary" />
        URL <span className="text-[9px] font-bold text-muted-foreground">S</span>
      </button>
      <button type="button" data-focus-id="tb-random" onClick={onRandom} className={cn(btn)} style={{ ["--focus-color" as string]: "var(--primary)" }}>
        <Shuffle className="h-4 w-4 text-primary" />
        Random <span className="text-[9px] font-bold text-muted-foreground">R</span>
      </button>
      <button type="button" data-focus-id="tb-help" onClick={onHelp} className={cn(btn)} style={{ ["--focus-color" as string]: "var(--primary)" }}>
        <CircleHelp className="h-4 w-4 text-primary" />
        Help <span className="text-[9px] font-bold text-muted-foreground">H</span>
      </button>
      <button type="button" data-focus-id="tb-theme" onClick={onTheme} className={cn(btn)} style={{ ["--focus-color" as string]: "var(--primary)" }}>
        <Palette className="h-4 w-4 text-primary" />
        Theme
        <span
          className="h-3 w-3 rounded-full border border-white/20"
          style={{ background: themeDot, boxShadow: `0 0 8px ${themeDot}` }}
        />
      </button>

      {/* Status pill */}
      <div className="ml-1 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
        <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
        <Wifi className="h-3.5 w-3.5" />
        Connected
      </div>

      {/* Clock */}
      <div className="w-24 text-right font-mono text-sm font-semibold tabular-nums text-foreground/80">
        {clock}
      </div>
    </header>
  );
}

export default memo(TopBar);
