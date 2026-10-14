import { useEffect, useState } from "react";
import { subscribe, type WorkerOutbound } from "@/lib/workerBus";

export type ModelLoaderState = {
  overallPct: number;
  currentFile: string | null;
  currentLoaded: number;
  currentTotal: number;
  modelName: string | null;
  phase: "idle" | "loading" | "downloading" | "ready";
  error: string | null;
};

const initial: ModelLoaderState = {
  overallPct: 0,
  currentFile: null,
  currentLoaded: 0,
  currentTotal: 0,
  modelName: null,
  phase: "idle",
  error: null,
};

export function useModelLoader() {
  const [state, setState] = useState<ModelLoaderState>(initial);

  useEffect(() => {
    return subscribe((msg: WorkerOutbound) => {
      if (msg.type === "PROGRESS") {
        const p = msg.payload;
        setState((s) => ({
          ...s,
          overallPct: p.overallPct,
          currentFile: p.file,
          currentLoaded: p.loaded,
          currentTotal: p.total,
          modelName: p.modelName,
          phase: p.phase,
        }));
      } else if (msg.type === "READY") {
        setState((s) => ({ ...s, phase: "ready", overallPct: 100 }));
      } else if (msg.type === "ERROR" && !msg.payload.id) {
        setState((s) => ({ ...s, error: msg.payload.message }));
      }
    });
  }, []);

  return state;
}
