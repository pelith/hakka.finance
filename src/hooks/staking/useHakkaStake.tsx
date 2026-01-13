import { useCallback, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { toast } from 'react-toastify';

import {
  usePublicClient,
  useWalletClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import type { ChainId } from '@/constants';
import STAKING_ABI from '@/constants/abis/shakka';
import { encodeFunctionData } from 'viem';

export enum StakeState {
  UNKNOWN,
  PENDING,
}

export function useHakkaStake(
  stakeAddress: string,
  sender: string,
  amountParsedRaw: bigint,
  lockSec: number,
): [StakeState, () => Promise<void>] {
  const { chainId } = useWeb3React();
  const walletClient = useWalletClient({ chainId: chainId as ChainId })!;
  const publicClient = usePublicClient({ chainId: chainId as ChainId })!;

  const {
    writeContractAsync,
    data,
    isPending: isWritePending,
    isSuccess: isWriteSuccess,
    reset,
  } = useWriteContract();
  const { isLoading: isWaitForLoading } = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: isWriteSuccess,
    },
  });

  const stakeState: StakeState = useMemo(() => {
    if (isWritePending || isWaitForLoading) return StakeState.PENDING;
    return StakeState.UNKNOWN;
  }, [isWritePending, isWaitForLoading]);

  const stake = useCallback(async (): Promise<void> => {
    if (!sender) {
      console.error('no spender');
      return;
    }

    console.log('stake', {
      spender: sender,
      amountParsedRaw,
      lockSec,
      stakeAddress,
      chainId,
    });

    const encodedData = encodeFunctionData({
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [sender as `0x${string}`, amountParsedRaw, BigInt(lockSec)],
    });

    try {
      const estimatedGas = await publicClient.estimateGas({
        to: stakeAddress as `0x${string}`,
        data: encodedData,
        account: walletClient.data!.account,
      });

      const increaseGas = (estimatedGas * 15000n) / 10000n;
      const txHash = await writeContractAsync({
        address: stakeAddress as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [
          sender as `0x${string}`,
          BigInt(amountParsedRaw.toString()),
          BigInt(lockSec),
        ],
        gas: increaseGas,
      });
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Object) {
        if ('shortMessage' in err) {
          toast.error(<div>{err.shortMessage as string}</div>, {
            containerId: 'error',
          });
          return;
        }
        if (err instanceof Error) {
          toast.error(<div>{err.message}</div>, { containerId: 'error' });
        }
      }
    } finally {
      reset();
    }
  }, [
    sender,
    amountParsedRaw,
    lockSec,
    stakeAddress,
    chainId,
    publicClient,
    walletClient,
    writeContractAsync,
    reset,
  ]);

  return [stakeState, stake];
}
