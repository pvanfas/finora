import { CURRENCY_SYMBOL } from '@/constants/finance';

export interface FormatCurrencyOptions {
  showSign?: boolean;
  decimals?: number;
  currencySymbol?: string;
}

/**
 * Formats a monetary number in standard Indian Numbering system (e.g. ₹1,23,456 or ₹7,452)
 */
export function formatINR(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    showSign = false,
    decimals = 0,
    currencySymbol = CURRENCY_SYMBOL,
  } = options;

  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (amount < 0) {
    return `-${currencySymbol}${formattedNumber}`;
  }

  if (showSign && amount > 0) {
    return `+${currencySymbol}${formattedNumber}`;
  }

  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Formats percentage number
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Formats short notation for chart axes (e.g. ₹8k, ₹6k, ₹0k)
 */
export function formatAxisK(amount: number, symbol = CURRENCY_SYMBOL): string {
  const thousands = Math.round(amount / 1000);
  return `${symbol}${thousands}k`;
}
