const router    = require("express").Router();
const ctrl      = require("../controllers/index");
const authCtrl  = require("../controllers/authController");
const journalCtrl = require("../controllers/journalController"); 
const protect   = require("../middleware/auth");

router.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);
router.post("/auth/login", authCtrl.login);

router.use(protect);

router.get("/auth/me",        authCtrl.getMe);
router.get("/profile",        ctrl.getProfile);
router.get("/shares",         ctrl.getShares);
router.get("/shares/:script", ctrl.getShareByScript);
router.get("/portfolio",      ctrl.getPortfolio);
router.get("/issues",         ctrl.getApplicableIssues);
router.get("/wacc",           ctrl.getWacc);
router.get("/journal-trades", journalCtrl.getJournalTrades); 
router.get("/sync/logs",      ctrl.getSyncLogs);

module.exports = router;