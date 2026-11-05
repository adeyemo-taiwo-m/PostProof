import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./warp-text.css";
import "./landing.css";
import "./buttons.css";
import "./text-type.css";
import "./curved-input.css";

const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Postproof — Proof worth posting",
  description: "Collect testimonials with one link and turn the best words into branded, ready-to-post graphics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
