"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { OrderChannel } from "@prisma/client";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/actions/order";
import { ButtonAmount } from "@/components/ui/button-amount";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatOrderChannel } from "@/lib/order-format";
import { STORE_FACEBOOK_URL, STORE_LINE_URL } from "@/lib/store-links";
import { cn, formatBahtInt } from "@/lib/utils";
import type { CustomerOrderSummary, OrderPayload } from "@/types/order";

type CheckoutStep = "confirm" | "channel" | "summary";

type OrderCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderPayload: OrderPayload;
  previewTotals: {
    totalButtons: number;
    totalPrice: number;
  };
};

const CHANNEL_LINKS: Record<OrderChannel, string> = {
  FACEBOOK: STORE_FACEBOOK_URL,
  LINE: STORE_LINE_URL,
};

const CHANNEL_BUTTON_CLASS: Record<OrderChannel, string> = {
  FACEBOOK: "bg-[#1877F2] hover:brightness-110",
  LINE: "bg-[#06C755] hover:brightness-110",
};

export function OrderCheckoutDialog({
  open,
  onOpenChange,
  orderPayload,
  previewTotals,
}: OrderCheckoutDialogProps) {
  const [step, setStep] = useState<CheckoutStep>("confirm");
  const [summary, setSummary] = useState<CustomerOrderSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setSummary(null);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = useCallback(async () => {
    if (!summary?.trackCode) return;

    try {
      await navigator.clipboard.writeText(summary.trackCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [summary?.trackCode]);

  function handleSelectChannel(channel: OrderChannel) {
    startTransition(async () => {
      const result = await createOrder({
        ...orderPayload,
        channel,
      });

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      setSummary(result.data);
      setStep("summary");
    });
  }

  function handleOpenChannel() {
    if (!summary) return;
    window.open(
      CHANNEL_LINKS[summary.channel],
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>
            {step === "confirm" && "ยืนยันการสั่งซื้อ"}
            {step === "channel" && "เลือกช่องทางติดต่อร้าน"}
            {step === "summary" && "สรุปออเดอร์"}
          </DialogTitle>
        </DialogHeader>

        {step === "confirm" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              กรุณาตรวจสอบยอดรวมก่อนยืนยัน ระบบจะสร้างเลขออเดอร์หลังจากเลือกช่องทางติดต่อร้าน
            </p>
            <dl className="space-y-2 rounded-xl border border-brand-blush/50 bg-brand-cream/40 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">กระดุมรวม</dt>
                <dd>
                  <ButtonAmount
                    value={previewTotals.totalButtons}
                    size="sm"
                    highlight
                  />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">ราคารวม</dt>
                <dd className="text-base font-bold">
                  {formatBahtInt(previewTotals.totalPrice)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-brand-blush/60"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setStep("channel")}
              >
                ยืนยันการสั่งซื้อ
              </Button>
            </div>
          </div>
        )}

        {step === "channel" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              เลือกช่องทางที่ต้องการติดต่อร้าน ระบบจะสร้างเลขออเดอร์ให้ทันที
            </p>
            <div className="grid gap-2">
              <Button
                type="button"
                disabled={isPending}
                className={cn(
                  "h-11 gap-2 text-white",
                  CHANNEL_BUTTON_CLASS.FACEBOOK,
                )}
                onClick={() => handleSelectChannel("FACEBOOK")}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Facebook
              </Button>
              <Button
                type="button"
                disabled={isPending}
                className={cn(
                  "h-11 gap-2 text-white",
                  CHANNEL_BUTTON_CLASS.LINE,
                )}
                onClick={() => handleSelectChannel("LINE")}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Line
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isPending}
              onClick={() => setStep("confirm")}
            >
              ย้อนกลับ
            </Button>
          </div>
        )}

        {step === "summary" && summary && (
          <div className="mt-4 space-y-4">
            <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center text-sm font-bold leading-relaxed text-red-600">
              กรุณาคัดลอกเลขออเดอร์ด้านล่าง
              <br />
              แล้วส่งแจ้งแอดมินก่อนสั่งซื้อ
            </p>

            <div className="rounded-xl border border-brand-blush/50 bg-brand-cream/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                เลขออเดอร์
              </p>
              <p className="mt-1 break-all font-mono text-lg font-bold tracking-wide text-foreground">
                {summary.trackCode}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full border-brand-blush/60"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    คัดลอกเลขออเดอร์
                  </>
                )}
              </Button>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">กระดุมรวม</dt>
                <dd>
                  <ButtonAmount
                    value={summary.totalButtons}
                    size="sm"
                    highlight
                  />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">ราคารวม</dt>
                <dd className="text-base font-bold">
                  {formatBahtInt(summary.totalPrice)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">ช่องทาง</dt>
                <dd className="font-medium">
                  {formatOrderChannel(summary.channel)}
                </dd>
              </div>
            </dl>

            <Button
              type="button"
              className={cn(
                "h-11 w-full gap-2 text-white",
                CHANNEL_BUTTON_CLASS[summary.channel],
              )}
              onClick={handleOpenChannel}
            >
              <ExternalLink className="h-4 w-4" />
              ไปยัง {formatOrderChannel(summary.channel)}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
