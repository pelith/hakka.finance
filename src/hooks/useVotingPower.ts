import { zeroAddress, type Address } from 'viem';
import { useWeb3React } from '@web3-react/core';
import {
  ChainDataFetchingState,
  NEW_SHAKKA_ADDRESSES,
  JSON_RPC_PROVIDER,
  ChainId,
} from '../constants';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBlockNumber } from '../state/application/hooks';
import STAKING_ABI from '../constants/abis/shakka';

export type VotingPowerType = {
  [chainId in ChainId]: bigint;
};

export default function useVotingPower(): {
  votingPowerInfo: VotingPowerType;
  fetchVotingPowerState: ChainDataFetchingState;
} {
  const { account } = useWeb3React();
  const latestBlockNumber = useBlockNumber();
  const [votingPowerInfo, setVotingPowerInfo] = useState<VotingPowerType>({});
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const fetchDataState: ChainDataFetchingState = useMemo(() => {
    return transactionSuccess
      ? ChainDataFetchingState.SUCCESS
      : ChainDataFetchingState.LOADING;
  }, [transactionSuccess]);

  const providers = JSON_RPC_PROVIDER;
  const getVotingPower = useCallback(
    async (
      chainId: ChainId,
      account: string,
    ): Promise<[ChainId, bigint | undefined]> => {
      if (NEW_SHAKKA_ADDRESSES[chainId] === zeroAddress)
        return [chainId, undefined];
      if (account === zeroAddress || !account) return [chainId, undefined];
      const client = providers[chainId];
      const votingPower = (await client.readContract({
        address: NEW_SHAKKA_ADDRESSES[chainId] as Address,
        abi: STAKING_ABI as any,
        functionName: 'votingPower',
        args: [account as Address],
      })) as bigint;
      return [chainId, votingPower];
    },
    [],
  );

  const fetchVotingPower = useCallback(async (account: string) => {
    setTransactionSuccess(false);
    try {
      const fetchingList = [
        getVotingPower(ChainId.MAINNET, account),
        getVotingPower(ChainId.BSC, account),
        getVotingPower(ChainId.POLYGON, account),
      ];
      const votingPowerList = await Promise.all(fetchingList);

      setVotingPowerInfo(
        Object.fromEntries(votingPowerList) as typeof votingPowerInfo,
      );
      setTransactionSuccess(true);
    } catch (e) {
      console.log(e);
      console.log('fetch user voting power error');
    }
  }, []);

  const throttledFetchVotingPower = useMemo(
    () => throttle(fetchVotingPower, 2000),
    [],
  );

  useEffect(() => {
    if (account === zeroAddress || !account) return;
    throttledFetchVotingPower(account);
  }, [latestBlockNumber, account]);

  return { votingPowerInfo, fetchVotingPowerState: fetchDataState };
}
