import { MessageList } from "./MessageList";
import { ComposerBar } from "./ComposerBar";
import { useChat } from "@/hooks/useChat";

type Props = {
  activeVariant: "default" | "cardio";
};

export function TriageChat({ activeVariant }: Props) {
  const { messages, sendUserMessage, isStreaming, isReady } =
    useChat(activeVariant);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MessageList messages={messages} isStreaming={isStreaming} />
      <ComposerBar
        onSend={sendUserMessage}
        disabled={!isReady}
        isStreaming={isStreaming}
      />
    </div>
  );
}
