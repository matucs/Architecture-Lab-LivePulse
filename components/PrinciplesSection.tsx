import { principles } from "@/architecture/principles";
import { Section } from "./Shared";

export function PrinciplesSection() {
  return (
    <Section
      id="principles"
      eyebrow="Architecture Principles"
      title="Engineering principles demonstrated by LivePulse"
      intro="Only principles that are actually supported by the real project — each paired with the concrete evidence behind it."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {principles.map((p, i) => (
          <div key={p.id} className="card p-4">
            <div className="flex gap-3">
              <span className="font-mono-tight text-[11px] text-fg-faint pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[14px] font-medium leading-snug text-fg">{p.statement}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">{p.evidence}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
