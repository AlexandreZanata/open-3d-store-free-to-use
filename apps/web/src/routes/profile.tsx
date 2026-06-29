import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useStoreAuth } from "@/auth/useStoreAuth";
import { AppShell } from "@/components/AppShell";
import { default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";
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
      <div className={`${pagePadding} py-6 max-w-lg`}>
        {auth.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : auth.isAuthenticated && auth.user ? (
          <AuthenticatedProfile />
        ) : (
          <GuestAuthPanel />
        )}
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
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-foreground text-background grid place-items-center text-lg font-semibold">
          {initial}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">{auth.user.displayName}</h2>
          <p className="text-sm text-muted-foreground truncate">{auth.user.email}</p>
        </div>
      </div>

      <form
        className="space-y-4 bg-surface ring-1 ring-hairline rounded-2xl p-5 shadow-soft"
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
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("profile.displayName")}
          </span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full h-11 rounded-xl bg-background ring-1 ring-hairline px-3 text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-4 rounded-full bg-foreground text-background text-sm font-semibold press disabled:opacity-60"
        >
          {saving ? t("profile.saving") : t("profile.save")}
        </button>
        {saved && <p className="text-sm text-muted-foreground">{t("profile.saved")}</p>}
      </form>

      <button
        type="button"
        onClick={() => void auth.logout()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground press"
      >
        <LogOut className="size-4" />
        {t("profile.logout")}
      </button>

      <p className="text-center text-[11px] text-muted-foreground uppercase tracking-wider">
        {t("profile.version")}
      </p>
    </section>
  );
}

function GuestAuthPanel() {
  const { t } = useTranslation();
  const auth = useStoreAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    auth.clearAuthError();
    try {
      if (mode === "login") {
        await auth.login(email, password);
      } else {
        await auth.register(email, password, displayName);
      }
    } catch {
      // authError state is set in provider
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">{t("profile.guestName")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.guestHint")}</p>
      </div>

      <div className="inline-flex rounded-full bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`px-4 h-9 rounded-full text-sm font-semibold press ${
            mode === "login" ? "bg-background shadow-soft" : "text-muted-foreground"
          }`}
        >
          {t("profile.loginTab")}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`px-4 h-9 rounded-full text-sm font-semibold press ${
            mode === "register" ? "bg-background shadow-soft" : "text-muted-foreground"
          }`}
        >
          {t("profile.registerTab")}
        </button>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-3 bg-surface ring-1 ring-hairline rounded-2xl p-5 shadow-soft"
      >
        {mode === "register" && (
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={t("profile.displayName")}
            required
            className="w-full h-11 rounded-xl bg-background ring-1 ring-hairline px-3 text-sm outline-none"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("profile.email")}
          required
          autoComplete="email"
          className="w-full h-11 rounded-xl bg-background ring-1 ring-hairline px-3 text-sm outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("profile.password")}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full h-11 rounded-xl bg-background ring-1 ring-hairline px-3 text-sm outline-none"
        />
        {auth.authError && (
          <p className="text-sm text-destructive" role="alert">
            {auth.authError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-full bg-foreground text-background text-sm font-semibold press disabled:opacity-60"
        >
          {submitting
            ? t("common.loading")
            : mode === "login"
              ? t("profile.loginAction")
              : t("profile.registerAction")}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground uppercase tracking-wider">
        {t("profile.version")}
      </p>
    </section>
  );
}
