import BigNumber from 'bignumber.js';
import { getCommonDecimal } from './formatCommonNumbers';

export { BigNumber };

export function configureBigNumber() {
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
}

const TEN = new BigNumber(10);

export function powerOf10(n: number) {
  return TEN.pow(n);
}

const BIGNUMBER_ZERO = new BigNumber(0);

/**
 * Safely parse a value to a BigNumber instance. If the value
 * cannot be parsed (throws or NaN), return the fallback value.
 */
export function parseToBigNumber(
  value: BigNumber.Value,
  fallback: BigNumber = BIGNUMBER_ZERO,
): BigNumber {
  try {
    // fix has more than 15 significant digits
    const ret = new BigNumber(`${value}`);
    if (!ret.isNaN()) return ret;
  } catch (_e) {
    /* fallthrough */
  }
  return fallback;
}

export function bigNumberToBigInt(bn: BigNumber) {
  return BigInt(bn.integerValue().toFixed());
}
