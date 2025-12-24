import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { validatePixKey, validateAmount, sanitizeDescription } from '../utils/validators';
import { pagBankService } from '../services/pagbankService';
import { transactionStore } from '../utils/transactionStore';
import { PixPayoutRequest, ApiResponse, TransactionLog } from '../types';

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
      const existingTransaction = await transactionStore.findByReferenceId(referenceId);
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
      const transaction: TransactionLog = {
        id: uuidv4(),
        reference_id: referenceId,
        chave_pix,
        valor: parseFloat(valor.toString()),
        status: 'pending',
        descricao: sanitizedDescription,
        created_at: new Date(),
      };

      await transactionStore.save(transaction);

      // Preparar dados para PagBank
      const transferData = {
        reference_id: referenceId,
        amount: {
          value: Math.round(parseFloat(valor.toString()) * 100), // Converter para centavos
        },
        destination: {
          type: 'PIX',
          pix_key: chave_pix,
        },
        description: sanitizedDescription || 'Transferência PIX',
      };

      // Enviar para PagBank
      const pagBankResponse = await pagBankService.createPixTransfer(transferData);

      // Atualizar transação com sucesso
      await transactionStore.update(referenceId, {
        status: 'completed',
        pagbank_transaction_id: pagBankResponse.id,
      });

      logger.info('Payout completed successfully', {
        reference_id: referenceId,
        pagbank_id: pagBankResponse.id,
      });

      res.status(201).json({
        success: true,
        data: {
          message: 'PIX enviado com sucesso',
          transaction: {
            id: transaction.id,
            reference_id: referenceId,
            pagbank_transaction_id: pagBankResponse.id,
            status: pagBankResponse.status,
            chave_pix,
            valor: parseFloat(valor.toString()),
            created_at: pagBankResponse.created_at,
          },
        },
      } as ApiResponse);
    } catch (error) {
      // Tentar atualizar status da transação para failed
      const { id_transacao } = req.body as PixPayoutRequest;
      if (id_transacao) {
        await transactionStore.update(id_transacao, {
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

      const transaction = await transactionStore.findByReferenceId(referenceId);

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

      // Se tiver ID do PagBank, buscar status atualizado
      if (transaction.pagbank_transaction_id) {
        try {
          const pagBankStatus = await pagBankService.getTransferStatus(
            transaction.pagbank_transaction_id
          );

          // Atualizar status local se necessário
          if (pagBankStatus.status !== transaction.status) {
            await transactionStore.update(referenceId, {
              status: pagBankStatus.status as any,
            });
            transaction.status = pagBankStatus.status as any;
          }
        } catch (error) {
          logger.warn('Could not retrieve PagBank status', {
            error: error instanceof Error ? error.message : 'Unknown error',
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transactions = await transactionStore.getAll();

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
