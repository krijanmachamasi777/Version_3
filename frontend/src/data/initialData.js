// ── INITIAL TRADES DATA ───────────────────────────────────
export const INIT_TRADES = [
  { id:"t1", tsn:"TSN001", scrip:"AAPL",  qty:10, buyRate:150, sellRate:175, buyAmt:1500, soldAmt:1750, boughtDate:"2024-01-15", soldDate:"2024-02-20", rr:"1:2", remarks:"Good breakout trade" },
  { id:"t2", tsn:"TSN002", scrip:"TSLA",  qty:5,  buyRate:200, sellRate:180, buyAmt:1000, soldAmt:900,  boughtDate:"2024-02-01", soldDate:"2024-03-10", rr:"1:3", remarks:"Stop loss triggered" },
  { id:"t3", tsn:"TSN003", scrip:"NVDA",  qty:8,  buyRate:400, sellRate:480, buyAmt:3200, soldAmt:3840, boughtDate:"2024-01-20", soldDate:"2024-03-05", rr:"1:1", remarks:"AI sector rally" },
  { id:"t4", tsn:"TSN004", scrip:"META",  qty:12, buyRate:300, sellRate:270, buyAmt:3600, soldAmt:3240, boughtDate:"2024-02-10", soldDate:"2024-04-01", rr:"1:5", remarks:"Earnings miss" },
  { id:"t5", tsn:"TSN005", scrip:"AMZN",  qty:6,  buyRate:180, sellRate:210, buyAmt:1080, soldAmt:1260, boughtDate:"2024-03-01", soldDate:"2024-04-15", rr:"1:2", remarks:"Strong uptrend" },
  { id:"t6", tsn:"TSN006", scrip:"GOOGL", qty:4,  buyRate:140, sellRate:155, buyAmt:560,  soldAmt:620,  boughtDate:"2024-03-15", soldDate:"2024-05-01", rr:"1:2", remarks:"Held at support" },
  { id:"t7", tsn:"TSN007", scrip:"MSFT",  qty:7,  buyRate:380, sellRate:350, buyAmt:2660, soldAmt:2450, boughtDate:"2024-04-01", soldDate:"2024-05-10", rr:"1:4", remarks:"Failed breakout" },
];

// ── INITIAL INVESTMENTS DATA ──────────────────────────────
export const INIT_INV = [
  { id:"i1", scrip:"RELIANCE",   qty:20, buyRate:2500, buyAmt:50000, boughtDate:"2022-06-10", soldDate:null,         soldRate:null,  soldAmt:null,  remarks:"Core holding" },
  { id:"i2", scrip:"TCS",        qty:15, buyRate:3800, buyAmt:57000, boughtDate:"2021-11-15", soldDate:"2024-03-20", soldRate:4100,  soldAmt:61500, remarks:"Booked partial profits" },
  { id:"i3", scrip:"INFY",       qty:30, buyRate:1400, buyAmt:42000, boughtDate:"2023-01-08", soldDate:"2024-08-14", soldRate:1350,  soldAmt:40500, remarks:"Exited on weakness" },
  { id:"i4", scrip:"HDFC",       qty:25, buyRate:1600, buyAmt:40000, boughtDate:"2023-07-22", soldDate:null,         soldRate:null,  soldAmt:null,  remarks:"Long-term position" },
  { id:"i5", scrip:"BAJFINANCE", qty:10, buyRate:6200, buyAmt:62000, boughtDate:"2022-03-05", soldDate:null,         soldRate:null,  soldAmt:null,  remarks:"Accumulating on dips" },
  { id:"i6", scrip:"WIPRO",      qty:50, buyRate:420,  buyAmt:21000, boughtDate:"2023-09-18", soldDate:"2024-12-01", soldRate:510,   soldAmt:25500, remarks:"Sold on target hit" },
];

// ── INITIAL WATCHLIST DATA ────────────────────────────────
export const INIT_WATCH = [
  { id:"w1", scrip:"BAJFINANCE", sector:"Finance", breakout:6500, support:6200, resistance:7000, notes:"Breakout from consolidation pending" },
  { id:"w2", scrip:"WIPRO",      sector:"IT",      breakout:450,  support:420,  resistance:500,  notes:"Strong support at 50 EMA" },
  { id:"w3", scrip:"SBIN",       sector:"Banking", breakout:620,  support:580,  resistance:680,  notes:"Watch for PSU rally" },
  { id:"w4", scrip:"ADANIENT",   sector:"Finance", breakout:2400, support:2200, resistance:2600, notes:"Potential reversal setup" },
];