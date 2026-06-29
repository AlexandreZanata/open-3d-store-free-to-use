export type SeedThumbnailSpec = {
  fileName: string;
  label: string;
  colors: [string, string];
};

export const seedThumbnailSpecs: SeedThumbnailSpec[] = [
  { fileName: "photo-frame.webp", label: "Photo Frame", colors: ["#6B4423", "#C49A6C"] },
  { fileName: "dragon.webp", label: "Dragon", colors: ["#7F1D1D", "#DC2626"] },
  { fileName: "phone-stand.webp", label: "Phone Stand", colors: ["#1E3A5F", "#3B82F6"] },
  { fileName: "keychain.webp", label: "Keychain", colors: ["#854D0E", "#FACC15"] },
  { fileName: "planter.webp", label: "Planter", colors: ["#14532D", "#22C55E"] },
  { fileName: "miniatures.webp", label: "Miniatures", colors: ["#581C87", "#A855F7"] },
  { fileName: "gifts.webp", label: "Gifts", colors: ["#9D174D", "#F472B6"] },
  { fileName: "tools.webp", label: "Tools", colors: ["#9A3412", "#FB923C"] },
  // Referenced by legacy integration-test rows in dev DB (adminFixtures used to point here)
  { fileName: "admin-test.webp", label: "Admin Test", colors: ["#374151", "#9CA3AF"] },
];
