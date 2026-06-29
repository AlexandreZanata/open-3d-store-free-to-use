/** 3MF uses millimeters; glTF uses meters (three.js / Khronos convention). */
export type ModelFormat = "3mf" | "glb" | "gltf" | "unknown";

export function detectModelFormat(url: string): ModelFormat {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".3mf")) {
    return "3mf";
  }
  if (path.endsWith(".glb")) {
    return "glb";
  }
  if (path.endsWith(".gltf")) {
    return "gltf";
  }
  return "unknown";
}

export function formatDimensionsMm(
  x: number,
  y: number,
  z: number,
  format: ModelFormat,
): string {
  const scale = format === "3mf" ? 1 : 1000;
  const toMm = (value: number) => Math.max(1, Math.round(value * scale));
  return `${toMm(x)} × ${toMm(y)} × ${toMm(z)} mm`;
}
