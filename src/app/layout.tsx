import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { GlobalChrome } from "@/components/global-chrome";

export const metadata: Metadata = {
  title: {
    default: "Slidecast — Instagram carousels, drafted in 40 seconds",
    template: "%s · Slidecast",
  },
  description:
    "Paste a tweet, a note, or 2,000 words. Slidecast writes the slides, applies your brand kit, and exports 1080×1350 PNGs ready for Instagram.",
  applicationName: "Slidecast",
  keywords: ["instagram carousel", "carousel maker", "linkedin carousel", "content creator tools"],
  openGraph: {
    type: "website",
    siteName: "Slidecast",
    title: "Slidecast — Instagram carousels, drafted in 40 seconds",
    description:
      "Paste an idea, get 5–10 branded slides, export PNG or PDF. Built for creators who post daily.",
  },
  twitter: {
    card: "summary",
    title: "Slidecast — Instagram carousels, drafted in 40 seconds",
    description:
      "Paste an idea, get 5–10 branded slides, export PNG or PDF. Built for creators who post daily.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/* Set the theme before first paint so dark mode never flashes white. */
const themeScript = `(function(){try{var t=localStorage.getItem('slidecast-theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProvider>
          {children}
          <GlobalChrome />
        </AppProvider>
      </body>
    </html>
  );
}
