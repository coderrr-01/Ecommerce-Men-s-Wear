# Database

## Engine and conventions

- PostgreSQL via Prisma 6.19.
- Tables use snake_case through `@@map`; Prisma model/field names stay PascalCase, so columns keep camelCase (for example `basePrice`, `deletedAt`).
- Primary keys are CUID strings unless noted.
- Timestamps are UTC. `createdAt`/`updatedAt` are automatic where applicable.
- Money columns are integers in paise (INR minor unit). Never store floats for money.
- Soft-deletable entities carry `deletedAt`. Prisma does not hide soft-deleted rows automatically: every repository query must add `deletedAt: null` where appropriate.
- Foreign keys use `onDelete` deliberately: cascade for owned children, `SetNull` for historical references, `Restrict` where a parent must not vanish (product category, variant order history).

## Enums

| Enum                 | Values                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `Role`               | `CUSTOMER`, `STAFF`, `ADMIN`                                                                          |
| `Gender`             | `MEN`                                                                                                 |
| `OrderStatus`        | `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED` |
| `PaymentStatus`      | `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`                       |
| `PaymentProvider`    | `RAZORPAY`, `COD`, `MOCK`                                                                             |
| `OrderPaymentMethod` | `WHATSAPP`, `COD`                                                                                     |
| `AddressType`        | `SHIPPING`, `BILLING`                                                                                 |
| `CouponType`         | `PERCENTAGE`, `FIXED`                                                                                 |
| `ReviewStatus`       | `PENDING`, `APPROVED`, `REJECTED`                                                                     |
| `ProductSizeType`    | `TOPS`, `BOTTOMS`, `FOOTWEAR`, `FREE_SIZE`                                                            |

## Models

| Model                | Purpose                                  | Notable constraints/indexes                                                                          |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `User`               | Customers and staff                      | unique `email`; `role`; `isActive`; `deletedAt`                                                      |
| `Address`            | Saved shipping/billing addresses         | indexed `userId`; soft delete                                                                        |
| `Category`           | Menswear taxonomy, self-referencing tree | unique `slug`; `parentId`                                                                            |
| `Product`            | Catalogue product                        | unique `slug`; category; paise `basePrice`; status/featured/new-arrival flags; size set; soft delete |
| `ProductVariant`     | Size/colour SKU                          | unique `sku`; integer `price`, optional `compareAtPrice`, `stock`; soft delete                       |
| `ProductImage`       | Product gallery                          | `sortOrder`, `isPrimary`, Cloudinary `publicId`, soft delete                                         |
| `StockMovement`      | Auditable inventory adjustment           | `variantId`, signed `delta`, reason, acting `userId`, indexed creation time                          |
| `Cart`               | One cart per user or guest session       | unique nullable `userId`, unique nullable `sessionId`                                                |
| `CartItem`           | Variant and quantity                     | unique `(cartId, variantId)`                                                                         |
| `Order`              | Immutable order header and totals        | unique order number/token/idempotency key; customer phone/status indexes; address JSON               |
| `OrderItem`          | Product snapshot at purchase time        | stores name, slug, SKU, size, colour, price, image                                                   |
| `OrderStatusHistory` | Append-only order lifecycle events       | order, previous/next status, optional actor and customer-visible note                                |
| `OrderInternalNote`  | Staff-only order notes                   | order, author, note and creation time; excluded from customer reads                                  |
| `InvoiceSequence`    | Annual invoice counter                   | year primary key and transactional next-value counter                                                |
| `Payment`            | Payment attempts per order               | provider/status, provider IDs, raw response                                                          |
| `Coupon`             | Discount rules                           | unique `code`; percentage or fixed value; windows and usage limits                                   |
| `Wishlist`           | User/product pairs                       | unique `(userId, productId)`                                                                         |
| `Review`             | Ratings and moderation                   | one review per user/product; status default `PENDING`                                                |
| `Banner`             | Home/merchandising placements            | placement, schedule, sort order, soft delete                                                         |
| `SizeGuide`          | JSON size tables                         | unique `slug`; optional category                                                                     |
| `StoreSettings`      | Singleton operational settings           | `id` defaults to `"default"`; tax bps, shipping fees, COGS flags                                     |

