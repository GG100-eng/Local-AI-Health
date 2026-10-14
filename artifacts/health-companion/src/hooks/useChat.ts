import { useEffect, useRef, useState, useCallback } from "react";
import { useWorker } from "./useWorker";
import { loadMessages, saveMessage, clearMessages } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";
import { detectEmergency } from "@/lib/emergency";

type Variant = "default" | "cardio";

export function useChat(activeVariant: Variant = "default") {
  const { send, subscribe, isReady } = useWorker();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    let cancelled = false;
    loadMessages().then((m) => {
      if (!cancelled) setMessages(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!isReady || !trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        ts: Date.now(),
        isEmergency: detectEmergency(trimmed),
      };
      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        ts: Date.now() + 1,
        isStreaming: true,
      };

      setMessages((m) => [...m, userMsg, assistantMsg]);
      await saveMessage(userMsg);
      setIsStreaming(true);

      const context = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const unsub = subscribe(assistantId, async (msg) => {
        if (msg.type === "RESULT") {
          const payload = msg.payload as {
            id: string;
            token?: string;
            done: boolean;
          };
          if (payload.token) {
            setMessages((curr) =>
              curr.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + payload.token }
                  : m,
              ),
            );
          }
          if (payload.done) {
            setMessages((curr) => {
              const final = curr.map((m) =>
                m.id === assistantId ? { ...m, isStreaming: false } : m,
              );
              const completed = final.find((m) => m.id === assistantId);
              if (completed) {
                saveMessage({ ...completed, isStreaming: false }).catch(
                  () => {},
                );
              }
              return final;
            });
            setIsStreaming(false);
            unsub();
          }
        } else if (msg.type === "ERROR") {
          setMessages((curr) =>
            curr.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "(Sorry — I hit an error generating that response.)",
                    isStreaming: false,
                  }
                : m,
            ),
          );
          setIsStreaming(false);
          unsub();
        }
      });

      send({
        type: "GENERATE",
        payload: {
          id: assistantId,
          messages: context,
          systemPromptVariant: activeVariant,
        },
      });
    },
    [isReady, isStreaming, send, subscribe, activeVariant],
  );

  const reset = useCallback(async () => {
    setMessages([]);
    await clearMessages();
  }, []);

  return { messages, sendUserMessage, isStreaming, reset, isReady };
}
