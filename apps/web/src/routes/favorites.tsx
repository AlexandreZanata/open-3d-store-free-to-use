import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [{ title: "Favorites — AXIS" }],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useTranslation();

  return (
    <AppShell showSearch={false} title={t("favorites.title")}>
      <div className="px-6 py-24 text-center">
        <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
          <Heart className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold">{t("favorites.emptyTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("favorites.emptyHint")}</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
        >
          {t("favorites.browse")}
        </Link>
      </div>
    </AppShell>
  );
}
