# MCP & AI Architecture — QC Training Platform

## Overview

The qc-training app has two AI integration paths and three MCP-capable servers. This document maps who uses what, through which path, and for what purpose.

## Use Case Diagram

```plantuml
@startuml
title QC Training Platform — AI & MCP Use Cases

left to right direction
skinparam actorStyle awesome

' ===== Actors =====
actor "Course Author\n(Browser)" as Author
actor "Developer\n(Claude Code CLI)" as Dev
actor "Automation\n(hooksai)" as Hooks

' ===== Systems =====
rectangle "qc-training App\n(React SPA)" as App {
  usecase "Create Course\n(modal form)" as UC_Create
  usecase "Edit Slides\n(SlideEditorForm)" as UC_Edit
  usecase "AI Author\n(ChatPanel)" as UC_AI
  usecase "Preview Course\n(CoursePlayer)" as UC_Preview
  usecase "Manage Tracks\n(TrackSelector)" as UC_Tracks
  usecase "Export/Import\nCourse" as UC_Export
}

rectangle "Express API Server\n(localhost:3001)" as Express {
  usecase "Course CRUD\n/api/v2/courses" as UC_CRUD
  usecase "Track CRUD\n/api/v2/courses/tracks" as UC_TrackCRUD
  usecase "Bulk Build\n/api/v2/courses/:id/build" as UC_Build
  usecase "Chat Endpoint\n/api/v2/chat" as UC_Chat
}

rectangle "Chat Service\n(Agentic Loop)" as ChatSvc {
  usecase "Claude Sonnet 4\n(Anthropic SDK)" as UC_Claude
  usecase "explore_schema" as UC_Schema
  usecase "run_sql" as UC_SQL
  usecase "build_course_content" as UC_BulkTool
  usecase "get_course" as UC_GetCourse
}

rectangle "trn-platform\nMCP Server\n(stdio)" as MCP {
  usecase "30 Tools\n(steps, flows, stories,\ncourses, SQL, shell)" as UC_MCP_Tools
}

rectangle "capture-mcp\n(planned)" as CaptureMCP {
  usecase "triage_capture" as UC_Triage
  usecase "draft_lesson" as UC_Draft
  usecase "move_to_curated" as UC_Curate
}

database "SQL Server" as DB {
  usecase "qc_training\n(courses, lessons, slides)" as UC_Training
  usecase "qc_core\n(members, claims,\nproviders, benefits)" as UC_Core
}

' ===== Actor → System connections =====
Author --> UC_Create
Author --> UC_Edit
Author --> UC_AI
Author --> UC_Preview
Author --> UC_Tracks
Author --> UC_Export

Dev --> UC_MCP_Tools : "stdio (Claude Code)"

Hooks --> UC_Triage : "file watcher\n(planned)"

' ===== App → Express =====
UC_Create --> UC_CRUD
UC_Edit --> UC_CRUD
UC_Tracks --> UC_TrackCRUD
UC_Export --> UC_CRUD
UC_AI --> UC_Chat

' ===== Chat Service internals =====
UC_Chat --> UC_Claude
UC_Claude --> UC_Schema
UC_Claude --> UC_SQL
UC_Claude --> UC_BulkTool
UC_Claude --> UC_GetCourse

' ===== Tool → Express (internal proxy) =====
UC_BulkTool --> UC_Build : "apiFetch\n(server-to-server)"
UC_GetCourse --> UC_CRUD : "apiFetch"

' ===== MCP → Express =====
UC_MCP_Tools --> UC_CRUD : "apiFetch\n(server-to-server)"

' ===== Shared tools → DB =====
UC_Schema --> UC_Core
UC_Schema --> UC_Training
UC_SQL --> UC_Core
UC_SQL --> UC_Training
UC_Build --> UC_Training
UC_CRUD --> UC_Training

' ===== capture-mcp (planned) =====
UC_Triage --> UC_Draft
UC_Draft --> UC_Curate

@enduml
```

