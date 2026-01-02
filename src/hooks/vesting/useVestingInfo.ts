import { useMemo } from 'react';
import { ChainId } from '../../constants';
import useFetchVestingInfo from './useFetchVestingInfo';


export default function useVestingInfo() {
  const { fetchVestingInfoResult: mainnetVestingInfo } = useFetchVestingInfo(
    ChainId.MAINNET,
  );
  const { fetchVestingInfoResult: bscVestingInfo } = useFetchVestingInfo(
    ChainId.BSC,
  );
  const { fetchVestingInfoResult: fantomVestingInfo } = useFetchVestingInfo(
    ChainId.FANTOM,
  );
  const { fetchVestingInfoResult: polygonVestingInfo } = useFetchVestingInfo(
    ChainId.POLYGON,
  );

  const vestingInfo = useMemo(() => {
    return {
      [ChainId.MAINNET]: mainnetVestingInfo,
      [ChainId.BSC]: bscVestingInfo,
      [ChainId.FANTOM]: fantomVestingInfo,
      [ChainId.POLYGON]: polygonVestingInfo,
    };
  }, [mainnetVestingInfo, bscVestingInfo, fantomVestingInfo, polygonVestingInfo]);

  return { vestingInfo };
}
