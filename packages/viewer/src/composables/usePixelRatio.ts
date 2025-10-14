import { createEffect, createSignal, on } from "@furiouzz/reactive";
import type { SignalWithCleanup } from "./types";
import { useMediaQuery } from "./useMediaQuery";

export function usePixelRatio() {
  const query = useMediaQuery(
    "(resolution: ${globalThis.devicePixelRatio}dppx)",
  );
  const [pixelRatio, setPixelRatio] = createSignal(
    1,
  ) as SignalWithCleanup<number>;

  createEffect(
    on(query, () => {
      setPixelRatio(globalThis.devicePixelRatio);
    }),
  );

  pixelRatio.cleanup = query.cleanup;

  return pixelRatio;
}
