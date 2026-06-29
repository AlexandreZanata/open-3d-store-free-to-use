import type { ReactNode } from "react";
import { Link2, Mail, Share2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  buildEmailShareUrl,
  buildProductSharePayload,
  buildWhatsAppShareUrl,
  canUseNativeShare,
  copyTextToClipboard,
  formatShareClipboardText,
  isShareCancelled,
  type ProductShareInput,
  type ProductSharePayload,
} from "@/lib/share";
import { cn } from "@/lib/utils";

type ShareProductButtonProps = {
  product: ProductShareInput;
  className?: string;
};

export function ShareProductButton({ product, className }: ShareProductButtonProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  function resolvePayload(): ProductSharePayload {
    return buildProductSharePayload(product, window.location.origin);
  }

  async function tryNativeShare(payload: ProductSharePayload): Promise<boolean> {
    if (!canUseNativeShare(payload)) {
      return false;
    }
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      toast.success(t("product.shareNativeSuccess"));
      return true;
    } catch (error) {
      if (error instanceof Error && isShareCancelled(error)) {
        return true;
      }
      return false;
    }
  }

  async function handleShareClick() {
    const payload = resolvePayload();
    const shared = await tryNativeShare(payload);
    if (shared) {
      setMenuOpen(false);
      return;
    }
    setMenuOpen(true);
  }

  async function handleCopyLink() {
    const payload = resolvePayload();
    const copied = await copyTextToClipboard(formatShareClipboardText(payload));
    if (copied) {
      toast.success(t("product.shareLinkCopied"));
      setMenuOpen(false);
      return;
    }
    toast.error(t("product.shareFailed"));
  }

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-label={t("product.share")}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          onClick={() => {
            void handleShareClick();
          }}
          className={cn(
            "size-11 shrink-0 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press",
            className,
          )}
        >
          <Share2 className="size-5" />
        </button>
      </PopoverAnchor>
      <PopoverContent side="top" align="start" className="w-72 p-2">
        <p className="px-2 py-1.5 text-xs font-semibold text-foreground">{t("product.shareMenuTitle")}</p>
        <ShareMenuAction
          icon={<Link2 className="size-4" />}
          label={t("product.shareCopyLink")}
          onClick={() => {
            void handleCopyLink();
          }}
        />
        <ShareMenuLink
          icon={<WhatsAppIcon />}
          label={t("product.shareWhatsApp")}
          href={buildWhatsAppShareUrl(resolvePayload())}
          onNavigate={() => setMenuOpen(false)}
        />
        <ShareMenuLink
          icon={<Mail className="size-4" />}
          label={t("product.shareEmail")}
          href={buildEmailShareUrl(resolvePayload())}
          onNavigate={() => setMenuOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

function ShareMenuAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted press"
    >
      <span className="grid size-8 place-items-center rounded-full bg-muted">{icon}</span>
      {label}
    </button>
  );
}

function ShareMenuLink({
  icon,
  label,
  href,
  onNavigate,
}: {
  icon: ReactNode;
  label: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted press"
    >
      <span className="grid size-8 place-items-center rounded-full bg-muted">{icon}</span>
      {label}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 0 0 .918.918l4.458-1.495A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.357-.213-3.711 1.245 1.245-3.711-.233-.372A9.818 9.818 0 1 1 12 21.818z" />
    </svg>
  );
}
