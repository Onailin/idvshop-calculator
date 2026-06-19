"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImageUploadHint } from "@/lib/image-upload-guide";
import { uploadImageViaApi } from "@/lib/upload-image-client";
import type { SitePopupImageInput } from "@/validators/site-popup";

type SitePopupImagesFieldProps = {
  idPrefix: string;
  defaultImages?: SitePopupImageInput[];
};

export function SitePopupImagesField({
  idPrefix,
  defaultImages = [],
}: SitePopupImagesFieldProps) {
  const [images, setImages] = useState<SitePopupImageInput[]>(defaultImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadImageViaApi(file, "banners");
      setImages((current) => [
        ...current,
        { imageUrl: url, imageAlt: "", linkUrl: "" },
      ]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "อัปโหลดรูปภาพไม่สำเร็จ",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function updateImage(
    index: number,
    field: keyof SitePopupImageInput,
    value: string,
  ) {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [field]: value } : image,
      ),
    );
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div className="space-y-4 sm:col-span-2">
      <input type="hidden" name="images" value={JSON.stringify(images)} readOnly />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label>รูปภาพในป๊อปอัพ</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            อัปโหลดได้หลายรูป — ถ้ามากกว่า 1 รูปจะแสดงเป็นสไลด์
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id={`${idPrefix}-add-image`}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleAddImage}
            disabled={isUploading}
            className="sr-only"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              document.getElementById(`${idPrefix}-add-image`)?.click()
            }
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Plus className="mr-1 h-3.5 w-3.5" />
                เพิ่มรูป
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{getImageUploadHint("banners")}</p>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {images.length === 0 ? (
        <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            ยังไม่มีรูป — เลือกไฟล์เพื่อเพิ่มรูปแรก
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={`${image.imageUrl}-${index}`}
              className="grid gap-3 rounded-md border p-3 sm:grid-cols-[7rem_1fr_auto]"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-md border bg-muted/20 sm:h-24 sm:w-28">
                <RemoteImage
                  src={image.imageUrl}
                  alt={image.imageAlt || `รูปที่ ${index + 1}`}
                  contain
                  fill
                  sizes="112px"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${idPrefix}-alt-${index}`}>
                    คำอธิบายรูป (alt) #{index + 1}
                  </Label>
                  <Input
                    id={`${idPrefix}-alt-${index}`}
                    value={image.imageAlt}
                    onChange={(event) =>
                      updateImage(index, "imageAlt", event.target.value)
                    }
                    placeholder="อธิบายรูปสำหรับ accessibility"
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${idPrefix}-link-${index}`}>
                    ลิงก์เมื่อกดรูป (ไม่บังคับ)
                  </Label>
                  <Input
                    id={`${idPrefix}-link-${index}`}
                    type="url"
                    value={image.linkUrl ?? ""}
                    onChange={(event) =>
                      updateImage(index, "linkUrl", event.target.value)
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="self-start"
                onClick={() => removeImage(index)}
                aria-label={`ลบรูปที่ ${index + 1}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
