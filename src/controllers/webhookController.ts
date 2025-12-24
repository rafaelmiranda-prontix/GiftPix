import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { transactionStore } from '../utils/transactionStore';

export class WebhookController {
  /**
   * Webhook de autorização de transferência (Asaas)
   * POST /api/webhooks/asaas/authorize
   *
   * Documentação: https://docs.asaas.com/docs/mecanismo-para-validacao-de-saque-via-webhooks
   */
  async authorizeTransfer(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const webhookData = req.body;

      logger.info('Asaas authorization webhook received', {
        event: webhookData.event,
        transfer_id: webhookData.transfer?.id,
        value: webhookData.transfer?.value,
      });

      // Dados da transferência enviados pelo Asaas
      const {
        id,
        value,
        pixAddressKey,
      } = webhookData.transfer || {};

      // Validações customizadas
      let authorized = true;
      let denialReason = '';

      // 1. Verificar valor mínimo e máximo
      if (value < 1.00) {
        authorized = false;
        denialReason = 'Valor abaixo do mínimo permitido';
      }

      if (value > 1000.00) {
        authorized = false;
        denialReason = 'Valor acima do máximo permitido';
      }

      // 2. Verificar chave PIX em lista negra (exemplo)
      const blacklistedKeys = ['spam@exemplo.com', 'fraude@test.com'];
      if (pixAddressKey && blacklistedKeys.includes(pixAddressKey)) {
        authorized = false;
        denialReason = 'Chave PIX bloqueada';
      }

      // 3. Verificar limite diário (exemplo - implemente conforme necessário)
      // const dailyTotal = await this.getDailyTotal();
      // if (dailyTotal + value > 5000.00) {
      //   authorized = false;
      //   denialReason = 'Limite diário excedido';
      // }

      // 4. Validações de horário (exemplo - apenas em horário comercial)
      // const now = new Date();
      // const hour = now.getHours();
      // if (hour < 8 || hour > 18) {
      //   authorized = false;
      //   denialReason = 'Transferências permitidas apenas das 8h às 18h';
      // }

      logger.info('Transfer authorization decision', {
        transfer_id: id,
        authorized,
        denialReason: denialReason || 'N/A',
      });

      // Responder ao Asaas
      if (authorized) {
        res.status(200).json({
          authorized: true,
        });
      } else {
        res.status(200).json({
          authorized: false,
          denialReason: denialReason,
        });
      }
    } catch (error) {
      logger.error('Error processing authorization webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Em caso de erro, negar por segurança
      res.status(200).json({
        authorized: false,
        denialReason: 'Erro interno ao validar transferência',
      });
    }
  }

  /**
   * Webhook de notificação de transferência (status)
   * POST /api/webhooks/asaas/notification
   */
  async handleTransferNotification(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const webhookData = req.body;

      logger.info('Asaas notification webhook received', {
        event: webhookData.event,
        transfer: webhookData.transfer,
      });

      const {
        id,
        status,
      } = webhookData.transfer || {};

      // Atualizar status da transação local
      // Aqui você pode buscar a transação pelo ID do Asaas e atualizar
      const transactions = await transactionStore.getAll();
      const transaction = transactions.find(
        t => t.provider_transaction_id === id
      );

      if (transaction) {
        await transactionStore.update(transaction.reference_id, {
          status: this.normalizeStatus(status),
        });

        logger.info('Transaction status updated', {
          reference_id: transaction.reference_id,
          new_status: status,
        });
      }

      // Sempre retornar 200 OK para o Asaas
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Error processing notification webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Mesmo com erro, retornar 200 para não causar reenvios
      res.status(200).json({ received: true });
    }
  }

  /**
   * Normaliza status do Asaas
   */
  private normalizeStatus(asaasStatus: string): 'pending' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
      'PENDING': 'pending',
      'BANK_PROCESSING': 'pending',
      'DONE': 'completed',
      'CANCELLED': 'failed',
      'FAILED': 'failed',
    };

    return statusMap[asaasStatus] || 'pending';
  }

  /**
   * Exemplo: Calcular total de transferências do dia
   * Implemente conforme sua necessidade
   * 
   * @deprecated Método não utilizado atualmente
   */
  // private async getDailyTotal(): Promise<number> {
  //   const transactions = await transactionStore.getAll();
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const dailyTransactions = transactions.filter(
  //     t => t.created_at >= today && t.status === 'completed'
  //   );

  //   return dailyTransactions.reduce((sum, t) => sum + t.valor, 0);
  // }
}

export const webhookController = new WebhookController();
