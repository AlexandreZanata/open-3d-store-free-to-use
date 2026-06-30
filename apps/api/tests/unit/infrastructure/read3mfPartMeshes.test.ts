import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import {
  readBambuFilamentColours,
  readBambuObjectParts,
} from "../../../src/infrastructure/model/readBambu3mfMetadata.js";
import { read3mfPartMeshes } from "../../../src/infrastructure/model/read3mfPartMeshes.js";

const KEYCHAIN_FIXTURE =
  "/data/dev/projects/webstorm/open-3d-store-free-to-use/apps/api/storage/models/3d/seed-custom-keychain.3mf";

describe.skipIf(!existsSync(KEYCHAIN_FIXTURE))("readBambu3mfMetadata", () => {
  it("reads filament colours from Bambu project_settings", () => {
    const data = readFileSync(KEYCHAIN_FIXTURE);
    const colours = readBambuFilamentColours(data);
    expect(colours[0]).toBe("#000000");
    expect(colours[2]).toBe("#FFFFFF");
  });

  it("reads part names for build object id 3", () => {
    const data = readFileSync(KEYCHAIN_FIXTURE);
    const parts = readBambuObjectParts(data, 3);
    expect(parts.map((part) => part.name)).toEqual(["bear", "nose"]);
  });
});

describe.skipIf(!existsSync(KEYCHAIN_FIXTURE))("read3mfPartMeshes", () => {
  it("keeps Bambu assembly volumes separate on the first plate", () => {
    const data = readFileSync(KEYCHAIN_FIXTURE);
    const parts = read3mfPartMeshes(data);
    expect(parts).not.toBeNull();
    expect(parts!.length).toBe(2);
    expect(parts!.map((part) => part.name)).toEqual(["bear", "nose"]);
  });
});
