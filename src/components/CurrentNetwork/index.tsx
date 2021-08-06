/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useWeb3React } from '@web3-react/core';
import images from '../../images'
import styles from './styles'
import { ChainName } from '../../constants'

const CurrentNetwork = ({ unsupported }: { unsupported?: boolean }) => {
  const { chainId } = useWeb3React();

  return (
    <div sx={styles.chainWrapper}>
      <img src={!chainId || unsupported ? images.iconSnapshot : chainId === 56 ? images.iconBinanceGold : images.iconEthereumDark} alt='Chain Icon' />
      <span sx={styles.chainNameWrapper}>
        {chainId && !unsupported ? ChainName[chainId] : 'Wrong Network'}
      </span>
    </div>
  );
}

export default CurrentNetwork;
