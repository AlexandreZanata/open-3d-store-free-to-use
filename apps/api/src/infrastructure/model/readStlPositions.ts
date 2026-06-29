/** Binary/ASCII STL → flat XYZ vertex list (triangle soup). */
export type ReadStlOptions = {
  /** Cap triangles while reading (uniform stride) for faster preview builds. */
  maxTriangles?: number;
};

export function readStlPositions(
  data: Buffer,
  options?: ReadStlOptions,
): Float32Array | null {
  if (data.byteLength >= 84 && !isAsciiStl(data)) {
    return readBinaryStlPositions(data, options?.maxTriangles);
  }
  return readAsciiStlPositions(data.toString("utf8"), options?.maxTriangles);
}

function isAsciiStl(data: Buffer): boolean {
  const head = data.subarray(0, Math.min(80, data.byteLength)).toString("utf8").trimStart();
  return head.startsWith("solid");
}

function readBinaryStlPositions(data: Buffer, maxTriangles = Infinity): Float32Array | null {
  const triangleCount = data.readUInt32LE(80);
  if (triangleCount === 0) {
    return null;
  }

  const stride = triangleCount > maxTriangles ? Math.ceil(triangleCount / maxTriangles) : 1;
  const outputTriangles = Math.ceil(triangleCount / stride);
  const vertices = new Float32Array(outputTriangles * 9);
  let offset = 84;
  let outTri = 0;

  for (let i = 0; i < triangleCount; i += 1) {
    if (offset + 50 > data.byteLength) {
      return null;
    }
    if (i % stride === 0) {
      for (let v = 0; v < 3; v += 1) {
        const base = offset + 12 + v * 12;
        const vi = outTri * 9 + v * 3;
        vertices[vi] = data.readFloatLE(base);
        vertices[vi + 1] = data.readFloatLE(base + 4);
        vertices[vi + 2] = data.readFloatLE(base + 8);
      }
      outTri += 1;
    }
    offset += 50;
  }

  return vertices.subarray(0, outTri * 9);
}

function readAsciiStlPositions(text: string, maxTriangles = Infinity): Float32Array | null {
  const matches = [...text.matchAll(/vertex\s+([-+eE.\d]+)\s+([-+eE.\d]+)\s+([-+eE.\d]+)/g)];
  if (matches.length < 3) {
    return null;
  }

  const triangleCount = Math.floor(matches.length / 3);
  const stride = triangleCount > maxTriangles ? Math.ceil(triangleCount / maxTriangles) : 1;
  const outputTriangles = Math.ceil(triangleCount / stride);
  const vertices = new Float32Array(outputTriangles * 9);
  let outTri = 0;

  for (let tri = 0; tri < triangleCount; tri += stride) {
    for (let v = 0; v < 3; v += 1) {
      const match = matches[tri * 3 + v]!;
      const vi = outTri * 9 + v * 3;
      vertices[vi] = Number(match[1]);
      vertices[vi + 1] = Number(match[2]);
      vertices[vi + 2] = Number(match[3]);
    }
    outTri += 1;
  }

  return vertices;
}
