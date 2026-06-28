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
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { Rail } from "@/components/Rail";
import { categories, sections } from "@/lib/products";
import banner from "@/assets/banner-kinetic.jpg";

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AXIS — 3D Model Marketplace" },
      {
        name: "description",
        content:
          "Premium 3D print files marketplace: verified STL, 3MF, and OBJ models from curated creators.",
      },
      { property: "og:title", content: "AXIS — 3D Model Marketplace" },
      {
        property: "og:description",
        content: "Premium 3D print files marketplace: verified STL, 3MF, and OBJ models.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell>
      <section className="px-4 pt-4 pb-6">
        <Link
          to="/search"
          className="relative block overflow-hidden rounded-2xl bg-foreground text-background shadow-card lift"
        >
          <img
            src={banner}
            alt=""
            width={1200}
            height={800}
            className="absolute inset-0 size-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-foreground via-foreground/70 to-transparent" />
          <div className="relative p-6 min-h-[180px] flex flex-col justify-end">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/60">
              Featured collection
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance max-w-[18ch]">
              Kinetic Series — high-tolerance assemblies
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
              Explore collection
              <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mb-8">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Categories</h2>
          <Link
            to="/categories"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          {categories.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS];
            return (
              <Link
                key={c.slug}
                to="/categories"
                className="shrink-0 flex items-center gap-2 px-3.5 h-10 rounded-full bg-surface ring-1 ring-hairline shadow-soft press"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <Rail title="Best sellers" action={<RailAction label="All" />}>
        {sections.bestsellers.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} variant="wide" />
          </div>
        ))}
      </Rail>

      <Rail title="New arrivals" action={<RailAction label="All" />}>
        {sections.novelties.map((p, i) => (
          <div key={`${p.id}-${i}`} className="snap-start">
            <ProductCard product={p} variant="wide" />
          </div>
        ))}
      </Rail>

      <Rail title="Free models" action={<RailAction label="All" />}>
        {sections.free.map((p, i) => (
          <div key={`${p.id}-${i}`} className="snap-start">
            <ProductCard product={p} variant="wide" />
          </div>
        ))}
      </Rail>

      <Rail title="On sale" action={<RailAction label="All" />}>
        {sections.sale.map((p, i) => (
          <div key={`${p.id}-${i}`} className="snap-start">
            <ProductCard product={p} variant="wide" />
          </div>
        ))}
      </Rail>
    </AppShell>
  );
}

function RailAction({ label }: { label: string }) {
  return (
    <Link
      to="/search"
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}
