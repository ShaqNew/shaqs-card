"use client";

import Link from "next/link";
import NaanasSpaceLayout from "@/components/NaanasSpaceLayout";

export default function NaanasSpaceHub() {
  return (
    <NaanasSpaceLayout>
      <main className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-center text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-6">
          Naana&apos;s Space
        </h1>
        <p className="text-center text-xl text-slate-400 mb-12 max-w-2xl">
          Welcome to your personal hub!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <Link 
            href="/naanas-space/thailand-2027"
            className="md:col-span-2 group flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-amber-950/30 backdrop-blur-sm border border-amber-500/30 rounded-3xl shadow-2xl transition-all hover:bg-slate-800/80 hover:border-amber-400/60 hover:shadow-amber-500/10"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="text-4xl">🌴✨</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
                  4 Feb – 14 Feb 2027 • Bangkok &amp; Phuket
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Thailand 2027: Naana&apos;s Birthday Escape
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Our interactive luxury trip planner, live itinerary, confirmed flight &amp; hotel vault (Shangri-La Bangkok &amp; The Pavilions Phuket), packing studio, and on-the-ground survival guide.
              </p>
            </div>
          </Link>
          <Link 
            href="/naanas-space/loml-renewal"
            className="group flex flex-col justify-between p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl shadow-xl transition-all hover:bg-slate-800 hover:border-purple-500/30 hover:shadow-purple-500/10"
          >
            <div>
              <div className="text-4xl mb-4">💖</div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                LOML Renewal
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Review and accept your lifelong contract as the love of my life.
              </p>
            </div>
          </Link>
          <Link 
            href="/naanas-space/headache-questionnaire"
            className="group flex flex-col justify-between p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl shadow-xl transition-all hover:bg-slate-800 hover:border-violet-500/30 hover:shadow-violet-500/10"
          >
            <div>
              <div className="text-4xl mb-4">💆🏽‍♀️</div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                Headache Remedy Finder
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Quick guidance to find the ideal therapy session for your current headache.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </NaanasSpaceLayout>
  );
}
