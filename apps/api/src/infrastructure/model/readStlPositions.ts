/** Binary/ASCII STL → flat XYZ vertex list (mm units, triangle soup). */
export function readStlPositions(data: Buffer): Float32Array | null {
  if (data.byteLength >= 84 && !isAsciiStl(data)) {
    return readBinaryStlPositions(data);
  }
  return readAsciiStlPositions(data.toString("utf8"));
}

function isAsciiStl(data: Buffer): boolean {
  const head = data.subarray(0, Math.min(80, data.byteLength)).toString("utf8").trimStart();
  return head.startsWith("solid");
}

function readBinaryStlPositions(data: Buffer): Float32Array | null {
  const triangleCount = data.readUInt32LE(80);
  if (triangleCount === 0) {
    return null;
  }

  const vertices = new Float32Array(triangleCount * 9);
  let offset = 84;

  for (let i = 0; i < triangleCount; i += 1) {
    if (offset + 50 > data.byteLength) {
      return null;
    }
    for (let v = 0; v < 3; v += 1) {
      const base = offset + 12 + v * 12;
      const vi = i * 9 + v * 3;
      vertices[vi] = data.readFloatLE(base);
      vertices[vi + 1] = data.readFloatLE(base + 4);
      vertices[vi + 2] = data.readFloatLE(base + 8);
    }
    offset += 50;
  }

  return vertices;
}

function readAsciiStlPositions(text: string): Float32Array | null {
  const matches = [...text.matchAll(/vertex\s+([-+eE.\d]+)\s+([-+eE.\d]+)\s+([-+eE.\d]+)/g)];
  if (matches.length === 0) {
    return null;
  }

  const vertices = new Float32Array(matches.length * 3);
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i]!;
    vertices[i * 3] = Number(match[1]);
    vertices[i * 3 + 1] = Number(match[2]);
    vertices[i * 3 + 2] = Number(match[3]);
  }
  return vertices;
}
