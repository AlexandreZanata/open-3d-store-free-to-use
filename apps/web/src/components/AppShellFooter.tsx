import { Github, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  buildWhatsAppContactHref,
  CONTACT_EMAIL,
  CONTACT_GITHUB_URL,
  readWhatsAppPhoneDisplay,
} from "@/lib/contact";
import { footerBottomPad, pagePadding, shellMaxWidth } from "@/lib/layout";

type ContactLinkProps = {
  href: string;
  ariaLabel: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
};

function FooterContactLink({ href, ariaLabel, label, icon, external = false }: ContactLinkProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="group inline-flex items-center gap-3 press transition-colors"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="grid size-11 place-items-center rounded-full bg-background/10 ring-1 ring-background/15 transition group-hover:bg-background/20 group-hover:ring-background/30 lg:size-11">
        {icon}
      </span>
      <span className="hidden lg:inline text-sm font-medium text-background/75 transition group-hover:text-background">
        {label}
      </span>
    </a>
  );
}

export function AppShellFooter() {
  const { t } = useTranslation();
  const whatsappDisplay = readWhatsAppPhoneDisplay();
  const whatsappHref = buildWhatsAppContactHref(t("footer.whatsappPrefill"));

  const iconClass = "size-6 lg:size-6 shrink-0";

  return (
    <footer
      role="contentinfo"
      className={`mt-auto bg-foreground text-background shadow-[0_-4px_20px_oklch(0_0_0/0.06)] ${footerBottomPad}`}
    >
      <div className={`${shellMaxWidth} ${pagePadding} py-5 lg:py-12`}>
        <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-background/65 lg:mx-0 lg:max-w-2xl lg:text-left lg:text-base lg:text-background/70">
          {t("footer.pitch")}
        </p>

        <nav
          aria-label={t("footer.contactNav")}
          className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:mt-6 lg:justify-start lg:gap-6"
        >
          {whatsappHref && whatsappDisplay ? (
            <FooterContactLink
              href={whatsappHref}
              ariaLabel={t("footer.whatsappAria", { phone: whatsappDisplay })}
              label={whatsappDisplay}
              external
              icon={<WhatsAppIcon className={`${iconClass} text-[#25D366]`} />}
            />
          ) : null}

          <FooterContactLink
            href={CONTACT_GITHUB_URL}
            ariaLabel={t("footer.githubAria")}
            label={t("footer.github")}
            external
            icon={<Github className={iconClass} />}
          />

          <FooterContactLink
            href={`mailto:${CONTACT_EMAIL}`}
            ariaLabel={t("footer.emailAria", { email: CONTACT_EMAIL })}
            label={CONTACT_EMAIL}
            icon={<Mail className={iconClass} />}
          />
        </nav>
      </div>
    </footer>
  );
}
