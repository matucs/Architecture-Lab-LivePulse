import { repoFile } from "./github";

export interface MeasuredMetric {
  id: string;
  label: string;
  value: string;
  kind: "measured" | "projection";
  source: string;
  sourceLink?: { label: string; url: string };
}

export const metrics: MeasuredMetric[] = [
  {
    id: "kafka-poll-tick",
    label: "Messages produced by one real live-poll tick",
    value: "48 sports.match.updated · 34 score-changed · 28 status-changed · 2 event-created",
    kind: "measured",
    source: "A real poll tick against real API-Football data during Phase 4, consumed with verified zero lag across all 4 consumer groups.",
    sourceLink: { label: "ADR-003 Phase 4 addendum", url: repoFile("docs/adr/ADR-003-kafka-architecture.md") },
  },
  {
    id: "unit-tests",
    label: "Unit tests",
    value: "52 tests (backend/test/unit)",
    kind: "measured",
    source: "Covers provider mapping, change detection's zero-event no-op property, retry/circuit-breaker logic, cross-provider team-name reconciliation, and DLQ/retry wrapper behavior.",
    sourceLink: { label: "backend/test/unit", url: repoFile("backend/test") },
  },
  {
    id: "standings-rows",
    label: "Standings rows reconciled across two providers",
    value: "96 rows (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)",
    kind: "measured",
    source: "Real football-data.org standings reconciled against API-Football team rows, verified with correct provider attribution.",
    sourceLink: { label: "ADR-007 addendum", url: repoFile("docs/adr/ADR-007-provider-abstraction.md") },
  },
  {
    id: "ops-summary-snapshot",
    label: "Live /api/ops/summary snapshot",
    value: "325 live matches · 48 requests spent today · 5 remaining",
    kind: "measured",
    source: "A real hit against the running pipeline — the 5-remaining figure is ADR-002's safety margin visibly working, not a synthetic number.",
    sourceLink: { label: "observability.md", url: repoFile("docs/observability.md") },
  },
  {
    id: "ws-connection-cap",
    label: "WebSocket connection ceiling (Portfolio Mode)",
    value: "500 concurrent connections",
    kind: "measured",
    source: "A configured, real hard ceiling (WS_MAX_CONNECTIONS) sized to what one small free-tier VM's Node process can hold comfortably — not a benchmark result, a documented configuration limit.",
    sourceLink: { label: "engineering-review.md", url: repoFile("docs/engineering-review.md") },
  },
  {
    id: "daily-quota",
    label: "API-Football daily request budget",
    value: "100 requests/day, 10/minute (free tier)",
    kind: "measured",
    source: "The provider's own documented and enforced free-tier limit, confirmed via real rate-limit response headers.",
    sourceLink: { label: "ADR-001", url: repoFile("docs/adr/ADR-001-sports-api-selection.md") },
  },
  {
    id: "million-users",
    label: "Concurrent user capacity at large scale",
    value: "Not claimed — no number exists",
    kind: "projection",
    source: "This Lab deliberately does not publish a concurrent-user capacity figure for the Stage 3 (Large Scale) architecture — nothing at that scale has been built or load-tested. Any number here would be invented, not measured.",
  },
  {
    id: "multi-instance-ws",
    label: "Multi-instance WebSocket fan-out under load",
    value: "Architecturally sound, never run with more than 1 instance",
    kind: "projection",
    source: "The Redis pub/sub fan-out design supports N gateway instances by construction, but this project has only ever run exactly one instance — stated as an explicit, named gap, not a tested property.",
    sourceLink: { label: "engineering-review.md", url: repoFile("docs/engineering-review.md") },
  },
];
