import { buildOrderTimeline } from "@/features/orders/status.utils";
import type { OrderHistoryView } from "@/features/orders/types";
import { siteConfig } from "@/config/site.config";

export function OrderStatusTimeline({
  status,
  history,
  placedAt,
}: {
  status: string;
  history: OrderHistoryView[];
  placedAt: Date;
}) {
  const steps = buildOrderTimeline(status, history, placedAt);
  return (
    <ol aria-label="Order status timeline" className="space-y-0">
      {steps.map((step, index) => (
        <li key={`${step.status}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="absolute top-3 left-[5px] h-full w-px bg-border" />
          ) : null}
          <span
            aria-hidden="true"
            className={`relative mt-1 size-3 shrink-0 rounded-full border ${
              step.status === "CANCELLED"
                ? "border-destructive bg-destructive"
                : step.completed
                  ? "border-primary bg-primary"
                  : "border-border bg-background"
            }`}
          />
          <div className="min-w-0">
            <p className={`text-sm ${step.current ? "font-semibold" : "font-medium"}`}>
              {step.status.replaceAll("_", " ")}
            </p>
            {step.createdAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {step.createdAt.toLocaleString(siteConfig.locale, {
                  timeZone: siteConfig.timezone,
                })}
              </p>
            ) : null}
            {step.note ? <p className="mt-1 text-xs text-muted-foreground">{step.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
