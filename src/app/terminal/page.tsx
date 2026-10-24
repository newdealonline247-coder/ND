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
    if (!price || tradeAmount > balance) return;
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
    <div className="flex flex-col h-screen bg-[#0b0e11] text-gray-200 overflow-hidden font-sans">
      <header className="h-14 border-b border-gray-800/50 bg-[#0b0e11] flex items-center justify-between px-4 z-50 gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center"><span className="text-black font-bold text-xl">X</span></div>
            <span className="font-bold text-lg tracking-tight text-white uppercase hidden md:inline">ExpiryCapital</span>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsAssetOpen(!isAssetOpen)} className="flex items-center gap-3 px-3 py-1.5 bg-gray-800/40 hover:bg-gray-800/60 rounded border border-gray-700/50 transition-all">
              <span className="font-bold text-sm tracking-wide">{selectedAsset.name} <span className="text-emerald-400 ml-1">+{selectedAsset.payout}%</span></span>
              <ChevronDown size={14} className={`transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAssetOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#161a1e] border border-gray-800 rounded-lg shadow-2xl z-[100] overflow-hidden">
                <div className="p-3 border-b border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 text-gray-500" size={14} />
                    <input autoFocus placeholder="Search pairs..." className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-emerald-500" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredAssets.map(asset => (
                    <button key={asset.id} onClick={() => { setSelectedAsset(asset); setIsAssetOpen(false); }} className="w-full px-4 py-2.5 hover:bg-gray-800 flex items-center justify-between text-sm transition-colors border-b border-gray-800/30">
                      <div className="flex flex-col items-start"><span className="font-medium text-gray-200">{asset.name}</span><span className="text-[10px] text-gray-500 uppercase tracking-wider">{asset.type}</span></div>
                      <span className="text-emerald-400 font-bold">+{asset.payout}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE ACTIVE TRADES FEED */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 border-x border-gray-800/40 min-w-0">
          {activeTrades.length === 0 && tradeResults.length === 0 && <div className="text-xs text-gray-600 font-medium italic">No active trades. Click BUY or SELL to open a position.</div>}
          {activeTrades.map(trade => {
            const isWinning = trade.type === 'HIGHER' ? (priceRef.current || 0) > trade.entryPrice : (priceRef.current || 0) < trade.entryPrice;
            return (
              <div key={trade.id} className={`flex items-center gap-2.5 px-3 py-1 rounded border transition-all shrink-0 ${isWinning ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'}`}>
                <div className="flex items-center gap-1">{trade.type === 'HIGHER' ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}<span className="font-bold text-xs">{trade.assetName}</span></div>
                <div className="h-4 w-[1px] bg-gray-800"></div>
                <div className="flex flex-col text-[11px] leading-tight font-mono"><span className="text-gray-400 font-sans font-bold">${trade.amount}</span><span className="font-bold text-white">{Math.floor(trade.timeRemaining/60)}:{(trade.timeRemaining%60).toString().padStart(2,'0')}</span></div>
                <div className="h-4 w-[1px] bg-gray-800"></div>
                <div className="flex flex-col text-right font-mono text-[11px] leading-tight"><span className="text-[10px] text-gray-500">Return</span><span className={`font-bold ${isWinning ? 'text-emerald-400' : 'text-gray-500'}`}>{isWinning ? `+$${(trade.amount*(1+trade.payoutRate)).toFixed(2)}` : '$0.00'}</span></div>
              </div>
            );
          })}
          {tradeResults.map(res => (
            <div key={res.id} className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs shrink-0 ${res.win ? 'bg-emerald-900/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-900/20 border-rose-500/40 text-rose-400'}`}>
              {res.win ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span className="font-bold text-[11px]">{res.assetName}</span>
              <span className="font-mono text-[11px] font-bold">{res.win ? `+$${res.payout.toFixed(2)}` : `-$${res.amount.toFixed(2)}`}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-gray-900 rounded p-1 border border-gray-800">
            <button className="px-3 py-1 text-xs font-bold rounded bg-gray-800 text-white">DEMO</button>
            <button className="px-3 py-1 text-xs font-bold rounded text-gray-500">REAL</button>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Demo Balance</div>
            <div className="text-emerald-400 font-mono font-bold text-base leading-tight">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <button onClick={resetBalance} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"><RefreshCw size={14} /><span className="text-[10px] font-bold">RESET</span></button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-12 border-r border-gray-800/50 bg-[#0b0e11] flex flex-col items-center py-4 gap-6">
          <button className="p-2 text-emerald-500 bg-emerald-500/10 rounded-lg"><BarChart2 size={20} /></button>
          <button className="p-2 text-gray-500 hover:text-white"><Clock size={20} /></button>
          <button className="p-2 text-gray-500 hover:text-white"><User size={20} /></button>
          <div className="mt-auto flex flex-col gap-6"><button className="p-2 text-gray-500 hover:text-white"><Settings size={20} /></button><button className="p-2 text-gray-500 hover:text-white"><HelpCircle size={20} /></button></div>
        </div>
        <div className="flex-1 relative bg-[#0b0e11]"><TradingViewChart symbol={selectedAsset.symbol} /></div>
        <div className="w-72 border-l border-gray-800/50 bg-[#0b0e11] p-4 flex flex-col gap-6">
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Live Price</span></div>
            <div className={`text-2xl font-mono font-bold tracking-tighter ${!price || !prevPrice || price === prevPrice ? 'text-emerald-400' : (price > prevPrice ? 'text-emerald-400' : 'text-rose-400')}`}>{formatPrice(price)}</div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Expiration Time</label>
              <div className="grid grid-cols-4 gap-1">{['30s', '1m', '2m', '5m'].map(t => (<button key={t} onClick={() => setExpiry(t)} className={`py-2 text-xs font-bold rounded border transition-all ${expiry === t ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'}`}>{t}</button>))}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Investment Amount</label>
              <div className="relative group"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold group-focus-within:text-emerald-500">$</span><input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-emerald-500 transition-colors" /></div>
              <div className="grid grid-cols-5 gap-1 mt-2">{['5', '10', '25', '50', '100'].map(val => (<button key={val} onClick={() => setAmount(val)} className="py-1.5 text-[10px] font-bold bg-gray-900/50 hover:bg-gray-800 text-gray-400 rounded transition-colors border border-gray-800">${val}</button>))}</div>
            </div>
          </div>
          <div className="mt-4 bg-gray-900/30 rounded-xl p-4 border border-gray-800/50">
            <div className="flex justify-between text-[11px] mb-1"><span className="text-gray-500 font-bold uppercase tracking-wider">Profit +{selectedAsset.payout}%</span><span className="text-emerald-400 font-bold">+${((parseFloat(amount) || 0) * (selectedAsset.payout / 100)).toFixed(2)}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-500 font-bold uppercase tracking-wider">Total Return</span><span className="text-white font-bold">${((parseFloat(amount) || 0) * (1 + selectedAsset.payout / 100)).toFixed(2)}</span></div>
          </div>
          <div className="mt-auto space-y-3">
            <button onClick={() => handlePlaceTrade('HIGHER')} className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 group cursor-pointer"><TrendingUp size={20} className="group-hover:-translate-y-0.5 transition-transform" /><span className="uppercase tracking-widest text-sm">Buy / Higher</span></button>
            <button onClick={() => handlePlaceTrade('LOWER')} className="w-full bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/10 group cursor-pointer"><TrendingDown size={20} className="group-hover:translate-y-0.5 transition-transform" /><span className="uppercase tracking-widest text-sm">Sell / Lower</span></button>
          </div>
        </div>
      </main>
    </div>
  );
}