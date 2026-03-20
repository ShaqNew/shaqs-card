"use client";

import React from "react";

interface TradeEntry {
  timestamp: string;
  data: {
    action: string;
    ticker: string;
    shares: number;
    price: number;
    value: number;
  };
}

interface TradeHistoryProps {
  trades: TradeEntry[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  if (!trades || trades.length === 0) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-white/5 border-b border-white/5 px-6 py-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <i className="fa-solid fa-money-bill-transfer text-emerald-400"></i>
          Recent Transactions
        </h3>
      </div>
      <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
        {trades.map((trade, idx) => {
          const { action, ticker, shares, price, value } = trade.data;
          const isBuy = action.toUpperCase() === "BUY";
          
          return (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <i className={`fa-solid ${isBuy ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                </div>
                <div>
                  <div className="font-bold text-white tracking-wider">{ticker}</div>
                  <div className="text-xs text-white/40">
                    {new Date(trade.timestamp).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-mono font-medium">${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-xs text-white/40 font-mono">
                  {shares} @ ${price?.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
