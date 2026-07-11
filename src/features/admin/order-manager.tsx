"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckCircle2, Eye, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  clearOrder,
  clearOrders,
  getAdminOrderDetail,
  markOrderCancelled,
  markOrderCompleted,
} from "@/actions/order";
import { ButtonAmount, ButtonBreakdown } from "@/components/ui/button-amount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemThumbnail } from "@/components/ui/item-thumbnail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatItemType } from "@/lib/item-type";
import {
  formatOrderChannel,
  formatOrderStatus,
  getOrderTotalTopup,
} from "@/lib/order-format";
import { formatRarity, RARITY_COLORS } from "@/lib/rarity";
import { cn, formatBahtInt } from "@/lib/utils";
import type { AdminOrderDetail, AdminOrderListItem } from "@/types/order";

type OrderStatusFilter = "PENDING" | "COMPLETED" | "CANCELLED" | "ALL";

type PendingConfirmAction =
  | { type: "complete"; orderId: string; trackCode: string }
  | { type: "cancel"; orderId: string }
  | { type: "clear"; orderId: string; trackCode: string }
  | { type: "bulk-clear"; ids: string[] };

type OrderManagerProps = {
  initialOrders: AdminOrderListItem[];
};

const STATUS_FILTERS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "COMPLETED", label: "เติมแล้ว" },
  { value: "CANCELLED", label: "ยกเลิก" },
  { value: "ALL", label: "ทั้งหมด" },
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-900";
    case "CANCELLED":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function isOrderClearable(): boolean {
  return true;
}

