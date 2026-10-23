'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Activity, TrendingUp, TrendingDown, Clock, History, BarChart2, CheckCircle2, XCircle, ChevronDown, Search } from 'lucide-react';

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
  { symbol: 'OANDA:EURUSD', name: 'EUR/USD', payout: 0.92, basePrice: 1.08500 },
  { symbol: 'OANDA:GBPUSD', name: 'GBP/USD', payout: 0.88, basePrice: 1.33850 },
  { symbol: 'OANDA:USDJPY', name: 'USD/JPY', payout: 0.89, basePrice: 154.500 },
  { symbol: 'OANDA:USDCHF', name: 'USD/CHF', payout: 0.87, basePrice: 0.88500 },
  { symbol: 'OANDA:AUDUSD', name: 'AUD/USD', payout: 0.86, basePrice: 0.65410 },
  { symbol: 'OANDA:USDCAD', name: 'USD/CAD', payout: 0.87, basePrice: 1.39500 },
  { symbol: 'OANDA:NZDUSD', name: 'NZD/USD', payout: 0.85, basePrice: 0.58800 },
  { symbol: 'OANDA:EURGBP', name: 'EUR/GBP', payout: 0.88, basePrice: 0.85700 },
  { symbol: 'OANDA:EURJPY', name: 'EUR/JPY', payout: 0.90, basePrice: 167.600 },
  { symbol: 'OANDA:GBPJPY', name: 'GBP/JPY', payout: 0.91, basePrice: 195.400 },
  { symbol: 'OANDA:AUDJPY', name: 'AUD/JPY', payout: 0.86, basePrice: 100.700 },
  { symbol: 'OANDA:EURAUD', name: 'EUR/AUD', payout: 0.87, basePrice: 1.66400 },
  { symbol: 'OANDA:EURCAD', name: 'EUR/CAD', payout: 0.86, basePrice: 1.51300 },
  { symbol: 'OANDA:GBPCHF', name: 'GBP/CHF', payout: 0.85, basePrice: 1.12000 },
  { symbol: 'OANDA:GBPAUD', name: 'GBP/AUD', payout: 0.88, basePrice: 1.94000 },
  { symbol: 'OANDA:CADJPY', name: 'CAD/JPY', payout: 0.85, basePrice: 110.700 },
  { symbol: 'OANDA:CHFJPY', name: 'CHF/JPY', payout: 0.86, basePrice: 174.500 },
  { symbol: 'OANDA:NZDJPY', name: 'NZD/JPY', payout: 0.84, basePrice: 90.800 },
  { symbol: 'OANDA:EURNZD', name: 'EUR/NZD', payout: 0.86, basePrice: 1.84500 },
  { symbol: 'OANDA:AUDCAD', name: 'AUD/CAD', payout: 0.85, basePrice: 0.90900 },
  { symbol: 'OANDA:USDTRY', name: 'USD/TRY', payout: 0.85, basePrice: 34.5000 },
  { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USDT', payout: 0.90, basePrice: 96400.00 },
  { symbol: 'BINANCE:ETHUSDT', name: 'ETH/USDT', payout: 0.89, basePrice: 2750.00 },
  { symbol: 'OANDA:XAUUSD', name: 'GOLD', payout: 0.95, basePrice: 2650.00 },
];

