import type { ReactNode } from "react";

import { railTrack } from "@/lib/layout";

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
      <div className="px-4 lg:px-8 flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight lg:text-lg">{title}</h2>
        {action}
      </div>
      <div className={railTrack}>{children}</div>
    </section>
  );
}
