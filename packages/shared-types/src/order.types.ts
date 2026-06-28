export type OrderLineItem = {
  productId: string;
  productName: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  unitPrice: number;
};

export type OrderCapture = {
  id: string;
  items: OrderLineItem[];
  customerName?: string;
  customerNote?: string;
  capturedAt: Date;
  whatsappLink: string;
};
