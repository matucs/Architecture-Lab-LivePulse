import { repoFile, repoDir } from "./github";

export type ComponentCategory =
  | "external"
  | "ingestion"
  | "bus"
  | "consumer"
  | "storage"
  | "gateway"
  | "frontend";

export interface CodeRef {
  label: string;
  url: string;
}

export interface ArchComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  /** short label shown on the diagram node itself */
  shortLabel: string;
  purpose: string;
  why: string;
  tradeoffs: string[];
  failureMode: string;
  scaling: string;
  codeRefs: CodeRef[];
  /** x/y position on the React Flow canvas */
  position: { x: number; y: number };
}

export const components: ArchComponent[] = [
  {
    id: "sports-api",
    name: "API-Football",
    category: "external",
    shortLabel: "API-Football\n(external, rate-limited)",
    purpose:
      "The single external data source for live match scores, events, and statistics. Reached only from the Ingestion Service — nothing else in the system talks to it directly.",
    why:
      "The only evaluated provider (of API-Football, football-data.org, TheSportsDB, Sportmonks, and unofficial aggregators) offering genuine live in-play data at zero cost, with published rate-limit headers and 1,236 leagues of coverage. See ADR-001.",
    tradeoffs: [
      "Free tier caps at 100 requests/day, 10/minute — the single hardest constraint the whole ingestion design works around.",
      "Free tier blocks all season-scoped fixture/standings queries outright (a 2022–2024-only historical window) — discovered during real-key validation, not anticipated in research.",
      "No commercial rights on the underlying competition data — LivePulse must stay a non-commercial demo.",
    ],
    failureMode:
      "Provider downtime or a 429/5xx response trips the ingestion circuit breaker (3 consecutive failures) which opens for a 5-minute cooldown. During that window ingestion serves last-known state from Postgres/Redis with a stale-data indicator instead of hammering a failing provider.",
    scaling:
      "Does not scale with LivePulse traffic at all — the batched `GET /fixtures?live=all` call costs the same one request whether 1 or 40 matches are live worldwide. The real ceiling is the fixed 100-request/day quota, not request volume.",
    codeRefs: [
      { label: "ADR-001: Sports API selection", url: repoFile("docs/adr/ADR-001-sports-api-selection.md") },
      { label: "Provider comparison research", url: repoFile("docs/research/sports-api-comparison.md") },
    ],
    position: { x: 0, y: 260 },
  },
  {
    id: "ingestion",
    name: "Ingestion Service",
    category: "ingestion",
    shortLabel: "Ingestion Service\n(polling + quota + provider client)",
    purpose:
      "Polls the external provider on tiered intervals, tracks the daily/per-minute quota against real rate-limit headers, and maps provider responses into LivePulse's internal domain model.",
    why:
      "Kept as its own service, separate from the API the browser talks to, so the external provider's quirks, rate limits, and downtime never reach the client directly.",
    tradeoffs: [
      "Live-match freshness is bounded by the polling interval (3–5 min), not by anything downstream — Kafka/Redis/WebSocket hops each add only low single-digit milliseconds.",
      "Portfolio Mode runs ingestion in the same Node process as the API and WebSocket gateway (ADR-008) — a crash in the gateway can take ingestion down with it.",
    ],
    failureMode:
      "A circuit breaker opens after 3 consecutive provider failures and serves last-known state with a staleness indicator rather than retrying into a failing/rate-limited provider. A single-instance quota-lock (`poll:lock:{tickId}`) prevents two ingestion instances from double-spending quota on the same tick.",
    scaling:
      "Bounded by the provider's fixed daily quota, not by LivePulse's own traffic — adding more tracked leagues costs zero extra requests because `live=all` returns everything in one call. In Production Mode, `LIVE_POLL_INTERVAL_MS` shrinks as the quota grows on a paid tier; the polling architecture itself is unchanged.",
    codeRefs: [
      { label: "ingestionService.ts", url: repoFile("backend/src/ingestion/ingestionService.ts") },
      { label: "scheduler.ts", url: repoFile("backend/src/ingestion/scheduler.ts") },
      { label: "quotaManager.ts", url: repoFile("backend/src/ingestion/quotaManager.ts") },
      { label: "ADR-002: Polling strategy", url: repoFile("docs/adr/ADR-002-polling-strategy.md") },
      { label: "docs/ingestion.md", url: repoFile("docs/ingestion.md") },
    ],
    position: { x: 200, y: 260 },
  },
  {
    id: "change-detector",
    name: "Change Detector",
    category: "ingestion",
    shortLabel: "Change Detector",
    purpose:
      "Compares a freshly polled match against its last known state (Redis first, Postgres fallback) and decides whether a real, meaningful change happened — so the same unchanged poll never produces an event.",
    why:
      "Sits between ingestion and the event bus so that polling the same provider response ten times produces at most one event, not ten. This is what keeps Kafka/Redis Streams from being flooded by re-polling noise.",
    tradeoffs: [
      "Correctness depends on comparing against the right last-known state — Redis is checked first for speed, Postgres is the fallback of record.",
      "An unchanged poll producing zero events is a property explicitly covered by a unit test, not just an assumption.",
    ],
    failureMode:
      "If both Redis and Postgres are briefly unreadable, change detection has no baseline to compare against — the safe default is documented behavior, not a special-cased fallback.",
    scaling:
      "In-process comparison, scales with poll volume, not match count — the cost is proportional to the size of one `live=all` response, not per-match calls.",
    codeRefs: [
      { label: "changeDetector.ts", url: repoFile("backend/src/ingestion/changeDetector.ts") },
      { label: "docs/change-detection.md", url: repoFile("docs/change-detection.md") },
      { label: "changeDetector.test.ts", url: repoFile("backend/test/unit/ingestion/changeDetector.test.ts") },
    ],
    position: { x: 200, y: 420 },
  },
  {
    id: "provider-abstraction",
    name: "SportsDataProvider",
    category: "ingestion",
    shortLabel: "Provider Abstraction\n(SportsDataProvider)",
    purpose:
      "The interface `ApiFootballProvider` implements. Owns all mapping from a provider's JSON shape into LivePulse's internal domain types, so API-Football's response shape never leaks past this boundary.",
    why:
      "Provider risk is real (ADR-001 lists plausible failure modes for every evaluated provider), and different data already comes from different providers in practice — football-data.org supplies standings today via a narrower, separate interface, not this one.",
    tradeoffs: [
      "Deliberately no generic plugin/registry system, no per-field fallback across providers, no lowest-common-denominator interface across sports — all explicitly rejected as overengineering nothing in this project's real requirements calls for.",
      "The interface shape still implicitly reflects what API-Football can provide; a fundamentally different provider might require it to grow.",
    ],
    failureMode:
      "A provider swap or outage becomes a config/implementation change, not a rewrite — but if a provider's data model doesn't fit the existing interface shape at all, the abstraction itself needs to change.",
    scaling:
      "Zero runtime scaling concern — this is a compile-time boundary. What it enables is organizational scaling: a second provider is a new class plus one line of factory wiring.",
    codeRefs: [
      { label: "SportsDataProvider.ts", url: repoFile("backend/src/providers/SportsDataProvider.ts") },
      { label: "ApiFootballProvider.ts", url: repoFile("backend/src/providers/ApiFootballProvider.ts") },
      { label: "FootballDataProvider.ts", url: repoFile("backend/src/providers/FootballDataProvider.ts") },
      { label: "ADR-007: Provider abstraction", url: repoFile("docs/adr/ADR-007-provider-abstraction.md") },
    ],
    position: { x: 200, y: 100 },
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "storage",
    shortLabel: "PostgreSQL\n(durable source of truth)",
    purpose:
      "The only store LivePulse is willing to lose data over. Written synchronously by the ingestion service itself — not just by downstream consumers — so durable history never depends on the event pipeline being healthy.",
    why:
      "Redis and Kafka can both fail or be flushed without losing the actual historical record. A single ingestion write (a match's changes) commits `matches`, new `match_events`, and `match_statistics` inside one transaction; the event-bus publish happens only after that commit succeeds.",
    tradeoffs: [
      "`match_statistics` is a single current-snapshot row per team, not a time series — no possession-over-time chart is possible without a schema migration.",
      "No table partitioning yet — fine at portfolio data volume, flagged as a Production Mode concern once history spans many seasons.",
      "Provider-sourced entity ids are deterministic (UUIDv5 over provider+kind+externalId), not random — a deliberate deviation from the original ADR-005 design, made so provider mappers stay pure, testable functions with no DB round-trip.",
    ],
    failureMode:
      "Postgres is the correctness backstop, not the speed layer — if Redis is down, reads fall back to Postgres directly (slower, still correct) instead of failing. If Postgres itself is unreachable, ingestion writes fail loudly rather than silently dropping data.",
    scaling:
      "Single Neon instance with scale-to-zero in Portfolio Mode. Production Mode adds read replicas for read-heavy queries (standings, historical match lists) while writes stay on the primary — the schema itself doesn't change. Partitioning by season is the documented next step once history grows.",
    codeRefs: [
      { label: "ADR-005: PostgreSQL schema", url: repoFile("docs/adr/ADR-005-postgresql-schema.md") },
      { label: "1.init-schema.sql", url: repoFile("backend/src/db/migrations/1.init-schema.sql") },
      { label: "db/repositories/", url: repoDir("backend/src/db/repositories") },
      { label: "deriveId.ts", url: repoFile("backend/src/domain/deriveId.ts") },
    ],
    position: { x: 400, y: 420 },
  },
  {
    id: "event-bus",
    name: "Event Bus (Kafka / Redis Streams)",
    category: "bus",
    shortLabel: "Event Bus\nKafka (local) / Redis Streams (prod)",
    purpose:
      "Decouples 'a change was detected' from 'something reacts to it.' Six topics keyed by matchId (score-changed, status-changed, event-created, statistics.updated, match.updated, notification.requested) fan out to three independent consumer groups.",
    why:
      "Scores, stats, and alerts are different consumers with different failure/retry needs — a slow stats consumer must never block a score update from reaching the browser. Stated plainly as a deliberate demonstration of event-driven decoupling, not a pattern this ~100-event/day workload actually requires (ADR-003, technical-decisions.md §1).",
    tradeoffs: [
      "Genuine operational overhead for a 100-event/day workload — accepted and stated explicitly rather than hidden.",
      "At-least-once delivery means every consumer write must be idempotent (upsert on `(match_id, sequence_number)`), not a blind insert.",
      "Kafka is real only in local dev / Docker Compose — the live public deployment runs `EVENT_BUS_DRIVER=redis-streams` instead, since no always-on free hosted Kafka exists. Redis Streams is a real substitute (real consumer groups, manual ack, pending-entry redelivery) but is not Kafka: no true broker partitioning, weaker durability, no cross-datacenter replication.",
    ],
    failureMode:
      "A message that exhausts 3 retries (1s/4s/16s backoff) is published to a `<topic>.dlq` topic instead of blocking the partition — inspected manually, nothing auto-reprocesses a DLQ today. If the whole bus is down, Postgres writes still happen (ingestion writes durably regardless); only the fan-out to consumers/WebSocket is delayed until it recovers.",
    scaling:
      "6 partitions per topic by default in Portfolio Mode — deliberately more than current throughput needs, and explicitly documented as configurable per environment rather than a fixed 'correct' number. Production Mode sizes partitions to measured throughput and swaps the transport to managed Kafka via one config flag (`EVENT_BUS_DRIVER=kafka`) — no code change.",
    codeRefs: [
      { label: "ADR-003: Kafka architecture", url: repoFile("docs/adr/ADR-003-kafka-architecture.md") },
      { label: "EventBus.ts (interface)", url: repoFile("backend/src/events/EventBus.ts") },
      { label: "KafkaEventBus.ts", url: repoFile("backend/src/events/KafkaEventBus.ts") },
      { label: "RedisStreamsEventBus.ts", url: repoFile("backend/src/events/RedisStreamsEventBus.ts") },
      { label: "topics.ts", url: repoFile("backend/src/events/topics.ts") },
      { label: "docs/kafka.md", url: repoFile("docs/kafka.md") },
    ],
    position: { x: 600, y: 260 },
  },
  {
    id: "consumers",
    name: "Consumers (Scores / Stats / Alerts)",
    category: "consumer",
    shortLabel: "Consumers\nscores · stats · alerts",
    purpose:
      "Three independent consumer groups react to domain events: scores-consumer-group updates Redis live state + Postgres and publishes to the WebSocket fan-out channel; stats-consumer-group does the same for statistics; alerts-consumer-group decides notification-worthiness and fans out match:event timeline messages.",
    why:
      "Each consumer group is independently scalable and independently restartable — a slow or crashing stats consumer can never block score updates from reaching the browser. This isolation, not raw throughput, is the actual architectural point being demonstrated.",
    tradeoffs: [
      "The original design assumed ingestion's job ended at 'durable write + event published,' with Redis live-state updates happening downstream in consumers. Real Phase 4 implementation kept ingestion writing Redis directly and synchronously (unchanged from Phase 3) — moving that to a consumer would make the cache-aside read path correct only after a Kafka round-trip, strictly worse.",
      "`sports.notification.requested` is consumed today only by a logging stub — proving the seam is real and consumable, not a built notification feature.",
    ],
    failureMode:
      "A consumer that fails processing retries 3 times with backoff before its message goes to that topic's DLQ rather than blocking the partition for other messages. Consumer crashes are isolated per group — verified as a real, demonstrable property, not just a design claim.",
    scaling:
      "Each consumer group scales independently by adding more consumer instances within the group, splitting partitions between them. Verified against real data: a poll tick with 48 real match changes produced 48/34/28/2 messages across the four topics, consumed with zero lag by all consumer groups.",
    codeRefs: [
      { label: "scoresConsumer.ts", url: repoFile("backend/src/events/consumers/scoresConsumer.ts") },
      { label: "statsConsumer.ts", url: repoFile("backend/src/events/consumers/statsConsumer.ts") },
      { label: "alertsConsumer.ts", url: repoFile("backend/src/events/consumers/alertsConsumer.ts") },
      { label: "notificationStubConsumer.ts", url: repoFile("backend/src/events/consumers/notificationStubConsumer.ts") },
      { label: "consumerRuntime.ts (DLQ wrapper)", url: repoFile("backend/src/events/consumerRuntime.ts") },
    ],
    position: { x: 800, y: 260 },
  },
  {
    id: "redis",
    name: "Redis",
    category: "storage",
    shortLabel: "Redis\nlive state + pub/sub fan-out",
    purpose:
      "Plays three roles: fast-changing live match state (cache-aside over Postgres), the pub/sub bridge (`ws:match:{id}`) that fans consumer updates out to WebSocket gateway instances, and — in Portfolio Mode — the event transport itself via Redis Streams.",
    why:
      "Consumers never hold client connections; they write state and publish to a channel, and the gateway fans that out to whichever clients are actually subscribed. This is what lets the gateway scale horizontally later without consumers knowing how many gateway instances exist.",
    tradeoffs: [
      "Cache-aside, not write-through — a cold Redis start (fresh instance after redeploy) briefly hits Postgres harder until keys repopulate.",
      "Redis is required for speed, not correctness: TTL-based expiry is used only for lifecycle cleanup, never as the mechanism keeping live data current — change detection does that.",
      "No Redis Cluster/sharding — a single Upstash instance (256MB/500k commands free tier) is the Portfolio Mode target.",
    ],
    failureMode:
      "If Redis is unreachable, reads fall back to Postgres directly (slower, fully correct). Ingestion still writes Postgres unaffected, but skips the Redis-state-update and pub/sub-publish steps — connected WebSocket clients then get no fan-out signal and fall back to their own REST-polling fallback until Redis recovers. Redis pub/sub itself has no delivery guarantee: a message published while no gateway instance is subscribed is simply lost — acceptable because state is always re-fetched fresh on subscribe.",
    scaling:
      "Single Upstash Redis instance in Portfolio Mode (256MB / 500k commands per month). Production Mode moves to managed, possibly clustered Redis with more headroom — the key schema itself is unchanged; clustering only matters once key count/throughput actually exceeds one instance.",
    codeRefs: [
      { label: "ADR-004: Redis strategy", url: repoFile("docs/adr/ADR-004-redis-strategy.md") },
      { label: "liveMatchCache.ts", url: repoFile("backend/src/cache/liveMatchCache.ts") },
      { label: "keys.ts", url: repoFile("backend/src/cache/keys.ts") },
      { label: "docs/caching.md", url: repoFile("docs/caching.md") },
    ],
    position: { x: 600, y: 430 },
  },
  {
    id: "ws-gateway",
    name: "WebSocket Gateway",
    category: "gateway",
    shortLabel: "WebSocket Gateway",
    purpose:
      "Holds client connections and pushes `match:snapshot` / `match:update` / `match:event` messages. Subscribes to a match's Redis pub/sub channel only while it has at least one local client subscribed to that match.",
    why:
      "The gateway deliberately does not consume Kafka/Redis Streams directly — it only subscribes to Redis pub/sub. This means gateway instances scale horizontally without any instance needing to know about any other, and without consumers needing to know how many gateway instances exist or which clients are connected where.",
    tradeoffs: [
      "On `subscribe`, the gateway always sends a fresh `match:snapshot` read through the Redis cache-aside path first, so a missed pub/sub message only delays a push — it never shows stale data as current.",
      "A single Node process handling WebSocket connections is a real Portfolio Mode ceiling: 500 concurrent connections max, sized to what one free-tier process can hold comfortably.",
      "No graceful-shutdown/connection-draining on deploy — every manual redeploy hard-drops every connected client, relying entirely on client-side reconnect to recover.",
    ],
    failureMode:
      "Server-side heartbeat (ping/pong every 30s) terminates and cleans up a connection that misses 2 consecutive pongs, preventing a slow leak of dead connections holding open Redis subscriptions. This is exactly the component behind the project's one real documented incident: the gateway subscribes to Redis asynchronously after a client's `subscribe` message — a client socket reaching readyState OPEN only proves the handshake finished, not that the server's Redis SUBSCRIBE has landed yet.",
    scaling:
      "Horizontal scalability is a property of the fan-out design (Redis pub/sub), not something bolted on later — verified only as a code-level design, never actually run as more than one instance. Production Mode needs a load balancer with sticky sessions or a connection-routing layer in front, since a client's TCP connection is still pinned to one instance even though the fan-out already supports N.",
    codeRefs: [
      { label: "ADR-006: WebSocket architecture", url: repoFile("docs/adr/ADR-006-websocket-architecture.md") },
      { label: "gateway.ts", url: repoFile("backend/src/ws/gateway.ts") },
      { label: "docs/websocket.md", url: repoFile("docs/websocket.md") },
      { label: "websocketGateway.test.ts", url: repoFile("backend/test/integration/websocketGateway.test.ts") },
    ],
    position: { x: 800, y: 430 },
  },
  {
    id: "frontend",
    name: "Next.js Frontend",
    category: "frontend",
    shortLabel: "Next.js Client\n(browser)",
    purpose:
      "The browser client. Reads REST for initial page load and historical queries, then upgrades to a live WebSocket connection (`useMatchSocket`) that writes straight into the same TanStack Query cache the match-detail page already reads from.",
    why:
      "REST polling remains the fallback, active only while the socket is disconnected — not the primary transport once a connection exists. This lets the UI degrade gracefully (visible reconnect state, freshness banner) rather than silently going stale.",
    tradeoffs: [
      "The home page is designed so recent results, upcoming fixtures, and standings always carry the page when nothing is live — the common case, not an edge case, given a 100-request/day budget.",
      "A React-StrictMode dev-only double-invoke artifact (an immediate synthetic WebSocket close during `next dev`) was chased down and confirmed benign, not a real bug — the hook's `closedByCleanup` guard already handles it correctly.",
    ],
    failureMode:
      "Client-side exponential backoff on disconnect (1s→30s capped, ±20% jitter); on reconnect the client resubscribes to every matchId it previously held and requests a fresh snapshot for each, never assuming state survived the gap.",
    scaling:
      "Vercel's serverless free tier fits the frontend well — unlike the backend, Next.js doesn't need to stay 'always on' the way a WebSocket server does.",
    codeRefs: [
      { label: "useMatchSocket.ts", url: repoFile("frontend/lib/useMatchSocket.ts") },
      { label: "MatchDetailClient.tsx", url: repoFile("frontend/components/MatchDetailClient.tsx") },
      { label: "OpsDashboard.tsx", url: repoFile("frontend/components/OpsDashboard.tsx") },
      { label: "live-update.spec.ts (E2E)", url: repoFile("frontend/e2e/live-update.spec.ts") },
    ],
    position: { x: 1000, y: 260 },
  },
];

export function getComponent(id: string): ArchComponent | undefined {
  return components.find((c) => c.id === id);
}
