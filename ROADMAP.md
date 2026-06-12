# Roadmap

Phased delivery aligned with architectural constraints: snapshot-first, explainable scoring, minimal infrastructure.

---

## Phase 1 — Foundation

**Goal:** Prove the core loop—ingest, score, explain, snapshot—for one platform.

| Deliverable | Description |
|-------------|-------------|
| Instagram connector | Modular ingestion pipeline; stores raw + normalized snapshots |
| Score engine v1 | `score_v1` with documented inputs, weights, and outputs |
| Breakdown explanations | UI and API surfaces that expose every score component |
| Historical snapshots | Time-series storage; compare creator state across dates |
| Basic web dashboard | React app: lookup creator, view score, read breakdown, browse history |

**Exit criteria:**

- End-to-end flow works from stored snapshots without live API dependency at read time
- Score is reproducible given a snapshot ID and model version
- One internal or design-partner user can evaluate a creator in under 2 minutes

**Explicitly out of scope:** Search, billing, multi-platform, mobile polish.

---

## Phase 2 — Business Value

**Goal:** Make Mirrors usable and payable by agencies and brands.

| Deliverable | Description |
|-------------|-------------|
| Creator search | Filter and discover creators in the indexed catalog |
| Agency dashboard | Multi-creator views, saved lists, team-oriented UX |
| Exports | PDF/CSV (or similar) reports with score + breakdown + snapshot metadata |
| First paying customer | Pricing, auth, and entitlement for at least one revenue event |

**Exit criteria:**

- Agency workflow: search → compare → export without engineering support
- At least one paying customer validates willingness to pay for interpretation, not raw data

---

## Phase 3 — Scale & Intelligence

**Goal:** Expand platforms and add recommendation-layer products.

| Deliverable | Description |
|-------------|-------------|
| Additional platforms | Second connector (e.g. TikTok or YouTube) using shared connector contract |
| Recommendation systems | Suggest creators by niche, audience fit, or campaign criteria |
| Campaign intelligence | Aggregate insights across a set of creators for a campaign |

**Exit criteria:**

- New platform added without rewriting score engine or dashboard core
- Recommendations cite explainable features, not opaque embeddings alone

---

## Phase 4 — Network Layer

**Goal:** Relationship and influence intelligence across the creator graph.

| Deliverable | Description |
|-------------|-------------|
| Relationship graph | Stored edges between creators (collabs, mentions, shared audience signals) |
| Network analysis | Clustering, reach amplification, community structure |
| Influence mapping | Visual and queryable maps of how influence flows |

**Exit criteria:**

- Graph derived from stored snapshots and public signals—not live platform dependency
- Insights remain explainable and auditable

---

## Cross-Cutting (All Phases)

- Version every scoring model; never overwrite historical scores silently
- Document decisions in [DECISIONS.md](./DECISIONS.md)
- Keep connector logic isolated per [PLATFORM_CONNECTORS.md](./PLATFORM_CONNECTORS.md)
- Prefer Supabase + PostgreSQL + Edge Functions; avoid new infrastructure unless justified
