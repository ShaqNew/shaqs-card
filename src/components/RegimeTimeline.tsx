"use client";

import React from "react";

interface RegimeEntry {
  timestamp: string;
  data: {
    old_regime: string;
    new_regime: string;
    vix: number;
    reason: string;
  };
}

interface RegimeTimelineProps {
  regimes: RegimeEntry[];
}

export default function RegimeTimeline({ regimes }: RegimeTimelineProps) {
  if (!regimes || regimes.length === 0) return null;

  const getRegimeColor = (regime: string) => {
    switch (regime.toUpperCase()) {
      case "CALM":
        return "text-emerald-400 bg-emerald-400/20";
      case "ELEVATED":
        return "text-amber-400 bg-amber-400/20";
      case "HIGH":
        return "text-orange-400 bg-orange-400/20";
      case "EXTREME":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/20";
    }
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-white/5 border-b border-white/5 px-6 py-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <i className="fa-solid fa-cloud-bolt text-amber-400"></i>
          Market Regime Shifts
        </h3>
      </div>
      <div className="p-6">
        <div className="relative border-l border-white/10 ml-3 space-y-8">
          {regimes.map((entry, idx) => (
            <div key={idx} className="relative pl-6">
              <span className={`absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-black ${getRegimeColor(entry.data.new_regime).split(' ')[1]}`} />
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-white/40">
                  {new Date(entry.timestamp).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex items-center gap-2 mt-1">
                   <span className={`text-xs px-2 py-0.5 rounded font-bold ${getRegimeColor(entry.data.old_regime).split(' ')[0]} bg-white/5`}>
                     {entry.data.old_regime}
                   </span>
                   <i className="fa-solid fa-arrow-right text-white/20 text-xs"></i>
                   <span className={`text-xs px-2 py-0.5 rounded font-bold ${getRegimeColor(entry.data.new_regime).split(' ')[0]} bg-white/5`}>
                     {entry.data.new_regime}
                   </span>
                </div>
                {entry.data.vix && (
                  <p className="text-sm text-white/80 mt-2">
                    VIX shifted to <span className="font-mono text-white">{entry.data.vix.toFixed(1)}</span>
                  </p>
                )}
                {entry.data.reason && (
                  <p className="text-xs text-white/50 italic mt-1 border-l-2 border-white/10 pl-2">
                    {entry.data.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
