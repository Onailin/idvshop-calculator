import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BANNER_PLACEMENTS,
  BANNER_PLACEMENT_LABELS,
  type BannerPlacement,
} from "@/lib/banner-placements";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

type BannerFormDefaults = {
  title?: string | null;
  alt?: string;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  placement?: BannerPlacement;
};

type BannerFormFieldsProps = {
  idPrefix: string;
  defaults?: BannerFormDefaults;
};

export function BannerFormFields({
  idPrefix,
  defaults,
}: BannerFormFieldsProps) {
  return (
    <>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-placement`}>ตำแหน่งแสดงผล</Label>
        <select
          id={`${idPrefix}-placement`}
          name="placement"
          className={selectClassName}
          defaultValue={defaults?.placement ?? "home_hero"}
          required
        >
          {BANNER_PLACEMENTS.map((placement) => (
            <option key={placement} value={placement}>
              {BANNER_PLACEMENT_LABELS[placement]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>ชื่อ (ไม่บังคับ)</Label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={defaults?.title ?? ""}
          placeholder="เช่น อีเว้นต์ Identity V"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-alt`}>คำอธิบายรูป (alt)</Label>
        <Input
          id={`${idPrefix}-alt`}
          name="alt"
          defaultValue={defaults?.alt ?? ""}
          placeholder="อธิบายรูปสำหรับ accessibility"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-sortOrder`}>ลำดับ</Label>
        <Input
          id={`${idPrefix}-sortOrder`}
          name="sortOrder"
          type="number"
          min={0}
          max={9999}
          defaultValue={defaults?.sortOrder ?? 0}
        />
        <p className="text-xs text-muted-foreground">
          ตัวเลขน้อยแสดงก่อน (ใช้กับสไลด์อีเว้นต์)
        </p>
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
        <Checkbox
          id={`${idPrefix}-isActive`}
          name="isActive"
          value="true"
          defaultChecked={defaults?.isActive ?? true}
        />
        <Label htmlFor={`${idPrefix}-isActive`}>เปิดใช้งาน</Label>
      </div>

      <div className="sm:col-span-2">
        <ImageUploadField
          id={`${idPrefix}-image`}
          folder="banners"
          defaultUrl={defaults?.imageUrl}
        />
      </div>
    </>
  );
}
