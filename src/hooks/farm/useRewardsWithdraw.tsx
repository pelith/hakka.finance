
import { useCallback, useMemo } from 'react';
import { isAddress, parseUnits } from 'viem';
import { toast } from 'react-toastify';
import { REWARD_POOLS } from '../../constants/rewards';
import type { ChainId } from '@/constants';
import useAppWriteContract from '../contracts/useAppWriteContract';
import STAKING_REWARDS_ABI from '@/constants/abis/staking_rewards';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useActiveWeb3React } from '../useActiveWeb3React';

export enum WithdrawState {
  UNKNOWN,
  PENDING,
}

export function useRewardsWithdraw(
  withdrawAddress?: string,
  amount?: string,
  decimal?: number,
  spender?: string,
): [WithdrawState, () => Promise<void>] {
  const { chainId } = useActiveWeb3React();
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

  const withdrawState: WithdrawState = useMemo(() => {
    if (!spender) return WithdrawState.UNKNOWN;

    return isPending && isWaitForLoading
      ? WithdrawState.PENDING
      : WithdrawState.UNKNOWN;
  }, [isPending, isWaitForLoading, spender]);

  const withdraw = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (!withdrawAddress) return;

    if (!isAddress(withdrawAddress)) {
      toast.error(<div>Invalid withdraw address</div>, {
        containerId: 'error',
      });
      return;
    }

    if (REWARD_POOLS[withdrawAddress].chain !== chainId) {
      toast.error(<div>Wrong Network</div>, { containerId: 'error' });
      return;
    }
    const amountParsed = parseUnits(amount || '0', decimal ?? 18);
    await writeContractAsync({
      address: withdrawAddress,
      abi: STAKING_REWARDS_ABI,
      functionName: 'withdraw',
      args: [amountParsed],
    });
  }, [amount, decimal, spender, chainId, withdrawAddress, writeContractAsync]);

  return [withdrawState, withdraw];
}
