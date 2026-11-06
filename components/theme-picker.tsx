"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { THEMES, type ThemeDef } from "@/lib/themes";

interface Props {
  current: string;
  onSelect: (id: string) => void;
}

function ThemePicker({ current, onSelect }: Props) {
  return (
    <div data-scope="modal" className="overlay-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/70 backdrop-blur-md">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">Choose your theme</h2>
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.28em] text-white/50">
          ← → navigate · OK select · 1–5 quick pick · Esc close
        </p>
      </div>
      <div className="flex gap-6" data-row="themes">
        {THEMES.map((t: ThemeDef, i: number) => {
          const active = t.id === current;
          return (
            <button
              key={t.id}
              type="button"
              data-focus-id={`theme-${t.id}`}
              data-accent={t.dot}
              onClick={() => onSelect(t.id)}
              className="tv-focusable flex w-52 flex-col gap-3 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-left"
              style={{ ["--focus-color" as string]: t.dot }}
            >
              <span className="fx-sheen" aria-hidden />
              <span className="fx-corner" aria-hidden />
              <div
                className="flex h-28 items-end justify-between rounded-[calc(var(--radius)*0.75)] p-3"
                style={{ background: t.swatch }}
              >
                <span className="rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] font-bold text-white/80 backdrop-blur">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {active && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                )}
              </div>
              <span className="px-1 pb-1 text-sm font-bold text-white">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ThemePicker);
