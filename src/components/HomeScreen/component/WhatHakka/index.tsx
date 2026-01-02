 /** @jsxImportSource theme-ui */
/** @jsxFrag */

import React, { useState } from 'react';
import { Box, Flex, Heading } from 'rebass';
import fetch from 'cross-fetch';
import styles from './styles';
import { useQuery } from '@tanstack/react-query';

function WhatHakka({ renderCoin }: { renderCoin: () => React.ReactNode }) {
  const { data: circulatingSupplyValue } = useQuery({
    queryFn: () =>
      fetch('https://api.hakka.finance/').then((res) => res.text()),
    queryKey: ['circulatingSupply'],
    select: (res) => {
      const value = Math.floor(Number.parseInt(res, 10) * 10000) / 10000;
      return `${value} HAKKA`;
    },
    initialData: '0 HAKKA',
  });

  return (
    <>
      <Box id='whatHakka' sx={styles.whatHakkaHeading}>
        What is HAKKA Token
      </Box>
      <Box sx={styles.whatHakkaText} mt='4'>
        <p>
          {' '}
          HAKKA is the protocol token that empowers the community governance of
          Hakka Finance.
        </p>
      </Box>
      <Box sx={styles.circulatingSupplyText}>
        <span>Circulating Supply: </span>
        <span>{circulatingSupplyValue}</span>
      </Box>
      <Flex sx={styles.listCoinHakka} mt='20px' alignItems='center'>
        {renderCoin()}
      </Flex>
    </>
  );
}

export default WhatHakka;
