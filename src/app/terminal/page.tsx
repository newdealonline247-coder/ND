"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Clock, ChevronDown,
  Search, User, Settings, BarChart2, HelpCircle, CheckCircle2, XCircle, RefreshCw, Plus, Minus, Delete
} from 'lucide-react';
import TradingViewChart from '@/components/TradingViewChart';

interface Asset { id: string; name: string; type: string; symbol: string; payout: number; }
interface ActiveTrade { id: string; assetId: string; assetName: string; type: 'HIGHER' | 'LOWER'; entryPrice: number; amount: number; payoutRate: number; durationSec: number; totalDuration: number; timeRemaining: number; createdAt: number; }
interface TradeResult { id: string; assetName: string; type: 'HIGHER' | 'LOWER'; amount: number; payout: number; entryPrice: number; closePrice: number; closeTime: number; win: boolean; tie: boolean; }

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
  const [isAmountOpen, setIsAmountOpen] = useState(false);

  const [expirySec, setExpirySec] = useState(60);
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);

  const [balance, setBalance] = useState<number>(10000);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([]);
  const [isTradesOpen, setIsTradesOpen] = useState(false);
  const [tradeTab, setTradeTab] = useState<'active' | 'closed'>('active');
  const [serverTime, setServerTime] = useState(new Date());

  // Offset between local PC clock and atomic exchange server time
  const serverOffsetRef = useRef<number>(0);

  // Fixed position coordinates for popovers to prevent overflow clipping
  const [timePopoverPos, setTimePopoverPos] = useState({ top: 200, right: 336 });
  const [amountPopoverPos, setAmountPopoverPos] = useState({ top: 300, right: 336 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const timeBtnRef = useRef<HTMLButtonElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const popoverAmountInputRef = useRef<HTMLInputElement>(null);
  const timePopoverRef = useRef<HTMLDivElement>(null);
  const amountPopoverRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<number | null>(null);

  useEffect(() => { priceRef.current = price; }, [price]);

  const filteredAssets = useMemo(() =>
    ASSETS.filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.type.toLowerCase().includes(assetSearch.toLowerCase())),
    [assetSearch]
  );

  // Initial Sync of Atomic Time from Binance Server API
  useEffect(() => {
    const syncAtomicServerTime = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/time');
        const data = await res.json();
        if (data.serverTime) {
          serverOffsetRef.current = data.serverTime - Date.now();
        }
      } catch (e) {}
    };
    syncAtomicServerTime();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsAssetOpen(false);
      if (
        expiryRef.current && !expiryRef.current.contains(target) &&
        timePopoverRef.current && !timePopoverRef.current.contains(target)
      ) {
        setIsExpiryOpen(false);
      }
      if (
        amountRef.current && !amountRef.current.contains(target) &&
        amountPopoverRef.current && !amountPopoverRef.current.contains(target)
      ) {
        setIsAmountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update header clock using atomic server time offset
  useEffect(() => {
    const timer = setInterval(() => setServerTime(new Date(Date.now() + serverOffsetRef.current)), 1000);
    return () => clearInterval(timer);
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
      } catch (e) {}
    };
    fetchInitialPrice();

    if (selectedAsset.type === 'Crypto') {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedAsset.id.toLowerCase()}@ticker`);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.E) {
          // Re-calibrate server offset on every live tick
          serverOffsetRef.current = data.E - Date.now();
        }
        setPrice(prev => { if (prev !== null) setPrevPrice(prev); return parseFloat(data.c); });
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
          if (data.data && data.data[0] && data.data[0].t) {
            serverOffsetRef.current = data.data[0].t - Date.now();
          }
          setPrice(prev => { if (prev !== null) setPrevPrice(prev); return data.data[0].p; });
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
            const isTie = curP === trade.entryPrice;
            const payoutAmount = isWin ? trade.amount * (1 + trade.payoutRate) : (isTie ? trade.amount : 0);

            if (payoutAmount > 0) setBalance(b => b + payoutAmount);

            setTradeResults(r => [{
              id: trade.id, assetName: trade.assetName, type: trade.type, amount: trade.amount, payout: payoutAmount,
              entryPrice: trade.entryPrice, closePrice: curP, closeTime: Date.now(), win: isWin, tie: isTie
            }, ...r]);
          } else {
            remainingTrades.push({ ...trade, timeRemaining: nextTime });
          }
        });
        return remainingTrades;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrades.length]);

  const updateExpiry = (unit: 'h'|'m'|'s', delta: number) => {
    let h = Math.floor(expirySec / 3600);
    let m = Math.floor((expirySec % 3600) / 60);
    let s = expirySec % 60;
    if (unit === 'h') h = Math.max(0, h + delta);
    if (unit === 'm') m = Math.max(0, Math.min(59, m + delta));
    if (unit === 's') s = Math.max(0, Math.min(59, s + delta));
    const newTotal = h * 3600 + m * 60 + s;
    setExpirySec(Math.max(5, newTotal));
  };

  const handleNumpad = (val: string) => {
    if (val === 'back') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : ''));
    } else if (val === '.') {
      if (!amount.includes('.')) setAmount(prev => (prev === '' ? '0.' : prev + '.'));
    } else {
      setAmount(prev => (prev === '0' || prev === '' ? val : prev + val));
    }
  };

  const handleAmountInputChange = (val: string) => {
    if (/^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const handlePlaceTrade = (type: 'HIGHER' | 'LOWER') => {
    const tradeAmount = parseFloat(amount);
    if (!price || isNaN(tradeAmount) || tradeAmount <= 0 || tradeAmount > balance) return;
    setBalance(prev => prev - tradeAmount);
    setActiveTrades(prev => [{
      id: Math.random().toString(36).substr(2, 9), assetId: selectedAsset.id, assetName: selectedAsset.name, type,
      entryPrice: price, amount: tradeAmount, payoutRate: selectedAsset.payout / 100,
      durationSec: expirySec, totalDuration: expirySec, timeRemaining: expirySec, createdAt: Date.now()
    }, ...prev]);
    setIsTradesOpen(true);
    setTradeTab('active');
  };

  const formatPrice = (p: number | null, assetId: string = selectedAsset.id, assetType: string = selectedAsset.type) => {
    if (p === null) return "Loading...";
    const isJPY = assetId.includes('JPY');
    const isCrypto = assetType === 'Crypto' || assetId === 'XAUUSD';
    return p.toLocaleString(undefined, { minimumFractionDigits: isJPY ? 3 : (isCrypto ? 2 : 5), maximumFractionDigits: isJPY ? 3 : (isCrypto ? 2 : 5) });
  };

  const formatTimeStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const numericAmount = parseFloat(amount) || 0;

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
            <button onClick={() => setIsAssetOpen(!isAssetOpen)} className="flex items-center gap-3 px-3.5 py-1.5 bg-[#0a1114] hover:bg-[#0d161a] rounded-full border border-[#24323a] transition-all">
              <span className="font-bold text-xs tracking-wide">{selectedAsset.name} <span className="text-[#b6ff3b] ml-1">+{selectedAsset.payout}%</span></span>
              <ChevronDown size={14} className={`text-[#8e9ca5] transition-transform ${isAssetOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAssetOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#0a1114] border border-[#24323a] rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
                <div className="p-3 border-b border-[#182228]">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[#5c6a72]" size={14} />
                    <input autoFocus placeholder="Search pairs..." className="w-full bg-[#05080a] border border-[#24323a] rounded-xl py-1.5 pl-9 pr-3 text-xs text-[#ecf4ee] focus:outline-none focus:border-[#b6ff3b]" value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} />
                  </div>
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                  {filteredAssets.map(asset => (
                    <button key={asset.id} onClick={() => { setSelectedAsset(asset); setIsAssetOpen(false); }} className="w-full px-4 py-2.5 hover:bg-[#0d161a] flex items-center justify-between text-xs transition-colors border-b border-[#182228]/50">
                      <div className="flex flex-col items-start"><span className="font-semibold text-[#ecf4ee]">{asset.name}</span><span className="text-[10px] text-[#5c6a72] uppercase tracking-wider">{asset.type}</span></div>
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
              PRACTICE TERMINAL LIVE — NO ACTIVE POSITIONS
            </div>
          )}
          {activeTrades.slice(0, 3).map(trade => {
            const currentP = priceRef.current || trade.entryPrice;
            const isWinning = trade.type === 'HIGHER' ? currentP > trade.entryPrice : currentP < trade.entryPrice;
            return (
              <div key={trade.id} onClick={() => {setIsTradesOpen(true); setTradeTab('active');}} className={`flex items-center gap-2 px-3 py-1 rounded-xl border cursor-pointer hover:opacity-80 transition-all shrink-0 ${isWinning ? 'bg-[#2bd98a]/10 border-[#2bd98a]/50 text-[#2bd98a]' : 'bg-[#ff4d67]/10 border-[#ff4d67]/50 text-[#ff4d67]'}`}>
                {trade.type === 'HIGHER' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="font-bold text-[11px]">{trade.assetName}</span>
                <span className="font-mono font-bold text-[11px] ml-1 text-white">{formatTimeStr(trade.timeRemaining)}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-4 border-r border-[#182228]">
            <Clock size={14} className="text-[#5c6a72]" />
            <span className="text-xs font-mono font-bold text-[#8e9ca5]">
              {serverTime.getUTCHours().toString().padStart(2, '0')}:{serverTime.getUTCMinutes().toString().padStart(2, '0')}:{serverTime.getUTCSeconds().toString().padStart(2, '0')} UTC
            </span>
          </div>
          <div className="flex bg-[#0a1114] rounded-full p-1 border border-[#24323a]">
            <button className="px-3.5 py-1 text-xs font-bold rounded-full bg-[#182228] text-white shadow-sm">DEMO</button>
            <button className="px-3.5 py-1 text-xs font-bold rounded-full text-[#5c6a72] hover:text-[#8e9ca5]">REAL</button>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#5c6a72] font-bold uppercase tracking-widest">Demo Balance</div>
            <div className="text-[#b6ff3b] font-mono font-bold text-base leading-tight">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <button onClick={() => {setBalance(10000); setActiveTrades([]); setTradeResults([]);}} className="p-2 hover:bg-[#0d161a] rounded-xl text-[#8e9ca5] hover:text-white border border-[#24323a] flex items-center gap-1.5 text-xs"><RefreshCw size={13} /><span className="text-[10px] font-bold hidden md:inline">RESET</span></button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="w-14 border-r border-[#182228] bg-[#05080a] flex flex-col items-center py-5 gap-6 z-50 relative">
          <button className="p-2.5 text-[#5c6a72] hover:text-[#b6ff3b] transition-colors"><BarChart2 size={20} /></button>
          <div className="relative">
            <button onClick={() => setIsTradesOpen(!isTradesOpen)} className={`p-2.5 rounded-xl transition-all ${isTradesOpen ? 'bg-[#b6ff3b] text-[#0a0f04] shadow-[0_0_15px_rgba(182,255,59,0.3)]' : 'text-[#5c6a72] hover:text-white'}`}><Clock size={20} /></button>
            {activeTrades.length > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#b6ff3b] text-[#0a0f04] font-bold text-[9px] flex items-center justify-center rounded-full">{activeTrades.length}</span>}
          </div>
          <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><User size={20} /></button>
          <div className="mt-auto flex flex-col gap-6">
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><Settings size={20} /></button>
            <button className="p-2.5 text-[#5c6a72] hover:text-white transition-colors"><HelpCircle size={20} /></button>
          </div>
        </div>

        <div className={`absolute left-14 top-0 bottom-0 w-80 bg-[#0a1114] border-r border-[#182228] z-40 shadow-2xl transition-transform duration-300 flex flex-col ${isTradesOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-[#182228]">
            <div className="flex gap-4">
              <button onClick={() => setTradeTab('active')} className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${tradeTab === 'active' ? 'text-[#b6ff3b] border-b-2 border-[#b6ff3b]' : 'text-[#5c6a72] hover:text-[#8e9ca5]'}`}>Active ({activeTrades.length})</button>
              <button onClick={() => setTradeTab('closed')} className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${tradeTab === 'closed' ? 'text-white border-b-2 border-white' : 'text-[#5c6a72] hover:text-[#8e9ca5]'}`}>Closed</button>
            </div>
            <button onClick={() => setIsTradesOpen(false)} className="text-[#5c6a72] hover:text-white"><XCircle size={16}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {tradeTab === 'active' && activeTrades.length === 0 && <div className="text-center text-[#5c6a72] text-xs font-medium py-10 italic">No active trades.</div>}
            {tradeTab === 'active' && activeTrades.map(trade => {
              const curP = priceRef.current || trade.entryPrice;
              const isWinning = trade.type === 'HIGHER' ? curP > trade.entryPrice : curP < trade.entryPrice;
              const pct = (trade.timeRemaining / trade.totalDuration) * 100;
              return (
                <div key={trade.id} className="bg-[#05080a] border border-[#24323a] rounded-xl overflow-hidden shadow-sm">
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-1.5">
                        {trade.type === 'HIGHER' ? <TrendingUp size={14} className="text-[#2bd98a]" /> : <TrendingDown size={14} className="text-[#ff4d67]" />}
                        <span className="font-bold text-xs">{trade.assetName}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white bg-[#182228] px-2 py-0.5 rounded">{formatTimeStr(trade.timeRemaining)}</span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col gap-0.5"><span className="text-[10px] text-[#5c6a72] uppercase font-bold">Invested</span><span className="font-mono font-bold text-xs text-[#8e9ca5]">${trade.amount.toFixed(2)}</span></div>
                      <div className="flex flex-col gap-0.5 text-right"><span className="text-[10px] text-[#5c6a72] uppercase font-bold">Return</span><span className={`font-mono font-bold text-xs ${isWinning ? 'text-[#b6ff3b]' : 'text-[#ff4d67]'}`}>{isWinning ? `+$${(trade.amount * (1 + trade.payoutRate)).toFixed(2)}` : '$0.00'}</span></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#5c6a72] bg-[#0a1114] p-1.5 rounded-lg border border-[#182228]">
                      <span>{formatPrice(trade.entryPrice, trade.assetId)}</span><span>➔</span><span className={isWinning ? 'text-[#2bd98a]' : 'text-[#ff4d67]'}>{formatPrice(curP, trade.assetId)}</span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-[#182228]"><div className={`h-full transition-all duration-1000 linear ${isWinning ? 'bg-[#2bd98a]' : 'bg-[#ff4d67]'}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
            {tradeTab === 'closed' && tradeResults.length === 0 && <div className="text-center text-[#5c6a72] text-xs font-medium py-10 italic">No trade history.</div>}
            {tradeTab === 'closed' && tradeResults.map(res => (
              <div key={res.id} className="bg-[#05080a] border border-[#24323a] rounded-xl overflow-hidden shadow-sm p-3 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {res.win ? <CheckCircle2 size={14} className="text-[#2bd98a]" /> : <XCircle size={14} className="text-[#ff4d67]" />}
                    <span className="font-bold text-xs">{res.assetName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#5c6a72]">{new Date(res.closeTime).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col gap-0.5"><span className="text-[10px] text-[#5c6a72] uppercase font-bold">Invested</span><span className="font-mono font-bold text-xs text-[#8e9ca5]">${res.amount.toFixed(2)}</span></div>
                  <div className="flex flex-col gap-0.5 text-right"><span className="text-[10px] text-[#5c6a72] uppercase font-bold">Result</span><span className={`font-mono font-bold text-xs ${res.win ? 'text-[#2bd98a]' : 'text-[#ff4d67]'}`}>{res.win ? `+$${res.payout.toFixed(2)}` : `-$${res.amount.toFixed(2)}`}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative bg-[#05080a] z-10">
          <TradingViewChart symbol={selectedAsset.symbol} />
        </div>

        {/* Right Sidebar - Pinned Buttons Layout */}
        <div className="w-80 border-l border-[#182228] bg-[#05080a] flex flex-col z-20 relative shadow-[-10px_0_20px_rgba(0,0,0,0.2)]">
          {/* Scrollable Center Settings Area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 no-scrollbar">

            <div className="bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest flex items-center gap-1.5"><span className="live-dot size-2 rounded-full bg-[#b6ff3b]" />Live Price</span>
              </div>
              <div className={`text-3xl font-mono font-bold tracking-tight ${!price || !prevPrice || price === prevPrice ? 'text-[#b6ff3b]' : (price > prevPrice ? 'text-[#2bd98a]' : 'text-[#ff4d67]')}`}>{formatPrice(price)}</div>
            </div>

            <div className="space-y-4 shrink-0 relative" ref={expiryRef}>
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block">Time</label>
              <button
                ref={timeBtnRef}
                onClick={() => {
                  if (timeBtnRef.current) {
                    const rect = timeBtnRef.current.getBoundingClientRect();
                    setTimePopoverPos({ top: rect.top, right: window.innerWidth - rect.left + 12 });
                  }
                  setIsExpiryOpen(!isExpiryOpen);
                  setIsAmountOpen(false);
                }}
                className={`w-full flex items-center justify-between bg-[#0a1114] border ${isExpiryOpen ? 'border-[#b6ff3b]' : 'border-[#24323a] hover:border-[#b6ff3b]/40'} rounded-xl p-3 transition-colors`}
              >
                <span className="font-mono font-bold text-white text-lg tracking-widest">{formatTimeStr(expirySec)}</span>
                <Clock size={16} className="text-[#5c6a72]" />
              </button>
            </div>

            {/* Amount Field with Direct Keyboard Input Support */}
            <div className="space-y-4 shrink-0 relative" ref={amountRef}>
              <label className="text-[10px] font-bold text-[#5c6a72] uppercase tracking-widest block">Amount</label>
              <div
                onClick={() => {
                  if (amountInputRef.current) {
                    const rect = amountInputRef.current.getBoundingClientRect();
                    setAmountPopoverPos({ top: rect.top, right: window.innerWidth - rect.left + 12 });
                  }
                  setIsAmountOpen(true);
                  setIsExpiryOpen(false);
                }}
                className={`w-full flex items-center justify-between bg-[#0a1114] border ${isAmountOpen ? 'border-[#b6ff3b]' : 'border-[#24323a] hover:border-[#b6ff3b]/40'} rounded-xl p-3 transition-colors cursor-text`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[#5c6a72] font-bold">$</span>
                  <input
                    ref={amountInputRef}
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountInputChange(e.target.value)}
                    onFocus={() => {
                      if (amountInputRef.current) {
                        const rect = amountInputRef.current.getBoundingClientRect();
                        setAmountPopoverPos({ top: rect.top, right: window.innerWidth - rect.left + 12 });
                      }
                      setIsAmountOpen(true);
                      setIsExpiryOpen(false);
                    }}
                    placeholder="0"
                    className="font-mono font-bold text-white text-lg bg-transparent border-none outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0a1114] rounded-2xl p-4 border border-[#24323a] shrink-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#5c6a72] font-bold uppercase tracking-wider">Payout +{selectedAsset.payout}%</span>
                <span className="text-[#b6ff3b] font-bold">+${(numericAmount * (selectedAsset.payout / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5c6a72] font-bold uppercase tracking-wider">Total</span>
                <span className="text-white font-bold">${(numericAmount * (1 + selectedAsset.payout / 100)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Pinned Action Buttons Area */}
          <div className="p-5 border-t border-[#182228] bg-[#05080a] shrink-0 space-y-3 z-30 relative shadow-[0_-15px_15px_rgba(5,8,10,0.8)]">
            <button
              onClick={() => handlePlaceTrade('HIGHER')}
              className="w-full bg-[#2bd98a] hover:bg-[#23b874] text-[#05080a] font-black py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(43,217,138,0.2)] hover:shadow-[0_0_30px_rgba(43,217,138,0.35)] cursor-pointer"
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

      {/* ── Fixed Position Popovers ── */}

      {/* Time Popover */}
      {isExpiryOpen && (
        <div
          ref={timePopoverRef}
          style={{ top: `${timePopoverPos.top}px`, right: `${timePopoverPos.right}px` }}
          className="fixed w-[290px] bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* HH : MM : SS Digital Spinners */}
          <div className="flex items-center justify-center gap-1 mb-3.5 bg-[#05080a] rounded-xl border border-[#182228] p-3">
            {/* Hours */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => updateExpiry('h', 1)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Plus size={13} /></button>
              <span className="font-mono font-bold text-lg text-white w-10 text-center py-0.5">{Math.floor(expirySec / 3600).toString().padStart(2, '0')}</span>
              <button onClick={() => updateExpiry('h', -1)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Minus size={13} /></button>
            </div>
            <span className="font-mono font-bold text-lg text-[#5c6a72] mb-0.5">:</span>
            {/* Minutes */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => updateExpiry('m', 1)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Plus size={13} /></button>
              <span className="font-mono font-bold text-lg text-[#b6ff3b] w-10 text-center py-0.5">{Math.floor((expirySec % 3600) / 60).toString().padStart(2, '0')}</span>
              <button onClick={() => updateExpiry('m', -1)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Minus size={13} /></button>
            </div>
            <span className="font-mono font-bold text-lg text-[#5c6a72] mb-0.5">:</span>
            {/* Seconds */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => updateExpiry('s', 15)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Plus size={13} /></button>
              <span className="font-mono font-bold text-lg text-white w-10 text-center py-0.5">{(expirySec % 60).toString().padStart(2, '0')}</span>
              <button onClick={() => updateExpiry('s', -15)} className="w-10 h-7 rounded-lg bg-[#182228] hover:bg-[#24323a] text-[#8e9ca5] hover:text-white flex items-center justify-center transition-colors"><Minus size={13} /></button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: 'S15', v: 15 }, { l: 'S30', v: 30 }, { l: 'M1', v: 60 },
              { l: 'M2', v: 120 }, { l: 'M3', v: 180 }, { l: 'M5', v: 300 },
              { l: 'M15', v: 900 }, { l: 'M30', v: 1800 }, { l: 'H1', v: 3600 },
            ].map(t => (
              <button
                key={t.l}
                onClick={() => { setExpirySec(t.v); setIsExpiryOpen(false); }}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  expirySec === t.v
                    ? 'bg-[#b6ff3b] text-[#0a0f04] border-[#b6ff3b]'
                    : 'bg-[#05080a] text-[#8e9ca5] border-[#182228] hover:bg-[#182228] hover:text-white'
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount Popover with Sync Keyboard Input */}
      {isAmountOpen && (
        <div
          ref={amountPopoverRef}
          style={{ top: `${amountPopoverPos.top}px`, right: `${amountPopoverPos.right}px` }}
          className="fixed w-[260px] bg-[#0a1114] border border-[#24323a] rounded-2xl p-4 shadow-2xl z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Editable Display Box & Multipliers */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-[#05080a] border border-[#182228] rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="text-[#5c6a72] font-bold text-sm">$</span>
              <input
                ref={popoverAmountInputRef}
                type="text"
                value={amount}
                onChange={(e) => handleAmountInputChange(e.target.value)}
                placeholder="0"
                className="text-white font-mono font-bold text-base tracking-tight bg-transparent border-none outline-none w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setAmount(String(Math.min(balance, (parseFloat(amount) || 0) * 2)))}
                className="w-8 h-5 bg-[#182228] hover:bg-[#24323a] rounded-md flex items-center justify-center text-[10px] font-bold text-[#ecf4ee] transition-colors"
              >x2</button>
              <button
                onClick={() => setAmount(String(Math.max(1, Math.floor((parseFloat(amount) || 0) / 2))))}
                className="w-8 h-5 bg-[#182228] hover:bg-[#24323a] rounded-md flex items-center justify-center text-[10px] font-bold text-[#ecf4ee] transition-colors"
              >/2</button>
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {['7','8','9','4','5','6','1','2','3','.','0','back'].map(k => (
              <button
                key={k}
                onClick={() => handleNumpad(k)}
                className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors border ${
                  k === 'back'
                    ? 'bg-[#182228]/60 border-[#182228] text-[#ff4d67] hover:bg-[#ff4d67]/15'
                    : 'bg-[#05080a] border-[#182228] text-[#ecf4ee] hover:bg-[#182228] hover:border-[#24323a]'
                }`}
              >
                {k === 'back' ? <Delete size={15} /> : k}
              </button>
            ))}
          </div>

          {/* Quick stake chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 5, 10, 25, 50, 100, 500, 1000].map(v => (
              <button
                key={v}
                onClick={() => { setAmount(String(v)); setIsAmountOpen(false); }}
                className={`py-1 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                  amount === String(v)
                    ? 'bg-[#b6ff3b]/15 text-[#b6ff3b] border-[#b6ff3b]/40'
                    : 'bg-[#05080a] text-[#8e9ca5] border-[#182228] hover:text-white hover:bg-[#182228]'
                }`}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}