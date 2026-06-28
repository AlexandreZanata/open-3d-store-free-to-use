import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Share2, Star, Download, ShoppingBag, Box, RotateCw, Maximize2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { formatCount, formatPrice, getProduct, products } from "@/lib/products";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.product.name} — AXIS` },
            { name: "description", content: loaderData.product.description },
            { property: "og:title", content: `${loaderData.product.name} — AXIS` },
            { property: "og:description", content: loaderData.product.description },
            { property: "og:image", content: loaderData.product.image },
          ],
        }
      : { meta: [{ title: "Model — AXIS" }] },
  notFoundComponent: () => (
    <AppShell title="Not found" showBack showSearch={false}>
      <div className="px-6 py-24 text-center">
        <h3 className="text-base font-semibold">Model not found</h3>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
        >
          Back
        </Link>
      </div>
    </AppShell>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [fav, setFav] = useState(false);
  const [tab, setTab] = useState<"viewer" | "gallery">("viewer");
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <AppShell showBack showSearch={false} title={product.name}>
      <section className="px-4 pt-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-hairline">
          <img
            src={product.image}
            alt={product.name}
            width={800}
            height={1000}
            className="absolute inset-0 size-full object-cover"
          />
          {tab === "viewer" && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/30 pointer-events-none" />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-background/90 backdrop-blur text-[10px] font-semibold uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                3D Viewer
              </div>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <IconBtn>
                  <RotateCw className="size-4" />
                </IconBtn>
                <IconBtn>
                  <Maximize2 className="size-4" />
                </IconBtn>
              </div>
            </>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Tab active={tab === "viewer"} onClick={() => setTab("viewer")}>
            <Box className="size-3.5" /> 3D Model
          </Tab>
          <Tab active={tab === "gallery"} onClick={() => setTab("gallery")}>
            Gallery (4)
          </Tab>
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {product.category}
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-balance">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-foreground text-foreground" />
                <span className="text-foreground font-medium">{product.rating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Download className="size-3.5" />
                {formatCount(product.downloads)} downloads
              </span>
              <span>·</span>
              <span>by {product.author}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-semibold">{formatPrice(product.price)}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {product.license}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((t: string) => (
            <span
              key={t}
              className="px-2.5 h-7 inline-flex items-center rounded-full bg-muted text-[11px] text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="bg-surface ring-1 ring-hairline rounded-2xl divide-y divide-hairline shadow-soft overflow-hidden">
          <Spec label="Files" value={product.formats.join(" · ")} />
          <Spec label="Parts" value={`${product.parts}`} />
          <Spec label="Estimated time" value={product.printTime} />
          <Spec label="Difficulty" value={product.difficulty} />
          <Spec label="Materials" value={product.materials.join(", ")} />
          <Spec label="Printers" value={product.printers.join(", ")} />
          <Spec label="Sales" value={formatCount(product.sales)} />
          <Spec
            label="Published"
            value={new Date(product.publishedAt).toLocaleDateString("en-US")}
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="px-4 mb-3">
          <h2 className="text-base font-semibold tracking-tight">Related</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x">
          {related.map((p) => (
            <div key={p.id} className="snap-start">
              <ProductCard product={p} variant="wide" />
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-16 inset-x-0 z-30 border-t border-hairline bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => setFav((v) => !v)}
            aria-label="Favorite"
            className="size-11 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press"
          >
            <Heart className={`size-5 transition-colors ${fav ? "fill-accent text-accent" : ""}`} />
          </button>
          <button
            aria-label="Share"
            className="size-11 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press"
          >
            <Share2 className="size-5" />
          </button>
          <Link
            to="/cart"
            className="flex-1 h-11 rounded-full bg-foreground text-background inline-flex items-center justify-center gap-2 text-sm font-semibold press hover:bg-foreground/90"
          >
            <ShoppingBag className="size-4" />
            Buy · {formatPrice(product.price)}
          </Link>
        </div>
      </div>

      <div className="h-14" />
    </AppShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold press ring-1 ${
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-hairline"
      }`}
    >
      {children}
    </button>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="size-9 grid place-items-center rounded-full bg-background/90 backdrop-blur ring-1 ring-hairline press">
      {children}
    </button>
  );
}
