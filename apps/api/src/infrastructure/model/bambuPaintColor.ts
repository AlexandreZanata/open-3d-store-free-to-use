/** Bambu Studio `paint_color` slot codes (1-based AMS index). See docs/features/3d-viewer.md */
export const BAMBU_PAINT_SLOT_CODES = [
  "4",
  "8",
  "0C",
  "1C",
  "2C",
  "3C",
  "4C",
  "5C",
  "8C",
  "9C",
  "AC",
  "BC",
  "CC",
  "DC",
  "EC",
  "FC",
] as const;

/** Decode painted filament slots from a triangle `paint_color` bitmask string. */
export function decodeBambuPaintSlots(paintColor: string): number[] {
  if (!paintColor) {
    return [];
  }

  let remaining = paintColor.toUpperCase();
  const slots: number[] = [];
  for (let index = BAMBU_PAINT_SLOT_CODES.length - 1; index >= 0; index -= 1) {
    const code = BAMBU_PAINT_SLOT_CODES[index]!;
    while (remaining.includes(code)) {
      remaining = remaining.replace(code, "");
      slots.push(index + 1);
    }
  }
  return slots.sort((a, b) => a - b);
}

/** Primary slot for mesh splitting — lowest painted slot, else base extruder. */
export function primaryBambuPaintSlot(paintColor: string | undefined, baseExtruder: number): number {
  const slots = decodeBambuPaintSlots(paintColor ?? "");
  return slots[0] ?? baseExtruder;
}
