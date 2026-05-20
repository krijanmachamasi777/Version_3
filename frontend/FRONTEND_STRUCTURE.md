# Kitakat Frontend — Restructured

## Folder Structure

```
src/
├── api/                     ← NEW: centralized API layer
│   ├── client.js            ← Base fetch (Authorization: Bearer header)
│   ├── auth.js              ← login (POST /api/auth/login), getMe
│   └── meroshare.js         ← portfolio, issues, wacc, shares, sync
│
├── components/              ← Reusable UI components
│   ├── FG.jsx               ← Fear/Greed meter
│   ├── InvDetailModal.jsx   ← Investment detail dialog
│   ├── InvestFormModal.jsx  ← Investment add/edit form
│   ├── JournalTable.jsx     ← Shared trade table
│   ├── LoginScreen.jsx      ← Legacy (kept for compat)
│   ├── TradeDetailModal.jsx ← Trade detail dialog
│   ├── TradeFormModal.jsx   ← Trade add/edit form
│   └── WatchFormModal.jsx   ← Watchlist add/edit form
│
├── context/
│   └── AuthContext.jsx      ← REWRITTEN: correct auth state management
│
├── data/
│   └── initialData.js       ← Seed data for trades/investments/watchlist
│
├── pages/                   ← NEW: full-page views
│   └── LoginPage.jsx        ← MeroShare login (clientId + username + password)
│
├── styles/                  ← NEW: consolidated CSS (moved from tabs/ + components/)
│   ├── global.css           ← Design tokens, reset, layout, shared components
│   ├── login.css            ← Login page styles
│   ├── modals.css           ← All modal dialog styles
│   ├── dashboard.css        ← Dashboard tab styles
│   ├── investment.css       ← Investment tab styles
│   ├── journal.css          ← Journal tab styles
│   ├── losing.css           ← Losing tab styles
│   ├── meroshare.css        ← MS tabs shared styles
│   └── watchlist.css        ← Watchlist tab styles
│
├── tabs/                    ← Tab page components
│   ├── Dashboard.jsx
│   ├── Investment.jsx       ← Full investment portfolio with grouping
│   ├── Journal.jsx          ← Trade journal
│   ├── Losing.jsx
│   ├── MSIpos.jsx           ← FIXED: uses /api/issues endpoint
│   ├── MSPortfolio.jsx      ← FIXED: parses { summary, items } correctly
│   ├── MSWacc.jsx           ← FIXED: uses AuthContext
│   └── Watchlist.jsx
│
├── utils/
│   └── helpers.js           ← Formatting, date, storage utilities
│
├── App.jsx                  ← UPDATED: uses AuthContext, LoginPage
└── main.jsx                 ← UPDATED: wraps with AuthProvider
```

## Bugs Fixed

| File | Bug | Fix |
|------|-----|-----|
| `MeroShareContext.jsx` | Auth header was `x-meroshare-token` | Changed to `Authorization: Bearer <token>` |
| `MeroShareContext.jsx` | Login path was `/login` | Fixed to `/auth/login` |
| `MeroShareContext.jsx` | Response not unwrapped from `{ success, data }` | `apiFetch` now unwraps `data` field |
| `MSPortfolio.jsx` | Expected `{ holdings, totalCostPrice }` | Fixed to `{ summary, items }` (actual backend shape) |
| `MSIpos.jsx` | Fetched from `/ipos` | Fixed to `/issues` (correct backend route) |
| `MSIpos.jsx` | Expected `data?.issues` | Now receives `Array` directly after unwrapping |
| `MSWacc.jsx` | Expected `data?.wacc` | Now receives `Array` directly after unwrapping |
| All MS tabs | Used `useMeroShare` from old context | Updated to `useAuth` from `AuthContext` |

## API Endpoints (from backend routes/index.js)

```
POST /api/auth/login        → { token, user }   ← Login with clientId/username/password
GET  /api/auth/me           → user object
GET  /api/profile           → UserProfile
GET  /api/shares            → Share[]
GET  /api/portfolio         → { summary, items }
GET  /api/issues[?type=X]   → ApplicableIssue[]
GET  /api/wacc[?script=X]   → Wacc[]
POST /api/sync              → trigger sync
GET  /api/sync/logs         → SyncLog[]
```

## Auth Flow

1. User clicks a 🔒 MS tab → `LoginPage` shown
2. Submits clientId + username + password
3. `AuthContext.login()` → `POST /api/auth/login`
4. Backend verifies against MeroShare CDSC API
5. JWT token returned → stored in `sessionStorage`
6. MS tabs unlock; token sent as `Authorization: Bearer <token>`
