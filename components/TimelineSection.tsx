import { timeline } from "@/architecture/timeline";
import { Section, CodeLink } from "./Shared";

export function TimelineSection() {
  return (
    <Section
      id="timeline"
      eyebrow="Architecture Evolution"
      title="Built in phases, in order"
      intro="Later phases weren't started until earlier ones were real and working, not simulated — sourced from README.md's project status and real commit history."
    >
      <ol className="relative border-l border-border pl-6 space-y-6">
        {timeline.map((t) => (
          <li key={t.id} className="relative">
            <span
              className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-bg"
              style={{
                background: t.status === "done" ? "var(--accent)" : "var(--fg-faint)",
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-tight text-[11px] text-fg-faint">{t.phase}</span>
              <span className="text-[15px] font-medium text-fg">{t.title}</span>
              {t.status === "deprioritized" && (
                <span className="badge" style={{ color: "var(--fg-faint)" }}>
                  Deprioritized
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">
              {t.summary}
            </p>
            {t.link && (
              <div className="mt-2">
                <CodeLink label={t.link.label} url={t.link.url} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
