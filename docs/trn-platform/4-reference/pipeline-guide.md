# Pipeline Guide: How TRN Platform Was Generated

## Origin

TRN Platform was generated from the **lar-platform** pipeline -- a proven monorepo scaffolding system that creates domain-driven pnpm workspaces with a consistent 4-layer architecture.

## Generation Steps

### 1. Domain Definition

Input: 4 domains (steps, flows, compositions, execution) with their schemas, relationships, and API routes.

- `steps` -- CRUD for reusable step library items
- `flows` -- CRUD for flows + flow_steps (ordered step sequences)
- `compositions` -- CRUD for compositions + blocks (narrative, flow, note, composition-ref)
- `execution` -- SSE-based step execution, training status, ad-hoc SQL

### 2. Schema Generation

Zod schemas generated in `packages/shared/src/schemas/` for each domain. Each domain gets:
- Base schema matching DB table shape
- List item schema (lighter, for list views)
- Create schema (required fields for POST)
- Update schema (partial, for PATCH)
- Response schemas (arrays)

### 3. Layer Generation

For each domain, 4 layers generated:

**Server** (`packages/{domain}/server/`):
- Express routes with validation middleware
- SQL query functions using parameterized queries
- Vitest config

**Data Access** (`packages/{domain}/data-access/`):
- Query key factory
- TanStack Query hooks (useQuery, useMutation)
- API client with fetch wrapper

**Feature** (`packages/{domain}/feature/`):
- Business logic hooks orchestrating data-access
- Filtering, sorting, derived state

**UI-MUI** (`packages/{domain}/ui-mui/`):
- MUI components with Emotion styling
- Co-located Storybook stories
- Index barrel exports

### 4. Infrastructure Generation

- `.storybook/` configuration with path aliases
- `apps/component-demo/` with Vite + React + MUI
- Vitest base config
- TypeScript layer configs
- Root scripts and workspace config

## Customization After Generation

Post-generation customizations for TRN Platform:

1. **SQL Server specifics** -- `INT IDENTITY` PKs, `NVARCHAR` strings, `mssql` driver
2. **Dual database** -- qc_training + qc_core pool management
3. **SSE execution** -- Real-time step execution with server-sent events
4. **Training-specific UI** -- Pause points, presenter notes, console output
5. **Composition blocks** -- Polymorphic block types (narrative, flow, note, composition-ref)

## Relationship to Other Platforms

| Platform | Domain | Backend |
|----------|--------|---------|
| pfm-platform | Personal Finance | Supabase (PostgreSQL) |
| lar-platform | LAR Pipeline | Template/Generator |
| trn-platform | QC Training | SQL Server + Express |

All three share the same architectural DNA: pnpm monorepo, layered packages, MUI 7, TanStack Query, Storybook 10, Vitest.
