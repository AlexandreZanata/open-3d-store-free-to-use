export type ProductViewedEvent = {
  type: "product.viewed";
  payload: {
    productId: string;
    sessionId: string;
  };
};

export type OrderCapturedEvent = {
  type: "order.captured";
  payload: {
    orderId: string;
    itemCount: number;
    totalCents: number;
  };
};

export type WhatsappClickedEvent = {
  type: "whatsapp.clicked";
  payload: {
    orderId: string;
    timestamp: Date;
  };
};

export type DomainEvent =
  | ProductViewedEvent
  | OrderCapturedEvent
  | WhatsappClickedEvent;
