import { z } from "zod";
import { S3_UPLOAD_FOLDERS } from "@/types/upload";

export const uploadFolderSchema = z.enum(S3_UPLOAD_FOLDERS, {
  message: "โฟลเดอร์อัปโหลดไม่ถูกต้อง",
});
