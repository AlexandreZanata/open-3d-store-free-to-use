import i18n from "@/i18n";

export function brandPageTitle(pageTitle: string): string {
  return `${pageTitle} — ${i18n.t("app.name")}`;
}
