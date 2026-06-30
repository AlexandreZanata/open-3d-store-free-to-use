/**
 * Contract: docs/features/3d-viewer.md — GLB uploads use the same orientation pipeline
 */
import { Document } from "@gltf-transform/core";
import { describe, expect, it } from "vitest";

import { documentFromMesh } from "../../../src/infrastructure/model/documentFromMesh.js";
import { extractDocumentPositions } from "../../../src/infrastructure/model/extractDocumentPositions.js";

describe("extractDocumentPositions", () => {
  it("expands indexed glTF triangles into a position soup", () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]);
    const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
    const document = new Document();
    const buffer = document.createBuffer();
    const posAccessor = document
      .createAccessor()
      .setType("VEC3")
      .setArray(positions)
      .setBuffer(buffer);
    const indexAccessor = document
      .createAccessor()
      .setType("SCALAR")
      .setArray(indices)
      .setBuffer(buffer);
    const mesh = document
      .createMesh("Test")
      .addPrimitive(
        document
          .createPrimitive()
          .setAttribute("POSITION", posAccessor)
          .setIndices(indexAccessor),
      );
    document.createScene().addChild(document.createNode().setMesh(mesh));

    const soup = extractDocumentPositions(document);
    expect(soup).not.toBeNull();
    expect(soup!.length).toBe(18);
  });

  it("round-trips through documentFromMesh for storefront preview encoding", () => {
    const positions = new Float32Array([
      0, 0, 0, 0.1, 0, 0, 0, 0.1, 0, 0.1, 0.1, 0, 0, 0, 0.05, 0.1, 0, 0.05,
    ]);
    const source = documentFromMesh(positions, "Source");
    const roundTrip = extractDocumentPositions(source!);
    expect(roundTrip?.length).toBe(positions.length);
  });
});
