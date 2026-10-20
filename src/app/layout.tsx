import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Expiry Capital — Funded Binary Options Trading",
    template: "%s · Expiry Capital",
  },
  description:
    "Expiry Capital funds binary options traders with accounts up to $200,000. One-phase evaluation, no time limits, up to 90% profit split and payouts settled within 24 hours.",
  keywords: [
    "binary options prop firm",
    "funded trading account",
    "prop trading",
    "binary options funding",
    "trading challenge",
  ],
  openGraph: {
    title: "Expiry Capital — Funded Binary Options Trading",
    description:
      "Trade the clock with our capital. Accounts up to $200k, 90% profit split, 24-hour payouts.",
    type: "website",
    siteName: "Expiry Capital",
  },
};

export const viewport: Viewport = {
  themeColor: "#05080a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-ink font-sans text-snow antialiased">
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
