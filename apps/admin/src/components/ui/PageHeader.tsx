import { adminTokens } from "@/lib/admin-tokens";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  back?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, back, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-3", className)}>
      {back ? <div>{back}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={adminTokens.pageTitle}>{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
