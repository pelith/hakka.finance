 /** @jsxImportSource theme-ui */

import { useCallback, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';

import { getEtherscanLink, shortenTxId } from '../../utils';
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import type { ChainId } from 'src/constants';
import STAKING_ABI from 'src/constants/abis/shakka';

export enum StakeState {
  UNKNOWN,
  PENDING,
}

export function useHakkaStake(
  stakeAddress: string,
  spender: string,
  amountParsedRaw: bigint,
  lockSec: number,
): [StakeState, () => Promise<void>] {
  const { chainId } = useWeb3React();
  const publicClient = usePublicClient({chainId: chainId as ChainId})
  const {writeContractAsync, data, isPending: isWritePending, isSuccess: isWriteSuccess, isError: isWriteError, error: writeError, reset,} = useWriteContract()
  const { isLoading: isWaitForLoading } = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: isWriteSuccess,
    },
  })

  const stakeState: StakeState = useMemo(() => {
    if (isWritePending || isWaitForLoading) return StakeState.PENDING;
    return StakeState.UNKNOWN;
  }, [isWritePending, isWaitForLoading]);

  const stake = useCallback(async (): Promise<void> => {
    if (!spender) {
      console.error('no spender');
      return;
    }

    try {
      const estimatedGas = await publicClient.estimateContractGas({
        address: stakeAddress as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [spender as `0x${string}`, BigInt(amountParsedRaw.toString()), BigInt(lockSec)],
      })

      const increaseGas = estimatedGas * 15000n / 10000n;
      const txHash = await writeContractAsync({
        address: stakeAddress as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [spender as `0x${string}`, BigInt(amountParsedRaw.toString()), BigInt(lockSec)],
        gas: increaseGas
      })
      toast(
        <a
          target='_blank'
          href={getEtherscanLink(chainId ?? 1, txHash, 'transaction')}
          rel='noreferrer noopener'
          sx={{ textDecoration: 'none', color: '#253e47' }}
        >
          {shortenTxId(txHash)} <ExternalLink size={16} />
        </a>,
        { containerId: 'tx' },
      );
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(<div>{err.message}</div>, { containerId: 'error' });
      }
    } finally {
      reset();
    }
  }, [spender, amountParsedRaw, lockSec]);

  return [stakeState, stake];
}
