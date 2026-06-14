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

type PageLoadGateContextValue = {
  isBlocking: boolean;
};

const PageLoadGateContext = createContext<PageLoadGateContextValue>({
  isBlocking: false,
});

export function usePageLoadGate() {
  return useContext(PageLoadGateContext);
}

function isInternalNavigation(href: string, pathname: string): boolean {
  if (!href || href.startsWith("#")) {
    return false;
  }

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return false;
    }

    const nextPath = url.pathname + url.search;
    const currentPath = pathname + window.location.search;
    return nextPath !== currentPath;
  } catch {
    return href.startsWith("/") && href !== pathname;
  }
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

  const finishBlocking = useCallback(async () => {
    setTargetProgress(100);
    setLoadInfo((prev) => ({ ...prev, phase: "done" }));
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 80);
    });
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
        await finishBlocking();
      }
    }

    void run();

    return () => {
      controller.abort();
    };
  }, [pathname, finishBlocking, startBlocking]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !isInternalNavigation(href, pathname)) {
        return;
      }

      startBlocking();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startBlocking]);

  return (
    <PageLoadGateContext.Provider value={{ isBlocking }}>
      {isBlocking && (
        <PageLoadingOverlay progress={smoothProgress} loadInfo={loadInfo} />
      )}
      <div
        className={cn(
          "flex min-h-full flex-1 flex-col transition-opacity duration-150",
          isBlocking && "pointer-events-none opacity-0",
        )}
        aria-hidden={isBlocking}
      >
        {children}
      </div>
    </PageLoadGateContext.Provider>
  );
}
