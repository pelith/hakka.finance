import { zeroAddress, type Address } from 'viem';
import { useWeb3React } from '@web3-react/core';
import { JSON_RPC_PROVIDER, STAKING_ADDRESSES } from '../constants';
import throttle from 'lodash/throttle';
import { ChainId } from '../constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBlockNumber } from '../state/application/hooks';
import STAKING_V1_ABI from '../constants/abis/shakka_v1';

export default function useV1VotingPower(): {
  v1VotingPower: bigint | undefined;
} {
  const { account } = useWeb3React();
  const latestBlockNumber = useBlockNumber();
  const [v1VotingPower, setV1VotingPower] = useState<bigint>();

  const getV1VotingPower = useCallback(
    async (account: string): Promise<bigint | undefined> => {
      if (account === zeroAddress || !account) return undefined;
      const client = JSON_RPC_PROVIDER[ChainId.MAINNET];
      const votingPower = (await client.readContract({
        address: STAKING_ADDRESSES[ChainId.MAINNET] as Address,
        abi: STAKING_V1_ABI as any,
        functionName: 'votingPower',
        args: [account as Address],
      })) as bigint;
      return votingPower;
    },
    [],
  );

  const fetchV1VotingPower = useCallback(async (account: string) => {
    try {
      const [v1VotingPower] = await Promise.all([getV1VotingPower(account)]);

      setV1VotingPower(v1VotingPower);
    } catch (e) {
      console.error(e);
      console.log('fetch user v1 voting power error');
    }
  }, []);

  const throttledFetchV1VotingPower = useMemo(
    () => throttle(fetchV1VotingPower, 2000),
    [],
  );

  useEffect(() => {
    throttledFetchV1VotingPower(account);
  }, [latestBlockNumber, account]);

  return { v1VotingPower };
}
