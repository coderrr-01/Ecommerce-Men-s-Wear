import type {
  AdminOrderStatus,
  OrderHistoryView,
  OrderTimelineStep,
} from "@/features/orders/types";

const transitions: Record<AdminOrderStatus, readonly AdminOrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function isAllowedOrderTransition(from: AdminOrderStatus, to: AdminOrderStatus): boolean {
  return transitions[from].includes(to);
}

export function nextOrderStatuses(status: AdminOrderStatus): readonly AdminOrderStatus[] {
  return transitions[status];
}

const fulfillmentSteps: readonly AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export function buildOrderTimeline(
  status: string,
  history: OrderHistoryView[],
  placedAt: Date,
): OrderTimelineStep[] {
  const known = history.length ? history : [];
  const reached = new Set(known.map((entry) => entry.toStatus));
  const currentIndex = fulfillmentSteps.indexOf(status as AdminOrderStatus);
  if (currentIndex >= 0) {
    fulfillmentSteps.slice(0, currentIndex + 1).forEach((step) => reached.add(step));
  }
  if (!known.length && status === "PENDING") reached.add("PENDING");

  const step = (value: string): OrderTimelineStep => {
    const event = [...known].reverse().find((entry) => entry.toStatus === value);
    return {
      status: value,
      completed: reached.has(value),
      current: status === value,
      createdAt: event?.createdAt ?? (value === "PENDING" && !known.length ? placedAt : null),
      note: event?.note ?? null,
    };
  };

  const steps =
    currentIndex < 0 && status !== "CANCELLED"
      ? [status]
      : status === "CANCELLED"
        ? fulfillmentSteps.filter((value) => reached.has(value))
        : fulfillmentSteps;
  const timeline = (status === "CANCELLED" && steps.length === 0 ? ["PENDING"] : steps).map(step);
  if (status === "CANCELLED") timeline.push(step("CANCELLED"));
  if (
    currentIndex < 0 &&
    status !== "CANCELLED" &&
    !fulfillmentSteps.includes(status as AdminOrderStatus)
  ) {
    timeline.push(step(status));
  }
  return timeline;
}
