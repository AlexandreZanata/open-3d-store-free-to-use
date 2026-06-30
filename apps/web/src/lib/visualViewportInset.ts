export type VisualViewportLike = {
  height: number;
  offsetTop: number;
};

/** Bottom gap between layout viewport and visual viewport (Android Chrome toolbar). */
export function readVisualViewportBottomInsetPx(
  innerHeight: number,
  vv: VisualViewportLike | null | undefined,
): number {
  if (!vv) {
    return 0;
  }
  return Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop));
}
