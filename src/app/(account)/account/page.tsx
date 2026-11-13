import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/services/session.service";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-2xl tracking-tight">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your details, orders and saved pieces.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-3">
          <CardHeader>
            <CardDescription>Profile</CardDescription>
            <CardTitle className="text-xl">{user.name ?? "Add your name"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{user.email}</p>
            {user.phone ? <p className="mt-1">{user.phone}</p> : null}
            <p className="mt-3 text-xs">
              Member since{" "}
              {user.createdAt.toLocaleDateString(siteConfig.locale, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader>
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-xl">Track your purchases</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Order history and tracking will appear here once you place an order.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader>
            <CardDescription>Wishlist</CardDescription>
            <CardTitle className="text-xl">Saved for later</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Keep the pieces you are considering in one place.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/wishlist">Open wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader>
            <CardDescription>Addresses</CardDescription>
            <CardTitle className="text-xl">Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Add and manage addresses for a faster checkout.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/account/addresses">Manage addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
