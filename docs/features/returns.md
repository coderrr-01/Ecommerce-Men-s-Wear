# Returns and exchanges

An authenticated customer can request a return/exchange for an item on an owned delivered order
within `siteConfig.shipping.returnsWindowDays` of `Order.deliveredAt`. Reasons are sanitized and
limited to 10-1000 characters. Up to three JPEG, PNG or WebP photos are accepted at 5 MB each via
the configured `StorageProvider`.

`ReturnRequest.activeKey` is unique while a request is open, enforcing one active request per order
item while preserving closed-request history. STAFF/ADMIN can approve/reject, mark an approved item
received, and close it as returned or exchanged. Stock changes only on the received action: it,
the request state and a positive `StockMovement` commit in one transaction. Duplicate receive
submissions cannot increment stock twice.

Every order-level return status change is written to `OrderStatusHistory`. Return history and photos
are owner-scoped in customer queries; return admin notes are not selected by customer reads.
