/** ไอเทมลูกแก้วกาชา — ใช้จัด layout รูปแยกจากไอเทมอื่น */
export function isGachaMarbleItem(item: {
  name: string;
  categoryName?: string;
}): boolean {
  const label = `${item.name} ${item.categoryName ?? ""}`.toLowerCase();

  return label.includes("ลูกแก้ว") || label.includes("กาชา");
}
