/** @jsxFrag */

import { type ReactNode } from 'react';
import { Box, Flex } from 'rebass';
import styles from './styles';
import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { ChainId, HAKKA } from 'src/constants';
import erc20 from 'src/constants/abis/erc20';
import { formatCommonNumber } from 'src/utils/formatCommonNumbers';
const Admin = '0x1D075f1F543bB09Df4530F44ed21CA50303A65B2' as const;
const MultiSig = '0xc04672587e0d1bd7da5707484119dbdbb67ac57d' as const;
function WhatHakka({ renderCoin }: { renderCoin: () => ReactNode }) {
  const { data: circulatingSupply } = useReadContracts({
    contracts: [
      {
        address: HAKKA[ChainId.MAINNET].address,
        abi: erc20,
        functionName: 'balanceOf',
        args: [Admin],
      },
      {
        address: HAKKA[ChainId.MAINNET].address,
        abi: erc20,
        functionName: 'balanceOf',
        args: [MultiSig],
      },
      {
        address: HAKKA[ChainId.MAINNET].address,
        abi: erc20,
        functionName: 'totalSupply',
        args: [],
      },
    ],
    query: {
      select(data) {
        if (!data) return 0;
        const [adminBalance, multiSigBalance, totalSupply] = data;
        if (
          adminBalance.result === undefined ||
          multiSigBalance.result === undefined ||
          totalSupply.result === undefined
        )
          return 0;
        const summing =
          totalSupply.result - adminBalance.result - multiSigBalance.result;
        return formatUnits(summing, 18);
      },
    },
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
        <span>{formatCommonNumber(circulatingSupply)} HAKKA</span>
      </Box>
      <Flex sx={styles.listCoinHakka} mt='20px' alignItems='center'>
        {renderCoin()}
      </Flex>
    </>
  );
}

export default WhatHakka;
