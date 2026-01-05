/** @jsxImportSource theme-ui */

import { useState, useCallback, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { getEtherscanLink, shortenTxId } from '../../utils';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import useAppWriteContract from '../contracts/useAppWriteContract';
import type { ChainId } from 'src/constants';
import { useWaitForTransactionReceipt } from 'wagmi';
import VESTING_ABI from 'src/constants/abis/vesting';
import { isAddress } from 'viem';

export enum VestingState {
  UNKNOWN,
  PENDING,
}

export function useVestingWithdraw(
  vestingAddress?: string,
  spender?: string,
): [VestingState, () => Promise<void>] {
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

  const vestingState: VestingState = useMemo(() => {
    if (!spender) return VestingState.UNKNOWN;

    return isPending && isWaitForLoading
      ? VestingState.PENDING
      : VestingState.UNKNOWN;
  }, [isPending, isWaitForLoading, spender]);

  const withdraw = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (!vestingAddress) return;
    if (!isAddress(vestingAddress)) return;

    await writeContractAsync({
      address: vestingAddress,
      abi: VESTING_ABI,
      functionName: 'withdraw',
      args: [],
    });
  }, [spender, vestingAddress, writeContractAsync]);

  return [vestingState, withdraw];
}
