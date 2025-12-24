import { Router } from 'express';
import { pixPayoutController } from '../controllers/pixPayoutController';
import { qrCodeController } from '../controllers/qrcodeController';
import { webhookController } from '../controllers/webhookController';
import { authenticateApiKey } from '../middlewares/auth';

const router = Router();

/**
 * Health check endpoint (público)
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Rotas de PIX Payout (protegidas)
 */
router.post(
  '/pix-payout',
  authenticateApiKey,
  pixPayoutController.createPayout.bind(pixPayoutController)
);

router.get(
  '/pix-payout/:referenceId',
  authenticateApiKey,
  pixPayoutController.getPayoutStatus.bind(pixPayoutController)
);

router.get(
  '/pix-payout',
  authenticateApiKey,
  pixPayoutController.listPayouts.bind(pixPayoutController)
);

/**
 * Rotas de QR Code (protegidas)
 */
router.post(
  '/qrcode/generate',
  authenticateApiKey,
  qrCodeController.generateQRCode.bind(qrCodeController)
);

router.get(
  '/qrcode/image',
  authenticateApiKey,
  qrCodeController.generateQRCodeImage.bind(qrCodeController)
);

/**
 * Webhooks Asaas (públicos - autenticação via IP ou token do Asaas)
 */
router.post(
  '/webhooks/asaas/authorize',
  webhookController.authorizeTransfer.bind(webhookController)
);

router.post(
  '/webhooks/asaas/notification',
  webhookController.handleTransferNotification.bind(webhookController)
);

export default router;
