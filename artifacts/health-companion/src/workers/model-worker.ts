/// <reference lib="webworker" />
import {
  env,
  AutoTokenizer,
  AutoModelForCausalLM,
  pipeline,
  TextStreamer,
  type PretrainedTokenizer,
  type PreTrainedModel,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";
import { getSystemPrompt, type SystemPromptVariant } from "../lib/systemPrompt";

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

const GENERATION_MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";
const EMBEDDING_MODEL = "mixedbread-ai/mxbai-embed-xsmall-v1";

let tokenizer: PretrainedTokenizer | null = null;
let model: PreTrainedModel | null = null;
let embedder: FeatureExtractionPipeline | null = null;
let backend: "webgpu" | "wasm" = "wasm";
let activeVariant: SystemPromptVariant = "default";
let initialized = false;
let initInProgress = false;
const cancelledIds = new Set<string>();

class CancelledError extends Error {
  constructor() {
    super("CANCELLED");
    this.name = "CancelledError";
  }
}

async function detectBackend(): Promise<"webgpu" | "wasm"> {
  try {
    // @ts-expect-error - navigator.gpu may be undefined
    const adapter = await navigator.gpu?.requestAdapter();
    return adapter ? "webgpu" : "wasm";
  } catch {
    return "wasm";
  }
}

const fileTotals = new Map<string, { loaded: number; total: number }>();

function makeProgressCallback(modelName: string) {
  return (data: any) => {
    if (!data || !data.file) return;
    const key = `${modelName}/${data.file}`;
    if (data.status === "progress" && typeof data.loaded === "number") {
      const total = data.total || 0;
      fileTotals.set(key, { loaded: data.loaded, total });
    } else if (data.status === "initiate") {
      if (!fileTotals.has(key)) fileTotals.set(key, { loaded: 0, total: 0 });
    } else if (data.status === "done" || data.status === "ready") {
      const existing = fileTotals.get(key);
      if (existing && existing.total > 0) {
        fileTotals.set(key, { loaded: existing.total, total: existing.total });
      }
    } else {
      return;
    }

    let aggLoaded = 0;
    let aggTotal = 0;
    fileTotals.forEach((v) => {
      aggLoaded += v.loaded;
      aggTotal += v.total;
    });
    const overallPct = aggTotal > 0 ? (aggLoaded / aggTotal) * 100 : 0;

    self.postMessage({
      type: "PROGRESS",
      payload: {
        file: data.file,
        loaded: data.loaded || 0,
        total: data.total || 0,
        overallPct,
        modelName,
        phase: data.status === "progress" ? "downloading" : "loading",
      },
    });
  };
}

async function init() {
  if (initialized || initInProgress) return;
  initInProgress = true;
  try {
    backend = await detectBackend();

    tokenizer = await AutoTokenizer.from_pretrained(GENERATION_MODEL, {
      progress_callback: makeProgressCallback(GENERATION_MODEL),
    });

    model = await AutoModelForCausalLM.from_pretrained(GENERATION_MODEL, {
      dtype: "q4",
      device: backend,
      progress_callback: makeProgressCallback(GENERATION_MODEL),
    });

    embedder = (await pipeline("feature-extraction", EMBEDDING_MODEL, {
      progress_callback: makeProgressCallback(EMBEDDING_MODEL),
    })) as FeatureExtractionPipeline;

    initialized = true;
    self.postMessage({ type: "READY", payload: { backend } });
  } catch (e: any) {
    self.postMessage({
      type: "ERROR",
      payload: { message: e?.message || String(e) },
    });
  } finally {
    initInProgress = false;
  }
}

async function generate(
  id: string,
  messages: Array<{ role: string; content: string }>,
  variant: SystemPromptVariant,
) {
  if (!model || !tokenizer) {
    self.postMessage({
      type: "ERROR",
      payload: { id, message: "Model not initialized" },
    });
    return;
  }

  try {
    const systemPrompt = getSystemPrompt(variant);
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const inputs = tokenizer.apply_chat_template(fullMessages, {
      add_generation_prompt: true,
      return_dict: true,
    }) as any;

    const streamer = new TextStreamer(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token: string) => {
        if (cancelledIds.has(id)) {
          throw new CancelledError();
        }
        self.postMessage({
          type: "RESULT",
          payload: { id, token, done: false },
        });
      },
    });

    await model.generate({
      ...inputs,
      max_new_tokens: 512,
      do_sample: false,
      streamer,
    } as any);

    self.postMessage({
      type: "RESULT",
      payload: { id, token: "", done: true },
    });
  } catch (e: any) {
    if (e instanceof CancelledError) {
      self.postMessage({
        type: "RESULT",
        payload: { id, token: "", done: true, cancelled: true },
      });
    } else {
      self.postMessage({
        type: "ERROR",
        payload: { id, message: e?.message || String(e) },
      });
    }
  } finally {
    cancelledIds.delete(id);
  }
}

async function embed(id: string, text: string) {
  if (!embedder) {
    self.postMessage({
      type: "ERROR",
      payload: { id, message: "Embedding model not initialized" },
    });
    return;
  }
  try {
    const result = await embedder(text, { pooling: "mean", normalize: true });
    const vec = Array.from(result.data as Float32Array);
    self.postMessage({
      type: "RESULT",
      payload: { id, embedding: vec, done: true },
    });
  } catch (e: any) {
    self.postMessage({
      type: "ERROR",
      payload: { id, message: e?.message || String(e) },
    });
  }
}

self.addEventListener("message", async (e: MessageEvent) => {
  const { type, payload } = e.data;
  switch (type) {
    case "INIT":
      await init();
      break;
    case "GENERATE":
      await generate(
        payload.id,
        payload.messages,
        payload.systemPromptVariant || activeVariant,
      );
      break;
    case "EMBED":
      await embed(payload.id, payload.text);
      break;
    case "SWAP_MODEL":
      activeVariant = payload.systemPromptVariant;
      self.postMessage({
        type: "SWAPPED",
        payload: { variant: activeVariant },
      });
      break;
    case "CANCEL":
      if (payload?.id) cancelledIds.add(payload.id);
      break;
  }
});
