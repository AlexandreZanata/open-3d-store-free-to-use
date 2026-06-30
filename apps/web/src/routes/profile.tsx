import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useStoreAuth } from "@/auth/useStoreAuth";
import { AppShell } from "@/components/AppShell";
import { ProfileGuestAuth } from "@/components/profile/ProfileGuestAuth";
import { default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";
import { APP_VERSION } from "@/lib/appVersion";
import { pagePadding } from "@/lib/layout";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: brandPageTitle(i18n.t("profile.title")) }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  const auth = useStoreAuth();

  return (
    <AppShell showSearch={false} title={t("profile.title")}>
      <div
        className={`${pagePadding} flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-start py-8 lg:min-h-[calc(100dvh-14rem)] lg:justify-center lg:py-12`}
      >
        <div className="w-full max-w-md">
          {auth.isLoading ? (
            <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : auth.isAuthenticated && auth.user ? (
            <AuthenticatedProfile />
          ) : (
            <ProfileGuestAuth />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function AuthenticatedProfile() {
  const { t } = useTranslation();
  const auth = useStoreAuth();
  const [displayName, setDisplayName] = useState(auth.user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!auth.user) {
    return null;
  }

  const initial = auth.user.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="size-20 rounded-full bg-foreground text-background grid place-items-center text-2xl font-semibold">
          {initial}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight truncate max-w-full">
          {auth.user.displayName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground truncate max-w-full">{auth.user.email}</p>
      </div>

      <form
        className="space-y-4 rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-hairline lg:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          setSaving(true);
          setSaved(false);
          void auth
            .updateProfile(displayName)
            .then(() => setSaved(true))
            .finally(() => setSaving(false));
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t("profile.displayName")}
          </span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full h-12 rounded-xl bg-background ring-1 ring-hairline px-4 text-sm outline-none focus:ring-2 focus:ring-foreground/15"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold press disabled:opacity-60"
        >
          {saving ? t("profile.saving") : t("profile.save")}
        </button>
        {saved ? <p className="text-center text-sm text-muted-foreground">{t("profile.saved")}</p> : null}
      </form>

      <button
        type="button"
        onClick={() => void auth.logout()}
        className="mx-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground press"
      >
        <LogOut className="size-4" />
        {t("profile.logout")}
      </button>

      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {t("profile.version", { version: APP_VERSION })}
      </p>
    </section>
  );
}
