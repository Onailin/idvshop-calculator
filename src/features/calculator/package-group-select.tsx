"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_GROUPS_FILTER, type PackageGroupFilter, type PackageGroupOption } from "@/types/package";

type PackageGroupSelectProps = {
  packageGroups: PackageGroupOption[];
  value: PackageGroupFilter;
  onChange: (value: PackageGroupFilter) => void;
  hideLabel?: boolean;
};

export function PackageGroupSelect({
  packageGroups,
  value,
  onChange,
  hideLabel = false,
}: PackageGroupSelectProps) {
  return (
    <div className="space-y-2">
      {!hideLabel && <Label>กลุ่มแพ็กเกจ</Label>}
      <Select
        value={value}
        onValueChange={(next) => onChange(next as PackageGroupFilter)}
      >
        <SelectTrigger>
          <SelectValue placeholder="เลือกกลุ่มแพ็กเกจ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_GROUPS_FILTER}>ทุกกลุ่ม</SelectItem>
          {packageGroups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
