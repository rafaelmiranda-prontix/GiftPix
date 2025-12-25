import { prisma } from '@giftpix/infra';
import { NotificationChannel, NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  gift_id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
}

export const notificationRepository = {
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        giftId: input.gift_id,
        type: input.type,
        channel: input.channel,
        recipient: input.recipient,
        status: 'PENDING',
      },
    });
  },

  async markSent(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });
  },

  async markFailed(id: string, errorMessage?: string) {
    return prisma.notification.update({
      where: { id },
      data: { status: 'FAILED', errorMessage },
    });
  },
};
