import type { SupportedLocale } from "@print3d/shared-types";
import { SUPPORTED_LOCALES } from "@print3d/shared-types";
import { useTranslation } from "react-i18next";

import { setActiveLocale } from "@/lib/locale";
import { syncI18nLocale } from "@/i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (
    i18n.language === "en" || i18n.language === "pt-BR" ? i18n.language : "pt-BR"
  ) as SupportedLocale;

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
            current === locale
              ? "bg-foreground text-background ring-foreground"
              : "bg-surface text-muted-foreground ring-hairline"
          }`}
        >
          {locale === "en" ? "EN" : "PT"}
        </button>
      ))}
    </div>
  );
}