## System Boundary Diagram

```plantuml
@startuml
title System Boundaries — What Talks to What

skinparam componentStyle rectangle

package "Browser" {
  [qc-training App\n(React)] as App
}

package "Express Server (port 3001)" {
  [Course Routes] as CourseRoutes
  [Chat Routes] as ChatRoutes
  [Step/Flow/Composition Routes] as OtherRoutes

  package "Chat Service" {
    [Agentic Loop\n(service.ts)] as Loop
    [System Prompt\n(system-prompt.ts)] as Prompt
    [Tool Executor\n(tools.ts)] as ToolExec
    [API Client\n(api-client.ts)] as ChatAPI
  }
}

package "Shared Tools" {
  [explore_schema] as ExploreSchema
  [run_sql] as RunSQL
  [qc_train] as QCTrain
}

package "MCP Server (stdio)" {
  [30 MCP Tools] as MCPTools
  [API Client\n(api-client.ts)] as MCPAPI
}

package "External" {
  cloud "Anthropic API\n(Claude Sonnet 4)" as Claude
  cloud "capture-mcp\n(planned)" as CaptureMCP
  cloud "hooksai\n(planned)" as HooksAI
}

database "SQL Server" {
  [qc_training] as TrainingDB
  [qc_core] as CoreDB
}

' === Browser to Express ===
App --> CourseRoutes : "HTTP\n/api/v2/courses/*"
App --> ChatRoutes : "HTTP\n/api/v2/chat"

' === Chat Service internals ===
ChatRoutes --> Loop
Loop --> Prompt : "builds system prompt"
Loop --> Claude : "messages.create()"
Claude --> Loop : "tool_use / end_turn"
Loop --> ToolExec : "executeTool(name, input)"

' === Tool executor paths ===
ToolExec --> ExploreSchema : "SQL tools"
ToolExec --> RunSQL : "SQL tools"
ToolExec --> QCTrain : "shell tools"
ToolExec --> ChatAPI : "course CRUD"
ChatAPI --> CourseRoutes : "HTTP (localhost:3001)\nserver-to-server"

' === Shared tools to DB ===
ExploreSchema --> TrainingDB
ExploreSchema --> CoreDB
RunSQL --> TrainingDB
RunSQL --> CoreDB

' === Express to DB ===
CourseRoutes --> TrainingDB

' === MCP Server ===
MCPTools --> ExploreSchema
MCPTools --> RunSQL
MCPTools --> QCTrain
MCPTools --> MCPAPI
MCPAPI --> CourseRoutes : "HTTP (localhost:3001)\nserver-to-server"
MCPAPI --> OtherRoutes : "HTTP"

' === Future ===
HooksAI ..> CaptureMCP : "MCP client\n(planned)"

@enduml
```

## Three AI Entry Points

| Entry Point | Who Uses It | How It Connects | Tools Available |
|---|---|---|---|
| **Chat Service** (HTTP) | Course Author via browser | ChatPanel → POST /api/v2/chat → Claude API → tool executor | 11 tools: schema, SQL, shell, course CRUD, bulk build |
| **trn-platform MCP** (stdio) | Developer via Claude Code CLI | .mcp.json → stdio → MCP server → shared tools + Express API | 30 tools: all domains (steps, flows, compositions, stories, courses, SQL, shell) |
| **capture-mcp** (planned) | hooksai / Claude Code | File watcher → MCP tools for screenshot triage/processing | triage_capture, draft_lesson, move_to_curated |

## Tool Overlap

