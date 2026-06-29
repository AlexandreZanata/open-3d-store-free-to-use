import { describe, expect, it } from "vitest";

import { readStlPositions } from "../../../src/infrastructure/model/readStlPositions.js";

function buildBinaryStl(triangleCount: number): Buffer {
  const buffer = Buffer.alloc(84 + triangleCount * 50);
  buffer.writeUInt32LE(triangleCount, 80);
  let offset = 84;
  for (let i = 0; i < triangleCount; i += 1) {
    offset += 12;
    buffer.writeFloatLE(0, offset);
    buffer.writeFloatLE(0, offset + 4);
    buffer.writeFloatLE(0, offset + 8);
    buffer.writeFloatLE(10, offset + 12);
    buffer.writeFloatLE(0, offset + 16);
    buffer.writeFloatLE(0, offset + 20);
    buffer.writeFloatLE(0, offset + 24);
    buffer.writeFloatLE(0, offset + 28);
    buffer.writeFloatLE(10, offset + 32);
    offset += 36;
    buffer.writeUInt16LE(0, offset);
    offset += 2;
  }
  return buffer;
}

describe("readStlPositions", () => {
  it("reads binary STL triangle vertices", () => {
    const positions = readStlPositions(buildBinaryStl(1));
    expect(positions).not.toBeNull();
    expect(positions!.length).toBe(9);
  });

  it("reads ASCII STL vertices", () => {
    const ascii = Buffer.from(`solid cube
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 0 10 0
    endloop
  endfacet
endsolid cube`);
    const positions = readStlPositions(ascii);
    expect(positions).not.toBeNull();
    expect(positions![0]).toBe(0);
    expect(positions![7]).toBe(10);
  });
});
