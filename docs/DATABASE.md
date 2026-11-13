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

| Enum              | Values                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `Role`            | `CUSTOMER`, `STAFF`, `ADMIN`                                                                          |
| `Gender`          | `MEN`                                                                                                 |
| `OrderStatus`     | `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURN_REQUESTED`, `RETURNED` |
| `PaymentStatus`   | `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`                       |
| `PaymentProvider` | `RAZORPAY`, `COD`, `MOCK`                                                                             |
| `AddressType`     | `SHIPPING`, `BILLING`                                                                                 |
| `CouponType`      | `PERCENTAGE`, `FIXED`                                                                                 |
| `ReviewStatus`    | `PENDING`, `APPROVED`, `REJECTED`                                                                     |
| `ProductSizeType` | `TOPS`, `BOTTOMS`, `FOOTWEAR`, `FREE_SIZE`                                                   |

## Models

| Model            | Purpose                                  | Notable constraints/indexes                                                              |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `User`           | Customers and staff                      | unique `email`; `role`; `isActive`; `deletedAt`                                          |
| `Address`        | Saved shipping/billing addresses         | indexed `userId`; soft delete                                                            |
| `Category`       | Menswear taxonomy, self-referencing tree | unique `slug`; `parentId`                                                                |
| `Product`        | Catalogue product                        | unique `slug`; category; paise `basePrice`; status/featured/new-arrival flags; size set; soft delete |
| `ProductVariant` | Size/colour SKU                          | unique `sku`; integer `price`, optional `compareAtPrice`, `stock`; soft delete            |
| `ProductImage`   | Product gallery                          | `sortOrder`, `isPrimary`, Cloudinary `publicId`, soft delete                              |
| `StockMovement`  | Auditable inventory adjustment           | `variantId`, signed `delta`, reason, acting `userId`, indexed creation time               |
| `Cart`           | One cart per user or guest session       | unique nullable `userId`, unique nullable `sessionId`                                    |
| `CartItem`       | Variant and quantity                     | unique `(cartId, variantId)`                                                             |
| `Order`          | Immutable order header and totals        | unique `orderNumber`; address snapshots as JSON; coupon reference                        |
| `OrderItem`      | Product snapshot at purchase time        | stores name, SKU, size, colour, price, image                                             |
| `Payment`        | Payment attempts per order               | provider/status, provider IDs, raw response                                              |
| `Coupon`         | Discount rules                           | unique `code`; percentage or fixed value; windows and usage limits                       |
| `Wishlist`       | User/product pairs                       | unique `(userId, productId)`                                                             |
| `Review`         | Ratings and moderation                   | one review per user/product; status default `PENDING`                                    |
| `Banner`         | Home/merchandising placements            | placement, schedule, sort order, soft delete                                             |
| `SizeGuide`      | JSON size tables                         | unique `slug`; optional category                                                         |
| `StoreSettings`  | Singleton operational settings           | `id` defaults to `"default"`; tax bps, shipping fees, COGS flags                         |

See `prisma/schema.prisma` for the authoritative definition.

## Migration workflow

Committed migrations:

- `prisma/migrations/20261113000000_init/migration.sql`
- `prisma/migrations/20261113114155_admin_catalog_stock_movements/migration.sql`

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

If no database is available, generate SQL only:

```bash
pnpm exec prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DATABASE_URL" \
  --script
```

The initial migration was generated from an empty database with `--from-empty`. Builds do not apply
migrations; schema changes are applied only by the explicit migration commands above.

## Seed

`pnpm db:seed` runs `prisma/seed.ts` with `tsx`.

- Idempotent by slug/email/code; safe to rerun in development.
- Creates 5 categories, 15 menswear products, variants, images, size guides, 2 users, coupons, a banner and store settings.
- Refuses production unless `ALLOW_DEMO_SEED=true`.
- Password hashes use bcrypt cost 12.
- Demo credentials are documented in `README.md`; override with `SEED_*` variables.
- Seed does not delete operator data.

## Transaction and stock rules

Cart quantity changes and future order placement must run in a single transaction:

1. Lock/read the variant stock.
2. Validate requested quantity against available stock.
3. Write the cart/order rows.
4. At order placement, decrement stock in the same transaction and roll back on failure.

The cart availability rule lives in `src/features/inventory/services/stock.ts`. Admin inventory
adjustments validate non-negative integer targets, update variants and insert a signed
`StockMovement` in one serializable transaction. Product form stock changes and variant removals
also write movements in their existing transaction. Order placement is not implemented, so stock is
not yet reserved or decremented at checkout.

## Operational notes

- Back up before `db:migrate:deploy` in production.
- Use a separate shadow database user for Prisma migrations.
- Consider read replicas only after introducing a repository-level read/write split; do not point Prisma writes at a replica.
- Soft-deleted rows are retained for order history. Hard-delete only through an explicit retention process.
