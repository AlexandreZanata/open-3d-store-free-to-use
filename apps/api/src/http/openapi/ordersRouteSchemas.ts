import {
  captureOrderBodySchema,
  captureOrderResultSchema,
  problemDetailsSchema,
} from "./components.js";
import { localeQueryProperty } from "./localeQuery.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
} from "./responses.js";

export const captureOrderRouteSchema = {
  tags: ["Orders"],
  summary: "Capture order intent and get WhatsApp link",
  description:
    "Anonymous order capture. Validates products, options, and stock. " +
    "Rate limit: 10 requests/IP/minute. " +
    "422 variants: invalid body, product not orderable (`not-orderable`), missing required option.",
  querystring: {
    type: "object",
    properties: { locale: localeQueryProperty },
  },
  body: captureOrderBodySchema,
  response: {
    201: {
      description: "Order captured — redirect user to whatsappLink",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: captureOrderResultSchema },
          },
        },
      },
    },
    404: {
      description: "Product in cart not found",
      content: problemContent({
        type: "https://yourdomain.com/errors/not-found",
        title: "Product not found",
        status: 404,
        detail: "Product 01935... was not found",
      }),
    },
    422: {
      description:
        "Invalid body, product not orderable, or missing required product option (RFC 7807)",
      content: {
        "application/json": {
          schema: problemDetailsSchema,
          examples: {
            validationFailed: {
              summary: "Invalid request body",
              value: {
                type: "https://yourdomain.com/errors/validation-failed",
                title: "Validation failed",
                status: 422,
                detail: "One or more fields are invalid",
              },
            },
            notOrderable: {
              summary: "Product out of stock or discontinued",
              value: {
                type: "https://yourdomain.com/errors/not-orderable",
                title: "Product not orderable",
                status: 422,
                detail: "Product is out of stock or discontinued",
              },
            },
            missingOption: {
              summary: "Required product option missing",
              value: {
                type: "https://yourdomain.com/errors/validation-failed",
                title: "Validation failed",
                status: 422,
                detail: "Missing required option 'Color' for product 01935...",
              },
            },
          },
        },
      },
    },
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;
