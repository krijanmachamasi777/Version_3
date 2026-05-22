import { useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { fmt, isClosedTrade, tradePL } from "../utils/helpers";
import "../styles/dashboard.css";

// ── Sector pie colour palette ──────────────────────────────
const SECTOR_COLORS = [
  "#0a84ff", "#34c759", "#ff9f0a", "#bf5af2",
  "#ff453a", "#5ac8fa", "#ffd60a", "#30d158",
  "#ff6b6b", "#a78bfa", "#06b6d4",
];

// Custom label rendered inside each pie slice
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

// ── DASHBOARD TAB ──────────────────────────────────────────
export function Dashboard({ trades, investments = [] }) {
  const total    = trades.reduce((s, t) => s + t.buyAmt, 0);
  const closedTrades = trades.filter(isClosedTrade);
  const netPL    = closedTrades.reduce((s, t) => s + tradePL(t), 0);
  const totalQty = trades.reduce((s, t) => s + t.qty, 0);
  const wins     = closedTrades.filter(t => tradePL(t) > 0).length;
  const winRate  = closedTrades.length ? ((wins / closedTrades.length) * 100).toFixed(2) : "0.00";

  const plS =
    netPL > 500  ? { e: "🚀", l: "Crushing It!", c: "v--profit" } :
    netPL > 0    ? { e: "😊", l: "In Profit",    c: "v--profit" } :
    netPL === 0  ? { e: "😐", l: "Break Even",   c: ""          } :
    netPL > -400 ? { e: "😟", l: "Minor Loss",   c: "v--loss"   } :
                   { e: "😰", l: "Heavy Loss",   c: "v--loss"   };

  // ── Bar chart 1: Profit vs Loss monthly (from closed trades) ──
  const plBarData = useMemo(() => {
    const m = {};
    trades.forEach(t => {
      if (!isClosedTrade(t) || !t.soldDate) return;
      const k   = t.soldDate.slice(0, 7);
      const lbl = new Date(t.soldDate + "T12:00:00").toLocaleDateString("en", { month: "short", year: "2-digit" });
      if (!m[k]) m[k] = { name: lbl, Profit: 0, Loss: 0 };
      const pl = tradePL(t);
      if (pl > 0) m[k].Profit += pl; else m[k].Loss += Math.abs(pl);
    });
    return Object.entries(m).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([, v]) => ({
      name: v.name,
      Profit: Number(v.Profit.toFixed(2)),
      Loss:   Number(v.Loss.toFixed(2)),
    }));
  }, [trades]);

  // ── Bar chart 2: Invested Capital vs Net Profit monthly ──
  const capitalBarData = useMemo(() => {
    const m = {};
    trades.forEach(t => {
      if (!isClosedTrade(t) || !t.soldDate) return;
      const k   = t.soldDate.slice(0, 7);
      const lbl = new Date(t.soldDate + "T12:00:00").toLocaleDateString("en", { month: "short", year: "2-digit" });
      if (!m[k]) m[k] = { name: lbl, Invested: 0, NetProfit: 0 };
      m[k].Invested  += t.buyAmt;
      m[k].NetProfit += tradePL(t);
    });
    return Object.entries(m).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([, v]) => ({
      name:      v.name,
      Invested:  Number(v.Invested.toFixed(2)),
      NetProfit: Number(v.NetProfit.toFixed(2)),
    }));
  }, [trades]);

  // ── Pie chart: sector by total qty (investments) ──
  const sectorPieData = useMemo(() => {
    const m = {};
    investments.forEach(inv => {
      const sec = inv.sector?.trim() || "Other";
      const qty = Number(inv.qty) || 0;
      m[sec] = (m[sec] || 0) + qty;
    });
    return Object.entries(m)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [investments]);

  const chartFormatter = value => fmt(value);
  const tooltipStyle   = { background: "var(--s2)", border: "1px solid var(--glow)", borderRadius: 8, fontSize: 12 };

  return (
    <div className="dashboard">
      {/* ── Stat cards ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Invested</div>
          <div className="stat-card__value v--blue">₹{fmt(total)}</div>
          <div className="stat-card__sub">Across all trades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Net P&amp;L</div>
          <div className={`stat-card__value ${netPL >= 0 ? "v--profit" : "v--loss"}`}>
            {netPL >= 0 ? "+" : "-"}₹{fmt(Math.abs(netPL))}
          </div>
          <div className="stat-card__sub">Realized gains/losses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Win Rate</div>
          <div className="stat-card__value v--purple">{winRate}%</div>
          <div className="stat-card__sub">{wins} of {trades.length} trades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Qty Traded</div>
          <div className="stat-card__value">{totalQty.toLocaleString()}</div>
          <div className="stat-card__sub">Shares / units</div>
        </div>
        <div className="emoji-card">
          <div className="emoji-card__icon">{plS.e}</div>
          <div className={`emoji-card__label ${plS.c}`}>{plS.l}</div>
          <div className="emoji-card__sub">Current P&amp;L Scenario</div>
        </div>
      </div>

      {/* ── Sector Pie chart + Legend row ── */}
      <div className="chart-box">
        <div className="chart-box__title">Portfolio by Sector</div>
        <div className="chart-box__sub">Sector allocation by total quantity held in investments</div>
        {sectorPieData.length === 0 ? (
          <div className="chart-empty">No investment data yet — add investments to see sector breakdown.</div>
        ) : (
          <div className="pie-row">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sectorPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={0}
                  paddingAngle={2}
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {sectorPieData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} stroke="var(--bg)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value.toLocaleString()} units`, name]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend */}
            <div className="pie-legend">
              {sectorPieData.map((d, i) => {
                const total = sectorPieData.reduce((s, x) => s + x.value, 0);
                const pct   = total ? ((d.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={d.name} className="pie-legend__item">
                    <span className="pie-legend__dot" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                    <span className="pie-legend__name">{d.name}</span>
                    <span className="pie-legend__val">{d.value.toLocaleString()} <span className="pie-legend__pct">({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bar chart 1: Profit vs Loss monthly ── */}
      <div className="chart-box">
        <div className="chart-box__title">Profit vs Loss — Monthly</div>
        <div className="chart-box__sub">Green bars = realized gains · Red bars = realized losses per month</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={plBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={chartFormatter} />
            <Tooltip formatter={value => fmt(value)} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Profit" fill="var(--g)"  radius={[5,5,0,0]} name="Profit" />
            <Bar dataKey="Loss"   fill="var(--r)"  radius={[5,5,0,0]} name="Loss" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bar chart 2: Invested Capital vs Net Profit ── */}
      <div className="chart-box">
        <div className="chart-box__title">Total Invested Capital vs Net Profit</div>
        <div className="chart-box__sub">Capital deployed each month vs returns generated</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={capitalBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={chartFormatter} />
            <Tooltip formatter={value => fmt(value)} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Invested"  fill="var(--adim)" stroke="var(--acc)" strokeWidth={1} radius={[5,5,0,0]} name="Total Invested" />
            <Bar dataKey="NetProfit" radius={[5,5,0,0]} name="Net Profit">
              {capitalBarData.map((d, i) => (
                <Cell key={i} fill={d.NetProfit >= 0 ? "var(--g)" : "var(--r)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}