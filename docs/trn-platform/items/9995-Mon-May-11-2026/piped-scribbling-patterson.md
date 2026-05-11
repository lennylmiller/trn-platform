# Experiment 7.5: MCP-Centric AI Architecture

## Context

The chat service currently reimplements 11 tools separately from the MCP server's 30 tools. This is duplication that will drift. The MCP server should be the single source of truth for tool definitions and execution. The chat service becomes a thin layer: receive user message → call Claude with MCP-provided tools → proxy tool calls to MCP server → return results.

This also sets up the architecture for future pluggable AI providers (Claude Code SDK, OpenAI, Gemini) — they all use the same MCP tool layer.

**Branch from:** `experiment/7-new-course-flow` (stable, all tests pass)
**Branch name:** `experiment/7.5-mcp-centric-approach`

## What Changes

### 1. Chat service spawns MCP server as child process

**File:** `packages/chat/server/src/mcp-client.ts` (NEW)

- Spawn `npx tsx packages/mcp-server/src/index.ts` as a child process
- Connect via `StdioClientTransport` from `@modelcontextprotocol/sdk/client/stdio.js`
- Initialize `Client` from `@modelcontextprotocol/sdk/client/index.js`
- On connect: call `client.listTools()`, cache tool definitions
- Export: `getMcpTools()` → Anthropic Tool[] format, `callMcpTool(name, args)` → string result
- Lazy initialization: spawn on first use, reuse connection
- Graceful shutdown: kill child process on SIGTERM

### 2. Rewrite chat service to use MCP client

**File:** `packages/chat/server/src/service.ts` (MODIFY)

Replace:
- `import { CHAT_TOOLS, executeTool }` → `import { getMcpTools, callMcpTool }`
- `tools: CHAT_TOOLS` → `tools: await getMcpTools()`
- `executeTool(name, input)` → `callMcpTool(name, input)`

The agentic loop structure stays the same — only the tool source and executor change.

### 3. Keep guardrails in a filter layer

**File:** `packages/chat/server/src/tool-filter.ts` (NEW)

The SQL read-only guard and tool filtering move here:
- `filterToolsForChat(allMcpTools)` → returns subset of tools appropriate for chat (exclude dangerous ones)
- `validateToolCall(name, input)` → pre-execution guard (SQL read-only check)
- Schema cache and system prompt stay unchanged — they're prompt-level, not tool-level

### 4. Delete duplicate tool code

**File:** `packages/chat/server/src/tools.ts` (DELETE)
**File:** `packages/chat/server/src/api-client.ts` (DELETE)

These are replaced by the MCP client. All tool definitions and execution now flow through the MCP server.

### 5. Add MCP SDK to chat-server dependencies

**File:** `packages/chat/server/package.json`

Add: `"@modelcontextprotocol/sdk": "^1.29.0"`

## Architecture After

```
Browser (ChatPanel)
    ↓ POST /api/v2/chat
Express (chat service)
    ↓ getMcpTools() → tool definitions
    ↓ anthropic.messages.create() with MCP tools
    ↓ tool_use response from Claude
    ↓ validateToolCall() → guardrail check
    ↓ callMcpTool(name, input) → stdio
MCP Server (child process)
    ↓ tool execution (shared tools + Express API proxy)
    ↓ result
Express (chat service)
    ↓ return to Claude loop
    ...
```

**Single tool implementation.** MCP server is the source of truth. Chat service is a thin orchestrator.

## Files

| File | Action |
|---|---|
| `packages/chat/server/src/mcp-client.ts` | **NEW** — MCP client, spawn, connect, callTool |
| `packages/chat/server/src/tool-filter.ts` | **NEW** — SQL guard, tool subset filter |
| `packages/chat/server/src/service.ts` | **MODIFY** — use MCP client instead of direct tools |
| `packages/chat/server/src/tools.ts` | **DELETE** — replaced by MCP client |
| `packages/chat/server/src/api-client.ts` | **DELETE** — replaced by MCP client |
| `packages/chat/server/src/system-prompt.ts` | **KEEP** — unchanged (prompt-level, not tool-level) |
| `packages/chat/server/src/schema-cache.ts` | **KEEP** — unchanged |
| `packages/chat/server/package.json` | **MODIFY** — add @modelcontextprotocol/sdk |

## What Stays the Same

- ChatPanel UI component — no changes
- useChatSession hook — no changes
- System prompt + schema cache — no changes
- CourseEditor integration — no changes
- React Query invalidation chain — no changes
- MCP server tool implementations — no changes
- All 28 courses server tests — no changes (they test Express API, not chat)

## Verification

1. `pnpm --filter @trn-platform/chat-server build` — compiles
2. `pnpm server:dev` — server starts, MCP child process spawns
3. Open `/courses/edit/4`, click AI Author
4. Type: "Show me the current course structure" → AI calls `get_course` via MCP
5. Type: "Build a lesson about naming conventions" → AI calls `build_course_content` via MCP
6. Verify outline refreshes
7. `pnpm --filter @trn-platform/courses-server test` — 28 tests still pass
8. `./scripts/smoke-test.sh` — all pass

## Rollback

If this doesn't work well, we stay on `experiment/7-new-course-flow` (the current stable branch). This is a throwaway experiment — no risk to main.
