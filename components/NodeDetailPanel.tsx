import type { ArchComponent } from "@/architecture/components";
import { CodeLink } from "./Shared";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
        {title}
      </p>
      <div className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{children}</div>
    </div>
  );
}

export function NodeDetailPanel({
  component,
  onClose,
}: {
  component: ArchComponent;
  onClose: () => void;
}) {
  return (
    <div className="max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono-tight text-[10px] uppercase tracking-widest text-fg-faint">
            {component.category}
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-fg">{component.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-[11px] text-fg-faint hover:text-fg"
        >
          Close
        </button>
      </div>

      <Block title="Purpose">{component.purpose}</Block>
      <Block title="Why">{component.why}</Block>
      <Block title="Trade-offs">
        <ul className="space-y-1.5">
          {component.tradeoffs.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-fg-faint">–</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Block>
      <Block title="Failure mode">{component.failureMode}</Block>
      <Block title="Scaling">{component.scaling}</Block>
      <Block title="Code references">
        <div className="flex flex-wrap gap-1.5">
          {component.codeRefs.map((ref) => (
            <CodeLink key={ref.url} label={ref.label} url={ref.url} />
          ))}
        </div>
      </Block>
    </div>
  );
}
