// src/tabs/MSWacc.jsx — WACC history — uses AuthContext
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fmt }     from "../utils/helpers";
import "../styles/meroshare.css";

export function MSWacc() {
  const { fetchWacc, logout } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("");

  const load = useCallback(() => {
    setLoading(true); setError(null);
    // fetchWacc calls GET /api/wacc → data is an array of Wacc records
    fetchWacc().then(d => setRecords(Array.isArray(d) ? d : [])).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [fetchWacc]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="ms-state">⏳ Fetching WACC data…</div>;
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

  const filtered = records.filter(r =>
    !filter || (r.scrip || "").toLowerCase().includes(filter.toLowerCase())
  );
  const uniqueScrips = [...new Set(records.map(r => r.scrip))].filter(Boolean);

  return (
    <div className="ms-wrap">
      <div className="stat-grid ms-summary">
        <div className="stat-card">
          <div className="stat-card__label">Scripts</div>
          <div className="stat-card__value v--blue">{uniqueScrips.length}</div>
          <div className="stat-card__sub">Unique scripts with WACC</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Transactions</div>
          <div className="stat-card__value">{records.length}</div>
          <div className="stat-card__sub">Purchase records</div>
        </div>
      </div>
      <div className="card--np ms-card">
        <div className="card__header">
          <div>
            <div className="card__title">WACC Purchase History</div>
            <div className="card__sub">Weighted Average Cost of Capital per scrip</div>
          </div>
          <input className="ms-search" placeholder="Filter by scrip…" value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Script</th><th>ISIN</th><th>Qty</th><th>Rate (NPR)</th><th>Source</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="td--empty">No WACC records found.</td></tr>}
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td className="td--muted">{i + 1}</td>
                  <td><span className="scrip-btn" style={{cursor:"default"}}>{r.scrip || "—"}</span></td>
                  <td className="td--muted td--mono" style={{fontSize:11}}>{r.isin || "—"}</td>
                  <td className="td--mono">{r.transactionQuantity ?? "—"}</td>
                  <td className="td--mono td--bold">NPR {fmt(r.rate)}</td>
                  <td><span className="badge badge--default">{r.purchaseSource || "—"}</span></td>
                  <td className="td--mono">{r.transactionDate ? r.transactionDate.split("T")[0] : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
