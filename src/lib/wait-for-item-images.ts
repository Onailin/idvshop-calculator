export const ITEM_IMAGE_SELECTOR = "[data-item-image] img";

const DOM_STABLE_MS = 200;
const NO_ITEMS_GRACE_MS = 350;
const DOM_MAX_WAIT_MS = 8_000;
const LOAD_MAX_WAIT_MS = 15_000;

export type ItemLoadProgress = {
  percent: number;
  loaded: number;
  total: number;
  phase: "page" | "images" | "done";
};

export function collectItemImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>(ITEM_IMAGE_SELECTOR)).filter(
    (img) => {
      const src = img.currentSrc || img.src;
      return Boolean(src) && !src.startsWith("data:");
    },
  );
}

function countLoadedImages(images: HTMLImageElement[]): number {
  return images.filter((img) => img.complete).length;
}

function waitForNextPaint(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const onAbort = () => {
      resolve();
    };

    signal.addEventListener("abort", onAbort, { once: true });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      });
    });
  });
}

function waitForStableItemImageDom(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    let lastCount = -1;
    let stableSince = Date.now();

    const check = () => {
      if (signal.aborted) {
        cleanup();
        resolve();
        return;
      }

      const images = collectItemImages();
      const now = Date.now();
      const elapsed = now - startedAt;

      if (images.length !== lastCount) {
        lastCount = images.length;
        stableSince = now;
      }

      const stableFor = now - stableSince;

      if (images.length === 0 && elapsed >= NO_ITEMS_GRACE_MS && stableFor >= DOM_STABLE_MS) {
        cleanup();
        resolve();
        return;
      }

      if (images.length > 0 && stableFor >= DOM_STABLE_MS) {
        cleanup();
        resolve();
        return;
      }

      if (elapsed >= DOM_MAX_WAIT_MS) {
        cleanup();
        resolve();
      }
    };

    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(check, 60);

    const cleanup = () => {
      observer.disconnect();
      window.clearInterval(interval);
    };

    signal.addEventListener(
      "abort",
      () => {
        cleanup();
        resolve();
      },
      { once: true },
    );

    check();
  });
}

export function waitForItemImages(
  onProgress: (progress: ItemLoadProgress) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const tracked = new WeakSet<HTMLImageElement>();
    let observer: MutationObserver | null = null;
    let interval: number | null = null;

    const cleanup = () => {
      observer?.disconnect();
      if (interval) {
        window.clearInterval(interval);
      }
    };

    const finish = () => {
      cleanup();
      window.clearTimeout(timeout);
      onProgress({ percent: 100, loaded: 0, total: 0, phase: "done" });
      resolve();
    };

    const reportImages = () => {
      const images = collectItemImages();
      const total = images.length;

      if (total === 0) {
        return false;
      }

      for (const img of images) {
        if (img.complete || tracked.has(img)) {
          continue;
        }

        tracked.add(img);
        img.addEventListener("load", reportImages, { once: true });
        img.addEventListener("error", reportImages, { once: true });
      }

      const loaded = countLoadedImages(images);
      const percent = Math.round((loaded / total) * 100);

      onProgress({
        percent,
        loaded,
        total,
        phase: "images",
      });

      return loaded >= total;
    };

    const timeout = window.setTimeout(finish, LOAD_MAX_WAIT_MS);

    async function run() {
      onProgress({ percent: 0, loaded: 0, total: 0, phase: "page" });

      await waitForStableItemImageDom(signal);

      if (signal.aborted) {
        return;
      }

      await waitForNextPaint(signal);

      if (signal.aborted) {
        return;
      }

      const done = reportImages();

      if (done || collectItemImages().length === 0) {
        finish();
        return;
      }

      observer = new MutationObserver(() => {
        if (reportImages()) {
          finish();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      interval = window.setInterval(() => {
        if (reportImages()) {
          finish();
        }
      }, 80);
    }

    signal.addEventListener(
      "abort",
      () => {
        cleanup();
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );

    void run();
  });
}
