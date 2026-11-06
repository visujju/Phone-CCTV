import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

const STREAM_DOMAINS = [
  "https://cinejoy.pk",
  "https://www.lookmovie2.to",
  "https://net79.cc",
  "https://primeshows.org",
  "https://watch.plex.tv",
  "https://www.filmzie.com",
  "https://www.crunchyroll.com",
  "https://www.viki.com",
  "https://www.youtube.com",
  "https://tubitv.com",
  "https://pluto.tv",
  "https://www.xumo.com",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://streamhub.app/"),
  title: "StreamHub — TV Browser",
  description:
    "StreamHub is a premium TV-optimized web browser and streaming launcher for smart TVs, Android TV and Fire TV. D-pad navigable, remote first.",
  manifest: "/manifest.json",
  applicationName: "StreamHub",
  appleWebApp: {
    capable: true,
    title: "StreamHub",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "StreamHub — TV Browser",
    description:
      "A premium D-pad navigable streaming launcher for smart TVs, Android TV and Fire TV.",
    url: "https://streamhub.app/",
    siteName: "StreamHub",
    type: "website",
    images: [{ url: "/screenshots/wide.png", width: 1920, height: 1080, alt: "StreamHub home screen on TV" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamHub — TV Browser",
    description:
      "A premium D-pad navigable streaming launcher for smart TVs, Android TV and Fire TV.",
    images: ["/screenshots/wide.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "StreamHub",
    "theme-color": "#07060f",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060f",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="cinema" suppressHydrationWarning>
      <body>
        {/* Preconnect to every streaming domain — parallel TCP+TLS saves 200–400ms on first open */}
        {STREAM_DOMAINS.map((d) => (
          <link key={d} rel="preconnect" href={d} crossOrigin="anonymous" />
        ))}
        <link rel="preconnect" href="https://duckduckgo.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/icons/favicon-32.png" />
        {children}
      </body>
    </html>
  );
}