See `prisma/schema.prisma` for the authoritative definition.

## Migration workflow

Committed migrations:

- `prisma/migrations/20261113000000_init/migration.sql`
- `prisma/migrations/20261113114155_admin_catalog_stock_movements/migration.sql`
- `prisma/migrations/20261117063053_whatsapp_checkout/migration.sql`

The admin migration adds `ProductSizeType`, product fields used by the catalog editor, and the
`stock_movements` table. It was generated with Prisma and applied to the configured PostgreSQL
database during Phase 2 verification.

With a reachable development database:

```bash
pnpm db:migrate
```

To create a new migration after schema changes:

```bash
pnpm exec prisma migrate dev --name describe_change
```

The initial migration was generated from an empty database with `--from-empty`. Builds do not apply
migrations; schema changes are applied only by the explicit migration commands above.

WhatsApp checkout adds nullable, additive order fields (`whatsappToken`, `idempotencyKey`,
`checkoutSessionHash`, customer name/phone and stock commit time), the optional `OrderPaymentMethod`
enum field and `OrderItem.productSlug`. Generate and apply the migration against the development
database interactively:

```powershell
pnpm exec prisma migrate dev --name whatsapp_checkout
```

Do not hand-write migration SQL or use `db push`. Existing orders remain valid because new
identifiers/snapshots are nullable for legacy rows and the payment-method field has no default.
Commit the generated migration with the schema and application changes.

Phase 5 Part A adds only nullable order tracking/invoice fields and new history, internal-note and
invoice-sequence tables. Generate the migration from `prisma/schema.prisma` with
`pnpm prisma migrate dev --name phase5_order_experience`; do not hand-write SQL or use `db push`.
Invoice assignment increments the yearly counter and writes the unique invoice number in one
serializable transaction. A failed/retried allocation rolls back its counter change.
This migration has not yet been generated: the current command environment is non-interactive and
Prisma refused `migrate dev`. Run the command in an interactive development terminal and review the
generated additive migration before applying it.

## Seed

`pnpm db:seed` runs `prisma/seed.ts` with `tsx`.

- Idempotent by slug/email/code; safe to rerun in development.
- Creates 5 categories, 15 menswear products, variants, images, size guides, 2 users, coupons, a banner and store settings.
- Refuses production unless `ALLOW_DEMO_SEED=true`.
- Password hashes use bcrypt cost 12.
- Demo credentials are documented in `README.md`; override with `SEED_*` variables.
- Seed does not delete operator data.

## Transaction and stock rules

Cart quantity changes use a transaction. WhatsApp order placement reads the cart and active product
variants, recomputes all prices from the database, creates the pending order plus item snapshots,
and clears the cart in one serializable transaction. It does not reserve or deduct stock.

When an ADMIN/STAFF user confirms an order, a conditional decrement (`stock >= quantity`), status
update and negative `StockMovement` rows run atomically. Insufficient stock rolls back the status
change and all item decrements. Cancelling an order with committed stock restores quantities and
writes positive movements in the same transaction. The status compare-and-set prevents duplicate
confirm/cancel effects.

Order creation and each permitted status transition also append an `OrderStatusHistory` row in the
same transaction. Staff-only notes are stored separately and omitted from customer/guest query
selections. Older orders may have no history rows; their current state is shown without inventing
timestamps for earlier transitions.

The cart availability rule lives in `src/features/inventory/services/stock.ts`. Admin inventory
adjustments validate non-negative integer targets, update variants and insert a signed
`StockMovement` in one serializable transaction. Product form stock changes and variant removals
also write movements in their existing transaction.

## Operational notes

- Back up before `db:migrate:deploy` in production.
- Use a separate shadow database user for Prisma migrations.
- Consider read replicas only after introducing a repository-level read/write split; do not point Prisma writes at a replica.
- Soft-deleted rows are retained for order history. Hard-delete only through an explicit retention process.
