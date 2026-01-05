/** @jsxImportSource theme-ui */

import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { useMemo, useState, useEffect } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import { formatUnits, isAddress, isAddressEqual, zeroAddress } from 'viem';
import _omit from 'lodash/omit';
import Web3Status from '../Web3Status';
import images from '../../images';
import styles from './styles';
import MyButton from '../../components/Common/MyButton/index';
import useTokenPrice from '../../hooks/useTokenPrice';
import {
  useVestingWithdraw,
  VestingState,
} from '../../hooks/vesting/useVestingWithdraw';
import {
  ChainId,
  ChainNameWithIcon,
  HAKKA,
  VESTING_ADDRESSES,
} from '../../constants';
import { useWalletModalToggle } from '../../state/application/hooks';
import withConnectWalletCheckWrapper from '../../hoc/withConnectWalletCheckWrapper';
import withWrongNetworkCheckWrapper from '../../hoc/withWrongNetworkCheckWrapper';
import AddHakkaToMetamaskBtn from '../AddToMetamaskBtn';
import { TabGroup } from '../Common/TabGroup';
import useVestingInfo from '../../hooks/vesting/useVestingInfo';
import { useActiveWeb3React } from 'src/hooks/useActiveWeb3React';
import { fromUnixTime } from 'date-fns';
import BigNumber from 'bignumber.js';
import { formatCommonNumber } from 'src/utils/formatCommonNumbers';

const hakkaSupportChain = Object.keys(ChainNameWithIcon).map((key) => {
  return {
    value: +key as ChainId,
    title: ChainNameWithIcon[+key as ChainId].name,
    icon: ChainNameWithIcon[+key as ChainId].iconName,
  };
});
const ClaimButton = withWrongNetworkCheckWrapper(
  withConnectWalletCheckWrapper(MyButton),
);
const vestingSupportChain = hakkaSupportChain.filter(
  (chain) => VESTING_ADDRESSES[chain.value] !== zeroAddress,
);

const vestingSupportChainIdSet = new Set(
  vestingSupportChain.map((ele) => ele.value),
);