```plantuml
@startuml
title Tool Availability by Entry Point

skinparam class {
  BackgroundColor<<shared>> LightGreen
  BackgroundColor<<mcp>> LightBlue
  BackgroundColor<<chat>> LightYellow
  BackgroundColor<<planned>> LightGray
}

package "Shared Tools (used by both)" <<shared>> {
  class explore_schema <<shared>>
  class run_sql <<shared>>
  class qc_train <<shared>>
}

package "MCP-Only Tools" <<mcp>> {
  class list_steps <<mcp>>
  class get_step <<mcp>>
  class create_step <<mcp>>
  class update_step <<mcp>>
  class run_step <<mcp>>
  class list_flows <<mcp>>
  class list_compositions <<mcp>>
  class list_stories <<mcp>>
  class get_story <<mcp>>
  class create_story <<mcp>>
  class update_story <<mcp>>
  class add_plan_items <<mcp>>
  class update_plan_item <<mcp>>
}

package "Chat-Only Tools" <<chat>> {
  class build_course_content <<chat>>
}

package "Both MCP + Chat" {
  class list_courses
  class get_course
  class create_course
  class add_course_lesson
  class add_course_slide
  class update_course
}

package "capture-mcp (planned)" <<planned>> {
  class triage_capture <<planned>>
  class draft_lesson <<planned>>
  class move_to_curated <<planned>>
}

@enduml
```

## Data Flow: Who Calls What

```
┌─────────────────────────────────────────────────────────────────┐
│                        SQL Server                               │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  qc_training  │  │   qc_core    │                             │
│  └──────┬───────┘  └──────┬───────┘                             │
│         │                  │                                     │
│         └────────┬─────────┘                                     │
│                  │                                               │
├──────────────────┼───────────────────────────────────────────────┤
│     Shared Tool Executors                                        │
│     (explore_schema, run_sql, qc_train)                         │
│                  │                                               │
│         ┌────────┴────────┐                                      │
│         │                 │                                      │
│    ┌────┴────┐      ┌────┴────┐                                  │
│    │  Chat   │      │  MCP    │                                  │
│    │ Service │      │ Server  │                                  │
│    │(11 tools)│     │(30 tools)│                                  │
│    └────┬────┘      └────┬────┘                                  │
│         │                 │                                      │
│    ┌────┴────┐           │                                      │
│    │ Claude  │           │                                      │
│    │ Sonnet  │           │                                      │
│    └────┬────┘           │                                      │
│         │                 │                                      │
│    ┌────┴────────────────┴────┐                                  │
│    │     Express API          │                                  │
│    │   (localhost:3001)       │                                  │
│    │  /api/v2/courses/*      │                                  │
│    │  /api/v2/chat           │                                  │
│    │  /api/v2/steps/*        │                                  │
│    └──────────┬──────────────┘                                  │
│               │                                                  │
├───────────────┼──────────────────────────────────────────────────┤
│               │                                                  │
│    ┌──────────┴──────────┐         ┌─────────────┐              │
│    │  qc-training App    │         │ Claude Code  │              │
│    │  (Browser, React)   │         │ (CLI, stdio) │              │
│    └──────────┬──────────┘         └──────┬──────┘              │
│               │                           │                      │
│          ┌────┴────┐                ┌────┴────┐                  │
│          │ Course  │                │Developer│                  │
│          │ Author  │                │         │                  │
│          └─────────┘                └─────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. **The qc-training app does NOT use MCP directly.** It uses the Chat Service via HTTP (`POST /api/v2/chat`), which wraps Claude API with an agentic tool loop.

2. **The MCP server is for Claude Code (CLI).** When you (the developer) run Claude Code, it connects to the trn-platform MCP server over stdio and gets 30 tools.

3. **Both Chat and MCP share the same 3 core tools** (explore_schema, run_sql, qc_train) via shared executors in `packages/shared/src/tools/`.

4. **Both Chat and MCP proxy CRUD through Express.** Neither talks to SQL Server directly for course/step/flow operations — they call the Express API at localhost:3001.

5. **capture-mcp and hooksai are planned** but not yet integrated. They will add screenshot processing capabilities accessible from both the app (via chat tools) and automation (via hooksai file watchers).

6. **Express is the central hub.** Every data mutation goes through it, regardless of whether the caller is the browser, the chat service, or the MCP server.
