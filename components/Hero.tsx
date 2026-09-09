import { LIVEPULSE_REPO, LIVEPULSE_LIVE_URL, LIVEPULSE_OPS_URL } from "@/architecture/github";

const navLinks = [
  { href: "#diagram", label: "Architecture" },
  { href: "#decisions", label: "Decisions" },
  { href: "#comparisons", label: "Why Not?" },
  { href: "#scaling", label: "Scaling" },
  { href: "#failure", label: "Under Failure" },
  { href: "#timeline", label: "Evolution" },
  { href: "#principles", label: "Principles" },
];

export function Hero() {
  return (
    <header className="border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <span className="font-mono-tight text-sm font-medium text-fg">
          LivePulse <span className="text-fg-faint">/ Architecture Lab</span>
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-fg-muted">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-fg transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href={LIVEPULSE_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-3 py-1.5 hover:border-border-strong hover:text-fg transition-colors"
          >
            Source ↗
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <p className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
          Portfolio engineering &mdash; companion to LivePulse
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl font-semibold tracking-tight text-fg">
          LivePulse Architecture Lab
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-[17px] leading-relaxed text-fg-muted">
          An interactive exploration of the architecture, trade-offs, scaling strategy, and
          failure modes behind{" "}
          <a href={LIVEPULSE_LIVE_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-border-strong underline-offset-2 hover:text-fg">
            LivePulse
          </a>
          , a real-time sports intelligence platform. Every claim here traces to a real file,
          ADR, or incident in the LivePulse repository — nothing on this page is invented.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
          <span className="badge badge-current">Current Architecture — what&rsquo;s actually running</span>
          <span className="badge badge-projection">Production-Scale Projection — designed, not built</span>
          <span className="badge" style={{ color: "var(--fg-muted)" }}>
            Alternative Designs — what I&rsquo;d choose differently, and when
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={LIVEPULSE_LIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-[var(--accent-fg)] hover:opacity-90 transition-opacity"
          >
            View live LivePulse ↗
          </a>
          <a
            href={LIVEPULSE_OPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-[13px] font-medium text-fg hover:border-border-strong transition-colors"
          >
            Live ops dashboard ↗
          </a>
        </div>
      </div>
    </header>
  );
}
