
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import BigNumber from 'bignumber.js';
import {
  ChainDataFetchingState,
  NEW_SHAKKA_ADDRESSES,
  ChainId,
  STAKING_ADDRESSES,
} from '../../constants';
import STAKING_ABI from '../../constants/abis/shakka';
import STAKING_V1_ABI from '../../constants/abis/shakka_v1';

import _isEqual from 'lodash/isEqual';
import _range from 'lodash/range';

import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits, isAddress, type Address } from 'viem';
import { fromUnixTime } from 'date-fns';

export interface VaultType {
  hakkaAmount: BigNumber;
  wAmount: BigNumber;
  unlockTime: BigNumber;
}
const ZERO = new BigNumber(0);
export function useStakingVault(
  activeChainId: ChainId
): {
  vault: VaultType[];
  vaultCount: BigNumber;
  fetchDataState: ChainDataFetchingState;
} {
  const { account = '' } = useWeb3React();

  const {data: vaultCount = ZERO, isLoading: isLoadingVaultCount} = useReadContract({
    address: NEW_SHAKKA_ADDRESSES[activeChainId] as Address,
    abi: STAKING_ABI,
    functionName: 'vaultCount',
    chainId: activeChainId,
    args: [account as Address],
    query: {
      enabled: isAddress(account) && isAddress(NEW_SHAKKA_ADDRESSES[activeChainId]),
      select (data) {
        return new BigNumber(data);
      },
      initialData: 0n,
    }
  })
  const {data: vaults, isLoading: isLoadingVaults} = useReadContracts({
    contracts: _range(vaultCount?.toNumber() ?? 0).map((vaultNum) => ({
      address: NEW_SHAKKA_ADDRESSES[activeChainId] as Address,
      abi: STAKING_ABI,
      functionName: 'vaults',
      args: [account as Address, BigInt(vaultNum)] as const,
      chainId: activeChainId as 1,
    }) as const),
    query: {
      enabled: isAddress(account) && isAddress(NEW_SHAKKA_ADDRESSES[activeChainId]),
      select(data) {
        return data.filter(ele => ele.status === 'success').map(ele => {
          const [hakkaAmount, wAmount, unlockTime] = ele.result;
          return {
            hakkaAmount: BigNumber(formatUnits(hakkaAmount, 18)),
            wAmount: BigNumber(formatUnits(wAmount, 18)),
            unlockTime: BigNumber(unlockTime),
            __expired: fromUnixTime(Number(unlockTime)).getTime() < Date.now(),
          } as VaultType
        })
      },
      initialData: [],
    }
  })

  return { vault: vaults!, vaultCount, fetchDataState: isLoadingVaults || isLoadingVaultCount ? ChainDataFetchingState.LOADING : ChainDataFetchingState.SUCCESS };
}

export function useStakingVaultV1(
  activeChainId: ChainId
): {
  vault: VaultType[];
  vaultCount: BigNumber;
  fetchDataState: ChainDataFetchingState;
} {
  const { account = '' } = useWeb3React();

  const {data: vaultCount = ZERO, isLoading: isLoadingVaultCount} = useReadContract({
    address: STAKING_ADDRESSES[activeChainId] as Address,
    abi: STAKING_V1_ABI,
    functionName: 'vaultCount',
    chainId: activeChainId,
    args: [account as Address],
    query: {
      enabled: isAddress(account) && isAddress(STAKING_ADDRESSES[activeChainId]),
      select (data) {
        return new BigNumber(data);
      },
      initialData: 0n,
    }
  })
  const {data: vaults, isLoading: isLoadingVaults} = useReadContracts({
    contracts: _range(vaultCount?.toNumber() ?? 0).map((vaultNum) => ({
      address: STAKING_ADDRESSES[activeChainId] as Address,
      abi: STAKING_V1_ABI,
      functionName: 'vaults',
      args: [account as Address, BigInt(vaultNum)] as const,
      chainId: activeChainId as 1,
    }) as const),
    query: {
      enabled: isAddress(account) && isAddress(STAKING_ADDRESSES[activeChainId]),
      select(data) {
        return data.filter(ele => ele.status === 'success').map(ele => {
          const [hakkaAmount, wAmount, unlockTime] = ele.result;
          return {
            hakkaAmount: BigNumber(formatUnits(hakkaAmount, 18)),
            wAmount: BigNumber(formatUnits(wAmount, 18)),
            unlockTime: BigNumber(unlockTime),
            __expired: fromUnixTime(Number(unlockTime)).getTime() < Date.now(),
          } as VaultType
        })
      },
      initialData: [],
    }
  })

  return { vault: vaults!, vaultCount, fetchDataState: isLoadingVaults || isLoadingVaultCount ? ChainDataFetchingState.LOADING : ChainDataFetchingState.SUCCESS };
}

