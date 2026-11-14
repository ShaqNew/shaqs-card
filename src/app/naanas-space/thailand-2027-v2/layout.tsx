import React from "react";

export default function ThailandDossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#F6F1E7] text-[#1F1A16] selection:bg-[#13382E] selection:text-[#F6F1E7]"
      style={
        {
          "--font-editorial-serif": "'DM Serif Display', Georgia, serif",
          "--font-editorial-sans":
            "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          "--font-editorial-mono": "'JetBrains Mono', monospace",
          "--font-digital": "'Orbitron', monospace",
          fontFamily: "var(--font-editorial-sans), system-ui, sans-serif",
          fontVariantNumeric: "lining-nums tabular-nums",
        } as React.CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.cdnfonts.com/css/ds-digital');
      `}</style>
      {children}
    </div>
  );
}
