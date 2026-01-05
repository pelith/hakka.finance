import BigNumber from 'bignumber.js';

export function createBigNumberSort<T = BigNumber.Value>(
  sorter: 'asc' | 'desc',
): (a: T, b: T) => number;
export function createBigNumberSort<T = Record<string, BigNumber.Value>>(
  sorter: 'asc' | 'desc',
  key: keyof T,
): (a: T, b: T) => number;
export function createBigNumberSort<
  T = BigNumber.Value | Record<string, BigNumber.Value>,
>(sorter: 'asc' | 'desc', key?: keyof T) {
  return (a: T, b: T) => {
    if (!key)
      return BigNumber(a as BigNumber.Value)
        .minus(BigNumber(b as BigNumber.Value))
        .toNumber();
    if (sorter === 'desc') [a, b] = [b, a];
    return BigNumber(a[key] as BigNumber.Value)
      .minus(BigNumber(b[key] as BigNumber.Value))
      .toNumber();
  };
}
