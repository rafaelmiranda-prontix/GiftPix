import { prisma } from '@giftpix/infra';

export type FraudEntityType = 'ip' | 'user';

export const fraudRepository = {
  async recordEvent(params: { gift_id?: string; event_type: string; risk_score: number; ip?: string }) {
    return prisma.fraudEvent.create({
      data: {
        giftId: params.gift_id,
        eventType: params.event_type,
        riskScore: params.risk_score,
        ip: params.ip,
      },
    });
  },

  async countEvents(params: { event_type?: string; ip?: string; gift_id?: string; since: Date }): Promise<number> {
    return prisma.fraudEvent.count({
      where: {
        eventType: params.event_type,
        ip: params.ip,
        giftId: params.gift_id,
        createdAt: { gte: params.since },
      },
    });
  },

  async isBlocked(entity_type: FraudEntityType, entity_id: string, now: Date = new Date()): Promise<boolean> {
    const block = await prisma.fraudBlock.findFirst({
      where: {
        entityType: entity_type,
        entityId: entity_id,
        expiresAt: { gt: now },
      },
    });
    return Boolean(block);
  },

  async block(entity_type: FraudEntityType, entity_id: string, reason: string, ttlMinutes: number) {
    const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000);
    return prisma.fraudBlock.create({
      data: {
        entityType: entity_type,
        entityId: entity_id,
        reason,
        expiresAt: expires_at,
      },
    });
  },
};
