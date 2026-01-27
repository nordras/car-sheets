const MAX_DISCOUNT_PERCENT = 15; // Maximum allowed discount percentage

export function calculateMarketValue(basePrice: number, optional: number, painting: number): number {
  return basePrice + optional + painting;
}

export function calculateEconomy(marketValue: number, discountPercent: number): number {
  return (marketValue * discountPercent) / 100;
}

export function calculateFinalValue(marketValue: number, economy: number): number {
  return marketValue - economy;
}

export function validateDiscount(discountPercent: number): {
  isValid: boolean;
  isWarning: boolean;
  message: string;
} {
  if (discountPercent > MAX_DISCOUNT_PERCENT) {
    return {
      isValid: false,
      isWarning: false,
      message: `Desconto máximo permitido é ${MAX_DISCOUNT_PERCENT}%`,
    };
  }
  
  if (discountPercent > MAX_DISCOUNT_PERCENT - 3) {
    return {
      isValid: true,
      isWarning: true,
      message: `Atenção: desconto próximo do limite (${MAX_DISCOUNT_PERCENT}%)`,
    };
  }
  
  return {
    isValid: true,
    isWarning: false,
    message: '',
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
