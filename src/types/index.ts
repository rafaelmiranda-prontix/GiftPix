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

export interface TransactionLog {
  id: string;
  reference_id: string;
  chave_pix: string;
  valor: number;
  status: 'pending' | 'completed' | 'failed';
  descricao?: string;
  created_at: Date;
  pagbank_transaction_id?: string;
  error_message?: string;
}

export interface QRCodeGenerationRequest {
  chave_pix: string;
  valor: number;
  descricao?: string;
}
