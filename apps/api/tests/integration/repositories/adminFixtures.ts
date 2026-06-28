import type { CreateProductPayload } from "@print3d/shared-types";

export const adminProductFixture: CreateProductPayload = {
  slug: "admin-test-frame",
  categoryId: "",
  basePrice: 4500,
  material: "PETG",
  printTimeHours: 4,
  weightGrams: 120,
  status: "active",
  options: [
    {
      id: "opt-color",
      name: "Color",
      type: "select",
      required: true,
      choices: ["White", "Black"],
    },
  ],
  modelFileUrl: null,
  thumbnailUrl: "/models/thumbnails/admin-test.webp",
  imageUrls: ["/models/images/admin-test-1.webp"],
  tags: ["gifts"],
  translations: {
    en: {
      name: "Custom Photo Frame",
      description: "Full description for admin test",
      shortDescription: "Photo frame with embossed name",
    },
    "pt-BR": {
      name: "Porta-retrato personalizado",
      description: "Descrição completa para teste admin",
      shortDescription: "Porta-retrato com nome em relevo",
    },
  },
};
