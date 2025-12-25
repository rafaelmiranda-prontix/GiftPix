import { v4 as uuidv4 } from 'uuid';
import { giftRepository } from '../repositories/giftRepository';
import { giftRedemptionRepository } from '../repositories/giftRedemptionRepository';
import { paymentRepository } from '../repositories/paymentRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { providerFactory } from './providerFactory';
import { Gift, ProviderName, ProviderStatus, ProviderTransferResponse } from '../types';
import { validatePixKey, validateAmount, ValidationError, sanitizeDescription } from '../utils/validators';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import crypto from 'crypto';
import { notificationService } from './notificationService';

const hashPin = (pin: string): string => {
  return crypto.createHash('sha256').update(pin).digest('hex');
};

export interface CreateGiftInput {
  amount: number;
  message?: string;
  pin: string;
  expires_at?: Date;
  provider?: ProviderName;
  description?: string;
}

export interface CreateGiftResult {
  gift: Gift;
  pin: string;
}

export interface RedeemGiftInput {
  reference_id: string;
  pin: string;
  pix_key: string;
  description?: string;
}

export interface RedeemGiftResult {
  provider: ProviderName;
  transfer: ProviderTransferResponse;
}

class GiftService {
  async createGift(input: CreateGiftInput): Promise<CreateGiftResult> {
    validateAmount(input.amount);
    const referenceId = uuidv4();
    const provider = input.provider || config.provider;
    const pinHash = hashPin(input.pin);

    const gift = await giftRepository.create({
      reference_id: referenceId,
      amount: input.amount,
      status: 'active',
      message: input.message,
      pin_hash: pinHash,
      expires_at: input.expires_at,
    });

    // Create payment placeholder (pending)
    await paymentRepository.create({
      gift_id: gift.id,
      provider,
      amount: input.amount,
      status: 'pending',
    });

    // Transaction log entry
    await transactionRepository.create({
      reference_id: referenceId,
      chave_pix: '',
      valor: input.amount,
      status: 'pending',
      provider,
      descricao: sanitizeDescription(input.description || input.message || ''),
    });

    if (config.notifications.defaultRecipient) {
      notificationService
        .notifyGiftCreated(config.notifications.defaultRecipient, {
          reference_id: referenceId,
          amount: input.amount,
          created_at: gift.created_at,
        })
        .catch((err) => logger.warn('notification failed: gift created', { err }));
    }

    logger.info('Gift created', { reference_id: referenceId, provider, amount: input.amount });
    return { gift, pin: input.pin };
  }

  private ensureActiveGift(gift: Gift): void {
    if (gift.status !== 'active') {
      throw new ValidationError('Gift não está ativo ou já foi resgatado/expirado');
    }
    if (gift.expires_at && gift.expires_at < new Date()) {
      throw new ValidationError('Gift expirado');
    }
  }

