import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

type CartCheckoutPanelProps = {
  itemCount: number;
  customerName: string;
  customerNote: string;
  nameError: string | null;
  nameReadOnly: boolean;
  isAuthenticated: boolean;
  ordering: boolean;
  orderError: string | null;
  onNameChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onOrder: () => void;
};

export function CartCheckoutPanel({
  itemCount,
  customerName,
  customerNote,
  nameError,
  nameReadOnly,
  isAuthenticated,
  ordering,
  orderError,
  onNameChange,
  onNoteChange,
  onOrder,
}: CartCheckoutPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className="mt-6 lg:mt-0 lg:sticky top-[calc(var(--header-height,4rem)+1rem)]">
      <div className="bg-surface ring-1 ring-hairline rounded-2xl shadow-soft p-5 lg:p-6 space-y-4">
        <div className="lg:hidden flex items-center justify-between">
          <span className="text-sm font-semibold">{t("cart.summary")}</span>
          <span className="text-sm text-muted-foreground">{t("cart.items", { count: itemCount })}</span>
        </div>
        <div className="hidden lg:block pb-4 border-b border-hairline">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("cart.summary")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t("cart.items", { count: itemCount })}</p>
        </div>

        {!isAuthenticated ? (
          <p className="text-xs text-muted-foreground">
            {t("cart.guestHint")}{" "}
            <Link to="/profile" className="font-medium text-foreground underline">
              {t("cart.createAccount")}
            </Link>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("cart.accountHint")}</p>
        )}

        <div>
          <input
            value={customerName}
            onChange={(event) => onNameChange(event.target.value)}
            readOnly={nameReadOnly}
            aria-invalid={nameError !== null}
            placeholder={t(isAuthenticated ? "cart.customerNameFromAccount" : "cart.customerName")}
            className="w-full h-12 bg-background ring-1 ring-hairline rounded-full px-4 text-sm outline-none focus:ring-foreground/20 read-only:opacity-80"
          />
          {nameError ? (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {t("cart.customerNameRequired")}
            </p>
          ) : null}
        </div>

        <textarea
          value={customerNote}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t("cart.customerNote")}
          rows={3}
          className="w-full bg-background ring-1 ring-hairline rounded-2xl px-4 py-3 text-sm outline-none resize-none focus:ring-foreground/20"
        />

        {orderError ? (
          <p className="text-sm text-destructive text-center" role="alert">
            {orderError}
          </p>
        ) : null}

        <button
          onClick={onOrder}
          disabled={ordering}
          className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold press hover:bg-foreground/90 disabled:opacity-60"
        >
          {ordering ? t("cart.ordering") : t("cart.orderWhatsApp")}
        </button>
        <p className="text-center text-[11px] text-muted-foreground">{t("cart.orderHint")}</p>
      </div>
    </aside>
  );
}
