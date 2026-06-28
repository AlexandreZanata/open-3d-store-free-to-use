import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — AXIS" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();

  return (
    <AppShell showSearch={false} title={t("profile.title")}>
      <section className="px-4 pt-6 pb-8 flex items-center gap-4">
        <div className="size-16 rounded-full bg-foreground text-background grid place-items-center text-lg font-semibold">
          G
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">{t("profile.guestName")}</h2>
          <p className="text-sm text-muted-foreground truncate">{t("profile.guestEmail")}</p>
        </div>
      </section>

      <div className="px-4 mt-8 text-center text-[11px] text-muted-foreground uppercase tracking-wider">
        {t("profile.version")}
      </div>
    </AppShell>
  );
}
