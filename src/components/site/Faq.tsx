"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    q: "What exactly is Expiry Capital?",
    a: "A proprietary funding desk built exclusively for binary options. You prove your edge on an evaluation account; we fund you with a simulated capital account and pay you real performance rewards of up to 90% of the profit you generate. No deposits, no brokerage risk — your only cost is a one-time, refundable evaluation fee.",
  },
  {
    q: "How does the evaluation work?",
    a: "One phase. Reach a 10% profit target while keeping equity above a 5% daily loss and 10% overall loss limit, across at least 3 trading days. There is no time limit — most traders pass within two weeks, some within a single session. Credentials arrive instantly after checkout.",
  },
  {
    q: "When and how do I get paid?",
    a: "Your first payout unlocks 7–14 days after funding depending on your tier, then on demand every two weeks — or weekly on Master and Apex. We settle in USDT, BTC, bank wire or Skrill within 24 hours; 92% of payouts land in under 12 hours.",
  },
  {
    q: "What markets and expiries can I trade?",
    a: "40+ instruments: major and minor FX pairs, BTC, ETH and SOL trading 24/7, indices (US30, NAS100, DAX) and metals. Expiries run from 30 seconds to end-of-day, with contract payouts up to 95% on flagship pairs.",
  },
  {
    q: "Is my own money at risk?",
    a: "Beyond the one-time evaluation fee, no. All accounts are simulated environments with virtual funds — you can never lose more than the fee, and that fee is refunded in full with your first payout. There are no margin calls, no deposits and no hidden subscriptions.",
  },
  {
    q: "Can I use signals, EAs or trade the news?",
    a: "Yes to all three. News trading, signal services and automation are welcome. The only prohibitions are account sharing, latency or pricing-feed arbitrage, and copy-trading mirrored across multiple funded accounts.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        open ? "border-volt/40 bg-panel" : "border-line bg-panel/50 hover:border-line-2"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-base font-bold tracking-tight text-snow sm:text-lg">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={`grid size-8 shrink-0 place-items-center rounded-full border ${
            open ? "border-volt bg-volt text-ink" : "border-line-2 text-fog"
          }`}
        >
          <Plus className="size-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.65, 0.26, 0.99] }}
          >
            <p className="px-6 pb-6 text-sm leading-relaxed text-fog">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-24 border-t border-line bg-ink-2">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
              ANSWERS
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
              Asked on every
              <br />
              trading floor.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fog">
              Still stuck on something? Our risk desk answers in under five
              minutes, around the clock, at{" "}
              <span className="font-mono text-volt">desk@expiry.capital</span>.
            </p>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <FaqItem q={f.q} a={f.a} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
