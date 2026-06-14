import { inferItemTypeFromCategoryName } from "@/lib/item-type";
import type { S3UploadFolder } from "@/types/upload";

export function getUploadFolderForCategoryName(
  categoryName: string,
): S3UploadFolder {
  const itemType = inferItemTypeFromCategoryName(categoryName);
  return itemType === "SKIN" ? "skins" : "items";
}
