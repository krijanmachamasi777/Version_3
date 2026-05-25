// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Global auth state for MeroShare.
// Token is persisted in sessionStorage (clears on tab close).
// All API calls use Authorization: Bearer <token> via api/client.js
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { loginApi, getMeApi } from "../api/auth";
import {
  getProfile, getPortfolio, getIssues, getWacc, triggerSync, getSyncLogs,
  getJournalTrades,  // ← ADD
} from "../api/meroshare";

const AuthContext = createContext(null);

const TOKEN_KEY = "kitakat_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(null);   // { id, name, username, email, boid }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── login ─────────────────────────────────────────────────
  const login = useCallback(async ({ dpCode, username, password }) => {
    setLoading(true);
    setError(null);
    try {
      // Returns { token, user }  (backend authController.login)
      const data = await loginApi({ dpCode: String(dpCode), username, password });
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // ── hydrateUser: restore user object after page refresh ───
  const hydrateUser = useCallback(async () => {
    if (token && !user) {
      try {
        const me = await getMeApi(token);
        setUser(me);
      } catch {
        logout();   // token expired / invalid
      }
    }
  }, [token, user, logout]);

  // ── Data fetchers (pass token automatically) ──────────────
  const fetchProfile = useCallback(() => getProfile(token), [token]);
  const fetchPortfolio = useCallback(() => getPortfolio(token), [token]);
  const fetchIssues = useCallback((type) => getIssues(token, type), [token]);
  const fetchWacc = useCallback((script) => getWacc(token, script), [token]);
  const fetchSyncLogs = useCallback(() => getSyncLogs(token), [token]);
  const doSync = useCallback(() => triggerSync(token), [token]);
  // Add this line alongside the other useCallback fetchers:
const fetchJournalTrades = useCallback(() => getJournalTrades(token), [token]); // ← ADD

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        isLoggedIn: !!token,
        login,
        logout,
        hydrateUser,
        fetchProfile,
        fetchPortfolio,
        fetchIssues,
        fetchWacc,
        fetchSyncLogs,
        doSync,
        fetchJournalTrades,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);