export default function TerminalPage() {
  const [balance, setBalance] = useState(10000);
  const [isDemo, setIsDemo] = useState(true);
  const [investment, setInvestment] = useState(10);
  const [duration, setDuration] = useState(30);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[1]);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<SettledTrade[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'win' | 'loss' | 'info' } | null>(null);

  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ASSETS.forEach(a => { initial[a.symbol] = a.basePrice; });
    return initial;
  });

  const [anchors, setAnchors] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ASSETS.forEach(a => { initial[a.symbol] = a.basePrice; });
    return initial;
  });

  const [priceDirections, setPriceDirections] = useState<Record<string, 'up' | 'down'>>({});
  const [candleSecondsLeft, setCandleSecondsLeft] = useState(60);

  const pricesRef = useRef(prices);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => { pricesRef.current = prices; }, [prices]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAssetDropdownOpen(false);
        setAssetSearch('');
      }
    };
    if (assetDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [assetDropdownOpen]);

  // Calibrate Forex from free live rates
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (!data?.rates) return;
        const r = data.rates;
        const getRate = (base: string, quote: string) => {
          if (base === 'USD') return r[quote] || 1;
          if (quote === 'USD') return r[base] ? 1 / r[base] : 1;
          if (r[base] && r[quote]) return r[quote] / r[base];
          return 1;
        };
        setPrices(prev => {
          const updated = { ...prev };
          const newAnchors: Record<string, number> = {};
          ASSETS.forEach(asset => {
            if (asset.symbol.includes('BINANCE') || asset.symbol.includes('XAU')) return;
            const [b, q] = asset.name.split('/');
            if (!b || !q) return;
            const rate = getRate(b, q);
            const isJpy = asset.name.includes('JPY');
            const val = parseFloat(rate.toFixed(isJpy ? 3 : 5));
            updated[asset.symbol] = val;
            newAnchors[asset.symbol] = val;
          });
          setAnchors(a => ({ ...a, ...newAnchors }));
          return updated;
        });
      })
      .catch(() => {});
  }, []);

  // Binance live WebSocket (Crypto)
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!data?.s || !data?.c) return;
          const price = parseFloat(data.c);
          if (isNaN(price)) return;
          const key = data.s === 'BTCUSDT' ? 'BINANCE:BTCUSDT' : data.s === 'ETHUSDT' ? 'BINANCE:ETHUSDT' : null;
          if (!key) return;
          setPrices(prev => {
            const old = prev[key] || price;
            setPriceDirections(d => ({ ...d, [key]: price >= old ? 'up' : 'down' }));
            return { ...prev, [key]: price };
          });
          setAnchors(a => ({ ...a, [key]: price }));
        } catch {}
      };
    } catch {}
    return () => { ws?.close(); };
  }, []);

  // Forex/Gold micro-ticks with strong mean reversion (stays close to chart)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        ASSETS.forEach(asset => {
          if (asset.symbol.includes('BINANCE')) return;
          const current = prev[asset.symbol] || asset.basePrice;
          const anchor = anchors[asset.symbol] || asset.basePrice;
          const isGold = asset.symbol.includes('XAU');
          const isJpy = asset.name.includes('JPY');
          const scale = isGold ? 0.12 : isJpy ? 0.008 : 0.000025;
          // Strong pull back to anchor so it never drifts far from live rate
          const change = (Math.random() - 0.5) * scale - (current - anchor) * 0.18;
          const updated = parseFloat((current + change).toFixed(isGold ? 2 : isJpy ? 3 : 5));
          next[asset.symbol] = updated;
          setPriceDirections(d => ({ ...d, [asset.symbol]: updated >= current ? 'up' : 'down' }));
        });
        return next;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [anchors]);

  // Candle countdown
  useEffect(() => {
    const tick = () => setCandleSecondsLeft(60 - (Math.floor(Date.now() / 1000) % 60));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Trade settlement
  useEffect(() => {
    const id = setInterval(() => {
      setActiveTrades(prev => {
        const keep: ActiveTrade[] = [];
        prev.forEach(trade => {
          const left = trade.secondsRemaining - 1;
          if (left <= 0) {
            const exit = pricesRef.current[trade.assetSymbol] ?? trade.entryPrice;
            let isWin = false, isTie = false;
            if (trade.direction === 'HIGHER') {
              if (exit > trade.entryPrice) isWin = true;
              else if (exit === trade.entryPrice) isTie = true;
            } else {
              if (exit < trade.entryPrice) isWin = true;
              else if (exit === trade.entryPrice) isTie = true;
            }
            let payoutAmount = 0;
            if (isWin) payoutAmount = trade.amount * (1 + trade.payout);
            else if (isTie) payoutAmount = trade.amount;
            if (payoutAmount > 0) setBalance(b => b + payoutAmount);

            setTradeHistory(h => [{
              id: trade.id, assetSymbol: trade.assetSymbol, direction: trade.direction,
              amount: trade.amount, entryPrice: trade.entryPrice, exitPrice: exit,
              payoutAmount, isWin, isTie,
              asset: trade.assetSymbol.split(':')[1] || trade.assetSymbol,
              timestamp: new Date().toLocaleTimeString()
            }, ...h]);

            setNotification({
              message: isWin ? `WIN! +$${payoutAmount.toFixed(2)}` : isTie ? `TIE (Refunded $${trade.amount})` : `LOSS -$${trade.amount}`,
              type: isWin ? 'win' : isTie ? 'info' : 'loss'
            });
            setTimeout(() => setNotification(null), 4000);
          } else {
            keep.push({ ...trade, secondsRemaining: left });
          }
        });
        return keep;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleTrade = (direction: 'HIGHER' | 'LOWER') => {
    if (investment <= 0 || isNaN(investment) || balance < investment) return;
    setBalance(b => b - investment);
    const entryPrice = pricesRef.current[selectedAsset.symbol] || selectedAsset.basePrice;
    setActiveTrades(prev => [{
      id: Math.random().toString(36).slice(2, 9),
      assetSymbol: selectedAsset.symbol,
      direction, amount: investment, entryPrice,
      duration, secondsRemaining: duration,
      payout: selectedAsset.payout,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const filteredAssets = ASSETS.filter(a =>
    a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
    a.symbol.toLowerCase().includes(assetSearch.toLowerCase())
  );

  const currentPrice = prices[selectedAsset.symbol] || selectedAsset.basePrice;
  const currentDirection = priceDirections[selectedAsset.symbol] || 'up';
  const isJpy = selectedAsset.name.includes('JPY');
  const isCryptoOrGold = selectedAsset.symbol.includes('BINANCE') || selectedAsset.symbol.includes('XAU');
  const displayPrice = isCryptoOrGold
    ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : isJpy ? currentPrice.toFixed(3) : currentPrice.toFixed(5);

  return (
    <div className="flex flex-col h-screen bg-[#080c11] text-white font-sans overflow-hidden select-none">
      <header className="h-14 border-b border-gray-800/80 bg-[#0b1017] px-4 flex items-center justify-between z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 font-black text-lg tracking-wider text-white">
            <span className="bg-[#b6ff3b] text-black px-2 py-0.5 rounded font-black">X</span>
            <span>EXPIRYCAPITAL</span>
          </div>

          {/* Asset Dropdown with Search + Click Outside */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
              className="flex items-center space-x-2 bg-[#161c24] hover:bg-[#1f2733] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <span>{selectedAsset.name}</span>
              <span className="text-[#b6ff3b] font-mono">+{Math.round(selectedAsset.payout * 100)}%</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${assetDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {assetDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 max-h-96 bg-[#11161d] border border-gray-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                {/* Search box */}
                <div className="p-2 border-b border-gray-800 sticky top-0 bg-[#11161d]">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      autoFocus
                      type="text"
                      value={assetSearch}
                      onChange={e => setAssetSearch(e.target.value)}
                      placeholder="Search pair..."
                      className="w-full bg-[#0b1017] border border-gray-700 rounded-lg py-2 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#b6ff3b]"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto p-2 space-y-0.5 max-h-72">
                  {filteredAssets.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-4">No pairs found</div>
                  ) : (
                    filteredAssets.map(asset => (
                      <button
                        key={asset.symbol}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setAssetDropdownOpen(false);
                          setAssetSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedAsset.symbol === asset.symbol
                            ? 'bg-[#1e2732] text-white font-bold'
                            : 'hover:bg-[#161c24] text-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-bold">{asset.name}</span>
                          <span className="text-[10px] text-gray-500">{asset.symbol}</span>
                        </div>
                        <span className="text-[#b6ff3b] font-mono font-bold">+{Math.round(asset.payout * 100)}%</span>
                      </button>
                    ))
                  )}
                </div>
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
