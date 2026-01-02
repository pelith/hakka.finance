import { isAddress, type Address } from 'viem';
import type { ChainId } from 'src/constants';
import { ExternalLink } from 'react-feather';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import STAKING_REWARDS_ABI from 'src/constants/abis/staking_rewards';
import { toast } from 'react-toastify';
import { getEtherscanLink, shortenTxId } from 'src/utils';

export enum ClaimState {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
}

export function useRewardsClaim(claimAddress: string, chainId: ChainId) {
  const { writeContractAsync, ...state } = useWriteContract({
    mutation: {
      onSuccess(hash) {
        toast(
          <a
            target='_blank'
            href={getEtherscanLink(chainId ?? 1, hash, 'transaction')}
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
  const { isLoading } = useWaitForTransactionReceipt({
    hash: state.data,
    chainId: chainId,
    query: {
      enabled: !!state.data,
    },
  });
  const claimState =
    state.isPending && isLoading ? ClaimState.PENDING : ClaimState.UNKNOWN;

  return [
    claimState,
    () => {
      if (!isAddress(claimAddress)) {
        console.error('invalid claim address');
        return;
      }
      return writeContractAsync({
        address: claimAddress as Address,
        chainId: chainId,
        abi: STAKING_REWARDS_ABI,
        functionName: 'getReward',
        args: [],
      });
    },
  ] as const;
}
