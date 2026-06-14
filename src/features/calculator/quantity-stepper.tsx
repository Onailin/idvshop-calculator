"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 0,
  className,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value));
    }
  }, [value, isFocused]);

  function commitDraft() {
    if (draft.trim() === "") {
      setDraft(String(value));
      return;
    }

    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }

    const next = Math.max(min, parsed);
    setDraft(String(next));
    if (next !== value) {
      onChange(next);
    }
  }

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label="ลดจำนวน"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value.replace(/\D/g, ""));
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            commitDraft();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="h-8 w-14 shrink-0 px-1 text-center text-sm font-semibold tabular-nums"
          aria-label={label ? `จำนวน ${label}` : "จำนวน"}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onChange(value + 1)}
          aria-label="เพิ่มจำนวน"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
