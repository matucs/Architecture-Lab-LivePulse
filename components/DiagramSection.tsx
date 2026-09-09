import { Section } from "./Shared";
import { ArchitectureDiagram } from "./ArchitectureDiagram";

export function DiagramSection() {
  return (
    <Section
      id="diagram"
      wide
      eyebrow="Actual Current Architecture"
      title="The architecture that actually exists"
      intro="Derived from the real system diagram in docs/architecture.md and the actual module boundaries in the codebase — not a generic event-driven-architecture template."
    >
      <ArchitectureDiagram />
    </Section>
  );
}
