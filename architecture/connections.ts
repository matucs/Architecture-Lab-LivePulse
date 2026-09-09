export interface ArchConnection {
  id: string;
  source: string;
  target: string;
  label: string;
  /** true if this edge is part of the durable-write path, not the event path */
  durable?: boolean;
}

// Mirrors docs/architecture.md's system diagram (§1) and the "goal happens"
// walkthrough (§4) — every edge here corresponds to a real call, publish, or
// subscribe in the codebase, not an inferred arrow.
export const connections: ArchConnection[] = [
  { id: "e1", source: "sports-api", target: "ingestion", label: "GET /fixtures?live=all (batched)" },
  { id: "e2", source: "ingestion", target: "provider-abstraction", label: "maps via SportsDataProvider" },
  { id: "e3", source: "provider-abstraction", target: "change-detector", label: "mapped Match" },
  { id: "e4", source: "change-detector", target: "postgres", label: "always, durable write", durable: true },
  { id: "e5", source: "change-detector", target: "event-bus", label: "meaningful change only" },
  { id: "e6", source: "event-bus", target: "consumers", label: "score-changed / status-changed / event-created / stats.updated" },
  { id: "e7", source: "consumers", target: "postgres", label: "idempotent upsert", durable: true },
  { id: "e8", source: "consumers", target: "redis", label: "update live state + PUBLISH ws:match:{id}" },
  { id: "e9", source: "redis", target: "ws-gateway", label: "pub/sub: ws:match:{id}" },
  { id: "e10", source: "ws-gateway", target: "frontend", label: "match:snapshot / match:update / match:event" },
  { id: "e11", source: "frontend", target: "postgres", label: "REST: initial load, historical queries" },
];
