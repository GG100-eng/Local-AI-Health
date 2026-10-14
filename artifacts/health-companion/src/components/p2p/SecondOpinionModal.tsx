import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Users } from "lucide-react";
import { send, subscribe } from "@/lib/workerBus";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userQuestion: string;
  originalAnswer: string;
};

export function SecondOpinionModal({
  open,
  onOpenChange,
  userQuestion,
  originalAnswer,
}: Props) {
  const [secondAnswer, setSecondAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSecondAnswer("");
      setStreaming(false);
      setError(null);
      return;
    }
    if (!userQuestion) return;

    const id = crypto.randomUUID();
    activeIdRef.current = id;
    setStreaming(true);
    setSecondAnswer("");
    setError(null);

    const unsub = subscribe((msg) => {
      if ((msg.payload as any)?.id !== id) return;
      if (msg.type === "RESULT") {
        const p = msg.payload as { token?: string; done: boolean };
        if (p.token) setSecondAnswer((s) => s + p.token);
        if (p.done) {
          setStreaming(false);
          unsub();
        }
      } else if (msg.type === "ERROR") {
        setError((msg.payload as any).message || "Generation failed");
        setStreaming(false);
        unsub();
      }
    });

    send({
      type: "GENERATE",
      payload: {
        id,
        messages: [{ role: "user", content: userQuestion }],
        systemPromptVariant: "p2p",
      },
    });

    return () => {
      // Cancel any in-flight worker generation so it doesn't block the next chat send.
      if (activeIdRef.current) {
        send({ type: "CANCEL", payload: { id: activeIdRef.current } });
        activeIdRef.current = null;
      }
      unsub();
    };
  }, [open, userQuestion]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] gap-3 overflow-y-auto sm:max-w-2xl"
        data-testid="modal-second-opinion"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Second Opinion
          </DialogTitle>
          <DialogDescription>
            A second on-device instance answered the same question
            independently. Compare both responses below.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Your question
          </div>
          <div className="mt-1 text-sm text-foreground">{userQuestion}</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col rounded-lg border border-card-border bg-card p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                First answer
              </span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                Default
              </span>
            </div>
            <div
              className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
              data-testid="text-first-answer"
            >
              {originalAnswer}
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-card-border bg-card p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Second opinion
              </span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700">
                P2P
              </span>
            </div>
            <div
              className="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
              data-testid="text-second-answer"
            >
              {error ? (
                <span className="text-destructive">Error: {error}</span>
              ) : secondAnswer ? (
                <>
                  {secondAnswer}
                  {streaming && (
                    <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-current align-middle opacity-60" />
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Asking the second instance…
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-900">
          <span className="font-semibold">Mock disclosure:</span> The "second
          instance" runs in the same browser tab as a portfolio demo of the P2P
          pattern — not over a real network.
        </div>
      </DialogContent>
    </Dialog>
  );
}
