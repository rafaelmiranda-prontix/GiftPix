import QRCode from 'qrcode';
import { QRCodeGenerationRequest } from '../types';
import { config } from '../config/env';

export class QRCodeGenerator {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `http://localhost:${config.port}`;
  }

  /**
   * Gera URL para requisição de payout PIX
   */
  generatePayoutUrl(request: QRCodeGenerationRequest, useNatalRoute: boolean = false): string {
    const params = new URLSearchParams({
      chave_pix: request.chave_pix,
      valor: request.valor.toString(),
    });

    if (request.descricao) {
      params.append('descricao', request.descricao);
    }

    // Se for para a página de Natal, usar rota pública
    if (useNatalRoute) {
      return `${this.baseUrl}/api/natal/pix?${params.toString()}`;
    }

    return `${this.baseUrl}/api/pix-payout?${params.toString()}`;
  }

  /**
   * Gera QR Code como Data URL (base64)
   */
  async generateQRCodeDataURL(request: QRCodeGenerationRequest, useNatalRoute: boolean = false): Promise<string> {
    const url = this.generatePayoutUrl(request, useNatalRoute);

    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error}`);
    }
  }

  /**
   * Gera QR Code como Buffer (para salvar em arquivo)
   */
  async generateQRCodeBuffer(request: QRCodeGenerationRequest): Promise<Buffer> {
    const url = this.generatePayoutUrl(request);

    try {
      const qrCodeBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 2,
      });

      return qrCodeBuffer;
    } catch (error) {
      throw new Error(`Erro ao gerar QR Code: ${error}`);
    }
  }
}

export const qrCodeGenerator = new QRCodeGenerator();
