import type { OrderChannel, OrderStatus } from "@prisma/client";

export type CustomerOrderSummary = {
  trackCode: string;
  totalButtons: number;
  totalPrice: number;
  channel: OrderChannel;
};

export type OrderPayload =
  | {
      kind: "combination";
      groupId: string;
      items: Array<{ packageId: string; quantity: number }>;
    }
  | {
      kind: "coupon";
      selections: Array<{ packageId: string; quantity: number }>;
      inventory: { discount10: number; discount3: number };
    };

export type AdminOrderListItem = {
  id: string;
  trackCode: string;
  totalButtons: number;
  totalPrice: number;
  channel: OrderChannel;
  status: OrderStatus;
  createdAt: Date;
  lineCount: number;
};

export type AdminOrderDetail = {
  id: string;
  trackCode: string;
  totalButtons: number;
  totalPrice: number;
  channel: OrderChannel;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  lines: Array<{
    id: string;
    packageId: string | null;
    packageGroupName: string;
    buttons: number;
    topupAmount: number | null;
    price: number;
    quantity: number;
    lineTotal: number;
    couponLabel: string | null;
  }>;
};
