/**
 * Contract: docs/api/admin-contract.md — model-jobs parts and product modelParts use integer grams.
 */
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { analyzeModelParts } from "../../../src/domain/services/modelPartAnalyzer.js";
import { updateProductBodySchema } from "../../../src/http/validation/adminSchemas.js";

/** Single 100×80×5 mm plate triangle soup (millimeters). */
function buildPlateStlBuffer(): Buffer {
  const triangleCount = 12;
  const buffer = Buffer.alloc(84 + triangleCount * 50);
  buffer.write("plate", 0);
  buffer.writeUInt32LE(triangleCount, 80);

  const triangles: Array<[[number, number, number], [number, number, number], [number, number, number]]> = [
    [[0, 0, 0], [100, 0, 0], [0, 80, 5]],
    [[100, 0, 0], [100, 80, 5], [0, 80, 5]],
  ];

  let offset = 84;
  for (let i = 0; i < triangleCount; i += 1) {
    const tri = triangles[i % triangles.length]!;
    buffer.writeFloatLE(0, offset);
    buffer.writeFloatLE(0, offset + 4);
    buffer.writeFloatLE(1, offset + 8);
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const [x, y, z] = tri[vertex]!;
      buffer.writeFloatLE(x, offset + 12 + vertex * 12);
      buffer.writeFloatLE(y, offset + 16 + vertex * 12);
      buffer.writeFloatLE(z, offset + 20 + vertex * 12);
    }
    offset += 50;
  }

  return buffer;
}

describe("analyzeModelParts", () => {
  it("returns integer weightGrams that pass product PATCH validation", () => {
    const data = buildPlateStlBuffer();
    const parts = analyzeModelParts({
      data,
      mimeType: "model/stl",
      filename: "placa_estudo_hiragana_PRONTA.stl",
      infillFactor: 0.2,
      densityGCm3: 1.24,
    });

    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      if (part.weightGrams !== null) {
        expect(Number.isInteger(part.weightGrams)).toBe(true);
      }
    }

    const parsed = updateProductBodySchema.safeParse({ modelParts: parts });
    expect(parsed.success).toBe(true);
  });

  it("documents that decimal modelPart weightGrams fail admin validation", () => {
    const parsed = updateProductBodySchema.safeParse({
      modelParts: [{ id: "part-1", name: "Solid", volumeCm3: 12.5, weightGrams: 3.1 }],
    });
    expect(parsed.success).toBe(false);
  });
});

const HIRAGANA_FIXTURE = "/home/iiii/Downloads/placa_estudo_hiragana_PRONTA.stl";

describe.skipIf(!existsSync(HIRAGANA_FIXTURE))("analyzeModelParts (local hiragana STL)", () => {
  it("accepts real placa_estudo_hiragana_PRONTA.stl parts in PATCH body", () => {
    const data = readFileSync(HIRAGANA_FIXTURE);
    const parts = analyzeModelParts({
      data,
      mimeType: "model/stl",
      filename: "placa_estudo_hiragana_PRONTA.stl",
      infillFactor: 0.2,
      densityGCm3: 1.24,
    });

    expect(updateProductBodySchema.safeParse({ modelParts: parts }).success).toBe(true);
  });
});
