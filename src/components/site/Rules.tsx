import {
  CalendarDays,
  Check,
  Crosshair,
  Infinity as InfinityIcon,
  Percent,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { Reveal } from "./Reveal";

const RULES = [
  {
    icon: Crosshair,
    value: "10%",
    title: "Profit target",
    body: "Close 10% in the money across your evaluation to unlock funding.",
  },
  {
    icon: CalendarDays,
    value: "3",
    title: "Minimum trading days",
    body: "Prove consistency across three sessions. No deadline attached.",
  },
  {
    icon: ShieldAlert,
    value: "5%",
    title: "Daily loss limit",
    body: "Equity may not drop more than 5% from the day-start balance.",
  },
  {
    icon: TrendingDown,
    value: "10%",
    title: "Maximum loss",
    body: "A static drawdown floor measured from your starting balance.",
  },
  {
    icon: Percent,
    value: "95%",
    title: "Top contract payout",
    body: "Premium strike pricing across 40+ currency, crypto and index markets.",
  },
  {
    icon: InfinityIcon,
    value: "∞",
    title: "No time limit",
    body: "Binary speed without calendar pressure. Trade only when it is clean.",
  },
];

const PERKS = [
  "News trading allowed",
  "Weekend crypto markets",
  "EAs & signals welcome",
  "Fee refunded at first payout",
];

export function Rules() {
  return (
    <section id="rules" className="relative scroll-mt-24 border-y border-line bg-ink-2">
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
              THE GAUNTLET
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
              Simple rules.
              <br />
              Serious capital.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-fog">
            One evaluation phase with transparent risk limits. Break a rule and
            you can restart at a discount — no hidden clauses, ever.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((rule, i) => (
            <Reveal key={rule.title} delay={(i % 3) * 0.1}>
              <div className="h-full rounded-3xl border border-line bg-panel/70 p-7 transition-colors duration-300 hover:border-volt/40">
                <div className="flex items-start justify-between">
                  <p className="font-mono text-4xl font-bold tracking-tight text-snow">
                    {rule.value}
                  </p>
                  <span className="grid size-10 place-items-center rounded-xl border border-line-2 bg-ink text-volt">
                    <rule.icon className="size-4.5" />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
                  {rule.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">
                  {rule.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-3xl border border-line bg-panel/50 px-7 py-5">
            {PERKS.map((perk) => (
              <span
                key={perk}
                className="inline-flex items-center gap-2 text-sm font-medium text-fog"
              >
                <Check className="size-4 text-volt" />
                {perk}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
