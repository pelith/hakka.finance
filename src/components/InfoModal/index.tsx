 /** @jsxImportSource theme-ui */

import { ArrowRightCircle } from 'react-feather';
import { useStakingDataV2, useStakingDataV1 } from '../../data/StakingData';
import ERC20_ABI from '../../constants/abis/erc20';
import { ChainId, HAKKA, VESTING_ADDRESSES } from '../../constants';
import {
  useInfoModalOpen,
  useInfoModalToggle,
} from '../../state/application/hooks';
import useTokenPrice from '../../hooks/useTokenPrice';
import images from '../../images';
import Modal from '../Modal';
import styles from './styles';
import AddHakkaToMetamaskBtn from '../AddToMetamaskBtn';
import { useNavigate } from '@tanstack/react-router';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import BigNumber from 'bignumber.js';
import { formatCommonNumber } from 'src/utils/formatCommonNumbers';

export default function InfoModal() {
  const {address, chainId, isConnected} = useAccount()
  const hakkaPrice = useTokenPrice('hakka-finance');
  const isHakkaExist = !!HAKKA[chainId as ChainId];

  const {data: hakkaBalance} = useReadContract({
    address: HAKKA[chainId as ChainId]?.address as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: Boolean(isConnected && address) && isHakkaExist,
      select(data) {
        return new BigNumber(formatUnits(data, 18));
      }
    }
  });

  const {data: vestingBalance} = useReadContract({
    address: VESTING_ADDRESSES[chainId as ChainId] as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: Boolean(isConnected && address) && isHakkaExist,
      select(data) {
        return new BigNumber(formatUnits(data, 18));
      }
    }
  });

  const { data: v2StakingBalance } = useStakingDataV2();
  const { data: v1StakingBalance } = useStakingDataV1();

  const infoModalOpen = useInfoModalOpen();
  const toggleInfoModal = useInfoModalToggle();

  const navigate = useNavigate()

  function getModalContent() {
    return (
      <div sx={styles.upperSection}>
        <div sx={styles.illustration} />
        <div sx={styles.closeIcon} onClick={toggleInfoModal}>
          <img src={images.iconDeleteRound} alt='delete' />
        </div>
        <div>
          <div sx={styles.title}>Your HAKKA breakdown</div>
        </div>
        <img sx={styles.sakura} src={images.sakura} alt='sakura' />
        <div sx={styles.contentWrapper}>
          <div sx={styles.balance}>
            <img sx={styles.hakkaIcon} src={images.hakkaAccount} alt='hakka account' />
            <div sx={styles.hakkaValue}>
              {hakkaBalance?.toFixed(2) || '-'}
            </div>
            <AddHakkaToMetamaskBtn address={HAKKA[chainId as ChainId]?.address as string} selectedChainId={chainId as ChainId} />
          </div>
          <div sx={styles.displayBetween}>
            <div sx={styles.label}>Price</div>
            <div sx={styles.data}>{hakkaPrice} USD</div>
          </div>
        </div>
        <div sx={styles.divider} />
        <div sx={styles.contentWrapper}>
          <div sx={styles.displayBetween}>
            <div>
              <div sx={styles.label}>Staking balance (v2)</div>
              <div sx={styles.data}>
                {formatCommonNumber(v2StakingBalance?.stakingBalance) || '-'} HAKKA
              </div>
            </div>
            <button
            type='button'
              onClick={() => {
                navigate({ to: '/staking' });
              }}
              sx={styles.pageBtn}
            >
              Staking V2
              <ArrowRightCircle sx={styles.pageBtn.icon} size='20' />
            </button>
          </div>
          <div sx={styles.displayBetween}>
            <div>
              <div sx={styles.label}>Staking balance (V1)</div>
              <div sx={styles.data}>
                {formatCommonNumber(v1StakingBalance?.stakingBalance) || '-'} HAKKA
              </div>
            </div>
            <button
              type='button'
              onClick={() => {
                navigate({ to: '/staking-v1' });
              }}
              sx={styles.pageBtn}
            >
              Staking V1
              <ArrowRightCircle sx={styles.pageBtn.icon} size='20' />
            </button>
          </div>

          <div sx={styles.displayBetween}>
            <div>
              <div sx={styles.label}>Vesting balance</div>
              <div sx={styles.data}>
                {vestingBalance?.toFixed(2) || '-'} HAKKA
              </div>
            </div>
            <button
              type='button'
              onClick={() => {
                navigate({ to: '/vesting' });
              }}
              sx={styles.pageBtn}
            >
              Vesting
              <ArrowRightCircle sx={styles.pageBtn.icon} size='20' />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={infoModalOpen} onDismiss={toggleInfoModal}>
      <div sx={styles.wrapper}>{getModalContent()}</div>
    </Modal>
  );
}
