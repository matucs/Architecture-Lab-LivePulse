import { repoFile } from "./github";

export interface EventStep {
  componentId: string;
  connectionId?: string; // edge highlighted arriving at this step
  description: string;
}

export interface EventFlow {
  id: string;
  name: string;
  summary: string;
  steps: EventStep[];
  sourceNote: string;
  sourceLink: { label: string; url: string };
}

// Derived directly from docs/architecture.md §4 ("a goal happens end to end")
// — the one scenario the docs say touches every component.
export const eventFlows: EventFlow[] = [
  {
    id: "match-score-changed",
    name: "Match score changed",
    summary:
      "A goal is scored. Follow it from the external API through ingestion, the event bus, and out to the browser via WebSocket.",
    steps: [
      {
        componentId: "sports-api",
        description:
          "Polling Scheduler ticks (every 3–5 min in Portfolio Mode). Provider Client calls GET /fixtures?live=all — one request for every live match worldwide.",
      },
      {
        componentId: "ingestion",
        connectionId: "e1",
        description:
          "Response is mapped from API-Football's shape into the internal Match domain model via ApiFootballProvider. Quota Manager records rate-limit headers into Redis api:quota.",
      },
      {
        componentId: "change-detector",
        connectionId: "e3",
        description:
          "Change Detector compares the mapped match against the last known state (Redis first, Postgres fallback). Home score went from 1 to 2 — this is a real, meaningful change.",
      },
      {
        componentId: "postgres",
        connectionId: "e4",
        description:
          "MatchEvent (goal) and the updated Match row are written to PostgreSQL synchronously — durable, source of truth, happens even if the event bus is down.",
      },
      {
        componentId: "event-bus",
        connectionId: "e5",
        description:
          "sports.match.score-changed and sports.match.event-created are published, keyed by matchId (Kafka locally, Redis Streams in the live public deployment).",
      },
      {
        componentId: "consumers",
        connectionId: "e6",
        description:
          "scores-consumer-group reads the score-changed event and updates Redis live:match:{id} + live:matches. alerts-consumer-group reads event-created and decides the goal is notification-worthy.",
      },
      {
        componentId: "redis",
        connectionId: "e8",
        description:
          "Consumers PUBLISH to Redis channel ws:match:{id} — the fan-out signal for any WebSocket gateway instance with a locally subscribed client for this match.",
      },
      {
        componentId: "ws-gateway",
        connectionId: "e9",
        description:
          "Gateway instances subscribed to ws:match:{id} receive the pub/sub message and push {type:\"match:update\"} and {type:\"match:event\"} to their connected clients.",
      },
      {
        componentId: "frontend",
        connectionId: "e10",
        description:
          "Browser updates the scoreline and timeline without a refresh — useMatchSocket writes straight into the TanStack Query cache MatchDetailClient already reads from.",
      },
    ],
    sourceNote:
      "This exact scenario is the one docs/architecture.md calls \"the walkthrough worth memorizing before an interview about this project\" — and it's been proven end to end with real data, not just designed: a real 1-0 → 2-0 goal flowed through the full chain automatically during Phase 5 validation.",
    sourceLink: { label: "architecture.md §4", url: repoFile("docs/architecture.md") },
  },
];