const VestingPage = () => {
  const { chainId, account } = useActiveWeb3React();
  const hakkaPrice = useTokenPrice('hakka-finance');
  const [claimState, claim] = useVestingWithdraw(
    VESTING_ADDRESSES[chainId],
    account,
  );

  const isConnected = !!account;
  const isChainSupported = vestingSupportChainIdSet.has(chainId);
  const [activeChainTab, setActiveChainTab] = useState(
    isChainSupported ? chainId! : ChainId.MAINNET,
  );

  useEffect(() => {
    if (isChainSupported) {
      setActiveChainTab(chainId);
    }
  }, [chainId]);

  const isTabInCorrectNetwork = chainId === activeChainTab;

  const { vestingInfo } = useVestingInfo();

  const isWaitingCycle = useMemo(
    () =>
      vestingInfo[activeChainTab]?.lastWithdrawalTimeRaw &&
      Date.now() -
        parseInt(
          vestingInfo[activeChainTab].lastWithdrawalTimeRaw?.toString(),
        ) *
          1000 <
        1641600000,
    [vestingInfo[activeChainTab]?.lastWithdrawalTimeRaw, activeChainTab],
  );
  const vestingValueAmount = useMemo(
    () =>
      formatUnits(
        vestingInfo[activeChainTab]?.vestingValueRaw ?? 0n,
        HAKKA[activeChainTab || 1].decimals,
      ),
    [vestingInfo[activeChainTab]?.vestingValueRaw, activeChainTab],
  );

  const vestingValuePrice = useMemo(
    () =>
      BigNumber(vestingValueAmount).multipliedBy(
        BigNumber(hakkaPrice).multipliedBy(1e8),
      ),
    [vestingValueAmount, hakkaPrice],
  );
  const vestingProportionAmount = useMemo(
    () =>
      vestingInfo[activeChainTab]?.vestingProportionRaw && activeChainTab
        ? formatUnits(
            vestingInfo[activeChainTab].vestingProportionRaw ?? 0n,
            HAKKA[activeChainTab || 1].decimals,
          )
        : '0',
    [vestingInfo[activeChainTab]?.vestingProportionRaw, activeChainTab],
  );

  const countdownRenderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }) => (
    <div>
      {zeroPad(days)}D {zeroPad(hours)}H {zeroPad(minutes)}M {zeroPad(seconds)}S
    </div>
  );

  const toggleWalletModal = useWalletModalToggle();

  return (
    <div sx={styles.container}>
      <div sx={styles.vestingPageWrapper}>
        <div sx={styles.header}>
          <h1 sx={styles.title}>Vesting</h1>
          <Web3Status
            unsupported={
              isAddress(VESTING_ADDRESSES[chainId as ChainId]) &&
              isAddressEqual(VESTING_ADDRESSES[chainId as ChainId], zeroAddress)
            }
          />
        </div>
        <h3 sx={styles.heading}></h3>
        <div sx={styles.tabWrapper}>
          <TabGroup
            list={vestingSupportChain}
            active={activeChainTab}
            onChange={setActiveChainTab}
          />
        </div>
        <div sx={styles.vestingCardWrapper}>
          <div sx={styles.vestingCard}>
            <div sx={styles.balanceCard}>
              <div sx={styles.iconWaitingBackgroundColor}>
                <img src={images.iconWaiting} />
              </div>
              <p sx={styles.vestingCardItemHeading}>Vesting Balance</p>
              <div sx={styles.balanceValueCard}>
                <span sx={styles.balanceAmount}>
                  {formatCommonNumber(vestingValueAmount)} HAKKA
                </span>
                <span sx={styles.vestingBalanceValue}>
                  (=
                  {formatCommonNumber(vestingValuePrice)} USD)
                </span>
              </div>
            </div>
            <div sx={styles.claimableCard}>
              <div sx={styles.iconWithdrawAvailableBackgroundColor}>
                <img src={images.iconWithdrawAvailable} />
              </div>
              <p sx={styles.vestingCardItemHeading}>Claimable Amount</p>
              <div sx={styles.displayFlex}>
                <span sx={styles.claimableAmount}>
                  {formatCommonNumber(
                    BigNumber(vestingValueAmount).multipliedBy(
                      vestingProportionAmount,
                    ),
                  )}{' '}
                  HAKKA
                </span>
                <AddHakkaToMetamaskBtn
                  selectedChainId={activeChainTab as ChainId}
                />
              </div>
            </div>
          </div>
          <div sx={styles.activeArea}>
            <a
              sx={styles.linkWrapper}
              target='_blank'
              href='https://medium.com/hakkafinance/vesting-contract-9ab2ff24bf76'
              rel='noreferrer noopener'
            >
              <span>Check vesting terms and learn more</span>
              <img src={images.iconLinkNormal} sx={styles.iconLink} />
            </a>
            <div sx={styles.claimBtn}>
              <ClaimButton
                styleKit={'green'}
                isDisabledWhenNotPrepared={false}
                isConnected={isConnected}
                connectWallet={toggleWalletModal}
                isCorrectNetwork={isTabInCorrectNetwork}
                targetNetwork={activeChainTab}
                onClick={claim}
                disabled={Boolean(
                  claimState === VestingState.PENDING || isWaitingCycle,
                )}
              >
                {isWaitingCycle ? (
                  <Countdown
                    date={
                      fromUnixTime(
                        Number(
                          vestingInfo?.[activeChainTab]
                            ?.lastWithdrawalTimeRaw as bigint,
                        ),
                      ).getTime() + 1641600000
                    }
                    renderer={countdownRenderer}
                  />
                ) : (
                  'Claim'
                )}
              </ClaimButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VestingPage;
