import React from "react";
import type { Viewport } from "next";
import {
  DM_Serif_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Orbitron,
} from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial-sans",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial-mono",
});

const orbitron = Orbitron({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-digital",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F1E7",
  interactiveWidget: "resizes-content",
};

export default function ThailandDossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-dvh bg-[#F6F1E7] text-[#1F1A16] selection:bg-[#13382E] selection:text-[#F6F1E7] ${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${orbitron.variable}`}
      style={
        {
          "--font-editorial-serif": "'DM Serif Display', Georgia, serif",
          "--font-editorial-sans":
            "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          "--font-editorial-mono": "'JetBrains Mono', monospace",
          "--font-digital": "'Orbitron', monospace",
          fontFamily: "var(--font-editorial-sans), system-ui, sans-serif",
          fontSizeAdjust: "from-font",
          fontVariantNumeric: "lining-nums tabular-nums",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
