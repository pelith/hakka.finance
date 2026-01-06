import { type ChainId, ETHADDRESS } from '@/constants';
import { useTokenInfoAndBalance } from '@/hooks/contracts/token/useTokenInfoAndBalance';
import { formatUnits, isAddressEqual, type Address } from 'viem';
import { useBalance } from 'wagmi';
import RewardListItem from '../../components/VaultPage/RewardListItem/index';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef } from 'react';
import { formatCommonNumber } from '@/utils/formatCommonNumbers';
interface RewardListItemContainerProps {
  tokenAddress: Address;
  guildBankAddress: Address;
  inputAmount: string;
  isDefaultToken?: boolean;
  chainId: ChainId;
  checked?: boolean;
  onChange: () => void;
  onDelete?: () => void;

  hakkaTotalSupply: string;

  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;

  onRewardCalculated: (receiveAmount: BigNumber) => void;
}
export default function RewardListItemContainer({
  tokenAddress,
  guildBankAddress,
  inputAmount,
  hakkaTotalSupply,
  isDefaultToken = false,
  chainId,
  tokenSymbol,
  checked = false,
  onChange,
  onDelete,
  onRewardCalculated,
}: RewardListItemContainerProps) {
  const isEthAddress = isAddressEqual(tokenAddress, ETHADDRESS);

  const { data: guildEthBalance } = useBalance({
    address: tokenAddress,
    chainId: chainId as ChainId,
    query: {
      enabled: isEthAddress,
    },
  });

  const { data: guildTokenBalance } = useTokenInfoAndBalance(
    guildBankAddress,
    tokenAddress,
    chainId,
  );

  let bankBalance: string;
  if (isEthAddress) {
    bankBalance = formatUnits(guildEthBalance?.value ?? 0n, 18);
  } else {
    bankBalance = guildTokenBalance?.balance ?? '0';
  }

  const receiveAmount = useMemo(() => {
    const amountBigNumber = new BigNumber(inputAmount);
    const hakkaTotalSupplyBigNumber = new BigNumber(hakkaTotalSupply);

    if (hakkaTotalSupplyBigNumber.lt(amountBigNumber)) {
      return new BigNumber(0);
    }

    const rewardAmount = amountBigNumber
      .div(hakkaTotalSupplyBigNumber)
      .multipliedBy(bankBalance);
    if (rewardAmount.isNaN()) {
      return new BigNumber(0);
    }
    return rewardAmount;
  }, [guildEthBalance?.value, guildTokenBalance?.balance, isEthAddress]);

  const rewardCalculatedCallbackRef = useRef(onRewardCalculated);
  rewardCalculatedCallbackRef.current = onRewardCalculated;

  useEffect(() => {
    rewardCalculatedCallbackRef.current?.(receiveAmount);
  }, [receiveAmount]);

  return (
    <RewardListItem
      onDelete={onDelete ?? (() => {})}
      onChange={onChange}
      checked={checked}
      tokenName={tokenSymbol ?? ''}
      isDefaultToken={isDefaultToken}
      receiveAmount={receiveAmount}
      bankBalance={bankBalance}
    />
  );
}
