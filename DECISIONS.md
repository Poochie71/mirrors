# Architectural Decisions

Record of significant technical and product decisions. Format: context, decision, consequences.

New entries go at the top (newest first).

---

## ADR-001: Supabase as primary backend

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Mirrors needs PostgreSQL, auth, edge compute, and a fast path to production without operating servers.

**Decision:** Use Supabase (PostgreSQL, Edge Functions, Auth, Storage) as the default backend. No EC2, Elastic Beanstalk, or separate document stores unless a future ADR overrides this.

**Consequences:**

- Analytics and snapshots live in Postgres; RLS for multi-tenant access
- Ingestion and scoring jobs run as Edge Functions or scheduled DB jobs
- Avoid MongoDB, Firebase, and custom VM fleets

---

## ADR-002: Database owns analytics; APIs are ingestion only

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Platform APIs are unreliable, rate-limited, and change without notice.

**Decision:** External platform APIs write into Mirrors' database. All product features (dashboard, exports, search, scoring) read from stored snapshots only.

**Consequences:**

- Ingestion failures degrade freshness, not availability of core features
- Every displayed metric must trace to a snapshot record with `captured_at`
- Re-scoring can run offline against historical snapshots

---

## ADR-003: Versioned scoring models

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Scores will evolve. Businesses need auditability and comparability over time.

**Decision:** Every score is tagged with a model version (e.g. `score_v1`). Model definitions are immutable once published; changes require a new version.

**Consequences:**

- Schema stores `model_version` on every score row
- UI shows which version produced a score
- Re-runs against old snapshots use explicit version selection
- See [SCORING_MODEL.md](./SCORING_MODEL.md)

---

## ADR-004: Explainable scores only

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Black-box scores erode trust and create ethical/reputational risk.

**Decision:** No hidden signals. Every score exposes a breakdown: inputs, intermediate values, weights, and human-readable explanations.

**Consequences:**

- Score engine outputs structured breakdown JSON alongside the headline number
- No ML-only scores without feature attribution in v1
- Non-goals: credit scoring, civic scoring, surveillance, scoring without consent

---

## ADR-005: Modular platform connectors

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Multi-platform support is required long-term; Instagram is Phase 1.

**Decision:** Each platform implements a shared connector contract. Connectors are independently deployable and replaceable.

**Consequences:**

- Normalized internal schema; platform-specific tables only where necessary
- Connector swap does not require dashboard or score engine rewrites
- See [PLATFORM_CONNECTORS.md](./PLATFORM_CONNECTORS.md)

---

## ADR-006: Web dashboard before mobile

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Primary customers are businesses (agencies, brands). Mobile is an acquisition funnel, not the core product.

**Decision:** Phase 1 ships a basic React web dashboard. Mobile is deprioritized until business workflows are validated.

**Consequences:**

- UI investment targets agency/brand use cases first
- Consumer-facing mobile can reuse APIs built for web

---

## ADR-007: Moat is interpretation, not collection

**Status:** Accepted  
**Date:** 2026-06-12

**Context:** Ingestion is replicable; durable value is in how data is interpreted.

**Decision:** Engineering priority: scoring quality, breakdown clarity, historical comparison, and niche-relative benchmarks—not maximizing data volume or real-time freshness.

**Consequences:**

- Product roadmap favors explainability and snapshots over live dashboards
- Competitive positioning emphasizes trust and auditability
