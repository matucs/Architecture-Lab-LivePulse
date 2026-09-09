import { repoFile } from "./github";

export interface ScalingStage {
  id: string;
  stage: string;
  label: string;
  kind: "current" | "projection";
  description: string;
  components: string[];
  sourceNote?: string;
}

export const scalingStages: ScalingStage[] = [
  {
    id: "stage-1",
    stage: "Stage 1",
    label: "Current Architecture",
    kind: "current",
    description:
      "Portfolio Mode, as actually deployed at €0/month: ingestion, API, and WebSocket gateway run as one Node process on a single Oracle Cloud Always Free VM. Neon Postgres (scale-to-zero) and Upstash Redis are the managed free-tier stores. The event bus runs as Redis Streams, not Kafka, in this deployment. This is the architecture that is actually running right now, not a design sketch.",
    components: [
      "1 backend process (ingestion + API + WS gateway)",
      "Neon Postgres (single instance, scale-to-zero)",
      "Upstash Redis (single instance, 256MB free tier)",
      "Redis Streams as EventBus",
      "1 WebSocket gateway instance (500 connection cap)",
      "Vercel-hosted Next.js frontend",
    ],
    sourceNote: "ADR-008's Portfolio Mode topology, and its 2026-09-09 addendum on what actually happened deploying it.",
  },
  {
    id: "stage-2",
    stage: "Stage 2",
    label: "Higher Traffic",
    kind: "projection",
    description:
      "Architecture projection — not built, not measured. The first moves as real traffic grows: split the single process into separate ingestion / API / WebSocket-gateway deployables (the module boundaries already exist), run more than one backend instance behind a load balancer, and move the event bus transport to managed Kafka via the existing EVENT_BUS_DRIVER config flag — no code change required for that swap.",
    components: [
      "Ingestion, API, and WS gateway split into separate services",
      "Multiple backend API instances behind a load balancer",
      "EVENT_BUS_DRIVER=kafka against a managed Kafka tier",
      "Shared Redis (still one logical instance) reused across instances",
      "Multiple WebSocket gateway instances (Redis pub/sub fan-out already supports this)",
    ],
    sourceNote: "scalability.md's 'What actually changes' table — every row here maps to a named row there.",
  },
  {
    id: "stage-3",
    stage: "Stage 3",
    label: "Large Scale",
    kind: "projection",
    description:
      "Production-scale architectural projection. A load balancer in front of N API instances; Kafka with partition counts sized to measured throughput (not the current placeholder of 6); consumer groups scaled independently per concern; a clustered/managed Redis; PostgreSQL read replicas for read-heavy queries (standings, historical match lists) while writes stay on the primary; and dedicated, horizontally-scaled WebSocket gateway instances behind sticky-session routing.",
    components: [
      "Load balancer",
      "API × N instances",
      "Kafka cluster (managed, partitions sized to measured throughput)",
      "Consumer groups × N (independently scaled per concern)",
      "Redis cluster",
      "PostgreSQL with read replicas",
      "Dedicated WebSocket gateway instances behind sticky-session routing",
      "Background workers",
    ],
    sourceNote:
      "ADR-008's documented (not built) Production Mode topology. No performance numbers are claimed for this stage — nothing at this scale has been measured.",
  },
];

export const scalingSourceLinks = [
  { label: "ADR-008: Free deployment strategy", url: repoFile("docs/adr/ADR-008-free-deployment-strategy.md") },
  { label: "scalability.md", url: repoFile("docs/scalability.md") },
];
