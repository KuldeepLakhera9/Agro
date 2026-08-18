export function isAdminPhone(tenDigitPhone: string) {
  const list = (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return list.includes(tenDigitPhone);
}
