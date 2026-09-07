import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/navbar";
import SiteFooter from "@/components/SiteFooter";
import ToastProvider from "@/components/ToastProvide";
import AuthProviders from "./providers";
import { ThemeProvider } from "./theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organisationSchema,
  webSiteSchema,
} from "@/lib/seo/structuredData";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Text stays visible in a fallback face while the web font loads, rather
  // than the page rendering invisible text. Directly improves Largest
  // Contentful Paint, which is a ranking signal.
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Lets every relative URL below (canonicals, OG images) resolve to an
  // absolute one. Without it Next emits relative canonicals, which
  // crawlers treat inconsistently.
  metadataBase: new URL(SITE_URL),

  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Sharda University Notes, PYQs & Syllabus`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",

  // No canonical here on purpose. `alternates` is inherited, so a root
  // canonical of "/" silently declares every page that doesn't override it
  // to be the homepage — which is how /about-us ended up pointing at "/"
  // and would never have been indexed on its own. Each indexable route
  // declares its own instead.

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/shardasocial.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Sharda University notes, past year questions and syllabus`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/shardasocial.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length previews and large image thumbnails
      // instead of the conservative defaults — a richer result gets more
      // clicks for the same ranking.
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/shardasocial.png",
    apple: "/shardasocial.png",
  },

  // Fill in once the property is claimed in Google Search Console.
  // verification: { google: "..." },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* The API and Cloudinary are both hit on nearly every page; opening
            the connections during HTML parse removes a DNS + TLS round trip
            from the first request to each. */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Site-wide structured data. Emitted once in the root layout so
            every page inherits the publisher and search-box definitions,
            and page-level schema can reference them by @id. */}
        <JsonLd data={[organisationSchema(), webSiteSchema()]} />

        <ThemeProvider>
          <ToastProvider />
          <Navbar />
          {/* Effect-only: restores the session without owning the tree, so
              page content stays server-rendered in document order. */}
          <AuthProviders />
          <main>{children}</main>
          <SiteFooter />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
