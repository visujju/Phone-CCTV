"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, RotateCw, MonitorPlay } from "lucide-react";
import type { Bookmark } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

interface Props {
  bookmark: Bookmark;
  onClose: () => void;
  onBlocked: () => void;
}

const PAINT_TIMEOUT_MS = 4500;

function SiteViewer({ bookmark, onClose, onBlocked }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  const revealToolbar = useCallback(() => {
    setToolbarVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setToolbarVisible(false), 3500);
  }, []);

  // Any D-pad press or mouse move brings the toolbar back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) ||
        [19, 20, 21, 22].includes(e.keyCode)
      ) {
        revealToolbar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealToolbar]);

  // Paint detection: if the iframe hasn't fired load within 4.5s, show the embed-blocked fallback
  useEffect(() => {
    loadedRef.current = false;
    setLoaded(false);
    setBlocked(false);
    const t = setTimeout(() => {
      if (!loadedRef.current) {
        setBlocked(true);
        setLoaded(true);
        onBlocked();
      }
    }, PAINT_TIMEOUT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmark.id, reloadKey]);

  const handleLoad = useCallback(() => {
    loadedRef.current = true;
    setLoaded(true);
  }, []);

  useEffect(() => {
    revealToolbar();
  }, [revealToolbar]);

  const openNewTab = useCallback(() => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }, [bookmark.url]);

  const barBtn =
    "tv-focusable flex items-center gap-2 rounded-[calc(var(--radius)*0.6)] border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md";

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onMouseMove={revealToolbar}
      data-row="viewer"
      data-scope="modal"
    >
      <iframe
        key={`${bookmark.id}-${reloadKey}`}
        src={bookmark.url}
        title={bookmark.name}
        onLoad={handleLoad}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-forms allow-autoplay allow-encrypted-media allow-fullscreen allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; display-capture; web-share"
        className="absolute inset-0 h-full w-full border-0"
      />

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/95">
          <div
            className="spinner h-12 w-12 rounded-full border-[3px] border-transparent"
            style={{
              borderTopColor: bookmark.accent,
              borderRightColor: bookmark.accent,
              boxShadow: `0 0 40px -6px ${bookmark.accent}66`,
            }}
          />
          <div className="text-sm font-semibold text-foreground/90">
            Loading {bookmark.name}…
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {bookmark.url}
          </div>
        </div>
      )}

      {/* Blocked-embed fallback */}
      {blocked && (
        <div className="overlay-in absolute inset-0 flex items-center justify-center bg-background/92 backdrop-blur-xl" data-row="viewer-ext">
          <div className="flex max-w-xl flex-col items-center gap-5 px-8 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-black/80"
              style={{ background: `linear-gradient(135deg, ${bookmark.accent}, ${bookmark.accent}cc)` }}
            >
              {bookmark.initials}
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">
              {bookmark.name} can't be embedded
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              This site sends <span className="font-mono text-amber-400">X-Frame-Options: DENY</span>,
              so browsers refuse to show it inside StreamHub. Open it in a full tab instead —
              it will behave exactly the same.
            </p>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                data-focus-id="vw-ext-open"
                data-accent={bookmark.accent}
                onClick={openNewTab}
                className="tv-focusable flex items-center gap-2 rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                style={{ ["--focus-color" as string]: bookmark.accent }}
              >
                <span className="fx-sheen" aria-hidden />
                <span className="fx-corner" aria-hidden />
                <ExternalLink className="h-4 w-4" /> Open in new tab
              </button>
              <button
                type="button"
                data-focus-id="vw-ext-back"
                data-accent={bookmark.accent}
                onClick={onClose}
                className="tv-focusable flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-6 py-3 text-sm font-bold text-foreground"
                style={{ ["--focus-color" as string]: bookmark.accent }}
              >
                <span className="fx-sheen" aria-hidden />
                <span className="fx-corner" aria-hidden />
                <ArrowLeft className="h-4 w-4" /> Back to home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-hiding top toolbar */}
      {!blocked && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/85 to-transparent px-5 py-4 transition-opacity duration-500",
            toolbarVisible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          data-row="viewer-bar"
        >
          <button
            type="button"
            data-focus-id="vw-back"
            onClick={onClose}
            className={cn(barBtn)}
            style={{ ["--focus-color" as string]: bookmark.accent }}
          >
            <span className="fx-sheen" aria-hidden />
            <span className="fx-corner" aria-hidden />
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex min-w-0 items-center gap-2.5 rounded-[calc(var(--radius)*0.6)] border border-white/10 bg-white/10 px-3.5 py-2 backdrop-blur-md">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-black/80"
              style={{ background: `linear-gradient(135deg, ${bookmark.accent}, ${bookmark.accent}cc)` }}
            >
              {bookmark.initials}
            </span>
            <span className="text-xs font-bold text-white">{bookmark.name}</span>
            <span className="max-w-[40vw] truncate font-mono text-[10px] text-white/50">
              {bookmark.url}
            </span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            data-focus-id="vw-reload"
            onClick={() => {
              loadedRef.current = false;
              setLoaded(false);
              setBlocked(false);
              setReloadKey((k) => k + 1);
            }}
            className={cn(barBtn)}
            style={{ ["--focus-color" as string]: bookmark.accent }}
          >
            <span className="fx-sheen" aria-hidden />
            <span className="fx-corner" aria-hidden />
            <RotateCw className="h-4 w-4" /> Reload
          </button>
          <button
            type="button"
            data-focus-id="vw-open"
            onClick={openNewTab}
            className={cn(barBtn)}
            style={{ ["--focus-color" as string]: bookmark.accent }}
          >
            <span className="fx-sheen" aria-hidden />
            <span className="fx-corner" aria-hidden />
            <ExternalLink className="h-4 w-4" /> Open in new tab
          </button>
          <span className="hidden text-white/40 md:block">
            <MonitorPlay className="h-4 w-4" />
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(SiteViewer);
