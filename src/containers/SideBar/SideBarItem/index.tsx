/** @jsxImportSource theme-ui */

import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from 'rebass';
import styles from './styles';
import { upperCaseFirstLetter } from '../../../common/functions';
import { NOTIFICATION_DOT } from '..';

const SideBarItem = (props: {
  icon: string;
  text: string;
  path: string;
  subIcon?: string;
  isViewAllNotifiedMission?: boolean;
}) => {
  const {
    icon,
    text,
    path,
    subIcon = '',
    isViewAllNotifiedMission = false,
  } = props;
  const [selectedNavPath, setSelectedNavPath] = useState('');
  const isBrowser = typeof window !== 'undefined';
  const currentPath = isBrowser
    ? window.location.pathname.replace(/\//g, '').split('0', 1)
    : '';

  useEffect(() => {
    setSelectedNavPath(currentPath[0]);
  }, []);

  return (
    <Box
      sx={
        selectedNavPath === path
          ? styles.sidebar_item_active
          : styles.sidebar_item
      }
    >
      <Flex sx={{ width: '100%' }} justifyContent='space-between'>
        <Flex>
          <img src={icon} />
          <Text sx={styles.sidebar_text} className='sidebar-text' ml='12px'>
            {upperCaseFirstLetter(text)}
          </Text>
        </Flex>
        {subIcon === NOTIFICATION_DOT
          ? !isViewAllNotifiedMission && (
              <div sx={styles.notification_dot_container}>
                <div sx={styles.notification_dot} />
              </div>
            )
          : (subIcon && <img src={subIcon} />) || null}
      </Flex>
    </Box>
  );
};
export default SideBarItem;
