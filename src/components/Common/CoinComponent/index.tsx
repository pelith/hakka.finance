 /** @jsxImportSource theme-ui */

import { Box, Flex, Link } from 'rebass';
import images from '../../../images';
import styles from './styles';

interface CoinComponentProps {
  imageCoin: string;
  link: string;
  coinName: string;
}

function CoinComponent({imageCoin, link, coinName}: CoinComponentProps) {
  return (
    <Link
      sx={styles.custom_link}
      href={link}
      target='_blank'
      rel='noreferrer noopener'
    >
      <Flex
        key={coinName}
        sx={styles.coinContainer}
        mr='3'
        mb='12px'
        alignItems='center'
      >
        <img
          sx={styles.coinImg}
          src={images[imageCoin as keyof typeof images]}
          alt={`${imageCoin} Logo`}
        />
        <Box ml='2'>
          <span sx={styles.coinName}>{coinName}</span>
        </Box>
      </Flex>
    </Link>
  );
}

export default CoinComponent;
