"use client";

import { memo, useRef } from "react";
import { Globe, Search } from "lucide-react";

interface Props {
  onSubmit: (value: string) => void;
}

function UrlBar({ onSubmit }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div data-scope="modal" className="overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <form
        className="flex w-[min(760px,90vw)] flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const v = inputRef.current?.value.trim() ?? "";
          if (v) onSubmit(v);
        }}
      >
        <div className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Enter to visit · Esc to cancel
        </div>
        <div className="flex items-center gap-4 rounded-[var(--radius)] border border-border bg-card px-6 py-5 shadow-2xl">
          <Globe className="h-7 w-7 shrink-0 text-primary" />
          <input
            ref={(el) => {
              inputRef.current = el;
              el?.focus();
            }}
            type="text"
            placeholder="https://example.com  or  search the web…"
            className="w-full bg-transparent text-2xl font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <Search className="h-6 w-6 shrink-0 text-muted-foreground" />
        </div>
        <p className="text-center text-xs text-white/40">
          URLs open directly · anything else searches via DuckDuckGo · visits land in Recently Visited
        </p>
      </form>
    </div>
  );
}

export default memo(UrlBar);
