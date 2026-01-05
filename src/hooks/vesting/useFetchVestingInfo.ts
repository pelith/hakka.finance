import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import {
  ChainDataFetchingState,
  VESTING_ADDRESSES,
  ChainId,
} from '../../constants';
import { isAddress, zeroAddress, type Address } from 'viem';
import { useMemo } from 'react';
import VESTING_ABI from '../../constants/abis/vesting';
import { useReadContracts } from 'wagmi';

export type FetchVestingInfoResultType = 
  {
    vestingValueRaw?: bigint;
    vestingProportionRaw?: bigint;
    lastWithdrawalTimeRaw?: bigint;
  }

export default function useFetchVestingInfo(chainId: ChainId): {
  fetchVestingInfoResult: FetchVestingInfoResultType;
  fetchDataState: ChainDataFetchingState;
} {
  const { account = '' } = useWeb3React();
  const vestingAddress = VESTING_ADDRESSES[chainId] as Address;

  const isUnsupportedChain = vestingAddress === zeroAddress;
  const enabled =
    !isUnsupportedChain && isAddress(account as Address);

  const { data: vestingInfoResult, isLoading } = useReadContracts({
    contracts: [
      {
        address: vestingAddress,
        abi: VESTING_ABI,
        functionName: 'balanceOf',
        args: [account as Address],
        chainId,
      },
      {
        address: vestingAddress,
        abi: VESTING_ABI,
        functionName: 'proportion',
        args: [],
        chainId,
      },
      {
        address: vestingAddress,
        abi: VESTING_ABI,
        functionName: 'lastWithdrawalTime',
        args: [account as Address],
        chainId,
      },
    ] as const,
    query: {
      enabled,
      refetchInterval: 15_000,
      select(data) {
        const [vestingValue, vestingProportion, lastWithdrawalTime] = data;
        return  {
            vestingValueRaw:
              vestingValue.status === 'success'
                ? (vestingValue.result as bigint)
                : undefined,
            vestingProportionRaw:
              vestingProportion.status === 'success'
                ? (vestingProportion.result as bigint)
                : undefined,
            lastWithdrawalTimeRaw:
              lastWithdrawalTime.status === 'success'
                ? (lastWithdrawalTime.result as bigint)
                : undefined,
          } satisfies FetchVestingInfoResultType;
      },
    },
  });

  const fetchVestingInfoResult = useMemo<FetchVestingInfoResultType>(() => {
    if (!vestingInfoResult || isUnsupportedChain) return {
      vestingValueRaw: undefined,
      vestingProportionRaw: undefined,
      lastWithdrawalTimeRaw: undefined,
    };
    return vestingInfoResult;
  }, [isUnsupportedChain, vestingInfoResult]);

  const fetchDataState: ChainDataFetchingState = useMemo(() => {
    if (isUnsupportedChain) return ChainDataFetchingState.SUCCESS;
    return enabled && isLoading
      ? ChainDataFetchingState.LOADING
      : ChainDataFetchingState.SUCCESS;
  }, [enabled, isLoading, isUnsupportedChain]);

  return { fetchVestingInfoResult, fetchDataState };
}
