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
}

export interface ApiResponse<T = any> {
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

// Provider interface for abstraction
export interface PaymentProvider {
  createPixTransfer(data: any): Promise<ProviderTransferResponse>;
  getTransferStatus(transferId: string): Promise<ProviderTransferResponse>;
}

export interface ProviderTransferResponse {
  id: string;
  reference_id?: string;
  status: string;
  amount: number;
  created_at: string;
  pix_key: string;
  description?: string;
}
