const ones = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underThousand(value: number): string {
  const parts: string[] = [];
  if (value >= 100) {
    parts.push(`${ones[Math.floor(value / 100)]} Hundred`);
    value %= 100;
  }
  if (value >= 20) {
    parts.push(tens[Math.floor(value / 10)]);
    if (value % 10) parts.push(ones[value % 10]);
  } else if (value > 0) {
    parts.push(ones[value]);
  }
  return parts.join(" ");
}

export function integerInIndianWords(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0 || value > 999_999_999) {
    throw new RangeError("Invoice amount is outside the supported range.");
  }
  if (value === 0) return "Zero";

  const parts: string[] = [];
  const crore = Math.floor(value / 10_000_000);
  const lakh = Math.floor((value % 10_000_000) / 100_000);
  const thousand = Math.floor((value % 100_000) / 1_000);
  const remainder = value % 1_000;
  if (crore) parts.push(`${underThousand(crore)} Crore`);
  if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
  if (remainder) parts.push(underThousand(remainder));
  return parts.join(" ");
}

export function amountInWords(paise: number): string {
  if (!Number.isSafeInteger(paise) || paise < 0) {
    throw new RangeError("Invoice amount must be a non-negative integer in paise.");
  }
  const rupees = Math.floor(paise / 100);
  const cents = paise % 100;
  const rupeeText = `${integerInIndianWords(rupees)} Rupees`;
  const paiseText = cents ? ` and ${integerInIndianWords(cents)} Paise` : "";
  return `${rupeeText}${paiseText} Only`;
}

export function invoiceYear(date: Date, timeZone: string): number {
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone }).format(date));
}

export function formatInvoiceNumber(prefix: string, year: number, sequence: number): string {
  if (!/^[A-Z0-9]{2,8}$/.test(prefix) || sequence < 1 || !Number.isSafeInteger(sequence)) {
    throw new RangeError("Invoice number configuration is invalid.");
  }
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}
