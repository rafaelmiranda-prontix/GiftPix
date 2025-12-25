import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { qrCodeGenerator } from '../utils/qrcode';
import { validatePixKey, validateAmount, sanitizeDescription } from '../utils/validators';
import { QRCodeGenerationRequest, ApiResponse } from '../types';

export class QRCodeController {
  /**
   * Gera QR Code para payout PIX
   * POST /api/qrcode/generate
   */
  async generateQRCode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { chave_pix, valor, descricao } = req.body as QRCodeGenerationRequest;

      // Validações
      validatePixKey(chave_pix);
      validateAmount(parseFloat(valor.toString()));

      const sanitizedDescription = sanitizeDescription(descricao);

      logger.info('Generating QR Code', { chave_pix, valor });

      // Verificar se é para a página de Natal (valor fixo de 300,00)
      const isNatal = parseFloat(valor.toString()) === 300.00 && 
                      (sanitizedDescription.toLowerCase().includes('natal') || 
                       sanitizedDescription.toLowerCase().includes('presente'));

      const qrCodeData = await qrCodeGenerator.generateQRCodeDataURL({
        chave_pix,
        valor: parseFloat(valor.toString()),
        descricao: sanitizedDescription,
      }, isNatal);

      const url = qrCodeGenerator.generatePayoutUrl({
        chave_pix,
        valor: parseFloat(valor.toString()),
        descricao: sanitizedDescription,
      }, isNatal);

      res.status(200).json({
        success: true,
        data: {
          qrcode: qrCodeData,
          url,
          message: 'QR Code gerado com sucesso',
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera QR Code e retorna como imagem PNG
   * GET /api/qrcode/image
   */
  async generateQRCodeImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { chave_pix, valor, descricao } = req.query;

      if (!chave_pix || !valor) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'chave_pix e valor são obrigatórios',
          },
        } as ApiResponse);
        return;
      }

      // Validações
      validatePixKey(chave_pix as string);
      validateAmount(parseFloat(valor as string));

      const sanitizedDescription = sanitizeDescription(descricao as string);

      logger.info('Generating QR Code image', { chave_pix, valor });

      const qrCodeBuffer = await qrCodeGenerator.generateQRCodeBuffer({
        chave_pix: chave_pix as string,
        valor: parseFloat(valor as string),
        descricao: sanitizedDescription,
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
      res.send(qrCodeBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const qrCodeController = new QRCodeController();
