export type WorkerOutbound =
  | { type: "PROGRESS"; payload: { file: string; loaded: number; total: number; overallPct: number; modelName: string; phase: "loading" | "downloading" } }
  | { type: "READY"; payload: { backend: "webgpu" | "wasm" } }
  | { type: "RESULT"; payload: { id: string; token?: string; embedding?: number[]; done: boolean; cancelled?: boolean } }
  | { type: "SWAPPED"; payload: { variant: string } }
  | { type: "ERROR"; payload: { id?: string; message: string } };

export type WorkerInbound =
  | { type: "INIT" }
  | { type: "GENERATE"; payload: { id: string; messages: Array<{ role: string; content: string }>; systemPromptVariant?: "default" | "cardio" | "p2p" } }
  | { type: "EMBED"; payload: { id: string; text: string } }
  | { type: "SWAP_MODEL"; payload: { systemPromptVariant: "default" | "cardio" } }
  | { type: "CANCEL"; payload: { id: string } };

type Listener = (msg: WorkerOutbound) => void;

const listeners = new Set<Listener>();
let worker: Worker | null = null;
let initStarted = false;

export function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/model-worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.addEventListener("message", (e: MessageEvent<WorkerOutbound>) => {
      listeners.forEach((l) => l(e.data));
    });
    worker.addEventListener("error", (e) => {
      listeners.forEach((l) =>
        l({ type: "ERROR", payload: { message: e.message || "Worker error" } }),
      );
    });
  }
  return worker;
}

export function startInit() {
  if (initStarted) return;
  initStarted = true;
  getWorker().postMessage({ type: "INIT" } satisfies WorkerInbound);
}

export function send(msg: WorkerInbound) {
  getWorker().postMessage(msg);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
