import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { EmergencyChip } from "./EmergencyChip";
import { SecondOpinionModal } from "@/components/p2p/SecondOpinionModal";
import type { ChatMessage } from "@/lib/types";
import { Stethoscope } from "lucide-react";

type Props = {
  messages: ChatMessage[];
  isStreaming: boolean;
};

export function MessageList({ messages, isStreaming }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const [opinionFor, setOpinionFor] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div className="max-w-sm">
          <h2 className="text-base font-semibold text-foreground">
            How are you feeling today?
          </h2>
          <p className="mt-1 text-sm">
            Describe your symptoms in your own words. I'll help you think
            through what they might mean and whether you should see a clinician.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-6">
        {messages.map((m, idx) => {
          const showEmergency =
            m.role === "user" && m.isEmergency && idx === messages.length - 2;
          const isLastAssistant =
            m.role === "assistant" && idx === messages.length - 1;
          const lastUserBefore =
            isLastAssistant && idx > 0 && messages[idx - 1].role === "user"
              ? messages[idx - 1].content
              : "";
          return (
            <div key={m.id} className="flex flex-col gap-2">
              <MessageBubble
                message={m}
                showSecondOpinion={isLastAssistant && !!lastUserBefore}
                onSecondOpinion={() =>
                  setOpinionFor({
                    question: lastUserBefore,
                    answer: m.content,
                  })
                }
              />
              {showEmergency && <EmergencyChip />}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <SecondOpinionModal
        open={!!opinionFor}
        onOpenChange={(v) => !v && setOpinionFor(null)}
        userQuestion={opinionFor?.question ?? ""}
        originalAnswer={opinionFor?.answer ?? ""}
      />
    </>
  );
}
