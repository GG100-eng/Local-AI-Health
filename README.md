# Local AI Health Companion

An on-device health information companion that brings conversation, a symptom journal and a downloadable handoff into one place.

Built by [Gagan Gehani](https://github.com/GG100-eng). The product explores how to make a useful AI experience around personal information while keeping inference and storage in the browser.

## The experience

- Chat with a locally running language model and watch responses stream.
- Keep a symptom journal with timestamps, severity and notes.
- Switch between general-health and cardiovascular-focused prompts without downloading another model.
- Compare two responses side by side.
- Export the journal and recent conversation as a PDF to review or share yourself.

## Product and build decisions

**Run inference on the device.** A Web Worker keeps generation separate from the interface. Transformers.js loads `onnx-community/Qwen2.5-0.5B-Instruct` with q4 quantization, selecting WebGPU when available and WASM otherwise.

**Keep continuity local.** Chat messages and journal entries are saved in IndexedDB. Model assets are downloaded from Hugging Face during setup; browser storage and caching determine what remains available between visits.

**Change focus with prompts.** General-health, cardiovascular and second-opinion views reuse the same loaded model with different system prompts. The side-by-side view demonstrates the P2P interaction within one browser tab; the repository does not implement peer-to-peer networking.

**Make the handoff portable.** PDF generation happens in the browser and gives the user a file they can inspect before sharing.

## Explore the implementation

The main app is in [`artifacts/health-companion`](artifacts/health-companion/). The repository also includes the surrounding Replit workspace packages and prototypes.

- [Model loading and streaming generation](artifacts/health-companion/src/workers/model-worker.ts)
- [Prompt variants](artifacts/health-companion/src/lib/systemPrompt.ts)
- [Local message and journal storage](artifacts/health-companion/src/lib/db.ts)
- [Side-by-side response experience](artifacts/health-companion/src/components/p2p/SecondOpinionModal.tsx)
- [PDF handoff](artifacts/health-companion/src/lib/handoffPdf.ts)

This is an experimental health-information prototype. Use fictional information to explore it. It is not medical advice or a substitute for professional care; contact local emergency services for urgent symptoms.

## Run locally

Requires Node.js 24 and pnpm.

```sh
pnpm install
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/health-companion run dev
```

Build the app with:

```sh
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/health-companion run build
```
