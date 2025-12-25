import { Router } from 'express';
import { pixPayoutController } from '../controllers/pixPayoutController';
import { qrCodeController } from '../controllers/qrcodeController';
import { webhookController } from '../controllers/webhookController';
import { giftController } from '../controllers/giftController';
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
 * Rota pública para processar PIX de Natal via QR Code
 * Esta rota é acessada quando o QR Code é escaneado
 * Aceita apenas valores de R$ 300,00 para segurança
 */
router.get('/natal/pix', async (req, res, next): Promise<void> => {
  try {
    const { chave_pix, valor } = req.query;

    if (!chave_pix) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'chave_pix é obrigatória',
        },
      });
      return;
    }

    const valorNum = parseFloat(valor as string) || 300.00;

    // Validar que o valor é exatamente 300,00 (segurança)
    if (Math.abs(valorNum - 300.00) > 0.01) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Esta rota aceita apenas valores de R$ 300,00',
        },
      });
      return;
    }

    // Processar o payout usando o controller
    const pixPayoutRequest = {
      chave_pix: chave_pix as string,
      valor: 300.00,
      descricao: 'Presente de Natal 🎄',
    };

    // Criar objetos req/res mockados para o controller
    const mockReq = {
      body: pixPayoutRequest,
    } as Pick<typeof req, 'body'>;

    let responseData: unknown = null;
    let statusCode = 200;
    let responseSent = false;

    const mockRes = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: unknown) => {
            responseData = data;
            if (!responseSent) {
              res.status(statusCode).json(data);
              responseSent = true;
            }
          },
        };
      },
    } as Pick<typeof res, 'status'>;

    // Processar o payout
    await pixPayoutController.createPayout(mockReq, mockRes, (err: unknown) => {
      if (err) {
        next(err);
        return;
      }
      if (!responseSent && responseData) {
        res.status(statusCode).json(responseData);
        responseSent = true;
      }
    });
  } catch (error) {
    next(error);
  }
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
 * Rotas de Gift (protegidas)
 */
router.post('/gifts', authenticateApiKey, giftController.create.bind(giftController));
router.get('/gifts', authenticateApiKey, giftController.list.bind(giftController));
router.get('/gifts/summary', authenticateApiKey, giftController.summary.bind(giftController));
router.post(
  '/gifts/:referenceId/redeem',
  authenticateApiKey,
  giftController.redeem.bind(giftController)
);
router.get(
  '/gifts/:referenceId',
  authenticateApiKey,
  giftController.getStatus.bind(giftController)
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
