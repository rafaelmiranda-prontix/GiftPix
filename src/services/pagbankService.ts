import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { PagBankTransferRequest, PagBankTransferResponse } from '../types';

export class PagBankError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PagBankError';
  }
}

export class PagBankService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.pagbank.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.pagbank.apiToken}`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.info('PagBank API Request', {
          method: config.method,
          url: config.url,
          data: this.sanitizeLogData(config.data),
        });
        return config;
      },
      (error) => {
        logger.error('PagBank API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('PagBank API Response', {
          status: response.status,
          data: this.sanitizeLogData(response.data),
        });
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private sanitizeLogData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    const sensitiveFields = ['token', 'password', 'apiKey', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const { status, data } = error.response;
      logger.error('PagBank API Error Response', {
        status,
        data: this.sanitizeLogData(data),
      });

      throw new PagBankError(
        `PagBank API Error: ${status}`,
        status,
        (data as any)?.error_code,
        data
      );
    } else if (error.request) {
      logger.error('PagBank API No Response', { error: error.message });
      throw new PagBankError('Sem resposta da API PagBank - timeout ou erro de rede');
    } else {
      logger.error('PagBank API Request Setup Error', { error: error.message });
      throw new PagBankError(`Erro ao configurar requisição: ${error.message}`);
    }
  }

  /**
   * Cria uma transferência PIX via PagBank
   * Documentação: https://developer.pagbank.com.br/reference/criar-transferencia
   */
  async createPixTransfer(
    transferData: PagBankTransferRequest
  ): Promise<PagBankTransferResponse> {
    try {
      logger.info('Creating PIX transfer', {
        reference_id: transferData.reference_id,
        amount: transferData.amount.value,
      });

      const response = await this.client.post<PagBankTransferResponse>(
        '/transfers',
        transferData
      );

      logger.info('PIX transfer created successfully', {
        transfer_id: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create PIX transfer', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reference_id: transferData.reference_id,
      });
      throw error;
    }
  }

  /**
   * Consulta status de uma transferência
   */
  async getTransferStatus(transferId: string): Promise<PagBankTransferResponse> {
    try {
      const response = await this.client.get<PagBankTransferResponse>(
        `/transfers/${transferId}`
      );

      logger.info('Transfer status retrieved', {
        transfer_id: transferId,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get transfer status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transfer_id: transferId,
      });
      throw error;
    }
  }

  /**
   * Verifica saldo disponível (se a API PagBank suportar)
   * Nota: Implementação pode variar dependendo da API disponível
   */
  async checkBalance(): Promise<number> {
    try {
      // Este endpoint pode variar - verificar documentação PagBank
      const response = await this.client.get('/balance');
      return response.data.available_balance || 0;
    } catch (error) {
      logger.warn('Could not retrieve balance', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Retorna 0 se não conseguir obter saldo
      return 0;
    }
  }
}

export const pagBankService = new PagBankService();
