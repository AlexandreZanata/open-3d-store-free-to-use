/** Shared responsive layout tokens — mobile classes unchanged below `lg` (1024px). */

export const shellMaxWidth = "mx-auto w-full max-w-2xl lg:max-w-7xl";

export const pagePadding = "px-4 lg:px-8";

export const stickyBelowHeader = "top-14 lg:top-[6.5rem]";

export const desktopMainSurface = "lg:pt-2";

export const desktopHeroSurface =
  "relative overflow-hidden rounded-3xl bg-foreground text-background shadow-card";

export const mainBottomPad = "pb-8 lg:pb-8";

/** Fixed mobile tab bar row height — icons + labels. */
export const mobileTabBarHeight = "3.75rem";

export const mobileTabBarHeightClass = "h-[3.75rem]";

/** Fixed panels stacked directly above the tab bar (includes safe-area + browser chrome). */
export const mobileStackAboveTabBar =
  "bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px)+var(--vv-bottom-inset,0px))]";

/** Offset main content below fixed mobile header (`h-14`). */
export const mobileTopPad = "pt-14 lg:pt-0";

/** Clears fixed mobile tab bar + safe-area + browser chrome when footer is last block. */
export const footerBottomPad =
  "pb-[calc(3.75rem+env(safe-area-inset-bottom,0px)+var(--vv-bottom-inset,0px))] lg:pb-0";

/** Spacer on product detail so scroll content clears sticky actions + tab bar. */
export const mobileProductScrollSpacer =
  "h-[calc(7.5rem+env(safe-area-inset-bottom,0px)+var(--vv-bottom-inset,0px))]";

export const productGridCols =
  "grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4";

export const categoryGridCols =
  "grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4";

export const railScroll =
  "overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-px-4 lg:overflow-visible lg:snap-none lg:scroll-px-0";

export const railInner =
  "flex gap-3 px-4 w-max min-w-full lg:grid lg:grid-cols-4 lg:gap-4 lg:w-full lg:px-8 xl:grid-cols-5";

/** @deprecated Use `railScroll` + `railInner` for correct mobile edge padding. */
export const railTrack = `${railScroll} ${railInner}`;

/** Matches `pagePadding` (px-4) gutters on mobile horizontal rails. */
export const productCardWideWidth =
  "w-[calc(100vw-2rem)] max-w-[300px] lg:w-full lg:max-w-none";

/** Square product thumbnail — same width, 1:1 aspect on mobile and desktop. */
export const productCardImageAspect = "aspect-square";

export const categoryPillsTrack =
  "flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar lg:flex-wrap lg:overflow-visible lg:px-8";

export const searchCatalogGridCols = "grid grid-cols-2 gap-5 xl:grid-cols-3";

export const desktopOnly = "hidden lg:block";

export const mobileOnly = "lg:hidden";
