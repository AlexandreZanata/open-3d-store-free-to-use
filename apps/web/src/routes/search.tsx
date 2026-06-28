import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/products";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search 3D models — AXIS" },
      {
        name: "description",
        content: "Filter and find STL, 3MF, and OBJ models with advanced filters.",
      },
    ],
  }),
  component: SearchPage,
});

type Filter = "all" | "free" | "paid" | "sale";
type Sort = "relevance" | "recent" | "downloads" | "rating" | "price";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("relevance");
  const [category, setCategory] = useState<string | null>(null);
  const [openFilters, setOpenFilters] = useState(false);

  const results = useMemo(() => {
    let r = products.filter((p) => {
      if (
        query &&
        !`${p.name} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      if (category && p.categorySlug !== category) return false;
      if (filter === "free" && p.price !== 0) return false;
      if (filter === "paid" && p.price === 0) return false;
      if (filter === "sale" && p.badge !== "Sale") return false;
      return true;
    });
    if (sort === "downloads") r = r.slice().sort((a, b) => b.downloads - a.downloads);
    if (sort === "recent") r = r.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (sort === "rating") r = r.slice().sort((a, b) => b.rating - a.rating);
    if (sort === "price") r = r.slice().sort((a, b) => a.price - b.price);
    return r;
  }, [query, category, filter, sort]);

  return (
    <AppShell showSearch={false} title="Search">
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-hairline">
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full h-10 px-3.5">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Models, authors, tags…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setOpenFilters((v) => !v)}
            className={`size-10 grid place-items-center rounded-full ring-1 ring-hairline press ${
              openFilters ? "bg-foreground text-background" : "bg-surface"
            }`}
            aria-label="Filters"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          {(["all", "free", "paid", "sale"] as Filter[]).map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {labelFilter(f)}
            </Chip>
          ))}
        </div>

        {openFilters && (
          <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <FilterGroup label="Category">
              <Chip active={category === null} onClick={() => setCategory(null)}>
                All
              </Chip>
              {categories.map((c) => (
                <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                  {c.label}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Sort by">
              {(["relevance", "recent", "downloads", "rating", "price"] as Sort[]).map((s) => (
                <Chip key={s} active={sort === s} onClick={() => setSort(s)}>
                  {labelSort(s)}
                </Chip>
              ))}
            </FilterGroup>
          </div>
        )}
      </div>

      <div className="px-4 py-4 text-xs text-muted-foreground uppercase tracking-wider">
        {results.length} {results.length === 1 ? "model" : "models"}
      </div>

      {results.length === 0 ? (
        <EmptyResults />
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-9 px-3.5 rounded-full text-xs font-medium press ring-1 ${
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-hairline hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
        <SearchIcon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">Nothing found</h3>
      <p className="mt-1 text-sm text-muted-foreground">Adjust filters or try another keyword.</p>
    </div>
  );
}

function labelFilter(f: Filter) {
  return { all: "All", free: "Free", paid: "Paid", sale: "On sale" }[f];
}

function labelSort(s: Sort) {
  return {
    relevance: "Relevance",
    recent: "Recent",
    downloads: "Downloads",
    rating: "Rating",
    price: "Price",
  }[s];
}
