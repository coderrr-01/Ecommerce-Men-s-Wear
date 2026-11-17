export function toOrdersCsv(
  rows: {
    orderNumber: string;
    placedAt: Date;
    status: string;
    customerName: string;
    customerPhone: string;
    grandTotal: number;
  }[],
): string {
  const values = [
    ["Order Number", "Date", "Status", "Customer", "Phone", "Total (paise)"],
    ...rows.map((row) => [
      row.orderNumber,
      row.placedAt.toISOString(),
      row.status,
      row.customerName,
      row.customerPhone,
      String(row.grandTotal),
    ]),
  ];
  return `\uFEFF${values.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
