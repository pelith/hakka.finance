import { useMemo, useEffect } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { getEtherscanLink, shortenTxId } from '../../utils';
import { toast } from 'react-toastify';
import { ExternalLink } from 'react-feather';
import { TransactionState } from '../../constants';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import STAKING_V1_ABI from '@/constants/abis/shakka_v1';

export function useV1HakkaUnstake(
  unstakeAddress: string,
  spender: string,
  index: number,
  amountParsed: bigint,
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

  const unstakeState: TransactionState = useMemo(() => {
    if (!spender) return TransactionState.UNKNOWN;
    if (isWriteSuccess) return TransactionState.PENDING;
    if (isWaitForSuccess) return TransactionState.SUCCESS;
    if (isWriteError || isWaitForError) return TransactionState.ERROR;
    return TransactionState.UNKNOWN;
  }, [isWriteSuccess, isWaitForSuccess, isWriteError, isWaitForError, spender]);

  async function unstake() {
    const txHash = await writeContractAsync({
      address: unstakeAddress as `0x${string}`,
      abi: STAKING_V1_ABI,
      functionName: 'unstake',
      args: [spender as `0x${string}`, BigInt(index), amountParsed],
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
    if (!isWaitForError || !isWriteError) return;
    if (isWriteError) {
      toast.error(<div>{writeError?.message}</div>, { containerId: 'error' });
    }

    if (isWaitForError) {
      toast.error(<div>{waitForError?.message}</div>, { containerId: 'error' });
    }
  }, [isWaitForError, isWriteError, waitForError, writeError]);

  useEffect(() => {
    reset();
  }, [index]);

  return [unstakeState, unstake];
}
