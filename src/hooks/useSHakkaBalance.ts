import { useWeb3React } from '@web3-react/core';
import {
  NEW_SHAKKA_ADDRESSES,
  ChainId,
} from '../constants';

import { useTokenInfoAndBalance } from './contracts/token/useTokenInfoAndBalance';

export type SHakkaBalanceType = {
  [chainId in ChainId]?: bigint;
};

export default function useSHakkaBalance(): {
  sHakkaBalanceInfo: SHakkaBalanceType;
} {
  const { account } = useWeb3React();

  const miannetHakkaBalance = useTokenInfoAndBalance(account as string, NEW_SHAKKA_ADDRESSES[ChainId.MAINNET], ChainId.MAINNET);
  const bscHakkaBalance = useTokenInfoAndBalance(account as string, NEW_SHAKKA_ADDRESSES[ChainId.BSC], ChainId.BSC);
  const polygonHakkaBalance = useTokenInfoAndBalance(account as string, NEW_SHAKKA_ADDRESSES[ChainId.POLYGON], ChainId.POLYGON);

  return { sHakkaBalanceInfo: {
    [ChainId.MAINNET]: miannetHakkaBalance?.data?.balanceRaw,
    [ChainId.BSC]: bscHakkaBalance?.data?.balanceRaw,
    [ChainId.POLYGON]: polygonHakkaBalance?.data?.balanceRaw,
  } };
}
