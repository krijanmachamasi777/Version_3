// src/controllers/journalController.js
const { getModel } = require("../utils/userCollections");
const logger       = require("../utils/logger");

function getUserName(req) {
  return req.user.name;
}

exports.getJournalTrades = async (req, res) => {
  try {
    const username = getUserName(req);
    const Wacc     = getModel(username, "waccs");
    const Share    = getModel(username, "shares");

    const [waccRecords, shareRecords] = await Promise.all([
      Wacc.find()
        .sort({ transactionDate: 1 })
        .select("scrip transactionQuantity rate transactionDate purchaseSource isin boid")
        .lean(),
      Share.find()
        .select("script currentBalance freeBalance")
        .lean(),
    ]);

    const shareMap = {};
    for (const s of shareRecords) {
      shareMap[s.script] = s;
    }

    const tsnMap = {};
    let tsnCounter = 1;

    const trades = waccRecords.map((w, idx) => {
      const scrip = (w.scrip || "").toUpperCase().trim();

      if (!tsnMap[scrip]) {
        tsnMap[scrip] = `TSN${String(tsnCounter++).padStart(3, "0")}`;
      }
      const tsn = tsnMap[scrip];

      const qty     = Number(w.transactionQuantity) || 0;
      const buyRate = Number(w.rate)                || 0;
      const buyAmt  = qty && buyRate ? qty * buyRate : 0;

      const boughtDate = w.transactionDate
        ? new Date(w.transactionDate).toISOString().slice(0, 10)
        : "";

      return {
        id:          `db_${w._id || idx}`,
        tsn,
        scrip,
        qty,
        buyRate,
        sellRate:    0,       // intentionally blank — not in DB
        buyAmt,
        soldAmt:     0,
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