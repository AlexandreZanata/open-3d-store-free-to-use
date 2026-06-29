/** Printable mesh/object extracted from a 3D file (GLB scene graph, STL solid, etc.). */
export type ModelPart = {
  id: string;
  name: string;
  /** Estimated solid volume in cm³ (from bounding box × default infill). */
  volumeCm3: number | null;
  /** Estimated filament weight in grams for the shop default material density. */
  weightGrams: number | null;
};

/** Shop palette entry — admin configures; storefront studio applies per part. */
export type ShopColor = {
  id: string;
  name: string;
  hex: string;
};

/** Price per gram in minor currency units (e.g. BRL centavos per gram). */
export type MaterialPricePerGram = Partial<
  Record<
    import("../material.types.js").MaterialType,
    {
      pricePerGramCents: number;
      /** Material density g/cm³ — PLA ≈ 1.24 (Prusa/MatterHackers references). */
      densityGCm3: number;
    }
  >
>;

export type CalculatorSettings = {
  /** Machine hourly rate in minor currency units (BRL centavos). */
  machineHourlyRateCents: number;
  /** Fixed handling fee per part in minor currency units. */
  handlingFeeCents: number;
  /** Default infill factor for volume→weight estimate (0–1). Industry default ~0.15–0.25. */
  defaultInfillFactor: number;
};

export type ModelProcessingJobStatus = "pending" | "processing" | "completed" | "failed";

export type ModelProcessingJob = {
  id: string;
  status: ModelProcessingJobStatus;
  sourceUrl: string;
  parts: ModelPart[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ModelProcessingJobResponse = import("./admin.types.js").AdminDataResponse<ModelProcessingJob>;

export type BulkPrepriceResult = {
  updatedCount: number;
  skippedCount: number;
};

export type BulkPrepriceResponse = import("./admin.types.js").AdminDataResponse<BulkPrepriceResult>;
