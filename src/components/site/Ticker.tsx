"use client";

import { useEffect, useState } from "react";

type Instrument = {
  symbol: string;
  price: number;
  change: number;
  decimals: number;
};

const INITIAL: Instrument[] = [
  { symbol: "BTC/USD", price: 128_450, change: 2.41, decimals: 0 },
  { symbol: "ETH/USD", price: 6_842.5, change: 1.87, decimals: 1 },
  { symbol: "EUR/USD", price: 1.0842, change: -0.12, decimals: 4 },
  { symbol: "GBP/USD", price: 1.2671, change: 0.08, decimals: 4 },
  { symbol: "XAU/USD", price: 3_112.4, change: 0.94, decimals: 1 },
  { symbol: "US30", price: 44_820, change: -0.36, decimals: 0 },
  { symbol: "NAS100", price: 21_406, change: 1.12, decimals: 0 },
  { symbol: "SOL/USD", price: 218.6, change: 3.05, decimals: 1 },
  { symbol: "USD/JPY", price: 149.32, change: -0.21, decimals: 2 },
  { symbol: "USOIL", price: 78.44, change: 0.67, decimals: 2 },
];

function Row({ items, hidden }: { items: Instrument[]; hidden?: boolean }) {
  return (
    <div className="flex w-max shrink-0 items-center" aria-hidden={hidden}>
      {items.map((it) => (
        <div
          key={`${it.symbol}-${hidden ? "b" : "a"}`}
          className="flex items-center gap-3 border-r border-line px-7 py-3.5"
        >
          <span className="font-mono text-xs font-bold tracking-wide text-snow">
            {it.symbol}
          </span>
          <span className="font-mono text-xs text-fog">
            {it.price.toLocaleString("en-US", {
              minimumFractionDigits: it.decimals,
              maximumFractionDigits: it.decimals,
            })}
          </span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              it.change >= 0 ? "text-up" : "text-down"
            }`}
          >
            {it.change >= 0 ? "+" : ""}
            {it.change.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function Ticker() {
  const [items, setItems] = useState(INITIAL);

  useEffect(() => {
    const iv = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          const drift = (Math.random() - 0.5) * 0.12;
          const change = Math.max(-9, Math.min(9, it.change + drift));
          return {
            ...it,
            change,
            price: it.price * (1 + drift / 1000),
          };
        }),
      );
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative border-y border-line bg-panel/50">
      <div className="mask-x overflow-hidden">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          <Row items={items} />
          <Row items={items} hidden />
        </div>
      </div>
    </div>
  );
}
