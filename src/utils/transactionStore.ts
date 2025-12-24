import { TransactionLog } from '../types';

/**
 * In-memory transaction store for idempotency
 * In production, use a database like PostgreSQL or Redis
 */
class TransactionStore {
  private transactions: Map<string, TransactionLog> = new Map();

  async save(transaction: TransactionLog): Promise<void> {
    this.transactions.set(transaction.reference_id, transaction);
  }

  async findByReferenceId(referenceId: string): Promise<TransactionLog | null> {
    return this.transactions.get(referenceId) || null;
  }

  async update(referenceId: string, updates: Partial<TransactionLog>): Promise<void> {
    const existing = this.transactions.get(referenceId);
    if (existing) {
      this.transactions.set(referenceId, { ...existing, ...updates });
    }
  }

  async getAll(): Promise<TransactionLog[]> {
    return Array.from(this.transactions.values());
  }

  async exists(referenceId: string): Promise<boolean> {
    return this.transactions.has(referenceId);
  }
}

export const transactionStore = new TransactionStore();
