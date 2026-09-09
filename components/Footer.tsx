import { LIVEPULSE_REPO } from "@/architecture/github";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 text-[13px] text-fg-faint">
        <p>
          LivePulse Architecture Lab is a portfolio companion to{" "}
          <a href={LIVEPULSE_REPO} target="_blank" rel="noopener noreferrer" className="text-fg-muted hover:text-fg underline underline-offset-2">
            github.com/matucs/LivePulse
          </a>
          . Every architectural claim, component, decision, comparison, and incident on this page
          traces to a real file, ADR, or commit in that repository — no invented metrics,
          technologies, or capabilities.
        </p>
        <p className="mt-2">
          Current architecture and production-scale projections are labeled explicitly and never
          conflated.
        </p>
      </div>
    </footer>
  );
}
