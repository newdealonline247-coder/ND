"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Program", href: "#program" },
  { label: "How it works", href: "#how" },
  { label: "Rules", href: "#rules" },
  { label: "Payouts", href: "#payouts" },
  { label: "FAQ", href: "#faq" },
];

function LogoMark() {
  return (
    <span className="relative flex size-9 items-center justify-center rounded-xl bg-volt shadow-[0_0_24px_rgba(182,255,59,0.35)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4L12 9L17 4" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 20L12 15L17 20" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Expiry Capital home">
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-tight">
            EXPIRY<span className="text-volt">CAPITAL</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-fog transition-colors hover:text-snow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#demo"
            className="rounded-full border border-line-2 px-5 py-2.5 text-sm font-semibold text-snow transition-colors hover:border-volt/50 hover:text-volt"
          >
            Try the terminal
          </a>
          <a
            href="#program"
            className="group inline-flex items-center gap-1.5 rounded-full bg-volt px-5 py-2.5 text-sm font-bold text-ink transition-all hover:shadow-[0_0_32px_rgba(182,255,59,0.45)]"
          >
            Get funded
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-xl border border-line-2 text-snow lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-line bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-fog transition-colors hover:bg-panel hover:text-snow"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#program"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-volt px-5 py-3.5 text-sm font-bold text-ink"
              >
                Get funded <ArrowUpRight className="size-4" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
