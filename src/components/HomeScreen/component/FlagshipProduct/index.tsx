 /** @jsxImportSource theme-ui */
import { jsx } from 'theme-ui';
import { Flex, Box } from 'rebass';
import images from '../../../../images';
import styles from './styles';

function FlagshipProduct({ item, i, link }: { item: { image: string; title: string }; i: number; link: string }) {
  return (
    <Flex
      onClick={() => {
        window.open(link, '_blank', 'noopener, noreferrer');
      }}
      alignItems='center'
      key={i}
      sx={styles.product}
      mt='2'
    >
      <img sx={styles.imageProduct} src={images[item.image as keyof typeof images]} alt={item.image} />
      <Box sx={styles.productHeading} ml='3'>
        {item.title}
      </Box>
    </Flex>
  );
}


export default FlagshipProduct;
