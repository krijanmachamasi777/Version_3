// src/controllers/journalController.js
const { getModel } = require("../utils/userCollections");
const logger       = require("../utils/logger");

function getUserName(req) {
  return req.user.name;
}

exports.getJournalTrades = async (req, res) => {
  try {
    const username = getUserName(req);
    const Wacc = getModel(username, "waccs");
    const PortfolioItem = getModel(username, "portfolioitems");

    const [waccRecords, portfolioItems] = await Promise.all([
      Wacc.find()
        .sort({ transactionDate: 1 })
        .select("scrip transactionQuantity rate transactionDate purchaseSource isin boid")
        .lean(),
      PortfolioItem.find()
        .select("script lastTransactionPrice valueOfLastTransPrice currentBalance")
        .lean(),
    ]);

    const portfolioMap = {};
    for (const item of portfolioItems) {
      const scrip = String(item.script || "").toUpperCase().trim();
      if (scrip) portfolioMap[scrip] = item;
    }

    const tsnMap = {};
    const tsnHistory = {};
    let tsnCounter = 1;

    const trades = waccRecords.map((w, idx) => {
      const scrip = (w.scrip || "").toUpperCase().trim();
      const boughtDate = w.transactionDate
        ? new Date(w.transactionDate).toISOString().slice(0, 10)
        : "";

      const recent = tsnHistory[scrip]?.slice().reverse().find(entry => {
        if (!entry.boughtDate || !boughtDate) return false;
        return Math.abs(Math.round((new Date(boughtDate) - new Date(entry.boughtDate)) / 86400000)) <= 12;
      });

      const tsn = recent?.tsn || `TSN${String(tsnCounter++).padStart(3, "0")}`;
      if (!tsnMap[tsn]) tsnMap[tsn] = scrip;
      tsnHistory[scrip] = [...(tsnHistory[scrip] || []), { tsn, boughtDate }];

      const qty     = Number(w.transactionQuantity) || 0;
      const buyRate = Number(w.rate)                || 0;
      const buyAmt  = qty && buyRate ? qty * buyRate : 0;
      const live = portfolioMap[scrip] || {};
      const ltp = Number(live.lastTransactionPrice || 0) || 0;
      const valueAsOfLtp = Number(live.valueOfLastTransPrice || 0) || (qty * ltp);

      return {
        id:          `db_${w._id || idx}`,
        tsn,
        scrip,
        qty,
        buyRate,
        sellRate:    0,       // intentionally blank — not in DB
        buyAmt,
        soldAmt:     0,
        ltp,
        valueAsOfLtp,
        boughtDate,
        soldDate:    "",
        rr:          "—",
        remarks:     w.purchaseSource ? `Source: ${w.purchaseSource}` : "",
        fromDB:      true,
      };
    });

    res.json({ success: true, total: trades.length, data: trades });
  } catch (e) {
    logger.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
};