import { and, count, desc, eq, gte, lte } from "drizzle-orm";

import type {
  AdminOrderDetail,
  AdminOrderListItem,
  OrderCapture,
  OrderLineItem,
} from "@print3d/shared-types";

import type { IOrderCaptureRepository } from "../../domain/repositories/IOrderCaptureRepository.js";
import type {
  OrderDateRange,
  PaginatedResult,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";
import { Price } from "../../domain/value-objects/Price.js";
import type { Database } from "../db/client.js";
import { orderCaptures } from "../db/schema.js";
import {
  buildPaginatedResult,
  normalizeAdminPagination,
} from "./pagination.js";

export class DrizzleOrderCaptureRepository implements IOrderCaptureRepository {
  constructor(private readonly db: Database) {}

  async save(orderCapture: OrderCapture, totalCents: number): Promise<void> {
    await this.db.insert(orderCaptures).values({
      id: orderCapture.id,
      items: orderCapture.items,
      customerName: orderCapture.customerName ?? null,
      customerNote: orderCapture.customerNote ?? null,
      totalCents,
      whatsappLink: orderCapture.whatsappLink,
      capturedAt: orderCapture.capturedAt,
    });
  }

  async findMany(
    pagination: PaginationParams,
    dateRange?: OrderDateRange,
  ): Promise<PaginatedResult<AdminOrderListItem>> {
    const { page, limit, offset } = normalizeAdminPagination(pagination);
    const conditions = [];

    if (dateRange?.from !== undefined) {
      conditions.push(gte(orderCaptures.capturedAt, dateRange.from));
    }
    if (dateRange?.to !== undefined) {
      conditions.push(lte(orderCaptures.capturedAt, dateRange.to));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await this.db
      .select()
      .from(orderCaptures)
      .where(whereClause)
      .orderBy(desc(orderCaptures.capturedAt))
      .limit(limit)
      .offset(offset);

    const totalRows = await this.db
      .select({ value: count() })
      .from(orderCaptures)
      .where(whereClause);

    const total = Number(totalRows[0]?.value ?? 0);
    return buildPaginatedResult(
      rows.map((row) => mapAdminOrderListItem(row)),
      total,
      page,
      limit,
    );
  }

  async findById(id: string): Promise<AdminOrderDetail | null> {
    const rows = await this.db
      .select()
      .from(orderCaptures)
      .where(eq(orderCaptures.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapAdminOrderDetail(row) : null;
  }
}

type OrderCaptureRow = typeof orderCaptures.$inferSelect;

function mapAdminOrderListItem(row: OrderCaptureRow): AdminOrderListItem {
  const items = row.items as OrderLineItem[];
  return {
    id: row.id,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: row.totalCents,
    totalDisplay: Price.fromCents(row.totalCents).toDisplay(),
    customerName: row.customerName,
    capturedAt: row.capturedAt.toISOString(),
  };
}

function mapAdminOrderDetail(row: OrderCaptureRow): AdminOrderDetail {
  const items = row.items as OrderLineItem[];
  return {
    id: row.id,
    items,
    customerName: row.customerName,
    customerNote: row.customerNote,
    totalCents: row.totalCents,
    totalDisplay: Price.fromCents(row.totalCents).toDisplay(),
    whatsappLink: row.whatsappLink,
    capturedAt: row.capturedAt.toISOString(),
  };
}
