import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";
import { fmt, isClosedTrade, tradePL } from "../utils/helpers";
import "../styles/dashboard.css";

// ── DASHBOARD TAB ─────────────────────────────────────────
// Props:
//   trades – full array of trade objects

export function Dashboard({ trades }) {
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

  const lineData = useMemo(() => {
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
      Loss: Number(v.Loss.toFixed(2)),
    }));
  }, [trades]);

  const barData = useMemo(() => {
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
      name: v.name,
      Invested: Number(v.Invested.toFixed(2)),
      NetProfit: Number(v.NetProfit.toFixed(2)),
    }));
  }, [trades]);

  const chartFormatter = value => fmt(value);

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

      {/* ── Line chart ── */}
      <div className="chart-box">
        <div className="chart-box__title">Profit vs Loss — Monthly</div>
        <div className="chart-box__sub">Two simultaneous lines tracking gains (green) and losses (red)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={chartFormatter} />
            <Tooltip formatter={value => fmt(value)} contentStyle={{ background: "var(--s2)", border: "1px solid var(--glow)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="Profit" stroke="var(--g)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--g)" }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="Loss"   stroke="var(--r)" strokeWidth={2.5} dot={{ r: 5, fill: "var(--r)" }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bar chart ── */}
      <div className="chart-box">
        <div className="chart-box__title">Total Invested Capital vs Net Profit</div>
        <div className="chart-box__sub">Capital deployed each month vs returns generated</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--b)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={chartFormatter} />
            <Tooltip formatter={value => fmt(value)} contentStyle={{ background: "var(--s2)", border: "1px solid var(--glow)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Invested" fill="var(--adim)" stroke="var(--acc)" strokeWidth={1} radius={[5,5,0,0]} name="Total Invested" />
            <Bar dataKey="NetProfit" radius={[5,5,0,0]} name="Net Profit">
              {barData.map((d, i) => (
                <Cell key={i} fill={d.NetProfit >= 0 ? "var(--g)" : "var(--r)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}