"use client";

import { useEffect, useRef, useState } from "react";
import { RemoteImage } from "@/components/ui/remote-image";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDisplayImageSrc } from "@/lib/image-url";
import { uploadImageViaApi } from "@/lib/upload-image-client";
import { getImageUploadHint } from "@/lib/image-upload-guide";
import type { S3UploadFolder } from "@/types/upload";

type ImageUploadFieldProps = {
  id: string;
  folder: S3UploadFolder;
  name?: string;
  label?: string;
  defaultUrl?: string | null;
  disabled?: boolean;
};

export function ImageUploadField({
  id,
  folder,
  name = "imageUrl",
  label = "รูปภาพ",
  defaultUrl,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(defaultUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(defaultUrl ?? "");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [defaultUrl, id]);

  const displaySrc = imageUrl ? toDisplayImageSrc(imageUrl) : null;
  const hasImage = Boolean(imageUrl);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadImageViaApi(file, folder);
      setImageUrl(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "อัปโหลดรูปภาพไม่สำเร็จ",
      );
      event.target.value = "";
    } finally {
      setIsUploading(false);
    }
  }

  function handleClear() {
    setImageUrl("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <input type="hidden" name={name} value={imageUrl} readOnly />

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
          {displaySrc ? (
            <RemoteImage
              src={imageUrl}
              alt="ตัวอย่างรูปภาพ"
              contain
              fill
              sizes="160px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
              ยังไม่มีรูป
            </div>
          )}
        </div>

        <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
          <Input
            ref={inputRef}
            id={id}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          <p className="text-xs text-muted-foreground">
            {getImageUploadHint(folder)}
          </p>

          <div className="flex gap-2">
            {hasImage && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClear}
                disabled={disabled || isUploading}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                ลบรูป
              </Button>
            )}
            {isUploading && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                กำลังอัปโหลด...
              </span>
            )}
            {!isUploading && !hasImage && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Upload className="h-3.5 w-3.5" />
                เลือกรูปเพื่ออัปโหลดไปยัง S3
              </span>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
