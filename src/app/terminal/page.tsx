'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Clock, Wallet, User,
  History, ChevronDown, Plus, Settings, BarChart2,
  MessageCircle, HelpCircle, Volume2, Maximize2
} from 'lucide-react';

export default function TerminalPage() {
  const [balanceType, setBalanceType] = useState<'DEMO' | 'REAL'>('DEMO');
  const [balance, setBalance] = useState(10000.00);
  const [amount, setAmount] = useState(6);
  const [seconds, setSeconds] = useState(120);
  const [symbol, setSymbol] = useState('EUR/USD OTC');
  const [payoutRate] = useState(92);
  const [price, setPrice] = useState(1.13662);
  const [activeTab, setActiveTab] = useState('trade');

  // Fake live price tick
  useEffect(() => {
    const t = setInterval(() => {
      setPrice(p => +(p + (Math.random() - 0.5) * 0.00015).toFixed(5));
    }, 800);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `00:${m}:${sec}`;
  };

  const estimatedPayout = (amount * (1 + payoutRate / 100)).toFixed(2);
  const profit = (amount * payoutRate / 100).toFixed(2);

  return (
    <div className="flex h-screen w-screen bg-[#0b0f14] text-white font-sans overflow-hidden select-none text-[13px]">

      {/* ══════ LEFT SIDEBAR ══════ */}
      <aside className="w-[56px] bg-[#0f141b] border-r border-[#1a2030] flex flex-col items-center py-3 z-30">
        {/* Logo */}
        <a href="/" className="w-9 h-9 rounded-lg bg-[#b6ff3b] flex items-center justify-center mb-6 hover:scale-105 transition">
          <span className="text-black font-black text-lg leading-none">×</span>
        </a>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { icon: BarChart2, id: 'trade', tip: 'Trade' },
            { icon: History, id: 'history', tip: 'History' },
            { icon: Wallet, id: 'wallet', tip: 'Wallet' },
            { icon: User, id: 'profile', tip: 'Profile' },
            { icon: MessageCircle, id: 'chat', tip: 'Support' },
            { icon: HelpCircle, id: 'help', tip: 'Help' },
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

        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26] transition mb-1">
          <Settings size={18} strokeWidth={1.75} />
        </button>
      </aside>

      {/* ══════ MAIN ══════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOP BAR ── */}
        <header className="h-12 bg-[#0f141b] border-b border-[#1a2030] px-3 flex items-center justify-between shrink-0">
          {/* Pair selector */}
          <button className="flex items-center gap-2.5 bg-[#151b26] hover:bg-[#1a2332] border border-[#1e2636] rounded-lg px-3 h-8 transition group">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#3b82f6] border border-[#0f141b] text-[8px] flex items-center justify-center">€</span>
              <span className="w-4 h-4 rounded-full bg-[#22c55e] border border-[#0f141b] text-[8px] flex items-center justify-center">$</span>
            </div>
            <span className="font-semibold text-[13px] tracking-wide">{symbol}</span>
            <ChevronDown size={14} className="text-[#6b7280] group-hover:text-white" />
          </button>

          {/* Center brand (subtle) */}
          <div className="hidden md:flex items-center gap-1.5 opacity-40">
            <div className="w-5 h-5 rounded bg-[#b6ff3b] flex items-center justify-center">
              <span className="text-black font-black text-xs">×</span>
            </div>
            <span className="text-[11px] font-bold tracking-[0.15em] text-[#b6ff3b]">EXPIRY<span className="text-white">CAPITAL</span></span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Account type toggle */}
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

            {/* Balance */}
            <div className="flex items-center gap-2 bg-[#151b26] border border-[#1e2636] rounded-lg px-3 h-8">
              <span className="text-[11px] text-[#6b7280] uppercase tracking-wider">{balanceType}</span>
              <span className="font-bold text-[#b6ff3b] tabular-nums">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Top Up */}
            <button className="h-8 px-3.5 rounded-lg bg-[#b6ff3b] hover:bg-[#c8ff5e] text-black font-bold text-[12px] flex items-center gap-1.5 transition shadow-[0_0_20px_-4px_rgba(182,255,59,0.5)]">
              <Plus size={14} strokeWidth={2.5} />
              TOP UP
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="flex-1 flex min-h-0">

          {/* CHART AREA */}
          <div className="flex-1 relative bg-[#080c11] flex flex-col">
            {/* Chart toolbar */}
            <div className="h-9 border-b border-[#141a24] px-3 flex items-center gap-1 bg-[#0b0f14]/80">
              {['1m', '2m', '5m', '15m', '30m', '1h'].map((tf, i) => (
                <button
                  key={tf}
                  className={`h-6 px-2 rounded text-[11px] font-medium transition ${
                    i === 1 ? 'bg-[#1a2332] text-[#b6ff3b]' : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
              <div className="flex-1" />
              <button className="w-7 h-7 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26]">
                <Volume2 size={14} />
              </button>
              <button className="w-7 h-7 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#151b26]">
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Chart canvas placeholder */}
            <div className="flex-1 relative overflow-hidden">
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #ffffff 1px, transparent 1px),
                    linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                  `,
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Price badge */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="bg-[#0f141b]/90 backdrop-blur border border-[#1e2636] rounded-lg px-3 py-1.5">
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Live Price</div>
                  <div className="font-mono text-xl font-bold text-[#b6ff3b] tabular-nums tracking-tight">
                    {price.toFixed(5)}
                  </div>
                </div>
              </div>

              {/* Fake candlestick visual */}
              <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-16 pb-16 pt-20">
                {Array.from({ length: 48 }).map((_, i) => {
                  const h = 20 + Math.sin(i * 0.4) * 30 + Math.random() * 40;
                  const up = Math.random() > 0.45;
                  return (
                    <div key={i} className="flex flex-col items-center justify-end" style={{ height: '100%' }}>
                      <div
                        className={`w-[3px] rounded-sm ${up ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}
                        style={{ height: `${h}%`, opacity: 0.35 + (i / 48) * 0.5 }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Current price line */}
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#b6ff3b]/40 flex items-center">
                <div className="ml-auto mr-4 -mt-3 bg-[#b6ff3b] text-black text-[11px] font-bold px-2 py-0.5 rounded">
                  {price.toFixed(5)}
                </div>
              </div>

              {/* Brand watermark */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 opacity-20">
                <div className="w-4 h-4 rounded bg-[#b6ff3b] flex items-center justify-center">
                  <span className="text-black font-black text-[10px]">×</span>
                </div>
                <span className="text-[10px] font-bold tracking-widest">EXPIRYCAPITAL</span>
              </div>
            </div>
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
                {/* quick time chips */}
                <div className="flex gap-1 mt-2">
                  {[60, 120, 300, 900].map((s) => (
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
                  Amount
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
                  {[1, 5, 10, 25, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className={`flex-1 h-7 rounded-lg text-[11px] font-medium transition ${
                        amount === v
                          ? 'bg-[#1a2332] text-[#b6ff3b] border border-[#b6ff3b]/30'
                          : 'bg-[#151b26] text-[#6b7280] border border-transparent hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout card */}
              <div className="bg-gradient-to-b from-[#14201a] to-[#0f1814] border border-[#1e3a2f] rounded-xl p-3.5 text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#4ade80] mb-0.5 font-medium">
                  Payout +{payoutRate}%
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
                <button
                  className="w-full h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(34,197,94,0.45)]"
                >
                  <TrendingUp size={20} strokeWidth={2.5} />
                  BUY
                </button>
                <button
                  className="w-full h-12 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] active:scale-[0.98] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-[0_8px_24px_-6px_rgba(239,68,68,0.45)]"
                >
                  <TrendingDown size={20} strokeWidth={2.5} />
                  SELL
                </button>
              </div>
            </div>

            {/* Footer micro brand */}
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
