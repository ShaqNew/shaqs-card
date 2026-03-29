"use client";

import React, { useState } from "react";

interface TradingStatsProps {
  state: {
    regime?: string;
    vix?: number;
    holdings?: Record<string, number>;
  } | null;
  portfolio: {
    total_value?: number;
    cash?: number;
    market_value?: number;
    pnl?: number;
    pnl_pct?: number;
  } | null;
  isLoading: boolean;
}

export default function TradingStats({ state, portfolio, isLoading }: TradingStatsProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const renderModalContent = () => {
    switch (selectedCard) {
      case "Market Regime":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Current Regime</span>
              <span className={`font-semibold px-2 py-1 rounded bg-white/5 border border-white/10 ${getRegimeColor(state?.regime).split(" ")[0]}`}>
                {state?.regime || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">VIX Level</span>
              <span className="font-semibold text-white text-lg">{state?.vix?.toFixed(2) || "--"}</span>
            </div>
            <p className="text-sm text-white/50 pt-2 leading-relaxed">
              The regime determines the strategy's risk posture and position sizing logic based on calculated volatility conditions.
            </p>
          </div>
        );
      case "Total Value":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Total Account Value</span>
              <span className="font-semibold text-white text-lg">${portfolio?.total_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Available Cash</span>
              <span className="font-semibold text-emerald-400 text-lg">${portfolio?.cash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Invested Market Value</span>
              <span className="font-semibold text-blue-400 text-lg">${portfolio?.market_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</span>
            </div>
          </div>
        );
      case "Profit / Loss":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Realized + Unrealized PnL</span>
              <span className={`font-semibold text-lg ${(portfolio?.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {portfolio?.pnl !== undefined ? `${portfolio.pnl >= 0 ? "+" : ""}$${portfolio.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-white/60">Return %</span>
              <span className={`font-semibold text-lg ${(portfolio?.pnl_pct || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {portfolio?.pnl_pct !== undefined ? `${portfolio.pnl_pct >= 0 ? "+" : ""}${(portfolio.pnl_pct * 100).toFixed(2)}%` : "0.00%"}
              </span>
            </div>
          </div>
        );
      case "Active Positions":
        const tickers = Object.keys(state?.holdings || {});
        if (tickers.length === 0) {
          return <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/10">No active positions held.</div>;
        }
        return (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {tickers.map(ticker => (
              <div key={ticker} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {ticker.substring(0, 4)}
                  </div>
                  <span className="font-bold text-white text-lg">{ticker}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{state?.holdings![ticker].toLocaleString()}</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest mt-0.5">Shares</div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

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
      value: portfolio?.total_value ? `$${portfolio.total_value.toLocaleString()}` : "$0",
      subValue: `Cash: $${portfolio?.cash?.toLocaleString() || "0"}`,
      colorClass: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      icon: "fa-solid fa-wallet",
    },
    {
      label: "Profit / Loss",
      value: portfolio?.pnl !== undefined ? `${portfolio.pnl >= 0 ? "+" : ""}$${portfolio.pnl.toLocaleString()}` : "$0",
      subValue: portfolio?.pnl_pct !== undefined ? `${portfolio.pnl_pct >= 0 ? "+" : ""}${(portfolio.pnl_pct * 100).toFixed(2)}%` : "0.00%",
      colorClass: (portfolio?.pnl || 0) >= 0 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20",
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedCard(stat.label)}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden cursor-pointer active:scale-[0.98]"
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

      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center justify-center"
              onClick={() => setSelectedCard(null)}
              aria-label="Close details"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">{selectedCard}</h3>
              <div className="w-12 h-1 bg-indigo-500/50 rounded-full mt-3"></div>
            </div>
            
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
}
