/** 3MF and STL use millimeters; glTF uses meters (three.js / Khronos convention). */
export type ModelFormat = "3mf" | "stl" | "glb" | "gltf" | "unknown";

export function detectModelFormat(url: string): ModelFormat {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".3mf")) {
    return "3mf";
  }
  if (path.endsWith(".stl")) {
    return "stl";
  }
  if (path.endsWith(".glb")) {
    return "glb";
  }
  if (path.endsWith(".gltf")) {
    return "gltf";
  }
  return "unknown";
}

export function usesMillimeterUnits(format: ModelFormat): boolean {
  return format === "3mf" || format === "stl";
}

export function formatDimensionsMm(
  x: number,
  y: number,
  z: number,
  format: ModelFormat,
): string {
  const scale = usesMillimeterUnits(format) ? 1 : 1000;
  const toMm = (value: number) => Math.max(1, Math.round(value * scale));
  return `${toMm(x)} × ${toMm(y)} × ${toMm(z)} mm`;
}
