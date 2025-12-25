export type GiftStatus = 'ACTIVE' | 'REDEEMED' | 'EXPIRED';

export interface GiftSummary {
  id: string;
  status: GiftStatus;
  value: number;
  expiresAt?: string;
}
