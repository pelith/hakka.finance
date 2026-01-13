import type { Address } from 'viem';
import { STAKING_ADDRESSES } from '../constants';
import { ChainId } from '../constants';

import STAKING_V1_ABI from '../constants/abis/shakka_v1';
import { useReadContract } from 'wagmi';
import { useActiveWeb3React } from './useActiveWeb3React';

export default function useV1VotingPower(): {
  v1VotingPower: bigint | undefined;
} {
  const { account } = useActiveWeb3React();

  const { data: v1VotingPower } = useReadContract({
    address: STAKING_ADDRESSES[ChainId.MAINNET] as Address,
    abi: STAKING_V1_ABI,
    functionName: 'votingPower',
    args: [account as Address],
  });

  return { v1VotingPower };
}
