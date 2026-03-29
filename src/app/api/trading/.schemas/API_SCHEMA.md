# Trading API Endpoint Schemas

The Flask server (`api/server.py`) returns structured JSON responses for all endpoints. Below is the schema for the returned objects.

---

## Base Metadata Schema
Most endpoints return a `meta` block containing server context:
```json
"meta": {
  "server_time_utc": "2026-03-20T08:30:00Z",  // string (ISO-8601 UTC)
  "log_file": "monitor_logs.json"             // string
}
```

---

## 1. `GET /health`
Returns a simple health check status.
```json
{
  "status": "ok",                               // string
  "server_time_utc": "2026-03-20T08:30:00Z"     // string (ISO-8601 UTC)
}
```

---

## 2. `GET /logs`
Returns the most recent logs from `monitor_logs.json`.
```json
{
  "meta": { ... },
  "count": 200,                                 // integer (number of logs returned)
  "filters": {
    "level": "INFO",                            // string | null
    "event": "TRADE",                           // string | null
    "limit": 200                                // integer
  },
  "logs": [                                     // array of Log Objects (newest first)
    {
      "timestamp": "2026-03-20T08:30:00Z",      // string (ISO-8601 UTC)
      "level": "INFO",                          // string ("INFO" | "WARNING" | "ERROR")
      "event": "TRADE",                         // string ("HEARTBEAT" | "REGIME_CHANGE" | "TRADE" | "REBALANCE" | "DRAWDOWN" | "PORTFOLIO_SUMMARY" | "ERROR" | "RESEARCH_RESULT")
      "data": { ... }                           // object (Schema depends on the event type)
    }
  ]
}
```
*(See the bottom of this document for the inner `data` schema per event).*

---

## 3. `GET /logs/latest`
Returns only the single most recent log entry.
```json
{
  "meta": { ... },
  "log": {                                      // object | null (Single Log Object)
    "timestamp": "2026-03-20T08:30:00Z",
    "level": "INFO",
    "event": "HEARTBEAT",
    "data": { ... }
  }
}
```

---

## 4. Derived Log Endpoints
These endpoints are wrappers around `/logs` that hardcode the `event` filter. They rename the `logs` array key to match the context.

### `GET /logs/trades`
```json
{
  "meta": { ... },
  "count": 5,                                   // integer
  "trades": [ ... ]                             // array of Log Objects (event="TRADE")
}
```

### `GET /logs/regime-changes`
```json
{
  "meta": { ... },
  "count": 2,                                   // integer
  "regime_changes": [ ... ]                     // array of Log Objects (event="REGIME_CHANGE")
}
```

### `GET /logs/portfolio`
```json
{
  "meta": { ... },
  "count": 10,                                  // integer
  "summaries": [ ... ]                          // array of Log Objects (event="PORTFOLIO_SUMMARY")
}
```

---

## 5. `GET /status`
Returns the content of the `monitor_state.json` file.
```json
{
  "meta": { ... },
  "state": {                                    // object | null (Content of monitor_state.json)
    "regime": "CALM",                           // string
    "vix": 14.5,                                // float
    "holdings": {
      "AAPL": 15                                // map of string -> integer (shares)
    },
    ...
  }
}
```
*(If the state file is missing, it returns `404 Not Found` with a `message` key).*

---

## Appendix: Log Event `data` Schemas
The `data` payload inside a log object varies by `event` type:

- **`HEARTBEAT`**
  ```json
  {
    "check_number": 12,
    "regime": "CALM",
    "vix": 14.5,
    "realized_vol_pct": 12.1
  }
  ```
- **`REGIME_CHANGE`**
  ```json
  {
    "previous_regime": "CALM",
    "new_regime": "ELEVATED",
    "vix": 22.3,
    "realized_vol_pct": 18.5,
    "atr_expansion_ratio": 1.4
  }
  ```
- **`TRADE`**
  ```json
  {
    "action": "BUY",          // "BUY", "SELL", or "LIQUIDATE"
    "ticker": "AAPL",
    "shares": 10,
    "price": 175.50,
    "cash_after": 8245.00
  }
  ```
- **`PORTFOLIO_SUMMARY`**
  ```json
  {
    "total_value": 11000.00,
    "cash": 8245.00,
    "market_value": 2755.00,
    "pnl": 1000.00,
    "pnl_pct": 0.10,
    "holdings": { "AAPL": 10, "MSFT": 5 }
  }
  ```
- **`REBALANCE`**
  ```json
  {
    "orders": [
      { "action": "BUY", "ticker": "AAPL", "shares": 2 }
    ],
    "target_weights": { "AAPL": 0.5, "MSFT": 0.5 }
  }
  ```
- **`DRAWDOWN`**
  ```json
  {
    "peak_value": 12000.00,
    "current_value": 9000.00,
    "drawdown_pct": 0.25
  }
  ```
- **`ERROR`**
  ```json
  {
    "message": "Connection timeout during fetch",
    "context": "yfinance_api"
  }
  ```
- **`RESEARCH_RESULT`**
  ```json
  {
    "ticker": "AAPL",
    "score": 0.85,
    "stats": { "Return [%]": 15.2, "Sharpe Ratio": 1.2, "Max Drawdown [%]": -12.5, "# Trades": 45.0 }
  }
  ```
