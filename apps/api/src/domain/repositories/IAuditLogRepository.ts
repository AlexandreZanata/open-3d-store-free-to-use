export type AuditLogEntry = {
  adminUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, never>;
};

export interface IAuditLogRepository {
  append(entry: AuditLogEntry): Promise<string>;
}
