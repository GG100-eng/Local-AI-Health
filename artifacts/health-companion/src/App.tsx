import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModelLoader } from "@/components/loading/ModelLoader";
import { TriageChat } from "@/components/chat/TriageChat";
import { NetworkBadge } from "@/components/network/NetworkBadge";
import { useWorker } from "@/hooks/useWorker";
import { registerNetworkMonitor } from "@/lib/registerSw";

type Variant = "default" | "cardio";

function App() {
  const { isReady, backend, error } = useWorker();
  const [activeVariant, setActiveVariant] = useState<Variant>("default");

  useEffect(() => {
    registerNetworkMonitor();
  }, []);

  return (
    <AppShell
      activeVariant={activeVariant}
      onVariantChange={setActiveVariant}
      backend={backend}
    >
      <ModelLoader isReady={isReady} backend={backend} />
      {error ? (
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Worker error: {error}
          </div>
        </div>
      ) : (
        <TriageChat activeVariant={activeVariant} />
      )}
      {isReady && <NetworkBadge ready={isReady} />}
    </AppShell>
  );
}

export default App;
