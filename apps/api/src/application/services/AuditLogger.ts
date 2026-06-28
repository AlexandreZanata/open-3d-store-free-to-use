import type { AuditLogEntry } from "../../domain/repositories/IAuditLogRepository.js";
import type { IAuditLogRepository } from "../../domain/repositories/IAuditLogRepository.js";

export class AuditLogger {
  constructor(private readonly auditLogs: IAuditLogRepository) {}

  async log(entry: AuditLogEntry): Promise<void> {
    await this.auditLogs.append(entry);
  }
}
