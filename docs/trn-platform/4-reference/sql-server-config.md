# SQL Server Configuration

## Connection Details

| Setting | Value |
|---------|-------|
| DB_SERVER | `localhost` (default) or via `DB_SERVER` env var |
| DB_PORT | `1433` (default) |
| DB_USER | Via `DB_USER` env var |
| DB_PASSWORD | Via `DB_PASSWORD` env var |
| Driver | `mssql` (tedious) via multi-pool |

## Databases

### qc_training

The primary training database. Contains all training-specific data:

- `step_library` -- Reusable step definitions (SQL, shell, manual)
- `flow` -- Named flows grouping steps into sequences
- `flow_step` -- Junction table: flow-to-step with seq, pause_after, presenter_notes
- `composition` -- Stories, tutorials, modules
- `composition_block` -- Ordered blocks within compositions (narrative, flow, note, composition-ref)

### qc_core

Production reference database (read-only from training perspective). Contains:

- `member` -- Member enrollment records
- `pcp` -- Primary care provider assignments
- `claim` -- Claims adjudication records
- `referral` -- Specialist referral records
- `qcap` -- Quality care action plans

## Multi-Pool Pattern

The server uses a multi-pool connection manager (`packages/shared/src/db/index.ts`) that maintains separate connection pools for each database. This avoids cross-database queries and keeps connections isolated.

```typescript
import { getPool } from '@trn-platform/shared';

const trainingPool = await getPool('qc_training');
const corePool = await getPool('qc_core');
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary Keys | `INT IDENTITY` | SQL Server convention; auto-incrementing |
| String type | `NVARCHAR` | Unicode support for all text fields |
| No ORM | Raw parameterized SQL | Full SQL Server feature access; no abstraction leaks |
| Auth | Express middleware | No RLS in SQL Server; auth enforced at API layer |
| Connection | `mssql` with tedious | Native Node.js driver; reliable pool management |

## Environment Variables

```
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=<password>
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

For local development, these go in `.env` at the project root (not committed).
