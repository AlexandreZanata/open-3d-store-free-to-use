export type CatalogChangedResource = "catalog" | "product" | "category";

export type CatalogChangedAction = "created" | "updated" | "deleted";

export type CatalogChangedEvent = {
  type: "catalog.changed";
  resource: CatalogChangedResource;
  action: CatalogChangedAction;
  at: string;
  slug?: string;
  id?: string;
};
