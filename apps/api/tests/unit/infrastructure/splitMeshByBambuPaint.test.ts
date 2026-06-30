import { describe, expect, it } from "vitest";

import { parseObjects } from "../../../src/infrastructure/model/read3mfXml.js";
import { splitMeshByBambuPaint } from "../../../src/infrastructure/model/splitMeshByBambuPaint.js";
import { IDENTITY_MAT4 } from "../../../src/infrastructure/model/threeMfTransform.js";

const PAINTED_MESH_XML = `<?xml version="1.0"?>
<model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="10" y="0" z="0"/>
          <vertex x="0" y="10" z="0"/>
          <vertex x="10" y="10" z="0"/>
          <vertex x="0" y="0" z="1"/>
          <vertex x="10" y="0" z="1"/>
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2" paint_color="4"/>
          <triangle v1="3" v2="4" v3="5" paint_color="8"/>
        </triangles>
      </mesh>
    </object>
  </resources>
</model>`;

describe("splitMeshByBambuPaint", () => {
  it("splits a single mesh into one body per painted filament slot", () => {
    const objects = parseObjects(PAINTED_MESH_XML);
    const mesh = objects.get(1);
    expect(mesh?.kind).toBe("mesh");
    if (mesh?.kind !== "mesh") {
      return;
    }

    const parts = splitMeshByBambuPaint(
      mesh.mesh,
      IDENTITY_MAT4,
      ["#000000", "#FFFFFF"],
      1,
      "Sign",
      0,
    );

    expect(parts).toHaveLength(2);
    expect(parts.map((part) => part.defaultColorHex)).toEqual(["#000000", "#FFFFFF"]);
    expect(parts.every((part) => part.positions.length === 9)).toBe(true);
  });
});
