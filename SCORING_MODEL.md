# Scoring Model

How Mirrors scores creators: versioning, explainability, and storage conventions.

---

## Principles

1. **Every score has a version** — `score_v1`, `score_v2`, etc. Versions are immutable once published.
2. **Every score is explainable** — A headline number is never sufficient; breakdowns are required.
3. **Scores bind to snapshots** — A score is computed from a specific snapshot at a specific time, not from live API data.
4. **Reproducibility** — Given `(creator_id, snapshot_id, model_version)`, the score can be recomputed identically.

---

## Model Lifecycle

```
Draft → Published → Deprecated
```

| State | Behavior |
|-------|----------|
| **Draft** | Internal only; may change freely |
| **Published** | Frozen definition; used for new scoring runs |
| **Deprecated** | No new runs; historical scores retained |

Publishing a new version does **not** retroactively change existing scores. Old scores remain tied to their version.

---

## score_v1 (Placeholder)

Phase 1 defines the first model. Structure below is the contract; weights and inputs will be finalized during implementation.

### Intended dimensions

| Component | Description | Example signals (from snapshot) |
|-----------|-------------|----------------------------------|
| **Audience quality** | Authenticity and relevance of followers | Follower/following ratio patterns, engagement distribution |
| **Engagement health** | Quality of interaction vs. vanity metrics | Comment/like ratio, engagement rate vs. peer baseline |
| **Growth stability** | Organic vs. erratic growth | Follower delta over snapshot history, spike detection |
| **Content consistency** | Posting cadence and coherence | Post frequency, format mix |

### Output shape

```typescript
interface ScoreResult {
  model_version: "score_v1";
  snapshot_id: string;
  creator_id: string;
  computed_at: string; // ISO 8601

  headline: {
    score: number;       // 0–100 normalized
    label: string;       // e.g. "Strong", "Moderate", "Needs review"
  };

  breakdown: BreakdownComponent[];

  metadata: {
    peer_cohort?: string;  // niche used for comparison, if any
    data_completeness: number; // 0–1, how much input data was available
  };
}

interface BreakdownComponent {
  id: string;              // e.g. "audience_quality"
  label: string;           // human-readable name
  score: number;           // 0–100 component score
  weight: number;          // contribution weight (sums to 1.0)
  weighted_contribution: number;

  inputs: {
    key: string;
    label: string;
    value: number | string | boolean;
    unit?: string;
  }[];

  explanation: string;     // plain-language summary for UI
}
```

### Explainability requirements

- UI must render every `breakdown` component with inputs visible on expand
- Weights must sum to 1.0 and be documented in this file when v1 is finalized
- If data is missing, component score is omitted or marked `insufficient_data`—never imputed silently
- No component may use undisclosed third-party or hidden features

---

## Storage

Recommended tables (conceptual):

| Table | Purpose |
|-------|---------|
| `score_models` | Version registry: `version`, `published_at`, `definition_json` |
| `creator_scores` | Computed scores: `creator_id`, `snapshot_id`, `model_version`, `headline_score`, `breakdown_json`, `computed_at` |

Indexes: `(creator_id, computed_at DESC)`, `(snapshot_id, model_version)`.

---

## Re-scoring

- **New snapshot ingested** → optionally trigger score run for latest published model
- **New model published** → batch re-score recent snapshots; retain old version rows
- **Manual re-run** → admin/tooling only; logs `computed_at` and does not delete prior results

---

## Non-Goals

- Credit or civic scoring
- Scores for individuals without consent (creator profiles are in-scope when publicly evaluated for business use)
- Opaque ML models without per-feature attribution in Phase 1
- Real-time score updates tied to live platform APIs

---

## Future versions

`score_v2+` may add:

- Niche-relative percentile ranks
- Cross-platform composite (requires multi-platform snapshots)
- Campaign-fit sub-scores for brand use cases

Each version gets its own section in this document before publication.
