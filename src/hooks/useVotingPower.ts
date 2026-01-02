import { isAddress, type Address } from 'viem';
import {
  ChainDataFetchingState,
  NEW_SHAKKA_ADDRESSES,
  ChainId,
} from '../constants';
import { useMemo } from 'react';
import STAKING_ABI from '../constants/abis/shakka';
import { useActiveWeb3React } from './useActiveWeb3React';
import { useReadContract } from 'wagmi';

export type VotingPowerType = Record<ChainId, bigint>;

export default function useVotingPower(): {
  votingPowerInfo: VotingPowerType;
  fetchVotingPowerState: ChainDataFetchingState;
} {
  const { account } = useActiveWeb3React();


  const {data: mainnetVotingPower} = useReadContract({
    address: NEW_SHAKKA_ADDRESSES[ChainId.MAINNET] as Address,
    abi: STAKING_ABI,
    functionName: 'votingPower',
    args: [account as Address],
    query: {
      enabled: isAddress(account ?? '') && isAddress(NEW_SHAKKA_ADDRESSES[ChainId.MAINNET]),
    }
  })
  
  const {data: bscVotingPower} = useReadContract({
    address: NEW_SHAKKA_ADDRESSES[ChainId.BSC] as Address,
    abi: STAKING_ABI,
    functionName: 'votingPower',
    args: [account as Address],
    query: {
      enabled: isAddress(account ?? '') && isAddress(NEW_SHAKKA_ADDRESSES[ChainId.BSC]),
    }
  })
  const {data: polygonVotingPower} = useReadContract({
    address: NEW_SHAKKA_ADDRESSES[ChainId.POLYGON] as Address,
    abi: STAKING_ABI,
    functionName: 'votingPower',
    args: [account as Address],
    query: {
      enabled: isAddress(account ?? '') && isAddress(NEW_SHAKKA_ADDRESSES[ChainId.POLYGON]),
    }
  })

  const fetchDataState: ChainDataFetchingState = useMemo(() => {
    return mainnetVotingPower && bscVotingPower && polygonVotingPower
      ? ChainDataFetchingState.SUCCESS
      : ChainDataFetchingState.LOADING;
  }, [mainnetVotingPower, bscVotingPower, polygonVotingPower]);

  return { votingPowerInfo: {
    [ChainId.MAINNET]: mainnetVotingPower ?? 0n,
    [ChainId.BSC]: bscVotingPower ?? 0n,
    [ChainId.POLYGON]: polygonVotingPower ?? 0n,
    [ChainId.FANTOM]: 0n,
  }, fetchVotingPowerState: fetchDataState };
}
