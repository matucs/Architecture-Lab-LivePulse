"use client";

import { useState } from "react";
import { incidents } from "@/architecture/incidents";
import { Section, CodeLink } from "./Shared";

function IncidentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
        {title}
      </p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">{children}</p>
    </div>
  );
}

export function IncidentSection() {
  const featured = incidents.find((i) => i.featured)!;
  const rest = incidents.filter((i) => !i.featured);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Section
      id="failure"
      eyebrow="Architecture Under Failure"
      title="Real incidents, not theoretical failure modes"
      intro="Debugging under real conditions demonstrates architectural understanding more than any diagram — these are documented, real bugs found while building and testing LivePulse."
    >
      <div className="card p-6 border-l-4" style={{ borderLeftColor: "var(--danger)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="badge" style={{ color: "var(--danger)", background: "var(--danger-bg)" }}>
            Featured incident — {featured.date}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-fg">{featured.title}</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <IncidentBlock title="Failure">{featured.failure}</IncidentBlock>
          <IncidentBlock title="Detection">{featured.detection}</IncidentBlock>
          <IncidentBlock title="Root cause">{featured.rootCause}</IncidentBlock>
          <IncidentBlock title="Fix">{featured.fix}</IncidentBlock>
          <IncidentBlock title="Verification">{featured.verification}</IncidentBlock>
          <div className="rounded-lg border border-border bg-bg-inset p-3">
            <p className="font-mono-tight text-[10px] uppercase tracking-widest text-accent">
              Engineering lesson
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-fg">{featured.lesson}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {featured.links.map((l) => (
            <CodeLink key={l.url} label={l.label} url={l.url} />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rest.map((inc) => (
          <div key={inc.id} className="card overflow-hidden">
            <button
              onClick={() => setOpenId(openId === inc.id ? null : inc.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div>
                <span className="font-mono-tight text-[11px] text-fg-faint mr-2">{inc.date}</span>
                <span className="text-[14px] font-medium text-fg">{inc.title}</span>
              </div>
              <span className="text-fg-faint text-sm">{openId === inc.id ? "−" : "+"}</span>
            </button>
            {openId === inc.id && (
              <div className="border-t border-border px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <IncidentBlock title="Failure">{inc.failure}</IncidentBlock>
                  <IncidentBlock title="Detection">{inc.detection}</IncidentBlock>
                  <IncidentBlock title="Root cause">{inc.rootCause}</IncidentBlock>
                  <IncidentBlock title="Fix">{inc.fix}</IncidentBlock>
                  <IncidentBlock title="Verification">{inc.verification}</IncidentBlock>
                  <IncidentBlock title="Engineering lesson">{inc.lesson}</IncidentBlock>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {inc.links.map((l) => (
                    <CodeLink key={l.url} label={l.label} url={l.url} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
