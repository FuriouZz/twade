import { createSignal } from "@furiouzz/reactive";
import type { SignalWithCleanup } from "./types";

export function useMediaQuery(_query: string) {
  const [enabled, setEnabled] = createSignal(
    false,
  ) as SignalWithCleanup<boolean>;

  const onChange = () => setEnabled(mediaQuery.matches);

  const mediaQuery = globalThis.matchMedia(_query);
  mediaQuery.addEventListener("change", onChange);
  onChange();

  enabled.cleanup = () => {
    mediaQuery.removeEventListener("change", onChange);
  };

  return enabled;
}
