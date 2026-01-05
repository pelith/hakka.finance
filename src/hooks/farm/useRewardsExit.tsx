/** @jsxImportSource theme-ui */

import { useCallback, useEffect, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { getEtherscanLink, shortenTxId } from '../../utils';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import { REWARD_POOLS } from '../../constants/rewards';
import { isAddress, type Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import STAKING_REWARDS_ABI from 'src/constants/abis/staking_rewards';
import type { ChainId } from 'src/constants';

export enum ExitState {
  UNKNOWN,
  PENDING,
}

export function useRewardsExit(
  exitAddress?: string,
  spender?: string,
): [ExitState, () => Promise<void>] {
  const { chainId } = useWeb3React();
  const wagmiChainId = (chainId as ChainId | undefined) ?? 1;

  const { writeContractAsync, data, isPending, isError, reset } =
    useWriteContract({
      mutation: {
        onSuccess(hash) {
          toast(
            <a
              target='_blank'
              href={getEtherscanLink(wagmiChainId, hash, 'transaction')}
              rel='noreferrer noopener'
              sx={{ textDecoration: 'none', color: '#253e47' }}
            >
              {shortenTxId(hash)} <ExternalLink size={16} />
            </a>,
            { containerId: 'tx' },
          );
        },
        onError(error) {
          console.error(error);
          toast.error(<div>{error.message}</div>, { containerId: 'error' });
        },
      },
    });

  const {
    isLoading,
    isSuccess,
    isError: isWaitError,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash: data,
    chainId: wagmiChainId,
    query: {
      enabled: !!data,
    },
  });

  const exitState: ExitState = useMemo(() => {
    if (!spender) return ExitState.UNKNOWN;
    return isPending && isLoading ? ExitState.PENDING : ExitState.UNKNOWN;
  }, [spender, isPending, isLoading]);

  const exit = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    if (!exitAddress || !isAddress(exitAddress)) {
      console.error('invalid exit address');
      return;
    }

    const pool = REWARD_POOLS[exitAddress];
    if (pool?.chain && chainId && pool.chain !== chainId) {
      toast.error(<div>Wrong Network</div>, { containerId: 'error' });
      return;
    }

    await writeContractAsync({
      address: exitAddress as Address,
      chainId: wagmiChainId,
      abi: STAKING_REWARDS_ABI,
      functionName: 'exit',
      args: [],
    });
  }, [spender, exitAddress, chainId, wagmiChainId, writeContractAsync]);

  useEffect(() => {
    if (!isWaitError) return;
    toast.error(<div>{waitError?.message}</div>, { containerId: 'error' });
  }, [isWaitError, waitError]);

  useEffect(() => {
    if (!isSuccess && !isWaitError && !isError) return;
    reset();
  }, [isSuccess, isWaitError, isError, reset]);

  return [exitState, exit];
}
