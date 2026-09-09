import { repoFile } from "./github";

export interface Decision {
  id: string;
  number: string;
  title: string;
  problem: string;
  solution: string;
  why: string;
  alternatives: { option: string; rejectedBecause: string }[];
  tradeoffs: string[];
  consequences: string[];
  adrUrl: string;
}

export const decisions: Decision[] = [
  {
    id: "adr-001",
    number: "ADR-001",
    title: "Sports API Selection",
    problem:
      "LivePulse needs a real, currently-operating live sports data source at €0/month, with verifiable terms and rate-limit behavior.",
    solution:
      "API-Football (api-sports.io), accessed directly, on its free tier (100 requests/day, 10/minute), behind a SportsDataProvider abstraction.",
    why:
      "Only evaluated provider offering genuine live in-play data at zero cost, with published rate-limit headers and coverage of 1,236 leagues/cups.",
    alternatives: [
      { option: "football-data.org", rejectedBecause: "Free tier has no live data at all — scores/schedules are explicitly delayed." },
      { option: "TheSportsDB", rejectedBecause: "Live (2-min) scores and the V2 API require a paid Patreon tier." },
      { option: "Sportmonks", rejectedBecause: "Free tier is a 2-league evaluation sandbox; live scores are a paid add-on on every plan." },
      { option: "Unofficial aggregators", rejectedBecause: "No verifiable ToS or rate-limit contract; risk of disappearing without notice." },
    ],
    tradeoffs: [
      "100 requests/day forces the entire polling design to be efficient and intentional rather than naive.",
      "No commercial rights on the underlying competition data — LivePulse must stay a visibly non-commercial demo.",
    ],
    consequences: [
      "Real live data available for the core feature from day one at €0/month.",
      "Documented rate-limit headers make the quota manager a real, testable component instead of a guess-based throttle.",
    ],
    adrUrl: repoFile("docs/adr/ADR-001-sports-api-selection.md"),
  },
  {
    id: "adr-002",
    number: "ADR-002",
    title: "REST Polling Strategy",
    problem:
      "100 requests/day has to fund live coverage honestly — no clever code turns that into a 15-second refresh across a full matchday.",
    solution:
      "Batched `GET /fixtures?live=all` (one request covers every live match worldwide) on tiered intervals: 30 min upcoming, 5 min pre-match, 3–5 min live, 0 (stopped) once finished.",
    why:
      "At 5-minute live intervals, ~70 of the 100-request daily budget funds roughly 8 hours of continuous live-window coverage per day — enough for a realistic afternoon/evening slate.",
    alternatives: [
      { option: "Per-match polling (one request per live match)", rejectedBecause: "Burns the daily quota in minutes on any real matchday." },
      { option: "15s or 60s live interval", rejectedBecause: "1,920 or 480 requests/day respectively — 7–19x over the realistic live budget." },
    ],
    tradeoffs: [
      "Live freshness is genuinely 'a few minutes old,' not seconds — shown honestly in the UI, never implied as sub-minute.",
      "A circuit breaker (3 consecutive failures → 5 min cooldown) and per-category quota budgets prevent one failure mode from starving the rest.",
    ],
    consequences: [
      "The 100-request/day constraint becomes a demonstrable real engineering budget, visible live on the ops dashboard.",
      "If a paid tier were used later, only LIVE_POLL_INTERVAL_MS changes — the polling architecture itself doesn't.",
    ],
    adrUrl: repoFile("docs/adr/ADR-002-polling-strategy.md"),
  },
  {
    id: "adr-003",
    number: "ADR-003",
    title: "Kafka Architecture",
    problem:
      "Should an event bus sit between change detection and everything downstream, given the data source is a polled REST API, not a stream?",
    solution:
      "Six matchId-keyed topics (score-changed, status-changed, event-created, statistics.updated, match.updated, notification.requested) feeding three consumer groups (scores, stats, alerts), behind an EventBus interface with two real implementations: KafkaEventBus and RedisStreamsEventBus.",
    why:
      "This specific project's traffic (~100 events/day) doesn't need Kafka — but the architectural pattern of decoupling 'detecting a change' from 'reacting to it' is real and worth building correctly, and is what lets scores/stats/alerts evolve independently later.",
    alternatives: [
      { option: "Single-process event emitter", rejectedBecause: "Functionally sufficient for current volume, but demonstrates no event-driven pattern — the explicit goal of this ADR." },
      { option: "Postgres LISTEN/NOTIFY or plain Redis pub/sub only", rejectedBecause: "Would work at this scale but skips consumer groups, partitioning, and DLQ semantics this project wants to show." },
    ],
    tradeoffs: [
      "Genuine operational overhead for a ~100-event/day workload — stated plainly, not hidden.",
      "Kafka is real only in local Docker Compose; the actual public deployment runs Redis Streams, since no always-on free hosted Kafka exists as of 2026.",
    ],
    consequences: [
      "Score, stats, and alert processing fail independently — a demonstrable property, not just a diagram claim.",
      "Verified against real data: a live poll tick with 48 real match changes produced correctly-partitioned messages across all topics, consumed with zero lag by every consumer group.",
    ],
    adrUrl: repoFile("docs/adr/ADR-003-kafka-architecture.md"),
  },
  {
    id: "adr-004",
    number: "ADR-004",
    title: "Redis Strategy",
    problem:
      "Redis plays three distinct roles (fast live state, pub/sub fan-out bridge, and — in Portfolio Mode — event transport) that need separate TTL and failure-mode reasoning.",
    solution:
      "A documented key schema (live:match:{id}, live:matches, api:quota, ws:match:{id}, etc.), cache-aside reads with Postgres fallback, and TTL used only for lifecycle cleanup — never as the mechanism that keeps live data current.",
    why:
      "Redis is treated as required for speed, not for correctness — every value carries lastUpdatedAt so the API can compute and honestly display data freshness.",
    alternatives: [
      { option: "Write-through caching", rejectedBecause: "Would couple Postgres writes to Redis availability — rejected because Postgres must never depend on Redis succeeding." },
      { option: "TTL-based invalidation as the primary freshness mechanism", rejectedBecause: "Would let stale data look current between expirations — change detection, not expiry, is what keeps live:match:{id} correct." },
    ],
    tradeoffs: [
      "Cache-aside means a cold Redis start briefly hits Postgres harder until keys repopulate.",
      "Single Upstash instance, no clustering — a documented Portfolio Mode scaling limit.",
    ],
    consequences: [
      "A Redis outage degrades the product (slower, less real-time) rather than breaking it.",
      "One documented key schema makes the caching layer auditable instead of scattered ad-hoc redis.set() calls.",
    ],
    adrUrl: repoFile("docs/adr/ADR-004-redis-strategy.md"),
  },
  {
    id: "adr-005",
    number: "ADR-005",
    title: "PostgreSQL Schema",
    problem:
      "The durable store must stay provider-independent — nothing outside data_providers and a (provider_id, external_id) pair should need to know a specific external API's shape.",
    solution:
      "A normalized schema (data_providers, sports, leagues, seasons, teams, players, matches, match_events, match_statistics, standings) with UNIQUE(provider_id, external_id) on every sourced entity, and deterministic UUIDv5 ids computed from that pair rather than random ids.",
    why:
      "UNIQUE(provider_id, external_id) is what makes the provider abstraction (ADR-007) real at the database level, not just at the TypeScript interface level — swapping providers means a new data_providers row, never a schema change.",
    alternatives: [
      { option: "gen_random_uuid() for every table (original design)", rejectedBecause: "Discovered during implementation that deterministic ids make provider mappers pure, testable functions with no DB round-trip — a real improvement kept for provider-sourced entities, while non-sourced tables (match_events, standings) keep random ids." },
    ],
    tradeoffs: [
      "match_statistics is a single current-snapshot row per team, not a time series — no trend analysis possible without a migration.",
      "No table partitioning yet — fine at current volume, flagged for Production Mode once history spans many seasons.",
    ],
    consequences: [
      "Foreign keys and CHECK constraints catch malformed provider data at the database boundary, not three layers later in a bug report.",
      "(provider_id, external_id) uniqueness is what actually enables running two providers side by side today (API-Football for live data, football-data.org for standings) without id collisions.",
    ],
    adrUrl: repoFile("docs/adr/ADR-005-postgresql-schema.md"),
  },
  {
    id: "adr-006",
    number: "ADR-006",
    title: "WebSocket Architecture",
    problem:
      "The browser must receive updates without refreshing, from a gateway that never talks to the external provider directly and can, in principle, scale to multiple instances without clients caring which one they're on.",
    solution:
      "A subscribe/snapshot/update protocol where the gateway subscribes to a Redis pub/sub channel (ws:match:{id}) only while it has at least one local client subscribed to that match — not to Kafka/Redis Streams directly.",
    why:
      "This is what lets gateway instances scale horizontally without any instance needing to know about any other, and without consumers needing to know how many gateway instances exist or which clients are connected where.",
    alternatives: [
      { option: "HTTP long polling", rejectedBecause: "Higher latency and server load per update than a persistent WebSocket connection for a use case that is inherently push-based." },
      { option: "Gateway subscribes to Kafka/Redis Streams topics directly", rejectedBecause: "Would couple the number of gateway instances to the number of topic consumers and complicate consumer-group semantics for no real benefit over the Redis pub/sub bridge." },
    ],
    tradeoffs: [
      "Redis pub/sub has no delivery guarantee — a message published while no instance is subscribed is lost. Acceptable because state is always fetched fresh on subscribe, so a missed message only delays a push, never shows stale data as current.",
      "A single Node process handling WebSocket connections is a real Portfolio Mode ceiling (500 connections) — Production Mode needs a load balancer with sticky sessions.",
    ],
    consequences: [
      "Horizontal scalability is a property of the design, not bolted on later — though only ever run as exactly one instance in practice, an explicitly named gap in the engineering review.",
      "Snapshot-on-subscribe + resubscribe-on-reconnect means there's no 'client missed an update while reconnecting' bug class.",
    ],
    adrUrl: repoFile("docs/adr/ADR-006-websocket-architecture.md"),
  },
  {
    id: "adr-007",
    number: "ADR-007",
    title: "Provider Abstraction",
    problem:
      "Wiring API-Football's response shape directly into the domain model would make provider risk (pricing changes, shutdown, ToS changes) a rewrite, not a config change.",
    solution:
      "A SportsDataProvider interface owned entirely by ApiFootballProvider's mapping layer, selected via a single factory keyed by config — not a runtime plugin system, since exactly one production implementation exists today.",
    why:
      "Provider risk is real (every evaluated provider in ADR-001 has a plausible failure mode), different providers are already needed for different data (football-data.org for standings), and the boundary keeps a provider's response shape from quietly becoming the domain model.",
    alternatives: [
      { option: "Generic plugin/registry system for hypothetical future providers", rejectedBecause: "No second provider existed when this was designed — speculative generality the project's own §6 explicitly warns against." },
      { option: "Per-field provider fallback (score from one provider, stats from another)", rejectedBecause: "A real feature some products need, but nothing in this project's actual requirements calls for it." },
    ],
    tradeoffs: [
      "The interface shape still implicitly reflects what API-Football can provide — a fundamentally different provider might require it to grow.",
      "When football-data.org was actually added (for standings), it needed a narrower, separate one-method interface — not a SportsDataProvider implementation — because it was never a live-data candidate.",
    ],
    consequences: [
      "ADR-001's revisit triggers (quota changes, shutdown, paid tier) become implementation swaps, not architecture changes.",
      "SportsDataProvider is trivially mockable for unit-testing ingestion and change detection without hitting the real API or its rate limits.",
    ],
    adrUrl: repoFile("docs/adr/ADR-007-provider-abstraction.md"),
  },
  {
    id: "adr-008",
    number: "ADR-008",
    title: "Free Deployment Strategy",
    problem:
      "The project must run at €0/month as a reliable public demo, using real currently-available free tiers rather than assumed ones.",
    solution:
      "Portfolio Mode: ingestion + API + WebSocket gateway as one Node process, Neon Postgres, Upstash Redis, Redis Streams as the event transport, Vercel for the frontend. Originally targeted at Northflank's free Sandbox tier for the backend.",
    why:
      "Every layer was infra-checked as of September 2026 rather than assumed free (Upstash Kafka was already discontinued; Confluent Cloud's free tier is a promotional credit, not perpetual) — and the Portfolio → Production path is a config/infra change at every layer, not a rewrite.",
    alternatives: [
      { option: "Render / Railway / Fly.io free tiers for the backend", rejectedBecause: "Sleep after idle, no free tier for new accounts, or credit-based trial only — none stay up continuously for a WebSocket server + polling scheduler." },
      { option: "Northflank free Sandbox (originally chosen)", rejectedBecause: "Documented as 'no credit card required' in this project's own Phase 1/2 research, but actually deploying a service returned a real payment-required error on a confirmed free-tier account — required a card in practice, discovered only by actually trying." },
    ],
    tradeoffs: [
      "Combining ingestion, API, and WebSocket gateway into one process means they share fate in Portfolio Mode — a deliberate, accepted €0/month tradeoff, reversed first in Production Mode.",
      "The real fallback — a self-hosted Oracle Cloud Always Free VM — needed everything a PaaS would otherwise absorb: manual Docker install, two separate firewall layers (VM iptables and Oracle's own cloud Security List), and Caddy's automatic Let's Encrypt TLS against a free nip.io domain.",
    ],
    consequences: [
      "Every piece built before deployment (Dockerfile, migration-on-boot, EVENT_BUS_DRIVER=redis-streams, Neon/Upstash connections, CORS handling) worked correctly on the first real boot — the infrastructure-shopping problems were about which free-tier platform would let deployment happen at all, not whether the code was ready.",
      "Deploy-on-push isn't wired up (Vercel's GitHub App integration needs interactive OAuth, not a bare API token) — every production update is a manual SSH session, a documented, real process gap.",
    ],
    adrUrl: repoFile("docs/adr/ADR-008-free-deployment-strategy.md"),
  },
];
