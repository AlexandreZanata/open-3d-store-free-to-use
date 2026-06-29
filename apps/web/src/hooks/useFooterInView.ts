import { useEffect, useState } from "react";

/** Mobile tab bar height — matches `AppShellMobileNav` (`h-[3.75rem]`). */
const MOBILE_TAB_BAR_PX = 60;
/** Sticky product actions bar height including padding. */
const STICKY_ACTIONS_PX = 68;

/** True when the site footer enters the viewport (mobile sticky bars should yield). */
export function useFooterInView(): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('[role="contentinfo"]');
    if (!footer) {
      return;
    }

    const readFooterVisible = () => {
      const rect = footer.getBoundingClientRect();
      const revealLine = window.innerHeight - MOBILE_TAB_BAR_PX - STICKY_ACTIONS_PX;
      setInView(rect.top < revealLine);
    };

    readFooterVisible();
    window.addEventListener("scroll", readFooterVisible, { passive: true });
    window.addEventListener("resize", readFooterVisible);
    return () => {
      window.removeEventListener("scroll", readFooterVisible);
      window.removeEventListener("resize", readFooterVisible);
    };
  }, []);

  return inView;
}
