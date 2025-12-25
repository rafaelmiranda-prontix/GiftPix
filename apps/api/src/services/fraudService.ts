import { fraudRepository } from '../repositories/fraudRepository';
import { systemConfigRepository } from '../repositories/systemConfigRepository';
import { ValidationError } from '../utils/validators';

const DEFAULTS = {
  maxGiftsPerDay: 5,
  maxValuePerDay: 2000,
  maxValuePerGift: 1000,
  maxRedeemAttempts: 5,
  blockMinutesOnRedeemAbuse: 30,
};

const getNumberConfig = async (key: string, fallback: number): Promise<number> => {
  const val = await systemConfigRepository.getValue(key);
  if (!val) return fallback;
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

export const fraudService = {
  async checkGiftCreation(ip?: string, amount?: number): Promise<void> {
    const now = new Date();
    if (ip && (await fraudRepository.isBlocked('ip', ip, now))) {
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }

    const maxPerDay = await getNumberConfig('gifts_per_day_limit', DEFAULTS.maxGiftsPerDay);
    const maxValuePerDay = await getNumberConfig('gifts_value_per_day_limit', DEFAULTS.maxValuePerDay);
    const maxValuePerGift = await getNumberConfig('gift_value_limit', DEFAULTS.maxValuePerGift);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const giftsToday = ip
      ? await fraudRepository.countEvents({ event_type: 'gift_created', ip, since })
      : 0;
    if (giftsToday >= maxPerDay) {
      await fraudRepository.recordEvent({ event_type: 'gift_creation_block', risk_score: 50, ip });
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }

    if (amount && amount > maxValuePerGift) {
      await fraudRepository.recordEvent({ event_type: 'gift_creation_block_amount', risk_score: 40, ip });
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }

    // Somatório por dia (aproximado via eventos)
    const valueEvents = ip
      ? await fraudRepository.countEvents({ event_type: 'gift_value_marker', ip, since })
      : 0;
    if (amount && valueEvents * (maxValuePerGift / 2) + amount > maxValuePerDay) {
      await fraudRepository.recordEvent({ event_type: 'gift_creation_block_value', risk_score: 40, ip });
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }
  },

  async checkRedeem(ip?: string, gift_id?: string): Promise<void> {
    const now = new Date();
    const entityId = ip || gift_id;
    if (entityId && (await fraudRepository.isBlocked('ip', entityId, now))) {
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }

    const maxAttempts = await getNumberConfig('redeem_attempts_limit', DEFAULTS.maxRedeemAttempts);
    const since = new Date(Date.now() - 60 * 60 * 1000); // 1h janela
    const attempts = await fraudRepository.countEvents({
      event_type: 'redeem_attempt',
      ip,
      gift_id,
      since,
    });
    if (attempts >= maxAttempts) {
      await fraudRepository.recordEvent({ event_type: 'redeem_block', risk_score: 50, ip, gift_id });
      if (ip) {
        await fraudRepository.block('ip', ip, 'redeem_attempts_exceeded', DEFAULTS.blockMinutesOnRedeemAbuse);
      }
      throw new ValidationError('Não foi possível concluir esta ação no momento.');
    }
  },

  async markRedeemAttempt(ip?: string, gift_id?: string, risk_score = 10) {
    await fraudRepository.recordEvent({ event_type: 'redeem_attempt', risk_score, ip, gift_id });
  },

  async markGiftCreated(ip?: string, gift_id?: string, amount?: number) {
    await fraudRepository.recordEvent({ event_type: 'gift_created', risk_score: 5, ip, gift_id });
    if (amount && ip) {
      // marcador simples para valor total aproximado
      await fraudRepository.recordEvent({ event_type: 'gift_value_marker', risk_score: 1, ip, gift_id });
    }
  },
};
