import { useMemo } from 'react';
import { formatUnits, type Address } from 'viem';
import { useActiveWeb3React } from '../hooks/web3Manager';

import STAKING_REWARDS_ABI from '../constants/abis/staking_rewards';
import type { ChainId } from '@/constants';
import { useReadContracts } from 'wagmi';

export function useRewardsData(
  addresses: string[],
  decimals: number[],
  chainId?: ChainId,
) {
  const { chainId: activeChainId, account } = useActiveWeb3React();
  const usingChainId = chainId ?? activeChainId;

  const depositBalancesContracts = useMemo(() => {
    return addresses.map((address) => ({
      address: address as Address,
      abi: STAKING_REWARDS_ABI,
      functionName: 'balanceOf',
      args: [account],
      chainId: usingChainId,
    }));
  }, [addresses.join(','), usingChainId]);

  const { data: depositBalances } = useReadContracts({
    contracts: depositBalancesContracts,
    query: {
      select(data) {
        return Object.fromEntries(
          data.map((ele, i) => {
            return [
              addresses[i],
              formatUnits(ele.result as bigint, decimals[i]),
            ] as const;
          }),
        );
      },
    },
  });

  const { data: earnedBalances } = useReadContracts({
    contracts: addresses.map((address) => ({
      address: address as Address,
      abi: STAKING_REWARDS_ABI,
      functionName: 'earned',
      args: [account],
      chainId: usingChainId,
    })),
    query: {
      select(data) {
        return Object.fromEntries(
          data.map((ele, i) => {
            return [
              addresses[i],
              formatUnits(ele.result as bigint, decimals[i]),
            ] as const;
          }),
        );
      },
    },
  });

  return useMemo(() => {
    return {
      depositBalances: depositBalances,
      earnedBalances: earnedBalances,
    };
  }, [depositBalances, earnedBalances]);
}
