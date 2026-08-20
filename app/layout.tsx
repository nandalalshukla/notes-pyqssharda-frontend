import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/navbar";
import ToastProvider from "@/components/ToastProvide";
import AuthProviders from "./providers";
import { ThemeProvider } from "./theme-provider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Sharda Social",
    default: "Sharda Social",
  },
  description:
    "Your one-stop destination for everything you need for Sharda University semester exams.",
  icons: {
    icon: "/shardasocial.png",
    apple: "/shardasocial.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider />
          <Navbar />
          <AuthProviders>{children}</AuthProviders>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
