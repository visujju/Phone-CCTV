"use client";

import { memo } from "react";
import { Check, ExternalLink } from "lucide-react";
import type { Bookmark } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

interface Props {
  bookmark: Bookmark;
  focusId: string;
  onOpen: (b: Bookmark) => void;
}

function BookmarkCard({ bookmark, focusId, onOpen }: Props) {
  const isLive = bookmark.status === "live";
  return (
    <button
      type="button"
      data-focus-id={focusId}
      data-bookmark={bookmark.id}
      data-accent={bookmark.accent}
      onClick={() => onOpen(bookmark)}
      className={cn(
        "tv-focusable group flex w-[300px] shrink-0 flex-col overflow-hidden rounded-[var(--radius)]",
        "border border-border bg-card text-left"
      )}
      style={{ ["--focus-color" as string]: bookmark.accent }}
    >
      <span className="fx-sheen" aria-hidden />
      <span className="fx-corner" aria-hidden />

      {/* Brand-mark tile */}
      <div
        className="relative flex h-[150px] items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${bookmark.accent}33 0%, ${bookmark.accent}14 45%, transparent 100%), var(--card-2)`,
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-black/80 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${bookmark.accent}, ${bookmark.accent}cc)` }}
        >
          {bookmark.initials}
        </div>
        <span
          className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: `${bookmark.accent}26`, color: bookmark.accent }}
        >
          {bookmark.category}
        </span>
      </div>

      {/* Name + tagline */}
      <div className="flex flex-col gap-0.5 px-4 pt-3">
        <span className="truncate text-lg font-semibold text-foreground">{bookmark.name}</span>
        <span className="truncate text-xs text-muted-foreground">{bookmark.tagline}</span>
      </div>

      {/* Metadata row */}
      <div className="mt-2 flex items-center gap-2 px-4 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em]">
        <span style={{ color: bookmark.accent }}>{bookmark.category}</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="text-muted-foreground">{bookmark.quality}</span>
        <span className="text-muted-foreground/50">|</span>
        {isLive ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="h-3 w-3" strokeWidth={3} /> Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400">
            <ExternalLink className="h-3 w-3" /> External
          </span>
        )}
      </div>

      {/* Focus footer */}
      <div
        className="mt-auto hidden items-center justify-center border-t border-border/60 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] group-[.is-focused]:flex"
        style={{ color: bookmark.accent }}
      >
        Press OK to open
      </div>
    </button>
  );
}

export default memo(BookmarkCard);
