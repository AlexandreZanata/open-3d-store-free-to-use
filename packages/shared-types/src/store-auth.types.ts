
export type StoreCartItem = {
  productId: string;
  slug: string;
  name: string;
  thumbnailUrl: string;
  basePriceDisplay: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

export type StoreUserProfile = {
  id: string;
  email: string;
  displayName: string;
};

export type StoreMeResponse = {
  data: StoreUserProfile & {
    cart: StoreCartItem[];
    checkoutNote: string | null;
  };
};

export type StoreRegisterRequest = {
  email: string;
  password: string;
  displayName: string;
  cart?: StoreCartItem[];
  checkoutNote?: string | null;
};

export type StoreLoginRequest = {
  email: string;
  password: string;
  cart?: StoreCartItem[];
  checkoutNote?: string | null;
};

export type StoreUpdateProfileRequest = {
  displayName?: string;
  checkoutNote?: string | null;
};

export type StoreCartResponse = {
  data: { cart: StoreCartItem[] };
};

export type StoreSaveCartRequest = {
  cart: StoreCartItem[];
};