  async redeemGift(input: RedeemGiftInput): Promise<RedeemGiftResult> {
    validatePixKey(input.pix_key);

    const gift = await giftRepository.findByReferenceId(input.reference_id);
    if (!gift) throw new ValidationError('Gift não encontrado');

    this.ensureActiveGift(gift);

    const pinHash = hashPin(input.pin);
    if (gift.pin_hash !== pinHash) {
      throw new ValidationError('PIN inválido');
    }

    const payment = await paymentRepository.findByGiftId(gift.id);
    if (!payment) {
      throw new Error('Pagamento não encontrado para o gift');
    }

    if (config.requirePaymentConfirmation && payment.status !== 'completed') {
      // Tenta atualizar status se houver referência no provider
      if (payment.provider_ref) {
        const providerStatus = await providerFactory
          .getProviderByName(payment.provider)
          .getTransferStatus(payment.provider_ref)
          .catch(() => null);

        if (providerStatus) {
          await paymentRepository.updateStatus(payment.id, providerStatus.status, {
            provider_ref: providerStatus.id,
          });
          if (providerStatus.status === 'completed') {
            await giftRepository.updateStatus(gift.id, 'redeemed');
          }
        }
      }

      const refreshedPayment = await paymentRepository.findByGiftId(gift.id);
      if (refreshedPayment && refreshedPayment.status !== 'completed') {
        throw new ValidationError('Pagamento pendente. Aguarde a confirmação para resgatar.');
      }
    }

    // Registrar redemption
    const redemption = await giftRedemptionRepository.create({
      gift_id: gift.id,
      pix_key: input.pix_key,
      provider: config.provider,
      status: 'pending',
    });

    const provider = providerFactory.getProvider();
    let transfer: ProviderTransferResponse;
    try {
      transfer = await provider.createPixTransfer({
        pix_key: input.pix_key,
        amount: gift.amount,
        description: sanitizeDescription(input.description || gift.message || 'GiftPix'),
        reference_id: gift.reference_id,
      });
    } catch (error) {
      await giftRedemptionRepository.updateStatus(redemption.id, 'failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      await paymentRepository
        .updateStatus(payment.id, 'failed', {
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .catch(() => undefined);
      throw error;
    }

    // Atualizar registros
    await giftRedemptionRepository.updateStatus(redemption.id, transfer.status === 'failed' ? 'failed' : 'completed', {
      provider_ref: transfer.id,
    });

    await paymentRepository.updateStatus(payment.id, transfer.status === 'failed' ? 'failed' : 'completed', {
      provider_ref: transfer.id,
    });

    if (transfer.status === 'completed') {
      await giftRepository.updateStatus(gift.id, 'redeemed');
      if (config.notifications.defaultRecipient) {
        notificationService
          .notifyGiftRedeemed(config.notifications.defaultRecipient, {
            reference_id: gift.reference_id,
            amount: gift.amount,
          })
          .catch((err) => logger.warn('notification failed: gift redeemed', { err }));
      }
    }

    await transactionRepository.update(gift.reference_id, {
      status: transfer.status,
      provider_transaction_id: transfer.id,
    });

    return { provider: config.provider, transfer };
  }

  async getGiftStatus(reference_id: string): Promise<{ gift: Gift; paymentStatus?: ProviderStatus; providerRef?: string }> {
    const gift = await giftRepository.findByReferenceId(reference_id);
    if (!gift) throw new ValidationError('Gift não encontrado');

    const payment = await paymentRepository.findByGiftId(gift.id);
    if (!payment) return { gift };

    let latestStatus = payment.status as ProviderStatus;
    let providerRef = payment.provider_ref;

    // Se houver provider_ref, consultar provider para garantir status atualizado
    if (payment.provider_ref) {
      const provider = providerFactory.getProviderByName(payment.provider);
      try {
        const providerStatus = await provider.getTransferStatus(payment.provider_ref);
        logger.info('PSP status refresh', {
          reference_id,
          provider_ref: payment.provider_ref,
          provider_status: providerStatus.status,
        });
        latestStatus = providerStatus.status as ProviderStatus;
        providerRef = providerStatus.id;

        await paymentRepository.updateStatus(payment.id, latestStatus, {
          provider_ref: providerStatus.id,
          last_checked_at: new Date(),
        });

        if (latestStatus === 'completed') {
          await giftRepository.updateStatus(gift.id, 'redeemed');
        }
        if (latestStatus === 'refunded') {
          await giftRepository.updateStatus(gift.id, 'refunded');
        }

        await transactionRepository.update(reference_id, {
          status: latestStatus,
          provider_transaction_id: providerStatus.id,
        });
      } catch (error) {
        logger.warn('Failed to refresh provider status', {
          reference_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    let giftStatus = gift.status;
    if (latestStatus === 'completed') giftStatus = 'redeemed';
    if (latestStatus === 'refunded') giftStatus = 'refunded';

    return { gift: { ...gift, status: giftStatus }, paymentStatus: latestStatus, providerRef };
  }

  async validatePin(reference_id: string, pin: string): Promise<Gift> {
    const gift = await giftRepository.findByReferenceId(reference_id);
    if (!gift) throw new ValidationError('Gift não encontrado');
    this.ensureActiveGift(gift);

    const pinHash = hashPin(pin);
    if (gift.pin_hash !== pinHash) {
      throw new ValidationError('PIN inválido');
    }
    return gift;
  }

  async listGifts(): Promise<Gift[]> {
    return giftRepository.list();
  }

  async getSummary(): Promise<{
    total: number;
    redeemed: number;
    active: number;
    expired: number;
    totalAmount: number;
  }> {
    const gifts = await giftRepository.list();
    return gifts.reduce(
      (acc, gift) => {
        acc.total += 1;
        acc.totalAmount += gift.amount;
        if (gift.status === 'redeemed') acc.redeemed += 1;
        if (gift.status === 'active') acc.active += 1;
        if (gift.status === 'expired') acc.expired += 1;
        return acc;
      },
      { total: 0, redeemed: 0, active: 0, expired: 0, totalAmount: 0 }
    );
  }
}

export const giftService = new GiftService();
