import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Swords,
  LayoutGrid,
  Home as HomeIcon,
  Wrench,
  Flower2,
  ToyBrick,
  Gamepad2,
  Settings2,
  Cog,
  Cpu,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { categories, products } from "@/lib/products";

const ICONS = {
  Swords,
  LayoutGrid,
  Home: HomeIcon,
  Wrench,
  Flower2,
  ToyBrick,
  Gamepad2,
  Settings2,
  Cog,
  Cpu,
} as const;

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — AXIS" },
      { name: "description", content: "Browse categories of 3D print models." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <AppShell showSearch={false} title="Categories">
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {categories.map((c) => {
          const Icon = ICONS[c.icon as keyof typeof ICONS];
          const count = products.filter((p) => p.categorySlug === c.slug).length;
          return (
            <Link
              key={c.slug}
              to="/search"
              className="aspect-[5/4] rounded-2xl bg-surface ring-1 ring-hairline p-4 flex flex-col justify-between shadow-soft lift"
            >
              <Icon className="size-6 text-foreground" />
              <div>
                <div className="text-sm font-semibold tracking-tight">{c.label}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {count} models
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
