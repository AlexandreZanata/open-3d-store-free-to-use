import { Github, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  buildWhatsAppContactHref,
  CONTACT_EMAIL,
  CONTACT_GITHUB_URL,
  readWhatsAppPhoneDisplay,
} from "@/lib/contact";
import { footerBottomPad, pagePadding, shellMaxWidth } from "@/lib/layout";

const linkClass =
  "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors press";

export function AppShellFooter() {
  const { t } = useTranslation();
  const whatsappDisplay = readWhatsAppPhoneDisplay();
  const whatsappHref = buildWhatsAppContactHref(t("footer.whatsappPrefill"));

  return (
    <footer
      role="contentinfo"
      className={`mt-auto border-t border-hairline bg-surface-muted/60 ${footerBottomPad}`}
    >
      <div className={`${shellMaxWidth} ${pagePadding} py-8 lg:py-10`}>
        <p className="text-sm leading-relaxed text-muted-foreground text-center lg:text-left max-w-2xl">
          {t("footer.pitch")}
        </p>

        <ul className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start lg:gap-x-6 lg:gap-y-2">
          {whatsappHref && whatsappDisplay ? (
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                aria-label={t("footer.whatsappAria", { phone: whatsappDisplay })}
              >
                <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />
                <span>{whatsappDisplay}</span>
              </a>
            </li>
          ) : null}

          <li>
            <a
              href={CONTACT_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <Github className="size-4 shrink-0" />
              <span>{t("footer.github")}</span>
            </a>
          </li>

          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              <Mail className="size-4 shrink-0" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
