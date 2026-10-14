import type { ChatMessage } from "@/lib/types";
import { Users } from "lucide-react";

type Props = {
  message: ChatMessage;
  onSecondOpinion?: () => void;
  showSecondOpinion?: boolean;
};

export function MessageBubble({
  message,
  onSecondOpinion,
  showSecondOpinion,
}: Props) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex w-full flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      data-testid={`bubble-${message.role}`}
    >
      <div
        className={`relative max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[75%] sm:text-[15px] ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-card-border bg-card text-card-foreground"
        }`}
      >
        {message.content || (message.isStreaming ? "…" : "")}
        {message.isStreaming && message.content ? (
          <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-current align-middle opacity-60" />
        ) : null}
      </div>
      {showSecondOpinion && !isUser && !message.isStreaming && message.content && (
        <button
          type="button"
          onClick={onSecondOpinion}
          className="hover-elevate active-elevate-2 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          data-testid={`button-second-opinion-${message.id}`}
        >
          <Users className="h-2.5 w-2.5" />
          Get second opinion
        </button>
      )}
    </div>
  );
}
