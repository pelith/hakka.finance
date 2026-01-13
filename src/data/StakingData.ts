import { formatUnits, isAddress, type Address } from 'viem';
import { useActiveWeb3React } from '../hooks/web3Manager';

import STAKING_V1_ABI from '../constants/abis/shakka_v1';
import STAKING_ABI from '../constants/abis/shakka';
import {
  type ChainId,
  STAKING_ADDRESSES,
  NEW_SHAKKA_ADDRESSES,
  STAKING_OPTION_MONTH,
} from '../constants';
import { useReadContracts } from 'wagmi';

export function useStakingDataV1(_chainId?: ChainId) {
  const { chainId, account } = useActiveWeb3React();
  const usingChainId = _chainId ?? chainId;

  return useReadContracts({
    contracts: [
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'stakedHakka',
        args: [account as Address],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'balanceOf',
        args: [account as Address],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'votingPower',
        args: [account as Address],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[0] * 2592000)],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[1] * 2592000)],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[2] * 2592000)],
      },
      {
        address: STAKING_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[3] * 2592000)],
      },
    ] as const,
    query: {
      enabled:
        isAddress(account as Address) &&
        isAddress(STAKING_ADDRESSES[usingChainId as ChainId]),
      select(data) {
        const [stakingBalance, sHakkaBalance, votingPower, ...stakingRate] =
          data;
        const result = {
          stakingBalance: '',
          sHakkaBalance: '',
          votingPower: '',
          stakingRate: [] as string[],
        };
        if (stakingBalance.status === 'success') {
          result.stakingBalance = formatUnits(
            stakingBalance.result as bigint,
            18,
          );
        }
        if (sHakkaBalance.status === 'success') {
          result.sHakkaBalance = formatUnits(
            sHakkaBalance.result as bigint,
            18,
          );
        }
        if (votingPower.status === 'success') {
          result.votingPower = formatUnits(votingPower.result as bigint, 18);
        }
        if (stakingRate.every((rate) => rate.status === 'success')) {
          result.stakingRate = stakingRate.map(
            (rate) => rate.result?.toString() ?? '',
          );
        }
        return result;
      },
    },
  });
}

export function useStakingDataV2(_chainId?: ChainId) {
  const { chainId, account } = useActiveWeb3React();
  const usingChainId = _chainId ?? chainId;

  return useReadContracts({
    contracts: [
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'stakedHakka',
        args: [account as Address],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'balanceOf',
        args: [account as Address],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'votingPower',
        args: [account as Address],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[0] * 2592000)],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_V1_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[1] * 2592000)],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[2] * 2592000)],
      },
      {
        address: NEW_SHAKKA_ADDRESSES[usingChainId as ChainId] as Address,
        abi: STAKING_ABI,
        functionName: 'getStakingRate',
        args: [BigInt(STAKING_OPTION_MONTH[3] * 2592000)],
      },
    ] as const,
    query: {
      enabled:
        isAddress(account as Address) &&
        isAddress(NEW_SHAKKA_ADDRESSES[usingChainId as ChainId]),
      select(data) {
        const [stakingBalance, sHakkaBalance, votingPower, ...stakingRate] =
          data;
        const result = {
          stakingBalance: '',
          sHakkaBalance: '',
          votingPower: '',
          stakingRate: [] as string[],
        };
        if (stakingBalance.status === 'success') {
          result.stakingBalance = formatUnits(
            stakingBalance.result as bigint,
            18,
          );
        }
        if (sHakkaBalance.status === 'success') {
          result.sHakkaBalance = formatUnits(
            sHakkaBalance.result as bigint,
            18,
          );
        }
        if (votingPower.status === 'success') {
          result.votingPower = formatUnits(votingPower.result as bigint, 18);
        }
        if (stakingRate.every((rate) => rate.status === 'success')) {
          result.stakingRate = stakingRate.map(
            (rate) => rate.result?.toString() ?? '',
          );
        }
        return result;
      },
    },
  });
}
