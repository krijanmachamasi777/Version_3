// src/api/meroshare.js
// ─────────────────────────────────────────────────────────────
// All MeroShare data endpoints (all require a valid JWT).
//
// Backend routes (routes/index.js):
//   GET  /api/profile
//   GET  /api/shares
//   GET  /api/portfolio          → { summary, items }
//   GET  /api/issues[?type=IPO]  → array of ApplicableIssue
//   GET  /api/wacc[?script=X]    → array of Wacc records
//   POST /api/sync
//   GET  /api/sync/logs
// ─────────────────────────────────────────────────────────────

import { apiFetch } from "./client";

export const getProfile   = (token)         => apiFetch("/profile",   token);
export const getShares    = (token)         => apiFetch("/shares",    token);
export const getPortfolio = (token)         => apiFetch("/portfolio", token);
export const getIssues    = (token, type)   =>
  apiFetch(`/issues${type ? `?type=${type}` : ""}`, token);
export const getWacc      = (token, script) =>
  apiFetch(`/wacc${script ? `?script=${script}` : ""}`, token);
export const triggerSync  = (token)         =>
  apiFetch("/sync", token, { method: "POST" });
export const getSyncLogs  = (token)         => apiFetch("/sync/logs", token);
export const getJournalTrades = (token)         => apiFetch("/journal-trades", token); // ← ADD
