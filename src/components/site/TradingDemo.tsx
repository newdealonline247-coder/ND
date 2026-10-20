"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ASSETS = [
  { symbol: "BTC/USD", base: 128_450, sigma: 46, decimals: 0 },
  { symbol: "ETH/USD", base: 6_842, sigma: 2.4, decimals: 1 },
  { symbol: "EUR/USD", base: 1.0842, sigma: 0.00022, decimals: 4 },
  { symbol: "XAU/USD", base: 3_112.4, sigma: 0.62, decimals: 1 },
] as const;

const AMOUNTS = [10, 25, 50, 100, 250];
const EXPIRIES = [
  { label: "30s", secs: 30 },
  { label: "1m", secs: 60 },
  { label: "5m", secs: 300 },
];
const PAYOUT = 0.9;
const START_BALANCE = 10_000;
const MAX_POINTS = 150;
const STEP_MS = 150;

type Direction = 1 | -1;

type ActiveTrade = {
  dir: Direction;
  strike: number;
  amount: number;
  endsAt: number;
  durationMs: number;
  expiryLabel: string;
};

type HistoryItem = {
  id: number;
  asset: string;
  dir: Direction;
  amount: number;
  delta: number;
  result: "win" | "loss" | "tie";
};

function formatPrice(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function buildSeries(base: number, sigma: number): number[] {
  let p = base;
  const arr: number[] = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    p += (Math.random() - 0.5) * 2 * sigma + (base - p) * 0.01;
    arr.push(p);
  }
  return arr;
}

