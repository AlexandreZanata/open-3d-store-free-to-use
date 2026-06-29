/** Browser tab favicons — keep in sync with apps/admin/index.html */
export const brandFaviconHeadLinks = [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  {
    rel: "icon",
    href: "/favicon-dark.png",
    type: "image/png",
    sizes: "48x48",
    media: "(prefers-color-scheme: dark)",
  },
  {
    rel: "icon",
    href: "/favicon-light.png",
    type: "image/png",
    sizes: "48x48",
    media: "(prefers-color-scheme: light)",
  },
  {
    rel: "icon",
    href: "/favicon-dark-64.png",
    type: "image/png",
    sizes: "64x64",
    media: "(prefers-color-scheme: dark)",
  },
  {
    rel: "icon",
    href: "/favicon-light-64.png",
    type: "image/png",
    sizes: "64x64",
    media: "(prefers-color-scheme: light)",
  },
  {
    rel: "icon",
    href: "/favicon-dark-96.png",
    type: "image/png",
    sizes: "96x96",
    media: "(prefers-color-scheme: dark)",
  },
  {
    rel: "icon",
    href: "/favicon-light-96.png",
    type: "image/png",
    sizes: "96x96",
    media: "(prefers-color-scheme: light)",
  },
] as const;

export const brandThemeColorMeta = [
  { name: "theme-color", content: "#fafafa", media: "(prefers-color-scheme: light)" },
  { name: "theme-color", content: "#141414", media: "(prefers-color-scheme: dark)" },
] as const;
