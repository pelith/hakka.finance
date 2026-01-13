import { useState, useMemo, useCallback } from 'react';
import { useActiveWeb3React as useWeb3React } from '@/hooks/useActiveWeb3React';
import { zeroAddress } from 'viem';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useNavigate } from '@tanstack/react-router';
import { isMobile } from 'react-device-detect';
import images from '../../images';
import styles from './styles-v1';
import Web3Status from '../Web3Status';
import { useStakingDataV1 } from '../../data/StakingData';
import StakePositionItem from './StakePositionItem/index';
import { type ChainId, STAKING_ADDRESSES } from '../../constants';
import VotingPowerContainer, {
  StakingVersion,
} from '../../containers/VotingPowerContainer';
import { botSideBarItems } from '../../containers/SideBar';
import {
  useStakingVaultV1,
  type VaultType,
} from '@/hooks/staking/useStakingVault';
import { createBigNumberSort } from '@/utils/sort';
import { formatCommonNumber } from '@/utils/formatCommonNumbers';

interface StakingInfoItemProps {
  title: string;
  content: string;
}

const StakingInfoItem = ({ title, content }: StakingInfoItemProps) => {
  return (
    <div sx={styles.stakingInfoItemWrapper}>
      <p className='title'>{title}</p>
      <p className='content'>{content}</p>
    </div>
  );
};

const Staking = () => {
  const { chainId } = useWeb3React();
  const [isShowArchived, setIsShowArchived] = useState<boolean>(true);
  const [isSortByUnlockTime, setIsSortByUnlockTime] = useState<boolean>(false);
  const navigate = useNavigate();
  const { data: { stakingBalance, sHakkaBalance } = {} } = useStakingDataV1();
  const { vault: vaults } = useStakingVaultV1(chainId as ChainId);

  const isCorrectNetwork = useMemo<boolean>(() => {
    if (chainId) {
      return STAKING_ADDRESSES[chainId as ChainId] !== zeroAddress;
    }
    return true;
  }, [chainId]);

  const governanceLink = useMemo(() => {
    return botSideBarItems.find((ele) => ele.name === 'governance')!.href;
  }, []);

  const [unarchivePosition, archivedPosition] = useMemo(() => {
    let archivedPosition: (VaultType & { index: number })[] = [];
    const unarchivePosition: (VaultType & { index: number })[] = [];

    vaults.forEach((vault, index) => {
      if (vault?.hakkaAmount.eq(0)) {
        archivedPosition.push({ ...vault, index: index });
      } else {
        unarchivePosition.push({ ...vault, index: index });
      }
    });

    archivedPosition = archivedPosition.reverse();
    return [unarchivePosition, archivedPosition];
  }, [vaults]);

  const sortedUnarchivePosition = useMemo(() => {
    if (isSortByUnlockTime) {
      unarchivePosition.sort(createBigNumberSort('asc', 'unlockTime'));
      return unarchivePosition;
    }
    unarchivePosition.sort(createBigNumberSort('desc', 'index'));
    return unarchivePosition;
  }, [isSortByUnlockTime, unarchivePosition]);

  const handleSortBtnClick = useCallback(
    () => setIsSortByUnlockTime(!isSortByUnlockTime),
    [isSortByUnlockTime],
  );

  return (
    <div sx={styles.container}>
      <div sx={styles.stakingPageWrapper}>
        <div sx={styles.heading}>
          <h1>Staking</h1>
          {isMobile && (
            <div
              sx={styles.btnBack}
              onClick={() => navigate({ to: '/staking' })}
            >
              <img src={images.iconBack} alt='' aria-hidden='true' />
              <span>Back to V2</span>
            </div>
          )}
          <Web3Status unsupported={!isCorrectNetwork} />
        </div>
        <div sx={styles.body}>
          {!isMobile && (
            <div
              sx={styles.btnBack}
              onClick={() => navigate({ to: '/staking' })}
            >
              <img src={images.iconBack} alt='' aria-hidden='true' />
              <span>Back to V2</span>
            </div>
          )}
          <div sx={styles.votingPowerWrapper}>
            <VotingPowerContainer stakingVersion={StakingVersion.V1} />
            {!isMobile && (
              <div>
                <a
                  data-tip
                  data-for='governance'
                  className='ml-auto'
                  href={governanceLink}
                  rel='noreferrer noopener'
                  target='_blank'
                  sx={styles.governanceButton}
                >
                  <img src={images.iconToGovernance} alt='Go to governance' />
                </a>
                <ReactTooltip
                  place='bottom'
                  id='governance'
                  float={true}
                  style={{
                    backgroundColor: '#253E47',
                  }}
                >
                  <span>Go to governance</span>
                </ReactTooltip>
              </div>
            )}
          </div>
          {/* infoPart */}
          <div sx={styles.infoArea}>
            <div sx={styles.titleWrapper}>
              <h4>Staking status</h4>
              <span>Only position redemption available on V1</span>
            </div>
            <div sx={styles.stakingInfoContainer}>
              <StakingInfoItem
                title='Wallet sHAKKA (V1) balance'
                content={formatCommonNumber(sHakkaBalance)}
              />
              <StakingInfoItem
                title='Staked HAKKA amount'
                content={formatCommonNumber(stakingBalance)}
              />
            </div>
          </div>
        </div>
        <div sx={styles.positionContainer}>
          <div sx={styles.positionHeader}>
            <h2 sx={styles.positionTitle}>Stake position</h2>
            <button
              type='button'
              sx={
                isSortByUnlockTime
                  ? { ...styles.sortBtn, ...styles.activeSortBtn }
                  : { ...styles.sortBtn, ...styles.inactiveSortBtn }
              }
              onClick={handleSortBtnClick}
            >
              <img
                sx={!isSortByUnlockTime ? styles.inactiveSVG : {}}
                src={images.iconSort}
                alt=''
                aria-hidden='true'
              />
              <span>Sort by expiry date</span>
            </button>
          </div>
          {sortedUnarchivePosition.map((vault, _index) => {
            return (
              <StakePositionItem
                key={vault.index}
                sHakkaBalance={sHakkaBalance ?? '0'}
                index={vault.index}
                stakedHakka={vault.hakkaAmount}
                sHakkaReceived={vault.wAmount}
                until={vault.unlockTime}
              />
            );
          })}
          <div sx={{ display: 'inline-block' }}>
            <div
              onClick={() => setIsShowArchived(!isShowArchived)}
              sx={styles.archivedTitle}
            >
              <p>Archived</p>
              <img
                src={isShowArchived ? images.iconUp : images.iconDown}
                alt=''
                aria-hidden='true'
              />
            </div>
          </div>
          {isShowArchived &&
            archivedPosition.map((vault, _index) => {
              return (
                <StakePositionItem
                  key={vault.index}
                  sHakkaBalance={sHakkaBalance ?? '0'}
                  index={vault.index}
                  stakedHakka={vault.hakkaAmount}
                  sHakkaReceived={vault.wAmount}
                  until={vault.unlockTime}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Staking;
