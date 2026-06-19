"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSitePopup, toggleSitePopupActive } from "@/actions/site-popup";
import type { SitePopupWithImages } from "@/actions/site-popup";
import { SitePopupFormFields } from "@/features/admin/site-popup-form-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type SitePopupManagerProps = {
  popup: SitePopupWithImages | null;
};

export function SitePopupManager({ popup }: SitePopupManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveSitePopup(formData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleToggle(isActive: boolean) {
    startTransition(async () => {
      const result = await toggleSitePopupActive(isActive);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const defaultImages =
    popup?.images.map((image) => ({
      imageUrl: image.imageUrl,
      imageAlt: image.imageAlt,
      linkUrl: image.linkUrl ?? "",
    })) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle>ตั้งค่าป๊อปอัพ</CardTitle>
            <p className="text-sm text-muted-foreground">
              มีได้เพียง 1 ป๊อปอัพ แต่ใส่รูปได้หลายรูป
            </p>
          </div>
          {popup && (
            <div className="flex items-center gap-3">
              <Badge variant={popup.isActive ? "default" : "secondary"}>
                {popup.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </Badge>
              <Switch
                checked={popup.isActive}
                disabled={isPending}
                onCheckedChange={handleToggle}
                aria-label={popup.isActive ? "ปิดใช้งานป๊อปอัพ" : "เปิดใช้งานป๊อปอัพ"}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <SitePopupFormFields
              idPrefix="popup"
              defaults={{
                headline: popup?.headline,
                headlineStyle: popup?.headlineStyle,
                body: popup?.body,
                images: defaultImages,
              }}
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isPending}>
                {popup ? "บันทึกการเปลี่ยนแปลง" : "สร้างป๊อปอัพ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
