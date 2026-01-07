
import { useCallback } from 'react';
import images from '../../images';
import { ChainId, HAKKA } from '../../constants';
import styles from './styles';
import { useConnections, useWatchAsset } from 'wagmi';
import { isAddress, type Address } from 'viem';

const AddHakkaToMetamaskBtn = ({
  address = '',
  selectedChainId,
}: {
  address?: string;
  selectedChainId: ChainId;
}) => {
  const [connections] = useConnections();
  const chainId = connections?.chainId ?? ChainId.MAINNET;
  const { watchAsset } = useWatchAsset();
  const addToMetamask = useCallback(() => {
    if (isAddress(address)) {
      watchAsset({
        type: 'ERC20',
        options: {
          address: address || (HAKKA[selectedChainId]?.address as Address),
          symbol: 'HAKKA',
          decimals: 18,
        },
      });
    }
  }, [address, chainId, watchAsset]);

  return (
    <button
      type='button'
      onClick={addToMetamask}
      sx={styles.addMetamaskBtn}
      disabled={
        (selectedChainId && selectedChainId !== chainId) ||
        !Object.getOwnPropertyNames(HAKKA).includes(`${chainId}`)
      }
    >
      <img src={images.iconAdd} sx={styles.iconAdd} alt='add to metamask' />
      <img src={images.iconMetamask} alt='metamask' />
    </button>
  );
};

export default AddHakkaToMetamaskBtn;
