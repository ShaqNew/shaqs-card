import React from "react";
import type { Viewport } from "next";
import localFont from "next/font/local";

const dmSerifDisplay = localFont({
  src: [
    {
      path: "./fonts/DMSerifDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/DMSerifDisplay-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-editorial-serif",
  adjustFontFallback: "Times New Roman",
});

const plusJakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-editorial-sans",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-editorial-mono",
  adjustFontFallback: false,
});

const orbitron = localFont({
  src: "./fonts/Orbitron-Variable.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--font-digital",
  adjustFontFallback: false,
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
      className={`min-h-dvh overflow-x-clip bg-[#F6F1E7] text-[#1F1A16] selection:bg-[#13382E] selection:text-[#F6F1E7] ${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${orbitron.variable}`}
      style={
        {
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
