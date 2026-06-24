import type { OrderChannel } from "@prisma/client";

type OrderLineTopupInput = {
  topupAmount: number | null;
  buttons: number;
  quantity: number;
};

export function getOrderLineTopup(line: OrderLineTopupInput): number {
  return (line.topupAmount ?? line.buttons) * line.quantity;
}

export function getOrderTotalTopup(lines: OrderLineTopupInput[]): number {
  return lines.reduce((sum, line) => sum + getOrderLineTopup(line), 0);
}

export function formatOrderChannel(channel: OrderChannel): string {
  return channel === "FACEBOOK" ? "Facebook" : "Line";
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "รอดำเนินการ";
    case "COMPLETED":
      return "เติมแล้ว";
    case "CANCELLED":
      return "ยกเลิก";
    default:
      return status;
  }
}
