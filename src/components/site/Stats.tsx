"use client";

import { useEffect, useState } from "react";
import type { StatsDto } from "@/lib/types";
import { compactMoney, formatNumber } from "@/lib/format";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

const FALLBACK: StatsDto = {
  traders: 38_412,
  paidOut: 12_645_000,
  countries: 189,
  avgPayoutHours: 9.4,
};

export function Stats() {
  const [stats, setStats] = useState<StatsDto>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.stats) setStats(data.stats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const cells: Array<{
    label: string;
    value: number;
    format: (n: number) => string;
  }> = [
    {
      label: "TRADERS FUNDED",
      value: stats.traders,
      format: (n) => `${formatNumber(n)}+`,
    },
    {
      label: "PAID OUT TO TRADERS",
      value: stats.paidOut,
      format: (n) => `${compactMoney(n)}+`,
    },
    {
      label: "COUNTRIES",
      value: stats.countries,
      format: (n) => `${n}`,
    },
    {
      label: "AVG. PAYOUT TIME",
      value: Math.round(stats.avgPayoutHours * 10),
      format: (n) => `${(n / 10).toFixed(1)}h`,
    },
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-panel/60 lg:grid-cols-4">
            {cells.map((cell, i) => (
              <div
                key={cell.label}
                className={`p-7 sm:p-9 ${i > 0 ? "border-l border-line max-lg:[&:nth-child(3)]:border-l-0" : ""} max-lg:[&:nth-child(n+3)]:border-t max-lg:[&:nth-child(n+3)]:border-line`}
              >
                <p className="font-mono text-3xl font-bold tracking-tight text-snow sm:text-4xl">
                  <CountUp value={cell.value} format={cell.format} />
                </p>
                <p className="mt-2 font-mono text-[10px] tracking-[0.24em] text-fog-2">
                  {cell.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
