import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";

import i18n from "../i18n";
import appCss from "../styles.css?url";
import { StoreAuthProvider } from "@/auth/StoreAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { useCartServerSync } from "@/hooks/useCartServerSync";
import { brandFaviconHeadLinks, brandThemeColorMeta } from "@/lib/brandFavicons";
import { HERO_LOGO_MODEL_URL } from "@/lib/heroLogo";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {t("errors.pageNotFoundTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.pageNotFoundHint")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 h-10 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            {t("errors.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  const router = useRouter();
  console.error(error);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errors.pageLoadTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.pageLoadHint")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 h-10 text-sm font-semibold text-background"
          >
            {t("errors.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-hairline bg-surface px-5 h-10 text-sm font-semibold text-foreground"
          >
            {t("errors.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      ...brandThemeColorMeta,
      { title: i18n.t("app.metaTitle") },
    ],
    links: [
      ...brandFaviconHeadLinks,
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preload", href: HERO_LOGO_MODEL_URL, as: "fetch", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <StoreAuthProvider>
          <CartSyncBoundary />
          <Toaster richColors closeButton position="top-center" />
        </StoreAuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

function CartSyncBoundary() {
  useCartServerSync();
  return <Outlet />;
}
