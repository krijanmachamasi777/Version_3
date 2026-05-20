// LoginScreen.jsx — MeroShare login with .env fallback note
import { useState } from "react";
import { useMeroShare } from "../context/MeroShareContext";
import "../styles/login.css";

export function LoginScreen() {
  const { login, loading, error } = useMeroShare();
  const [clientId, setClientId]   = useState("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async () => {
    if (!clientId || !username || !password) return;
    await login({ clientId: Number(clientId), username, password });
  };

  const handleEnvLogin = () => login({});  // triggers .env fallback on the server

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon">📊</div>
          <div className="login-title">TradeLog</div>
          <div className="login-sub">Connect your MeroShare account</div>
        </div>

        {error && <div className="login-error">⚠ {error}</div>}

        {/* Form */}
        <div className="login-fields">
          <div className="login-field">
            <label>DP / Client ID</label>
            <input
              type="number"
              placeholder="e.g. 156"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="MeroShare username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                className="login-eye"
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >{showPass ? "🙈" : "👁"}</button>
            </div>
          </div>
        </div>

        <button
          className="login-btn"
          onClick={handleSubmit}
          disabled={loading || !clientId || !username || !password}
        >
          {loading ? "Connecting…" : "Connect to MeroShare"}
        </button>

        <div className="login-divider"><span>or</span></div>

        <button
          className="login-btn login-btn--ghost"
          onClick={handleEnvLogin}
          disabled={loading}
        >
          {loading ? "Loading…" : "Use .env Credentials"}
        </button>

        <p className="login-note">
          Credentials are sent directly to cdsc.com.np and never stored on disk.
          The session token lives only in memory for this browser tab.
        </p>
      </div>
    </div>
  );
}
