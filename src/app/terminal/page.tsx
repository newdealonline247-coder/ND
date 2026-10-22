"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronDown,
  History,
  Settings,
  User,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  BarChart2,
  DollarSign,
  Info,
  Timer,
  Activity
} from 'lucide-react';

const TradingViewChart = dynamic(
  () => import('@/components/terminal/TradingViewChart'),
  { ssr: false }
);

interface ActiveTrade {
  id: string;
  type: 'up' | 'down';
  entryPrice: number;
  amount: number;
  expiryTime: number;
  timeLeft: number;
  assetSymbol: string;
  assetName: string;
  payoutRate: number;
}

interface SettledTrade {
  id: string;
  type: 'up' | 'down';
  entryPrice: number;
  exitPrice: number;
  amount: number;
  payout: number;
  won: boolean;
  isTie: boolean;
  asset: string;
  timestamp: string;
}

const ASSETS = [
  { symbol: 'FX:GBPUSD', name: 'GBP/USD', payout: 0.88, basePrice: 1.26520 },
  { symbol: 'FX:EURUSD', name: 'EUR/USD', payout: 0.92, basePrice: 1.33910 },
  { symbol: 'FX:USDTRY', name: 'USD/TRY', payout: 0.85, basePrice: 32.1450 },
  { symbol: 'FX:USDCAD', name: 'USD/CAD', payout: 0.87, basePrice: 1.35820 },
  { symbol: 'FX:AUDUSD', name: 'AUD/USD', payout: 0.86, basePrice: 0.65410 },
  { symbol: 'CRYPTO:BTCUSD', name: 'BTC/USDT', payout: 0.90, basePrice: 64250.00 },
  { symbol: 'CRYPTO:ETHUSD', name: 'ETH/USDT', payout: 0.89, basePrice: 3480.50 },
  { symbol: 'OANDA:XAUUSD', name: 'GOLD', payout: 0.95, basePrice: 2345.80 },
];

