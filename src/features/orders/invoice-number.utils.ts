import { formatInvoiceNumber, invoiceYear } from "@/features/orders/invoice.utils";
import { ConflictError } from "@/lib/errors";

interface InvoiceSequenceStore<Tx> {
  allocate(tx: Tx, year: number): Promise<number>;
  assign(tx: Tx, orderId: string, invoiceNumber: string): Promise<boolean>;
}

export async function allocateInvoiceNumber<Tx>(
  transaction: <T>(run: (tx: Tx) => Promise<T>) => Promise<T>,
  store: InvoiceSequenceStore<Tx>,
  order: { id: string; placedAt: Date; invoiceNumber: string | null },
  prefix: string,
  timeZone: string,
): Promise<string> {
  if (order.invoiceNumber) return order.invoiceNumber;
  const year = invoiceYear(order.placedAt, timeZone);
  return transaction(async (tx) => {
    const sequence = await store.allocate(tx, year);
    const invoiceNumber = formatInvoiceNumber(prefix, year, sequence);
    if (!(await store.assign(tx, order.id, invoiceNumber))) {
      throw new ConflictError("Invoice assignment will be retried.");
    }
    return invoiceNumber;
  });
}
