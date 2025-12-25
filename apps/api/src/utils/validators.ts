import { config } from '../config/env';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validatePixKey = (pixKey: string): boolean => {
  if (!pixKey || typeof pixKey !== 'string') {
    throw new ValidationError('Chave PIX é obrigatória');
  }

  const trimmedKey = pixKey.trim();

  // CPF: 11 dígitos
  const cpfRegex = /^\d{11}$/;
  // CNPJ: 14 dígitos
  const cnpjRegex = /^\d{14}$/;
  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Telefone: +55DDNNNNNNNNN
  const phoneRegex = /^\+55\d{10,11}$/;
  // Chave aleatória: UUID format
  const randomKeyRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const isValid =
    cpfRegex.test(trimmedKey) ||
    cnpjRegex.test(trimmedKey) ||
    emailRegex.test(trimmedKey) ||
    phoneRegex.test(trimmedKey) ||
    randomKeyRegex.test(trimmedKey);

  if (!isValid) {
    throw new ValidationError(
      'Chave PIX inválida. Deve ser CPF, CNPJ, e-mail, telefone ou chave aleatória'
    );
  }

  return true;
};

export const validateAmount = (amount: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new ValidationError('Valor deve ser um número válido');
  }

  if (amount < config.limits.minPixValue) {
    throw new ValidationError(
      `Valor mínimo permitido é R$ ${config.limits.minPixValue.toFixed(2)}`
    );
  }

  if (amount > config.limits.maxPixValue) {
    throw new ValidationError(
      `Valor máximo permitido é R$ ${config.limits.maxPixValue.toFixed(2)}`
    );
  }

  // Verificar se tem no máximo 2 casas decimais
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    throw new ValidationError('Valor deve ter no máximo 2 casas decimais');
  }

  return true;
};

export const sanitizeDescription = (description?: string): string => {
  if (!description) return '';

  // Remove caracteres especiais perigosos e limita tamanho
  return description
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 200);
};
