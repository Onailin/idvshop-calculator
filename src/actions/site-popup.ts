"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { deleteImageFromS3 } from "@/lib/aws/s3-upload";
import { messages } from "@/lib/messages";
import { sanitizeString } from "@/lib/utils";
import { sitePopupSchema } from "@/validators/site-popup";
import type { ActionResult } from "@/types";
import { Prisma, type SitePopup, type SitePopupImage } from "@prisma/client";

const SITE_POPUP_PATHS = ["/", "/admin/popups"] as const;

export type SitePopupWithImages = SitePopup & {
  images: SitePopupImage[];
};

const popupWithImagesInclude = {
  images: {
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
  },
} satisfies Prisma.SitePopupInclude;

function getSitePopupClient() {
  if (!("sitePopup" in prisma) || !prisma.sitePopup) {
    return null;
  }

  return prisma.sitePopup;
}

function revalidateSitePopupPaths() {
  revalidatePath("/", "layout");
  for (const path of SITE_POPUP_PATHS) {
    revalidatePath(path);
  }
}

function parseSitePopupImages(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseSitePopupForm(formData: FormData) {
  return {
    headline: sanitizeString(String(formData.get("headline") ?? "")),
    headlineIcon: String(formData.get("headlineIcon") ?? "sparkles"),
    headlineStyle: String(formData.get("headlineStyle") ?? "rose"),
    body: sanitizeString(String(formData.get("body") ?? "")),
    images: parseSitePopupImages(String(formData.get("images") ?? "[]")),
  };
}

async function deleteRemovedImages(
  previousImages: SitePopupImage[],
  nextImageUrls: string[],
) {
  const nextUrlSet = new Set(nextImageUrls);
  const removed = previousImages.filter((image) => !nextUrlSet.has(image.imageUrl));

  await Promise.all(
    removed.map((image) =>
      deleteImageFromS3(image.imageUrl).catch(() => undefined),
    ),
  );
}

export async function getSitePopupForAdmin(): Promise<SitePopupWithImages | null> {
  await requireAdmin();
  disableRequestCache();

  const sitePopup = getSitePopupClient();
  if (!sitePopup) {
    return null;
  }

  const { data } = await safeQuery(
    () =>
      sitePopup.findFirst({
        orderBy: { createdAt: "asc" },
        include: popupWithImagesInclude,
      }),
    null,
  );

  return data as SitePopupWithImages | null;
}

export async function getActiveSitePopup(): Promise<SitePopupWithImages | null> {
  disableRequestCache();

  const sitePopup = getSitePopupClient();
  if (!sitePopup) {
    return null;
  }

  const { data } = await safeQuery(
    () =>
      sitePopup.findFirst({
        where: { isActive: true },
        include: popupWithImagesInclude,
      }),
    null,
  );

  const popup = data as SitePopupWithImages | null;

  if (!popup || popup.images.length === 0) {
    return null;
  }

  return popup;
}

export async function saveSitePopup(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = sitePopupSchema.safeParse(parseSitePopupForm(formData));
    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const sitePopup = getSitePopupClient();
    if (!sitePopup) {
      return { success: false, message: messages.sitePopupUpdateFailed };
    }

    const existing = await sitePopup.findFirst({
      orderBy: { createdAt: "asc" },
      include: popupWithImagesInclude,
    });

    const popupData = {
      headline: parsed.data.headline || null,
      headlineIcon: parsed.data.headlineIcon,
      headlineStyle: parsed.data.headlineStyle,
      body: parsed.data.body || null,
    };

    const imageData = parsed.data.images.map((image, index) => ({
      imageUrl: image.imageUrl,
      imageAlt: image.imageAlt,
      linkUrl: image.linkUrl || null,
      sortOrder: index,
    }));

    let popup: SitePopup;

    if (existing) {
      await deleteRemovedImages(
        existing.images,
        imageData.map((image) => image.imageUrl),
      );

      popup = await sitePopup.update({
        where: { id: existing.id },
        data: {
          ...popupData,
          images: {
            deleteMany: {},
            create: imageData,
          },
        },
      });
    } else {
      popup = await sitePopup.create({
        data: {
          ...popupData,
          isActive: true,
          images: {
            create: imageData,
          },
        },
      });
    }

    revalidateSitePopupPaths();

    return {
      success: true,
      message: existing
        ? messages.sitePopupUpdated
        : messages.sitePopupCreated,
      data: { id: popup.id },
    };
  } catch {
    return { success: false, message: messages.sitePopupUpdateFailed };
  }
}

export async function toggleSitePopupActive(
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const sitePopup = getSitePopupClient();
    if (!sitePopup) {
      return { success: false, message: messages.sitePopupUpdateFailed };
    }

    const existing = await sitePopup.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!existing) {
      return { success: false, message: messages.sitePopupNotFound };
    }

    await sitePopup.update({
      where: { id: existing.id },
      data: { isActive },
    });

    revalidateSitePopupPaths();

    return {
      success: true,
      message: isActive ? messages.sitePopupEnabled : messages.sitePopupDisabled,
    };
  } catch {
    return { success: false, message: messages.sitePopupUpdateFailed };
  }
}
