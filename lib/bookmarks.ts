export type BookmarkStatus = "live" | "external";

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  accent: string;
  initials: string;
  category: string;
  region?: string;
  type: string;
  quality: string;
  status: BookmarkStatus;
  categories: string[];
}

export const CATEGORIES = [
  "All",
  "Movies",
  "Series",
  "Live TV",
  "Anime",
  "K-Drama",
  "Kids",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const BOOKMARKS: Bookmark[] = [
  {
    id: "cinejoy",
    name: "CineJoy",
    url: "https://cinejoy.pk/",
    tagline: "Cinema",
    description:
      "A fast, clean cinema portal with the latest movies and series, organised for big-screen browsing. Stream in up to 1080p with a remote-friendly layout.",
    accent: "#f43f5e",
    initials: "CJ",
    category: "Movies",
    region: "PK",
    type: "Movies",
    quality: "1080p",
    status: "live",
    categories: ["Movies"],
  },
  {
    id: "lookmovie",
    name: "LookMovie",
    url: "https://www.lookmovie2.to/",
    tagline: "Movies & TV Free HD",
    description:
      "Free HD movies and TV shows with a huge on-demand library. Browse by genre, year and popularity — all launchable straight from your remote.",
    accent: "#8b5cf6",
    initials: "LM",
    category: "Movies·Series",
    type: "Movies & TV",
    quality: "1080p",
    status: "live",
    categories: ["Movies", "Series"],
  },
  {
    id: "net27",
    name: "Net27",
    url: "https://net79.cc/",
    tagline: "Live TV & On-Demand",
    description:
      "Hundreds of live TV channels plus on-demand movies and series. Perfect for channel surfing from the couch with nothing but a D-pad.",
    accent: "#10b981",
    initials: "N27",
    category: "Live TV",
    type: "Live TV",
    quality: "1080p",
    status: "live",
    categories: ["Live TV"],
  },
  {
    id: "primeshows",
    name: "PrimeShows",
    url: "https://primeshows.org/",
    tagline: "Premium Series Library",
    description:
      "A premium library of series and anime. Note: this site blocks embedding (X-Frame-Options), so StreamHub opens it in a new tab automatically.",
    accent: "#00a8e1",
    initials: "PS",
    category: "Series·Anime",
    type: "Series",
    quality: "1080p",
    status: "external",
    categories: ["Series", "Anime"],
  },
  {
    id: "plex",
    name: "Plex",
    url: "https://watch.plex.tv/live/",
    tagline: "Free Live TV + Movies",
    description:
      "Plex's free live TV and on-demand movies, no account required. Over 300 live channels streaming straight to your television.",
    accent: "#e5a00d",
    initials: "PX",
    category: "Live TV·Movies",
    type: "Live TV",
    quality: "1080p",
    status: "live",
    categories: ["Live TV", "Movies"],
  },
  {
    id: "filmzie",
    name: "Filmzie",
    url: "https://www.filmzie.com/",
    tagline: "Free Indie Movies",
    description:
      "A curated collection of free independent and classic films. Festival favourites, documentaries and hidden gems, free to watch.",
    accent: "#f97316",
    initials: "FZ",
    category: "Movies",
    type: "Movies",
    quality: "1080p",
    status: "live",
    categories: ["Movies"],
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    url: "https://www.crunchyroll.com/",
    tagline: "Anime & Manga Streaming",
    description:
      "The world's largest anime streaming service — simulcasts, classics and manga, in up to 1080p with multi-language audio.",
    accent: "#ff6b35",
    initials: "CR",
    category: "Anime",
    type: "Anime",
    quality: "1080p",
    status: "live",
    categories: ["Anime"],
  },
  {
    id: "viki",
    name: "Rakuten Viki",
    url: "https://www.viki.com/",
    tagline: "K-Drama & Asian TV",
    description:
      "K-dramas, C-dramas, Taiwanese series and Asian variety shows with community-curated subtitles in 100+ languages.",
    accent: "#ec4899",
    initials: "RV",
    category: "K-Drama",
    type: "K-Drama",
    quality: "1080p",
    status: "live",
    categories: ["K-Drama"],
  },
  {
    id: "youtubetv",
    name: "YouTube TV",
    url: "https://www.youtube.com/tv",
    tagline: "Video, in 4K",
    description:
      "YouTube's lean-back TV interface — videos, channels and live streams rendered in up to 4K, fully navigable by remote.",
    accent: "#ff0033",
    initials: "YT",
    category: "Video",
    type: "Video",
    quality: "4K",
    status: "live",
    categories: ["Movies", "Series", "Live TV"],
  },
  {
    id: "tubi",
    name: "Tubi",
    url: "https://tubitv.com/",
    tagline: "Movies & Series, free",
    description:
      "Thousands of free movies and TV shows from major studios. No account, no subscription — just press OK and watch.",
    accent: "#fa4b2a",
    initials: "TB",
    category: "Movies·Series",
    type: "Movies & TV",
    quality: "1080p",
    status: "live",
    categories: ["Movies", "Series"],
  },
  {
    id: "pluto",
    name: "Pluto TV",
    url: "https://pluto.tv/",
    tagline: "Live TV, free forever",
    description:
      "Hundreds of free live channels and on-demand content. News, sports, movies and classic TV — all ad-supported and free.",
    accent: "#eab308",
    initials: "PL",
    category: "Live TV",
    type: "Live TV",
    quality: "1080p",
    status: "live",
    categories: ["Live TV"],
  },
  {
    id: "xumo",
    name: "Xumo Play",
    url: "https://www.xumo.com/",
    tagline: "Free live TV streaming",
    description:
      "Xumo Play brings free live TV channels and on-demand movies to your big screen with a clean, remote-first interface.",
    accent: "#1e90ff",
    initials: "XU",
    category: "Live TV",
    type: "Live TV",
    quality: "1080p",
    status: "live",
    categories: ["Live TV"],
  },
];

/** First 8 bookmarks — bound to number keys 1–8. */
export const QUICK_LAUNCH = BOOKMARKS.slice(0, 8);

export function getBookmark(id: string | null | undefined): Bookmark | undefined {
  if (!id) return undefined;
  return BOOKMARKS.find((b) => b.id === id);
}

export const RECENT_KEY = "streamhub:recent";
export const THEME_KEY = "streamhub:theme";
export const MAX_RECENT = 6;
