import type { AuditLogEntry } from "../../domain/repositories/IAuditLogRepository.js";
import type { IAuditLogRepository } from "../../domain/repositories/IAuditLogRepository.js";
import type { Database } from "../db/client.js";
import { auditLogs } from "../db/schema.js";

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: Database) {}

  async append(entry: AuditLogEntry): Promise<string> {
    const rows = await this.db
      .insert(auditLogs)
      .values({
        adminUserId: entry.adminUserId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata,
      })
      .returning({ id: auditLogs.id });

    const row = rows[0];
    if (!row) {
      throw new Error("Failed to append audit log");
    }
    return row.id;
  }
}
