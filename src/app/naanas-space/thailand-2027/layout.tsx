import React from "react";
import {
  DM_Serif_Display,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Orbitron,
} from "next/font/google";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-editorial-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-editorial-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-editorial-mono",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-digital",
});

export default function ThailandDossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerif.variable} ${jakarta.variable} ${jetbrains.variable} ${orbitron.variable} min-h-screen bg-[#F6F1E7] text-[#1F1A16] selection:bg-[#13382E] selection:text-[#F6F1E7]`}
      style={{
        fontFamily: "var(--font-editorial-sans), system-ui, sans-serif",
        fontVariantNumeric: "lining-nums tabular-nums",
      }}
    >
      <style>{`
        @import url('https://fonts.cdnfonts.com/css/ds-digital');
      `}</style>
      {children}
    </div>
  );
}
