import { v4 as uuidv4 } from 'uuid';
import { giftRepository } from '../repositories/giftRepository';
import { giftRedemptionRepository } from '../repositories/giftRedemptionRepository';
import { paymentRepository } from '../repositories/paymentRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { providerFactory } from './providerFactory';
import { Gift, ProviderName, ProviderTransferResponse } from '../types';
import { validatePixKey, validateAmount, ValidationError, sanitizeDescription } from '../utils/validators';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import crypto from 'crypto';

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

    // Registrar redemption
    const redemption = await giftRedemptionRepository.create({
      gift_id: gift.id,
      pix_key: input.pix_key,
      provider: config.provider,
      status: 'pending',
    });

    const payment = await paymentRepository.findByGiftId(gift.id);
    if (!payment) {
      throw new Error('Pagamento não encontrado para o gift');
    }

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
    await giftRedemptionRepository.updateStatus(redemption.id, 'completed', {
      provider_ref: transfer.id,
    });

    await paymentRepository.updateStatus(payment.id, 'completed', { provider_ref: transfer.id });

    await giftRepository.updateStatus(gift.id, 'redeemed');

    await transactionRepository.update(gift.reference_id, {
      status: 'completed',
      provider_transaction_id: transfer.id,
    });

    return { provider: config.provider, transfer };
  }
}

export const giftService = new GiftService();
