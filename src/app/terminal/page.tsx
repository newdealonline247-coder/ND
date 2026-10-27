"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
  Search,
  User,
  Settings,
  BarChart2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Minus,
  Wallet,
  LogOut,
  Key,
  LogIn,
  ShieldCheck,
  Globe,
  Timer,
} from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";

interface Asset {
  id: string;
  name: string;
  type: string;
  symbol: string;
  payout: number;
}

interface ActiveTrade {
  id: string;
  assetId: string;
  assetName: string;
  type: "HIGHER" | "LOWER";
  entryPrice: number;
  amount: number;
  payoutRate: number;
  durationSec: number;
  totalDuration: number;
  timeRemaining: number;
  createdAt: number;
}

interface TradeResult {
  id: string;
  assetName: string;
  type: "HIGHER" | "LOWER";
  amount: number;
  payout: number;
  entryPrice: number;
  closePrice: number;
  closeTime: number;
  win: boolean;
  tie: boolean;
}

interface PropFirmUser {
  id: string;
  ref: string;
  traderName: string;
  email: string;
  platformLogin: string;
  planName: string;
  accountSize: number;
  status: string;
}

const ASSETS: Asset[] = [
  { id: "EURUSD", name: "EUR/USD", type: "Forex", symbol: "OANDA:EURUSD", payout: 92 },
  { id: "GBPUSD", name: "GBP/USD", type: "Forex", symbol: "OANDA:GBPUSD", payout: 88 },
  { id: "GBPAUD", name: "GBP/AUD", type: "Forex", symbol: "OANDA:GBPAUD", payout: 88 },
  { id: "USDJPY", name: "USD/JPY", type: "Forex", symbol: "OANDA:USDJPY", payout: 90 },
  { id: "USDCHF", name: "USD/CHF", type: "Forex", symbol: "OANDA:USDCHF", payout: 85 },
  { id: "AUDUSD", name: "AUD/USD", type: "Forex", symbol: "OANDA:AUDUSD", payout: 87 },
  { id: "USDCAD", name: "USD/CAD", type: "Forex", symbol: "OANDA:USDCAD", payout: 86 },
  { id: "NZDUSD", name: "NZD/USD", type: "Forex", symbol: "OANDA:NZDUSD", payout: 84 },
  { id: "EURGBP", name: "EUR/GBP", type: "Forex", symbol: "OANDA:EURGBP", payout: 89 },
  { id: "EURJPY", name: "EUR/JPY", type: "Forex", symbol: "OANDA:EURJPY", payout: 91 },
  { id: "GBPJPY", name: "GBP/JPY", type: "Forex", symbol: "OANDA:GBPJPY", payout: 90 },
  { id: "AUDJPY", name: "AUD/JPY", type: "Forex", symbol: "OANDA:AUDJPY", payout: 85 },
  { id: "EURAUD", name: "EUR/AUD", type: "Forex", symbol: "OANDA:EURAUD", payout: 88 },
  { id: "EURCAD", name: "EUR/CAD", type: "Forex", symbol: "OANDA:EURCAD", payout: 86 },
  { id: "GBPCHF", name: "GBP/CHF", type: "Forex", symbol: "OANDA:GBPCHF", payout: 84 },
  { id: "CADJPY", name: "CAD/JPY", type: "Forex", symbol: "OANDA:CADJPY", payout: 87 },
  { id: "CHFJPY", name: "CHF/JPY", type: "Forex", symbol: "OANDA:CHFJPY", payout: 86 },
  { id: "NZDJPY", name: "NZD/JPY", type: "Forex", symbol: "OANDA:NZDJPY", payout: 83 },
  { id: "EURNZD", name: "EUR/NZD", type: "Forex", symbol: "OANDA:EURNZD", payout: 85 },
  { id: "AUDCAD", name: "AUD/CAD", type: "Forex", symbol: "OANDA:AUDCAD", payout: 84 },
  { id: "BTCUSDT", name: "BTC/USDT", type: "Crypto", symbol: "BINANCE:BTCUSDT", payout: 95 },
  { id: "ETHUSDT", name: "ETH/USDT", type: "Crypto", symbol: "BINANCE:ETHUSDT", payout: 93 },
  { id: "XAUUSD", name: "GOLD", type: "Commodity", symbol: "OANDA:XAUUSD", payout: 90 },
];

const DEFAULT_PRICES: Record<string, number> = {
  EURUSD: 1.11572,
  GBPUSD: 1.33207,
  GBPAUD: 1.96750,
  USDJPY: 154.230,
  USDCHF: 0.86510,
  AUDUSD: 0.65820,
  USDCAD: 1.36740,
  NZDUSD: 0.59730,
  EURGBP: 0.85210,
  EURJPY: 164.850,
  GBPJPY: 195.420,
  AUDJPY: 99.640,
  EURAUD: 1.63410,
  EURCAD: 1.48920,
  GBPCHF: 1.11320,
  CADJPY: 109.800,
  CHFJPY: 172.150,
  NZDJPY: 91.350,
  EURNZD: 1.86810,
  AUDCAD: 0.90350,
  BTCUSDT: 91450.00,
  ETHUSDT: 3350.25,
  XAUUSD: 2685.50,
};

