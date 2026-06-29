import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";

import { read3mfMesh } from "../../../src/infrastructure/model/read3mfMesh.js";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="10" y="0" z="0"/>
          <vertex x="0" y="10" z="0"/>
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2"/>
        </triangles>
      </mesh>
    </object>
  </resources>
</model>`;

function build3mfBuffer(xml: string): Buffer {
  const zipped = zipSync({ "3D/3dmodel.model": strToU8(xml) });
  return Buffer.from(zipped);
}

describe("read3mfMesh", () => {
  it("extracts triangle vertices from 3MF zip", () => {
    const positions = read3mfMesh(build3mfBuffer(SAMPLE_XML));
    expect(positions).not.toBeNull();
    expect(positions!.length).toBe(9);
    expect(positions![3]).toBe(10);
  });
});
