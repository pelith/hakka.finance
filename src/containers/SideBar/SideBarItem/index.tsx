/** @jsx jsx */
import { jsx } from 'theme-ui';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text } from 'rebass';
import styles from './styles';
import { upperCaseFirstLetter } from '../../../common/functions';
import { NOTIFICATION_DOT } from '..';
import { notificationMissionAddresses } from '../../../constants/challenge';

const SideBarItem = (props, { location, data }) => {
  const {
    icon, text, path, subIcon,
  } = props;
  const [selectedNavPath, setSelectedNavPath] = useState('');
  const isBrowser = typeof window !== 'undefined';
  const currentPath = isBrowser ? window.location.pathname.replace(/\//g, '').split('0',1) : '';
  const [isViewAllNotifiedMission, setIsViewAllNotifiedMission] = useState<boolean>(true)

  useEffect(() => {
    const localStorageViewedPages = isBrowser ? window.localStorage.getItem('viewed-pages') : ''
    if (localStorageViewedPages) {
      let isAllAddressPass = true
      const viewedPages: string[] = JSON.parse(localStorageViewedPages)
      notificationMissionAddresses.forEach((address: string) => {
        if (viewedPages.findIndex((viewedAddress: string) => viewedAddress === address) === -1) {
          isAllAddressPass = false
        }
      })
      setIsViewAllNotifiedMission(isAllAddressPass)
    } else if (notificationMissionAddresses.length > 0) {
      setIsViewAllNotifiedMission(false)
    }
  }, [])

  useEffect(() => {
    setSelectedNavPath(currentPath[0]);
  }, []);

  return (
    <Box sx={selectedNavPath === path ? styles.sidebar_item_active : styles.sidebar_item}>
      <Flex sx={{ width: '100%' }} justifyContent="space-between">
        <Flex>
          <img src={icon} />
          <Text sx={styles.sidebar_text} className="sidebar-text" ml="12px">
            {upperCaseFirstLetter(text)}
          </Text>
        </Flex>
        {subIcon === NOTIFICATION_DOT
          ? !isViewAllNotifiedMission && (
              <div sx={styles.notification_dot_container}>
                <div sx={styles.notification_dot} />
              </div>
          ) : ( 
            <img src={subIcon} /> 
          )
        }
      </Flex>
    </Box>
  );
};
export default SideBarItem;
