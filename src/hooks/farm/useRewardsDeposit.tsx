import { useCallback, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { getEtherscanLink, shortenTxId } from '../../utils';
import { parseUnits } from 'viem';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import { REWARD_POOLS } from '../../constants/rewards';
import type { ChainId } from '@/constants';
import {
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import STAKING_REWARDS_ABI from '@/constants/abis/staking_rewards';
import useAppWriteContract from '../contracts/useAppWriteContract';

export enum DepositState {
  UNKNOWN,
  PENDING,
}

export function useRewardsDeposit(
  depositAddress?: string,
  amount?: string,
  decimal?: number,
  spender?: string,
): [DepositState, () => Promise<void>] {
  const { chainId } = useWeb3React();
  const publicClient = usePublicClient({ chainId: chainId as ChainId })!;
  const {
    writeContractAsync,
    data,
    isPending: isWritePending,
    isSuccess: isWriteSuccess,
    reset,
  } = useAppWriteContract(chainId as ChainId);
  const { isLoading: isWaitForLoading } = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: isWriteSuccess,
    },
  });

  const depositState: DepositState = useMemo(() => {
    if (!spender) return DepositState.UNKNOWN;

    return isWritePending && isWaitForLoading
      ? DepositState.PENDING
      : DepositState.UNKNOWN;
  }, [isWritePending, isWaitForLoading, spender]);

  const deposit = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (REWARD_POOLS[depositAddress ?? '']?.chain !== chainId) {
      toast.error(<div>Wrong Network</div>, { containerId: 'error' });
      return;
    }

    try {
      const amountParsed = parseUnits(amount || '0', decimal ?? 18);
      const txHash = await writeContractAsync({
        address: depositAddress as `0x${string}`,
        abi: STAKING_REWARDS_ABI,
        functionName: 'stake',
        args: [amountParsed],
        chainId: chainId as ChainId,
      });

      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(<div>{err.message}</div>, { containerId: 'error' });
      }
    } finally {
      reset();
    }
  }, [
    amount,
    decimal,
    spender,
    chainId,
    depositAddress,
    writeContractAsync,
    publicClient,
    reset,
  ]);

  return [depositState, deposit];
}
