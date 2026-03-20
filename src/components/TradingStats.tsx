"use client";

import React from "react";

interface TradingStatsProps {
  state: {
    regime?: string;
    vix?: number;
    realised_vol?: number;
    atr_ratio?: number;
    cash?: number;
    market_value?: number;
    total_value?: number;
    pnl?: number;
    pnl_pct?: number;
    holdings?: Record<string, any>;
  } | null;
  isLoading: boolean;
}

export default function TradingStats({ state, isLoading }: TradingStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    );
  }

  if (!state) {
    return (
      <div className="text-center py-12 text-white/40">
        No active trading state found.
      </div>
    );
  }

  const getRegimeColor = (regime?: string) => {
    switch (regime?.toUpperCase()) {
      case "CALM":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "ELEVATED":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "HIGH":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "EXTREME":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const stats = [
    {
      label: "Market Regime",
      value: state.regime || "UNKNOWN",
      subValue: `VIX: ${state.vix?.toFixed(1) || "--"}`,
      colorClass: getRegimeColor(state.regime),
      icon: "fa-solid fa-chart-line",
    },
    {
      label: "Total Value",
      value: state.total_value ? `$${state.total_value.toLocaleString()}` : "$0",
      subValue: `Cash: $${state.cash?.toLocaleString() || "0"}`,
      colorClass: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      icon: "fa-solid fa-wallet",
    },
    {
      label: "Profit / Loss",
      value: state.pnl !== undefined ? `${state.pnl >= 0 ? "+" : ""}$${state.pnl.toLocaleString()}` : "$0",
      subValue: state.pnl_pct !== undefined ? `${state.pnl_pct >= 0 ? "+" : ""}${state.pnl_pct.toFixed(2)}%` : "0.00%",
      colorClass: (state.pnl || 0) >= 0 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20",
      icon: "fa-solid fa-arrow-trend-up",
    },
    {
      label: "Active Positions",
      value: Object.keys(state.holdings || {}).length.toString(),
      subValue: "Assets Managed",
      colorClass: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      icon: "fa-solid fa-briefcase",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs uppercase tracking-wider text-white/40 font-medium">{stat.label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.colorClass.split(" ")[0]} bg-white/5`}>
              <i className={stat.icon}></i>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white mb-1">{stat.value}</span>
            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold w-fit border ${stat.colorClass}`}>
              {stat.subValue}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
