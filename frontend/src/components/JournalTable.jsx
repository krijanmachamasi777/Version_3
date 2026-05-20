import { fmt, isClosedTrade, tradePL } from "../utils/helpers";

// ── JOURNAL TABLE ─────────────────────────────────────────
// Shared between Journal tab and Losing tab.
// Props:
//   trades       – array of trade objects
//   onScripClick – called with the trade when scrip button is clicked

export function JournalTable({ trades, onScripClick }) {
  let lastTSN = null;
  let groupedTSN = null;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>TSN</th>
            <th>SCRIP</th>
            <th>Quantity</th>
            <th>Buy Rate</th>
            <th>Sell Rate</th>
            <th>Buy Amount</th>
            <th>Sold Amount</th>
            <th>P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {trades.length === 0 && (
            <tr>
              <td colSpan={8} className="td--empty">No trades found</td>
            </tr>
          )}
          {trades.map((t, index) => {
            const pl  = tradePL(t);
            const pos = pl != null ? pl >= 0 : null;
            const showGroup = t.tsn !== lastTSN;
            const tsn = t.tsn;
            let onClick = null;
            if (showGroup) {
              const groupTrades = trades.filter(item => item.tsn === tsn);
              onClick = () => onScripClick({ tsn, scrip: t.scrip, trades: groupTrades });
            }
            lastTSN = tsn;
            return (
              <tr key={t.id}>
                <td className="td--mono">{showGroup ? tsn : ""}</td>
                <td>
                  {showGroup ? (
                    <button className="scrip-btn" onClick={onClick}>
                      {t.scrip}
                    </button>
                  ) : null}
                </td>
                <td>{t.qty}</td>
                <td className="td--mono">₹{fmt(t.buyRate)}</td>
                <td className="td--mono">{isClosedTrade(t) ? `₹${fmt(t.sellRate)}` : "—"}</td>
                <td className="td--mono">₹{fmt(t.buyAmt)}</td>
                <td className="td--mono">{isClosedTrade(t) ? `₹${fmt(t.soldAmt)}` : "—"}</td>
                <td className={pl != null ? (pos ? "td--profit" : "td--loss") : "td--empty"}>
                  {pl != null ? `${pos ? "+" : "-"}₹${fmt(Math.abs(pl))}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}