import type { ReactNode } from "react";

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
      <div className="px-4 flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
}
