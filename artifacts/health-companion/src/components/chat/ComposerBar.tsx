import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
  disabled: boolean;
  isStreaming: boolean;
};

export function ComposerBar({ onSend, disabled, isStreaming }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = value.trim();
    if (!text || disabled || isStreaming) return;
    onSend(text);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="sticky bottom-0 z-10 flex w-full items-end gap-2 border-t border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-6"
      data-testid="form-composer"
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height =
              Math.min(ref.current.scrollHeight, 160) + "px";
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={
          disabled
            ? "Loading models…"
            : "Describe your symptoms in your own words…"
        }
        disabled={disabled}
        rows={1}
        className="min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
        data-testid="input-composer"
      />
      <button
        type="submit"
        disabled={disabled || isStreaming || !value.trim()}
        className="hover-elevate active-elevate-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="button-send"
        aria-label="Send"
      >
        {isStreaming ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
