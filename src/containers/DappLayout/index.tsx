 /** @jsxImportSource theme-ui */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Box, Flex } from 'rebass';
import SideBar from '../SideBar';
import DappHeader from '../Header/DappHeader/index';
import Footer from '../Footer';
import styles from './styles';
import images from '../../images';
import { ToastContainer } from 'react-toastify';
import './ReactToastify.css';

const DappLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const TOAST_AUTO_CLOSE_TIME = 8000;
  const [isShowSideBar, setIsShowSideBar] = useState(false);

  const toggleSideBar = () => {
    setIsShowSideBar(!isShowSideBar);
  };
  const handleClose = (value: boolean) => {
    setIsShowSideBar(value);
  };

  return (
    <div>
      <Helmet
        title={title || 'Hakka Finance'}
        meta={[
          {
            name: 'description',
            content:
              'Hakka Finance is a decentralized finance platform that allows you to earn rewards by staking your tokens.',
          },
          { property: 'og:image', content: images.iconOgImage },
          {
            name: 'google-site-verification',
            content: 'G25AvNxxuCFDIzy7gGrcN1-WdOUS1t3I0eJtjGj_JYo',
          },
        ]}
      />
      <Flex>
        <SideBar isShowSideBar={isShowSideBar} onCloseSideBar={handleClose} />

        <Box
          id='wrapper'
          tabIndex={-1}
          width='100%'
          sx={styles.custom_scroll_bar}
        >
          <DappHeader
            sx={styles.content_wrapper}
            toggleSidebar={toggleSideBar}
          />
          <Box sx={styles.content}>
            <ToastContainer
              containerId={'tx'}
              position='top-right'
              autoClose={TOAST_AUTO_CLOSE_TIME}
              hideProgressBar={false}
              newestOnTop={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <ToastContainer
              style={{ maxWidth: '100vw', width: 'auto' }}
              containerId={'error'}
              position='top-center'
              autoClose={TOAST_AUTO_CLOSE_TIME}
              hideProgressBar={false}
              newestOnTop={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            {children}
          </Box>
          <Footer />
        </Box>
      </Flex>
    </div>
  );
};

export default React.memo(DappLayout);
