"use client";

import { memo } from "react";
import { Check, ExternalLink, Play } from "lucide-react";
import type { Bookmark } from "@/lib/bookmarks";

interface Props {
  bookmark: Bookmark;
  indexLabel: string;
  total: number;
  activeDot: number;
  onOpen: (b: Bookmark) => void;
}

function Hero({ bookmark, indexLabel, total, activeDot, onOpen }: Props) {
  const isLive = bookmark.status === "live";
  return (
    <section className="relative z-10 flex items-center gap-10 px-6 pt-6" data-row="hero">
      <div key={bookmark.id} className="hero-in flex min-w-0 flex-1 items-center gap-10">
        {/* Copy */}
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-[0.3em] text-primary">
              {indexLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeDot ? 22 : 6,
                    background: i === activeDot ? bookmark.accent : "var(--border)",
                    opacity: i === activeDot ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
          </div>

          <h1
            className="truncate text-8xl font-extrabold leading-none tracking-tight"
            style={{
              background: `linear-gradient(100deg, #ffffff 30%, ${bookmark.accent} 95%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {bookmark.name}
          </h1>
          <p className="mt-3 text-2xl font-medium text-foreground/90">{bookmark.tagline}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {bookmark.description}
          </p>

          {/* Metadata badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
            <span
              className="rounded-full px-3 py-1.5"
              style={{ background: `${bookmark.accent}1f`, color: bookmark.accent }}
            >
              {bookmark.category}
            </span>
            {bookmark.region && (
              <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground/80">
                Region {bookmark.region}
              </span>
            )}
            <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground/80">
              {bookmark.quality}
            </span>
            {isLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-400">
                <Check className="h-3 w-3" strokeWidth={3} /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-400">
                <ExternalLink className="h-3 w-3" /> External
              </span>
            )}
          </div>
        </div>

        {/* Brand-mark preview tile */}
        <button
          type="button"
          data-focus-id="hero-open"
          data-bookmark={bookmark.id}
          data-accent={bookmark.accent}
          onClick={() => onOpen(bookmark)}
          className="tv-focusable relative hidden h-48 w-48 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border md:flex"
          style={{
            ["--focus-color" as string]: bookmark.accent,
            background: `radial-gradient(circle at 50% 120%, ${bookmark.accent}40, transparent 70%), linear-gradient(150deg, ${bookmark.accent}2e, ${bookmark.accent}10), var(--card)`,
          }}
        >
          <span className="fx-sheen" aria-hidden />
          <span className="fx-corner" aria-hidden />
          <div
            className="absolute inset-0 rounded-[var(--radius)] opacity-60"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${bookmark.accent}30, transparent 65%)`,
              filter: "blur(28px)",
            }}
          />
          <span
            className="relative flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-extrabold text-black/80"
            style={{ background: `linear-gradient(135deg, ${bookmark.accent}, ${bookmark.accent}bb)` }}
          >
            {bookmark.initials}
          </span>
          <span className="absolute bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Play className="h-3 w-3 fill-white" /> Press OK
          </span>
        </button>
      </div>
    </section>
  );
}

export default memo(Hero);
