"use client";

import Link from "next/link";
import TradingStats from "@/components/TradingStats";
import TradingLog from "@/components/TradingLog";
import TradeHistory from "@/components/TradeHistory";
import RegimeTimeline from "@/components/RegimeTimeline";
import { useTradingData } from "@/hooks/useTradingData";

export default function TradingPage() {
  const { 
    state, 
    logs, 
    trades,
    regimeChanges,
    serverTime,
    isLoading, 
    error, 
    lastUpdated, 
    refetch, 
    isHostConfigured 
  } = useTradingData();

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-slate-100 font-sans selection:bg-blue-500/30 pt-24 pb-12 p-6 md:p-12 lg:p-24 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        
        {/* Navigation / Header */}
        <div className="w-full flex justify-between items-center mb-16 animate-fade-in-down max-w-5xl">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Connection Status</span>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-blue-400 animate-pulse' : error ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="text-sm font-medium text-white/80">
                    {isLoading ? 'Polling...' : error ? 'Offline' : 'Connected'}
                  </span>
                </div>
             </div>
             <button 
                onClick={() => refetch()}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
             >
                <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'animate-spin' : ''}`}></i>
             </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-16 animate-fade-in-up w-full max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Trading Automations Droplet
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Market Monitor
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-4 font-light leading-relaxed">
            Real-time insights from my remotely hosted trading engine. Monitor regimes, P&L, and strategy logs in one unified dashboard.
          </p>
          <div className="flex flex-col gap-1 items-center">
            {lastUpdated && (
              <span className="text-xs font-mono text-white/20 uppercase tracking-widest">
                Last Refresh: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {serverTime && (
              <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">
                API Clock: {new Date(serverTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        {error && isHostConfigured && (
          <div className="w-full max-w-4xl mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {!isHostConfigured && (
           <div className="w-full max-w-4xl mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm flex flex-col gap-3">
              <div className="flex items-center gap-3 font-semibold text-base">
                <i className="fa-solid fa-circle-info"></i>
                <span>Configuration Required</span>
              </div>
              <p className="opacity-80">
                To start receiving data, you need to point the dashboard to your Digital Ocean droplet IP. 
                Update <code className="bg-amber-400/10 px-1 rounded">NEXT_PUBLIC_TRADING_API_HOST</code> in your environment or code.
              </p>
           </div>
        )}

        <TradingStats state={state} isLoading={isLoading} />
        
        {/* Bottom Section: Logs, Trades, Regimes */}
        <div className="w-full max-w-6xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TradingLog logs={logs} isLoading={isLoading} />
          </div>
          
          <div className="flex flex-col gap-6">
            {!isLoading && trades?.length > 0 && (
              <TradeHistory trades={trades} />
            )}
            {!isLoading && regimeChanges?.length > 0 && (
              <RegimeTimeline regimes={regimeChanges} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
