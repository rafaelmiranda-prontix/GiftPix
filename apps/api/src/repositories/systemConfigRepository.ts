import { prisma } from '@giftpix/infra';

export const systemConfigRepository = {
  async getValue(key: string): Promise<string | null> {
    const item = await prisma.systemConfig.findUnique({ where: { key } });
    return item?.value ?? null;
  },
};
