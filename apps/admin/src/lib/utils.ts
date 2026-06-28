import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatApiErrorMessage(detail: string | undefined, fallback: string): string {
  return detail && detail.length > 0 ? detail : fallback;
}
