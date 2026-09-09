import { scalingStages, scalingSourceLinks } from "@/architecture/scaling";
import { metrics } from "@/architecture/metrics";
import { Section, ModeBadge, CodeLink } from "./Shared";

export function ScalingSection() {
  return (
    <Section
      id="scaling"
      eyebrow="How I Would Scale This"
      title="Scaling architecture: current → production projection"
      intro={
        <>
          Not a benchmark, and no invented performance numbers. Stage 1 is what&rsquo;s actually
          deployed; Stages 2 and 3 are labeled, honest architecture projections.
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {scalingStages.map((s) => (
          <div key={s.id} className="card p-5 flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
                {s.stage}
              </p>
              <ModeBadge kind={s.kind === "current" ? "current" : "projection"} />
            </div>
            <h3 className="mt-1.5 text-[15px] font-semibold text-fg">{s.label}</h3>
            <p className="mt-2.5 text-[13px] leading-relaxed text-fg-muted flex-1">
              {s.description}
            </p>
            <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
              {s.components.map((c, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] text-fg-muted">
                  <span className="text-fg-faint">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {scalingSourceLinks.map((l) => (
          <CodeLink key={l.url} label={l.label} url={l.url} />
        ))}
      </div>

      <div className="mt-12">
        <p className="font-mono-tight text-xs uppercase tracking-widest text-fg-faint mb-4">
          Measured vs Projected
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {metrics.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-medium text-fg">{m.label}</p>
                <ModeBadge kind={m.kind} />
              </div>
              <p className="mt-1.5 font-mono-tight text-[14px] text-fg">{m.value}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-fg-faint">{m.source}</p>
              {m.sourceLink && (
                <div className="mt-2">
                  <CodeLink label={m.sourceLink.label} url={m.sourceLink.url} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
