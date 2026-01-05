 /** @jsxImportSource theme-ui */

import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import images from '../../images';
import styles from './styles';
import { ChainId, ChainName } from '../../constants';

const ChainIcon: Record<ChainId, string> = {
  [ChainId.MAINNET]: images.iconEthereum,
  [ChainId.BSC]: images.iconBinanceGold,
  [ChainId.POLYGON]: images.iconPolygon,
  [ChainId.FANTOM]: images.iconFantom,
};

const CurrentNetwork = ({ unsupported }: { unsupported?: boolean }) => {
  const { chainId } = useWeb3React();

  if (!chainId) {
    return <div />;
  }
  if (unsupported) {
    return (
      <div sx={styles.chainWrapper}>
        <img src={images.iconSnapshot} alt='Chain Icon' />
        <span sx={styles.chainNameWrapper}>Wrong Network</span>
      </div>
    );
  }

  return (
    <div sx={styles.chainWrapper}>
      <img
        sx={styles.imgChain}
        src={ChainIcon[chainId as ChainId] ?? images.iconEthereumDark}
        alt='Chain Icon'
      />
      <span sx={styles.chainNameWrapper}>{ChainName[chainId as ChainId]}</span>
    </div>
  );
};

export default CurrentNetwork;
