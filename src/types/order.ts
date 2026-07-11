import type {
  ItemType,
  OrderChannel,
  OrderStatus,
  Rarity,
} from "@prisma/client";

export type CustomerOrderSummary = {
  trackCode: string;
  totalButtons: number;
  totalPrice: number;
  channel: OrderChannel;
};

export type OrderSelectedItem = {
  itemId: string;
  quantity: number;
};

export type OrderPayload =
  | {
      kind: "combination";
      groupId: string;
      items: Array<{ packageId: string; quantity: number }>;
      selectedItems?: OrderSelectedItem[];
    }
  | {
      kind: "coupon";
      selections: Array<{ packageId: string; quantity: number }>;
      inventory: { discount10: number; discount3: number };
      selectedItems?: OrderSelectedItem[];
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

export type AdminOrderDetailItem = {
  id: string;
  itemId: string | null;
  name: string;
  type: ItemType;
  rarity: Rarity;
  buttonCost: number;
  imageUrl: string | null;
  categoryName: string | null;
  quantity: number;
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
  items: AdminOrderDetailItem[];
};
