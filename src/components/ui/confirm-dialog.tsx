"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogTone = "danger" | "warning";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  onConfirm: () => void;
  isLoading?: boolean;
};

const TONE_STYLES: Record<
  ConfirmDialogTone,
  { iconWrap: string; icon: string; confirm: string }
> = {
  danger: {
    iconWrap: "bg-red-100 text-red-600",
    icon: "text-red-600",
    confirm: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  warning: {
    iconWrap: "bg-amber-100 text-amber-700",
    icon: "text-amber-700",
    confirm: "bg-amber-600 text-white hover:bg-amber-600/90",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  tone = "danger",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-5">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  styles.iconWrap,
                )}
              >
                <AlertTriangle className={cn("h-5 w-5", styles.icon)} />
              </div>
              <div className="min-w-0 space-y-2 pt-0.5">
                <DialogTitle className="text-lg leading-snug">{title}</DialogTitle>
                {description ? (
                  <DialogDescription asChild>
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </div>
                  </DialogDescription>
                ) : null}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-brand-blush/50 bg-brand-cream/30 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-brand-blush/60 bg-white sm:min-w-[6.5rem]"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={cn("sm:min-w-[6.5rem]", styles.confirm)}
            disabled={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
