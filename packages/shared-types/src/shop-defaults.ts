import type { ShopColor } from "./admin/model-studio.types.js";

/** Default filament palette for new shops — admin can customize in settings. */
export const DEFAULT_SHOP_COLORS: ShopColor[] = [
  { id: "pla-white", name: "White", hex: "#F5F5F5" },
  { id: "pla-black", name: "Black", hex: "#1A1A1A" },
  { id: "pla-red", name: "Red", hex: "#C62828" },
  { id: "pla-blue", name: "Blue", hex: "#1565C0" },
  { id: "pla-green", name: "Green", hex: "#2E7D32" },
];
