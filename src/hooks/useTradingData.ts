import { useState, useEffect, useCallback } from "react";

const TRADING_API_HOST = process.env.NEXT_PUBLIC_TRADING_API_HOST || "YOUR_DROPLET_IP"; 
const TRADING_API_KEY = process.env.NEXT_PUBLIC_TRADING_API_KEY || "";
const BASE_URL = `/api/trading`; // Using Next.js local proxy to bypass CORS

const defaultHeaders = TRADING_API_KEY ? { "X-API-Key": TRADING_API_KEY } : undefined;

export function useTradingData() {
  const [state, setState] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [regimeChanges, setRegimeChanges] = useState<any[]>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (TRADING_API_HOST === "YOUR_DROPLET_IP") {
      setError("API Host not configured. Please set NEXT_PUBLIC_TRADING_API_HOST.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use the standalone functions to fetch everything concurrently
      const [healthData, statusData, logsData, tradesData, regimeData] = await Promise.all([
        checkHealth(),
        getStatus().catch(() => ({ state: null })),
        getLogs({ limit: 50 }).catch(() => ({ logs: [] })),
        getTrades(10).catch(() => ({ trades: [] })),
        getRegimeChanges(5).catch(() => ({ regime_changes: [] }))
      ]);

      if (!statusData.state) throw new Error("Status API returned empty state or unauthorized.");

      setState(statusData.state);
      setLogs(logsData.logs || []);
      setTrades(tradesData.trades || []);
      setRegimeChanges(regimeData.regime_changes || []);
      setServerTime(healthData?.server_time_utc || null);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to connect to the Trading API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    state,
    logs,
    trades,
    regimeChanges,
    serverTime,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
    isHostConfigured: TRADING_API_HOST !== "YOUR_DROPLET_IP"
  };
}

// ─── Health check ───────────────────────────────────────────────────────────
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

// ─── All logs (with optional filters) ───────────────────────────────────────
export async function getLogs({ limit = 100, level = null, event = null }: { limit?: number; level?: string | null; event?: string | null } = {}) {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (level) params.append("level", level);
  if (event) params.append("event", event);

  const res = await fetch(`${BASE_URL}/logs?${params.toString()}`, { headers: defaultHeaders });
  return res.json();
}

// ─── Latest single log entry ────────────────────────────────────────────────
export async function getLatestLog() {
  const res = await fetch(`${BASE_URL}/logs/latest`, { headers: defaultHeaders });
  return res.json();
}

// ─── Trade history ──────────────────────────────────────────────────────────
export async function getTrades(limit: number = 50) {
  const res = await fetch(`${BASE_URL}/logs/trades?limit=${limit}`, { headers: defaultHeaders });
  return res.json();
}

// ─── Regime change history ──────────────────────────────────────────────────
export async function getRegimeChanges(limit: number = 20) {
  const res = await fetch(`${BASE_URL}/logs/regime-changes?limit=${limit}`, { headers: defaultHeaders });
  return res.json();
}

// ─── Portfolio snapshots ─────────────────────────────────────────────────────
export async function getPortfolioHistory(limit: number = 20) {
  const res = await fetch(`${BASE_URL}/logs/portfolio?limit=${limit}`, { headers: defaultHeaders });
  return res.json();
}

// ─── Current portfolio state ────────────────────────────────────────────────
export async function getStatus() {
  const res = await fetch(`${BASE_URL}/status`, { headers: defaultHeaders });
  return res.json();
}

