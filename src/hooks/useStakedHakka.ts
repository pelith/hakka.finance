import { useEffect, useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { zeroAddress, type Address } from 'viem';
import {
  ChainDataFetchingState,
  NEW_SHAKKA_ADDRESSES,
  ChainId,
  JSON_RPC_PROVIDER,
} from '../constants';
import { useBlockNumber } from '../state/application/hooks';
import STAKING_ABI from '../constants/abis/shakka';
import throttle from 'lodash/throttle';
export type StakedHakkaType = {
  [chainId in ChainId]?: bigint;
};

export default function useStakedHakka(): {
  stakedHakka: StakedHakkaType;
  fetchDataState: ChainDataFetchingState;
} {
  const { account } = useWeb3React();
  const latestBlockNumber = useBlockNumber();
  const [stakedHakka, setStakedHakka] = useState<StakedHakkaType>({});
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const fetchDataState: ChainDataFetchingState = useMemo(() => {
    return transactionSuccess
      ? ChainDataFetchingState.SUCCESS
      : ChainDataFetchingState.LOADING;
  }, [transactionSuccess]);

  const providers = JSON_RPC_PROVIDER;

  const getStakedHakka = async (
    chainId: ChainId,
    account: string,
  ): Promise<[ChainId, bigint | undefined]> => {
    const client = providers[chainId];
    if (NEW_SHAKKA_ADDRESSES[chainId] === zeroAddress)
      return [chainId, undefined];
    const stakedHakka = (await client.readContract({
      address: NEW_SHAKKA_ADDRESSES[chainId] as Address,
      abi: STAKING_ABI as any,
      functionName: 'stakedHakka',
      args: [account as Address],
    })) as bigint;
    return [chainId, stakedHakka];
  };

  const fetchStakedHakka = async (account: string) => {
    setTransactionSuccess(false);
    try {
      const stakedList = [
        getStakedHakka(ChainId.MAINNET, account),
        getStakedHakka(ChainId.BSC, account),
        getStakedHakka(ChainId.POLYGON, account),
      ];
      const stakedHakkaResult = await Promise.all(stakedList);

      setStakedHakka(Object.fromEntries(stakedHakkaResult));
      setTransactionSuccess(true);
    } catch (e) {
      console.log(e);
      console.log('fetch user staked hakka error');
    }
  };

  const throttledFetchStakedHakka = useMemo(
    () => throttle(fetchStakedHakka, 2000),
    [],
  );

  useEffect(() => {
    if (account === zeroAddress || !account) return;
    throttledFetchStakedHakka(account);
  }, [latestBlockNumber, account]);

  return { stakedHakka, fetchDataState };
}
