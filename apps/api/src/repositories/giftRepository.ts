import { prisma } from '@giftpix/infra';
import { GiftStatus as DbGiftStatus, Gift, Prisma } from '@prisma/client';
import { Gift as DomainGift, GiftStatus } from '../types';

const statusToDb = (status: GiftStatus): DbGiftStatus => {
  switch (status) {
    case 'redeemed':
      return 'REDEEMED';
    case 'expired':
      return 'EXPIRED';
    case 'refunded':
      return 'REFUNDED';
    case 'active':
    default:
      return 'ACTIVE';
  }
};

const statusFromDb = (status: DbGiftStatus): GiftStatus => {
  switch (status) {
    case 'REDEEMED':
      return 'redeemed';
    case 'EXPIRED':
      return 'expired';
    case 'REFUNDED':
      return 'refunded';
    case 'ACTIVE':
    default:
      return 'active';
  }
};

const mapToDomain = (gift: Gift): DomainGift => ({
  id: gift.id,
  reference_id: gift.referenceId,
  amount: Number(gift.amount),
  status: statusFromDb(gift.status),
  message: gift.message ?? undefined,
  pin_hash: gift.pinHash ?? undefined,
  expires_at: gift.expiresAt ?? undefined,
  created_at: gift.createdAt,
  updated_at: gift.updatedAt,
});

export const giftRepository = {
  async create(data: {
    reference_id: string;
    amount: number;
    status?: GiftStatus;
    message?: string;
    pin_hash: string;
    expires_at?: Date;
  }): Promise<DomainGift> {
    const created = await prisma.gift.create({
      data: {
        referenceId: data.reference_id,
        amount: new Prisma.Decimal(data.amount),
        status: statusToDb(data.status || 'active'),
        message: data.message,
        pinHash: data.pin_hash,
        expiresAt: data.expires_at,
      },
    });
    return mapToDomain(created);
  },

  async findByReferenceId(referenceId: string): Promise<DomainGift | null> {
    const gift = await prisma.gift.findUnique({ where: { referenceId } });
    return gift ? mapToDomain(gift) : null;
  },

  async findById(id: string): Promise<DomainGift | null> {
    const gift = await prisma.gift.findUnique({ where: { id } });
    return gift ? mapToDomain(gift) : null;
  },

  async updateStatus(id: string, status: GiftStatus): Promise<DomainGift> {
    const updated = await prisma.gift.update({
      where: { id },
      data: { status: statusToDb(status) },
    });
    return mapToDomain(updated);
  },

  async setPinHash(id: string, pin_hash: string): Promise<DomainGift> {
    const updated = await prisma.gift.update({
      where: { id },
      data: { pinHash: pin_hash },
    });
    return mapToDomain(updated);
  },

  async list(): Promise<DomainGift[]> {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return gifts.map(mapToDomain);
  },
};
