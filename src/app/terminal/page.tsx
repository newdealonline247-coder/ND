'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, TrendingDown, Clock, Wallet, User,
  History, ChevronDown, Plus, Settings, BarChart2,
  MessageCircle, HelpCircle, Volume2, Maximize2
} from 'lucide-react';

const TradingViewChart = dynamic(() => import('@/components/terminal/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[#b6ff3b] font-mono text-sm animate-pulse">
      Loading Real-Time Chart Engine...
    </div>
  ),
});

const ASSETS = [
  { name: 'EUR/USD OTC', symbol: 'FX:EURUSD', flag1: '🇪🇺', flag2: '🇺🇸', payout: 92 },
  { name: 'GBP/USD', symbol: 'FX:GBPUSD', flag1: '🇬🇧', flag2: '🇺🇸', payout: 88 },
  { name: 'BTC/USDT', symbol: 'BINANCE:BTCUSDT', flag1: '₿', flag2: '💵', payout: 90 },
  { name: 'ETH/USDT', symbol: 'BINANCE:ETHUSDT', flag1: 'Ξ', flag2: '💵', payout: 85 },
  { name: 'GOLD (XAUUSD)', symbol: 'TVC:GOLD', flag1: '🥇', flag2: '💵', payout: 89 },
];

export default function TerminalPage() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [assetOpen, setAssetOpen] = useState(false);
  const [balanceType, setBalanceType] = useState<'DEMO' | 'REAL'>('DEMO');
  const [balance] = useState(10000.00);
  const [amount, setAmount] = useState(10);
  const [seconds, setSeconds] = useState(60);
  const [activeTab, setActiveTab] = useState('trade');

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `00:${m}:${sec}`;
  };

  const profit = (amount * selectedAsset.payout / 100).toFixed(2);
  const estimatedPayout = (amount * (1 + selectedAsset.payout / 100)).toFixed(2);

  return (
    <div className="flex h-screen w-screen bg-[#0b0f14] text-white font-sans overflow-hidden select-none text-[13px]">

      {/* ══════ LEFT SIDEBAR ══════ */}
      <aside className="w-[56px] bg-[#0f141b] border-r border-[#1a2030] flex flex-col items-center py-3 z-30">
        <a href="/" className="w-9 h-9 rounded-lg bg-[#b6ff3b] flex items-center justify-center mb-6 hover:scale-105 transition shadow-[0_0_15px_rgba(182,255,59,0.4)]">
          <span className="text-black font-black text-lg leading-none">×</span>
        </a>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { icon: BarChart2, id: 'trade' },
            { icon: History, id: 'history' },
            { icon: Wallet, id: 'wallet' },
            { icon: User, id: 'profile' },
            { icon: MessageCircle, id: 'chat' },
            { icon: HelpCircle, id: 'help' },
          ].map(({ icon: Icon, id }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                activeTab === id
                  ? 'bg-[#1a2332] text-[#b6ff3b]'
                  : 'text-[#6b7280] hover:text-white hover:bg-[#151b26]'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
          ))}
        </nav>

        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26] transition">
          <Settings size={18} strokeWidth={1.75} />
        </button>
      </aside>

      {/* ══════ MAIN ══════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOP HEADER ── */}
        <header className="h-12 bg-[#0f141b] border-b border-[#1a2030] px-3 flex items-center justify-between shrink-0 relative z-40">
          
          {/* Asset Dropdown Selector */}
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
              <div className="absolute top-10 left-0 w-64 bg-[#0f141b] border border-[#1e2636] rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
                {ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setAssetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition ${
                      selectedAsset.symbol === asset.symbol ? 'bg-[#1a2332] text-[#b6ff3b]' : 'hover:bg-[#151b26] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{asset.flag1}{asset.flag2}</span>
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#22c55e]">+{asset.payout}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logo Title */}
          <div className="hidden md:flex items-center gap-1.5 opacity-60">
            <div className="w-5 h-5 rounded bg-[#b6ff3b] flex items-center justify-center">
              <span className="text-black font-black text-xs">×</span>
            </div>
            <span className="text-[11px] font-bold tracking-[0.15em] text-[#b6ff3b]">EXPIRY<span className="text-white">CAPITAL</span></span>
          </div>

          {/* Balance Controls */}
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
              <span className="font-bold text-[#b6ff3b] tabular-nums">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button className="h-8 px-3.5 rounded-lg bg-[#b6ff3b] hover:bg-[#c8ff5e] text-black font-bold text-[12px] flex items-center gap-1.5 transition shadow-[0_0_20px_-4px_rgba(182,255,59,0.5)]">
              <Plus size={14} strokeWidth={2.5} />
              TOP UP
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="flex-1 flex min-h-0">

          {/* REAL TRADINGVIEW CHART CANVAS */}
          <div className="flex-1 relative bg-[#080c11]">
            <TradingViewChart symbol={selectedAsset.symbol} />
          </div>

          {/* ══════ RIGHT TRADE PANEL ══════ */}
          <aside className="w-[280px] bg-[#0f141b] border-l border-[#1a2030] flex flex-col shrink-0">
            <div className="p-4 flex-1 flex flex-col gap-4">

              {/* Expiration */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1.5 font-medium">
                  Expiration time
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

              {/* Amount */}
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
                  Total return <span className="text-white font-medium">${estimatedPayout}</span>
                </div>
              </div>

              <div className="flex-1" />

              {/* BUY / SELL */}
              <div className="space-y-2.5 pb-1">
                <button className="w-full h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(34,197,94,0.45)]">
                  <TrendingUp size={20} strokeWidth={2.5} />
                  BUY / HIGHER
                </button>
                <button className="w-full h-12 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(239,68,68,0.45)]">
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
