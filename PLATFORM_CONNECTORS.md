# Platform Connectors

Modular ingestion architecture for external platforms. Each connector is independently replaceable.

---

## Design Goals

1. **Replaceable** — Swap or disable a platform without touching score engine or dashboard core
2. **Snapshot-native** — Connectors produce durable snapshots; nothing else reads live APIs
3. **Resilient** — API shape changes are isolated to the connector layer
4. **Normalized output** — Downstream systems consume a shared internal schema

---

## Connector Contract

Every platform connector implements:

```typescript
interface PlatformConnector {
  platform: PlatformId; // e.g. "instagram"

  /** Fetch raw data from external source and persist snapshot */
  ingest(creatorExternalId: string): Promise<IngestResult>;

  /** Map latest or specified raw snapshot to normalized form */
  normalize(snapshotId: string): Promise<NormalizedCreatorSnapshot>;

  /** Health check for connector-specific config and API reachability */
  healthCheck(): Promise<ConnectorHealth>;
}

interface IngestResult {
  snapshot_id: string;
  creator_external_id: string;
  captured_at: string;
  raw_payload_ref: string; // storage path or JSONB ref
  status: "success" | "partial" | "failed";
  errors?: string[];
}

interface NormalizedCreatorSnapshot {
  snapshot_id: string;
  platform: PlatformId;
  external_id: string;
  username: string;
  display_name?: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  engagement_metrics: EngagementMetrics;
  recent_posts?: NormalizedPost[];
  profile_metadata: Record<string, unknown>;
  captured_at: string;
}
```

Connectors do **not** compute scores. Scoring reads normalized snapshots only.

---

## Pipeline

```
External API / source
        │
        ▼
   [ Connector.ingest ]
        │
        ▼
   raw_snapshots (immutable)
        │
        ▼
   [ Connector.normalize ]
        │
        ▼
   normalized_snapshots
        │
        ▼
   Score engine (versioned)
```

Ingestion may be triggered by:

- User lookup (on-demand, with cache TTL)
- Scheduled refresh (batch jobs via Edge Functions or pg_cron)
- Webhook (future; only if platform supports stable delivery)

---

## Phase 1: Instagram

**Status:** Planned  
**Priority:** First and only platform in Phase 1

### Scope

- Public profile metadata (username, bio, counts)
- Recent posts sample for engagement signals
- Historical re-ingest on schedule or manual refresh

### Storage

| Table | Contents |
|-------|----------|
| `creators` | Stable identity: internal ID, platform, external ID, username |
| `raw_snapshots` | Platform-native JSON, `captured_at`, ingest status |
| `normalized_snapshots` | Canonical fields for scoring and UI |

### Failure modes

| Failure | Behavior |
|---------|----------|
| API rate limit | Queue retry; serve last successful snapshot |
| Profile private/deleted | Mark creator status; show last known snapshot with staleness warning |
| API schema change | Connector version bump; old raw snapshots retained |

### Connector versioning

Connectors have their own version (e.g. `instagram_connector_v1`) independent of score models. Normalization logic changes bump connector version; raw snapshots are never mutated.

---

## Future Platforms (Phase 3+)

Candidates: TikTok, YouTube, X, LinkedIn.

Adding a platform requires:

1. New connector implementing the contract
2. Platform-specific raw snapshot table or discriminated `platform` column
3. Mapping into `NormalizedCreatorSnapshot` (extend schema only if necessary)
4. Score model update if platform-specific signals are needed (prefer shared dimensions)

No dashboard rewrite. No score engine fork.

---

## Explicit Non-Patterns

- **No real-time read-through** — Dashboard never calls Instagram (or any platform) directly
- **No monolithic scraper service** — One deployable unit per connector
- **No duplicate analytics DB** — Postgres is the single source of truth
- **No Firebase / MongoDB** for connector state unless a future ADR justifies it

---

## Security & Compliance

- Store only data needed for creator evaluation
- Respect platform ToS and rate limits
- Do not ingest private data without authorization
- Audit log for ingest runs: who triggered, when, outcome

See [DECISIONS.md](./DECISIONS.md) ADR-002 and ADR-005.
