"use client";

import { ArrowRight, BadgeCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { Reveal } from "./Reveal";

export function CtaBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "cta" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong.");
        return;
      }
      setStatus("done");
      setMessage(data?.discount ?? "EXPIRY20");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-volt/30 bg-gradient-to-b from-panel-2 to-ink px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="grid-bg absolute inset-0 opacity-70 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
            <div className="absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-volt/15 blur-[110px]" />

            <div className="relative">
              <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-volt">
                06:41:27 UNTIL YOUR NEXT SESSION
              </p>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
                THE CLOCK IS
                <br />
                <span className="text-volt drop-shadow-[0_0_36px_rgba(182,255,59,0.4)]">
                  YOUR EDGE.
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-fog sm:text-base">
                Join the waitlist for a 20% evaluation discount, weekly payout
                reports and the expiry strategies our funded desk actually
                trades.
              </p>

              {status === "done" ? (
                <div className="mx-auto mt-9 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-up/40 bg-up/10 px-6 py-4">
                  <BadgeCheck className="size-5 shrink-0 text-up" />
                  <p className="text-sm text-snow">
                    You&apos;re in. Use code{" "}
                    <span className="font-mono font-bold text-volt">
                      {message}
                    </span>{" "}
                    at checkout.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={submit}
                  className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="h-13 flex-1 rounded-full border border-line-2 bg-ink/80 px-6 py-3.5 text-sm text-snow placeholder:text-fog-2 transition-colors focus:border-volt/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-volt px-7 py-3.5 font-display text-sm font-bold tracking-wide text-ink transition-all hover:shadow-[0_0_40px_rgba(182,255,59,0.5)] disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        GET 20% OFF
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}
              {status === "error" && (
                <p className="mt-3 text-sm text-down">{message}</p>
              )}

              <p className="mt-6 font-mono text-[10px] tracking-[0.16em] text-fog-2">
                NO SPAM · UNSUBSCRIBE ANYTIME · 38,000+ TRADERS INSIDE
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
