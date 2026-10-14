import type { ReactNode } from "react";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { Header } from "./Header";
import { IframeWebGPUBanner } from "@/components/shared/IframeWebGPUBanner";

type Variant = "default" | "cardio";

type Props = {
  activeVariant: Variant;
  onVariantChange: (v: Variant) => void;
  backend: "webgpu" | "wasm" | null;
  children: ReactNode;
};

export function AppShell({
  activeVariant,
  onVariantChange,
  backend,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <DisclaimerBanner />
      <Header
        activeVariant={activeVariant}
        onVariantChange={onVariantChange}
        backend={backend}
      />
      <IframeWebGPUBanner />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
