"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { OrderChannel, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { messages } from "@/lib/messages";
import {
  buildCombinationOrderSnapshot,
  buildCouponOrderSnapshot,
} from "@/services/order-builder";
import type { ActionResult } from "@/types";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  CustomerOrderSummary,
} from "@/types/order";
import {
  createOrderSchema,
  clearOrdersSchema,
  orderStatusFilterSchema,
} from "@/validators/order";

const TRACK_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_TRACK_CODE_ATTEMPTS = 8;

const packageInclude = {
  packageGroup: {
    select: { name: true, isActive: true },
  },
} as const;

function generateTrackCode(): string {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix +=
      TRACK_CODE_CHARS[
        Math.floor(Math.random() * TRACK_CODE_CHARS.length)
      ] ?? "A";
  }

  return `HTU-${ymd}-${suffix}`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function fetchActivePackages() {
  return prisma.package.findMany({
    where: { packageGroup: { isActive: true } },
    include: packageInclude,
  });
}

export async function createOrder(
  input: unknown,
): Promise<ActionResult<CustomerOrderSummary>> {
  try {
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: messages.validationFailed };
    }

    const packages = await fetchActivePackages();
    const snapshot =
      parsed.data.kind === "combination"
        ? buildCombinationOrderSnapshot(
            parsed.data.groupId,
            parsed.data.items,
            packages,
          )
        : buildCouponOrderSnapshot(
            parsed.data.selections,
            parsed.data.inventory,
            packages,
          );

    if ("error" in snapshot) {
      return { success: false, message: snapshot.error };
    }

    const channel = parsed.data.channel as OrderChannel;

    for (let attempt = 0; attempt < MAX_TRACK_CODE_ATTEMPTS; attempt += 1) {
      const trackCode = generateTrackCode();

      try {
        const order = await prisma.order.create({
          data: {
            trackCode,
            totalButtons: snapshot.totalButtons,
            totalPrice: snapshot.totalPrice,
            channel,
            lines: {
              create: snapshot.lines.map((line) => ({
                packageId: line.packageId,
                packageGroupName: line.packageGroupName,
                buttons: line.buttons,
                topupAmount: line.topupAmount,
                price: line.price,
                quantity: line.quantity,
                lineTotal: line.lineTotal,
                couponLabel: line.couponLabel,
              })),
            },
          },
        });

        revalidatePath("/admin/orders");

        return {
          success: true,
          message: messages.orderCreated,
          data: {
            trackCode: order.trackCode,
            totalButtons: order.totalButtons,
            totalPrice: order.totalPrice,
            channel: order.channel,
          },
        };
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }
        throw error;
      }
    }

    return { success: false, message: messages.orderCreateFailed };
  } catch {
    return { success: false, message: messages.orderCreateFailed };
  }
}

export async function getAdminOrders(
  statusFilter: unknown = "PENDING",
): Promise<AdminOrderListItem[]> {
  await requireAdmin();

  const parsed = orderStatusFilterSchema.safeParse(statusFilter);
  const status = parsed.success ? parsed.data : "PENDING";

  const orders = await prisma.order.findMany({
    where: status === "ALL" ? undefined : { status: status as OrderStatus },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { lines: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    trackCode: order.trackCode,
    totalButtons: order.totalButtons,
    totalPrice: order.totalPrice,
    channel: order.channel,
    status: order.status,
    createdAt: order.createdAt,
    lineCount: order._count.lines,
  }));
}

export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      lines: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    trackCode: order.trackCode,
    totalButtons: order.totalButtons,
    totalPrice: order.totalPrice,
    channel: order.channel,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    lines: order.lines.map((line) => ({
      id: line.id,
      packageId: line.packageId,
      packageGroupName: line.packageGroupName,
      buttons: line.buttons,
      topupAmount: line.topupAmount,
      price: line.price,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
      couponLabel: line.couponLabel,
    })),
  };
}

export async function markOrderCompleted(
  orderId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return { success: false, message: messages.orderNotFound };
    }

    if (order.status !== "PENDING") {
      return { success: false, message: messages.orderAlreadyProcessed };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/admin/orders");

    return { success: true, message: messages.orderCompleted };
  } catch {
    return { success: false, message: messages.orderUpdateFailed };
  }
}

export async function markOrderCancelled(
  orderId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return { success: false, message: messages.orderNotFound };
    }

    if (order.status !== "PENDING") {
      return { success: false, message: messages.orderAlreadyProcessed };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/admin/orders");

    return { success: true, message: messages.orderCancelled };
  } catch {
    return { success: false, message: messages.orderUpdateFailed };
  }
}

export async function clearOrder(orderId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, trackCode: true },
    });

    if (!order) {
      return { success: false, message: messages.orderNotFound };
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/admin/orders");

    return { success: true, message: messages.orderCleared };
  } catch {
    return { success: false, message: messages.orderClearFailed };
  }
}

export async function clearOrders(
  orderIds: unknown,
): Promise<ActionResult<{ clearedCount: number }>> {
  try {
    await requireAdmin();

    const parsed = clearOrdersSchema.safeParse(orderIds);
    if (!parsed.success) {
      return {
        success: false,
        message: messages.ordersClearNoneSelected,
      };
    }

    const result = await prisma.order.deleteMany({
      where: {
        id: { in: parsed.data },
      },
    });

    if (result.count === 0) {
      return { success: false, message: messages.orderNotFound };
    }

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: messages.ordersCleared,
      data: { clearedCount: result.count },
    };
  } catch {
    return { success: false, message: messages.orderClearFailed };
  }
}
