import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";

import { read3mfMesh } from "../../../src/infrastructure/model/read3mfMesh.js";

const INLINE_MESH_XML = `<?xml version="1.0" encoding="UTF-8"?>
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
    <object id="2" type="model">
      <components>
        <component objectid="1" transform="1 0 0 0 1 0 0 0 1 5 0 0"/>
      </components>
    </object>
  </resources>
  <build>
    <item objectid="2" transform="1 0 0 0 1 0 0 0 1 0 0 0" printable="1"/>
  </build>
</model>`;

const EXTERNAL_MESH_XML = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06">
  <resources>
    <object id="3" type="model">
      <components>
        <component p:path="/3D/Objects/part.model" objectid="1" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>
      </components>
    </object>
  </resources>
  <build>
    <item objectid="3" transform="1 0 0 0 1 0 0 0 1 0 0 0" printable="1"/>
  </build>
</model>`;

const PART_XML = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="0" y="0" z="10"/>
          <vertex x="0" y="10" z="0"/>
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2"/>
        </triangles>
      </mesh>
    </object>
  </resources>
</model>`;

function build3mfBuffer(files: Record<string, string>): Buffer {
  const zipped = zipSync(
    Object.fromEntries(Object.entries(files).map(([name, xml]) => [name, strToU8(xml)])),
  );
  return Buffer.from(zipped);
}

describe("read3mfMesh", () => {
  it("extracts triangle vertices from inline 3MF mesh", () => {
    const positions = read3mfMesh(build3mfBuffer({ "3D/3dmodel.model": INLINE_MESH_XML }));
    expect(positions).not.toBeNull();
    expect(positions!.length).toBe(9);
    expect(positions![3]).toBe(15);
  });

  it("resolves component transforms and external object files", () => {
    const positions = read3mfMesh(
      build3mfBuffer({
        "3D/3dmodel.model": EXTERNAL_MESH_XML,
        "3D/Objects/part.model": PART_XML,
      }),
    );
    expect(positions).not.toBeNull();
    expect(positions![0]).toBe(0);
    expect(positions![5]).toBe(10);
    expect(positions![7]).toBe(10);
  });
});
