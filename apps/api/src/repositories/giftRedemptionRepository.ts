import { prisma } from '@giftpix/infra';
import { GiftRedemptionStatus as DbRedemptionStatus, Provider as DbProvider, GiftRedemption } from '@prisma/client';
import { GiftRedemption as DomainRedemption, ProviderName, RedemptionStatus } from '../types';

const providerToDb = (provider: ProviderName): DbProvider => (provider === 'asaas' ? 'ASAAS' : 'PAGBANK');
const providerFromDb = (provider: DbProvider): ProviderName => (provider === 'ASAAS' ? 'asaas' : 'pagbank');

const statusToDb = (status: RedemptionStatus): DbRedemptionStatus => {
  switch (status) {
    case 'completed':
      return 'COMPLETED';
    case 'failed':
      return 'FAILED';
    default:
      return 'PENDING';
  }
};

const statusFromDb = (status: DbRedemptionStatus): RedemptionStatus => {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
};

const mapToDomain = (redemption: GiftRedemption): DomainRedemption => ({
  id: redemption.id,
  gift_id: redemption.giftId,
  pix_key: redemption.pixKey,
  status: statusFromDb(redemption.status),
  provider: providerFromDb(redemption.provider),
  provider_ref: redemption.providerRef ?? undefined,
  error_message: redemption.errorMessage ?? undefined,
  created_at: redemption.createdAt,
  updated_at: redemption.updatedAt,
});

export const giftRedemptionRepository = {
  async create(data: {
    gift_id: string;
    pix_key: string;
    provider: ProviderName;
    status?: RedemptionStatus;
    provider_ref?: string;
    error_message?: string;
  }): Promise<DomainRedemption> {
    const created = await prisma.giftRedemption.create({
      data: {
        giftId: data.gift_id,
        pixKey: data.pix_key,
        provider: providerToDb(data.provider),
        status: statusToDb(data.status || 'pending'),
        providerRef: data.provider_ref,
        errorMessage: data.error_message,
      },
    });
    return mapToDomain(created);
  },

  async findById(id: string): Promise<DomainRedemption | null> {
    const redemption = await prisma.giftRedemption.findUnique({ where: { id } });
    return redemption ? mapToDomain(redemption) : null;
  },

  async updateStatus(
    id: string,
    status: RedemptionStatus,
    opts?: { provider_ref?: string; error_message?: string }
  ): Promise<DomainRedemption> {
    const updated = await prisma.giftRedemption.update({
      where: { id },
      data: {
        status: statusToDb(status),
        providerRef: opts?.provider_ref,
        errorMessage: opts?.error_message,
      },
    });
    return mapToDomain(updated);
  },
};
