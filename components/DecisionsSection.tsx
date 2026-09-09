"use client";

import { useState } from "react";
import { decisions } from "@/architecture/decisions";
import { Section, CodeLink } from "./Shared";

export function DecisionsSection() {
  const [openId, setOpenId] = useState<string>(decisions[0].id);

  return (
    <Section
      id="decisions"
      eyebrow="Architecture Decisions"
      title="Why LivePulse is built this way"
      intro="Every entry below is a real, accepted ADR in the repository — not a retroactive justification. Only decisions that actually exist are shown."
    >
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible scrollbar-thin pb-2 lg:pb-0">
          {decisions.map((d) => (
            <button
              key={d.id}
              onClick={() => setOpenId(d.id)}
              className={`shrink-0 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors ${
                openId === d.id
                  ? "border-accent bg-bg-elevated text-fg"
                  : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              <span className="font-mono-tight text-[10px] text-fg-faint block">{d.number}</span>
              <span className="whitespace-nowrap lg:whitespace-normal">{d.title}</span>
            </button>
          ))}
        </div>

        {decisions
          .filter((d) => d.id === openId)
          .map((d) => (
            <div key={d.id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono-tight text-[11px] text-fg-faint">{d.number}</p>
                  <h3 className="mt-0.5 text-xl font-semibold text-fg">{d.title}</h3>
                </div>
                <CodeLink label="Read the ADR" url={d.adrUrl} />
              </div>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    Problem
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-fg-muted">{d.problem}</dd>
                </div>
                <div>
                  <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    Chosen solution
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-fg-muted">{d.solution}</dd>
                </div>
                <div>
                  <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    Why it was chosen
                  </dt>
                  <dd className="mt-1 text-[14px] leading-relaxed text-fg-muted">{d.why}</dd>
                </div>
                <div>
                  <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    Alternatives considered
                  </dt>
                  <dd className="mt-2 space-y-2">
                    {d.alternatives.map((a, i) => (
                      <div key={i} className="rounded-md border border-border bg-bg-inset px-3 py-2">
                        <p className="text-[13px] font-medium text-fg">{a.option}</p>
                        <p className="mt-0.5 text-[13px] text-fg-muted">{a.rejectedBecause}</p>
                      </div>
                    ))}
                  </dd>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                      Trade-offs
                    </dt>
                    <dd className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
                      {d.tradeoffs.map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-fg-faint">–</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                      Consequences
                    </dt>
                    <dd className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-fg-muted">
                      {d.consequences.map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-fg-faint">–</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          ))}
      </div>
    </Section>
  );
}
