import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BrandMark } from "@/components/BrandMark";
import { pagePadding } from "@/lib/layout";

export function HomeMobileHero() {
  const { t } = useTranslation();

  return (
    <section className={`${pagePadding} pt-4 pb-5`}>
      <Link
        to="/search"
        className="group flex items-center gap-3.5 overflow-hidden rounded-2xl bg-foreground p-3.5 text-background shadow-card press lift"
      >
        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-background shadow-soft">
          <BrandMark className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-background/55">
            {t("home.featuredLabel")}
          </p>
          <h2 className="mt-0.5 text-base font-semibold leading-snug tracking-tight">
            {t("home.featuredTitleMobile")}
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-background/65 line-clamp-1">
            {t("home.featuredSubtitleMobile")}
          </p>
        </div>
        <ArrowRight
          className="size-5 shrink-0 text-background/70 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </section>
  );
}
