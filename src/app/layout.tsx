import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "เครื่องคำนวณราคา Identity V",
  description:
    "คำนวณกระดุมและแนะนำแพ็กเกจสำหรับสกินและไอเทม Identity V",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${anuphan.className} ${anuphan.variable} h-full bg-background`}>
      <body className={`${anuphan.className} flex min-h-full flex-col bg-background text-foreground antialiased`}>
        <SessionProvider>
          {children}
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
