"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "ระบบ auth ตั้งค่าไม่ครบ — ใส่ AUTH_SECRET และ AUTH_URL บน Vercel แล้ว Redeploy",
  CredentialsSignin: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  AccessDenied: "ไม่มีสิทธิ์เข้าใช้งาน",
  Default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่",
};

export function LoginErrorAlert() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) {
      return;
    }

    const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;
    toast.error(message);
  }, [error]);

  return null;
}
