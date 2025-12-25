import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { validatePixKey, validateAmount, sanitizeDescription } from '../utils/validators';
import { providerFactory } from '../services/providerFactory';
import { PixPayoutRequest, ApiResponse, TransactionLog } from '../types';
import { config } from '../config/env';
import { transactionRepository } from '../repositories/transactionRepository';

export class PixPayoutController {
  /**
   * Processa requisição de payout PIX
   * POST /api/pix-payout
   */
  async createPayout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { chave_pix, valor, descricao, id_transacao } = req.body as PixPayoutRequest;

      // Validações
      validatePixKey(chave_pix);
      validateAmount(parseFloat(valor.toString()));

      const sanitizedDescription = sanitizeDescription(descricao);
      const referenceId = id_transacao || uuidv4();

      logger.info('Processing payout request', {
        reference_id: referenceId,
        chave_pix,
        valor,
      });

      // Verificar duplicata (idempotência)
      const existingTransaction = await transactionRepository.findByReferenceId(referenceId);
      if (existingTransaction) {
        logger.info('Duplicate transaction detected', { reference_id: referenceId });

        res.status(200).json({
          success: true,
          data: {
            message: 'Transação já processada',
            transaction: existingTransaction,
          },
        } as ApiResponse);
        return;
      }

      // Criar registro de transação
      const transaction: TransactionLog = await transactionRepository.create({
        reference_id: referenceId,
        chave_pix,
        valor: parseFloat(valor.toString()),
        status: 'pending',
        descricao: sanitizedDescription,
        provider: config.provider,
      });

      // Preparar dados para o provider
      const transferData = {
        pix_key: chave_pix,
        amount: parseFloat(valor.toString()),
        description: sanitizedDescription || 'Transferência PIX',
        reference_id: referenceId,
      };

      // Enviar para o provider configurado (Asaas ou PagBank)
      const provider = providerFactory.getProvider();
      const providerResponse = await provider.createPixTransfer(transferData);

      // Atualizar transação com sucesso
      await transactionRepository.update(referenceId, {
        status: 'completed',
        provider_transaction_id: providerResponse.id,
      });

      logger.info('Payout completed successfully', {
        reference_id: referenceId,
        provider: config.provider,
        provider_transaction_id: providerResponse.id,
      });

      res.status(201).json({
        success: true,
        data: {
          message: 'PIX enviado com sucesso',
          provider: config.provider,
          transaction: {
            id: transaction.id,
            reference_id: referenceId,
            provider_transaction_id: providerResponse.id,
            status: providerResponse.status,
            chave_pix,
            valor: parseFloat(valor.toString()),
            created_at: providerResponse.created_at,
          },
        },
      } as ApiResponse);
    } catch (error) {
      // Tentar atualizar status da transação para failed
      const { id_transacao } = req.body as PixPayoutRequest;
      if (id_transacao) {
        await transactionRepository.update(id_transacao, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      next(error);
    }
  }

  /**
   * Consulta status de uma transação
   * GET /api/pix-payout/:referenceId
   */
  async getPayoutStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { referenceId } = req.params;

      logger.info('Retrieving transaction status', { reference_id: referenceId });

      const transaction = await transactionRepository.findByReferenceId(referenceId);

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transação não encontrada',
          },
        } as ApiResponse);
        return;
      }

      // Se tiver ID do provider, buscar status atualizado
      if (transaction.provider_transaction_id) {
        try {
          const provider = providerFactory.getProviderByName(transaction.provider);
          const providerStatus = await provider.getTransferStatus(transaction.provider_transaction_id);

          // Atualizar status local se necessário
          if (providerStatus.status !== transaction.status) {
            await transactionRepository.update(referenceId, {
              status: providerStatus.status,
            });
            transaction.status = providerStatus.status;
          }
        } catch (error) {
          logger.warn('Could not retrieve provider status', {
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: transaction.provider,
          });
        }
      }

      res.status(200).json({
        success: true,
        data: transaction,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as transações (para debug/admin)
   * GET /api/pix-payout
   */
  async listPayouts(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transactions = await transactionRepository.getAll();

      res.status(200).json({
        success: true,
        data: {
          total: transactions.length,
          transactions,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const pixPayoutController = new PixPayoutController();
