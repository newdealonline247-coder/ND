"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, ChevronDown, 
  Search, User, Settings, BarChart2, HelpCircle, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import TradingViewChart from '@/components/TradingViewChart';

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
  type: 'HIGHER' | 'LOWER';
  entryPrice: number;
  amount: number;
  payoutRate: number;
  durationSec: number;
  timeRemaining: number;
  createdAt: number;
}

interface TradeResult {
  id: string;
  assetName: string;
  type: 'HIGHER' | 'LOWER';
  amount: number;
  payout: number;
  win: boolean;
  tie: boolean;
}

const ASSETS: Asset[] = [
  { id: 'EURUSD', name: 'EUR/USD', type: 'Forex', symbol: 'OANDA:EURUSD', payout: 92 },
  { id: 'GBPUSD', name: 'GBP/USD', type: 'Forex', symbol: 'OANDA:GBPUSD', payout: 88 },
  { id: 'GBPAUD', name: 'GBP/AUD', type: 'Forex', symbol: 'OANDA:GBPAUD', payout: 88 },
  { id: 'USDJPY', name: 'USD/JPY', type: 'Forex', symbol: 'OANDA:USDJPY', payout: 90 },
  { id: 'USDCHF', name: 'USD/CHF', type: 'Forex', symbol: 'OANDA:USDCHF', payout: 85 },
  { id: 'AUDUSD', name: 'AUD/USD', type: 'Forex', symbol: 'OANDA:AUDUSD', payout: 87 },
  { id: 'USDCAD', name: 'USD/CAD', type: 'Forex', symbol: 'OANDA:USDCAD', payout: 86 },
  { id: 'NZDUSD', name: 'NZD/USD', type: 'Forex', symbol: 'OANDA:NZDUSD', payout: 84 },
  { id: 'EURGBP', name: 'EUR/GBP', type: 'Forex', symbol: 'OANDA:EURGBP', payout: 89 },
  { id: 'EURJPY', name: 'EUR/JPY', type: 'Forex', symbol: 'OANDA:EURJPY', payout: 91 },
  { id: 'GBPJPY', name: 'GBP/JPY', type: 'Forex', symbol: 'OANDA:GBPJPY', payout: 90 },
  { id: 'AUDJPY', name: 'AUD/JPY', type: 'Forex', symbol: 'OANDA:AUDJPY', payout: 85 },
  { id: 'EURAUD', name: 'EUR/AUD', type: 'Forex', symbol: 'OANDA:EURAUD', payout: 88 },
  { id: 'EURCAD', name: 'EUR/CAD', type: 'Forex', symbol: 'OANDA:EURCAD', payout: 86 },
  { id: 'GBPCHF', name: 'GBP/CHF', type: 'Forex', symbol: 'OANDA:GBPCHF', payout: 84 },
  { id: 'CADJPY', name: 'CAD/JPY', type: 'Forex', symbol: 'OANDA:CADJPY', payout: 87 },
  { id: 'CHFJPY', name: 'CHF/JPY', type: 'Forex', symbol: 'OANDA:CHFJPY', payout: 86 },
  { id: 'NZDJPY', name: 'NZD/JPY', type: 'Forex', symbol: 'OANDA:NZDJPY', payout: 83 },
  { id: 'EURNZD', name: 'EUR/NZD', type: 'Forex', symbol: 'OANDA:EURNZD', payout: 85 },
  { id: 'AUDCAD', name: 'AUD/CAD', type: 'Forex', symbol: 'OANDA:AUDCAD', payout: 84 },
  { id: 'USDTRY', name: 'USD/TRY', type: 'Forex', symbol: 'OANDA:USDTRY', payout: 80 },
  { id: 'BTCUSDT', name: 'BTC/USDT', type: 'Crypto', symbol: 'BINANCE:BTCUSDT', payout: 95 },
  { id: 'ETHUSDT', name: 'ETH/USDT', type: 'Crypto', symbol: 'BINANCE:ETHUSDT', payout: 93 },
  { id: 'XAUUSD', name: 'GOLD', type: 'Commodity', symbol: 'OANDA:XAUUSD', payout: 90 },
];

