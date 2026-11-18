import { NextResponse } from "next/server";
import { ADMIN_ROLES } from "@/config/constants";
import { requireRole } from "@/features/auth/services/session.service";
import { getCommunicationLists } from "@/features/communications/services/communication.service";
import { communicationCsv } from "@/features/communications/csv.utils";

export async function GET(request: Request) {
  await requireRole(ADMIN_ROLES);
  const kind = new URL(request.url).searchParams.get("kind");
  const data = await getCommunicationLists();
  const rows =
    kind === "newsletter"
      ? [
          ["Email", "Subscribed at"],
          ...data.subscriptions.map((item) => [item.email, item.createdAt.toISOString()]),
        ]
      : [
          ["Name", "Email", "Phone", "Subject", "Message", "Received at"],
          ...data.messages.map((item) => [
            item.name,
            item.email,
            item.phone ?? "",
            item.subject,
            item.message,
            item.createdAt.toISOString(),
          ]),
        ];
  return new NextResponse(communicationCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind === "newsletter" ? "newsletter" : "contacts"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
