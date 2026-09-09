"use client";

import { useState } from "react";
import { comparisons } from "@/architecture/comparisons";
import { Section } from "./Shared";

export function ComparisonsSection() {
  const [openId, setOpenId] = useState<string>(comparisons[0].id);
  const active = comparisons.find((c) => c.id === openId)!;

  return (
    <Section
      id="comparisons"
      eyebrow='"Why Not?" Comparisons'
      title="Architecture alternatives, honestly compared"
      intro="What LivePulse currently does, versus what I would choose at a different scale or requirement — never presented as the same thing."
    >
      <div className="flex flex-wrap gap-2 mb-5">
        {comparisons.map((c) => (
          <button
            key={c.id}
            onClick={() => setOpenId(c.id)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              openId === c.id
                ? "border-accent bg-bg-elevated text-fg"
                : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="card p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[420px] border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-border pb-2 text-left font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    Dimension
                  </th>
                  <th className="border-b border-border pb-2 text-left font-mono-tight text-[10px] uppercase tracking-widest text-accent">
                    {active.optionALabel}
                  </th>
                  <th className="border-b border-border pb-2 text-left font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                    {active.optionBLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {active.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="border-b border-border py-2.5 pr-3 align-top font-medium text-fg">
                      {r.dimension}
                    </td>
                    <td className="border-b border-border py-2.5 pr-3 align-top text-fg-muted">
                      {r.optionA}
                    </td>
                    <td className="border-b border-border py-2.5 align-top text-fg-muted">
                      {r.optionB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-bg-inset p-4">
              <p className="font-mono-tight text-[10px] uppercase tracking-widest text-accent">
                What LivePulse currently does
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg">{active.currentReality}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                When I&rsquo;d choose each
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">
                {active.whenIdChooseEach}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
