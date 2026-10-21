'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, TrendingDown, Clock, Wallet, User,
  History, ChevronDown, Plus, Settings, BarChart2,
  MessageCircle, HelpCircle, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Layers,
  Activity, Sliders
} from 'lucide-react';

const RealChart = dynamic(() => import('@/components/terminal/RealChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[#b6ff3b] font-mono text-sm animate-pulse bg-[#080c11]">
      Loading Candlestick Chart Engine...
    </div>
  ),
});

interface Asset {
  name: string;
  symbol: string;
  flag1: string;
  flag2: string;
  payout: number;
  category: 'OTC' | 'FOREX' | 'CRYPTO' | 'COMMODITIES';
}

const ASSETS: Asset[] = [
  { name: 'EUR/USD OTC', symbol: 'EURUSD_OTC', flag1: '🇪🇺', flag2: '🇺🇸', payout: 95, category: 'OTC' },
  { name: 'GBP/JPY OTC', symbol: 'GBPJPY_OTC', flag1: '🇬🇧', flag2: '🇯🇵', payout: 93, category: 'OTC' },
  { name: 'USD/TRY OTC', symbol: 'USDTRY_OTC', flag1: '🇺🇸', flag2: '🇹🇷', payout: 94, category: 'OTC' },
  { name: 'USD/CAD OTC', symbol: 'USDCAD_OTC', flag1: '🇺🇸', flag2: '🇨🇦', payout: 91, category: 'OTC' },
  { name: 'AUD/USD OTC', symbol: 'AUDUSD_OTC', flag1: '🇦🇺', flag2: '🇺🇸', payout: 90, category: 'OTC' },
  { name: 'BTC/USDT OTC', symbol: 'BTCUSDT_OTC', flag1: '₿', flag2: '💵', payout: 90, category: 'CRYPTO' },
  { name: 'ETH/USDT OTC', symbol: 'ETHUSDT_OTC', flag1: 'Ξ', flag2: '💵', payout: 88, category: 'CRYPTO' },
  { name: 'GOLD (XAU/USD)', symbol: 'XAUUSD', flag1: '🥇', flag2: '💵', payout: 86, category: 'COMMODITIES' },
];

interface Trade {
  id: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  amount: number;
  strikePrice: number;
  payoutRate: number;
  payoutAmount: number;
  remainingSeconds: number;
  totalSeconds: number;
  status: 'OPEN' | 'WIN' | 'LOSS';
  createdAt: string;
}