export default function TerminalPage() {
  const [balance, setBalance] = useState(10000);
  const [isDemo, setIsDemo] = useState(true);
  const [investment, setInvestment] = useState(10);
  const [duration, setDuration] = useState(30);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<SettledTrade[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'win' | 'loss' | 'info' } | null>(null);

  // Independent live price tracking for EVERY asset
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ASSETS.forEach(a => { initial[a.symbol] = a.basePrice; });
    return initial;
  });

  const [priceDirections, setPriceDirections] = useState<Record<string, 'up' | 'down'>>({});
  const [candleSecondsLeft, setCandleSecondsLeft] = useState(60);

  const pricesRef = useRef(prices);
  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  // Candle Countdown Engine
  useEffect(() => {
    const updateCandleCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      setCandleSecondsLeft(60 - (now % 60));
    };

    updateCandleCountdown();
    const interval = setInterval(updateCandleCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Micro-tick Unbiased Random Walk Simulation for ALL Assets Simultaneously
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const nextPrices = { ...prevPrices };
        const nextDirections: Record<string, 'up' | 'down'> = {};

        ASSETS.forEach(asset => {
          const current = prevPrices[asset.symbol] || asset.basePrice;
          const isCryptoOrGold = asset.symbol.includes('CRYPTO') || asset.symbol.includes('XAU');
          const scale = isCryptoOrGold ? 0.35 : 0.00008;
          // Unbiased 50/50 random step (-0.5 to +0.5)
          const change = (Math.random() - 0.5) * scale;
          const updated = parseFloat((current + change).toFixed(isCryptoOrGold ? 2 : 5));

          nextPrices[asset.symbol] = updated;
          nextDirections[asset.symbol] = updated >= current ? 'up' : 'down';
        });

        setPriceDirections(nextDirections);
        return nextPrices;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Execute Order
  const handleTrade = (type: 'up' | 'down') => {
    if (investment <= 0 || isNaN(investment)) {
      alert("Please enter a valid investment amount.");
      return;
    }
    if (balance < investment) {
      alert("Insufficient balance! Click RESET to restore your demo balance.");
      return;
    }

    const tradeEntryPrice = pricesRef.current[selectedAsset.symbol] || selectedAsset.basePrice;

    setBalance(prev => parseFloat((prev - investment).toFixed(2)));

    const now = Date.now();
    const newTrade: ActiveTrade = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      entryPrice: tradeEntryPrice,
      amount: investment,
      expiryTime: now + duration * 1000,
      timeLeft: duration,
      assetSymbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      payoutRate: selectedAsset.payout,
    };

    setNotification({
      message: `ORDER PLACED: ${type.toUpperCase()} @ ${tradeEntryPrice} (${selectedAsset.name})`,
      type: 'info'
    });
    setTimeout(() => setNotification(null), 2000);

    setActiveTrades(prev => [...prev, newTrade]);
  };

  // Accurate Settlement Engine
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      setActiveTrades(prevTrades => {
        const remaining: ActiveTrade[] = [];

        prevTrades.forEach(trade => {
          const secondsLeft = Math.max(0, Math.ceil((trade.expiryTime - now) / 1000));

          if (secondsLeft <= 0) {
            // Get live exit price for THIS specific trade's asset
            const exitPrice = pricesRef.current[trade.assetSymbol] || trade.entryPrice;
            const isTie = exitPrice === trade.entryPrice;
            const won = !isTie && (
              trade.type === 'up'
                ? exitPrice > trade.entryPrice
                : exitPrice < trade.entryPrice
            );

            const payout = won ? trade.amount + (trade.amount * trade.payoutRate) : isTie ? trade.amount : 0;

            if (won) {
              setBalance(b => parseFloat((b + payout).toFixed(2)));
              setNotification({
                message: `WIN +$${payout.toFixed(2)} | Entry: ${trade.entryPrice} ? Exit: ${exitPrice}`,
                type: 'win'
              });
            } else if (isTie) {
              setBalance(b => parseFloat((b + trade.amount).toFixed(2)));
              setNotification({
                message: `PUSH (REFUND) $${trade.amount} | Price Unchanged`,
                type: 'info'
              });
            } else {
              setNotification({
                message: `LOSS -$${trade.amount.toFixed(2)} | Entry: ${trade.entryPrice} ? Exit: ${exitPrice}`,
                type: 'loss'
              });
            }

            setTradeHistory(h => [{
              id: trade.id,
              type: trade.type,
              entryPrice: trade.entryPrice,
              exitPrice,
              amount: trade.amount,
              payout,
              won,
              isTie,
              asset: trade.assetName,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }, ...h]);

            setTimeout(() => setNotification(null), 4500);
          } else {
            remaining.push({ ...trade, timeLeft: secondsLeft });
          }
        });

        return remaining;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  const resetBalance = () => {
    setBalance(10000);
    setNotification({ message: 'Balance reset to $10,000.00', type: 'win' });
    setTimeout(() => setNotification(null), 3000);
  };

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const currentDirection = priceDirections[selectedAsset.symbol] || 'up';

  return (
    <div className="flex flex-col h-screen bg-[#080c11] text-gray-300 font-sans overflow-hidden select-none">

      {/* WIN/LOSS/INFO TOAST */}
      {notification && (
        <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 border text-xs sm:text-sm font-bold animate-bounce transition-all ${
          notification.type === 'win'
            ? 'bg-[#0b1017] border-[#b6ff3b] text-[#b6ff3b]'
            : notification.type === 'loss'
            ? 'bg-[#0b1017] border-red-500 text-red-500'
            : 'bg-[#0b1017] border-blue-400 text-blue-400'
        }`}>
          {notification.type === 'win' && <CheckCircle2 size={18} />}
          {notification.type === 'loss' && <XCircle size={18} />}
          {notification.type === 'info' && <Info size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 bg-[#0b1017] z-30 relative">
        <div className="flex items-center space-x-4">
          <div className="bg-[#b6ff3b] text-black w-8 h-8 rounded flex items-center justify-center font-black text-xl shadow-lg shadow-[#b6ff3b]/20">
            x
          </div>
          <span className="font-extrabold tracking-wider text-white text-sm hidden sm:inline">EXPIRYCAPITAL</span>

          {/* ASSET SELECTOR */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
              className="flex items-center space-x-2 bg-[#161c24] hover:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-800 transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-400">{selectedAsset.symbol.split(':')[1] || selectedAsset.symbol}</span>
              <span className="text-sm font-bold text-white">{selectedAsset.name}</span>
              <span className="text-xs text-[#b6ff3b] font-bold bg-[#b6ff3b]/10 px-1.5 py-0.5 rounded">
                +{(selectedAsset.payout * 100).toFixed(0)}%
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${assetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {assetDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0b1017] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  Select Assets
                </div>
                {ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setAssetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-800/60 transition-colors ${
                      selectedAsset.symbol === asset.symbol ? 'bg-gray-800/80 text-white font-bold' : 'text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{asset.name}</div>
                      <div className="text-[10px] text-gray-500">{asset.symbol}</div>
                    </div>
                    <span className="text-xs font-bold text-[#b6ff3b]">
                      +{(asset.payout * 100).toFixed(0)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BALANCE CONTROL */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-[#161c24] rounded-lg p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => setIsDemo(true)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isDemo ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              DEMO
            </button>
            <button
              type="button"
              onClick={() => setIsDemo(false)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isDemo ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
            >
              REAL
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{isDemo ? 'Demo Balance' : 'Real Balance'}</div>
              <div className="text-lg font-black text-[#b6ff3b] leading-tight">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <button
              type="button"
              onClick={resetBalance}
              title="Reset Demo Balance"
              className="bg-[#b6ff3b] hover:bg-[#a2e634] active:scale-95 text-black px-3 py-2 rounded-lg font-bold text-xs flex items-center transition-all shadow-md shadow-[#b6ff3b]/10 cursor-pointer"
            >
              <RefreshCw size={14} className="mr-1.5" /> RESET
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR */}
        <div className="w-14 border-r border-gray-800 flex flex-col items-center py-4 space-y-6 shrink-0 bg-[#0b1017] z-20 relative">
          <button type="button" className="w-10 h-10 flex items-center justify-center text-[#b6ff3b] bg-[#161c24] rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
            <BarChart2 size={20} />
          </button>

          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            title="Trade History"
            className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-colors relative ${
              historyOpen ? 'bg-[#b6ff3b] text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <History size={20} />
            {tradeHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b6ff3b] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black">
                {tradeHistory.length}
              </span>
            )}
          </button>

          <button type="button" className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
            <Wallet size={20} />
          </button>
          <button type="button" className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
            <User size={20} />
          </button>

          <div className="mt-auto">
            <button type="button" className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* TRADE HISTORY DRAWER */}
        {historyOpen && (
          <div className="absolute left-14 top-0 bottom-0 w-80 bg-[#0b1017] border-r border-gray-800 z-40 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <History size={16} className="text-[#b6ff3b]" />
                <span>Trade History</span>
              </h3>
              <button type="button" onClick={() => setHistoryOpen(false)} className="text-gray-500 hover:text-white text-xs font-bold">CLOSE</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {tradeHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No completed trades yet</div>
              ) : (
                tradeHistory.map((t) => (
                  <div key={t.id} className="bg-[#161c24] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        {t.type === 'up' ? (
                          <ArrowUpRight size={14} className="text-[#10b981]" />
                        ) : (
                          <ArrowDownRight size={14} className="text-[#ef4444]" />
                        )}
                        <span className="text-xs font-bold text-white">{t.asset}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        Entry: {t.entryPrice} ? Exit: {t.exitPrice}
                      </div>
                      <div className="text-[9px] text-gray-600">{t.timestamp}</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-black ${t.won ? 'text-[#b6ff3b]' : t.isTie ? 'text-gray-300' : 'text-red-400'}`}>
                        {t.won ? `+$${t.payout.toFixed(2)}` : t.isTie ? `$${t.amount}` : `-$${t.amount.toFixed(2)}`}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-gray-500">
                        {t.won ? 'WIN' : t.isTie ? 'PUSH' : 'LOSS'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CHART AREA WITH BADGES OVERLAY */}
        <div className="relative flex-1 bg-[#080c11] z-0">
          <TradingViewChart key={selectedAsset.symbol} symbol={selectedAsset.symbol} />

          {/* CANDLE COUNTDOWN OVERLAY BADGE */}
          <div className="absolute top-4 left-4 z-20 bg-[#0b1017]/90 border border-gray-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center space-x-2.5 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b6ff3b] animate-ping"></span>
            <div className="flex items-center space-x-1.5 text-xs">
              <Timer size={14} className="text-gray-400" />
              <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">CANDLE CLOSE:</span>
              <span className="text-[#b6ff3b] font-mono font-black text-xs">
                00:{candleSecondsLeft.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* DYNAMIC LIVE COLOR-CHANGING TRADE BADGES OVERLAY */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {activeTrades.map((trade, idx) => {
              const topOffset = 25 + (idx * 75);
              const liveTradeAssetPrice = prices[trade.assetSymbol] || trade.entryPrice;
              const isTie = liveTradeAssetPrice === trade.entryPrice;
              const isWinningCurrently = !isTie && (
                trade.type === 'up'
                  ? liveTradeAssetPrice > trade.entryPrice
                  : liveTradeAssetPrice < trade.entryPrice
              );

              return (
                <div
                  key={trade.id}
                  className={`absolute right-6 px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center space-x-4 pointer-events-auto backdrop-blur-md transition-all duration-300 ${
                    isTie
                      ? 'bg-gray-900/80 border-gray-500 shadow-gray-950/50'
                      : isWinningCurrently
                      ? 'bg-[#042f22]/90 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'bg-[#450a0a]/90 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                  }`}
                  style={{ top: `${topOffset}px` }}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-white transition-colors duration-300 ${
                      isTie
                        ? 'bg-gray-600'
                        : isWinningCurrently
                        ? 'bg-[#10b981]'
                        : 'bg-[#ef4444]'
                    }`}>
                      {trade.type === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>

                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">{trade.assetName}</div>
                      <div className="text-xs font-mono font-bold text-white flex items-center space-x-1">
                        <span>Entry:</span>
                        <span className={isWinningCurrently ? 'text-[#b6ff3b]' : 'text-red-300'}>{trade.entryPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right border-l border-white/20 pl-4">
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">EXPIRY</div>
                    <div className="text-base font-mono font-black text-white">
                      00:{trade.timeLeft.toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTROL PANEL */}
        <div className="relative z-30 w-[300px] border-l border-gray-800 bg-[#0b1017] flex flex-col p-4 shrink-0">
          <div className="space-y-4">

            {/* LIVE ENGINE PRICE TICKER DISPLAY */}
            <div className="bg-[#161c24] border border-gray-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <Activity size={14} className="text-[#b6ff3b] animate-pulse" />
                <span>Live Price</span>
              </div>
              <div className={`text-xl font-mono font-black transition-colors ${
                currentDirection === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}>
                {currentPrice}
              </div>
            </div>

            {/* EXPIRATION TIME */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiration Time</label>
                <Clock size={12} className="text-gray-500" />
              </div>
              <div className="bg-[#161c24] rounded-xl p-3 border border-gray-800 text-center">
                <div className="text-3xl font-mono text-white font-black tracking-wider">
                  00:00:{duration.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[30, 60, 120, 300].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDuration(s)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      duration === s
                        ? 'bg-[#b6ff3b] text-black shadow-md shadow-[#b6ff3b]/20 font-black'
                        : 'bg-[#161c24] text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {s >= 60 ? `${s/60}m` : `${s}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* INVESTMENT AMOUNT */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Investment Amount</label>
                <DollarSign size={12} className="text-gray-500" />
              </div>
              <div className="bg-[#161c24] rounded-xl p-3 border border-gray-800 flex items-center justify-between">
                <span className="text-gray-500 font-bold text-lg">$</span>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={investment}
                  onChange={(e) => setInvestment(Math.max(1, Number(e.target.value)))}
                  className="bg-transparent text-2xl font-black text-white w-full outline-none text-right font-mono"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {[5, 10, 25, 50, 100].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestment(amt)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      investment === amt
                        ? 'bg-gray-700 text-white border border-gray-500'
                        : 'bg-[#161c24] text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* PAYOUT CARD */}
            <div className="bg-[#161c24]/80 rounded-xl p-3 border border-[#b6ff3b]/20 text-center">
              <div className="text-[10px] font-extrabold text-[#b6ff3b] uppercase tracking-widest mb-0.5">
                Profit +{(selectedAsset.payout * 100).toFixed(0)}%
              </div>
              <div className="text-2xl font-black text-[#b6ff3b] tracking-tight">
                +${(investment * selectedAsset.payout).toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold">
                Total Return: ${(investment * (1 + selectedAsset.payout)).toFixed(2)}
              </div>
            </div>

            {/* TRADE BUTTONS */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleTrade('up')}
                className="w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.95] text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer border border-emerald-400/20"
              >
                <TrendingUp size={22} />
                <span>BUY / HIGHER</span>
              </button>

              <button
                type="button"
                onClick={() => handleTrade('down')}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.95] text-white py-3.5 rounded-xl font-black text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-950/40 cursor-pointer border border-red-400/20"
              >
                <TrendingDown size={22} />
                <span>SELL / LOWER</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#b6ff3b] rounded-full animate-ping"></span>
            <span>ExpiryCapital Engine Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
