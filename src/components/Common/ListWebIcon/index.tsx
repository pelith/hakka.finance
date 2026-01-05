/** @jsxImportSource theme-ui */

import { Box, Flex } from 'rebass';
import images from '../../../images';
import styles from './styles';
import { memo } from 'react';

const ListWebIcon = () => (
  <Box sx={styles.list_web_icon}>
    <Flex>
      <Box mr='3'>
        <img src={images.iconTelegram} alt='Telegram' />
      </Box>
      <Box mr='3'>
        <img src={images.iconTwitter} alt='Twitter' />
      </Box>
      <Box mr='3'>
        <img src={images.iconDiscord} alt='Discord' />
      </Box>
      <Box mr='3'>
        <img src={images.iconMedium} alt='Medium' />
      </Box>
      <Box mr='3'>
        <img src={images.iconGithub} alt='Github' />
      </Box>
    </Flex>
  </Box>
);
export default memo(ListWebIcon);
