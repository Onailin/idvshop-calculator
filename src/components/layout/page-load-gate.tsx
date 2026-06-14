"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { PageLoadingOverlay } from "@/components/layout/page-loading-overlay";
import { useSmoothProgress } from "@/hooks/use-smooth-progress";
import {
  waitForItemImages,
  type ItemLoadProgress,
} from "@/lib/wait-for-item-images";
import { cn } from "@/lib/utils";

const BLOCKING_MAX_MS = 18_000;

type PageLoadGateContextValue = {
  isBlocking: boolean;
};

const PageLoadGateContext = createContext<PageLoadGateContextValue>({
  isBlocking: false,
});

export function usePageLoadGate() {
  return useContext(PageLoadGateContext);
}

export function PageLoadGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isBlocking, setIsBlocking] = useState(true);
  const [targetProgress, setTargetProgress] = useState(0);
  const [loadInfo, setLoadInfo] = useState<
    Pick<ItemLoadProgress, "loaded" | "total" | "phase">
  >({ loaded: 0, total: 0, phase: "page" });
  const smoothProgress = useSmoothProgress(targetProgress, isBlocking);
  const runIdRef = useRef(0);

  const startBlocking = useCallback(() => {
    setIsBlocking(true);
    setTargetProgress(0);
    setLoadInfo({ loaded: 0, total: 0, phase: "page" });
  }, []);

  const finishBlocking = useCallback(async (runId: number) => {
    setTargetProgress(100);
    setLoadInfo((prev) => ({ ...prev, phase: "done" }));
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 80);
    });

    if (runIdRef.current !== runId) {
      return;
    }

    setIsBlocking(false);
    setTargetProgress(0);
    setLoadInfo({ loaded: 0, total: 0, phase: "page" });
  }, []);

  useEffect(() => {
    const runId = ++runIdRef.current;
    const controller = new AbortController();

    async function run() {
      startBlocking();

      await waitForItemImages((progress) => {
        if (runIdRef.current !== runId) {
          return;
        }

        setTargetProgress(progress.percent);
        setLoadInfo({
          loaded: progress.loaded,
          total: progress.total,
          phase: progress.phase,
        });
      }, controller.signal);

      if (runIdRef.current === runId) {
        await finishBlocking(runId);
      }
    }

    void run();

    return () => {
      controller.abort();
    };
  }, [pathname, finishBlocking, startBlocking]);

  useEffect(() => {
    if (!isBlocking) {
      return;
    }

    const runId = runIdRef.current;
    const timeout = window.setTimeout(() => {
      if (runIdRef.current !== runId) {
        return;
      }

      setIsBlocking(false);
      setTargetProgress(0);
      setLoadInfo({ loaded: 0, total: 0, phase: "page" });
    }, BLOCKING_MAX_MS);

    return () => window.clearTimeout(timeout);
  }, [isBlocking, pathname]);

  return (
    <PageLoadGateContext.Provider value={{ isBlocking }}>
      {isBlocking && (
        <PageLoadingOverlay progress={smoothProgress} loadInfo={loadInfo} />
      )}
      <div
        className={cn(
          "flex min-h-full flex-1 flex-col transition-opacity duration-150",
          isBlocking && "opacity-0",
        )}
        aria-hidden={isBlocking}
      >
        {children}
      </div>
    </PageLoadGateContext.Provider>
  );
}
