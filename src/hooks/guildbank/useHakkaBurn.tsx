
import { useState, useCallback, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { toast } from 'react-toastify';
import useAppWriteContract from '../contracts/useAppWriteContract';
import type { ChainId } from '@/constants';
import { useWaitForTransactionReceipt } from 'wagmi';
import BURNER_ABI from '@/constants/abis/burner';
import { isAddress, type Address } from 'viem';

export enum BurnState {
  UNKNOWN,
  PENDING,
}

export function useHakkaBurn(
  burnAddress?: string,
  spender?: string,
  amountParsed?: bigint,
  pickedRewardTokensAddress?: string[],
): [BurnState, () => Promise<void>] {
  const { chainId } = useWeb3React();

  const { writeContractAsync, data, isPending } = useAppWriteContract(
    chainId as ChainId,
  );
  const { isLoading: isWaitForLoading } = useWaitForTransactionReceipt({
    hash: data,
    chainId: chainId as ChainId,
    query: {
      enabled: !!data,
    },
  });
  const burnState: BurnState = useMemo(() => {
    if (!spender) return BurnState.UNKNOWN;

    return isPending && isWaitForLoading
      ? BurnState.PENDING
      : BurnState.UNKNOWN;
  }, [spender, isPending, isWaitForLoading]);

  const burn = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (!burnAddress) return;

    if (!isAddress(burnAddress)) {
      toast.error(<div>Invalid burn address</div>, { containerId: 'error' });
      return;
    }

    await writeContractAsync({
      address: burnAddress,
      abi: BURNER_ABI,
      functionName: 'ragequit',
      args: [pickedRewardTokensAddress as Address[], amountParsed!],
    });
  }, [spender, amountParsed, pickedRewardTokensAddress]);

  return [burnState, burn];
}
