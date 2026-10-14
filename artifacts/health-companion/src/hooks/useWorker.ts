import { useEffect, useState, useCallback } from "react";
import {
  startInit,
  subscribe,
  send as busSend,
  type WorkerInbound,
  type WorkerOutbound,
} from "@/lib/workerBus";

export function useWorker() {
  const [isReady, setIsReady] = useState(false);
  const [backend, setBackend] = useState<"webgpu" | "wasm" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribe((msg: WorkerOutbound) => {
      if (msg.type === "READY") {
        setIsReady(true);
        setBackend(msg.payload.backend);
      } else if (msg.type === "ERROR" && !msg.payload.id) {
        setError(msg.payload.message);
      }
    });
    startInit();
    return unsub;
  }, []);

  const send = useCallback((msg: WorkerInbound) => {
    busSend(msg);
  }, []);

  const subscribeToId = useCallback(
    (id: string, cb: (msg: WorkerOutbound) => void) => {
      return subscribe((msg) => {
        if ((msg.payload as any)?.id === id) cb(msg);
      });
    },
    [],
  );

  return { send, subscribe: subscribeToId, isReady, backend, error };
}
