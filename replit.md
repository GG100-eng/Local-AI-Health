# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `artifacts/health-companion` — Local AI Health Companion
Privacy-first symptom triage portfolio prototype. 100% on-device inference, zero outbound calls after model download.

**Hard constraints**
- `@huggingface/transformers` v4.2.0
- Single-threaded WASM (no COOP/COEP), WebGPU opt-in fallback
- Models: `onnx-community/Qwen2.5-0.5B-Instruct` (q4) + `mixedbread-ai/mxbai-embed-xsmall-v1`

**Architecture**
- `src/workers/model-worker.ts` — Web Worker; handles `INIT`, `GENERATE` (streamed via TextStreamer), `EMBED`, `SWAP_MODEL`. WebGPU opt-in, falls back to single-threaded WASM. `env.allowLocalModels=false`, `env.backends.onnx.wasm.numThreads=1`.
- `src/lib/workerBus.ts` — Singleton bus; subscribers filter by payload `id`.
- `src/lib/db.ts` — IndexedDB via `idb`. Two stores: `messages`, `journal`.
- `src/lib/emergency.ts` — Regex keyword detector → triggers EmergencyChip + tel:911.
- `src/lib/handoffPdf.ts` — `jspdf` doctor handoff export (journal + last 30 chat turns).
- `src/lib/registerSw.ts` + `public/sw.js` — Service Worker counts every fetch and posts `SW_FETCH` events to subscribers; powers NetworkBadge transparency widget.
- `src/lib/systemPrompt.ts` — Three variants: `default` (general triage), `cardio` (cardiology focus), `p2p` (independent second-opinion persona).
- `src/hooks/useChat.ts` — Streaming chat with auto-save; passes `activeVariant` to worker per request.
- `src/hooks/useNetworkMonitor.ts` — Filters Vite/HMR/source-map noise from raw SW events.
- UI: `AppShell` (banner + header + iframe-WebGPU notice) → `TriageChat` (MessageList + ComposerBar + EmergencyChip) + Sheet drawers for `JournalDrawer` and `ModelMarketplace` + `Dialog` for `SecondOpinionModal` + fixed `NetworkBadge`.

**SessionStorage keys**: `disclaimer_dismissed`, `iframe_webgpu_dismissed`.
