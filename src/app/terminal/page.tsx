'use client';

import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Wallet, User, 
  History, ChevronDown, Plus 
} from 'lucide-react';

export default function TerminalPage() {
  const [balanceType] = useState<'DEMO' | 'REAL'>('DEMO');
  const [balance] = useState(10000);
  const [amount, setAmount] = useState(10);
  const [time] = useState('00:01:00');
  const [symbol] = useState('EUR/USD OTC');
  const [payoutRate] = useState(92);

  const estimatedPayout = (amount * (1 + payoutRate / 100)).toFixed(2);

  return (
    <div className="flex h-screen w-screen bg-[#0e131b] text-white font-sans overflow-hidden select-none">
      <aside className="w-16 border-r border-[#1e2532] bg-[#121824] flex flex-col items-center py-4 space-y-6 z-20">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center font-bold justify-center text-xl text-white">
          PO
        </div>
        <nav className="flex flex-col space-y-4 pt-4 text-gray-400">
          <button className="p-3 hover:bg-[#1a2232] rounded-xl hover:text-white transition">
            <TrendingUp size={20} />
          </button>
          <button className="p-3 hover:bg-[#1a2232] rounded-xl hover:text-white transition">
            <History size={20} />
          </button>
          <button className="p-3 hover:bg-[#1a2232] rounded-xl hover:text-white transition">
            <Wallet size={20} />
          </button>
          <button className="p-3 hover:bg-[#1a2232] rounded-xl hover:text-white transition">
            <User size={20} />
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-[#1e2532] bg-[#121824] px-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3 bg-[#1a2232] px-4 py-2 rounded-xl cursor-pointer border border-[#263147] hover:border-blue-500 transition">
            <span className="w-6 h-4 bg-blue-500 rounded-sm text-[10px] font-bold flex items-center justify-center">🇪🇺🇺🇸</span>
            <span className="font-semibold text-sm">{symbol}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-[#1a2232] px-4 py-1.5 rounded-xl border border-[#263147] flex items-center space-x-3">
              <span className="text-xs text-gray-400">{balanceType}</span>
              <span className="font-bold text-green-400 text-lg">${balance.toLocaleString()}</span>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold flex items-center space-x-2 transition shadow-lg shadow-emerald-900/40">
              <Plus size={18} />
              <span>TOP UP</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex relative">
          <div className="flex-1 bg-[#090d14] relative p-4 flex flex-col justify-center items-center">
            <div className="absolute top-6 left-6 z-10 bg-[#121824]/80 backdrop-blur border border-[#1e2532] px-4 py-2 rounded-xl">
              <span className="text-xs text-gray-400 block">Current Price</span>
              <span className="text-2xl font-mono font-bold text-green-400">1.13662</span>
            </div>

            <div className="text-gray-600 text-center">
              <div className="animate-pulse text-lg font-mono">Chart Canvas (Connecting TradingView Engine...)</div>
            </div>
          </div>

          <aside className="w-80 border-l border-[#1e2532] bg-[#121824] p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-medium">Expiration Time</label>
                <div className="bg-[#1a2232] border border-[#263147] rounded-xl p-3 flex items-center justify-between">
                  <span className="font-mono text-xl font-bold">{time}</span>
                  <Clock size={18} className="text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2 font-medium">Investment Amount ($)</label>
                <div className="bg-[#1a2232] border border-[#263147] rounded-xl p-3 flex items-center justify-between">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="bg-transparent font-mono text-xl font-bold w-full outline-none text-white"
                  />
                  <span className="text-gray-400 font-bold">$</span>
                </div>
              </div>

              <div className="bg-[#17221e] border border-emerald-900/50 rounded-xl p-4 text-center">
                <span className="text-xs text-emerald-400 block font-semibold">Payout (+{payoutRate}%)</span>
                <span className="text-2xl font-bold text-emerald-400">${estimatedPayout}</span>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/50">
                <TrendingUp size={24} />
                <span>HIGHER / BUY</span>
              </button>

              <button className="w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-extrabold text-xl py-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-rose-950/50">
                <TrendingDown size={24} />
                <span>LOWER / SELL</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
