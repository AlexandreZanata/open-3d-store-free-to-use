import { Link } from "@tanstack/react-router";
import type { AdminProductListItem, PrintStatus } from "@print3d/shared-types";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { resolveAssetUrl } from "@/lib/assets";
import { formatBrlCents } from "@/lib/money";
import { cn } from "@/lib/utils";

type ProductsTableProps = {
  products: AdminProductListItem[];
  categoryMap: Map<string, string>;
  onDelete: (id: string) => void;
};

export function ProductsTable({ products, categoryMap, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="min-w-full text-sm">
        <thead className="border-b border-hairline bg-surface-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Product</th>
            <th className="px-4 py-3 text-left font-medium">Slug</th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            <th className="px-4 py-3 text-left font-medium">Price</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-hairline last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.thumbnailUrl ? (
                    <img
                      src={resolveAssetUrl(product.thumbnailUrl)}
                      alt=""
                      className="size-10 rounded border border-hairline object-cover"
                    />
                  ) : null}
                  <span>{product.translations["pt-BR"].name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{product.slug}</td>
              <td className="px-4 py-3">{categoryMap.get(product.categoryId) ?? "—"}</td>
              <td className="px-4 py-3">{formatBrlCents(product.basePrice)}</td>
              <td className="px-4 py-3">
                <Badge status={product.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link to="/products/$id" params={{ id: product.id }}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button variant="danger" onClick={() => onDelete(product.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ProductsFiltersProps = {
  draftQ: string;
  status: PrintStatus | "";
  category: string;
  categories: Array<{ id: string; slug: string; name: string }>;
  onDraftQChange: (value: string) => void;
  onStatusChange: (status: PrintStatus | "") => void;
  onCategoryChange: (slug: string) => void;
  onApply: () => void;
};

export function ProductsFilters({
  draftQ,
  status,
  category,
  categories,
  onDraftQChange,
  onStatusChange,
  onCategoryChange,
  onApply,
}: ProductsFiltersProps) {
  return (
    <form
      className={cn(
        "mb-6 grid gap-4 rounded-lg border border-hairline bg-surface p-4",
        "sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end",
      )}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <Input
        label="Search"
        name="q"
        placeholder="Name or slug"
        value={draftQ}
        onChange={(event) => onDraftQChange(event.target.value)}
      />
      <Select
        label="Status"
        name="status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as PrintStatus | "")}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="out_of_stock">Out of stock</option>
        <option value="discontinued">Discontinued</option>
      </Select>
      <Select
        label="Category"
        name="category"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.id} value={item.slug}>
            {item.name}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" className="w-full xl:w-auto">
        Apply filters
      </Button>
    </form>
  );
}
