import { Request, Response, NextFunction } from 'express';
import { giftService } from '../services/giftService';
import { ValidationError } from '../utils/validators';
import { ApiResponse } from '../types';

class GiftController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, message, pin, expires_at, provider, description } = req.body;
      const { gift, pin: plainPin } = await giftService.createGift({
        amount,
        message,
        pin,
        expires_at: expires_at ? new Date(expires_at) : undefined,
        provider,
        description,
      });

      res.status(201).json({
        success: true,
        data: {
          gift: {
            reference_id: gift.reference_id,
            amount: gift.amount,
            status: gift.status,
            message: gift.message,
            expires_at: gift.expires_at,
            created_at: gift.created_at,
          },
          pin: plainPin, // retornar no payload de criação (não armazenar em logs)
        },
      } as ApiResponse);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message },
        } as ApiResponse);
        return;
      }
      next(error);
    }
  }

  async redeem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { referenceId } = req.params;
      const { pin, pix_key, description } = req.body;
      const result = await giftService.redeemGift({
        reference_id: referenceId,
        pin,
        pix_key,
        description,
      });

      res.status(200).json({
        success: true,
        data: {
          provider: result.provider,
          transfer: result.transfer,
        },
      } as ApiResponse);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.message },
        } as ApiResponse);
        return;
      }
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { referenceId } = req.params;
      const status = await giftService.getGiftStatus(referenceId);

      res.status(200).json({
        success: true,
        data: status,
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}

export const giftController = new GiftController();
