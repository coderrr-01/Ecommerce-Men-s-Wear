export interface InvoiceAccess {
  userId: string | null;
  token: string | null;
  isStaff: boolean;
}

export function customerOrderWhere(orderNumber: string, userId: string) {
  return { orderNumber, userId };
}

export function publicOrderAccessWhere(orderNumber: string, token: string, userId: string | null) {
  return {
    orderNumber,
    whatsappToken: token,
    OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
  };
}

export function invoiceAccessWhere(orderNumber: string, access: InvoiceAccess) {
  if (access.isStaff) return { orderNumber };

  const allowedOwners = [
    ...(access.userId ? [{ userId: access.userId }] : []),
    ...(access.token ? [{ whatsappToken: access.token, userId: null }] : []),
  ];
  return allowedOwners.length
    ? { orderNumber, OR: allowedOwners }
    : { orderNumber, id: "__no_access__" };
}

export function isInvoiceAvailable(status: string, stockCommittedAt: Date | null): boolean {
  return (
    ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURNED"].includes(
      status,
    ) ||
    (status === "CANCELLED" && stockCommittedAt !== null)
  );
}
