"use client";

import Link from "next/link";
import React from "react";

interface NaanasSpaceLayoutProps {
  children: React.ReactNode;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function NaanasSpaceLayout({
  children,
  showBackLink = false,
  backHref = "/naanas-space",
  backLabel = "Back to Hub",
}: NaanasSpaceLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

      {showBackLink && (
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
          <Link 
            href={backHref} 
            className="text-slate-400 hover:text-purple-400 font-medium flex items-center gap-2 transition-colors"
          >
            &larr; {backLabel}
          </Link>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-4xl">
        {children}
      </div>
    </div>
  );
}
