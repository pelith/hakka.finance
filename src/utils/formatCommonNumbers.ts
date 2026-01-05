import { BigNumber } from 'bignumber.js';
import { parseToBigNumber } from './bignumber';

export function getCommonDecimal(amount: BigNumber) {
  if (amount.lt(0.01)) return 4;
  if (amount.lt(1)) return 4;
  if (amount.lt(10)) return 4;
  if (amount.lt(100)) return 4;
  if (amount.lt(1000)) return 3;
  return 2;
}

function formatNumberWithCommas(n: string) {
  const parts = n.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.').replace(/\.?0+$/, ''); // trim zero
}

export function formatNumber(
  amount: BigNumber.Value | string | undefined,
  toFixedValue?: number,
) {
  const processAmount = BigNumber.isBigNumber(amount)
    ? amount
    : parseToBigNumber(amount ?? '');
  if (processAmount == null || processAmount.isNaN()) {
    return '-';
  }
  return typeof toFixedValue === 'number'
    ? formatNumberWithCommas(processAmount.toFixed(toFixedValue))
    : formatNumberWithCommas(processAmount.toFixed());
}

export function formatCommonNumber(
  amount: BigNumber.Value | string | number | undefined,
) {
  const processAmount = BigNumber.isBigNumber(amount)
    ? amount
    : parseToBigNumber(amount ?? '');
  if (processAmount.isNaN()) {
    return '-';
  }
  if (processAmount.isZero()) return '0';
  if (processAmount.lt(0.000001)) return '< 0.000001';
  return formatNumber(processAmount, getCommonDecimal(processAmount));
}

export function formatUsdValue(amount: BigNumber.Value | string | undefined) {
  const processAmount = BigNumber.isBigNumber(amount)
    ? amount
    : parseToBigNumber(amount ?? '');
  if (processAmount.isNaN()) {
    return '-';
  }
  if (processAmount.isZero()) return '0';
  if (processAmount.lt(0.01)) return '< 0.01';
  return formatNumber(processAmount, 2);
}

const percentageFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPercentageNumber(amount: number | string | undefined) {
  const processAmount =
    typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (processAmount == null || Number.isNaN(processAmount)) {
    return '-';
  }

  if (processAmount === 0) return '0';
  if (Math.abs(processAmount) < 0.01) {
    return processAmount < 0 ? '< -0.01' : '< 0.01';
  }
  if (processAmount < 0) return percentageFormatter.format(processAmount);
  if (processAmount > 1000000) return '> 1,000k';
  if (processAmount > 10000)
    return `${percentageFormatter.format(processAmount / 1000)}k`;

  return percentageFormatter.format(processAmount);
}

export function formatProtectedUsdValue(
  balance: BigNumber.Value,
  isHidden: boolean,
) {
  return isHidden ? '***' : formatUsdValue(balance);
}

/**
 * Formats a BigNumber to a human-readable string with suffixes (K, M, B, T)
 * @param value - The value to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted string (e.g., "1.15M", "1K", "1.23B")
 */
export function formatBigNumber(value: BigNumber.Value, decimals = 2): string {
  const bn = value instanceof BigNumber ? value : parseToBigNumber(`${value}`);
  const decimalsToUse = bn.abs().lt(1) ? getCommonDecimal(bn) : decimals;

  if (bn.isZero()) return '0';

  const suffixes = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  for (const { value: threshold, suffix } of suffixes) {
    if (bn.abs().gte(threshold)) {
      const formatted = bn.div(threshold).toFixed(decimalsToUse);
      // Remove trailing zeros and unnecessary decimal point
      const clean = formatted.replace(/\.?0+$/, '');
      return clean + suffix;
    }
  }

  return bn.toFixed(decimalsToUse);
}
