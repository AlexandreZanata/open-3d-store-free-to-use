import { formatModelPartName } from "../../domain/services/formatModelPartName.js";
import { primaryBambuPaintSlot } from "./bambuPaintColor.js";
import { appendMesh, type MeshDef } from "./read3mfXml.js";
import type { RawPartMesh } from "./read3mfPartMeshes.js";
import { transformPoint, type Mat4 } from "./threeMfTransform.js";

export function meshHasBambuPaint(mesh: MeshDef): boolean {
  return mesh.paintCodes?.some((code) => code.length > 0) ?? false;
}

/** Split a single painted mesh into one body per filament slot (Bambu brush painting). */
export function splitMeshByBambuPaint(
  mesh: MeshDef,
  transform: Mat4,
  filamentColours: string[],
  baseExtruder: number,
  nameHint: string | undefined,
  partOffset: number,
): RawPartMesh[] {
  if (!meshHasBambuPaint(mesh)) {
    return [];
  }

  const triangleCount = mesh.triangleIndices.length / 3;
  const groups = new Map<number, number[]>();
  for (let tri = 0; tri < triangleCount; tri += 1) {
    const paintCode = mesh.paintCodes?.[tri] ?? "";
    const slot = primaryBambuPaintSlot(paintCode, baseExtruder);
    const bucket = groups.get(slot) ?? [];
    bucket.push(tri);
    groups.set(slot, bucket);
  }

  const parts: RawPartMesh[] = [];
  for (const [slot, triangles] of [...groups.entries()].sort(([a], [b]) => a - b)) {
    const positions: number[] = [];
    for (const tri of triangles) {
      pushTriangle(mesh, transform, tri, positions);
    }
    if (positions.length < 9) {
      continue;
    }
    const color = filamentColours[slot - 1]?.toUpperCase();
    const label = nameHint ? `${nameHint} (filament ${slot})` : `Filament ${slot}`;
    parts.push({
      name: formatModelPartName(label, partOffset + parts.length),
      positions: new Float32Array(positions),
      ...(color ? { defaultColorHex: color } : {}),
    });
  }
  return parts;
}

function pushTriangle(mesh: MeshDef, transform: Mat4, tri: number, positions: number[]): void {
  const base = tri * 3;
  for (let corner = 0; corner < 3; corner += 1) {
    const index = mesh.triangleIndices[base + corner]! * 3;
    const [x, y, z] = transformPoint(
      transform,
      mesh.vertices[index]!,
      mesh.vertices[index + 1]!,
      mesh.vertices[index + 2]!,
    );
    positions.push(x, y, z);
  }
}

/** Append all triangles when paint split is not used. */
export function appendMeshPositions(mesh: MeshDef, transform: Mat4): Float32Array {
  const positions: number[] = [];
  appendMesh(mesh, transform, positions);
  return new Float32Array(positions);
}
