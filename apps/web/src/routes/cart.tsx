import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { formatPrice, products } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — AXIS" },
      { name: "description", content: "Review your models and complete checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const initial = [products[0], products[2], products[4]].map((p) => ({ p, qty: 1 }));
  const [items, setItems] = useState(initial);
  const [coupon, setCoupon] = useState("");

  const subtotal = items.reduce((s, it) => s + it.p.price * it.qty, 0);
  const discount = coupon.trim().toUpperCase() === "AXIS10" ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return (
    <AppShell showSearch={false} title="Cart" showBack>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <>
          <ul className="px-4 pt-4 space-y-3">
            {items.map(({ p, qty }, idx) => (
              <li
                key={p.id}
                className="flex gap-3 p-3 bg-surface ring-1 ring-hairline rounded-2xl shadow-soft"
              >
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="size-20 shrink-0 rounded-xl overflow-hidden bg-muted"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    width={200}
                    height={200}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                    <button
                      onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))}
                      aria-label="Remove"
                      className="text-muted-foreground -mt-0.5 -mr-0.5 size-7 grid place-items-center rounded-full hover:bg-muted press"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {p.category} · {p.formats.slice(0, 2).join(" · ")}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center bg-muted rounded-full">
                      <button
                        className="size-7 grid place-items-center text-muted-foreground"
                        onClick={() =>
                          setItems((arr) =>
                            arr.map((it, i) =>
                              i === idx ? { ...it, qty: Math.max(1, qty - 1) } : it,
                            ),
                          )
                        }
                        aria-label="Decrease"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{qty}</span>
                      <button
                        className="size-7 grid place-items-center text-muted-foreground"
                        onClick={() =>
                          setItems((arr) =>
                            arr.map((it, i) => (i === idx ? { ...it, qty: qty + 1 } : it)),
                          )
                        }
                        aria-label="Increase"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(p.price * qty)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 mt-6 space-y-4">
            <div className="flex items-center gap-2 bg-surface ring-1 ring-hairline rounded-full h-12 px-4">
              <Tag className="size-4 text-muted-foreground" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon (try AXIS10)"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <button className="text-xs font-semibold uppercase tracking-wider text-accent">
                Apply
              </button>
            </div>

            <div className="bg-surface ring-1 ring-hairline rounded-2xl p-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {discount > 0 && <Row label="Discount" value={`- ${formatPrice(discount)}`} accent />}
              <div className="h-px bg-hairline my-1" />
              <Row label="Total" value={formatPrice(total)} bold />
            </div>

            <button className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold press hover:bg-foreground/90">
              Checkout
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Instant access to files after purchase
            </p>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`${bold ? "text-base font-semibold" : ""} ${accent ? "text-accent" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Empty() {
  return (
    <div className="px-6 py-24 text-center">
      <h3 className="text-base font-semibold">Your cart is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">Add models to see them here.</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
      >
        Browse models
      </Link>
    </div>
  );
}
