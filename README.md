# LivePulse Architecture Lab

An interactive companion to [LivePulse](https://github.com/matucs/LivePulse) —
a real-time sports intelligence platform. This is not a diagram-only mockup:
every component, decision, comparison, scaling stage, and incident on this
page traces to a real file, ADR, or commit in the LivePulse repository.
Nothing here is invented.

**Live LivePulse**: https://livepulse-ten.vercel.app
**LivePulse source**: https://github.com/matucs/LivePulse

## How to read this project

If you're visiting the deployed page (not just the code), the fastest path
to understanding is:

1. **Diagram section → "Follow: Match score changed"** — click that button,
   then step through with Next/Prev. This animates one real event (a goal)
   through every component, from the external API to the browser. It's
   designed to take about 30 seconds and is the single best entry point.
2. **Click any node** in the diagram (outside follow mode) to see that
   component's purpose, why it exists, trade-offs, failure mode, scaling
   behavior, and links to the real LivePulse source files.
3. Everything below the diagram is optional depth, in roughly this order of
   usefulness:
   - **Decisions** — the 8 real ADRs LivePulse's architecture is built on.
   - **Why Not?** — honest comparisons (Kafka vs RabbitMQ, WebSocket vs
     polling, Redis vs in-memory cache, monolith vs microservices) that
     separate what LivePulse *actually does* from what I'd choose at a
     different scale.
   - **Scaling** — three stages from what's actually deployed today to a
     hypothetical production-scale projection, plus a Measured vs Projected
     metrics table (no invented numbers — anything not measured says so).
   - **Under Failure** — real, documented bugs found while building and
     testing LivePulse, including a WebSocket race condition found via a
     flaky CI run and fixed for real (commit `a72e618`).
   - **Evolution** — the phase-by-phase build timeline.
   - **Principles** — engineering principles the project demonstrates, each
     paired with concrete evidence.

Throughout the page, badges mark every claim as one of three things, and
they're never mixed up:

- 🟢 **Current Architecture** — what's actually running right now.
- 🟡 **Architecture projection** — designed, not built or measured.
- ⚪ **Alternative design** — what I'd choose differently, and when.

## What this project is (and isn't)

- It's a **separate portfolio artifact**, not part of LivePulse's production
  codebase — LivePulse's own repo, tests, and CI are untouched.
- It's a **static frontend** — no backend of its own. All data lives in
  `architecture/*.ts` as structured TypeScript, not scattered across
  components.
- It **only shows what's real**. If LivePulse doesn't have an ADR, incident,
  or metric for something, it doesn't appear here — see
  `docs/engineering-review.md` in LivePulse for the honest list of what's
  still unverified or unbuilt.

## Project structure

```text
architecture/
  components.ts    Diagram nodes — purpose, trade-offs, failure mode, scaling, code refs
  connections.ts    Diagram edges — real data-flow paths from docs/architecture.md
  eventFlows.ts    "Follow an event" step sequences
  decisions.ts     The 8 ADRs, summarized with real alternatives/trade-offs/consequences
  comparisons.ts   "Why not?" architecture comparisons
  scaling.ts       Current → projected scaling stages
  metrics.ts       Measured vs projected numbers
  incidents.ts     Real bugs: failure / detection / root cause / fix / verification / lesson
  timeline.ts      Phase-by-phase build history
  principles.ts    Engineering principles + evidence
  github.ts        Single source of truth for every LivePulse repo link

components/        UI — one component per section, plus the React Flow diagram
app/               Next.js App Router entry (layout.tsx, page.tsx, globals.css)
```

To update content, edit the relevant file in `architecture/` — the UI
components read from these directly, so there's no need to touch JSX to
correct a fact or add an ADR.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # production build
```

## Deployment

Static/SSR Next.js — deployable on Vercel with no backend or environment
variables required.
