export interface PixPayoutRequest {
  chave_pix: string;
  valor: number;
  descricao?: string;
  id_transacao?: string;
}

export interface PagBankTransferRequest {
  reference_id: string;
  amount: {
    value: number;
  };
  destination: {
    type: string;
    pix_key: string;
  };
  description?: string;
}

export interface PagBankTransferResponse {
  id: string;
  reference_id: string;
  status: string;
  amount: {
    value: number;
  };
  created_at: string;
  destination: {
    type: string;
    pix_key: string;
  };
  description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AsaasTransferRequest {
  value: number;
  pixAddressKey: string;
  pixAddressKeyType?: string;
  description?: string;
  scheduleDate?: string;
}

export interface AsaasTransferResponse {
  id: string;
  dateCreated: string;
  value: number;
  netValue: number;
  transferFee: number;
  status: string;
  effectiveDate: string;
  type: string;
  pixAddressKey?: string;
  description?: string;
}

export interface TransactionLog {
  id: string;
  reference_id: string;
  chave_pix: string;
  valor: number;
  status: 'pending' | 'completed' | 'failed';
  descricao?: string;
  created_at: Date;
  provider_transaction_id?: string;
  provider: 'asaas' | 'pagbank';
  error_message?: string;
}

export interface QRCodeGenerationRequest {
  chave_pix: string;
  valor: number;
  descricao?: string;
}

export type ProviderName = 'asaas' | 'pagbank';

export type GiftStatus = 'active' | 'redeemed' | 'expired';
export interface Gift {
  id: string;
  reference_id: string;
  amount: number;
  status: GiftStatus;
  message?: string;
  pin_hash?: string;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type RedemptionStatus = 'pending' | 'completed' | 'failed';
export interface GiftRedemption {
  id: string;
  gift_id: string;
  pix_key: string;
  status: RedemptionStatus;
  provider: ProviderName;
  provider_ref?: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';
export interface Payment {
  id: string;
  gift_id: string;
  provider: ProviderName;
  provider_ref?: string;
  amount: number;
  status: PaymentStatus;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export type ProviderStatus = 'pending' | 'completed' | 'failed';

export interface PixTransferData {
  pix_key: string;
  amount: number;
  description?: string;
  reference_id?: string;
}

export interface ProviderTransferResponse {
  id: string;
  reference_id?: string;
  status: ProviderStatus;
  amount: number;
  created_at: string;
  pix_key: string;
  description?: string;
}

// Provider interface for abstraction
export interface PaymentProvider {
  createPixTransfer(data: PixTransferData): Promise<ProviderTransferResponse>;
  getTransferStatus(transferId: string): Promise<ProviderTransferResponse>;
}
