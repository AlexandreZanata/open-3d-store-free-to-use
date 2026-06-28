import type { SeedCategory } from "./seedTypes.js";

export const seedCategories: SeedCategory[] = [
  {
    slug: "miniatures",
    name: "Miniatures",
    description: "Custom figurines and miniatures",
    sortOrder: 1,
    imageUrl: "/models/thumbnails/miniatures.webp",
    translations: {
      en: {
        name: "Miniatures",
        description: "Custom figurines and miniatures",
      },
      "pt-BR": {
        name: "Miniaturas",
        description: "Figurinhas e miniaturas personalizadas",
      },
    },
  },
  {
    slug: "gifts",
    name: "Gifts",
    description: "Personalized gift ideas",
    sortOrder: 2,
    imageUrl: "/models/thumbnails/gifts.webp",
    translations: {
      en: { name: "Gifts", description: "Personalized gift ideas" },
      "pt-BR": {
        name: "Presentes",
        description: "Ideias de presentes personalizados",
      },
    },
  },
  {
    slug: "tools",
    name: "Tools",
    description: "Practical 3D printed tools",
    sortOrder: 3,
    imageUrl: "/models/thumbnails/tools.webp",
    translations: {
      en: { name: "Tools", description: "Practical 3D printed tools" },
      "pt-BR": {
        name: "Ferramentas",
        description: "Ferramentas práticas impressas em 3D",
      },
    },
  },
];
