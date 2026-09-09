export interface Principle {
  id: string;
  statement: string;
  evidence: string;
}

export const principles: Principle[] = [
  {
    id: "separate-polling-from-processing",
    statement: "Separate external polling from internal event-driven processing.",
    evidence:
      "Ingestion is its own service, isolated from the API the browser talks to, so the provider's rate limits and downtime never reach the client directly (ADR-002, ADR-007).",
  },
  {
    id: "detect-before-publish",
    statement: "Detect changes before publishing events.",
    evidence:
      "The Change Detector sits between ingestion and the event bus specifically so the same poll response, read ten times, produces at most one event — a property covered by a dedicated unit test, not just a design intent.",
  },
  {
    id: "durable-state-in-postgres",
    statement: "Keep durable state in PostgreSQL, independent of the event pipeline's health.",
    evidence:
      "PostgreSQL is written synchronously by ingestion itself, not only by downstream consumers — durable history never depends on Kafka or Redis being up (ADR-005).",
  },
  {
    id: "redis-for-speed-not-correctness",
    statement: "Use Redis for low-latency shared state, but never let correctness depend on it.",
    evidence:
      "Every Redis read has a Postgres fallback; TTL expiry is used only for lifecycle cleanup, never as the mechanism keeping live data current (ADR-004).",
  },
  {
    id: "decouple-producers-consumers",
    statement: "Decouple producers and consumers so one slow reaction never blocks another.",
    evidence:
      "Scores, stats, and alerts run as independent Kafka/Redis Streams consumer groups specifically so a slow stats consumer can never block a score update reaching the browser (ADR-003).",
  },
  {
    id: "design-for-reconnect",
    statement: "Design WebSocket clients for reconnects, not just for the happy path.",
    evidence:
      "Client-side exponential backoff, full resubscribe, and a fresh snapshot request on every reconnect — state is never assumed to have survived a gap (ADR-006, useMatchSocket.ts).",
  },
  {
    id: "treat-eventual-consistency-explicitly",
    statement: "Treat eventual consistency explicitly, not implicitly.",
    evidence:
      "Every cached value carries lastUpdatedAt; the UI computes and displays real data-freshness rather than implying real-time freshness it can't deliver on a 3–5 minute polling budget (caching.md §23).",
  },
  {
    id: "test-failure-modes",
    statement: "Test failure modes, not just happy paths.",
    evidence:
      "Integration tests cover Redis-down fallback and unsubscribe actually stopping delivery; the WebSocket subscribe-race incident was caught and fixed because a real E2E test exercised the actual timing, not a mock.",
  },
  {
    id: "prefer-evidence-over-assumption",
    statement: "Prefer evidence over assumption — verify against real data before documenting.",
    evidence:
      "Three separate real bugs (provider error-field handling, standings candidate-pool starvation, and the WebSocket subscribe race) were found only because the project validated against real keys and real CI, not fixture-based tests alone.",
  },
  {
    id: "proportional-architecture",
    statement: "Keep architecture proportional to requirements — and say so when it isn't.",
    evidence:
      "Kafka is explicitly documented as more machinery than a ~100-event/day workload needs, stated in the README before an interviewer has to ask (technical-decisions.md §1).",
  },
];
