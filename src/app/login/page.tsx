import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/admin/login-form";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white via-brand-cream to-brand-blush/70"
      />
      <div
        aria-hidden
        className="absolute -right-16 top-16 h-72 w-72 rounded-full bg-brand-rose/25 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Admin Panel
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {BRAND_NAME}
          </h1>
          <p className="mt-1 text-sm font-medium text-primary">{BRAND_TAGLINE}</p>
        </div>

        <LoginForm />

        <p className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </p>
      </div>
    </div>
  );
}
