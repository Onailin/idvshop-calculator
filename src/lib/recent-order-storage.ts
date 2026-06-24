import type { CustomerOrderSummary } from "@/types/order";

const STORAGE_KEY = "htu-recent-order";
const RECENT_ORDER_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const RECENT_ORDER_UPDATED_EVENT = "htu-recent-order-updated";

function notifyRecentOrderUpdated(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(RECENT_ORDER_UPDATED_EVENT));
}

type StoredRecentOrder = CustomerOrderSummary & {
  createdAt: string;
};

function isStoredRecentOrder(value: unknown): value is StoredRecentOrder {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.trackCode === "string" &&
    typeof record.totalButtons === "number" &&
    typeof record.totalPrice === "number" &&
    (record.channel === "FACEBOOK" || record.channel === "LINE") &&
    typeof record.createdAt === "string"
  );
}

export function saveRecentOrder(order: CustomerOrderSummary): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredRecentOrder = {
    ...order,
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    notifyRecentOrderUpdated();
  } catch {
    // ignore quota / private mode errors
  }
}

export function readRecentOrder(): CustomerOrderSummary | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredRecentOrder(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const age = Date.now() - new Date(parsed.createdAt).getTime();
    if (Number.isNaN(age) || age > RECENT_ORDER_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const { createdAt: _createdAt, ...order } = parsed;
    return order;
  } catch {
    return null;
  }
}

export function clearRecentOrder(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notifyRecentOrderUpdated();
  } catch {
    // ignore
  }
}
