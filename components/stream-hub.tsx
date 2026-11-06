"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import OpenParam from "@/components/open-param";
import {
  BOOKMARKS,
  CATEGORIES,
  QUICK_LAUNCH,
  RECENT_KEY,
  THEME_KEY,
  MAX_RECENT,
  getBookmark,
  type Bookmark,
  type Category,
} from "@/lib/bookmarks";
import { THEMES, DEFAULT_THEME } from "@/lib/themes";
import TopBar from "@/components/top-bar";
import Hero from "@/components/hero";
import BookmarkRow from "@/components/bookmark-row";
import BookmarkCard from "@/components/bookmark-card";
import SiteViewer from "@/components/site-viewer";
import ThemePicker from "@/components/theme-picker";
import UrlBar from "@/components/url-bar";
import HelpOverlay from "@/components/help-overlay";
import { History } from "lucide-react";

type Overlay = "theme" | "url" | "help" | null;

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function clockFor(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function loadRecent(): Bookmark[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Bookmark[];
    return Array.isArray(arr) ? arr.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function loadTheme(): string {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t && THEMES.some((x) => x.id === t) ? t : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

const ARROWS: Record<string, "left" | "right" | "up" | "down"> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};
const KEYCODE_ARROWS: Record<number, "left" | "right" | "up" | "down"> = {
  19: "up",
  20: "down",
  21: "left",
  22: "right",
};

export default function StreamHub() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<string>(() =>
    typeof window === "undefined" ? DEFAULT_THEME : loadTheme()
  );
  const [category, setCategory] = useState<Category>("All");
  const [recent, setRecent] = useState<Bookmark[]>(() =>
    typeof window === "undefined" ? [] : loadRecent()
  );
  const [viewer, setViewer] = useState<Bookmark | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [focusId, setFocusId] = useState<string>("card-bookmarks-cinejoy");
  const [heroId, setHeroId] = useState<string>(BOOKMARKS[0].id);
  const [blobAccent, setBlobAccent] = useState<string>("var(--blob)");
  const [greeting] = useState(() => greetingFor(new Date()));
  const [clock, setClock] = useState(() => clockFor(new Date()));

  const focusIdRef = useRef(focusId);
  focusIdRef.current = focusId;
  const stateRef = useRef({ viewer, overlay, category });
  stateRef.current = { viewer, overlay, category };

  /* ---------------- persistence ---------------- */

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const t = setInterval(() => setClock(clockFor(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- TV cursor auto-hide (2.5s) ---------------- */

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onMove = () => {
      document.body.classList.remove("cursor-hidden");
      clearTimeout(timer);
      timer = setTimeout(() => document.body.classList.add("cursor-hidden"), 2500);
    };
    window.addEventListener("mousemove", onMove);
    onMove();
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(timer);
    };
  }, []);

  /* ---------------- focus engine ---------------- */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root
      .querySelectorAll(".is-focused")
      .forEach((el) => el.classList.remove("is-focused"));
    const scope = root.querySelector('[data-scope="modal"]') ?? root;
    const el = focusId
      ? scope.querySelector<HTMLElement>(
          `[data-focus-id="${CSS.escape(focusId)}"]`
        )
      : null;
    if (el) {
      el.classList.add("is-focused");
      el.scrollIntoView({ block: "nearest", inline: "center" });
      const accent = el.getAttribute("data-accent");
      setBlobAccent(
        accent && accent.startsWith("#") ? `${accent}40` : "var(--blob)"
      );
      const bm = el.getAttribute("data-bookmark");
      if (bm) setHeroId(bm);
    } else {
      const first = scope.querySelector<HTMLElement>("[data-focus-id]");
      if (first) {
        const id = first.getAttribute("data-focus-id");
        if (id && id !== focusId) setFocusId(id);
      }
    }
  }, [focusId, viewer, overlay, category, recent]);

  const focusScope = useCallback((): ParentNode | null => {
    const root = rootRef.current;
    if (!root) return null;
    return root.querySelector('[data-scope="modal"]') ?? root;
  }, []);

  const visibleFocusables = useCallback((): HTMLElement[] => {
    const scope = focusScope();
    if (!scope) return [];
    return Array.from(scope.querySelectorAll<HTMLElement>("[data-focus-id]")).filter(
      (el) => el.offsetParent !== null
    );
  }, [focusScope]);

  const moveFocus = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      const els = visibleFocusables();
      if (els.length === 0) return;
      const groupKey = (el: HTMLElement) =>
        el.closest("[data-row]")?.getAttribute("data-row") ?? `solo-${el.dataset.focusId}`;
      const groups = new Map<string, HTMLElement[]>();
      for (const el of els) {
        const k = groupKey(el);
        const g = groups.get(k) ?? [];
        g.push(el);
        groups.set(k, g);
      }
      const order = Array.from(groups.keys());
      let cur = els.findIndex((el) => el.dataset.focusId === focusIdRef.current);
      if (cur === -1) cur = 0;
      const curEl = els[cur];
      const curGroup = groupKey(curEl);
      const gIdx = order.indexOf(curGroup);
      const g = groups.get(curGroup) ?? [curEl];
      const pos = g.indexOf(curEl);
      let next: HTMLElement | null = null;
      if (dir === "left" || dir === "right") {
        const n = dir === "left" ? pos - 1 : pos + 1;
        next = g[Math.max(0, Math.min(g.length - 1, n))] ?? null;
      } else {
        const target = dir === "up" ? gIdx - 1 : gIdx + 1;
        if (target >= 0 && target < order.length) {
          const tg = groups.get(order[target]) ?? [];
          next = tg[Math.min(pos, tg.length - 1)] ?? null;
        }
      }
      if (next?.dataset.focusId) setFocusId(next.dataset.focusId);
    },
    [visibleFocusables]
  );

  const activateFocused = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = root.querySelector('[data-scope="modal"]') ?? root;
    const el = scope.querySelector<HTMLElement>(
      `[data-focus-id="${CSS.escape(focusIdRef.current)}"]`
    );
    el?.click();
  }, []);

  /* ---------------- actions ---------------- */

  const recordVisit = useCallback((b: Bookmark) => {
    setRecent((prev) => {
      const next = [b, ...prev.filter((x) => x.id !== b.id)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const openBookmark = useCallback(
    (b: Bookmark) => {
      recordVisit(b);
      setOverlay(null);
      setViewer(b);
      setFocusId("vw-back");
    },
    [recordVisit]
  );

  const closeViewer = useCallback(() => {
    setViewer(null);
    setFocusId("card-bookmarks-cinejoy");
  }, []);

  const cycleCategory = useCallback(() => {
    setCategory((c) => {
      const i = CATEGORIES.indexOf(c);
      return CATEGORIES[(i + 1) % CATEGORIES.length];
    });
  }, []);

  const randomOpen = useCallback(() => {
    const pool = BOOKMARKS.filter((b) => b.id !== stateRef.current.viewer?.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) openBookmark(pick);
  }, [openBookmark]);

  const submitUrl = useCallback(
    (v: string) => {
      const isUrl = /^https?:\/\//i.test(v) || /^[^\s]+\.[^\s]{2,}(\/\S*)?$/.test(v);
      const url = isUrl
        ? /^https?:\/\//i.test(v)
          ? v
          : `https://${v}`
        : `https://duckduckgo.com/?q=${encodeURIComponent(v)}`;
      let host = v;
      try {
        host = new URL(url).hostname.replace(/^www\./, "");
      } catch {}
      const pseudo: Bookmark = {
        id: `custom-${Date.now()}`,
        name: isUrl ? host : v.length > 28 ? `${v.slice(0, 28)}…` : v,
        url,
        tagline: isUrl ? "Custom site" : "Web search",
        description: url,
        accent: "#a78bfa",
        initials: isUrl ? host.slice(0, 2).toUpperCase() : "??",
        category: "Custom",
        type: "Web",
        quality: "—",
        status: "live",
        categories: [],
      };
      openBookmark(pseudo);
    },
    [openBookmark]
  );

  /* ---------------- global key handler ---------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode || (e as unknown as { which: number }).which;
      const { viewer, overlay } = stateRef.current;

      const arrow = ARROWS[key] ?? KEYCODE_ARROWS[code];
      const isOk = key === "Enter" || key === " " || code === 13 || code === 32 || code === 23;
      const isBack = key === "Escape" || key === "Backspace" || code === 27 || code === 8;

      if (overlay === "url") {
        if (isBack) {
          e.preventDefault();
          setOverlay(null);
          setFocusId("tb-url");
        }
        return;
      }
      if (overlay === "help") {
        if (isBack || key === "h" || key === "H" || key === "?") {
          e.preventDefault();
          setOverlay(null);
          setFocusId("tb-help");
        }
        return;
      }
      if (overlay === "theme") {
        if (isBack || key === "t" || key === "T") {
          e.preventDefault();
          setOverlay(null);
          setFocusId("tb-theme");
        } else if (arrow) {
          e.preventDefault();
          moveFocus(arrow);
        } else if (isOk) {
          e.preventDefault();
          activateFocused();
        } else if (/^[1-5]$/.test(key)) {
          e.preventDefault();
          const t = THEMES[Number(key) - 1];
          if (t) setTheme(t.id);
        }
        return;
      }
      if (viewer) {
        if (isBack) {
          e.preventDefault();
          closeViewer();
        } else if (arrow) {
          e.preventDefault();
          moveFocus(arrow);
        } else if (isOk) {
          e.preventDefault();
          activateFocused();
        }
        return;
      }
      // home
      if (arrow) {
        e.preventDefault();
        moveFocus(arrow);
      } else if (isOk) {
        e.preventDefault();
        activateFocused();
      } else if (/^[1-8]$/.test(key)) {
        e.preventDefault();
        const b = QUICK_LAUNCH[Number(key) - 1];
        if (b) openBookmark(b);
      } else if (key === "t" || key === "T") {
        setOverlay("theme");
        setFocusId(`theme-${theme}`);
      } else if (key === "s" || key === "S" || key === "/") {
        e.preventDefault();
        setOverlay("url");
      } else if (key === "h" || key === "H" || key === "?") {
        setOverlay("help");
      } else if (key === "c" || key === "C") {
        cycleCategory();
      } else if (key === "r" || key === "R") {
        randomOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activateFocused, closeViewer, cycleCategory, moveFocus, openBookmark, randomOpen, theme]);

  /* ---------------- derived ---------------- */

  const filtered = useMemo(
    () =>
      category === "All"
        ? BOOKMARKS
        : BOOKMARKS.filter((b) => b.categories.includes(category)),
    [category]
  );

  const heroBookmark =
    getBookmark(heroId) ?? recent.find((b) => b.id === heroId) ?? BOOKMARKS[0];
  const heroIndex = Math.max(
    0,
    filtered.findIndex((b) => b.id === heroBookmark.id)
  );
  const indexLabel = `${String(heroIndex + 1).padStart(2, "0")}/${String(
    filtered.length
  ).padStart(2, "0")}`;
  const themeDot =
    THEMES.find((t) => t.id === theme)?.dot ?? "#ffb060";

  const renderCard = (b: Bookmark, rowKey: string) => (
    <BookmarkCard
      key={`${rowKey}-${b.id}`}
      bookmark={b}
      focusId={`card-${rowKey}-${b.id}`}
      onOpen={openBookmark}
    />
  );

  return (
    <div ref={rootRef} className="relative min-h-screen">
      {/* ?open=ID deep link (PWA manifest shortcuts) */}
      <Suspense fallback={null}>
        <OpenParam
          onOpen={(id) => {
            const b = getBookmark(id);
            if (b) openBookmark(b);
          }}
        />
      </Suspense>

      {/* Ambient background */}
      <div
        className="ambient-blob"
        style={{ background: blobAccent, transition: "background 600ms ease" }}
      />
      <div className="ambient-blob-static" />
      <div className="stars-overlay" />
      <div className="frost-overlay" />
      <div className="vignette" />
      <div className="grain" />

      {viewer ? (
        <SiteViewer
          bookmark={viewer}
          onClose={closeViewer}
          onBlocked={() => setFocusId("vw-ext-open")}
        />
      ) : (
        <div className="relative z-10 flex min-h-screen flex-col">
          <TopBar
            greeting={greeting}
            clock={clock}
            themeDot={themeDot}
            onUrl={() => setOverlay("url")}
            onRandom={randomOpen}
            onHelp={() => setOverlay("help")}
            onTheme={() => {
              setOverlay("theme");
              setFocusId(`theme-${theme}`);
            }}
          />

          <main className="flex-1 pb-4">
            <Hero
              bookmark={heroBookmark}
              indexLabel={indexLabel}
              total={filtered.length}
              activeDot={heroIndex}
              onOpen={openBookmark}
            />

            {/* Category filter pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 px-6" data-row="pills">
              {CATEGORIES.map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    data-focus-id={`pill-${c}`}
                    data-accent="var(--primary)"
                    onClick={() => setCategory(c)}
                    className={`tv-focusable rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${
                      active
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                    style={{ ["--focus-color" as string]: "var(--primary)" }}
                  >
                    <span className="fx-sheen" aria-hidden />
                    <span className="fx-corner" aria-hidden />
                    {c}
                  </button>
                );
              })}
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                press C to cycle
              </span>
            </div>

            {/* Rows */}
            {recent.length > 0 && (
              <BookmarkRow label="Recently visited" rowKey="recent">
                {recent.map((b) => renderCard(b, "recent"))}
              </BookmarkRow>
            )}
            <BookmarkRow
              label={category === "All" ? "Bookmarks" : `Bookmarks — ${category}`}
              rowKey="bookmarks"
            >
              {filtered.length === 0 ? (
                <div className="px-1 py-6 text-sm text-muted-foreground">
                  No sites in this category yet.
                </div>
              ) : (
                filtered.map((b) => renderCard(b, "bookmarks"))
              )}
            </BookmarkRow>
            <BookmarkRow label="Quick launch · keys 1–8" rowKey="quick">
              {QUICK_LAUNCH.map((b) => renderCard(b, "quick"))}
            </BookmarkRow>
          </main>

          {/* Bottom control hints */}
          <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-border/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> Recently visited</span>
            <span>←→ Navigate</span>
            <span>OK Open</span>
            <span>Back Return</span>
            <span>T Themes</span>
            <span>S URL</span>
            <span>H Help</span>
            <span>C Category</span>
            <span>R Random</span>
            <span>1–8 Quick launch</span>
          </footer>
        </div>
      )}

      {overlay === "theme" && (
        <ThemePicker current={theme} onSelect={(id) => setTheme(id)} />
      )}
      {overlay === "url" && <UrlBar onSubmit={submitUrl} />}
      {overlay === "help" && <HelpOverlay />}
    </div>
  );
}
