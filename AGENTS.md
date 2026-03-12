# AGENTS.md

> Project map for AI agents. Keep this file up-to-date as the project evolves.

## Project Overview
English Platform is a web application for learning English using the "Polyglot 16" method. The repository currently contains project context, skill setup, and architecture guidance; application source code has not been scaffolded yet.

## Tech Stack
- **Language:** TypeScript
- **Framework:** Next.js
- **Database:** PostgreSQL via self-hosted Supabase
- **Auth:** Supabase Auth
- **ORM / Data Access:** Supabase client + SQL migrations

## Project Structure
```text
.
├── .agent/                     # Existing Antigravity agent rules and workflows
├── .agents/skills/             # External skills installed from skills.sh
├── .ai-factory/                # Project-specific AI context documents
├── .ai-factory.json            # AI Factory registry and managed skill metadata
├── .codex/skills/              # Built-in Codex skills available in this repo
├── .mcp.json                   # Project-level MCP server configuration
├── AGENTS.md                   # This project structure map
└── skills-lock.json            # skills.sh lock file for installed external skills
```

## Key Entry Points
| File | Purpose |
|------|---------|
| `.ai-factory.json` | Registry of installed AI Factory skills and MCP toggles |
| `.mcp.json` | MCP server definitions for GitHub, Postgres, and Playwright |
| `.ai-factory/DESCRIPTION.md` | Product description, selected stack, and setup context |
| `.ai-factory/ARCHITECTURE.md` | Architecture rules and target folder organization |
| `skills-lock.json` | Locked external skill sources installed via `skills.sh` |

## Documentation
| Document | Path | Description |
|----------|------|-------------|
| AGENTS | `AGENTS.md` | Project map for agents and new contributors |
| Project Description | `.ai-factory/DESCRIPTION.md` | Product and stack summary |
| Architecture | `.ai-factory/ARCHITECTURE.md` | Structural rules for implementation |

## AI Context Files
| File | Purpose |
|------|---------|
| `AGENTS.md` | This file — project structure map |
| `.ai-factory/DESCRIPTION.md` | Project specification and selected tech stack |
| `.ai-factory/ARCHITECTURE.md` | Architecture decisions and implementation boundaries |

## Agent Rules
- Never combine shell commands with `&&`, `||`, or `;` — execute each command as a separate tool call.
