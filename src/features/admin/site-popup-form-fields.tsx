import { SitePopupHeadlineStyleField } from "@/components/admin/site-popup-headline-style-field";
import { SitePopupImagesField } from "@/components/admin/site-popup-images-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SitePopupImageInput } from "@/validators/site-popup";

type SitePopupFormDefaults = {
  headline?: string | null;
  headlineStyle?: string | null;
  body?: string | null;
  images?: SitePopupImageInput[];
};

type SitePopupFormFieldsProps = {
  idPrefix: string;
  defaults?: SitePopupFormDefaults;
};

export function SitePopupFormFields({
  idPrefix,
  defaults,
}: SitePopupFormFieldsProps) {
  return (
    <>
      <input type="hidden" name="headlineIcon" value="sparkles" readOnly />

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-headline`}>หัวข้อ (ไม่บังคับ)</Label>
        <Input
          id={`${idPrefix}-headline`}
          name="headline"
          defaultValue={defaults?.headline ?? ""}
          placeholder="เช่น ครบจบในเว็บเดียวที่ร้านเรา"
        />
      </div>

      <SitePopupHeadlineStyleField defaultValue={defaults?.headlineStyle} />

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-body`}>ข้อความด้านล่างรูป (ไม่บังคับ)</Label>
        <textarea
          id={`${idPrefix}-body`}
          name="body"
          defaultValue={defaults?.body ?? ""}
          placeholder="เช่น โปรโมชั่นพิเศษ เติมไว เติมถูก"
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <SitePopupImagesField
        idPrefix={idPrefix}
        defaultImages={defaults?.images}
      />
    </>
  );
}
