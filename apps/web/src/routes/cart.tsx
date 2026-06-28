import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { captureOrder } from "@/lib/api/orders";
import { resolveAssetUrl } from "@/lib/assets";
import {
  type CartItem,
  clearCart,
  readCart,
  removeFromCart,
  updateCartQuantity,
  writeCart,
} from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Cart — AXIS" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function persist(next: CartItem[]) {
    writeCart(next);
    setItems(next);
  }

  async function handleOrder() {
    if (items.length === 0 || ordering) {
      return;
    }
    setOrdering(true);
    setOrderError(null);
    try {
      const result = await captureOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        })),
        customerName: customerName.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
      });
      clearCart();
      setItems([]);
      window.location.href = result.whatsappLink;
    } catch {
      setOrderError(t("cart.orderError"));
      setOrdering(false);
    }
  }

  return (
    <AppShell showSearch={false} title={t("cart.title")} showBack>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <>
          <ul className="px-4 pt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-3 p-3 bg-surface ring-1 ring-hairline rounded-2xl shadow-soft"
              >
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="size-20 shrink-0 rounded-xl overflow-hidden bg-muted"
                >
                  {resolveAssetUrl(item.thumbnailUrl) ? (
                    <img
                      src={resolveAssetUrl(item.thumbnailUrl)}
                      alt={item.name}
                      width={200}
                      height={200}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                    <button
                      onClick={() => persist(removeFromCart(item.productId))}
                      aria-label={t("cart.remove")}
                      className="text-muted-foreground -mt-0.5 -mr-0.5 size-7 grid place-items-center rounded-full hover:bg-muted press"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center bg-muted rounded-full">
                      <button
                        className="size-7 grid place-items-center text-muted-foreground"
                        onClick={() =>
                          persist(
                            updateCartQuantity(item.productId, Math.max(1, item.quantity - 1)),
                          )
                        }
                        aria-label={t("cart.decrease")}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        className="size-7 grid place-items-center text-muted-foreground"
                        onClick={() =>
                          persist(updateCartQuantity(item.productId, item.quantity + 1))
                        }
                        aria-label={t("cart.increase")}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{item.basePriceDisplay}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 mt-6 space-y-4">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("cart.customerName")}
              className="w-full h-12 bg-surface ring-1 ring-hairline rounded-full px-4 text-sm outline-none"
            />
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={t("cart.customerNote")}
              rows={3}
              className="w-full bg-surface ring-1 ring-hairline rounded-2xl px-4 py-3 text-sm outline-none resize-none"
            />

            {orderError && (
              <p className="text-sm text-destructive text-center" role="alert">
                {orderError}
              </p>
            )}

            <button
              onClick={() => void handleOrder()}
              disabled={ordering}
              className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold press hover:bg-foreground/90 disabled:opacity-60"
            >
              {ordering ? t("cart.ordering") : t("cart.orderWhatsApp")}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">{t("cart.orderHint")}</p>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Empty() {
  const { t } = useTranslation();
  return (
    <div className="px-6 py-24 text-center">
      <h3 className="text-base font-semibold">{t("cart.emptyTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("cart.emptyHint")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
      >
        {t("cart.browse")}
      </Link>
    </div>
  );
}
