import { useMemo, } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { isAddress, type Address } from 'viem';
import {
  ChainDataFetchingState,
  NEW_SHAKKA_ADDRESSES,
  ChainId,
} from '../constants';
import STAKING_ABI from '../constants/abis/shakka';
import { useReadContract } from 'wagmi';
export type StakedHakkaType = {
  [chainId in ChainId]?: bigint;
};
/**
 *
 * TODO refactor to useReadContract
 */
export default function useStakedHakka(): {
  stakedHakka: StakedHakkaType;
  fetchDataState: ChainDataFetchingState;
} {
  const { account } = useWeb3React();

  const { data: mainnetStakedHakka, isLoading: isLoadingMainnetStakedHakka } =
    useReadContract({
      address: NEW_SHAKKA_ADDRESSES[ChainId.MAINNET] as Address,
      abi: STAKING_ABI,
      functionName: 'stakedHakka',
      args: [account as Address],
      query: {
        enabled:
          isAddress(account ?? '') &&
          isAddress(NEW_SHAKKA_ADDRESSES[ChainId.MAINNET] ?? ''),
      },
    });

  const { data: bscStakedHakka, isLoading: isLoadingBscStakedHakka } =
    useReadContract({
      address: NEW_SHAKKA_ADDRESSES[ChainId.BSC] as Address,
      abi: STAKING_ABI,
      functionName: 'stakedHakka',
      args: [account as Address],
      query: {
        enabled:
          isAddress(account ?? '') &&
          isAddress(NEW_SHAKKA_ADDRESSES[ChainId.BSC] ?? ''),
      },
    });

  const { data: polygonStakedHakka, isLoading: isLoadingPolygonStakedHakka } =
    useReadContract({
      address: NEW_SHAKKA_ADDRESSES[ChainId.POLYGON] as Address,
      abi: STAKING_ABI,
      functionName: 'stakedHakka',
      args: [account as Address],
      query: {
        enabled:
          isAddress(account ?? '') &&
          isAddress(NEW_SHAKKA_ADDRESSES[ChainId.POLYGON] ?? ''),
      },
    });

  const fetchDataState: ChainDataFetchingState = useMemo(() => {
    return isLoadingMainnetStakedHakka ||
      isLoadingBscStakedHakka ||
      isLoadingPolygonStakedHakka
      ? ChainDataFetchingState.LOADING
      : ChainDataFetchingState.SUCCESS;
  }, [
    isLoadingMainnetStakedHakka,
    isLoadingBscStakedHakka,
    isLoadingPolygonStakedHakka,
  ]);

  return {
    stakedHakka: {
      [ChainId.MAINNET]: mainnetStakedHakka ?? 0n,
      [ChainId.BSC]: bscStakedHakka ?? 0n,
      [ChainId.POLYGON]: polygonStakedHakka ?? 0n,
    },
    fetchDataState,
  };
}
