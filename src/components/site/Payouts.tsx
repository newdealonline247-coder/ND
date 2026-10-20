"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import type { BoardEntryDto, PayoutDto } from "@/lib/types";
import { money, timeAgo } from "@/lib/format";
import { Reveal } from "./Reveal";

type PayoutData = { feed: PayoutDto[]; board: BoardEntryDto[] };

export function Payouts() {
  const [data, setData] = useState<PayoutData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/payouts", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d) setData(d);
        })
        .catch(() => {});
    load();
    const iv = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const maxTotal = data?.board[0]?.total ?? 1;

  return (
    <section id="payouts" className="relative scroll-mt-24 overflow-hidden">
      <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-up/6 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
              <span className="live-dot size-2 rounded-full bg-volt" />
              PAYOUT LEDGER — LIVE
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
              Winners get wired.
              <br />
              <span className="text-fog-2">Every single day.</span>
            </h2>
          </div>
          <a
            href="#program"
            className="group inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 font-display text-sm font-bold tracking-wide text-snow transition-colors hover:border-volt/60 hover:text-volt"
          >
            BECOME A PAYOUT
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* feed */}
          <Reveal className="h-full">
            <div className="h-full rounded-3xl border border-line bg-panel/60">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <span className="font-mono text-[10px] font-semibold tracking-[0.24em] text-fog">
                  RECENT PAYOUTS
                </span>
                <span className="font-mono text-[10px] tracking-[0.24em] text-fog-2">
                  AUTO-REFRESH 30S
                </span>
              </div>
              <ul>
                {data === null
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <li
                        key={i}
                        className="flex animate-pulse items-center justify-between border-b border-line/60 px-6 py-4 last:border-none"
                      >
                        <div className="h-4 w-40 rounded bg-line-2/70" />
                        <div className="h-4 w-20 rounded bg-line-2/70" />
                      </li>
                    ))
                  : data.feed.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-4 border-b border-line/60 px-6 py-3.5 transition-colors last:border-none hover:bg-panel"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid w-9 shrink-0 place-items-center rounded-lg border border-line-2 py-1.5 font-mono text-[10px] font-bold text-fog">
                            {p.country}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-snow">
                              {p.trader}
                            </p>
                            <p className="font-mono text-[10px] tracking-[0.08em] text-fog-2">
                              {p.method} · {timeAgo(p.paidAt)}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-bold text-up">
                          +{money(p.amount)}
                        </span>
                      </li>
                    ))}
              </ul>
            </div>
          </Reveal>

          {/* leaderboard */}
          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col rounded-3xl border border-line bg-panel/60">
              <div className="flex items-center gap-2.5 border-b border-line px-6 py-4">
                <Landmark className="size-4 text-volt" />
                <span className="font-mono text-[10px] font-semibold tracking-[0.24em] text-fog">
                  TOP EARNERS · ALL TIME
                </span>
              </div>
              <ul className="flex-1 space-y-1 px-4 py-4">
                {data === null
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <li key={i} className="animate-pulse p-2">
                        <div className="h-9 w-full rounded bg-line-2/60" />
                      </li>
                    ))
                  : data.board.map((entry, i) => (
                      <li key={entry.trader} className="rounded-2xl p-2.5 transition-colors hover:bg-panel">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`font-mono text-xs font-bold ${
                                i === 0 ? "text-volt" : "text-fog-2"
                              }`}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <p className="truncate text-sm font-semibold text-snow">
                              {entry.trader}
                              <span className="ml-2 font-mono text-[10px] font-normal text-fog-2">
                                {entry.country}
                              </span>
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-bold text-snow">
                            {money(entry.total)}
                          </span>
                        </div>
                        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.max(8, (entry.total / maxTotal) * 100)}%`,
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              i === 0
                                ? "bg-volt shadow-[0_0_12px_rgba(182,255,59,0.6)]"
                                : "bg-line-2"
                            }`}
                          />
                        </div>
                      </li>
                    ))}
              </ul>
              <p className="border-t border-line px-6 py-4 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-fog-2">
                FIGURES INCLUDE ALL-TIME SETTLEMENTS ACROSS EVALUATION-DERIVED
                FUNDED ACCOUNTS.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
