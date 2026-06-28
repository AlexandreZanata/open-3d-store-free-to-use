import type { SupportedLocale } from "@print3d/shared-types";
import { SUPPORTED_LOCALES } from "@print3d/shared-types";
import { useTranslation } from "react-i18next";

import { setActiveLocale } from "@/lib/locale";
import { syncI18nLocale } from "@/i18n";

type Tone = "default" | "muted" | "inverted";

const toneClasses: Record<Tone, { active: string; idle: string }> = {
  default: {
    active: "bg-foreground text-background ring-foreground",
    idle: "bg-surface text-muted-foreground ring-hairline",
  },
  muted: {
    active: "bg-foreground text-background ring-foreground",
    idle: "bg-background text-muted-foreground ring-hairline hover:text-foreground",
  },
  inverted: {
    active: "bg-background text-foreground ring-background",
    idle: "bg-background/10 text-background/70 ring-background/20 hover:text-background",
  },
};

export function LanguageSwitcher({ tone = "default" }: { tone?: Tone }) {
  const { i18n, t } = useTranslation();
  const current = (
    i18n.language === "en" || i18n.language === "pt-BR" ? i18n.language : "pt-BR"
  ) as SupportedLocale;
  const styles = toneClasses[tone];

  function handleChange(next: SupportedLocale) {
    if (next === current) {
      return;
    }
    setActiveLocale(next);
    syncI18nLocale(next);
  }

  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">{t("language.label")}</span>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          aria-pressed={current === locale}
          className={`h-8 px-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider press ring-1 ${
            current === locale ? styles.active : styles.idle
          }`}
        >
          {locale === "en" ? "EN" : "PT"}
        </button>
      ))}
    </div>
  );
}
