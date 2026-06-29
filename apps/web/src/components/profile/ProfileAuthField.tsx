import type { InputHTMLAttributes } from "react";

type ProfileAuthFieldProps = {
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function ProfileAuthField({ label, hint, className, ...props }: ProfileAuthFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        className={`w-full h-12 rounded-xl bg-background ring-1 ring-hairline px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-foreground/15 ${className ?? ""}`}
        {...props}
      />
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
