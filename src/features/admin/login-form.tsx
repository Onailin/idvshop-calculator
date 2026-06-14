"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/brand-logo";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);

    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      if (result.error === "Configuration") {
        toast.error("ระบบเข้าสู่ระบบยังตั้งค่าไม่ครบ กรุณาตรวจสอบ AUTH_SECRET และ AUTH_URL");
      } else {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
      return;
    }

    if (!result?.ok) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    toast.success("ยินดีต้อนรับกลับ!");
    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="overflow-hidden border-brand-blush/70 bg-white/95 shadow-xl shadow-brand-rose/15 ring-1 ring-brand-rose/20 backdrop-blur-sm">
      <div aria-hidden className="h-1.5 bg-gradient-to-r from-brand-rose via-primary to-brand-blush" />

      <CardHeader className="items-center space-y-4 pb-2 pt-8 text-center">
        <BrandLogo variant="login" />
        <div className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">เข้าสู่ระบบแอดมิน</CardTitle>
          <p className="text-sm text-muted-foreground">
            กรอกชื่อผู้ใช้และรหัสผ่านเพื่อจัดการร้าน
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-8 pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="username"
              className="h-11 border-brand-blush/70 bg-white"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 border-brand-blush/70 bg-white"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              "กำลังเข้าสู่ระบบ..."
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                เข้าสู่ระบบ
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
