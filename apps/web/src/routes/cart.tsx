import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { CartCheckoutPanel } from "@/components/CartCheckoutPanel";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { captureOrder } from "@/lib/api/orders";
import { resolveAssetUrl } from "@/lib/assets";
import {
  type CartItem,
  cartItemCount,
  clearCart,
  readCart,
  removeFromCart,
  updateCartQuantity,
  writeCart,
} from "@/lib/cart";
import { default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";
import { desktopOnly, mobileOnly, pagePadding } from "@/lib/layout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: brandPageTitle(i18n.t("cart.title")) }],
  }),
  component: CartPage,
});

function CartPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const checkout = useCheckoutForm();

  const itemCount = useMemo(() => cartItemCount(items), [items]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function persist(next: CartItem[]) {
    writeCart(next);
    setItems(next);
  }

  async function handleOrder() {
    if (items.length === 0 || ordering || !checkout.validateBeforeOrder()) {
      return;
    }
    setOrdering(true);
    setOrderError(null);
    try {
      const customerName = checkout.resolveCustomerName();
      const result = await captureOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        })),
        customerName: customerName ?? undefined,
        customerNote: checkout.customerNote.trim() || undefined,
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
        <div className={`${pagePadding} py-4 lg:py-8`}>
          <div className={`${desktopOnly} mb-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("nav.cart")}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("cart.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("cart.items", { count: itemCount })}</p>
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:items-start">
            <ul className="space-y-3">
              {items.map((item) => (
                <CartLineItem key={item.productId} item={item} onPersist={persist} />
              ))}
            </ul>

            <CartCheckoutPanel
              itemCount={itemCount}
              customerName={checkout.customerName}
              customerNote={checkout.customerNote}
              nameError={checkout.nameError}
              nameReadOnly={checkout.nameReadOnly}
              isAuthenticated={checkout.isAuthenticated}
              ordering={ordering}
              orderError={orderError}
              onNameChange={checkout.onNameChange}
              onNoteChange={checkout.onNoteChange}
              onOrder={() => void handleOrder()}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}

function CartLineItem({
  item,
  onPersist,
}: {
  item: CartItem;
  onPersist: (next: CartItem[]) => void;
}) {
  const { t } = useTranslation();
  const imageUrl = resolveAssetUrl(item.thumbnailUrl);

  return (
    <li className="flex gap-4 p-4 lg:p-5 bg-surface ring-1 ring-hairline rounded-2xl shadow-soft">
      <Link
        to="/product/$slug"
        params={{ slug: item.slug }}
        className="size-20 lg:size-24 shrink-0 rounded-xl overflow-hidden bg-muted"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            width={200}
            height={200}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : null}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/product/$slug"
              params={{ slug: item.slug }}
              className="text-sm lg:text-base font-semibold tracking-tight hover:text-accent transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground lg:hidden">{item.basePriceDisplay}</p>
          </div>
          <button
            onClick={() => onPersist(removeFromCart(item.productId))}
            aria-label={t("cart.remove")}
            className="text-muted-foreground size-8 grid place-items-center rounded-full hover:bg-muted press shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3 lg:mt-4 flex items-center justify-between">
          <div className="inline-flex items-center bg-muted rounded-full">
            <button
              className="size-8 grid place-items-center text-muted-foreground hover:text-foreground"
              onClick={() =>
                onPersist(updateCartQuantity(item.productId, Math.max(1, item.quantity - 1)))
              }
              aria-label={t("cart.decrease")}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              className="size-8 grid place-items-center text-muted-foreground hover:text-foreground"
              onClick={() => onPersist(updateCartQuantity(item.productId, item.quantity + 1))}
              aria-label={t("cart.increase")}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-sm lg:text-base font-semibold">{item.basePriceDisplay}</span>
        </div>
      </div>
    </li>
  );
}

function Empty() {
  const { t } = useTranslation();
  return (
    <div className="px-6 py-24 text-center">
      <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
        <ShoppingBag className="size-6 text-muted-foreground" />
      </div>
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
