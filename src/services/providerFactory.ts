import { config } from '../config/env';
import { PaymentProvider } from '../types';
import { asaasService } from './asaasService';
import { PagBankService } from './pagbankService';
import { logger } from '../utils/logger';

class ProviderFactory {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    // Inicializar providers disponíveis
    this.providers.set('asaas', asaasService);
    this.providers.set('pagbank', new PagBankService());
  }

  /**
   * Retorna o provider configurado
   */
  getProvider(): PaymentProvider {
    const provider = this.providers.get(config.provider);

    if (!provider) {
      logger.error('Invalid payment provider', { provider: config.provider });
      throw new Error(
        `Provider inválido: ${config.provider}. Use 'asaas' ou 'pagbank'.`
      );
    }

    logger.info('Using payment provider', { provider: config.provider });
    return provider;
  }

  /**
   * Retorna um provider específico (útil para testes)
   */
  getProviderByName(name: 'asaas' | 'pagbank'): PaymentProvider {
    const provider = this.providers.get(name);

    if (!provider) {
      throw new Error(`Provider não encontrado: ${name}`);
    }

    return provider;
  }
}

export const providerFactory = new ProviderFactory();
