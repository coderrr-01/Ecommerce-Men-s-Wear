import Link from "next/link";
import { getCommunicationLists } from "@/features/communications/services/communication.service";

export default async function AdminMessagesPage() {
  const { subscriptions, messages } = await getCommunicationLists();
  return (
    <section className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Newsletter and contact</h1>
      </header>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Newsletter ({subscriptions.length})</h2>
          <Link className="text-sm underline" href="/api/admin/messages/export?kind=newsletter">
            Export CSV
          </Link>
        </div>
        <ul className="divide-y rounded-lg border">
          {subscriptions.map((item) => (
            <li key={item.email} className="flex justify-between p-3 text-sm">
              <span>{item.email}</span>
              <time>{item.createdAt.toLocaleDateString("en-IN")}</time>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Contact messages ({messages.length})</h2>
          <Link className="text-sm underline" href="/api/admin/messages/export?kind=contacts">
            Export CSV
          </Link>
        </div>
        <div className="space-y-3">
          {messages.map((item, index) => (
            <article
              key={`${item.createdAt.toISOString()}-${index}`}
              className="rounded-lg border p-4"
            >
              <h3 className="font-medium">{item.subject}</h3>
              <p className="text-xs text-muted-foreground">
                {item.name} · {item.email}
                {item.phone ? ` · ${item.phone}` : ""}
              </p>
              <p className="mt-3 text-sm whitespace-pre-wrap">{item.message}</p>
              <time className="mt-2 block text-xs text-muted-foreground">
                {item.createdAt.toLocaleString("en-IN")}
              </time>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
