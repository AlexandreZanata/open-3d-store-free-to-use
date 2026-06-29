export const catalogEventsRouteSchema = {
  tags: ["Catalog"],
  summary: "Catalog change stream (SSE)",
  description:
    "Server-Sent Events stream. Emits `catalog.changed` when admin catalog data changes.",
  response: {
    200: {
      description: "text/event-stream",
      content: {
        "text/event-stream": {
          schema: { type: "string" },
        },
      },
    },
  },
} as const;
