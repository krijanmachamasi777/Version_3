// src/App.jsx — Root component using AuthContext
import { useState, useMemo, useEffect } from "react";
import "./styles/global.css";
import { INIT_TRADES, INIT_INV, INIT_WATCH } from "./data/initialData";
import { uid, nextTSN, findRecentTSN, loadFromStorage, saveToStorage } from "./utils/helpers";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard }   from "./tabs/Dashboard";
import { Journal }     from "./tabs/Journal";
import { Investment }  from "./tabs/Investment";
import { Watchlist }   from "./tabs/Watchlist";
import { Losing }      from "./tabs/Losing";
import { MSPortfolio } from "./tabs/MSPortfolio";
import { MSIpos }      from "./tabs/MSIpos";
import { MSWacc }      from "./tabs/MSWacc";
import { TradeDetailModal }  from "./components/TradeDetailModal";
import { TradeFormModal }    from "./components/TradeFormModal";
import { InvDetailModal }    from "./components/InvDetailModal";
import { InvestFormModal }   from "./components/InvestFormModal";
import { WatchFormModal }    from "./components/WatchFormModal";

const TABS = [
  { id: "dashboard",    label: "🏠 Dashboard" },
  { id: "journal",      label: "📝 Journal" },
  { id: "investment",   label: "💼 Investment" },
  { id: "watchlist",    label: "👁 Watchlist" },
  { id: "losing",       label: "📉 Losing" },
  { id: "ms-portfolio", label: "🏦 MS Portfolio", ms: true },
  { id: "ms-ipos",      label: "📋 Open IPOs",    ms: true },
  { id: "ms-wacc",      label: "⚖ WACC",          ms: true },
];

export default function App() {
  const { isLoggedIn, user, logout, hydrateUser } = useAuth();
  useEffect(() => { hydrateUser(); }, [hydrateUser]);

  const [tab,         setTab]         = useState("dashboard");
  const [trades,      setTrades]      = useState(() => loadFromStorage("trades",      INIT_TRADES));
  const [investments, setInvestments] = useState(() => loadFromStorage("investments", INIT_INV));
  const [watchlist,   setWatchlist]   = useState(() => loadFromStorage("watchlist",   INIT_WATCH));
  const [tradeDetail, setTradeDetail] = useState(null);
  const [tradeForm,   setTradeForm]   = useState(null);
  const [invDetail,   setInvDetail]   = useState(null);
  const [invForm,     setInvForm]     = useState(null);
  const [watchForm,   setWatchForm]   = useState(null);

  useMemo(() => { saveToStorage("trades",      trades);      }, [trades]);
  useMemo(() => { saveToStorage("investments", investments); }, [investments]);
  useMemo(() => { saveToStorage("watchlist",   watchlist);   }, [watchlist]);


  const addTrade = d => setTrades(p => { const reuseTsn = findRecentTSN(p, d.scrip, d.boughtDate, 15); return [...p, { ...d, id: uid(), tsn: reuseTsn || nextTSN(p) }]; });
  const updTrade = (id, d) => setTrades(p => p.map(t => t.id === id ? { ...t, ...d, tsn: t.tsn } : t));
  const delTrade = id => setTrades(p => p.filter(t => t.id !== id));
  const addInv   = d => setInvestments(p => [...p, { ...d, id: uid() }]);
  const updInv   = (id, d) => setInvestments(p => p.map(i => i.id === id ? { ...i, ...d } : i));
  const delInv   = id => setInvestments(p => p.filter(i => i.id !== id));
  const addWatch = d => setWatchlist(p => [...p, { ...d, id: uid() }]);
  const updWatch = (id, d) => setWatchlist(p => p.map(w => w.id === id ? { ...w, ...d } : w));
  const delWatch = id => setWatchlist(p => p.filter(w => w.id !== id));

  const handleTabClick = id => { setTab(id); };
  const handleFAB = () => {
    if (tab === "journal" || tab === "losing") setTradeForm({ mode: "add", data: {} });
    else if (tab === "investment") setInvForm({ mode: "add", data: {} });
    else if (tab === "watchlist")  setWatchForm({ mode: "add", data: {} });
  };

  const isMsTab = tab.startsWith("ms-");
  const showFAB = !isMsTab && tab !== "dashboard" && tab !== "losing";

  if (!isLoggedIn) return <LoginPage />;

  return (
    <>
      <header className="topbar">
        <div className="topbar__logo">
          <div className="topbar__icon">📊</div>
          <div>
            <div className="topbar__title">Kitakat</div>
            <div className="topbar__subtitle">Investment Journal &amp; MeroShare Tracker</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {isLoggedIn && (
            <button className="ms-profile-pill" onClick={logout} title="Click to logout">
              <span className="ms-profile-dot" />
              {user?.name || user?.username || "MeroShare"}
              <span style={{ fontSize:10, opacity:0.7, marginLeft:2 }}>✕</span>
            </button>
          )}
          <div className="topbar__date">
            {new Date().toLocaleDateString("en-US", { weekday:"short", year:"numeric", month:"short", day:"numeric" })}
          </div>
        </div>
      </header>

      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id}
            className={`tab-btn${tab === t.id ? " tab-btn--active" : ""}`}
            onClick={() => handleTabClick(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="page">
        {tab === "dashboard"    && <Dashboard   trades={trades} investments={investments} />}
        {tab === "journal"      && <Journal     trades={trades} onScripClick={setTradeDetail} />}
        {tab === "investment"   && <Investment  investments={investments} onScripClick={setInvDetail} />}
        {tab === "watchlist"    && <Watchlist   watchlist={watchlist} onEdit={w => setWatchForm({ mode:"edit", data:w })} onDelete={delWatch} />}
        {tab === "losing"       && <Losing      trades={trades} onScripClick={setTradeDetail} />}
        {tab === "ms-portfolio" && <MSPortfolio />}
        {tab === "ms-ipos"      && <MSIpos />}
        {tab === "ms-wacc"      && <MSWacc />}
      </main>

      {showFAB && (
        <button className="fab" onClick={handleFAB}>
          <span style={{ fontSize:18, lineHeight:1 }}>+</span>
          {tab === "investment" ? "Add Investment" : tab === "watchlist" ? "Add to Watchlist" : "Log Trade"}
        </button>
      )}

      {tradeDetail && <TradeDetailModal trade={tradeDetail} onEdit={t => { setTradeDetail(null); setTradeForm({ mode:"edit", data:t }); }} onDelete={id => { delTrade(id); setTradeDetail(null); }} onClose={() => setTradeDetail(null)} />}
      {tradeForm && <TradeFormModal mode={tradeForm.mode} init={tradeForm.data} onSave={d => { tradeForm.mode === "add" ? addTrade(d) : updTrade(tradeForm.data.id, d); setTradeForm(null); }} onClose={() => setTradeForm(null)} />}
      {invDetail && <InvDetailModal inv={invDetail} onEdit={i => { setInvDetail(null); setInvForm({ mode:"edit", data:i }); }} onDelete={id => { delInv(id); setInvDetail(null); }} onClose={() => setInvDetail(null)} />}
      {invForm && <InvestFormModal mode={invForm.mode} init={invForm.data} onSave={d => { invForm.mode === "add" ? addInv(d) : updInv(invForm.data.id, d); setInvForm(null); }} onClose={() => setInvForm(null)} />}
      {watchForm && <WatchFormModal mode={watchForm.mode} init={watchForm.data} onSave={d => { watchForm.mode === "add" ? addWatch(d) : updWatch(watchForm.data.id, d); setWatchForm(null); }} onClose={() => setWatchForm(null)} />}
    </>
  );
}