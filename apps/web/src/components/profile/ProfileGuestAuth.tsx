import { UserRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useStoreAuth } from "@/auth/useStoreAuth";
import { ProfileAuthField } from "@/components/profile/ProfileAuthField";

export function ProfileGuestAuth() {
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
    <section className="w-full">
      <div className="text-center lg:px-2">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-muted ring-1 ring-hairline">
          <UserRound className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{t("profile.guestName")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("profile.guestHint")}</p>
      </div>

      <div className="mt-6 flex rounded-full bg-muted p-1 ring-1 ring-hairline">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold press transition-colors ${
            mode === "login" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"
          }`}
        >
          {t("profile.loginTab")}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold press transition-colors ${
            mode === "register"
              ? "bg-background text-foreground shadow-soft"
              : "text-muted-foreground"
          }`}
        >
          {t("profile.registerTab")}
        </button>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-5 space-y-4 rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-hairline lg:p-8"
      >
        {mode === "register" ? (
          <ProfileAuthField
            label={t("profile.displayName")}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            autoComplete="name"
          />
        ) : null}
        <ProfileAuthField
          label={t("profile.email")}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <ProfileAuthField
          label={t("profile.passwordLabel")}
          hint={t("profile.passwordHint")}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {auth.authError ? (
          <p className="rounded-xl bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {auth.authError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold press hover:bg-foreground/90 disabled:opacity-60"
        >
          {submitting
            ? t("common.loading")
            : mode === "login"
              ? t("profile.loginAction")
              : t("profile.registerAction")}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {t("profile.version")}
      </p>
    </section>
  );
}
