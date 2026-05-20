// src/tabs/MSPortfolio.jsx — Fixed data shape + uses AuthContext
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fmt }     from "../utils/helpers";
import "../styles/meroshare.css";

export function MSPortfolio() {
  const { fetchPortfolio, logout } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetchPortfolio().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [fetchPortfolio]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="ms-state">⏳ Loading portfolio…</div>;
  if (error) return (
    <div className="ms-state ms-state--err">
      ⚠ {error}
      <div style={{ display:"flex", gap:10 }}>
        <button className="ms-relogin" onClick={load}>Retry</button>
        {(error.includes("token") || error.includes("401")) && (
          <button className="ms-relogin" onClick={logout}>Re-login</button>
        )}
      </div>
    </div>
  );

  // Backend: { summary: { totalCost, totalValue }, items: [...] }
  const summary = data?.summary || {};
  const items   = data?.items   || [];
  const cost    = Number(summary.totalCost  || summary.totalCostPrice  || 0);
  const value   = Number(summary.totalValue || summary.totalValueOfLastTransPrice || 0);
  const gain    = value - cost;

  return (
    <div className="ms-wrap">
      <div className="stat-grid ms-summary">
        <div className="stat-card">
          <div className="stat-card__label">Total Cost</div>
          <div className="stat-card__value v--blue">NPR {fmt(cost)}</div>
          <div className="stat-card__sub">Amount invested</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Market Value</div>
          <div className="stat-card__value">NPR {fmt(value)}</div>
          <div className="stat-card__sub">Current valuation</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Unrealized P&L</div>
          <div className={`stat-card__value ${gain >= 0 ? "v--profit" : "v--loss"}`}>
            {gain >= 0 ? "+" : ""}NPR {fmt(gain)}
          </div>
          <div className="stat-card__sub">Market − Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Holdings</div>
          <div className="stat-card__value v--purple">{items.length}</div>
          <div className="stat-card__sub">Unique scripts</div>
        </div>
      </div>
      <div className="card--np ms-card">
        <div className="card__header">
          <div>
            <div className="card__title">MeroShare Portfolio</div>
            <div className="card__sub">Live data from your CDSC demat account</div>
          </div>
          <span className="card__count">{items.length} scripts</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Script</th><th>Qty</th><th>LTP (NPR)</th><th>Total Value (NPR)</th><th>Free Balance</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={6} className="td--empty">No holdings found.</td></tr>}
              {items.map((h, i) => {
                const scrip = h.script || h.scrip || h.symbol || "—";
                const qty   = h.currentBalance ?? h.qty ?? "—";
                const ltp   = h.lastTransactionPrice ?? h.ltp ?? 0;
                const val   = h.valueOfLastTransPrice ?? (Number(ltp) * Number(qty)) ?? 0;
                const free  = h.freeBalance ?? h.availableBalance ?? "—";
                return (
                  <tr key={i}>
                    <td className="td--muted">{i + 1}</td>
                    <td><span className="scrip-btn" style={{cursor:"default"}}>{scrip}</span></td>
                    <td className="td--mono">{qty}</td>
                    <td className="td--mono">NPR {fmt(ltp)}</td>
                    <td className="td--mono td--bold">NPR {fmt(val)}</td>
                    <td className="td--mono td--muted">{free}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
