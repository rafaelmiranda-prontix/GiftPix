import { Router } from 'express';
import { pixPayoutController } from '../controllers/pixPayoutController';
import { qrCodeController } from '../controllers/qrcodeController';
import { authenticateApiKey } from '../middlewares/auth';

const router = Router();

/**
 * Health check endpoint (público)
 */
router.get('/health', (req, res) => {
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

export default router;
