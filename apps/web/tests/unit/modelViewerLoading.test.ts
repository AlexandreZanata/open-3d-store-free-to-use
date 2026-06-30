import { describe, expect, it } from "vitest";

import en from "../../src/i18n/locales/en.json";
import ptBR from "../../src/i18n/locales/pt-BR.json";

/** Contract: docs/features/3d-viewer.md — loading overlay copy */
describe("model viewer loading copy (contract: docs/features/3d-viewer.md)", () => {
  it("defines bilingual viewerLoading strings", () => {
    expect(en.product.viewerLoading).toBe("Loading 3D model…");
    expect(ptBR.product.viewerLoading).toBe("Carregando modelo 3D…");
  });
});