const FINNHUB_KEY = 'cqslcrpr01qj9a43lb7gcqslcrpr01qj9a43lb80';

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
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState('10');
  const [expiry, setExpiry] = useState('30s');
  const [balance, setBalance] = useState<number>(10000);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<number | null>(null);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  const filteredAssets = useMemo(() => 
    ASSETS.filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.type.toLowerCase().includes(assetSearch.toLowerCase())),
    [assetSearch]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setPrice(null);
    let ws: WebSocket | null = null;
    const fetchInitialPrice = async () => {
      try {
        const sym = selectedAsset.symbol;
        const restSym = sym.includes('OANDA') ? sym.replace(/([A-Z]{3})([A-Z]{3})/, '$1_$2') : sym.split(':')[1];
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${restSym}&token=${FINNHUB_KEY}`);
        const data = await res.json();
        if (data.c) setPrice(data.c);
      } catch (e) { console.error("Initial fetch failed", e); }
    };
    fetchInitialPrice();

    if (selectedAsset.type === 'Crypto') {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedAsset.id.toLowerCase()}@ticker`);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setPrice(prev => {
          if (prev !== null) setPrevPrice(prev);
          return parseFloat(data.c);
        });
      };
    } else {
      ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);
      ws.onopen = () => {
        const sym = selectedAsset.symbol;
        const subSym = sym.includes('OANDA') ? sym.replace(/([A-Z]{3})([A-Z]{3})/, '$1_$2') : sym;
        ws?.send(JSON.stringify({ type: 'subscribe', symbol: subSym }));
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'trade') {
          setPrice(prev => {
            if (prev !== null) setPrevPrice(prev);
            return data.data[0].p;
          });
        }
      };
    }
    return () => ws?.close();
  }, [selectedAsset]);

  useEffect(() => {
    if (activeTrades.length === 0) return;
    const interval = setInterval(() => {
      setActiveTrades(prevTrades => {
        const currentPriceVal = priceRef.current;
        const remainingTrades: ActiveTrade[] = [];
        prevTrades.forEach(trade => {
          const nextTime = trade.timeRemaining - 1;
          if (nextTime <= 0) {
            const curP = currentPriceVal || trade.entryPrice;
            const isWin = trade.type === 'HIGHER' ? curP > trade.entryPrice : curP < trade.entryPrice;
            const payoutAmount = isWin ? trade.amount * (1 + trade.payoutRate) : (curP === trade.entryPrice ? trade.amount : 0);
            if (payoutAmount > 0) setBalance(b => b + payoutAmount);
            setTradeResults(r => [{ id: trade.id, assetName: trade.assetName, type: trade.type, amount: trade.amount, payout: payoutAmount, win: isWin, tie: curP === trade.entryPrice }, ...r].slice(0, 3));
          } else {
            remainingTrades.push({ ...trade, timeRemaining: nextTime });
          }
        });
        return remainingTrades;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrades.length]);

  const handlePlaceTrade = (type: 'HIGHER' | 'LOWER') => {
    const tradeAmount = parseFloat(amount);
    if (!price || tradeAmount > balance || isNaN(tradeAmount) || tradeAmount <= 0) return;
    setBalance(prev => prev - tradeAmount);
    const dur = expiry.endsWith('s') ? parseInt(expiry) : parseInt(expiry) * 60;
    setActiveTrades(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      assetId: selectedAsset.id, assetName: selectedAsset.name, type,
      entryPrice: price, amount: tradeAmount, payoutRate: selectedAsset.payout / 100,
      durationSec: dur, timeRemaining: dur, createdAt: Date.now()
    }]);
  };

  const formatPrice = (p: number | null, assetId: string = selectedAsset.id, assetType: string = selectedAsset.type) => {
    if (p === null) return "Loading...";
    const isJPY = assetId.includes('JPY');
    const isCrypto = assetType === 'Crypto' || assetId === 'XAUUSD';
    return p.toLocaleString(undefined, { minimumFractionDigits: isJPY ? 3 : (isCrypto ? 2 : 5), maximumFractionDigits: isJPY ? 3 : (isCrypto ? 2 : 5) });
  };

  const resetBalance = () => {
    setBalance(10000);
    setActiveTrades([]);
    setTradeResults([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#05080a] text-[#ecf4ee] overflow-hidden font-sans select-none">
      {/* Header */}
      <header className="h-[60px] border-b border-[#182228] bg-[#05080a] flex items-center justify-between px-5 z-50 gap-4">
        {/* Logo & Asset Selector */}
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
              <span className="font-bold text-xs tracking-wide">{selectedAsset.name} <span className="text-[#b6ff3b] ml-1">+{selectedAsset.payout}%</span></span>
              <ChevronDown size={14} className={`text-[#8e9ca5] transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
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
                  {filteredAssets.map(asset => (
                    <button 
                      key={asset.id} 
                      onClick={() => { setSelectedAsset(asset); setIsAssetOpen(false); }} 
                      className="w-full px-4 py-2.5 hover:bg-[#0d161a] flex items-center justify-between text-xs transition-colors border-b border-[#182228]/50"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-[#ecf4ee]">{asset.name}</span>
                        <span className="text-[10px] text-[#5c6a72] uppercase tracking-wider">{asset.type}</span>
                      </div>
                      <span className="text-[#b6ff3b] font-bold">+{asset.payout}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Active Trades Feed Bar */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-3 border-x border-[#182228] min-w-0">
          {activeTrades.length === 0 && tradeResults.length === 0 && (
            <div className="text-xs text-[#5c6a72] font-medium flex items-center gap-2">
              <span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />
              PRACTICE TERMINAL LIVE — NO ACTIVE POSITIONS
            </div>
          )}

          {activeTrades.map(trade => {
            const isWinning = trade.type === 'HIGHER' ? (priceRef.current || 0) > trade.entryPrice : (priceRef.current || 0) < trade.entryPrice;
            return (
              <div key={trade.id} className={`flex items-center gap-2.5 px-3 py-1 rounded-xl border transition-all shrink-0 ${isWinning ? 'bg-[#2bd98a]/10 border-[#2bd98a]/50 text-[#2bd98a]' : 'bg-[#ff4d67]/10 border-[#ff4d67]/50 text-[#ff4d67]'}`}>
                <div className="flex items-center gap-1">
                  {trade.type === 'HIGHER' ? <TrendingUp size={14} className="text-[#2bd98a]" /> : <TrendingDown size={14} className="text-[#ff4d67]" />}
                  <span className="font-bold text-xs">{trade.assetName}</span>
                </div>
                <div className="h-4 w-[1px] bg-[#24323a]" />
                <div className="flex flex-col text-[11px] leading-tight font-mono">
                  <span className="text-[#8e9ca5] font-sans font-bold">${trade.amount}</span>
                  <span className="font-bold text-white">{Math.floor(trade.timeRemaining/60)}:{(trade.timeRemaining%60).toString().padStart(2,'0')}</span>
                </div>
                <div className="h-4 w-[1px] bg-[#24323a]" />
                <div className="flex flex-col text-right font-mono text-[11px] leading-tight">
                  <span className="text-[10px] text-[#5c6a72]">Return</span>
                  <span className={`font-bold ${isWinning ? 'text-[#b6ff3b]' : 'text-[#8e9ca5]'}`}>{isWinning ? `+$${(trade.amount*(1+trade.payoutRate)).toFixed(2)}` : '$0.00'}</span>
                </div>
              </div>
            );
          })}

          {tradeResults.map(res => (
            <div key={res.id} className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs shrink-0 ${res.win ? 'bg-[#2bd98a]/10 border-[#2bd98a]/40 text-[#2bd98a]' : 'bg-[#ff4d67]/10 border-[#ff4d67]/40 text-[#ff4d67]'}`}>
              {res.win ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span className="font-bold text-[11px]">{res.assetName}</span>
              <span className="font-mono text-[11px] font-bold">{res.win ? `+$${res.payout.toFixed(2)}` : `-$${res.amount.toFixed(2)}`}</span>
            </div>
          ))}
        </div>

        {/* Demo Balance Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex bg-[#0a1114] rounded-full p-1 border border-[#24323a]">
            <button className="px-3.5 py-1 text-xs font-bold rounded-full bg-[#182228] text-white shadow-sm">DEMO</button>
            <button className="px-3.5 py-1 text-xs font-bold rounded-full text-[#5c6a72] hover:text-[#8e9ca5] transition-colors">REAL</button>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#5c6a72] font-bold uppercase tracking-widest">Demo Balance</div>
            <div className="text-[#b6ff3b] font-mono font-bold text-base leading-tight">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button onClick={resetBalance} title="Reset Balance" className="p-2 hover:bg-[#0d161a] rounded-xl text-[#8e9ca5] hover:text-white transition-colors border border-[#24323a] flex items-center gap-1.5 text-xs">
            <RefreshCw size={13} />
            <span className="text-[10px] font-bold hidden md:inline">RESET</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-14 border-r border-[#182228] bg-[#05080a] flex flex-col items-center py-5 gap-6">
          <button className="p-2.5 text-[#b6ff3b] bg-[#b6ff3b]/10 rounded-xl shadow-[0_0_15px_rgba(182,255,59,0.15)]"><BarChart2 size={20} /></button>
          <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><Clock size={20} /></button>
          <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><User size={20} /></button>
          <div className="mt-auto flex flex-col gap-6">
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><Settings size={20} /></button>
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><HelpCircle size={20} /></button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="flex-1 relative bg-[#05080a]">
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>

        {/* Right Trade Sidebar */}
        <div className="w-80 border-l border-[#182228] bg-[#05080a] p-5 flex flex-col gap-6">
          {/* Live Price Box */}
          <div className="bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest flex items-center gap-1.5">
                <span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />
                Live Price
              </span>
            </div>
            <div className={`text-3xl font-mono font-bold tracking-tight ${!price || !prevPrice || price === prevPrice ? 'text-[#b6ff3b]' : (price > prevPrice ? 'text-[#2bd98a]' : 'text-[#ff4d67]')}`}>
              {formatPrice(price)}
            </div>
          </div>

          <div className="space-y-5">
            {/* Expiry Selector */}
            <div>
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest mb-2.5 block">Expiration Time</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['30s', '1m', '2m', '5m'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setExpiry(t)} 
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${expiry === t ? 'bg-[#b6ff3b] text-[#0a0f04] border-[#b6ff3b] shadow-[0_0_15px_rgba(182,255,59,0.25)]' : 'bg-[#0a1114] text-[#8e9ca5] border-[#24323a] hover:border-[#b6ff3b]/40'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Input */}
            <div>
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest mb-2.5 block">Investment Amount</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c6a72] font-bold group-focus-within:text-[#b6ff3b]">$</span>
                <input 
                  type="text" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-full bg-[#0a1114] border border-[#24323a] rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-[#b6ff3b] transition-colors text-base" 
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                {['5', '10', '25', '50', '100'].map(val => (
                  <button key={val} onClick={() => setAmount(val)} className="py-2 text-[10px] font-bold bg-[#0a1114] hover:bg-[#0d161a] text-[#8e9ca5] rounded-lg transition-colors border border-[#24323a]">
                    ${val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profit Calculation Summary */}
          <div className="bg-[#0a1114] rounded-2xl p-4 border border-[#24323a]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#5c6a72] font-bold uppercase tracking-wider">Profit +{selectedAsset.payout}%</span>
              <span className="text-[#b6ff3b] font-bold">+${((parseFloat(amount) || 0) * (selectedAsset.payout / 100)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#5c6a72] font-bold uppercase tracking-wider">Total Return</span>
              <span className="text-white font-bold">${((parseFloat(amount) || 0) * (1 + selectedAsset.payout / 100)).toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-3">
            <button 
              onClick={() => handlePlaceTrade('HIGHER')} 
              className="w-full bg-[#b6ff3b] hover:bg-[#a3eb2e] text-[#0a0f04] font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(182,255,59,0.3)] hover:shadow-[0_0_35px_rgba(182,255,59,0.45)] cursor-pointer"
            >
              <TrendingUp size={20} strokeWidth={2.5} />
              <span className="uppercase tracking-wider text-sm font-extrabold">Buy / Higher</span>
            </button>
            <button 
              onClick={() => handlePlaceTrade('LOWER')} 
              className="w-full bg-[#ff4d67] hover:bg-[#e63952] text-white font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,77,103,0.3)] hover:shadow-[0_0_30px_rgba(255,77,103,0.45)] cursor-pointer"
            >
              <TrendingDown size={20} strokeWidth={2.5} />
              <span className="uppercase tracking-wider text-sm font-extrabold">Sell / Lower</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}