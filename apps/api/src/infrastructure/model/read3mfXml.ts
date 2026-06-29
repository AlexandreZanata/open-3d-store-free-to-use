import {
  IDENTITY_MAT4,
  parse3mfTransform,
  transformPoint,
  type Mat4,
} from "./threeMfTransform.js";

export type MeshDef = {
  vertices: Float32Array;
  triangleIndices: Uint32Array;
};

export type ComponentDef = {
  objectId: number;
  externalPath: string | null;
  transform: Mat4;
};

export type ObjectDef = { kind: "mesh"; mesh: MeshDef } | { kind: "components"; components: ComponentDef[] };

export type BuildItem = {
  objectId: number;
  transform: Mat4;
  printable: boolean;
};

export function parseBuildItems(xml: string): BuildItem[] {
  const items: BuildItem[] = [];
  const tag = /<item\b[^>]*>/gi;
  let match = tag.exec(xml);
  while (match !== null) {
    const objectId = readAttr(match[0], "objectid");
    if (objectId !== null) {
      const printableRaw = readAttr(match[0], "printable");
      items.push({
        objectId,
        transform: parse3mfTransform(readAttrString(match[0], "transform")),
        printable: printableRaw === null || printableRaw !== 0,
      });
    }
    match = tag.exec(xml);
  }
  return items;
}

export function parseObjects(xml: string): Map<number, ObjectDef> {
  const objects = new Map<number, ObjectDef>();
  const tag = /<object\b[^>]*>[\s\S]*?<\/object>/gi;
  let match = tag.exec(xml);
  while (match !== null) {
    const block = match[0];
    const id = readAttr(block, "id");
    if (id === null) {
      match = tag.exec(xml);
      continue;
    }
    const mesh = parseMeshBlock(block);
    if (mesh) {
      objects.set(id, { kind: "mesh", mesh });
      match = tag.exec(xml);
      continue;
    }
    const components = parseComponents(block);
    if (components.length > 0) {
      objects.set(id, { kind: "components", components });
    }
    match = tag.exec(xml);
  }
  return objects;
}

export function emitAllRootMeshes(xml: string, positions: number[]): void {
  const objects = parseObjects(xml);
  for (const objectDef of objects.values()) {
    if (objectDef.kind === "mesh") {
      appendMesh(objectDef.mesh, IDENTITY_MAT4, positions);
    }
  }
}

export function appendMesh(mesh: MeshDef, transform: Mat4, positions: number[]): void {
  const { vertices, triangleIndices } = mesh;
  for (let i = 0; i < triangleIndices.length; i += 1) {
    const index = triangleIndices[i]! * 3;
    const [x, y, z] = transformPoint(
      transform,
      vertices[index]!,
      vertices[index + 1]!,
      vertices[index + 2]!,
    );
    positions.push(x, y, z);
  }
}

function parseMeshBlock(block: string): MeshDef | null {
  const vertices = parseVertices(block);
  const triangleIndices = parseTriangles(block);
  if (!vertices || !triangleIndices) {
    return null;
  }
  return { vertices, triangleIndices };
}

function parseVertices(block: string): Float32Array | null {
  const coords: number[] = [];
  const tag = /<vertex\b[^>]*>/gi;
  let match = tag.exec(block);
  while (match !== null) {
    const point = parseCoords(match[0]);
    if (point) {
      coords.push(point[0], point[1], point[2]);
    }
    match = tag.exec(block);
  }
  return coords.length > 0 ? new Float32Array(coords) : null;
}

function parseTriangles(block: string): Uint32Array | null {
  const indices: number[] = [];
  const tag = /<triangle\b[^>]*>/gi;
  let match = tag.exec(block);
  while (match !== null) {
    const tri = parseTriangleIndices(match[0]);
    if (tri) {
      indices.push(tri[0], tri[1], tri[2]);
    }
    match = tag.exec(block);
  }
  return indices.length > 0 ? new Uint32Array(indices) : null;
}

function parseComponents(block: string): ComponentDef[] {
  const components: ComponentDef[] = [];
  const tag = /<component\b[^>]*\/?>/gi;
  let match = tag.exec(block);
  while (match !== null) {
    const objectId = readAttr(match[0], "objectid");
    if (objectId === null) {
      match = tag.exec(block);
      continue;
    }
    components.push({
      objectId,
      externalPath: normalizeModelPath(readAttrString(match[0], "p:path") ?? readAttrString(match[0], "path")),
      transform: parse3mfTransform(readAttrString(match[0], "transform")),
    });
    match = tag.exec(block);
  }
  return components;
}

function normalizeModelPath(raw: string | null): string | null {
  return raw ? raw.replace(/^\//, "") : null;
}

function parseCoords(tag: string): [number, number, number] | null {
  const x = readAttr(tag, "x");
  const y = readAttr(tag, "y");
  const z = readAttr(tag, "z");
  if (x === null || y === null || z === null) {
    return null;
  }
  return [x, y, z];
}

function parseTriangleIndices(tag: string): [number, number, number] | null {
  const v1 = readAttr(tag, "v1");
  const v2 = readAttr(tag, "v2");
  const v3 = readAttr(tag, "v3");
  if (v1 === null || v2 === null || v3 === null) {
    return null;
  }
  return [v1, v2, v3];
}

function readAttr(tag: string, name: string): number | null {
  const raw = readAttrString(tag, name);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readAttrString(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}="([^"]+)"`, "i"));
  return match?.[1] ?? null;
}
