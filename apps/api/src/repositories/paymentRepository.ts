import { prisma } from '@giftpix/infra';
import { PaymentStatus as DbPaymentStatus, Provider as DbProvider, Payment, Prisma } from '@prisma/client';
import { Payment as DomainPayment, PaymentStatus, ProviderName } from '../types';

const providerToDb = (provider: ProviderName): DbProvider => (provider === 'asaas' ? 'ASAAS' : 'PAGBANK');
const providerFromDb = (provider: DbProvider): ProviderName => (provider === 'ASAAS' ? 'asaas' : 'pagbank');

const statusToDb = (status: PaymentStatus): DbPaymentStatus => {
  switch (status) {
    case 'completed':
      return 'COMPLETED';
    case 'failed':
      return 'FAILED';
    default:
      return 'PENDING';
  }
};

const statusFromDb = (status: DbPaymentStatus): PaymentStatus => {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
};

const mapToDomain = (payment: Payment): DomainPayment => ({
  id: payment.id,
  gift_id: payment.giftId,
  provider: providerFromDb(payment.provider),
  provider_ref: payment.providerRef ?? undefined,
  amount: Number(payment.amount),
  status: statusFromDb(payment.status),
  error_message: payment.errorMessage ?? undefined,
  created_at: payment.createdAt,
  updated_at: payment.updatedAt,
});

export const paymentRepository = {
  async create(data: {
    gift_id: string;
    provider: ProviderName;
    amount: number;
    status?: PaymentStatus;
    provider_ref?: string;
    error_message?: string;
  }): Promise<DomainPayment> {
    const created = await prisma.payment.create({
      data: {
        giftId: data.gift_id,
        provider: providerToDb(data.provider),
        amount: new Prisma.Decimal(data.amount),
        status: statusToDb(data.status || 'pending'),
        providerRef: data.provider_ref,
        errorMessage: data.error_message,
      },
    });
    return mapToDomain(created);
  },

  async findById(id: string): Promise<DomainPayment | null> {
    const payment = await prisma.payment.findUnique({ where: { id } });
    return payment ? mapToDomain(payment) : null;
  },

  async findByProviderRef(provider_ref: string): Promise<DomainPayment | null> {
    const payment = await prisma.payment.findFirst({ where: { providerRef: provider_ref } });
    return payment ? mapToDomain(payment) : null;
  },

  async findByGiftId(gift_id: string): Promise<DomainPayment | null> {
    const payment = await prisma.payment.findFirst({ where: { giftId: gift_id }, orderBy: { createdAt: 'desc' } });
    return payment ? mapToDomain(payment) : null;
  },

  async updateStatus(
    id: string,
    status: PaymentStatus,
    opts?: { provider_ref?: string; error_message?: string }
  ): Promise<DomainPayment> {
    const updated = await prisma.payment.update({
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
