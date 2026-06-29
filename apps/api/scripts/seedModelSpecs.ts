/** Real Bambu Studio models from the local downloads folder (not committed to git). */
export type SeedModelSpec = {
  productSlug: string;
  /** File name inside SEED_MODELS_SOURCE_DIR */
  sourceFile: string;
};

export const DEFAULT_SEED_MODELS_SOURCE_DIR = "/data/downloads";

/**
 * Catalog products backed by real STL/3MF files tested in Bambu Studio.
 * Source: SEED_MODELS_SOURCE_DIR (default /data/downloads).
 */
export const seedModelSpecs: SeedModelSpec[] = [
  {
    productSlug: "custom-photo-frame",
    sourceFile: "placa_estudo_hiragana_PRONTA.stl",
  },
  {
    productSlug: "dragon-figurine",
    sourceFile: "mini_dino.3mf",
  },
  {
    productSlug: "phone-stand",
    sourceFile: "iPhone_Stand_-_Standard.3mf",
  },
  {
    productSlug: "custom-keychain",
    sourceFile: "polar_bear_keychain_-_profile.3mf",
  },
  {
    productSlug: "planter-pot",
    sourceFile: "Capy.3mf",
  },
];
