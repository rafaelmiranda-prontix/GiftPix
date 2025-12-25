import { prisma } from '@giftpix/infra';
import { Provider, TransactionStatus } from '@prisma/client';
import { TransactionLog, ProviderStatus } from '../types';

type ProviderName = TransactionLog['provider'];

const providerToDb = (provider: ProviderName): Provider =>
  provider === 'asaas' ? 'ASAAS' : 'PAGBANK';

const providerFromDb = (provider: Provider): ProviderName =>
  provider === 'ASAAS' ? 'asaas' : 'pagbank';

const statusToDb = (status: ProviderStatus): TransactionStatus => {
  switch (status) {
    case 'completed':
      return 'COMPLETED';
    case 'failed':
      return 'FAILED';
    default:
      return 'PENDING';
  }
};

const statusFromDb = (status: TransactionStatus): ProviderStatus => {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
};

const mapToDomain = (record: {
  id: string;
  referenceId: string;
  pixKey: string;
  amount: unknown;
  status: TransactionStatus;
  description: string | null;
  provider: Provider;
  providerTransactionId: string | null;
  errorMessage: string | null;
  createdAt: Date;
}): TransactionLog => ({
  id: record.id,
  reference_id: record.referenceId,
  chave_pix: record.pixKey,
  valor: Number(record.amount),
  status: statusFromDb(record.status),
  descricao: record.description ?? undefined,
  created_at: record.createdAt,
  provider_transaction_id: record.providerTransactionId ?? undefined,
  provider: providerFromDb(record.provider),
  error_message: record.errorMessage ?? undefined,
});

export const transactionRepository = {
  async create(data: {
    reference_id: string;
    chave_pix: string;
    valor: number;
    descricao?: string;
    provider: ProviderName;
    status?: ProviderStatus;
  }): Promise<TransactionLog> {
    const created = await prisma.transactionLog.create({
      data: {
        referenceId: data.reference_id,
        pixKey: data.chave_pix,
        amount: data.valor,
        description: data.descricao,
        provider: providerToDb(data.provider),
        status: statusToDb(data.status || 'pending'),
      },
    });
    return mapToDomain(created);
  },

  async findByReferenceId(referenceId: string): Promise<TransactionLog | null> {
    const existing = await prisma.transactionLog.findUnique({
      where: { referenceId },
    });
    return existing ? mapToDomain(existing) : null;
  },

  async findByProviderTransactionId(providerTransactionId: string): Promise<TransactionLog | null> {
    const existing = await prisma.transactionLog.findFirst({
      where: { providerTransactionId },
    });
    return existing ? mapToDomain(existing) : null;
  },

  async update(
    referenceId: string,
    updates: Partial<Pick<TransactionLog, 'status' | 'provider_transaction_id' | 'error_message'>>
  ): Promise<TransactionLog | null> {
    const updated = await prisma.transactionLog.update({
      where: { referenceId },
      data: {
        status: updates.status ? statusToDb(updates.status) : undefined,
        providerTransactionId: updates.provider_transaction_id,
        errorMessage: updates.error_message,
      },
    });
    return mapToDomain(updated);
  },

  async getAll(): Promise<TransactionLog[]> {
    const transactions = await prisma.transactionLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return transactions.map(mapToDomain);
  },
};
