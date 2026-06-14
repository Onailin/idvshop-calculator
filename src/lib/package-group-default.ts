import type { PackageGroupOption } from "@/types/package";

export function findRegularPackageGroupId(
  groups: PackageGroupOption[],
): string | null {
  const regular = groups.find(
    (group) => /ธรรมดา/.test(group.name) || /regular/i.test(group.name),
  );

  return regular?.id ?? null;
}
