/** @jsxImportSource theme-ui */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Box, Flex } from 'rebass';
import SideBar from './SideBar';
import Header from './Header';
import Footer from './Footer';
import styles from './styles';
import images from '../images';

const Layout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
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
            charSet: 'utf-8',
          },
          {
            property: 'og:image',
            content: images.iconOgImage,
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
          <Header sx={styles.content_wrapper} toggleSidebar={toggleSideBar} />
          <Box sx={styles.content}>{children}</Box>
          <Footer />
        </Box>
      </Flex>
    </div>
  );
};

export default React.memo(Layout);
