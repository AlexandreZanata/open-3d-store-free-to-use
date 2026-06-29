import { unzipSync } from "fflate";

/** Extract triangle soup (mm units) from a 3MF OPC zip archive. */
export function read3mfMesh(data: Buffer): Float32Array | null {
  const entries = unzipSync(new Uint8Array(data));
  const modelXml = findModelXml(entries);
  if (!modelXml) {
    return null;
  }
  return parse3mfModelXml(modelXml);
}

function findModelXml(entries: Record<string, Uint8Array>): string | null {
  const preferred = entries["3D/3dmodel.model"];
  if (preferred) {
    return new TextDecoder().decode(preferred);
  }

  for (const [name, bytes] of Object.entries(entries)) {
    if (name.endsWith(".model") || name.endsWith("3dmodel.model")) {
      return new TextDecoder().decode(bytes);
    }
  }
  return null;
}

function parse3mfModelXml(xml: string): Float32Array | null {
  const vertices: Array<[number, number, number]> = [];
  const vertexTag = /<vertex\b[^>]*>/gi;
  let match = vertexTag.exec(xml);
  while (match !== null) {
    const coords = parseCoords(match[0]);
    if (coords) {
      vertices.push(coords);
    }
    match = vertexTag.exec(xml);
  }

  if (vertices.length === 0) {
    return null;
  }

  const positions: number[] = [];
  const triangleTag = /<triangle\b[^>]*>/gi;
  match = triangleTag.exec(xml);
  while (match !== null) {
    const indices = parseTriangleIndices(match[0]);
    if (!indices) {
      match = triangleTag.exec(xml);
      continue;
    }
    for (const index of indices) {
      const vertex = vertices[index];
      if (!vertex) {
        continue;
      }
      positions.push(vertex[0], vertex[1], vertex[2]);
    }
    match = triangleTag.exec(xml);
  }

  if (positions.length === 0) {
    return null;
  }

  return new Float32Array(positions);
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
  const match = tag.match(new RegExp(`\\b${name}="([^"]+)"`, "i"));
  if (!match?.[1]) {
    return null;
  }
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}
