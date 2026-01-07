import { useState, useCallback, useMemo, useEffect } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { useTokenAllowance } from './contracts/token/useTokenAllowance';
import { useActiveWeb3React } from './web3Manager';
import { toast } from 'react-toastify';
import isZero from '../utils/isZero';
import { erc20Abi, formatUnits, isAddress, type Address, } from 'viem';
import { useTokenInfoAndBalance } from './contracts/token/useTokenInfoAndBalance';
import BigNumber from 'bignumber.js';
import type { ChainId } from '@/constants';
import {
  usePublicClient,
  useWaitForTransactionReceipt,
} from 'wagmi';
import useAppWriteContract from './contracts/useAppWriteContract';

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export function useTokenApprove(
  tokenToApprove: string,
  spender: string,
  requiredAllowance: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React();
  const { chainId } = useWeb3React();
  const { data: currentAllowance = 0n, refetch: refetchCurrentAllowance } = useTokenAllowance(
    account as string,
    tokenToApprove,
    spender,
    chainId as ChainId,
  );
  const { data: tokenInfoAndBalance } = useTokenInfoAndBalance(
    account as string,
    tokenToApprove,
  );

  const {
    writeContractAsync,
    data,
    reset: resetWriteContract,
    isSuccess: isWriteSuccess,
    isPending: isWritePending,
  } = useAppWriteContract(chainId as ChainId);

  const { isLoading: isWaitForLoading, isSuccess: isWaitForSuccess } = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data && isWriteSuccess,
    },
  });

  const approvalState: ApprovalState = useMemo(() => {
    if (!tokenToApprove || !spender) return ApprovalState.UNKNOWN;
    if (currentAllowance === undefined) return ApprovalState.UNKNOWN;

    const currentAllowanceAmount = new BigNumber(
      formatUnits(currentAllowance, tokenInfoAndBalance?.decimals ?? 18),
    );

    return currentAllowanceAmount.lt(requiredAllowance) ||
      currentAllowanceAmount.eq(0)
      ? isWritePending || isWaitForLoading
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [isWritePending, isWaitForLoading, tokenToApprove, currentAllowance, spender, requiredAllowance, tokenInfoAndBalance?.balance]);

  useEffect(() => {
    if (isWaitForSuccess) {
      refetchCurrentAllowance();
    }
  }, [isWaitForSuccess, refetchCurrentAllowance]);

  const approve = useCallback(async (): Promise<void> => {
    const MAX_UINT256 = 2n ** 256n - 1n;
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!tokenToApprove) {
      console.error('no token');
      return;
    }

    if (!isAddress(tokenToApprove)) {
      console.error('invalid token address');
      return;
    }

    if (!spender || isZero(spender)) {
      console.error('no spender');
      return;
    }

    console.log('writing contract');
    try {
      await writeContractAsync({
        address: tokenToApprove as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as Address, MAX_UINT256],
      });
    } finally {
      resetWriteContract();
    }
    
  }, [approvalState, tokenToApprove, writeContractAsync, spender]);

  return [approvalState, approve];
}
