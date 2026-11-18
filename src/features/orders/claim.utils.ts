export function normalizeIndianPhone(value: string | null | undefined): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  const mobile = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(mobile) ? mobile : null;
}

export function canClaimGuestOrder(
  orderPhone: string | null | undefined,
  accountPhone: string | null | undefined,
): boolean {
  const orderMobile = normalizeIndianPhone(orderPhone);
  const accountMobile = normalizeIndianPhone(accountPhone);
  return Boolean(orderMobile && accountMobile && orderMobile === accountMobile);
}
