/** @jsxImportSource theme-ui */

import { useEffect, useMemo } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import { getEtherscanLink, shortenTxId } from '../../utils';
import { TransactionState } from '../../constants';
import STAKING_ABI from 'src/constants/abis/shakka';
export default function useHakkaRestake(
  stakeAddress: string,
  index: number,
  amountParsed: bigint,
  sec: number,
): [TransactionState, () => Promise<void>] {
  const { chainId } = useWeb3React();

  const {
    writeContractAsync,
    data,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isSuccess: isWaitForSuccess,
    isError: isWaitForError,
    error: waitForError,
  } = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: isWriteSuccess,
    },
  });

  const restakeState: TransactionState = useMemo(() => {
    if (!stakeAddress) return TransactionState.UNKNOWN;
    if (isWriteSuccess) return TransactionState.PENDING;
    if (isWaitForSuccess) return TransactionState.SUCCESS;
    if (isWriteError || isWaitForError) return TransactionState.ERROR;
    return TransactionState.UNKNOWN;
  }, [
    isWriteSuccess,
    isWaitForSuccess,
    isWriteError,
    isWaitForError,
    stakeAddress,
  ]);

  async function restake() {
    if (Number.isNaN(+index)) {
      console.error('no index');
      return;
    }

    const txHash = await writeContractAsync({
      address: stakeAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'restake',
      args: [BigInt(index), amountParsed, BigInt(sec)],
    });

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
  }

  useEffect(() => {
    if (!isWaitForError && !isWriteError) return;
    if (isWriteError) {
      toast.error(<div>{writeError?.message}</div>, { containerId: 'error' });
    }

    if (isWaitForError) {
      toast.error(<div>{waitForError?.message}</div>, { containerId: 'error' });
    }
  }, [isWaitForError, isWriteError, waitForError, writeError]);

  useEffect(() => {
    reset();
  }, [index, reset]);

  return [restakeState, restake];
}
