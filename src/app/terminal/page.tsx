'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Activity, TrendingUp, TrendingDown, Clock, History, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

const TradingViewChart = dynamic(
  () => import('@/components/terminal/TradingViewChart'),
  { ssr: false }
);

interface ActiveTrade {
  id: string;
  assetSymbol: string;
  direction: 'HIGHER' | 'LOWER';
  amount: number;
  entryPrice: number;
  duration: number;
  secondsRemaining: number;
  payout: number;
  timestamp: string;
}

interface SettledTrade {
  id: string;
  assetSymbol: string;
  direction: 'HIGHER' | 'LOWER';
  amount: number;
  entryPrice: number;
  exitPrice: number;
  payoutAmount: number;
  isWin: boolean;
  isTie: boolean;
  asset: string;
  timestamp: string;
}

const ASSETS = [
  { symbol: 'BINANCE:EURUSDT', name: 'EUR/USD', payout: 0.92, basePrice: 1.08500 },
  { symbol: 'BINANCE:GBPUSDT', name: 'GBP/USD', payout: 0.88, basePrice: 1.26520 },
  { symbol: 'BINANCE:AUDUSDT', name: 'AUD/USD', payout: 0.86, basePrice: 0.65410 },
  { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USDT', payout: 0.90, basePrice: 96400.00 },
  { symbol: 'BINANCE:ETHUSDT', name: 'ETH/USDT', payout: 0.89, basePrice: 2750.00 },
  { symbol: 'BINANCE:PAXGUSDT', name: 'GOLD', payout: 0.95, basePrice: 2650.00 },
  { symbol: 'OANDA:USDCAD', name: 'USD/CAD', payout: 0.87, basePrice: 1.35820 },
  { symbol: 'OANDA:USDTRY', name: 'USD/TRY', payout: 0.85, basePrice: 32.1450 },
];

export default function TerminalPage() {
  const [balance, setBalance] = useState(10000);
  const [isDemo, setIsDemo] = useState(true);
  const [investment, setInvestment] = useState(10);
  const [duration, setDuration] = useState(30);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]); // EUR/USD default
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<SettledTrade[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'win' | 'loss' | 'info' } | null>(null);

  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ASSETS.forEach(a => { initial[a.symbol] = a.basePrice; });
    return initial;
  });

  const [priceDirections, setPriceDirections] = useState<Record<string, 'up' | 'down'>>({});
  const [candleSecondsLeft, setCandleSecondsLeft] = useState(60);

  const pricesRef = useRef(prices);
  useEffect(() => { pricesRef.current = prices; }, [prices]);

  // 1. Direct Real-Time Exchange WebSockets for 100% Exact Matching
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/eurusdt@ticker/gbpusdt@ticker/audusdt@ticker/btcusdt@ticker/ethusdt@ticker/paxgusdt@ticker');
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.s && data.c) {
            const price = parseFloat(data.c);
            if (!isNaN(price)) {
              const map: Record<string, string> = {
                'EURUSDT': 'BINANCE:EURUSDT',
                'GBPUSDT': 'BINANCE:GBPUSDT',
                'AUDUSDT': 'BINANCE:AUDUSDT',
                'BTCUSDT': 'BINANCE:BTCUSDT',
                'ETHUSDT': 'BINANCE:ETHUSDT',
                'PAXGUSDT': 'BINANCE:PAXGUSDT'
              };
              const key = map[data.s];
              if (key) {
                setPrices(prev => {
                  const old = prev[key] || price;
                  setPriceDirections(d => ({ ...d, [key]: price >= old ? 'up' : 'down' }));
                  return { ...prev, [key]: price };
                });
              }
            }
          }
        } catch (err) {}
      };
    } catch (err) {}
    return () => { ws?.close(); };
  }, []);

  // 2. Ticks for remaining assets (USD/CAD, USD/TRY)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        ASSETS.forEach(asset => {
          if (asset.symbol.includes('BINANCE')) return;
          const current = prev[asset.symbol] || asset.basePrice;
          const change = (Math.random() - 0.5) * 0.00006;
          const updated = parseFloat((current + change).toFixed(5));
          next[asset.symbol] = updated;
          setPriceDirections(d => ({ ...d, [asset.symbol]: updated >= current ? 'up' : 'down' }));
        });
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Candle Countdown Timer
  useEffect(() => {
    const updateCountdown = () => setCandleSecondsLeft(60 - (Math.floor(Date.now() / 1000) % 60));
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trade Settlement Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prevTrades => {
        const remaining: ActiveTrade[] = [];

        prevTrades.forEach(trade => {
          const nextSecs = trade.secondsRemaining - 1;
          if (nextSecs <= 0) {
            const exitPrice = pricesRef.current[trade.assetSymbol] || trade.entryPrice;
            let isWin = false, isTie = false;

            if (trade.direction === 'HIGHER') {
              if (exitPrice > trade.entryPrice) isWin = true;
              else if (exitPrice === trade.entryPrice) isTie = true;
            } else {
              if (exitPrice < trade.entryPrice) isWin = true;
              else if (exitPrice === trade.entryPrice) isTie = true;
            }

            let payoutAmount = 0;
            if (isWin) payoutAmount = trade.amount * (1 + trade.payout);
            else if (isTie) payoutAmount = trade.amount;

            if (payoutAmount > 0) setBalance(b => b + payoutAmount);

            setTradeHistory(h => [{
              id: trade.id, assetSymbol: trade.assetSymbol, direction: trade.direction,
              amount: trade.amount, entryPrice: trade.entryPrice, exitPrice, payoutAmount,
              isWin, isTie, asset: trade.assetSymbol.split(':')[1] || trade.assetSymbol,
              timestamp: new Date().toLocaleTimeString()
            }, ...h]);

            setNotification({
              message: isWin ? `WIN! +$${payoutAmount.toFixed(2)}` : isTie ? `TIE (Refunded $${trade.amount})` : `LOSS -$${trade.amount}`,
              type: isWin ? 'win' : isTie ? 'info' : 'loss'
            });
            setTimeout(() => setNotification(null), 4000);
          } else {
            remaining.push({ ...trade, secondsRemaining: nextSecs });
          }
        });

        return remaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTrade = (direction: 'HIGHER' | 'LOWER') => {
    if (investment <= 0 || isNaN(investment) || balance < investment) return;
    setBalance(b => b - investment);
    const entryPrice = pricesRef.current[selectedAsset.symbol] || selectedAsset.basePrice;

    setActiveTrades(prev => [{
      id: Math.random().toString(36).substring(2, 9),
      assetSymbol: selectedAsset.symbol,
      direction, amount: investment, entryPrice, duration,
      secondsRemaining: duration, payout: selectedAsset.payout,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const currentDirection = priceDirections[selectedAsset.symbol] || 'up';
  const isLargeNumber = selectedAsset.symbol.includes('BTC') || selectedAsset.symbol.includes('ETH') || selectedAsset.symbol.includes('PAXG');
  
  const displayPrice = isLargeNumber
    ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : currentPrice.toFixed(5);

  return (
    <div className="flex flex-col h-screen bg-[#080c11] text-white font-sans overflow-hidden select-none">
      <header className="h-14 border-b border-gray-800/80 bg-[#0b1017] px-4 flex items-center justify-between z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 font-black text-lg tracking-wider text-white">
            <span className="bg-[#b6ff3b] text-black px-2 py-0.5 rounded font-black">X</span>
            <span>EXPIRYCAPITAL</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
              className="flex items-center space-x-2 bg-[#161c24] hover:bg-[#1f2733] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <span>{selectedAsset.name}</span>
              <span className="text-[#b6ff3b] font-mono">+{Math.round(selectedAsset.payout * 100)}%</span>
            </button>

            {assetDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#11161d] border border-gray-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1">Select Assets</div>
                {ASSETS.map(asset => (
                  <button
                    key={asset.symbol}
                    onClick={() => { setSelectedAsset(asset); setAssetDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedAsset.symbol === asset.symbol ? 'bg-[#1e2732] text-white' : 'hover:bg-[#161c24] text-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold">{asset.name}</span>
                      <span className="text-[10px] text-gray-500">{asset.symbol}</span>
                    </div>
                    <span className="text-[#b6ff3b] font-mono font-bold">+{Math.round(asset.payout * 100)}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#11161d] p-1 rounded-xl flex items-center border border-gray-800">
            <button onClick={() => setIsDemo(true)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isDemo ? 'bg-[#1a222d] text-white' : 'text-gray-400'}`}>DEMO</button>
            <button onClick={() => setIsDemo(false)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!isDemo ? 'bg-[#1a222d] text-white' : 'text-gray-400'}`}>REAL</button>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{isDemo ? 'Demo Balance' : 'Real Balance'}</span>
            <span className="text-lg font-mono font-black text-[#b6ff3b]">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <button onClick={() => setBalance(10000)} className="p-2 bg-[#161c24] hover:bg-[#1f2733] border border-gray-800 rounded-lg text-xs text-gray-300 font-bold flex items-center space-x-1" title="Reset Balance">
            <Clock size={14} /><span>RESET</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-12 bg-[#0b1017] border-r border-gray-800/80 flex flex-col items-center py-4 space-y-6 text-gray-500 z-10">
          <button className="hover:text-white transition-colors"><BarChart2 size={18} /></button>
          <button onClick={() => setHistoryOpen(!historyOpen)} className={`hover:text-white transition-colors ${historyOpen ? 'text-[#b6ff3b]' : ''}`}><History size={18} /></button>
        </div>

        <div className="relative flex-1 bg-[#080c11] z-0">
          <TradingViewChart key={selectedAsset.symbol} symbol={selectedAsset.symbol} />

          <div className="absolute top-4 left-4 z-20 bg-[#0b1017]/90 border border-gray-800 rounded-lg px-3 py-1.5 flex items-center space-x-2 shadow-xl backdrop-blur">
            <Clock size={14} className="text-[#b6ff3b]" />
            <span className="text-xs font-mono font-bold text-gray-300">CANDLE CLOSE:</span>
            <span className="text-xs font-mono font-bold text-[#b6ff3b]">00:{candleSecondsLeft.toString().padStart(2, '0')}</span>
          </div>

          {notification && (
            <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-2xl flex items-center space-x-2 animate-bounce ${
              notification.type === 'win' ? 'bg-[#10b981] text-black' : notification.type === 'loss' ? 'bg-[#ef4444] text-white' : 'bg-blue-600 text-white'
            }`}>
              {notification.type === 'win' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>{notification.message}</span>
            </div>
          )}
        </div>

        <div className="w-80 bg-[#0b1017] border-l border-gray-800/80 p-4 flex flex-col justify-between z-20 shadow-2xl">
          <div className="space-y-4">
            <div className="bg-[#161c24] border border-gray-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase">
                <Activity size={14} className="text-[#b6ff3b] animate-pulse" />
                <span>Live Price</span>
              </div>
              <div className={`text-xl font-mono font-black transition-colors ${currentDirection === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {displayPrice}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiration Time</label>
              <div className="grid grid-cols-4 gap-1.5 bg-[#11161d] p-1 rounded-xl border border-gray-800">
                {[30, 60, 120, 300].map(s => (
                  <button key={s} onClick={() => setDuration(s)}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${duration === s ? 'bg-[#b6ff3b] text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}>
                    {s >= 60 ? `${s / 60}m` : `${s}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input type="number" value={investment} onChange={e => setInvestment(parseFloat(e.target.value))}
                  className="w-full bg-[#161c24] border border-gray-800 rounded-xl py-2.5 pl-7 pr-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-[#b6ff3b] transition-colors" />
              </div>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[5, 10, 25, 50, 100].map(amt => (
                  <button key={amt} onClick={() => setInvestment(amt)}
                    className="py-1 bg-[#11161d] hover:bg-[#1a222d] border border-gray-800 rounded-lg text-xs font-mono font-bold text-gray-300 transition-colors">${amt}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#11161d] border border-gray-800/60 rounded-xl p-3 text-center space-y-0.5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profit +{Math.round(selectedAsset.payout * 100)}%</div>
              <div className="text-xl font-mono font-black text-[#b6ff3b]">+${(investment * selectedAsset.payout || 0).toFixed(2)}</div>
              <div className="text-[10px] font-mono text-gray-500">Total Return: ${(investment * (1 + selectedAsset.payout) || 0).toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button onClick={() => handleTrade('HIGHER')}
                className="w-full bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all">
                <TrendingUp size={18} /><span>Buy / Higher</span>
              </button>
              <button onClick={() => handleTrade('LOWER')}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.98] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/40 transition-all">
                <TrendingDown size={18} /><span>Sell / Lower</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}