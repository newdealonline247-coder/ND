"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Flame, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PlanDto } from "@/lib/types";
import { money } from "@/lib/format";
import { CheckoutModal } from "./CheckoutModal";
import { Reveal } from "./Reveal";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-line bg-panel/50 p-7">
      <div className="h-4 w-24 rounded bg-line-2" />
      <div className="mt-5 h-9 w-36 rounded bg-line-2" />
      <div className="mt-2 h-3 w-20 rounded bg-line-2" />
      <div className="mt-7 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3.5 w-full rounded bg-line-2/70" />
        ))}
      </div>
      <div className="mt-8 h-11 w-full rounded-full bg-line-2" />
    </div>
  );
}

function PlanCard({
  plan,
  onSelect,
}: {
  plan: PlanDto;
  onSelect: (plan: PlanDto) => void;
}) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300 ${
        plan.popular
          ? "border-volt/60 bg-panel shadow-[0_0_70px_-18px_rgba(182,255,59,0.4)] lg:-translate-y-3"
          : "border-line bg-panel/60 hover:border-line-2"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-volt px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] text-ink">
          <Flame className="size-3" />
          MOST FUNDED
        </span>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono text-[11px] font-semibold tracking-[0.26em] text-fog">
            {plan.name.toUpperCase()}
          </h3>
          <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-snow">
            {money(plan.accountSize)}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-fog-2">
            ACCOUNT SIZE
          </p>
        </div>
        <span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1.5 font-mono text-[11px] font-bold text-volt">
          {plan.profitSplit}% SPLIT
        </span>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2 border-y border-line py-4">
        {[
          [`${plan.profitTargetPct}%`, "TARGET"],
          [`${plan.dailyLossPct}%`, "DAILY"],
          [`${plan.maxLossPct}%`, "MAX"],
          [`${plan.minTradingDays}d`, "MIN"],
        ].map(([v, l]) => (
          <div key={l} className="text-center">
            <p className="font-mono text-sm font-bold text-snow">{v}</p>
            <p className="mt-0.5 font-mono text-[8px] tracking-[0.16em] text-fog-2">
              {l}
            </p>
          </div>
        ))}
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] text-fog">
            <Check className="mt-0.5 size-3.5 shrink-0 text-volt" />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        className={`group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-display text-sm font-bold tracking-wide transition-all ${
          plan.popular
            ? "bg-volt text-ink hover:shadow-[0_0_36px_rgba(182,255,59,0.5)]"
            : "border border-line-2 text-snow hover:border-volt/60 hover:text-volt"
        }`}
      >
        START FOR {money(plan.price)}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

export function Plans() {
  const [plans, setPlans] = useState<PlanDto[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<PlanDto | null>(null);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/plans", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setPlans(data.plans))
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section id="program" className="relative scroll-mt-24">
      <div className="absolute left-1/2 top-0 h-72 w-[50rem] -translate-x-1/2 rounded-full bg-volt/6 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
              THE PROGRAM
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
              Pick your size.
              <br />
              <span className="text-fog-2">Scale to seven figures.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-fog">
            Every tier is a one-phase evaluation with the same transparent
            rules. Pass once and trade a funded account for life, with scaling
            every quarter you stay sharp.
          </p>
        </Reveal>

        {error ? (
          <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-down/30 bg-down/5 p-12 text-center">
            <p className="text-sm text-fog">
              Couldn&apos;t load challenge plans. Check your connection and try
              again.
            </p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-2.5 text-sm font-semibold text-snow transition-colors hover:border-volt/50 hover:text-volt"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {plans === null
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : plans.map((plan, i) => (
                  <Reveal key={plan.slug} delay={(i % 3) * 0.08} className="h-full">
                    <PlanCard plan={plan} onSelect={setSelected} />
                  </Reveal>
                ))}
          </div>
        )}

        <Reveal delay={0.1}>
          <p className="mt-10 text-center font-mono text-[11px] tracking-[0.14em] text-fog-2">
            ALL FEES ARE ONE-TIME AND REFUNDED WITH YOUR FIRST PAYOUT · NO
            RECURRING SUBSCRIPTIONS
          </p>
        </Reveal>
      </div>

      <AnimatePresence>
        {selected && (
          <CheckoutModal plan={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
