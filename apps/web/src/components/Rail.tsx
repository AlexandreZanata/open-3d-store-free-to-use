import type { ReactNode } from "react";

import { pagePadding, railInner, railScroll } from "@/lib/layout";

export function Rail({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className={`${pagePadding} flex items-center justify-between mb-3`}>
        <h2 className="text-base font-semibold tracking-tight lg:text-lg">{title}</h2>
        {action}
      </div>
      <RailTrack>{children}</RailTrack>
    </section>
  );
}

export function RailTrack({ children }: { children: ReactNode }) {
  return (
    <div className={railScroll}>
      <div className={railInner}>{children}</div>
    </div>
  );
}
