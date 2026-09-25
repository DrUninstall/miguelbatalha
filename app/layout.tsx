import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReducedMotionProvider } from "@/components/reduced-motion-provider";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://miguelbatalha.com"),
  title: {
    default: "Miguel Batalha",
    template: "%s — Miguel Batalha",
  },
  description:
    "Head of Product & Strategy at KovaaK Games. Writing on interface design, motion, and building products.",
  alternates: {
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReducedMotionProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ReducedMotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