export function TradingDemo() {
  const [assetIdx, setAssetIdx] = useState(0);
  const [amountIdx, setAmountIdx] = useState(2);
  const [expiryIdx, setExpiryIdx] = useState(0);
  const [balance, setBalance] = useState(START_BALANCE);
  const [active, setActive] = useState<ActiveTrade | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<HistoryItem | null>(null);
  const [lastDir, setLastDir] = useState<Direction>(1);
  const [tick, setTick] = useState(0);

  const asset = ASSETS[assetIdx];
  const seriesRef = useRef<number[]>(null);
  if (seriesRef.current === null) {
    seriesRef.current = Array(MAX_POINTS).fill(asset.base);
  }
  const idRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Seed walk + run the price engine.
  useEffect(() => {
    seriesRef.current = buildSeries(asset.base, asset.sigma);
    const iv = setInterval(() => {
      const series = seriesRef.current!;
      const last = series[series.length - 1];
      const shock = (Math.random() - 0.5) * 2 * asset.sigma;
      const trend = (Math.random() - 0.5) * asset.sigma * 0.6;
      const reversion = (asset.base - last) * 0.004;
      const next = Math.max(last + shock + trend + reversion, asset.base * 0.2);
      series.push(next);
      if (series.length > MAX_POINTS) series.shift();
      setLastDir(next >= last ? 1 : -1);
      setTick((t) => t + 1);
    }, STEP_MS);
    return () => clearInterval(iv);
  }, [assetIdx, asset.base, asset.sigma]);

  // Settle expired trades.
  useEffect(() => {
    if (!active) return;
    if (Date.now() < active.endsAt) return;

    const series = seriesRef.current!;
    const final = series[series.length - 1];
    const won =
      active.dir === 1 ? final > active.strike : final < active.strike;
    const tie = final === active.strike;

    let delta: number;
    if (tie) {
      delta = 0;
    } else if (won) {
      delta = Math.round(active.amount * PAYOUT * 100) / 100;
    } else {
      delta = -active.amount;
    }

    const credit = tie
      ? active.amount
      : won
        ? active.amount + delta
        : 0;

    setBalance((b) => Math.round((b + credit) * 100) / 100);
    idRef.current += 1;
    const item: HistoryItem = {
      id: idRef.current,
      asset: asset.symbol,
      dir: active.dir,
      amount: active.amount,
      delta,
      result: tie ? "tie" : won ? "win" : "loss",
    };
    setHistory((h) => [item, ...h].slice(0, 8));
    setLastResult(item);
    setActive(null);
    const timeout = setTimeout(() => setLastResult(null), 2600);
    return () => clearTimeout(timeout);
  }, [tick, active, asset.symbol]);

  // Paint the chart.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== Math.floor(rect.width * dpr)) {
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const series = seriesRef.current!;
    let min = Math.min(...series);
    let max = Math.max(...series);
    if (active) {
      min = Math.min(min, active.strike);
      max = Math.max(max, active.strike);
    }
    const pad = (max - min) * 0.18 || 1;
    min -= pad;
    max += pad;
    const y = (v: number) => h - ((v - min) / (max - min)) * h;

    // grid
    ctx.strokeStyle = "rgba(142,156,165,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const gy = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // area fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(182,255,59,0.22)");
    grad.addColorStop(1, "rgba(182,255,59,0)");
    ctx.beginPath();
    series.forEach((p, i) => {
      const x = (i / (series.length - 1)) * w;
      if (i === 0) ctx.moveTo(x, y(p));
      else ctx.lineTo(x, y(p));
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    series.forEach((p, i) => {
      const x = (i / (series.length - 1)) * w;
      if (i === 0) ctx.moveTo(x, y(p));
      else ctx.lineTo(x, y(p));
    });
    ctx.strokeStyle = "#b6ff3b";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(182,255,59,0.6)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // strike line
    if (active) {
      const sy = y(active.strike);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(236,244,238,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(236,244,238,0.9)";
      ctx.font = "600 9px 'JetBrains Mono', monospace";
      ctx.fillText("STRIKE", 8, sy - 5);
    }

    // last price dot
    const last = series[series.length - 1];
    const lx = w;
    const ly = y(last);
    ctx.beginPath();
    ctx.arc(lx - 3, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#b6ff3b";
    ctx.shadowColor = "rgba(182,255,59,0.9)";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [tick, active, assetIdx]);

  const series = seriesRef.current;
  const price = series[series.length - 1];
  const open = series[0];
  const changePct = ((price - open) / open) * 100;
  const amount = AMOUNTS[amountIdx];
  const expiry = EXPIRIES[expiryIdx];
  const remaining = active ? Math.max(0, active.endsAt - Date.now()) : 0;
  const progress = active ? remaining / active.durationMs : 0;
  const depleted = balance < AMOUNTS[0];

  const place = (dir: Direction) => {
    if (active || depleted || amount > balance) return;
    const strike = seriesRef.current![seriesRef.current!.length - 1];
    const durationMs = expiry.secs * 1000;
    setBalance((b) => Math.round((b - amount) * 100) / 100);
    setActive({
      dir,
      strike,
      amount,
      endsAt: Date.now() + durationMs,
      durationMs,
      expiryLabel: expiry.label,
    });
  };

  const reset = () => {
    setBalance(START_BALANCE);
    setHistory([]);
    setActive(null);
    setLastResult(null);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line-2 bg-panel/90 shadow-[0_40px_120px_-40px_rgba(182,255,59,0.25)] backdrop-blur-xl">
      {/* top glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-volt/15 blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="live-dot size-2 rounded-full bg-volt" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-fog">
              PRACTICE TERMINAL
            </span>
          </div>
          <span className="rounded-full border border-line-2 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-fog-2">
            SIMULATED FUNDS
          </span>
        </div>

        {/* asset tabs */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-line bg-ink/60 p-1.5">
          {ASSETS.map((a, i) => (
            <button
              key={a.symbol}
              type="button"
              disabled={!!active}
              onClick={() => setAssetIdx(i)}
              className={`rounded-xl px-2 py-2 font-mono text-[11px] font-semibold transition-all disabled:opacity-50 ${
                i === assetIdx
                  ? "bg-volt text-ink shadow-[0_0_18px_rgba(182,255,59,0.3)]"
                  : "text-fog hover:text-snow"
              }`}
            >
              {a.symbol}
            </button>
          ))}
        </div>

        {/* price row */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-mono text-3xl font-bold tracking-tight transition-colors sm:text-4xl ${
                lastDir === 1 ? "text-up" : "text-down"
              }`}
            >
              {formatPrice(price, asset.decimals)}
            </span>
            {lastDir === 1 ? (
              <TrendingUp className="mb-1 size-5 text-up" />
            ) : (
              <TrendingDown className="mb-1 size-5 text-down" />
            )}
          </div>
          <span
            className={`mb-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${
              changePct >= 0 ? "bg-up/10 text-up" : "bg-down/10 text-down"
            }`}
          >
            {changePct >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
        </div>

        {/* chart */}
        <div className="relative mt-3">
          <div className="h-[170px] rounded-2xl border border-line bg-ink/70 sm:h-[190px]">
            <canvas ref={canvasRef} className="h-full w-full rounded-2xl" />
          </div>
          <AnimatePresence>
            {lastResult && (
              <motion.div
                key={lastResult.id}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-6 py-3 text-center backdrop-blur-md ${
                  lastResult.result === "win"
                    ? "border-up/50 bg-up/15 shadow-[0_0_50px_rgba(43,217,138,0.35)]"
                    : lastResult.result === "loss"
                      ? "border-down/50 bg-down/15 shadow-[0_0_50px_rgba(255,77,103,0.35)]"
                      : "border-line-2 bg-panel/90"
                }`}
              >
                <p
                  className={`font-mono text-2xl font-bold ${
                    lastResult.result === "win"
                      ? "text-up"
                      : lastResult.result === "loss"
                        ? "text-down"
                        : "text-snow"
                  }`}
                >
                  {lastResult.result === "win" && "+"}
                  {lastResult.delta.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-0.5 font-mono text-[10px] tracking-[0.25em] text-fog">
                  {lastResult.result === "win"
                    ? "IN THE MONEY"
                    : lastResult.result === "loss"
                      ? "OUT OF THE MONEY"
                      : "AT THE MONEY · STAKE RETURNED"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* stake + expiry */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-fog-2">
              STAKE
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AMOUNTS.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  disabled={!!active || a > balance}
                  onClick={() => setAmountIdx(i)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-[12px] font-semibold transition-all disabled:opacity-40 ${
                    i === amountIdx
                      ? "bg-snow text-ink"
                      : "border border-line-2 text-fog hover:border-fog hover:text-snow"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-fog-2">
              EXPIRY · <span className="text-volt">PAYOUT 90%</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXPIRIES.map((e, i) => (
                <button
                  key={e.label}
                  type="button"
                  disabled={!!active}
                  onClick={() => setExpiryIdx(i)}
                  className={`rounded-lg px-3.5 py-1.5 font-mono text-[12px] font-semibold transition-all disabled:opacity-40 ${
                    i === expiryIdx
                      ? "bg-snow text-ink"
                      : "border border-line-2 text-fog hover:border-fog hover:text-snow"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* call / put or countdown */}
        <div className="mt-4">
          {active ? (
            <div className="flex items-center gap-4 rounded-2xl border border-line-2 bg-ink/70 px-5 py-4">
              <div
                className="relative grid size-14 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(${
                    active.dir === 1 ? "#2bd98a" : "#ff4d67"
                  } ${progress * 360}deg, rgba(255,255,255,0.08) 0deg)`,
                }}
              >
                <div className="grid size-11 place-items-center rounded-full bg-ink">
                  <span className="font-mono text-[11px] font-bold text-snow">
                    {(remaining / 1000).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <p
                  className={`font-display text-sm font-bold tracking-wide ${
                    active.dir === 1 ? "text-up" : "text-down"
                  }`}
                >
                  {active.dir === 1 ? "CALL · HIGHER" : "PUT · LOWER"} · $
                  {active.amount}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-fog">
                  Strike {formatPrice(active.strike, asset.decimals)} · Expires
                  in {active.expiryLabel}
                </p>
              </div>
            </div>
          ) : depleted ? (
            <button
              type="button"
              onClick={reset}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-volt/40 bg-volt/10 font-display text-sm font-bold tracking-wide text-volt transition-colors hover:bg-volt/20"
            >
              <RotateCcw className="size-4" />
              DEMO FUNDS DEPLETED — RESET $10,000
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => place(1)}
                className="group flex h-16 items-center justify-center gap-2 rounded-2xl bg-up font-display text-base font-bold tracking-wide text-[#03130b] transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(43,217,138,0.5)] active:scale-[0.98]"
              >
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                CALL
              </button>
              <button
                type="button"
                onClick={() => place(-1)}
                className="group flex h-16 items-center justify-center gap-2 rounded-2xl bg-down font-display text-base font-bold tracking-wide text-white transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(255,77,103,0.5)] active:scale-[0.98]"
              >
                <ArrowDownRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                PUT
              </button>
            </div>
          )}
        </div>

        {/* footer: balance + history */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.22em] text-fog-2">
                DEMO BALANCE
              </p>
              <p className="font-mono text-lg font-bold text-snow">
                {balance.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset demo balance"
              className="grid size-8 place-items-center rounded-lg border border-line-2 text-fog transition-colors hover:border-volt/50 hover:text-volt"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {history.length === 0 ? (
              <span className="font-mono text-[10px] tracking-[0.15em] text-fog-2">
                NO TRADES YET
              </span>
            ) : (
              history.map((h) => (
                <span
                  key={h.id}
                  className={`rounded-md px-2 py-1 font-mono text-[10px] font-semibold ${
                    h.result === "win"
                      ? "bg-up/10 text-up"
                      : h.result === "loss"
                        ? "bg-down/10 text-down"
                        : "bg-line text-fog"
                  }`}
                >
                  {h.dir === 1 ? "CALL" : "PUT"} ${h.amount}{" "}
                  {h.result === "win" ? `+$${h.delta}` : h.result === "loss" ? `-$${h.amount}` : "±0"}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
