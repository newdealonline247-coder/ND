"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Bitcoin } from "lucide-react";
import { HeroChart } from "./HeroChart";
import { TradingDemo } from "./TradingDemo";

const ease = [0.21, 0.65, 0.26, 0.99] as const;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0">
        <HeroChart />
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/3 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-volt/10 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-[150px] sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-[180px]">
        {/* copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <a
              href="#demo"
              className="group inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-panel/70 py-1.5 pl-3 pr-4 backdrop-blur transition-colors hover:border-volt/50"
            >
              <span className="live-dot size-2 rounded-full bg-volt" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-fog group-hover:text-snow">
                PRACTICE TERMINAL LIVE — TRY IT, FREE
              </span>
              <ArrowRight className="size-3.5 text-volt transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-7 font-display text-[clamp(3rem,7.2vw,6rem)] font-bold leading-[0.92] tracking-[-0.035em]"
          >
            TRADE THE
            <br />
            <span className="text-volt drop-shadow-[0_0_30px_rgba(182,255,59,0.35)]">
              CLOCK.
            </span>{" "}
            OWN
            <br />
            THE PAYOUT.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-fog sm:text-lg"
          >
            Expiry Capital funds binary options traders with accounts up to{" "}
            <span className="font-semibold text-snow">$200,000</span>. One
            evaluation, no time limits, and up to{" "}
            <span className="font-semibold text-snow">90% profit split</span> —
            settled within 24 hours. Your edge, our capital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#program"
              className="group inline-flex items-center gap-2 rounded-full bg-volt px-7 py-4 font-display text-sm font-bold tracking-wide text-ink transition-all hover:shadow-[0_0_44px_rgba(182,255,59,0.5)]"
            >
              START THE CHALLENGE
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-7 py-4 font-display text-sm font-bold tracking-wide text-snow transition-colors hover:border-volt/60 hover:text-volt"
            >
              HOW IT WORKS
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.36 }}
            className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5"
          >
            {[
              ["$200k", "MAX FUNDING"],
              ["90%", "PROFIT SPLIT"],
              ["24h", "PAYOUT SETTLEMENT"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-mono text-xl font-bold text-snow">{v}</dd>
                <dd className="mt-1 font-mono text-[10px] tracking-[0.22em] text-fog-2">
                  {l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* terminal */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="relative scroll-mt-28"
        >
          <TradingDemo />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 -top-5 hidden items-center gap-3 rounded-2xl border border-line-2 bg-panel/95 px-4 py-3 shadow-2xl backdrop-blur md:flex"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-up/15 text-up">
              <BadgeCheck className="size-4.5" />
            </span>
            <div>
              <p className="font-mono text-sm font-bold text-snow">
                +$18,420.00
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-fog-2">
                PAID OUT · 2H AGO
              </p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
            className="absolute -bottom-5 -right-3 hidden items-center gap-3 rounded-2xl border border-line-2 bg-panel/95 px-4 py-3 shadow-2xl backdrop-blur md:flex"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-volt/15 text-volt">
              <Bitcoin className="size-4.5" />
            </span>
            <div>
              <p className="font-mono text-sm font-bold text-snow">BTC/USD</p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-up">
                +2.41% TODAY
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
