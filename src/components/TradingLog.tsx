"use client";

import React, { useState, useMemo } from "react";

interface TradeData {
  action: "BUY" | "SELL" | "LIQUIDATE";
  ticker: string;
  shares: number;
  price: number;
  value: number;
}

interface RegimeChangeData {
  old_regime: string;
  new_regime: string;
  vix: number;
  reason?: string;
}

interface PortfolioSummaryData {
  cash: number;
  market_value: number;
  total_value: number;
  pnl: number;
  pnl_pct: number;
  holdings: Record<string, {
    shares: number;
    cost_basis: number;
    last_price: number;
    mkt_value: number;
    pnl: number;
    pnl_pct: number;
  }>;
}

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR";
  event: "TRADE" | "REGIME_CHANGE" | "PORTFOLIO_SUMMARY" | "RESEARCH" | string;
  message: string;
  data?: TradeData | RegimeChangeData | PortfolioSummaryData | any;
}

interface TradingLogProps {
  logs: LogEntry[];
  isLoading: boolean;
}

export default function TradingLog({ logs, isLoading }: TradingLogProps) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filterCategories = [
    { id: "ALL", label: "All", events: [] },
    { id: "TRADES", label: "Trades", events: ["TRADE", "REBALANCE"] },
    { id: "REGIME", label: "Regime", events: ["REGIME_CHANGE"] },
    { id: "PORTFOLIO", label: "Portfolio", events: ["PORTFOLIO_SUMMARY", "DRAWDOWN"] },
    { id: "ANALYSIS", label: "Analysis", events: ["RESEARCH_RESULT", "RESEARCH"] },
    { id: "ERRORS", label: "Errors", events: ["ERROR"] },
  ];

  const filteredLogs = useMemo(() => {
    if (selectedFilter === "ALL") return logs;
    const category = filterCategories.find(c => c.id === selectedFilter);
    if (!category) return logs;
    return logs.filter(log => category.events.includes(log.event.toUpperCase()));
  }, [logs, selectedFilter]);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mt-8 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden animate-pulse">
        <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-6">
          <div className="w-32 h-4 bg-white/10 rounded" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "INFO":
        return "text-blue-400";
      case "WARNING":
        return "text-amber-400";
      case "ERROR":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getEventIcon = (event: string) => {
    switch (event.toUpperCase()) {
      case "TRADE":
        return "fa-solid fa-money-bill-transfer text-emerald-400";
      case "REGIME_CHANGE":
        return "fa-solid fa-cloud-bolt text-amber-400";
      case "PORTFOLIO_SUMMARY":
        return "fa-solid fa-chart-pie text-indigo-400";
      case "RESEARCH":
        return "fa-solid fa-microscope text-blue-400";
      default:
        return "fa-solid fa-terminal text-slate-400";
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
          <i className="fa-solid fa-list-ul text-blue-500"></i>
          Activity Terminal
        </h2>
        <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Live Logs</span>
      </div>

      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-white/5 border-b border-white/5 px-6 py-3 flex items-center justify-between">
          {/* <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          </div> */}
          
          <div className="flex items-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
            {filterCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`
                  px-2.5 py-1 rounded-md text-[10px] uppercase tracking-tighter font-bold transition-all whitespace-nowrap
                  ${selectedFilter === cat.id 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "text-white/20 hover:text-white/40 hover:bg-white/5 border border-transparent"}
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* <div className="hidden md:block text-[10px] font-mono text-white/30 tracking-widest uppercase">Trading-Monitor-v1.0.0</div> */}
        </div>

        {/* Scrollable Log Area */}
        <div className="max-h-[500px] overflow-y-auto font-mono text-sm custom-scrollbar">
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className="px-6 py-3 hover:bg-white/5 transition-colors flex items-start gap-4 group"
                >
                  <div className="text-white/30 tabular-nums whitespace-nowrap pt-0.5 min-w-[140px]">
                    {new Date(log.timestamp).toLocaleString("en-GB", { 
                      hour: "2-digit", 
                      minute: "2-digit", 
                      second: "2-digit",
                      day: "2-digit",
                      month: "short"
                    })}
                  </div>
                  
                  <div className="w-5 text-center pt-0.5">
                    <i className={`${getEventIcon(log.event)} text-xs opacity-70`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <span className={`font-bold mr-2 text-[10px] tracking-wider uppercase opacity-80 ${getLevelColor(log.level)}`}>
                      [{log.level}]
                    </span>
                    <span className="text-white/80 leading-relaxed">{log.message}</span>
                    
                    {log.data && Object.keys(log.data).length > 0 && (
                      <div className="mt-2 bg-black/20 rounded p-3 text-xs text-white/40 border border-white/5 overflow-x-auto">
                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-white/20 italic">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
