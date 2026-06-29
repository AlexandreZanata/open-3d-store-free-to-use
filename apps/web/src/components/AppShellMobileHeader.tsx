import { Link } from "@tanstack/react-router";
import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BrandMark } from "@/components/BrandMark";
import { mobileOnly, shellMaxWidth } from "@/lib/layout";

type Props = {
  showSearch?: boolean;
  showBack?: boolean;
  title?: string;
};

/** Mobile header — markup and classes frozen; do not add `lg:` overrides here. */
export function AppShellMobileHeader({ showSearch = true, showBack = false, title }: Props) {
  const { t } = useTranslation();

  return (
    <header
      className={`${mobileOnly} sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-hairline`}
    >
      <div className={`${shellMaxWidth} px-4 h-14 flex items-center gap-3`}>
        {showBack ? (
          <Link
            to="/"
            aria-label={t("nav.back")}
            className="-ml-2 size-9 grid place-items-center rounded-full hover:bg-muted press"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t("nav.home")}>
            <span className="flex h-7 w-9 items-center justify-center">
              <BrandMark className="max-h-7" />
            </span>
            <span className="text-sm font-semibold tracking-tight">{t("app.name")}</span>
          </Link>
        )}

        {title ? (
          <h1 className="flex-1 min-w-0 truncate text-sm font-semibold tracking-tight">{title}</h1>
        ) : showSearch ? (
          <Link
            to="/search"
            className="flex-1 min-w-0 flex items-center gap-2 bg-muted rounded-full h-9 px-3.5 text-muted-foreground press"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate text-sm">{t("nav.searchPlaceholder")}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <LanguageSwitcher />

        <Link
          to="/cart"
          aria-label={t("nav.cart")}
          className="relative size-9 grid place-items-center rounded-full hover:bg-muted press"
        >
          <ShoppingBag className="size-5" />
        </Link>
      </div>
    </header>
  );
}
