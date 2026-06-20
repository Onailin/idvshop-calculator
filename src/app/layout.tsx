import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import { Toaster } from "sonner";
import { getActiveSitePopup } from "@/actions/site-popup";
import { SessionProvider } from "@/components/providers/session-provider";
import { PageLoadGate } from "@/components/layout/page-load-gate";
import { SiteEntryPopup } from "@/components/layout/site-entry-popup";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const anuphan = Anuphan({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "Harmony TopUp บริการเติมเกมออนไลน์",
  description:
    "Harmony TopUp — บริการเติมเกม Identity V คำนวณกระดุมและแนะนำแพ็กเกจสำหรับสกินและไอเทม",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activePopup = await getActiveSitePopup();

  return (
    <html lang="th" className={`${anuphan.className} ${anuphan.variable} h-full bg-background`}>
      <body className={`${anuphan.className} flex min-h-full flex-col bg-background text-foreground antialiased`}>
        <SessionProvider>
          <PageLoadGate>
            {children}
            <SiteFooter />
          </PageLoadGate>
          <SiteEntryPopup
            key={activePopup?.id ?? "no-popup"}
            popup={
              activePopup
                ? {
                    id: activePopup.id,
                    headline: activePopup.headline,
                    headlineIcon: activePopup.headlineIcon,
                    headlineStyle: activePopup.headlineStyle,
                    body: activePopup.body,
                    images: activePopup.images.map((image) => ({
                      id: image.id,
                      imageUrl: image.imageUrl,
                      imageAlt: image.imageAlt,
                      linkUrl: image.linkUrl,
                    })),
                  }
                : null
            }
          />
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
