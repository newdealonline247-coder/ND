export function Footer() {
  const columns = [
    {
      title: "PROGRAM",
      links: [
        { label: "Challenge tiers", href: "#program" },
        { label: "How it works", href: "#how" },
        { label: "Trading rules", href: "#rules" },
        { label: "Scaling plan", href: "#program" },
      ],
    },
    {
      title: "DESK",
      links: [
        { label: "Payout ledger", href: "#payouts" },
        { label: "Practice terminal", href: "#demo" },
        { label: "FAQ", href: "#faq" },
        { label: "Get funded", href: "#program" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { label: "Terms of service", href: "#" },
        { label: "Privacy policy", href: "#" },
        { label: "Risk disclosure", href: "#" },
        { label: "Refund policy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-line bg-ink-2">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#top" className="flex items-center gap-3">
              <span className="relative flex size-9 items-center justify-center rounded-xl bg-volt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 4L12 9L17 4" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 20L12 15L17 20" stroke="#0a0f04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                EXPIRY<span className="text-volt">CAPITAL</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fog">
              The funding desk built for binary options. Fixed risk, fixed
              reward, real payouts — in minutes, not months.
            </p>
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel px-4 py-2">
              <span className="live-dot size-2 rounded-full bg-up" />
              <span className="font-mono text-[10px] tracking-[0.18em] text-fog">
                TERMINAL STATUS: OPERATIONAL · 12MS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-[10px] font-semibold tracking-[0.26em] text-fog-2">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-fog transition-colors hover:text-volt"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 space-y-4 border-t border-line pt-8">
          <p className="max-w-4xl font-mono text-[10px] leading-relaxed tracking-[0.04em] text-fog-2">
            RISK DISCLOSURE: Expiry Capital provides simulated trading
            evaluations and funded demo accounts with virtual funds. All
            payouts are performance-based rewards for simulated trading
            activity and do not constitute investment returns. Binary options
            trading involves substantial risk and is not suitable for every
            individual. Nothing on this website constitutes financial advice or
            an offer of brokerage services. Services are not offered to
            residents of jurisdictions where binary options are restricted.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-fog-2">
              © 2026 EXPIRY CAPITAL LTD. ALL RIGHTS RESERVED.
            </p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-fog-2">
              BUILT FOR SPEED · 40+ MARKETS · 24H PAYOUTS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
