import { NotificationChannel, NotificationType } from '@prisma/client';
import { notificationRepository } from '../repositories/notificationRepository';
import { logger } from '../utils/logger';

const sendEmail = async ({ to, subject }: { to: string; subject: string }) => {
  // Placeholder: aqui integrar provedor (SendGrid/SES). No MVP, apenas log.
  logger.info('[notification] sending email', { to, subject });
  // Simula envio
  return Promise.resolve();
};

export const notificationService = {
  async notifyGiftCreated(recipient: string, gift: { reference_id: string; amount: number; created_at: Date }) {
    const record = await notificationRepository.create({
      gift_id: gift.reference_id,
      type: NotificationType.GIFT_CREATED,
      channel: NotificationChannel.EMAIL,
      recipient,
    });
    try {
      await sendEmail({
        to: recipient,
        subject: 'Seu GiftPix foi criado',
        body: `GiftPix criado no valor de R$ ${gift.amount.toFixed(2)} em ${gift.created_at.toLocaleString()}. Status: Ativo.`,
      });
      await notificationRepository.markSent(record.id);
    } catch (error) {
      logger.error('[notification] failed to send gift created', { error });
      await notificationRepository.markFailed(record.id, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  async notifyGiftRedeemed(recipient: string, gift: { reference_id: string; amount: number }) {
    const record = await notificationRepository.create({
      gift_id: gift.reference_id,
      type: NotificationType.GIFT_REDEEMED,
      channel: NotificationChannel.EMAIL,
      recipient,
    });
    try {
      await sendEmail({
        to: recipient,
        subject: 'Seu GiftPix foi resgatado 🎉',
        body: `O presente foi resgatado. Valor enviado: R$ ${gift.amount.toFixed(2)}.`,
      });
      await notificationRepository.markSent(record.id);
    } catch (error) {
      logger.error('[notification] failed to send gift redeemed', { error });
      await notificationRepository.markFailed(record.id, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  async notifyGiftExpired(recipient: string, gift: { reference_id: string; amount: number }) {
    const record = await notificationRepository.create({
      gift_id: gift.reference_id,
      type: NotificationType.GIFT_EXPIRED,
      channel: NotificationChannel.EMAIL,
      recipient,
    });
    try {
      await sendEmail({
        to: recipient,
        subject: 'Seu GiftPix expirou',
        body: `O GiftPix de R$ ${gift.amount.toFixed(2)} expirou. Status: Expirado.`,
      });
      await notificationRepository.markSent(record.id);
    } catch (error) {
      logger.error('[notification] failed to send gift expired', { error });
      await notificationRepository.markFailed(record.id, error instanceof Error ? error.message : 'Unknown error');
    }
  },
};
