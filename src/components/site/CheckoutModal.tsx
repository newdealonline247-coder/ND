"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Copy,
  Loader2,
  Lock,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { OrderResult, PlanDto } from "@/lib/types";
import { money } from "@/lib/format";

const COUNTRIES = [
  "United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands",
  "Belgium", "Switzerland", "Austria", "Poland", "Romania", "Bulgaria",
  "Estonia", "Sweden", "Norway", "Denmark", "Finland", "Portugal",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Nigeria", "Kenya",
  "South Africa", "Egypt", "Brazil", "Argentina", "Colombia", "Mexico",
  "India", "Pakistan", "Indonesia", "Vietnam", "Thailand", "Malaysia",
  "Philippines", "Japan", "South Korea", "Australia", "New Zealand",
  "Turkey", "Ukraine", "Serbia", "Georgia",
];

type Props = {
  plan: PlanDto;
  onClose: () => void;
};

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink/70 px-4 py-3">
      <div className="min-w-0">
        <p className="font-mono text-[9px] tracking-[0.22em] text-fog-2">
          {label}
        </p>
        <p className="truncate font-mono text-sm font-semibold text-snow">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="grid size-8 shrink-0 place-items-center rounded-lg border border-line-2 text-fog transition-colors hover:border-volt/50 hover:text-volt"
      >
        {copied ? <Check className="size-3.5 text-up" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

export function CheckoutModal({ plan, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan.slug,
          firstName,
          lastName,
          email,
          country,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data.order as OrderResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line-2 bg-ink/70 px-4 py-3 text-sm text-snow placeholder:text-fog-2 transition-colors focus:border-volt/60 focus:outline-none";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Checkout for the ${plan.name} challenge`}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-line-2 bg-panel shadow-[0_60px_160px_-40px_rgba(182,255,59,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-volt/12 blur-3xl" />

        <div className="relative flex items-start justify-between border-b border-line p-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.24em] text-fog-2">
              {result ? "ORDER CONFIRMED" : "SECURE CHECKOUT"}
            </p>
            <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight">
              {result ? "You're in the arena." : `${plan.name} · ${money(plan.accountSize)}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="grid size-9 place-items-center rounded-xl border border-line-2 text-fog transition-colors hover:border-fog hover:text-snow"
          >
            <X className="size-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-up/30 bg-up/10 px-4 py-3.5">
                <BadgeCheck className="size-5 shrink-0 text-up" />
                <p className="text-sm text-snow">
                  Evaluation activated for{" "}
                  <span className="font-semibold">{result.email}</span>
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <CopyRow label="ORDER REFERENCE" value={result.ref} />
                <CopyRow label="TERMINAL LOGIN" value={result.platformLogin} />
                <CopyRow label="TERMINAL PASSWORD" value={result.platformPassword} />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-ink/60 px-4 py-3.5">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-volt" />
                <p className="text-xs leading-relaxed text-fog">
                  Save your credentials — they&apos;re shown once. A copy was
                  sent to your inbox. Demo checkout: no payment was processed.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-volt py-3.5 font-display text-sm font-bold tracking-wide text-ink transition-all hover:shadow-[0_0_36px_rgba(182,255,59,0.45)]"
              >
                DONE
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={submit}
              className="relative space-y-4 p-6"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="co-first" className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-fog-2">
                    FIRST NAME
                  </label>
                  <input
                    id="co-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ada"
                    className={inputCls}
                    maxLength={60}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="co-last" className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-fog-2">
                    LAST NAME
                  </label>
                  <input
                    id="co-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Okafor"
                    className={inputCls}
                    maxLength={60}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="co-email" className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-fog-2">
                  EMAIL
                </label>
                <input
                  id="co-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label htmlFor="co-country" className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-fog-2">
                  COUNTRY
                </label>
                <select
                  id="co-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`${inputCls} appearance-none ${country ? "" : "text-fog-2"}`}
                  required
                >
                  <option value="" disabled>
                    Select your country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-panel text-snow">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="rounded-xl border border-down/40 bg-down/10 px-4 py-3 text-sm text-down">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between rounded-xl border border-line bg-ink/60 px-4 py-3">
                <span className="text-sm text-fog">
                  Evaluation fee{" "}
                  <span className="font-mono text-[10px] text-fog-2">
                    (REFUNDABLE)
                  </span>
                </span>
                <span className="font-mono text-lg font-bold text-snow">
                  {money(plan.price)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-volt py-3.5 font-display text-sm font-bold tracking-wide text-ink transition-all hover:shadow-[0_0_36px_rgba(182,255,59,0.45)] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    ACTIVATING…
                  </>
                ) : (
                  <>ACTIVATE EVALUATION — {money(plan.price)}</>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-center font-mono text-[10px] tracking-[0.08em] text-fog-2">
                <Lock className="size-3" />
                DEMO CHECKOUT — NO CARD REQUIRED · 256-BIT TLS
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
