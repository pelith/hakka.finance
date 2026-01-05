 /** @jsxImportSource theme-ui */

import { Box, Flex } from 'rebass';
import images from '../../../images';
import { MyButton } from '../../../components/Common';
import styles from './styles';

interface InfoProductProps {
  cardName: string;
  info: string;
  whitepaper?: string;
  vist: string;
  visitButtonContent?: string;
  infoTag: string[];
  onClose: (value: boolean) => void;
  isShowInfoProduct: boolean;
}

const InfoProduct = (props: InfoProductProps) => {
  const { cardName, info, whitepaper, vist, visitButtonContent, infoTag, onClose, isShowInfoProduct } = props;

  const onCloseInfo = () => {
    onClose(false);
  };
  return (
    <Flex
      sx={isShowInfoProduct ? styles.info_section_show : styles.info_section}
    >
      <Box sx={styles.infoTitle}>
        <Flex
          sx={styles.infoTitle_name}
          mt='32px'
          justifyContent='space-between'
        >
          <Box>{cardName ?? 'BlackHoleSwap'}</Box>
          <Box sx={styles.icon_delete_title} onClick={onCloseInfo}>
            <img src={images.iconDeleteRound} />
          </Box>
        </Flex>
        <Flex flexWrap='wrap' mt='20px'>
          <Box sx={styles.tag_box} mr='8px' mt='8px'>
            #{infoTag[0]}
          </Box>
          <Box sx={styles.tag_box} mt='8px'>
            #{infoTag[1]}
          </Box>
        </Flex>
      </Box>

      <Box sx={styles.infoContent} mt='16px'>
        <Box>
          <Flex alignItems='flex-start' justifyContent='space-between'>
            <p sx={styles.infoContent_text}>
              {info ??
                'By integrating lending protocols to leverage the excess supply while borrowing on the inadequate side, BlackHoleSwap can therefore process transactions far exceeding its existing liquidity. Compared to other AMMs, BlackHoleSwap provides nearly infinite liquidity with the lowest price slippage, maximizing capital utilization.'}
            </p>
            <img
              onClick={onCloseInfo}
              sx={styles.icon_delete}
              src={images.iconDeleteRound}
            />
          </Flex>
        </Box>
        <Box mt='32px'>
          <Flex sx={styles.btn_section}>
            <MyButton
              disabled={!whitepaper}
              onClick={() => {
                window.open(
                  whitepaper,
                  '_blank',
                  'noopener, noreferrer',
                );
              }}
            >
              Whitepaper
            </MyButton>
            <Box ml='28px' mt='12px' />
            <MyButton
              disabled={!vist}
              onClick={() => {
                window.open(vist, '_blank', 'noopener, noreferrer');
              }}
              styleKit='green'
            >
              {visitButtonContent || 'Visit'}
            </MyButton>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default InfoProduct;
