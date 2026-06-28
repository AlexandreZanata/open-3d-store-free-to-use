import gearbox from "@/assets/product-gearbox.jpg";
import planter from "@/assets/product-planter.jpg";
import balljoint from "@/assets/product-balljoint.jpg";
import miniature from "@/assets/product-miniature.jpg";
import organizer from "@/assets/product-organizer.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number; // 0 = free
  rating: number;
  downloads: number;
  sales: number;
  image: string;
  formats: string[];
  author: string;
  license: string;
  publishedAt: string;
  description: string;
  tags: string[];
  printers: string[];
  materials: string[];
  printTime: string;
  parts: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  badge?: "New" | "Sale" | "Free";
};

export const products: Product[] = [
  {
    id: "modular-gearbox-v4",
    name: "Modular Gearbox V4",
    category: "Mechanics",
    categorySlug: "mechanics",
    price: 12,
    rating: 4.9,
    downloads: 2480,
    sales: 318,
    image: gearbox,
    formats: ["STL", "3MF", "STEP"],
    author: "Studio-V",
    license: "Commercial",
    publishedAt: "2025-11-12",
    description:
      "Modular gear assembly with precise tolerances for FDM printing. Includes assembly guide and pre-oriented supports.",
    tags: ["gears", "mechanics", "modular", "fdm"],
    printers: ["Bambu Lab X1C", "Prusa MK4", "Voron 2.4"],
    materials: ["PLA+", "PETG"],
    printTime: "6h 40min",
    parts: 8,
    difficulty: "Intermediate",
  },
  {
    id: "brutalist-planter",
    name: "Brutalist Planter",
    category: "Home",
    categorySlug: "home",
    price: 0,
    rating: 4.8,
    downloads: 5120,
    sales: 0,
    image: planter,
    formats: ["STL", "3MF"],
    author: "Form.Lab",
    license: "CC-BY",
    publishedAt: "2026-01-04",
    description:
      "Geometric planter with thick walls and concrete-style finish. Ideal for succulents and small plants.",
    tags: ["planter", "decor", "home", "geometric"],
    printers: ["Any FDM 220mm+"],
    materials: ["PLA", "PETG"],
    printTime: "4h 10min",
    parts: 1,
    difficulty: "Beginner",
    badge: "Free",
  },
  {
    id: "universal-ball-joint",
    name: "Universal Ball Joint V2",
    category: "Replacement Parts",
    categorySlug: "replacement",
    price: 4.5,
    rating: 4.7,
    downloads: 2400,
    sales: 612,
    image: balljoint,
    formats: ["STL", "OBJ"],
    author: "Neural Forge",
    license: "Personal",
    publishedAt: "2026-02-18",
    description:
      "Universal ball joint with mounting base and adjustment screws. Compatible with various articulated arms.",
    tags: ["joint", "camera", "mount"],
    printers: ["Bambu Lab P1S", "Prusa MK3S"],
    materials: ["PETG", "ABS"],
    printTime: "2h 20min",
    parts: 4,
    difficulty: "Beginner",
    badge: "New",
  },
  {
    id: "warrior-mini",
    name: "Elder Warrior",
    category: "Miniatures",
    categorySlug: "miniatures",
    price: 6,
    rating: 4.9,
    downloads: 980,
    sales: 240,
    image: miniature,
    formats: ["STL", "LYS"],
    author: "Atelier Resin",
    license: "Personal",
    publishedAt: "2026-03-02",
    description: "32mm tabletop RPG miniature. Pre-supported for resin printing.",
    tags: ["rpg", "miniature", "fantasy", "resin"],
    printers: ["Elegoo Saturn 3", "Anycubic Photon M3"],
    materials: ["8K Resin"],
    printTime: "3h 50min",
    parts: 1,
    difficulty: "Intermediate",
  },
  {
    id: "hex-organizer",
    name: "HexGrid Organizer",
    category: "Organization",
    categorySlug: "organization",
    price: 3.5,
    rating: 4.8,
    downloads: 4500,
    sales: 1102,
    image: organizer,
    formats: ["STL", "3MF"],
    author: "Form.Lab",
    license: "Commercial",
    publishedAt: "2026-02-25",
    description: "Modular hexagonal organization system with optional magnetic inserts.",
    tags: ["organization", "office", "modular"],
    printers: ["Any FDM"],
    materials: ["PLA", "PETG"],
    printTime: "5h 30min",
    parts: 6,
    difficulty: "Beginner",
    badge: "Sale",
  },
  {
    id: "modular-gearbox-clone",
    name: "Differential Drive Kit",
    category: "Mechanics",
    categorySlug: "mechanics",
    price: 18,
    rating: 4.9,
    downloads: 1820,
    sales: 410,
    image: gearbox,
    formats: ["STL", "STEP"],
    author: "Studio-V",
    license: "Commercial",
    publishedAt: "2026-03-10",
    description: "Complete differential for robotics and light automation projects.",
    tags: ["robotics", "drive", "gears"],
    printers: ["Bambu Lab X1C", "Voron 2.4"],
    materials: ["PETG", "ABS"],
    printTime: "9h 10min",
    parts: 14,
    difficulty: "Advanced",
    badge: "New",
  },
];

export const categories = [
  { slug: "miniatures", label: "Miniatures", icon: "Swords" },
  { slug: "organization", label: "Organization", icon: "LayoutGrid" },
  { slug: "home", label: "Home", icon: "Home" },
  { slug: "tools", label: "Tools", icon: "Wrench" },
  { slug: "decor", label: "Decor", icon: "Flower2" },
  { slug: "toys", label: "Toys", icon: "ToyBrick" },
  { slug: "games", label: "Games", icon: "Gamepad2" },
  { slug: "replacement", label: "Replacement", icon: "Settings2" },
  { slug: "mechanics", label: "Mechanics", icon: "Cog" },
  { slug: "electronics", label: "Electronics", icon: "Cpu" },
] as const;

export const sections = {
  bestsellers: products.slice().sort((a, b) => b.sales - a.sales),
  novelties: products
    .filter((p) => p.badge === "New")
    .concat(products)
    .slice(0, 6),
  free: products.filter((p) => p.price === 0).concat(products.filter((p) => p.price < 5)),
  sale: products
    .filter((p) => p.badge === "Sale")
    .concat(products)
    .slice(0, 6),
};

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(p: number) {
  if (p === 0) return "Free";
  return `$${p.toFixed(2)}`;
}

export function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return `${n}`;
}
