"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-db";
import { disableRequestCache } from "@/lib/no-cache";
import { requireAdmin } from "@/lib/auth";
import { deleteImageFromS3 } from "@/lib/aws/s3-upload";
import { resolveHomePageBanners } from "@/lib/home-banner-mapper";
import { messages } from "@/lib/messages";
import { sanitizeString } from "@/lib/utils";
import { bannerSchema } from "@/validators/banner";
import type { ActionResult } from "@/types";
import type { HomePageBanners } from "@/lib/home-banner-mapper";

const HOME_BANNER_PATHS = ["/", "/admin/banners"] as const;

function revalidateBannerPaths() {
  for (const path of HOME_BANNER_PATHS) {
    revalidatePath(path);
  }
}

function parseBannerForm(formData: FormData) {
  const isActiveRaw = formData.get("isActive");
  const isActive =
    isActiveRaw === "true" ||
    isActiveRaw === "on" ||
    isActiveRaw === "1";

  return {
    title: sanitizeString(String(formData.get("title") ?? "")),
    alt: sanitizeString(String(formData.get("alt") ?? "")),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    sortOrder: formData.get("sortOrder"),
    isActive,
    placement: String(formData.get("placement") ?? ""),
  };
}

export async function getBannersForAdmin() {
  await requireAdmin();
  disableRequestCache();

  const { data } = await safeQuery(
    () =>
      prisma.banner.findMany({
        orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );

  return data;
}

export async function getHomePageBanners(): Promise<HomePageBanners> {
  disableRequestCache();

  const { data } = await safeQuery(
    () =>
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    [],
  );

  return resolveHomePageBanners(data);
}

export async function createBanner(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = bannerSchema.safeParse(parseBannerForm(formData));
    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const banner = await prisma.banner.create({
      data: {
        title: parsed.data.title || null,
        alt: parsed.data.alt,
        imageUrl: parsed.data.imageUrl,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        placement: parsed.data.placement,
      },
    });

    revalidateBannerPaths();

    return {
      success: true,
      message: messages.bannerCreated,
      data: { id: banner.id },
    };
  } catch {
    return { success: false, message: messages.bannerCreateFailed };
  }
}

export async function updateBanner(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: messages.bannerNotFound };
    }

    const parsed = bannerSchema.safeParse(parseBannerForm(formData));
    if (!parsed.success) {
      return {
        success: false,
        message: messages.validationFailed,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    if (
      existing.imageUrl &&
      existing.imageUrl !== parsed.data.imageUrl
    ) {
      await deleteImageFromS3(existing.imageUrl).catch(() => undefined);
    }

    await prisma.banner.update({
      where: { id },
      data: {
        title: parsed.data.title || null,
        alt: parsed.data.alt,
        imageUrl: parsed.data.imageUrl,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        placement: parsed.data.placement,
      },
    });

    revalidateBannerPaths();

    return { success: true, message: messages.bannerUpdated };
  } catch {
    return { success: false, message: messages.bannerUpdateFailed };
  }
}

export async function toggleBannerActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: messages.bannerNotFound };
    }

    await prisma.banner.update({
      where: { id },
      data: { isActive },
    });

    revalidateBannerPaths();

    return {
      success: true,
      message: isActive ? messages.bannerEnabled : messages.bannerDisabled,
    };
  } catch {
    return { success: false, message: messages.bannerUpdateFailed };
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: messages.bannerNotFound };
    }

    await prisma.banner.delete({ where: { id } });

    if (existing.imageUrl) {
      await deleteImageFromS3(existing.imageUrl).catch(() => undefined);
    }

    revalidateBannerPaths();

    return { success: true, message: messages.bannerDeleted };
  } catch {
    return { success: false, message: messages.bannerDeleteFailed };
  }
}
