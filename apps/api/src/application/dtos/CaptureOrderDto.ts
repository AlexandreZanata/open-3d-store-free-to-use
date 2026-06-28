export type CaptureOrderItemInput = {
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

export type CaptureOrderInput = {
  items: CaptureOrderItemInput[];
  customerName?: string | undefined;
  customerNote?: string | undefined;
};

export type CaptureOrderResultDto = {
  orderId: string;
  whatsappLink: string;
  totalPrice: string;
  summary: string;
};
