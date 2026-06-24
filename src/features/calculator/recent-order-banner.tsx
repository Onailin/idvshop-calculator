"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderChannel } from "@prisma/client";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatOrderChannel } from "@/lib/order-format";
import {
  clearRecentOrder,
  readRecentOrder,
  RECENT_ORDER_UPDATED_EVENT,
} from "@/lib/recent-order-storage";
import { STORE_FACEBOOK_URL, STORE_LINE_URL } from "@/lib/store-links";
import { cn } from "@/lib/utils";
import type { CustomerOrderSummary } from "@/types/order";

const CHANNEL_LINKS: Record<OrderChannel, string> = {
  FACEBOOK: STORE_FACEBOOK_URL,
  LINE: STORE_LINE_URL,
};

const CHANNEL_BUTTON_CLASS: Record<OrderChannel, string> = {
  FACEBOOK: "bg-[#1877F2] hover:brightness-110",
  LINE: "bg-[#06C755] hover:brightness-110",
};

function useRecentOrder() {
  const [order, setOrder] = useState<CustomerOrderSummary | null>(null);

  useEffect(() => {
    const refresh = () => setOrder(readRecentOrder());

    refresh();
    window.addEventListener(RECENT_ORDER_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener(RECENT_ORDER_UPDATED_EVENT, refresh);
    };
  }, []);

  return order;
}

/** แถบลอยด้านล่าง — เห็นเลขออเดอร์ได้ตลอดโดยไม่ต้องเลื่อนกลับขึ้น */
export function RecentOrderBanner() {
  const order = useRecentOrder();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!order?.trackCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(order.trackCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [order?.trackCode]);

  function handleDismiss() {
    clearRecentOrder();
    setExpanded(false);
  }

  function handleOpenChannel() {
    if (!order) {
      return;
    }

    window.open(
      CHANNEL_LINKS[order.channel],
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <div aria-hidden className="h-[4.75rem] sm:h-[4.25rem]" />

      <section
        aria-label="ออเดอร์ล่าสุด"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-300/80 bg-amber-50/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setExpanded((value) => !value)}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/80">
                ออเดอร์ล่าสุด
              </p>
              <p className="truncate font-mono text-sm font-bold text-amber-950 sm:text-base">
                {order.trackCode}
              </p>
            </button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-300/80 bg-white"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">คัดลอก</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              className={cn(
                "hidden shrink-0 gap-1.5 text-white sm:inline-flex",
                CHANNEL_BUTTON_CLASS[order.channel],
              )}
              onClick={handleOpenChannel}
            >
              <ExternalLink className="h-4 w-4" />
              {formatOrderChannel(order.channel)}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-amber-900/70 hover:bg-amber-100"
              aria-label="ปิด"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {expanded && (
            <div className="flex flex-wrap items-center gap-2 border-t border-amber-200/80 pt-2 text-xs text-amber-950/90 sm:text-sm">
              <span>กระดุมรวม {order.totalButtons.toLocaleString("th-TH")}</span>
              <span>·</span>
              <span>ราคารวม ฿{order.totalPrice.toLocaleString("th-TH")}</span>
              <span>·</span>
              <span>{formatOrderChannel(order.channel)}</span>
              <Button
                type="button"
                size="sm"
                className={cn(
                  "ml-auto gap-1.5 text-white sm:hidden",
                  CHANNEL_BUTTON_CLASS[order.channel],
                )}
                onClick={handleOpenChannel}
              >
                <ExternalLink className="h-4 w-4" />
                ไปยัง {formatOrderChannel(order.channel)}
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
