import Image from "next/image";
import { Check, Timer } from "lucide-react";
import { Reveal } from "./Reveal";

const POINTS = [
  "One phase — no multi-step maze designed to fail you",
  "Proof-first payouts, published ledger, 24h settlement",
  "Risk rules written for binary speed, not borrowed from FX props",
];

export function Manifesto() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-volt/8 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
              MANIFESTO
            </p>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
              We don&apos;t sell dreams.
              <br />
              <span className="text-volt">We underwrite discipline.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-fog">
              Binary options are the purest expression of a trading edge: fixed
              risk, fixed reward, and a verdict in minutes. Most firms fear that
              speed. We built an entire funding desk around it — pro-grade
              expiry pricing, a terminal that never lags, and a risk desk that
              pays winners fast instead of finding excuses.
            </p>
            <ul className="mt-8 space-y-3.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-snow">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                    <Check className="size-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-line-2 shadow-[0_40px_120px_-40px_rgba(182,255,59,0.2)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/images/desk.jpg"
                    alt="Expiry Capital trading desk at night"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
                </div>
                <div className="absolute bottom-5 left-5 font-mono text-[10px] tracking-[0.24em] text-fog">
                  EXPIRY DESK — LONDON · 02:14 GMT
                </div>
              </div>

              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-line-2 bg-panel/95 px-5 py-4 shadow-2xl backdrop-blur sm:-left-8">
                <span className="grid size-10 place-items-center rounded-xl bg-volt/15 text-volt">
                  <Timer className="size-5" />
                </span>
                <div>
                  <p className="font-mono text-sm font-bold text-snow">92%</p>
                  <p className="max-w-[180px] font-mono text-[10px] leading-snug tracking-[0.08em] text-fog-2">
                    OF PAYOUTS PROCESSED IN UNDER 12 HOURS
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
