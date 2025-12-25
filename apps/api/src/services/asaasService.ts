import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import {
  AsaasTransferRequest,
  AsaasTransferResponse,
  PaymentProvider,
  ProviderTransferResponse,
  PixTransferData,
  ProviderStatus,
} from '../types';

export class AsaasError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AsaasError';
  }
}

export class AsaasService implements PaymentProvider {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.asaas.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'access_token': config.asaas.apiKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.info('Asaas API Request', {
          method: config.method,
          url: config.url,
          data: this.sanitizeLogData(config.data),
        });
        return config;
      },
      (error) => {
        logger.error('Asaas API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info('Asaas API Response', {
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

  private sanitizeLogData(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    const sanitized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    const sensitiveFields = ['access_token', 'apiKey', 'password', 'authorization'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const { status, data } = error.response;
      logger.error('Asaas API Error Response', {
        status,
        data: this.sanitizeLogData(data),
      });

      const errorData = data as { errors?: { description?: string; code?: string }[] };
      throw new AsaasError(
        errorData?.errors?.[0]?.description || `Asaas API Error: ${status}`,
        status,
        errorData?.errors?.[0]?.code,
        data
      );
    } else if (error.request) {
      logger.error('Asaas API No Response', { error: error.message });
      throw new AsaasError('Sem resposta da API Asaas - timeout ou erro de rede');
    } else {
      logger.error('Asaas API Request Setup Error', { error: error.message });
      throw new AsaasError(`Erro ao configurar requisição: ${error.message}`);
    }
  }

  /**
   * Detecta o tipo de chave PIX baseado no formato
   */
  private detectPixKeyType(pixKey: string): string {
    // CPF: 11 dígitos
    if (/^\d{11}$/.test(pixKey)) return 'CPF';

    // CNPJ: 14 dígitos
    if (/^\d{14}$/.test(pixKey)) return 'CNPJ';

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) return 'EMAIL';

    // Telefone: +55DDNNNNNNNNN
    if (/^\+55\d{10,11}$/.test(pixKey)) return 'PHONE';

    // EVP (chave aleatória)
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(pixKey)) {
      return 'EVP';
    }

    // Default para EVP se não detectar
    return 'EVP';
  }

  /**
   * Cria uma transferência PIX via Asaas
   * Documentação: https://docs.asaas.com/reference/transferir-para-conta-de-outra-instituicao-ou-chave-pix
   */
  async createPixTransfer(transferData: PixTransferData): Promise<ProviderTransferResponse> {
    try {
      const pixKeyType = this.detectPixKeyType(transferData.pix_key);

      logger.info('Creating PIX transfer via Asaas', {
        pix_key: transferData.pix_key,
        amount: transferData.amount,
        pixKeyType,
      });

      const requestData: AsaasTransferRequest = {
        value: transferData.amount,
        pixAddressKey: transferData.pix_key,
        pixAddressKeyType: pixKeyType,
        description: transferData.description || 'Transferência PIX',
      };

      const response = await this.client.post<AsaasTransferResponse>(
        '/v3/transfers',
        requestData
      );

      logger.info('PIX transfer created successfully via Asaas', {
        transfer_id: response.data.id,
        status: response.data.status,
      });

      return this.mapToProviderResponse(response.data);
    } catch (error) {
      logger.error('Failed to create PIX transfer via Asaas', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pix_key: transferData.pix_key,
      });
      throw error;
    }
  }

  /**
   * Consulta status de uma transferência
   * Documentação: https://docs.asaas.com/reference/recuperar-uma-unica-transferencia
   */
  async getTransferStatus(transferId: string): Promise<ProviderTransferResponse> {
    try {
      const response = await this.client.get<AsaasTransferResponse>(
        `/v3/transfers/${transferId}`
      );

      logger.info('Transfer status retrieved from Asaas', {
        transfer_id: transferId,
        status: response.data.status,
      });

      return this.mapToProviderResponse(response.data);
    } catch (error) {
      logger.error('Failed to get transfer status from Asaas', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transfer_id: transferId,
      });
      throw error;
    }
  }

  /**
   * Mapeia resposta do Asaas para o formato padrão
   */
  private mapToProviderResponse(asaasResponse: AsaasTransferResponse): ProviderTransferResponse {
    return {
      id: asaasResponse.id,
      status: this.normalizeStatus(asaasResponse.status),
      amount: asaasResponse.value,
      created_at: asaasResponse.dateCreated,
      pix_key: asaasResponse.pixAddressKey || '',
      description: asaasResponse.description,
    };
  }

  /**
   * Normaliza status do Asaas para formato padrão
   */
  private normalizeStatus(asaasStatus: string): ProviderStatus {
    const statusMap: Record<string, ProviderStatus> = {
      'PENDING': 'pending',
      'BANK_PROCESSING': 'processing',
      'DONE': 'completed',
      'CANCELLED': 'failed',
      'FAILED': 'failed',
      'REFUNDED': 'refunded',
    };

    return statusMap[asaasStatus] || 'pending';
  }

  /**
   * Lista transferências
   * Documentação: https://docs.asaas.com/reference/listar-transferencias
   */
  async listTransfers(params?: {
    offset?: number;
    limit?: number;
    dateCreated?: string;
  }): Promise<AsaasTransferResponse[]> {
    try {
      const response = await this.client.get<{ data: AsaasTransferResponse[] }>(
        '/v3/transfers',
        { params }
      );

      return response.data.data;
    } catch (error) {
      logger.error('Failed to list transfers from Asaas', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const asaasService = new AsaasService();
