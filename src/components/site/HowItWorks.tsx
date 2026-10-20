import { Banknote, Target, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    num: "01",
    icon: Wallet,
    title: "Pick your size",
    body: "Six account tiers from $5k to $200k. Pay a one-time evaluation fee — refunded in full with your first payout.",
  },
  {
    num: "02",
    icon: Target,
    title: "Beat the gauntlet",
    body: "One phase. Finish 10% in the money while respecting a 5% daily and 10% overall loss limit. Three trading days minimum, zero calendar pressure.",
  },
  {
    num: "03",
    icon: Banknote,
    title: "Trade ours, keep yours",
    body: "Get your funded terminal the same day. Keep up to 90% of everything you make, with payouts processed within 24 hours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
            THE PATH
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            Funded in three moves.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.12} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-3xl border border-line bg-panel/60 p-8 transition-colors duration-300 hover:border-volt/40">
                <span className="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] font-bold leading-none text-outline opacity-60 transition-opacity group-hover:opacity-100">
                  {step.num}
                </span>
                <span className="relative grid size-12 place-items-center rounded-2xl border border-volt/30 bg-volt/10 text-volt">
                  <step.icon className="size-5" />
                </span>
                <h3 className="relative mt-7 font-display text-2xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-fog">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
