import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — AXIS" },
      { name: "description", content: "3D models saved for later." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const saved = products.slice(0, 3);

  return (
    <AppShell showSearch={false} title="Favorites">
      {saved.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
            <Heart className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No favorites yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any model to save it.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
          >
            Browse models
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
