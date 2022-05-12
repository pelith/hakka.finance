import { JSBI, CurrencyAmount } from '@uniswap/sdk';
import { useMemo } from 'react';
import { formatUnits } from '@ethersproject/units';
import { useActiveWeb3React } from '../hooks/web3Manager';

import { getContract, tryParseAmount } from '../utils';
import { useSingleCallResult, useSingleContractMultipleData } from '../state/multicall/hooks';
import STAKING_V1_ABI from '../constants/abis/shakka_v1.json';
import STAKING_ABI from '../constants/abis/shakka.json';
import {
  ChainId,
  HAKKA,
  STAKING_ADDRESSES,
  NEW_SHAKKA_ADDRESSES,
  stakingMonth,
} from '../constants';

const usedVersion = {
  'v1': {
    abi: STAKING_V1_ABI,
    address: STAKING_ADDRESSES,
  },
  'v2': {
    abi: STAKING_ABI,
    address: NEW_SHAKKA_ADDRESSES,
  }
}

export function useStakingData(version: 'v1' | 'v2' = 'v1'): { stakingBalance: CurrencyAmount, sHakkaBalance: CurrencyAmount, votingPower: CurrencyAmount, stakingRate: string[], vaults: any[] } {
  const { chainId, library, account } = useActiveWeb3React();

  const contract = getContract(
    usedVersion[version].address[chainId || 1 as ChainId],
    usedVersion[version].abi,
    library,
    account,
  );

  const stakingBalance = useSingleCallResult(contract, 'stakedHakka', [account]);
  const sHakkaBalance = useSingleCallResult(contract, 'balanceOf', [account]);
  const votingPower = useSingleCallResult(contract, 'votingPower', [account]);
  const stakingRate = useSingleContractMultipleData(
    contract,
    'getStakingRate',
    stakingMonth.map((lockMonth) => [lockMonth * 60 * 60 * 24 * 30]),
  );
  const vaultCount = useSingleCallResult(contract, 'vaultCount', [account]);
  const vaults = useSingleContractMultipleData(
    contract,
    'vaults',
    Array.from(Array(vaultCount.result?.[0].toNumber() || 0).keys()).map((vaultNum) => [account, vaultNum]),
  );

  return useMemo(
    () => (chainId === 1 || 42 && stakingBalance && sHakkaBalance && votingPower && stakingRate
      ? {
        stakingBalance: tryParseAmount(formatUnits(stakingBalance.result?.[0] ?? 0)),
        sHakkaBalance: tryParseAmount(formatUnits(sHakkaBalance.result?.[0] ?? 0)),
        votingPower: tryParseAmount(formatUnits(votingPower.result?.[0] ?? 0)),
        stakingRate: stakingRate.map((rate) => JSBI.BigInt(rate.result?.[0] ?? 0).toString()),
        vaults,
      }
      : {
        stakingBalance: undefined,
        sHakkaBalance: undefined,
        votingPower: undefined,
        stakingRate: undefined,
        vaults: [],
      }),
    [chainId, stakingBalance, votingPower, stakingRate, vaults],
  );
}