function LogoMark() {
  return (
    <span className="relative flex size-8 items-center justify-center rounded-xl bg-[#b6ff3b] shadow-[0_0_20px_rgba(182,255,59,0.35)] shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4L12 9L17 4" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 20L12 15L17 20" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function TerminalPage() {
  const [accountType, setAccountType] = useState<"DEMO" | "REAL">("DEMO");
  const [propUser, setPropUser] = useState<PropFirmUser | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [price, setPrice] = useState<number | null>(DEFAULT_PRICES[ASSETS[0].id]);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  const [amount, setAmount] = useState("10");
  const [isAmountOpen, setIsAmountOpen] = useState(false);

  const [expirySec, setExpirySec] = useState(60);
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  const [demoBalance, setDemoBalance] = useState<number>(10000);
  const [realBalance, setRealBalance] = useState<number>(0);

  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isTradesOpen, setIsTradesOpen] = useState(false);
  const [tradeTab, setTradeTab] = useState<"active" | "closed">("active");
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // NTP Server Time & 1M Candle Countdown State
  const timeOffsetRef = useRef<number>(0);
  const [serverTime, setServerTime] = useState<string>("");
  const [candleRemainingSec, setCandleRemainingSec] = useState<number>(60);

  const [timePopoverPos, setTimePopoverPos] = useState({ top: 200, right: 336 });
  const [amountPopoverPos, setAmountPopoverPos] = useState({ top: 300, right: 336 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeBtnRef = useRef<HTMLButtonElement>(null);
  const amountBoxRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const timePopoverRef = useRef<HTMLDivElement>(null);
  const amountPopoverRef = useRef<HTMLDivElement>(null);
  const accountModalRef = useRef<HTMLDivElement>(null);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // MILLISECOND-ACCURATE UTC SERVER TIME TICKER + CANDLE COUNTDOWN
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const tick = () => {
      const nowMs = Date.now() + timeOffsetRef.current;
      const d = new Date(nowMs);

      const h = d.getUTCHours().toString().padStart(2, "0");
      const m = d.getUTCMinutes().toString().padStart(2, "0");
      const s = d.getUTCSeconds().toString().padStart(2, "0");
      setServerTime(`${h}:${m}:${s}`);

      // Seconds remaining in current 1-minute candle
      const currentSec = d.getUTCSeconds();
      const remaining = 60 - currentSec;
      setCandleRemainingSec(remaining === 60 ? 0 : remaining);

      // Align next tick to exact millisecond boundary of the next second
      const delay = 1000 - (nowMs % 1000);
      timerId = setTimeout(tick, delay);
    };

    tick();

    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  const currentBalance = accountType === "DEMO" ? demoBalance : realBalance;

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ec_prop_user");
      const savedDemoBal = localStorage.getItem("ec_demo_balance");
      const savedRealBal = localStorage.getItem("ec_real_balance");
      const savedResults = localStorage.getItem("ec_trade_results");
      const savedAccountType = localStorage.getItem("ec_account_type");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as PropFirmUser;
        setPropUser(parsedUser);
        if (savedRealBal !== null) {
          const parsedReal = parseFloat(savedRealBal);
          setRealBalance(Number.isNaN(parsedReal) ? parsedUser.accountSize : parsedReal);
        } else {
          setRealBalance(parsedUser.accountSize);
        }
        if (savedAccountType === "REAL") setAccountType("REAL");
      }

      if (savedDemoBal !== null) {
        const parsedDemo = parseFloat(savedDemoBal);
        if (!Number.isNaN(parsedDemo)) setDemoBalance(parsedDemo);
      }

      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        if (Array.isArray(parsedResults)) setTradeResults(parsedResults);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("ec_demo_balance", demoBalance.toString());
      localStorage.setItem("ec_real_balance", realBalance.toString());
      localStorage.setItem("ec_trade_results", JSON.stringify(tradeResults));
      localStorage.setItem("ec_account_type", accountType);
      if (propUser) {
        localStorage.setItem("ec_prop_user", JSON.stringify(propUser));
      } else {
        localStorage.removeItem("ec_prop_user");
      }
    } catch (e) {
      console.error(e);
    }
  }, [demoBalance, realBalance, tradeResults, propUser, accountType, isLoaded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (isAssetOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsAssetOpen(false);
      }

      if (
        isExpiryOpen &&
        timePopoverRef.current &&
        !timePopoverRef.current.contains(target) &&
        timeBtnRef.current &&
        !timeBtnRef.current.contains(target)
      ) {
        setIsExpiryOpen(false);
      }

      if (
        isAmountOpen &&
        amountPopoverRef.current &&
        !amountPopoverRef.current.contains(target) &&
        amountBoxRef.current &&
        !amountBoxRef.current.contains(target)
      ) {
        setIsAmountOpen(false);
      }

      if (isAccountOpen && accountModalRef.current && !accountModalRef.current.contains(target)) {
        setIsAccountOpen(false);
      }

      if (isLoginModalOpen && loginModalRef.current && !loginModalRef.current.contains(target)) {
        setIsLoginModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAssetOpen, isExpiryOpen, isAmountOpen, isAccountOpen, isLoginModalOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Failed to authenticate");
        return;
      }

      const account = data.account as PropFirmUser;
      setPropUser(account);
      setRealBalance(account.accountSize);
      setAccountType("REAL");
      setIsLoginModalOpen(false);
      setLoginInput("");
      setPasswordInput("");
      setIsAccountOpen(true);
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    setPropUser(null);
    setAccountType("DEMO");
    setRealBalance(0);
    localStorage.removeItem("ec_prop_user");
    localStorage.removeItem("ec_real_balance");
    localStorage.setItem("ec_account_type", "DEMO");
    setIsAccountOpen(false);
  };

  // ---------------------------------------------------------------------------
  // LIVE PRICE ENGINE WITH NTP TIME SYNC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initialPrice = DEFAULT_PRICES[selectedAsset.id] ?? 1.0;
    setPrice(initialPrice);
    setPrevPrice(null);

    let ws: WebSocket | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let tickInterval: NodeJS.Timeout | null = null;

    const fetchLivePrice = async () => {
      const requestStart = Date.now();
      try {
        const res = await fetch(`/api/price?symbol=${selectedAsset.id}`);
        if (res.ok) {
          const data = await res.json();
          const requestEnd = Date.now();

          // Sync Client Offset to Server NTP Time
          if (data && typeof data.timestamp === "number") {
            const latency = (requestEnd - requestStart) / 2;
            timeOffsetRef.current = data.timestamp + latency - requestEnd;
          }

          if (data && typeof data.price === "number" && data.price > 0) {
            setPrice((prev) => {
              if (prev !== null && prev !== data.price) setPrevPrice(prev);
              return data.price;
            });
          }
        }
      } catch (err) {
        console.error("Fetch price error:", err);
      }
    };

    fetchLivePrice();

    if (selectedAsset.type === "Crypto") {
      const streamSymbol = selectedAsset.symbol.split(":")[1].toLowerCase();
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@aggTrade`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.p) {
            const newP = parseFloat(data.p);
            setPrice((prev) => {
              if (prev !== null && prev !== data.price) setPrevPrice(prev);
              return newP;
            });
          }
        } catch (err) {
          console.error("Crypto WS error", err);
        }
      };
    } else {
      pollInterval = setInterval(fetchLivePrice, 1000);
    }

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [selectedAsset]);

  useEffect(() => {
    if (activeTrades.length === 0) return;

    const interval = setInterval(() => {
      setActiveTrades((prevTrades) => {
        const currentPriceVal = priceRef.current;
        const remainingTrades: ActiveTrade[] = [];

        prevTrades.forEach((trade) => {
          const nextTime = trade.timeRemaining - 1;
          if (nextTime <= 0) {
            const curP = currentPriceVal ?? trade.entryPrice;
            const isWin =
              trade.type === "HIGHER" ? curP > trade.entryPrice : curP < trade.entryPrice;
            const isTie = curP === trade.entryPrice;
            const payoutAmount = isWin
              ? trade.amount * (1 + trade.payoutRate)
              : isTie
                ? trade.amount
                : 0;

            if (payoutAmount > 0) {
              if (accountType === "DEMO") setDemoBalance((b) => b + payoutAmount);
              else setRealBalance((b) => b + payoutAmount);
            }

            setTradeResults((r) => [
              {
                id: trade.id,
                assetName: trade.assetName,
                type: trade.type,
                amount: trade.amount,
                payout: payoutAmount,
                entryPrice: trade.entryPrice,
                closePrice: curP,
                closeTime: Date.now(),
                win: isWin,
                tie: isTie,
              },
              ...r,
            ]);
          } else {
            remainingTrades.push({ ...trade, timeRemaining: nextTime });
          }
        });

        return remainingTrades;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrades.length, accountType]);

  const updateExpiry = (unit: "h" | "m" | "s", delta: number) => {
    let h = Math.floor(expirySec / 3600);
    let m = Math.floor((expirySec % 3600) / 60);
    let s = expirySec % 60;

    if (unit === "h") h = Math.max(0, h + delta);
    if (unit === "m") m = Math.max(0, Math.min(59, m + delta));
    if (unit === "s") s = Math.max(0, Math.min(59, s + delta));

    setExpirySec(Math.max(5, h * 3600 + m * 60 + s));
  };

  const handlePlaceTrade = (type: "HIGHER" | "LOWER") => {
    const tradeAmount = parseFloat(amount);
    if (!price || Number.isNaN(tradeAmount) || tradeAmount <= 0 || tradeAmount > currentBalance) {
      return;
    }

    if (accountType === "DEMO") setDemoBalance((prev) => prev - tradeAmount);
    else setRealBalance((prev) => prev - tradeAmount);

    setActiveTrades((prev) => [
      {
        id: Math.random().toString(36).slice(2, 11),
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        type,
        entryPrice: price,
        amount: tradeAmount,
        payoutRate: selectedAsset.payout / 100,
        durationSec: expirySec,
        totalDuration: expirySec,
        timeRemaining: expirySec,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setIsTradesOpen(true);
    setTradeTab("active");
  };

  const formatPrice = (
    p: number | null,
    assetId: string = selectedAsset.id,
    assetType: string = selectedAsset.type,
  ) => {
    if (p === null) return "Loading...";
    const isJPY = assetId.includes("JPY");
    const isCrypto = assetType === "Crypto" || assetId === "XAUUSD";
    const digits = isJPY ? 3 : isCrypto ? 2 : 5;
    return p.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const formatTradePrice = (p: number, assetName: string) => {
    const isJPY = assetName.includes("JPY");
    const isCrypto =
      assetName.includes("BTC") ||
      assetName.includes("ETH") ||
      assetName.includes("GOLD") ||
      assetName.includes("XAU");
    const digits = isJPY ? 3 : isCrypto ? 2 : 5;
    return p.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const formatTimeStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const filteredAssets = useMemo(
    () =>
      ASSETS.filter(
        (a) =>
          a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
          a.type.toLowerCase().includes(assetSearch.toLowerCase()),
      ),
    [assetSearch],
  );

  const totalTradesCount = tradeResults.length;
  const wonTradesCount = tradeResults.filter((t) => t.win).length;
  const winRate =
    totalTradesCount > 0 ? ((wonTradesCount / totalTradesCount) * 100).toFixed(1) : "0.0";
  const totalProfit = tradeResults.reduce(
    (acc, t) => acc + (t.win ? t.payout - t.amount : -t.amount),
    0,
  );

  return (
    <div className="flex flex-col h-screen bg-[#05080a] text-[#ecf4ee] overflow-hidden font-sans select-none relative">
      <header className="h-[60px] border-b border-[#182228] bg-[#05080a] flex items-center justify-between px-5 z-50 gap-4">
        <div className="flex items-center gap-5 shrink-0">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="font-display text-base font-bold tracking-tight text-white hidden sm:inline">
              EXPIRY<span className="text-[#b6ff3b]">CAPITAL</span>
            </span>
          </a>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAssetOpen(!isAssetOpen)}
              className="flex items-center gap-3 px-3.5 py-1.5 bg-[#0a1114] hover:bg-[#0d161a] rounded-full border border-[#24323a] transition-all"
            >
              <span className="font-bold text-xs tracking-wide">
                {selectedAsset.name}{" "}
                <span className="text-[#b6ff3b] ml-1">+{selectedAsset.payout}%</span>
              </span>
              <ChevronDown
                size={14}
                className={`text-[#8e9ca5] transition-transform ${isAssetOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isAssetOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#0a1114] border border-[#24323a] rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
                <div className="p-3 border-b border-[#182228]">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[#5c6a72]" size={14} />
                    <input
                      autoFocus
                      placeholder="Search pairs..."
                      className="w-full bg-[#05080a] border border-[#24323a] rounded-xl py-1.5 pl-9 pr-3 text-xs text-[#ecf4ee] focus:outline-none focus:border-[#b6ff3b]"
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setIsAssetOpen(false);
                      }}
                      className="w-full px-4 py-2.5 hover:bg-[#0d161a] flex items-center justify-between text-xs transition-colors border-b border-[#182228]/50"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-[#ecf4ee]">{asset.name}</span>
                        <span className="text-[10px] text-[#5c6a72] uppercase tracking-wider">
                          {asset.type}
                        </span>
                      </div>
                      <span className="text-[#b6ff3b] font-bold">+{asset.payout}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-3 border-x border-[#182228] min-w-0">
          {activeTrades.length === 0 && (
            <div className="text-xs text-[#5c6a72] font-medium flex items-center gap-2">
              <span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />
              {accountType === "REAL"
                ? `PRO ACTIVE CHALLENGE — ${propUser?.planName ?? "FUNDED"}`
                : "PRACTICE DEMO TERMINAL LIVE"}
            </div>
          )}
          {activeTrades.slice(0, 3).map((trade) => {
            const currentP = priceRef.current || trade.entryPrice;
            const isWinning =
              trade.type === "HIGHER" ? currentP > trade.entryPrice : currentP < trade.entryPrice;
            return (
              <div
                key={trade.id}
                onClick={() => {
                  setIsTradesOpen(true);
                  setTradeTab("active");
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border cursor-pointer hover:opacity-80 transition-all shrink-0 ${
                  isWinning
                    ? "bg-[#2bd98a]/10 border-[#2bd98a]/50 text-[#2bd98a]"
                    : "bg-[#ff4d67]/10 border-[#ff4d67]/50 text-[#ff4d67]"
                }`}
              >
                {trade.type === "HIGHER" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="font-bold text-[11px]">{trade.assetName}</span>
                <span className="font-mono font-bold text-[11px] ml-1 text-white">
                  {formatTimeStr(trade.timeRemaining)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex bg-[#0a1114] rounded-full p-1 border border-[#24323a]">
            <button
              onClick={() => setAccountType("DEMO")}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                accountType === "DEMO"
                  ? "bg-[#182228] text-white shadow-sm"
                  : "text-[#5c6a72] hover:text-[#8e9ca5]"
              }`}
            >
              DEMO
            </button>
            <button
              onClick={() => {
                if (propUser) setAccountType("REAL");
                else setIsLoginModalOpen(true);
              }}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                accountType === "REAL"
                  ? "bg-[#b6ff3b] text-[#0a0f04] shadow-sm font-extrabold"
                  : "text-[#5c6a72] hover:text-[#8e9ca5]"
              }`}
            >
              PRO ACCOUNT
            </button>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#5c6a72] font-bold uppercase tracking-widest">
              {accountType === "DEMO"
                ? "Demo Balance"
                : `${propUser?.planName ?? "Pro"} Balance`}
            </div>
            <div
              suppressHydrationWarning
              className="text-[#b6ff3b] font-mono font-bold text-base leading-tight"
            >
              $
              {isLoaded
                ? currentBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "10,000.00"}
            </div>
          </div>

          {accountType === "DEMO" && (
            <button
              onClick={() => {
                setDemoBalance(10000);
                setTradeResults([]);
                setActiveTrades([]);
              }}
              className="p-2 hover:bg-[#0d161a] rounded-xl text-[#8e9ca5] hover:text-white border border-[#24323a] flex items-center gap-1.5 text-xs transition-colors"
              title="Reset Demo Balance to $10,000.00"
            >
              <RefreshCw size={13} />
              <span className="text-[10px] font-bold hidden md:inline">RESET DEMO</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="w-14 border-r border-[#182228] bg-[#05080a] flex flex-col items-center py-5 gap-6 z-50 relative">
          <button className="p-2.5 text-[#5c6a72] hover:text-[#b6ff3b] transition-colors">
            <BarChart2 size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsTradesOpen(!isTradesOpen)}
              className={`p-2.5 rounded-xl transition-all ${
                isTradesOpen
                  ? "bg-[#b6ff3b] text-[#0a0f04] shadow-[0_0_15px_rgba(182,255,59,0.3)]"
                  : "text-[#5c6a72] hover:text-white"
              }`}
            >
              <Clock size={20} />
            </button>
            {activeTrades.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#b6ff3b] text-[#0a0f04] font-bold text-[9px] flex items-center justify-center rounded-full">
                {activeTrades.length}
              </span>
            )}
          </div>
          <button
            onClick={() => (propUser ? setIsAccountOpen(true) : setIsLoginModalOpen(true))}
            className={`p-2.5 rounded-xl transition-all ${
              isAccountOpen || propUser
                ? "bg-[#182228] text-[#b6ff3b] border border-[#24323a]"
                : "text-[#5c6a72] hover:text-white"
            }`}
          >
            <User size={20} />
          </button>
          <div className="mt-auto flex flex-col gap-6">
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>

        <div
          className={`absolute left-14 top-0 bottom-0 w-80 bg-[#0a1114] border-r border-[#182228] z-40 shadow-2xl transition-transform duration-300 flex flex-col ${
            isTradesOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#182228]">
            <div className="flex gap-4">
              <button
                onClick={() => setTradeTab("active")}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
                  tradeTab === "active"
                    ? "text-[#b6ff3b] border-b-2 border-[#b6ff3b]"
                    : "text-[#5c6a72] hover:text-[#8e9ca5]"
                }`}
              >
                Active ({activeTrades.length})
              </button>
              <button
                onClick={() => setTradeTab("closed")}
                className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
                  tradeTab === "closed"
                    ? "text-white border-b-2 border-white"
                    : "text-[#5c6a72] hover:text-[#8e9ca5]"
                }`}
              >
                Closed
              </button>
            </div>
            <button onClick={() => setIsTradesOpen(false)} className="text-[#5c6a72] hover:text-white">
              <XCircle size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {tradeTab === "active" && activeTrades.length === 0 && (
              <div className="text-center text-[#5c6a72] text-xs font-medium py-10 italic">
                No active trades.
              </div>
            )}
            {tradeTab === "active" &&
              activeTrades.map((trade) => {
                const curP = priceRef.current || trade.entryPrice;
                const isWinning =
                  trade.type === "HIGHER" ? curP > trade.entryPrice : curP < trade.entryPrice;
                const pct = (trade.timeRemaining / trade.totalDuration) * 100;
                return (
                  <div
                    key={trade.id}
                    className="bg-[#05080a] border border-[#24323a] rounded-xl overflow-hidden"
                  >
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{trade.assetName}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              trade.type === "HIGHER"
                                ? "bg-[#2bd98a]/15 text-[#2bd98a] border border-[#2bd98a]/30"
                                : "bg-[#ff4d67]/15 text-[#ff4d67] border border-[#ff4d67]/30"
                            }`}
                          >
                            {trade.type === "HIGHER" ? (
                              <TrendingUp size={11} />
                            ) : (
                              <TrendingDown size={11} />
                            )}
                            {trade.type}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-white bg-[#182228] px-2 py-0.5 rounded">
                          {formatTimeStr(trade.timeRemaining)}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-[#5c6a72] uppercase font-bold">
                            Invested
                          </span>
                          <span className="font-mono font-bold text-xs text-[#8e9ca5]">
                            ${trade.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] text-[#5c6a72] uppercase font-bold">
                            Return
                          </span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isWinning ? "text-[#b6ff3b]" : "text-[#ff4d67]"
                            }`}
                          >
                            {isWinning
                              ? `+$${(trade.amount * (1 + trade.payoutRate)).toFixed(2)}`
                              : "$0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#5c6a72] bg-[#0a1114] p-1.5 rounded-lg border border-[#182228]">
                        <span>{formatPrice(trade.entryPrice, trade.assetId)}</span>
                        <span>➔</span>
                        <span className={isWinning ? "text-[#2bd98a]" : "text-[#ff4d67]"}>
                          {formatPrice(curP, trade.assetId)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-[#182228]">
                      <div
                        className={`h-full transition-all duration-1000 linear ${
                          isWinning ? "bg-[#2bd98a]" : "bg-[#ff4d67]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

            {tradeTab === "closed" && tradeResults.length === 0 && (
              <div className="text-center text-[#5c6a72] text-xs font-medium py-10 italic">
                No trade history.
              </div>
            )}
            {tradeTab === "closed" &&
              tradeResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-[#05080a] border border-[#24323a] rounded-xl overflow-hidden shadow-sm p-3.5 space-y-2.5 transition-all hover:border-[#344652]"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {res.win ? (
                        <CheckCircle2 size={15} className="text-[#2bd98a] shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-[#ff4d67] shrink-0" />
                      )}
                      <span className="font-bold text-xs text-[#ecf4ee]">{res.assetName}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          res.type === "HIGHER"
                            ? "bg-[#2bd98a]/15 text-[#2bd98a] border border-[#2bd98a]/30"
                            : "bg-[#ff4d67]/15 text-[#ff4d67] border border-[#ff4d67]/30"
                        }`}
                      >
                        {res.type === "HIGHER" ? (
                          <TrendingUp size={11} />
                        ) : (
                          <TrendingDown size={11} />
                        )}
                        {res.type}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#5c6a72]">
                      {new Date(res.closeTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#0a1114] border border-[#182228] font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c6a72] block font-sans">
                        Open
                      </span>
                      <span className="text-[#ecf4ee] font-semibold">
                        {formatTradePrice(res.entryPrice, res.assetName)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c6a72] block font-sans">
                        Close
                      </span>
                      <span
                        className={`font-semibold ${
                          res.win ? "text-[#2bd98a]" : "text-[#ff4d67]"
                        }`}
                      >
                        {formatTradePrice(res.closePrice, res.assetName)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono pt-0.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#5c6a72] uppercase font-bold font-sans">
                        Invested
                      </span>
                      <span className="font-bold text-[#8e9ca5]">${res.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] text-[#5c6a72] uppercase font-bold font-sans">
                        Result
                      </span>
                      <span className={`font-bold ${res.win ? "text-[#2bd98a]" : "text-[#ff4d67]"}`}>
                        {res.win ? `+$${res.payout.toFixed(2)}` : "$0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex-1 relative bg-[#05080a] z-10">
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>

        <div className="w-80 border-l border-[#182228] bg-[#05080a] flex flex-col z-20 relative shadow-[-10px_0_20px_rgba(0,0,0,0.2)]">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar">

            {/* SERVER TIME & 1M CANDLE COUNTDOWN PANEL */}
            <div className="bg-[#0a1114] border border-[#24323a] rounded-2xl p-3 shadow-sm shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Globe size={13} className="text-[#b6ff3b]" />
                  <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-wider">
                    UTC TIME
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-[#ecf4ee]">
                  {serverTime || "00:00:00"}
                </span>
              </div>

              <div className="h-[1px] bg-[#182228] w-full" />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Timer size={13} className="text-[#2bd98a]" />
                  <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-wider">
                    NEXT CANDLE
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#2bd98a] bg-[#2bd98a]/10 px-2 py-0.5 rounded border border-[#2bd98a]/20">
                  00:{candleRemainingSec.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* LIVE PRICE CARD */}
            <div className="bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />
                  Live Price
                </span>
              </div>
              <div
                className={`text-3xl font-mono font-bold tracking-tight ${
                  !price || !prevPrice || price === prevPrice
                    ? "text-[#b6ff3b]"
                    : price > prevPrice
                      ? "text-[#2bd98a]"
                      : "text-[#ff4d67]"
                }`}
              >
                {formatPrice(price)}
              </div>
            </div>

            <div className="space-y-2 shrink-0 relative">
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block pl-1">
                Time
              </label>
              <button
                ref={timeBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (timeBtnRef.current) {
                    const rect = timeBtnRef.current.getBoundingClientRect();
                    setTimePopoverPos({
                      top: rect.top,
                      right: window.innerWidth - rect.left + 12,
                    });
                  }
                  setIsExpiryOpen(!isExpiryOpen);
                  setIsAmountOpen(false);
                }}
                className={`w-full flex items-center justify-between bg-[#0a1114] border ${
                  isExpiryOpen
                    ? "border-[#b6ff3b]"
                    : "border-[#24323a] hover:border-[#b6ff3b]/40"
                } rounded-xl p-3 transition-colors`}
              >
                <span className="font-mono font-bold text-white text-lg tracking-widest">
                  {formatTimeStr(expirySec)}
                </span>
                <Clock size={16} className="text-[#5c6a72]" />
              </button>
            </div>

            <div className="space-y-2 shrink-0 relative">
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block pl-1">
                Amount
              </label>
              <div
                ref={amountBoxRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (amountBoxRef.current) {
                    const rect = amountBoxRef.current.getBoundingClientRect();
                    setAmountPopoverPos({
                      top: rect.top,
                      right: window.innerWidth - rect.left + 12,
                    });
                  }
                  setIsAmountOpen(!isAmountOpen);
                  setIsExpiryOpen(false);
                  amountInputRef.current?.focus();
                }}
                className={`w-full flex items-center justify-between bg-[#0a1114] border ${
                  isAmountOpen
                    ? "border-[#b6ff3b]"
                    : "border-[#24323a] hover:border-[#b6ff3b]/40"
                } rounded-xl p-3 transition-colors cursor-text`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[#5c6a72] font-bold">$</span>
                  <input
                    ref={amountInputRef}
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value);
                    }}
                    className="font-mono font-bold text-white text-lg bg-transparent border-none outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0a1114] rounded-2xl p-4 border border-[#24323a] shrink-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#5c6a72] font-bold uppercase tracking-wider">
                  Payout +{selectedAsset.payout}%
                </span>
                <span className="text-[#b6ff3b] font-bold">
                  +${((parseFloat(amount) || 0) * (selectedAsset.payout / 100)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5c6a72] font-bold uppercase tracking-wider">Total</span>
                <span className="text-white font-bold">
                  ${((parseFloat(amount) || 0) * (1 + selectedAsset.payout / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-[#182228] bg-[#05080a] shrink-0 space-y-3 z-30 relative">
            <button
              onClick={() => handlePlaceTrade("HIGHER")}
              className="w-full bg-[#2bd98a] hover:bg-[#23b874] text-[#05080a] font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(43,217,138,0.2)]"
            >
              <TrendingUp size={20} strokeWidth={2.5} />
              <span className="uppercase tracking-wider text-sm font-extrabold">Buy / Higher</span>
            </button>
            <button
              onClick={() => handlePlaceTrade("LOWER")}
              className="w-full bg-[#ff4d67] hover:bg-[#e63952] text-white font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,77,103,0.3)]"
            >
              <TrendingDown size={20} strokeWidth={2.5} />
              <span className="uppercase tracking-wider text-sm font-extrabold">Sell / Lower</span>
            </button>
          </div>
        </div>
      </main>

      {isAccountOpen && propUser && (
        <div className="fixed inset-0 z-[99999] bg-[#05080a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={accountModalRef}
            className="w-full max-w-[400px] bg-[#0a1114] border border-[#24323a] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#182228]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b6ff3b]/10 border border-[#b6ff3b]/30 flex items-center justify-center text-[#b6ff3b]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm truncate max-w-[200px]">
                    {propUser.traderName}
                  </h3>
                  <span className="text-[9px] text-[#b6ff3b] font-mono bg-[#b6ff3b]/10 border border-[#b6ff3b]/30 px-1.5 py-0.5 rounded uppercase">
                    LOGIN: {propUser.platformLogin}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAccountOpen(false)}
                className="text-[#5c6a72] hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 border-b border-[#182228] bg-[#070b0e]">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />
                    {propUser.planName}
                  </span>
                  <div
                    suppressHydrationWarning
                    className="text-3xl font-mono font-bold text-[#b6ff3b] tracking-tight"
                  >
                    $
                    {realBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-[10px] text-[#5c6a72] mt-1 font-mono">
                    Starting size: $
                    {propUser.accountSize.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-xl bg-[#b6ff3b] text-[#0a0f04] font-bold text-xs flex items-center justify-center gap-2">
                  <Wallet size={14} /> Deposit
                </button>
                <button className="py-2.5 rounded-xl bg-[#182228] text-white font-bold text-xs border border-[#24323a]">
                  Withdraw
                </button>
              </div>
            </div>

            <div className="p-5">
              <h4 className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest mb-3">
                Performance Stats
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#05080a] border border-[#182228] rounded-xl p-3">
                  <span className="block text-[9px] text-[#5c6a72] font-bold uppercase mb-1">
                    Total Trades
                  </span>
                  <span className="font-mono font-bold text-lg text-white">{totalTradesCount}</span>
                </div>
                <div className="bg-[#05080a] border border-[#182228] rounded-xl p-3">
                  <span className="block text-[9px] text-[#5c6a72] font-bold uppercase mb-1">
                    Win Rate
                  </span>
                  <span className="font-mono font-bold text-lg text-[#2bd98a]">{winRate}%</span>
                </div>
                <div className="bg-[#05080a] border border-[#182228] rounded-xl p-3 col-span-2">
                  <span className="block text-[9px] text-[#5c6a72] font-bold uppercase mb-1">
                    Net P&L
                  </span>
                  <span
                    className={`font-mono font-bold text-lg ${
                      totalProfit >= 0 ? "text-[#b6ff3b]" : "text-[#ff4d67]"
                    }`}
                  >
                    {totalProfit >= 0 ? "+" : "-"}${Math.abs(totalProfit).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#ff4d67]/10 text-[#ff4d67] transition-colors font-bold text-xs"
              >
                <LogOut size={16} /> LOG OUT ACCOUNT
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-[#05080a]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            ref={loginModalRef}
            className="w-full max-w-[380px] bg-[#0a1114] border border-[#24323a] rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-[#5c6a72] hover:text-white"
            >
              <XCircle size={20} />
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#b6ff3b]/10 border border-[#b6ff3b]/30 flex items-center justify-center text-[#b6ff3b] mb-3">
                <LogIn size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Trader Access</h3>
              <p className="text-xs text-[#5c6a72] mt-1">
                Use the platform login and password from checkout
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-[#ff4d67]/10 border border-[#ff4d67]/30 text-[#ff4d67] text-xs font-semibold text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block mb-1">
                  Platform Login ID or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-[#5c6a72]" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. cap_a1b2c3 or email@domain.com"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full bg-[#05080a] border border-[#24323a] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-[#b6ff3b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 text-[#5c6a72]" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#05080a] border border-[#24323a] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-[#b6ff3b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-[#b6ff3b] hover:bg-[#9de62e] text-[#0a0f04] font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(182,255,59,0.3)] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoggingIn ? "AUTHENTICATING..." : "ACCESS PRO TERMINAL"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isExpiryOpen && (
        <div
          ref={timePopoverRef}
          style={{ top: `${timePopoverPos.top}px`, right: `${timePopoverPos.right}px` }}
          className="fixed w-[290px] bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-center gap-1 mb-3.5 bg-[#05080a] rounded-xl border border-[#182228] p-3">
            {(
              [
                { u: "h" as const, v: Math.floor(expirySec / 3600) },
                { u: "m" as const, v: Math.floor((expirySec % 3600) / 60) },
                { u: "s" as const, v: expirySec % 60 },
              ] as const
            ).map((item, i) => (
              <React.Fragment key={item.u}>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => updateExpiry(item.u, 1)}
                    className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] flex items-center justify-center"
                  >
                    <Plus size={13} />
                  </button>
                  <span className="font-mono font-bold text-lg text-white w-10 text-center py-0.5">
                    {item.v.toString().padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => updateExpiry(item.u, -1)}
                    className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] flex items-center justify-center"
                  >
                    <Minus size={13} />
                  </button>
                </div>
                {i < 2 && <span className="font-mono text-xl text-[#5c6a72] mt-8">:</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[60, 120, 300, 600, 900, 1800].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setExpirySec(s);
                  setIsExpiryOpen(false);
                }}
                className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                  expirySec === s
                    ? "bg-[#b6ff3b] text-[#0a0f04] border-[#b6ff3b]"
                    : "bg-[#182228] text-[#8e9ca5] border-[#24323a] hover:border-[#b6ff3b]/50"
                }`}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>
        </div>
      )}

      {isAmountOpen && (
        <div
          ref={amountPopoverRef}
          style={{ top: `${amountPopoverPos.top}px`, right: `${amountPopoverPos.right}px` }}
          className="fixed w-[280px] bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[10, 50, 100, 250, 500, 1000, 2500, 5000].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setAmount(val.toString());
                  setIsAmountOpen(false);
                }}
                className="py-2.5 rounded-xl bg-[#182228] hover:bg-[#24323a] border border-[#24323a] text-[10px] font-bold text-white transition-all"
              >
                +{val}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (n === ".") {
                    if (!amount.includes(".")) setAmount((prev) => prev + ".");
                  } else {
                    setAmount((prev) => (prev === "0" ? n.toString() : prev + n));
                  }
                }}
                className="py-3 rounded-xl bg-[#05080a] border border-[#182228] text-[#ecf4ee] font-mono text-lg hover:bg-[#182228] transition-colors"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setAmount((prev) => prev.slice(0, -1) || "")}
              className="py-3 rounded-xl bg-[#182228] border border-[#24323a] text-[#ff4d67] flex items-center justify-center hover:bg-[#ff4d67]/10 transition-colors"
            >
              <Minus size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}