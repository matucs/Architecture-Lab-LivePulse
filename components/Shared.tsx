import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  wide,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className={`mx-auto ${wide ? "max-w-7xl" : "max-w-6xl"} px-6 py-16 scroll-mt-16`}>
      <div className="mb-8 max-w-3xl">
        <p className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {intro && <div className="mt-3 text-[15px] leading-relaxed text-fg-muted">{intro}</div>}
      </div>
      {children}
    </section>
  );
}

export function ModeBadge({ kind }: { kind: "measured" | "projection" | "current" }) {
  const label =
    kind === "measured" ? "Measured" : kind === "projection" ? "Architecture projection" : "Current";
  const cls =
    kind === "measured" ? "badge-measured" : kind === "projection" ? "badge-projection" : "badge-current";
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function CodeLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono-tight text-[11px] text-fg-muted hover:border-border-strong hover:text-fg transition-colors"
    >
      {label}
      <span aria-hidden="true" className="text-fg-faint">
        ↗
      </span>
    </a>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="text-[14px] leading-relaxed text-fg-muted">{children}</div>;
}
