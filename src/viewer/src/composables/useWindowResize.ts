import { batch } from "@furiouzz/reactive";
import { createReactive } from "@furiouzz/reactive/store";

export function useResize() {
  const metrics = createReactive({
    width: 0,
    height: 0,
    cleanup() {
      globalThis.removeEventListener("resize", onResize);
    },
  }, { deep: false });

  const onResize = () => {
    batch(() => {
      metrics.width = globalThis.innerWidth;
      metrics.height = globalThis.innerHeight;
    });
  };

  globalThis.addEventListener("resize", onResize);
  onResize();

  return metrics;
}
