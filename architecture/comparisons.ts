export interface ComparisonRow {
  dimension: string;
  optionA: string;
  optionB: string;
}

export interface Comparison {
  id: string;
  title: string;
  optionALabel: string;
  optionBLabel: string;
  rows: ComparisonRow[];
  /** what LivePulse actually runs today, phrased precisely */
  currentReality: string;
  whenIdChooseEach: string;
}

export const comparisons: Comparison[] = [
  {
    id: "kafka-vs-rabbitmq",
    title: "Kafka vs RabbitMQ",
    optionALabel: "Kafka",
    optionBLabel: "RabbitMQ",
    rows: [
      { dimension: "Model", optionA: "Durable, ordered log with retained offsets", optionB: "Queue-based broker with routing (exchanges/bindings)" },
      { dimension: "Ordering", optionA: "Guaranteed per-partition (keyed by matchId here)", optionB: "Guaranteed per-queue, no native partitioning concept" },
      { dimension: "Replay", optionA: "Native — consumers can re-read from any retained offset", optionB: "Not native — a consumed/acked message is gone" },
      { dimension: "Consumer scaling", optionA: "Consumer groups split partitions automatically", optionB: "Competing consumers on one queue; no partition concept to split" },
      { dimension: "Operational complexity", optionA: "Higher — brokers, ZooKeeper/KRaft, partition rebalancing to reason about", optionB: "Lower — simpler single-broker mental model for moderate throughput" },
      { dimension: "Best fit", optionA: "High-throughput event streams, replay, multiple independent consumer groups of the same events", optionB: "Task queues, RPC-style messaging, complex routing topologies" },
    ],
    currentReality:
      "LivePulse uses Kafka (KafkaEventBus, real locally via Docker Compose) specifically for its consumer-group + replay-shaped semantics, keyed by matchId — see ADR-003. It substitutes Redis Streams, not RabbitMQ, in the live public deployment, because Redis Streams was the option that preserved consumer-group semantics without standing up a second broker.",
    whenIdChooseEach:
      "I'd reach for Kafka when multiple independent consumers need to read the same event stream at their own pace and replay matters (this project's actual reasoning). I'd reach for RabbitMQ for task-queue-shaped work — background jobs, RPC-style request/reply, or routing that benefits from exchange/binding flexibility more than partitioned ordering.",
  },
  {
    id: "websocket-vs-polling",
    title: "WebSocket vs HTTP Polling",
    optionALabel: "WebSocket",
    optionBLabel: "HTTP Polling",
    rows: [
      { dimension: "Latency", optionA: "Push — update arrives as soon as the server has it", optionB: "Bounded by the poll interval, however short" },
      { dimension: "Server load", optionA: "One held connection per client, low incremental cost per push", optionB: "A full request/response cycle every interval, per client, whether or not anything changed" },
      { dimension: "Implementation complexity", optionA: "Higher — connection lifecycle, heartbeats, reconnect/backoff logic (see useMatchSocket.ts)", optionB: "Lower — a plain fetch on a timer" },
      { dimension: "Reconnect behavior", optionA: "Explicit: client backoff + resubscribe + fresh snapshot on every reconnect", optionB: "Implicit — the next poll just happens" },
      { dimension: "Scalability", optionA: "Bounded by concurrent open connections a process can hold (500 in Portfolio Mode)", optionB: "Bounded by request throughput, but wastes most requests on no-op checks" },
      { dimension: "Suitability for live sports", optionA: "Matches the actual event cadence — a goal is a push-shaped event, not a scheduled one", optionB: "Wastes requests polling for changes that, on the backend's own 3–5 min ingestion cadence, mostly aren't there yet" },
    ],
    currentReality:
      "LivePulse uses WebSocket as the primary transport once connected (ADR-006), with REST polling kept as an explicit fallback active only while the socket is disconnected — not a redundant transport running all the time.",
    whenIdChooseEach:
      "WebSocket wins whenever updates are server-initiated and latency actually matters to the user, which is exactly the live-match case. I'd reach for polling for low-frequency or client-initiated data (e.g. a settings page) where the operational simplicity of 'just fetch on a timer' outweighs push latency nobody needs.",
  },
  {
    id: "redis-vs-in-memory",
    title: "Redis vs In-Memory Cache",
    optionALabel: "Redis",
    optionBLabel: "In-process memory cache",
    rows: [
      { dimension: "Shared state", optionA: "Shared across every process/instance that connects to it", optionB: "Local to one process — invisible to any other instance" },
      { dimension: "Persistence", optionA: "Optional durability (RDB/AOF); LivePulse treats it as ephemeral by design anyway", optionB: "Gone on process restart, always" },
      { dimension: "Multi-instance behavior", optionA: "Multiple gateway/consumer instances see the same live state and pub/sub channel", optionB: "Each instance has its own inconsistent copy — breaks the WebSocket fan-out design entirely" },
      { dimension: "Latency", optionA: "Sub-millisecond over a local/regional network hop", optionB: "Faster still (no network hop) but only useful if there's exactly one process" },
      { dimension: "Failure behavior", optionA: "A separate failure domain — the app degrades (falls back to Postgres) rather than crashing", optionB: "Fails with the process — no separate failure mode to reason about, and no recovery path either" },
      { dimension: "Operational complexity", optionA: "Another managed service to run/monitor (Upstash in Portfolio Mode)", optionB: "None — it's just a JS object" },
    ],
    currentReality:
      "LivePulse uses Redis specifically because the WebSocket gateway's horizontal-scaling design (ADR-006) depends on shared state and a shared pub/sub channel — an in-memory cache would make that design impossible the moment a second gateway instance existed, even though today only one instance actually runs.",
    whenIdChooseEach:
      "Redis whenever more than one process instance needs to see the same state, or pub/sub fan-out is part of the design — true here even at low scale, because the fan-out design is the point. An in-memory cache is the right call for genuinely single-instance, single-process caching where the complexity of a separate service buys nothing.",
  },
  {
    id: "monolith-vs-microservices",
    title: "Modular Monolith vs Microservices",
    optionALabel: "Modular Monolith (current)",
    optionBLabel: "Microservices",
    rows: [
      { dimension: "Deployment complexity", optionA: "One process, one deploy — genuinely simple", optionB: "N services, N deploy pipelines, service discovery, inter-service auth" },
      { dimension: "Scalability", optionA: "Scales as one unit — ingestion, API, and WS gateway can't be scaled independently", optionB: "Each service scales independently to its own actual bottleneck" },
      { dimension: "Development speed", optionA: "Fast — one codebase, one language boundary, shared types end to end", optionB: "Slower per-change — cross-service contracts, versioning, more coordination" },
      { dimension: "Failure isolation", optionA: "A crash in one concern (e.g. the WS gateway) can take down the others sharing the process", optionB: "A crash in one service doesn't directly take down another" },
      { dimension: "Operational cost", optionA: "One thing to run, monitor, and pay for", optionB: "N things to run, monitor, and pay for — real money and real operational surface" },
    ],
    currentReality:
      "LivePulse runs ingestion, API, and WebSocket gateway as one Node process in Portfolio Mode (ADR-008) — a deliberate, explicitly-accepted €0/month tradeoff, not the target architecture. The module boundaries inside that process already match where a Production Mode split would happen (ingestion / API / gateway are separate modules today, just not separate deployables).",
    whenIdChooseEach:
      "I'd keep the modular monolith until traffic or team size actually demands independent scaling or independent failure isolation — which is exactly the honest Production Mode plan documented in scalability.md: split the monolith's existing module boundaries into separate deployables once real traffic justifies it, not before.",
  },
];
