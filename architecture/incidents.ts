import { repoFile, repoCommit } from "./github";

export interface Incident {
  id: string;
  title: string;
  date: string;
  failure: string;
  detection: string;
  rootCause: string;
  fix: string;
  verification: string;
  lesson: string;
  links: { label: string; url: string }[];
  featured?: boolean;
}

export const incidents: Incident[] = [
  {
    id: "websocket-subscribe-race",
    title: "The WebSocket subscribe race: OPEN doesn't mean subscribed",
    date: "2026-09-09",
    featured: true,
    failure:
      "A Playwright E2E test (§25 live-update test) published a Redis update once the client's WebSocket reached readyState OPEN, then asserted the new score appeared. It passed reliably on a local machine but failed consistently in CI — the page kept showing the original fixture score; the published update never arrived at all.",
    detection:
      "Traced from the CI trace's actual page snapshot, not guessed: the failing assertion's screenshot showed the pre-update score still on screen, which ruled out 'just needs a longer timeout' before that fix was even tried. A first attempt bumped the assertion timeout to 10s — it didn't help, because nothing was slow; something was simply lost.",
    rootCause:
      "The client socket reaching readyState OPEN only proves the WebSocket handshake finished — it says nothing about whether the server has issued its Redis SUBSCRIBE for that match's ws:match:{id} channel yet, which happens asynchronously after the server receives the client's subscribe message. The test published to Redis in that exact window. This is precisely ADR-006's own documented tradeoff: Redis pub/sub has no delivery guarantee for a message published before a subscriber exists. Locally, that race was apparently always won; CI's colder first database query (buildMatchSnapshot's first real Postgres round trip) widened the window enough to lose it consistently.",
    fix:
      "Changed the test to wait for the actual match:snapshot message — which the server sends only after it has subscribed to Redis — instead of waiting on the client socket's readyState. No application code changed; the gateway's subscribe-then-snapshot ordering was already correct, the test's synchronization assumption was wrong.",
    verification:
      "6/6 runs passed locally across 3 repeated executions against a freshly seeded, isolated backend mirroring CI's own setup, each completing in under a second — where the old race-prone version needed the full retry-and-timeout path to occasionally pass at all.",
    lesson:
      "A connection being OPEN is not the same claim as 'the server-side subscription this connection depends on is ready.' Any test (or client) that synchronizes on transport-level readiness instead of an application-level confirmation is racing the exact gap between the two — wait for the signal that means what you actually need it to mean.",
    links: [
      { label: "Fix commit: a72e618", url: repoCommit("a72e618998b3d947609febb9436f7674d00b25a8") },
      { label: "live-update.spec.ts", url: repoFile("frontend/e2e/live-update.spec.ts") },
      { label: "ADR-006: WebSocket architecture", url: repoFile("docs/adr/ADR-006-websocket-architecture.md") },
    ],
  },
  {
    id: "provider-errors-field-silently-ignored",
    title: "A rejected API-Football query looked like 'zero results,' not 'refused'",
    date: "2026-09-06",
    failure:
      "The free tier rejects every season-scoped fixture/standings query with an HTTP 200 and an errors field explaining the rejection — but the provider client wasn't checking the errors field at all, so a rejected query silently looked identical to a legitimate empty result.",
    detection:
      "Found during real-key validation against a live API-Football key, not from documentation review — Phase 1 research had confirmed the rate limits but hadn't tested every season-scoped endpoint against a real key.",
    rootCause:
      "ApiFootballProvider.request() parsed only the results payload and never inspected the errors field API-Football returns alongside a 200 status on plan-restricted queries.",
    fix:
      "Every response type now carries errors, checked in request(); a new provider-agnostic ProviderQueryRejectedError lets ingestion distinguish a permanent plan rejection from a transient failure, logging it once and marking that request category permanently rejected for the day (QuotaManager.markPermanentlyRejected) so it stops burning quota on a request that can never succeed.",
    verification:
      "Confirmed by direct testing against the real API-Football account — the exact error payload (\"Free plans do not have access to this season, try from 2022 to 2024.\") was captured and used to drive the fix, not synthesized.",
    lesson:
      "An HTTP 200 is not proof of success when a provider encodes real failures inside the response body. Treat a provider's documented error envelope as load-bearing, not optional to check.",
    links: [
      { label: "ADR-002 addendum", url: repoFile("docs/adr/ADR-002-polling-strategy.md") },
      { label: "ApiFootballProvider.ts", url: repoFile("backend/src/providers/ApiFootballProvider.ts") },
    ],
  },
  {
    id: "standings-candidate-pool-starved",
    title: "Cross-provider standings reconciliation was starved, not broken",
    date: "2026-09-06",
    failure:
      "football-data.org standings rows failed to reconcile against API-Football team rows far more often than expected once tested against real data.",
    detection:
      "Real-key validation: the first implementation scoped candidate teams to 'teams that played this specific tracked league,' which seemed like a safe scoping choice but produced a near-empty candidate pool once tested for real.",
    rootCause:
      "live=all's actual coverage of the six tracked leagues on any given poll is sparse enough that very few teams from a league had actually appeared in a live match yet — starving the name-matching candidate pool almost entirely. The matching logic itself was correct; its input set was too small.",
    fix:
      "Broadened the candidate pool to all known teams ever ingested by API-Football, not just ones seen live in the tracked league. teamRepository.getAllKnownTeams documents the measured evidence behind this change.",
    verification:
      "96 real Premier League/La Liga/Serie A/Bundesliga/Ligue 1 standings rows landed in Postgres with correct provider attribution after the fix.",
    lesson:
      "A reconciliation algorithm can be correct and still fail in practice if its candidate set is implicitly too narrow — verify the input population against real data before trusting the matching logic is the problem (or isn't).",
    links: [
      { label: "ADR-007 addendum", url: repoFile("docs/adr/ADR-007-provider-abstraction.md") },
      { label: "teamNameMatch.ts", url: repoFile("backend/src/domain/teamNameMatch.ts") },
    ],
  },
  {
    id: "tanstack-query-retried-404",
    title: "A permanent 404 was retried three times before the UI gave up",
    date: "2026-09-09",
    failure:
      "A new Playwright E2E suite, run against the real backend/database/WebSocket gateway (not mocked), caught a real UX bug: TanStack Query's default retry policy retried a permanent 404 three times with exponential backoff, leaving a user looking at a loading skeleton for 7+ seconds before any error appeared.",
    detection:
      "Phase 7 E2E testing against real infrastructure surfaced this directly — a case fixture-based unit tests, which mock the network layer, would not have caught.",
    rootCause:
      "The default query client retried every failed request uniformly, without distinguishing a 404 (which cannot succeed on retry) from a transient network or 5xx error (which might).",
    fix:
      "Query client configured to stop retrying 4xx responses — the same 'don't retry what can't succeed' principle already applied throughout the backend's own retry/circuit-breaker logic (ADR-002), now applied consistently on the frontend too.",
    verification:
      "Covered by the new Playwright E2E suite as part of CI's fixture-seeded E2E job.",
    lesson:
      "Retry policies need to know the difference between 'might succeed later' and 'will never succeed' — applying one retry policy uniformly to all failures is itself a design decision, and here it was the wrong one.",
    links: [
      { label: "README: Phase 7 testing", url: repoFile("README.md") },
      { label: "QueryProvider.tsx", url: repoFile("frontend/lib/QueryProvider.tsx") },
    ],
  },
];
