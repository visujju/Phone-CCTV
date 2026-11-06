export interface ThemeDef {
  id: string;
  name: string;
  swatch: string; // gradient used in picker previews
  dot: string; // swatch dot in the top bar
}

export const THEMES: ThemeDef[] = [
  {
    id: "cinema",
    name: "Cinema",
    swatch: "linear-gradient(135deg,#1a1410 0%,#2a1f14 55%,#ffb060 130%)",
    dot: "#ffb060",
  },
  {
    id: "netflix",
    name: "Netflix",
    swatch: "linear-gradient(135deg,#000000 0%,#140507 60%,#e50914 140%)",
    dot: "#e50914",
  },
  {
    id: "prime",
    name: "Prime Video",
    swatch: "linear-gradient(135deg,#04101f 0%,#071d33 55%,#00a8e1 135%)",
    dot: "#00a8e1",
  },
  {
    id: "disney",
    name: "Disney+",
    swatch: "linear-gradient(135deg,#0a0d24 0%,#131a45 55%,#5b7cfa 135%)",
    dot: "#5b7cfa",
  },
  {
    id: "apple",
    name: "Apple TV+",
    swatch: "linear-gradient(135deg,#000000 0%,#161616 60%,#f5f5f7 140%)",
    dot: "#f5f5f7",
  },
];

export const DEFAULT_THEME = "cinema";
