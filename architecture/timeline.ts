import { repoFile, repoCommit } from "./github";

export interface TimelineEntry {
  id: string;
  phase: string;
  title: string;
  status: "done" | "deprioritized";
  summary: string;
  link?: { label: string; url: string };
}

// Sourced from README.md's "Project status" section (phases built in order,
// later phases not started until earlier ones are real and working) plus
// the git history's own commit sequence.
export const timeline: TimelineEntry[] = [
  {
    id: "phase-1",
    phase: "Phase 1",
    title: "Research",
    status: "done",
    summary: "Provider comparison across API-Football, football-data.org, TheSportsDB, Sportmonks, and unofficial aggregators; terms/limits review; ADR-001.",
    link: { label: "Provider research", url: repoFile("docs/research/sports-api-comparison.md") },
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    title: "Architecture",
    status: "done",
    summary: "Domain model, Kafka topics, DB schema, caching strategy, WebSocket design, deployment architecture — ADR-002 through ADR-008.",
    link: { label: "architecture.md", url: repoFile("docs/architecture.md") },
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    title: "MVP",
    status: "done",
    summary: "Ingestion → PostgreSQL → Redis → Next.js, validated against real API-Football and football-data.org keys, not just fixture-based unit tests.",
  },
  {
    id: "phase-4",
    phase: "Phase 4",
    title: "Kafka",
    status: "done",
    summary: "Domain events, consumers, topics — real Kafka locally via Docker Compose, verified against real match data flowing through all 4 consumer groups.",
    link: { label: "ADR-003 Phase 4 addendum", url: repoFile("docs/adr/ADR-003-kafka-architecture.md") },
  },
  {
    id: "phase-5",
    phase: "Phase 5",
    title: "WebSockets",
    status: "done",
    summary: "Real-time browser updates — a real goal and several real halftime events flowed automatically end to end with no manual intervention.",
    link: { label: "ADR-006 Phase 5 note", url: repoFile("docs/adr/ADR-006-websocket-architecture.md") },
  },
  {
    id: "phase-6",
    phase: "Phase 6",
    title: "Observability",
    status: "done",
    summary: "Metrics, logging, tracing — every metric wired to a real call site and verified, including a real ioredis-instrumentation gap found and documented rather than papered over.",
    link: { label: "observability.md", url: repoFile("docs/observability.md") },
  },
  {
    id: "phase-7",
    phase: "Phase 7",
    title: "Testing",
    status: "done",
    summary: "Unit, integration, E2E — real Playwright E2E found and fixed a genuine UX bug and, later, a genuine race-condition flake in CI (the WebSocket subscribe race).",
    link: { label: "CI workflow", url: repoFile(".github/workflows/ci.yml") },
  },
  {
    id: "phase-8",
    phase: "Phase 8",
    title: "AI features",
    status: "deprioritized",
    summary: "Match summaries, analysis, Q&A — intentionally deprioritized; clearly separated from the core pipeline and not part of this Lab's scope.",
  },
  {
    id: "phase-9",
    phase: "Phase 9",
    title: "Deployment",
    status: "done",
    summary: "Portfolio Mode, €0/month — not the way originally planned. Northflank and Render both required a card to deploy a service despite 'no card required' research; fell back to a self-managed Oracle Cloud Always Free VM.",
    link: { label: "ADR-008 addendum", url: repoFile("docs/adr/ADR-008-free-deployment-strategy.md") },
  },
  {
    id: "phase-10",
    phase: "Phase 10",
    title: "Case study",
    status: "done",
    summary: "Final engineering review and self-assessment — every finding traced to a real file, log, or incident, not a generic checklist.",
    link: { label: "engineering-review.md", url: repoFile("docs/engineering-review.md") },
  },
  {
    id: "ws-race-fix",
    phase: "Post-Phase 7",
    title: "CI flake fixed: WebSocket subscribe race",
    status: "done",
    summary: "A real race condition between socket readyState and server-side Redis subscription, found via CI trace analysis, not guessed — fixed by waiting for match:snapshot instead of readyState.",
    link: { label: "Fix commit a72e618", url: repoCommit("a72e618998b3d947609febb9436f7674d00b25a8") },
  },
];
