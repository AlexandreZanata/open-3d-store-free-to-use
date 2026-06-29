import { adminTokens } from "@/lib/admin-tokens";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className={adminTokens.label}>{label}</dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

type DetailFieldsProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

const columnClass: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function DetailFields({ children, columns = 2, className }: DetailFieldsProps) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-5", columnClass[columns], className)}>
      {children}
    </dl>
  );
}
