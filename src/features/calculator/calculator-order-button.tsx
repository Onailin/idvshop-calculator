"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_FACEBOOK_URL, STORE_LINE_URL } from "@/lib/store-links";
import { cn } from "@/lib/utils";

type CalculatorOrderButtonProps = {
  className?: string;
};

const ORDER_CHANNELS = [
  {
    label: "Facebook",
    href: STORE_FACEBOOK_URL,
    buttonClass: "bg-[#1877F2] hover:brightness-110",
  },
  {
    label: "Line",
    href: STORE_LINE_URL,
    buttonClass: "bg-[#06C755] hover:brightness-110",
  },
] as const;

export function CalculatorOrderButton({ className }: CalculatorOrderButtonProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          size="sm"
          aria-label="สั่งซื้อ — เลือก Facebook หรือ Line"
          className={cn(
            "shrink-0 gap-1.5 bg-primary hover:bg-primary/90",
            className,
          )}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          สั่งซื้อ
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[200] w-[11.5rem] space-y-1.5 rounded-xl border border-brand-blush/60 bg-white p-2 shadow-lg"
        >
          <p className="px-1 pb-0.5 text-[11px] font-medium text-muted-foreground">
            เลือกช่องทางสั่งซื้อ
          </p>
          {ORDER_CHANNELS.map((channel) => (
            <DropdownMenu.Item key={channel.label} asChild>
              <Link
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex cursor-pointer select-none items-center justify-center rounded-lg px-3 py-2 text-sm font-bold text-white outline-none",
                  channel.buttonClass,
                )}
              >
                {channel.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