export default function TerminalPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [assetOpen, setAssetOpen] = useState(false);
  const [balanceType, setBalanceType] = useState<'DEMO' | 'REAL'>('DEMO');
  const [balance, setBalance] = useState(10000.00);
  const [amount, setAmount] = useState(10);
  const [seconds, setSeconds] = useState(60);
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [showSMA, setShowSMA] = useState(true);
  const [activeTab, setActiveTab] = useState<'trade' | 'history'>('trade');
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [livePrice, setLivePrice] = useState<number>(1.08500);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const handlePriceTick = useCallback((price: number) => {
    setLivePrice(price);
  }, []);

  // Timer engine for active trades
  useState(() => {
    const timer = setInterval(() => {
      setActiveTrades((prevTrades) => {
        const nextTrades: Trade[] = [];

        prevTrades.forEach((trade) => {
          if (trade.remainingSeconds <= 1) {
            const isWin = trade.direction === 'BUY' 
              ? livePrice >= trade.strikePrice 
              : livePrice <= trade.strikePrice;

            const resolvedTrade: Trade = {
              ...trade,
              remainingSeconds: 0,
              status: isWin ? 'WIN' : 'LOSS',
            };

            if (isWin) {
              setBalance((prev) => prev + trade.payoutAmount);
              setNotification({ msg: `WIN +$${trade.payoutAmount.toFixed(2)} at ${livePrice}!`, type: 'success' });
            } else {
              setNotification({ msg: `Trade Expired (LOSS) -$${trade.amount.toFixed(2)}`, type: 'error' });
            }

            setTimeout(() => setNotification(null), 3500);
            setClosedTrades((history) => [resolvedTrade, ...history]);
          } else {
            nextTrades.push({
              ...trade,
              remainingSeconds: trade.remainingSeconds - 1,
            });
          }
        });

        return nextTrades;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const handlePlaceTrade = (direction: 'BUY' | 'SELL') => {
    if (balance < amount) {
      setNotification({ msg: 'Insufficient balance!', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setBalance((prev) => prev - amount);

    const payoutAmount = Number((amount * (1 + selectedAsset.payout / 100)).toFixed(2));

    const newTrade: Trade = {
      id: Math.random().toString(36).substring(2, 9),
      assetName: selectedAsset.name,
      direction,
      amount,
      strikePrice: livePrice,
      payoutRate: selectedAsset.payout,
      payoutAmount,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      status: 'OPEN',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setActiveTrades((prev) => [newTrade, ...prev]);
    setNotification({ msg: `${direction} order opened @ ${livePrice}`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const profit = (amount * selectedAsset.payout / 100).toFixed(2);
  const estimatedPayout = (amount * (1 + selectedAsset.payout / 100)).toFixed(2);

  return (
    <div className="flex h-screen w-screen bg-[#0b0f14] text-white font-sans overflow-hidden select-none text-[13px] relative">

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border shadow-2xl font-bold flex items-center gap-2 transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-[#14261d] border-[#22c55e] text-[#22c55e]' : 'bg-[#2b1618] border-[#ef4444] text-[#ef4444]'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-[56px] bg-[#0f141b] border-r border-[#1a2030] flex flex-col items-center py-3 z-30 shrink-0">
        <a href="/" className="w-9 h-9 rounded-lg bg-[#b6ff3b] flex items-center justify-center mb-6 hover:scale-105 transition shadow-[0_0_15px_rgba(182,255,59,0.4)]">
          <span className="text-black font-black text-lg leading-none">×</span>
        </a>

        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => setActiveTab('trade')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              activeTab === 'trade' ? 'bg-[#1a2332] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white hover:bg-[#151b26]'
            }`}
          >
            <BarChart2 size={18} strokeWidth={1.75} />
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'history' ? 'trade' : 'history')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition relative ${
              activeTab === 'history' ? 'bg-[#1a2332] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white hover:bg-[#151b26]'
            }`}
          >
            <History size={18} strokeWidth={1.75} />
            {activeTrades.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#b6ff3b] text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                {activeTrades.length}
              </span>
            )}
          </button>

          {[
            { icon: Wallet, id: 'wallet' },
            { icon: User, id: 'profile' },
            { icon: MessageCircle, id: 'chat' },
            { icon: HelpCircle, id: 'help' },
          ].map(({ icon: Icon, id }) => (
            <button key={id} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26] transition">
              <Icon size={18} strokeWidth={1.75} />
            </button>
          ))}
        </nav>

        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26] transition">
          <Settings size={18} strokeWidth={1.75} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP HEADER */}
        <header className="h-12 bg-[#0f141b] border-b border-[#1a2030] px-3 flex items-center justify-between shrink-0 relative z-40">
          <div className="relative">
            <button
              onClick={() => setAssetOpen(!assetOpen)}
              className="flex items-center gap-2.5 bg-[#151b26] hover:bg-[#1a2332] border border-[#1e2636] rounded-lg px-3 h-8 transition"
            >
              <div className="flex -space-x-1">
                <span className="text-xs">{selectedAsset.flag1}</span>
                <span className="text-xs">{selectedAsset.flag2}</span>
              </div>
              <span className="font-semibold text-[13px] tracking-wide">{selectedAsset.name}</span>
              <span className="text-[11px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded">+{selectedAsset.payout}%</span>
              <ChevronDown size={14} className="text-[#6b7280]" />
            </button>

            {assetOpen && (
              <div className="absolute top-10 left-0 w-72 bg-[#0f141b] border border-[#1e2636] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-bold text-[#6b7280] px-2 py-1 uppercase tracking-wider">All Assets & OTC Pairs</div>
                {ASSETS.map((asset) => (
                  <button
                    key={asset.name}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setAssetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                      selectedAsset.name === asset.name ? 'bg-[#1a2332] text-[#b6ff3b]' : 'hover:bg-[#151b26] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{asset.flag1}{asset.flag2}</span>
                      <div>
                        <div className="font-medium text-[12px]">{asset.name}</div>
                        <div className="text-[9px] text-[#6b7280]">{asset.category}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded">+{asset.payout}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 opacity-60">
            <div className="w-5 h-5 rounded bg-[#b6ff3b] flex items-center justify-center">
              <span className="text-black font-black text-xs">×</span>
            </div>
            <span className="text-[11px] font-bold tracking-[0.15em] text-[#b6ff3b]">EXPIRY<span className="text-white">CAPITAL</span></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#151b26] border border-[#1e2636] rounded-lg p-0.5 h-8">
              <button
                onClick={() => setBalanceType('DEMO')}
                className={`px-2.5 rounded-md text-[11px] font-bold transition ${
                  balanceType === 'DEMO' ? 'bg-[#1e2a3a] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white'
                }`}
              >
                DEMO
              </button>
              <button
                onClick={() => setBalanceType('REAL')}
                className={`px-2.5 rounded-md text-[11px] font-bold transition ${
                  balanceType === 'REAL' ? 'bg-[#1e2a3a] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white'
                }`}
              >
                REAL
              </button>
            </div>

            <div className="flex items-center gap-2 bg-[#151b26] border border-[#1e2636] rounded-lg px-3 h-8">
              <span className="text-[11px] text-[#6b7280] uppercase tracking-wider">{balanceType}</span>
              <span className="font-bold text-[#b6ff3b] tabular-nums text-sm">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={() => setBalance(10000)}
              className="h-8 px-3.5 rounded-lg bg-[#b6ff3b] hover:bg-[#c8ff5e] text-black font-bold text-[12px] flex items-center gap-1.5 transition shadow-[0_0_20px_-4px_rgba(182,255,59,0.5)]"
            >
              <Plus size={14} strokeWidth={2.5} />
              RESET
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="flex-1 flex min-h-0 relative">

          {/* TRADES DRAWER */}
          {activeTab === 'history' && (
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-[#0f141b] border-r border-[#1a2030] z-20 flex flex-col p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1a2030] mb-3">
                <span className="font-bold text-sm flex items-center gap-2">
                  <Layers size={16} className="text-[#b6ff3b]" />
                  Your Orders
                </span>
                <span className="text-xs text-[#6b7280]">{activeTrades.length} Open</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Active Trades</div>
                {activeTrades.length === 0 ? (
                  <div className="text-xs text-[#6b7280] py-4 text-center border border-dashed border-[#1a2030] rounded-xl">
                    No active trades right now
                  </div>
                ) : (
                  activeTrades.map((t) => (
                    <div key={t.id} className="bg-[#151b26] border border-[#1e2636] rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{t.assetName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                          t.direction === 'BUY' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                        }`}>
                          {t.direction === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {t.direction} ${t.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6b7280]">
                        <span>Strike: <strong className="text-white font-mono">{t.strikePrice}</strong></span>
                        <span>Timer: <strong className="text-white font-mono">{formatTime(t.remainingSeconds)}</strong></span>
                      </div>
                      <div className="w-full bg-[#1e2636] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#b6ff3b] h-full transition-all duration-1000"
                          style={{ width: `${(t.remainingSeconds / t.totalSeconds) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}

                <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider pt-4">Recent History</div>
                {closedTrades.map((t) => (
                  <div key={t.id} className="bg-[#151b26]/60 border border-[#1e2636]/60 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-gray-300">{t.assetName}</div>
                      <div className="text-[10px] text-[#6b7280]">@ {t.strikePrice}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-xs ${t.status === 'WIN' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {t.status === 'WIN' ? `+$${t.payoutAmount.toFixed(2)}` : `-$${t.amount}`}
                      </div>
                      <div className="text-[9px] font-bold uppercase">{t.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REAL CHART CANVAS & TOOLBAR */}
          <div className="flex-1 relative bg-[#080c11] flex flex-col">
            
            {/* Chart Toolbar (Candlestick / Area + SMA Indicator) */}
            <div className="h-9 border-b border-[#1a2030] px-3 flex items-center gap-2 bg-[#0f141b]/90 z-20">
              <div className="flex bg-[#151b26] border border-[#1e2636] rounded-md p-0.5">
                <button
                  onClick={() => setChartType('candlestick')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                    chartType === 'candlestick' ? 'bg-[#1a2332] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  <Activity size={12} />
                  Candles 🕯️
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                    chartType === 'area' ? 'bg-[#1a2332] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  Area 📈
                </button>
              </div>

              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition flex items-center gap-1.5 ${
                  showSMA ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]' : 'bg-[#151b26] border-[#1e2636] text-[#6b7280] hover:text-white'
                }`}
              >
                <Sliders size={12} />
                SMA 20 Indicator
              </button>
            </div>

            <div className="flex-1 relative">
              <RealChart 
                symbol={selectedAsset.symbol} 
                trades={activeTrades} 
                chartType={chartType} 
                showSMA={showSMA} 
                onPriceTick={handlePriceTick} 
              />

              {/* Price Badge */}
              <div className="absolute top-4 left-4 pointer-events-none z-10 bg-[#0f141b]/90 border border-[#1e2636] rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur">
                <span className="text-[10px] text-[#6b7280] uppercase font-bold tracking-wider block">Live Price</span>
                <span className="font-mono text-xl font-bold text-[#b6ff3b] tabular-nums">{livePrice}</span>
              </div>
            </div>
          </div>

          {/* RIGHT TRADE PANEL */}
          <aside className="w-[280px] bg-[#0f141b] border-l border-[#1a2030] flex flex-col shrink-0">
            <div className="p-4 flex-1 flex flex-col gap-4">

              {/* Expiration */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5 font-medium">
                  Expiration Time
                </div>
                <div className="bg-[#151b26] border border-[#1e2636] rounded-xl h-11 px-3 flex items-center justify-between">
                  <span className="font-mono text-lg font-semibold tabular-nums">{formatTime(seconds)}</span>
                  <Clock size={16} className="text-[#6b7280]" />
                </div>
                <div className="flex gap-1 mt-2">
                  {[30, 60, 120, 300].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeconds(s)}
                      className={`flex-1 h-7 rounded-lg text-[11px] font-medium transition ${
                        seconds === s
                          ? 'bg-[#1a2332] text-[#b6ff3b] border border-[#b6ff3b]/30'
                          : 'bg-[#151b26] text-[#6b7280] border border-transparent hover:text-white'
                      }`}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Amount */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5 font-medium">
                  Investment Amount
                </div>
                <div className="bg-[#151b26] border border-[#1e2636] rounded-xl h-11 px-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                    className="bg-transparent font-mono text-lg font-semibold w-full outline-none tabular-nums"
                  />
                  <span className="text-[#6b7280] font-medium">$</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[5, 10, 25, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`flex-1 h-7 rounded-lg text-[11px] font-medium transition ${
                        amount === v
                          ? 'bg-[#1a2332] text-[#b6ff3b] border border-[#b6ff3b]/30'
                          : 'bg-[#151b26] text-[#6b7280] border border-transparent hover:text-white'
                      }`}
                    >
                      ${v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Card */}
              <div className="bg-gradient-to-b from-[#14201a] to-[#0f1814] border border-[#1e3a2f] rounded-xl p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#4ade80] mb-0.5 font-medium">
                  Payout +{selectedAsset.payout}%
                </div>
                <div className="text-2xl font-bold text-[#4ade80] tabular-nums tracking-tight">
                  +${profit}
                </div>
                <div className="text-[11px] text-[#6b7280] mt-0.5">
                  Total Return <span className="text-white font-medium">${estimatedPayout}</span>
                </div>
              </div>

              <div className="flex-1" />

              {/* BUY / SELL BUTTONS */}
              <div className="space-y-2.5 pb-1">
                <button
                  onClick={() => handlePlaceTrade('BUY')}
                  className="w-full h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(34,197,94,0.45)]"
                >
                  <TrendingUp size={20} strokeWidth={2.5} />
                  BUY / HIGHER
                </button>

                <button
                  onClick={() => handlePlaceTrade('SELL')}
                  className="w-full h-12 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(239,68,68,0.45)]"
                >
                  <TrendingDown size={20} strokeWidth={2.5} />
                  SELL / LOWER
                </button>
              </div>
            </div>

            <div className="h-8 border-t border-[#1a2030] flex items-center justify-center gap-1.5 opacity-30">
              <div className="w-3 h-3 rounded-sm bg-[#b6ff3b] flex items-center justify-center">
                <span className="text-black font-black text-[8px]">×</span>
              </div>
              <span className="text-[9px] font-bold tracking-[0.2em]">EXPIRYCAPITAL</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
