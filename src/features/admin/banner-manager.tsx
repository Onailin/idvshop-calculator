"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createBanner,
  deleteBanner,
  toggleBannerActive,
  updateBanner,
} from "@/actions/banner";
import { BannerFormFields } from "@/features/admin/banner-form-fields";
import { RemoteImage } from "@/components/ui/remote-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatBannerPlacement,
  isBannerPlacement,
  type BannerPlacement,
} from "@/lib/banner-placements";
import type { Banner } from "@/types";

type BannerManagerProps = {
  banners: Banner[];
};

function getPlacement(banner: Banner): BannerPlacement | null {
  return banner.placement && isBannerPlacement(banner.placement)
    ? banner.placement
    : null;
}

export function BannerManager({ banners }: BannerManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createBanner(formData);
      if (result.success) {
        toast.success(result.message);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateBanner(id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleBannerActive(id, isActive);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete(id: string, alt: string) {
    if (!confirm(`ต้องการลบแบนเนอร์ "${alt}" หรือไม่?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBanner(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มแบนเนอร์</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="grid gap-4 sm:grid-cols-2"
          >
            <BannerFormFields idPrefix="create" />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                เพิ่มแบนเนอร์
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>แบนเนอร์ทั้งหมด ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีแบนเนอร์ — ระบบจะใช้รูป default จากหน้า Home
            </p>
          ) : (
            banners.map((banner) =>
              editingId === banner.id ? (
                <form
                  key={banner.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleUpdate(banner.id, new FormData(event.currentTarget));
                  }}
                  className="grid gap-4 rounded-md border p-4 sm:grid-cols-2"
                >
                  <BannerFormFields
                    idPrefix={`edit-${banner.id}`}
                    defaults={{
                      title: banner.title,
                      alt: banner.alt,
                      imageUrl: banner.imageUrl,
                      sortOrder: banner.sortOrder,
                      isActive: banner.isActive,
                      placement: getPlacement(banner) ?? "home_hero",
                    }}
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      บันทึก
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  key={banner.id}
                  className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-md border bg-muted/20 p-1">
                      <RemoteImage
                        src={banner.imageUrl}
                        alt={banner.alt}
                        contain
                        className="max-h-16 max-w-28 rounded-sm"
                        sizes="112px"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {banner.title || banner.alt}
                        </p>
                        <Badge variant={banner.isActive ? "default" : "secondary"}>
                          {banner.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatBannerPlacement(banner.placement)} · ลำดับ{" "}
                        {banner.sortOrder}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        alt: {banner.alt}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1 self-end sm:self-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleToggle(banner.id, !banner.isActive)
                      }
                      disabled={isPending}
                      aria-label={banner.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    >
                      <Power
                        className={
                          banner.isActive
                            ? "h-4 w-4 text-emerald-600"
                            : "h-4 w-4 text-muted-foreground"
                        }
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(banner.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(banner.id, banner.alt)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ),
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
