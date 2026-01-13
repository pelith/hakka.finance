import { formatUnits } from 'viem';
import { BigNumber } from './bignumber';

export function unstakeReceivedAmount(
  withdrawAmount: string,
  vault?: any,
): string | undefined {
  if (!(vault?.wAmount && vault.hakkaAmount && withdrawAmount)) {
    return undefined;
  }

  const totalSHakkaAmount = BigNumber(formatUnits(vault.wAmount, 18));
  const burnSHakkaAmount = BigNumber(withdrawAmount);
  if (burnSHakkaAmount.gt(totalSHakkaAmount)) {
    return undefined;
  }
  const receivedHakkaAmount = burnSHakkaAmount
    .div(totalSHakkaAmount)
    .multipliedBy(formatUnits(vault.hakkaAmount, 18));
  return receivedHakkaAmount.toFixed(4);
}
