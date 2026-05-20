import { fmt, holdDays } from "../utils/helpers";
import "../styles/investment.css";

// ── INVESTMENT TAB ────────────────────────────────────────
// Props:
//   investments  – array of investment objects
//   onScripClick – called with { scrip, investments: [...] } or single inv
//
// Grouping logic:
//   • Sort by boughtDate asc, then scrip asc
//   • Rows with the same scrip name are grouped: one SN, one SCRIP button
//   • Clicking the SCRIP button opens the group detail modal
//   • No 15-day window — ALL entries with the same scrip name are one group

export function Investment({ investments, onScripClick }) {
  const holdingCount = investments.filter(i => !i.soldDate).length;
  const soldCount    = investments.filter(i => !!i.soldDate).length;

  // Sort: boughtDate asc, then scrip asc
  const sorted = [...investments].sort((a, b) => {
    const dc = (a.boughtDate || "").localeCompare(b.boughtDate || "");
    return dc || (a.scrip || "").localeCompare(b.scrip || "");
  });

  // Assign one stable SN per unique scrip (first-seen order)
  const scripSnMap = {};
  let snCounter = 0;
  sorted.forEach(inv => {
    const key = (inv.scrip || "").trim().toUpperCase();
    if (!(key in scripSnMap)) scripSnMap[key] = ++snCounter;
  });

  let lastScrip = null;

  return (
    <div className="card--np">
      <div className="card__header">
        <div>
          <div className="card__title">Investment Portfolio</div>
          <div className="card__sub">Click any SCRIP to view all entries · Edit · Delete</div>
        </div>
        <div className="inv-badges">
          <span className="status-badge sb--holding">⬤ {holdingCount} Holding</span>
          <span className="status-badge sb--sold">✓ {soldCount} Sold</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>SCRIP</th>
              <th>Quantity</th>
              <th>Buy Rate</th>
              <th>Bought Date</th>
              <th>Bought Amount</th>
              <th>Holding Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="td--empty">No investments yet</td>
              </tr>
            )}
            {sorted.map((inv) => {
              const key        = (inv.scrip || "").trim().toUpperCase();
              const isNewGroup = key !== lastScrip;
              lastScrip        = key;

              const isSold = !!inv.soldDate;
              const d      = holdDays(inv.boughtDate, inv.soldDate);
              const sn     = scripSnMap[key];

              const handleScripClick = isNewGroup
                ? () => {
                    const groupInvs = sorted.filter(
                      i => (i.scrip || "").trim().toUpperCase() === key
                    );
                    // single entry → pass object directly; multiple → pass group
                    if (groupInvs.length === 1) {
                      onScripClick(groupInvs[0]);
                    } else {
                      onScripClick({ scrip: inv.scrip, investments: groupInvs });
                    }
                  }
                : undefined;

              return (
                <tr
                  key={inv.id}
                  className={isNewGroup ? "inv-row--group-start" : "inv-row--group-cont"}
                >
                  <td className="td--muted">{isNewGroup ? sn : ""}</td>
                  <td>
                    {isNewGroup ? (
                      <button className="scrip-btn" onClick={handleScripClick}>
                        {inv.scrip}
                      </button>
                    ) : null}
                  </td>
                  <td>{inv.qty}</td>
                  <td className="td--mono">₹{fmt(inv.buyRate)}</td>
                  <td className="td--mono">{inv.boughtDate}</td>
                  <td className="td--mono">₹{fmt(inv.buyAmt)}</td>
                  <td className="td--mono inv-days">{d}{d !== "—" ? "d" : ""}</td>
                  <td>
                    {isSold
                      ? <span className="status-badge sb--sold">✓ Sold</span>
                      : <span className="status-badge sb--holding">⬤ Holding</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
