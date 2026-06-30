import type { MaterialType } from "@print3d/shared-types";

const MATERIAL_BADGE_STYLES: Record<MaterialType, string> = {
  PLA: "bg-sky-500/15 text-sky-900 ring-sky-500/25",
  PETG: "bg-violet-500/15 text-violet-900 ring-violet-500/25",
  PETG_HF: "bg-orange-500 text-white ring-orange-700/50 shadow-sm",
  ABS: "bg-amber-500/15 text-amber-950 ring-amber-500/25",
  ASA: "bg-orange-500/15 text-orange-950 ring-orange-500/25",
  TPU: "bg-emerald-500/15 text-emerald-950 ring-emerald-500/25",
  NYLON: "bg-slate-500/15 text-slate-900 ring-slate-500/25",
  RESIN: "bg-cyan-500/15 text-cyan-950 ring-cyan-500/25",
};

const SOLID_MATERIAL_BADGES = new Set<MaterialType>(["PETG_HF"]);

export function formatMaterialLabel(material: MaterialType): string {
  return material.replace(/_/g, " ");
}

export function materialBadgeClass(material: MaterialType): string {
  return MATERIAL_BADGE_STYLES[material];
}

/** Opaque badge fill — readable on busy product thumbnails (mobile cards). */
export function materialBadgeIsSolid(material: MaterialType): boolean {
  return SOLID_MATERIAL_BADGES.has(material);
}