export function OrderManager({ initialOrders }: OrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("PENDING");
  const [trackSearch, setTrackSearch] = useState("");
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingConfirmAction | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredOrders = useMemo(() => {
    const normalizedSearch = trackSearch.trim().toUpperCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchesTrack =
        normalizedSearch.length === 0 ||
        order.trackCode.toUpperCase().includes(normalizedSearch);

      return matchesStatus && matchesTrack;
    });
  }, [orders, statusFilter, trackSearch]);

  const clearableFilteredOrders = useMemo(
    () => filteredOrders.filter(() => isOrderClearable()),
    [filteredOrders],
  );

  const selectedClearableCount = useMemo(
    () =>
      clearableFilteredOrders.filter((order) => selectedIds.has(order.id))
        .length,
    [clearableFilteredOrders, selectedIds],
  );

  const allClearableSelected =
    clearableFilteredOrders.length > 0 &&
    selectedClearableCount === clearableFilteredOrders.length;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, trackSearch]);

  function toggleSelectOrder(orderId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }

  function toggleSelectAllClearable(checked: boolean) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(clearableFilteredOrders.map((order) => order.id)));
  }

  function handleViewDetail(orderId: string) {
    startTransition(async () => {
      const orderDetail = await getAdminOrderDetail(orderId);
      if (!orderDetail) {
        toast.error("ไม่พบออเดอร์");
        return;
      }
      setDetail(orderDetail);
      setDetailOpen(true);
    });
  }

  function requestComplete(orderId: string, trackCode: string) {
    setPendingConfirm({ type: "complete", orderId, trackCode });
  }

  function requestCancel(orderId: string) {
    setPendingConfirm({ type: "cancel", orderId });
  }

  function requestClear(orderId: string, trackCode: string) {
    setPendingConfirm({ type: "clear", orderId, trackCode });
  }

  function requestBulkClear() {
    const ids = clearableFilteredOrders
      .filter((order) => selectedIds.has(order.id))
      .map((order) => order.id);

    if (ids.length === 0) {
      toast.error("กรุณาเลือกออเดอร์ที่ต้องการเคลียร์");
      return;
    }

    setPendingConfirm({ type: "bulk-clear", ids });
  }

  function executeConfirm() {
    if (!pendingConfirm) return;

    startTransition(async () => {
      if (pendingConfirm.type === "complete") {
        const { orderId } = pendingConfirm;
        const result = await markOrderCompleted(orderId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status: "COMPLETED" } : order,
          ),
        );
        setDetail((current) =>
          current?.id === orderId
            ? { ...current, status: "COMPLETED" }
            : current,
        );
        setPendingConfirm(null);
        return;
      }

      if (pendingConfirm.type === "cancel") {
        const orderId = pendingConfirm.orderId;
        const result = await markOrderCancelled(orderId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status: "CANCELLED" } : order,
          ),
        );
        setDetail((current) =>
          current?.id === orderId
            ? { ...current, status: "CANCELLED" }
            : current,
        );
        setPendingConfirm(null);
        return;
      }

      if (pendingConfirm.type === "clear") {
        const { orderId } = pendingConfirm;
        const result = await clearOrder(orderId);
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setOrders((current) => current.filter((order) => order.id !== orderId));
        setSelectedIds((current) => {
          const next = new Set(current);
          next.delete(orderId);
          return next;
        });
        setDetail((current) => {
          if (current?.id === orderId) {
            setDetailOpen(false);
            return null;
          }
          return current;
        });
        setPendingConfirm(null);
        return;
      }

      const clearedIds = new Set(pendingConfirm.ids);
      const result = await clearOrders(pendingConfirm.ids);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.data
          ? `ลบออเดอร์แล้ว ${result.data.clearedCount} รายการ`
          : result.message,
      );
      setOrders((current) =>
        current.filter((order) => !clearedIds.has(order.id)),
      );
      setSelectedIds(new Set());
      setDetail((current) => {
        if (current && clearedIds.has(current.id)) {
          setDetailOpen(false);
          return null;
        }
        return current;
      });
      setPendingConfirm(null);
    });
  }

  function handleComplete(orderId: string, trackCode: string) {
    requestComplete(orderId, trackCode);
  }

  function handleCancel(orderId: string) {
    requestCancel(orderId);
  }

  function handleClear(orderId: string, trackCode: string) {
    requestClear(orderId, trackCode);
  }

  function handleBulkClear() {
    requestBulkClear();
  }

  const confirmDialogProps = (() => {
    if (!pendingConfirm) return null;

    if (pendingConfirm.type === "complete") {
      return {
        title: "ยืนยันเติมแล้ว",
        description: (
          <div className="space-y-3">
            <p>ต้องการเปลี่ยนสถานะออเดอร์นี้เป็น &quot;เติมแล้ว&quot; หรือไม่?</p>
            <p className="rounded-lg border border-brand-blush/50 bg-brand-cream/50 px-3 py-2 font-mono text-sm font-semibold text-foreground">
              {pendingConfirm.trackCode}
            </p>
          </div>
        ),
        confirmLabel: "เติมแล้ว",
        tone: "warning" as const,
      };
    }

    if (pendingConfirm.type === "cancel") {
      return {
        title: "ยกเลิกออเดอร์",
        description:
          'ต้องการเปลี่ยนสถานะออเดอร์นี้เป็น "ยกเลิก" หรือไม่? สามารถเคลียร์ออกจากระบบได้ภายหลัง',
        confirmLabel: "ยกเลิกออเดอร์",
        tone: "warning" as const,
      };
    }

    if (pendingConfirm.type === "clear") {
      return {
        title: "เคลียร์ออเดอร์",
        description: (
          <div className="space-y-3">
            <p>ต้องการลบออเดอร์นี้ออกจากระบบหรือไม่?</p>
            <p className="rounded-lg border border-brand-blush/50 bg-brand-cream/50 px-3 py-2 font-mono text-sm font-semibold text-foreground">
              {pendingConfirm.trackCode}
            </p>
            <p className="text-destructive">การลบนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        ),
        confirmLabel: "เคลียร์ออเดอร์",
        tone: "danger" as const,
      };
    }

    return {
      title: "เคลียร์ออเดอร์ที่เลือก",
      description: (
        <div className="space-y-3">
          <p>
            ต้องการลบออเดอร์ที่เลือก{" "}
            <span className="font-semibold text-foreground">
              {pendingConfirm.ids.length}
            </span>{" "}
            รายการออกจากระบบหรือไม่?
          </p>
          <p className="text-destructive">การลบนี้ไม่สามารถย้อนกลับได้</p>
        </div>
      ),
      confirmLabel: `เคลียร์ ${pendingConfirm.ids.length} รายการ`,
      tone: "danger" as const,
    };
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">ออเดอร์</h1>
          <p className="mt-2 text-muted-foreground">
            ติดตามเลขแทร็กและรายละเอียดแพ็กเกจที่ลูกค้าสั่งซื้อ
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={trackSearch}
              onChange={(event) => setTrackSearch(event.target.value)}
              placeholder="ค้นหาเลขแทร็ก..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as OrderStatusFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="กรองสถานะ" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">
            รายการออเดอร์ ({filteredOrders.length})
          </CardTitle>
          {selectedClearableCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-destructive hover:text-destructive"
              onClick={handleBulkClear}
            >
              <Trash2 className="h-4 w-4" />
              เคลียร์ที่เลือก ({selectedClearableCount})
            </Button>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {trackSearch.trim().length > 0
                ? "ไม่พบออเดอร์ที่ตรงกับเลขแทร็กนี้"
                : "ไม่มีออเดอร์ในสถานะนี้"}
            </p>
          ) : (
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="w-10 pb-3 pr-2 font-medium">
                    {clearableFilteredOrders.length > 0 && (
                      <Checkbox
                        checked={
                          allClearableSelected
                            ? true
                            : selectedClearableCount > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={(checked) =>
                          toggleSelectAllClearable(checked === true)
                        }
                        disabled={isPending}
                        aria-label="เลือกออเดอร์ที่เคลียร์ได้ทั้งหมด"
                      />
                    )}
                  </th>
                  <th className="pb-3 pr-4 font-medium">เลขแทร็ก</th>
                  <th className="pb-3 pr-4 font-medium">สถานะ</th>
                  <th className="pb-3 pr-4 font-medium">ช่องทาง</th>
                  <th className="pb-3 pr-4 font-medium">กระดุมรวม</th>
                  <th className="pb-3 pr-4 font-medium">ราคารวม</th>
                  <th className="pb-3 pr-4 font-medium">วันที่</th>
                  <th className="pb-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 pr-2">
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={(checked) =>
                          toggleSelectOrder(order.id, checked === true)
                        }
                        disabled={isPending}
                        aria-label={`เลือกออเดอร์ ${order.trackCode}`}
                      />
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold">
                      {order.trackCode}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={statusBadgeClass(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {formatOrderChannel(order.channel)}
                    </td>
                    <td className="py-3 pr-4">
                      <ButtonAmount
                        value={order.totalButtons}
                        size="xs"
                        highlight
                      />
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatBahtInt(order.totalPrice)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {order.createdAt.toLocaleString("th-TH")}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleViewDetail(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                          ดูรายละเอียด
                        </Button>
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending}
                              onClick={() =>
                                handleComplete(order.id, order.trackCode)
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              เติมแล้ว
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleClear(order.id, order.trackCode)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              เคลียร์
                            </Button>
                          </>
                        )}
                        {(order.status === "COMPLETED" ||
                          order.status === "CANCELLED") && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleClear(order.id, order.trackCode)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            เคลียร์
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogClose />
          <DialogHeader>
            <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-brand-cream/50 p-4">
                  <p className="text-xs text-muted-foreground">เลขแทร็ก</p>
                  <p className="mt-1 break-all font-mono text-sm font-bold">
                    {detail.trackCode}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-cream/50 p-4">
                  <p className="text-xs text-muted-foreground">สถานะ</p>
                  <Badge className={cn("mt-1", statusBadgeClass(detail.status))}>
                    {formatOrderStatus(detail.status)}
                  </Badge>
                </div>
                <div className="rounded-xl bg-brand-cream/50 p-4">
                  <p className="text-xs text-muted-foreground">ช่องทาง</p>
                  <p className="mt-1 font-medium">
                    {formatOrderChannel(detail.channel)}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-cream/50 p-4">
                  <p className="text-xs text-muted-foreground">วันที่สร้าง</p>
                  <p className="mt-1 text-sm">
                    {detail.createdAt.toLocaleString("th-TH")}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 rounded-xl border border-brand-blush/50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">กระดุมรวม</p>
                  <ButtonAmount
                    value={detail.totalButtons}
                    size="md"
                    highlight
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ยอดเติมสะสมรวม</p>
                  <ButtonAmount
                    value={getOrderTotalTopup(detail.lines)}
                    size="md"
                    suffix={false}
                  />
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-muted-foreground">ราคารวม</p>
                  <p className="text-2xl font-bold">
                    {formatBahtInt(detail.totalPrice)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">
                  ไอเทม / สกินที่ลูกค้าเลือก
                </p>
                {detail.items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-brand-blush/40 bg-white px-3 py-4 text-sm text-muted-foreground">
                    ออเดอร์นี้ไม่มีรายการไอเทม — ออเดอร์ที่สร้างก่อนระบบบันทึกไอเทม
                    ไม่สามารถดึงรายละเอียดย้อนหลังได้
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detail.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-brand-blush/40 bg-white p-3 text-sm"
                      >
                        <div className="flex items-start gap-3">
                          <ItemThumbnail
                            src={item.imageUrl}
                            alt={item.name}
                            variant="admin"
                            className="rounded-lg bg-brand-cream/40"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium">{item.name}</p>
                                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                                  <Badge
                                    className={cn(
                                      "shrink-0 text-[10px]",
                                      RARITY_COLORS[item.rarity] ??
                                        "bg-slate-500 text-white",
                                    )}
                                  >
                                    {formatRarity(item.rarity)}
                                  </Badge>
                                  <span>{formatItemType(item.type)}</span>
                                  {item.categoryName && (
                                    <>
                                      <span>·</span>
                                      <span>{item.categoryName}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                              <ButtonAmount
                                value={item.buttonCost * item.quantity}
                                size="sm"
                                highlight
                              />
                            </div>
                            <p className="mt-2 text-muted-foreground">
                              จำนวน ×{item.quantity} ·{" "}
                              <ButtonAmount
                                value={item.buttonCost}
                                size="xs"
                              />{" "}
                              / ชิ้น
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">แพ็กเกจที่ต้องเติม</p>
                <div className="space-y-2">
                  {detail.lines.map((line) => (
                    <div
                      key={line.id}
                      className="rounded-xl border border-brand-blush/40 bg-white p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{line.packageGroupName}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                            <ButtonAmount value={line.buttons} size="xs" />
                            <span>·</span>
                            <ButtonBreakdown
                              topup={line.topupAmount ?? line.buttons}
                              buttons={line.buttons}
                            />
                            {line.couponLabel && (
                              <span>· คูปอง {line.couponLabel}</span>
                            )}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatBahtInt(line.lineTotal)}
                        </p>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        จำนวน ×{line.quantity} · ราคาต่อชิ้น{" "}
                        {formatBahtInt(line.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {detail.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleComplete(detail.id, detail.trackCode)
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    เติมแล้ว
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleCancel(detail.id)}
                  >
                    <XCircle className="h-4 w-4" />
                    ยกเลิก
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleClear(detail.id, detail.trackCode)}
                  >
                    <Trash2 className="h-4 w-4" />
                    เคลียร์ออเดอร์
                  </Button>
                </div>
              )}

              {(detail.status === "COMPLETED" ||
                detail.status === "CANCELLED") && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleClear(detail.id, detail.trackCode)}
                  >
                    <Trash2 className="h-4 w-4" />
                    เคลียร์ออเดอร์
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {confirmDialogProps && (
        <ConfirmDialog
          open={pendingConfirm !== null}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              setPendingConfirm(null);
            }
          }}
          title={confirmDialogProps.title}
          description={confirmDialogProps.description}
          confirmLabel={confirmDialogProps.confirmLabel}
          tone={confirmDialogProps.tone}
          isLoading={isPending}
          onConfirm={executeConfirm}
        />
      )}
    </div>
  );
}
