import { count, eq } from "drizzle-orm";

import type { IStoreRegistrationRepository } from "../../domain/repositories/IStoreUserRepository.js";
import type { Database } from "../db/client.js";
import { storeRegistrationOrigins } from "../db/schema.store.js";

export class DrizzleStoreRegistrationRepository implements IStoreRegistrationRepository {
  constructor(private readonly db: Database) {}

  async countByIp(ipAddress: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(storeRegistrationOrigins)
      .where(eq(storeRegistrationOrigins.ipAddress, ipAddress));
    return Number(result[0]?.value ?? 0);
  }

  async countByDevice(deviceId: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(storeRegistrationOrigins)
      .where(eq(storeRegistrationOrigins.deviceId, deviceId));
    return Number(result[0]?.value ?? 0);
  }

  async recordOrigin(userId: string, ipAddress: string, deviceId: string): Promise<void> {
    await this.db.insert(storeRegistrationOrigins).values({
      userId,
      ipAddress,
      deviceId,
    });
  }

  async findOrigin(userId: string): Promise<{ ipAddress: string; deviceId: string } | null> {
    const rows = await this.db
      .select({
        ipAddress: storeRegistrationOrigins.ipAddress,
        deviceId: storeRegistrationOrigins.deviceId,
      })
      .from(storeRegistrationOrigins)
      .where(eq(storeRegistrationOrigins.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }
}
